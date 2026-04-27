import type { Meta, StoryObj } from '@storybook/react'
import {
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

const meta: Meta<typeof FormField> = {
  title: 'Form/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof FormField>

export const Default: Story = {
  render: () => (
    <FormField className="w-[320px]">
      <FormLabel>Email address</FormLabel>
      <FormControl>
        <Input type="email" placeholder="you@example.com" />
      </FormControl>
      <FormDescription>We will never share your email.</FormDescription>
    </FormField>
  ),
}

export const WithError: Story = {
  render: () => (
    <FormField className="w-[320px]">
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input placeholder="username" />
      </FormControl>
      <FormMessage>Username is already taken.</FormMessage>
    </FormField>
  ),
}
