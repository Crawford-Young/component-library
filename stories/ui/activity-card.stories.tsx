import type { Meta, StoryObj } from '@storybook/react'
import { ActivityCard } from '@/components/ui/activity-card'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof ActivityCard> = {
  title: 'Display/ActivityCard',
  component: ActivityCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}
export default meta
type Story = StoryObj<typeof ActivityCard>

export const TaskPending: Story = {
  name: 'Task — Pending',
  args: {
    title: 'Submit quarterly report',
    type: 'task',
    status: 'pending',
    visibility: 'everyone',
  },
}

export const GoalInProgress: Story = {
  name: 'Goal — In Progress',
  args: {
    title: 'Run a 5K under 25 minutes',
    type: 'goal',
    status: 'in_progress',
    streak: 12,
    visibility: 'friends',
    nextOccurrence: 'Saturday 7:00 AM',
  },
}

export const HabitCompleted: Story = {
  name: 'Habit — Completed',
  args: {
    title: 'Morning meditation',
    type: 'habit',
    status: 'completed',
    streak: 30,
    visibility: 'only_me',
    nextOccurrence: 'Tomorrow 7:00 AM',
  },
}

export const WithParticipants: Story = {
  name: 'Group — With Participants',
  args: {
    title: 'Weekly book club discussion',
    type: 'goal',
    status: 'pending',
    participantCount: 8,
    visibility: 'everyone',
    nextOccurrence: 'Friday 6:00 PM',
  },
}

export const VisibilityEveryone: Story = {
  name: 'Visibility — Everyone',
  args: {
    title: 'Daily walk',
    type: 'habit',
    status: 'pending',
    visibility: 'everyone',
  },
}

export const VisibilityFriends: Story = {
  name: 'Visibility — Friends',
  args: {
    title: 'Language learning session',
    type: 'habit',
    status: 'in_progress',
    visibility: 'friends',
  },
}

export const VisibilityBusy: Story = {
  name: 'Visibility — Busy',
  args: {
    title: 'Deep work block',
    type: 'task',
    status: 'pending',
    visibility: 'busy',
  },
}

export const VisibilityOnlyMe: Story = {
  name: 'Visibility — Only Me',
  args: {
    title: 'Personal journaling',
    type: 'habit',
    status: 'pending',
    visibility: 'only_me',
  },
}

export const WithDetail: Story = {
  name: 'With Detail Node',
  args: {
    title: 'Weekly review',
    type: 'task',
    status: 'pending',
    visibility: 'friends',
    nextOccurrence: 'Sunday 8:00 PM',
    detail: <span className="text-xs text-muted-foreground">Recurs every Sunday</span>,
  },
}

export const WithActions: Story = {
  name: 'With Actions',
  args: {
    title: 'Evening run',
    type: 'habit',
    status: 'pending',
    streak: 5,
    visibility: 'everyone',
    actions: (
      <Button size="sm" variant="outline">
        Log completion
      </Button>
    ),
  },
}

export const FullFeatured: Story = {
  name: 'Full Featured',
  args: {
    title: 'Team coding challenge',
    type: 'goal',
    status: 'in_progress',
    streak: 7,
    participantCount: 3,
    visibility: 'friends',
    nextOccurrence: 'Wednesday 5:00 PM',
    detail: <span className="text-xs text-muted-foreground">Recurs weekly on Wednesdays</span>,
    actions: (
      <div className="flex gap-2">
        <Button size="sm">Join session</Button>
        <Button size="sm" variant="ghost">
          View details
        </Button>
      </div>
    ),
  },
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <ActivityCard
        title="Submit quarterly report"
        type="task"
        status="pending"
        visibility="everyone"
      />
      <ActivityCard
        title="Run a 5K under 25 minutes"
        type="goal"
        status="in_progress"
        streak={12}
        visibility="friends"
        nextOccurrence="Saturday 7:00 AM"
      />
      <ActivityCard
        title="Morning meditation"
        type="habit"
        status="completed"
        streak={30}
        visibility="only_me"
        nextOccurrence="Tomorrow 7:00 AM"
      />
    </div>
  ),
}
