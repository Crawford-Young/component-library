'use client'

/* MagneticButton — a hero CTA that magnetically pulls toward the cursor.
   Hero CTAs on cinematic surfaces only — see docs/brand/motion.md §6/§7.

   The wrapper span tracks pointer movement and drives a pull vector toward the
   cursor, clamped to MAX_PULL_PX, spring-smoothed on SPRING_MAGNETIC. On
   pointer leave the vector springs back to rest. The magnetic effect is
   suppressed — a plain Button is rendered with no wrapper or listeners — when
   the user prefers reduced motion or the pointer cannot hover (touch/coarse). */

import * as React from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Button, type ButtonProps } from '@/components/ui/button'
import { SPRING_MAGNETIC } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

/** Maximum distance in px the button is pulled toward the cursor. */
const MAX_PULL_PX = 8
/** Divisor to reach a rect's midpoint from its edge + extent. */
const HALF = 2

export const MagneticButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function MagneticButton(props, ref) {
    const reduced = usePrefersReducedMotion()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, SPRING_MAGNETIC)
    const springY = useSpring(y, SPRING_MAGNETIC)

    const handleMouseMove = React.useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / HALF)
        const dy = event.clientY - (rect.top + rect.height / HALF)
        const distance = Math.hypot(dx, dy)
        const scale = distance > MAX_PULL_PX ? MAX_PULL_PX / distance : 1
        x.set(dx * scale)
        y.set(dy * scale)
      },
      [x, y],
    )

    const handleMouseLeave = React.useCallback(() => {
      x.set(0)
      y.set(0)
    }, [x, y])

    const hoverCapable = window.matchMedia('(hover: hover)').matches

    if (reduced || !hoverCapable) {
      return <Button ref={ref} {...props} />
    }

    return (
      <motion.span
        className="inline-flex"
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Button ref={ref} {...props} />
      </motion.span>
    )
  },
)
MagneticButton.displayName = 'MagneticButton'
