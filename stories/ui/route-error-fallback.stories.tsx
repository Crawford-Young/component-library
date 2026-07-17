import type { Meta, StoryObj } from '@storybook/react'
import { RouteErrorFallback } from '@/components/ui/route-error-fallback'

const meta = {
  title: 'Feedback/RouteErrorFallback',
  component: RouteErrorFallback,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof RouteErrorFallback>

export default meta
type Story = StoryObj<typeof meta>

const sampleError: Error & { digest?: string } = new Error('Simulated route error')

const digestError: Error & { digest?: string } = Object.assign(new Error('Simulated route error'), {
  digest: '1234567890abcdef',
})

export const Default: Story = {
  args: { error: sampleError, reset: () => {} },
}

export const WithDigest: Story = {
  args: { error: digestError, reset: () => {} },
}

export const CustomCopy: Story = {
  args: {
    error: sampleError,
    reset: () => {},
    title: 'Failed to load calendar',
    description: 'Calendar data could not be loaded.',
    retryLabel: 'Reload calendar',
  },
}

export const WithHomeLink: Story = {
  args: {
    error: digestError,
    reset: () => {},
    homeHref: '/',
  },
}
