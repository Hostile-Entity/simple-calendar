import { useEffect, useMemo, useState } from "react";
import CalendarGrid from "./components/CalendarGrid";
import DayEditor from "./components/DayEditor";
import MonthPager from "./components/MonthPager";
import SettingsModal from "./components/SettingsModal";
import {
  clearAllEntries,
  deleteEntry,
  getEntriesInRange,
  upsertEntry,
  type DayEntry
} from "./db/calendarDb";
import { addMonths, formatMonthLabel, getMonthRange, startOfMonth } from "./utils/date";

const APP_VERSION = "v0.0.1";

function toEntriesMap(entries: DayEntry[]): Record<string, DayEntry> {
  return entries.reduce<Record<string, DayEntry>>((acc, entry) => {
    acc[entry.date] = entry;
    return acc;
  }, {});
}

export default function App(): JSX.Element {
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(new Date()));
  const [entriesByDate, setEntriesByDate] = useState<Record<string, DayEntry>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const selectedEntry = selectedDate ? entriesByDate[selectedDate] : undefined;
  const monthTitle = useMemo(() => formatMonthLabel(visibleMonth), [visibleMonth]);

  useEffect(() => {
    const prevMonth = addMonths(visibleMonth, -1);
    const nextMonth = addMonths(visibleMonth, 1);
    const prevRange = getMonthRange(prevMonth);
    const nextRange = getMonthRange(nextMonth);

    getEntriesInRange(prevRange.start, nextRange.end)
      .then((entries) => {
        setEntriesByDate(toEntriesMap(entries));
      })
      .catch((error) => {
        console.error("Failed to load entries", error);
      });
  }, [visibleMonth]);

  function changeMonth(delta: number): void {
    setVisibleMonth((current) => addMonths(current, delta));
  }

  async function handleSave(payload: { colorId: number | null; note: string }): Promise<void> {
    if (!selectedDate) {
      return;
    }

    const trimmed = payload.note.trim();
    if (payload.colorId === null && !trimmed) {
      await deleteEntry(selectedDate);
      setEntriesByDate((prev) => {
        const next = { ...prev };
        delete next[selectedDate];
        return next;
      });
      setSelectedDate(null);
      return;
    }

    const entry: DayEntry = {
      date: selectedDate,
      colorId: payload.colorId,
      note: payload.note,
      updatedAt: Date.now()
    };

    await upsertEntry(entry);
    setEntriesByDate((prev) => ({ ...prev, [selectedDate]: entry }));
    setSelectedDate(null);
  }

  async function handleClear(): Promise<void> {
    if (!selectedDate) {
      return;
    }

    await deleteEntry(selectedDate);
    setEntriesByDate((prev) => {
      const next = { ...prev };
      delete next[selectedDate];
      return next;
    });
    setSelectedDate(null);
  }

  async function handleDeleteAllData(): Promise<void> {
    const confirmed = window.confirm("Delete all saved colors and notes? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    await clearAllEntries();
    setEntriesByDate({});
    setSelectedDate(null);
    setIsSettingsOpen(false);
  }

  return (
    <main className="appShell">
      <header className="appHeader">
        <button
          type="button"
          className="settingsIconButton"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Open settings"
        >
          <img src={`${import.meta.env.BASE_URL}icons/settings.svg`} alt="" aria-hidden="true" />
        </button>
      </header>

      <section className="monthHeader" aria-live="polite">
        <h2>{monthTitle}</h2>
      </section>

      <MonthPager onMonthChange={changeMonth}>
        <CalendarGrid
          monthDate={visibleMonth}
          entriesByDate={entriesByDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </MonthPager>

      <DayEditor
        dateKey={selectedDate}
        existingEntry={selectedEntry}
        onSave={handleSave}
        onClear={handleClear}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        version={APP_VERSION}
        onClose={() => setIsSettingsOpen(false)}
        onDeleteAllData={handleDeleteAllData}
      />
    </main>
  );
}
