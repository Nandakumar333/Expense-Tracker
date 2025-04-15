import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface AddAccountProps {
  onAdd: (data: { name: string; balance: number }) => void;
  onClose: () => void;
}

const AddAccount: React.FC<AddAccountProps> = ({ onAdd, onClose }) => {
  const { settings, formatCurrency } = useUnifiedSettings();
  const [formData, setFormData] = useState({
    name: '',
    balance: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      balance: Number(formData.balance)
    });
  };

  return (
    <Modal show onHide={onClose} centered className={`theme-${settings?.theme ?? 'light'}`}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Account Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Main Checking, Savings, Credit Card"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Initial Balance ({settings?.currency})</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0.00"
              required
            />
            <Form.Text className="text-muted">
              For credit cards, enter a negative balance if you owe money
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Account
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddAccount;