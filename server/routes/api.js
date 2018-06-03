"use strict";

const express = require('express');
const router = express.Router();

const apiCtrl = require('../lib/controllers/apiCtrl');
const loginMiddleware = require('../lib/middlewares/login');
const apiKeyMiddleware = require('../lib/middlewares/apiKey');
const cors = require('cors');

router.get('/init', loginMiddleware, cors(), apiCtrl.init);
router.post('/tempadjust', loginMiddleware, cors(), apiCtrl.tempAdjust);
router.post('/restartsensor', loginMiddleware, cors(), apiCtrl.restartSensor);
router.post('/togglesensorstatus', loginMiddleware, cors(), apiCtrl.toggleSensorStatus);
router.post('/changesensorlabel', loginMiddleware, cors(), apiCtrl.changeSensorLabel);
router.post('/changedefaultplan', loginMiddleware, cors(), apiCtrl.changeDefaultPlan);
router.get('/sensorpolling', apiKeyMiddleware, cors(), apiCtrl.sensorPolling);
router.get('/statistics', loginMiddleware, cors(), apiCtrl.statistics);
router.post('/changeconfig', loginMiddleware, cors(), apiCtrl.changeConfig);

router.post('/security/togglearm', loginMiddleware, cors(), apiCtrl.securityToggleArm);
router.get('/security/movement', apiKeyMiddleware, cors(), apiCtrl.securityMovement);
router.get('/security/status', apiKeyMiddleware, cors(), apiCtrl.securityStatus);
router.get('/security/init', loginMiddleware, cors(), apiCtrl.securityInit);

module.exports = router;
