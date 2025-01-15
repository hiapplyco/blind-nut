import { useEffect, useState } from "react";
import NewSearchForm from "@/components/NewSearchForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Button } from "@/components/ui/button";
import { FileText, Video } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate('/');
        toast.success('Successfully signed in!');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const TitleSection = ({ centered = false }) => (
    <div className={`flex flex-col items-${centered ? 'center' : 'start'}`}>
      <div className="w-16 h-16 bg-[#8B5CF6] rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white text-2xl font-bold mb-4">
        a
      </div>
      <h1 className={`text-5xl font-bold ${centered ? 'text-center' : ''} mb-4 bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300`}>
        Even a blind nut can find a <span className="text-[#8B5CF6] font-extrabold">Purple Squirrel</span>
      </h1>
      <p className={`text-gray-600 text-lg ${centered ? 'text-center' : ''}`}>
        Generate powerful search strings for recruiting
      </p>
    </div>
  );

  if (!session) {
    return (
      <div className="container max-w-md mx-auto py-8">
        <div className="flex flex-col items-center mb-8">
          <TitleSection centered={true} />
        </div>
        <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FFFBF4] p-6 rounded-lg">
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
                },
                input: {
                  border: '2px solid black',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  borderRadius: '4px',
                },
              },
            }}
            theme="light"
            providers={[]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex justify-between items-center">
        <TitleSection />
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View Past Searches
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/screening-room')}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Screening Room
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/interview-prep')}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Interview Prep
          </Button>
        </div>
      </div>
      
      <NewSearchForm userId={session.user.id} />
      <button
        onClick={() => supabase.auth.signOut()}
        className="block mx-auto text-sm text-gray-600 hover:text-gray-900 font-medium"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Index;