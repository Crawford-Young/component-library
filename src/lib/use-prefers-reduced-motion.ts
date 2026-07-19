import { useMatchMedia } from '@/lib/use-match-media'

export function usePrefersReducedMotion(): boolean {
  return useMatchMedia('(prefers-reduced-motion: reduce)')
}
