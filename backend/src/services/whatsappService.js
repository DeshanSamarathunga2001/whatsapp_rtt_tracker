// backend/src/services/whatsappService.js

const EventEmitter = require('events');
const config = require('../config/whatsapp.config');

/**
 * WhatsApp Service
 * Handles connection to WhatsApp and manages message probing
 * 
 * NOTE: This is a SIMULATED implementation for demonstration.
 * Production requires actual whatsmeow library integration.
 */
class WhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
    this.activeTargets = new Map(); // phoneNumber -> intervalId
    this.probeTimestamps = new Map(); // messageId -> timestamp
  }

  /**
   * Initialize WhatsApp client
   * In production: Connect to WhatsApp using whatsmeow
   */
  async initialize() {
    console.log('Initializing WhatsApp client...');
    console.log('⚠️  IMPORTANT: This is a simulated implementation');
    console.log('   Production requires whatsmeow library integration');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.connected = true;
    this.emit('connected');
    console.log('WhatsApp service initialized');
  }

  /**
   * Check if service is connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Start tracking a target phone number
   * @param {string} phoneNumber - Target phone number
   * @param {number} interval - Ping interval in milliseconds
   */
  startTracking(phoneNumber, interval = config.PING_INTERVAL) {
    if (this.activeTargets.has(phoneNumber)) {
      console.log(`Already tracking ${phoneNumber}`);
      return;
    }

    console.log(`Starting tracking for ${phoneNumber} (interval: ${interval}ms)`);

    // Start periodic probing
    const intervalId = setInterval(() => {
      this.sendProbe(phoneNumber);
    }, interval);

    this.activeTargets.set(phoneNumber, {
      intervalId,
      interval,
      startTime: Date.now()
    });

    // Send first probe immediately
    this.sendProbe(phoneNumber);
  }

  /**
   * Send a stealthy probe message
   * @param {string} phoneNumber - Target phone number
   */
  async sendProbe(phoneNumber) {
    const messageId = this.generateMessageId();
    const sendTime = Date.now();
    
    this.probeTimestamps.set(messageId, sendTime);

    try {
      // SIMULATED: In production, this would send actual WhatsApp message
      // const message = {
      //   type: 'reaction',
      //   reaction: '',  // Empty reaction = invisible
      //   messageId: generateRandomId(),  // Non-existent message
      //   chatJid: phoneNumber + '@s.whatsapp.net'
      // };
      // await whatsappClient.sendMessage(message);

      // Simulate network delay and device processing
      const simulatedRTT = this.generateSimulatedRTT();
      
      setTimeout(() => {
        this.handleDeliveryReceipt(phoneNumber, messageId, simulatedRTT);
      }, simulatedRTT);

    } catch (error) {
      console.error(`Error sending probe to ${phoneNumber}:`, error.message);
      this.emit('error', { phoneNumber, error: error.message });
    }
  }

  /**
   * Handle delivery receipt from target
   * @param {string} phoneNumber - Target phone number
   * @param {string} messageId - Message ID
   * @param {number} rtt - Round-trip time in milliseconds
   */
  handleDeliveryReceipt(phoneNumber, messageId, rtt) {
    const sendTime = this.probeTimestamps.get(messageId);
    if (!sendTime) return;

    // Clean up timestamp
    this.probeTimestamps.delete(messageId);

    // Determine status based on RTT
    const status = this.analyzeStatus(rtt);

    // Emit RTT measurement event
    this.emit('rtt-measurement', {
      phoneNumber,
      rtt,
      timestamp: new Date().toISOString(),
      status,
      messageId
    });
  }

  /**
   * Analyze device status from RTT
   * @param {number} rtt - Round-trip time in milliseconds
   * @returns {string} Status: 'app-active', 'screen-on', 'screen-off', 'offline'
   */
  analyzeStatus(rtt) {
    const { APP_ACTIVE, SCREEN_ON, SCREEN_OFF, OFFLINE } = config.RTT_THRESHOLDS;

    if (rtt >= OFFLINE) return 'offline';
    if (rtt < APP_ACTIVE) return 'app-active';
    if (rtt < SCREEN_ON) return 'screen-on';
    if (rtt < SCREEN_OFF) return 'screen-off';
    return 'standby';
  }

  /**
   * Stop tracking a target
   * @param {string} phoneNumber - Target phone number
   */
  stopTracking(phoneNumber) {
    const target = this.activeTargets.get(phoneNumber);
    if (!target) {
      console.log(`Not tracking ${phoneNumber}`);
      return false;
    }

    clearInterval(target.intervalId);
    this.activeTargets.delete(phoneNumber);
    
    console.log(`Stopped tracking ${phoneNumber}`);
    return true;
  }

  /**
   * Get all active targets
   * @returns {Array} List of active phone numbers
   */
  getActiveTargets() {
    return Array.from(this.activeTargets.keys());
  }

  /**
   * Stop tracking all targets
   */
  stopAll() {
    for (const phoneNumber of this.activeTargets.keys()) {
      this.stopTracking(phoneNumber);
    }
  }

  /**
   * Generate unique message ID
   * @returns {string} Message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate simulated RTT for demonstration
   * @returns {number} RTT in milliseconds
   */
  generateSimulatedRTT() {
    // Simulate realistic RTT patterns
    const patterns = [
      { weight: 0.3, range: [200, 500] },   // App active
      { weight: 0.4, range: [800, 1200] },  // Screen on
      { weight: 0.2, range: [1500, 2500] }, // Screen off
      { weight: 0.1, range: [3000, 5000] }  // Deep sleep
    ];

    const random = Math.random();
    let cumulative = 0;

    for (const pattern of patterns) {
      cumulative += pattern.weight;
      if (random <= cumulative) {
        const [min, max] = pattern.range;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    }

    return 1000; // Default
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect() {
    this.stopAll();
    this.connected = false;
    this.emit('disconnected');
    console.log('WhatsApp service disconnected');
  }
}

// Create singleton instance
const whatsappService = new WhatsAppService();

module.exports = whatsappService;