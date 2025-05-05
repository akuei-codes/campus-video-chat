
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProfile, updatePresenceStatus } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileView from "@/components/profile/ProfileView";
import { Profile as ProfileType } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/App";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const profileData = await getProfile(user.id);
        setProfile(profileData);
        
        // Update online status
        await updatePresenceStatus(user.id, 'online');
        
        // If no profile exists or profile is incomplete, automatically set to edit mode
        if (!profileData || !profileData.university || profileData.university === '') {
          setIsEditMode(true);
          // Show toast notification
          toast.info("Please complete your profile to unlock all features", {
            duration: 5000,
            position: "top-center"
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleProfileComplete = () => {
    toast.success("Profile saved successfully!");
    setIsEditMode(false);
    // Refresh profile data
    if (user) {
      getProfile(user.id)
        .then(updatedProfile => {
          setProfile(updatedProfile);
        })
        .catch(console.error);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  if (authLoading || loading) {
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
            <h1 className="text-3xl font-bold text-ivy">
              {isEditMode 
                ? (profile && profile.university ? "Edit Your Profile" : "Complete Your Profile")
                : "Your Profile"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEditMode
                ? (profile && profile.university
                  ? "Update your information to personalize your IvyTV experience."
                  : "Complete your profile to start connecting with other Ivy League students.")
                : "Your personal profile information visible to other Ivy League students."}
            </p>
          </div>

          {isEditMode ? (
            user && <ProfileForm user={user} onComplete={handleProfileComplete} />
          ) : (
            profile && <ProfileView profile={profile} onEdit={handleEditClick} />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
