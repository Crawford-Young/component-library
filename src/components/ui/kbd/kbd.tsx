import * as React from 'react'
import { cn } from '@/lib/utils'

const kbdClass =
  'inline-flex items-center rounded-[--radius-sm] border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground'

export interface KbdProps {
  children?: React.ReactNode
  keys?: string[]
  className?: string
}

export function Kbd({ children, keys, className }: KbdProps) {
  if (keys) {
    return (
      <span className={cn('inline-flex items-center gap-1', className)}>
        {keys.map((key, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-muted-foreground">+</span>}
            <kbd className={kbdClass}>{key}</kbd>
          </React.Fragment>
        ))}
      </span>
    )
  }
  return <kbd className={cn(kbdClass, className)}>{children}</kbd>
}
