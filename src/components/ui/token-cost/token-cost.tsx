import * as React from 'react'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TokenCostProps {
  readonly estimate: number
  readonly className?: string
}

export function TokenCost({ estimate, className }: TokenCostProps): React.JSX.Element {
  return (
    <span
      aria-label={`Estimated cost: about ${estimate} tokens`}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md bg-surface-raised px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground',
        className,
      )}
    >
      <Zap className="h-3 w-3" aria-hidden="true" />~{estimate}
    </span>
  )
}
