'use strict';

const express = require('express');
const { apiKey, permissions } = require('../auth/checkAuth');
const router = express.Router();

// check api key
router.use(apiKey);
router.use(permissions('0000'));

// init router
router.use('/v1/api', require('./access'));

module.exports = router;
