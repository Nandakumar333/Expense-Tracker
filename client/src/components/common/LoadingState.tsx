import React from 'react';
import { Card } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface LoadingStateProps {
  height?: number;
  type?: 'chart' | 'list' | 'card';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  height = 200,
  type = 'card',
  className = ''
}) => {
  const { settings } = useUnifiedSettings();
  const theme = settings?.theme ?? 'light';

  const renderChartSkeleton = () => (
    <div className="d-flex flex-column h-100">
      <div className="placeholder-wave mb-3">
        <span className="placeholder col-4"></span>
      </div>
      <div className="flex-grow-1 d-flex align-items-end">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="loading-bar"
            style={{
              height: `${20 + Math.random() * 60}%`,
              width: '12%',
              marginRight: '4%',
              backgroundColor: 'var(--bs-secondary-bg)',
              borderRadius: '4px',
              animation: 'pulse 1.5s infinite'
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="d-flex flex-column gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="placeholder-wave d-flex align-items-center gap-3">
          <div
            className="placeholder rounded"
            style={{ width: '48px', height: '48px' }}
          />
          <div className="flex-grow-1">
            <div className="placeholder mb-1 col-7"></div>
            <div className="placeholder col-4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <div className="placeholder-wave d-flex flex-column gap-3">
      <div className="placeholder col-7"></div>
      <div className="placeholder col-5"></div>
      <div className="placeholder" style={{ height: '100px' }}></div>
      <div className="d-flex gap-2">
        <div className="placeholder col-3"></div>
        <div className="placeholder col-3"></div>
      </div>
    </div>
  );

  return (
    <Card 
      className={`border-0 shadow-sm loading-state theme-${theme} ${className}`}
      style={{ height }}
    >
      <Card.Body>
        {type === 'chart' && renderChartSkeleton()}
        {type === 'list' && renderListSkeleton()}
        {type === 'card' && renderCardSkeleton()}
      </Card.Body>
      <style>
        {`
          .loading-state {
            background: var(--bs-body-bg);
          }

          .loading-state .placeholder {
            background-color: var(--bs-secondary-bg);
          }

          @keyframes pulse {
            0% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.6;
            }
          }

          .loading-bar {
            animation: loading-animation 1.5s infinite;
          }

          @keyframes loading-animation {
            0% {
              opacity: 0.6;
              transform: scaleY(1);
            }
            50% {
              opacity: 1;
              transform: scaleY(1.1);
            }
            100% {
              opacity: 0.6;
              transform: scaleY(1);
            }
          }

          .theme-dark .loading-state {
            background: var(--bs-dark);
          }

          .theme-dark .placeholder {
            background-color: var(--bs-gray-700);
          }
        `}
      </style>
    </Card>
  );
};

export default LoadingState;