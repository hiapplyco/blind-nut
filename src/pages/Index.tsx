
import { useEffect, useState } from "react";
import NewSearchForm from "@/components/NewSearchForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate('/dashboard');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate('/dashboard');
        toast.success('Successfully signed in!');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!session) {
    return (
      <div className="container max-w-md mx-auto py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-md flex flex-col items-center">
            <img 
              src="/lovable-uploads/a36a9030-18dd-4eec-bf47-21de5406f97b.png" 
              alt="Purple Squirrel" 
              className="w-48 h-48 object-contain mb-4"
            />
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
              Even a blind nut can find a <span className="text-[#8B5CF6] font-extrabold">Purple Squirrel</span>
            </h1>
            <p className="text-gray-600 text-lg text-center">
              Generate powerful search strings for recruiting
            </p>
          </div>
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
      <div className="flex flex-col items-start">
        <div className="w-16 h-16 bg-[#8B5CF6] rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white text-2xl font-bold mb-4">
          a
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#8B5CF6] via-[#9B87F5] to-[#A18472] bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
          Even a blind nut can find a <span className="text-[#8B5CF6] font-extrabold">Purple Squirrel</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Generate powerful search strings for recruiting
        </p>
      </div>
      <NewSearchForm userId={session.user.id} />
    </div>
  );
};

export default Index;
