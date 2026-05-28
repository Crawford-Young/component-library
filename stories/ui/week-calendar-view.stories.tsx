import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { WeekCalendarView } from '@/components/ui/week-calendar-view'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'
import { SleepToggle } from '@/components/ui/sleep-toggle'

const meta: Meta<typeof WeekCalendarView> = {
  title: 'Data/WeekCalendarView',
  component: WeekCalendarView,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof WeekCalendarView>

export const Default: Story = {
  args: {
    defaultWeekStart: '2026-05-04',
    events: [
      {
        id: '1',
        title: 'Team standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        location: 'Google Meet',
      },
      {
        id: '2',
        title: 'Design review',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:30:00',
        color: 'blue',
        location: 'Figma',
        description: 'Review new component specs and token updates',
      },
      {
        id: '3',
        title: 'Sprint planning',
        start: '2026-05-06T10:00:00',
        end: '2026-05-06T11:00:00',
        color: 'violet',
        location: 'Conference Room B',
        description: 'Plan sprint 14 tickets',
      },
      {
        id: '4',
        title: 'Lunch',
        start: '2026-05-07T12:00:00',
        end: '2026-05-07T13:00:00',
        color: 'green',
        location: 'The Canteen',
      },
    ],
  },
}

export const CustomHours: Story = {
  args: {
    defaultWeekStart: '2026-05-04',
    hourStart: 6,
    hourCount: 12,
    events: [
      {
        id: '1',
        title: 'Early meeting',
        start: '2026-05-04T06:30:00',
        end: '2026-05-04T07:00:00',
        location: 'Zoom',
      },
    ],
  },
}

export const WithOverlap: Story = {
  args: {
    defaultWeekStart: '2026-05-04',
    events: [
      {
        id: '1',
        title: 'Standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        color: 'blue',
        location: 'Google Meet',
      },
      {
        id: '2',
        title: 'Design sync',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'violet',
        location: 'Figma',
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
    defaultWeekStart: '2026-05-04',
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
    defaultWeekStart: '2026-05-04',
    hourHeight: 80,
    events: [
      {
        id: '1',
        title: 'Morning meeting',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'blue',
        location: 'Building A',
        description: 'Weekly team sync',
      },
    ],
  },
}

export const WithClickHandler: Story = {
  args: {
    defaultWeekStart: '2026-05-04',
    events: [
      {
        id: '1',
        title: 'Clickable event',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'cyan',
        location: 'Zoom',
        description: 'Click me to see the popover',
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

// Click any day header to expand it; click again to collapse
export const ExpandedDay: Story = {
  args: {
    defaultWeekStart: '2026-05-04',
    events: [
      {
        id: '1',
        title: 'Team standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        color: 'blue',
        location: 'Google Meet',
      },
      {
        id: '2',
        title: 'Lunch',
        start: '2026-05-04T12:00:00',
        end: '2026-05-04T13:00:00',
        color: 'green',
        location: 'The Canteen',
      },
      {
        id: '3',
        title: 'Design review',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:00:00',
        color: 'violet',
        location: 'Figma',
        description: 'Q2 component audit',
      },
    ],
  },
}

export const GoogleCalendarEvents: Story = {
  args: {
    defaultWeekStart: '2026-05-04',
    hourHeight: 72,
    events: [
      {
        id: '1',
        title: 'Team standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
        color: 'blue',
        location: 'Google Meet · meet.google.com/abc-defg-hij',
      },
      {
        id: '2',
        title: 'Product roadmap review',
        start: '2026-05-05T10:00:00',
        end: '2026-05-05T11:30:00',
        color: 'indigo',
        location: 'Conference Room A',
        description: 'Review Q3 product priorities and resource allocation',
      },
      {
        id: '3',
        title: 'Lunch with investors',
        start: '2026-05-06T12:00:00',
        end: '2026-05-06T13:30:00',
        color: 'teal',
        location: 'Nobu, 105 Hudson St, New York',
        description: 'Quarterly check-in with Series A investors',
      },
      {
        id: '4',
        title: 'Sprint retrospective',
        start: '2026-05-07T15:00:00',
        end: '2026-05-07T16:00:00',
        color: 'orange',
        location: 'Zoom',
        description: 'Sprint 13 retrospective — what went well, what to improve',
      },
      {
        id: '5',
        title: 'Weekly 1:1',
        start: '2026-05-08T11:00:00',
        end: '2026-05-08T11:30:00',
        color: 'rose',
        location: "Manager's office",
      },
      {
        id: '6',
        title: 'Design tokens audit',
        start: '2026-05-09T10:00:00',
        end: '2026-05-09T11:00:00',
        color: 'fuchsia',
        location: 'Figma',
        description: 'Review color and spacing tokens across all components',
      },
    ],
  },
}

export const WithSleepMode: Story = {
  args: {
    defaultWeekStart: '2026-05-04',
    hourStart: 0,
    hourCount: 24,
    hourHeight: 28,
    sleepEnabled: true,
    sleepStart: 23,
    sleepEnd: 7,
    events: [
      {
        id: '1',
        title: 'Team standup',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T09:30:00',
      },
    ],
  },
}

function WithDragCallbacksDemo() {
  const [events, setEvents] = React.useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Moveable event',
      start: '2026-05-05T10:00:00',
      end: '2026-05-05T11:00:00',
      color: 'blue',
    },
  ])
  return (
    <WeekCalendarView
      defaultWeekStart="2026-05-04"
      events={events}
      onEventCreate={(e) => setEvents((prev) => [...prev, { ...e, id: String(Date.now()) }])}
      onEventMove={(e) => setEvents((prev) => prev.map((ev) => (ev.id === e.id ? e : ev)))}
      onEventResize={(e) => setEvents((prev) => prev.map((ev) => (ev.id === e.id ? e : ev)))}
      onEventDuplicate={(copies) =>
        setEvents((prev) => [
          ...prev,
          ...copies.map((e) => ({ ...e, id: String(Date.now() + Math.random()) })),
        ])
      }
    />
  )
}

export const WithDragCallbacks: Story = {
  render: () => <WithDragCallbacksDemo />,
}

export const TodayButton: Story = {
  args: {
    defaultWeekStart: '2026-04-06',
    events: [],
  },
}

function WithSleepToggleDemo() {
  const [sleepEnabled, setSleepEnabled] = React.useState(false)
  return (
    <div className="flex flex-col gap-3">
      <SleepToggle enabled={sleepEnabled} onToggle={setSleepEnabled} />
      <WeekCalendarView
        defaultWeekStart="2026-05-04"
        hourStart={6}
        hourCount={18}
        hourHeight={36}
        sleepEnabled={sleepEnabled}
        sleepStart={23}
        sleepEnd={7}
        events={[
          {
            id: '1',
            title: 'Team standup',
            start: '2026-05-04T09:00:00',
            end: '2026-05-04T09:30:00',
          },
          {
            id: '2',
            title: 'Late night call',
            start: '2026-05-05T23:30:00',
            end: '2026-05-06T00:00:00',
          },
        ]}
      />
    </div>
  )
}

export const WithSleepToggle: Story = {
  render: () => <WithSleepToggleDemo />,
}
