import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  readonly title: string
  readonly action?: React.ReactNode
  readonly className?: string
}

export function PageHeader({ title, action, className }: PageHeaderProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center justify-between pb-4', className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {action !== undefined && <div>{action}</div>}
    </div>
  )
}
