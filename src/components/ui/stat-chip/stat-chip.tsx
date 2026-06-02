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
        'flex flex-col items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5',
        className,
      )}
    >
      <span className="text-base font-bold tabular-nums text-foreground">{value}</span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
