import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { WeekCalendarView } from '@/components/ui/week-calendar-view'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof WeekCalendarView> = {
  title: 'Data/WeekCalendarView',
  component: WeekCalendarView,
}

export default meta
type Story = StoryObj<typeof WeekCalendarView>

const WEEK = '2026-05-04'

export const Default: Story = {
  args: {
    defaultWeekStart: WEEK,
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
        title: 'Design review',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:30:00',
        color: 'violet',
        location: 'Figma',
        description: 'Review component specs',
      },
      {
        id: '3',
        title: 'Sprint planning',
        start: '2026-05-06T10:00:00',
        end: '2026-05-06T11:00:00',
        color: 'teal',
        location: 'Conference Room B',
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

export const CustomDisplay: Story = {
  args: {
    defaultWeekStart: WEEK,
    hourStart: 6,
    hourCount: 14,
    hourHeight: 56,
    events: [
      {
        id: '1',
        title: 'Early meeting',
        start: '2026-05-04T06:30:00',
        end: '2026-05-04T07:00:00',
        color: 'blue',
        location: 'Zoom',
      },
      {
        id: '2',
        title: 'Afternoon sync',
        start: '2026-05-05T15:00:00',
        end: '2026-05-05T16:00:00',
        color: 'violet',
      },
    ],
  },
}

export const Overlapping: Story = {
  args: {
    defaultWeekStart: WEEK,
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

export const AllDay: Story = {
  args: {
    defaultWeekStart: WEEK,
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

export const EditAndDelete: Story = {
  args: {
    defaultWeekStart: WEEK,
    events: [
      {
        id: '1',
        title: 'Click to edit or delete',
        start: '2026-05-04T10:00:00',
        end: '2026-05-04T11:00:00',
        color: 'violet',
        location: 'Conference Room A',
        description: 'Open popover → Edit or Delete.',
      },
      {
        id: '2',
        title: 'Another editable event',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:00:00',
        color: 'teal',
      },
    ],
  },
}

export const Interactive: Story = {
  args: {
    defaultWeekStart: WEEK,
    hourHeight: 48,
    events: [
      {
        id: '1',
        title: 'Drag to move · Shift+drag = recurrence',
        start: '2026-05-04T09:00:00',
        end: '2026-05-04T10:00:00',
        color: 'blue',
      },
      {
        id: '2',
        title: 'Drag edge to resize',
        start: '2026-05-05T14:00:00',
        end: '2026-05-05T15:30:00',
        color: 'teal',
      },
    ],
    onEventCreate: () => {},
    onEventMove: () => {},
    onEventResize: () => {},
  },
}

export const SleepMode: Story = {
  args: {
    defaultWeekStart: WEEK,
    hourStart: 0,
    hourCount: 24,
    hourHeight: 28,
    sleepEnabled: true,
    sleepStart: 23,
    sleepEnd: 7,
    events: [
      { id: '1', title: 'Team standup', start: '2026-05-04T09:00:00', end: '2026-05-04T09:30:00' },
    ],
  },
}

function AllHoursDemo() {
  const [showAll, setShowAll] = React.useState(false)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Switch id="all-hours" checked={showAll} onCheckedChange={setShowAll} />
        <Label htmlFor="all-hours" className="cursor-pointer text-xs">
          {showAll
            ? 'All hours (0–24h) — sleep bands are visual only, drag anywhere'
            : 'Working hours (6am–midnight)'}
        </Label>
      </div>
      <WeekCalendarView
        defaultWeekStart={WEEK}
        hourStart={showAll ? 0 : 6}
        hourCount={showAll ? 24 : 18}
        hourHeight={showAll ? 28 : 36}
        sleepEnabled={false}
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
        onEventCreate={() => {}}
        onEventMove={() => {}}
        onEventResize={() => {}}
      />
    </div>
  )
}

export const AllHoursToggle: Story = {
  render: () => <AllHoursDemo />,
}
