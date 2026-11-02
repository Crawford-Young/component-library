import type { Meta, StoryObj } from '@storybook/react'
import { AgentNodeCard, AgentNodeCharge } from '@/components/ui/agent-node-card'

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

export const WithLaneChargeAndCost: Story = {
  render: () => (
    <AgentNodeCard
      name="builder"
      state="needs-you"
      cost="$1.23"
      lane="background"
      charge={<AgentNodeCharge chargeKey="strate#109" source="branch name" />}
      context={62}
      contextLabel="62%"
    />
  ),
}

export const UnlinkedCharge: Story = {
  render: () => (
    <AgentNodeCard
      name="scout"
      cost="$0.40"
      lane="subagent"
      charge={<AgentNodeCharge chargeKey={null} />}
    />
  ),
}

export const LongChargeKeyTruncates: Story = {
  render: () => (
    <AgentNodeCard
      name="builder"
      lane="interactive"
      charge={
        <AgentNodeCharge chargeKey="a-very-long-charge-key-that-must-ellipsize" source="session" />
      }
    />
  ),
}
