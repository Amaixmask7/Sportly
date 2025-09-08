import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useUserRatings = (userId: string) => {
  return useQuery({
    queryKey: ['user-ratings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('UserRating')
        .select(`
          *,
          Invitation (
            Sports (Sport_name),
            venue,
            start_at
          ),
          Rater:Customer!UserRating_rater_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useSubmitRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      invitation_id: string;
      rated_user_id: string;
      rating: number;
      comment?: string;
      would_play_again?: boolean;
    }) => {
      const { error } = await supabase
        .from('UserRating')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['user-ratings', variables.rated_user_id] 
      });
      toast({
        title: "Rating berhasil dikirim",
        description: "Terima kasih telah memberikan feedback!",
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

export const useUserRatingStats = (userId: string) => {
  return useQuery({
    queryKey: ['user-rating-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('UserRating')
        .select('rating, would_play_again')
        .eq('rated_user_id', userId);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          wouldPlayAgainPercentage: 0,
        };
      }

      const averageRating = data.reduce((sum, rating) => sum + rating.rating, 0) / data.length;
      const wouldPlayAgainCount = data.filter(rating => rating.would_play_again === true).length;
      const wouldPlayAgainPercentage = (wouldPlayAgainCount / data.length) * 100;

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: data.length,
        wouldPlayAgainPercentage: Math.round(wouldPlayAgainPercentage),
      };
    },
    enabled: !!userId,
  });
};
