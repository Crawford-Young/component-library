import type { Meta, StoryObj } from '@storybook/react'
import { InlineStackedBar } from '@/components/ui/inline-stacked-bar'

const meta: Meta<typeof InlineStackedBar> = {
  title: 'Display/InlineStackedBar',
  component: InlineStackedBar,
  tags: ['autodocs'],
  args: {
    name: 'By agent type',
    format: (n: number) => `$${n.toFixed(2)}`,
    segments: [
      { key: 'orchestrator', label: 'orchestrator', value: 6, color: 6 },
      { key: 'implementer', label: 'implementer', value: 30, color: 1 },
      { key: 'recon', label: 'recon', value: 10, color: 2 },
      { key: 'reviewer', label: 'reviewer', value: 4, color: 3 },
    ],
    label: 'implementer 60%',
  },
}

export default meta
type Story = StoryObj<typeof InlineStackedBar>

export const Default: Story = {}

export const WithoutLabel: Story = { args: { label: undefined } }

export const Empty: Story = { args: { segments: [], label: 'no spend' } }

export const SameSeriesAcrossRows: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3 text-foreground">
      <InlineStackedBar
        {...args}
        segments={[
          { key: 'a', label: 'model-a', value: 8, color: 4 },
          { key: 'b', label: 'model-b', value: 2, color: 5 },
        ]}
        label="model-a 80%"
      />
      <InlineStackedBar
        {...args}
        segments={[
          { key: 'b', label: 'model-b', value: 3, color: 5 },
          { key: 'c', label: 'model-c', value: 3, color: 3 },
        ]}
        label="model-b 50%"
      />
    </div>
  ),
}
