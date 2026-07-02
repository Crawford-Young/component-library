import type { Meta, StoryObj } from '@storybook/react'
import { SplitText } from '@/components/ui/split-text'

const meta: Meta<typeof SplitText> = {
  title: 'Display/SplitText',
  component: SplitText,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SplitText>

export const Default: Story = {
  render: () => (
    <SplitText text="Build with intention" className="text-7xl font-bold text-foreground" />
  ),
}

export const WithDelay: Story = {
  render: () => (
    <SplitText
      text="A beat before the reveal"
      delayMs={400}
      className="text-5xl font-bold text-foreground"
    />
  ),
}

export const LongText: Story = {
  render: () => (
    <div className="max-w-md">
      <SplitText
        text="A longer headline that wraps across multiple lines to prove the per-word masking survives line breaks"
        className="text-3xl font-semibold text-foreground"
      />
    </div>
  ),
}
