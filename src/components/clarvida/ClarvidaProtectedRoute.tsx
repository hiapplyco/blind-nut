
import { Navigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useClarvidaAuth } from "@/context/ClarvidaAuthContext";
import { useEffect } from "react";

export const ClarvidaProtectedRoute = () => {
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
    // Use absolute path to ensure proper redirection on custom domains
    return <Navigate to="/clarvida/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected route
  console.log("Authenticated, rendering Clarvida protected content");
  return <Outlet />;
};
