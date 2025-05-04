import { useState, useEffect } from "react";
import { useParams, useLocation, Navigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { getCurrentUser, getProfile, getConnections } from "@/lib/supabase";
import { Profile } from "@/types";
import MessagesList from "@/components/messages/MessagesList";
import MessageInput from "@/components/messages/MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const Messages = () => {
  const { connectionId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // If we have connection info from the state (from navigation)
  const connectionFromState = location.state?.connectionProfile;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        if (!userData) return;
        
        setUser(userData);
        
        const profileData = await getProfile(userData.id);
        if (!profileData) return;
        
        setProfile(profileData);
        
        // Load connections
        const connectionsData = await getConnections(profileData.id);
        setConnections(connectionsData);
        
        // Set selected connection
        if (connectionId) {
          // If we have state, use it
          if (connectionFromState) {
            setSelectedConnection(connectionFromState);
          } else {
            // Otherwise find the connection in our connections list
            const foundConnection = connectionsData.find(c => c.user_id === connectionId);
            if (foundConnection) {
              setSelectedConnection(foundConnection);
            } else {
              toast.error("Connection not found");
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [connectionId, connectionFromState]);

  // Handle selecting a connection
  const handleSelectConnection = (connection: Profile) => {
    setSelectedConnection(connection);
  };

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
          <p className="mb-8 text-lg">You need to create a profile before you can message others.</p>
          <Button asChild className="bg-ivy hover:bg-ivy-dark">
            <Link to="/profile">Create Profile</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/network" className="flex items-center text-ivy hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Network
          </Link>
          <h1 className="text-3xl font-bold text-ivy">Messages</h1>
          <p className="text-muted-foreground mt-2">
            Chat with your Ivy League connections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Connections sidebar */}
          <Card className="md:col-span-1 glass border-0 shadow-lg h-[600px] overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2" />
                Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                {connections.length > 0 ? (
                  <div className="space-y-1 px-4">
                    {connections.map((connection) => (
                      <Button
                        key={connection.id}
                        variant="ghost"
                        className={`w-full justify-start py-6 ${
                          selectedConnection?.id === connection.id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => handleSelectConnection(connection)}
                      >
                        <div className="flex items-center w-full">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={connection.avatar_url || ''} alt={connection.full_name} />
                            <AvatarFallback>{connection.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-left overflow-hidden">
                            <p className="font-medium truncate">{connection.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {connection.university}
                            </p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-muted-foreground">No connections yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      asChild
                    >
                      <Link to="/network">Find connections</Link>
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat area */}
          <Card className="md:col-span-3 glass border-0 shadow-lg h-[600px] overflow-hidden flex flex-col">
            {selectedConnection ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={selectedConnection.avatar_url || ''} alt={selectedConnection.full_name} />
                      <AvatarFallback>{selectedConnection.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedConnection.full_name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {selectedConnection.university} • {selectedConnection.major}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <div className="flex-1 overflow-hidden flex flex-col">
                  <MessagesList 
                    otherUserId={selectedConnection.user_id} 
                    otherProfile={selectedConnection}
                  />
                  
                  <MessageInput 
                    currentUserId={user.id} 
                    receiverId={selectedConnection.user_id} 
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-4">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a connection</h3>
                  <p className="text-muted-foreground">
                    Choose a connection from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
