import React, { useMemo } from 'react';
import { WidgetProps, Category } from '../../../common/types';

interface CategoryExpense {
  categoryId: number;
  amount: number;
}

interface CategoryComparison {
  category: Category;
  currentAmount: number;
  previousAmount: number;
  change: number;
}

interface CategoryComparisonProps extends WidgetProps {
  currentPeriodExpenses: CategoryExpense[];
  previousPeriodExpenses: CategoryExpense[];
  categories: Category[];
  currency: string;
}

const CategoryComparison: React.FC<CategoryComparisonProps> = ({
  currentPeriodExpenses,
  previousPeriodExpenses,
  categories,
  currency,
  loading
}) => {
  const comparisonData = useMemo(() => {
    return categories
      .map(category => {
        const currentAmount = currentPeriodExpenses
          .filter(e => e.categoryId === category.id)
          .reduce((sum, e) => sum + Math.abs(e.amount), 0);

        const previousAmount = previousPeriodExpenses
          .filter(e => e.categoryId === category.id)
          .reduce((sum, e) => sum + Math.abs(e.amount), 0);

        const change = previousAmount === 0
          ? currentAmount === 0 ? 0 : 100
          : ((currentAmount - previousAmount) / previousAmount) * 100;

        return {
          category,
          currentAmount,
          previousAmount,
          change
        };
      })
      .filter(item => item.currentAmount > 0 || item.previousAmount > 0)
      .sort((a, b) => b.currentAmount - a.currentAmount);
  }, [currentPeriodExpenses, previousPeriodExpenses, categories]);

  if (loading) {
    return (
      <div className="placeholder-glow">
        <span className="placeholder col-12" style={{ height: '200px' }}></span>
      </div>
    );
  }

  return (
    <div className="category-comparison">
      {comparisonData.map((item, index) => (
        <div key={index} className="mb-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="category-color"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: item.category.color
                  }}
                />
                <span>{item.category.name}</span>
              </div>
              <div className="mt-1">
                <small className="text-muted">
                  {currency}{item.currentAmount.toFixed(2)}
                </small>
                {item.previousAmount > 0 && (
                  <small className="text-muted ms-2">
                    vs {currency}{item.previousAmount.toFixed(2)}
                  </small>
                )}
              </div>
            </div>
            {item.previousAmount > 0 && (
              <span className={`badge ${item.change > 0 ? 'text-danger' : 'text-success'}`}>
                {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className="progress-bar"
              style={{
                width: `${(item.currentAmount / comparisonData[0].currentAmount) * 100}%`,
                backgroundColor: item.category.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryComparison;