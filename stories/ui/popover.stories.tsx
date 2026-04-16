import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const meta: Meta<typeof PopoverContent> = {
  title: 'UI/Popover',
  component: PopoverContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof PopoverContent>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm font-medium">Popover heading</p>
        <p className="text-sm text-muted-foreground mt-1">This is the popover body content.</p>
      </PopoverContent>
    </Popover>
  ),
}
