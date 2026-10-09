import type { Meta, StoryObj } from '@storybook/react'
import { ContextGauge } from '@/components/ui/context-gauge'

const meta: Meta<typeof ContextGauge> = {
  title: 'Feedback/ContextGauge',
  component: ContextGauge,
  tags: ['autodocs'],
  argTypes: { size: { control: 'select', options: ['sm', 'md'] } },
  decorators: [
    (Story) => (
      <div className="w-48">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ContextGauge>

export const Default: Story = { args: { value: 62, label: '62%' } }

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ContextGauge value={40} label="40%" />
      <ContextGauge value={85} label="85%" />
      <ContextGauge value={97} label="97%" />
    </div>
  ),
}

export const HeaderSize: Story = { args: { value: 62, size: 'md', label: '62%' } }
