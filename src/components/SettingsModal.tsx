interface SettingsModalProps {
  isOpen: boolean;
  version: string;
  onClose: () => void;
  onDeleteAllData: () => void;
}

export default function SettingsModal({
  isOpen,
  version,
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

        <button type="button" className="dangerButton" onClick={onDeleteAllData}>
          Delete all data
        </button>

        <p className="settingsVersion">{version}</p>
      </section>
    </div>
  );
}
