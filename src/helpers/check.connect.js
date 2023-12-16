'use strict';

const mongoose = require('mongoose');
const os = require('os');

const SECONDS = 5000;
// Define a function to count the number of connections
const countConnections = () => {
  // Get the number of connections
  const numberOfConnections = mongoose.connections.length;

  return numberOfConnections;
};

// Define a function to check overload
const checkOverload = () => {
  setInterval(() => {
    const numberOfConnections = mongoose.connections.length;
    const numberOfCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    // Check performance
    const maxConnections = numberOfCores * 5;

    console.log(`Memories Usage::: ${memoryUsage / 1024 / 1024} MB`);
    if (numberOfConnections > maxConnections) {
      console.error(
        `Connections to database overload detected: ${numberOfConnections} / ${maxConnections}`
      );
    }
  }, SECONDS); // Run every 50 seconds
};

module.exports = {
  countConnections,
  checkOverload,
};
