
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import LinkedInPostGenerator from "@/pages/LinkedInPostGenerator";
import Sourcing from "@/pages/Sourcing";
import ScreeningRoom from "@/pages/ScreeningRoom";
import InterviewPrep from "@/pages/InterviewPrep";
import KickoffCall from "@/pages/KickoffCall";
import Chat from "@/pages/Chat";

const App = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<LinkedInPostGenerator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sourcing" element={<Sourcing />} />
          <Route path="/screening-room" element={<ScreeningRoom />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/kickoff-call" element={<KickoffCall />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </MainLayout>
      <Toaster />
    </Router>
  );
};

export default App;
