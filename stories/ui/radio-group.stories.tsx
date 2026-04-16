import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof RadioGroup>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      {(['compact', 'comfortable', 'spacious'] as const).map((value) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={value} />
          <Label htmlFor={value} className="capitalize">
            {value}
          </Label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="b" disabled>
      {(['a', 'b', 'c'] as const).map((value) => (
        <div key={value} className="flex items-center gap-2">
          <RadioGroupItem value={value} id={`disabled-${value}`} />
          <Label htmlFor={`disabled-${value}`}>Option {value.toUpperCase()}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}
