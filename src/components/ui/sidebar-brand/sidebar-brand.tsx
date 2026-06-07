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
    <div className={cn('border-border flex h-14 shrink-0 items-center border-b', className)}>
      {/* Fixed-width slot matches collapsed sidebar width — logo never moves */}
      <span className="flex w-14 shrink-0 items-center justify-center">{logo}</span>
      <span
        className={cn(
          'text-foreground truncate text-sm font-bold transition-all duration-200',
          collapsed ? 'w-0 overflow-hidden opacity-0' : 'flex-1 pr-4',
        )}
      >
        {title}
      </span>
    </div>
  )
}
