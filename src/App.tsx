
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import ScreeningRoom from "./pages/ScreeningRoom";
import InterviewPrep from "./pages/InterviewPrep";
import KickOffCall from "./pages/KickOffCall";
import Chat from "./pages/Chat";
import Sourcing from "./pages/Sourcing";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/report/:jobId"
            element={
              <MainLayout>
                <Report />
              </MainLayout>
            }
          />
          <Route
            path="/sourcing"
            element={
              <MainLayout>
                <Sourcing />
              </MainLayout>
            }
          />
          <Route
            path="/screening-room"
            element={
              <MainLayout>
                <ScreeningRoom />
              </MainLayout>
            }
          />
          <Route
            path="/interview-prep"
            element={
              <MainLayout>
                <InterviewPrep />
              </MainLayout>
            }
          />
          <Route
            path="/kickoff-call"
            element={
              <MainLayout>
                <KickOffCall />
              </MainLayout>
            }
          />
          <Route
            path="/chat"
            element={
              <MainLayout>
                <Chat />
              </MainLayout>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
