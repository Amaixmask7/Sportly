import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserInvitations } from '@/hooks/useUserInvitations';
import { useUserParticipations } from '@/hooks/useUserParticipations';
import { InvitationManagement } from '@/components/InvitationManagement';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { data: myInvitations = [], isLoading: loadingInvitations } = useUserInvitations();
  const { data: myParticipations = [], isLoading: loadingParticipations } = useUserParticipations();
  const [activeTab, setActiveTab] = useState('invitations');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
          <p className="text-muted-foreground mb-4">Anda perlu masuk untuk melihat profil.</p>
          <Button asChild>
            <Link to="/auth">Masuk</Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-primary">Profil Saya</h1>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {myInvitations.length} Ajakan Dibuat
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {myParticipations.length} Ajakan Diikuti
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="invitations" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Ajakan Saya
              </TabsTrigger>
              <TabsTrigger value="participations" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ajakan Diikuti
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invitations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ajakan yang Saya Buat</h3>
                <Button asChild>
                  <Link to="/">Buat Ajakan Baru</Link>
                </Button>
              </div>
              
              {loadingInvitations ? (
                <div className="text-center py-8">
                  <p>Memuat ajakan...</p>
                </div>
              ) : myInvitations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Anda belum membuat ajakan olahraga.
                    </p>
                    <Button asChild>
                      <Link to="/">Buat Ajakan Pertama</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {myInvitations.map((invitation) => (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      isOwner={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="participations" className="space-y-4">
              <h3 className="text-lg font-semibold">Ajakan yang Saya Ikuti</h3>
              
              {loadingParticipations ? (
                <div className="text-center py-8">
                  <p>Memuat partisipasi...</p>
                </div>
              ) : myParticipations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      Anda belum mengikuti ajakan olahraga.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {myParticipations.map((participation) => (
                    <InvitationCard
                      key={participation.id}
                      invitation={participation}
                      isOwner={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Component untuk menampilkan card invitation
const InvitationCard = ({ invitation, isOwner }: { invitation: any; isOwner: boolean }) => {
  const startDate = new Date(invitation.start_at);
  const isPast = startDate < new Date();
  
  return (
    <Card className={`${isPast ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{invitation.Sports?.Sport_name}</Badge>
            {isPast && <Badge variant="secondary">Selesai</Badge>}
            {invitation.is_canceled && <Badge variant="destructive">Dibatalkan</Badge>}
          </div>
          {isOwner && !isPast && !invitation.is_canceled && (
            <InvitationManagement invitation={invitation} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{invitation.venue}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(startDate, 'dd MMMM yyyy, HH:mm', { locale: id })}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{invitation.duration} jam</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>Kapasitas: {invitation.capacity} orang</span>
        </div>
        
        {invitation.note && (
          <p className="text-sm text-muted-foreground">{invitation.note}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Profile;
