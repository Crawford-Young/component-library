import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDragState } from './drag'
import type { CalendarEvent } from '@/components/ui/calendar-event-chip'

const ev: CalendarEvent = {
  id: 'e1',
  title: 'Test',
  start: '2026-05-04T09:00:00',
  end: '2026-05-04T10:00:00',
}

describe('useDragState', () => {
  it('initial state is idle', () => {
    const { result } = renderHook(() => useDragState())
    expect(result.current[0].type).toBe('idle')
  })

  it('startCreate sets startDayIdx = currentDayIdx = dayIdx and startSlot = currentSlot', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startCreate(2, 36))
    const mode = result.current[0]
    expect(mode.type).toBe('creating')
    if (mode.type === 'creating') {
      expect(mode.startDayIdx).toBe(2)
      expect(mode.currentDayIdx).toBe(2)
      expect(mode.startSlot).toBe(36)
      expect(mode.currentSlot).toBe(36)
    }
  })

  it('startMove transitions to moving with correct fields', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startMove(ev, 1, 2))
    const mode = result.current[0]
    expect(mode.type).toBe('moving')
    if (mode.type === 'moving') {
      expect(mode.event.id).toBe('e1')
      expect(mode.dayIdx).toBe(1)
      expect(mode.slotOffset).toBe(2)
    }
  })

  it('startDuplicate sets startDayIdx = currentDayIdx = dayIdx', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startDuplicate(ev, 3))
    const mode = result.current[0]
    expect(mode.type).toBe('duplicating')
    if (mode.type === 'duplicating') {
      expect(mode.event.id).toBe('e1')
      expect(mode.startDayIdx).toBe(3)
      expect(mode.currentDayIdx).toBe(3)
    }
  })

  it('startResizeEnd transitions to resizing-end', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startResizeEnd(ev, 2, 40))
    const mode = result.current[0]
    expect(mode.type).toBe('resizing-end')
    if (mode.type === 'resizing-end') {
      expect(mode.dayIdx).toBe(2)
      expect(mode.currentSlot).toBe(40)
    }
  })

  it('startResizeStart transitions to resizing-start', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startResizeStart(ev, 1, 36))
    const mode = result.current[0]
    expect(mode.type).toBe('resizing-start')
    if (mode.type === 'resizing-start') {
      expect(mode.dayIdx).toBe(1)
      expect(mode.currentSlot).toBe(36)
    }
  })

  it('updateSlot updates both currentDayIdx and currentSlot in creating mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startCreate(0, 32))
    act(() => result.current[1].updateSlot(3, 44))
    const mode = result.current[0]
    if (mode.type === 'creating') {
      expect(mode.startDayIdx).toBe(0)
      expect(mode.currentDayIdx).toBe(3)
      expect(mode.startSlot).toBe(32)
      expect(mode.currentSlot).toBe(44)
    }
  })

  it('updateSlot updates both dayIdx and currentSlot in moving mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startMove(ev, 0, 0))
    act(() => result.current[1].updateSlot(4, 36))
    const mode = result.current[0]
    if (mode.type === 'moving') {
      expect(mode.dayIdx).toBe(4)
      expect(mode.currentSlot).toBe(36)
    }
  })

  it('updateSlot updates only currentSlot in resizing-end (day fixed)', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startResizeEnd(ev, 2, 36))
    act(() => result.current[1].updateSlot(5, 44))
    const mode = result.current[0]
    if (mode.type === 'resizing-end') {
      expect(mode.dayIdx).toBe(2)
      expect(mode.currentSlot).toBe(44)
    }
  })

  it('updateSlot updates only currentSlot in resizing-start (day fixed)', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startResizeStart(ev, 2, 36))
    act(() => result.current[1].updateSlot(5, 28))
    const mode = result.current[0]
    if (mode.type === 'resizing-start') {
      expect(mode.dayIdx).toBe(2)
      expect(mode.currentSlot).toBe(28)
    }
  })

  it('updateSlot updates only currentDayIdx in duplicating mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startDuplicate(ev, 1))
    act(() => result.current[1].updateSlot(4, 36))
    const mode = result.current[0]
    if (mode.type === 'duplicating') {
      expect(mode.startDayIdx).toBe(1)
      expect(mode.currentDayIdx).toBe(4)
    }
  })

  it('reset returns to idle from any mode', () => {
    const { result } = renderHook(() => useDragState())
    act(() => result.current[1].startCreate(0, 32))
    act(() => result.current[1].reset())
    expect(result.current[0].type).toBe('idle')
  })

  it('actions object is stable across renders', () => {
    const { result, rerender } = renderHook(() => useDragState())
    const actions1 = result.current[1]
    rerender()
    const actions2 = result.current[1]
    expect(actions1).toBe(actions2)
  })
})
