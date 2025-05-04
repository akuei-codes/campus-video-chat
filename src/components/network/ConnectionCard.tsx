
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Profile } from "@/types";
import { MessageSquare, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ConnectionCardProps {
  connection: Profile;
}

const ConnectionCard = ({ connection }: ConnectionCardProps) => {
  // Add a status dot indicator that would normally come from the presence system
  const isOnline = Math.random() > 0.5; // Just for UI demo purposes
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-0">
        <div className="flex">
          <div className="w-1/3">
            <div className="aspect-square relative">
              <img 
                src={connection.avatar_url || '/placeholder.svg'} 
                alt={connection.full_name} 
                className="object-cover w-full h-full"
              />
              {isOnline && (
                <div className="absolute top-2 right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Online Now</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
          <div className="w-2/3 p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-lg truncate">{connection.full_name}</h3>
              {connection.gender && (
                <Badge variant="outline" className="text-xs">
                  {connection.gender}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{connection.university}</p>
            <p className="text-xs text-muted-foreground mb-4">
              {connection.major}, {connection.graduation_year}
            </p>
            
            <div className="flex gap-2 mt-auto">
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Link to="/match" state={{ targetUserId: connection.user_id }}>
                <Button size="sm" className="bg-ivy hover:bg-ivy-dark">
                  <Video className="h-4 w-4 mr-1" />
                  Call
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;
