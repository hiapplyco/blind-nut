
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize setSession to prevent recreation
  const handleSessionChange = useCallback((newSession: Session | null) => {
    console.log('Session change detected:', !!newSession);
    setSession(newSession);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Create a single promise that resolves when the initial session is fetched
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        handleSessionChange(initialSession);
      } catch (error) {
        console.error('Error fetching session:', error);
        setIsLoading(false);
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Only update if the session has actually changed
      if (JSON.stringify(newSession) !== JSON.stringify(session)) {
        handleSessionChange(newSession);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleSessionChange, session]); // Add session to detect actual changes

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    session,
    isAuthenticated: !!session,
    isLoading,
  }), [session, isLoading]);

  console.log('AuthProvider render:', { isAuthenticated: !!session, isLoading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
