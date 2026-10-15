// The home screen widgets need iOS 17 (the Altar widget's "Which altar" choice
// and its buttons), while the app itself still runs on iOS 16.4. This raises
// only the widget extension's minimum; on iOS 16 the app works without widgets.
const { withXcodeProject } = require('expo/config-plugins');

module.exports = function withWidgetDeploymentTarget(config, { bundleIdentifier, deploymentTarget = '17.0' }) {
  return withXcodeProject(config, (config) => {
    const configurations = config.modResults.pbxXCBuildConfigurationSection();
    for (const entry of Object.values(configurations)) {
      const settings = entry && entry.buildSettings;
      if (settings && String(settings.PRODUCT_BUNDLE_IDENTIFIER).replace(/"/g, '') === bundleIdentifier) {
        settings.IPHONEOS_DEPLOYMENT_TARGET = `"${deploymentTarget}"`;
      }
    }
    return config;
  });
};
