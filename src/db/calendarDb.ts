import Dexie, { type EntityTable } from "dexie";

export interface DayEntry {
  date: string;
  colorId: number | null;
  note: string;
  updatedAt: number;
}

const db = new Dexie("simple-calendar") as Dexie & {
  dayEntries: EntityTable<DayEntry, "date">;
};

db.version(1).stores({
  dayEntries: "date, updatedAt"
});

export async function getEntriesInRange(startDate: string, endDate: string): Promise<DayEntry[]> {
  return db.dayEntries.where("date").between(startDate, endDate, true, true).toArray();
}

export async function upsertEntry(entry: DayEntry): Promise<void> {
  await db.dayEntries.put(entry);
}

export async function deleteEntry(date: string): Promise<void> {
  await db.dayEntries.delete(date);
}

export async function clearAllEntries(): Promise<void> {
  await db.dayEntries.clear();
}
