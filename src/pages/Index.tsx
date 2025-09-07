import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateInvitationForm } from '@/components/CreateInvitationForm';
import { SportCard } from '@/components/SportCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LogOut, Plus, Users } from 'lucide-react';

interface Invitation {
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

const Index = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchInvitations();
    if (user) {
      fetchParticipation();
    }
    
    // Set up real-time subscription
    const channel = supabase
      .channel('invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Invitation'
        },
        () => {
          fetchInvitations();
        }
      )
      .subscribe();

    const participantChannel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'InvitationParticipant'
        },
        () => {
          fetchParticipantCounts();
          if (user) fetchParticipation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(participantChannel);
    };
  }, [user]);

  const fetchInvitations = async () => {
    try {
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
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantCounts = async () => {
    try {
      const ids = invitations.map(i => i.id);
      if (ids.length === 0) return;
      const { data, error } = await supabase
        .from('InvitationParticipant')
        .select('invitation_id')
        .in('invitation_id', ids);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach(row => {
        counts[row.invitation_id] = (counts[row.invitation_id] || 0) + 1;
      });
      setParticipantCounts(counts);
    } catch (error) {
      // ignore silently
    }
  };

  const fetchParticipation = async () => {
    if (!user) return;
    try {
      const ids = invitations.map(i => i.id);
      if (ids.length === 0) return;
      const { data, error } = await supabase
        .from('InvitationParticipant')
        .select('invitation_id')
        .eq('user_id', user.id)
        .in('invitation_id', ids);
      if (error) throw error;
      const map: Record<string, boolean> = {};
      data?.forEach(row => {
        map[row.invitation_id] = true;
      });
      setJoinedMap(map);
    } catch (error) {
      // ignore silently
    }
  };

  const handleJoin = async (invitationId: string) => {
    if (!user) {
      toast({
        title: "Butuh login",
        description: "Silakan masuk terlebih dahulu sebelum bergabung.",
      });
      return;
    }

    try {
      const currentInvitation = invitations.find((i) => i.id === invitationId);
      const capacity = currentInvitation?.capacity ?? 0;

      // Cek apakah sudah join
      const { data: existing, error: existingError } = await supabase
        .from('InvitationParticipant')
        .select('id')
        .eq('invitation_id', invitationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') throw existingError;
      if (existing) {
        toast({
          title: 'Sudah bergabung',
          description: 'Anda sudah terdaftar pada ajakan ini.',
        });
        return;
      }

      // Cek kapasitas
      const { count, error: countError } = await supabase
        .from('InvitationParticipant')
        .select('id', { count: 'exact', head: true })
        .eq('invitation_id', invitationId);
      if (countError) throw countError;
      if (typeof count === 'number' && capacity > 0 && count >= capacity) {
        toast({
          title: 'Penuh',
          description: 'Kapasitas ajakan ini sudah penuh.',
          variant: 'destructive',
        });
        return;
      }

      // Insert participant
      const { error: insertError } = await supabase
        .from('InvitationParticipant')
        .insert({ invitation_id: invitationId, user_id: user.id });
      if (insertError) throw insertError;

      toast({
        title: 'Berhasil bergabung',
        description: 'Selamat! Anda telah bergabung pada ajakan ini.',
      });
      fetchParticipantCounts();
      fetchParticipation();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleLeave = async (invitationId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('InvitationParticipant')
        .delete()
        .eq('invitation_id', invitationId)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Keluar', description: 'Anda telah keluar dari ajakan ini.' });
      fetchParticipantCounts();
      fetchParticipation();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Sportly</h1>
              <p className="text-muted-foreground">Cari teman olahraga di dekatmu</p>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Halo, {user.user_metadata?.display_name || user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Masuk / Daftar</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Feed Ajakan
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2" disabled={!user}>
              <Plus className="h-4 w-4" />
              Buat Ajakan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Temukan Partner Olahraga</h2>
              <p className="text-muted-foreground">
                Bergabunglah dengan ajakan olahraga di sekitarmu atau buat ajakan baru
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p>Memuat ajakan olahraga...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Belum ada ajakan olahraga. Jadilah yang pertama membuat ajakan!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.map((invitation) => (
                  <SportCard
                    key={invitation.id}
                    invitation={invitation}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    participantCount={participantCounts[invitation.id] || 0}
                    isJoined={joinedMap[invitation.id] || false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create">
            <div className="max-w-2xl mx-auto">
              {user ? (
                <CreateInvitationForm onSuccess={() => fetchInvitations()} />
              ) : (
                <div className="p-6 border rounded-md bg-muted/30 text-center space-y-4">
                  <p className="text-sm text-muted-foreground">Anda perlu masuk untuk membuat ajakan.</p>
                  <Button asChild>
                    <Link to="/auth">Masuk / Daftar</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
