
import * as React from "react"
import { cn } from "@/lib/utils"
import { VariantProps, cva } from "class-variance-authority"

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
)
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

interface MenuItem {
  title: string;
  path: string;
  icon: React.ComponentType<any>;
}

interface SidebarMenuItemProps extends React.ComponentProps<"li"> {
  item: MenuItem;
  pathname: string;
  navigate: (path: string) => void;
}

const SidebarMenuItemComponent = React.memo(({ className, item, pathname, navigate, ...props }: SidebarMenuItemProps) => {
  const handleClick = React.useCallback(() => {
    if (pathname !== item.path) {
      navigate(item.path);
    }
  }, [navigate, item.path, pathname]);

  const ButtonIcon = item.icon;
  const isActive = pathname === item.path;

  return (
    <li
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    >
      <button
        onClick={handleClick}
        className={cn(
          sidebarMenuButtonVariants({ variant: "default" }),
          isActive && "bg-purple-100 text-purple-900"
        )}
      >
        <ButtonIcon className="h-4 w-4" />
        <span>{item.title}</span>
      </button>
    </li>
  );
});

SidebarMenuItemComponent.displayName = "SidebarMenuItem";
export const SidebarMenuItem = SidebarMenuItemComponent;
