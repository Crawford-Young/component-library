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
              row.rank === 1
                ? 'bg-amber-500/5 hover:bg-amber-500/10'
                : row.rank <= 3
                  ? 'hover:bg-muted/50'
                  : 'hover:bg-muted/30',
            )}
          >
            <td className="w-10 py-3 pr-4">
              <span
                className={cn(
                  'font-mono text-xs font-bold tabular-nums',
                  row.rank === 1
                    ? 'text-amber-500'
                    : row.rank === 2
                      ? 'text-slate-400'
                      : row.rank === 3
                        ? 'text-amber-700'
                        : 'text-muted-foreground',
                )}
              >
                #{row.rank}
              </span>
            </td>
            <td className="py-3 pr-4">
              <div className="flex items-center gap-2.5">
                {row.avatarUrl !== undefined ? (
                  <img
                    src={row.avatarUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                      row.rank === 1
                        ? 'bg-amber-500/20 text-amber-600'
                        : 'bg-muted text-muted-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {row.name[0]}
                  </div>
                )}
                <span className="font-medium text-foreground">{row.name}</span>
              </div>
            </td>
            <td className="py-3 text-right">
              <span
                className={cn(
                  'font-bold tabular-nums',
                  row.rank === 1 ? 'text-amber-500' : 'text-foreground',
                )}
              >
                {row.points}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">pts</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
