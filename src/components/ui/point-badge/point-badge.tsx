import * as React from 'react'
import { cn } from '@/lib/utils'

interface PointBadgeProps {
  readonly points: number
  readonly className?: string
}

export function PointBadge({ points, className }: PointBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-accent-subtle px-2 py-0.5',
        'text-xs font-semibold text-accent-subtle-foreground',
        className,
      )}
    >
      +{points} pts
    </span>
  )
}
