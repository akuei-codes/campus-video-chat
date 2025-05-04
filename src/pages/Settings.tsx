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

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-ivy">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences.
            </p>
          </div>

          <Card className="glass border-0 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-red-500 hover:bg-red-700 text-white" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass border-0 shadow-lg mt-6 animate-fade-in">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <Alert>
                  <AlertDescription>
                    You will receive daily updates and recommendations.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
