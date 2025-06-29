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
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { SidebarMenuContent } from "./SidebarMenuItems";
import { NavigationProgress } from "./NavigationProgress";
import { SignOutButton } from "./SignOutButton";
import { useNavigation } from "@/hooks/useNavigation";

const MainLayoutComponent = () => {
  const { isNavigating, progress, handleNavigation, currentPath } = useNavigation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-[#F1F0FB]">
        <Sidebar collapsible="icon" className="border-r border-gray-200">
          <SidebarContent className="bg-white">
            <div className="p-4 border-b border-gray-200">
              <img 
                src="https://kxghaajojntkqrmvsngn.supabase.co/storage/v1/object/public/logos/Apply2025logo.png" 
                alt="Apply" 
                className="h-10 w-auto"
              />
            </div>
            <SidebarGroup className="py-4">
              <SidebarGroupContent>
                <SidebarMenuContent 
                  pathname={currentPath} 
                  handleNavigation={handleNavigation} 
                />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-4 border-t border-gray-200 bg-white">
            <SignOutButton />
          </div>
        </Sidebar>
        <div className="flex-1 relative">
          <div className="w-full p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <SidebarTrigger className="h-10 w-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors" />
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