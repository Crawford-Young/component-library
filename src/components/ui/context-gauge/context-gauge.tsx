import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type ContextGaugeTone = 'ok' | 'warn' | 'danger'

/** Pure tone mapping: >= hardStopAt is danger, >= nudgeAt is warn, else ok. */
export function contextGaugeTone(value: number, nudgeAt = 80, hardStopAt = 95): ContextGaugeTone {
  if (value >= hardStopAt) return 'danger'
  if (value >= nudgeAt) return 'warn'
  return 'ok'
}

const trackVariants = cva('block overflow-hidden rounded-full bg-surface-raised', {
  variants: {
    size: {
      sm: 'h-[3px] flex-1',
      md: 'h-1 w-24',
    },
  },
  defaultVariants: { size: 'sm' },
})

const fillVariants = cva('block h-full', {
  variants: {
    tone: { ok: 'bg-success', warn: 'bg-warning', danger: 'bg-destructive' },
  },
})

export interface ContextGaugeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Context used, 0-100. Out-of-range input is clamped. */
  readonly value: number
  /** Value at which the bar turns warning. */
  readonly nudgeAt?: number
  /** Value at which the bar turns destructive. */
  readonly hardStopAt?: number
  /** Shown after the bar, e.g. "62%". */
  readonly label?: React.ReactNode
  /** sm: 3px flexible track (nodes). md: 4px / 96px track (headers). */
  readonly size?: 'sm' | 'md'
}

export const ContextGauge = React.forwardRef<HTMLSpanElement, ContextGaugeProps>(
  function ContextGauge(
    {
      value,
      nudgeAt = 80,
      hardStopAt = 95,
      label,
      size,
      className,
      'aria-label': ariaLabel = 'Context used',
      ...props
    },
    ref,
  ) {
    const clamped = Number.isNaN(value) ? 0 : Math.min(100, Math.max(0, value))
    const tone = contextGaugeTone(clamped, nudgeAt, hardStopAt)
    return (
      <span
        ref={ref}
        className={cn(
          'flex items-center gap-1.5 text-[10.5px] tabular-nums text-muted-foreground',
          className,
        )}
        {...props}
      >
        <span
          role="meter"
          aria-label={ariaLabel}
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          className={trackVariants({ size })}
        >
          <span className={fillVariants({ tone })} style={{ width: `${clamped}%` }} />
        </span>
        {label}
      </span>
    )
  },
)

ContextGauge.displayName = 'ContextGauge'
