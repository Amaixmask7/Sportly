import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InvitationComments } from './InvitationComments';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

interface SportCardProps {
  invitation: {
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
  };
  participantCount?: number;
  isJoined?: boolean;
  onJoin: (id: string) => void;
  onLeave?: (id: string) => void;
}

const getSportColor = (slug: string) => {
  const colors = {
    futsal: 'bg-sport-blue text-white',
    basket: 'bg-sport-orange text-white', 
    badminton: 'bg-sport-green text-white',
    sepakbola: 'bg-sport-purple text-white',
    tenis: 'bg-yellow-500 text-white',
  };
  return colors[slug as keyof typeof colors] || 'bg-primary text-primary-foreground';
};

export const SportCard = ({ invitation, onJoin, onLeave, participantCount = 0, isJoined = false }: SportCardProps) => {
  const startTime = new Date(invitation.start_at);
  const endTime = new Date(startTime.getTime() + (invitation.duration * 60 * 60 * 1000));

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{invitation.Sports?.Sport_name}</CardTitle>
          <Badge className={getSportColor(invitation.Sports?.Slug || '')}>
            {invitation.Sports?.Sport_name}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          by {invitation.Customer?.display_name || 'Anonymous'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{invitation.venue}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(startTime, 'dd MMM yyyy')}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
            ({invitation.duration}h)
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{participantCount}/{invitation.capacity} orang</span>
        </div>
        
        {invitation.note && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm">{invitation.note}</p>
          </div>
        )}
        
        {isJoined ? (
          <Button 
            onClick={() => onLeave && onLeave(invitation.id)} 
            className="w-full mt-4"
            variant="outline"
          >
            Keluar
          </Button>
        ) : (
          <Button 
            onClick={() => onJoin(invitation.id)} 
            className="w-full mt-4"
            variant="default"
          >
            Gabung Olahraga
          </Button>
        )}
      </CardContent>
      
      {/* Comments Section */}
      {/* <InvitationComments invitationId={invitation.id} /> */}
    </Card>
  );
};