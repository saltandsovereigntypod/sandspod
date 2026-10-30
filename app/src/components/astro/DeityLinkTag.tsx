import { StyleSheet, Text, View } from 'react-native';

import { DEITY_LINK_LABEL, type DeityLink } from '../../lib/astro/planetGuides';
import { colors, fonts, radius } from '../../theme';

/** "Ancient link" or "Modern link": how a god came to be tied to a planet. */
export function DeityLinkTag({ link }: { link: DeityLink }) {
  const label = DEITY_LINK_LABEL[link];
  return (
    <View
      style={[styles.tag, link === 'modern' && styles.modern]}
      accessibilityLabel={link === 'ancient' ? `${label}: attested in antiquity or the tradition's own sources` : `${label}: a link made in modern practice`}
    >
      <Text style={[styles.text, link === 'modern' && styles.modernText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.gold, borderRadius: radius.chip, paddingHorizontal: 8, paddingVertical: 2 },
  modern: { borderColor: colors.muted },
  text: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.gold },
  modernText: { color: colors.muted },
});
