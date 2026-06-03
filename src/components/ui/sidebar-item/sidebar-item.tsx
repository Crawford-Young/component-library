'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { SidebarContext } from '@/components/ui/sidebar/sidebar-context'

export interface SidebarItemProps {
  readonly icon: React.ReactNode
  readonly label: string
  readonly href: string
  readonly isActive?: boolean
  readonly className?: string
}

export function SidebarItem({
  icon,
  label,
  href,
  isActive = false,
  className,
}: SidebarItemProps): React.JSX.Element {
  const { collapsed } = React.useContext(SidebarContext)

  return (
    <a
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-2',
        className,
      )}
    >
      <span className="h-4 w-4 shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span
        className={cn(
          'truncate transition-all duration-200',
          collapsed ? 'w-0 overflow-hidden opacity-0' : 'flex-1',
        )}
      >
        {label}
      </span>
    </a>
  )
}
