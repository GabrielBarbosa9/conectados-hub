import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile, validateCPF, formatCPF, formatPhone } from '@/hooks/useProfile';
import { toast } from 'sonner';
import logoConectados from '@/assets/logo-conectados.png';
import AvatarUpload from '@/components/AvatarUpload';

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

const Cadastro = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user, loading } = useAuth();
  const updateProfile = useUpdateProfile();

  const [step, setStep] = useState<'account' | 'profile'>('account');
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [account, setAccount] = useState({ email: '', password: '', confirm: '' });
  const [profile, setProfile] = useState({
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
    if (!loading && user && step === 'account') {
      navigate('/eventos', { replace: true });
    }
  }, [user, loading, navigate, step]);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (account.password !== account.confirm) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (account.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error, user: newUser } = await signUp(account.email, account.password);
      if (error) {
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          toast.error('Este e-mail já está cadastrado. Faça login.');
        } else {
          toast.error(error.message || 'Erro ao criar conta.');
        }
        return;
      }
      if (newUser) {
        setNewUserId(newUser.id);
        setStep('profile');
        return;
      }
      const { error: signInError, user: signedInUser } = await signIn(account.email, account.password);
      if (signInError || !signedInUser) {
        toast.error('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
        navigate('/login');
        return;
      }
      setNewUserId(signedInUser.id);
      setStep('profile');
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cpfClean = profile.cpf.replace(/\D/g, '');
    if (!validateCPF(cpfClean)) {
      toast.error('CPF inválido. Verifique os dígitos.');
      return;
    }
    const userId = newUserId || user?.id;
    if (!userId) {
      toast.error('Sessão expirada. Faça login novamente.');
      navigate('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        userId,
        data: {
          ...profile,
          cpf: cpfClean,
          phone: profile.phone.replace(/\D/g, ''),
          email: account.email || user?.email,
        },
      });
      toast.success('Cadastro concluído! Bem-vindo(a)!');
      navigate('/eventos');
    } catch {
      // error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o início
        </Link>

        <Card className="glass-card animate-scale-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logoConectados} alt="Conectados" className="h-14" />
            </div>
            <CardTitle className="text-2xl">
              {step === 'account' ? 'Criar conta' : 'Dados pessoais'}
            </CardTitle>
            <CardDescription>
              {step === 'account'
                ? 'Informe seu e-mail e crie uma senha'
                : 'Complete seu cadastro com seus dados pessoais'}
            </CardDescription>
            <div className="flex justify-center gap-2 mt-3">
              <div className={`h-2 w-16 rounded-full ${step === 'account' ? 'bg-primary' : 'bg-primary'}`} />
              <div className={`h-2 w-16 rounded-full ${step === 'profile' ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </CardHeader>

          <CardContent>
            {step === 'account' ? (
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={account.email}
                    onChange={(e) => setAccount({ ...account, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={account.password}
                      onChange={(e) => setAccount({ ...account, password: e.target.value })}
                      className="pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={account.confirm}
                      onChange={(e) => setAccount({ ...account, confirm: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando conta...</>
                  ) : (
                    'Continuar'
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Faça login
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {newUserId && (
                  <div className="flex justify-center">
                    <AvatarUpload userId={newUserId} size="lg" />
                  </div>
                )}

                <Separator />

                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Dados pessoais</p>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    required
                    autoComplete="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      required
                      inputMode="numeric"
                      maxLength={14}
                      value={profile.cpf}
                      onChange={(e) => setProfile({ ...profile, cpf: formatCPF(e.target.value) })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de nascimento *</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      required
                      value={profile.birth_date}
                      onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Celular *</Label>
                  <Input
                    id="phone"
                    required
                    inputMode="numeric"
                    maxLength={15}
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: formatPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <Separator />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Endereço</p>

                <div className="space-y-2">
                  <Label htmlFor="address_street">Logradouro *</Label>
                  <Input
                    id="address_street"
                    required
                    autoComplete="street-address"
                    value={profile.address_street}
                    onChange={(e) => setProfile({ ...profile, address_street: e.target.value })}
                    placeholder="Rua, Avenida, Travessa..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_number">Número *</Label>
                    <Input
                      id="address_number"
                      required
                      value={profile.address_number}
                      onChange={(e) => setProfile({ ...profile, address_number: e.target.value })}
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_complement">Complemento</Label>
                    <Input
                      id="address_complement"
                      value={profile.address_complement}
                      onChange={(e) => setProfile({ ...profile, address_complement: e.target.value })}
                      placeholder="Apto, Bloco..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_neighborhood">Bairro *</Label>
                  <Input
                    id="address_neighborhood"
                    required
                    value={profile.address_neighborhood}
                    onChange={(e) => setProfile({ ...profile, address_neighborhood: e.target.value })}
                    placeholder="Nome do bairro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_city">Cidade *</Label>
                    <Input
                      id="address_city"
                      required
                      autoComplete="address-level2"
                      value={profile.address_city}
                      onChange={(e) => setProfile({ ...profile, address_city: e.target.value })}
                      placeholder="Sua cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_state">Estado *</Label>
                    <Select
                      value={profile.address_state}
                      onValueChange={(v) => setProfile({ ...profile, address_state: v })}
                      required
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

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('account')}
                    disabled={isSubmitting}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting || updateProfile.isPending}>
                    {isSubmitting || updateProfile.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                    ) : (
                      'Concluir cadastro'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cadastro;
