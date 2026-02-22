import { useRef } from "react";

interface MonthPagerProps {
  children: React.ReactNode;
  onMonthChange: (delta: number) => void;
}

export default function MonthPager({ children, onMonthChange }: MonthPagerProps): JSX.Element {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>): void {
    const touch = event.changedTouches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>): void {
    if (startXRef.current === null || startYRef.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;

    startXRef.current = null;
    startYRef.current = null;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    onMonthChange(deltaX < 0 ? 1 : -1);
  }

  return (
    <section className="monthPager">
      <div className="pagerButtons" aria-hidden="true">
        <button type="button" className="navButton" onClick={() => onMonthChange(-1)}>
          <span aria-hidden="true">&#x2039;</span>
          <span className="srOnly">Previous month</span>
        </button>
        <button type="button" className="navButton" onClick={() => onMonthChange(1)}>
          <span aria-hidden="true">&#x203A;</span>
          <span className="srOnly">Next month</span>
        </button>
      </div>

      <div className="monthSwipeArea" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {children}
      </div>
    </section>
  );
}
