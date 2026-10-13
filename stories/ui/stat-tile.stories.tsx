import type { Meta, StoryObj } from '@storybook/react'
import { StatTile } from '@/components/ui/stat-tile'

const meta: Meta<typeof StatTile> = {
  title: 'Display/StatTile',
  component: StatTile,
  tags: ['autodocs'],
  args: {
    label: '$ per closed issue',
    value: '$7.58',
    delta: { change: -0.12, goodWhen: 'down', label: 'vs $8.63' },
    hint: 'w/c Oct 12 (2 days) vs w/c Oct 5',
  },
}

export default meta
type Story = StoryObj<typeof StatTile>

export const Default: Story = {}

export const Worse: Story = {
  args: {
    label: 'Hours per closed issue',
    value: '0.85 h',
    delta: { change: 0.35, goodWhen: 'down', label: 'vs 0.63 h' },
  },
}

export const FlatLabel: Story = {
  args: { label: 'Issues closed', value: '11', delta: { label: 'vs 17' }, hint: 'completed only' },
}

export const Unavailable: Story = {
  args: {
    label: 'Permission prompts',
    value: undefined,
    delta: undefined,
    unavailable: 'Not recorded',
    hint: 'hooks are off',
  },
}

export const RealZero: Story = {
  args: { label: 'Compactions', value: '0', muted: true, delta: { label: '50 /clear rotations' } },
}

export const InAGrid: Story = {
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5">
      <StatTile
        label="$ per closed issue"
        value="$7.58"
        delta={{ change: -0.12, goodWhen: 'down', label: 'vs $8.63' }}
      />
      <StatTile label="Issues closed" value="11" delta={{ label: 'vs 17' }} />
      <StatTile label="Compactions" value="0" muted delta={{ label: '50 /clear rotations' }} />
      <StatTile label="Permission prompts" unavailable="Not recorded" hint="hooks are off" />
    </div>
  ),
}
