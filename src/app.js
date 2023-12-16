require('dotenv').config();
const compression = require('compression');
const express = require('express');
const morgan = require('morgan');
// const { checkOverload } = require('./helpers/check.connect');
const { default: helmet } = require('helmet');
const app = express();

// init middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init dbs
require('./databases/init.mongodb');
// checkOverload()

// init routers
app.use('/', require('./routes'));

// handle errors global
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: error || 'Internal Server Error',
  });
});

module.exports = app;
