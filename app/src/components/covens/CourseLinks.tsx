// A program step's links into the rest of the Sanctuary (its holy days,
// Library entries, ready-made rituals, journeys, spreads, the ritual builder
// and the rest), kept in the step's resources as [[go:…]] markers
// (lib/covens/courseLinks.ts). Shown as small links that open the same thing
// the website's step opens.

import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { courseLinkAppHref, courseLinkLabel, courseLinks } from '../../lib/covens/courseLinks';
import { colors, fonts, radius, type } from '../../theme';

export function CourseLinks({ resources, covenSlug }: { resources: string | null | undefined; covenSlug: string }) {
  const links = courseLinks(resources)
    .map((l) => ({ label: courseLinkLabel(l), href: courseLinkAppHref(l, covenSlug), key: `${l.kind}:${l.id}` }))
    .filter((l): l is { label: string; href: string; key: string } => !!l.href);
  if (!links.length) return null;
  return (
    <View style={styles.wrap}>
      <Text style={type.caption}>Find it in the Sanctuary</Text>
      <View style={styles.links}>
        {links.map((l) => (
          <Pressable
            key={l.key}
            accessibilityRole="link"
            accessibilityLabel={`Open ${l.label}`}
            onPress={() => router.push(l.href as Href)}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          >
            <Text style={styles.linkText}>{l.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  link: { borderRadius: radius.chip, borderWidth: 1, borderColor: colors.goldLine, paddingHorizontal: 10, paddingVertical: 5, minHeight: 32, justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  linkText: { fontFamily: fonts.body, fontSize: 13, color: colors.gold },
});
