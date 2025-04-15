import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';
import PrivacyFilter from '../../common/PrivacyFilter';

interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  isRecurring: boolean;
  status: 'upcoming' | 'overdue' | 'paid';
  category: string;
}

interface UpcomingBillsProps {
  bills: Bill[];
  loading?: boolean;
}

const UpcomingBills: React.FC<UpcomingBillsProps> = ({ bills, loading = false }) => {
  const { settings, formatCurrency, formatDate } = useUnifiedSettings();

  const getBadgeVariant = (status: Bill['status']) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'overdue':
        return 'danger';
      case 'upcoming':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <BaseWidget title="Upcoming Bills" loading={loading}>
      <div className={`upcoming-bills theme-${settings?.theme ?? 'light'}`}>
        <Table hover className="mb-0">
          <thead>
            <tr>
              <th>Due Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="text-end">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bills.length > 0 ? (
              bills.map(bill => (
                <tr key={bill.id}>
                  <td>{formatDate(bill.dueDate)}</td>
                  <td>
                    <PrivacyFilter type="note" showToggle>
                      {bill.name}
                      {bill.isRecurring && (
                        <i className="bi bi-arrow-repeat ms-2" title="Recurring"></i>
                      )}
                    </PrivacyFilter>
                  </td>
                  <td>{bill.category}</td>
                  <td className="text-end">
                    <PrivacyFilter type="amount" showToggle>
                      {formatCurrency(bill.amount)}
                    </PrivacyFilter>
                  </td>
                  <td>
                    <Badge bg={getBadgeVariant(bill.status)}>
                      {bill.status}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No upcoming bills
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </BaseWidget>
  );
};

export default UpcomingBills;
