
import { useEffect } from "react"
import { SIDEBAR_KEYBOARD_SHORTCUT } from "./sidebar-constants"

export const useSidebarKeyboard = (
  toggleSidebar: () => void,
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT.toLowerCase() &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar, enabled])
}
