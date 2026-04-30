import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import { ErrorBoundary, ErrorPage } from '@/components/ui/error-boundary'

const meta = {
  title: 'Feedback/ErrorBoundary',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const NotFound: Story = {
  render: () => <ErrorPage code={404} action={<Button variant="default">Go home</Button>} />,
}

export const ServerError: Story = {
  render: () => <ErrorPage code={500} action={<Button variant="default">Try again</Button>} />,
}

export const CustomMessage: Story = {
  render: () => (
    <ErrorPage
      title="Access denied"
      description="You don't have permission to view this page."
      action={<Button variant="outline">Request access</Button>}
    />
  ),
}

function Bomb(): React.ReactNode {
  throw new Error('Render error caught by boundary')
}

export const WithBoundary: Story = {
  render: () => (
    <ErrorBoundary fallback={(err) => <ErrorPage code={500} description={err.message} />}>
      <Bomb />
    </ErrorBoundary>
  ),
}
