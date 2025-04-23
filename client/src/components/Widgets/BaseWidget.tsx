import React, { ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface BaseWidgetProps {
  title: string;
  children: ReactNode;
  loading?: boolean;
  action?: ReactNode;
  className?: string;
  height?: number;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({
  title,
  children,
  loading = false,
  action,
  className = '',
  height
}) => {
  const { settings } = useUnifiedSettings();

  const renderLoadingState = () => (
    <div className="placeholder-glow w-100" style={{ height: height || '100%' }}>
      <div className="d-flex flex-column gap-3">
        <span className="placeholder col-6"></span>
        <span className="placeholder col-12" style={{ height: '150px' }}></span>
      </div>
    </div>
  );

  return (
    <Card 
      className={`widget-card border-0 shadow-sm ${className} theme-${settings?.theme ?? 'light'}`}
      style={{ height: height ? `${height}px` : 'auto' }}
    >
      <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center py-3">
        <h6 className="mb-0 text-body-secondary fw-medium">
          {title}
        </h6>
        {action && <div className="widget-actions">{action}</div>}
      </Card.Header>
      <Card.Body className="pt-0">
        {loading ? renderLoadingState() : children}
      </Card.Body>
    </Card>
  );
};

export default BaseWidget;