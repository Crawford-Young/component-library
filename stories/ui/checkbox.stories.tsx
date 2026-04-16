import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="default" />
      <Label htmlFor="default">Accept terms</Label>
    </div>
  ),
}
export const Checked: Story = { args: { defaultChecked: true, 'aria-label': 'Accept terms' } }
export const Indeterminate: Story = {
  args: { checked: 'indeterminate', 'aria-label': 'Accept terms' },
}
export const Disabled: Story = { args: { disabled: true, 'aria-label': 'Accept terms' } }
export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true, 'aria-label': 'Accept terms' },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}
