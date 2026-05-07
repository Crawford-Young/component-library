import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/components/ui/badge'
import { Timeline, TimelineItem } from '@/components/ui/timeline'

const meta: Meta<typeof Timeline> = {
  title: 'Display/Timeline',
  component: Timeline,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Timeline>

export const Default: Story = {
  render: () => (
    <Timeline className="max-w-lg">
      <TimelineItem
        title={<h3 className="font-semibold text-foreground">Acme Corp</h3>}
        subtitle="Senior Engineer"
        meta={<Badge variant="secondary">Full-time</Badge>}
      >
        <ul className="space-y-1">
          <li className="flex gap-2 text-sm text-muted-foreground">
            <span className="text-accent">–</span> Led platform migration to serverless
          </li>
          <li className="flex gap-2 text-sm text-muted-foreground">
            <span className="text-accent">–</span> Reduced deployment time by 60%
          </li>
        </ul>
      </TimelineItem>
      <TimelineItem
        title={<h3 className="font-semibold text-foreground">Startup XYZ</h3>}
        subtitle="Software Engineer"
        meta={<Badge variant="outline">Contract</Badge>}
      >
        <p className="text-sm text-muted-foreground">Built the initial product from scratch.</p>
      </TimelineItem>
      <TimelineItem
        isLast
        title={<h3 className="font-semibold text-foreground">University</h3>}
        subtitle="BSc Computer Science"
        meta={<span className="text-xs text-muted-foreground">2018–2022</span>}
      />
    </Timeline>
  ),
}

export const CustomIcon: Story = {
  render: () => (
    <Timeline className="max-w-md">
      <TimelineItem
        title={<p className="font-medium text-foreground">Order placed</p>}
        meta={<span className="text-xs text-muted-foreground">09:00</span>}
        icon={
          <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-background" />
        }
      />
      <TimelineItem
        title={<p className="font-medium text-foreground">Processing</p>}
        meta={<span className="text-xs text-muted-foreground">09:15</span>}
        icon={
          <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-yellow-500 ring-4 ring-background" />
        }
      />
      <TimelineItem
        isLast
        title={<p className="font-medium text-foreground">Shipped</p>}
        meta={<span className="text-xs text-muted-foreground">11:00</span>}
        icon={<div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-background" />}
      />
    </Timeline>
  ),
}
