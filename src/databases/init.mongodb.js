'use strict';

const mongoose = require('mongoose');
const { countConnections } = require('../helpers/check.connect');

const {
  db: { username, password, host, port, name },
} = require('../config/config.mongodb');

const connectionString = `mongodb://${username}:${password}@${host}:${port}`;

class Database {
  constructor() {
    this.connect();
  }

  connect(type = 'mongodb') {
    if (1 == 1) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    }

    mongoose
      .connect(connectionString, {
        maxPoolSize: 50,
      })
      .then((_) =>
        console.log(
          `Connected to ${connectionString} successfully. Number of connections:::${countConnections()} `
        )
      )
      .catch((error) =>
        console.error(`Error connecting to ${connectionString}`)
      );
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
