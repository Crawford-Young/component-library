import type { Meta, StoryObj } from '@storybook/react'
import { StreakBadge } from '@/components/ui/streak-badge'

const meta: Meta<typeof StreakBadge> = {
  title: 'Display/StreakBadge',
  component: StreakBadge,
  tags: ['autodocs'],
  argTypes: {
    streak: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof StreakBadge>

export const Hidden: Story = {
  args: { streak: 0 },
  name: 'Hidden (streak = 0)',
}

export const Short: Story = {
  args: { streak: 5 },
}

export const Long: Story = {
  args: { streak: 30 },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StreakBadge streak={1} />
      <StreakBadge streak={5} />
      <StreakBadge streak={30} />
      <StreakBadge streak={100} />
    </div>
  ),
}
