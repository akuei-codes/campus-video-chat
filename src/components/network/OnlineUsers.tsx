
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserRoundPlus, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Share } from "@/components/network/Share";
import { Profile } from "@/types";
import { createVideoRoom, updatePresenceStatus } from "@/lib/supabase";

interface OnlineUsersProps {
  onlineUsers: Profile[];
  currentUserId?: string;
  refreshOnlineUsers: () => void;
  isLoading: boolean;
}

export const OnlineUsers = ({ onlineUsers, currentUserId, refreshOnlineUsers, isLoading }: OnlineUsersProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const navigate = useNavigate();
  
  const inviteToCall = async (targetUser: Profile) => {
    if (!currentUserId) return;
    
    try {
      toast.loading(`Inviting ${targetUser.full_name} to a video call...`);
      
      // Create a video room between the users
      const room = await createVideoRoom(currentUserId, targetUser.user_id);
      
      // Update current user's status to in_call
      await updatePresenceStatus(currentUserId, 'in_call');
      
      // Redirect to the match page with the target user id
      toast.dismiss();
      toast.success(`Invited ${targetUser.full_name} to a video call!`);
      
      navigate('/match', { state: { targetUserId: targetUser.user_id, roomId: room.id } });
    } catch (error) {
      console.error('Error inviting user to call:', error);
      toast.error('Failed to invite user to call');
    }
  };
  
  return (
    <Card className="glass border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>Online Users</CardTitle>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {onlineUsers.length}
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={refreshOnlineUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {onlineUsers.length > 0 ? (
          <div className="space-y-4">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.university}</p>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-ivy text-ivy hover:bg-ivy/10"
                        onClick={() => inviteToCall(user)}
                      >
                        <UserRoundPlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Invite to video call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Users className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No users online</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Invite your Ivy League friends to join!
            </p>
            <Button onClick={() => setIsShareOpen(true)}>
              <UserRoundPlus className="h-4 w-4 mr-2" />
              Invite Friends
            </Button>
          </div>
        )}
      </CardContent>
      
      <Share isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </Card>
  );
};
