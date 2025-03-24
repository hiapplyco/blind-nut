
import { useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleNavigation = useCallback((path: string) => {
    if (path === location.pathname) return;
    
    setIsNavigating(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    navigate(path);
    
    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isNavigating]);
  
  return {
    isNavigating,
    progress,
    handleNavigation,
    currentPath: location.pathname
  };
}
