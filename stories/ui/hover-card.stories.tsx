import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

const meta: Meta<typeof HoverCard> = {
  title: 'Overlays/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof HoverCard>

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center p-16">
      <HoverCard>
        <HoverCardTrigger className="cursor-pointer text-sm font-medium text-accent underline underline-offset-4">
          @crawfordyoung
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>CY</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Crawford Young</h4>
              <p className="text-xs text-muted-foreground">Full-stack engineer. Builds things.</p>
              <div className="flex gap-1 pt-1">
                <Badge variant="secondary" className="text-xs">
                  TypeScript
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Next.js
                </Badge>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
}
