import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import { ProgressLine } from '@/components/ui/progress-line'

const meta: Meta<typeof ProgressLine> = {
  title: 'Feedback/ProgressLine',
  component: ProgressLine,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ProgressLine>

export const Active: Story = {
  render: () => (
    <div className="h-24">
      <ProgressLine active />
      <p className="text-muted-foreground">Line crawls toward 90% at the top of the viewport.</p>
    </div>
  ),
}

const InteractiveDemo = () => {
  const [active, setActive] = React.useState(false)
  return (
    <div className="flex h-24 flex-col gap-4">
      <ProgressLine active={active} />
      <Button onClick={() => setActive((prev) => !prev)}>
        {active ? 'Finish loading' : 'Start loading'}
      </Button>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
}
