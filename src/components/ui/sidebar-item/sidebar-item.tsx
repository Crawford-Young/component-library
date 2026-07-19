'use client'
import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { SidebarContext } from '@/components/ui/sidebar/sidebar-context'

export interface SidebarItemProps {
  readonly icon: React.ReactNode
  readonly label: string
  readonly href: string
  readonly isActive?: boolean
  readonly className?: string
  /** Render the consumer's element (e.g. a framework Link) instead of an
      anchor. Item classes + aria-current merge onto the child; the internal
      icon/label markup injects inside it. The child owns navigation (href). */
  readonly asChild?: boolean
  readonly children?: React.ReactNode
}

export function SidebarItem({
  icon,
  label,
  href,
  isActive = false,
  className,
  asChild = false,
  children,
}: SidebarItemProps): React.JSX.Element {
  const { collapsed } = React.useContext(SidebarContext)
  const Comp = asChild ? Slot : 'a'

  return (
    <Comp
      {...(asChild ? {} : { href })}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
    >
      {asChild ? <Slottable>{children}</Slottable> : null}
      {/* Fixed-width slot matches collapsed sidebar width — icon never moves */}
      <span className="flex h-9 w-10 shrink-0 items-center justify-center" aria-hidden="true">
        <span className="h-4 w-4">{icon}</span>
      </span>
      <span
        className={cn(
          'truncate transition-all duration-200',
          collapsed ? 'w-0 overflow-hidden opacity-0' : 'flex-1 pr-3',
        )}
      >
        {label}
      </span>
    </Comp>
  )
}
