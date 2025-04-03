
import * as React from "react"

// Smaller breakpoint to better handle more devices
const MOBILE_BREAKPOINT = 640 // Changed from 768 to 640 to better align with sm breakpoint in Tailwind

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check on initial render
    handleResize()
    
    // Add event listener
    window.addEventListener("resize", handleResize)
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return !!isMobile
}
