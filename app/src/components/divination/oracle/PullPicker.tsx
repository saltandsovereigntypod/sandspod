// Logging a physical pull: you drew real cards by hand, and pick here which
// card fell in each place of the spread, in order. Tap a card to put it in
// the next empty place; tap a place to take its card out again. Cards that
// can lie reversed can be turned. The draw this makes is kept like any other.

import { useState } from 'react';
import { Text, View } from 'react-native';

import type { Drawn, Spread } from '../../../lib/divination/draw';
import { colors, type } from '../../../theme';
import { Body, Chip, Chips, Field, List, Row, SectionLabel, ui } from '../../rituals/ui';

type Props = {
  spread: Spread;
  /** Every card (or rune, or stave) that could have been drawn, in deck order. */
  pool: string[];
  /** One per place: what's there so far, or null. */
  placed: (Drawn | null)[];
  onChange: (next: (Drawn | null)[]) => void;
  /** Whether a card can lie reversed (tarot, and decks of your own read that way). */
  reversible: boolean;
};

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function PullPicker({ spread, pool, placed, onChange, reversible }: Props) {
  const [query, setQuery] = useState('');
  const next = placed.findIndex((p) => !p);
  const used = new Set(placed.filter(Boolean).map((p) => p!.name));
  const words = fold(query).split(/\s+/).filter(Boolean);
  const choices = pool.filter((n) => !used.has(n) && words.every((w) => fold(n).includes(w)));
  const many = pool.length > 40;

  const put = (name: string) => {
    if (next < 0) return;
    onChange(placed.map((p, i) => (i === next ? { name, reversed: false } : p)));
    setQuery('');
  };
  const takeOut = (i: number) => onChange(placed.map((p, j) => (j === i ? null : p)));
  const turn = (i: number) => onChange(placed.map((p, j) => (j === i && p ? { ...p, reversed: !p.reversed } : p)));

  return (
    <View style={ui.gap}>
      <List>
        {spread.positions.map((pos, i) => {
          const p = placed[i];
          return (
            <Row
              key={i}
              icon="wheel"
              title={`${i + 1}. ${pos.name}`}
              detail={p ? `${p.name}${p.reversed ? ', reversed' : ''} · tap to take it out` : i === next ? 'Next: tap the card you drew below' : 'Empty'}
              last={i === spread.positions.length - 1}
              onPress={() => p && takeOut(i)}
            />
          );
        })}
      </List>
      {reversible && placed.some(Boolean) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Any that came up reversed?</SectionLabel>
          <Chips>
            {placed.map((p, i) =>
              p ? <Chip key={i} label={`${i + 1}. ${p.name}`} selected={p.reversed} a11yLabel={`${p.name}, ${p.reversed ? 'reversed. Turn upright' : 'upright. Turn reversed'}`} onPress={() => turn(i)} /> : null,
            )}
          </Chips>
        </View>
      )}
      {next >= 0 ? (
        <View style={ui.gapSmall}>
          <SectionLabel>{`Which card is in place ${next + 1}?`}</SectionLabel>
          {many && <Field label="Find a card" value={query} onChange={setQuery} placeholder="Type part of its name" />}
          <Chips>
            {(many && !query.trim() ? choices.slice(0, 36) : choices).map((n) => (
              <Chip key={n} label={n} a11yLabel={`${n}, in place ${next + 1}`} onPress={() => put(n)} />
            ))}
          </Chips>
          {many && !query.trim() && choices.length > 36 && <Body muted>Type to find the rest.</Body>}
          {!choices.length && <Body muted>No card by that name left.</Body>}
        </View>
      ) : (
        <Text style={[type.caption, { color: colors.gold }]}>Every place is filled.</Text>
      )}
    </View>
  );
}
