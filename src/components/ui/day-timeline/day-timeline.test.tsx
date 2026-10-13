import * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DayTimeline, type DayTimelineDay, type DayTimelineKind } from './day-timeline'

const H = 3_600_000
const M = 60_000

const kinds: DayTimelineKind[] = [
  { key: 'active', label: 'Active' },
  { key: 'wait', label: 'Wait' },
  { key: 'agent', label: 'Agent', lane: 'sub' },
]

const days: DayTimelineDay[] = [
  {
    day: '2026-10-05',
    spans: [
      { startMs: 6 * H, endMs: 9 * H + 30 * M, kind: 'active' },
      { startMs: 9 * H + 30 * M, endMs: 10 * H, kind: 'wait' },
      { startMs: 7 * H, endMs: 8 * H, kind: 'agent' },
    ],
    marks: [{ atMs: 12 * H + 5 * M, label: 'Issue #12 closed' }],
  },
  { day: '2026-10-06', spans: [{ startMs: 0, endMs: 24 * H, kind: 'active' }], marks: [] },
]

const spansOf = (container: HTMLElement, kind: string): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(`[data-span][data-kind="${kind}"]`))

describe('DayTimeline', () => {
  it('positions spans as percentages of 24 hours', () => {
    const { container } = render(<DayTimeline days={days} kinds={kinds} />)
    const [active] = spansOf(container, 'active')
    expect(active.style.left).toBe('25%')
    expect(active.style.width).toBe('14.583333333333334%')
    const full = spansOf(container, 'active')[1]
    expect(full.style.left).toBe('0%')
    expect(full.style.width).toBe('100%')
  })

  it('clamps spans and marks that run outside 0-24h', () => {
    const { container } = render(
      <DayTimeline
        kinds={kinds}
        days={[
          {
            day: 'd',
            spans: [{ startMs: -H, endMs: 30 * H, kind: 'wait' }],
            marks: [{ atMs: 40 * H, label: 'late' }],
          },
        ]}
      />,
    )
    const [wait] = spansOf(container, 'wait')
    expect(wait.style.left).toBe('0%')
    expect(wait.style.width).toBe('100%')
    expect(container.querySelector<HTMLElement>('[data-mark]')!.style.left).toBe('100%')
  })

  it('drops inverted spans from the bar, the counts and the sr-only table', () => {
    const { container } = render(
      <DayTimeline
        kinds={kinds}
        days={[
          {
            day: 'd',
            spans: [
              { startMs: 10 * H, endMs: 8 * H, kind: 'active' },
              { startMs: 1 * H, endMs: 2 * H, kind: 'wait' },
            ],
            marks: [],
          },
        ]}
      />,
    )
    expect(spansOf(container, 'active')).toHaveLength(0)
    expect(screen.getByRole('img')).toHaveAccessibleName('Day timeline: 1 day, 1 span, 0 marks')
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2)
  })

  it('drops spans whose kind is not in kinds', () => {
    const { container } = render(
      <DayTimeline
        kinds={kinds}
        days={[
          {
            day: 'd',
            spans: [
              { startMs: 0, endMs: H, kind: 'ghost' },
              { startMs: 0, endMs: H, kind: 'active' },
            ],
            marks: [],
          },
        ]}
      />,
    )
    expect(container.querySelectorAll('[data-span]')).toHaveLength(1)
    expect(screen.getByRole('img')).toHaveAccessibleName('Day timeline: 1 day, 1 span, 0 marks')
  })

  it('puts sub-lane kinds in their own lane, apart from main-lane kinds', () => {
    const { container } = render(<DayTimeline days={days} kinds={kinds} />)
    const agent = spansOf(container, 'agent')[0]
    const active = spansOf(container, 'active')[0]
    const wait = spansOf(container, 'wait')[0]
    expect(agent).toHaveAttribute('data-lane', 'sub')
    expect(active).toHaveAttribute('data-lane', 'main')
    expect(wait).toHaveAttribute('data-lane', 'main')
    expect(agent.className).toContain('bottom-0')
    expect(active.className).toContain('top-0')
    expect(agent.parentElement).toBe(active.parentElement)
  })

  it('colors kinds from chart tokens by position, cycling past six', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ key: `k${i}`, label: `K${i}` }))
    const { container } = render(
      <DayTimeline
        kinds={many}
        days={[
          {
            day: 'd',
            spans: many.map((k, i) => ({ startMs: i * H, endMs: (i + 1) * H, kind: k.key })),
            marks: [],
          },
        ]}
      />,
    )
    expect(spansOf(container, 'k0')[0]).toHaveClass('bg-chart-1')
    expect(spansOf(container, 'k2')[0]).toHaveClass('bg-chart-3')
    expect(spansOf(container, 'k6')[0]).toHaveClass('bg-chart-1')
    const swatches = within(screen.getByRole('list', { name: 'Legend' }))
      .getAllByRole('listitem')
      .map((li) => li.querySelector('span'))
    expect(swatches[1]).toHaveClass('bg-chart-2')
    expect(swatches[6]).toHaveClass('bg-chart-1')
  })

  it('gives each span a title with its kind label, range and duration', () => {
    const { container } = render(<DayTimeline days={days} kinds={kinds} />)
    expect(spansOf(container, 'active')[0]).toHaveAttribute('title', 'Active: 06:00–09:30 (3h 30m)')
    expect(spansOf(container, 'wait')[0]).toHaveAttribute('title', 'Wait: 09:30–10:00 (30m)')
    expect(spansOf(container, 'agent')[0]).toHaveAttribute('title', 'Agent: 07:00–08:00 (1h)')
    expect(spansOf(container, 'active')[1]).toHaveAttribute('title', 'Active: 00:00–24:00 (24h)')
  })

  it('shows sub-minute spans as <1m', () => {
    const { container } = render(
      <DayTimeline
        kinds={kinds}
        days={[{ day: 'd', spans: [{ startMs: H, endMs: H + 20_000, kind: 'agent' }], marks: [] }]}
      />,
    )
    expect(spansOf(container, 'agent')[0]).toHaveAttribute('title', 'Agent: 01:00–01:00 (<1m)')
  })

  it('uses the labels given in kinds', () => {
    const { container } = render(
      <DayTimeline
        days={days}
        kinds={[{ key: 'wait', label: 'Waiting' }, ...kinds.filter((k) => k.key !== 'wait')]}
      />,
    )
    expect(spansOf(container, 'wait')[0]).toHaveAttribute('title', 'Waiting: 09:30–10:00 (30m)')
    expect(screen.getByRole('list', { name: 'Legend' })).toHaveTextContent('Waiting')
  })

  it('renders marks at their position with a labelled title', () => {
    const { container } = render(<DayTimeline days={days} kinds={kinds} />)
    const mark = container.querySelector<HTMLElement>('[data-mark]')!
    expect(mark.style.left).toBe(`${((12 * H + 5 * M) / (24 * H)) * 100}%`)
    expect(mark).toHaveAttribute('title', 'Issue #12 closed · 12:05')
  })

  it('widens the mark hit target while keeping a 2px line', () => {
    const { container } = render(<DayTimeline days={days} kinds={kinds} />)
    const mark = container.querySelector<HTMLElement>('[data-mark]')!
    expect(mark).toHaveClass('w-3')
    const line = mark.querySelector('[data-mark-line]')!
    expect(line).toHaveClass('w-0.5', 'bg-foreground')
    expect(line).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws an hour axis at 0, 6, 12, 18 and 24 without overflowing the track', () => {
    render(<DayTimeline days={days} kinds={kinds} />)
    const axis = screen.getByTestId('day-timeline-axis')
    const labels = Array.from(axis.children) as HTMLElement[]
    expect(labels.map((c) => c.textContent)).toEqual(['0', '6', '12', '18', '24'])
    expect(labels[1].style.left).toBe('25%')
    expect(labels[0]).not.toHaveClass('-translate-x-1/2')
    expect(labels[1]).toHaveClass('-translate-x-1/2')
    expect(labels[4]).toHaveClass('-translate-x-full')
    expect(axis.className).not.toMatch(/text-\[/)
  })

  it('renders a legend entry per kind, in order', () => {
    render(<DayTimeline days={days} kinds={kinds} />)
    const items = within(screen.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual(['Active', 'Wait', 'Agent'])
  })

  it('formats day labels with dayFormat, defaulting to the raw day', () => {
    const { rerender } = render(<DayTimeline days={days} kinds={kinds} />)
    expect(screen.getAllByText('2026-10-05').length).toBeGreaterThan(0)
    rerender(<DayTimeline days={days} kinds={kinds} dayFormat={(d) => `Day ${d.slice(-2)}`} />)
    expect(screen.getAllByText('Day 05').length).toBeGreaterThan(0)
  })

  it('exposes a labelled img summarizing the timeline', () => {
    render(<DayTimeline days={days} kinds={kinds} />)
    expect(screen.getByRole('img')).toHaveAccessibleName('Day timeline: 2 days, 4 spans, 1 mark')
  })

  it('singularizes the summary counts', () => {
    render(
      <DayTimeline
        kinds={kinds}
        days={[{ day: 'd', spans: [{ startMs: 0, endMs: H, kind: 'active' }], marks: [] }]}
      />,
    )
    expect(screen.getByRole('img')).toHaveAccessibleName('Day timeline: 1 day, 1 span, 0 marks')
  })

  it('exposes spans and marks in an sr-only table', () => {
    render(<DayTimeline days={days} kinds={kinds} />)
    const table = screen.getByRole('table')
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Day', 'Kind', 'Start', 'End'])
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(1 + 4 + 1)
    expect(Array.from(rows[1].children).map((c) => c.textContent)).toEqual([
      '2026-10-05',
      'Active',
      '06:00',
      '09:30',
    ])
    expect(Array.from(rows[4].children).map((c) => c.textContent)).toEqual([
      '2026-10-05',
      'Issue #12 closed',
      '12:05',
      '',
    ])
  })

  it('renders a marks-only timeline instead of the empty state', () => {
    render(
      <DayTimeline
        kinds={kinds}
        days={[{ day: 'd', spans: [], marks: [{ atMs: 3 * H, label: 'PR merged' }] }]}
      />,
    )
    expect(screen.queryByText('No data')).not.toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName('Day timeline: 1 day, 0 spans, 1 mark')
  })

  it('shows the empty state for no days', () => {
    render(<DayTimeline days={[]} kinds={kinds} emptyMessage="Nothing logged" />)
    expect(screen.getByText('Nothing logged')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the default empty state when days have no spans or marks', () => {
    render(<DayTimeline days={[{ day: 'd', spans: [], marks: [] }]} kinds={kinds} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('shows the empty state when the only spans are inverted and there are no marks', () => {
    render(
      <DayTimeline
        kinds={kinds}
        days={[{ day: 'd', spans: [{ startMs: 5 * H, endMs: H, kind: 'active' }], marks: [] }]}
      />,
    )
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('forwards ref, className and props; sets displayName', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <DayTimeline ref={ref} days={days} kinds={kinds} className="custom" data-testid="root" />,
    )
    expect(ref.current).toBe(screen.getByTestId('root'))
    expect(ref.current).toHaveClass('custom')
    expect(DayTimeline.displayName).toBe('DayTimeline')
  })

  it('forwards ref and className in the empty state too', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<DayTimeline ref={ref} days={[]} kinds={kinds} className="custom" />)
    expect(ref.current).toHaveClass('custom')
  })
})
