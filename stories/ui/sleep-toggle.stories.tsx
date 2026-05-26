import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SleepToggle } from '@/components/ui/sleep-toggle'

const meta: Meta<typeof SleepToggle> = {
  title: 'UI/SleepToggle',
  component: SleepToggle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SleepToggle>

function DefaultDemo() {
  const [enabled, setEnabled] = React.useState(false)
  return <SleepToggle enabled={enabled} onToggle={setEnabled} />
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

export const Enabled: Story = {
  args: { enabled: true, onToggle: () => {} },
}
