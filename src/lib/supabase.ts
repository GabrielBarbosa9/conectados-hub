import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Helper types
export type AppRole = 'admin' | 'user';

// Check if user has a specific role
export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking role:', error);
    return false;
  }
  
  return !!data;
};

// Check if current user is admin
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return hasRole(user.id, 'admin');
};
