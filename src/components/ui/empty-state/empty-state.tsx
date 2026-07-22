import * as React from 'react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  readonly message: string
  readonly icon?: React.ReactNode
  readonly ctaLabel?: string
  readonly onCtaClick?: () => void
  readonly renderCta?: () => React.ReactNode
  readonly className?: string
}

export function EmptyState({
  message,
  icon,
  ctaLabel,
  onCtaClick,
  renderCta,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}
    >
      {icon !== undefined && (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground/50 [&>svg]:h-7 [&>svg]:w-7"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
      {renderCta !== undefined
        ? renderCta()
        : ctaLabel !== undefined &&
          onCtaClick !== undefined && (
            <button
              type="button"
              onClick={onCtaClick}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ctaLabel}
            </button>
          )}
    </div>
  )
}
