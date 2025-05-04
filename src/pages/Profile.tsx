
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser, getProfile } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import ProfileForm from "@/components/profile/ProfileForm";
import { User, Profile as ProfileType } from "@/types";
import { toast } from "sonner";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
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
  
  const handleProfileComplete = () => {
    toast.success("Profile saved successfully!");
    // Refresh profile data
    if (user) {
      getProfile(user.id).then(setProfile).catch(console.error);
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
            <h1 className="text-3xl font-bold text-ivy">
              {profile ? "Edit Your Profile" : "Create Your Profile"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {profile
                ? "Update your information to personalize your IvyTV experience."
                : "Complete your profile to start connecting with other Ivy League students."}
            </p>
          </div>

          {user && <ProfileForm user={user} onComplete={handleProfileComplete} />}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
