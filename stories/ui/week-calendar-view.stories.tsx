import type { Meta, StoryObj } from '@storybook/react'
import { WeekCalendarView } from '@/components/ui/week-calendar-view'

const meta: Meta<typeof WeekCalendarView> = {
  title: 'Data/WeekCalendarView',
  component: WeekCalendarView,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof WeekCalendarView>

export const Default: Story = {
  args: {
    weekStart: '2026-05-04',
    events: [
      {
        id: '1',
        title: 'Team standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
      },
      {
        id: '2',
        title: 'Design review',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:30:00',
        color: 'blue',
      },
      {
        id: '3',
        title: 'Sprint planning',
        start: '2026-05-06T10:00:00',
        end: '2026-05-06T11:00:00',
        color: 'violet',
      },
      {
        id: '4',
        title: 'Lunch',
        start: '2026-05-07T12:00:00',
        end: '2026-05-07T13:00:00',
        color: 'green',
      },
    ],
  },
}

export const CustomHours: Story = {
  args: {
    weekStart: '2026-05-04',
    hourStart: 6,
    hourCount: 12,
    events: [
      {
        id: '1',
        title: 'Early meeting',
        start: '2026-05-04T06:30:00',
        end: '2026-05-04T07:00:00',
      },
    ],
  },
}
