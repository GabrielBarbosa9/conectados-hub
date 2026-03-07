import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createAdminNotification } from '@/hooks/useAdminNotifications';
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
        .from('installment_payments' as any)
        .select('*')
        .eq('registration_id', registrationId)
        .order('installment_number', { ascending: true });
      if (error) throw error;
      return data as unknown as InstallmentPayment[];
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
        .from('installment_payments' as any)
        .select('*')
        .in('registration_id', ids)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as unknown as InstallmentPayment[];
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
        .from('installment_payments' as any)
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
      amount,
    }: {
      installmentId: string;
      registrationId: string;
      file: File;
      amount?: number;
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

      const updatePayload: { proof_url: string; payment_status: string; amount?: number } = {
        proof_url: urlData.publicUrl,
        payment_status: 'pending',
      };
      if (amount != null && amount >= 0) {
        updatePayload.amount = amount;
      }
      const { error: updateError } = await supabase
        .from('installment_payments' as any)
        .update(updatePayload)
        .eq('id', installmentId);
      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['installments', variables.registrationId] });
      toast.success('Comprovante enviado! Aguardando confirmação.');
      createAdminNotification({
        title: 'Novo comprovante de parcela',
        message: `Comprovante enviado para a parcela (inscrição ${variables.registrationId.slice(0, 8)}...)`,
        type: 'payment_proof',
        reference_id: variables.registrationId,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao enviar comprovante.');
    },
  });
};

/**
 * Recalcula o valor das parcelas pendentes após um pagamento com valor customizado.
 * Total já pago = soma dos amount das parcelas paid; restante = eventPrice - totalPaid;
 * novo valor por parcela pendente = restante / quantidade de pendentes.
 */
async function recalcPendingInstallments(
  registrationId: string,
  eventPrice: number
): Promise<void> {
  const { data: all, error: fetchError } = await supabase
    .from('installment_payments' as any)
    .select('id, amount, payment_status')
    .eq('registration_id', registrationId)
    .order('installment_number', { ascending: true });
  if (fetchError) throw fetchError;
  if (!all?.length) return;

  const paidTotal = (all as unknown as InstallmentPayment[])
    .filter((i) => i.payment_status === 'paid')
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const pending = (all as unknown as InstallmentPayment[]).filter(
    (i) => i.payment_status !== 'paid'
  );
  if (pending.length === 0) return;

  const remaining = Math.max(0, eventPrice - paidTotal);
  const perInstallment = parseFloat((remaining / pending.length).toFixed(2));
  const remainder = Math.round((remaining - perInstallment * pending.length) * 100) / 100;
  const amounts = pending.map((_, idx) =>
    idx === pending.length - 1 ? perInstallment + remainder : perInstallment
  );

  for (let i = 0; i < pending.length; i++) {
    const { error: updateError } = await supabase
      .from('installment_payments' as any)
      .update({ amount: amounts[i] })
      .eq('id', pending[i].id);
    if (updateError) throw updateError;
  }
}

export const useConfirmInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      installmentId,
      registrationId,
      status,
      amount,
      eventPrice,
    }: {
      installmentId: string;
      registrationId: string;
      status: 'paid' | 'overdue' | 'pending';
      amount?: number;
      eventPrice?: number;
    }) => {
      const updateData: Record<string, unknown> = { payment_status: status };
      if (status === 'paid') {
        updateData.payment_date = format(new Date(), 'yyyy-MM-dd');
        if (amount != null && amount >= 0) {
          updateData.amount = amount;
        }
      }
      const { data, error } = await supabase
        .from('installment_payments' as any)
        .update(updateData)
        .eq('id', installmentId)
        .select()
        .single();
      if (error) throw error;

      if (
        status === 'paid' &&
        eventPrice != null &&
        eventPrice > 0
      ) {
        await recalcPendingInstallments(registrationId, eventPrice);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['installments', variables.registrationId] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['installments-by-event'] });
      queryClient.invalidateQueries({ queryKey: ['event-revenue'] });
      toast.success('Parcela atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar parcela.');
    },
  });
};
