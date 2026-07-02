import type { Meta, StoryObj } from '@storybook/react'
import { MagneticButton } from '@/components/ui/magnetic-button'

/**
 * A hero CTA that magnetically pulls toward the cursor. Reserve it for hero
 * CTAs on cinematic surfaces only — see docs/brand/motion.md §6/§7. The pull is
 * suppressed for reduced-motion users and coarse (touch) pointers, which fall
 * back to a plain Button.
 */
const meta: Meta<typeof MagneticButton> = {
  title: 'Inputs/MagneticButton',
  component: MagneticButton,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export default meta
type Story = StoryObj<typeof MagneticButton>

export const Default: Story = {
  render: () => (
    <div className="flex min-h-64 items-center justify-center bg-background p-24">
      <MagneticButton size="lg">Start your journey</MagneticButton>
    </div>
  ),
}
