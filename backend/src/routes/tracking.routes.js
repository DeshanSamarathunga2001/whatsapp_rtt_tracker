const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');


router.post('/start', trackingController.startTracking);
router.post('/stop', trackingController.stopTracking);
router.get('/stop-all', trackingController.stopAll);
router.get('/status', trackingController.getStatus);
router.get('/analysis/:phoneNumber', trackingController.getAnalysis);
router.get('/analyses', trackingController.getAllAnalyses);

module.exports = router;
