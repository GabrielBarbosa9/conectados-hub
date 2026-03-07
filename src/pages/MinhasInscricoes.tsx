import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, Loader2, Upload, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, MapPin, Users, DollarSign, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRegistrations, Registration } from '@/hooks/useRegistrations';
import { useInstallments, useUploadInstallmentProof, InstallmentPayment } from '@/hooks/useInstallments';
import { useEvents } from '@/hooks/useEvents';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const regStatusMap: Record<string, { label: string; className: string }> = {
  free: { label: 'Gratuito', className: 'bg-secondary text-secondary-foreground' },
  pending: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
  confirmed: { label: 'Confirmado', className: 'bg-green-500/20 text-green-600 dark:text-green-400' },
};

const installmentStatusMap: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: 'Pendente', icon: Clock, className: 'text-yellow-600 dark:text-yellow-400' },
  paid: { label: 'Pago', icon: CheckCircle, className: 'text-green-600 dark:text-green-400' },
  overdue: { label: 'Vencida', icon: AlertCircle, className: 'text-destructive' },
};

const InstallmentRow = ({ inst, registrationId, pixKey }: { inst: InstallmentPayment; registrationId: string; pixKey: string }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadProof = useUploadInstallmentProof();
  const [customAmount, setCustomAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const statusInfo = installmentStatusMap[inst.payment_status] || installmentStatusMap.pending;
  const StatusIcon = statusInfo.icon;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo deve ter no máximo 10MB'); return; }
    const amountParsed = customAmount ? parseFloat(customAmount.replace(',', '.')) : undefined;
    const amount = amountParsed != null && !Number.isNaN(amountParsed) && amountParsed >= 0 ? amountParsed : undefined;
    uploadProof.mutate({ installmentId: inst.id, registrationId, file, amount });
    e.target.value = '';
  };

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast.success('Chave PIX copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`rounded-full p-2 ${inst.payment_status === 'paid' ? 'bg-green-500/10' : inst.payment_status === 'overdue' ? 'bg-destructive/10' : 'bg-yellow-500/10'}`}>
            <StatusIcon className={`h-4 w-4 shrink-0 ${statusInfo.className}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Parcela {inst.installment_number}</p>
            <p className="text-xs text-muted-foreground">
              R$ {Number(inst.amount).toFixed(2).replace('.', ',')}
              {inst.due_date && ` · Vence ${format(new Date(inst.due_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {inst.payment_status !== 'paid' && (
            <>
              {pixKey && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  onClick={handleCopyPix}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copiada!' : 'Copiar PIX'}</span>
                </Button>
              )}
              {inst.proof_url ? (
                <a href={inst.proof_url} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost" className="h-8 text-xs">
                    Ver comprovante
                  </Button>
                </a>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 gap-1.5"
                  disabled={uploadProof.isPending}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploadProof.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
            </>
          )}
          {inst.payment_status === 'paid' && inst.payment_date && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {format(new Date(inst.payment_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          )}
        </div>
      </div>
      {inst.payment_status !== 'paid' && !inst.proof_url && (
        <div className="flex items-center gap-2 pl-11">
          <label htmlFor={`amount-${inst.id}`} className="text-xs text-muted-foreground whitespace-nowrap">
            Valor pago (R$):
          </label>
          <input
            id={`amount-${inst.id}`}
            type="text"
            inputMode="decimal"
            placeholder={Number(inst.amount).toFixed(2).replace('.', ',')}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
          <span className="text-xs text-muted-foreground">opcional</span>
        </div>
      )}
    </div>
  );
};
const RegistrationCard = ({ reg, eventTitle, event, pixKey }: { reg: Registration; eventTitle: string; event: any; pixKey: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const { data: installments } = useInstallments(
    (reg.payment_mode === 'installments' && (reg.installments_total || 0) > 1) ? reg.id : undefined
  );
  const statusInfo = regStatusMap[reg.payment_status] || regStatusMap.pending;
  const hasInstallments = (reg.installments_total || 0) > 1 && reg.payment_mode === 'installments';

  const totalPaid = installments?.filter(i => i.payment_status === 'paid').length || 0;
  const totalInstallments = installments?.length || 0;
  const progressPercent = totalInstallments > 0 ? (totalPaid / totalInstallments) * 100 : 0;

  return (
    <Card className="glass-card animate-fade-in overflow-hidden border-l-4" style={{ borderLeftColor: statusInfo.className.includes('green') ? 'rgb(34 197 94)' : statusInfo.className.includes('yellow') ? 'rgb(234 179 8)' : 'rgb(148 163 184)' }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{eventTitle || reg.name}</CardTitle>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Inscrito em {format(new Date(reg.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEventDetails(!showEventDetails)}
            className="shrink-0"
          >
            {showEventDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {showEventDetails && event && (
        <div className="px-6 pb-3 space-y-2 border-t border-border/50 pt-3 bg-muted/20">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {event.event_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.event_date), "dd 'de' MMMM", { locale: ptBR })}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {event.price && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>R$ {Number(event.price).toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            {event.max_capacity && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event.max_capacity} vagas</span>
              </div>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground pt-2 border-t border-border/50">
              {event.description}
            </p>
          )}
        </div>
      )}

      <CardContent className="space-y-4 pt-3">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {reg.payment_type === 'pix' && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />PIX</span>}
          {reg.payment_type === 'credit_card' && (
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Cartão
              {reg.credit_card_payment_date && ` · ${format(new Date(reg.credit_card_payment_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}`}
            </span>
          )}
          {hasInstallments && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {reg.installments_total}x parcelas
            </span>
          )}
        </div>

        {reg.payment_status === 'pending' && reg.payment_proof_url && !hasInstallments && (
          <p className="text-xs text-amber-600 dark:text-amber-400">Comprovante enviado · aguardando confirmação</p>
        )}

        {hasInstallments && installments && installments.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progresso do pagamento</span>
                <span className="text-muted-foreground">{totalPaid}/{totalInstallments} pagas</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-medium"
            >
              <span>{expanded ? 'Ocultar' : 'Ver'} parcelas</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expanded && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                {installments.map((inst) => (
                  <InstallmentRow key={inst.id} inst={inst} registrationId={reg.id} pixKey={pixKey} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MinhasInscricoes = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: registrations, isLoading } = useRegistrations();
  const { data: events } = useEvents(false);
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const userRegistrations = (registrations || []).filter((r) => r.user_id === user?.id);
  const eventMap = Object.fromEntries((events || []).map((e) => [e.id, e]));
  const globalPixKey = settings?.pix_key || '';

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-2 text-3xl font-bold">Minhas inscrições</h1>
        <p className="mb-8 text-muted-foreground">Acompanhe suas inscrições e envie comprovantes de pagamento</p>

        {userRegistrations.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Nenhuma inscrição encontrada</p>
              <p className="mt-1 text-sm text-muted-foreground">Você ainda não se inscreveu em nenhum evento.</p>
              <Link to="/eventos" className="mt-4">
                <Button>Ver eventos disponíveis</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userRegistrations.map((reg) => {
              const event = eventMap[reg.event_id];
              const pixKey = event?.pix_key || globalPixKey;
              return (
                <RegistrationCard
                  key={reg.id}
                  reg={reg}
                  eventTitle={event?.title || reg.name}
                  event={event}
                  pixKey={pixKey}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhasInscricoes;
