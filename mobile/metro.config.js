const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude backend, ml_research, and frontend from watching
config.watchFolders = [__dirname];
config.resolver.blockList = [
  /\/backend\/.*/,
  /\/frontend\/.*/,
  /\/ml_research\/.*/,
  /\/.venv\/.*/,
];

module.exports = config;
