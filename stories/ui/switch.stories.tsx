import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="default" />
      <Label htmlFor="default">Toggle setting</Label>
    </div>
  ),
}
export const Checked: Story = { args: { defaultChecked: true, 'aria-label': 'Toggle setting' } }
export const Disabled: Story = { args: { disabled: true, 'aria-label': 'Toggle setting' } }

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane" />
      <Label htmlFor="airplane">Airplane mode</Label>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch size="sm" defaultChecked />
      <Switch size="default" defaultChecked />
      <Switch size="lg" defaultChecked />
    </div>
  ),
}
