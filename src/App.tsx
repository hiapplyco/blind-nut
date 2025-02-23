
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import LinkedInPostGenerator from "@/pages/LinkedInPostGenerator";
import Sourcing from "@/pages/Sourcing";
import ScreeningRoom from "@/pages/ScreeningRoom";
import InterviewPrep from "@/pages/InterviewPrep";
import KickoffCall from "@/pages/KickoffCall";
import Chat from "@/pages/Chat";
import Report from "@/pages/Report";
import { supabase } from "@/integrations/supabase/client";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Only show loading state on initial load
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF4]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {/* Public route */}
        <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" />} />

        {/* Protected routes */}
        <Route element={<MainLayout><Outlet /></MainLayout>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/linkedin-post" element={<LinkedInPostGenerator />} />
          <Route path="/sourcing" element={<Sourcing />} />
          <Route path="/screening-room" element={<ScreeningRoom />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/kickoff-call" element={<KickoffCall />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/report/:id" element={<Report />} />
        </Route>

        {/* Catch unauthorized access to protected routes */}
        <Route path="*" element={!isAuthenticated ? <Navigate to="/" /> : <Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
