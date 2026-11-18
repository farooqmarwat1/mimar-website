/**
 * Dates for the weekday publishing schedule (posts.ts `scheduledFor`, /api/cron/publish-scheduled).
 * The studio works on Pakistan time, so "today" and "weekday" are Asia/Karachi. Pure, so it can be tested.
 */

const KARACHI = "Asia/Karachi";

/** The date (YYYY-MM-DD) it is in Pakistan at `now`. */
export function karachiDay(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KARACHI, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Monday to Friday, in Pakistan. */
export function isKarachiWeekday(now: Date): boolean {
  const day = new Intl.DateTimeFormat("en-US", { timeZone: KARACHI, weekday: "short" }).format(now);
  return !["Sat", "Sun"].includes(day);
}

/** `count` weekday dates (YYYY-MM-DD) from `start` on, `start` included when it is a weekday. */
export function weekdayDates(start: string, count: number): string[] {
  const dates: string[] = [];
  const day = new Date(`${start}T12:00:00Z`);
  while (dates.length < count) {
    const weekday = day.getUTCDay();
    if (weekday !== 0 && weekday !== 6) dates.push(day.toISOString().slice(0, 10));
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return dates;
}

/** The scheduled post to publish today: the earliest one whose date has come. Null when none is due. */
export function nextDue<T extends { scheduledFor?: string }>(posts: T[], today: string): T | null {
  return (
    posts
      .filter((post) => post.scheduledFor && post.scheduledFor <= today)
      .sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!))[0] ?? null
  );
}
