'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { MOTION } from '@/lib/motion'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

export interface SplashQuote {
  readonly text: string
  readonly attribution: string | null
}

type Phase = 'initial' | 'split' | 'signal' | 'done'

const SIGNAL_HOLD_MS = 1000 // choreography dwell on the final glowed state (no MOTION token this long)
const DEFAULT_DURATIONS: Record<Exclude<Phase, 'done'>, number> = {
  initial: MOTION.slow, // 400
  split: MOTION.hero, // 600
  signal: SIGNAL_HOLD_MS,
}
const REDUCED_MOTION_SCALE = 0.5
const EXIT_MS = MOTION.base // 250 — overlay fade-out before unmount

export interface BrandSplashProps {
  readonly wordmark: string
  readonly splitIndex: number
  readonly possessive?: boolean
  readonly quote?: SplashQuote
  readonly signal?: 'glow' | 'dim' | 'none'
  readonly onComplete: () => void
  readonly durations?: Partial<Record<Exclude<Phase, 'done'>, number>>
  readonly handoffName?: string
  readonly exit?: 'fade' | 'external'
}

export function BrandSplash({
  wordmark,
  splitIndex,
  possessive = true,
  quote,
  signal = 'glow',
  onComplete,
  durations,
  handoffName,
  exit = 'fade',
}: BrandSplashProps): React.JSX.Element | null {
  const [phase, setPhase] = React.useState<Phase>('initial')
  const [hidden, setHidden] = React.useState(false)
  const reduced = usePrefersReducedMotion()

  const scale = reduced ? REDUCED_MOTION_SCALE : 1
  const ms = {
    initial: (durations?.initial ?? DEFAULT_DURATIONS.initial) * scale,
    split: (durations?.split ?? DEFAULT_DURATIONS.split) * scale,
    signal: signal === 'none' ? 0 : (durations?.signal ?? DEFAULT_DURATIONS.signal) * scale,
  }

  React.useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('split'), ms.initial),
      setTimeout(() => setPhase(signal === 'none' ? 'done' : 'signal'), ms.initial + ms.split),
    ]
    if (signal !== 'none') {
      timers.push(setTimeout(() => setPhase('done'), ms.initial + ms.split + ms.signal))
    }
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timers configured once on mount
  }, [])

  const completed = React.useRef(false)
  React.useEffect(() => {
    if (phase === 'done' && !completed.current) {
      completed.current = true
      onComplete()
      // external exit: hold the final frame — the consumer's view transition
      // (startBrandHandoff) owns removal
      if (exit === 'external') return
      const t = setTimeout(() => setHidden(true), EXIT_MS * scale)
      return () => clearTimeout(t)
    }
  }, [phase, onComplete, scale, exit])

  if (hidden) return null

  const left = wordmark.slice(0, splitIndex)
  const right = wordmark.slice(splitIndex)
  // hold the split + signal visual through the exit fade so it doesn't snap back to joined
  const isSplit = phase === 'split' || phase === 'signal' || phase === 'done'
  const isSignal = phase === 'signal' || phase === 'done'
  const slide = reduced ? '' : 'transition-transform duration-hero ease-in-out'

  return (
    <div
      role="status"
      aria-label={`Loading ${wordmark}`}
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background',
        'motion-safe:transition-opacity motion-safe:duration-base motion-safe:ease-exit',
        phase === 'done' && exit === 'fade' ? 'opacity-0' : 'opacity-100',
      )}
    >
      <div
        data-wordmark="true"
        style={handoffName !== undefined ? { viewTransitionName: handoffName } : undefined}
        className="flex select-none items-center text-7xl font-bold tracking-[-0.04em] text-foreground motion-safe:animate-brand-enter"
      >
        <span
          className={cn('relative inline-block', slide, isSplit && !reduced && '-translate-x-8')}
        >
          <span>{left}</span>
          {possessive ? (
            <span
              data-possessive="true"
              aria-hidden={!isSignal}
              className="absolute left-full top-0 motion-safe:transition-opacity motion-safe:duration-base motion-safe:ease-out"
              style={{ opacity: isSignal ? 1 : 0 }}
            >
              {"'s"}
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            'inline-block',
            slide,
            isSplit && !reduced && 'translate-x-8',
            isSignal &&
              signal === 'glow' &&
              'text-accent drop-shadow-[0_0_20px_rgb(var(--accent)/0.8)]',
            isSignal && signal === 'dim' && 'opacity-40 transition-opacity duration-base ease-out',
          )}
        >
          {right}
        </span>
      </div>
      {quote ? (
        <div
          data-quote="true"
          className="flex max-w-sm flex-col items-center gap-1 px-8 text-center motion-safe:transition-opacity motion-safe:duration-slow motion-safe:ease-out"
          style={{ opacity: isSplit ? 1 : 0 }}
        >
          <p className="text-sm italic leading-relaxed text-muted-foreground">{quote.text}</p>
          {quote.attribution ? (
            <p className="text-xs text-muted-foreground">— {quote.attribution}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
