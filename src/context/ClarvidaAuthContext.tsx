
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface ClarvidaAuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const ClarvidaAuthContext = createContext<ClarvidaAuthContextType>({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const ClarvidaAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email, 
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email, 
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({
    session,
    isAuthenticated: !!session,
    isLoading,
    signIn,
    signUp,
    signOut
  }), [session, isLoading]);

  return (
    <ClarvidaAuthContext.Provider value={value}>
      {children}
    </ClarvidaAuthContext.Provider>
  );
};

export const useClarvidaAuth = () => {
  const context = useContext(ClarvidaAuthContext);
  if (!context) {
    throw new Error("useClarvidaAuth must be used within a ClarvidaAuthProvider");
  }
  return context;
};
