import type { Meta, StoryObj } from '@storybook/react'
import { TokenChip } from '@/components/ui/token-chip'

const meta: Meta<typeof TokenChip> = {
  title: 'UI/TokenChip',
  component: TokenChip,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof TokenChip>

export const Normal: Story = { args: { balance: 142 } }
export const Low: Story = { args: { balance: 12 } }
export const Zero: Story = { args: { balance: 0 } }
export const CustomThreshold: Story = { args: { balance: 80, lowThreshold: 100 } }
