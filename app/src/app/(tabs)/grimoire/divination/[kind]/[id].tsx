import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OghamStave, RuneStone } from '../../../../../components/divination/Faces';
import { ResearchFooter } from '../../../../../components/ResearchNote';
import { Card, Chips, MoreScreen, Notice } from '../../../../../components/more/ui';
import { chosenDeck, deckCardTitle, deckInfo, deckPictureLabel, TAROT_DECKS, type DeckId } from '../../../../../lib/divination/decks';
import { divinationPage, findDivination, wordsLine } from '../../../../../lib/divination/library';
import { deckImages } from '../../../../../lib/divination/tarotAssets';
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
  // Your deck first; the others a tap away, just for this page.
  const [looking, setLooking] = useState<DeckId | null>(null);
  const deck = looking ?? chosenDeck(settings);

  if (!entry) {
    return (
      <MoreScreen title="Divination" back="/grimoire" backLabel="Back to your Grimoire">
        <Text style={type.body}>This page couldn’t be found.</Text>
      </MoreScreen>
    );
  }

  const page = divinationPage(entry);
  const art = entry.cardId ? deckImages[deck][entry.cardId] : undefined;
  const deckTitle = entry.cardId ? deckCardTitle(deck, entry.cardId) : null;

  return (
    <MoreScreen title={entry.name} eyebrow={page.eyebrow} back="/grimoire" backLabel="Back to your Grimoire">
      {settings?.library_traditional_enabled === false ? (
        <Notice tone="muted">Traditional Information is turned off in your Living Library settings, so this page is hidden.</Notice>
      ) : (
        <>
          <View style={styles.figure}>
            {art ? (
              <TarotArt place={art} style={styles.card} accessibilityLabel={`${entry.name}, ${deckPictureLabel(deck)}`} />
            ) : entry.kind === 'runes' ? (
              <RuneStone glyph={entry.glyph ?? ''} size={110} />
            ) : (
              <OghamStave glyph={entry.glyph ?? ''} width={52} height={200} />
            )}
          </View>
          {!!art && (
            <View style={styles.decks}>
              <Text style={[type.caption, styles.center]}>{deckTitle ? `${deckInfo(deck).name}: ${deckTitle}` : `${deckInfo(deck).name}, ${deckInfo(deck).made}`}</Text>
              <Chips label="Deck" options={TAROT_DECKS.map((d) => ({ value: d.id, label: d.name }))} value={deck} onChange={setLooking} />
            </View>
          )}
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
          <ResearchFooter page={entry.name} kind={page.eyebrow} />
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
  decks: { gap: 8, alignItems: 'center' },
  field: { gap: 6 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  question: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 26, color: colors.cream },
});
