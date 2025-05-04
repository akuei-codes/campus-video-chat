
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser, getProfile } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { User, Profile as ProfileType } from '@/types';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);
        
        if (currentUser) {
          // Check if user has a profile
          const userProfile = await getProfile(currentUser.id);
          setProfile(userProfile);
          
          // Show a toast notification if the user is newly logged in and has no profile
          if (!userProfile) {
            toast.info(
              "Welcome to IvyTV! Please complete your profile to get started.",
              {
                duration: 8000,
                action: {
                  label: "Complete Profile",
                  onClick: () => navigate("/profile")
                }
              }
            );
          }
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthState();
  }, [navigate]);
  
  const handleCTA = (destination: string) => {
    if (isLoggedIn) {
      navigate(destination);
    } else {
      navigate('/login');
    }
  };

  return (
    <MainLayout>
      {/* Profile Completion Alert */}
      {isLoggedIn && user && !profile && !loading && (
        <div className="container mx-auto px-4 mt-6">
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">Complete your profile</AlertTitle>
            <AlertDescription className="text-amber-700">
              Please complete your profile to get the most out of IvyTV.
              <Button 
                variant="link" 
                className="text-ivy font-medium pl-1" 
                onClick={() => navigate("/profile")}
              >
                Complete Profile
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 800 800">
            <path fill="#2C5E1A" fillOpacity="0.05" d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63"></path>
            <path fill="#2C5E1A" fillOpacity="0.05" d="M-31 229L237 261 390 382 731 737M-31 229L237 261 390 382 731 737M-31 229L237 261 390 382 731 737"></path>
            <path fill="#2C5E1A" fillOpacity="0.05" d="M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880"></path>
            <path fill="#2C5E1A" fillOpacity="0.05" d="M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382"></path>
            <path fill="#2C5E1A" fillOpacity="0.05" d="M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-31 229 126.5 79.5"></path>
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center max-w-6xl mx-auto">
            <div className="lg:w-1/2 mb-12 lg:mb-0 animate-fade-in">
              <h1 className="text-5xl font-bold tracking-tight text-ivy mb-6">
                <span className="block">Connect with</span>
                <span className="block">Ivy League Students</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-md">
                IvyTV enables authentic connections between students across prestigious universities through spontaneous one-on-one video chats.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-ivy hover:bg-ivy-dark text-white px-8 py-6 rounded-md text-lg font-medium hover-scale"
                  onClick={() => handleCTA('/match')}
                >
                  Join Now
                </Button>
                <Button 
                  variant="outline" 
                  className="px-8 py-6 rounded-md text-lg font-medium hover-scale"
                  onClick={() => navigate('/network')}
                >
                  Learn More
                </Button>
              </div>
              <div className="flex items-center mt-8 text-sm text-gray-500">
                <div className="flex items-center mr-6">
                  <svg className="w-5 h-5 mr-2 text-ivy" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span>Ivy League Exclusive</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-ivy" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative hover-scale">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-ivy/50 to-ivy/30 blur-sm"></div>
                <div className="rounded-xl overflow-hidden relative z-10 glass">
                  <div className="aspect-video w-full bg-gray-800">
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <div className="w-full max-w-md mx-auto">
                        <div className="p-6 bg-white/90 rounded-lg shadow-lg flex flex-col items-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-ivy flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          </div>
                          <h3 className="text-lg font-medium text-center">Connect with other Ivy League students</h3>
                          <p className="text-gray-500 text-center text-sm">Video chat with students from all Ivy League universities</p>
                          <Button 
                            className="bg-ivy hover:bg-ivy-dark mt-2"
                            onClick={() => handleCTA('/match')}
                          >
                            Start Matching
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-ivy">Why IvyTV?</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Our platform is designed specifically for Ivy League students to foster meaningful connections
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="hover-card bg-white rounded-lg p-8 text-center shadow hover-scale">
              <div className="w-16 h-16 mx-auto mb-6 bg-ivy/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-ivy" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Exclusive Network</h3>
              <p className="text-gray-600">
                Connect only with verified students from Harvard, Yale, Princeton, Columbia, Brown, Dartmouth, UPenn, and Cornell.
              </p>
            </div>
            
            <div className="hover-card bg-white rounded-lg p-8 text-center shadow hover-scale">
              <div className="w-16 h-16 mx-auto mb-6 bg-ivy/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-ivy" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Spontaneous Video</h3>
              <p className="text-gray-600">
                Engage in authentic, one-on-one video conversations with peers across different Ivy League campuses.
              </p>
            </div>
            
            <div className="hover-card bg-white rounded-lg p-8 text-center shadow hover-scale">
              <div className="w-16 h-16 mx-auto mb-6 bg-ivy/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-ivy" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Safe Environment</h3>
              <p className="text-gray-600">
                Our platform enforces strict privacy and moderation policies to ensure a respectful experience.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-ivy mb-6">Ready to Connect?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join IvyTV today and start building meaningful connections with fellow Ivy League students.
            </p>
            <Button 
              className="bg-ivy hover:bg-ivy-dark text-white px-8 py-6 rounded-md text-lg font-medium hover-scale"
              onClick={() => handleCTA('/match')}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
