import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetOrCreateConversation } from '../hooks/useChatQueries';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageButton({ userId, className = "" }) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const createConversation = useGetOrCreateConversation();

  const handleMessageClick = async () => {
    setIsCreating(true);
    try {
      const conversation = await createConversation.mutateAsync(userId);
      // Navigate to chat page with this conversation
      navigate({ to: '/chat', search: { conversation: conversation.id } });
    } catch (error) {
      toast.error('Failed to start conversation');
      console.error('Error creating conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleMessageClick}
      disabled={isCreating}
      variant="outline"
      className={className}
    >
      {isCreating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <MessageCircle className="mr-2 h-4 w-4" />
          Message
        </>
      )}
    </Button>
  );
}
