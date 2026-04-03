import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = { args: { children: 'Email address' } }

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="email-sb">Email address</Label>
      <Input id="email-sb" type="email" placeholder="you@example.com" />
    </div>
  ),
}
