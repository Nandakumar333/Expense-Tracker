import React from 'react';
import { Card } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import LoadingState from '../common/LoadingState';

interface BaseWidgetProps {
  title: string;
  loading?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
  height?: number;
  className?: string;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({
  title,
  loading = false,
  children,
  action,
  height
}) => {
  const { settings } = useUnifiedSettings();

  return (
    <Card className={`widget h-100 border-0 shadow-sm theme-${settings?.theme ?? 'light'} transition-all`}>
      <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
        <Card.Title className="mb-0 h6">{title}</Card.Title>
        {action}
      </Card.Header>
      <Card.Body className="position-relative">
        {loading ? (
          <LoadingState rows={3} height={height} />
        ) : (
          children
        )}
      </Card.Body>
    </Card>
  );
};

export default BaseWidget;