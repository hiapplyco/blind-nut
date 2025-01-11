import { useEffect } from "react";
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
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
            a
          </div>
          <h1 className="text-3xl font-bold text-center">Search with Apply</h1>
          <p className="text-muted-foreground text-center mt-2">
            Generate powerful search strings for recruiting
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
          a
        </div>
        <h1 className="text-3xl font-bold">Search with Apply</h1>
        <p className="text-muted-foreground mt-2">
          Generate powerful search strings for recruiting
        </p>
      </div>
      <NewSearchForm userId={session.user.id} />
      <button
        onClick={() => supabase.auth.signOut()}
        className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Index;