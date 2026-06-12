'use client'

/* StaggerReveal — arrival Pattern 5 (docs/brand/motion.md §5).
   Direct children rise 8px + fade in on mount, staggered in reading order,
   delay capped at 5 items. For scroll-triggered reveals use ScrollReveal. */

import * as React from 'react'
import { motion } from 'framer-motion'
import { STAGGER } from '@/lib/motion'
import { getStaggerDelayMs, getStaggerItemVariants } from '@/lib/motion-variants'
import { useReducedMotionSafe } from '@/lib/use-reduced-motion-safe'
import { cn } from '@/lib/utils'

export interface StaggerRevealProps {
  readonly children: React.ReactNode
  readonly className?: string
  /** Per-item stagger step in ms. */
  readonly staggerMs?: number
}

export const StaggerReveal = React.forwardRef<HTMLDivElement, StaggerRevealProps>(
  ({ children, className, staggerMs = STAGGER.cardMs }, ref) => {
    const reducedMotion = useReducedMotionSafe()
    return (
      <div ref={ref} className={cn(className)}>
        {React.Children.map(children, (child, index) => (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={getStaggerItemVariants(reducedMotion)}
            custom={getStaggerDelayMs(index, staggerMs)}
          >
            {child}
          </motion.div>
        ))}
      </div>
    )
  },
)
StaggerReveal.displayName = 'StaggerReveal'
