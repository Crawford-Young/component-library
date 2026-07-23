import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorSwatchPicker } from '@/components/ui/color-swatch-picker'
import type { CalendarEventColor } from '@/components/ui/calendar-event-chip'

const meta: Meta<typeof ColorSwatchPicker> = {
  title: 'Primitives/ColorSwatchPicker',
  component: ColorSwatchPicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ColorSwatchPicker>

function DefaultDemo(): React.JSX.Element {
  const [color, setColor] = React.useState<CalendarEventColor>('blue')
  return <ColorSwatchPicker value={color} onChange={setColor} />
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

function SmallDemo(): React.JSX.Element {
  const [color, setColor] = React.useState<CalendarEventColor>('violet')
  return <ColorSwatchPicker value={color} onChange={setColor} size="sm" />
}

export const Small: Story = {
  render: () => <SmallDemo />,
}
