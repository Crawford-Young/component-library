import * as React from 'react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  readonly logo?: React.ReactNode
  readonly title?: string
  readonly actions?: React.ReactNode
  readonly className?: string
}

export function TopBar({ logo, title, actions, className }: TopBarProps): React.JSX.Element {
  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {logo !== undefined && <span className="shrink-0">{logo}</span>}
        {title !== undefined && (
          <span className="text-sm font-semibold text-foreground">{title}</span>
        )}
      </div>
      {actions !== undefined && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
