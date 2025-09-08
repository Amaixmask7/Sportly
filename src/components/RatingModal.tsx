import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSubmitRating } from '@/hooks/useRating';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: {
    id: string;
    Sports?: { Sport_name: string };
    venue: string;
    start_at: string;
  };
  participant: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface RatingFormData {
  rating: number;
  comment: string;
  wouldPlayAgain: boolean;
}

export const RatingModal = ({ isOpen, onClose, invitation, participant }: RatingModalProps) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [wouldPlayAgain, setWouldPlayAgain] = useState<boolean | null>(null);
  
  const submitRating = useSubmitRating();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RatingFormData>();

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleStarHover = (rating: number) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const onSubmit = async (data: RatingFormData) => {
    if (selectedRating === 0) {
      return;
    }

    submitRating.mutate({
      invitation_id: invitation.id,
      rated_user_id: participant.id,
      rating: selectedRating,
      comment: data.comment,
      would_play_again: wouldPlayAgain,
    }, {
      onSuccess: () => {
        reset();
        setSelectedRating(0);
        setWouldPlayAgain(null);
        onClose();
      }
    });
  };

  const handleClose = () => {
    reset();
    setSelectedRating(0);
    setWouldPlayAgain(null);
    onClose();
  };

  const startDate = new Date(invitation.start_at);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Beri Rating untuk {participant.display_name}</DialogTitle>
          <DialogDescription>
            Bagikan pengalaman Anda bermain olahraga bersama {participant.display_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={participant.avatar_url} />
                  <AvatarFallback>
                    {participant.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{participant.display_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{invitation.Sports?.Sport_name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(startDate, 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {invitation.venue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Rating (1-5 bintang)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredStar || selectedRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {selectedRating === 0 && (
                <p className="text-xs text-red-500">Pilih rating terlebih dahulu</p>
              )}
            </div>

            {/* Would Play Again */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Apakah Anda ingin bermain lagi?</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={wouldPlayAgain === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWouldPlayAgain(true)}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Ya
                </Button>
                <Button
                  type="button"
                  variant={wouldPlayAgain === false ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setWouldPlayAgain(false)}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Tidak
                </Button>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Komentar (Opsional)</label>
              <Textarea
                placeholder="Bagikan pengalaman Anda bermain bersama..."
                rows={4}
                {...register('comment', { maxLength: 500 })}
              />
              {errors.comment && (
                <p className="text-xs text-red-500">{errors.comment.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={selectedRating === 0 || submitRating.isPending}
              >
                {submitRating.isPending ? 'Mengirim...' : 'Kirim Rating'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
