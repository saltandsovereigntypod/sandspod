import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, MenuList, MenuRow, MoreScreen, Section } from '../../../components/more/ui';
import { useSession } from '../../../lib/session';
import { providerSummary } from '../../../lib/settings/accountRules';
import { colors, fonts, type } from '../../../theme';

export default function Account() {
  const { session, signOut } = useSession();
  const user = session?.user ?? null;

  if (!user) {
    return (
      <MoreScreen title="Account" eyebrow="Guest Sanctuary" back="/more" backLabel="Back to More">
        <Card>
          <Text style={type.body}>
            Your work is kept only on this device. Sign in with your Salt &amp; Sovereignty account to open what you keep on
            the website and use it on any device.
          </Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
        <Text style={type.caption}>Before removing the app, save a guest backup from More → Backup and restore.</Text>
      </MoreScreen>
    );
  }

  return (
    <MoreScreen title="Account" eyebrow="Your Sanctuary account" back="/more" backLabel="Back to More">
      <Card>
        <Fact label="Signed in as" value={user.email ?? 'Current account'} />
        <Fact label="Sign-in method" value={providerSummary(user)} />
        <Text style={type.caption}>
          Your Sanctuary is saved to your account. Signing out doesn't delete anything; sign back in to see it again.
        </Text>
        <Button
          label="Sign out"
          variant="outline"
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
        />
      </Card>

      <Section label="Danger zone">
        <MenuList>
          <MenuRow
            label="Delete account"
            detail="Permanently remove your account and private data"
            onPress={() => router.push('/more/delete-account')}
            last
          />
        </MenuList>
      </Section>
    </MoreScreen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={type.eyebrow}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fact: { gap: 2 },
  value: { fontFamily: fonts.body, fontSize: 16, color: colors.cream },
});
