import type { DayEntry } from "../db/calendarDb";
import type { Theme } from "./theme";

export interface CalendarBackup {
  format: "simple-calendar";
  version: 1;
  exportedAt: string;
  theme: Theme;
  entries: DayEntry[];
}

export function createBackup(entries: DayEntry[], theme: Theme): CalendarBackup {
  return {
    format: "simple-calendar",
    version: 1,
    exportedAt: new Date().toISOString(),
    theme,
    entries
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseBackup(text: string, colorCount: number): CalendarBackup {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (!isRecord(value) || value.format !== "simple-calendar" || value.version !== 1) {
    throw new Error("This file is not a supported Simple Calendar backup.");
  }
  if (
    typeof value.exportedAt !== "string" || !Number.isFinite(Date.parse(value.exportedAt)) ||
    (value.theme !== "default" && value.theme !== "dark") || !Array.isArray(value.entries)
  ) {
    throw new Error("The backup contains invalid settings or entries.");
  }

  const dates = new Set<string>();
  const entries = value.entries.map((entry: unknown): DayEntry => {
    if (
      !isRecord(entry) || !isDateKey(entry.date) ||
      !(entry.colorId === null || (
        typeof entry.colorId === "number" && Number.isInteger(entry.colorId) &&
        entry.colorId >= 0 && entry.colorId < colorCount
      )) ||
      typeof entry.note !== "string" ||
      typeof entry.updatedAt !== "number" || !Number.isFinite(entry.updatedAt) || entry.updatedAt < 0
    ) {
      throw new Error("The backup contains an invalid calendar entry.");
    }
    if (dates.has(entry.date)) {
      throw new Error(`The backup contains duplicate entries for ${entry.date}.`);
    }
    dates.add(entry.date);
    return { date: entry.date, colorId: entry.colorId, note: entry.note, updatedAt: entry.updatedAt };
  });

  return {
    format: "simple-calendar",
    version: 1,
    exportedAt: value.exportedAt,
    theme: value.theme,
    entries
  };
}
