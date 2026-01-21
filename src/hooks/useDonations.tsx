import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Donation {
  id: string;
  amount: number;
  donor_name: string | null;
  notes: string | null;
  donation_date: string;
  created_at: string;
}

export interface CreateDonationData {
  amount: number;
  donor_name?: string;
  notes?: string;
  donation_date?: string;
}

export const useDonations = () => {
  return useQuery({
    queryKey: ['donations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('donation_date', { ascending: false });
      
      if (error) throw error;
      return data as Donation[];
    },
  });
};

export const useDonationStats = () => {
  return useQuery({
    queryKey: ['donation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('amount, donation_date');
      
      if (error) throw error;
      
      const total = data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const monthlyTotal = data
        ?.filter(d => d.donation_date >= firstDayOfMonth)
        .reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      
      return { total, monthlyTotal, count: data?.length || 0 };
    },
  });
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (donationData: CreateDonationData) => {
      const { data, error } = await supabase
        .from('donations')
        .insert(donationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donation-stats'] });
      toast.success('Doação registrada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar doação');
      console.error('Error creating donation:', error);
    },
  });
};

export const useDeleteDonation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (donationId: string) => {
      const { error } = await supabase
        .from('donations')
        .delete()
        .eq('id', donationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donation-stats'] });
      toast.success('Doação excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir doação');
      console.error('Error deleting donation:', error);
    },
  });
};
