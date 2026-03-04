import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, Loader2, Upload, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRegistrations, Registration } from '@/hooks/useRegistrations';
import { useInstallments, useUploadInstallmentProof, InstallmentPayment } from '@/hooks/useInstallments';
import { useEvents } from '@/hooks/useEvents';
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

const InstallmentRow = ({ inst, registrationId }: { inst: InstallmentPayment; registrationId: string }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadProof = useUploadInstallmentProof();
  const statusInfo = installmentStatusMap[inst.payment_status] || installmentStatusMap.pending;
  const StatusIcon = statusInfo.icon;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo deve ter no máximo 10MB'); return; }
    uploadProof.mutate({ installmentId: inst.id, registrationId, file });
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <StatusIcon className={`h-4 w-4 shrink-0 ${statusInfo.className}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium">Parcela {inst.installment_number}</p>
          <p className="text-xs text-muted-foreground">
            R$ {Number(inst.amount).toFixed(2)}
            {inst.due_date && ` · Vence ${format(new Date(inst.due_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {inst.payment_status !== 'paid' && (
          <>
            {inst.proof_url ? (
              <a href={inst.proof_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                Ver comprovante
              </a>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                disabled={uploadProof.isPending}
                onClick={() => fileRef.current?.click()}
              >
                {uploadProof.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                Enviar
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
          </>
        )}
        {inst.payment_status === 'paid' && inst.payment_date && (
          <span className="text-xs text-muted-foreground">
            Pago em {format(new Date(inst.payment_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        )}
      </div>
    </div>
  );
};

const RegistrationCard = ({ reg, eventTitle }: { reg: Registration; eventTitle: string }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: installments } = useInstallments(
    (reg.payment_mode === 'installments' && (reg.installments_total || 0) > 1) ? reg.id : undefined
  );
  const statusInfo = regStatusMap[reg.payment_status] || regStatusMap.pending;
  const hasInstallments = (reg.installments_total || 0) > 1 && reg.payment_mode === 'installments';

  return (
    <Card className="glass-card animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{eventTitle || reg.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Inscrito em {format(new Date(reg.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
          <div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between text-xs font-medium text-primary hover:underline"
            >
              Ver parcelas ({installments.filter(i => i.payment_status === 'paid').length}/{installments.length} pagas)
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {expanded && (
              <div className="mt-2">
                {installments.map((inst) => (
                  <InstallmentRow key={inst.id} inst={inst} registrationId={reg.id} />
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

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const userRegistrations = (registrations || []).filter((r) => r.user_id === user?.id);
  const eventMap = Object.fromEntries((events || []).map((e) => [e.id, e.title]));

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
        <div className="mb-6 flex items-center justify-between">
          <Link to="/eventos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <Link to="/perfil">
            <Button variant="outline" size="sm">Meu perfil</Button>
          </Link>
        </div>

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
            {userRegistrations.map((reg) => (
              <RegistrationCard
                key={reg.id}
                reg={reg}
                eventTitle={eventMap[reg.event_id] || reg.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhasInscricoes;
