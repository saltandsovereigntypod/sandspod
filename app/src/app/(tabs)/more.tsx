import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button } from '../../components/Button';
import { ComingSoon } from '../../components/ComingSoon';
import { useSession } from '../../lib/session';
import { type } from '../../theme';

export default function More() {
  const { session, signOut } = useSession();

  return (
    <ComingSoon
      title="Your Sanctuary"
      description="Community Grimoire, offerings and replies, the Library, moon reminders, settings and backups will gather here."
    >
      <Text style={[type.caption, styles.status]}>
        {session ? `Signed in as ${session.user.email ?? 'your account'}` : 'Guest · saved on this device'}
      </Text>
      {session ? (
        <Button
          label="Sign out"
          variant="outline"
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
        />
      ) : (
        <Button label="Sign in to sync" variant="outline" onPress={() => router.push('/sign-in')} />
      )}
    </ComingSoon>
  );
}

const styles = StyleSheet.create({
  status: { textAlign: 'center' },
});
