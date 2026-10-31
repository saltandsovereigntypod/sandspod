import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OghamStave, RuneStone } from '../../../../../components/divination/Faces';
import { KipperFace, LenormandArt } from '../../../../../components/divination/oracle/OracleFaces';
import { ResearchFooter } from '../../../../../components/ResearchNote';
import { YourDraws } from '../../../../../components/divination/YourDraws';
import { Card, Chips, MoreScreen, Notice, Section } from '../../../../../components/more/ui';
import { deckMeaning, deckPage, readingSource, RWS_TRADITION } from '../../../../../lib/divination/deckMeanings';
import { chosenDeck, deckCardTitle, deckInfo, deckPictureLabel, isDeckId, TAROT_DECKS, type DeckId } from '../../../../../lib/divination/decks';
import { divinationPage, findDivination, wordsLine } from '../../../../../lib/divination/library';
import { deckImages } from '../../../../../lib/divination/tarotAssets';
import { TarotArt } from '../../../../../components/divination/TarotArt';
import { useMySettings } from '../../../../../lib/settings/store';
import { colors, fonts, radius, type } from '../../../../../theme';

// A tarot card, rune or ogham stave from the Grimoire's Traditional
// Information → Divination: its picture or letter, its three words, and the
// page in sections. A tarot card in a deck with its own reading (the Tarot
// de Marseille, the Sola Busca) leads with that reading, and the
// Rider–Waite–Smith's in-depth page follows, labelled as that tradition.
// Opened from a reading, it shows the deck the reading was drawn with
// (`deck`). As on the website's Book of Shadows.
export default function DivinationEntryPage() {
  const { kind, id, deck: drawnWith } = useLocalSearchParams<{ kind: string; id: string; deck?: string }>();
  const { settings } = useMySettings();
  const entry = findDivination(kind, id);
  // The deck it was drawn with, or your deck; the others a tap away, just for this page.
  const [looking, setLooking] = useState<DeckId | null>(null);
  const deck = looking ?? (isDeckId(drawnWith) ? drawnWith : chosenDeck(settings));

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
  // The deck's own reading, when it has one for this card; else a word that what follows is Waite's.
  const own = entry.cardId ? deckPage(deck, entry.cardId) : null;
  const fallback = entry.cardId && !own ? readingSource(deckMeaning(deck, entry.cardId)) : null;

  return (
    <MoreScreen title={entry.name} eyebrow={page.eyebrow} back="/grimoire" backLabel="Back to your Grimoire">
      {settings?.library_traditional_enabled === false ? (
        <Notice tone="muted">Traditional Information is turned off in your Living Library settings, so this page is hidden.</Notice>
      ) : (
        <>
          <View style={styles.figure}>
            {art ? (
              <TarotArt place={art} style={styles.card} accessibilityLabel={`${entry.name}, ${deckPictureLabel(deck)}`} />
            ) : entry.kind === 'lenormand' ? (
              <LenormandArt id={entry.id} style={styles.lenormand} accessibilityLabel={`${entry.name}, the Bruges card of the 1890s`} />
            ) : entry.kind === 'kipper' ? (
              <View style={styles.kipper} accessible accessibilityRole="image" accessibilityLabel={`${entry.name}, card ${entry.glyph}`}>
                <KipperFace name={entry.name} width={170} />
              </View>
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
          {!own && (
            <Text style={styles.words} accessibilityLabel={`In three words: ${entry.words.join(', ')}`}>
              {wordsLine(entry.words)}
            </Text>
          )}
          {!!page.gloss && <Text style={[type.caption, styles.center]}>{page.gloss}</Text>}
          {own && (
            <Section label={own.heading}>
              {!!own.about && <Text style={type.caption}>{own.about}</Text>}
              <Card tone="gold">
                {own.sections.map((section) => (
                  <View key={section.key} style={styles.field}>
                    <Text accessibilityRole="header" style={styles.fieldLabel}>
                      {section.label}
                    </Text>
                    {!!section.keywords && <Text style={[type.body, styles.keywords]}>{section.keywords}</Text>}
                    <Text style={section.key === 'note' ? type.caption : type.body}>{section.text}</Text>
                  </View>
                ))}
              </Card>
            </Section>
          )}
          {!!fallback && <Notice tone="muted">{fallback}</Notice>}
          {own && (
            <Text accessibilityRole="header" style={type.eyebrow}>
              {RWS_TRADITION}
            </Text>
          )}
          {own && (
            <Text style={styles.wordsSmall} accessibilityLabel={`In three words: ${entry.words.join(', ')}`}>
              {wordsLine(entry.words)}
            </Text>
          )}
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
          <YourDraws name={entry.name} />
          <ResearchFooter page={entry.name} kind={page.eyebrow} />
        </>
      )}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  figure: { alignItems: 'center', paddingVertical: 4 },
  card: { width: '62%', maxWidth: 280, aspectRatio: 0.58, borderRadius: radius.tile, backgroundColor: colors.cream },
  lenormand: { width: '62%', maxWidth: 280, aspectRatio: 0.68, borderRadius: radius.tile, backgroundColor: colors.cream },
  kipper: { width: 170, height: 170 / 0.62 },
  words: { fontFamily: fonts.displayItalic, fontSize: 22, lineHeight: 28, color: colors.parchment, textAlign: 'center' },
  wordsSmall: { fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 24, color: colors.parchment },
  keywords: { color: colors.gold },
  center: { textAlign: 'center' },
  decks: { gap: 8, alignItems: 'center' },
  field: { gap: 6 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  question: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 26, color: colors.cream },
});
