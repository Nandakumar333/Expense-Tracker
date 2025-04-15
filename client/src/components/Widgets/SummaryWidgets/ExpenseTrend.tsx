import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../../common/types';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface ExpenseTrendProps {
  transactions: Transaction[];
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
  currency: string;
  data: {
    date: string;
    income: number;
    expenses: number;
  }[];
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
      return (
        <div className={`custom-tooltip theme-${settings?.theme ?? 'light'} p-2 rounded border`}>
          <p className="mb-1">{label}</p>
          <p className="mb-1 text-success">
            Income: {formatCurrency(payload[0].value)}
          </p>
          <p className="mb-0 text-danger">
            Expenses: {formatCurrency(Math.abs(payload[1].value))}
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
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <YAxis
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ color: 'var(--text-primary)' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="income"
              stroke="#28a745"
              name="Income"
              strokeWidth={2}
              dot={{ fill: '#28a745', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#dc3545"
              name="Expenses"
              strokeWidth={2}
              dot={{ fill: '#dc3545', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
};

export default ExpenseTrend;
