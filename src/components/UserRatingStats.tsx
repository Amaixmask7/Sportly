import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserRatingStats, useUserRatings } from '@/hooks/useRating';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';

interface UserRatingStatsProps {
  userId: string;
  displayName: string;
  avatarUrl?: string;
}

export const UserRatingStats = ({ userId, displayName, avatarUrl }: UserRatingStatsProps) => {
  const { data: stats } = useUserRatingStats(userId);
  const { data: ratings = [] } = useUserRatings(userId);

  if (!stats || stats.totalRatings === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rating & Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Belum ada rating untuk {displayName}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : i < rating
            ? 'text-yellow-400 fill-yellow-400 opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Rating & Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <div className="flex justify-center mt-1">
              {renderStars(stats.averageRating)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.totalRatings} rating
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span className="text-sm">Mau main lagi</span>
              <Badge variant="secondary">{stats.wouldPlayAgainPercentage}%</Badge>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        {ratings.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Review Terbaru</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {ratings.slice(0, 3).map((rating) => (
                <div key={rating.id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={rating.Rater?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {rating.Rater?.display_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {rating.Rater?.display_name || 'Anonymous'}
                        </span>
                        <div className="flex">
                          {renderStars(rating.rating)}
                        </div>
                        {rating.would_play_again && (
                          <Badge variant="outline" className="text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Mau main lagi
                          </Badge>
                        )}
                      </div>
                      {rating.comment && (
                        <p className="text-sm text-muted-foreground">
                          {rating.comment}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {rating.Invitation?.Sports?.Sport_name} • {rating.Invitation?.venue}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
