import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { SITE_LINKS, SITE_SECTION_TITLE, SITE_SMALL_LINKS } from '../lib/siteLinks';
import { colors, fonts } from '../theme';
import { MoreIcon } from './more/MoreIcon';

/** Open a page of the website: in this same tab on the web, in the in-app browser on a phone. */
export function openSitePage(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.assign(url);
    return;
  }
  WebBrowser.openBrowserAsync(url).catch(() => {
    void Linking.openURL(url).catch(() => {});
  });
}

/**
 * On the web, a name that shows on hover (the folded side bar shows icons only).
 * A ref callback, as react-native-web passes no title through.
 */
export function hoverTitle(label: string | null) {
  if (Platform.OS !== 'web') return undefined;
  return (node: unknown) => {
    const el = node as { setAttribute?: (k: string, v: string) => void; removeAttribute?: (k: string) => void } | null;
    if (!el?.setAttribute) return;
    if (label) el.setAttribute('title', label);
    else el.removeAttribute?.('title');
  };
}

/** The website's pages under the side bar's tabs; as icons only when the bar is folded to a rail. */
export function SidebarSiteLinks({ rail }: { rail: boolean }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.divider} />
      {!rail && <Text style={styles.heading}>{SITE_SECTION_TITLE}</Text>}
      {SITE_LINKS.map((link) => (
        <Pressable
          key={link.key}
          accessibilityRole="link"
          accessibilityLabel={link.label}
          ref={hoverTitle(rail ? link.label : null)}
          onPress={() => openSitePage(link.url)}
          style={({ pressed }) => [styles.row, rail && styles.rowRail, pressed && styles.hover]}
        >
          <MoreIcon name={link.icon} color={colors.tabInactive} size={18} />
          {!rail && <Text style={styles.label}>{link.label}</Text>}
        </Pressable>
      ))}
    </View>
  );
}

/** Privacy and Terms, in small text at the very bottom of the menu. */
export function SiteSmallPrint({ rail = false }: { rail?: boolean }) {
  return (
    <View style={[styles.small, rail && styles.smallRail]}>
      {SITE_SMALL_LINKS.map((link) => (
        <Text
          key={link.key}
          accessibilityRole="link"
          onPress={() => openSitePage(link.url)}
          style={styles.smallText}
        >
          {link.label}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2, marginTop: 8 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(244,236,216,0.18)', marginHorizontal: 12, marginBottom: 10 },
  heading: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.tabInactive, paddingHorizontal: 12, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 36, paddingHorizontal: 14, borderRadius: 10 },
  rowRail: { justifyContent: 'center', paddingHorizontal: 0 },
  hover: { backgroundColor: 'rgba(244,236,216,0.06)' },
  label: { fontFamily: fonts.body, fontSize: 14, color: colors.tabInactive },
  small: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  smallRail: { flexDirection: 'column', alignItems: 'center', gap: 4, paddingHorizontal: 0 },
  smallText: { fontFamily: fonts.body, fontSize: 11, color: colors.tabInactive, textDecorationLine: 'underline' },
});
