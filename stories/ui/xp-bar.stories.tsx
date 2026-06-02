import type { Meta, StoryObj } from '@storybook/react'
import { XpBar } from '@/components/ui/xp-bar'
import { PointBadge } from '@/components/ui/point-badge'

const meta: Meta = { title: 'Gamification/XpBar', tags: ['autodocs'] }
export default meta

export const Seedling: StoryObj = {
  render: () => <XpBar levelName="Seedling" currentXp={120} maxXp={500} />,
}

export const HalfFull: StoryObj = {
  render: () => <XpBar levelName="Growing" currentXp={1250} maxXp={2000} />,
}

export const Points: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      <PointBadge points={10} />
      <PointBadge points={50} />
      <PointBadge points={200} />
    </div>
  ),
}
