import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const meta: Meta<typeof Collapsible> = {
  title: 'Disclosure/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof Collapsible>

function CollapsibleDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-[320px] space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Starred repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Toggle starred repositories">
            <CollapsibleIndicator />
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded border border-border px-4 py-3 text-sm text-foreground">
        @radix-ui/react-collapsible
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded border border-border px-4 py-3 text-sm text-foreground">
          @radix-ui/react-dialog
        </div>
        <div className="rounded border border-border px-4 py-3 text-sm text-foreground">
          @radix-ui/react-dropdown-menu
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export const Default: Story = {
  render: () => <CollapsibleDemo />,
}
