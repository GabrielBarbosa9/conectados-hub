import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Search, Users } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations, useCheckIn } from '@/hooks/useRegistrations';
import { toast } from 'sonner';

const Checkin = () => {
  const { data: events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: registrations, isLoading } = useRegistrations(selectedEventId || undefined);
  const checkIn = useCheckIn();

  const activeEvents = events?.filter(e => e.is_active) || [];

  const filteredRegistrations = registrations?.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.whatsapp.includes(searchTerm)
  );

  const checkedInCount = registrations?.filter(r => r.checked_in).length || 0;
  const totalCount = registrations?.length || 0;

  const handleCheckIn = async (registrationId: string, currentStatus: boolean) => {
    try {
      await checkIn.mutateAsync({ registrationId, checkedIn: !currentStatus });
      toast.success(!currentStatus ? 'Check-in realizado!' : 'Check-in removido');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout title="Check-in">
      <div className="mb-6 space-y-4">
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Selecione um evento" />
          </SelectTrigger>
          <SelectContent>
            {activeEvents.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedEventId && (
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Card className="flex items-center gap-2 px-4 py-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{checkedInCount}/{totalCount}</span>
            </Card>
          </div>
        )}
      </div>

      {!selectedEventId ? (
        <p className="text-center text-muted-foreground py-12">
          Selecione um evento para fazer o check-in.
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredRegistrations?.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {searchTerm ? 'Nenhum inscrito encontrado.' : 'Nenhuma inscrição neste evento.'}
        </p>
      ) : (
        <div className="grid gap-3">
          {filteredRegistrations?.map((reg) => (
            <Card 
              key={reg.id} 
              className={`glass-card cursor-pointer transition-all hover:scale-[1.01] ${reg.checked_in ? 'border-green-500/50 bg-green-500/5' : ''}`}
              onClick={() => handleCheckIn(reg.id, reg.checked_in)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{reg.name}</p>
                  <p className="text-sm text-muted-foreground">{reg.whatsapp}</p>
                </div>
                
                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  reg.checked_in 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Check className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default Checkin;
