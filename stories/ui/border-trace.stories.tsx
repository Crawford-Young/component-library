import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { BorderTrace, TraceBorder } from '@/components/ui/border-trace'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof BorderTrace> = {
  title: 'Feedback/BorderTrace',
  component: BorderTrace,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BorderTrace>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <BorderTrace size="xs" />
      <BorderTrace size="sm" />
      <BorderTrace size="md" />
      <BorderTrace size="lg" />
    </div>
  ),
}

export const Circle: Story = {
  render: () => <BorderTrace shape="circle" size="lg" />,
}

export const OnButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The wrapper trace runs the same resolve choreography as BorderTrace. While `active`, click Save to flip `resolved` — the border expands to a full stroke, settles, and fades off the exit curve while the button underneath never fades. `onResolveComplete` tears the trace down; Replay remounts to run it again.',
      },
    },
  },
  render: function OnButtonStory() {
    const [runId, setRunId] = React.useState(0)
    const [active, setActive] = React.useState(true)
    const [resolved, setResolved] = React.useState(false)
    const replay = (): void => {
      setActive(true)
      setResolved(false)
      setRunId((id) => id + 1)
    }
    return (
      <div className="flex items-center gap-4">
        <TraceBorder
          key={runId}
          active={active}
          resolved={resolved}
          onResolveComplete={() => setActive(false)}
        >
          <Button variant="secondary" onClick={() => (active ? setResolved(true) : replay())}>
            Save
          </Button>
        </TraceBorder>
        <span className="text-sm text-muted-foreground">
          {active ? 'saving… click Save to resolve' : 'saved — click Save to run again'}
        </span>
      </div>
    )
  },
}

export const Resolved: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The resolve gesture is a fixed, non-configurable choreography: the trace ring expands to a full stroke, settles, then fades away (expand → settle → depart, ~750ms total). It fires once. The consumer flips `resolved` true to trigger it and tears the trace down on `onResolveComplete` — there are no timing knobs. Use the replay button to remount and watch it again.',
      },
    },
  },
  render: function ResolvedStory() {
    const [resolved, setResolved] = React.useState(false)
    const [done, setDone] = React.useState(false)
    const [runId, setRunId] = React.useState(0)
    return (
      <div className="flex items-center gap-4">
        <BorderTrace
          key={runId}
          size="lg"
          resolved={resolved}
          onResolveComplete={() => setDone(true)}
        />
        <Button variant="secondary" onClick={() => setResolved(true)} disabled={resolved || done}>
          Resolve
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setResolved(false)
            setDone(false)
            setRunId((id) => id + 1)
          }}
        >
          Replay
        </Button>
        <span className="text-sm text-muted-foreground">
          {done ? 'resolved — trace torn down' : 'click Resolve'}
        </span>
      </div>
    )
  },
}
