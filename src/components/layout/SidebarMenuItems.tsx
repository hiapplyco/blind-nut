
import { memo } from "react";
import { Home, Video, Theater, PhoneCall, MessageSquare, Search, PlusCircle, LayoutDashboard } from "lucide-react";
import { SidebarMenu } from "@/components/ui/sidebar";

// Define the menu item type with optional disabled property
export type MenuItem = {
  title: string;
  path: string;
  icon: React.ComponentType<any>;
  disabled?: boolean;
};

// Memoize menu items array to prevent recreation on each render
export const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Create Content', path: '/content-creation', icon: PlusCircle },
  { title: 'Sourcing', path: '/sourcing', icon: Search },
  { title: 'Screening Room', path: '/screening-room', icon: Video },
  { title: 'Interview Prep', path: '/interview-prep', icon: Theater },
  { title: 'Kickoff Call', path: '/kickoff-call', icon: PhoneCall },
  { title: 'Chat', path: '/chat', icon: MessageSquare, disabled: true },
];

// Custom SidebarMenuItem component to handle disabled state
export const SidebarMenuItemWithDisabled = memo(({ 
  item, 
  pathname, 
  navigate 
}: { 
  item: MenuItem; 
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
});

SidebarMenuItemWithDisabled.displayName = "SidebarMenuItemWithDisabled";

// Menu content component
export const SidebarMenuContent = memo(({ 
  pathname, 
  handleNavigation 
}: { 
  pathname: string; 
  handleNavigation: (path: string) => void;
}) => {
  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItemWithDisabled
          key={item.path}
          item={item}
          pathname={pathname}
          navigate={handleNavigation}
        />
      ))}
    </SidebarMenu>
  );
});

SidebarMenuContent.displayName = "SidebarMenuContent";
