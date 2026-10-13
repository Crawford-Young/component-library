import type { Meta, StoryObj } from '@storybook/react'
import { TrendChart } from '@/components/ui/trend-chart'

const series = [
  { key: 'perIssue', label: '$ per closed issue' },
  { key: 'perPr', label: '$ per merged PR' },
]

const data = [
  { week: 'Sep 14', perIssue: null, perPr: null, spend: 39.5 },
  { week: 'Sep 21', perIssue: null, perPr: null, spend: 108.3 },
  { week: 'Sep 28', perIssue: null, perPr: null, spend: 0 },
  { week: 'Oct 5', perIssue: 8.63, perPr: 5.58, spend: 223.8 },
  { week: 'Oct 12', perIssue: 7.58, perPr: 7.58, spend: 218.1 },
]

const meta: Meta<typeof TrendChart> = {
  title: 'Display/TrendChart',
  component: TrendChart,
  tags: ['autodocs'],
  args: {
    data,
    xKey: 'week',
    xLabel: 'Week',
    series,
    format: (v: number) => `$${v.toFixed(2)}`,
    xFormat: (x: string) => `w/c ${x}`,
  },
}

export default meta
type Story = StoryObj<typeof TrendChart>

export const Default: Story = {}

export const WithBackgroundBars: Story = {
  args: {
    background: {
      key: 'spend',
      label: 'Total spend that week',
      format: (v: number) => `$${Math.round(v)}`,
    },
  },
}

export const Empty: Story = {
  args: { data: data.slice(0, 3), emptyMessage: 'No closed issues in this range' },
}
