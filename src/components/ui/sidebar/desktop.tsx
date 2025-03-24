
import * as React from "react"
import { cn } from "@/lib/utils"

interface DesktopSidebarProps extends React.ComponentProps<"div"> {
  state: "expanded" | "collapsed"
  collapsible: "offcanvas" | "icon" | "none"
  variant: "sidebar" | "floating" | "inset"
  side: "left" | "right"
}

export const DesktopSidebar = React.forwardRef<HTMLDivElement, DesktopSidebarProps>(
  ({ state, collapsible, variant, side, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "peer hidden md:block text-sidebar-foreground"
        )}
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
        {...props}
      >
        <div
          className={cn(
            "relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-300 ease-in-out",
            state === "collapsed" && "w-0",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-300 ease-in-out md:flex",
            side === "left" ? (
              state === "collapsed" ? "left-[-var(--sidebar-width)]" : "left-0"
            ) : (
              state === "collapsed" ? "right-[-var(--sidebar-width)]" : "right-0"
            ),
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className
          )}
        >
          <div
            data-sidebar="sidebar"
            className={cn(
              "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
              state === "collapsed" && "overflow-hidden"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
DesktopSidebar.displayName = "DesktopSidebar"
