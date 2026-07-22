import * as React from 'react'
import { cn } from '@/lib/utils'

export interface HeroCardProps {
  readonly headline: string
  readonly subtitle: string
  readonly ctaLabel?: string
  readonly onCtaClick?: () => void
  readonly renderCta?: () => React.ReactNode
  readonly className?: string
}

export function HeroCard({
  headline,
  subtitle,
  ctaLabel,
  onCtaClick,
  renderCta,
  className,
}: HeroCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-surface p-6 shadow-md ring-1 ring-border',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-accent/5 blur-xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-5">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{headline}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
        {renderCta !== undefined
          ? renderCta()
          : ctaLabel !== undefined &&
            onCtaClick !== undefined && (
              <button
                type="button"
                onClick={onCtaClick}
                className="self-start rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent-hover hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {ctaLabel}
              </button>
            )}
      </div>
    </div>
  )
}
