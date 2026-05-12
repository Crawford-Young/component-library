import * as React from 'react'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  readonly label: string
  readonly isSelected: boolean
  readonly onClick: () => void
  readonly className?: string
}

export function FilterChip({
  label,
  isSelected,
  onClick,
  className,
}: FilterChipProps): React.JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'bg-accent text-accent-foreground'
          : 'border border-border bg-transparent text-muted-foreground hover:bg-item-hover hover:text-foreground',
        className,
      )}
    >
      {label}
    </button>
  )
}
