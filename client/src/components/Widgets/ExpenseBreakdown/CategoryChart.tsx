import React from 'react';
import { WidgetProps } from '../../../common/types';

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface CategoryChartProps extends WidgetProps {
  data: CategoryData[];
  currency: string;
  title: string;
}

const CategoryChart: React.FC<CategoryChartProps> = ({
  data,
  currency,
  loading,
  title
}) => {
  return (
    <div className="h-100 d-flex flex-column">
      {title && <h6 className="text-muted mb-3">{title}</h6>}
      <div className="flex-grow-1">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center h-100 text-muted">
            No data available
          </div>
        ) : (
          <div className="category-breakdown">
            {data.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center">
                    <div
                      className="color-dot me-2"
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: item.color
                      }}
                    ></div>
                    <span className="text-truncate" style={{ maxWidth: '120px' }}>
                      {item.name}
                    </span>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">
                      {currency}{item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
                    </small>
                  </div>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;
