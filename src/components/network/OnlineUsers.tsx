
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
import { Profile, MatchFilters } from "@/types";
import { createVideoRoom, updatePresenceStatus, getOnlineUsers } from "@/lib/supabase";

interface OnlineUsersProps {
  currentUserId?: string;
  filters?: MatchFilters;
  refreshOnlineUsers?: () => void;
  isLoading?: boolean;
  onlineUsers?: Profile[];
}

export const OnlineUsers = ({ 
  currentUserId, 
  filters = {}, 
  refreshOnlineUsers,
  isLoading = false,
  onlineUsers: providedOnlineUsers
}: OnlineUsersProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If onlineUsers are provided as props, use them
    if (providedOnlineUsers) {
      console.log("OnlineUsers component received users:", providedOnlineUsers);
      setOnlineUsers(providedOnlineUsers);
      return;
    }

    // Otherwise fetch them if we have a currentUserId
    if (currentUserId) {
      fetchOnlineUsers();
    }
  }, [currentUserId, filters, providedOnlineUsers]);

  const fetchOnlineUsers = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      console.log("OnlineUsers component fetching users for:", currentUserId);
      const users = await getOnlineUsers(currentUserId, filters);
      console.log("OnlineUsers component fetched users:", users);
      setOnlineUsers(users);
    } catch (error) {
      console.error('Error fetching online users:', error);
    } finally {
      setLoading(false);
    }
  };
  
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

  const handleRefresh = () => {
    if (refreshOnlineUsers) {
      refreshOnlineUsers();
    } else {
      fetchOnlineUsers();
    }
  };
  
  return (
    <Card className="glass border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>Online Users</CardTitle>
            <Badge variant="outline" className={`${onlineUsers.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {onlineUsers.length}
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRefresh}
            disabled={isLoading || loading}
          >
            <RefreshCw className={`h-4 w-4 ${(isLoading || loading) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || loading ? (
          <div className="py-4 text-center">
            <div className="animate-pulse text-sm text-muted-foreground">Loading online users...</div>
          </div>
        ) : onlineUsers.length > 0 ? (
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
