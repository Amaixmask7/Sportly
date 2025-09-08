import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useParticipantCounts = (invitationIds: string[]) => {
  return useQuery({
    queryKey: ['participant-counts', invitationIds],
    queryFn: async (): Promise<Record<string, number>> => {
      if (invitationIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('InvitationParticipant')
        .select('invitation_id')
        .in('invitation_id', invitationIds);

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(row => {
        counts[row.invitation_id] = (counts[row.invitation_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: invitationIds.length > 0,
    refetchInterval: 30000,
  });
};

export const useUserParticipation = (userId: string | undefined, invitationIds: string[]) => {
  return useQuery({
    queryKey: ['user-participation', userId, invitationIds],
    queryFn: async (): Promise<Record<string, boolean>> => {
      if (!userId || invitationIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('InvitationParticipant')
        .select('invitation_id')
        .eq('user_id', userId)
        .in('invitation_id', invitationIds);

      if (error) throw error;
      
      const map: Record<string, boolean> = {};
      data?.forEach(row => {
        map[row.invitation_id] = true;
      });
      
      return map;
    },
    enabled: !!userId && invitationIds.length > 0,
    refetchInterval: 30000,
  });
};

export const useJoinInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invitationId, userId }: { invitationId: string; userId: string }) => {
      const { error } = await supabase
        .from('InvitationParticipant')
        .insert({ invitation_id: invitationId, user_id: userId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-counts'] });
      queryClient.invalidateQueries({ queryKey: ['user-participation'] });
      toast({
        title: 'Berhasil bergabung',
        description: 'Selamat! Anda telah bergabung pada ajakan ini.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useLeaveInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invitationId, userId }: { invitationId: string; userId: string }) => {
      const { error } = await supabase
        .from('InvitationParticipant')
        .delete()
        .eq('invitation_id', invitationId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-counts'] });
      queryClient.invalidateQueries({ queryKey: ['user-participation'] });
      toast({
        title: 'Keluar',
        description: 'Anda telah keluar dari ajakan ini.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
