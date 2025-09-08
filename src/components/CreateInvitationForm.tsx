import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { createInvitationSchema, type CreateInvitationInput } from '@/schemas/invitation';

interface Sport {
  id: string;
  Sport_name: string;
  Slug: string;
  Min_participants: number;
  Max_participants: number;
}

interface CreateInvitationFormProps {
  onSuccess?: () => void;
}

export const CreateInvitationForm = ({ onSuccess }: CreateInvitationFormProps) => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  
  const form = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      sport_id: '',
      venue: '',
      start_at: '',
      duration: 1,
      capacity: 6,
      note: ''
    }
  });

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const { data, error } = await supabase
        .from('Sports')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setSports(data || []);
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  const onSubmit = async (data: CreateInvitationInput) => {
    if (!user) return;
    
    // Additional validation for capacity based on sport
    const selected = sports.find(s => s.id === data.sport_id);
    if (selected) {
      const min = selected.Min_participants || 1;
      const max = selected.Max_participants || 100;
      if (data.capacity < min || data.capacity > max) {
        toast({ 
          title: 'Validasi', 
          description: `Jumlah partisipan harus antara ${min}-${max}.`, 
          variant: 'destructive' 
        });
        return;
      }
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('Invitation')
        .insert({
          ...data,
          owner_id: user.id,
          start_at: new Date(data.start_at).toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Invitation berhasil dibuat. Menunggu teman bergabung!",
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedSport = sports.find(s => s.id === form.watch('sport_id'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">Buat Ajakan Olahraga</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sport_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Olahraga</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={(value) => {
                      field.onChange(value);
                      const sport = sports.find(s => s.id === value);
                      if (sport) {
                        form.setValue('capacity', sport.Min_participants || 6);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih olahraga" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.Sport_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi/Venue</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: GOR Senayan, Lapangan Futsal ABC"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal & Jam</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi (jam)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.5"
                        max="8"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Partisipan</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={selectedSport?.Min_participants || 2}
                      max={selectedSport?.Max_participants || 20}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  {selectedSport && (
                    <p className="text-sm text-muted-foreground">
                      Rekomendasi: {selectedSport.Min_participants} - {selectedSport.Max_participants} orang
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Bawa sepatu futsal, level pemula welcome"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Membuat...' : 'Buat Ajakan'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};