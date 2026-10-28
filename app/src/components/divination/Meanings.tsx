import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StaveGlyph } from './Faces';
import { KipperFace, LenormandArt } from './oracle/OracleFaces';
import { TarotArt } from './TarotArt';
import { Disclosure } from '../grimoire/Home';
import { Icon } from '../Icon';
import { countOf, DIVINATION_TITLE, divinationRoute, wordsLine, type DivinationEntry, type DivinationGroup } from '../../lib/divination/library';
import { divinationReadingRoute } from '../../lib/divination/links';
import { deckImages } from '../../lib/divination/tarotAssets';
import type { DeckId } from '../../lib/divination/decks';
import { colors, fonts, type } from '../../theme';

/**
 * Card meanings: Tarot, Runes, Ogham and the oracle decks as sibling
 * drop-downs, each card or stave a row with its picture or letter and its
 * three words, opening its page. Searching opens the ones that match.
 * The Grimoire shows it under Traditional Information; Rituals → Divination
 * shows it as "Card meanings", opening each page inside Rituals (`inRituals`).
 */
export function DivinationMeanings({
  groups,
  searching,
  opened,
  onToggle,
  deck,
  inRituals,
  titled = true,
}: {
  groups: DivinationGroup[];
  searching: boolean;
  opened: Set<string>;
  onToggle: (key: string) => void;
  deck: DeckId;
  inRituals?: boolean;
  titled?: boolean;
}) {
  return (
    <View style={styles.pathSection}>
      {titled && <Text style={styles.groupTitle}>{DIVINATION_TITLE}</Text>}
      {groups.map((group) => {
        const key = `traditional:divination:${group.kind}`;
        const open = searching || opened.has(key);
        return (
          <View key={key} style={styles.list}>
            <Disclosure label={group.label} note={open && !searching ? group.note : undefined} count={countOf(group)} open={open} onPress={() => onToggle(key)} />
            {open &&
              group.subgroups.map((sub) => (
                <View key={sub.key}>
                  {group.subgroups.length > 1 && <Text style={[type.caption, styles.subgroup]}>{sub.label}</Text>}
                  {sub.entries.map((entry) => (
                    <DivinationRow key={entry.id} entry={entry} deck={deck} inRituals={inRituals} />
                  ))}
                </View>
              ))}
          </View>
        );
      })}
    </View>
  );
}

function DivinationRow({ entry, deck, inRituals }: { entry: DivinationEntry; deck: DeckId; inRituals?: boolean }) {
  // The card in your chosen deck (Settings → Divination).
  const art = entry.cardId ? deckImages[deck][entry.cardId] : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.name}: ${entry.words.join(', ')}`}
      onPress={() => router.push((inRituals ? divinationReadingRoute(entry) : divinationRoute(entry)) as Href)}
      style={({ pressed }) => [styles.shelfEntry, styles.divinationEntry, pressed && styles.pressed]}
    >
      {art ? (
        <TarotArt place={art} style={styles.thumb} />
      ) : entry.kind === 'lenormand' ? (
        <LenormandArt id={entry.id} style={styles.thumb} />
      ) : entry.kind === 'kipper' ? (
        <View style={styles.thumb}>
          <KipperFace name={entry.name} width={26} />
        </View>
      ) : (
        <StaveGlyph glyph={entry.glyph ?? ''} kind={entry.kind === 'ogham' ? 'ogham' : 'runes'} size={26} />
      )}
      <View style={styles.grow}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={type.caption} numberOfLines={1}>
          {wordsLine(entry.words)}
        </Text>
      </View>
      <Icon name="chevron" size={14} color={colors.tabInactive} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  groupTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  shelfEntry: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(244,236,216,0.14)',
  },
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  pathSection: { gap: 8, borderLeftWidth: 2, borderLeftColor: colors.goldLine, paddingLeft: 10 },
  subgroup: { paddingTop: 10, paddingBottom: 4, color: colors.gold },
  divinationEntry: { minHeight: 56, paddingVertical: 6 },
  thumb: { width: 26, height: 45, borderRadius: 3, backgroundColor: colors.cream },
  pressed: { opacity: 0.7 },
  rowTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
});
