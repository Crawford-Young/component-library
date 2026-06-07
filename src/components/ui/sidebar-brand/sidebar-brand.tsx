'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { SidebarContext } from '@/components/ui/sidebar/sidebar-context'

export interface SidebarBrandProps {
  readonly logo: React.ReactNode
  readonly title: string
  readonly className?: string
}

export function SidebarBrand({ logo, title, className }: SidebarBrandProps): React.JSX.Element {
  const { collapsed } = React.useContext(SidebarContext)

  return (
    <div
      className={cn(
        'border-border flex h-14 shrink-0 items-center border-b transition-all duration-200',
        collapsed ? 'justify-center px-0' : 'gap-2.5 px-4',
        className,
      )}
    >
      <span className="shrink-0">{logo}</span>
      <span
        className={cn(
          'text-foreground text-sm font-bold transition-all duration-200',
          collapsed ? 'w-0 overflow-hidden opacity-0' : 'flex-1 truncate',
        )}
      >
        {title}
      </span>
    </div>
  )
}
