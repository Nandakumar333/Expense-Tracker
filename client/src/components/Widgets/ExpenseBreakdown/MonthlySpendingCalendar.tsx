import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { WidgetProps, Transaction } from '../../../common/types';

interface MonthlySpendingCalendarProps extends WidgetProps {
  transactions: Transaction[];
  onDayClick: (date: string) => void;
}

const MonthlySpendingCalendar: React.FC<MonthlySpendingCalendarProps> = ({
  transactions,
  currency,
  loading,
  onDayClick
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDailySpending = () => {
    const spending: { [key: string]: number } = {};
    transactions.forEach(transaction => {
      const date = transaction.date.split('T')[0];
      if (transaction.type === 'expense') {
        spending[date] = (spending[date] || 0) + Math.abs(transaction.amount);
      }
    });
    return spending;
  };

  const getSpendingIntensity = (amount: number) => {
    if (amount === 0) return 'bg-light';
    if (amount < 50) return 'bg-success bg-opacity-25';
    if (amount < 100) return 'bg-success bg-opacity-50';
    if (amount < 200) return 'bg-warning bg-opacity-50';
    return 'bg-danger bg-opacity-50';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const dailySpending = getDailySpending();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        .toISOString()
        .split('T')[0];
      const spending = dailySpending[date] || 0;

      days.push(
        <div
          key={day}
          className={`calendar-day ${getSpendingIntensity(spending)} cursor-pointer`}
          onClick={() => onDayClick(date)}
        >
          <div className="day-number">{day}</div>
          {spending > 0 && (
            <small className="spending-amount">
              {currency}{spending.toFixed(0)}
            </small>
          )}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm mt-4">
        <Card.Body>
          <div className="placeholder-glow">
            <span className="placeholder col-12" style={{ height: '300px' }}></span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm mt-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="text-muted mb-0">Daily Spending Calendar</h6>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => navigateMonth('prev')}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button className="btn btn-sm btn-outline-secondary" disabled>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => navigateMonth('next')}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>

        <div className="mt-3 d-flex justify-content-end gap-3">
          <div className="d-flex align-items-center">
            <div className="legend-color bg-success bg-opacity-25 me-2"></div>
            <small className="text-muted">Low</small>
          </div>
          <div className="d-flex align-items-center">
            <div className="legend-color bg-success bg-opacity-50 me-2"></div>
            <small className="text-muted">Medium</small>
          </div>
          <div className="d-flex align-items-center">
            <div className="legend-color bg-warning bg-opacity-50 me-2"></div>
            <small className="text-muted">High</small>
          </div>
          <div className="d-flex align-items-center">
            <div className="legend-color bg-danger bg-opacity-50 me-2"></div>
            <small className="text-muted">Very High</small>
          </div>
        </div>
      </Card.Body>

      <style>{`
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .calendar-header {
          text-align: center;
          font-size: 0.8rem;
          color: #6c757d;
          padding: 8px 0;
        }
        .calendar-day {
          aspect-ratio: 1;
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .calendar-day:hover {
          transform: scale(1.05);
        }
        .day-number {
          font-size: 0.9rem;
          font-weight: 500;
        }
        .spending-amount {
          font-size: 0.7rem;
          color: #666;
        }
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }
      `}</style>
    </Card>
  );
};

export default MonthlySpendingCalendar;