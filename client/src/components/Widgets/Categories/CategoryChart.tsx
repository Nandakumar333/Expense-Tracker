import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface CategoryChartProps {
  title: string;
  data: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
  categoryExpense: { categoryId: number; amount: number }[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({
  title,
  data,
  loading = false,
  height = 300,
  showLegend = true,
  categoryExpense
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`custom-tooltip theme-${settings?.theme ?? 'light'} p-2 rounded border`}>
          <p className="mb-1">{data.name}</p>
          <p className="mb-1">{formatCurrency(data.amount)}</p>
          <p className="mb-0">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for small segments

    return (
      <text
        x={x}
        y={y}
        fill="var(--text-primary)"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <BaseWidget title={title} loading={loading}>
      <div className={`category-chart theme-${settings?.theme ?? 'light'}`} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: 'var(--text-primary)' }}>
                    {value} ({formatCurrency(entry.payload.amount)})
                  </span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
};

export default CategoryChart;