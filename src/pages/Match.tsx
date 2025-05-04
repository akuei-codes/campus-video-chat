
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, getProfile } from "@/lib/supabase";
import { User, Profile } from "@/types";
import { toast } from "sonner";

const Match = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchCounter, setMatchCounter] = useState(0);

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
      } catch (error) {
        console.error("Error fetching user or profile:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, []);

  // Simulate matching process
  useEffect(() => {
    let interval: number | null = null;
    
    if (isMatching) {
      interval = window.setInterval(() => {
        setMatchCounter(prev => {
          if (prev >= 100) {
            setIsMatching(false);
            toast.success("Match found! This is a placeholder until video chat is implemented.");
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

  const startMatching = () => {
    if (!profile) {
      toast.error("Please complete your profile first");
      return;
    }
    setIsMatching(true);
    setMatchCounter(0);
    toast.info("Looking for a match...");
  };

  const cancelMatching = () => {
    setIsMatching(false);
    toast.info("Matching cancelled");
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
      </div>
    </MainLayout>
  );
};

export default Match;
