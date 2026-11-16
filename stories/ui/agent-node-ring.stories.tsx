import type { Meta, StoryObj } from '@storybook/react'
import { AgentNodeRing } from '@/components/ui/agent-node-ring'

const states = ['working', 'needs-you', 'idle', 'done'] as const

const meta: Meta<typeof AgentNodeRing> = {
  title: 'Display/AgentNodeRing',
  component: AgentNodeRing,
  tags: ['autodocs'],
  argTypes: {
    state: { control: 'select', options: states },
    size: { control: 'select', options: ['root', 'default', 'dense'] },
    context: { control: { type: 'range', min: 0, max: 100 } },
  },
}

export default meta
type Story = StoryObj<typeof AgentNodeRing>

export const Default: Story = {
  args: {
    name: 'implementer',
    state: 'working',
    charge: 'strate#62',
    cost: '$7.10',
    context: 42,
  },
}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <AgentNodeRing
        name="implementer"
        state="working"
        charge="strate#62"
        cost="$7.10"
        context={42}
      />
      <AgentNodeRing
        name="reviewer"
        state="needs-you"
        charge="strate#63"
        cost="$2.40"
        context={84}
      />
      <AgentNodeRing name="tester" state="idle" charge="strate#64" cost="$0.80" context={97} />
      <AgentNodeRing name="recon" state="done" charge="strate#65" cost="$1.15" context={12} />
    </div>
  ),
}

export const Root: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-10">
      <AgentNodeRing
        size="root"
        name="director"
        state="working"
        charge="strate#62"
        cost="$7.10"
        context={42}
      />
      <AgentNodeRing
        size="root"
        name="director"
        state="working"
        selected
        charge="strate#62"
        cost="$7.10"
        context={42}
      />
      <AgentNodeRing
        size="root"
        name="director"
        state="needs-you"
        charge="strate#62"
        cost="$7.10"
        context={84}
      />
    </div>
  ),
}

export const RootIdle: Story = {
  args: {
    size: 'root',
    name: 'director',
    state: 'idle',
    charge: 'strate#62',
    cost: '$7.10',
    context: 42,
  },
}

export const RootDone: Story = {
  args: {
    size: 'root',
    name: 'director',
    state: 'done',
    charge: 'strate#62',
    cost: '$7.10',
    context: 42,
  },
}

export const DefaultSelected: Story = {
  args: { ...Default.args, selected: true },
}

export const NoContext: Story = {
  args: { name: 'implementer', state: 'idle', charge: 'strate#62', cost: '$0.00' },
}

export const Dense: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div data-row-size="24" className="flex items-center gap-4">
        {states.map((s) => (
          <AgentNodeRing
            key={s}
            size="dense"
            className="size-6"
            name="implementer"
            state={s}
            context={42}
          />
        ))}
      </div>
      <div data-row-size="12" className="flex items-center gap-6">
        {states.map((s) => (
          <AgentNodeRing
            key={s}
            size="dense"
            className="size-3"
            name="implementer"
            state={s}
            context={42}
          />
        ))}
      </div>
    </div>
  ),
}
