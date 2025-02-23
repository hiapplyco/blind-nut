
import * as React from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./context"
import { MobileSidebar } from "./mobile"
import { DesktopSidebar } from "./desktop"

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <MobileSidebar
          ref={ref}
          open={openMobile}
          onOpenChange={setOpenMobile}
          side={side}
          {...props}
        >
          {children}
        </MobileSidebar>
      )
    }

    return (
      <DesktopSidebar
        ref={ref}
        state={state}
        collapsible={collapsible}
        variant={variant}
        side={side}
        className={className}
        {...props}
      >
        {children}
      </DesktopSidebar>
    )
  }
)
Sidebar.displayName = "Sidebar"

