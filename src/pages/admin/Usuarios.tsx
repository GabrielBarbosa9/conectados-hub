import React, { useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Pencil, Trash2, Loader2, Save } from 'lucide-react';
import {
  useAllProfiles,
  useUpdateProfileByAdmin,
  useDeleteProfile,
  type Profile,
  type UpdateProfileData,
  validateCPF,
  formatCPF,
  formatPhone,
} from '@/hooks/useProfile';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const emptyForm = {
  name: '',
  email: '',
  cpf: '',
  birth_date: '',
  phone: '',
  address_street: '',
  address_number: '',
  address_complement: '',
  address_neighborhood: '',
  address_city: '',
  address_state: '',
};

const Usuarios = () => {
  const { data: profiles, isLoading } = useAllProfiles();
  const updateProfile = useUpdateProfileByAdmin();
  const deleteProfile = useDeleteProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    if (!searchQuery.trim()) return profiles;
    const q = searchQuery.toLowerCase().trim();
    return profiles.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.phone || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''))
    );
  }, [profiles, searchQuery]);

  const openEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setForm({
      name: profile.name || '',
      email: profile.email || '',
      cpf: profile.cpf ? formatCPF(profile.cpf) : '',
      birth_date: profile.birth_date || '',
      phone: profile.phone ? formatPhone(profile.phone) : '',
      address_street: profile.address_street || '',
      address_number: profile.address_number || '',
      address_complement: profile.address_complement || '',
      address_neighborhood: profile.address_neighborhood || '',
      address_city: profile.address_city || '',
      address_state: profile.address_state || '',
    });
    setEditOpen(true);
  };

  const openDelete = (profile: Profile) => {
    setProfileToDelete(profile);
    setDeleteOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    const cpfClean = form.cpf.replace(/\D/g, '');
    if (cpfClean && !validateCPF(cpfClean)) {
      toast.error('CPF inválido. Verifique os dígitos.');
      return;
    }
    try {
      await updateProfile.mutateAsync({
        userId: editingProfile.user_id,
        data: {
          name: form.name || undefined,
          email: form.email || undefined,
          cpf: cpfClean || undefined,
          birth_date: form.birth_date || undefined,
          phone: form.phone.replace(/\D/g, '') || undefined,
          address_street: form.address_street || undefined,
          address_number: form.address_number || undefined,
          address_complement: form.address_complement || undefined,
          address_neighborhood: form.address_neighborhood || undefined,
          address_city: form.address_city || undefined,
          address_state: form.address_state || undefined,
        },
      });
      setEditOpen(false);
      setEditingProfile(null);
    } catch {
      // error in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    await deleteProfile.mutateAsync(profileToDelete.user_id);
    setDeleteOpen(false);
    setProfileToDelete(null);
  };

  return (
    <AdminLayout title="Usuários">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Perfis na plataforma</CardTitle>
          <div className="relative mt-3 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum perfil encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((p) => (
                    <TableRow key={p.user_id}>
                      <TableCell className="font-medium">{p.name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{p.email || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{p.phone || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(p.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Editar"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Excluir perfil"
                            onClick={() => openDelete(p)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cpf">CPF</Label>
                  <Input
                    id="edit-cpf"
                    inputMode="numeric"
                    maxLength={14}
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-birth_date">Data de nascimento</Label>
                  <Input
                    id="edit-birth_date"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Celular</Label>
                <Input
                  id="edit-phone"
                  inputMode="numeric"
                  maxLength={15}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-street">Logradouro</Label>
                <Input
                  id="edit-street"
                  value={form.address_street}
                  onChange={(e) => setForm({ ...form, address_street: e.target.value })}
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-number">Número</Label>
                  <Input
                    id="edit-number"
                    value={form.address_number}
                    onChange={(e) => setForm({ ...form, address_number: e.target.value })}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-complement">Complemento</Label>
                  <Input
                    id="edit-complement"
                    value={form.address_complement}
                    onChange={(e) => setForm({ ...form, address_complement: e.target.value })}
                    placeholder="Apto, Bloco..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-neighborhood">Bairro</Label>
                <Input
                  id="edit-neighborhood"
                  value={form.address_neighborhood}
                  onChange={(e) => setForm({ ...form, address_neighborhood: e.target.value })}
                  placeholder="Bairro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Cidade</Label>
                  <Input
                    id="edit-city"
                    value={form.address_city}
                    onChange={(e) => setForm({ ...form, address_city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <Select
                    value={form.address_state}
                    onValueChange={(v) => setForm({ ...form, address_state: v })}
                  >
                    <SelectTrigger id="edit-state">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BR.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o perfil de {profileToDelete?.name || 'este usuário'}? O usuário não será removido do login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Usuarios;
