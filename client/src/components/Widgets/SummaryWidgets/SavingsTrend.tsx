import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface SavingsTrendProps {
  data: {
    date: string;
    savings: number;
  }[];
  targetSavings: number;
  currentSavings: number;
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
}

const SavingsTrend: React.FC<SavingsTrendProps> = ({
  data,
  targetSavings,
  currentSavings,
  loading = false,
  height = 300,
  showLegend = true
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();
  const progressPercentage = Math.min((currentSavings / targetSavings) * 100, 100);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`custom-tooltip theme-${settings?.theme ?? 'light'} p-2 rounded border`}>
          <p className="mb-1">{label}</p>
          <p className="mb-0">
            Savings: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <BaseWidget title="Savings Progress" loading={loading}>
      <div className={`savings-trend theme-${settings?.theme ?? 'light'}`}>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>Target: {formatCurrency(targetSavings)}</span>
            <span>Current: {formatCurrency(currentSavings)}</span>
          </div>
          <ProgressBar
            now={progressPercentage}
            variant={progressPercentage >= 100 ? 'success' : 'primary'}
            label={`${progressPercentage.toFixed(1)}%`}
          />
        </div>

        <div style={{ height }}>
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
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#0d6efd"
                strokeWidth={2}
                dot={{ fill: '#0d6efd', r: 4 }}
                activeDot={{ r: 6 }}
              />
              {showLegend && (
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#6c757d"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  name="Target"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </BaseWidget>
  );
};

export default SavingsTrend;
