
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  getCurrentUser, 
  getProfile, 
  updatePresenceStatus,
  createVideoRoom
} from "@/lib/supabase";
import { User, Profile } from "@/types";
import { toast } from "sonner";
import { Flag, Video, X } from "lucide-react";
import ReportForm from "@/components/moderation/ReportForm";

const Match = () => {
  const location = useLocation();
  const targetUserId = location.state?.targetUserId;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchCounter, setMatchCounter] = useState(0);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [inCall, setInCall] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

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
        
        // If we have a target user from Network page, simulate a direct call
        if (targetUserId && profileData) {
          const targetProfile = await getProfile(targetUserId);
          if (targetProfile) {
            await updatePresenceStatus(userData.id, 'in_call');
            setMatchedUser(targetProfile);
            setInCall(true);
            
            // Create a video room
            await createVideoRoom(userData.id, targetUserId);
          }
        }
      } catch (error) {
        console.error("Error fetching user or profile:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, [targetUserId]);

  // Simulate matching process
  useEffect(() => {
    let interval: number | null = null;
    
    if (isMatching) {
      interval = window.setInterval(() => {
        setMatchCounter(prev => {
          if (prev >= 100) {
            // Simulate finding a match
            handleMatchFound();
            return 0;
          }
          return prev + 5;
        });
      }, 200);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMatching]);
  
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

  const startMatching = async () => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return;
    }
    
    setIsMatching(true);
    setMatchCounter(0);
    toast.info("Looking for a match...");
    
    try {
      await updatePresenceStatus(user!.id, 'matching');
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const cancelMatching = async () => {
    setIsMatching(false);
    toast.info("Matching cancelled");
    
    try {
      await updatePresenceStatus(user!.id, 'online');
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  const handleMatchFound = async () => {
    setIsMatching(false);
    
    // Simulate getting a matched user (in a real implementation, this would come from the server)
    try {
      // In a real implementation, we'd get this from Supabase Realtime
      const fakeMatchedProfiles = [
        {
          id: "matched-1",
          user_id: "matched-user-1",
          full_name: "Alex Johnson",
          university: "Harvard University",
          major: "Computer Science",
          graduation_year: "2025",
          avatar_url: "https://i.pravatar.cc/300?img=11",
          gender: "Male"
        },
        {
          id: "matched-2",
          user_id: "matched-user-2",
          full_name: "Emma Davis",
          university: "Yale University",
          major: "Economics",
          graduation_year: "2024",
          avatar_url: "https://i.pravatar.cc/300?img=5",
          gender: "Female"
        },
        {
          id: "matched-3",
          user_id: "matched-user-3",
          full_name: "Michael Smith",
          university: "Princeton University",
          major: "Physics",
          graduation_year: "2026",
          avatar_url: "https://i.pravatar.cc/300?img=12",
          gender: "Male"
        }
      ];
      
      const randomMatch = fakeMatchedProfiles[Math.floor(Math.random() * fakeMatchedProfiles.length)];
      setMatchedUser(randomMatch as Profile);
      
      // Create a room in the database
      if (user) {
        await createVideoRoom(user.id, randomMatch.user_id);
        await updatePresenceStatus(user.id, 'in_call');
      }
      
      toast.success("Match found! Starting video call...");
      setInCall(true);
    } catch (error) {
      console.error("Error handling match:", error);
      toast.error("There was a problem connecting to your match");
    }
  };
  
  const endCall = async () => {
    setInCall(false);
    setMatchedUser(null);
    
    try {
      if (user) {
        await updatePresenceStatus(user.id, 'online');
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
    
    toast.info("Call ended");
  };
  
  const openReportForm = () => {
    if (!matchedUser) return;
    setIsReportOpen(true);
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
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-ivy">Video Chat</h1>
              <p className="text-muted-foreground mt-2">
                You're connected with {matchedUser?.full_name} from {matchedUser?.university}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Video placeholder - WebRTC integration would go here</p>
                    <p className="text-sm text-gray-400 mt-2">Connected with {matchedUser?.full_name}</p>
                  </div>
                  
                  {/* Small self-view */}
                  <div className="absolute bottom-4 right-4 w-32 aspect-video bg-gray-700 rounded-md overflow-hidden border-2 border-white flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-xs">You</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4 mt-6">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => setIsReportOpen(true)}
                  >
                    <Flag className="mr-2 h-5 w-5" />
                    Report
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={endCall}
                  >
                    <X className="mr-2 h-5 w-5" />
                    End Call
                  </Button>
                </div>
              </div>
              
              <div>
                <Card className="glass border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div>
                      <div className="relative aspect-square">
                        <img 
                          src={matchedUser?.avatar_url || '/placeholder.svg'} 
                          alt={matchedUser?.full_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-medium">{matchedUser?.full_name}</h3>
                        <p className="text-muted-foreground">{matchedUser?.university}</p>
                        <div className="mt-4 space-y-2">
                          <div>
                            <span className="text-sm font-medium">Major:</span>
                            <span className="text-sm text-muted-foreground ml-2">{matchedUser?.major}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Class of:</span>
                            <span className="text-sm text-muted-foreground ml-2">{matchedUser?.graduation_year}</span>
                          </div>
                        </div>
                        
                        <div className="mt-6 border-t pt-4">
                          <h4 className="text-sm font-medium mb-2">Conversation Starters:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• What classes are you taking this semester?</li>
                            <li>• Are you involved in any student organizations?</li>
                            <li>• What's your favorite spot on campus?</li>
                            <li>• Any exciting research or projects you're working on?</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-ivy">Match with Ivy League Students</h1>
              <p className="text-muted-foreground mt-2">
                Connect through video chat with students across Ivy League universities
              </p>
            </div>

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
                        : "Click the button below to join the queue and get matched with another Ivy League student for a video chat."}
                    </p>
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
                      <Button 
                        className="bg-ivy hover:bg-ivy-dark min-w-[150px]"
                        onClick={startMatching}
                      >
                        Start Matching
                      </Button>
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
    </MainLayout>
  );
};

export default Match;
