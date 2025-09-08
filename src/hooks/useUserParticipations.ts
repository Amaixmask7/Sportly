import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserParticipations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-participations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('InvitationParticipant')
        .select(`
          *,
          Invitation (
            *,
            Sports (Sport_name, Slug),
            Customer (display_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Extract invitation data from the nested structure
      return data?.map(participation => participation.Invitation).filter(Boolean) || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};
