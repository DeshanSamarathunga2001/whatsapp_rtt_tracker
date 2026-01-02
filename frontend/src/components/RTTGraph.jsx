/**
 * RTTGraph Component
 * 
 * PURPOSE: Visualize RTT measurements over time
 * 
 * WHY RECHARTS:
 * - React-native charting library
 * - Responsive by default
 * - Beautiful animations
 * - Easy to customize
 * 
 * CHART DESIGN:
 * - Time on X-axis (chronological)
 * - RTT on Y-axis (milliseconds)
 * - Color zones for different states
 * - Smooth line for trend visibility
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export const RTTGraph = ({ data }) => {
  /**
   * Format time for X-axis
   * WHY: HH:MM:SS is most readable for real-time data
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  /**
   * Custom tooltip
   * WHY: Default tooltip doesn't show enough context
   */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg border border-white/20 shadow-xl">
          <p className="text-xs text-white/70">{formatTime(data.timestamp)}</p>
          <p className="text-lg font-bold">{data.rtt}ms</p>
          <p className="text-xs text-white/70">{data.status}</p>
        </div>
      );
    }
    return null;
  };

  /**
   * Prepare data for chart
   * WHY: Keep last 50 points for performance and readability
   */
  const chartData = data.slice(-50).map(point => ({
    ...point,
    time: new Date(point.timestamp).getTime()
  }));

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">RTT Timeline</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          
          <YAxis
            label={{ value: 'RTT (ms)', angle: -90, position: 'insideLeft', fill: 'white' }}
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />

          {/* Reference lines for thresholds */}
          <ReferenceLine
            y={500}
            label="App Active"
            stroke="#8B5CF6"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={1000}
            label="Screen On"
            stroke="#10B981"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={2000}
            label="Screen Off"
            stroke="#6B7280"
            strokeDasharray="3 3"
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Main RTT line */}
          <Line
            type="monotone"
            dataKey="rtt"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={{ fill: '#4F46E5', r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Statistics */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded p-3 text-center">
            <p className="text-xs text-white/70">Min RTT</p>
            <p className="text-lg font-bold text-white">
              {Math.min(...chartData.map(d => d.rtt))}ms
            </p>
          </div>
          <div className="bg-white/5 rounded p-3 text-center">
            <p className="text-xs text-white/70">Avg RTT</p>
            <p className="text-lg font-bold text-white">
              {Math.round(chartData.reduce((sum, d) => sum + d.rtt, 0) / chartData.length)}ms
            </p>
          </div>
          <div className="bg-white/5 rounded p-3 text-center">
            <p className="text-xs text-white/70">Max RTT</p>
            <p className="text-lg font-bold text-white">
              {Math.max(...chartData.map(d => d.rtt))}ms
            </p>
          </div>
        </div>
      )}
    </div>
  );
};