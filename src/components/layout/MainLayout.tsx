
import { useNavigate, useLocation } from "react-router-dom";
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
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Home, FileText, Video, Theater, PhoneCall, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { title: 'Home', path: '/', icon: Home },
    { title: 'Dashboard', path: '/dashboard', icon: FileText },
    { title: 'Screening Room', path: '/screening-room', icon: Video },
    { title: 'Interview Prep', path: '/interview-prep', icon: Theater },
    { title: 'Kickoff Call', path: '/kickoff-call', icon: PhoneCall },
    { title: 'Chat', path: '/chat', icon: MessageSquare },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Successfully signed out!');
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#FFFBF4]">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className={cn(
                          "w-full",
                          location.pathname === item.path && "bg-purple-100 text-purple-900"
                        )}
                        onClick={() => navigate(item.path)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
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
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
