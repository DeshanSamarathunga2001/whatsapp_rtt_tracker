
const whatsappService = require('../services/whatsappService');
const rttAnalyzer = require('../services/rttAnalyzer');
const config = require('../config/whatsapp.config');

exports.startTracking = async (req, res) => {
  try {
    const { phoneNumber, interval } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }


    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Must be 10-15 digits, optionally starting with +'
      });
    }

    const trackingInterval = interval || config.PING_INTERVAL;
    if (trackingInterval < config.MIN_INTERVAL || trackingInterval > config.MAX_INTERVAL) {
      return res.status(400).json({
        error: `Interval must be between ${config.MIN_INTERVAL}ms and ${config.MAX_INTERVAL}ms`
      });
    }

    const activeTargets = whatsappService.getActiveTargets();
    if (activeTargets.includes(phoneNumber)) {
      return res.status(409).json({
        error: 'Already tracking this phone number',
        phoneNumber
      });
    }

    if (activeTargets.length >= config.MAX_TARGETS) {
      return res.status(429).json({
        error: `Maximum ${config.MAX_TARGETS} targets allowed. Stop tracking some targets first.`,
        activeTargets: activeTargets.length
      });
    }

    if (!whatsappService.isConnected()) {
      return res.status(503).json({
        error: 'WhatsApp service not connected. Please try again.'
      });
    }


    whatsappService.startTracking(phoneNumber, trackingInterval);

    res.json({
      success: true,
      message: `Started tracking ${phoneNumber}`,
      phoneNumber,
      interval: trackingInterval,
      activeTargets: whatsappService.getActiveTargets().length
    });

  } catch (error) {
    console.error('Error starting tracking:', error);
    res.status(500).json({
      error: 'Failed to start tracking',
      details: error.message
    });
  }
};

exports.stopTracking = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    const stopped = whatsappService.stopTracking(phoneNumber);

    if (!stopped) {
      return res.status(404).json({
        error: 'Not currently tracking this phone number',
        phoneNumber
      });
    }

    rttAnalyzer.clearHistory(phoneNumber);

    res.json({
      success: true,
      message: `Stopped tracking ${phoneNumber}`,
      phoneNumber,
      activeTargets: whatsappService.getActiveTargets().length
    });

  } catch (error) {
    console.error('Error stopping tracking:', error);
    res.status(500).json({
      error: 'Failed to stop tracking',
      details: error.message
    });
  }
};


exports.getStatus = async (req, res) => {
  try {
    const activeTargets = whatsappService.getActiveTargets();
    const connected = whatsappService.isConnected();

    res.json({
      success: true,
      connected,
      activeTargets,
      count: activeTargets.length,
      maxTargets: config.MAX_TARGETS
    });

  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({
      error: 'Failed to get status',
      details: error.message
    });
  }
};

exports.getAnalysis = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    const analysis = rttAnalyzer.getAnalysis(phoneNumber);

    if (!analysis) {
      return res.status(404).json({
        error: 'No data available for this phone number',
        phoneNumber,
        message: 'Start tracking first or wait for data to be collected'
      });
    }

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({
      error: 'Failed to get analysis',
      details: error.message
    });
  }
};

exports.stopAll = async (req, res) => {
  try {
    const previousCount = whatsappService.getActiveTargets().length;
    
    whatsappService.stopAll();
    rttAnalyzer.clearAll();

    res.json({
      success: true,
      message: 'Stopped tracking all targets',
      stoppedCount: previousCount
    });

  } catch (error) {
    console.error('Error stopping all:', error);
    res.status(500).json({
      error: 'Failed to stop all tracking',
      details: error.message
    });
  }
};

exports.getAllAnalyses = async (req, res) => {
  try {
    const activeTargets = whatsappService.getActiveTargets();
    const analyses = [];

    for (const phoneNumber of activeTargets) {
      const analysis = rttAnalyzer.getAnalysis(phoneNumber);
      if (analysis) {
        analyses.push(analysis);
      }
    }

    res.json({
      success: true,
      count: analyses.length,
      analyses
    });

  } catch (error) {
    console.error('Error getting all analyses:', error);
    res.status(500).json({
      error: 'Failed to get analyses',
      details: error.message
    });
  }
};