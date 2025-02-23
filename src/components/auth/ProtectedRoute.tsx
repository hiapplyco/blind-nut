
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Outlet } from "react-router-dom";
import { memo } from "react"; // Changed import location for memo

const ProtectedRouteComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Only show loading state on initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBF4]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Memoize the ProtectedRoute component
export const ProtectedRoute = memo(ProtectedRouteComponent);
