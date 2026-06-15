/** Build a UTC ISO string from a date and an HH:MM wall-clock time, using the
 * date's UTC parts. Local time parts here are a timezone bug UTC CI masks. */
export function buildIso(date: Date, time: string): string {
  const [h, m] = time.split(':').map(Number)
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, m, 0),
  ).toISOString()
}

/** Extract the UTC HH:MM slot from an ISO string. */
export function toTimeSlot(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}
