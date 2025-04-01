
import * as React from "react"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"
import { useSidebar } from "./context"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const SidebarMenu = React.memo(({ className, ...props }: React.ComponentProps<"ul">) => (
  <ul
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SidebarMenuItemProps {
  title: string;
  icon: React.ComponentType<any>;
  path?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li"> & {
    item: SidebarMenuItemProps;
  }
>(({ className, item, ...props }, ref) => {
  const { state } = useSidebar();
  const Icon = item.icon;
  const isCollapsed = state === "collapsed";
  
  const buttonContent = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </>
  );
  
  const handleClick = (e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    }
  };
  
  const button = (
    <button
      onClick={handleClick}
      disabled={item.disabled}
      className={cn(
        sidebarMenuButtonVariants({ variant: "default" }),
        item.active && "bg-purple-100 text-purple-900",
        item.disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {buttonContent}
    </button>
  );

  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    >
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.title}
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
    </li>
  );
});

SidebarMenuItem.displayName = "SidebarMenuItem";
