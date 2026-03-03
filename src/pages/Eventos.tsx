import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Copy, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents, useEventCustomFields, Event } from '@/hooks/useEvents';
import { useRegistrationCount, useCreateRegistration } from '@/hooks/useRegistrations';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: customFields } = useEventCustomFields(selectedEvent?.id || '');
  const createRegistration = useCreateRegistration();
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    age: '',
    customFields: {} as Record<string, string>,
    paymentProofUrl: '',
  });

  const globalPixKey = settings?.pix_key;
  const eventPixKey = selectedEvent?.pix_key || globalPixKey || '';
  const isPaid = selectedEvent?.payment_method === 'pix' || selectedEvent?.payment_method === 'pix_recorrente';

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(eventPixKey);
    setCopied(true);
    toast.success('Chave PIX copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadProof = async (file: File) => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(data.path);
      
      setFormData({ ...formData, paymentProofUrl: urlData.publicUrl });
      toast.success('Comprovante enviado!');
    } catch {
      toast.error('Erro ao enviar comprovante');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      const paymentStatus = isPaid ? 'pending' : 'free';

      await createRegistration.mutateAsync({
        event_id: selectedEvent.id,
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        custom_fields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
        payment_status: paymentStatus,
        payment_proof_url: formData.paymentProofUrl || undefined,
      });
      
      setSelectedEvent(null);
      setFormData({ name: '', whatsapp: '', email: '', age: '', customFields: {}, paymentProofUrl: '' });
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

            {/* PIX Payment Section */}
            {isPaid && selectedEvent?.price && (
              <div className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor da inscrição</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {Number(selectedEvent.price).toFixed(2)}
                  </p>
                  {selectedEvent.payment_method === 'pix_recorrente' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Cobrança mensal via WhatsApp
                    </p>
                  )}
                </div>

                {eventPixKey && (
                  <div className="space-y-2">
                    <Label>Chave PIX</Label>
                    <div className="flex gap-2">
                      <Input value={eventPixKey} readOnly className="font-mono text-sm" />
                      <Button type="button" variant="outline" size="icon" onClick={handleCopyPix}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Comprovante de Pagamento</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadProof(file);
                      }}
                    />
                  </div>
                  {formData.paymentProofUrl && (
                    <p className="text-xs text-green-600">✓ Comprovante enviado</p>
                  )}
                  {uploading && <p className="text-xs text-muted-foreground">Enviando...</p>}
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={createRegistration.isPending || uploading}>
              {createRegistration.isPending ? 'Enviando...' : 'Confirmar Inscrição'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Eventos;
