import { useEffect, useState } from "react";
import { localDayKey, millisecondsUntilNextDay } from "./calendar";

export function useLocalDay(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refresh(): void {
      clearTimeout(timer);
      const now = new Date();
      setToday(previous => localDayKey(previous) === localDayKey(now) ? previous : now);
      timer = setTimeout(refresh, millisecondsUntilNextDay(now) + 50);
    }
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return today;
}
