import type { Meta, StoryObj } from '@storybook/react'
import { TopBar } from '@/components/ui/top-bar'

const meta: Meta<typeof TopBar> = {
  title: 'Layout/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof TopBar>

export const Default: Story = {
  args: {
    title: 'Goals',
    logo: <span className="text-accent font-bold text-sm">SA</span>,
    actions: (
      <div className="h-8 w-8 rounded-full bg-accent-subtle flex items-center justify-center">
        <span className="text-xs font-semibold text-accent-subtle-foreground">CY</span>
      </div>
    ),
  },
}

export const TitleOnly: Story = { args: { title: 'Dashboard' } }
export const NoTitle: Story = { args: { logo: <span className="font-bold text-accent">SA</span> } }
