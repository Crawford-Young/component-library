import type { Meta, StoryObj } from '@storybook/react'
import { TokenCost } from '@/components/ui/token-cost'

const meta: Meta<typeof TokenCost> = {
  title: 'UI/TokenCost',
  component: TokenCost,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof TokenCost>

export const Default: Story = { args: { estimate: 4 } }
export const Single: Story = { args: { estimate: 1 } }
