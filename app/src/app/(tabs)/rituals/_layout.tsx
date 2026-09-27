import { Stack } from 'expo-router';

import { colors } from '../../../theme';

// Opening a Rituals screen from Today or a reminder keeps the Rituals home
// underneath it, so Back always has somewhere to go.
export const unstable_settings = { initialRouteName: 'index' };

export default function RitualsLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />;
}
