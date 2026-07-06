import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ActivityFormDialog } from '@/components/ui/activity-form-dialog'
import type {
  ActivityFormDialogProps,
  ActivityFormValues,
} from '@/components/ui/activity-form-dialog'

const meta: Meta<typeof ActivityFormDialog> = {
  title: 'Dialogs/ActivityFormDialog',
  component: ActivityFormDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof ActivityFormDialog>

function ControlledDialog(
  props: Omit<ActivityFormDialogProps, 'open' | 'onOpenChange' | 'onSubmit'>,
) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-border bg-surface px-4 py-2 text-sm text-foreground hover:bg-item-hover"
      >
        Open dialog
      </button>
      <ActivityFormDialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(values: ActivityFormValues) => {
          console.info('Submitted:', values)
          setOpen(false)
        }}
      />
    </>
  )
}

export const CreateTask: Story = {
  render: () => <ControlledDialog initialType="task" />,
}

export const GoalMode: Story = {
  render: () => <ControlledDialog initialType="goal" />,
}

export const GroupSocial: Story = {
  render: () => (
    <ControlledDialog
      initialType="task"
      initialValues={{
        title: 'Group workout',
        social: {
          activityType: 'group',
          visibility: 'friends',
          joinability: 'request',
          maxParticipants: 8,
        },
      }}
    />
  ),
}

export const WeeklyRecurrence: Story = {
  render: () => (
    <ControlledDialog
      initialType="task"
      initialValues={{
        title: 'Weekly standup',
        startAt: '2025-06-15T09:00:00.000Z',
        endAt: '2025-06-15T09:30:00.000Z',
        recurrence: 'weekly',
        recurrenceCount: 8,
        recurrenceDays: ['Mon', 'Wed', 'Fri'],
      }}
    />
  ),
}

export const EditLockType: Story = {
  render: () => (
    <ControlledDialog
      lockType
      initialType="task"
      initialValues={{
        title: 'Morning run',
        startAt: '2025-06-15T09:00:00.000Z',
        endAt: '2025-06-15T10:00:00.000Z',
        color: 'blue',
        location: 'Riverside path',
        description: 'Easy 5k',
        social: { activityType: 'solo', visibility: 'only_me' },
      }}
    />
  ),
}
