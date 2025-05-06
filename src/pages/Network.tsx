
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { 
  getCurrentUser, 
  getProfile, 
  getConnections, 
  getIncomingFriendRequests,
  getSentFriendRequests, 
  respondToFriendRequest,
  searchProfiles,
  sendFriendRequest,
  notifyUserOfFriendRequest,
  getUserNotifications,
  markNotificationAsRead
} from "@/lib/supabase";
import { User, Profile } from "@/types";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Bell } from "lucide-react";
import ConnectionCard from "@/components/network/ConnectionCard";
import RequestCard from "@/components/network/RequestCard";

const Network = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnreadRequests, setHasUnreadRequests] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        
        if (!userData) {
          return;
        }
        
        setUser(userData);
        const profileData = await getProfile(userData.id);
        setProfile(profileData);
        
        if (profileData) {
          // Load connections and friend requests
          const connectionsData = await getConnections(profileData.id);
          setConnections(connectionsData);
          
          const incomingData = await getIncomingFriendRequests(profileData.id);
          setIncomingRequests(incomingData);
          setHasUnreadRequests(incomingData.length > 0);
          
          const sentData = await getSentFriendRequests(profileData.id);
          setSentRequests(sentData);
          
          // Load notifications
          const notificationsData = await getUserNotifications(userData.id);
          setNotifications(notificationsData);
        }
        
        // Pre-fetch all users for the Find People tab
        handleSearch();
      } catch (error) {
        console.error("Error fetching network data:", error);
        toast.error("Failed to load network data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
    
    // Set up periodic refresh of notifications
    const notificationInterval = setInterval(() => {
      if (user?.id) {
        checkForNewNotifications(user.id);
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(notificationInterval);
    };
  }, [user?.id]);

  const checkForNewNotifications = async (userId: string) => {
    try {
      const notificationsData = await getUserNotifications(userId);
      setNotifications(notificationsData);
      
      const incomingData = await getIncomingFriendRequests(profile?.id || "");
      setIncomingRequests(incomingData);
      setHasUnreadRequests(incomingData.length > 0);
    } catch (error) {
      console.error("Error checking for notifications:", error);
    }
  };

  const handleSearch = async () => {
    if (!profile) return;
    
    try {
      setSearching(true);
      
      // Get IDs to exclude from search (current user and connections)
      const excludeIds = [
        profile.id,
        ...connections.map(conn => conn.id),
        ...sentRequests.map(req => req.receiver.id),
        ...incomingRequests.map(req => req.sender.id)
      ];
      
      const results = await searchProfiles(searchQuery, excludeIds);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching profiles:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    if (!profile) return;
    
    try {
      await sendFriendRequest(profile.id, receiverId);
      
      // Notify the receiver
      await notifyUserOfFriendRequest(profile.id, receiverId);
      
      // Update search results to remove this person
      setSearchResults(prev => prev.filter(result => result.id !== receiverId));
      
      // Refresh sent requests
      const updatedSentRequests = await getSentFriendRequests(profile.id);
      setSentRequests(updatedSentRequests);
      
      toast.success("Friend request sent successfully");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    if (!profile) return;
    
    try {
      await respondToFriendRequest(requestId, 'accepted');
      
      // Remove request from incoming list
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Refresh connections
      const updatedConnections = await getConnections(profile.id);
      setConnections(updatedConnections);
      
      // Mark related notifications as read
      const friendRequestNotification = notifications.find(
        n => n.type === 'friend_request' && n.sender_id === senderId
      );
      
      if (friendRequestNotification) {
        await markNotificationAsRead(friendRequestNotification.id);
      }
      
      toast.success("Friend request accepted");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  const handleRejectRequest = async (requestId: string, senderId: string) => {
    try {
      await respondToFriendRequest(requestId, 'rejected');
      
      // Remove request from incoming list
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Mark related notifications as read
      const friendRequestNotification = notifications.find(
        n => n.type === 'friend_request' && n.sender_id === senderId
      );
      
      if (friendRequestNotification) {
        await markNotificationAsRead(friendRequestNotification.id);
      }
      
      toast.success("Friend request rejected");
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject friend request");
    }
  };

  // Fix: Use refs to access tab elements instead of querySelector
  const goToFindTab = () => {
    const findTabTrigger = document.getElementById("find-tab-trigger");
    if (findTabTrigger) {
      (findTabTrigger as HTMLButtonElement).click();
    }
  };

  // Loading and unauthorized states
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-ivy">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
          <p className="mb-8 text-lg">You need to create a profile before you can view your network.</p>
          <Button asChild className="bg-ivy hover:bg-ivy-dark">
            <a href="/profile">Create Profile</a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ivy">My Network</h1>
              <p className="text-muted-foreground mt-2">
                Manage your Ivy League connections
              </p>
            </div>
            
            {/* Notifications indicator */}
            {hasUnreadRequests && (
              <div className="relative">
                <Bell className="h-6 w-6 text-ivy" />
                <Badge className="absolute -top-2 -right-2 bg-red-500">
                  {incomingRequests.length}
                </Badge>
              </div>
            )}
          </div>

          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                Requests
                {hasUnreadRequests && (
                  <Badge className="ml-2 bg-red-500">{incomingRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger id="find-tab-trigger" value="find">Find People</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connections" className="mt-6">
              {connections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((connection) => (
                    <ConnectionCard 
                      key={connection.id} 
                      connection={connection} 
                    />
                  ))}
                </div>
              ) : (
                <Card className="glass border-0 shadow-lg">
                  <CardContent className="pt-6 text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No Connections Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your Ivy League network by finding people to connect with
                    </p>
                    <Button 
                      variant="default" 
                      className="bg-ivy hover:bg-ivy-dark"
                      onClick={goToFindTab}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Find People
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="mt-6">
              <div className="space-y-6">
                {incomingRequests.length > 0 && (
                  <Card className="glass border-0 shadow-lg overflow-hidden">
                    <CardHeader>
                      <CardTitle>Incoming Requests</CardTitle>
                      <CardDescription>
                        People who want to connect with you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {incomingRequests.map((request) => (
                          <RequestCard 
                            key={request.id} 
                            request={request} 
                            type="incoming"
                            onAccept={() => handleAcceptRequest(request.id, request.sender.id)}
                            onReject={() => handleRejectRequest(request.id, request.sender.id)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {sentRequests.length > 0 && (
                  <Card className="glass border-0 shadow-lg overflow-hidden">
                    <CardHeader>
                      <CardTitle>Sent Requests</CardTitle>
                      <CardDescription>
                        Pending requests you've sent to others
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sentRequests.map((request) => (
                          <RequestCard 
                            key={request.id} 
                            request={request} 
                            type="outgoing"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {incomingRequests.length === 0 && sentRequests.length === 0 && (
                  <Card className="glass border-0 shadow-lg">
                    <CardContent className="pt-6 text-center py-12">
                      <h3 className="text-xl font-medium mb-2">No Pending Requests</h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have any incoming or outgoing friend requests at the moment
                      </p>
                      <Button 
                        variant="default" 
                        className="bg-ivy hover:bg-ivy-dark"
                        onClick={goToFindTab}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Find People
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="find" className="mt-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Find People</CardTitle>
                  <CardDescription>
                    Search for other Ivy League students to connect with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-6">
                    <Input 
                      type="text" 
                      placeholder="Search by name or university..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSearch} 
                      disabled={searching}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                  
                  {searching ? (
                    <div className="py-10 text-center">
                      <div className="animate-pulse text-ivy">Searching...</div>
                    </div>
                  ) : (
                    <div>
                      {searchResults.length > 0 ? (
                        <div className="space-y-4">
                          {searchResults.map((result) => (
                            <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={result.avatar_url || ''} alt={result.full_name} />
                                  <AvatarFallback>{result.full_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{result.full_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {result.university} • {result.major}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => handleSendRequest(result.id)}
                                className="bg-ivy hover:bg-ivy-dark"
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Connect
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center">
                          <p className="text-muted-foreground">No results found. Try a different search term or check back later.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Network;
