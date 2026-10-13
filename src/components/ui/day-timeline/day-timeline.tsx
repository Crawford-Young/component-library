'use client'
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS
const MINUTE_MS = 60_000
const AXIS_HOURS = [0, 6, 12, 18, 24] as const

export type DayTimelineKind = 'active' | 'wait' | 'agent'

export interface DayTimelineSpan {
  /** Ms since the day's local midnight (0 to 86_400_000). */
  readonly startMs: number
  readonly endMs: number
  readonly kind: DayTimelineKind
}

export interface DayTimelineMark {
  /** Ms since the day's local midnight. */
  readonly atMs: number
  readonly label: string
}

export interface DayTimelineDay {
  /** Day key, e.g. `2026-10-05`; formatted by `dayFormat`. */
  readonly day: string
  readonly spans: ReadonlyArray<DayTimelineSpan>
  readonly marks: ReadonlyArray<DayTimelineMark>
}

export interface DayTimelineProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly days: ReadonlyArray<DayTimelineDay>
  /** Formats the row label and table cell for each day key. */
  readonly dayFormat?: (day: string) => string
  /** Overrides the legend, hover and table names per kind. */
  readonly kindLabels?: Partial<Record<DayTimelineKind, string>>
  readonly emptyMessage?: string
}

const DEFAULT_KIND_LABELS: Record<DayTimelineKind, string> = {
  active: 'Active',
  wait: 'Wait',
  agent: 'Agent',
}

const KINDS: ReadonlyArray<DayTimelineKind> = ['active', 'wait', 'agent']

/**
 * Active and wait share the main lane (top half of the row); agent runs get
 * their own lane (bottom strip) because they overlap active time.
 * Class strings are literal so Tailwind's scanner sees them.
 */
export const dayTimelineSpanVariants = cva('absolute rounded-sm', {
  variants: {
    kind: {
      active: 'top-0 h-3 bg-[rgb(var(--chart-1))]',
      wait: 'top-0 h-3 bg-[rgb(var(--chart-3))]',
      agent: 'bottom-0 h-2 bg-[rgb(var(--chart-2))]',
    },
  },
})

const LEGEND_SWATCH: Record<DayTimelineKind, string> = {
  active: 'bg-[rgb(var(--chart-1))]',
  wait: 'bg-[rgb(var(--chart-3))]',
  agent: 'bg-[rgb(var(--chart-2))]',
}

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
  (
    { days, dayFormat = identity, kindLabels, emptyMessage = 'No data', className, ...props },
    ref,
  ) => {
    const spanCount = days.reduce((n, d) => n + d.spans.length, 0)
    if (spanCount === 0) {
      return (
        <div ref={ref} className={className} {...props}>
          <EmptyState message={emptyMessage} />
        </div>
      )
    }
    const labels = { ...DEFAULT_KIND_LABELS, ...kindLabels }
    const markCount = days.reduce((n, d) => n + d.marks.length, 0)
    return (
      <div ref={ref} className={cn('flex w-full flex-col gap-2', className)} {...props}>
        <div
          role="img"
          aria-label={`Day timeline: ${plural(days.length, 'day')}, ${plural(spanCount, 'span')}, ${plural(markCount, 'mark')}`}
          className="flex flex-col gap-1"
        >
          {days.map((d) => (
            <div key={d.day} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs text-foreground">{dayFormat(d.day)}</span>
              <div className="relative h-6 flex-1 rounded-sm bg-muted">
                {d.spans.map((s, i) => (
                  <div
                    key={i}
                    data-span=""
                    data-kind={s.kind}
                    data-lane={s.kind === 'agent' ? 'agent' : 'main'}
                    title={`${labels[s.kind]}: ${clock(s.startMs)}–${clock(s.endMs)} (${duration(s.startMs, s.endMs)})`}
                    className={dayTimelineSpanVariants({ kind: s.kind })}
                    style={{ left: pct(s.startMs), width: pct(clamp(s.endMs) - clamp(s.startMs)) }}
                  />
                ))}
                {d.marks.map((m, i) => (
                  <div
                    key={i}
                    data-mark=""
                    title={`${m.label} · ${clock(m.atMs)}`}
                    className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-foreground"
                    style={{ left: pct(m.atMs) }}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="w-20 shrink-0" />
            <div
              data-testid="day-timeline-axis"
              className="relative h-4 flex-1 text-[10px] text-muted-foreground"
            >
              {AXIS_HOURS.map((h) => (
                <span
                  key={h}
                  className="absolute -translate-x-1/2 tabular-nums"
                  style={{ left: pct(h * HOUR_MS) }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
        <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground">
          {KINDS.map((kind) => (
            <li key={kind} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn('inline-block h-2.5 w-2.5 rounded-sm', LEGEND_SWATCH[kind])}
              />
              {labels[kind]}
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
            {days.flatMap((d) => [
              ...d.spans.map((s, i) => (
                <tr key={`s${d.day}-${i}`}>
                  <td>{dayFormat(d.day)}</td>
                  <td>{labels[s.kind]}</td>
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
