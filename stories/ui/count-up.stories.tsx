import type { Meta, StoryObj } from '@storybook/react'
import { CountUp } from '@/components/ui/count-up'

const meta: Meta<typeof CountUp> = {
  title: 'Display/CountUp',
  component: CountUp,
  tags: ['autodocs'],
  argTypes: {
    to: { control: 'number' },
    suffix: { control: 'text' },
    duration: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof CountUp>

export const Default: Story = {
  args: { to: 1000 },
}

export const WithSuffix: Story = {
  args: { to: 98, suffix: '%' },
}

export const SlowCount: Story = {
  args: { to: 500, duration: 3000 },
}

export const AllExamples: Story = {
  render: () => (
    <div className="flex gap-12">
      <div className="text-center">
        <p className="text-4xl font-bold text-accent">
          <CountUp to={1000} suffix="+" />
        </p>
        <p className="text-sm text-muted-foreground mt-1">Users</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-accent">
          <CountUp to={98} suffix="%" />
        </p>
        <p className="text-sm text-muted-foreground mt-1">Uptime</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-accent">
          <CountUp to={42} />
        </p>
        <p className="text-sm text-muted-foreground mt-1">Countries</p>
      </div>
    </div>
  ),
}
