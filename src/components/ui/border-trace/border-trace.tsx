'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

const SIZE_PX = { xs: 12, sm: 16, md: 24, lg: 32 } as const
const TRACE_SEGMENT = '25 75' // 25% of normalized path length
const STROKE_WIDTH: Record<keyof typeof SIZE_PX, number> = { xs: 0, sm: 1.5, md: 2, lg: 2 }
const DEFAULT_APPEAR_DELAY_MS = 150 // MOTION.fast — suppress the flash on sub-threshold waits

/** True once `delayMs` has elapsed since the gate became active; false while waiting or inactive. */
function useAppeared(active: boolean, delayMs: number): boolean {
  const [appeared, setAppeared] = React.useState(delayMs <= 0 && active)
  React.useEffect(() => {
    if (!active) {
      setAppeared(false)
      return
    }
    if (delayMs <= 0) {
      setAppeared(true)
      return
    }
    setAppeared(false)
    const t = setTimeout(() => setAppeared(true), delayMs)
    return () => clearTimeout(t)
  }, [active, delayMs])
  return appeared
}

export interface BorderTraceProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly size?: keyof typeof SIZE_PX
  readonly shape?: 'square' | 'circle'
  readonly label?: string
  readonly appearDelayMs?: number
}

export function BorderTrace({
  size = 'md',
  shape = 'square',
  label = 'Loading',
  appearDelayMs = DEFAULT_APPEAR_DELAY_MS,
  className,
  ...props
}: BorderTraceProps): React.JSX.Element | null {
  const appeared = useAppeared(true, appearDelayMs)
  const px = SIZE_PX[size]

  if (!appeared) return null

  if (size === 'xs') {
    return (
      <span
        role="status"
        aria-label={label}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <span
          data-trace-dot
          className="block h-1.5 w-1.5 rounded-full bg-accent opacity-100 motion-safe:animate-trace-dot"
        />
      </span>
    )
  }

  const sw = STROKE_WIDTH[size]
  const inset = sw / 2
  const traceProps = {
    pathLength: 100,
    strokeDasharray: TRACE_SEGMENT,
    fill: 'none',
    strokeLinecap: 'round',
  } as const

  return (
    <span role="status" aria-label={label} className={cn('inline-block', className)} {...props}>
      <svg width={px} height={px} aria-hidden="true">
        {shape === 'square' ? (
          <>
            <rect
              x={inset}
              y={inset}
              width={px - sw}
              height={px - sw}
              rx={4}
              fill="none"
              className="stroke-border"
              strokeWidth={sw}
            />
            <rect
              x={inset}
              y={inset}
              width={px - sw}
              height={px - sw}
              rx={4}
              {...traceProps}
              className="stroke-accent motion-safe:animate-trace motion-reduce:[stroke-dasharray:none]"
              strokeWidth={sw}
            />
          </>
        ) : (
          <>
            <circle
              cx={px / 2}
              cy={px / 2}
              r={px / 2 - inset}
              fill="none"
              className="stroke-border"
              strokeWidth={sw}
            />
            <circle
              cx={px / 2}
              cy={px / 2}
              r={px / 2 - inset}
              {...traceProps}
              className="stroke-accent motion-safe:animate-trace motion-reduce:[stroke-dasharray:none]"
              strokeWidth={sw}
            />
          </>
        )}
      </svg>
    </span>
  )
}

export interface TraceBorderProps {
  readonly active: boolean
  readonly shape?: 'square' | 'circle'
  readonly label?: string
  readonly appearDelayMs?: number
  readonly children: React.ReactNode
}

const WRAPPER_STROKE = 2

export function TraceBorder({
  active,
  shape = 'square',
  label = 'Loading',
  appearDelayMs = DEFAULT_APPEAR_DELAY_MS,
  children,
}: TraceBorderProps): React.JSX.Element {
  const appeared = useAppeared(active, appearDelayMs)
  return (
    <span className="relative inline-block [&>*]:align-top">
      {children}
      {active && appeared ? (
        <>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            {shape === 'square' ? (
              <rect
                x={0}
                y={0}
                width="100%"
                height="100%"
                rx={8}
                pathLength={100}
                strokeDasharray="25 75"
                fill="none"
                strokeLinecap="round"
                className="stroke-accent motion-safe:animate-trace"
                strokeWidth={WRAPPER_STROKE}
              />
            ) : (
              <circle
                cx="50%"
                cy="50%"
                r="50%"
                pathLength={100}
                strokeDasharray="25 75"
                fill="none"
                strokeLinecap="round"
                className="stroke-accent motion-safe:animate-trace"
                strokeWidth={WRAPPER_STROKE}
              />
            )}
          </svg>
          <span role="status" aria-live="polite" className="sr-only">
            {label}
          </span>
        </>
      ) : null}
    </span>
  )
}
