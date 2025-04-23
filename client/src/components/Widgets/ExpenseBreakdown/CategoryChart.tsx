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
  const { settings, formatCurrency } = useUnifiedSettings();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={`custom-tooltip theme-${settings?.theme ?? 'light'} p-3 rounded border shadow-sm bg-body`}>
          <p className="fw-medium mb-1">{item.name}</p>
          <p className="mb-1">{formatCurrency(item.amount)}</p>
          <p className="text-muted mb-0">{item.percentage.toFixed(1)}% of total</p>
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
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill={settings?.theme === 'dark' ? '#fff' : '#495057'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    );
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
                animationDuration={750}
                animationEasing="ease-in-out"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={entry.color} 
                    stroke={settings?.theme === 'dark' ? '#2b3035' : '#fff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry: any) => (
                    <span className={`legend-item theme-${settings?.theme ?? 'light'}`}>
                      {value} ({formatCurrency(entry.payload.amount)})
                    </span>
                  )}
                  wrapperStyle={{
                    paddingLeft: '20px',
                    maxHeight: '100%',
                    overflowY: 'auto'
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted py-5">
            No expense data available
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default CategoryChart;
