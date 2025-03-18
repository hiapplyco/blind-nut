
import { Navigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useClarvidaAuth } from "@/context/ClarvidaAuthContext";

export const ClarvidaProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useClarvidaAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F0FB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/clarvida/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
