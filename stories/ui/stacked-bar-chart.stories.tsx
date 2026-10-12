import type { Meta, StoryObj } from '@storybook/react'
import { StackedBarChart } from '@/components/ui/stacked-bar-chart'

const series = [
  { key: 'demo', label: 'demo' },
  { key: 'strate', label: 'strate' },
  { key: 'other', label: 'other' },
]

const data = [
  { day: '2026-10-05', demo: 1.2, strate: 0.8, other: 0.4 },
  { day: '2026-10-06', demo: 0.3, strate: 2.1, other: 0 },
  { day: '2026-10-07', demo: 0, strate: 1.4, other: 0.9 },
  { day: '2026-10-08', demo: 2.4, strate: 0.2, other: 0.1 },
  { day: '2026-10-09', demo: 0.9, strate: 0.9, other: 0.9 },
]

const meta: Meta<typeof StackedBarChart> = {
  title: 'Display/StackedBarChart',
  component: StackedBarChart,
  tags: ['autodocs'],
  args: {
    data,
    xKey: 'day',
    series,
    format: (v: number) => `$${v.toFixed(2)}`,
    xFormat: (x: string) => x.slice(5),
  },
}

export default meta
type Story = StoryObj<typeof StackedBarChart>

export const Default: Story = {}

export const Hours: Story = {
  args: { format: (v: number) => `${v.toFixed(1)} h` },
}

export const Empty: Story = {
  args: { data: [], emptyMessage: 'No spend recorded this week' },
}
