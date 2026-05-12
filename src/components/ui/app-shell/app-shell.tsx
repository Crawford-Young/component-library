import * as React from 'react'
import { cn } from '@/lib/utils'

interface AppShellProps {
  readonly sidebar: React.ReactNode
  readonly topbar: React.ReactNode
  readonly children: React.ReactNode
  readonly className?: string
}

export function AppShell({
  sidebar,
  topbar,
  children,
  className,
}: AppShellProps): React.JSX.Element {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-background', className)}>
      {sidebar}
      <div className="flex flex-1 flex-col overflow-hidden">
        {topbar}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
