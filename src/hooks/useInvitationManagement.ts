import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useUpdateInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      sport_id: string;
      venue: string;
      start_at: string;
      duration: number;
      capacity: number;
      note?: string;
    }) => {
      const { error } = await supabase
        .from('Invitation')
        .update({
          sport_id: data.sport_id,
          venue: data.venue,
          start_at: data.start_at,
          duration: data.duration,
          capacity: data.capacity,
          note: data.note,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      toast({
        title: "Berhasil!",
        description: "Ajakan olahraga berhasil diperbarui.",
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

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('Invitation')
        .update({ is_canceled: true })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      toast({
        title: "Berhasil!",
        description: "Ajakan olahraga berhasil dibatalkan.",
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
