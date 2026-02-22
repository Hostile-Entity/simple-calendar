const WEEKDAYS_MONDAY_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_EMOJIS = ["☃️", "💘", "🌱", "🌷", "🌸", "☀️", "🏖️", "🍉", "🍂", "🎃", "🧣", "🎄"];

export interface DayCell {
  date: Date;
  key: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export function getWeekdays(): string[] {
  return WEEKDAYS_MONDAY_FIRST;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthLabel(date: Date): string {
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);

  return `${monthLabel} ${MONTH_EMOJIS[date.getMonth()]}`;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function getMonthGrid(monthDate: Date): DayCell[] {
  const monthStart = startOfMonth(monthDate);
  const firstWeekday = monthStart.getDay();
  const mondayIndex = (firstWeekday + 6) % 7;
  const gridStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - mondayIndex);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({
      date,
      key: formatDateKey(date),
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isToday: isToday(date)
    });
  }

  return cells;
}

export function getMonthRange(monthDate: Date): { start: string; end: string } {
  const cells = getMonthGrid(monthDate);
  return {
    start: cells[0].key,
    end: cells[cells.length - 1].key
  };
}
