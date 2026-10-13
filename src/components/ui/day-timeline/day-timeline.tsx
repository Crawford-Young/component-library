'use client'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS
const MINUTE_MS = 60_000
const AXIS_HOURS = [0, 6, 12, 18, 24] as const

/** A span category: its legend label, colour (by position, cycling `--chart-1…6`) and lane. */
export interface DayTimelineKind {
  readonly key: string
  readonly label: string
  /** `main` (default) is the top lane; `sub` is a bottom strip for runs that overlap main-lane time. */
  readonly lane?: 'main' | 'sub'
}

export interface DayTimelineSpan {
  /** Ms since the day's local midnight (0 to 86_400_000); values outside clip to the track. */
  readonly startMs: number
  readonly endMs: number
  /** `key` of an entry in `kinds`; spans with an unknown key are not drawn. */
  readonly kind: string
}

export interface DayTimelineMark {
  /** Ms since the day's local midnight. */
  readonly atMs: number
  readonly label: string
}

export interface DayTimelineDay {
  /** Day key, e.g. `2026-10-05`; formatted by `dayFormat`. Must be unique across `days`. */
  readonly day: string
  /**
   * Callers split spans at local midnight: a span running past 24:00 is clipped there, not
   * continued on the next row. Spans with `endMs < startMs` are dropped. Spans within one lane
   * are expected not to overlap; the bar draws them stacked on each other if they do.
   */
  readonly spans: ReadonlyArray<DayTimelineSpan>
  readonly marks: ReadonlyArray<DayTimelineMark>
}

export interface DayTimelineProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly days: ReadonlyArray<DayTimelineDay>
  /** Span categories, in legend order; colors cycle `--chart-1…6` by position. */
  readonly kinds: ReadonlyArray<DayTimelineKind>
  /** Formats the row label and table cell for each day key. */
  readonly dayFormat?: (day: string) => string
  readonly emptyMessage?: string
}

/** Literal class names so Tailwind's scanner sees them; keyed by the 1-based `--chart-n`. */
const CHART_BG = {
  1: 'bg-chart-1',
  2: 'bg-chart-2',
  3: 'bg-chart-3',
  4: 'bg-chart-4',
  5: 'bg-chart-5',
  6: 'bg-chart-6',
} as const

/**
 * Main-lane spans take the top half of the row, sub-lane spans a bottom strip.
 * `color` is the 1-based `--chart-n`.
 */
export const dayTimelineSpanVariants = cva('absolute rounded-sm', {
  variants: {
    lane: {
      main: 'top-0 h-3',
      sub: 'bottom-0 h-2',
    },
    color: CHART_BG,
  },
  defaultVariants: { lane: 'main' },
})

const PALETTE_SIZE = 6

const colorOf = (index: number): 1 | 2 | 3 | 4 | 5 | 6 =>
  ((index % PALETTE_SIZE) + 1) as 1 | 2 | 3 | 4 | 5 | 6

/** Shared width of the day-label column and the axis spacer so the tracks line up. */
const DAY_LABEL_COLUMN = 'w-20 shrink-0'

/** Axis labels at the track edges hang inward so they don't spill out of it. */
const axisLabelAlign = (hour: number): string =>
  hour === 0 ? '' : hour === 24 ? '-translate-x-full' : '-translate-x-1/2'

const clamp = (ms: number): number => Math.min(DAY_MS, Math.max(0, ms))

const pct = (ms: number): string => `${(clamp(ms) / DAY_MS) * 100}%`

const pad = (n: number): string => String(n).padStart(2, '0')

const clock = (ms: number): string => {
  const minutes = Math.floor(clamp(ms) / MINUTE_MS)
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

const duration = (startMs: number, endMs: number): string => {
  const minutes = Math.floor((clamp(endMs) - clamp(startMs)) / MINUTE_MS)
  if (minutes < 1) return '<1m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h > 0 ? `${h}h` : '', m > 0 ? `${m}m` : ''].filter(Boolean).join(' ')
}

const plural = (n: number, noun: string): string => `${n} ${noun}${n === 1 ? '' : 's'}`

const identity = (x: string): string => x

export const DayTimeline = React.forwardRef<HTMLDivElement, DayTimelineProps>(
  ({ days, kinds, dayFormat = identity, emptyMessage = 'No data', className, ...props }, ref) => {
    const kindIndex = new Map(kinds.map((k, i) => [k.key, i]))
    const drawn = days.map((d) => ({
      ...d,
      spans: d.spans.filter((s) => s.endMs >= s.startMs && kindIndex.has(s.kind)),
    }))
    const spanCount = drawn.reduce((n, d) => n + d.spans.length, 0)
    const markCount = drawn.reduce((n, d) => n + d.marks.length, 0)
    if (spanCount === 0 && markCount === 0) {
      return (
        <div ref={ref} className={className} {...props}>
          <EmptyState message={emptyMessage} />
        </div>
      )
    }
    const kindOf = (key: string): { kind: DayTimelineKind; index: number } => {
      const index = kindIndex.get(key)!
      return { kind: kinds[index], index }
    }
    return (
      <div ref={ref} className={cn('flex w-full flex-col gap-2', className)} {...props}>
        <div
          role="img"
          aria-label={`Day timeline: ${plural(days.length, 'day')}, ${plural(spanCount, 'span')}, ${plural(markCount, 'mark')}`}
          className="flex flex-col gap-1"
        >
          {drawn.map((d) => (
            <div key={d.day} className="flex items-center gap-2">
              <span className={cn(DAY_LABEL_COLUMN, 'text-xs text-foreground')}>
                {dayFormat(d.day)}
              </span>
              <div className="relative h-6 flex-1 rounded-sm bg-muted">
                {d.spans.map((s, i) => {
                  const { kind, index } = kindOf(s.kind)
                  const lane = kind.lane ?? 'main'
                  return (
                    <div
                      key={i}
                      data-span=""
                      data-kind={s.kind}
                      data-lane={lane}
                      title={`${kind.label}: ${clock(s.startMs)}–${clock(s.endMs)} (${duration(s.startMs, s.endMs)})`}
                      className={dayTimelineSpanVariants({ lane, color: colorOf(index) })}
                      style={{
                        left: pct(s.startMs),
                        width: pct(clamp(s.endMs) - clamp(s.startMs)),
                      }}
                    />
                  )
                })}
                {d.marks.map((m, i) => (
                  <div
                    key={i}
                    data-mark=""
                    title={`${m.label} · ${clock(m.atMs)}`}
                    className="absolute inset-y-0 flex w-3 -translate-x-1/2 justify-center"
                    style={{ left: pct(m.atMs) }}
                  >
                    <span data-mark-line="" aria-hidden="true" className="w-0.5 bg-foreground" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className={DAY_LABEL_COLUMN} />
            <div
              data-testid="day-timeline-axis"
              className="relative h-4 flex-1 text-xs text-muted-foreground"
            >
              {AXIS_HOURS.map((h) => (
                <span
                  key={h}
                  className={cn('absolute tabular-nums', axisLabelAlign(h))}
                  style={{ left: pct(h * HOUR_MS) }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
        <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground">
          {kinds.map((kind, i) => (
            <li key={kind.key} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn('inline-block h-2.5 w-2.5 rounded-sm', CHART_BG[colorOf(i)])}
              />
              {kind.label}
            </li>
          ))}
        </ul>
        <table className="sr-only">
          <thead>
            <tr>
              <th>Day</th>
              <th>Kind</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {drawn.flatMap((d) => [
              ...d.spans.map((s, i) => (
                <tr key={`s${d.day}-${i}`}>
                  <td>{dayFormat(d.day)}</td>
                  <td>{kindOf(s.kind).kind.label}</td>
                  <td>{clock(s.startMs)}</td>
                  <td>{clock(s.endMs)}</td>
                </tr>
              )),
              ...d.marks.map((m, i) => (
                <tr key={`m${d.day}-${i}`}>
                  <td>{dayFormat(d.day)}</td>
                  <td>{m.label}</td>
                  <td>{clock(m.atMs)}</td>
                  <td />
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
    )
  },
)
DayTimeline.displayName = 'DayTimeline'
