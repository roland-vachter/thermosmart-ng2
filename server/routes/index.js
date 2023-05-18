"use strict";

const express = require('express');
const router = express.Router();

const indexCtrl = require('../lib/controllers/indexCtrl');
const loginMiddleware = require('../lib/middlewares/login');
const documentationCtrl = require('../lib/controllers/documentationCtrl');

/* GET home page. */
router.get('/', loginMiddleware, indexCtrl);
router.get('/documentation', documentationCtrl);

module.exports = router;
