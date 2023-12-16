'use strict';

const development = {
  app: {
    port: process.env.DEV_APP_PORT || 3052,
  },
  db: {
    username: process.env.DEV_DB_USERNAME || 'mongo',
    password: process.env.DEV_DB_PASSWORD || 'mongopw',
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || 'test',
  },
};

const production = {
  app: {
    port: process.env.PRO_APP_PORT || 3000,
  },
  db: {
    username: process.env.PRO_DB_USERNAME || 'mongo',
    password: process.env.PRO_DB_PASSWORD || 'mongopw',
    host: process.env.PRO_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || 'test',
  },
};

const config = { development, production };
const environment = process.env.NODE_ENV || 'development';

module.exports = config[environment];
