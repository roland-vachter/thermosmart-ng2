"use strict";

const express = require('express');
const router = express.Router();

const apiCtrl = require('../lib/controllers/apiCtrl');
const heatingApiCtrl = require('../lib/controllers/heating/apiCtrl');
const securityStatusAndMovementApiCtrl = require('../lib/controllers/security/statusAndMovementApiCtrl');
const securityHealthApiCtrl = require('../lib/controllers/security/healthApiCtrl');
const loginMiddleware = require('../lib/middlewares/login');
const apiKeyMiddleware = require('../lib/middlewares/apiKey');
const cors = require('cors');

// generic
router.post('/changeconfig', loginMiddleware, cors(), apiCtrl.changeConfig);
router.get('/getconfig', loginMiddleware, cors(), apiCtrl.getConfig);
router.get('/init', loginMiddleware, cors(), apiCtrl.init);

// heating
router.get('/heating/init', loginMiddleware, cors(), heatingApiCtrl.init);
router.post('/tempadjust', loginMiddleware, cors(), heatingApiCtrl.tempAdjust);
router.post('/restartsensor', loginMiddleware, cors(), heatingApiCtrl.restartSensor);
router.post('/togglesensorstatus', loginMiddleware, cors(), heatingApiCtrl.toggleSensorStatus);
router.post('/changesensorsettings', loginMiddleware, cors(), heatingApiCtrl.changeSensorSettings);
router.post('/changedefaultplan', loginMiddleware, cors(), heatingApiCtrl.changeDefaultPlan);
router.post('/heating/planoverride/add', loginMiddleware, cors(), heatingApiCtrl.addOrUpdateHeatingPlanOverride);
router.post('/heating/planoverride/remove', loginMiddleware, cors(), heatingApiCtrl.removeHeatingPlanOverride);
router.get('/heating/planoverride/list', loginMiddleware, cors(), heatingApiCtrl.listHeatingPlanOverride);
router.get('/sensorpolling', apiKeyMiddleware, cors(), heatingApiCtrl.sensorPolling);
router.get('/statistics', loginMiddleware, cors(), heatingApiCtrl.statistics);
router.post('/toggleheatingpower', loginMiddleware, cors(), heatingApiCtrl.toggleHeatingPower);
router.post('/disablesensorwindowopen', loginMiddleware, cors(), heatingApiCtrl.disableSensorWindowOpen);


// security UI
router.post('/security/togglearm', loginMiddleware, cors(), securityStatusAndMovementApiCtrl.toggleArm);
router.get('/security/init', loginMiddleware, cors(), securityStatusAndMovementApiCtrl.init);
router.get('/security/camera/list', loginMiddleware, cors(), securityHealthApiCtrl.camera.list);
router.post('/security/camera/add', loginMiddleware, cors(), securityHealthApiCtrl.camera.add);
router.post('/security/camera/remove', loginMiddleware, cors(), securityHealthApiCtrl.camera.remove);
router.get('/security/controller/list', loginMiddleware, cors(), securityHealthApiCtrl.controller.list);
router.post('/security/controller/add', loginMiddleware, cors(), securityHealthApiCtrl.controller.add);
router.post('/security/controller/remove', loginMiddleware, cors(), securityHealthApiCtrl.controller.remove);

// security sensor
router.get('/security/sensor/status', apiKeyMiddleware, cors(), securityStatusAndMovementApiCtrl.status);
router.get('/security/sensor/togglearm', apiKeyMiddleware, cors(), securityStatusAndMovementApiCtrl.toggleArm);
router.get('/security/sensor/movement', apiKeyMiddleware, cors(), securityStatusAndMovementApiCtrl.movement);
router.get('/security/sensor/camera/ips', apiKeyMiddleware, cors(), securityHealthApiCtrl.camera.listIps);
router.get('/security/sensor/camera/healthreport', apiKeyMiddleware, cors(), securityHealthApiCtrl.camera.reportHealth);
router.get('/security/sensor/camera/movement', apiKeyMiddleware, cors(), securityHealthApiCtrl.camera.reportMovement);
router.get('/security/sensor/controller/healthreport', apiKeyMiddleware, cors(), securityHealthApiCtrl.controller.reportHealth);
router.get('/security/sensor/keypad/healthreport', apiKeyMiddleware, cors(), securityHealthApiCtrl.keypad.reportHealth);
router.get('/security/sensor/motionsensor/healthreport', apiKeyMiddleware, cors(), securityHealthApiCtrl.motionSensor.reportHealth);

// plant watering
router.get('/plantwatering/init', loginMiddleware, cors(), apiCtrl.plantWateringInit);
router.get('/plantwatering/sensor', apiKeyMiddleware, cors(), apiCtrl.plantWateringSensor);

router.post('/log', apiKeyMiddleware, cors(), apiCtrl.log);

module.exports = router;
