// The app's entry: Expo Router, plus on Android the home-screen widgets'
// task and the Altar widget's "Which altar" screen.
import 'expo-router/entry';

import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  /* eslint-disable @typescript-eslint/no-require-imports -- Android only */
  const widgets = require('react-native-android-widget') as typeof import('react-native-android-widget');
  const { widgetTaskHandler } = require('./src/widgets/android/taskHandler') as typeof import('./src/widgets/android/taskHandler');
  const { AltarWidgetConfigScreen } = require('./src/widgets/android/ConfigScreen') as typeof import('./src/widgets/android/ConfigScreen');
  /* eslint-enable @typescript-eslint/no-require-imports */
  widgets.registerWidgetTaskHandler(widgetTaskHandler);
  widgets.registerWidgetConfigurationScreen(AltarWidgetConfigScreen);
}
