import * as React from 'react'
import { CheckSquare, Target, RefreshCw, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardContent, CardFooter } from '../card'
import { Badge } from '../badge'
import { StreakBadge } from '../streak-badge'

export interface ActivityCardProps {
  readonly title: string
  readonly type: 'task' | 'goal' | 'habit'
  readonly status: 'pending' | 'in_progress' | 'completed'
  readonly streak?: number
  readonly nextOccurrence?: string | null
  readonly participantCount?: number
  readonly visibility: 'everyone' | 'friends' | 'busy' | 'only_me'
  readonly detail?: React.ReactNode
  readonly actions?: React.ReactNode
}

const TYPE_ICON_MAP: Record<ActivityCardProps['type'], LucideIcon> = {
  task: CheckSquare,
  goal: Target,
  habit: RefreshCw,
}

const VISIBILITY_GLYPH_MAP: Record<ActivityCardProps['visibility'], string> = {
  everyone: '🌐',
  friends: '👥',
  busy: '🔒',
  only_me: '👁️',
}

const VISIBILITY_ARIA_LABEL_MAP: Record<ActivityCardProps['visibility'], string> = {
  everyone: 'Visible to everyone',
  friends: 'Visible to friends',
  busy: 'Visible when busy',
  only_me: 'Visible to only me',
}

const MIN_PARTICIPANT_COUNT = 1

export function ActivityCard({
  title,
  type,
  status,
  streak,
  nextOccurrence,
  participantCount,
  visibility,
  detail,
  actions,
}: ActivityCardProps): React.JSX.Element {
  const TypeIcon = TYPE_ICON_MAP[type]
  const visibilityGlyph = VISIBILITY_GLYPH_MAP[visibility]
  const visibilityAriaLabel = VISIBILITY_ARIA_LABEL_MAP[visibility]
  const showParticipants =
    participantCount !== undefined && participantCount >= MIN_PARTICIPANT_COUNT
  const hasContent = detail !== undefined || showParticipants || nextOccurrence != null
  const hasActions = actions !== undefined
  const headerFollowed = hasContent || hasActions

  return (
    <Card>
      <CardHeader
        className={cn(
          'flex flex-row items-start justify-between gap-2 space-y-0 p-4',
          headerFollowed && 'pb-3',
        )}
      >
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="font-semibold leading-tight text-card-foreground">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {streak !== undefined && <StreakBadge streak={streak} />}
          <Badge variant="secondary" className="text-xs">
            {status}
          </Badge>
          <span aria-label={visibilityAriaLabel} role="img">
            {visibilityGlyph}
          </span>
        </div>
      </CardHeader>

      {hasContent && (
        <CardContent className={cn('space-y-1 px-4 pt-0', hasActions ? 'pb-3' : 'pb-4')}>
          {nextOccurrence != null && (
            <p data-testid="next-occurrence" className="text-xs text-muted-foreground">
              {nextOccurrence}
            </p>
          )}
          {showParticipants && (
            <p className="text-xs text-muted-foreground">{participantCount} joined</p>
          )}
          {detail !== undefined && <div>{detail}</div>}
        </CardContent>
      )}

      {hasActions && <CardFooter className="px-4 pb-4 pt-0">{actions}</CardFooter>}
    </Card>
  )
}
