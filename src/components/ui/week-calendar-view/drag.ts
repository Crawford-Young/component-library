import { useMemo, useState } from 'react'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'

export type DragMode =
  | { type: 'idle' }
  | {
      type: 'creating'
      startDayIdx: number
      currentDayIdx: number
      startSlot: number
      currentSlot: number
    }
  | {
      type: 'moving'
      event: CalendarEvent
      dayIdx: number
      currentSlot: number
      slotOffset: number
    }
  | { type: 'resizing-end'; event: CalendarEvent; dayIdx: number; currentSlot: number }
  | { type: 'resizing-start'; event: CalendarEvent; dayIdx: number; currentSlot: number }
  | { type: 'duplicating'; event: CalendarEvent; startDayIdx: number; currentDayIdx: number }

export interface DragActions {
  startCreate: (dayIdx: number, startSlot: number) => void
  startMove: (
    event: CalendarEvent,
    dayIdx: number,
    slotOffset: number,
    initialSlot?: number,
  ) => void
  startDuplicate: (event: CalendarEvent, dayIdx: number) => void
  startResizeEnd: (event: CalendarEvent, dayIdx: number, currentSlot: number) => void
  startResizeStart: (event: CalendarEvent, dayIdx: number, currentSlot: number) => void
  updateSlot: (dayIdx: number, slot: number) => void
  reset: () => void
}

export function useDragState(): [DragMode, DragActions] {
  const [mode, setMode] = useState<DragMode>({ type: 'idle' })

  const actions = useMemo<DragActions>(
    () => ({
      startCreate(dayIdx, startSlot) {
        setMode({
          type: 'creating',
          startDayIdx: dayIdx,
          currentDayIdx: dayIdx,
          startSlot,
          currentSlot: startSlot,
        })
      },
      startMove(event, dayIdx, slotOffset, initialSlot = 0) {
        setMode({ type: 'moving', event, dayIdx, currentSlot: initialSlot, slotOffset })
      },
      startDuplicate(event, dayIdx) {
        setMode({ type: 'duplicating', event, startDayIdx: dayIdx, currentDayIdx: dayIdx })
      },
      startResizeEnd(event, dayIdx, currentSlot) {
        setMode({ type: 'resizing-end', event, dayIdx, currentSlot })
      },
      startResizeStart(event, dayIdx, currentSlot) {
        setMode({ type: 'resizing-start', event, dayIdx, currentSlot })
      },
      updateSlot(dayIdx, slot) {
        setMode((prev) => {
          if (prev.type === 'creating') return { ...prev, currentDayIdx: dayIdx, currentSlot: slot }
          if (prev.type === 'moving') return { ...prev, dayIdx, currentSlot: slot }
          if (prev.type === 'resizing-end') return { ...prev, currentSlot: slot }
          if (prev.type === 'resizing-start') return { ...prev, currentSlot: slot }
          if (prev.type === 'duplicating') return { ...prev, currentDayIdx: dayIdx }
          return prev
        })
      },
      reset() {
        setMode({ type: 'idle' })
      },
    }),
    [],
  )

  return [mode, actions]
}
