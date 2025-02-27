import { Router } from 'express';
import apiKeyMiddleware from '../lib/middlewares/apiKey';
import apiFlagMiddleware from '../lib/middlewares/apiFlag';
import loginMiddleware from '../lib/middlewares/login';
import cors from 'cors';
import * as apiCtrl from '../lib/controllers/apiCtrl';
import * as heatingApiCtrl from '../lib/controllers/heating/apiCtrl';
import * as securityStatusAndMovementApiCtrl from '../lib/controllers/security/statusAndMovementApiCtrl';
import * as securityHealthApiCtrl from '../lib/controllers/security/healthApiCtrl';
import * as solarApiCtrl from '../lib/controllers/solar/apiCtrl';
import handleErrors from '../lib/utils/handle-errors';

const router = Router();

// generic
router.post('/changeconfig', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(apiCtrl.changeConfig));
router.get('/getconfig', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(apiCtrl.getConfig));
router.get('/init', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(apiCtrl.initUser));

// heating
router.get('/heating/init', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.initHeating));
router.post('/tempadjust', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.tempAdjust));
router.post('/restartsensor', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.restartSensor));
router.post('/togglesensorstatus', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.toggleSensorStatus));
router.post('/changesensorsettings', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.changeSensorSettings));
router.post('/changedefaultplan', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.changeDefaultPlan));
router.post('/heating/planoverride/add', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.addOrUpdateHeatingPlanOverride));
router.post('/heating/planoverride/remove', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.removeHeatingPlanOverride));
router.get('/heating/planoverride/list', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.listHeatingPlanOverride));
router.get('/sensorpolling', apiKeyMiddleware, cors(), handleErrors(heatingApiCtrl.sensorPolling));
router.get('/statistics', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.statistics));
router.get('/statistics/custom', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.statisticsCustom));
router.post('/toggleheatingpower', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.toggleHeatingPower));
router.post('/decreasepowerofftime', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.decreasePowerOff));
router.post('/increasepowerofftime', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.increasePowerOff));
router.post('/disablesensorwindowopen', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.disableSensorWindowOpen));
router.post('/ignoreholdconditions', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.ignoreHeatingHoldConditions));
router.post('/endignoringholdconditions', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(heatingApiCtrl.endIgnoringHeatingHoldConditions));

// solar heating
router.get('/solar/statusandupdate', apiFlagMiddleware, apiKeyMiddleware, cors(), handleErrors(solarApiCtrl.statusAndUpdate));


// security UI
router.post('/security/togglearm', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(securityStatusAndMovementApiCtrl.toggleArm));
router.get('/security/init', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(securityStatusAndMovementApiCtrl.init));
router.get('/security/camera/list', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(securityHealthApiCtrl.camera.list));
router.post('/security/camera/add', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(securityHealthApiCtrl.camera.add));
router.post('/security/camera/remove', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(securityHealthApiCtrl.camera.remove));
router.get('/security/controller/list', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(securityHealthApiCtrl.controller.list));
router.post('/security/controller/add', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(securityHealthApiCtrl.controller.add));
router.post('/security/controller/remove', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(securityHealthApiCtrl.controller.remove));

// security sensor
router.get('/security/sensor/status', apiKeyMiddleware, cors(), handleErrors(securityStatusAndMovementApiCtrl.status));
router.get('/security/sensor/togglearm', apiKeyMiddleware, cors(), handleErrors(securityStatusAndMovementApiCtrl.toggleArm));
router.get('/security/sensor/movement', apiKeyMiddleware, cors(), handleErrors(securityStatusAndMovementApiCtrl.movement));
router.get('/security/sensor/camera/ips', apiKeyMiddleware, cors(), handleErrors(securityHealthApiCtrl.camera.listIps));
router.get('/security/sensor/camera/healthreport', apiKeyMiddleware, cors(), handleErrors(securityHealthApiCtrl.camera.reportHealth));
router.get('/security/sensor/camera/movement', apiKeyMiddleware, cors(), handleErrors(securityHealthApiCtrl.camera.reportMovement));
router.get('/security/sensor/controller/healthreport', apiKeyMiddleware, cors(), handleErrors(securityHealthApiCtrl.controller.reportHealth));
router.get('/security/sensor/keypad/healthreport', apiKeyMiddleware, cors(), handleErrors(securityHealthApiCtrl.keypad.reportHealth));
router.get('/security/sensor/motionsensor/healthreport', apiKeyMiddleware, cors(), handleErrors(securityHealthApiCtrl.motionSensor.reportHealth));

// plant watering
// router.get('/plantwatering/init', apiFlagMiddleware, loginMiddleware, cors(), handleErrors(apiCtrl.plantWateringInit));
// router.get('/plantwatering/sensor', apiKeyMiddleware, cors(), handleErrors(apiCtrl.plantWateringSensor));

router.post('/log', apiKeyMiddleware, cors(), handleErrors(apiCtrl.log));

router.get('/checkloginstatus', (req, res) => {
	if (req.isAuthenticated()) {
		return res.sendStatus(200);
	}

	res.sendStatus(403);
});

export default router;
