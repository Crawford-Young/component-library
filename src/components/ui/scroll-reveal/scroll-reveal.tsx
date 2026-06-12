'use client'

/* ScrollReveal — scroll choreography Layer 1 (docs/brand/motion.md §4).
   Section rises 16px + fades into view once, at 20% visibility.
   staggerChildren wraps direct children so they arrive in reading order. */

import * as React from 'react'
import { motion } from 'framer-motion'
import { STAGGER } from '@/lib/motion'
import { getRevealVariants, getStaggerDelayMs, getStaggerItemVariants } from '@/lib/motion-variants'
import { useReducedMotionSafe } from '@/lib/use-reduced-motion-safe'
import { cn } from '@/lib/utils'

const VIEWPORT_AMOUNT = 0.2

export interface ScrollRevealProps {
  readonly children: React.ReactNode
  readonly className?: string
  /** Delay before the reveal starts, in ms. */
  readonly delayMs?: number
  /** Stagger direct children in reading order (40ms steps, capped at 5). */
  readonly staggerChildren?: boolean
}

export const ScrollReveal = React.forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, className, delayMs = 0, staggerChildren = false }, ref) => {
    const reducedMotion = useReducedMotionSafe()
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: VIEWPORT_AMOUNT }}
        variants={getRevealVariants(reducedMotion, delayMs)}
      >
        {staggerChildren
          ? React.Children.map(children, (child, index) => (
              <motion.div
                variants={getStaggerItemVariants(reducedMotion)}
                custom={getStaggerDelayMs(index, STAGGER.cardMs)}
              >
                {child}
              </motion.div>
            ))
          : children}
      </motion.div>
    )
  },
)
ScrollReveal.displayName = 'ScrollReveal'
