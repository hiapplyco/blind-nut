
import { Button } from "@/components/ui/button";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Search, FileScan, Video, Workflow } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if user is already authenticated
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF4] to-[#F5F0ED]">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-8 bg-[#8B5CF6] rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center justify-center">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#8B6E5B] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent">
            Hi, welcome to Apply...
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Revolutionize your recruiting with AI-powered sourcing, screening, and candidate qualification
          </p>
        </div>

        {/* Auth Section */}
        <div className="w-full max-w-md mb-16">
          <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                style: {
                  button: {
                    background: '#8B5CF6',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    borderRadius: '4px',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                  },
                  input: {
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    borderRadius: '4px',
                    padding: '10px',
                  },
                  label: {
                    color: '#44332A',
                    fontWeight: 'medium',
                  },
                  loader: {
                    color: '#8B5CF6',
                  },
                },
              }}
              theme="light"
              providers={[]}
              redirectTo={window.location.origin}
              onlyThirdPartyProviders={false}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl w-full">
          <div className="bg-white p-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[#8B5CF6] mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Smart Sourcing</h3>
            <p className="text-gray-600">AI-powered candidate search and LinkedIn post generation to attract top talent</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[#8B5CF6] mb-4">
              <FileScan className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Intelligent Screening</h3>
            <p className="text-gray-600">Automated resume analysis and candidate qualification with AI assistance</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[#8B5CF6] mb-4">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Video Interviews</h3>
            <p className="text-gray-600">Seamless video interviews with real-time AI analysis and insights</p>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[#8B5CF6] mb-4">
              <Workflow className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg mb-2">Agentic Workflows</h3>
            <p className="text-gray-600">Automate and streamline your recruiting process with AI-powered workflows that adapt to your needs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
