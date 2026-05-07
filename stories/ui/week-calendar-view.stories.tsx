import type { Meta, StoryObj } from '@storybook/react'
import { WeekCalendarView } from '@/components/ui/week-calendar-view'
import type { CalendarEvent } from '@/components/ui/week-calendar-view'

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
      { id: '1', title: 'Team standup', start: '2026-05-04T09:00:00', end: '2026-05-04T09:30:00' },
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
      { id: '1', title: 'Early meeting', start: '2026-05-04T06:30:00', end: '2026-05-04T07:00:00' },
    ],
  },
}

export const WithOverlap: Story = {
  args: {
    weekStart: '2026-05-04',
    events: [
      {
        id: '1',
        title: 'Standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        color: 'blue',
      },
      {
        id: '2',
        title: 'Design sync',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'violet',
      },
      {
        id: '3',
        title: '1:1 with manager',
        start: '2026-05-04T09:15:00',
        end: '2026-05-04T09:45:00',
        color: 'green',
      },
    ],
  },
}

export const WithAllDay: Story = {
  args: {
    weekStart: '2026-05-04',
    events: [
      {
        id: 'ad1',
        title: 'Conference',
        start: '2026-05-04T00:00:00',
        end: '2026-05-04T23:59:59',
        allDay: true,
        color: 'amber',
      },
      {
        id: 'ad2',
        title: 'Holiday',
        start: '2026-05-06T00:00:00',
        end: '2026-05-06T23:59:59',
        allDay: true,
        color: 'red',
      },
      { id: '1', title: 'Team standup', start: '2026-05-04T09:00:00', end: '2026-05-04T09:30:00' },
    ],
  },
}

export const WithCustomHeight: Story = {
  args: {
    weekStart: '2026-05-04',
    hourHeight: 80,
    events: [
      {
        id: '1',
        title: 'Morning meeting',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'blue',
      },
    ],
  },
}

export const WithRenderEvent: Story = {
  render: (args) => (
    <WeekCalendarView
      {...args}
      renderEvent={(event) => (
        <div className="flex h-full flex-col justify-between p-1">
          <span className="truncate font-semibold text-white">{event.title}</span>
          <span className="text-[9px] text-white/70">
            {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    />
  ),
  args: {
    weekStart: '2026-05-04',
    events: [
      {
        id: '1',
        title: 'Team standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        color: 'blue',
      },
      {
        id: '2',
        title: 'Design review',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:00:00',
        color: 'violet',
      },
    ],
  },
}

export const WithClickHandler: Story = {
  args: {
    weekStart: '2026-05-04',
    events: [
      {
        id: '1',
        title: 'Clickable event',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'cyan',
      },
      {
        id: '2',
        title: 'Another event',
        start: '2026-05-05T11:00:00',
        end: '2026-05-05T12:00:00',
        color: 'pink',
      },
    ],
    onEventClick: (event: CalendarEvent) => alert(`Clicked: ${event.title}`),
  },
}
