
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#F1F0FB]">
        <Sidebar>
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
