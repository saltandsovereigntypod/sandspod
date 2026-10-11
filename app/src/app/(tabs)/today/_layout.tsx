import { Stack } from 'expo-router';

import { colors } from '../../../theme';

export default function TodayLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />;
}
