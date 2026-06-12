/* src/lib/motion-variants.ts
   Pure Framer Motion variant builders for the motion primitives.
   Reveal = scroll choreography Layer 1; stagger items = arrival Pattern 5.
   See docs/brand/motion.md §4–5. */

import type { Variants } from 'framer-motion'
import { EASE, MOTION, STAGGER } from './motion'

const MS_PER_SECOND = 1000
const REVEAL_RISE_PX = 16
const ITEM_RISE_PX = 8

export function getRevealVariants(reducedMotion: boolean, delayMs = 0): Variants {
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : REVEAL_RISE_PX },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION.slow / MS_PER_SECOND,
        delay: delayMs / MS_PER_SECOND,
        ease: [...EASE.out],
      },
    },
  }
}

export function getStaggerDelayMs(index: number, stepMs: number = STAGGER.cardMs): number {
  return Math.min(index, STAGGER.capItems) * stepMs
}

export function getStaggerItemVariants(reducedMotion: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : ITEM_RISE_PX },
    visible: (delayMs: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION.slow / MS_PER_SECOND,
        delay: delayMs / MS_PER_SECOND,
        ease: [...EASE.out],
      },
    }),
  }
}
