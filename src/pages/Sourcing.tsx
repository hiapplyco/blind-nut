
import NewSearchForm from "@/components/NewSearchForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Sourcing = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!session) return null;

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex flex-col items-start">
        <h1 className="text-4xl font-bold mb-4">Sourcing</h1>
        <p className="text-gray-600 text-lg mb-8">
          Search for candidates, companies, or candidates at specific companies
        </p>
      </div>
      <NewSearchForm userId={session.user.id} />
    </div>
  );
};

export default Sourcing;
