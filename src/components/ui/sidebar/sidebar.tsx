'use client'
import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarContext } from './sidebar-context'

export interface SidebarProps {
  readonly header?: React.ReactNode
  readonly collapsedHeader?: React.ReactNode
  readonly children: React.ReactNode
  readonly footer?: React.ReactNode
  readonly className?: string
}

export function Sidebar({
  header,
  collapsedHeader,
  children,
  footer,
  className,
}: SidebarProps): React.JSX.Element {
  const [collapsed, setCollapsed] = React.useState(() => {
    // localStorage is unavailable during SSR (not defined) and can throw in
    // privacy modes; guard the render-phase read so the component is SSR-safe.
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    } catch {
      return false
    }
  })

  function handleToggle(): void {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        aria-label="Main sidebar"
        className={cn(
          'flex h-full flex-col overflow-hidden border-r border-border bg-surface transition-all duration-200',
          collapsed ? 'w-14' : 'w-64',
          className,
        )}
      >
        {(header !== undefined || collapsedHeader !== undefined) && (
          <div className="shrink-0">
            {collapsed && collapsedHeader !== undefined ? collapsedHeader : header}
          </div>
        )}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Main navigation">
          {children}
        </nav>
        <div className="shrink-0 border-t border-border p-2">
          <button
            type="button"
            onClick={handleToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {footer !== undefined && (
          <div className="shrink-0 overflow-hidden border-t border-border p-2">{footer}</div>
        )}
      </aside>
    </SidebarContext.Provider>
  )
}
