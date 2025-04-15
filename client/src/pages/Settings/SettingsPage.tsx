import React, { useState } from 'react';
import { Container, Nav, Tab, Alert } from 'react-bootstrap';
import UserPreferencesForm from '../../components/Settings/UserPreferencesForm';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import ShortcutsHelp from '../../components/common/ShortcutsHelp';
import { SettingsBackup } from '../../services/SettingsBackup';
import '../../styles/settings.css';

const BackupSettingsPane: React.FC = () => {
  const { settings, exportSettings, importSettings } = useUnifiedSettings();
  const settingsBackup = SettingsBackup.getInstance();
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const backup = settingsBackup.exportSettings();
      settingsBackup.importSettings(backup);
      setSyncError(null);
    } catch (error) {
      setSyncError('Failed to export settings. Your settings are still saved locally.');
      console.error('Export error:', error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const success = await importSettings(file);
      if (success) {
        setSyncError(null);
      } else {
        setSyncError('Failed to import settings. Please check the file format.');
      }
    } catch (error) {
      setSyncError('Failed to import settings. Please try again.');
      console.error('Import error:', error);
    }
  };

  return (
    <div className="backup-settings-pane">
      <h3>Backup & Restore Settings</h3>
      {syncError && (
        <Alert variant="warning" dismissible onClose={() => setSyncError(null)}>
          {syncError}
        </Alert>
      )}
      <div className="mb-4">
        <p>Export your settings to create a backup file:</p>
        <button className="btn btn-primary me-3" onClick={handleExport}>
          Export Settings
        </button>
      </div>
      <div>
        <p>Import settings from a backup file:</p>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="form-control"
          style={{ maxWidth: '300px' }}
        />
      </div>
      <hr />
      <div className="mt-4">
        <h4>Auto-Backup Settings</h4>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="autoBackup"
            checked={settings?.backupFrequency !== 'never'}
            onChange={(e) => {
              settingsBackup.scheduleBackup();
            }}
          />
          <label className="form-check-label" htmlFor="autoBackup">
            Enable automatic backups
          </label>
        </div>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { settings } = useUnifiedSettings();
  const [activeTab, setActiveTab] = useState('preferences');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // These keyboard shortcuts will be handled globally through the useKeyboardShortcuts hook
  useKeyboardShortcuts();

  return (
    <Container className={`settings-container theme-${settings?.theme ?? 'light'}`}>
      <h1 className="mb-4">Settings</h1>

      {settings?.keyboardShortcutsEnabled && (
        <Alert variant="info" className="mb-4">
          Press <kbd>?</kbd> to view keyboard shortcuts
        </Alert>
      )}

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'preferences')}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="preferences">Preferences</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="backup">Backup & Restore</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="notifications">Notifications</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="privacy">Privacy & Security</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="preferences">
            <UserPreferencesForm />
          </Tab.Pane>
          <Tab.Pane eventKey="backup">
            <BackupSettingsPane />
          </Tab.Pane>
          {/* Other tab panes will be implemented separately */}
        </Tab.Content>
      </Tab.Container>

      <ShortcutsHelp />
    </Container>
  );
};

export default SettingsPage;