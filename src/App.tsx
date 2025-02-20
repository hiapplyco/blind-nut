
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import LinkedInPostGenerator from "@/pages/LinkedInPostGenerator";
import Sourcing from "@/pages/Sourcing";
import ScreeningRoom from "@/pages/ScreeningRoom";
import InterviewPrep from "@/pages/InterviewPrep";
import KickoffCall from "@/pages/KickoffCall";
import Chat from "@/pages/Chat";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/linkedin-post" element={<LinkedInPostGenerator />} />
            <Route path="/sourcing" element={<Sourcing />} />
            <Route path="/screening-room" element={<ScreeningRoom />} />
            <Route path="/interview-prep" element={<InterviewPrep />} />
            <Route path="/kickoff-call" element={<KickoffCall />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </MainLayout>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
