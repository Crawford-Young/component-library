import type { Meta, StoryObj } from '@storybook/react'
import { HeroCard } from '@/components/ui/hero-card'
import { StatChip } from '@/components/ui/stat-chip'

const meta: Meta<typeof HeroCard> = {
  title: 'Display/HeroCard',
  component: HeroCard,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof HeroCard>

export const PlanYourWeek: Story = {
  args: {
    headline: 'Ready to plan your week?',
    subtitle: '3 events scheduled — 14 hours free',
    ctaLabel: 'Plan my week',
    onCtaClick: () => undefined,
  },
}

export const DailyReflection: Story = {
  args: {
    headline: 'Time for your daily reflection',
    subtitle: 'Morning run habit · 12-day streak',
    ctaLabel: 'Start reflection',
    onCtaClick: () => undefined,
  },
}

export const WithStatChips: Story = {
  render: () => (
    <div className="space-y-4">
      <HeroCard
        headline="Your week is on track"
        subtitle="Keep it up — you're in the Thriving tier"
        ctaLabel="Review week"
        onCtaClick={() => undefined}
      />
      <div className="flex flex-wrap gap-2">
        <StatChip label="Tasks due" value="2" />
        <StatChip label="Streak" value="12 days" />
        <StatChip label="Next event" value="2:00 PM" />
      </div>
    </div>
  ),
}
