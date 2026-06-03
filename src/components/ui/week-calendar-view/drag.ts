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
      isRecurDrag: boolean
    }
  | {
      type: 'resizing-end'
      event: CalendarEvent
      dayIdx: number
      currentSlot: number
      isRecurDrag: boolean
    }
  | {
      type: 'resizing-start'
      event: CalendarEvent
      dayIdx: number
      currentSlot: number
      isRecurDrag: boolean
    }
  | { type: 'recurrence-select'; event: CalendarEvent; startDayIdx: number; currentDayIdx: number }

export interface DragActions {
  startCreate: (dayIdx: number, startSlot: number) => void
  startMove: (
    event: CalendarEvent,
    dayIdx: number,
    slotOffset: number,
    initialSlot?: number,
    isRecurDrag?: boolean,
  ) => void
  startRecurrenceSelect: (event: CalendarEvent, dayIdx: number) => void
  startResizeEnd: (
    event: CalendarEvent,
    dayIdx: number,
    currentSlot: number,
    isRecurDrag?: boolean,
  ) => void
  startResizeStart: (
    event: CalendarEvent,
    dayIdx: number,
    currentSlot: number,
    isRecurDrag?: boolean,
  ) => void
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
      startMove(event, dayIdx, slotOffset, initialSlot = 0, isRecurDrag = false) {
        setMode({
          type: 'moving',
          event,
          dayIdx,
          currentSlot: initialSlot,
          slotOffset,
          isRecurDrag,
        })
      },
      startRecurrenceSelect(event, dayIdx) {
        setMode({ type: 'recurrence-select', event, startDayIdx: dayIdx, currentDayIdx: dayIdx })
      },
      startResizeEnd(event, dayIdx, currentSlot, isRecurDrag = false) {
        setMode({ type: 'resizing-end', event, dayIdx, currentSlot, isRecurDrag })
      },
      startResizeStart(event, dayIdx, currentSlot, isRecurDrag = false) {
        setMode({ type: 'resizing-start', event, dayIdx, currentSlot, isRecurDrag })
      },
      updateSlot(dayIdx, slot) {
        setMode((prev) => {
          if (prev.type === 'creating') return { ...prev, currentDayIdx: dayIdx, currentSlot: slot }
          if (prev.type === 'moving') return { ...prev, dayIdx, currentSlot: slot }
          if (prev.type === 'resizing-end') return { ...prev, currentSlot: slot }
          if (prev.type === 'resizing-start') return { ...prev, currentSlot: slot }
          if (prev.type === 'recurrence-select') return { ...prev, currentDayIdx: dayIdx }
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
