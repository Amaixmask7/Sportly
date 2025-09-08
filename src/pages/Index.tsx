import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateInvitationForm } from '@/components/CreateInvitationForm';
import { OptimizedSportCard } from '@/components/OptimizedSportCard';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { SkeletonCardGrid } from '@/components/SkeletonCard';
import { useAuth } from '@/hooks/useAuth';
import { useInvitationFilters } from '@/hooks/useInvitationFilters';
import { useParticipantCounts, useUserParticipation, useJoinInvitation, useLeaveInvitation } from '@/hooks/useParticipants';
import { LogOut, Plus, Users } from 'lucide-react';

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    invitations,
    isLoading,
    error,
    searchQuery,
    selectedSport,
    selectedDateRange,
    setSearchQuery,
    setSelectedSport,
    setSelectedDateRange,
    clearFilters
  } = useInvitationFilters();
  
  const joinInvitation = useJoinInvitation();
  const leaveInvitation = useLeaveInvitation();
  
  const invitationIds = invitations.map(inv => inv.id);
  const { data: participantCounts = {} } = useParticipantCounts(invitationIds);
  const { data: joinedMap = {} } = useUserParticipation(user?.id, invitationIds);

  const handleJoin = async (invitationId: string, capacity: number) => {
    if (!user) return;
    
    const currentCount = participantCounts[invitationId] || 0;
    if (currentCount >= capacity) {
      return;
    }
    
    joinInvitation.mutate({ invitationId, userId: user.id });
  };

  const handleLeave = async (invitationId: string) => {
    if (!user) return;
    
    leaveInvitation.mutate({ invitationId, userId: user.id });
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profile">
                      <Users className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                  </Button>
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

            {/* Search and Filter */}
            <SearchAndFilter
              onSearch={setSearchQuery}
              onFilterSport={setSelectedSport}
              onFilterDate={setSelectedDateRange}
              onClearFilters={clearFilters}
              searchQuery={searchQuery}
              selectedSport={selectedSport}
              selectedDateRange={selectedDateRange}
            />

            {authLoading || isLoading ? (
              <SkeletonCardGrid count={6} />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error memuat data: {error.message}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Refresh Halaman
                </Button>
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery || selectedSport !== 'all' || selectedDateRange !== 'all' 
                    ? 'Tidak ada ajakan yang sesuai dengan filter Anda.' 
                    : 'Belum ada ajakan olahraga. Jadilah yang pertama membuat ajakan!'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.map((invitation) => (
                  <OptimizedSportCard
                    key={invitation.id}
                    invitation={invitation}
                    onJoin={(id) => handleJoin(id, invitation.capacity)}
                    onLeave={handleLeave}
                    currentParticipants={participantCounts[invitation.id] || 0}
                    isJoined={joinedMap[invitation.id] || false}
                    user={user}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create">
            <div className="max-w-2xl mx-auto">
              {user ? (
                <CreateInvitationForm onSuccess={() => {
                  // Switch to feed tab after successful creation
                  const feedTab = document.querySelector('[value="feed"]') as HTMLElement;
                  if (feedTab) feedTab.click();
                }} />
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
