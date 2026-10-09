import type { Meta, StoryObj } from '@storybook/react'
import { AgentNodeCard } from '@/components/ui/agent-node-card'

const meta: Meta<typeof AgentNodeCard> = {
  title: 'Display/AgentNodeCard',
  component: AgentNodeCard,
  tags: ['autodocs'],
  argTypes: { state: { control: 'select', options: ['working', 'needs-you', 'idle', 'done'] } },
  decorators: [
    (Story) => (
      <div className="w-[184px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AgentNodeCard>

export const Default: Story = {
  args: { name: 'planner', detail: 'Reading the spec files', context: 62, contextLabel: '62%' },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <AgentNodeCard
        name="planner"
        state="working"
        detail="Reading files"
        context={40}
        contextLabel="40%"
      />
      <AgentNodeCard
        name="builder"
        state="needs-you"
        detail="Approve edit?"
        context={85}
        contextLabel="85%"
      />
      <AgentNodeCard
        name="reviewer"
        state="idle"
        detail="Waiting"
        context={97}
        contextLabel="97%"
      />
      <AgentNodeCard name="scout" state="done" detail="Finished" />
      <AgentNodeCard name="selected" selected detail="Selected" />
      <AgentNodeCard name="dimmed" dimmed detail="Dimmed" />
    </div>
  ),
}
