import type { Meta, StoryObj } from '@storybook/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive', 'info'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
    </Alert>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-96">
      {(['default', 'success', 'warning', 'destructive', 'info'] as const).map((variant) => (
        <Alert key={variant} variant={variant}>
          <AlertTitle className="capitalize">{variant}</AlertTitle>
          <AlertDescription>This is a {variant} alert message.</AlertDescription>
        </Alert>
      ))}
    </div>
  ),
}
