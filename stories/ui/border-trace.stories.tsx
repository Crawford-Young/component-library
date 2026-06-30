import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { BorderTrace, TraceBorder } from '@/components/ui/border-trace'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof BorderTrace> = {
  title: 'Feedback/BorderTrace',
  component: BorderTrace,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BorderTrace>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <BorderTrace size="xs" />
      <BorderTrace size="sm" />
      <BorderTrace size="md" />
      <BorderTrace size="lg" />
    </div>
  ),
}

export const Circle: Story = {
  render: () => <BorderTrace shape="circle" size="lg" />,
}

export const OnButton: Story = {
  render: function OnButtonStory() {
    const [pending, setPending] = React.useState(true)
    return (
      <div className="flex items-center gap-4">
        <TraceBorder active={pending}>
          <Button onClick={() => setPending((p) => !p)}>Save</Button>
        </TraceBorder>
        <span className="text-sm text-muted-foreground">click to toggle</span>
      </div>
    )
  },
}
