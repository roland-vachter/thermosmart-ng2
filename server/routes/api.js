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
router.post('/changesensorsettings', loginMiddleware, cors(), apiCtrl.changeSensorSettings);
router.post('/changedefaultplan', loginMiddleware, cors(), apiCtrl.changeDefaultPlan);
router.get('/sensorpolling', apiKeyMiddleware, cors(), apiCtrl.sensorPolling);
router.get('/statistics', loginMiddleware, cors(), apiCtrl.statistics);
router.post('/changeconfig', loginMiddleware, cors(), apiCtrl.changeConfig);
router.post('/toggleheatingpower', loginMiddleware, cors(), apiCtrl.toggleHeatingPower);

router.post('/security/togglearm', loginMiddleware, cors(), apiCtrl.securityToggleArm);
router.get('/security/init', loginMiddleware, cors(), apiCtrl.securityInit);
router.get('/security/sensor/status', apiKeyMiddleware, cors(), apiCtrl.securityStatus);
router.post('/security/sensor/togglearm', apiKeyMiddleware, cors(), apiCtrl.securityToggleArm);
router.get('/security/sensor/movement', apiKeyMiddleware, cors(), apiCtrl.securityMovement);

router.get('/plantwatering/init', loginMiddleware, cors(), apiCtrl.plantWateringInit);
router.get('/plantwatering/sensor', apiKeyMiddleware, cors(), apiCtrl.plantWateringSensor);

router.post('/log', apiKeyMiddleware, cors(), apiCtrl.log);

module.exports = router;
