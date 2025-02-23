
import { useState, useCallback, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuthSession = () => {
  const [state, setState] = useState<AuthState>({
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Memoize session update handler
  const handleSessionChange = useCallback((newSession: Session | null) => {
    console.log('Session update:', !!newSession);
    setState({
      session: newSession,
      isAuthenticated: !!newSession,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        handleSessionChange(initialSession);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  return state;
};
