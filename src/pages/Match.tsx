import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  getCurrentUser, 
  getProfile, 
  updatePresenceStatus,
  createVideoRoom,
  getOnlineUsers,
  notifyUserOfMatch
} from "@/lib/supabase";
import { User, Profile, MatchFilters } from "@/types";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import ReportForm from "@/components/moderation/ReportForm";
import { OnlineUsers } from "@/components/network/OnlineUsers";
import { Share } from "@/components/network/Share";
import FilterOptions from "@/components/match/FilterOptions";
import VideoChat from "@/components/video/VideoChat";

const Match = () => {
  const location = useLocation();
  const targetUserId = location.state?.targetUserId;
  const roomId = location.state?.roomId;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchCounter, setMatchCounter] = useState(0);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [inCall, setInCall] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [noActiveUsers, setNoActiveUsers] = useState(false);
  const [filters, setFilters] = useState<MatchFilters>({});
  const [currentRoomId, setCurrentRoomId] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [previousMatches, setPreviousMatches] = useState<string[]>([]);

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
        
        // Update online status
        await updatePresenceStatus(userData.id, 'online');
        
        // If we have a target user from Network page, simulate a direct call
        if (targetUserId && profileData) {
          const targetProfile = await getProfile(targetUserId);
          if (targetProfile) {
            await updatePresenceStatus(userData.id, 'in_call');
            setMatchedUser(targetProfile);
            setInCall(true);
            
            // If no room ID provided, create a video room
            if (!roomId) {
              const room = await createVideoRoom(userData.id, targetUserId);
              setCurrentRoomId(room.id);
            } else {
              setCurrentRoomId(roomId);
            }
          }
        }
        
        // Fetch online users
        await fetchOnlineUsers(userData.id);
      } catch (error) {
        console.error("Error fetching user or profile:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
    
    // Setup periodic refresh of online users
    const refreshInterval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 15000); // Refresh every 15 seconds (more frequent refresh)
    
    // Update presence status to offline when component unmounts
    return () => {
      clearInterval(refreshInterval);
      if (user) {
        updatePresenceStatus(user.id, 'offline').catch(console.error);
      }
    };
  }, [location.state, targetUserId, roomId]);

  // Watch for filter changes and refresh users when they change
  useEffect(() => {
    if (user?.id) {
      fetchOnlineUsers(user.id);
    }
  }, [filters, user?.id, refreshTrigger]);

  const fetchOnlineUsers = async (currentUserId: string) => {
    try {
      setLoadingUsers(true);
      console.log("Fetching online users for userId:", currentUserId);
      const users = await getOnlineUsers(currentUserId, filters);
      console.log("Fetched online users:", users);
      setOnlineUsers(users);
      setNoActiveUsers(users.length === 0);
    } catch (error) {
      console.error("Error fetching online users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Simulate matching process
  useEffect(() => {
    let interval: number | null = null;
    
    if (isMatching) {
      interval = window.setInterval(() => {
        setMatchCounter(prev => {
          if (prev >= 100) {
            // Check if we have online users to match with
            if (onlineUsers.length === 0) {
              setIsMatching(false);
              toast.error("No active users found. Invite your friends to join!");
              setIsShareOpen(true);
              return 0;
            }
            
            // Simulate finding a match
            handleMatchFound();
            return 0;
          }
          return prev + 4; // Make progress faster
        });
      }, 150); // Speed up the animation a bit
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMatching, onlineUsers]);
  
  // Update presence status based on app state
  useEffect(() => {
    const updateStatus = async () => {
      if (!user) return;
      
      try {
        if (isMatching) {
          await updatePresenceStatus(user.id, 'matching');
        } else if (inCall) {
          await updatePresenceStatus(user.id, 'in_call');
        } else {
          await updatePresenceStatus(user.id, 'online');
        }
      } catch (error) {
        console.error("Error updating presence status:", error);
      }
    };
    
    updateStatus();
  }, [user, isMatching, inCall]);

  const handleFilterChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
  };

  const startMatching = async () => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return;
    }
    
    // Force a refresh of online users before starting the matching process
    if (user) {
      try {
        const latestUsers = await getOnlineUsers(user.id, filters);
        setOnlineUsers(latestUsers);
        
        if (latestUsers.length === 0) {
          toast.warning("No users are currently online. Invite your friends to join!");
          setIsShareOpen(true);
          return;
        }
        
        setIsMatching(true);
        setMatchCounter(0);
        toast.info("Looking for a match...");
        
        await updatePresenceStatus(user.id, 'matching');
      } catch (error) {
        console.error("Error starting matching:", error);
        toast.error("There was a problem connecting to the matching service");
      }
    }
  };

  const cancelMatching = async () => {
    setIsMatching(false);
    toast.info("Matching cancelled");
    
    try {
      if (user) {
        await updatePresenceStatus(user.id, 'online');
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  const handleMatchFound = async () => {
    setIsMatching(false);
    
    try {
      // Use one of the online users that match our filters
      if (onlineUsers.length > 0) {
        // Filter out users we've matched with recently
        const availableUsers = onlineUsers.filter(
          user => !previousMatches.includes(user.user_id)
        );
        
        // If no available users (all were previously matched), reset and use all online users
        const usersPool = availableUsers.length > 0 ? availableUsers : onlineUsers;
        
        // Random selection from available online users
        const matchUser = usersPool[Math.floor(Math.random() * usersPool.length)];
        setMatchedUser(matchUser);
        
        // Add to previous matches to prevent repeat matches
        setPreviousMatches(prev => {
          const updated = [...prev, matchUser.user_id];
          // Keep only the last 5 matches
          if (updated.length > 5) {
            return updated.slice(updated.length - 5);
          }
          return updated;
        });
        
        // Create a room in the database
        if (user) {
          const room = await createVideoRoom(user.id, matchUser.user_id);
          setCurrentRoomId(room.id);
          await updatePresenceStatus(user.id, 'in_call');
          
          // Send match notification to the matched user
          await notifyUserOfMatch(user.id, matchUser.user_id, room.id);
        }
        
        toast.success(`Match found! Starting video call with ${matchUser.full_name}...`);
        setInCall(true);
      } else {
        toast.error("No users matching your criteria found. Try changing your filters.");
        setNoActiveUsers(true);
      }
    } catch (error) {
      console.error("Error handling match:", error);
      toast.error("There was a problem connecting to your match");
    }
  };
  
  const endCall = async () => {
    setInCall(false);
    setMatchedUser(null);
    setCurrentRoomId("");
    
    try {
      if (user) {
        await updatePresenceStatus(user.id, 'online');
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
    
    toast.info("Call ended");
  };
  
  const skipMatch = async () => {
    // End the current call first
    setInCall(false);
    setMatchedUser(null);
    setCurrentRoomId("");
    
    // Start searching for a new match
    setIsMatching(true);
    setMatchCounter(0);
    
    try {
      if (user) {
        await updatePresenceStatus(user.id, 'matching');
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
    
    toast.info("Looking for a new match...");
  };
  
  const openReportForm = () => {
    if (!matchedUser) return;
    setIsReportOpen(true);
  };

  const refreshOnlineUsersList = () => {
    if (user) {
      fetchOnlineUsers(user.id);
    }
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
          <p className="mb-8 text-lg">You need to create a profile before you can match with other students.</p>
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
        {inCall ? (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-ivy">Video Chat</h1>
              <p className="text-muted-foreground mt-2">
                You're connected with {matchedUser?.full_name} from {matchedUser?.university}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="w-full">
                {/* Full width video chat component */}
                {user && matchedUser && currentRoomId && (
                  <VideoChat
                    roomId={currentRoomId}
                    localUserId={user.id}
                    remoteUserId={matchedUser.user_id}
                    remoteUserName={matchedUser.full_name}
                    isInitiator={user.id < matchedUser.user_id} 
                    onEndCall={endCall}
                    onSkipMatch={skipMatch}
                  />
                )}
                
                <div className="flex justify-center mt-6">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-red-200 text-red-500 hover:bg-red-50"
                    onClick={openReportForm}
                  >
                    <Flag className="mr-2 h-5 w-5" />
                    Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-ivy">Match with Ivy League Students</h1>
                <p className="text-muted-foreground mt-2">
                  Connect through video chat with students across Ivy League universities
                </p>
              </div>

              <FilterOptions 
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                currentFilters={filters}
              />

              <Card className="glass border-0 shadow-lg overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 mx-auto rounded-full bg-ivy/10 flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full bg-ivy/20 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-ivy/30 flex items-center justify-center">
                          {isMatching ? (
                            <div className="w-20 h-20 rounded-full bg-ivy flex items-center justify-center animate-pulse-slow">
                              <span className="text-white font-medium">{matchCounter}%</span>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-ivy flex items-center justify-center">
                              <span className="text-white font-medium">Ready</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-medium">
                        {isMatching ? "Finding a match..." : "Ready to Connect?"}
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {isMatching 
                          ? "We're looking for another student who's online right now. This won't take long."
                          : noActiveUsers
                            ? "No users are currently online. Invite your friends to join!"
                            : `Click the button below to join the queue and get matched with another Ivy League student for a video chat. ${onlineUsers.length} students online now!`}
                      </p>
                      
                      {/* Show filter summary if filters are applied */}
                      {Object.values(filters).some(f => f) && !isMatching && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-700">Currently filtering for:</p>
                          <div className="flex flex-wrap gap-1 mt-1 justify-center">
                            {filters.university && (
                              <Badge variant="outline" className="text-xs bg-green-50">
                                {filters.university}
                              </Badge>
                            )}
                            {filters.gender && (
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                {filters.gender}
                              </Badge>
                            )}
                            {filters.major && (
                              <Badge variant="outline" className="text-xs bg-purple-50">
                                {filters.major}
                              </Badge>
                            )}
                            {filters.graduationYear && (
                              <Badge variant="outline" className="text-xs bg-amber-50">
                                Class of {filters.graduationYear}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      {isMatching ? (
                        <Button 
                          variant="outline" 
                          onClick={cancelMatching} 
                          className="min-w-[150px]"
                        >
                          Cancel
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Button 
                            className="bg-ivy hover:bg-ivy-dark min-w-[150px]"
                            onClick={startMatching}
                            disabled={noActiveUsers}
                          >
                            Start Matching
                          </Button>
                          
                          {noActiveUsers && (
                            <div className="flex justify-center">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsShareOpen(true)} 
                                size="sm"
                              >
                                Invite Friends
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <h4 className="font-medium mb-4">Matching Guidelines</h4>
                      <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
                        <li className="flex items-start">
                          <div className="rounded-full bg-green-100 p-1 mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-ivy" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>Be respectful and courteous to your match</span>
                        </li>
                        <li className="flex items-start">
                          <div className="rounded-full bg-green-100 p-1 mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-ivy" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>No inappropriate content or behavior</span>
                        </li>
                        <li className="flex items-start">
                          <div className="rounded-full bg-green-100 p-1 mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-ivy" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>Use the 'Report' feature for any concerns</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <OnlineUsers 
                onlineUsers={onlineUsers}
                currentUserId={user?.id}
                refreshOnlineUsers={refreshOnlineUsersList}
                isLoading={loadingUsers}
              />
            </div>
          </div>
        )}
      </div>
      
      {user && matchedUser && (
        <ReportForm
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          reporterId={user.id}
          reportedUserId={matchedUser.user_id}
        />
      )}
      
      <Share isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </MainLayout>
  );
};

export default Match;
