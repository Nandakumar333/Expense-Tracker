import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface CategoryExpense {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CategoryChartProps {
  title: string;
  data: CategoryExpense[];
  loading?: boolean;
  showLegend?: boolean;
  height?: number;
}

const CategoryChart: React.FC<CategoryChartProps> = ({
  title,
  data,
  loading = false,
  showLegend = true,
  height = 300
}) => {
  const { settings, formatCurrency, formatNumber } = useUnifiedSettings();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={`custom-tooltip theme-${settings?.theme ?? 'light'}`}>
          <p className="category">{item.name}</p>
          <p className="amount">{formatCurrency(item.amount)}</p>
          <p className="percentage">{item.percentage.toFixed(1)}%</p>
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
    percent,
    name
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className={`chart-label theme-${settings?.theme ?? 'light'}`}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  return (
    <BaseWidget title={title} loading={loading}>
      <div style={{ width: '100%', height: height || 300 }}>
        {data.length > 0 ? (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={height ? height * 0.4 : 120}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend
                  formatter={(value, entry: any) => (
                    <span className={`legend-item theme-${settings?.theme ?? 'light'}`}>
                      {value} ({formatCurrency(entry.payload.amount)})
                    </span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted py-5">
            No data available
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default CategoryChart;
