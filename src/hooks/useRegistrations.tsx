import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  age: number | null;
  custom_fields: Json | null;
  checked_in: boolean;
  checked_in_at: string | null;
  payment_status: string;
  payment_proof_url: string | null;
  created_at: string;
}

export interface CreateRegistrationData {
  event_id: string;
  name: string;
  whatsapp: string;
  email?: string;
  age?: number;
  custom_fields?: Json;
  payment_status?: string;
  payment_proof_url?: string;
}

export const useRegistrations = (eventId?: string) => {
  return useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      let query = supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Registration[];
    },
  });
};

export const useRegistrationCount = (eventId: string) => {
  return useQuery({
    queryKey: ['registration-count', eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventId,
  });
};

export const useCreateRegistration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (registrationData: CreateRegistrationData) => {
      const { data, error } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registration-count', data.event_id] });
      toast.success('Inscrição realizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao realizar inscrição');
      console.error('Error creating registration:', error);
    },
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ registrationId, checkedIn }: { registrationId: string; checkedIn: boolean }) => {
      const { data, error } = await supabase
        .from('registrations')
        .update({
          checked_in: checkedIn,
          checked_in_at: checkedIn ? new Date().toISOString() : null,
        })
        .eq('id', registrationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
};

export const useDeleteRegistration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('Inscrição excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir inscrição');
      console.error('Error deleting registration:', error);
    },
  });
};
