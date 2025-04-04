import React from 'react';
import { WidgetProps } from '../../../common/types';

interface BillData {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  status: 'upcoming' | 'overdue' | 'paid';
}

interface UpcomingBillsProps extends WidgetProps {
  bills: BillData[];
  currency: string;
}

const UpcomingBills: React.FC<UpcomingBillsProps> = ({ bills, currency, loading }) => {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h6 className="card-title text-muted mb-3">
          <i className="bi bi-calendar me-2"></i>
          Upcoming Bills
        </h6>
        {loading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
          </div>
        ) : (
          <div className="bills-list">
            {bills.map(bill => (
              <div key={bill.id} className="bill-item p-2 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{bill.name}</h6>
                    <small className="text-muted d-block">Due: {new Date(bill.dueDate).toLocaleDateString()}</small>
                  </div>
                  <div className="text-end">
                    <span className="fw-bold">{currency}{bill.amount}</span>
                    <span className={`badge ms-2 ${
                      bill.status === 'overdue' ? 'bg-danger' :
                      bill.status === 'paid' ? 'bg-success' : 'bg-warning'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingBills;
