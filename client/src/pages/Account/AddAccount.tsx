import React, { useState } from 'react';
import { Modal, Form, Button, InputGroup } from 'react-bootstrap';

interface AddAccountProps {
  onAdd: (data: { name: string; balance: number }) => void;
  onClose: () => void;
}

const AddAccount: React.FC<AddAccountProps> = ({ onAdd, onClose }) => {
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
    <Modal show centered backdrop="static" onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Account</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Account Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Main Account"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Initial Balance</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                value={formData.balance}
                onChange={e => setFormData({ ...formData, balance: e.target.value })}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Account
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddAccount;
