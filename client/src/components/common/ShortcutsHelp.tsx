import React, { useState } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

const ShortcutsHelp: React.FC = () => {
  const [show, setShow] = useState(false);
  const { settings } = useUnifiedSettings();

  const shortcuts = [
    { key: '/', description: 'Focus search' },
    { key: 'n', description: 'New transaction' },
    { key: 'c', description: 'New category' },
    { key: 'b', description: 'Manage budgets' },
    { key: 'a', description: 'Add account' },
    { key: 'f', description: 'Toggle filters' },
    { key: 'p', description: 'Toggle privacy mode' },
    { key: 'Esc', description: 'Close modal / Clear filters' },
    { key: '?', description: 'Show this help dialog' }
  ];

  return (
    <>
      <div
        className={`shortcuts-help-trigger theme-${settings?.theme ?? 'light'}`}
        onClick={() => setShow(true)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          zIndex: 1000
        }}
      >
        <i className="bi bi-question-lg" />
      </div>

      <Modal 
        show={show} 
        onHide={() => setShow(false)}
        centered
        className={`theme-${settings?.theme ?? 'light'}`}
      >
        <Modal.Header closeButton>
          <Modal.Title>Keyboard Shortcuts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table hover>
            <thead>
              <tr>
                <th>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map(({ key, description }) => (
                <tr key={key}>
                  <td>
                    <kbd>{key}</kbd>
                  </td>
                  <td>{description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShortcutsHelp;