import { Stack } from 'expo-router';

import { colors } from '../../../theme';

// Opening a coven from elsewhere (Today, a reminder) keeps the directory
// underneath it, so Back always has somewhere to go.
export const unstable_settings = { initialRouteName: 'index' };

export default function CovenLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />;
}
