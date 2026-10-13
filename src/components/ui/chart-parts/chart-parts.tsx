import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Internal pieces shared by StackedBarChart and TrendChart. Not exported from the barrel.
 */

// Literal class names so Tailwind's scanner sees them; order matches seriesColor.
const SWATCH_CLASSES = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-chart-6',
] as const

export const TICK_STYLE = { fontSize: 10, fill: 'rgb(var(--muted-foreground))' } as const

export const seriesColor = (index: number): string =>
  `rgb(var(--chart-${(index % SWATCH_CLASSES.length) + 1}))`

export const swatchClass = (index: number): string => SWATCH_CLASSES[index % SWATCH_CLASSES.length]

export const identity = (x: string): string => x

export interface ChartTooltipRow {
  readonly key: string
  readonly label: string
  readonly swatch: string
  readonly text: string
}

export function ChartTooltipCard({
  heading,
  rows,
}: {
  readonly heading: string
  readonly rows: ReadonlyArray<ChartTooltipRow>
}): React.JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground">
      <p className="mb-1 font-medium">{heading}</p>
      <ul className="space-y-0.5">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn('inline-block h-2 w-2 rounded-sm', row.swatch)}
              />
              {row.label}
            </span>
            <span className="tabular-nums">{row.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface ChartLegendItem {
  readonly key: string
  readonly label: string
  readonly swatch: string
}

export function ChartLegend({
  items,
}: {
  readonly items: ReadonlyArray<ChartLegendItem>
}): React.JSX.Element {
  return (
    <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn('inline-block h-2.5 w-2.5 rounded-sm', item.swatch)}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export function ChartSrTable({
  headers,
  rows,
}: {
  readonly headers: ReadonlyArray<string>
  readonly rows: ReadonlyArray<ReadonlyArray<string>>
}): React.JSX.Element {
  return (
    <table className="sr-only">
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={i}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, i) => (
          <tr key={i}>
            {cells.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
