import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SparkbarsProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * One bar per value (e.g. daily spend). Heights scale to this row's own max. Zero draws a muted
   * stub; negative or non-finite values also draw the stub and read as "no data" in the title and
   * summary, never as the raw value.
   */
  readonly values: ReadonlyArray<number>
  /** Per-value names (e.g. `Oct 8`) for the hover title and the accessible summary. */
  readonly labels?: ReadonlyArray<string>
  /** Formats a value for the title and summary; defaults to `String`. */
  readonly format?: (value: number) => string
  /** Names the series in the accessible summary (`Spend by day: Oct 8 $0.00, …`). */
  readonly name?: string
}

const NO_DATA = 'no data'

const usable = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0)

/** A ~20px inline bar strip for a table cell; a zero value is a muted stub. */
export const Sparkbars = React.forwardRef<HTMLSpanElement, SparkbarsProps>(function Sparkbars(
  { values, labels, format = String, name = 'Values', className, ...props },
  ref,
) {
  const max = Math.max(0, ...values.map(usable))
  const entries = values.map((value, i) => ({
    label: labels?.[i],
    text: Number.isFinite(value) && value >= 0 ? format(value) : NO_DATA,
  }))
  const summary =
    entries.length === 0
      ? `${name}: no values`
      : `${name}: ${entries.map((e) => (e.label ? `${e.label} ${e.text}` : e.text)).join(', ')}`
  const title = entries.map((e) => (e.label ? `${e.label}: ${e.text}` : e.text)).join('\n')

  return (
    <span
      {...props}
      ref={ref}
      role="img"
      aria-label={summary}
      title={title}
      className={cn('inline-flex h-5 items-end gap-0.5 align-middle', className)}
    >
      {values.map((value, i) =>
        usable(value) === 0 ? (
          <span
            key={i}
            data-spark=""
            data-zero="true"
            aria-hidden="true"
            className="h-0.5 w-1.5 rounded-[1px] bg-muted-foreground/30"
          />
        ) : (
          <span
            key={i}
            data-spark=""
            aria-hidden="true"
            className="w-1.5 min-h-[3px] rounded-[1px] bg-chart-1"
            style={{ height: `${(usable(value) / max) * 100}%` }}
          />
        ),
      )}
    </span>
  )
})
Sparkbars.displayName = 'Sparkbars'
