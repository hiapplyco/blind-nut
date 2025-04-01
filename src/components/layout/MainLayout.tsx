
import { Outlet } from "react-router-dom";
import { useEffect, memo } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
<<<<<<< HEAD
import { Home, Video, Theater, PhoneCall, MessageSquare, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
=======
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { SidebarMenuContent } from "./SidebarMenuItems";
import { NavigationProgress } from "./NavigationProgress";
import { SignOutButton } from "./SignOutButton";
import { useNavigation } from "@/hooks/useNavigation";
>>>>>>> origin/main

const MainLayoutComponent = () => {
  const { isNavigating, progress, handleNavigation, currentPath } = useNavigation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isAuthenticated } = useAuth();
  
  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }, [navigate]);

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

    // Navigate with state to prevent full page reload
    navigate(path, { 
      replace: true,
      state: { preventReload: true }
    });
    
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

  // Check auth state changes and prevent unnecessary reloads
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Memoize the menu rendering to prevent unnecessary re-renders
  const menuContent = useMemo(() => (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem
          key={item.path}
          item={item}
          pathname={location.pathname}
          navigate={handleNavigation}
        />
      ))}
    </SidebarMenu>
  ), [location.pathname, handleNavigation]);
=======
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
>>>>>>> origin/main

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-[#F1F0FB]">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenuContent 
                  pathname={currentPath} 
                  handleNavigation={handleNavigation} 
                />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-4 border-t border-black">
            <SignOutButton />
          </div>
        </Sidebar>
        <div className="flex-1">
          <div className="container p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <SidebarTrigger />
                <NavigationProgress 
                  isNavigating={isNavigating} 
                  progress={progress} 
                />
              </div>
              <div 
                className={`transition-opacity duration-300 ${
                  isNavigating ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const MainLayout = memo(MainLayoutComponent);
export default MainLayout;