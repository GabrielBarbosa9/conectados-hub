import React, { useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Trash2, CheckCircle, ChevronDown, ChevronUp, ExternalLink, XCircle, Search, Users, Clock, CircleDollarSign, UserCheck } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations, useDeleteRegistration, useConfirmPayment } from '@/hooks/useRegistrations';
import { useInstallments, useConfirmInstallment } from '@/hooks/useInstallments';
import { format } from 'date-fns';

const InstallmentsPanel = ({ registrationId }: { registrationId: string }) => {
  const { data: installments, isLoading } = useInstallments(registrationId);
  const confirmInstallment = useConfirmInstallment();

  if (isLoading) return <div className="py-2 text-xs text-muted-foreground">Carregando parcelas...</div>;
  if (!installments?.length) return <div className="py-2 text-xs text-muted-foreground">Nenhuma parcela encontrada.</div>;

  const statusStyle: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-600',
    paid: 'bg-green-500/20 text-green-600',
    overdue: 'bg-destructive/20 text-destructive',
  };
  const statusLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago', overdue: 'Vencida' };

  return (
    <div className="mt-2 space-y-1">
      {installments.map((inst) => (
        <div key={inst.id} className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <span className="w-20 shrink-0 font-medium">Parcela {inst.installment_number}</span>
          <span className="w-24 shrink-0">R$ {Number(inst.amount).toFixed(2)}</span>
          <span className="w-24 shrink-0 text-xs text-muted-foreground">
            {inst.due_date ? format(new Date(inst.due_date + 'T00:00:00'), 'dd/MM/yyyy') : '-'}
          </span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusStyle[inst.payment_status] || statusStyle.pending}`}>
            {statusLabel[inst.payment_status] || 'Pendente'}
          </span>
          {inst.proof_url && (
            <a href={inst.proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="h-3 w-3" />Comprovante
            </a>
          )}
          <div className="ml-auto flex gap-1">
            {inst.payment_status !== 'paid' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Confirmar pago"
                disabled={confirmInstallment.isPending}
                onClick={() => confirmInstallment.mutate({ installmentId: inst.id, registrationId, status: 'paid' })}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
            )}
            {inst.payment_status === 'pending' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Marcar vencida"
                disabled={confirmInstallment.isPending}
                onClick={() => confirmInstallment.mutate({ installmentId: inst.id, registrationId, status: 'overdue' })}
              >
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const Inscricoes = () => {
  const { data: events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [checkinFilter, setCheckinFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: registrations, isLoading } = useRegistrations(selectedEventId === 'all' ? undefined : selectedEventId);
  const deleteRegistration = useDeleteRegistration();
  const confirmPayment = useConfirmPayment();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    return registrations.filter((r) => {
      if (paymentFilter !== 'all' && r.payment_status !== paymentFilter) return false;
      if (checkinFilter === 'yes' && !r.checked_in) return false;
      if (checkinFilter === 'no' && r.checked_in) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.whatsapp.includes(q) && !(r.email || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [registrations, paymentFilter, checkinFilter, searchQuery]);

  const stats = useMemo(() => {
    const all = registrations || [];
    return {
      total: all.length,
      pending: all.filter((r) => r.payment_status === 'pending').length,
      confirmed: all.filter((r) => r.payment_status === 'confirmed' || r.payment_status === 'free').length,
      checkedIn: all.filter((r) => r.checked_in).length,
    };
  }, [registrations]);

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

    const headers = ['Nome', 'WhatsApp', 'E-mail', 'Idade', 'Tipo Pagamento', 'Parcelas', 'Status Pagamento', 'Data de Inscrição', 'Check-in'];
    const rows = registrations.map(r => [
      r.name,
      r.whatsapp,
      r.email || '',
      r.age?.toString() || '',
      r.payment_type || 'free',
      r.installments_total?.toString() || '1',
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
      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-primary/10 p-2"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2"><Clock className="h-5 w-5 text-yellow-500" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-green-500/10 p-2"><CircleDollarSign className="h-5 w-5 text-green-500" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2"><UserCheck className="h-5 w-5 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.checkedIn}</p>
              <p className="text-xs text-muted-foreground">Check-in</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por evento" />
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

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="free">Gratuito</SelectItem>
          </SelectContent>
        </Select>

        <Select value={checkinFilter} onValueChange={setCheckinFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Check-in" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="yes">Presente</SelectItem>
            <SelectItem value="no">Ausente</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, WhatsApp ou e-mail..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button variant="outline" className="gap-2" onClick={exportToExcel} disabled={!registrations?.length}>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Inscritos ({filteredRegistrations.length}{filteredRegistrations.length !== (registrations?.length || 0) ? ` de ${registrations?.length || 0}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma inscrição encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Parcelas</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <React.Fragment key={reg.id}>
                      <TableRow>
                        <TableCell className="font-medium">{reg.name}</TableCell>
                        <TableCell>{reg.whatsapp}</TableCell>
                        <TableCell>{paymentBadge(reg.payment_status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(reg.installments_total || 0) > 1
                            ? `${reg.installments_total}x ${reg.payment_type === 'pix' ? 'PIX' : 'Cartão'}`
                            : reg.payment_type === 'credit_card' ? 'Cartão' : reg.payment_type === 'pix' ? 'PIX' : '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2 py-1 text-xs ${reg.checked_in ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                            {reg.checked_in ? 'Presente' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {(reg.installments_total || 0) > 1 ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Ver parcelas"
                                onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                              >
                                {expandedId === reg.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            ) : reg.payment_status === 'pending' ? (
                              <Button size="icon" variant="ghost" onClick={() => handleConfirmPayment(reg.id)} title="Confirmar pagamento">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            ) : null}
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(reg.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedId === reg.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30 px-6 pb-3 pt-0">
                            <InstallmentsPanel registrationId={reg.id} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
