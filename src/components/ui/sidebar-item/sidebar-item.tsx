import * as React from 'react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
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
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'border-l-2 border-accent bg-accent-subtle text-accent-subtle-foreground'
          : 'text-muted-foreground hover:bg-item-hover hover:text-foreground',
        className,
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="h-4 w-4 shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </a>
  )
}
