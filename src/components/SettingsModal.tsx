import { useRef, useState } from "react";
import type { Theme } from "../utils/theme";

interface SettingsModalProps {
  isOpen: boolean;
  version: string;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
  onDeleteAllData: () => void;
  onExport: () => Promise<void>;
  onImport: (file: File) => Promise<boolean>;
}

export default function SettingsModal({
  isOpen,
  version,
  theme,
  onThemeChange,
  onClose,
  onDeleteAllData,
  onExport,
  onImport
}: SettingsModalProps): JSX.Element | null {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  async function runBackupAction(action: () => Promise<string>): Promise<void> {
    setBusy(true);
    setMessage("");
    setHasError(false);
    try {
      setMessage(await action());
    } catch (error) {
      setHasError(true);
      setMessage(error instanceof Error ? error.message : "Backup operation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function close(): void {
    if (busy) return;
    setMessage("");
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settingsBackdrop" onClick={close}>
      <section className="settingsPanel" role="dialog" aria-modal="true" aria-labelledby="settingsTitle"
        aria-busy={busy} onClick={(event) => event.stopPropagation()}>
        <header className="settingsHeader">
          <h3 id="settingsTitle">Settings</h3>
          <button type="button" className="closeButton" onClick={close} disabled={busy}>
            Close
          </button>
        </header>

        <fieldset className="themePicker" disabled={busy}>
          <legend>Theme</legend>
          <div className="themeOptions">
            <label className="themeOption">
              <input
                type="radio"
                name="theme"
                value="default"
                checked={theme === "default"}
                onChange={() => onThemeChange("default")}
              />
              Default
            </label>
            <label className="themeOption">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === "dark"}
                onChange={() => onThemeChange("dark")}
              />
              Dark
            </label>
          </div>
        </fieldset>

        <fieldset className="backupPicker" disabled={busy}>
          <legend>Backup</legend>
          <p>Export all calendar colors, notes and your theme as JSON. Import replaces existing data.</p>
          <div className="backupActions">
            <button type="button" className="ghostButton" onClick={() => void runBackupAction(async () => {
              await onExport();
              return "Backup download started.";
            })}>
              Export JSON
            </button>
            <button type="button" className="ghostButton" onClick={() => fileInput.current?.click()}>
              Import JSON
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            hidden
            aria-label="Choose a JSON backup"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) {
                void runBackupAction(async () => (await onImport(file)) ? "Backup restored successfully." : "Import cancelled.");
              }
            }}
          />
        </fieldset>
        {busy ? <p className="backupMessage" role="status">Working…</p> : null}
        {message ? <p className={`backupMessage${hasError ? " backupError" : ""}`}
          role={hasError ? "alert" : "status"}>{message}</p> : null}

        <button type="button" className="dangerButton" onClick={onDeleteAllData} disabled={busy}>
          Delete all data
        </button>

        <p className="settingsVersion">{version}</p>
      </section>
    </div>
  );
}
