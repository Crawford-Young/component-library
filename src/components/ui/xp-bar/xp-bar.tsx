import * as React from 'react'
import { cn } from '@/lib/utils'

interface XpBarProps {
  readonly levelName: string
  readonly currentXp: number
  readonly maxXp: number
  readonly className?: string
}

export function XpBar({ levelName, currentXp, maxXp, className }: XpBarProps): React.JSX.Element {
  const pct = Math.min(100, Math.round((currentXp / maxXp) * 100))

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{levelName}</span>
        <span className="text-xs text-muted-foreground">
          {currentXp} / {maxXp} pts
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          data-testid="xp-indicator"
          className="h-full rounded-full bg-accent transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={currentXp}
          aria-valuemin={0}
          aria-valuemax={maxXp}
          aria-label={`${levelName} — ${currentXp} of ${maxXp} points`}
        />
      </div>
    </div>
  )
}
