import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useInvitationPesan = (invitationId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['invitation-pesan', invitationId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('InvitationComment')
          .select(`
            *,
            Customer (display_name, avatar_url)
          `)
          .eq('invitation_id', invitationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching pesan:', error);
          return []; // Return empty array on error
        }
        
        return data || [];
      } catch (error) {
        console.error('Failed to fetch pesan:', error);
        return []; // Return empty array on catch
      }
    },
    enabled: !!invitationId && enabled, // Only fetch when enabled
    retry: 1, // Reduce retry attempts
    retryDelay: 1000, // 1 second delay
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: false, // Disable auto refetch to prevent infinite loop
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });
};

export const useAddPesan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      invitation_id: string;
      user_id: string;
      content: string;
    }) => {
      const { error } = await supabase
        .from('InvitationComment')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['invitation-pesan', variables.invitation_id] 
      });
      toast({
        title: "Pesan dikirim",
        description: "Pesan Anda berhasil dikirim.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
