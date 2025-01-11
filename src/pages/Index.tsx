import { useEffect, useState } from "react";
import NewSearchForm from "@/components/NewSearchForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="container max-w-md mx-auto py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#8B5CF6] rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white text-2xl font-bold mb-4">
            a
          </div>
          <h1 className="text-5xl font-bold text-center mb-4">X-Ray Sourcing with Apply</h1>
          <p className="text-gray-600 text-lg text-center">
            Generate powerful search strings for recruiting
          </p>
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
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-[#8B5CF6] rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white text-2xl font-bold mb-4">
          a
        </div>
        <h1 className="text-5xl font-bold text-center mb-4">X-Ray Sourcing with Apply</h1>
        <p className="text-gray-600 text-lg text-center">
          Generate powerful search strings for recruiting
        </p>
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