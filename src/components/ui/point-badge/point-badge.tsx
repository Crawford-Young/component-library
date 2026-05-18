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
        'inline-flex items-center rounded-full px-2.5 py-1',
        'bg-amber-500/15 ring-1 ring-amber-500/30',
        'text-xs font-bold text-amber-600 dark:text-amber-400',
        className,
      )}
    >
      +{points} pts
    </span>
  )
}
