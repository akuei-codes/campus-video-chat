
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/lib/supabase";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface MessageInputProps {
  currentUserId: string;
  receiverId: string;
}

const MessageInput = ({ currentUserId, receiverId }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setSending(true);
      await sendMessage(currentUserId, receiverId, message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        className="resize-none flex-1"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      <Button 
        onClick={handleSendMessage} 
        disabled={!message.trim() || sending}
        className="bg-ivy hover:bg-ivy-dark"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageInput;
