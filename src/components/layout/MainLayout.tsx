
import { useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Video, Theater, PhoneCall, MessageSquare, Search, PlusCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { memo, useCallback, useMemo, useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";

// Memoize menu items array to prevent recreation on each render
const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Create Content', path: '/content-creation', icon: PlusCircle },
  { title: 'Sourcing', path: '/sourcing', icon: Search },
  { title: 'Screening Room', path: '/screening-room', icon: Video },
  { title: 'Interview Prep', path: '/interview-prep', icon: Theater },
  { title: 'Kickoff Call', path: '/kickoff-call', icon: PhoneCall },
  { title: 'Chat', path: '/chat', icon: MessageSquare },
] as const;

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayoutComponent = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
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

    // Use navigate without replace to maintain history stack
    // and avoid full page reloads
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#FFFBF4]">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {menuContent}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </Sidebar>
        <div className="flex-1">
          <div className="container p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <SidebarTrigger />
                {isNavigating && (
                  <div className="fixed top-0 left-0 w-full z-50">
                    <Progress 
                      value={progress} 
                      className="h-1 rounded-none bg-transparent"
                      indicatorClassName="bg-primary transition-all duration-300 ease-in-out"
                    />
                  </div>
                )}
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
