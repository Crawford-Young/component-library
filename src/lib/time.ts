/**
 * Build a real ISO instant from an `HH:MM` LOCAL wall-clock time on `date`'s
 * LOCAL calendar day. A typed `09:00` means 9:00 AM local — the returned
 * string is the corresponding UTC instant (`.toISOString()`), correct for
 * `date`'s local day regardless of that day's UTC-side date. Pair with
 * `toTimeSlot` to read the same local time back in any timezone.
 */
export function buildIso(date: Date, time: string): string {
  const [h, m] = time.split(':').map(Number)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0).toISOString()
}

/**
 * Extract the LOCAL `HH:MM` wall-clock slot from an ISO instant string.
 * Complements `buildIso`: local time in, local time back out — the pair
 * round-trips without drifting across timezones.
 */
export function toTimeSlot(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
