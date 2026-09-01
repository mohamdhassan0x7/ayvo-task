// Small date helpers for the appointments calendar. All comparisons are in
// the viewer's local time zone since appointments are scheduled locally.

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Next 7 days including today, at midnight local time.
export function nextSevenDays(from: Date = new Date()): Date[] {
  const today = startOfDay(from);
  return Array.from({ length: 7 }, (_, i) => addDays(today, i));
}

export function formatDayHeading(date: Date): string {
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const day = date.getDate();
  return `${weekday} ${day}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// End time of an appointment, given its start and duration in minutes.
export function endTimeFor(startTime: Date, durationMinutes: number): Date {
  return new Date(startTime.getTime() + durationMinutes * 60_000);
}

// A sensible default start time for a newly-created appointment on `day`:
// 9am, unless that's already in the past (i.e. `day` is today and it's
// past 9am), in which case the next half-hour slot from now.
export function defaultStartTimeFor(day: Date): Date {
  const candidate = new Date(day);
  candidate.setHours(9, 0, 0, 0);

  const now = new Date();
  if (candidate > now) {
    return candidate;
  }

  const next = new Date(now.getTime() + 30 * 60_000);
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() - (next.getMinutes() % 30));
  return next;
}

// <input type="datetime-local"> works in local time and expects
// "YYYY-MM-DDTHH:mm" — no timezone, no seconds.
export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function fromDatetimeLocalValue(value: string): Date {
  return new Date(value);
}
