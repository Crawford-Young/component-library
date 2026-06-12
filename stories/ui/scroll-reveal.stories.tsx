import type { Meta, StoryObj } from '@storybook/react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

const meta: Meta<typeof ScrollReveal> = {
  title: 'Motion/ScrollReveal',
  component: ScrollReveal,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ScrollReveal>

const DemoCard = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-border bg-surface p-6 text-foreground">{label}</div>
)

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-[60vh]">
      <p className="text-muted-foreground">
        Scroll down — the section below reveals at 20% visibility.
      </p>
      <ScrollReveal>
        <DemoCard label="Revealed section" />
      </ScrollReveal>
    </div>
  ),
}

export const StaggeredChildren: Story = {
  render: () => (
    <div className="flex flex-col gap-[60vh]">
      <p className="text-muted-foreground">
        Scroll down — children arrive in reading order, 40ms apart.
      </p>
      <ScrollReveal staggerChildren className="flex flex-col gap-3">
        <DemoCard label="First" />
        <DemoCard label="Second" />
        <DemoCard label="Third" />
      </ScrollReveal>
    </div>
  ),
}
