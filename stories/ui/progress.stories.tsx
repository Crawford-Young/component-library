import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from '@/components/ui/progress'

const meta: Meta<typeof Progress> = {
  title: 'Feedback/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof Progress>

export const Default: Story = { args: { value: 60, 'aria-label': 'Loading progress' } }
export const Small: Story = { args: { value: 40, size: 'sm', 'aria-label': 'Loading progress' } }
export const Large: Story = { args: { value: 80, size: 'lg', 'aria-label': 'Loading progress' } }
export const Indeterminate: Story = {
  args: { value: undefined, 'aria-label': 'Loading progress' },
}
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Progress value={60} size="sm" />
      <Progress value={60} size="default" />
      <Progress value={60} size="lg" />
    </div>
  ),
}
