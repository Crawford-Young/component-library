'use client'
import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface WeekScore {
  readonly week: string
  readonly points: number
}

interface ScoreHistoryProps {
  readonly weeks: ReadonlyArray<WeekScore>
  readonly className?: string
}

export function ScoreHistory({ weeks, className }: ScoreHistoryProps): React.JSX.Element {
  return (
    <div data-testid="score-history" className={cn('h-48 w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeks as WeekScore[]} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgb(var(--surface))',
              border: '1px solid rgb(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              color: 'rgb(var(--foreground))',
            }}
          />
          <Bar dataKey="points" fill="rgb(var(--accent))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
