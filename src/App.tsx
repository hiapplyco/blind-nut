
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

// Import components directly to avoid any potential lazy loading issues
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import { JobPostingPage } from "@/components/jobs/JobPostingPage";
import { JobEditorPage } from "@/components/jobs/JobEditorPage";
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

          {/* Protected routes wrapped in MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/job-post" element={<JobPostingPage />} />
              <Route path="/job-editor/:id" element={<JobEditorPage />} />
              <Route path="/linkedin-post" element={<LinkedInPostGenerator />} />
              <Route path="/sourcing" element={<Sourcing />} />
              <Route path="/screening-room" element={<ScreeningRoom />} />
              <Route path="/interview-prep" element={<InterviewPrep />} />
              <Route path="/kickoff-call" element={<KickoffCall />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/report/:jobId" element={<Report />} />
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
