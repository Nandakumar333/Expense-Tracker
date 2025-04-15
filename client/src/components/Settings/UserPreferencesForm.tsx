import React, { useState } from 'react';
import { Form, Card, Row, Col, Alert, Button } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import { NotificationService } from '../../services/NotificationService';

const UserPreferencesForm: React.FC = () => {
  const { settings, updateSettings, exportSettings, importSettings, resetSettings } = useUnifiedSettings();
  const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  const notificationService = NotificationService.getInstance();

  const updateSetting = async (key: string, value: any) => {
    try {
      await updateSettings({ ...settings, [key]: value });
      setAlert({ type: 'success', message: 'Settings updated successfully!' });
      
      if (key === 'notificationsEnabled' && value === true) {
        await notificationService.requestNotificationPermission();
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Failed to update settings. Please try again.' });
    }
  };

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  const handleExport = () => {
    const settingsData = exportSettings();
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense-tracker-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const success = await importSettings(file);
      if (success) {
        setAlert({
          type: 'success',
          message: 'Settings imported successfully'
        });
      } else {
        throw new Error('Failed to import settings');
      }
    } catch (error) {
      setAlert({
        type: 'danger',
        message: 'Failed to import settings. Please check the file format.'
      });
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const success = await resetSettings();
      if (success) {
        setAlert({
          type: 'success',
          message: 'Settings reset to default values'
        });
      }
    }
  };

  return (
    <div className="user-preferences">
      {alert && (
        <Alert 
          variant={alert.type} 
          dismissible 
          onClose={() => setAlert(null)}
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">General Settings</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Theme</Form.Label>
                    <Form.Select
                      value={settings?.theme ?? 'light'}
                      onChange={(e) => updateSetting('theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Currency</Form.Label>
                    <Form.Select
                      value={settings?.currency ?? 'USD'}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Language</Form.Label>
                    <Form.Select
                      value={settings?.language ?? 'en-US'}
                      onChange={(e) => updateSetting('language', e.target.value)}
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Español</option>
                      <option value="fr-FR">Français</option>
                      <option value="de-DE">Deutsch</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date Format</Form.Label>
                    <Form.Select
                      value={settings?.dateFormat ?? 'MM/DD/YYYY'}
                      onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Week Starts On</Form.Label>
                    <Form.Select
                      value={settings?.weekStartDay ?? 'sunday'}
                      onChange={(e) => updateSetting('weekStartDay', e.target.value)}
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Number Format</Form.Label>
                    <Form.Select
                      value={settings?.numberFormat ?? 'comma'}
                      onChange={(e) => updateSetting('numberFormat', e.target.value)}
                    >
                      <option value="comma">1,234.56</option>
                      <option value="dot">1.234,56</option>
                      <option value="space">1 234.56</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Privacy Settings</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="privacy-mode"
                    label="Privacy Mode"
                    checked={settings?.privacyMode ?? false}
                    onChange={(e) => updateSetting('privacyMode', e.target.checked)}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Notifications</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="notifications-enabled"
                    label="Enable Notifications"
                    checked={settings?.notificationsEnabled ?? false}
                    onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
                  />
                </Col>

                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="email-notifications"
                    label="Email Notifications"
                    checked={settings?.emailNotifications ?? false}
                    onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    disabled={!settings?.notificationsEnabled}
                  />
                </Col>

                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="auto-dismiss"
                    label="Auto-dismiss Notifications"
                    checked={settings?.autoDismissNotifications ?? true}
                    onChange={(e) => updateSetting('autoDismissNotifications', e.target.checked)}
                    disabled={!settings?.notificationsEnabled}
                  />
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Notification Position</Form.Label>
                    <Form.Select
                      value={settings?.notificationPosition ?? 'top-end'}
                      onChange={(e) => updateSetting('notificationPosition', e.target.value)}
                      disabled={!settings?.notificationsEnabled}
                    >
                      <option value="top-start">Top Left</option>
                      <option value="top-end">Top Right</option>
                      <option value="bottom-start">Bottom Left</option>
                      <option value="bottom-end">Bottom Right</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Auto-dismiss Delay (seconds)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="30"
                      value={(settings?.notificationDismissDelay ?? 5000) / 1000}
                      onChange={(e) => updateSetting('notificationDismissDelay', Number(e.target.value) * 1000)}
                      disabled={!settings?.notificationsEnabled || !settings?.autoDismissNotifications}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Backup & Restore</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Backup Frequency</Form.Label>
                <Form.Select
                  value={settings?.backupFrequency ?? 'weekly'}
                  onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="primary" onClick={handleExport}>
                  Export Settings
                </Button>
                
                <Form.Group>
                  <Form.Label>Import Settings</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                  />
                </Form.Group>

                <Button variant="danger" onClick={handleReset}>
                  Reset to Default
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Budget Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label>
                  Budget Alert Threshold (%)
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="100"
                  value={settings?.budgetAlertThreshold ?? 80}
                  onChange={(e) => 
                    updateSetting('budgetAlertThreshold', Number(e.target.value))
                  }
                />
                <Form.Text className="text-muted">
                  Get alerts when spending reaches this percentage of budget
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserPreferencesForm;