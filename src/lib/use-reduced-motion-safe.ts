'use client'

/* src/lib/use-reduced-motion-safe.ts
   SSR-safe prefers-reduced-motion flag. Framer's useReducedMotion returns null
   until hydration — treat null as "no preference" so motion renders by default. */

import { useReducedMotion } from 'framer-motion'

export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false
}
