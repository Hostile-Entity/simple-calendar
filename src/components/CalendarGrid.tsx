import { COLOR_OPTIONS } from "../constants/colors";
import type { DayEntry } from "../db/calendarDb";
import { getMonthGrid, getWeekdays } from "../utils/date";
import BirthdayFlower from "../birthday/BirthdayFlower";

interface CalendarGridProps {
  monthDate: Date;
  entriesByDate: Record<string, DayEntry>;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  birthdayDateKey?: string;
}

export default function CalendarGrid({
  monthDate,
  entriesByDate,
  selectedDate,
  onSelectDate,
  birthdayDateKey
}: CalendarGridProps): JSX.Element {
  const weekdays = getWeekdays();
  const monthCells = getMonthGrid(monthDate);

  return (
    <div className="calendarGridWrap">
      <div className="weekdayRow" role="row">
        {weekdays.map((day) => (
          <span className="weekdayLabel" key={day} role="columnheader">
            {day}
          </span>
        ))}
      </div>

      <div className="calendarGrid" role="grid" aria-label="Calendar month">
        {monthCells.map((cell) => {
          const entry = entriesByDate[cell.key];
          const hasColor = typeof entry?.colorId === "number";
          const hasNote = Boolean(entry?.note.trim());

          return (
            <button
              type="button"
              key={cell.key}
              className={`dayCell ${cell.inCurrentMonth ? "currentMonth" : "otherMonth"} ${
                cell.isToday ? "today" : ""
              } ${selectedDate === cell.key ? "selected" : ""} ${hasColor ? "hasColor" : ""} ${cell.key === birthdayDateKey ? "birthdayDay" : ""}`}
              style={
                hasColor
                  ? {
                      backgroundColor: COLOR_OPTIONS[entry.colorId as number]
                    }
                  : undefined
              }
              onClick={() => onSelectDate(cell.key)}
            >
              <span className="dayNumber">{cell.dayNumber}</span>
              {hasNote ? <span className="notePreview">{entry.note}</span> : null}
              {cell.key === birthdayDateKey ? <BirthdayFlower /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
