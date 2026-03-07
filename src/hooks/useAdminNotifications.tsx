import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useAdminNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as AdminNotification[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useUnreadCount = () => {
  const { data } = useAdminNotifications();
  return data?.filter((n) => !n.is_read).length ?? 0;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_notifications' as any)
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications' as any)
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
};

/** Helper to insert a notification (called from upload flows) */
export async function createAdminNotification(params: {
  title: string;
  message: string;
  type?: string;
  reference_id?: string;
}) {
  const { error } = await supabase
    .from('admin_notifications' as any)
    .insert({
      title: params.title,
      message: params.message,
      type: params.type || 'payment_proof',
      reference_id: params.reference_id || null,
    });
  if (error) console.error('Error creating admin notification:', error);
}
