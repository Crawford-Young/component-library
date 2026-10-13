import type { Meta, StoryObj } from '@storybook/react'
import { DayTimeline } from '@/components/ui/day-timeline'

const H = 3_600_000
const M = 60_000

const kinds = [
  { key: 'active', label: 'Active' },
  { key: 'wait', label: 'Wait' },
  { key: 'agent', label: 'Agent', lane: 'sub' as const },
]

const days = [
  {
    day: '2026-10-05',
    spans: [
      { startMs: 9 * H, endMs: 11 * H + 30 * M, kind: 'active' },
      { startMs: 11 * H + 30 * M, endMs: 12 * H + 15 * M, kind: 'wait' },
      { startMs: 13 * H, endMs: 16 * H, kind: 'active' },
      { startMs: 9 * H + 15 * M, endMs: 10 * H + 45 * M, kind: 'agent' },
      { startMs: 14 * H, endMs: 15 * H + 30 * M, kind: 'agent' },
    ],
    marks: [
      { atMs: 12 * H + 20 * M, label: 'Issue #12 closed' },
      { atMs: 16 * H + 5 * M, label: 'PR #13 merged' },
    ],
  },
  {
    day: '2026-10-06',
    spans: [
      { startMs: 7 * H + 30 * M, endMs: 9 * H, kind: 'active' },
      { startMs: 20 * H, endMs: 23 * H + 30 * M, kind: 'active' },
      { startMs: 21 * H, endMs: 22 * H, kind: 'agent' },
    ],
    marks: [{ atMs: 22 * H + 40 * M, label: 'PR #14 merged' }],
  },
  {
    day: '2026-10-07',
    spans: [{ startMs: 10 * H, endMs: 10 * H + 20 * M, kind: 'wait' }],
    marks: [],
  },
]

const meta: Meta<typeof DayTimeline> = {
  title: 'Display/DayTimeline',
  component: DayTimeline,
  tags: ['autodocs'],
  args: { days, kinds, dayFormat: (d: string) => d.slice(5) },
}

export default meta
type Story = StoryObj<typeof DayTimeline>

export const Default: Story = {}

export const CustomKinds: Story = {
  args: {
    kinds: [
      { key: 'active', label: 'Working' },
      { key: 'wait', label: 'Blocked' },
      { key: 'agent', label: 'Agent run', lane: 'sub' },
    ],
  },
}

export const MarksOnly: Story = {
  args: {
    days: [{ day: '2026-10-08', spans: [], marks: [{ atMs: 11 * H, label: 'Release shipped' }] }],
  },
}

export const Empty: Story = {
  args: { days: [], emptyMessage: 'No activity this week' },
}
