import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker } from '@/components/ui/date-picker'

const meta: Meta<typeof DatePicker> = {
  title: 'Inputs/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  render: () => <DatePicker placeholder="Pick a date" />,
}

export const WithDropdownNavigation: Story = {
  render: () => (
    <DatePicker placeholder="Pick a date" captionLayout="dropdown" fromYear={2000} toYear={2040} />
  ),
}
