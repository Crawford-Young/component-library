import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from '@/components/ui/slider'

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Slider>

function DefaultSlider() {
  const [value, setValue] = React.useState([50])
  return (
    <div className="w-80 space-y-4">
      <Slider
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        step={1}
        aria-label="Volume"
      />
      <p className="text-sm text-muted-foreground text-center">Value: {value[0]}</p>
    </div>
  )
}

function RangeSlider() {
  const [value, setValue] = React.useState([20, 80])
  return (
    <div className="w-80 space-y-4">
      <Slider
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        step={1}
        aria-label="Price range"
      />
      <p className="text-sm text-muted-foreground text-center">
        {value[0]} – {value[1]}
      </p>
    </div>
  )
}

function WithStepsSlider() {
  const [value, setValue] = React.useState([0])
  return (
    <div className="w-80 space-y-4">
      <Slider
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        step={10}
        aria-label="Step slider"
      />
      <p className="text-sm text-muted-foreground text-center">Step 10: {value[0]}</p>
    </div>
  )
}

export const Default: Story = {
  render: () => <DefaultSlider />,
}

export const Range: Story = {
  render: () => <RangeSlider />,
}

export const Small: Story = {
  render: () => (
    <div className="w-80">
      <Slider defaultValue={[30]} size="sm" aria-label="Small slider" />
    </div>
  ),
}

export const Large: Story = {
  render: () => (
    <div className="w-80">
      <Slider defaultValue={[70]} size="lg" aria-label="Large slider" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <Slider defaultValue={[50]} disabled aria-label="Disabled slider" />
    </div>
  ),
}

export const WithSteps: Story = {
  render: () => <WithStepsSlider />,
}
