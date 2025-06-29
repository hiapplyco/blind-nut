
import { memo } from "react";
import { Home, Video, Theater, PhoneCall, MessageSquare, Search, PlusCircle, LayoutDashboard, Clock, User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar/context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  { title: 'Search History', path: '/search-history', icon: Clock },
  { title: 'Screening Room', path: '/screening-room', icon: Video },
  { title: 'Interview Prep', path: '/interview-prep', icon: Theater },
  { title: 'Kickoff Call', path: '/kickoff-call', icon: PhoneCall },
  { title: 'Profile', path: '/profile', icon: User },
  { title: 'Chat', path: '/chat', icon: MessageSquare },
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
  const { state } = useSidebar();
  const isActive = pathname === item.path;
  const isCollapsed = state === "collapsed";
  
  const buttonContent = (
    <>
      <item.icon className="h-5 w-5" />
      {!isCollapsed && (
        <span className="transition-opacity duration-300">
          {item.title}
          {item.disabled && (
            <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded ml-2">
              Disabled
            </span>
          )}
        </span>
      )}
    </>
  );
  
  const buttonClasses = `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
    isActive 
      ? "text-black bg-white" 
      : item.disabled 
        ? "text-gray-400 cursor-not-allowed" 
        : "text-gray-600 hover:text-gray-900 hover:bg-[#F1F0FB]/50"
  }`;
  
  return (
    <li className="relative py-1">
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={buttonClasses}
              onClick={() => !item.disabled && navigate(item.path)}
              disabled={item.disabled}
            >
              {buttonContent}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.title} {item.disabled && "(Disabled)"}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          className={buttonClasses}
          onClick={() => !item.disabled && navigate(item.path)}
          disabled={item.disabled}
        >
          {buttonContent}
        </button>
      )}
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
    <ul className="flex w-full min-w-0 flex-col gap-1">
      {menuItems.map((item) => (
        <SidebarMenuItemWithDisabled
          key={item.path}
          item={item}
          pathname={pathname}
          navigate={handleNavigation}
        />
      ))}
    </ul>
  );
});

SidebarMenuContent.displayName = "SidebarMenuContent";
