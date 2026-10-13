import * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DayTimeline, type DayTimelineDay } from './day-timeline'

const H = 3_600_000
const M = 60_000

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
    const { container } = render(<DayTimeline days={days} />)
    const [active] = spansOf(container, 'active')
    expect(active.style.left).toBe('25%')
    expect(active.style.width).toBe('14.583333333333334%')
    const full = spansOf(container, 'active')[1]
    expect(full.style.left).toBe('0%')
    expect(full.style.width).toBe('100%')
  })

  it('clamps spans outside 0-24h and drops inverted ones from the axis', () => {
    const { container } = render(
      <DayTimeline
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

  it('puts agent spans in their own lane, apart from active and wait', () => {
    const { container } = render(<DayTimeline days={days} />)
    const agent = spansOf(container, 'agent')[0]
    const active = spansOf(container, 'active')[0]
    const wait = spansOf(container, 'wait')[0]
    expect(agent).toHaveAttribute('data-lane', 'agent')
    expect(active).toHaveAttribute('data-lane', 'main')
    expect(wait).toHaveAttribute('data-lane', 'main')
    expect(agent.className).toContain('bottom-0')
    expect(active.className).toContain('top-0')
    // overlapping in time but vertically separated: same row, different lane classes
    expect(agent.parentElement).toBe(active.parentElement)
  })

  it('colors each kind from chart tokens', () => {
    const { container } = render(<DayTimeline days={days} />)
    expect(spansOf(container, 'active')[0]).toHaveClass('bg-[rgb(var(--chart-1))]')
    expect(spansOf(container, 'agent')[0]).toHaveClass('bg-[rgb(var(--chart-2))]')
    expect(spansOf(container, 'wait')[0]).toHaveClass('bg-[rgb(var(--chart-3))]')
  })

  it('gives each span a title with kind, range and duration', () => {
    const { container } = render(<DayTimeline days={days} />)
    expect(spansOf(container, 'active')[0]).toHaveAttribute('title', 'Active: 06:00–09:30 (3h 30m)')
    expect(spansOf(container, 'wait')[0]).toHaveAttribute('title', 'Wait: 09:30–10:00 (30m)')
    expect(spansOf(container, 'agent')[0]).toHaveAttribute('title', 'Agent: 07:00–08:00 (1h)')
    expect(spansOf(container, 'active')[1]).toHaveAttribute('title', 'Active: 00:00–24:00 (24h)')
  })

  it('shows sub-minute spans as <1m', () => {
    const { container } = render(
      <DayTimeline
        days={[{ day: 'd', spans: [{ startMs: H, endMs: H + 20_000, kind: 'agent' }], marks: [] }]}
      />,
    )
    expect(spansOf(container, 'agent')[0]).toHaveAttribute('title', 'Agent: 01:00–01:00 (<1m)')
  })

  it('applies kindLabels overrides', () => {
    const { container } = render(<DayTimeline days={days} kindLabels={{ wait: 'Waiting' }} />)
    expect(spansOf(container, 'wait')[0]).toHaveAttribute('title', 'Waiting: 09:30–10:00 (30m)')
    expect(screen.getByRole('list', { name: 'Legend' })).toHaveTextContent('Waiting')
  })

  it('renders marks at their position with a labelled title', () => {
    const { container } = render(<DayTimeline days={days} />)
    const mark = container.querySelector<HTMLElement>('[data-mark]')!
    expect(mark.style.left).toBe(`${((12 * H + 5 * M) / (24 * H)) * 100}%`)
    expect(mark).toHaveAttribute('title', 'Issue #12 closed · 12:05')
  })

  it('draws an hour axis at 0, 6, 12, 18 and 24', () => {
    render(<DayTimeline days={days} />)
    const axis = screen.getByTestId('day-timeline-axis')
    expect(Array.from(axis.children).map((c) => c.textContent)).toEqual([
      '0',
      '6',
      '12',
      '18',
      '24',
    ])
    expect((axis.children[1] as HTMLElement).style.left).toBe('25%')
  })

  it('renders a legend entry per kind', () => {
    render(<DayTimeline days={days} />)
    const items = within(screen.getByRole('list', { name: 'Legend' })).getAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual(['Active', 'Wait', 'Agent'])
  })

  it('formats day labels with dayFormat, defaulting to the raw day', () => {
    const { rerender } = render(<DayTimeline days={days} />)
    expect(screen.getAllByText('2026-10-05').length).toBeGreaterThan(0)
    rerender(<DayTimeline days={days} dayFormat={(d) => `Day ${d.slice(-2)}`} />)
    expect(screen.getAllByText('Day 05').length).toBeGreaterThan(0)
  })

  it('exposes a labelled img summarizing the timeline', () => {
    render(<DayTimeline days={days} />)
    expect(screen.getByRole('img')).toHaveAccessibleName('Day timeline: 2 days, 4 spans, 1 mark')
  })

  it('singularizes the summary counts', () => {
    render(
      <DayTimeline
        days={[{ day: 'd', spans: [{ startMs: 0, endMs: H, kind: 'active' }], marks: [] }]}
      />,
    )
    expect(screen.getByRole('img')).toHaveAccessibleName('Day timeline: 1 day, 1 span, 0 marks')
  })

  it('exposes spans and marks in an sr-only table', () => {
    render(<DayTimeline days={days} />)
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

  it('shows the empty state for no days', () => {
    render(<DayTimeline days={[]} emptyMessage="Nothing logged" />)
    expect(screen.getByText('Nothing logged')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the default empty state when days have no spans', () => {
    render(<DayTimeline days={[{ day: 'd', spans: [], marks: [] }]} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('forwards ref, className and props; sets displayName', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<DayTimeline ref={ref} days={days} className="custom" data-testid="root" />)
    expect(ref.current).toBe(screen.getByTestId('root'))
    expect(ref.current).toHaveClass('custom')
    expect(DayTimeline.displayName).toBe('DayTimeline')
  })

  it('forwards ref and className in the empty state too', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<DayTimeline ref={ref} days={[]} className="custom" />)
    expect(ref.current).toHaveClass('custom')
  })
})
