import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { EventFormDialog } from '@/components/ui/event-form-dialog'
import type { EventFormDialogProps, EventFormValues } from '@/components/ui/event-form-dialog'

const meta: Meta<typeof EventFormDialog> = {
  title: 'Dialogs/EventFormDialog',
  component: EventFormDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof EventFormDialog>

function ControlledDialog(props: Omit<EventFormDialogProps, 'open' | 'onOpenChange' | 'onSubmit'>) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-border bg-surface px-4 py-2 text-sm text-foreground hover:bg-item-hover"
      >
        Open dialog
      </button>
      <EventFormDialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(values: EventFormValues) => {
          console.info('Submitted:', values)
          setOpen(false)
        }}
      />
    </>
  )
}

export const Empty: Story = {
  render: () => <ControlledDialog />,
}

export const Seeded: Story = {
  render: () => (
    <ControlledDialog
      initialValues={{
        title: 'Morning run',
        startAt: '2025-06-15T09:00:00.000Z',
        endAt: '2025-06-15T10:00:00.000Z',
        color: 'blue',
        location: 'Riverside path',
        description: 'Easy 5k',
      }}
    />
  ),
}

export const AllDay: Story = {
  render: () => (
    <ControlledDialog
      initialValues={{
        title: 'Company holiday',
        allDay: true,
        color: 'green',
      }}
    />
  ),
}

export const Pending: Story = {
  render: () => <ControlledDialog isPending initialValues={{ title: 'Morning run' }} />,
}
