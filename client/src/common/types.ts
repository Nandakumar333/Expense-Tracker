export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  parentId?: number | null;
  path?: string;
  level?: number;
  children?: Category[];
  description?: string;
  icon?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryType = 'expense' | 'income' | 'transfer';

export interface TransactionForm {
  type: string;
  categoryId: string | number;
  accountId: string | number;
  amount: number;
  description?: string;
  date?: string;
}

export interface TransferForm {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description: string;
  date: string;
}

export interface CategoryForm {
  type: 'income' | 'expense';
  name: string;
  description?: string;
  color: string;
  icon: string;
  parentId: number | null;
}

export interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
  parentId?: number | null;
  description?: string;
  icon?: string;
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
  rollover: boolean;
  description: string;
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
  totalSavings: number;
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
  currentSpending: number;
  amount: number;
  category: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AlertData {
  spent: number;
  actual: number;
  budget: number;
  category: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface BudgetSpending {
  amount: number;
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
  expenseTrends: Array<{
    date: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  yearlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  budgetData: Array<{
    categoryId: number;
    category: string;
    budgeted: number;
    spent: number;
    percentageUsed: number;
    color?: string;
  }>;
  overBudgetAlerts: Array<{
    category: string;
    currentSpending: number;
    amount: number;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  categoryExpenses: Array<{
    categoryId: number;
    amount: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expense: number;
    savings: number;
  }>;
  savingsTarget: number;
  upcomingBills: Array<{
    id: number;
    categoryId: number;
    description: string;
    amount: number;
    dueDate: string;
  }>;
  alerts: Array<{
    category: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  budgetSpending: Array<{
    categoryId: number;
    category: string;
    spent: number;
    total: number;
    percentage: number;
    color?: string;
  }>;
  accountSummary: Array<{
    id: number;
    name: string;
    balance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    netFlow: number;
  }>;
  categoryDistribution: Array<{
    id: number;
    name: string;
    color: string;
    amount: number;
    count: number;
    type: string;
    percentage: number;
  }>;
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export interface UserSettings {
  privacySettings: {};
  browserNotifications: boolean;
  version: string;
  lastModified: {};
  currency: string;
  language: string;
  theme: 'light' | 'dark';
  savingsGoal: number;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  budgetAlertThreshold: number;
  dateFormat: string;
  timeZone: string;
  weekStartDay: 'sunday' | 'monday';
  numberFormat: 'comma' | 'dot' | 'space';
  defaultTransactionType: 'expense' | 'income';
  dashboardRefreshRate: number;
  exportFormat: 'csv' | 'excel' | 'pdf' | 'json';
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  privacyMode: boolean;
  defaultAccount?: number;
  categorySortOrder: 'alphabetical' | 'mostUsed' | 'custom';
  expenseReminderDays: number;
  // Notification settings
  autoDismissNotifications: boolean;
  notificationDismissDelay: number;
  notificationPosition: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  keyboardShortcutsEnabled: boolean;
}

export interface SettingsUpdateRequest {
  setting: keyof UserSettings;
  value: any;
}

export type Settings = UserSettings;

export interface SettingsContextType {
  settings: UserSettings | null;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  exportSettings: () => void;
  importSettings: (file: File) => Promise<boolean>;
}
