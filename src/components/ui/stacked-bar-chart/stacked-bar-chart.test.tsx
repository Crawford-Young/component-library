import * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as barrel from './index'
import { StackedBarChart, StackedBarTooltip } from './stacked-bar-chart'

const data = [
  { day: '2026-10-05', demo: 1.2, other: 0.4 },
  { day: '2026-10-06', demo: 0, other: 2 },
]
const series = [
  { key: 'demo', label: 'Demo' },
  { key: 'other', label: 'Other' },
]
const format = (v: number): string => `$${v.toFixed(2)}`

describe('StackedBarChart', () => {
  it('renders a labelled img summarizing the chart', () => {
    render(<StackedBarChart data={data} xKey="day" series={series} format={format} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAccessibleName('Stacked bar chart: Demo, Other by day, 2 values')
  })

  it('renders one legend entry per series with a token-colored swatch', () => {
    render(<StackedBarChart data={data} xKey="day" series={series} format={format} />)
    const items = within(screen.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual(['Demo', 'Other'])
    expect(items[0].querySelector('span')).toHaveClass('bg-chart-1')
    expect(items[1].querySelector('span')).toHaveClass('bg-chart-2')
  })

  it('cycles chart tokens past the palette size', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ key: `s${i}`, label: `S${i}` }))
    const row = Object.fromEntries([['day', 'd'], ...many.map((s) => [s.key, 1])])
    render(<StackedBarChart data={[row]} xKey="day" series={many} format={format} />)
    const items = within(screen.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')
    expect(items[6].querySelector('span')).toHaveClass('bg-chart-1')
  })

  it('exposes formatted values in an sr-only table', () => {
    render(
      <StackedBarChart
        data={data}
        xKey="day"
        series={series}
        format={format}
        xFormat={(x) => `Day ${x.slice(-2)}`}
      />,
    )
    const table = screen.getByRole('table')
    expect(within(table).getByText('Day 05')).toBeInTheDocument()
    expect(within(table).getByText('$1.20')).toBeInTheDocument()
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['day', 'Demo', 'Other'])
  })

  it('defaults xFormat to the raw x value', () => {
    render(<StackedBarChart data={data} xKey="day" series={series} format={format} />)
    expect(within(screen.getByRole('table')).getByText('2026-10-05')).toBeInTheDocument()
  })

  it('shows the empty state for no data', () => {
    render(<StackedBarChart data={[]} xKey="day" series={series} format={format} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows a custom empty message when every value is zero', () => {
    const zeros = [{ day: 'a', demo: 0, other: 0 }]
    render(
      <StackedBarChart
        data={zeros}
        xKey="day"
        series={series}
        format={format}
        emptyMessage="Nothing logged"
      />,
    )
    expect(screen.getByText('Nothing logged')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('treats non-numeric series values as zero', () => {
    const odd = [{ day: 'a', demo: 'x', other: undefined }]
    render(<StackedBarChart data={odd} xKey="day" series={series} format={format} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('names the x dimension from xLabel in the aria-label and table header', () => {
    render(<StackedBarChart data={data} xKey="day" xLabel="Day" series={series} format={format} />)
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Stacked bar chart: Demo, Other by Day, 2 values',
    )
    expect(
      within(screen.getByRole('table'))
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Day', 'Demo', 'Other'])
  })

  it('renders negative values instead of the empty state', () => {
    render(
      <StackedBarChart
        data={[{ day: 'a', demo: -2, other: 0 }]}
        xKey="day"
        series={series}
        format={format}
      />,
    )
    expect(screen.queryByText('No data')).not.toBeInTheDocument()
    expect(within(screen.getByRole('table')).getByText('$-2.00')).toBeInTheDocument()
  })

  it('shows non-numeric cells as zero in the table', () => {
    render(
      <StackedBarChart
        data={[{ day: 'a', demo: 3, other: 'x' }]}
        xKey="day"
        series={series}
        format={format}
      />,
    )
    expect(within(screen.getByRole('table')).getByText('$0.00')).toBeInTheDocument()
  })

  it('sizes the plot with plotClassName, defaulting to h-48', () => {
    const { rerender } = render(
      <StackedBarChart data={data} xKey="day" series={series} format={format} />,
    )
    expect(screen.getByRole('img')).toHaveClass('h-48')
    rerender(
      <StackedBarChart
        data={data}
        xKey="day"
        series={series}
        format={format}
        plotClassName="h-80"
      />,
    )
    expect(screen.getByRole('img')).toHaveClass('h-80')
    expect(screen.getByRole('img')).not.toHaveClass('h-48')
  })

  it('keeps the tooltip out of the public barrel', () => {
    expect(Object.keys(barrel).sort()).toEqual(['StackedBarChart'])
  })

  it('merges className and forwards ref and props', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <StackedBarChart
        ref={ref}
        data={data}
        xKey="day"
        series={series}
        format={format}
        className="custom"
        data-testid="chart"
      />,
    )
    expect(screen.getByTestId('chart')).toHaveClass('custom')
    expect(ref.current).toBe(screen.getByTestId('chart'))
  })

  it('applies className to the empty state too', () => {
    const { container } = render(
      <StackedBarChart data={[]} xKey="day" series={series} format={format} className="custom" />,
    )
    expect(container.firstChild).toHaveClass('custom')
  })

  it('has a displayName', () => {
    expect(StackedBarChart.displayName).toBe('StackedBarChart')
  })
})

describe('StackedBarTooltip', () => {
  const props = { series, format, xFormat: (x: string) => `Day ${x}` }

  it('renders nothing when inactive or empty', () => {
    const { container, rerender } = render(<StackedBarTooltip {...props} active={false} />)
    expect(container).toBeEmptyDOMElement()
    rerender(<StackedBarTooltip {...props} active payload={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists formatted series values and the formatted label', () => {
    render(
      <StackedBarTooltip
        {...props}
        active
        label="05"
        payload={[
          { dataKey: 'demo', value: 1.2 },
          { dataKey: 'other', value: 0.4 },
        ]}
      />,
    )
    expect(screen.getByText('Day 05')).toBeInTheDocument()
    expect(screen.getByText('Demo')).toBeInTheDocument()
    expect(screen.getByText('$1.20')).toBeInTheDocument()
    expect(screen.getByText('$0.40')).toBeInTheDocument()
  })

  it('skips payload entries that are not configured series', () => {
    render(
      <StackedBarTooltip {...props} active label="x" payload={[{ dataKey: 'ghost', value: 9 }]} />,
    )
    expect(screen.queryByText('$9.00')).not.toBeInTheDocument()
  })
})
