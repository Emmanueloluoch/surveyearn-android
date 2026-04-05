const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withArm64Only(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("abiFilters")) {
      return config;
    }
    config.modResults.contents = config.modResults.contents.replace(
      /versionCode\s+\d+/,
      (match) =>
        match +
        `\n            ndk {\n                abiFilters "arm64-v8a"\n            }`
    );
    return config;
  });
};
