import * as React from 'react'
import { cn } from '@/lib/utils'

interface HeroCardProps {
  readonly headline: string
  readonly subtitle: string
  readonly ctaLabel: string
  readonly onCtaClick: () => void
  readonly className?: string
}

export function HeroCard({
  headline,
  subtitle,
  ctaLabel,
  onCtaClick,
  className,
}: HeroCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg border-l-4 border-accent bg-surface p-6 shadow-sm',
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{headline}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onCtaClick}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {ctaLabel}
      </button>
    </div>
  )
}
