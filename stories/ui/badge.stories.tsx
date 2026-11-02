import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/components/ui/badge'

const meta: Meta<typeof Badge> = {
  title: 'Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'warning', 'outline'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'New' } }
export const Secondary: Story = { args: { children: 'Beta', variant: 'secondary' } }
export const Destructive: Story = { args: { children: 'Error', variant: 'destructive' } }
export const Warning: Story = { args: { children: 'Needs review', variant: 'warning' } }
export const Outline: Story = { args: { children: 'Draft', variant: 'outline' } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['default', 'secondary', 'destructive', 'warning', 'outline'] as const).map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  ),
}

export const AsChildSpan: Story = {
  render: () => (
    <button type="button" className="rounded border border-border p-2 text-sm">
      Valid inside a button{' '}
      <Badge asChild variant="outline">
        <span>span badge</span>
      </Badge>
    </button>
  ),
}
