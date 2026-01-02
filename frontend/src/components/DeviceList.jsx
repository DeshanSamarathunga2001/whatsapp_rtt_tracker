/**
 * DeviceList Component
 * 
 * PURPOSE: Display detected devices and their characteristics
 * 
 * WHY NEEDED:
 * - Research shows multi-device support reveals device count
 * - Different devices have different RTT patterns
 * - Helps understand target's setup
 */

import React from 'react';

export const DeviceList = ({ devices }) => {
  const getDeviceIcon = (type) => {
    const icons = {
      'iPhone': '📱',
      'Android': '🤖',
      'desktop/web': '💻',
      'unknown': '❓'
    };
    return icons[type] || icons.unknown;
  };

  const getConfidenceBadge = (confidence) => {
    const config = {
      'high': { color: 'bg-green-500', text: 'High' },
      'medium': { color: 'bg-yellow-500', text: 'Medium' },
      'low': { color: 'bg-red-500', text: 'Low' }
    };
    return config[confidence] || config.low;
  };

  if (!devices || devices.length === 0) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Detected Devices</h2>
        <p className="text-white/70 text-center py-8">
          No devices detected yet. Continue tracking to gather data.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Detected Devices ({devices.length})
      </h2>

      <div className="space-y-3">
        {devices.map((device, index) => {
          const badge = getConfidenceBadge(device.confidence);
          
          return (
            <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getDeviceIcon(device.deviceType)}</span>
                  <div>
                    <h3 className="text-white font-semibold">{device.deviceType}</h3>
                    <p className="text-xs text-white/70">Index: {index}</p>
                  </div>
                </div>
                
                <span className={`${badge.color} text-white text-xs px-2 py-1 rounded`}>
                  {badge.text} Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-white/5 rounded p-2">
                  <p className="text-xs text-white/70">Avg RTT</p>
                  <p className="text-sm font-semibold text-white">{device.avgRTT}ms</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-xs text-white/70">Variance</p>
                  <p className="text-sm font-semibold text-white">{device.variance}ms</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-xs text-white/70">
          ℹ️ Device fingerprinting based on RTT patterns and delivery receipt behavior
        </p>
      </div>
    </div>
  );
};