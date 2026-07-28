import { toLocalDateKey } from "@/lib/date/calendar";

/**
 * Working-day indices match JS `Date#getDay()` / profile `workingDays`:
 * 0=Sun, 1=Mon, … 6=Sat. Fiberise 5-day weeks are typically `[1,2,3,4,5]`.
 */
export function getWeekdayIndex(date: string | Date): number {
  if (typeof date === "string") {
    const key = toLocalDateKey(date);
    // Noon avoids DST edge cases when parsing YYYY-MM-DD as local.
    return new Date(`${key}T12:00:00`).getDay();
  }
  return date.getDay();
}

export function isWorkingDay(date: string | Date, workingDays?: number[] | null): boolean {
  if (!workingDays?.length) return true;
  return workingDays.includes(getWeekdayIndex(date));
}

export function isNonWorkingDay(date: string | Date, workingDays?: number[] | null): boolean {
  if (!workingDays?.length) return false;
  return !isWorkingDay(date, workingDays);
}
