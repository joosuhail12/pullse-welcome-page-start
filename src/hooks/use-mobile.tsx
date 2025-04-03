
import * as React from "react"

// Smaller breakpoint to better handle more devices
const MOBILE_BREAKPOINT = 540 // Adjusted to handle smaller devices better

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
