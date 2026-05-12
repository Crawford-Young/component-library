import * as React from 'react'
import { cn } from '@/lib/utils'

interface StatChipProps {
  readonly label: string
  readonly value: string
  readonly className?: string
}

export function StatChip({ label, value, className }: StatChipProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5',
        className,
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  )
}
