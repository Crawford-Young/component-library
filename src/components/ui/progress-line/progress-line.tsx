'use client'

/* ProgressLine — loading Pattern 2, Cinematic Progress (docs/brand/motion.md §5).
   2px line fixed at the top of the viewport, driven by the `active` prop:
   fill 0→60% fast, crawl →90% and hold, snap to 100% + fade when active drops. */

import * as React from 'react'
import { EASE_CSS } from '@/lib/motion'
import { useReducedMotionSafe } from '@/lib/use-reduced-motion-safe'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'fill' | 'crawl' | 'complete' | 'fade'
type ActivePhase = Exclude<Phase, 'idle'>

const FILL_MS = 300
const CRAWL_MS = 8000
const COMPLETE_MS = 150
const FADE_MS = 200

const PHASE_WIDTH_PCT: Record<ActivePhase, number> = {
  fill: 60,
  crawl: 90,
  complete: 100,
  fade: 100,
}

const PHASE_DURATION_MS: Record<ActivePhase, number> = {
  fill: FILL_MS,
  crawl: CRAWL_MS,
  complete: COMPLETE_MS,
  fade: FADE_MS,
}

const PHASE_FLOW: Partial<Record<Phase, { next: Phase; afterMs: number }>> = {
  fill: { next: 'crawl', afterMs: FILL_MS },
  complete: { next: 'fade', afterMs: COMPLETE_MS },
  fade: { next: 'idle', afterMs: FADE_MS },
}

export interface ProgressLineProps {
  /** True while navigation/loading is in flight. */
  readonly active: boolean
  readonly className?: string
  readonly label?: string
}

export function ProgressLine({ active, className, label = 'Loading' }: ProgressLineProps) {
  const reducedMotion = useReducedMotionSafe()
  const [phase, setPhase] = React.useState<Phase>('idle')

  React.useEffect(() => {
    if (active) {
      setPhase('fill')
      return
    }
    setPhase((prev) => (prev === 'fill' || prev === 'crawl' ? 'complete' : prev))
  }, [active])

  React.useEffect(() => {
    const flow = PHASE_FLOW[phase]
    if (!flow) return undefined
    const timer = setTimeout(() => setPhase(flow.next), flow.afterMs)
    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'idle') return null

  const easing = phase === 'fill' && !reducedMotion ? EASE_CSS.out : 'linear'

  return (
    <div
      role="progressbar"
      aria-label={label}
      className={cn('pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5', className)}
      style={{ opacity: phase === 'fade' ? 0 : 1, transition: `opacity ${FADE_MS}ms linear` }}
    >
      <div
        className="h-full bg-accent"
        style={{
          width: `${PHASE_WIDTH_PCT[phase]}%`,
          transition: `width ${PHASE_DURATION_MS[phase]}ms ${easing}`,
        }}
      />
    </div>
  )
}
