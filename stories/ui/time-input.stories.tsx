import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TimeInput } from '@/components/ui/time-input'

const meta: Meta<typeof TimeInput> = {
  title: 'UI/TimeInput',
  component: TimeInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TimeInput>

function format12h(time: string): string {
  const [hStr = '0', mStr = '0'] = time.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const ampm = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

function TimeInputDemo({
  initial,
  use24h,
  size,
}: {
  initial: string
  use24h?: boolean
  size?: 'sm' | 'md'
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <div className="flex flex-col gap-2">
      <TimeInput
        value={value}
        onChange={setValue}
        label="Time"
        id="demo-time"
        use24h={use24h}
        size={size}
      />
      <p className="text-xs text-muted-foreground">
        {use24h ? `12h: ${format12h(value)}` : `24h: ${value}`}
      </p>
    </div>
  )
}

export const Default: Story = {
  render: () => <TimeInputDemo initial="09:00" />,
}

export const Noon: Story = {
  render: () => <TimeInputDemo initial="12:00" />,
}

export const Midnight: Story = {
  render: () => <TimeInputDemo initial="00:00" />,
}

export const LateNight: Story = {
  render: () => <TimeInputDemo initial="23:45" />,
}

export const TwentyFourHour: Story = {
  name: '24h Time',
  render: () => <TimeInputDemo initial="14:30" use24h />,
}

export const TwentyFourHourMidnight: Story = {
  name: '24h Midnight',
  render: () => <TimeInputDemo initial="00:00" use24h />,
}

export const TwentyFourHourLateNight: Story = {
  name: '24h Late Night',
  render: () => <TimeInputDemo initial="23:45" use24h />,
}

export const FormSize: Story = {
  name: 'Form size (md)',
  render: () => <TimeInputDemo initial="09:00" size="md" />,
}

export const Disabled: Story = {
  args: {
    value: '14:30',
    onChange: () => {},
    disabled: true,
    label: 'Time',
  },
}
