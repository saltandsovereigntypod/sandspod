// Select mode's panel: how many things are chosen, and what can be done to
// all of them at once. Dragging any chosen thing on the altar moves them all.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { selectionWords } from '../../lib/altar/selection';
import { type } from '../../theme';
import { Chip, ChipRow } from './Chip';

export type SelectionActions = {
  all: () => void;
  none: () => void;
  done: () => void;
  remove: () => void;
  group: () => void;
  ungroup: () => void;
  layer: (to: 'front' | 'back') => void;
  light: (on: boolean) => void;
  lock: (on: boolean) => void;
};

type Props = {
  count: number;
  total: number;
  /** How many of the chosen are candles that could be lit, and that are lit. */
  unlit: number;
  lit: number;
  /** The chosen include a group (so Ungroup applies), and all of them are one group already. */
  grouped: boolean;
  oneGroup: boolean;
  locked: boolean;
  act: SelectionActions;
};

export function SelectionPanel({ count, total, unlit, lit, grouped, oneGroup, locked, act }: Props) {
  const [confirm, setConfirm] = useState(false);
  const none = count === 0;
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={type.eyebrow}>Choosing several</Text>
          <Text style={type.cardTitle} accessibilityLiveRegion="polite">
            {none ? 'Nothing chosen yet' : `${selectionWords(count)} chosen`}
          </Text>
          <Text style={type.caption}>
            {none
              ? 'Tap things on the altar to choose them. Tap again to leave one out.'
              : 'Tap to add or leave out. Drag any chosen thing to move them all together.'}
          </Text>
        </View>
        <Button label="Done" variant="text" onPress={act.done} accessibilityHint="Stops choosing several" />
      </View>
      <ChipRow>
        {count < total ? <Chip label="Choose all" symbol="☑" onPress={act.all} /> : <Chip label="Choose none" symbol="☐" onPress={act.none} />}
      </ChipRow>
      {!none && (
        <>
          <ChipRow>
            {count > 1 && !oneGroup && <Chip label="Group" symbol="⊕" accessibilityLabel={`Group these ${count} so they move together`} onPress={act.group} />}
            {grouped && <Chip label="Ungroup" symbol="⊘" onPress={act.ungroup} />}
            <Chip label="To front" symbol="⤒" onPress={() => act.layer('front')} />
            <Chip label="To back" symbol="⤓" onPress={() => act.layer('back')} />
            {unlit > 0 && <Chip label={unlit > 1 ? `Light ${unlit} candles` : 'Light the candle'} symbol="✺" onPress={() => act.light(true)} />}
            {lit > 0 && <Chip label={lit > 1 ? `Snuff ${lit} candles` : 'Snuff the candle'} symbol="◌" onPress={() => act.light(false)} />}
            <Chip label={locked ? 'Unlock' : 'Lock'} symbol="⚿" active={locked} onPress={() => act.lock(!locked)} />
          </ChipRow>
          {confirm ? (
            <View style={styles.confirm}>
              <Text style={type.body}>{`Delete ${selectionWords(count)} from the altar? Undo brings them back.`}</Text>
              <ChipRow>
                <Chip
                  label={`Delete ${count === 1 ? 'it' : `all ${count}`}`}
                  tone="danger"
                  onPress={() => {
                    setConfirm(false);
                    act.remove();
                  }}
                />
                <Chip label="Keep them" onPress={() => setConfirm(false)} />
              </ChipRow>
            </View>
          ) : (
            <ChipRow>
              <Chip label={count === 1 ? 'Delete' : `Delete ${count}`} tone="danger" onPress={() => setConfirm(true)} />
            </ChipRow>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  confirm: { gap: 8 },
});
