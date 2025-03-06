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
  { title: 'Chat (Disabled)', path: '/chat', icon: MessageSquare, disabled: true },
] as const;

// Custom SidebarMenuItem component to handle disabled state
const SidebarMenuItemWithDisabled = ({ 
  item, 
  pathname, 
  navigate 
}: { 
  item: typeof menuItems[number]; 
  pathname: string; 
  navigate: (path: string) => void;
}) => {
  const isActive = pathname === item.path;
  
  return (
    <li className="relative py-1">
      <button
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive 
            ? "text-black bg-white" 
            : item.disabled 
              ? "text-gray-400 cursor-not-allowed" 
              : "text-gray-600 hover:text-gray-900 hover:bg-[#F1F0FB]/50"
        }`}
        onClick={() => !item.disabled && navigate(item.path)}
        disabled={item.disabled}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.title}</span>
        {item.disabled && (
          <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-auto">
            Disabled
          </span>
        )}
      </button>
    </li>
  );
};

const MainLayoutComponent = ({ children }: { children?: React.ReactNode }) => {
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
        <SidebarMenuItemWithDisabled
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
      <div className="min-h-screen flex w-full bg-[#F1F0FB]">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {menuContent}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-4 border-t border-black">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-[#F1F0FB]/50"
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
                      indicatorClassName="bg-[#8B5CF6] transition-all duration-300 ease-in-out"
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
