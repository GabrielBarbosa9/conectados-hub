import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addMonths, format } from 'date-fns';

export interface InstallmentPayment {
  id: string;
  registration_id: string;
  installment_number: number;
  amount: number;
  due_date: string | null;
  payment_status: 'pending' | 'paid' | 'overdue';
  payment_date: string | null;
  proof_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useInstallments = (registrationId?: string) => {
  return useQuery({
    queryKey: ['installments', registrationId],
    queryFn: async () => {
      if (!registrationId) return [];
      const { data, error } = await supabase
        .from('installment_payments')
        .select('*')
        .eq('registration_id', registrationId)
        .order('installment_number', { ascending: true });
      if (error) throw error;
      return data as InstallmentPayment[];
    },
    enabled: !!registrationId,
  });
};

export const useAllInstallmentsByEvent = (eventId?: string) => {
  return useQuery({
    queryKey: ['installments-by-event', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventId);
      if (regError) throw regError;
      if (!registrations?.length) return [];

      const ids = registrations.map((r) => r.id);
      const { data, error } = await supabase
        .from('installment_payments')
        .select('*')
        .in('registration_id', ids)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as InstallmentPayment[];
    },
    enabled: !!eventId,
  });
};

export const useCreateInstallments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      registrationId,
      total,
      amount,
      startDate,
    }: {
      registrationId: string;
      total: number;
      amount: number;
      startDate?: Date;
    }) => {
      const base = startDate || new Date();
      const installments = Array.from({ length: total }, (_, i) => ({
        registration_id: registrationId,
        installment_number: i + 1,
        amount: parseFloat((amount / total).toFixed(2)),
        due_date: format(addMonths(base, i), 'yyyy-MM-dd'),
        payment_status: 'pending',
      }));

      const { data, error } = await supabase
        .from('installment_payments')
        .insert(installments)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['installments', variables.registrationId] });
    },
    onError: (error) => {
      console.error('Error creating installments:', error);
    },
  });
};

export const useUploadInstallmentProof = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      installmentId,
      registrationId,
      file,
    }: {
      installmentId: string;
      registrationId: string;
      file: File;
    }) => {
      const ext = file.name.split('.').pop();
      const path = `${registrationId}/${installmentId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('installment-proofs')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('installment-proofs')
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('installment_payments')
        .update({ proof_url: urlData.publicUrl, payment_status: 'pending' })
        .eq('id', installmentId);
      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['installments', variables.registrationId] });
      toast.success('Comprovante enviado! Aguardando confirmação.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao enviar comprovante.');
    },
  });
};

export const useConfirmInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      installmentId,
      registrationId,
      status,
    }: {
      installmentId: string;
      registrationId: string;
      status: 'paid' | 'overdue' | 'pending';
    }) => {
      const updateData: Record<string, unknown> = { payment_status: status };
      if (status === 'paid') {
        updateData.payment_date = format(new Date(), 'yyyy-MM-dd');
      }
      const { data, error } = await supabase
        .from('installment_payments')
        .update(updateData)
        .eq('id', installmentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['installments', variables.registrationId] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast.success('Parcela atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar parcela.');
    },
  });
};
