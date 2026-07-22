import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export interface SleepToggleProps {
  readonly enabled: boolean
  readonly onToggle: (enabled: boolean) => void
  /** Visible label + switch aria-label. */
  readonly label?: string
  readonly className?: string
}

export function SleepToggle({
  enabled,
  onToggle,
  label = 'Sleep mode',
  className,
}: SleepToggleProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Switch id="sleep-toggle" checked={enabled} onCheckedChange={onToggle} aria-label={label} />
      <Label htmlFor="sleep-toggle" className="cursor-pointer text-xs">
        {label}
      </Label>
    </div>
  )
}
