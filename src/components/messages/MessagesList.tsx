
import { useState, useEffect, useRef } from "react";
import { Message, Profile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { getCurrentUser, getMessages, markMessagesAsRead } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

interface MessagesListProps {
  otherUserId: string;
  otherProfile: Profile;
  onNewMessage?: () => void;
}

const MessagesList = ({ otherUserId, otherProfile, onNewMessage }: MessagesListProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages and set up real-time listener
  useEffect(() => {
    const fetchMessagesAndUser = async () => {
      try {
        setLoading(true);
        const currentUserData = await getCurrentUser();
        if (!currentUserData) return;
        
        setCurrentUserId(currentUserData.id);
        
        // Mark messages as read
        await markMessagesAsRead(currentUserData.id, otherUserId);
        
        // Fetch messages
        const messagesData = await getMessages(currentUserData.id, otherUserId);
        setMessages(messagesData);
        
        if (onNewMessage) onNewMessage();
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessagesAndUser();
    
    // Set up real-time listener for new messages
    const channel = supabase
      .channel(`messages-${otherUserId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}))`
      }, async (payload) => {
        // Handle new message
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message;
          
          // Add to messages
          setMessages(prev => [...prev, newMessage]);
          
          // If the message is from the other user, mark it as read
          if (newMessage.sender_id === otherUserId && currentUserId) {
            await markMessagesAsRead(currentUserId, otherUserId);
          }
          
          if (onNewMessage) onNewMessage();
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUserId, currentUserId, onNewMessage]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-pulse text-ivy">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId;
          return (
            <div 
              key={message.id} 
              className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherProfile.avatar_url || ''} alt={otherProfile.full_name} />
                  <AvatarFallback>{otherProfile.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div 
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  isCurrentUser 
                    ? 'bg-ivy text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-gray-200' : 'text-gray-500'}`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
