import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface StatTileDelta {
  /** Signed fraction change versus the comparison (-0.12 = down 12%). Absent or not finite: flat text. */
  readonly change?: number
  /** Which direction is an improvement; without it a change stays flat. */
  readonly goodWhen?: 'up' | 'down'
  /** The comparison, e.g. `vs $8.63`; shown after the percentage. */
  readonly label: React.ReactNode
}

interface StatTileBaseProps extends Omit<React.HTMLAttributes<HTMLDListElement>, 'children'> {
  readonly label: React.ReactNode
  readonly delta?: StatTileDelta
  readonly hint?: React.ReactNode
  /** Mutes the value, for a real zero. */
  readonly muted?: boolean
}

/** Either a `value`, or an `unavailable` reason that stands in for it (and hides the delta). */
type StatTileValueProps =
  | { readonly value: React.ReactNode; readonly unavailable?: undefined }
  | { readonly value?: undefined; readonly unavailable: React.ReactNode }

export type StatTileProps = StatTileBaseProps & StatTileValueProps

type Tone = 'good' | 'bad' | 'flat'

const deltaVariants = cva('m-0 text-xs tabular-nums', {
  variants: {
    tone: { good: 'text-success', bad: 'text-warning', flat: 'text-muted-foreground' },
  },
})

const valueVariants = cva('m-0 tabular-nums', {
  variants: {
    size: { value: 'text-xl font-semibold', reason: 'text-sm font-medium' },
    muted: { true: 'text-muted-foreground', false: '' },
  },
})

const TONE_WORDS: Record<Tone, string> = { good: ', better', bad: ', worse', flat: '' }

const toneOf = (change: number, goodWhen: StatTileDelta['goodWhen']): Tone => {
  if (goodWhen === undefined) return 'flat'
  return change > 0 === (goodWhen === 'up') ? 'good' : 'bad'
}

function DeltaRow({ delta }: { readonly delta: StatTileDelta }): React.JSX.Element {
  const { change } = delta
  const percent =
    change === undefined || !Number.isFinite(change) ? 0 : Math.round(Math.abs(change) * 100)
  if (change === undefined || percent === 0) {
    return <dd className={deltaVariants({ tone: 'flat' })}>{delta.label}</dd>
  }
  const tone = toneOf(change, delta.goodWhen)
  return (
    <dd className={deltaVariants({ tone })}>
      <span aria-hidden="true">{change > 0 ? '▲' : '▼'}</span>
      <span className="sr-only">{change > 0 ? 'up ' : 'down '}</span> {percent}% {delta.label}
      {tone !== 'flat' && <span className="sr-only">{TONE_WORDS[tone]}</span>}
    </dd>
  )
}

export const StatTile = React.forwardRef<HTMLDListElement, StatTileProps>(
  ({ label, value, delta, hint, unavailable, muted = false, className, ...props }, ref) => {
    const hasReason = unavailable !== undefined
    return (
      <dl
        ref={ref}
        className={cn(
          'm-0 grid min-w-0 content-start gap-0.5 rounded-lg border border-border bg-surface px-3.5 py-2.5',
          className,
        )}
        {...props}
      >
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd
          className={valueVariants({
            size: hasReason ? 'reason' : 'value',
            muted: hasReason || muted,
          })}
        >
          {hasReason ? unavailable : value}
        </dd>
        {!hasReason && delta !== undefined && <DeltaRow delta={delta} />}
        {hint !== undefined && <dd className="m-0 text-[11px] text-muted-foreground">{hint}</dd>}
      </dl>
    )
  },
)
StatTile.displayName = 'StatTile'
