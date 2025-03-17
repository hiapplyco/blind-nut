
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
import ContentCreationPage from "@/pages/ContentCreationPage"; // Import the new combined page
import Sourcing from "@/pages/Sourcing";
import ScreeningRoom from "@/pages/ScreeningRoom";
import InterviewPrep from "@/pages/InterviewPrep";
import KickoffCall from "@/pages/KickoffCall";
import Chat from "@/pages/Chat";
import Report from "@/pages/Report";
import Clarvida from "@/pages/Clarvida"; // Import the new Clarvida page

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/clarvida" element={<Clarvida />} /> {/* Add standalone Clarvida route */}

          {/* Protected routes wrapped in MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/job-post" element={<JobPostingPage />} />
              <Route path="/job-editor/:id" element={<JobEditorPage />} />
              
              {/* Redirect old linkedin-post route to content-creation */}
              <Route path="/linkedin-post" element={<Navigate to="/content-creation" replace />} />
              
              <Route path="/content-creation" element={<ContentCreationPage />} />
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
