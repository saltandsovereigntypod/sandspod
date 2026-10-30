import { router, useGlobalSearchParams, usePathname, type Href } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { SITE_ORIGIN } from '../lib/covens/invites';
import { colors, type } from '../theme';

// A link this version of the app doesn't know (an old link, or one made for a
// newer version). Offer the same page on the website, which always has it,
// rather than a dead end.
export default function NotFound() {
  const path = usePathname();
  const params = useGlobalSearchParams();
  const query = Object.entries(params)
    .filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
    .join('&');
  const web = `${SITE_ORIGIN}${path || '/'}${query ? `?${query}` : ''}`;
  return (
    <View style={styles.page}>
      <Text style={type.title}>This link isn’t in the app yet</Text>
      <Text style={[type.body, styles.text]}>
        It may need the newest version of the app: close the app fully and open it again to update. Or open the same page on the website.
      </Text>
      <Button label="Open it on the website" onPress={() => void Linking.openURL(web)} />
      <Button label="Go to Today" variant="outline" onPress={() => router.replace('/' as Href)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.ground, padding: 24, paddingTop: 96, gap: 16 },
  text: { marginBottom: 8 },
});
