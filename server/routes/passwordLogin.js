"use strict";

const express = require('express');
const router = new express.Router();
const passwordLoginCtrl = require('../lib/controllers/passwordLoginCtrl');

router.post('/', passwordLoginCtrl.auth);

router.get('/forbidden', passwordLoginCtrl.forbidden);

module.exports = router;
