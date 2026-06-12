import type { Meta, StoryObj } from '@storybook/react'
import { StaggerReveal } from '@/components/ui/stagger-reveal'

const meta: Meta<typeof StaggerReveal> = {
  title: 'Motion/StaggerReveal',
  component: StaggerReveal,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof StaggerReveal>

const DemoCard = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-border bg-surface p-6 text-foreground">{label}</div>
)

export const Default: Story = {
  render: () => (
    <StaggerReveal className="flex flex-col gap-3">
      <DemoCard label="First — arrives immediately" />
      <DemoCard label="Second — +40ms" />
      <DemoCard label="Third — +80ms" />
      <DemoCard label="Fourth — +120ms" />
    </StaggerReveal>
  ),
}

export const Grid: Story = {
  render: () => (
    <StaggerReveal className="grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }, (_, i) => (
        <DemoCard key={i} label={`Card ${i + 1}`} />
      ))}
    </StaggerReveal>
  ),
}
