import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEvents, useEventCustomFields, Event } from '@/hooks/useEvents';
import { useRegistrationCount, useCreateRegistration } from '@/hooks/useRegistrations';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EventCard = ({ event, onRegister }: { event: Event; onRegister: (event: Event) => void }) => {
  const { data: count = 0 } = useRegistrationCount(event.id);
  const spotsLeft = event.max_capacity ? event.max_capacity - count : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

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
        
        {event.max_capacity && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span className={isFull ? 'text-destructive' : ''}>
              {isFull ? 'Vagas esgotadas' : `${spotsLeft} vagas restantes`}
            </span>
          </div>
        )}
        
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: customFields } = useEventCustomFields(selectedEvent?.id || '');
  const createRegistration = useCreateRegistration();
  
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    age: '',
    customFields: {} as Record<string, string>,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      await createRegistration.mutateAsync({
        event_id: selectedEvent.id,
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        custom_fields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
      });
      
      setSelectedEvent(null);
      setFormData({ name: '', whatsapp: '', email: '', age: '', customFields: {} });
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
                <Input
                  id={field.id}
                  required={field.is_required}
                  value={formData.customFields[field.field_name] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    customFields: { ...formData.customFields, [field.field_name]: e.target.value }
                  })}
                />
              </div>
            ))}
            
            <Button type="submit" className="w-full" disabled={createRegistration.isPending}>
              {createRegistration.isPending ? 'Enviando...' : 'Confirmar Inscrição'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Eventos;
