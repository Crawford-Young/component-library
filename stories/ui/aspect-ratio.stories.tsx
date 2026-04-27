import type { Meta, StoryObj } from '@storybook/react'
import { AspectRatio } from '@/components/ui/aspect-ratio'

const meta: Meta<typeof AspectRatio> = {
  title: 'Layout/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof AspectRatio>

function PlaceholderImage({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-md bg-surface-raised text-muted-foreground text-sm">
      {label}
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
        <PlaceholderImage label="16 / 9" />
      </AspectRatio>
    </div>
  ),
}

export const Square: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1} className="overflow-hidden rounded-md">
        <PlaceholderImage label="1 / 1" />
      </AspectRatio>
    </div>
  ),
}

export const FourThree: Story = {
  render: () => (
    <div className="w-[400px]">
      <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md">
        <PlaceholderImage label="4 / 3" />
      </AspectRatio>
    </div>
  ),
}

export const Portrait: Story = {
  render: () => (
    <div className="w-[250px]">
      <AspectRatio ratio={9 / 16} className="overflow-hidden rounded-md">
        <PlaceholderImage label="9 / 16" />
      </AspectRatio>
    </div>
  ),
}
