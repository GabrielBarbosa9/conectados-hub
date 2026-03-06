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
  payment_type: string | null;
  payment_mode: string | null;
  installments_total: number | null;
  credit_card_payment_date: string | null;
  user_id: string | null;
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
  payment_type?: string;
  payment_mode?: string;
  installments_total?: number;
  credit_card_payment_date?: string;
  user_id?: string;
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

export const useUserEventRegistration = (eventId?: string, userId?: string) => {
  return useQuery({
    queryKey: ['user-event-registration', eventId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventId!)
        .eq('user_id', userId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId && !!userId,
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

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ registrationId, status }: { registrationId: string; status: string }) => {
      const { data, error } = await supabase
        .from('registrations')
        .update({ payment_status: status })
        .eq('id', registrationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('Status de pagamento atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar pagamento');
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

export interface EventRevenueRow {
  eventId: string;
  eventTitle: string;
  revenue: number;
}

export const useEventRevenue = () => {
  return useQuery({
    queryKey: ['event-revenue'],
    queryFn: async () => {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, price')
        .order('event_date', { ascending: false });
      if (eventsError) throw eventsError;

      const { data: regs, error: regsError } = await supabase
        .from('registrations')
        .select('id, event_id, payment_status');
      if (regsError) throw regsError;

      const { data: paidInstallments, error: instError } = await supabase
        .from('installment_payments' as any)
        .select('registration_id, amount')
        .eq('payment_status', 'paid');
      if (instError) throw instError;

      const eventMap = new Map<string, { title: string; price: number }>();
      (events || []).forEach((e: { id: string; title: string; price: number | null }) => {
        eventMap.set(e.id, { title: e.title, price: Number(e.price) || 0 });
      });

      const revenueByEvent = new Map<string, number>();

      (regs || []).forEach((r: { id: string; event_id: string; payment_status: string; payment_mode: string | null; installments_total: number | null }) => {
        const eventInfo = eventMap.get(r.event_id);
        if (!eventInfo) return;
        const isFull = r.payment_mode === 'full' || (r.installments_total ?? 1) <= 1;
        if (r.payment_status === 'confirmed' && isFull) {
          revenueByEvent.set(r.event_id, (revenueByEvent.get(r.event_id) ?? 0) + eventInfo.price);
        }
      });

      (paidInstallments || []).forEach((row: { registration_id: string; amount: number }) => {
        const reg = (regs || []).find((r: { id: string }) => r.id === row.registration_id);
        if (reg && reg.event_id) {
          revenueByEvent.set(reg.event_id, (revenueByEvent.get(reg.event_id) ?? 0) + Number(row.amount));
        }
      });

      const result: EventRevenueRow[] = (events || []).map((e: { id: string; title: string }) => ({
        eventId: e.id,
        eventTitle: e.title,
        revenue: revenueByEvent.get(e.id) ?? 0,
      }));
      return result;
    },
  });
};
