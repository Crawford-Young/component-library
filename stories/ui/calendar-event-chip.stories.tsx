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

/** Wires every adornment handler (edit/delete/complete-toggle/lock-toggle) so all four
 * cluster icons render, letting `completed`/`locked` toggle live via the chip's own controls. */
function FullClusterDemo({ event: base }: { readonly event: CalendarEvent }): React.JSX.Element {
  const [completed, setCompleted] = React.useState(base.completed ?? false)
  const [locked, setLocked] = React.useState(base.locked ?? false)
  return (
    <div className="relative h-48 w-56 rounded border">
      <CalendarEventChip
        event={{ ...base, completed, locked }}
        style={chipStyle}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleComplete={() => setCompleted((c) => !c)}
        onToggleLock={() => setLocked((l) => !l)}
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

export const AdornmentCluster: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Full top-right adornment cluster, wired with every handler: quick edit (pencil) and quick delete (x) reveal on hover/focus-within via `motion-safe:` opacity, the checkbox is idle-visible because `completable` + `onToggleComplete` are both set, and the lock toggle is idle-visible because `onToggleLock` is wired. All four are DOM siblings of the trigger button, never nested inside it. Hover the chip (or focus it via Tab) to reveal quick edit/delete.',
      },
    },
  },
  render: (args) => <FullClusterDemo event={args.event} />,
  args: {
    event: {
      id: '8',
      title: 'Full cluster demo',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T09:45:00',
      color: 'blue',
      completable: true,
      locked: false,
    },
    style: chipStyle,
  },
}

function LockableChipDemo({ event: base }: { readonly event: CalendarEvent }): React.JSX.Element {
  const [locked, setLocked] = React.useState(base.locked ?? false)
  return (
    <div className="relative h-48 w-56 rounded border">
      <CalendarEventChip
        event={{ ...base, locked }}
        style={chipStyle}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleLock={() => setLocked((l) => !l)}
      />
    </div>
  )
}

export const LockedChip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Locked event: the lock icon renders filled (`Lock`, not `LockOpen`) and the chip has no resize strips — `onMoveStart`/`onResizeStart` are never invoked while `locked` is `true`. The popover and quick edit/delete keep working regardless of lock state. Click the lock icon to unlock and see the resize strips return.',
      },
    },
  },
  render: (args) => <LockableChipDemo event={args.event} />,
  args: {
    event: {
      id: '9',
      title: 'Locked event',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T10:00:00',
      color: 'red',
      locked: true,
    },
    style: chipStyle,
  },
}

export const LockedNoCheckbox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Lock wired without `completable`/`onToggleComplete` — only the lock icon renders idle-visible, not a checkbox. The title's idle `pr-8` reserve assumes two always-visible icons (checkbox + lock) so it stays correct once a caller opts into completability later; with only the lock present this over-reserves a few pixels to the left of the icon. Cosmetic only — flagged here for eyeball review, not treated as a bug in this wave.",
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
      id: '10',
      title: 'Lock only, no checkbox',
      start: '2026-05-04T09:00:00',
      end: '2026-05-04T09:30:00',
      color: 'amber',
      locked: false,
    },
    style: chipStyle,
    onEdit: () => {},
    onDelete: () => {},
    onToggleLock: () => {},
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
