import { useEffect, useState } from "react";
import { COLOR_OPTIONS } from "../constants/colors";
import type { DayEntry } from "../db/calendarDb";

interface DayEditorProps {
  dateKey: string | null;
  existingEntry?: DayEntry;
  onSave: (payload: { colorId: number | null; note: string }) => void;
  onClear: () => void;
}

export default function DayEditor({
  dateKey,
  existingEntry,
  onSave,
  onClear
}: DayEditorProps): JSX.Element | null {
  const [colorId, setColorId] = useState<number | null>(existingEntry?.colorId ?? null);
  const [note, setNote] = useState(existingEntry?.note ?? "");

  useEffect(() => {
    setColorId(existingEntry?.colorId ?? null);
    setNote(existingEntry?.note ?? "");
  }, [existingEntry?.colorId, existingEntry?.note, dateKey]);

  if (!dateKey) {
    return null;
  }

  function commitAndClose(nextColorId: number | null, nextNote: string): void {
    onSave({ colorId: nextColorId, note: nextNote });
  }

  const dateLabel = new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="editorBackdrop" onClick={() => commitAndClose(colorId, note)}>
      <section className="editorPanel" onClick={(event) => event.stopPropagation()}>
        <header className="editorHeader">
          <h2>{dateLabel}</h2>
          <button type="button" className="closeButton" onClick={() => commitAndClose(colorId, note)}>
            Done
          </button>
        </header>

        <p className="editorLabel">Pick color (applies instantly)</p>
        <div className="colorRow">
          {COLOR_OPTIONS.map((hex, index) => (
            <button
              key={hex}
              type="button"
              className={`colorOption ${colorId === index ? "selected" : ""}`}
              style={{ backgroundColor: hex }}
              onClick={() => {
                setColorId(index);
                commitAndClose(index, note);
              }}
              aria-label={`Choose color ${index + 1}`}
            />
          ))}
        </div>

        <label className="editorLabel" htmlFor="noteInput">
          Note
        </label>
        <textarea
          id="noteInput"
          className="noteInput"
          value={note}
          placeholder="Write a note for this date"
          onChange={(event) => setNote(event.target.value)}
          rows={4}
        />

        <div className="editorActions">
          <button
            type="button"
            className="ghostButton"
            onClick={() => {
              setColorId(null);
              setNote("");
              onClear();
            }}
          >
            Clear
          </button>
        </div>
      </section>
    </div>
  );
}
