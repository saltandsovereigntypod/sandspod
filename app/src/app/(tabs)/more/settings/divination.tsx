import { StyleSheet, Text, View } from 'react-native';

import { TarotArt } from '../../../../components/divination/TarotArt';
import { router } from 'expo-router';

import { Chips, MenuList, MenuRow, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { chosenDeck, DECK_SETTING, deckCardTitle, deckInfo, TAROT_DECKS, type DeckId } from '../../../../lib/divination/decks';
import { hiddenKinds, HIDDEN_KINDS_KEY, KIND_CHOICES, withKindShown } from '../../../../lib/divination/oracle/kinds';
import { tarotCard } from '../../../../lib/divination/tarot';
import { deckImages } from '../../../../lib/divination/tarotAssets';
import { colors, radius, type } from '../../../../theme';

// The cards to show three of, so the decks can be seen side by side.
const SAMPLES = ['01-the-magician', '17-the-star', 'cups-03'];

// Settings → Divination: which tarot deck to draw with (shared with the
// website; a tap on the draw screen changes it too, as your default), the
// draw's own choices, which kinds of draw are offered (once under My
// practice), and your own oracle decks.
export default function DivinationSettings() {
  return (
    <SettingsForm title="Divination">
      {(draft, set) => {
        const deck = chosenDeck(draft);
        const info = deckInfo(deck);
        const hidden = hiddenKinds(draft);
        return (
          <>
            <Section label="Tarot deck">
              <Text style={type.caption}>
                Every deck has all 78 cards, and each reads them in its own way: the Rider–Waite–Smith with A. E. Waite’s meanings, the others with their own. A reading you keep remembers the deck it was drawn with.
              </Text>
              <Chips label="Tarot deck" options={TAROT_DECKS.map((d) => ({ value: d.id, label: d.name }))} value={deck} onChange={(v: DeckId) => set(DECK_SETTING, v)} />
              <View style={styles.samples}>
                {SAMPLES.map((id) => (
                  <View key={id} style={styles.sample}>
                    <TarotArt place={deckImages[deck][id]} style={styles.card} />
                    <Text style={[type.caption, styles.center]} numberOfLines={2}>
                      {deckCardTitle(deck, id) ?? tarotCard(id)?.name}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={type.body}>{`${info.name}, ${info.made}. ${info.about}`}</Text>
              <Text style={type.caption}>{info.credit}</Text>
            </Section>
            <Section label="When you draw">
              <MenuList>
                <SwitchRow
                  label="Reversed cards"
                  detail="Some cards come up upside down, with their reversed meaning."
                  value={draft.divination_reversals === true}
                  onChange={(v) => set('divination_reversals', v)}
                />
                <SwitchRow
                  label="The blank rune"
                  detail="A modern addition to the set, standing for the unknown."
                  value={draft.divination_blank_rune === true}
                  onChange={(v) => set('divination_blank_rune', v)}
                  last
                />
              </MenuList>
            </Section>
            <Section label="What to draw">
              <Text style={type.caption}>The kinds the draw screen offers. Hide the ones you don’t use; your readings with them are kept.</Text>
              <MenuList>
                {KIND_CHOICES.map((k, index) => (
                  <SwitchRow
                    key={k.id}
                    label={k.label}
                    detail={k.detail}
                    value={!hidden.includes(k.id)}
                    onChange={(on) => set(HIDDEN_KINDS_KEY, withKindShown(draft, k.id, on))}
                    last={index === KIND_CHOICES.length - 1}
                  />
                ))}
              </MenuList>
            </Section>
            <Section label="Your oracle decks">
              <MenuList>
                <MenuRow label="Your oracle decks" detail="Decks of your own, card by card" onPress={() => router.push('/rituals/divination/decks')} last />
              </MenuList>
            </Section>
          </>
        );
      }}
    </SettingsForm>
  );
}


const styles = StyleSheet.create({
  samples: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  sample: { flex: 1, maxWidth: 110, gap: 4, alignItems: 'center' },
  card: { width: '100%', aspectRatio: 0.58, borderRadius: radius.tile, backgroundColor: colors.cream },
  center: { textAlign: 'center' },
});
