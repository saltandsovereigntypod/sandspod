// The Android widget library asks for androidx.work's old -ktx 2.7 package,
// while the rest of the app uses work-runtime 2.8, which already contains it;
// both together fail the build with duplicate classes. Use the empty 2.8 -ktx.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARK = '// withAndroidWorkManager';

module.exports = function withAndroidWorkManager(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes(MARK)) {
      cfg.modResults.contents += `
${MARK}
configurations.all {
    resolutionStrategy {
        force 'androidx.work:work-runtime-ktx:2.8.1'
    }
}
`;
    }
    return cfg;
  });
};
