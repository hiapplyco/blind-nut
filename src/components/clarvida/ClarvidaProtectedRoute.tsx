
import { Navigate, useLocation } from "react-router-dom";
import { useClarvidaAuth } from "@/context/ClarvidaAuthContext";
import { useEffect } from "react";

// Changed to accept children as a prop instead of using Outlet
export const ClarvidaProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useClarvidaAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ClarvidaProtectedRoute:", { 
      isAuthenticated, 
      isLoading, 
      path: location.pathname,
      fullUrl: window.location.href
    });
  }, [isAuthenticated, isLoading, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F0FB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to /clarvida/login from", location.pathname);
    // Use absolute path to ensure proper redirection
    return <Navigate to="/clarvida/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the children
  console.log("Authenticated, rendering Clarvida protected content");
  return <>{children}</>;
};
