import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Trash2, CheckCircle } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations, useDeleteRegistration, useConfirmPayment } from '@/hooks/useRegistrations';
import { format } from 'date-fns';

const Inscricoes = () => {
  const { data: events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const { data: registrations, isLoading } = useRegistrations(selectedEventId === 'all' ? undefined : selectedEventId);
  const deleteRegistration = useDeleteRegistration();
  const confirmPayment = useConfirmPayment();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta inscrição?')) {
      await deleteRegistration.mutateAsync(id);
    }
  };

  const handleConfirmPayment = async (id: string) => {
    await confirmPayment.mutateAsync({ registrationId: id, status: 'confirmed' });
  };

  const paymentBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="rounded-full px-2 py-1 text-xs bg-green-500/20 text-green-500">Confirmado</span>;
      case 'pending':
        return <span className="rounded-full px-2 py-1 text-xs bg-yellow-500/20 text-yellow-600">Pendente</span>;
      default:
        return <span className="rounded-full px-2 py-1 text-xs bg-muted text-muted-foreground">Gratuito</span>;
    }
  };

  const exportToExcel = () => {
    if (!registrations?.length) return;

    const headers = ['Nome', 'WhatsApp', 'E-mail', 'Idade', 'Pagamento', 'Data de Inscrição', 'Check-in'];
    const rows = registrations.map(r => [
      r.name,
      r.whatsapp,
      r.email || '',
      r.age?.toString() || '',
      r.payment_status === 'confirmed' ? 'Confirmado' : r.payment_status === 'pending' ? 'Pendente' : 'Gratuito',
      format(new Date(r.created_at), 'dd/MM/yyyy HH:mm'),
      r.checked_in ? 'Sim' : 'Não',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscricoes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <AdminLayout title="Inscrições">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecione um evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os eventos</SelectItem>
            {events?.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2" onClick={exportToExcel} disabled={!registrations?.length}>
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Inscritos ({registrations?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : registrations?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma inscrição encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations?.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.name}</TableCell>
                      <TableCell>{reg.whatsapp}</TableCell>
                      <TableCell>{reg.email || '-'}</TableCell>
                      <TableCell>{reg.age || '-'}</TableCell>
                      <TableCell>{paymentBadge(reg.payment_status)}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-1 text-xs ${reg.checked_in ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                          {reg.checked_in ? 'Presente' : 'Pendente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {reg.payment_status === 'pending' && (
                            <Button size="icon" variant="ghost" onClick={() => handleConfirmPayment(reg.id)} title="Confirmar pagamento">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(reg.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Inscricoes;
