const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);

// ตั้ง path alias @ -> โฟลเดอร์ frontend
defaultConfig.resolver.extraNodeModules = {
  "@": path.resolve(__dirname),
};

module.exports = withNativeWind(defaultConfig);
