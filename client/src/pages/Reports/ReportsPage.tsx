import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert, Button } from 'react-bootstrap';
import { Transaction, Category, Budget } from '../../common/types';
import { TransactionService } from '../../services/TransactionService';
import { useAuth } from '../../context/AuthContext';
import { DashboardService } from '../../services/DashboardService';
import ExpenseTrend from '../../components/Widgets/SummaryWidgets/ExpenseTrend';
import CategoryChart from '../../components/Widgets/ExpenseBreakdown/CategoryChart';
import BudgetSpending from '../../components/Widgets/BudgetSpending/BudgetSpending';
import BudgetUtilization from '../../components/Widgets/SummaryWidgets/BudgetUtilization';
import SavingsTrend from '../../components/Widgets/SummaryWidgets/SavingsTrend';
import ExpenseAnalytics from '../../components/Widgets/ExpenseBreakdown/ExpenseAnalytics';
import CategoryComparison from '../../components/Widgets/ExpenseBreakdown/CategoryComparison';
import MonthlySpendingCalendar from '../../components/Widgets/ExpenseBreakdown/MonthlySpendingCalendar';
import TransactionInsights from '../../components/Widgets/ExpenseBreakdown/TransactionInsights';
import { getBudgets } from '../../services/BudgetService';
import { CategoryService } from '../../services/CategoryService';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import BaseWidget from '../../components/Widgets/BaseWidget';

const ReportsPage: React.FC = () => {
  const { settings, formatCurrency, formatDate } = useUnifiedSettings();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [previousPeriodTransactions, setPreviousPeriodTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState<'expense' | 'income' | 'both'>('both');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transactionService = new TransactionService();
  const categoryService = new CategoryService();
  const dashboardService = new DashboardService();

  useEffect(() => {
    loadData();
  }, [dateRange, reportType]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Calculate previous period date range
      const currentStart = new Date(dateRange.startDate);
      const currentEnd = new Date(dateRange.endDate);
      const daysDiff = (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24);
      
      const previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - daysDiff);
      const previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);

      const [current, previous, categories, budgets] = await Promise.all([
        transactionService.getTransactions({
          startDate: currentStart,
          endDate: currentEnd,
          type: reportType === 'both' ? undefined : reportType
        }),
        transactionService.getTransactions({
          startDate: previousStart,
          endDate: previousEnd,
          type: reportType === 'both' ? undefined : reportType
        }),
        categoryService.getCategories(),
        getBudgets()
      ]);

      setTransactions(current);
      setPreviousPeriodTransactions(previous);
      setCategories(categories);
      setBudgets(budgets);
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const transformData = {
    expenses: (transactions: Transaction[]) => {
      return transactions.map(t => ({
        date: formatDate(t.date, settings?.dateFormat),
        income: t.type === 'income' ? t.amount : 0,
        expenses: t.type === 'expense' ? Math.abs(t.amount) : 0
      }));
    },

    categoryDistribution: (expenses: { categoryId: number; amount: number }[]) => {
      return expenses.map(expense => ({
        name: categories.find(c => c.id === expense.categoryId)?.name || 'Unknown',
        amount: expense.amount,
        percentage: (expense.amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100,
        color: categories.find(c => c.id === expense.categoryId)?.color || '#cccccc'
      }));
    },

    savingsTrend: (transactions: Transaction[]) => {
      return transactions.map(t => ({
        date: formatDate(t.date, settings?.dateFormat),
        savings: transactions
          .filter(trans => new Date(trans.date) <= new Date(t.date))
          .reduce((sum, trans) => sum + (trans.type === 'income' ? trans.amount : -trans.amount), 0)
      }));
    }
  };

  const calculateBudgetUtilization = () => {
    const periodStart = new Date(dateRange.startDate);
    const periodEnd = new Date(dateRange.endDate);
    const daysInPeriod = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
    const monthlyBudgets = budgets.filter(b => b.period === 'monthly');

    return monthlyBudgets.map(budget => {
      const categoryTransactions = transactions.filter(t => 
        t.categoryId === budget.categoryId && 
        t.type === 'expense'
      );
      const spent = Math.abs(categoryTransactions.reduce((sum, t) => sum + t.amount, 0));
      const adjustedBudget = (budget.amount / 30) * daysInPeriod;

      return {
        category: categories.find(c => c.id === budget.categoryId)?.name || 'Unknown',
        budgeted: adjustedBudget,
        spent: spent,
        percentageUsed: (spent / adjustedBudget) * 100,
        color: categories.find(c => c.id === budget.categoryId)?.color || '#000000'
      };
    });
  };

  const calculateSavingsTrend = () => {
    const periodStart = new Date(dateRange.startDate);
    const periodEnd = new Date(dateRange.endDate);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const savingsTarget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const currentSavings = totalIncome - totalExpenses;

    return {
      currentSavings,
      savingsTarget,
      periodStart,
      periodEnd
    };
  };

  const calculateCategoryExpenses = (transactions: Transaction[]): { categoryId: number; amount: number }[] => {
    const expenses: { [key: number]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expenses[t.categoryId] = (expenses[t.categoryId] || 0) + Math.abs(t.amount);
      });
    
    return Object.entries(expenses).map(([categoryId, amount]) => ({
      categoryId: Number(categoryId),
      amount
    }));
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    // You could add additional functionality here, like showing a modal with that day's transactions
  };

  const currentPeriodExpenses = calculateCategoryExpenses(transactions);
  const previousPeriodExpenses = calculateCategoryExpenses(previousPeriodTransactions);

  const currency = settings?.currency ?? 'USD';

  return (
    <Container fluid className={`py-4 theme-${settings?.theme ?? 'light'}`}>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      <div className="report-header mb-4">
        <div className="d-flex justify-cont
        ent-between align-items-center mb-3">
          <h4 className="mb-0">Financial Reports</h4>
          <Button variant="outline-primary" onClick={loadData}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh Data
          </Button>
        </div>

        <BaseWidget title="Report Filters" className="mb-4 fade-in">
          <div className="report-filters p-3">
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small">Date Range</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="date"
                      size="sm"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <Form.Control
                      type="date"
                      size="sm"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="text-muted small">Report Type</Form.Label>
                  <Form.Select
                    size="sm"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as 'expense' | 'income' | 'both')}
                  >
                    <option value="both">Income & Expenses</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="text-muted small">Group By</Form.Label>
                  <Form.Select
                    size="sm"
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={loadData}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Loading...
                    </>
                  ) : (
                    <>Apply Filters</>
                  )}
                </Button>
              </Col>
            </Row>
          </div>
        </BaseWidget>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Loading report data...</p>
        </div>
      ) : (
        <div className="report-content">
          <Row className="g-4 mb-4">
            <Col xs={12}>
              <BaseWidget title="Overview Analytics">
                <div className="widget-content">
                  <ExpenseAnalytics
                    transactions={transactions}
                    previousPeriodTransactions={previousPeriodTransactions}
                    dateRange={dateRange}
                    currency={currency}
                    loading={isLoading}
                    data={transformData.expenses(transactions)}
                    showLegend={true}
                    height={350}
                    categoryExpense={currentPeriodExpenses}
                  />
                </div>
              </BaseWidget>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Row className="g-4">
                <Col xs={12}>
                  <BaseWidget title="Expense Trends">
                    <div className="widget-content widget-chart">
                      <ExpenseTrend
                        transactions={transactions}
                        currency={currency}
                        loading={isLoading}
                        height={300}
                        showLegend={true}
                        data={transformData.expenses(transactions)}
                      />
                    </div>
                  </BaseWidget>
                </Col>
                <Col xs={12}>
                  <BaseWidget title="Monthly Calendar View">
                    <div className="widget-content">
                      <MonthlySpendingCalendar
                        transactions={transactions}
                        currency={currency}
                        loading={isLoading}
                        onDayClick={handleDayClick}
                        data={[]}
                        showLegend={true}
                        height={400}
                        categoryExpense={[]}
                      />
                    </div>
                  </BaseWidget>
                </Col>
              </Row>
            </Col>

            <Col lg={4}>
              <Row className="g-4">
                <Col xs={12}>
                  <BaseWidget title="Quick Insights">
                    <div className="widget-content widget-insights">
                      <TransactionInsights
                        transactions={transactions}
                        categories={categories}
                        dateRange={dateRange}
                        currency={currency}
                        loading={isLoading}
                        data={[]}
                        showLegend={false}
                        height={350}
                        categoryExpense={[]}
                      />
                    </div>
                  </BaseWidget>
                </Col>
                <Col xs={12}>
                  <BaseWidget title="Category Distribution">
                    <div className="widget-content widget-chart">
                      <CategoryChart
                        data={transformData.categoryDistribution(currentPeriodExpenses)}
                        loading={isLoading}
                        showLegend={true}
                        height={300}
                        title=""
                      />
                    </div>
                  </BaseWidget>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={6}>
              <BaseWidget title="Period Comparison">
                <div className="widget-content">
                  <CategoryComparison
                    currentPeriodExpenses={currentPeriodExpenses}
                    previousPeriodExpenses={previousPeriodExpenses}
                    categories={categories}
                    currency={currency}
                    loading={isLoading}
                    data={[]}
                    showLegend={false}
                    height={350}
                    categoryExpense={[]}
                  />
                </div>
              </BaseWidget>
            </Col>

            <Col lg={6}>
              <Row className="g-4">
                <Col xs={12}>
                  <BaseWidget title="Savings & Budget">
                    <div className="widget-content widget-chart">
                      <SavingsTrend
                        data={transformData.savingsTrend(transactions)}
                        targetSavings={budgets.reduce((sum, budget) => sum + budget.amount, 0)}
                        currentSavings={transactions.reduce((sum, t) => 
                          sum + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0)}
                        loading={isLoading}
                        height={300}
                        showLegend={true}
                      />
                    </div>
                  </BaseWidget>
                </Col>
                <Col xs={12}>
                  <BaseWidget title="Budget Utilization">
                    <div className="widget-content">
                      <BudgetUtilization
                        budgetData={calculateBudgetUtilization()}
                        currency={currency}
                        loading={isLoading}
                        data={[]}
                        showLegend={true}
                        height={250}
                        categoryExpense={[]}
                      />
                    </div>
                  </BaseWidget>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
};

export default ReportsPage;