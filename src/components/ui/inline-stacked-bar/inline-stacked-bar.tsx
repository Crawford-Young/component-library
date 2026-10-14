import * as React from 'react'
import { cn } from '@/lib/utils'
import { swatchClass } from '../chart-parts/chart-parts'

/** Which `--chart-n` token colours a segment. The caller picks it so a series keeps its colour across rows. */
export type ChartToken = 1 | 2 | 3 | 4 | 5 | 6

export interface InlineStackedBarSegment {
  readonly key: string
  /** Names the segment in the hover title and the accessible summary. */
  readonly label: string
  /** Zero, negative or non-finite values draw no segment. */
  readonly value: number
  /** An integer 1..6. Anything else (0, 7, NaN, 1.5) draws a neutral `bg-muted-foreground` fill. */
  readonly color: ChartToken
}

export interface InlineStackedBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  readonly segments: ReadonlyArray<InlineStackedBarSegment>
  /** Formats a segment value for the title and summary; defaults to `String`. */
  readonly format?: (value: number) => string
  /** Names the breakdown in the accessible summary (`By model: …`). */
  readonly name?: string
  /** Optional text line under the bar. */
  readonly label?: React.ReactNode
}

const isToken = (color: number): color is ChartToken =>
  Number.isInteger(color) && color >= 1 && color <= 6

const colorClass = (color: number): string =>
  isToken(color) ? swatchClass(color - 1) : 'bg-muted-foreground'

/** Whole percents of the given fractions (summing to 1) that add up to exactly 100. */
const largestRemainder = (fractions: ReadonlyArray<number>): number[] => {
  const exact = fractions.map((f) => f * 100)
  const floors = exact.map(Math.floor)
  const byRemainder = exact
    .map((e, i) => ({ i, rest: e - floors[i] }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i)
  const spare = 100 - floors.reduce((a, b) => a + b, 0)
  for (const { i } of byRemainder.slice(0, spare)) floors[i] += 1
  return floors
}

/** A thin (8px) rounded bar split into segments by share, for a table cell. */
export const InlineStackedBar = React.forwardRef<HTMLDivElement, InlineStackedBarProps>(
  function InlineStackedBar(
    { segments, format = String, name = 'Breakdown', label, className, ...props },
    ref,
  ) {
    const drawn = segments.filter((s) => Number.isFinite(s.value) && s.value > 0)
    const total = drawn.reduce((sum, s) => sum + s.value, 0)
    const percents = largestRemainder(drawn.map((s) => s.value / total))
    const entries = drawn.map((s, i) => ({
      ...s,
      share: (s.value / total) * 100,
      text: `${format(s.value)} (${percents[i] === 0 ? '<1' : percents[i]}%)`,
    }))
    const summary =
      entries.length === 0
        ? `${name}: no values`
        : `${name}: ${entries.map((e) => `${e.label} ${e.text}`).join(', ')}`

    return (
      <div
        {...props}
        ref={ref}
        title={entries.map((e) => `${e.label}: ${e.text}`).join('\n')}
        className={cn('inline-grid w-32 gap-1', className)}
      >
        <div
          role="img"
          aria-label={summary}
          className="flex h-2 overflow-hidden rounded-full bg-muted"
        >
          {entries.map((e) => (
            <span
              key={e.key}
              data-segment=""
              className={cn('block h-full', colorClass(e.color))}
              style={{ width: `${e.share}%` }}
            />
          ))}
        </div>
        {label === undefined ? null : (
          <span className="text-[11px] text-muted-foreground">{label}</span>
        )}
      </div>
    )
  },
)
InlineStackedBar.displayName = 'InlineStackedBar'
