import type { Meta, StoryObj } from '@storybook/react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Home,
  Map as MapIcon,
  Music,
  Settings,
} from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const meta: Meta<typeof ToggleGroup> = {
  title: 'Inputs/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof ToggleGroup>

export const TouchRail: Story = {
  render: () => (
    <ToggleGroup
      type="single"
      orientation="vertical"
      size="touch"
      aria-label="Navigation"
      defaultValue="home"
    >
      <ToggleGroupItem value="home">
        <Home />
        <span>Home</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="music">
        <Music />
        <span>Music</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="map">
        <MapIcon />
        <span>Map</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="settings">
        <Settings />
        <span>Settings</span>
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Default: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="center">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}
