import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '@/components/ui/separator'

const meta: Meta<typeof Separator> = {
  title: 'Display/Separator',
  component: Separator,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm text-muted-foreground">Above</p>
      <Separator className="my-4" />
      <p className="text-sm text-muted-foreground">Below</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-16 items-center gap-4">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
}
