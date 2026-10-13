'use client'
import * as React from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'

// Literal class names so Tailwind's scanner sees them; order matches seriesColor.
const SWATCH_CLASSES = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-chart-6',
] as const

const TICK_FONT_SIZE = 10
const CURSOR_OPACITY = 0.4
const PLOT_MARGIN = { top: 4, right: 4, left: 0, bottom: 0 } as const

export interface StackedBarSeries {
  readonly key: string
  readonly label: string
}

/** Series values should be numbers; anything else is read as 0 everywhere (bars, table, tooltip). */
export type StackedBarDatum = Readonly<Record<string, string | number | null | undefined>>

export interface StackedBarChartProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** One object per x value, e.g. `{ day: '2026-10-05', demo: 1.2, other: 0.4 }`. */
  readonly data: ReadonlyArray<StackedBarDatum>
  /** Key on each datum holding the x value. */
  readonly xKey: string
  /** Human name for the x dimension in the aria-label and table header; defaults to `xKey`. */
  readonly xLabel?: string
  /** Stacked segments, bottom to top; colors cycle through `--chart-1…6`. */
  readonly series: ReadonlyArray<StackedBarSeries>
  /** Formats y-axis ticks and tooltip values; the consumer owns the unit. */
  readonly format: (value: number) => string
  /** Formats x-axis ticks, tooltip headings and the table rows. */
  readonly xFormat?: (x: string) => string
  readonly emptyMessage?: string
  /** Tailwind classes sizing the plot area; replaces the default `h-48`. */
  readonly plotClassName?: string
}

const seriesColor = (index: number): string =>
  `rgb(var(--chart-${(index % SWATCH_CLASSES.length) + 1}))`

const swatchClass = (index: number): string => SWATCH_CLASSES[index % SWATCH_CLASSES.length]

const toNumber = (value: unknown): number => (typeof value === 'number' ? value : 0)

/** Coerces each series value to a number once, so bars, table and tooltip read the same data. */
const normalize = (
  data: ReadonlyArray<StackedBarDatum>,
  series: ReadonlyArray<StackedBarSeries>,
): Array<Record<string, string | number | null | undefined>> =>
  data.map((row) => ({
    ...row,
    ...Object.fromEntries(series.map((s) => [s.key, toNumber(row[s.key])])),
  }))

interface TooltipEntry {
  readonly dataKey?: unknown
  readonly value?: unknown
}

export interface StackedBarTooltipProps {
  readonly series: ReadonlyArray<StackedBarSeries>
  readonly format: (value: number) => string
  readonly xFormat: (x: string) => string
  readonly active?: boolean
  readonly label?: unknown
  readonly payload?: ReadonlyArray<TooltipEntry>
}

export function StackedBarTooltip({
  series,
  format,
  xFormat,
  active,
  label,
  payload,
}: StackedBarTooltipProps): React.JSX.Element | null {
  if (active !== true || payload === undefined || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground">
      <p className="mb-1 font-medium">{xFormat(String(label))}</p>
      <ul className="space-y-0.5">
        {payload.map((entry) => {
          const index = series.findIndex((s) => s.key === entry.dataKey)
          if (index === -1) return null
          return (
            <li key={series[index].key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn('inline-block h-2 w-2 rounded-sm', swatchClass(index))}
                />
                {series[index].label}
              </span>
              <span className="tabular-nums">{format(toNumber(entry.value))}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const identity = (x: string): string => x

export const StackedBarChart = React.forwardRef<HTMLDivElement, StackedBarChartProps>(
  (
    {
      data,
      xKey,
      xLabel = xKey,
      series,
      format,
      xFormat = identity,
      emptyMessage = 'No data',
      plotClassName = 'h-48',
      className,
      ...props
    },
    ref,
  ) => {
    const rows = normalize(data, series)
    const hasData = rows.some((row) => series.some((s) => row[s.key] !== 0))
    if (!hasData) {
      return (
        <div ref={ref} className={className} {...props}>
          <EmptyState message={emptyMessage} />
        </div>
      )
    }
    const seriesLabels = series.map((s) => s.label).join(', ')
    return (
      <div ref={ref} className={cn('flex w-full flex-col gap-2', className)} {...props}>
        <div
          role="img"
          aria-label={`Stacked bar chart: ${seriesLabels} by ${xLabel}, ${rows.length} values`}
          className={cn('w-full', plotClassName)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={PLOT_MARGIN}>
              <XAxis
                dataKey={xKey}
                tickFormatter={xFormat}
                tick={{ fontSize: TICK_FONT_SIZE, fill: 'rgb(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={format}
                tick={{ fontSize: TICK_FONT_SIZE, fill: 'rgb(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgb(var(--muted))', opacity: CURSOR_OPACITY }}
                content={<StackedBarTooltip series={series} format={format} xFormat={xFormat} />}
              />
              {series.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} stackId="stack" fill={seriesColor(i)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground">
          {series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn('inline-block h-2.5 w-2.5 rounded-sm', swatchClass(i))}
              />
              {s.label}
            </li>
          ))}
        </ul>
        <table className="sr-only">
          <thead>
            <tr>
              <th>{xLabel}</th>
              {series.map((s) => (
                <th key={s.key}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>{xFormat(String(row[xKey]))}</td>
                {series.map((s) => (
                  <td key={s.key}>{format(row[s.key] as number)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
)
StackedBarChart.displayName = 'StackedBarChart'
