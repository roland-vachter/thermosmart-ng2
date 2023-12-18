'use strict';

const Router = require('express').Router;
const router = new Router();

router.use('/login/password', require('./routes/passwordLogin'));
router.use('/login/google', require('./routes/googleLogin'));

router.use('/api', require('./routes/api'));
router.use('/', require('./routes/index'));

module.exports = router;
