"use strict";

const express = require('express');
const router = express.Router();

const apiCtrl = require('../lib/controllers/apiCtrl');
const heatingApiCtrl = require('../lib/controllers/heating/apiCtrl');
const securityStatusAndMovementApiCtrl = require('../lib/controllers/security/statusAndMovementApiCtrl');
const securityHealthApiCtrl = require('../lib/controllers/security/healthApiCtrl');
const loginMiddleware = require('../lib/middlewares/login');
const apiKeyMiddleware = require('../lib/middlewares/apiKey');
const apiFlagMiddleware = require('../lib/middlewares/apiFlag');
const cors = require('cors');

// generic
router.post('/changeconfig', apiFlagMiddleware, loginMiddleware, cors(), apiCtrl.changeConfig);
router.get('/getconfig', apiFlagMiddleware, loginMiddleware, cors(), apiCtrl.getConfig);
router.get('/init', apiFlagMiddleware, loginMiddleware, cors(), apiCtrl.init);

// heating
router.get('/heating/init', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.init);
router.post('/tempadjust', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.tempAdjust);
router.post('/restartsensor', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.restartSensor);
router.post('/togglesensorstatus', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.toggleSensorStatus);
router.post('/changesensorsettings', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.changeSensorSettings);
router.post('/changedefaultplan', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.changeDefaultPlan);
router.post('/heating/planoverride/add', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.addOrUpdateHeatingPlanOverride);
router.post('/heating/planoverride/remove', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.removeHeatingPlanOverride);
router.get('/heating/planoverride/list', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.listHeatingPlanOverride);
router.get('/sensorpolling', apiKeyMiddleware, cors(), heatingApiCtrl.sensorPolling);
router.get('/statistics', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.statistics);
router.post('/toggleheatingpower', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.toggleHeatingPower);
router.post('/disablesensorwindowopen', apiFlagMiddleware, loginMiddleware, cors(), heatingApiCtrl.disableSensorWindowOpen);


// security UI
router.post('/security/togglearm', apiFlagMiddleware, loginMiddleware, cors(), securityStatusAndMovementApiCtrl.toggleArm);
router.get('/security/init', apiFlagMiddleware, loginMiddleware, cors(), securityStatusAndMovementApiCtrl.init);
router.get('/security/camera/list', apiFlagMiddleware, loginMiddleware, cors(), securityHealthApiCtrl.camera.list);
router.post('/security/camera/add', apiFlagMiddleware, loginMiddleware, cors(), securityHealthApiCtrl.camera.add);
router.post('/security/camera/remove', apiFlagMiddleware, loginMiddleware, cors(), securityHealthApiCtrl.camera.remove);
router.get('/security/controller/list', apiFlagMiddleware, loginMiddleware, cors(), securityHealthApiCtrl.controller.list);
router.post('/security/controller/add', apiFlagMiddleware, loginMiddleware, cors(), securityHealthApiCtrl.controller.add);
router.post('/security/controller/remove', apiFlagMiddleware, loginMiddleware, cors(), securityHealthApiCtrl.controller.remove);

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
router.get('/plantwatering/init', apiFlagMiddleware, loginMiddleware, cors(), apiCtrl.plantWateringInit);
router.get('/plantwatering/sensor', apiKeyMiddleware, cors(), apiCtrl.plantWateringSensor);

router.post('/log', apiKeyMiddleware, cors(), apiCtrl.log);

router.get('/checkloginstatus', (req, res) => {
	if (req.isAuthenticated()) {
		return res.sendStatus(200);
	}

	res.sendStatus(403);
});

module.exports = router;
