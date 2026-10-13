import * as React from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as barrel from './index'
import { TrendChart, TrendChartTooltip } from './trend-chart'

// jsdom lays ResponsiveContainer out at 0x0, so give the chart a fixed size to render the plot.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children, { width: 600, height: 200 } as object),
  }
})

const data = [
  { week: 'Sep 14', perIssue: null, perPr: undefined, spend: 39.5 },
  { week: 'Oct 5', perIssue: 8.63, perPr: 5.58, spend: 223.8 },
  { week: 'Oct 12', perIssue: 7.58, perPr: 7.58, spend: 218.1 },
]
const series = [
  { key: 'perIssue', label: 'Per issue' },
  { key: 'perPr', label: 'Per PR' },
]
const background = {
  key: 'spend',
  label: 'Total spend',
  format: (v: number): string => `$${Math.round(v)}`,
}
const format = (v: number): string => `$${v.toFixed(2)}`

describe('TrendChart', () => {
  it('renders a labelled img summarizing the chart', () => {
    render(<TrendChart data={data} xKey="week" xLabel="Week" series={series} format={format} />)
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Line chart: Per issue, Per PR by Week, 3 values',
    )
  })

  it('defaults xLabel to xKey', () => {
    render(<TrendChart data={data} xKey="week" series={series} format={format} />)
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Line chart: Per issue, Per PR by week, 3 values',
    )
  })

  it('renders one legend entry per series with a token-colored swatch', () => {
    render(<TrendChart data={data} xKey="week" series={series} format={format} />)
    const items = within(screen.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual(['Per issue', 'Per PR'])
    expect(items[0].querySelector('span')).toHaveClass('bg-chart-1')
    expect(items[1].querySelector('span')).toHaveClass('bg-chart-2')
  })

  it('cycles chart tokens past the palette size', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ key: `s${i}`, label: `S${i}` }))
    const row = Object.fromEntries([['week', 'w'], ...many.map((s) => [s.key, 1])])
    render(<TrendChart data={[row]} xKey="week" series={many} format={format} />)
    const items = within(screen.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')
    expect(items[6].querySelector('span')).toHaveClass('bg-chart-1')
  })

  it('shows a dash in the table for missing values and formats the rest', () => {
    render(
      <TrendChart
        data={data}
        xKey="week"
        series={series}
        format={format}
        xFormat={(x) => `w/c ${x}`}
      />,
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    const cells = (row: HTMLElement): Array<string | null> =>
      within(row)
        .getAllByRole('cell')
        .map((c) => c.textContent)
    expect(cells(rows[1])).toEqual(['w/c Sep 14', '—', '—'])
    expect(cells(rows[2])).toEqual(['w/c Oct 5', '$8.63', '$5.58'])
  })

  it('does not coerce a missing value to zero', () => {
    render(<TrendChart data={data} xKey="week" series={series} format={format} />)
    expect(within(screen.getByRole('table')).queryByText('$0.00')).not.toBeInTheDocument()
  })

  it('treats non-numeric values as missing', () => {
    render(
      <TrendChart
        data={[
          { week: 'a', perIssue: 'x', perPr: 3 },
          { week: 'b', perIssue: Number.NaN, perPr: 4 },
        ]}
        xKey="week"
        series={series}
        format={format}
      />,
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(within(rows[1]).getAllByRole('cell')[1]).toHaveTextContent('—')
    expect(within(rows[2]).getAllByRole('cell')[1]).toHaveTextContent('—')
  })

  it('keeps a zero as a real value', () => {
    render(
      <TrendChart
        data={[{ week: 'a', perIssue: 0, perPr: 0 }]}
        xKey="week"
        series={series}
        format={format}
      />,
    )
    expect(screen.queryByText('No data')).not.toBeInTheDocument()
    expect(within(screen.getByRole('table')).getAllByText('$0.00')).toHaveLength(2)
  })

  it('lists the background series in the legend and table with its own formatter', () => {
    render(
      <TrendChart
        data={data}
        xKey="week"
        series={series}
        format={format}
        background={background}
      />,
    )
    const items = within(screen.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual(['Per issue', 'Per PR', 'Total spend'])
    expect(items[2].querySelector('span')).toHaveClass('bg-surface-raised')
    const table = screen.getByRole('table')
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['week', 'Per issue', 'Per PR', 'Total spend'])
    expect(within(table).getByText('$224')).toBeInTheDocument()
    expect(within(table).getByText('$8.63')).toBeInTheDocument()
  })

  it('shows a dash for a missing background value', () => {
    render(
      <TrendChart
        data={[
          { week: 'a', perIssue: 1, perPr: 1 },
          { week: 'b', perIssue: 2, perPr: 2, spend: 9 },
        ]}
        xKey="week"
        series={series}
        format={format}
        background={background}
      />,
    )
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(within(rows[1]).getAllByRole('cell')[3]).toHaveTextContent('—')
  })

  it('shows the empty state for no data', () => {
    render(<TrendChart data={[]} xKey="week" series={series} format={format} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the empty state when no line has a numeric value, even with a background', () => {
    render(
      <TrendChart
        data={[{ week: 'a', perIssue: null, perPr: undefined, spend: 40 }]}
        xKey="week"
        series={series}
        format={format}
        background={background}
        emptyMessage="No closed issues"
      />,
    )
    expect(screen.getByText('No closed issues')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('sizes the plot with plotClassName, defaulting to h-48', () => {
    const { rerender } = render(
      <TrendChart data={data} xKey="week" series={series} format={format} />,
    )
    expect(screen.getByRole('img')).toHaveClass('h-48')
    rerender(
      <TrendChart data={data} xKey="week" series={series} format={format} plotClassName="h-80" />,
    )
    expect(screen.getByRole('img')).toHaveClass('h-80')
    expect(screen.getByRole('img')).not.toHaveClass('h-48')
  })

  it('names the background series in the aria-label', () => {
    render(
      <TrendChart
        data={data}
        xKey="week"
        xLabel="Week"
        series={series}
        format={format}
        background={background}
      />,
    )
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Line chart: Per issue, Per PR, Total spend by Week, 3 values',
    )
  })

  describe('plot', () => {
    const curves = (container: HTMLElement): string[] =>
      Array.from(container.querySelectorAll('.recharts-line-curve')).map(
        (p) => p.getAttribute('d') ?? '',
      )
    const segments = (d: string): number => d.split('M').length - 1
    const one = [{ key: 'a', label: 'A' }]
    const rows = (values: Array<number | null>): Array<Record<string, number | string | null>> =>
      values.map((a, i) => ({ x: String(i), a }))

    it('breaks the line at a missing value', () => {
      const { container } = render(
        <TrendChart data={rows([1, 2, null, 4, 5])} xKey="x" series={one} format={format} />,
      )
      const [d] = curves(container)
      expect(segments(d)).toBe(2)
    })

    it('does not break the line at a real zero', () => {
      const { container } = render(
        <TrendChart data={rows([1, 0, 3, 4])} xKey="x" series={one} format={format} />,
      )
      const [d] = curves(container)
      expect(segments(d)).toBe(1)
    })

    it('hover cursor and active dots use tokens, not recharts defaults', async () => {
      const { container } = render(
        <TrendChart data={rows([1, 2, 3])} xKey="x" series={one} format={format} />,
      )
      const wrapper = container.querySelector('.recharts-wrapper') as HTMLElement
      vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 600, 200))
      fireEvent.mouseMove(wrapper, {
        clientX: 300,
        clientY: 100,
      })
      await waitFor(() =>
        expect(container.querySelector('.recharts-tooltip-cursor')).not.toBeNull(),
      )
      expect(container.querySelector('.recharts-tooltip-cursor')).toHaveAttribute(
        'stroke',
        'rgb(var(--border))',
      )
      expect(container.querySelector('.recharts-active-dot circle')).toHaveAttribute(
        'stroke',
        'rgb(var(--surface))',
      )
    })

    it('draws token colors only, with no recharts default greys or whites', () => {
      const { container } = render(
        <TrendChart
          data={data}
          xKey="week"
          series={series}
          format={format}
          background={background}
        />,
      )
      expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,6}/i)
      expect(container.querySelector('.recharts-cartesian-grid-horizontal')).toBeInTheDocument()
      expect(container.querySelector('.recharts-cartesian-grid-vertical')).not.toBeInTheDocument()
    })
  })

  it('keeps the tooltip out of the public barrel', () => {
    expect(Object.keys(barrel).sort()).toEqual(['TrendChart'])
  })

  it('merges className and forwards ref and props', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <TrendChart
        ref={ref}
        data={data}
        xKey="week"
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
      <TrendChart data={[]} xKey="week" series={series} format={format} className="custom" />,
    )
    expect(container.firstChild).toHaveClass('custom')
  })

  it('has a displayName', () => {
    expect(TrendChart.displayName).toBe('TrendChart')
  })
})

describe('TrendChartTooltip', () => {
  const props = { series, background, format, xFormat: (x: string) => `w/c ${x}` }

  it('renders nothing when inactive or empty', () => {
    const { container, rerender } = render(<TrendChartTooltip {...props} active={false} />)
    expect(container).toBeEmptyDOMElement()
    rerender(<TrendChartTooltip {...props} active payload={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists formatted values, using the background formatter for the background', () => {
    render(
      <TrendChartTooltip
        {...props}
        active
        label="Oct 5"
        payload={[
          { dataKey: 'spend', value: 223.8 },
          { dataKey: 'perIssue', value: 8.63 },
          { dataKey: 'perPr', value: 5.58 },
        ]}
      />,
    )
    expect(screen.getByText('w/c Oct 5')).toBeInTheDocument()
    expect(screen.getByText('$224')).toBeInTheDocument()
    expect(screen.getByText('$8.63')).toBeInTheDocument()
    expect(screen.getByText('Total spend')).toBeInTheDocument()
  })

  it('shows a dash for a missing value', () => {
    render(
      <TrendChartTooltip
        {...props}
        active
        label="x"
        payload={[{ dataKey: 'perIssue', value: null }]}
      />,
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('skips entries that are neither series nor background, and works without a background', () => {
    render(
      <TrendChartTooltip
        series={series}
        format={format}
        xFormat={(x) => x}
        active
        label="x"
        payload={[
          { dataKey: 'ghost', value: 9 },
          { dataKey: 'spend', value: 5 },
        ]}
      />,
    )
    expect(screen.queryByText('$9.00')).not.toBeInTheDocument()
    expect(screen.queryByText('$5.00')).not.toBeInTheDocument()
  })
})
