/**
 * Dashboard Component
 * 
 * PURPOSE: Main container that orchestrates all sub-components
 * 
 * WHY SINGLE CONTAINER:
 * - Manages shared state
 * - Coordinates data flow
 * - Handles WebSocket updates
 */

import React, { useState, useEffect } from 'react';
import { PhoneInput } from './PhoneInput';
import { ActivityStatus } from './ActivityStatus';
import { RTTGraph } from './RTTGraph';
import { DeviceList } from './DeviceList';
import { useWebSocket } from '../hooks/useWebSocket';
import { trackingAPI } from '../services/api';

export const Dashboard = () => {
  // State
  const [isTracking, setIsTracking] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');
  const [currentStatus, setCurrentStatus] = useState({
    status: 'offline',
    rtt: null,
    timestamp: null
  });
  const [rttHistory, setRttHistory] = useState([]);
  const [devices, setDevices] = useState([]);

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket();

  /**
   * Handle WebSocket messages
   * 
   * WHY useEffect:
   * - React to WebSocket messages
   * - Update state based on message type
   * - Dependency on lastMessage ensures it runs when new message arrives
   */
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'rtt-update':
        handleRTTUpdate(lastMessage.data);
        break;
      
      case 'error':
        console.error('Server error:', lastMessage.data);
        // TODO: Show error toast to user
        break;

      case 'connected':
        console.log('WebSocket connection confirmed');
        break;

      default:
        console.log('Unknown message type:', lastMessage.type);
    }
  }, [lastMessage]);

  /**
   * Handle RTT update from server
   */
  const handleRTTUpdate = (data) => {
    // Only update if it's for our target
    if (data.phoneNumber !== targetPhone) return;

    // Update current status
    setCurrentStatus({
      status: data.status,
      rtt: data.rtt,
      timestamp: data.timestamp
    });

    // Add to history
    setRttHistory(prev => [
      ...prev,
      {
        rtt: data.rtt,
        status: data.status,
        timestamp: data.timestamp
      }
    ]);

    // Update device info if available
    if (data.analysis && data.analysis.deviceInfo) {
      updateDeviceInfo(data.analysis.deviceInfo);
    }
  };

  /**
   * Update device information
   */
  const updateDeviceInfo = (deviceInfo) => {
    setDevices(prev => {
      // Check if device already exists
      const exists = prev.find(d => d.deviceType === deviceInfo.deviceType);
      
      if (exists) {
        // Update existing
        return prev.map(d =>
          d.deviceType === deviceInfo.deviceType ? deviceInfo : d
        );
      } else {
        // Add new
        return [...prev, deviceInfo];
      }
    });
  };

  /**
   * Start tracking
   */
  const handleStartTracking = async (phoneNumber, interval) => {
    try {
      await trackingAPI.startTracking(phoneNumber, interval);
      setIsTracking(true);
      setTargetPhone(phoneNumber);
      
      // Clear previous data
      setRttHistory([]);
      setDevices([]);
      
    } catch (error) {
      console.error('Failed to start tracking:', error);
      alert(`Error: ${error.message}`);
    }
  };

  /**
   * Stop tracking
   */
  const handleStopTracking = async () => {
    try {
      await trackingAPI.stopTracking(targetPhone);
      setIsTracking(false);
      setTargetPhone('');
      
    } catch (error) {
      console.error('Failed to stop tracking:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              WhatsApp RTT Tracker
            </h1>
            <p className="text-white/70">
              Monitor user activity via delivery receipt timing analysis
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-white text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PhoneInput
            onStartTracking={handleStartTracking}
            isTracking={isTracking}
          />

          <ActivityStatus
            status={currentStatus.status}
            rtt={currentStatus.rtt}
            timestamp={currentStatus.timestamp}
          />

          {isTracking && (
            <button
              onClick={handleStopTracking}
              className="w-full px-6 py-3 bg-danger hover:bg-danger/80 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              Stop Tracking
            </button>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <RTTGraph data={rttHistory} />
          <DeviceList devices={devices} />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="glass-card p-4">
          <p className="text-white/70 text-sm text-center">
            ⚠️ Educational purposes only. Based on research paper "Careless Whisper" (2025)
          </p>
        </div>
      </div>
    </div>
  );
};