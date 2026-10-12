import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export type StatusDotState = 'working' | 'needs-you' | 'idle' | 'done'

const statusDotVariants = cva('inline-block size-2 shrink-0 rounded-full', {
  variants: {
    state: {
      working: 'bg-success',
      'needs-you': 'bg-warning',
      idle: 'bg-muted-foreground',
      done: 'bg-muted-foreground opacity-60',
    },
  },
  defaultVariants: { state: 'working' },
})

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusDotVariants> {
  /** Accessible name. Omitted: the dot is decorative (`aria-hidden`). Given: `role="img"`. */
  readonly label?: string
}

export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, state, label, ...props }, ref) => (
    <span
      ref={ref}
      {...(label === undefined
        ? { 'aria-hidden': true as const }
        : { role: 'img', 'aria-label': label })}
      className={cn(statusDotVariants({ state }), className)}
      {...props}
    />
  ),
)
StatusDot.displayName = 'StatusDot'

export { statusDotVariants }
