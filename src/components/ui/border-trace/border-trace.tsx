import * as React from 'react'
import { cn } from '@/lib/utils'

const SIZE_PX = { xs: 12, sm: 16, md: 24, lg: 32 } as const
const TRACE_SEGMENT = '25 75' // 25% of normalized path length
const STROKE_WIDTH: Record<keyof typeof SIZE_PX, number> = { xs: 0, sm: 1.5, md: 2, lg: 2 }

export interface BorderTraceProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly size?: keyof typeof SIZE_PX
  readonly shape?: 'square' | 'circle'
  readonly label?: string
}

export function BorderTrace({
  size = 'md',
  shape = 'square',
  label = 'Loading',
  className,
  ...props
}: BorderTraceProps): React.JSX.Element {
  const px = SIZE_PX[size]

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
              className="stroke-accent motion-safe:animate-trace"
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
              className="stroke-accent motion-safe:animate-trace"
              strokeWidth={sw}
            />
          </>
        )}
      </svg>
    </span>
  )
}
