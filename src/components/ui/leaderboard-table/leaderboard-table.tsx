import * as React from 'react'
import { cn } from '@/lib/utils'

interface LeaderboardRow {
  readonly rank: number
  readonly name: string
  readonly avatarUrl?: string
  readonly points: number
}

interface LeaderboardTableProps {
  readonly rows: ReadonlyArray<LeaderboardRow>
  readonly className?: string
}

export function LeaderboardTable({ rows, className }: LeaderboardTableProps): React.JSX.Element {
  if (rows.length === 0) {
    return (
      <p className={cn('py-8 text-center text-sm text-muted-foreground', className)}>
        No entries yet.
      </p>
    )
  }

  return (
    <table className={cn('w-full text-sm', className)}>
      <thead>
        <tr className="border-b border-border">
          <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">Rank</th>
          <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">User</th>
          <th className="py-2 text-right text-xs font-medium text-muted-foreground">Points</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.rank}
            className={cn(
              'border-b border-border transition-colors',
              row.rank === 1 ? 'bg-accent-subtle' : 'hover:bg-item-hover',
            )}
          >
            <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">#{row.rank}</td>
            <td className="py-3 pr-4">
              <div className="flex items-center gap-2">
                {row.avatarUrl !== undefined ? (
                  <img
                    src={row.avatarUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised text-xs font-semibold text-foreground"
                    aria-hidden="true"
                  >
                    {row.name[0]}
                  </div>
                )}
                <span className="font-medium text-foreground">{row.name}</span>
              </div>
            </td>
            <td className="py-3 text-right font-semibold text-foreground">{row.points} pts</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
