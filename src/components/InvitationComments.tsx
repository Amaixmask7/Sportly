import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useInvitationComments, useAddComment } from '@/hooks/useInvitationComments';
import { MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface InvitationCommentsProps {
  invitationId: string;
}

interface CommentFormData {
  content: string;
}

export const InvitationComments = ({ invitationId }: InvitationCommentsProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: comments = [], isLoading } = useInvitationComments(invitationId, true);
  const addComment = useAddComment();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>();

  const onSubmit = async (data: CommentFormData) => {
    if (!user || !data.content.trim()) return;
    
    addComment.mutate({
      invitation_id: invitationId,
      user_id: user.id,
      content: data.content.trim(),
    }, {
      onSuccess: () => {
        reset();
      }
    });
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <MessageCircle className="h-5 w-5" />
          Komentar ({comments.length})
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Comments List */}
          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Memuat komentar...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Belum ada komentar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.Customer?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {comment.Customer?.display_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {comment.Customer?.display_name || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'dd MMM HH:mm', { locale: id })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Tulis komentar..."
                  {...register('content', { required: 'Komentar tidak boleh kosong' })}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                size="sm" 
                disabled={addComment.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>
      )}
    </Card>
  );
};
