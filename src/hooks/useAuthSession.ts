
import { useState, useCallback, useEffect, useRef } from "react";
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
  
  const prevSession = useRef<Session | null>(null);

  const handleSessionChange = useCallback((newSession: Session | null) => {
    if (
      newSession?.user?.id === prevSession.current?.user?.id &&
      newSession?.expires_at === prevSession.current?.expires_at
    ) {
      return;
    }

    console.log('Session update:', !!newSession);
    prevSession.current = newSession;
    
    setState({
      session: newSession,
      isAuthenticated: !!newSession,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  return state;
};
