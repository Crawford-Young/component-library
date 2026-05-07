import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { NumberInput } from '@/components/ui/number-input'

const meta: Meta<typeof NumberInput> = {
  title: 'Inputs/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NumberInput>

function DefaultDemo() {
  const [value, setValue] = useState(0)
  return <NumberInput value={value} onChange={setValue} />
}

function WithBoundsDemo() {
  const [value, setValue] = useState(5)
  return <NumberInput value={value} onChange={setValue} min={0} max={10} />
}

function CustomStepDemo() {
  const [value, setValue] = useState(0)
  return <NumberInput value={value} onChange={setValue} step={5} min={0} max={100} />
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

export const WithBounds: Story = {
  render: () => <WithBoundsDemo />,
}

export const CustomStep: Story = {
  render: () => <CustomStepDemo />,
}

export const Disabled: Story = {
  render: () => <NumberInput value={7} onChange={() => {}} disabled />,
}
