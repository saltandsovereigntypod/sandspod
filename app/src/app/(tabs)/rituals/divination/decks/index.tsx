import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, List, RitualScreen, Row, Title, ui } from '../../../../../components/rituals/ui';
import { useCraft } from '../../../../../lib/craft/store';
import { DECKS_COLLECTION, ownDecks } from '../../../../../lib/divination/oracle/decks';
import { colors } from '../../../../../theme';

// Your own oracle decks: each with its cards, to draw from here or to log
// the cards you pull by hand. Kept in `hedge.oracleDecks`, as on the website.
export default function Decks() {
  const { entries, ready } = useCraft<unknown>(DECKS_COLLECTION);
  const decks = useMemo(() => ownDecks(entries), [entries]);
  return (
    <RitualScreen back="Back">
      <Title eyebrow="Divination">Your decks</Title>
      <Body muted>Oracle decks you own or made: give each its cards (a photo of each if you like, and what it means to you), then draw from it with any spread, or log the cards you pull by hand.</Body>
      <View style={ui.actions}>
        <Button label="Make a deck" onPress={() => router.push('/rituals/divination/decks/edit' as Href)} />
      </View>
      {!ready ? (
        <Body muted>Opening…</Body>
      ) : decks.length === 0 ? (
        <Card>
          <Body>No decks yet. Start with its name; you can paste in a whole list of cards at once, one “Name — meaning” to a line.</Body>
        </Card>
      ) : (
        <List>
          {decks.map((d, i) => (
            <Row
              key={d.id}
              icon="wheel"
              title={d.data.name}
              detail={[`${d.data.cards.length} ${d.data.cards.length === 1 ? 'card' : 'cards'}`, d.data.detail || null].filter(Boolean).join(' · ')}
              right={d.data.cover ? <Image source={{ uri: d.data.cover }} style={styles.cover} accessibilityIgnoresInvertColors /> : undefined}
              last={i === decks.length - 1}
              onPress={() => router.push({ pathname: '/rituals/divination/decks/edit', params: { id: d.id } })}
            />
          ))}
        </List>
      )}
      {decks.length > 0 && <Button label="Draw from your decks" variant="outline" onPress={() => router.push({ pathname: '/rituals/divination/draw', params: { kind: 'oracle' } })} />}
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  cover: { width: 32, height: 48, borderRadius: 4, borderWidth: 1, borderColor: colors.goldLine },
});
