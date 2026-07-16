import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ActivityTemplateDialog } from '@/components/ui/activity-template-dialog'
import type {
  ActivityTemplateDialogProps,
  ActivityTemplateValues,
} from '@/components/ui/activity-template-dialog'

const meta: Meta<typeof ActivityTemplateDialog> = {
  title: 'Dialogs/ActivityTemplateDialog',
  component: ActivityTemplateDialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof ActivityTemplateDialog>

function ControlledDialog(
  props: Omit<ActivityTemplateDialogProps, 'open' | 'onOpenChange' | 'onSubmit'>,
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
      <ActivityTemplateDialog
        {...props}
        open={open}
        onOpenChange={setOpen}
        onSubmit={(values: ActivityTemplateValues) => {
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
        color: 'blue',
        description: 'Easy zone-2 jog to start the day.',
        defaultLocation: 'Riverside path',
        minDurationMin: 20,
        maxDurationMin: 60,
        weeklyTargetSessions: 4,
        schedule: [
          { day: 1, startMinutes: 7 * 60, durationMin: 30 },
          { day: 3, startMinutes: 7 * 60, durationMin: 45 },
          { day: 5, startMinutes: 6 * 60 + 30, durationMin: 40 },
        ],
      }}
    />
  ),
}

export const Pending: Story = {
  render: () => <ControlledDialog isPending initialValues={{ title: 'Morning run' }} />,
}
