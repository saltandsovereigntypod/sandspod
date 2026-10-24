import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { OghamStave, RuneStone } from '../../../../../components/divination/Faces';
import { Card, MoreScreen, Notice } from '../../../../../components/more/ui';
import { divinationPage, findDivination, wordsLine } from '../../../../../lib/divination/library';
import { tarotImages } from '../../../../../lib/divination/tarotAssets';
import { TarotArt } from '../../../../../components/divination/TarotArt';
import { useMySettings } from '../../../../../lib/settings/store';
import { colors, fonts, radius, type } from '../../../../../theme';

// A tarot card, rune or ogham stave from the Grimoire's Traditional
// Information → Divination: its picture or letter, its three words, and the
// page in sections. As on the website's Book of Shadows.
export default function DivinationEntryPage() {
  const { kind, id } = useLocalSearchParams<{ kind: string; id: string }>();
  const { settings } = useMySettings();
  const entry = findDivination(kind, id);

  if (!entry) {
    return (
      <MoreScreen title="Divination" back="/grimoire" backLabel="Back to your Grimoire">
        <Text style={type.body}>This page couldn’t be found.</Text>
      </MoreScreen>
    );
  }

  const page = divinationPage(entry);
  const art = entry.cardId ? tarotImages[entry.cardId] : undefined;

  return (
    <MoreScreen title={entry.name} eyebrow={page.eyebrow} back="/grimoire" backLabel="Back to your Grimoire">
      {settings?.library_traditional_enabled === false ? (
        <Notice tone="muted">Traditional Information is turned off in your Living Library settings, so this page is hidden.</Notice>
      ) : (
        <>
          <View style={styles.figure}>
            {art ? (
              <TarotArt place={art} style={styles.card} accessibilityLabel={`${entry.name}, Pamela Colman Smith’s picture`} />
            ) : entry.kind === 'runes' ? (
              <RuneStone glyph={entry.glyph ?? ''} size={110} />
            ) : (
              <OghamStave glyph={entry.glyph ?? ''} width={52} height={200} />
            )}
          </View>
          <Text style={styles.words} accessibilityLabel={`In three words: ${entry.words.join(', ')}`}>
            {wordsLine(entry.words)}
          </Text>
          {!!page.gloss && <Text style={[type.caption, styles.center]}>{page.gloss}</Text>}
          <Card>
            {page.sections.map((section) => (
              <View key={section.key} style={styles.field}>
                <Text accessibilityRole="header" style={styles.fieldLabel}>
                  {section.label}
                </Text>
                <Text style={section.key === 'question' ? styles.question : type.body}>{section.text}</Text>
              </View>
            ))}
          </Card>
        </>
      )}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  figure: { alignItems: 'center', paddingVertical: 4 },
  card: { width: '62%', maxWidth: 280, aspectRatio: 0.58, borderRadius: radius.tile, backgroundColor: colors.cream },
  words: { fontFamily: fonts.displayItalic, fontSize: 22, lineHeight: 28, color: colors.parchment, textAlign: 'center' },
  center: { textAlign: 'center' },
  field: { gap: 6 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  question: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 26, color: colors.cream },
});
