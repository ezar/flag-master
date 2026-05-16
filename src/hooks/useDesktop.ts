import { useState, useEffect } from 'react'

/** Returns true when viewport width ≥ breakpoint (default 960px). SSR-safe. */
export function useDesktop(breakpoint = 960): boolean {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= breakpoint : false
  )
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= breakpoint)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [breakpoint])
  return isDesktop
}
