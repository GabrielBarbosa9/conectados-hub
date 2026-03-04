import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile, validateCPF, formatCPF, formatPhone } from '@/hooks/useProfile';
import AvatarUpload from '@/components/AvatarUpload';
import { toast } from 'sonner';

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

const Perfil = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    cpf: '',
    birth_date: '',
    phone: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
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
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cpfClean = form.cpf.replace(/\D/g, '');
    if (cpfClean && !validateCPF(cpfClean)) {
      toast.error('CPF inválido. Verifique os dígitos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        data: {
          ...form,
          cpf: cpfClean || undefined,
          phone: form.phone.replace(/\D/g, '') || undefined,
        },
      });
    } catch {
      // error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/eventos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sair
          </Button>
        </div>

        <Card className="glass-card animate-fade-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Meu Perfil</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center pt-2">
              <AvatarUpload userId={user.id} currentUrl={profile?.avatar_url} size="lg" />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {user.email}
            </div>

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dados pessoais</p>

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    inputMode="numeric"
                    maxLength={14}
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Celular</Label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  maxLength={15}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <Separator />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Endereço</p>

              <div className="space-y-2">
                <Label htmlFor="address_street">Logradouro</Label>
                <Input
                  id="address_street"
                  value={form.address_street}
                  onChange={(e) => setForm({ ...form, address_street: e.target.value })}
                  placeholder="Rua, Avenida..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    value={form.address_number}
                    onChange={(e) => setForm({ ...form, address_number: e.target.value })}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_complement">Complemento</Label>
                  <Input
                    id="address_complement"
                    value={form.address_complement}
                    onChange={(e) => setForm({ ...form, address_complement: e.target.value })}
                    placeholder="Apto, Bloco..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input
                  id="address_neighborhood"
                  value={form.address_neighborhood}
                  onChange={(e) => setForm({ ...form, address_neighborhood: e.target.value })}
                  placeholder="Nome do bairro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    value={form.address_city}
                    onChange={(e) => setForm({ ...form, address_city: e.target.value })}
                    placeholder="Sua cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">Estado</Label>
                  <Select
                    value={form.address_state}
                    onValueChange={(v) => setForm({ ...form, address_state: v })}
                  >
                    <SelectTrigger id="address_state">
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

              <Button type="submit" className="w-full" disabled={isSubmitting || updateProfile.isPending}>
                {isSubmitting || updateProfile.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Salvar alterações</>
                )}
              </Button>
            </form>

            <div className="pt-2">
              <Separator className="mb-4" />
              <Link to="/minhas-inscricoes">
                <Button variant="outline" className="w-full">
                  Ver minhas inscrições
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Perfil;
