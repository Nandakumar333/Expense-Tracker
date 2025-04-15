import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

interface LoadingStateProps {
  rows?: number;
  height?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ rows = 3, height }) => {
  return (
    <Card className="border-0 shadow-sm h-100" style={{ height }}>
      <Card.Body>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
        {Array.from({ length: rows }).map((_, idx) => (
          <Placeholder key={idx} as="p" animation="glow" className="mb-2">
            <Placeholder xs={12} />
          </Placeholder>
        ))}
      </Card.Body>
    </Card>
  );
};

export default LoadingState;