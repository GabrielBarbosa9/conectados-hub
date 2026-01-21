import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useDonations, useCreateDonation, useDeleteDonation, useDonationStats } from '@/hooks/useDonations';
import { format } from 'date-fns';

const Doacoes = () => {
  const { data: donations, isLoading } = useDonations();
  const { data: stats } = useDonationStats();
  const createDonation = useCreateDonation();
  const deleteDonation = useDeleteDonation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    donor_name: '',
    notes: '',
    donation_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createDonation.mutateAsync({
      amount: parseFloat(formData.amount),
      donor_name: formData.donor_name || undefined,
      notes: formData.notes || undefined,
      donation_date: formData.donation_date,
    });
    
    setIsOpen(false);
    setFormData({
      amount: '',
      donor_name: '',
      notes: '',
      donation_date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta doação?')) {
      await deleteDonation.mutateAsync(id);
    }
  };

  return (
    <AdminLayout title="Doações">
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {(stats?.total || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {(stats?.monthlyTotal || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Doação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Doação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="donor_name">Nome do Doador</Label>
                <Input
                  id="donor_name"
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="donation_date">Data</Label>
                <Input
                  id="donation_date"
                  type="date"
                  value={formData.donation_date}
                  onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              
              <Button type="submit" className="w-full">Registrar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Doações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : donations?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma doação registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Doador</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations?.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{format(new Date(donation.donation_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{donation.donor_name || '-'}</TableCell>
                      <TableCell className="font-medium">R$ {Number(donation.amount).toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">{donation.notes || '-'}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(donation.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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

export default Doacoes;
