
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { getCurrentUser, updatePresenceStatus } from "@/lib/supabase";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Match from "./pages/Match";
import Network from "./pages/Network";
import Settings from "./pages/Settings";
import ReportForm from "./components/moderation/ReportForm";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Presence management component
const PresenceManager = () => {
  useEffect(() => {
    // Set user as online when app loads
    const setUserOnline = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          await updatePresenceStatus(user.id, 'online');
        }
      } catch (error) {
        console.error("Error setting user as online:", error);
      }
    };
    
    setUserOnline();
    
    // Set user as offline when window closes/navigates away
    const handleBeforeUnload = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          await updatePresenceStatus(user.id, 'offline');
        }
      } catch (error) {
        console.error("Error setting user as offline:", error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PresenceManager />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/match" element={<Match />} />
          <Route path="/network" element={<Network />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
