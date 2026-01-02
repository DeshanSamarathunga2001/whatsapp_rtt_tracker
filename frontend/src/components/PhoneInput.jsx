

import React, { useState } from 'react';

export const PhoneInput = ({ onStartTracking, isTracking }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [interval, setInterval] = useState(2000);

  const validatePhone = (phone) => {
    // Allow + prefix and 10-15 digits
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous error
    setError('');

    // Validate
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setError('Invalid phone number format. Use international format (e.g., +1234567890)');
      return;
    }

    // Call parent callback
    onStartTracking(phoneNumber, interval);
    
    // Optional: Clear input after starting
    // setPhoneNumber('');
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Target Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Number Input */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
            Phone Number
          </label>
          <input
            type="text"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            disabled={isTracking}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-white/10 border border-white/20
              text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
            `}
          />
          {error && (
            <p className="mt-2 text-sm text-danger">{error}</p>
          )}
        </div>

        {/* Interval Selection */}
        <div>
          <label htmlFor="interval" className="block text-sm font-medium text-white mb-2">
            Probe Interval: {interval}ms
          </label>
          <input
            type="range"
            id="interval"
            min="1000"
            max="20000"
            step="1000"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            disabled={isTracking}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>1s (High Frequency)</span>
            <span>20s (Low Frequency)</span>
          </div>
          <p className="text-xs text-white/70 mt-2">
            ⚠️ Lower intervals provide more detail but may be detected
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isTracking}
          className={`
            w-full px-6 py-3 rounded-lg font-semibold
            transition-all transform
            ${isTracking
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/80 hover:scale-105 active:scale-95'
            }
            text-white
            shadow-lg
          `}
        >
          {isTracking ? 'Tracking Active...' : 'Start Tracking'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-2">ℹ️ How It Works</h3>
        <ul className="text-xs text-white/70 space-y-1">
          <li>• Sends stealthy "reaction" messages</li>
          <li>• Measures delivery receipt timing (RTT)</li>
          <li>• Infers activity from RTT patterns</li>
          <li>• Target receives no notifications</li>
        </ul>
      </div>
    </div>
  );
};