
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

interface RequestCardProps {
  request: any;
  type: 'incoming' | 'outgoing';
  onAccept?: () => void;
  onReject?: () => void;
}

const RequestCard = ({ request, type, onAccept, onReject }: RequestCardProps) => {
  const person = type === 'incoming' ? request.sender : request.receiver;
  const date = new Date(request.created_at);
  
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
            Request sent {format(date, 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      {type === 'incoming' && (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onReject}
            className="border-red-200 text-red-500 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button 
            size="sm"
            onClick={onAccept}
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
