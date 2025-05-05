
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, updatePresenceStatus, initializeAuthListener } from "@/lib/supabase";
import { User } from "@/types";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Match from "./pages/Match";
import Network from "./pages/Network";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Messages from "./pages/Messages";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Auth provider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial auth check
    const checkAuth = async () => {
      try {
        console.log("Checking initial auth state...");
        const currentUser = await getCurrentUser();
        console.log("Initial auth state:", currentUser ? "Logged in" : "Not logged in");
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Initialize auth listener
    const unsubscribe = initializeAuthListener((authUser) => {
      console.log("Auth listener triggered:", authUser ? "User authenticated" : "No user");
      setUser(authUser);
      setLoading(false);
    });
    
    checkAuth();
    
    return () => {
      // Clean up auth listener
      if (unsubscribe) unsubscribe.subscription.unsubscribe();
    };
  }, []);

  // Make the user and loading state available to the app
  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth context
export const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}>({
  user: null,
  loading: false,
  setUser: () => {},
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Presence management component
const PresenceManager = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Set user as online when authenticated
    if (user) {
      updatePresenceStatus(user.id, 'online').catch(console.error);
      
      // Set user as offline when window closes/navigates away
      const handleBeforeUnload = () => {
        updatePresenceStatus(user.id, 'offline').catch(console.error);
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updatePresenceStatus(user.id, 'offline').catch(console.error);
      };
    }
  }, [user]);
  
  return null;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-ivy">Loading...</div>
  </div>;
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PresenceManager />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/match" element={
              <ProtectedRoute>
                <Match />
              </ProtectedRoute>
            } />
            <Route path="/network" element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/messages/:connectionId" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
