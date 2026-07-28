/** Format a Date using local calendar components (avoids UTC shift from toISOString). */
export function toLocalDateKey(date: Date | string): string {
  // Pure YYYY-MM-DD is already a calendar key — do not parse as UTC midnight.
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    return date.trim();
  }
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Iterate each calendar day in a range using local timezone semantics. */
export function eachLocalDayInRange(
  start: string,
  end: string,
  onDay: (dateKey: string) => void
): void {
  const startD = new Date(start);
  startD.setHours(0, 0, 0, 0);
  const endD = new Date(end);
  endD.setHours(0, 0, 0, 0);

  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
    onDay(toLocalDateKey(d));
  }
}
