import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sport {
  id: string;
  Sport_name: string;
  Slug: string;
  Min_participants: number;
  Max_participants: number;
}

export const useSports = () => {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async (): Promise<Sport[]> => {
      const { data, error } = await supabase
        .from('Sports')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
