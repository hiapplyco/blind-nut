
import { createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { useAuthSession } from "@/hooks/useAuthSession";

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
  const auth = useAuthSession();

  console.log('AuthProvider render:', { isAuthenticated: auth.isAuthenticated, isLoading: auth.isLoading });

  return (
    <AuthContext.Provider value={auth}>
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
