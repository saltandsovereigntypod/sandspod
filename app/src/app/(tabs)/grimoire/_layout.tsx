import { Stack } from 'expo-router';

import { colors } from '../../../theme';

// Opening one of this tab's pages from elsewhere keeps the tab's home
// underneath it, so Back always has somewhere to go.
export const unstable_settings = { initialRouteName: 'index' };

export default function GrimoireLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />;
}
