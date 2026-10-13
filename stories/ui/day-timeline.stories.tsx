import type { Meta, StoryObj } from '@storybook/react'
import { DayTimeline } from '@/components/ui/day-timeline'

const H = 3_600_000
const M = 60_000

const days = [
  {
    day: '2026-10-05',
    spans: [
      { startMs: 9 * H, endMs: 11 * H + 30 * M, kind: 'active' as const },
      { startMs: 11 * H + 30 * M, endMs: 12 * H + 15 * M, kind: 'wait' as const },
      { startMs: 13 * H, endMs: 16 * H, kind: 'active' as const },
      { startMs: 9 * H + 15 * M, endMs: 10 * H + 45 * M, kind: 'agent' as const },
      { startMs: 14 * H, endMs: 15 * H + 30 * M, kind: 'agent' as const },
    ],
    marks: [
      { atMs: 12 * H + 20 * M, label: 'Issue #12 closed' },
      { atMs: 16 * H + 5 * M, label: 'PR #13 merged' },
    ],
  },
  {
    day: '2026-10-06',
    spans: [
      { startMs: 7 * H + 30 * M, endMs: 9 * H, kind: 'active' as const },
      { startMs: 20 * H, endMs: 23 * H + 30 * M, kind: 'active' as const },
      { startMs: 21 * H, endMs: 22 * H, kind: 'agent' as const },
    ],
    marks: [{ atMs: 22 * H + 40 * M, label: 'PR #14 merged' }],
  },
  {
    day: '2026-10-07',
    spans: [{ startMs: 10 * H, endMs: 10 * H + 20 * M, kind: 'wait' as const }],
    marks: [],
  },
]

const meta: Meta<typeof DayTimeline> = {
  title: 'Display/DayTimeline',
  component: DayTimeline,
  tags: ['autodocs'],
  args: { days, dayFormat: (d: string) => d.slice(5) },
}

export default meta
type Story = StoryObj<typeof DayTimeline>

export const Default: Story = {}

export const CustomKindLabels: Story = {
  args: { kindLabels: { active: 'Working', wait: 'Blocked', agent: 'Agent run' } },
}

export const Empty: Story = {
  args: { days: [], emptyMessage: 'No activity this week' },
}
