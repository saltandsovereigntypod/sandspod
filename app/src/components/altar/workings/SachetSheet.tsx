// Sachets and charm bags: fill it, tie it with knots, carry it or keep it on
// the altar, and feed it on its planet's day.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button } from '../../Button';
import { shortLabel } from '../../../lib/altar/cabinet';
import { PLANETS, PLANET_DAY, WEEKDAY_NAMES, type Planet } from '../../../lib/altar/reading/correspondence';
import type { SavedObject } from '../../../lib/altar/types';
import { startItemLookBack } from '../../../lib/altar/apothecaryLookBack';
import { saveApothecary, useWorkshop } from '../../../lib/altar/workshop';
import type { LookBackPick } from '../../rituals/DidItWork';
import { ItemLookBackPicker, PlacedDidItWork } from '../../rituals/ItemDidItWork';
import {
  addFilling,
  emptySachet,
  FEEDING_CHOICES,
  feedingDue,
  feedingLine,
  feedSachet,
  filling,
  KNOT_CHOICES,
  KNOT_MEANING,
  removeFilling,
  sachetItem,
  sachetObject,
  sachetPlanet,
  sachetProblem,
  sachetStateOf,
  setCarried,
  type FillingKind,
  type SachetDraft,
} from '../../../lib/altar/workings/sachet';
import { useLibrary } from '../../../lib/library';
import { colors, touch, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Field, IngredientPicker, Label, nowIso, sheetStyles, type AltarContext, type Picked } from './common';
import type { PlacedWorking } from './SpellJarSheet';

const PURPOSES = ['Protection', 'Love', 'Luck', 'Calm', 'Good sleep', 'Courage', 'Travel', 'Healing'];

type Props = {
  visible: boolean;
  altar: AltarContext;
  onClose: () => void;
  /** The tied bag, saved to My Apothecary: add `object` to the altar. */
  onPlace: (result: PlacedWorking) => void;
  center?: { cx: number; cy: number };
};

/** A little pouch, drawn with its fillings peeking out and its knots. */
function Pouch({ colors: fill, knots }: { colors: string[]; knots: number }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`A charm bag with ${fill.length} thing${fill.length === 1 ? '' : 's'} in it, tied with ${knots} knot${knots === 1 ? '' : 's'}`} style={styles.pouch}>
      <Svg width={110} height={110} viewBox="0 0 100 100">
        {fill.slice(0, 7).map((c, i) => (
          <Circle key={i} cx={34 + i * 5.5} cy={30 - (i % 2) * 4} r={5} fill={c} />
        ))}
        <Path d="M28 34 q22 -8 44 0 q10 26 4 46 q-26 12 -52 0 q-6 -20 4 -46 z" fill="#8a6a4a" stroke="#5c4632" strokeWidth={1.5} />
        <Path d="M30 38 q20 6 40 0" stroke="#e2c36d" strokeWidth={2} fill="none" />
        {Array.from({ length: Math.min(9, knots) }, (_, i) => (
          <Circle key={`k${i}`} cx={50 - ((Math.min(9, knots) - 1) * 4) / 2 + i * 4} cy={39} r={1.8} fill="#e2c36d" />
        ))}
      </Svg>
    </View>
  );
}

export function SachetSheet(props: Props) {
  return (
    <Sheet visible={props.visible} eyebrow="Sachet & charm bag" title="Fill a bag" onClose={props.onClose}>
      {props.visible && <SachetBuilder {...props} />}
    </Sheet>
  );
}

function SachetBuilder({ altar, onPlace, center }: Props) {
  const { entries } = useLibrary();
  const { userId } = useWorkshop();
  const [bag, setBag] = useState<SachetDraft>(() => emptySachet());
  const [kind, setKind] = useState<FillingKind>('herb');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // "Did it work?": the day that suits its purpose, unless another is chosen.
  const [lookBack, setLookBack] = useState<{ pick: LookBackPick; custom: string }>({ pick: 'suggested', custom: '' });
  const planet: Planet = bag.planet ?? sachetPlanet(bag.fillings);

  const add = (p: Picked) => {
    const k: FillingKind = p.type === 'crystal' ? 'stone' : p.type === 'herb' ? 'herb' : kind;
    setBag((b) => addFilling(b, filling(p.label, k, { herb: p.herb, crystal: p.crystal }, entries)));
  };

  const tie = async () => {
    const why = sachetProblem(bag);
    if (why) return setProblem(why);
    setBusy(true);
    const now = nowIso();
    let item = startItemLookBack(sachetItem(bag, now), lookBack.pick, new Date(now), lookBack.custom);
    try {
      item = await saveApothecary(userId, item, null);
    } catch {
      // Still placed; it saves with the altar.
    }
    const result = sachetObject(bag, altar.objects, now, center, item);
    setBusy(false);
    onPlace(result);
  };

  return (
    <View style={sheetStyles.section}>
      <Pouch colors={bag.fillings.map((f) => f.color)} knots={bag.knots} />
      <Label>What is it for?</Label>
      <ChipRow>
        {PURPOSES.map((p) => (
          <Chip key={p} label={p} active={bag.purpose === p} onPress={() => setBag((b) => ({ ...b, purpose: p }))} />
        ))}
      </ChipRow>
      <Field label="The bag’s purpose, in your words" value={bag.purpose} onChangeText={(purpose) => setBag((b) => ({ ...b, purpose }))} placeholder="Or in your own words" maxLength={120} />

      <Label>Fill it</Label>
      <ChipRow>
        {(['herb', 'stone', 'item'] as const).map((k) => (
          <Chip key={k} label={k === 'herb' ? 'Herbs' : k === 'stone' ? 'Stones' : 'Small things'} active={kind === k} onPress={() => setKind(k)} />
        ))}
      </ChipRow>
      <IngredientPicker
        key={kind}
        onPick={add}
        kinds={kind === 'herb' ? ['herb', 'cabinet'] : kind === 'stone' ? ['crystal', 'cabinet'] : ['salt', 'apothecary']}
        suggestFor={bag.purpose}
        placeholder={kind === 'item' ? 'A coin, a key, a written name…' : kind === 'stone' ? 'Search stones…' : 'Search herbs…'}
        chosen={bag.fillings.map((f) => f.label)}
      />
      {bag.fillings.length > 0 && (
        <ChipRow>
          {bag.fillings.map((f, i) => (
            <Chip key={`${f.label}-${i}`} label={`${f.label}  ×`} accessibilityLabel={`Take out ${f.label}`} onPress={() => setBag((b) => removeFilling(b, i))} />
          ))}
        </ChipRow>
      )}

      <Label>Tie it</Label>
      <ChipRow>
        {KNOT_CHOICES.map((n) => (
          <Chip key={n} label={`${n} knot${n === 1 ? '' : 's'}`} active={bag.knots === n} onPress={() => setBag((b) => ({ ...b, knots: n }))} />
        ))}
      </ChipRow>
      <Text style={type.caption}>{KNOT_MEANING[bag.knots]}.</Text>

      <Label>Keep it</Label>
      <ChipRow>
        <Chip label="Carry it with me" active={bag.carried} onPress={() => setBag((b) => ({ ...b, carried: true }))} />
        <Chip label="Keep it on the altar" active={!bag.carried} onPress={() => setBag((b) => ({ ...b, carried: false }))} />
      </ChipRow>

      <Label>Feed it on</Label>
      <ChipRow>
        {PLANETS.map((p) => (
          <Chip key={p} label={`${WEEKDAY_NAMES[PLANET_DAY[p]]} · ${p}`} active={planet === p} onPress={() => setBag((b) => ({ ...b, planet: p }))} />
        ))}
      </ChipRow>
      <Text style={type.caption}>{bag.planet ? 'Your choice.' : 'Chosen from what’s inside; tap another to change it.'}</Text>

      <Field label="Name the bag" value={bag.name} onChangeText={(name) => setBag((b) => ({ ...b, name }))} placeholder={`${bag.purpose.trim() || 'Charm'} bag`} maxLength={60} />
      <ItemLookBackPicker
        item={{ id: '', name: bag.name || `${bag.purpose.trim()} bag`, intention: bag.purpose, createdAt: '' }}
        value={lookBack.pick}
        custom={lookBack.custom}
        onChange={(pick, custom) => setLookBack({ pick, custom })}
      />
      {problem && <Text style={sheetStyles.problem}>{problem}</Text>}
      <Button label={busy ? 'Tying…' : 'Tie it and place it'} onPress={tie} disabled={busy} />
    </View>
  );
}

// ---------------------------------------------------------------- feeding a placed bag

type FeedProps = {
  visible: boolean;
  object: SavedObject | null;
  onClose: () => void;
  onUpdate: (object: SavedObject) => void;
};

/** A placed bag: what's in it, carried or kept, and feeding it on its day. */
export function SachetFeedSheet({ visible, object, onClose, onUpdate }: FeedProps) {
  const state = object ? sachetStateOf(object) : null;
  const [withWhat, setWithWhat] = useState(FEEDING_CHOICES[0]);
  const now = new Date();
  return (
    <Sheet visible={visible && !!state} size="half" eyebrow="Charm bag" title={shortLabel(object?.label, 'Charm bag')} onClose={onClose}>
      {state && object && (
        <View style={sheetStyles.section}>
          <Pouch colors={state.fillings.map((f) => f.color)} knots={state.knots} />
          <Text style={type.body}>{state.fillings.map((f) => f.label).join(', ')}.</Text>
          <Text style={type.caption}>{feedingLine(state, now)}</Text>
          <ChipRow>
            {FEEDING_CHOICES.map((c) => (
              <Chip key={c} label={c} active={withWhat === c} onPress={() => setWithWhat(c)} />
            ))}
          </ChipRow>
          <Button
            label={feedingDue(state, now) ? 'Feed it today' : 'Feed it anyway'}
            variant={feedingDue(state, now) ? 'primary' : 'outline'}
            onPress={() => onUpdate(feedSachet(object, nowIso(), withWhat))}
          />
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: state.carried }}
            accessibilityLabel="Carried with me"
            onPress={() => onUpdate(setCarried(object, !state.carried, nowIso()))}
            style={styles.toggle}
          >
            <Text style={sheetStyles.value}>{state.carried ? '✓ Carried with me' : 'Kept on the altar'}</Text>
            <Text style={type.caption}>Tap to change</Text>
          </Pressable>
          {state.feedings.length > 0 && (
            <Text style={type.caption}>
              Fed {state.feedings.length} time{state.feedings.length === 1 ? '' : 's'}, last on {new Date(state.feedings[state.feedings.length - 1].at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}.
            </Text>
          )}
          <PlacedDidItWork apothecaryItemId={object.apothecaryItemId} />
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  pouch: { alignItems: 'center' },
  toggle: { minHeight: touch, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 8 },
});
