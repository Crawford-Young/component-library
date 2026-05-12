import * as React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  readonly message: string
  readonly icon?: React.ReactNode
  readonly ctaLabel?: string
  readonly onCtaClick?: () => void
  readonly className?: string
}

export function EmptyState({
  message,
  icon,
  ctaLabel,
  onCtaClick,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}
    >
      {icon !== undefined && (
        <div className="text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
      {ctaLabel !== undefined && onCtaClick !== undefined && (
        <button
          type="button"
          onClick={onCtaClick}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
