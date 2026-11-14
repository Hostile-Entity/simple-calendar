export type BirthdayAvailability = "birthday" | "replay" | "none";
export const BIRTHDAY_MONTH = 10;
export const BIRTHDAY_DAY = 22;
export const BIRTHDAY_REPLAY_DAYS = 7;

/** Local calendar dates, deliberately not UTC or elapsed 24-hour periods. */
export function getBirthdayAvailability(date: Date): BirthdayAvailability {
  if (date.getMonth() !== BIRTHDAY_MONTH) return "none";
  if (date.getDate() === BIRTHDAY_DAY) return "birthday";
  return date.getDate() > BIRTHDAY_DAY &&
    date.getDate() <= BIRTHDAY_DAY + BIRTHDAY_REPLAY_DAYS ? "replay" : "none";
}

export function getBirthdayDateKey(year: number): string {
  return localDayKey(new Date(year, BIRTHDAY_MONTH, BIRTHDAY_DAY));
}

export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function millisecondsUntilNextDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime() - date.getTime();
}
