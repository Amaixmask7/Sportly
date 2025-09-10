import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useInvitationChat, useAddChat } from '@/hooks/useInvitationChat';
import { MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface InvitationChatProps {
  invitationId: string;
}

interface ChatFormData {
  content: string;
}

export const InvitationChat = ({ invitationId }: InvitationChatProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: Chat = [], isLoading } = useInvitationChat(invitationId, true);
  const addChat = useAddChat();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChatFormData>();

  const onSubmit = async (data: ChatFormData) => {
    if (!user || !data.content.trim()) return;
    
    addChat.mutate({
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
          Chat ({Chat.length})
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Chat List */}
          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Memuat Chat...</p>
              </div>
            ) : Chat.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Belum ada Chat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Chat.map((ChatItem) => (
                  <div key={ChatItem.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ChatItem.Customer?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {ChatItem.Customer?.display_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {ChatItem.Customer?.display_name || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(ChatItem.created_at), 'dd MMM HH:mm', { locale: id })}
                        </span>
                      </div>
                      <p className="text-sm">{ChatItem.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Add Chat Form */}
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
                  placeholder="Tulis Chat..."
                  {...register('content', { required: 'Chat tidak boleh kosong' })}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                size="sm" 
                disabled={addChat.isPending}
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
