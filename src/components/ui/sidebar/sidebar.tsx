import * as React from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  readonly children: React.ReactNode
  readonly footer?: React.ReactNode
  readonly className?: string
}

export function Sidebar({ children, footer, className }: SidebarProps): React.JSX.Element {
  return (
    <aside className={cn('flex h-full w-64 flex-col border-r border-border bg-surface', className)}>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Main navigation">
        {children}
      </nav>
      {footer !== undefined && <div className="border-t border-border p-2">{footer}</div>}
    </aside>
  )
}
