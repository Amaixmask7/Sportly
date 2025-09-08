import { memo } from 'react';
import { SportCard } from './SportCard';
import type { Invitation } from '@/hooks/useInvitations';

interface OptimizedSportCardProps {
  invitation: Invitation;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  currentParticipants: number;
  isJoined: boolean;
  user: any;
}

export const OptimizedSportCard = memo<OptimizedSportCardProps>(({
  invitation,
  onJoin,
  onLeave,
  currentParticipants,
  isJoined,
  user
}) => {
  return (
    <SportCard
      invitation={invitation}
      onJoin={onJoin}
      onLeave={onLeave}
      currentParticipants={currentParticipants}
      isJoined={isJoined}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.invitation.id === nextProps.invitation.id &&
    prevProps.currentParticipants === nextProps.currentParticipants &&
    prevProps.isJoined === nextProps.isJoined &&
    prevProps.user?.id === nextProps.user?.id
  );
});

OptimizedSportCard.displayName = 'OptimizedSportCard';
