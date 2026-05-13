import type { Meta, StoryObj } from '@storybook/react'
import { CalendarNavBar } from '@/components/ui/calendar-nav-bar'

const meta: Meta<typeof CalendarNavBar> = {
  title: 'Data/CalendarNavBar',
  component: CalendarNavBar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CalendarNavBar>

export const Default: Story = {
  args: {
    currentDate: new Date('2026-05-11T00:00:00'),
    onDateChange: () => {},
  },
}
