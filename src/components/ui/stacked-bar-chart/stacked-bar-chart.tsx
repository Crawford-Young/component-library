'use client'
import * as React from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import {
  ChartLegend,
  ChartSrTable,
  ChartTooltipCard,
  identity,
  seriesColor,
  swatchClass,
  TICK_STYLE,
  type ChartTooltipRow,
} from '@/components/ui/chart-parts/chart-parts'
import { EmptyState } from '@/components/ui/empty-state'

const CURSOR_OPACITY = 0.4
const PLOT_MARGIN = { top: 4, right: 4, left: 0, bottom: 0 } as const

export interface StackedBarSeries {
  readonly key: string
  readonly label: string
}

/** Series values should be numbers; anything else is read as 0 everywhere (bars, table, tooltip). */
export interface StackedBarDatum {
  readonly [key: string]: string | number | null | undefined
}

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
  const rows: ChartTooltipRow[] = []
  for (const entry of payload) {
    const index = series.findIndex((s) => s.key === entry.dataKey)
    if (index === -1) continue
    rows.push({
      key: series[index].key,
      label: series[index].label,
      swatch: swatchClass(index),
      text: format(toNumber(entry.value)),
    })
  }
  return <ChartTooltipCard heading={xFormat(String(label))} rows={rows} />
}

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
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tickFormatter={format} tick={TICK_STYLE} axisLine={false} tickLine={false} />
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
        <ChartLegend
          items={series.map((s, i) => ({ key: s.key, label: s.label, swatch: swatchClass(i) }))}
        />
        <ChartSrTable
          headers={[xLabel, ...series.map((s) => s.label)]}
          rows={rows.map((row) => [
            xFormat(String(row[xKey])),
            ...series.map((s) => format(row[s.key] as number)),
          ])}
        />
      </div>
    )
  },
)
StackedBarChart.displayName = 'StackedBarChart'
