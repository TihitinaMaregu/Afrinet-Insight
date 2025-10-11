import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

export function TrendChart({ data, metric = 'speed', title }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available for the selected filters
      </div>
    );
  }

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getMetricConfig = () => {
    switch (metric) {
      case 'speed':
        return {
          dataKey: 'avg_download_speed',
          label: 'Download Speed (Mbps)',
          color: '#3b82f6',
        };
      case 'latency':
        return {
          dataKey: 'avg_latency',
          label: 'Latency (ms)',
          color: '#f59e0b',
        };
      case 'packet_loss':
        return {
          dataKey: 'avg_packet_loss',
          label: 'Packet Loss (%)',
          color: '#ef4444',
        };
      default:
        return {
          dataKey: 'avg_download_speed',
          label: 'Download Speed (Mbps)',
          color: '#3b82f6',
        };
    }
  };

  const config = getMetricConfig();

  const formattedData = data.map(item => ({
    ...item,
    date: item.week,
    [config.dataKey]: metric === 'packet_loss' 
      ? (item[config.dataKey] * 100) 
      : item[config.dataKey],
  }));

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: config.label, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            labelFormatter={formatDate}
            formatter={(value) => [value?.toFixed(2), config.label]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            strokeWidth={2}
            dot={{ fill: config.color, r: 4 }}
            activeDot={{ r: 6 }}
            name={config.label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
