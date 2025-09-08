import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
  const [formData, setFormData] = useState({
    sport_id: '',
    venue: '',
    start_at: '',
    duration: 1,
    capacity: 6,
    note: ''
  });
  
  const { user } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validations
    if (!formData.sport_id) {
      toast({ title: 'Validasi', description: 'Pilih jenis olahraga.', variant: 'destructive' });
      return;
    }
    if (!formData.venue.trim()) {
      toast({ title: 'Validasi', description: 'Lokasi/Venue wajib diisi.', variant: 'destructive' });
      return;
    }
    const startDate = new Date(formData.start_at);
    const now = new Date();
    if (isNaN(startDate.getTime()) || startDate <= now) {
      toast({ title: 'Validasi', description: 'Tanggal & jam harus di masa depan.', variant: 'destructive' });
      return;
    }
    if (formData.duration <= 0) {
      toast({ title: 'Validasi', description: 'Durasi harus lebih dari 0.', variant: 'destructive' });
      return;
    }
    const selected = sports.find(s => s.id === formData.sport_id);
    if (selected) {
      const min = selected.Min_participants || 1;
      const max = selected.Max_participants || 100;
      if (formData.capacity < min || formData.capacity > max) {
        toast({ title: 'Validasi', description: `Jumlah partisipan harus antara ${min}-${max}.`, variant: 'destructive' });
        return;
      }
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('Invitation')
        .insert({
          ...formData,
          owner_id: user.id,
          start_at: startDate.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Invitation berhasil dibuat. Menunggu teman bergabung!",
      });

      // Reset form
      setFormData({
        sport_id: '',
        venue: '',
        start_at: '',
        duration: 1,
        capacity: 6,
        note: ''
      });
      
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

  const selectedSport = sports.find(s => s.id === formData.sport_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">Buat Ajakan Olahraga</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sport">Jenis Olahraga</Label>
            <Select 
              value={formData.sport_id} 
              onValueChange={(value) => {
                const sport = sports.find(s => s.id === value);
                setFormData(prev => ({ 
                  ...prev, 
                  sport_id: value,
                  capacity: sport?.Min_participants || 6
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih olahraga" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id}>
                    {sport.Sport_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Lokasi/Venue</Label>
            <Input
              id="venue"
              type="text"
              placeholder="Contoh: GOR Senayan, Lapangan Futsal ABC"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_at">Tanggal & Jam</Label>
              <Input
                id="start_at"
                type="datetime-local"
                value={formData.start_at}
                onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durasi (jam)</Label>
              <Input
                id="duration"
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Jumlah Partisipan</Label>
            <Input
              id="capacity"
              type="number"
              min={selectedSport?.Min_participants || 2}
              max={selectedSport?.Max_participants || 20}
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
              required
            />
            {selectedSport && (
              <p className="text-sm text-muted-foreground">
                Rekomendasi: {selectedSport.Min_participants} - {selectedSport.Max_participants} orang
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="note"
              placeholder="Contoh: Bawa sepatu futsal, level pemula welcome"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Membuat...' : 'Buat Ajakan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};