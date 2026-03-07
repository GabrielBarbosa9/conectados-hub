import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  max_capacity: number | null;
  is_active: boolean;
  price: number | null;
  payment_method: string | null;
  pix_key: string | null;
  n8n_webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventCustomField {
  id: string;
  event_id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  field_order: number;
  options: Json | null;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  max_capacity?: number;
  is_active?: boolean;
  price?: number;
  payment_method?: string;
  pix_key?: string;
  n8n_webhook_url?: string;
}

export const useEvents = (activeOnly = false) => {
  return useQuery({
    queryKey: ['events', { activeOnly }],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Event[];
    },
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Event | null;
    },
    enabled: !!eventId,
  });
};

export const useEventCustomFields = (eventId: string) => {
  return useQuery({
    queryKey: ['event-custom-fields', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_custom_fields')
        .select('*')
        .eq('event_id', eventId)
        .order('field_order', { ascending: true });
      
      if (error) throw error;
      return data as EventCustomField[];
    },
    enabled: !!eventId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar evento');
      console.error('Error creating event:', error);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar evento');
      console.error('Error updating event:', error);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir evento');
      console.error('Error deleting event:', error);
    },
  });
};

export const useCreateCustomField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fieldData: Omit<EventCustomField, 'id'>) => {
      const { data, error } = await supabase
        .from('event_custom_fields')
        .insert([fieldData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-custom-fields', variables.event_id] });
    },
  });
};

export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fieldId, eventId }: { fieldId: string; eventId: string }) => {
      const { error } = await supabase
        .from('event_custom_fields')
        .delete()
        .eq('id', fieldId);
      
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event-custom-fields', eventId] });
    },
  });
};
