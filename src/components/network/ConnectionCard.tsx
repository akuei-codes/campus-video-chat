
import { useState, useEffect } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface ConnectionCardProps {
  connection: Profile;
}

const ConnectionCard = ({ connection }: ConnectionCardProps) => {
  const [isOnline, setIsOnline] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  // Listen for real-time presence updates
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const { data } = await supabase
          .from('presence')
          .select('status')
          .eq('user_id', connection.user_id)
          .single();
        
        if (data) {
          setStatus(data.status);
          setIsOnline(data.status !== 'offline');
        }
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };

    fetchInitialStatus();

    // Set up real-time listener
    const channel = supabase
      .channel(`presence-${connection.user_id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'presence',
        filter: `user_id=eq.${connection.user_id}`
      }, (payload) => {
        const newStatus = payload.new.status;
        setStatus(newStatus);
        setIsOnline(newStatus !== 'offline');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connection.user_id]);

  // Get status indicator color
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'matching':
        return 'bg-amber-500';
      case 'in_call':
        return 'bg-red-500';
      case 'idle':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online Now';
      case 'matching':
        return 'Looking for Match';
      case 'in_call':
        return 'In a Call';
      case 'idle':
        return 'Idle';
      default:
        return 'Offline';
    }
  };

  const handleMessageClick = () => {
    navigate(`/messages/${connection.user_id}`, { 
      state: { 
        connectionProfile: connection 
      }
    });
  };
  
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
              <div className="absolute top-2 right-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`h-3 w-3 rounded-full ${getStatusColor()} border-2 border-white`}></div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getStatusText()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleMessageClick}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Link 
                to="/match" 
                state={{ targetUserId: connection.user_id }}
                className={!isOnline ? 'cursor-not-allowed opacity-70' : ''}
                onClick={(e) => !isOnline && e.preventDefault()}
              >
                <Button size="sm" className="bg-ivy hover:bg-ivy-dark" disabled={!isOnline}>
                  <Video className="h-4 w-4 mr-1" />
                  {isOnline ? 'Call' : 'Offline'}
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
