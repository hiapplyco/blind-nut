
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
import { Home, Video, Theater, PhoneCall, MessageSquare, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { memo, useCallback, useMemo } from "react";

// Memoize menu items array to prevent recreation on each render
const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: Home },
  { title: 'Create LinkedIn Post', path: '/linkedin-post', icon: PlusCircle },
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
  
  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out!');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }, [navigate]);

  // Memoize the menu rendering to prevent unnecessary re-renders
  const menuContent = useMemo(() => (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem
          key={item.path}
          item={item}
          pathname={location.pathname}
          navigate={navigate}
        />
      ))}
    </SidebarMenu>
  ), [location.pathname, navigate]);

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
            <SidebarTrigger />
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const MainLayout = memo(MainLayoutComponent);
export default MainLayout;
