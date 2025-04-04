export interface Category {
  type: any;
  color: any;
  id: number;
  name: string;
}

export type CategoryType = 'expense' | 'income' | 'transfer';

export interface TransactionForm {
  type: string;
  amount: number;
  categoryId: number;
  accountId: number;
  description: string;
  date: string;
}

export interface TransferForm {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description: string;
  date: string;
}

export interface CategoryForm {
    id?: number;
    name: string;
    type: CategoryType;
    color: string;
}

export interface CategoryListProps {
    categories: Category[]; 
    onAdd: () => void;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
  }

export interface CategoriesProps {
    categories: Category[];
    onAddCategory: (newCategory: Omit<Category, "id">) => void;
    onClose: () => void;
  }

export interface CategoryFormProps {
    category?: CategoryForm;
    onSubmit: (data: CategoryForm) => void;
    onClose: () => void;
  }
  

export interface Account {
    id: number;
    name: string;
    balance: number;
  }
  
export interface Transaction {
    id: number;
    description: string;
    amount: number;
    categoryId: number;
    categoryName: string;
    accountId: number;
    accountName: string;
    date: string;
    type: CategoryType;
  }

export interface Budget {
  id: number;
  categoryId: number;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
}

export interface WidgetProps {
  data: any[];
  currency: string;
  loading: boolean;
  showLegend: boolean;
  height: number;
  transactions?: Transaction[];
  accounts?: Account[];
  title?: string;
  categoryExpense?: any[];
}

export interface ExpenseData {
  amount: number;
  date: string;
  category: string;
  paymentMethod: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  merchant?: string;
}

export interface BudgetData {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
}

export interface TrendData {
  label: string;
  value: number;
}

export interface DashboardSummary {
  yearlyExpense: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
}

export interface CategoryExpense {
  categoryId: number;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface UpcomingBill {
  id: number;
  categoryId: number;
  description: string;
  amount: number;
  dueDate: string;
}

export interface BudgetAlert {
  currentSpending: any;
  amount: any;
  category: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AlertData {
  actual: number;
  budget: number;
  category: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface BudgetSpending {
  amount: any;
  category: string;
  spent: number;
  total: number;
  percentage: number;
  categoryId: number;
}

export interface AccountSummary {
  id: number;
  name: string;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netFlow: number;
}

export interface CategoryDistribution {
  id: number;
  name: string;
  color: string;
  amount: number;
  count: number;
  type: string;
}

export interface WidgetData {
  expenseTrends: any;
  yearlyTrends: any;
  budgetData: BudgetData[];
  overBudgetAlerts: AlertData[];
  categoryExpenses: CategoryExpense[];
  monthlyTrends: MonthlyTrend[];
  savingsTarget: number;
  upcomingBills: UpcomingBill[];
  alerts: BudgetAlert[];
  budgetSpending: BudgetSpending[];
  accountSummary: AccountSummary[];
  categoryDistribution: CategoryDistribution[];
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
}
