import { useCallback, useState } from "react"
import { SIDEBAR_COOKIE_NAME, SIDEBAR_COOKIE_MAX_AGE } from "./sidebar-constants"

interface UseSidebarStateProps {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const useSidebarState = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
}: UseSidebarStateProps) => {
  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  return { open, setOpen }
}