
import { useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import { memo, useMemo, useCallback } from "react";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayoutComponent = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Memoize menuItems array to prevent recreation on every render
  const menuItems = useMemo(() => [
    { title: 'Dashboard', path: '/dashboard', icon: Home },
    { title: 'Create LinkedIn Post', path: '/linkedin-post', icon: PlusCircle },
    { title: 'Sourcing', path: '/sourcing', icon: Search },
    { title: 'Screening Room', path: '/screening-room', icon: Video },
    { title: 'Interview Prep', path: '/interview-prep', icon: Theater },
    { title: 'Kickoff Call', path: '/kickoff-call', icon: PhoneCall },
    { title: 'Chat', path: '/chat', icon: MessageSquare },
  ], []); // Empty dependency array since these values never change

  // Memoize handleSignOut to prevent recreation on every render
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
  }, [navigate]); // Only depends on navigate function

  console.log('MainLayout render', { pathname: location.pathname });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#FFFBF4]">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem
                      key={item.title}
                      item={item}
                      pathname={location.pathname}
                      navigate={navigate}
                    />
                  ))}
                </SidebarMenu>
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
