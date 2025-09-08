import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserInvitations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-invitations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('Invitation')
        .select(`
          *,
          Sports (Sport_name, Slug),
          Customer (display_name)
        `)
        .eq('owner_id', user.id)
        .order('start_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};
