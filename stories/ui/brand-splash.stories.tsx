import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { BrandSplash } from '@/components/ui/brand-splash'
import { Button } from '@/components/ui/button'

const HOLD_MS = 600_000 // hold the signal phase so the fully-split, glowing state stays visible

const meta: Meta<typeof BrandSplash> = {
  title: 'Feedback/BrandSplash',
  component: BrandSplash,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof BrandSplash>

export const Default: Story = {
  args: {
    wordmark: 'Cybond',
    splitIndex: 2,
    durations: { signal: HOLD_MS },
    onComplete: () => undefined,
  },
}

export const WithQuote: Story = {
  args: {
    ...Default.args,
    quote: { text: 'Bond to what matters.', attribution: null },
  },
}

export const Replay: Story = {
  render: function ReplayStory() {
    const [run, setRun] = React.useState(0)
    const [playing, setPlaying] = React.useState(true)
    return (
      <div className="flex h-screen items-center justify-center">
        <Button
          onClick={() => {
            setRun((r) => r + 1)
            setPlaying(true)
          }}
        >
          Replay splash
        </Button>
        {playing ? (
          <BrandSplash
            key={run}
            wordmark="Cybond"
            splitIndex={2}
            quote={{ text: 'Bond to what matters.', attribution: null }}
            onComplete={() => setPlaying(false)}
          />
        ) : null}
      </div>
    )
  },
}
