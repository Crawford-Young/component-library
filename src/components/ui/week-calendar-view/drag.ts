import { useState } from 'react'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'

export type DragMode =
  | { type: 'idle' }
  | { type: 'creating'; dayIdx: number; startSlot: number; currentSlot: number }
  | {
      type: 'moving'
      event: CalendarEvent
      dayIdx: number
      currentSlot: number
      slotOffset: number
      initClientX: number
      initClientY: number
    }
  | { type: 'resizing'; event: CalendarEvent; dayIdx: number; currentSlot: number }
  | { type: 'duplicating'; event: CalendarEvent; startDayIdx: number; currentDayIdx: number }

export interface DragActions {
  startCreate: (dayIdx: number, startSlot: number) => void
  startMove: (
    event: CalendarEvent,
    dayIdx: number,
    slotOffset: number,
    initClientX: number,
    initClientY: number,
  ) => void
  startResize: (event: CalendarEvent, dayIdx: number, currentSlot: number) => void
  updateSlot: (dayIdx: number, slot: number) => void
  tryDisambiguate: (totalDeltaX: number, totalDeltaY: number) => void
  reset: () => void
}

export function useDragState(): [DragMode, DragActions] {
  const [mode, setMode] = useState<DragMode>({ type: 'idle' })

  const actions: DragActions = {
    startCreate(dayIdx, startSlot) {
      setMode({ type: 'creating', dayIdx, startSlot, currentSlot: startSlot })
    },
    startMove(event, dayIdx, slotOffset, initClientX, initClientY) {
      setMode({
        type: 'moving',
        event,
        dayIdx,
        currentSlot: 0,
        slotOffset,
        initClientX,
        initClientY,
      })
    },
    startResize(event, dayIdx, currentSlot) {
      setMode({ type: 'resizing', event, dayIdx, currentSlot })
    },
    updateSlot(dayIdx, slot) {
      setMode((prev) => {
        if (prev.type === 'creating') return { ...prev, dayIdx, currentSlot: slot }
        if (prev.type === 'moving') return { ...prev, dayIdx, currentSlot: slot }
        if (prev.type === 'resizing') return { ...prev, dayIdx, currentSlot: slot }
        if (prev.type === 'duplicating') return { ...prev, currentDayIdx: dayIdx }
        return prev
      })
    },
    tryDisambiguate(totalDeltaX, totalDeltaY) {
      setMode((prev) => {
        if (prev.type !== 'moving') return prev
        const moved = Math.max(Math.abs(totalDeltaX), Math.abs(totalDeltaY))
        if (moved < 8) return prev
        if (Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) {
          return {
            type: 'duplicating',
            event: prev.event,
            startDayIdx: prev.dayIdx,
            currentDayIdx: prev.dayIdx,
          }
        }
        return prev
      })
    },
    reset() {
      setMode({ type: 'idle' })
    },
  }

  return [mode, actions]
}
