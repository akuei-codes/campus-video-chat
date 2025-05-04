
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { getCurrentUser, getProfile, signOut } from "@/lib/supabase";
import { User, Profile } from "@/types";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  LogOut,
  Shield,
  User as UserIcon,
  Video,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
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

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ivy">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account and preferences
            </p>
          </div>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-6 space-y-4">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Manage your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Email</h4>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">University</h4>
                      <p className="text-muted-foreground">{profile?.university || "Not set"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Account Created</h4>
                    <p className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = "/profile"}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="match-notifications">Match Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone wants to match with you
                      </p>
                    </div>
                    <Switch id="match-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="friend-notifications">Friend Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new friend requests
                      </p>
                    </div>
                    <Switch id="friend-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="message-notifications">Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages
                      </p>
                    </div>
                    <Switch id="message-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-notifications">App Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about IvyTV updates and new features
                      </p>
                    </div>
                    <Switch id="app-notifications" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button className="bg-ivy hover:bg-ivy-dark">
                    <Bell className="mr-2 h-4 w-4" />
                    Update Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your privacy and safety preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="profile-visibility">Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to other Ivy League students
                      </p>
                    </div>
                    <Switch id="profile-visibility" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow-matching">Matchmaking</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow other students to match with you for video calls
                      </p>
                    </div>
                    <Switch id="allow-matching" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-usage">Data Usage</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow IvyTV to use your data for improving the service
                      </p>
                    </div>
                    <Switch id="data-usage" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button className="bg-ivy hover:bg-ivy-dark">
                    <Shield className="mr-2 h-4 w-4" />
                    Save Privacy Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="video" className="mt-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Video Call Settings</CardTitle>
                  <CardDescription>
                    Configure your video call preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="hd-video">HD Video</Label>
                      <p className="text-sm text-muted-foreground">
                        Use high definition video in calls when available
                      </p>
                    </div>
                    <Switch id="hd-video" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="noise-reduction">Noise Reduction</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically reduce background noise during calls
                      </p>
                    </div>
                    <Switch id="noise-reduction" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-mute">Auto-Mute</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically mute microphone when joining calls
                      </p>
                    </div>
                    <Switch id="auto-mute" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="video-off">Video Off by Default</Label>
                      <p className="text-sm text-muted-foreground">
                        Start calls with your camera turned off
                      </p>
                    </div>
                    <Switch id="video-off" />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button className="bg-ivy hover:bg-ivy-dark">
                    <Video className="mr-2 h-4 w-4" />
                    Save Video Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
