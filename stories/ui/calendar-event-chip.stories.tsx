import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { CalendarEventChip } from '@/components/ui/calendar-event-chip'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'

const meta: Meta<typeof CalendarEventChip> = {
  title: 'Data/CalendarEventChip',
  component: CalendarEventChip,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CalendarEventChip>

const chipStyle: React.CSSProperties = {
  position: 'absolute',
  top: '10%',
  height: '15%',
  left: 'calc(0% + 1px)',
  width: 'calc(100% - 2px)',
}

const tallChipStyle: React.CSSProperties = {
  position: 'absolute',
  top: '5%',
  height: '30%',
  left: 'calc(0% + 1px)',
  width: 'calc(100% - 2px)',
}

function ToggleableChipDemo({ event: base }: { readonly event: CalendarEvent }): React.JSX.Element {
  const [completed, setCompleted] = React.useState(base.completed ?? false)
  return (
    <div className="relative h-48 w-56 rounded border">
      <CalendarEventChip
        event={{ ...base, completed }}
        style={chipStyle}
        onToggleComplete={() => setCompleted((c) => !c)}
      />
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <div className="relative h-48 w-56 rounded border">
      <CalendarEventChip {...args} />
    </div>
  ),
  args: {
    event: {
      id: '1',
      title: 'Team standup',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T09:30:00',
      color: 'blue',
    },
    style: chipStyle,
    onEdit: () => {},
    onDelete: () => {},
  },
}

export const WithDescription: Story = {
  render: (args) => (
    <div className="relative h-48 w-56 rounded border">
      <CalendarEventChip {...args} />
    </div>
  ),
  args: {
    event: {
      id: '2',
      title: 'Design review',
      start: '2026-05-04T14:00:00',
      end: '2026-05-04T15:00:00',
      description: 'Review new component specs',
      color: 'violet',
    },
    style: chipStyle,
    onEdit: () => {},
    onDelete: () => {},
    onToggleComplete: () => {},
  },
}

export const Completed: Story = {
  render: (args) => <ToggleableChipDemo event={args.event} />,
  args: {
    event: {
      id: '5',
      title: 'Team standup',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T09:30:00',
      color: 'blue',
      completed: true,
      completable: true,
      streak: 12,
    },
    style: chipStyle,
    onEdit: () => {},
    onDelete: () => {},
    onToggleComplete: () => {},
  },
}

export const CompletableWithStreak: Story = {
  render: (args) => <ToggleableChipDemo event={args.event} />,
  args: {
    event: {
      id: '7',
      title: 'Morning run',
      start: '2026-05-04T07:00:00',
      end: '2026-05-04T08:00:00',
      color: 'orange',
      completable: true,
      streak: 12,
    },
    style: chipStyle,
    onToggleComplete: () => {},
  },
}

export const SeriesDaysEditSeed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "This event has no `recurrenceDays` — WeekCalendarView fans it out on this single day only. Its `seriesDays` field (['Tue', 'Thu']) seeds the edit popover's Days picker so it opens with Tue/Thu already pre-checked, letting the picker reflect a wider recurring series without WeekCalendarView duplicating this chip across those days. Open the popover (click the chip, then Edit) to see it.",
      },
    },
  },
  render: (args) => (
    <div className="relative h-48 w-56 rounded border">
      <CalendarEventChip {...args} />
    </div>
  ),
  args: {
    event: {
      id: '6',
      title: 'Morning stretch',
      start: '2026-05-04T07:00:00',
      end: '2026-05-04T07:20:00',
      color: 'teal',
      seriesDays: ['Tue', 'Thu'],
    },
    style: chipStyle,
    onEdit: () => {},
    onDelete: () => {},
  },
}

export const WithLocation: Story = {
  render: (args) => (
    <div className="relative h-64 w-56 rounded border">
      <CalendarEventChip {...args} />
    </div>
  ),
  args: {
    event: {
      id: '3',
      title: 'Sprint planning',
      start: '2026-05-04T10:00:00',
      end: '2026-05-04T11:30:00',
      color: 'green',
      location: 'Conference Room B',
      description: 'Plan sprint 14 tickets and capacity',
    },
    style: tallChipStyle,
    onEdit: () => {},
    onDelete: () => {},
  },
}

export const GoogleCalendarStyle: Story = {
  render: (args) => (
    <div className="relative h-64 w-72 rounded border">
      <CalendarEventChip {...args} />
    </div>
  ),
  args: {
    event: {
      id: '4',
      title: 'Product roadmap review',
      start: '2026-05-05T10:00:00',
      end: '2026-05-05T11:30:00',
      color: 'violet',
      location: 'Google Meet · meet.google.com/abc-defg',
      description: 'Review Q3 product priorities and resource allocation with leadership',
    },
    style: tallChipStyle,
    onEdit: () => {},
    onDelete: () => {},
  },
}

export const ColorPalette: Story = {
  render: () => (
    <div className="relative h-[600px] w-72 rounded border p-2">
      {(
        [
          'default',
          'blue',
          'violet',
          'indigo',
          'teal',
          'cyan',
          'sky',
          'green',
          'lime',
          'amber',
          'orange',
          'red',
          'rose',
          'pink',
          'fuchsia',
        ] as const
      ).map((color) => (
        <div key={color} className="relative mb-1 h-8 w-full rounded border">
          <CalendarEventChip
            event={{
              id: color,
              title: color,
              start: '2026-05-04T09:00:00',
              end: '2026-05-04T10:00:00',
              color,
            }}
            style={{
              position: 'absolute',
              top: '0%',
              height: '100%',
              left: 'calc(0% + 1px)',
              width: 'calc(100% - 2px)',
            }}
          />
        </div>
      ))}
    </div>
  ),
}
