
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, getProfile, updatePresenceStatus } from "@/lib/supabase";
import MainLayout from "@/components/layout/MainLayout";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileView from "@/components/profile/ProfileView";
import { User, Profile as ProfileType } from "@/types";
import { toast } from "sonner";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-fetch
  const location = useLocation();

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
        
        // If no profile exists yet, automatically set to edit mode
        if (!profileData) {
          setIsEditMode(true);
        } else if (location.state?.editMode) {
          // If redirected with editMode state, set to edit mode
          setIsEditMode(true);
        }
      } catch (error) {
        console.error("Error fetching user or profile:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndProfile();
    
    // Update presence status to offline when component unmounts
    return () => {
      if (user) {
        updatePresenceStatus(user.id, 'offline').catch(console.error);
      }
    };
  }, [location.state, refreshKey]); // Add refreshKey to the dependency array
  
  const handleProfileComplete = () => {
    toast.success("Profile saved successfully!");
    setIsEditMode(false);
    // Refresh profile data by updating the refresh key
    setRefreshKey(prev => prev + 1);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
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
            <h1 className="text-3xl font-bold text-ivy">
              {isEditMode 
                ? (profile ? "Edit Your Profile" : "Create Your Profile")
                : "Your Profile"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEditMode
                ? (profile
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
