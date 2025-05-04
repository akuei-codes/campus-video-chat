
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { getCurrentUser, signOut } from "@/lib/supabase";
import { User } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { 
  Bell, 
  User as UserIcon,
  Shield, 
  Eye, 
  Moon, 
  Laptop, 
  Sun, 
  LogOut,
  Trash2,
  Fingerprint,
  Languages,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<string>("system");
  const [language, setLanguage] = useState<string>("english");
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    matchAlerts: true,
    messageAlerts: true,
    connectionRequests: true,
    weeklyDigest: false,
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "everyone",
    onlineStatus: true,
    allowDirectMessages: true,
    dataSharing: false,
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Failed to sign out");
    }
  };
  
  const handleDeleteAccount = () => {
    toast.warning("This feature is coming soon. Please contact support to delete your account.");
  };
  
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success(`${key} setting updated!`);
  };
  
  const handlePrivacyChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success(`${key} setting updated!`);
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
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-ivy">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences.
            </p>
          </div>

          <Tabs defaultValue="account" className="animate-fade-in">
            <div className="flex overflow-x-auto mb-6 pb-2 no-scrollbar">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Account</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Appearance</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Account Tab */}
            <TabsContent value="account">
              <div className="grid gap-6">
                <Card className="glass shadow-lg border-0">
                  <CardHeader className="bg-ivy/5 rounded-t-lg">
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Manage your personal information and account details.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                      <div className="h-16 w-16 rounded-full bg-ivy/20 flex items-center justify-center text-ivy font-bold text-2xl uppercase">
                        {user.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-lg">{user.email}</p>
                        <p className="text-muted-foreground text-sm">Ivy League Connect Member</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">User ID</Label>
                        <div className="flex items-center mt-1 gap-2">
                          <code className="bg-muted px-3 py-1 rounded text-sm flex-1 overflow-hidden overflow-ellipsis">
                            {user.id}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              navigator.clipboard.writeText(user.id);
                              toast.success("User ID copied to clipboard");
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Account Created</Label>
                        <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="outline" onClick={() => navigate('/profile')} className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                    <Button 
                      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 flex items-center gap-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="glass shadow-lg border-0">
                  <CardHeader className="bg-red-500/5 rounded-t-lg">
                    <CardTitle className="text-red-500">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions that affect your account.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Alert className="bg-red-500/10 border-red-200">
                      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="font-medium mb-1">Delete Your Account</p>
                          <p className="text-sm text-muted-foreground">
                            This will permanently delete your account and all your data. This action cannot be undone.
                          </p>
                        </div>
                        <Button 
                          variant="destructive" 
                          className="sm:self-start flex items-center gap-2"
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="glass shadow-lg border-0">
                <CardHeader className="bg-ivy/5 rounded-t-lg">
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Control how and when you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                        </div>
                        <Switch 
                          id="push-notifications" 
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch 
                          id="email-notifications" 
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                        />
                      </div>
                      
                      <Separator />

                      <h3 className="text-lg font-medium pt-4">Notification Types</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="match-alerts">New Match Alerts</Label>
                            <p className="text-sm text-muted-foreground">When you get matched with someone</p>
                          </div>
                          <Switch 
                            id="match-alerts" 
                            checked={notificationSettings.matchAlerts}
                            onCheckedChange={(checked) => handleNotificationChange('matchAlerts', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="message-alerts">Message Alerts</Label>
                            <p className="text-sm text-muted-foreground">When you receive a new message</p>
                          </div>
                          <Switch 
                            id="message-alerts" 
                            checked={notificationSettings.messageAlerts}
                            onCheckedChange={(checked) => handleNotificationChange('messageAlerts', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="connection-requests">Connection Requests</Label>
                            <p className="text-sm text-muted-foreground">When someone wants to connect with you</p>
                          </div>
                          <Switch 
                            id="connection-requests" 
                            checked={notificationSettings.connectionRequests}
                            onCheckedChange={(checked) => handleNotificationChange('connectionRequests', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="weekly-digest">Weekly Digest</Label>
                            <p className="text-sm text-muted-foreground">Receive a summary of your activity each week</p>
                          </div>
                          <Switch 
                            id="weekly-digest" 
                            checked={notificationSettings.weeklyDigest}
                            onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20">
                  <p className="text-xs text-muted-foreground">
                    You can change these settings at any time. We'll never send you marketing emails unless you opt-in.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card className="glass shadow-lg border-0">
                <CardHeader className="bg-ivy/5 rounded-t-lg">
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control your profile visibility and data preferences.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Profile Visibility</Label>
                        <ToggleGroup 
                          type="single" 
                          value={privacySettings.profileVisibility}
                          onValueChange={(value) => {
                            if (value) handlePrivacyChange('profileVisibility', value);
                          }}
                          className="flex flex-wrap justify-start"
                        >
                          <ToggleGroupItem value="everyone" aria-label="Toggle everyone">
                            Everyone
                          </ToggleGroupItem>
                          <ToggleGroupItem value="connections" aria-label="Toggle connections">
                            Connections Only
                          </ToggleGroupItem>
                          <ToggleGroupItem value="private" aria-label="Toggle private">
                            Private
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="online-status">Show Online Status</Label>
                          <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                        </div>
                        <Switch 
                          id="online-status" 
                          checked={privacySettings.onlineStatus}
                          onCheckedChange={(checked) => handlePrivacyChange('onlineStatus', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="direct-messages">Allow Direct Messages</Label>
                          <p className="text-sm text-muted-foreground">Let people message you directly</p>
                        </div>
                        <Switch 
                          id="direct-messages" 
                          checked={privacySettings.allowDirectMessages}
                          onCheckedChange={(checked) => handlePrivacyChange('allowDirectMessages', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="data-sharing">Data Sharing for Service Improvement</Label>
                          <p className="text-sm text-muted-foreground">Allow anonymous usage data to improve services</p>
                        </div>
                        <Switch 
                          id="data-sharing" 
                          checked={privacySettings.dataSharing}
                          onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-4 flex-col sm:flex-row items-start">
                  <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                    <Fingerprint className="h-4 w-4" />
                    Export My Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your privacy is important to us. Review our <a href="/privacy-policy" className="text-ivy hover:underline">Privacy Policy</a>.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card className="glass shadow-lg border-0">
                <CardHeader className="bg-ivy/5 rounded-t-lg">
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the application's look and feel.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Theme Preference</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={theme === "light" ? "default" : "outline"} 
                          className={`flex flex-col items-center justify-center h-24 ${theme === "light" ? "border-2 border-ivy" : ""}`}
                          onClick={() => {
                            setTheme("light");
                            toast.success("Light theme selected");
                          }}
                        >
                          <Sun className="h-10 w-10 mb-2" />
                          <span>Light</span>
                        </Button>
                        <Button 
                          variant={theme === "dark" ? "default" : "outline"} 
                          className={`flex flex-col items-center justify-center h-24 ${theme === "dark" ? "border-2 border-ivy" : ""}`}
                          onClick={() => {
                            setTheme("dark");
                            toast.success("Dark theme selected");
                          }}
                        >
                          <Moon className="h-10 w-10 mb-2" />
                          <span>Dark</span>
                        </Button>
                        <Button 
                          variant={theme === "system" ? "default" : "outline"} 
                          className={`flex flex-col items-center justify-center h-24 ${theme === "system" ? "border-2 border-ivy" : ""}`}
                          onClick={() => {
                            setTheme("system");
                            toast.success("System theme selected");
                          }}
                        >
                          <Laptop className="h-10 w-10 mb-2" />
                          <span>System</span>
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Language</Label>
                      <ToggleGroup
                        type="single"
                        value={language}
                        onValueChange={(value) => {
                          if (value) {
                            setLanguage(value);
                            toast.success(`Language set to ${value}`);
                          }
                        }}
                        className="flex flex-wrap justify-start gap-2"
                      >
                        <ToggleGroupItem value="english" aria-label="Set language to English" className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          English
                        </ToggleGroupItem>
                        <ToggleGroupItem value="spanish" aria-label="Set language to Spanish" className="flex items-center gap-2 opacity-50" disabled>
                          <Languages className="h-4 w-4" />
                          Spanish
                        </ToggleGroupItem>
                        <ToggleGroupItem value="french" aria-label="Set language to French" className="flex items-center gap-2 opacity-50" disabled>
                          <Languages className="h-4 w-4" />
                          French
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <p className="text-xs text-muted-foreground mt-2">More languages coming soon</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Time Format</Label>
                      <ToggleGroup
                        type="single"
                        defaultValue="12hour"
                        className="flex flex-wrap justify-start"
                      >
                        <ToggleGroupItem value="12hour" aria-label="12-hour format" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          12-hour
                        </ToggleGroupItem>
                        <ToggleGroupItem value="24hour" aria-label="24-hour format" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          24-hour
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Some appearance settings may require a refresh to take effect.
                  </p>
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
