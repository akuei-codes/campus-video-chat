
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Bell, Shield, UserRound, Lock, LogOut } from 'lucide-react';
import { getCurrentUser, signOut, getProfile } from '@/lib/supabase';
import { User, Profile } from '@/types';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        
        if (!userData) {
          navigate('/login');
          return;
        }
        
        setUser(userData);
        const profileData = await getProfile(userData.id);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching user or profile:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
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
          <h1 className="text-3xl font-bold mb-6 text-ivy">Account Settings</h1>
          
          <div className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-ivy" />
                  <CardTitle>Account Information</CardTitle>
                </div>
                <CardDescription>
                  Manage your account details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                    <p id="email" className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-muted-foreground">Name</Label>
                    <p id="name" className="font-medium">{profile?.full_name || user.user_metadata?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <Label htmlFor="university" className="text-muted-foreground">University</Label>
                    <p id="university" className="font-medium">{profile?.university || 'Not set'}</p>
                  </div>
                  <div>
                    <Label htmlFor="member-since" className="text-muted-foreground">Member Since</Label>
                    <p id="member-since" className="font-medium">
                      {profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" onClick={() => navigate('/profile')} className="w-full sm:w-auto">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-ivy" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                    </div>
                    <Switch 
                      id="push-notifications" 
                      checked={pushNotifications} 
                      onCheckedChange={setPushNotifications} 
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">NOTIFICATION TYPES</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="match-notifications" className="font-medium">New Matches</Label>
                    <Switch 
                      id="match-notifications" 
                      checked={matchNotifications} 
                      onCheckedChange={setMatchNotifications} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message-notifications" className="font-medium">New Messages</Label>
                    <Switch 
                      id="message-notifications" 
                      checked={messageNotifications} 
                      onCheckedChange={setMessageNotifications} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-ivy hover:bg-ivy/90">Save Preferences</Button>
              </CardFooter>
            </Card>
            
            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-ivy" />
                  <CardTitle>Privacy & Security</CardTitle>
                </div>
                <CardDescription>
                  Manage your account privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-visibility" className="font-medium">Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                    </div>
                    <Switch id="profile-visibility" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor" className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                </div>
                
                <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Account Deletion</AlertTitle>
                  <AlertDescription>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </AlertDescription>
                  <div className="mt-4">
                    <Button variant="destructive" size="sm">Delete Account</Button>
                  </div>
                </Alert>
              </CardContent>
            </Card>
            
            {/* Sign Out */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-ivy" />
                  <CardTitle>Session</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
