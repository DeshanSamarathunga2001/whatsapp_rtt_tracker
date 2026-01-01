const config = require("../config/whatsapp.config");

class RTTAnalyzer {
  constructor() {
    this.history = new Map();

    this.devices = new Map();
  }

  addMeasurement(phoneNumber, rtt, status) {
    if (!this.history.has(phoneNumber)) {
      this.history.set(phoneNumber, []);
    }

    const history = this.history.get(phoneNumber);
    history.push({ rtt, status, timestamp: Date.now() });

    if (history.length > config.HISTORY_SIZE) {
      history.shift();
    }

    this.updateDeviceFingerprint(phoneNumber);
  }

  getAnalysis(phoneNumber) {
    const history = this.history.get(phoneNumber) || [];

    if (history.length === 0) {
      return null;
    }

    const rttValues = history.map((m) => m.rtt);
    const recentRTTs = rttValues.slice(-config.MOVING_AVERAGE_WINDOW);

    return {
      phoneNumber,
      measurements: history.length,
      current: {
        rtt: rttValues[rttValues.length - 1],
        status: history[history.length - 1].status,
      },
      statistics: {
        min: Math.min(...rttValues),
        max: Math.max(...rttValues),
        avg: this.average(rttValues),
        median: this.median(rttValues),
        variance: this.variance(rttValues),
        stdDev: this.standardDeviation(rttValues),
      },
      movingAverage: this.average(recentRTTs),
      device: this.devices.get(phoneNumber) || {
        type: "unknown",
        confidence: "low",
      },
      statusDistribution: this.getStatusDistribution(history),
      trend: this.detectTrend(rttValues),
    };
  }

  calculateMovingAverage(phoneNumber) {
    const history = this.history.get(phoneNumber) || [];
    const recentValues = history
      .slice(-config.MOVING_AVERAGE_WINDOW)
      .map((m) => m.rtt);

    return this.average(recentValues);
  }

  updateDeviceFingerprint(phoneNumber) {
    const history = this.history.get(phoneNumber) || [];

    if (history.length < 20) {
      return;
    }

    const rttValues = history.map((m) => m.rtt);
    const avgRTT = this.average(rttValues);
    const variance = this.variance(rttValues);

    const {
      LOW_VARIANCE_THRESHOLD,
      HIGH_VARIANCE_THRESHOLD,
      DESKTOP_RTT_MAX,
      MOBILE_RTT_TYPICAL,
    } = config.DEVICE_FINGERPRINT;

    let deviceType = "unknown";
    let confidence = "low";

    if (variance < LOW_VARIANCE_THRESHOLD && avgRTT < DESKTOP_RTT_MAX) {
      deviceType = "desktop";
      confidence = "high";
    } else if (
      variance > HIGH_VARIANCE_THRESHOLD &&
      avgRTT < MOBILE_RTT_TYPICAL
    ) {
      deviceType = "iphone";
      confidence = "medium";
    } else if (avgRTT > MOBILE_RTT_TYPICAL) {
      deviceType = "android";
      confidence = "medium";
    }

    this.devices.set(phoneNumber, {
      type: deviceType,
      confidence,
      characteristics: {
        avgRTT: Math.round(avgRTT),
        variance: Math.round(variance),
        jitter: Math.round(this.standardDeviation(rttValues)),
      },
    });
  }

  getStatusDistribution(history) {
    const total = history.length;
    const distribution = {};

    history.forEach((m) => {
      distribution[m.status] = (distribution[m.status] || 0) + 1;
    });

    Object.keys(distribution).forEach((status) => {
      distribution[status] = ((distribution[status] / total) * 100).toFixed(1);
    });

    return distribution;
  }

  detectTrend(values) {
    if (values.length < 10) return "unknown";

    const recentValues = values.slice(-10);
    const firstHalf = this.average(recentValues.slice(0, 5));
    const secondHalf = this.average(recentValues.slice(5));

    const change = ((secondHalf - firstHalf) / firstHalf) * 100;

    if (change > 10) return "increasing";
    if (change < -10) return "decreasing";
    return "stable";
  }

  clearHistory(phoneNumber) {
    this.history.delete(phoneNumber);
    this.devices.delete(phoneNumber);
  }

  clearAll() {
    this.history.clear();
    this.devices.clear();
  }

  average(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  median(values) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  variance(values) {
    if (values.length === 0) return 0;
    const avg = this.average(values);
    return this.average(values.map((v) => Math.pow(v - avg, 2)));
  }

  standardDeviation(values) {
    return Math.sqrt(this.variance(values));
  }
}

const rttAnalyzer = new RTTAnalyzer();

module.exports = rttAnalyzer;
