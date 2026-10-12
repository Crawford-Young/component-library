import type { Meta, StoryObj } from '@storybook/react'
import { StatusDot } from '@/components/ui/status-dot'

const states = ['working', 'needs-you', 'idle', 'done'] as const

const meta: Meta<typeof StatusDot> = {
  title: 'Display/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  argTypes: { state: { control: 'select', options: states } },
}

export default meta
type Story = StoryObj<typeof StatusDot>

export const Default: Story = { args: { state: 'working', label: 'Working' } }
export const Working: Story = { args: { state: 'working', label: 'Working' } }
export const NeedsYou: Story = { args: { state: 'needs-you', label: 'Needs you' } }
export const Idle: Story = { args: { state: 'idle', label: 'Idle' } }
export const Done: Story = { args: { state: 'done', label: 'Done' } }

export const Decorative: Story = {
  render: () => (
    <span className="flex items-center gap-2 text-sm text-foreground">
      <StatusDot state="working" />
      working
    </span>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {states.map((s) => (
        <span key={s} className="flex items-center gap-2 text-sm text-foreground">
          <StatusDot state={s} />
          {s}
        </span>
      ))}
    </div>
  ),
}
