
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import ScreeningRoom from "./pages/ScreeningRoom";
import InterviewPrep from "./pages/InterviewPrep";
import KickOffCall from "./pages/KickOffCall";
import Chat from "./pages/Chat";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report/:jobId" element={<Report />} />
          <Route path="/screening-room" element={<ScreeningRoom />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/kickoff-call" element={<KickOffCall />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
