import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Transaction, Account, Category, TransactionForm, TransferForm } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface TransactionModalProps {
  show: boolean;
  mode: 'add' | 'edit';
  accounts: Account[];
  categories: Category[];
  onTransaction: (data: TransactionForm) => void;
  onTransfer: (data: TransferForm) => void;
  onClose: () => void;
  selectedTransaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  show,
  mode,
  accounts,
  categories,
  onTransaction,
  onTransfer,
  onClose,
  selectedTransaction
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();
  const [isTransfer, setIsTransfer] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    toAccountId: ''
  });

  useEffect(() => {
    if (selectedTransaction && mode === 'edit') {
      setFormData({
        description: selectedTransaction.description,
        amount: Math.abs(selectedTransaction.amount).toString(),
        categoryId: selectedTransaction.categoryId.toString(),
        accountId: selectedTransaction.accountId.toString(),
        date: selectedTransaction.date,
        type: selectedTransaction.type,
        toAccountId: ''
      });
    }
  }, [selectedTransaction, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isTransfer) {
      onTransfer({
        fromAccountId: Number(formData.accountId),
        toAccountId: Number(formData.toAccountId),
        amount: Number(formData.amount),
        description: formData.description,
        date: formData.date
      });
    } else {
      onTransaction({
        description: formData.description,
        amount: Number(formData.amount),
        categoryId: Number(formData.categoryId),
        accountId: Number(formData.accountId),
        date: formData.date,
        type: formData.type as 'income' | 'expense'
      });
    }
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered className={`theme-${settings?.theme ?? 'light'}`}>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'edit' ? 'Edit Transaction' : (isTransfer ? 'Transfer Money' : 'Add Transaction')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {!isTransfer && (
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Expense"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Income"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount ({settings?.currency})</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>{isTransfer ? 'From Account' : 'Account'}</Form.Label>
                <Form.Select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {isTransfer ? (
              <Col>
                <Form.Group>
                  <Form.Label>To Account</Form.Label>
                  <Form.Select
                    value={formData.toAccountId}
                    onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts
                      .filter(account => account.id.toString() !== formData.accountId)
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({formatCurrency(account.balance)})
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            ) : (
              <Col>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter(category => category.type === formData.type)
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </Form.Group>

          {mode === 'add' && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="This is a transfer between accounts"
                checked={isTransfer}
                onChange={(e) => setIsTransfer(e.target.checked)}
              />
            </Form.Group>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {mode === 'edit' ? 'Update' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TransactionModal;
