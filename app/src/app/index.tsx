import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { MoonDisc } from '../components/MoonDisc';
import { useSession } from '../lib/session';
import { colors, fonts, type } from '../theme';

export default function Welcome() {
  const { session, guest, continueAsGuest } = useSession();

  if (session || guest) return <Redirect href="/today" />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <MoonDisc size={150} illumination={0.3} waxing={false} />
        <Text style={[type.eyebrow, styles.brand]}>Salt &amp; Sovereignty</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Welcome home
        </Text>
        <Text style={styles.lede}>Your altar, grimoire and rituals, together in one quiet place.</Text>
      </View>

      <View style={styles.actions}>
        <Button label="Create your sanctuary" onPress={() => router.push('/sign-in?mode=create')} style={styles.big} />
        <Button label="Sign in" variant="outline" onPress={() => router.push('/sign-in')} style={styles.big} />
        <Text style={styles.note}>
          Already use the website? Sign in with the same account and your altars and grimoire come with you.
        </Text>
        <Button
          label="Continue as a guest"
          variant="text"
          accessibilityHint="Your sanctuary stays on this device until you sign in"
          onPress={async () => {
            await continueAsGuest();
            router.replace('/today');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground, paddingHorizontal: 28, paddingBottom: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { marginTop: 28, letterSpacing: 3 },
  title: { marginTop: 10, fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: colors.cream, textAlign: 'center' },
  lede: { ...type.body, fontSize: 16, lineHeight: 24, marginTop: 14, textAlign: 'center', maxWidth: 300 },
  actions: { gap: 12 },
  big: { minHeight: 52 },
  note: { ...type.caption, textAlign: 'center', marginTop: 4 },
});
