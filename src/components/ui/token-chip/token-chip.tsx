import * as React from 'react'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_LOW_THRESHOLD = 25

interface TokenChipProps {
  readonly balance: number
  readonly lowThreshold?: number
  readonly className?: string
}

type TokenChipState = 'normal' | 'low' | 'zero'

function resolveState(balance: number, lowThreshold: number): TokenChipState {
  if (balance <= 0) return 'zero'
  if (balance < lowThreshold) return 'low'
  return 'normal'
}

export function TokenChip({
  balance,
  lowThreshold = DEFAULT_LOW_THRESHOLD,
  className,
}: TokenChipProps): React.JSX.Element {
  const state = resolveState(balance, lowThreshold)
  return (
    <span
      aria-label={`Token balance: ${balance}`}
      data-state={state}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors',
        state === 'normal' && 'border-border bg-surface text-foreground',
        state === 'low' && 'border-amber-500/40 bg-amber-500/10 text-amber-400',
        state === 'zero' && 'border-red-500/40 bg-red-500/10 text-red-400',
        className,
      )}
    >
      <Zap className="h-3.5 w-3.5" aria-hidden="true" />
      {balance}
    </span>
  )
}
