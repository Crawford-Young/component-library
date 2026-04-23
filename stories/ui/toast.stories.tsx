import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from '@/components/ui/toast'

const meta: Meta<typeof Toaster> = {
  title: 'UI/Toaster',
  component: Toaster,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Toaster>

export const Default: Story = {
  render: () => <Button onClick={() => toast('Event has been created.')}>Show toast</Button>,
}
