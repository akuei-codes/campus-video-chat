
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface RequestCardProps {
  request: any;
  type: 'incoming' | 'outgoing';
  onAccept?: () => Promise<void>;
  onReject?: () => Promise<void>;
}

const RequestCard = ({ request, type, onAccept, onReject }: RequestCardProps) => {
  const person = type === 'incoming' ? request.sender : request.receiver;
  const date = new Date(request.created_at);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handleAccept = async () => {
    if (!onAccept) return;
    
    try {
      setIsProcessing(true);
      await onAccept();
      toast.success(`You are now connected with ${person.full_name}`);
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept friend request");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    if (!onReject) return;
    
    try {
      setIsProcessing(true);
      await onReject();
      toast.success(`Friend request rejected`);
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject friend request");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={person.avatar_url || ''} alt={person.full_name} />
          <AvatarFallback>{person.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{person.full_name}</h4>
          <p className="text-sm text-muted-foreground">{person.university}</p>
          <p className="text-xs text-muted-foreground">
            {type === 'incoming' ? 'Request received' : 'Request sent'} {format(date, 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      {type === 'incoming' && (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleReject}
            disabled={isProcessing}
            className="border-red-200 text-red-500 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button 
            size="sm"
            onClick={handleAccept}
            disabled={isProcessing}
            className="bg-ivy hover:bg-ivy-dark"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {type === 'outgoing' && (
        <div>
          <span className="text-sm text-muted-foreground">Pending</span>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
