"use strict";

const express = require('express');
const router = new express.Router();
const googleLoginCtrl = require('../lib/controllers/googleLoginCtrl');

router.get('/', googleLoginCtrl.auth);

// handle the callback after google has authenticated the user
router.get('/callback', googleLoginCtrl.callback);

router.get('/forbidden', googleLoginCtrl.forbidden);

module.exports = router;
