import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useInvitationComments = (invitationId: string) => {
  return useQuery({
    queryKey: ['invitation-comments', invitationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('InvitationComment')
        .select(`
          *,
          Customer (display_name, avatar_url)
        `)
        .eq('invitation_id', invitationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!invitationId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
  });
};

export const useAddComment = () => {
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
        queryKey: ['invitation-comments', variables.invitation_id] 
      });
      toast({
        title: "Komentar ditambahkan",
        description: "Komentar Anda berhasil ditambahkan.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
