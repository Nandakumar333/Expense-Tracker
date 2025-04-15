import React from 'react';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';

interface Bill {
  id: string;
  name: string;
  dueDate: string;
}

interface UpcomingBillsProps {
  bills: Bill[];
  className?: string;
}

const UpcomingBills: React.FC<UpcomingBillsProps> = ({ bills, className }) => {
  const { settings, formatDate } = useUnifiedSettings();

  return (
    <div className={`upcoming-bills ${className || ''}`}>
      {bills.map((bill) => (
        <div key={bill.id} className="bill-item">
          <div className="bill-info">
            <span className="bill-name">{bill.name}</span>
            <span className="bill-date">{formatDate(bill.dueDate, settings?.dateFormat)}</span>
          </div>
          {/* ...existing code... */}
        </div>
      ))}
    </div>
  );
};

export default UpcomingBills;