import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export interface SleepToggleProps {
  readonly enabled: boolean
  readonly onToggle: (enabled: boolean) => void
  readonly className?: string
}

export function SleepToggle({ enabled, onToggle, className }: SleepToggleProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Switch
        id="sleep-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
        aria-label="Sleep mode"
      />
      <Label htmlFor="sleep-toggle" className="cursor-pointer text-xs">
        Sleep mode
      </Label>
    </div>
  )
}
