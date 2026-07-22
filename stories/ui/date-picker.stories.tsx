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

export const CustomTrigger: Story = {
  render: () => (
    <DatePicker
      placeholder="Pick a date"
      renderTrigger={({ label, open }) => (
        <button
          className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium transition-colors hover:bg-item-hover ${
            open ? 'ring-2 ring-ring' : ''
          }`}
        >
          {label}
        </button>
      )}
    />
  ),
}
