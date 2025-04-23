import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface SavingsTrendProps {
  data: Array<{
    date: string;
    savings: number;
    target?: number;
  }>;
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
  const isOnTrack = currentSavings >= targetSavings;
  const theme = settings?.theme || 'light';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const savingsData = payload[0];
      const targetData = payload[1];
      return (
        <div className={`custom-tooltip theme-${theme} p-3 rounded border shadow-sm bg-body`}>
          <p className="mb-2 text-muted">{label}</p>
          <p className="mb-1 d-flex align-items-center">
            <i className="bi bi-piggy-bank me-2 text-primary"></i>
            Savings: {formatCurrency(savingsData.value)}
          </p>
          {targetData && (
            <p className="mb-0 d-flex align-items-center">
              <i className="bi bi-bullseye me-2 text-secondary"></i>
              Target: {formatCurrency(targetData.value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <BaseWidget title="Savings Progress" loading={loading}>
      <div className={`savings-trend theme-${theme}`}>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="text-muted">Current Progress</span>
              <h4 className="mb-0">{formatCurrency(currentSavings)}</h4>
            </div>
            <div className="text-end">
              <span className="text-muted">Target</span>
              <h4 className="mb-0">{formatCurrency(targetSavings)}</h4>
            </div>
          </div>
          <ProgressBar
            now={progressPercentage}
            variant={progressPercentage >= 100 ? 'success' : 'primary'}
            label={`${progressPercentage.toFixed(1)}%`}
            className="mb-2"
          />
          <small className={`d-block text-${isOnTrack ? 'success' : 'warning'}`}>
            <i className={`bi bi-${isOnTrack ? 'check-circle' : 'exclamation-circle'} me-1`}></i>
            {isOnTrack 
              ? 'You\'re meeting your savings target!' 
              : `${formatCurrency(targetSavings - currentSavings)} more to reach your target`}
          </small>
        </div>

        <div style={{ height: height - 100 }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color)" />
              <XAxis 
                dataKey="date"
                stroke="var(--bs-body-color)"
                tick={{ fill: 'var(--bs-body-color)' }}
              />
              <YAxis
                stroke="var(--bs-body-color)"
                tick={{ fill: 'var(--bs-body-color)' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="savings"
                name="Savings"
                stroke="#0d6efd"
                strokeWidth={2}
                dot={{ fill: '#0d6efd', r: 4 }}
                activeDot={{ r: 6, stroke: '#0d6efd', strokeWidth: 2 }}
                animationDuration={750}
                animationEasing="ease-in-out"
              />
              {showLegend && (
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="#6c757d"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={750}
                  animationEasing="ease-in-out"
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
