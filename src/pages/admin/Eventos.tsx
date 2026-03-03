import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, Event } from '@/hooks/useEvents';
import { format } from 'date-fns';
import EventCustomFieldsManager from '@/components/EventCustomFieldsManager';

const Eventos = () => {
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_capacity: '',
    is_active: true,
    price: '',
    payment_method: 'free',
    pix_key: '',
    n8n_webhook_url: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      max_capacity: '',
      is_active: true,
      price: '',
      payment_method: 'free',
      pix_key: '',
      n8n_webhook_url: '',
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      location: event.location || '',
      max_capacity: event.max_capacity?.toString() || '',
      is_active: event.is_active,
      price: event.price?.toString() || '',
      payment_method: event.payment_method || 'free',
      pix_key: event.pix_key || '',
      n8n_webhook_url: event.n8n_webhook_url || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      title: formData.title,
      description: formData.description || undefined,
      event_date: formData.event_date,
      event_time: formData.event_time || undefined,
      location: formData.location || undefined,
      max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : undefined,
      is_active: formData.is_active,
      price: formData.price ? parseFloat(formData.price) : null,
      payment_method: formData.payment_method,
      pix_key: formData.pix_key || null,
      n8n_webhook_url: formData.n8n_webhook_url || null,
    };

    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, ...data });
    } else {
      await createEvent.mutateAsync(data);
    }
    
    setIsOpen(false);
    resetForm();
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      await deleteEvent.mutateAsync(eventId);
    }
  };

  const paymentLabel = (method: string | null) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'pix_recorrente': return 'PIX Recorrente';
      default: return 'Gratuito';
    }
  };

  return (
    <AdminLayout title="Eventos">
      <div className="mb-6">
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Data *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_time">Horário</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_capacity">Limite de Vagas</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                />
              </div>

              {/* Payment Section */}
              <div className="space-y-3 rounded-md border p-3">
                <Label className="text-sm font-semibold">Pagamento</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Forma de Pagamento</Label>
                  <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="pix">PIX (pagamento único)</SelectItem>
                      <SelectItem value="pix_recorrente">PIX Recorrente (via N8N)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.payment_method !== 'free' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="price">Valor (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pix_key">Chave PIX do Evento</Label>
                      <Input
                        id="pix_key"
                        value={formData.pix_key}
                        onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                        placeholder="Deixe vazio para usar a chave global"
                      />
                      <p className="text-xs text-muted-foreground">Se vazio, usa a chave PIX das configurações gerais.</p>
                    </div>
                  </>
                )}

                {formData.payment_method === 'pix_recorrente' && (
                  <div className="space-y-2">
                    <Label htmlFor="n8n_webhook_url">URL Webhook N8N</Label>
                    <Input
                      id="n8n_webhook_url"
                      value={formData.n8n_webhook_url}
                      onChange={(e) => setFormData({ ...formData, n8n_webhook_url: e.target.value })}
                      placeholder="https://n8n.example.com/webhook/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      O webhook será chamado após a inscrição para iniciar cobranças mensais via WhatsApp.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Evento ativo</Label>
              </div>

              {/* Custom Fields - only show when editing */}
              {editingEvent && (
                <div className="rounded-md border p-3">
                  <EventCustomFieldsManager eventId={editingEvent.id} />
                </div>
              )}
              
              <Button type="submit" className="w-full">
                {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : events?.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhum evento cadastrado.</p>
      ) : (
        <div className="grid gap-4">
          {events?.map((event) => (
            <Card key={event.id} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event_date), 'dd/MM/yyyy')}
                    {event.event_time && ` às ${event.event_time.slice(0, 5)}`}
                    {' · '}
                    {paymentLabel(event.payment_method)}
                    {event.price ? ` · R$ ${Number(event.price).toFixed(2)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs ${event.is_active ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    {event.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(event)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default Eventos;
