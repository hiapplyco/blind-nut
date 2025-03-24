
import { useEffect, useState } from "react";
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
import { Home, Search, FileText, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClarvidaAuth } from "@/context/ClarvidaAuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ClarvidaHeader } from "@/components/clarvida/ClarvidaHeader";
import { ClarvidaResults } from "@/components/clarvida/ClarvidaResults";

const Clarvida = () => {
  const { signOut } = useClarvidaAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mockData, setMockData] = useState(null);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out from Clarvida!');
      navigate('/clarvida/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleNewSearch = () => {
    // Placeholder for new search action
    toast.info('New search functionality coming soon!');
  };

  const menuItems = [
    { 
      title: 'Dashboard', 
      path: '/clarvida', 
      icon: Home, 
      active: location.pathname === '/clarvida',
      onClick: () => navigate('/clarvida')
    },
    { 
      title: 'Search', 
      path: '/clarvida/search', 
      icon: Search, 
      active: location.pathname === '/clarvida/search',
      onClick: () => navigate('/clarvida/search')
    },
    { 
      title: 'Reports', 
      path: '/clarvida/reports', 
      icon: FileText, 
      active: location.pathname === '/clarvida/reports',
      onClick: () => navigate('/clarvida/reports')
    },
    { 
      title: 'Settings', 
      path: '/clarvida/settings', 
      icon: Settings, 
      active: location.pathname === '/clarvida/settings',
      onClick: () => navigate('/clarvida/settings')
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#F1F0FB]">
        <Sidebar collapsible="offcanvas">
          <SidebarContent>
            <div className="px-3 py-4">
              <ClarvidaHeader />
            </div>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem
                      key={item.path}
                      item={item}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-4 mt-auto border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-[#F1F0FB]/50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </Sidebar>
        <div className="flex-1">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Clarvida Dashboard</h1>
              <div className="w-10"></div> {/* Spacer for balance */}
            </div>
            <ClarvidaResults 
              data={mockData} 
              onNewSearch={handleNewSearch}
              originalSearchText="Sample job description"
              onSearchCandidates={(searchString) => {
                console.log("Search candidates with:", searchString);
                toast.info("Candidate search functionality coming soon!");
              }}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Clarvida;
