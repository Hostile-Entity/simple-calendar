import type { Theme } from "../utils/theme";

interface SettingsModalProps {
  isOpen: boolean;
  version: string;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
  onDeleteAllData: () => void;
}

export default function SettingsModal({
  isOpen,
  version,
  theme,
  onThemeChange,
  onClose,
  onDeleteAllData
}: SettingsModalProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="settingsBackdrop" onClick={onClose}>
      <section className="settingsPanel" onClick={(event) => event.stopPropagation()}>
        <header className="settingsHeader">
          <h3>Settings</h3>
          <button type="button" className="closeButton" onClick={onClose}>
            Close
          </button>
        </header>

        <fieldset className="themePicker">
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

        <button type="button" className="dangerButton" onClick={onDeleteAllData}>
          Delete all data
        </button>

        <p className="settingsVersion">{version}</p>
      </section>
    </div>
  );
}
