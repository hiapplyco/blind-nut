
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          {/* Public route */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/linkedin-post" element={<LinkedInPostGenerator />} />
              <Route path="/sourcing" element={<Sourcing />} />
              <Route path="/screening-room" element={<ScreeningRoom />} />
              <Route path="/interview-prep" element={<InterviewPrep />} />
              <Route path="/kickoff-call" element={<KickoffCall />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/report/:id" element={<Report />} />
            </Route>
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
