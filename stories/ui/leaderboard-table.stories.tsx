import type { Meta, StoryObj } from '@storybook/react'
import { LeaderboardTable } from '@/components/ui/leaderboard-table'
import { ScoreHistory } from '@/components/ui/score-history'

const meta: Meta = { title: 'Gamification/Leaderboard', tags: ['autodocs'] }
export default meta

const rows = [
  { rank: 1, name: 'Crawford Young', points: 1240 },
  { rank: 2, name: 'Alex Smith', points: 980 },
  { rank: 3, name: 'Jordan Lee', points: 720 },
]

const weeks = [
  { week: 'Apr 7', points: 80 },
  { week: 'Apr 14', points: 140 },
  { week: 'Apr 21', points: 210 },
  { week: 'Apr 28', points: 175 },
  { week: 'May 5', points: 340 },
]

export const Table: StoryObj = {
  render: () => <LeaderboardTable rows={rows} />,
}

export const Empty: StoryObj = {
  render: () => <LeaderboardTable rows={[]} />,
}

export const History: StoryObj = {
  render: () => (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">Weekly score history</p>
      <ScoreHistory weeks={weeks} />
    </div>
  ),
}
