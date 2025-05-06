import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { searchAllProfiles, sendFriendRequest, checkConnection, notifyUserOfFriendRequest } from "@/lib/supabase";
import { Profile } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserSearchProps {
  currentUserId: string;
  currentUserProfile: Profile | null;
}

const UserSearch: React.FC<UserSearchProps> = ({ currentUserId, currentUserProfile }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  
  // Fetch all profiles when component mounts
  useEffect(() => {
    if (currentUserId) {
      fetchProfiles();
    }
  }, [currentUserId]);
  
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const profiles = await searchAllProfiles(searchQuery, currentUserId);
      setSearchResults(profiles);
      
      // Check connections for all fetched profiles
      const connectionStatus: Record<string, boolean> = {};
      for (const profile of profiles) {
        connectionStatus[profile.user_id] = await checkConnection(currentUserId, profile.user_id);
      }
      setConnections(connectionStatus);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Failed to load user profiles");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfiles();
  };
  
  const handleSendRequest = async (userId: string, fullName: string) => {
    try {
      // Set pending state for this user
      setPendingRequests(prev => ({ ...prev, [userId]: true }));
      
      // Send the friend request
      await sendFriendRequest(currentUserId, userId);
      
      // Notify the other user
      await notifyUserOfFriendRequest(currentUserId, userId);
      
      toast.success(`Friend request sent to ${fullName}`);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
    } finally {
      // Keep the pending state to show the "Requested" button
    }
  };
  
  return (
    <Card className="glass border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Find People</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="Search by name, university, or major"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
        </form>
        
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-ivy border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((profile) => (
                <div key={profile.user_id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
                      <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{profile.university}</p>
                      <p className="text-xs text-muted-foreground">{profile.major}</p>
                    </div>
                  </div>
                  
                  {!connections[profile.user_id] ? (
                    pendingRequests[profile.user_id] ? (
                      <Button variant="outline" size="sm" disabled>
                        <Check className="h-4 w-4 mr-1" />
                        Requested
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="bg-ivy hover:bg-ivy-dark"
                        onClick={() => handleSendRequest(profile.user_id, profile.full_name)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Friend
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Connected
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserSearch;
