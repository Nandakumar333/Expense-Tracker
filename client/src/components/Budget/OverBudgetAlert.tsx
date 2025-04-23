import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Budget, Category } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface OverBudgetAlertProps {
  budget: Budget;
  category: Category;
  currentSpending: number;
  onViewDetails: (budget: Budget) => void;
  onAdjustBudget: (budget: Budget) => void;
}

const OverBudgetAlert: React.FC<OverBudgetAlertProps> = ({
  budget,
  category,
  currentSpending,
  onViewDetails,
  onAdjustBudget
}) => {
  const { formatCurrency } = useUnifiedSettings();
  const overBudgetAmount = currentSpending - budget.amount;
  const percentOver = ((overBudgetAmount / budget.amount) * 100).toFixed(1);

  return (
    <Alert variant="danger" className="d-flex justify-content-between align-items-center mb-3">
      <div>
        <Alert.Heading className="h5 mb-1">Budget Exceeded for {category.name}</Alert.Heading>
        <p className="mb-0">
          You've spent {formatCurrency(currentSpending)} of your {formatCurrency(budget.amount)} budget
          ({percentOver}% over budget)
        </p>
      </div>
      <div className="d-flex gap-2">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onViewDetails(budget)}
        >
          View Details
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onAdjustBudget(budget)}
        >
          Adjust Budget
        </Button>
      </div>
    </Alert>
  );
};

export default OverBudgetAlert;