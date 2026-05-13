import type { Meta, StoryObj } from '@storybook/react'
import { CalendarEventChip } from '@/components/ui/calendar-event-chip'

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
  },
}
