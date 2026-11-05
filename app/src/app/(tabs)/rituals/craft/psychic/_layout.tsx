import { Stack } from 'expo-router';

import { DropInProvider } from '../../../../../components/psychic/DropIn';
import { colors } from '../../../../../theme';

// One shared drop-in controller over every Psychic screen, so a meditation
// sound keeps playing as you move from the drop-in to an exercise, and stops
// when you leave the section.
export default function PsychicLayout() {
  return (
    <DropInProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />
    </DropInProvider>
  );
}
