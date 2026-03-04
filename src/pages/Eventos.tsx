import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, LogIn, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents, useEventCustomFields, Event } from '@/hooks/useEvents';
import { useRegistrationCount, useCreateRegistration, useUserEventRegistration } from '@/hooks/useRegistrations';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { useCreateInstallments } from '@/hooks/useInstallments';
import PaymentSelector, { PaymentSelectionResult } from '@/components/PaymentSelector';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EventCard = ({ event, onRegister }: { event: Event; onRegister: (event: Event) => void }) => {
  const { data: count = 0 } = useRegistrationCount(event.id);
  const spotsLeft = event.max_capacity ? event.max_capacity - count : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const paymentLabel = () => {
    if (!event.payment_method || event.payment_method === 'free') return 'Gratuito';
    if (event.price) return `R$ ${Number(event.price).toFixed(2)}`;
    return '';
  };

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-xl">{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(event.event_date), "dd 'de' MMMM", { locale: ptBR })}
          </div>
          {event.event_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {event.event_time.slice(0, 5)}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          {event.max_capacity && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className={isFull ? 'text-destructive' : ''}>
                {isFull ? 'Vagas esgotadas' : `${spotsLeft} vagas restantes`}
              </span>
            </div>
          )}
          <span className="font-semibold text-primary">{paymentLabel()}</span>
        </div>
        
        <Button 
          className="w-full" 
          disabled={isFull}
          onClick={() => onRegister(event)}
        >
          {isFull ? 'Vagas Esgotadas' : 'Inscrever-se'}
        </Button>
      </CardContent>
    </Card>
  );
};

const Eventos = () => {
  const { data: events, isLoading } = useEvents(true);
  const { data: settings } = useSettings();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: customFields } = useEventCustomFields(selectedEvent?.id || '');
  const { data: existingRegistration } = useUserEventRegistration(selectedEvent?.id, user?.id);
  const createRegistration = useCreateRegistration();
  const createInstallments = useCreateInstallments();

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    age: '',
    customFields: {} as Record<string, string>,
  });
  const [paymentResult, setPaymentResult] = useState<PaymentSelectionResult | null>(null);
  const lastAutoFilledEventRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedEvent && profile && lastAutoFilledEventRef.current !== selectedEvent.id) {
      lastAutoFilledEventRef.current = selectedEvent.id;
      setFormData((prev) => ({
        ...prev,
        name: profile.name || '',
        whatsapp: profile.phone || '',
        email: profile.email || user?.email || '',
      }));
    }
    if (!selectedEvent) {
      lastAutoFilledEventRef.current = null;
    }
  }, [selectedEvent, profile, user]);

  const globalPixKey = settings?.pix_key;
  const eventPixKey = selectedEvent?.pix_key || globalPixKey || '';
  const isPaid = selectedEvent?.payment_method === 'pix' ||
    selectedEvent?.payment_method === 'pix_recorrente' ||
    (selectedEvent?.price && selectedEvent.price > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (isPaid && selectedEvent.accepts_credit_card && !paymentResult) {
      toast.error('Selecione a forma de pagamento.');
      return;
    }
    if (paymentResult?.paymentType === 'credit_card' && !paymentResult.creditCardPaymentDate) {
      toast.error('Informe a data prevista de pagamento.');
      return;
    }

    if (existingRegistration) {
      toast.error('Você já está inscrito neste evento.');
      return;
    }

    try {
      const isFree = !isPaid;
      const paymentStatus = isFree ? 'free' : 'pending';

      const registration = await createRegistration.mutateAsync({
        event_id: selectedEvent.id,
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        custom_fields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
        payment_status: paymentStatus,
        payment_proof_url: paymentResult?.proofUrl || undefined,
        payment_type: paymentResult?.paymentType,
        payment_mode: paymentResult?.paymentMode,
        installments_total: paymentResult?.installmentsTotal || 1,
        credit_card_payment_date: paymentResult?.creditCardPaymentDate,
        user_id: user?.id,
      });

      if (
        registration &&
        paymentResult?.paymentMode === 'installments' &&
        (paymentResult.installmentsTotal || 0) > 1 &&
        selectedEvent.price
      ) {
        try {
          await createInstallments.mutateAsync({
            registrationId: registration.id,
            total: paymentResult.installmentsTotal,
            amount: Number(selectedEvent.price),
          });
        } catch (installmentError) {
          console.error('Erro ao criar parcelas:', installmentError);
          toast.error('Inscrição realizada, mas houve erro ao criar parcelas. Entre em contato com o administrador.');
        }
      }

      const wasPaid = !isFree;
      setSelectedEvent(null);
      setFormData({ name: '', whatsapp: '', email: '', age: '', customFields: {} });
      setPaymentResult(null);

      if (wasPaid && user) {
        toast.success('Inscrição realizada! Redirecionando para seus pagamentos...');
        setTimeout(() => navigate('/minhas-inscricoes'), 1500);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        
        <h1 className="mb-8 text-4xl font-bold">Eventos</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : events?.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum evento disponível no momento.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events?.map((event) => (
              <EventCard key={event.id} event={event} onRegister={setSelectedEvent} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inscrição - {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                required
                placeholder="(00) 00000-0000"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            
            {customFields?.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.field_name} {field.is_required && '*'}
                </Label>
                {field.field_type === 'select' && Array.isArray(field.options) ? (
                  <Select
                    value={formData.customFields[field.field_name] || ''}
                    onValueChange={(v) => setFormData({
                      ...formData,
                      customFields: { ...formData.customFields, [field.field_name]: v }
                    })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {(field.options as string[]).map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.id}
                    type={field.field_type === 'number' ? 'number' : 'text'}
                    required={field.is_required}
                    value={formData.customFields[field.field_name] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customFields: { ...formData.customFields, [field.field_name]: e.target.value }
                    })}
                  />
                )}
              </div>
            ))}

            {isPaid && selectedEvent && eventPixKey && (
              <PaymentSelector
                event={selectedEvent}
                pixKey={eventPixKey}
                onChange={setPaymentResult}
              />
            )}

            {existingRegistration && user && (
              <div className="rounded-md bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Você já está inscrito neste evento.{' '}
                  <Link to="/minhas-inscricoes" className="text-primary hover:underline font-medium">Ver minhas inscrições</Link>
                </span>
              </div>
            )}

            {!user && (
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground flex items-center gap-2">
                <LogIn className="h-4 w-4 shrink-0" />
                <span>
                  <Link to="/login" className="text-primary hover:underline font-medium">Faça login</Link>
                  {' '}para acompanhar suas inscrições e pagamentos.
                </span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={createRegistration.isPending || createInstallments.isPending || !!existingRegistration}>
              {createRegistration.isPending || createInstallments.isPending ? 'Enviando...' : existingRegistration ? 'Já inscrito' : 'Confirmar Inscrição'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Eventos;
