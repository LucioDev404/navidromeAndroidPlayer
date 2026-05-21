// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Improve startup by enabling inlineRequires (defers module initialization)
config.transformer = config.transformer || {};
config.transformer.inlineRequires = true;

module.exports = config;
