import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LeaderboardTable } from './leaderboard-table'

const rows = [
  { rank: 1, name: 'Crawford Young', avatarUrl: undefined, points: 520 },
  { rank: 2, name: 'Alex Smith', avatarUrl: undefined, points: 310 },
  { rank: 3, name: 'Jordan Lee', avatarUrl: undefined, points: 180 },
  { rank: 4, name: 'Sam Taylor', avatarUrl: undefined, points: 90 },
]

describe('LeaderboardTable', () => {
  it('renders all user names', () => {
    render(<LeaderboardTable rows={rows} />)
    expect(screen.getByText('Crawford Young')).toBeInTheDocument()
    expect(screen.getByText('Alex Smith')).toBeInTheDocument()
  })

  it('renders rank numbers', () => {
    render(<LeaderboardTable rows={rows} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })

  it('renders point values', () => {
    render(<LeaderboardTable rows={rows} />)
    expect(screen.getByText('520')).toBeInTheDocument()
  })

  it('applies gold styling to first row', () => {
    render(<LeaderboardTable rows={rows} />)
    const firstRow = screen.getByText('#1').closest('tr')
    expect(firstRow?.className).toContain('bg-amber-500/5')
  })

  it('renders empty state when rows is empty', () => {
    render(<LeaderboardTable rows={[]} />)
    expect(screen.getByText(/no entries/i)).toBeInTheDocument()
  })

  it('renders avatar image when avatarUrl is provided', () => {
    const { container } = render(
      <LeaderboardTable
        rows={[
          {
            rank: 1,
            name: 'Crawford Young',
            avatarUrl: 'https://example.com/avatar.jpg',
            points: 520,
          },
        ]}
      />,
    )
    expect(container.querySelector('img')).toBeInTheDocument()
  })
})
