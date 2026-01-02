/**
 * ActivityStatus Component
 * 
 * PURPOSE: Display current activity state of target device
 * 
 * DESIGN DECISIONS:
 * - Color-coded status (visual hierarchy)
 * - Animated pulse (shows real-time updates)
 * - Clear icon and text labels
 */

import React from 'react';

const statusConfig = {
  'active': {
    label: 'App Active',
    color: 'bg-app-active',
    icon: '📱',
    description: 'WhatsApp likely in foreground'
  },
  'screen-on': {
    label: 'Screen On',
    color: 'bg-screen-on',
    icon: '✅',
    description: 'Device screen is active'
  },
  'screen-off': {
    label: 'Screen Off',
    color: 'bg-screen-off',
    icon: '🌙',
    description: 'Device in standby mode'
  },
  'offline': {
    label: 'Offline',
    color: 'bg-offline',
    icon: '❌',
    description: 'No response received'
  }
};

export const ActivityStatus = ({ status, rtt, timestamp }) => {
  const config = statusConfig[status] || statusConfig['offline'];

  /**
   * Format RTT for display
   * WHY: Numbers with units are easier to understand
   */
  const formatRTT = (ms) => {
    if (!ms) return 'N/A';
    return `${ms}ms`;
  };

  /**
   * Format timestamp
   * WHY: Relative time is more useful than absolute
   */
  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Current Status</h2>

      {/* Status Indicator */}
      <div className="flex items-center space-x-4 mb-6">
        <div className={`status-dot ${config.color}`}></div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="text-2xl font-bold text-white">{config.label}</h3>
          </div>
          <p className="text-sm text-white/70">{config.description}</p>
        </div>
      </div>

      {/* RTT Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-xs text-white/70 mb-1">Current RTT</p>
          <p className="rtt-display">{formatRTT(rtt)}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-xs text-white/70 mb-1">Last Update</p>
          <p className="text-lg font-semibold text-white">{formatTime(timestamp)}</p>
        </div>
      </div>

      {/* RTT Interpretation Guide */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-xs text-white/70 mb-2 font-semibold">RTT Guide:</p>
        <div className="space-y-1 text-xs text-white/60">
          <div>• &lt; 500ms = App likely active</div>
          <div>• &lt; 1000ms = Screen on</div>
          <div>• &gt; 1000ms = Screen off</div>
          <div>• &gt; 10000ms = Offline</div>
        </div>
      </div>
    </div>
  );
};