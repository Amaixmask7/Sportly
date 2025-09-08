import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Invitation {
  id: string;
  sport_id: string;
  venue: string;
  start_at: string;
  duration: number;
  capacity: number;
  note?: string;
  Sports?: {
    Sport_name: string;
    Slug: string;
  };
  Customer?: {
    display_name: string;
  };
}

export const useInvitations = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async (): Promise<Invitation[]> => {
      const { data, error } = await supabase
        .from('Invitation')
        .select(`
          *,
          Sports (Sport_name, Slug),
          Customer (display_name)
        `)
        .eq('is_canceled', false)
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      sport_id: string;
      venue: string;
      start_at: string;
      duration: number;
      capacity: number;
      note?: string;
      owner_id: string;
    }) => {
      const { error } = await supabase
        .from('Invitation')
        .insert({
          ...data,
          start_at: new Date(data.start_at).toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({
        title: "Success!",
        description: "Invitation berhasil dibuat. Menunggu teman bergabung!",
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
