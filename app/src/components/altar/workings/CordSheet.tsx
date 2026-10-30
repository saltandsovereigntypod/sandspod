// Cord cutting: tie a cord between two candles on the altar, or set out a
// pair of chime candles with a cord already tied between them. The cord
// burns through when either candle has burned down to it (lib/altar/cord.ts).

import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CORD_COLORS, CORD_HEIGHTS, DEFAULT_CORD_HEIGHT } from '../../../lib/altar/cord';
import { altarLibraryHref } from '../../../lib/library';
import { type } from '../../../theme';
import { Button } from '../../Button';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Field, Label, sheetStyles } from './common';

export type CordChoice = { height: number; color: string; intention: string };

type Props = {
  visible: boolean;
  /** Candles that can take a cord (not burned down, not tied already). */
  candles: { id: string; label: string }[];
  /** Start with this candle chosen (from its panel). */
  first?: string | null;
  onClose: () => void;
  onTie: (a: string, b: string, choice: CordChoice) => void;
  /** Set out two new candles with the cord tied between them. */
  onPair: (choice: CordChoice) => void;
};

export function CordSheet({ visible, candles, first, onClose, onTie, onPair }: Props) {
  return (
    <Sheet visible={visible} eyebrow="Cord cutting" title="Tie a cord between two candles" onClose={onClose}>
      {visible && <CordForm candles={candles} first={first ?? null} onTie={onTie} onPair={onPair} onClose={onClose} />}
    </Sheet>
  );
}

function CordForm({ candles, first, onTie, onPair, onClose }: Omit<Props, 'visible'>) {
  const [picked, setPicked] = useState<string[]>(() => (first && candles.some((c) => c.id === first) ? [first] : []));
  const [height, setHeight] = useState<number>(DEFAULT_CORD_HEIGHT);
  const [color, setColor] = useState<string>('red');
  const [intention, setIntention] = useState('');
  const choice = { height, color, intention };
  const toggle = (id: string) => setPicked((now) => (now.includes(id) ? now.filter((x) => x !== id) : [...now, id].slice(-2)));
  return (
    <View style={sheetStyles.section}>
      <Text style={sheetStyles.body}>
        Two candles, one for you and one for what you’re letting go of: a person, a habit, a hold something has on you. A cord tied between them burns
        through when the candles burn down to it. Light them when you’re ready; the altar keeps count while they burn.
      </Text>
      <Text style={type.caption}>
        With real candles, stay with them while they burn and keep the cord away from anything that could catch. Snuff them if you need to step away;
        the cord waits.
      </Text>
      <Button
        label="About cords, in the Living Library"
        variant="text"
        onPress={() => {
          onClose();
          router.push(altarLibraryHref({ id: 'traditional:tool:cord' }));
        }}
      />

      <Label>How far down</Label>
      <ChipRow>
        {CORD_HEIGHTS.map((h) => (
          <Chip key={h.value} label={h.label} active={height === h.value} onPress={() => setHeight(h.value)} />
        ))}
      </ChipRow>
      <Text style={type.caption}>Higher burns through sooner; lower asks for longer.</Text>

      <Label>The cord</Label>
      <ChipRow>
        {CORD_COLORS.map((c) => (
          <Chip key={c.id} label={c.label} active={color === c.id} onPress={() => setColor(c.id)} />
        ))}
      </ChipRow>

      <Label>What it stands for (if you like)</Label>
      <Field label="What the cord stands for" value={intention} onChangeText={setIntention} placeholder="An old tie, a promise that’s run its course…" />

      <Label>Candles on this altar</Label>
      {candles.length >= 2 ? (
        <>
          <ChipRow>
            {candles.map((c) => (
              <Chip key={c.id} label={c.label} symbol={picked.includes(c.id) ? '✓' : '○'} active={picked.includes(c.id)} onPress={() => toggle(c.id)} />
            ))}
          </ChipRow>
          <Button
            label={picked.length < 2 ? 'Choose two candles' : 'Tie the cord between them'}
            disabled={picked.length < 2}
            onPress={() => onTie(picked[0], picked[1], choice)}
          />
        </>
      ) : (
        <Text style={type.caption}>
          {candles.length === 1 ? 'There’s one candle free on this altar; a cord needs two.' : 'There are no free candles on this altar yet.'} Set out a pair
          below, or place candles from the cabinet first.
        </Text>
      )}

      <Label>Or a fresh pair</Label>
      <Text style={type.caption}>Two chime candles, white and black, side by side with the cord tied between them. A chime burns about two hours.</Text>
      <Button label="Set out a pair with a cord" variant="outline" onPress={() => onPair(choice)} />
    </View>
  );
}
