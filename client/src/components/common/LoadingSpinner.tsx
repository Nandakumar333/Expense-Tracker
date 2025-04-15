import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'md',
  message = 'Loading...'
}) => {
  const { settings } = useUnifiedSettings();

  const spinnerSize = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  }[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: settings?.theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      zIndex: 9999
    })
  };

  return (
    <div 
      className={`loading-spinner theme-${settings?.theme ?? 'light'}`}
      style={containerStyle}
    >
      <Spinner
        animation="border"
        variant="primary"
        style={{ width: spinnerSize, height: spinnerSize }}
      />
      {message && (
        <div className="text-center">
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;