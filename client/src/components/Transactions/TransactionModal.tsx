import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Nav, InputGroup } from 'react-bootstrap';
import { Transaction, Account, Category, TransactionForm, TransferForm } from '../../common/types';

interface TransactionModalProps {
  show: boolean;
  mode: 'add' | 'edit' | null;
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
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income' | 'transfer',
    accountId: '',
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    fromAccountId: '',
    toAccountId: ''
  });

  useEffect(() => {
    if (selectedTransaction) {
      setFormData({
        type: selectedTransaction.type,
        accountId: selectedTransaction.accountId.toString(),
        categoryId: selectedTransaction.categoryId.toString(),
        amount: Math.abs(selectedTransaction.amount).toString(),
        description: selectedTransaction.description,
        date: selectedTransaction.date,
        fromAccountId: '',
        toAccountId: ''
      });
      setActiveTab(selectedTransaction.type as 'expense' | 'income' | 'transfer');
    } else {
      // Reset form when opening new transaction
      setFormData({
        type: activeTab,
        accountId: '',
        categoryId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        fromAccountId: '',
        toAccountId: ''
      });
    }
  }, [selectedTransaction, activeTab]);

  const validateForm = () => {
    if (activeTab === 'transfer') {
      if (!formData.fromAccountId || !formData.toAccountId || !formData.amount) {
        setError('Please fill in all required fields');
        return false;
      }
      if (formData.fromAccountId === formData.toAccountId) {
        setError('Cannot transfer to the same account');
        return false;
      }
    } else {
      if (!formData.accountId || !formData.categoryId || !formData.amount) {
        setError('Please fill in all required fields');
        return false;
      }
    }
    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    try {
      if (activeTab === 'transfer') {
        onTransfer({
          fromAccountId: Number(formData.fromAccountId),
          toAccountId: Number(formData.toAccountId),
          amount: Number(formData.amount),
          description: formData.description || `Transfer between accounts`,
          date: formData.date
        });
      } else {
        onTransaction({
          type: activeTab,
          accountId: Number(formData.accountId),
          categoryId: Number(formData.categoryId),
          amount: Number(formData.amount),
          description: formData.description,
          date: formData.date
        });
      }
      onClose();
    } catch (err) {
      setError('Failed to process transaction');
    }
  };

  const handleTabChange = (tab: 'expense' | 'income' | 'transfer') => {
    setActiveTab(tab);
    setError(null);
    // Reset form but keep date
    setFormData(prev => ({
      ...prev,
      type: tab,
      accountId: '',
      categoryId: '',
      amount: '',
      description: '',
      fromAccountId: '',
      toAccountId: ''
    }));
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'edit' ? 'Edit Transaction' : 
           activeTab === 'transfer' ? 'Transfer Money' :
           `New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!mode?.includes('edit') && (
          <Nav variant="pills" className="mb-3" onSelect={(k) => handleTabChange(k as any)}>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'expense'}
                onClick={() => handleTabChange('expense')}
                className="text-danger"
              >
                <i className="bi bi-dash-circle me-2"></i>Expense
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'income'}
                onClick={() => handleTabChange('income')}
                className="text-success"
              >
                <i className="bi bi-plus-circle me-2"></i>Income
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'transfer'}
                onClick={() => handleTabChange('transfer')}
                className="text-info"
              >
                <i className="bi bi-arrow-left-right me-2"></i>Transfer
              </Nav.Link>
            </Nav.Item>
          </Nav>
        )}

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {activeTab === 'transfer' ? (
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>From Account</Form.Label>
                  <Form.Select
                    value={formData.fromAccountId}
                    onChange={e => setFormData({ ...formData, fromAccountId: e.target.value })}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>To Account</Form.Label>
                  <Form.Select
                    value={formData.toAccountId}
                    onChange={e => setFormData({ ...formData, toAccountId: e.target.value })}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          ) : (
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Account</Form.Label>
                  <Form.Select
                    value={formData.accountId}
                    onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter(category => category.type === activeTab)
                      .map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))
                    }
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row className="g-3 mt-2">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Amount</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {mode === 'edit' ? 'Update' : 'Save'} Transaction
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TransactionModal;
