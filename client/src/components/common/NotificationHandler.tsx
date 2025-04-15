import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  amount?: number;
  date?: string;
}

interface NotificationHandlerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({ 
  notifications, 
  onDismiss 
}) => {
  const { settings, formatCurrency, formatDate } = useUnifiedSettings();
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setActiveNotifications(notifications);
  }, [notifications]);

  const getVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'light';
    }
  };

  const formatMessage = (notification: Notification) => {
    let message = notification.message;

    // Replace any amount placeholders with formatted amounts
    if (notification.amount !== undefined) {
      message = message.replace('{amount}', formatCurrency(notification.amount));
    }

    // Replace any date placeholders with formatted dates
    if (notification.date) {
      message = message.replace('{date}', formatDate(notification.date, 'date'));
    }

    return message;
  };

  return (
    <ToastContainer 
      className={`notification-container theme-${settings?.theme ?? 'light'} p-3`} 
      position="bottom-end"
    >
      {activeNotifications.map(notification => (
        <Toast
          key={notification.id}
          bg={getVariant(notification.type)}
          onClose={() => onDismiss(notification.id)}
          show={true}
          delay={5000}
          autohide
        >
          <Toast.Header closeButton>
            <i className={`bi bi-${notification.type === 'error' ? 'exclamation-circle' : 
              notification.type === 'warning' ? 'exclamation-triangle' :
              notification.type === 'success' ? 'check-circle' : 
              'info-circle'} me-2`}
            />
            <strong className="me-auto">
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </strong>
            <small className="text-muted">
              {formatDate(notification.timestamp.toISOString(), 'time')}
            </small>
          </Toast.Header>
          <Toast.Body className={notification.type === 'error' ? 'text-white' : ''}>
            {formatMessage(notification)}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationHandler;