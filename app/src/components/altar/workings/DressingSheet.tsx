// Dress and anoint a candle: an oil, a few herbs, and which way to rub them
// on (toward you to draw, away to banish). Shows what they add up to before
// the candle is dressed.

import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../Button';
import { shortLabel } from '../../../lib/altar/cabinet';
import { dressingsOf, isCandle } from '../../../lib/altar/livingState';
import type { SavedObject } from '../../../lib/altar/types';
import { useWorkshop } from '../../../lib/altar/workshop';
import { DIRECTIONS, dressingCorrespondences, dressingEntry, dressWith, type Direction, type DressingEntry } from '../../../lib/altar/workings/dressing';
import { useLibrary } from '../../../lib/library';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Field, IngredientPicker, Label, nowIso, sheetStyles } from './common';

const COMMON_OILS = ['Rose', 'Lavender', 'Cinnamon', 'Frankincense', 'Rosemary', 'Sandalwood', 'Myrrh', 'Jasmine', 'Patchouli', 'Vanilla', 'Basil', 'Bay'];

type Props = {
  visible: boolean;
  /** The candle being dressed. */
  candle: SavedObject | null;
  onClose: () => void;
  /** The dressed candle (its livingState.candle.dressings added to): replace it on the altar. */
  onDress: (candle: SavedObject) => void;
};

export function DressingSheet({ visible, candle, onClose, onDress }: Props) {
  return (
    <Sheet visible={visible && !!candle && isCandle(candle)} eyebrow="Dress & anoint" title={shortLabel(candle?.label, 'Candle')} onClose={onClose}>
      {visible && candle && <Dresser key={String(candle.altarObjectId)} candle={candle} onDress={onDress} />}
    </Sheet>
  );
}

function Dresser({ candle, onDress }: { candle: SavedObject; onDress: Props['onDress'] }) {
  const { entries } = useLibrary();
  const { apothecary } = useWorkshop();
  const [oil, setOil] = useState<string | null>(null);
  const [typedOil, setTypedOil] = useState('');
  const [herbs, setHerbs] = useState<string[]>([]);
  const [direction, setDirection] = useState<Direction>('draw');
  const existing = dressingsOf(candle);
  const oils = [...apothecary.filter((a) => a.type === 'oil-tincture').map((a) => a.name), ...COMMON_OILS];

  const chosen = useMemo(() => {
    const now = nowIso();
    const list: DressingEntry[] = [];
    const oilName = typedOil.trim() || oil;
    if (oilName) list.push(dressingEntry('oil', oilName, direction, now, entries));
    for (const h of herbs) list.push(dressingEntry('herb', h, direction, now, entries));
    return list;
  }, [oil, typedOil, herbs, direction, entries]);
  const reading = dressingCorrespondences([...existing, ...chosen], entries);

  return (
    <View style={sheetStyles.section}>
      <Label>An oil</Label>
      <ChipRow>
        {oils.map((name) => (
          <Chip
            key={name}
            label={name}
            active={!typedOil.trim() && oil === name}
            onPress={() => {
              setTypedOil('');
              setOil(oil === name ? null : name);
            }}
          />
        ))}
      </ChipRow>
      <Field label="Or your own oil" value={typedOil} onChangeText={setTypedOil} placeholder="Or type your own blend" maxLength={40} />

      <Label>Herbs to roll it in</Label>
      <IngredientPicker
        kinds={['herb', 'cabinet']}
        placeholder="Search herbs…"
        chosen={herbs}
        onPick={(p) => setHerbs((h) => (h.some((x) => x.toLowerCase() === p.label.toLowerCase()) ? h.filter((x) => x.toLowerCase() !== p.label.toLowerCase()) : [...h, p.label].slice(0, 6)))}
      />
      {herbs.length > 0 && (
        <ChipRow>
          {herbs.map((h) => (
            <Chip key={h} label={`${h}  ×`} accessibilityLabel={`Remove ${h}`} onPress={() => setHerbs((list) => list.filter((x) => x !== h))} />
          ))}
        </ChipRow>
      )}

      <Label>Which way</Label>
      <ChipRow>
        {DIRECTIONS.map((d) => (
          <Chip key={d.id} label={d.label} active={direction === d.id} onPress={() => setDirection(d.id)} />
        ))}
      </ChipRow>
      <Text style={type.caption}>{DIRECTIONS.find((d) => d.id === direction)?.how}</Text>

      <View style={sheetStyles.card}>
        <Label>Together</Label>
        <Text style={type.body}>{reading.summary}</Text>
        {existing.length > 0 && <Text style={type.caption}>Already on it: {existing.map((d) => d.label).join(', ')}.</Text>}
      </View>
      <Button label="Dress the candle" disabled={!chosen.length} onPress={() => onDress(dressWith(candle, chosen, nowIso()))} />
    </View>
  );
}
