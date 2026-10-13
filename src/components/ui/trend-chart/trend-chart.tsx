'use client'
import * as React from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
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

const LINE_WIDTH = 2
const DOT_RADIUS = 4
const PLOT_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 } as const
const MISSING = '—'
const LINE_AXIS = 'line'
const BACKGROUND_AXIS = 'background'
const BACKGROUND_SWATCH = 'bg-surface-raised border border-border'
const BORDER = 'rgb(var(--border))'

export interface TrendChartSeries {
  readonly key: string
  readonly label: string
}

/** An optional muted bar series behind the lines, on its own hidden axis and formatter. */
export interface TrendChartBackground extends TrendChartSeries {
  readonly format: (value: number) => string
}

/** Series values should be numbers; anything else is a gap in the line (never 0). */
export interface TrendChartDatum {
  readonly [key: string]: string | number | null | undefined
}

export interface TrendChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** One object per x value, e.g. `{ week: 'Oct 5', perIssue: 8.63, perPr: null }`. */
  readonly data: ReadonlyArray<TrendChartDatum>
  /** Key on each datum holding the x value (categorical, in data order). */
  readonly xKey: string
  /** Human name for the x dimension in the aria-label and table header; defaults to `xKey`. */
  readonly xLabel?: string
  /** Lines; colors cycle through `--chart-1…6`. */
  readonly series: ReadonlyArray<TrendChartSeries>
  /** Formats y-axis ticks and tooltip/table values for the lines; the consumer owns the unit. */
  readonly format: (value: number) => string
  /** Muted bars behind the lines (e.g. total spend that week), with their own formatter. */
  readonly background?: TrendChartBackground
  /** Formats x-axis ticks, tooltip headings and the table rows. */
  readonly xFormat?: (x: string) => string
  readonly emptyMessage?: string
  /** Tailwind classes sizing the plot area; replaces the default `h-48`. */
  readonly plotClassName?: string
}

const toNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const formatOrDash = (value: number | null, format: (value: number) => string): string =>
  value === null ? MISSING : format(value)

/** Coerces each plotted value to a number or null once, so lines, table and tooltip agree. */
const normalize = (
  data: ReadonlyArray<TrendChartDatum>,
  keys: ReadonlyArray<string>,
): Array<Record<string, string | number | null | undefined>> =>
  data.map((row) => ({ ...row, ...Object.fromEntries(keys.map((k) => [k, toNumber(row[k])])) }))

interface TooltipEntry {
  readonly dataKey?: unknown
  readonly value?: unknown
}

export interface TrendChartTooltipProps {
  readonly series: ReadonlyArray<TrendChartSeries>
  readonly background?: TrendChartBackground
  readonly format: (value: number) => string
  readonly xFormat: (x: string) => string
  readonly active?: boolean
  readonly label?: unknown
  readonly payload?: ReadonlyArray<TooltipEntry>
}

export function TrendChartTooltip({
  series,
  background,
  format,
  xFormat,
  active,
  label,
  payload,
}: TrendChartTooltipProps): React.JSX.Element | null {
  if (active !== true || payload === undefined || payload.length === 0) return null
  const rows: ChartTooltipRow[] = []
  for (const entry of payload) {
    const value = toNumber(entry.value)
    const index = series.findIndex((s) => s.key === entry.dataKey)
    if (index !== -1) {
      rows.push({
        key: series[index].key,
        label: series[index].label,
        swatch: swatchClass(index),
        text: formatOrDash(value, format),
      })
    } else if (background !== undefined && background.key === entry.dataKey) {
      rows.push({
        key: background.key,
        label: background.label,
        swatch: BACKGROUND_SWATCH,
        text: formatOrDash(value, background.format),
      })
    }
  }
  return <ChartTooltipCard heading={xFormat(String(label))} rows={rows} />
}

export const TrendChart = React.forwardRef<HTMLDivElement, TrendChartProps>(
  (
    {
      data,
      xKey,
      xLabel = xKey,
      series,
      format,
      background,
      xFormat = identity,
      emptyMessage = 'No data',
      plotClassName = 'h-48',
      className,
      ...props
    },
    ref,
  ) => {
    const keys = [
      ...series.map((s) => s.key),
      ...(background === undefined ? [] : [background.key]),
    ]
    const rows = normalize(data, keys)
    const hasData = rows.some((row) => series.some((s) => row[s.key] !== null))
    if (!hasData) {
      return (
        <div ref={ref} className={className} {...props}>
          <EmptyState message={emptyMessage} />
        </div>
      )
    }
    const labels = [
      ...series.map((s) => s.label),
      ...(background === undefined ? [] : [background.label]),
    ]
    return (
      <div ref={ref} className={cn('flex w-full flex-col gap-2', className)} {...props}>
        <div
          role="img"
          aria-label={`Line chart: ${labels.join(', ')} by ${xLabel}, ${rows.length} values`}
          className={cn('w-full', plotClassName)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={PLOT_MARGIN}>
              <CartesianGrid vertical={false} stroke={BORDER} />
              <XAxis
                dataKey={xKey}
                tickFormatter={xFormat}
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId={LINE_AXIS}
                tickFormatter={format}
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
              />
              {background !== undefined && (
                <YAxis yAxisId={BACKGROUND_AXIS} hide domain={[0, 'auto']} />
              )}
              <Tooltip
                cursor={{ stroke: BORDER }}
                content={
                  <TrendChartTooltip
                    series={series}
                    background={background}
                    format={format}
                    xFormat={xFormat}
                  />
                }
              />
              {background !== undefined && (
                <Bar
                  dataKey={background.key}
                  yAxisId={BACKGROUND_AXIS}
                  fill="rgb(var(--surface-raised))"
                  radius={2}
                  isAnimationActive={false}
                />
              )}
              {series.map((s, i) => (
                <Line
                  key={s.key}
                  dataKey={s.key}
                  yAxisId={LINE_AXIS}
                  type="linear"
                  stroke={seriesColor(i)}
                  strokeWidth={LINE_WIDTH}
                  dot={{ r: DOT_RADIUS, fill: seriesColor(i), stroke: seriesColor(i) }}
                  activeDot={{
                    r: DOT_RADIUS,
                    fill: seriesColor(i),
                    stroke: 'rgb(var(--surface))',
                  }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          items={[
            ...series.map((s, i) => ({ key: s.key, label: s.label, swatch: swatchClass(i) })),
            ...(background === undefined
              ? []
              : [{ key: background.key, label: background.label, swatch: BACKGROUND_SWATCH }]),
          ]}
        />
        <ChartSrTable
          headers={[xLabel, ...labels]}
          rows={rows.map((row) => [
            xFormat(String(row[xKey])),
            ...series.map((s) => formatOrDash(row[s.key] as number | null, format)),
            ...(background === undefined
              ? []
              : [formatOrDash(row[background.key] as number | null, background.format)]),
          ])}
        />
      </div>
    )
  },
)
TrendChart.displayName = 'TrendChart'
