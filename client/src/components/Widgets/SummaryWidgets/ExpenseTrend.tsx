import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../../common/types';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface ExpenseTrendProps {
  transactions: Transaction[];
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
  currency?: string;
  data: Array<{
    date: string;
    income: number;
    expenses: number;
  }>;
}

const ExpenseTrend: React.FC<ExpenseTrendProps> = ({
  loading = false,
  height = 300,
  showLegend = true,
  data
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload[0].value;
      const expenses = Math.abs(payload[1].value);
      const net = income - expenses;
      const percentDiff = expenses > 0 ? ((income - expenses) / expenses) * 100 : 0;

      return (
        <div className={`custom-tooltip theme-${settings?.theme ?? 'light'} p-3 rounded border shadow-sm bg-body`}>
          <p className="mb-2 text-muted">{label}</p>
          <p className="mb-1 text-success d-flex align-items-center">
            <i className="bi bi-arrow-up-short me-1"></i>
            Income: {formatCurrency(income)}
          </p>
          <p className="mb-1 text-danger d-flex align-items-center">
            <i className="bi bi-arrow-down-short me-1"></i>
            Expenses: {formatCurrency(expenses)}
          </p>
          <hr className="my-2" />
          <p className={`mb-0 d-flex align-items-center ${net >= 0 ? 'text-success' : 'text-danger'}`}>
            <i className={`bi bi-${net >= 0 ? 'plus' : 'dash'}-circle me-1`}></i>
            Net: {formatCurrency(Math.abs(net))}
            <small className="ms-2">({percentDiff.toFixed(1)}%)</small>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <BaseWidget title="Income vs Expenses" loading={loading}>
      <div className={`expense-trend theme-${settings?.theme ?? 'light'}`} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color)" opacity={0.5} />
            <XAxis 
              dataKey="date"
              stroke="var(--bs-body-color)"
              tick={{ fill: 'var(--bs-body-color)' }}
              tickLine={{ stroke: 'var(--bs-border-color)' }}
              axisLine={{ stroke: 'var(--bs-border-color)' }}
            />
            <YAxis
              stroke="var(--bs-body-color)"
              tick={{ fill: 'var(--bs-body-color)' }}
              tickLine={{ stroke: 'var(--bs-border-color)' }}
              axisLine={{ stroke: 'var(--bs-border-color)' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '20px' }}
                formatter={(value, entry: any) => (
                  <span style={{ color: 'var(--bs-body-color)', marginRight: '10px' }}>
                    {value}
                  </span>
                )}
              />
            )}
            <Line
              type="monotone"
              dataKey="income"
              stroke="#198754"
              name="Income"
              strokeWidth={2}
              dot={{ fill: '#198754', r: 4 }}
              activeDot={{ r: 6, stroke: '#198754', strokeWidth: 2 }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#dc3545"
              name="Expenses"
              strokeWidth={2}
              dot={{ fill: '#dc3545', r: 4 }}
              activeDot={{ r: 6, stroke: '#dc3545', strokeWidth: 2 }}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
};

export default ExpenseTrend;
