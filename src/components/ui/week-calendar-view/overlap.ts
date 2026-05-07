interface TimedEvent {
  readonly start: string
  readonly end: string
}

export interface PositionedEvent<T extends TimedEvent> {
  readonly event: T
  readonly column: number
  readonly totalColumns: number
}

export function buildOverlapLayout<T extends TimedEvent>(events: T[]): PositionedEvent<T>[] {
  if (events.length === 0) return []

  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )

  // Greedy column assignment: track end time of last event in each column
  const columnEnds: number[] = []
  const assigned = sorted.map((event) => {
    const startMs = new Date(event.start).getTime()
    const endMs = new Date(event.end).getTime()
    let col = columnEnds.findIndex((colEnd) => colEnd <= startMs)
    if (col === -1) col = columnEnds.length
    columnEnds[col] = endMs
    return { event, column: col, endMs }
  })

  // totalColumns = max column+1 among all events that time-overlap with this one
  return assigned.map(({ event, column }) => {
    const startMs = new Date(event.start).getTime()
    const endMs = new Date(event.end).getTime()
    let maxCol = column
    for (const other of assigned) {
      const otherStart = new Date(other.event.start).getTime()
      const otherEnd = other.endMs
      if (otherStart < endMs && otherEnd > startMs) {
        maxCol = Math.max(maxCol, other.column)
      }
    }
    return { event, column, totalColumns: maxCol + 1 }
  })
}
