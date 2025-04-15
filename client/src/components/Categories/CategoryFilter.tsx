import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

interface CategoryFilterProps {
  filter: 'income' | 'expense' | 'all';
  onFilterChange: (value: 'income' | 'expense' | 'all') => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ filter, onFilterChange }) => {
  return (
    <ButtonGroup>
      <Button
        variant={filter === 'all' ? 'primary' : 'outline-primary'}
        onClick={() => onFilterChange('all')}
      >
        All
      </Button>
      <Button
        variant={filter === 'income' ? 'primary' : 'outline-primary'}
        onClick={() => onFilterChange('income')}
      >
        Income
      </Button>
      <Button
        variant={filter === 'expense' ? 'primary' : 'outline-primary'}
        onClick={() => onFilterChange('expense')}
      >
        Expense
      </Button>
    </ButtonGroup>
  );
};

export default CategoryFilter;
