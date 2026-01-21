import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Settings {
  whatsapp_number: string;
  whatsapp_message: string;
  instagram_url: string;
  pix_key: string;
  pix_name: string;
  about_text: string;
}

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<Settings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');
      
      if (error) throw error;
      
      const settings: Settings = {
        whatsapp_number: '',
        whatsapp_message: '',
        instagram_url: '',
        pix_key: '',
        pix_name: '',
        about_text: '',
      };
      
      data?.forEach((item) => {
        if (item.key in settings) {
          settings[item.key as keyof Settings] = item.value || '';
        }
      });
      
      return settings;
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .update({ value: update.value })
          .eq('key', update.key);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar configurações');
      console.error('Error updating settings:', error);
    },
  });
};
