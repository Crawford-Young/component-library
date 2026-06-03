import type { Meta, StoryObj } from '@storybook/react'
import { ActionConfirmCard } from '@/components/ui/action-confirm-card'

const meta: Meta<typeof ActionConfirmCard> = {
  title: 'UI/ActionConfirmCard',
  component: ActionConfirmCard,
  parameters: { layout: 'centered' },
  args: {
    action: "Mark 'Morning Run' complete",
    entityType: 'habit',
    date: 'June 1st',
    time: '7:00 AM',
    onConfirm: () => {},
    onDeny: () => {},
  },
}

export default meta
type Story = StoryObj<typeof ActionConfirmCard>

export const Pending: Story = {}

export const Goal: Story = {
  args: {
    action: "Create goal 'Write book'",
    entityType: 'goal',
    date: 'December 31st',
    time: undefined,
    detail: 'Target: finish first draft',
  },
}

export const Event: Story = {
  args: {
    action: "Schedule 'Team standup'",
    entityType: 'event',
    date: 'June 2nd',
    time: '9:00 AM',
  },
}

export const WithDetail: Story = {
  args: {
    detail: 'Retroactive — originally June 1st',
  },
}
