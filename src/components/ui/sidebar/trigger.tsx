
import * as React from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./context"
import { Menu } from "lucide-react"

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  
  return (
    <button
      ref={ref}
      onClick={() => toggleSidebar()}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500",
        className
      )}
      {...props}
    >
      <span className="sr-only">Toggle sidebar</span>
      <Menu className="h-5 w-5" />
    </button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"
