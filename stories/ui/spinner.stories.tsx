import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from '@/components/ui/spinner'

const meta: Meta<typeof Spinner> = {
  title: 'Display/Spinner',
  component: Spinner,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
}
