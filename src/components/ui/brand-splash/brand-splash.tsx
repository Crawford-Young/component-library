'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion'

export interface SplashQuote {
  readonly text: string
  readonly attribution: string | null
}

type Phase = 'initial' | 'split' | 'signal' | 'done'

const DEFAULT_DURATIONS: Record<Exclude<Phase, 'done'>, number> = {
  initial: 400,
  split: 600,
  signal: 800,
}
const REDUCED_MOTION_SCALE = 0.5

export interface BrandSplashProps {
  readonly wordmark: string
  readonly splitIndex: number
  readonly possessive?: boolean
  readonly quote?: SplashQuote
  readonly signal?: 'glow' | 'dim' | 'none'
  readonly onComplete: () => void
  readonly durations?: Partial<Record<Exclude<Phase, 'done'>, number>>
}

export function BrandSplash({
  wordmark,
  splitIndex,
  possessive = true,
  quote,
  signal = 'glow',
  onComplete,
  durations,
}: BrandSplashProps): React.JSX.Element | null {
  const [phase, setPhase] = React.useState<Phase>('initial')
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
    }
  }, [phase, onComplete])

  if (phase === 'done') return null

  const left = wordmark.slice(0, splitIndex)
  const right = wordmark.slice(splitIndex)
  const isSplit = phase === 'split' || phase === 'signal'
  const isSignal = phase === 'signal'
  const slide = reduced ? '' : 'transition-transform duration-500'

  return (
    <div
      role="status"
      aria-label={`Loading ${wordmark}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background"
    >
      <div className="flex items-baseline text-7xl font-bold tracking-[-0.04em] text-foreground">
        <span className={cn('inline-block', slide, isSplit && !reduced && '-translate-x-2')}>
          {left}
        </span>
        {possessive ? (
          <span
            className={cn(
              'inline-block transition-opacity duration-300',
              isSplit ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden={!isSplit}
          >
            {isSplit ? "'s" : null}
          </span>
        ) : null}
        <span
          className={cn(
            'inline-block',
            slide,
            isSplit && !reduced && 'translate-x-3',
            isSignal &&
              signal === 'glow' &&
              'text-accent drop-shadow-[0_0_12px_rgb(var(--accent)/0.5)] motion-safe:animate-pulse',
            isSignal && signal === 'dim' && 'opacity-40 transition-opacity duration-300',
          )}
        >
          {right}
        </span>
      </div>
      {quote ? (
        <div className="max-w-md text-center text-sm text-muted-foreground">
          <p>{quote.text}</p>
          {quote.attribution ? <p className="mt-1">— {quote.attribution}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
