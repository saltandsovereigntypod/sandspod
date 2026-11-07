// The altar's round-two tools in the editor's panel: the pendulum (calibrated
// once, then asked, its swing played out), the mortar and pestle, the
// bolline, the cauldron, a crystal set to charge (and the grid), a tarot
// deck, rune bag or ogham staves drawn from, and a scrying mirror. The logic
// is lib/altar/craftTools.ts, shared with the website
// (altar/js/features/altar-craft.js).

import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TextInput, View } from 'react-native';

import { useReducedMotion } from '../../lib/accessibility/store';
import {
  ANSWERS,
  CHARGE_NOTE,
  CHARGE_PLACES,
  calibrationProblem,
  chargePlace,
  chargingGlow,
  chargingOf,
  deckKindOf,
  DRAW_LABEL,
  GRID_MIN,
  gridOf,
  isBolline,
  isCauldron,
  isMortar,
  isPendulum,
  isScryingGlass,
  isWand,
  mortarOf,
  PENDULUM_NOTE,
  SIMMER_SUGGESTIONS,
  simmerOf,
  simmeredDry,
  swingAt,
  SWINGS,
  USUAL_CALIBRATION,
  type Calibration,
  type ChargePlace,
  type MortarItem,
  type PendulumAnswer,
  type Swing,
} from '../../lib/altar/craftTools';
import { CLEAR_FORK_LABEL, CLEAR_FORK_NOTE } from '../../lib/altar/fork';
import { chargeGate, chargeIntentionLine } from '../../lib/altar/crystalCare';
import { crystalIntention } from '../../lib/altar/devotion';
import { offeringOf } from '../../lib/altar/offerings';
import { usePlace } from '../../lib/location';
import type { SavedObject } from '../../lib/altar/types';
import { colors, type } from '../../theme';
import { Button } from '../Button';
import { router, type Href } from 'expo-router';

/** The wand's grid is kept in Craft → Crystal → Grids, with its log. */
function GridHomeLink({ entryId }: { entryId?: string }) {
  return (
    <Button
      label="Its log in Crystal grids"
      variant="text"
      onPress={() => router.push((entryId ? { pathname: '/rituals/craft/crystal/grids', params: { id: entryId } } : '/rituals/craft/crystal/grids') as Href)}
    />
  );
}
import { Chip, ChipRow } from './Chip';

export type CraftActs = {
  calibrate: (c: Calibration) => void;
  ask: (question: string) => { answer: PendulumAnswer; swing: Swing } | null;
  addHerb: (item: MortarItem) => void;
  takeHerb: (label: string) => void;
  grind: () => void;
  placeBlend: () => void;
  burnBlend: () => void;
  bagBlend: () => void;
  saveBlend: () => void;
  emptyMortar: () => void;
  cutCord: (id: string) => void;
  harvest: () => void;
  carve: () => void;
  simmer: (items: string[]) => void;
  unsimmer: () => void;
  burnPetition: () => void;
  fillToScry: () => void;
  scry: (vessel: 'mirror' | 'cauldron') => void;
  charge: (how: ChargePlace) => void;
  /** Clear the stone with the 4096 Hz tuning fork. */
  clearFork: () => void;
  /** Set a piece of selenite from the cabinet under the stone. */
  placeSelenite: () => void;
  /** Give the stone an intention, or change it. */
  setIntention: (text: string) => void;
  takeUp: () => void;
  gridAll: () => void;
  releaseGrid: () => void;
  draw: (question: string) => void;
};

/** The pendulum's bob, swinging the way it answers (still, at its turn, with Reduce Motion). */
export function PendulumSwing({ swing, size = 120 }: { swing: Swing | null; size?: number }) {
  const still = useReducedMotion();
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!swing || still) return;
    t.setValue(0);
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [swing, still, t]);
  const steps = 16;
  const input = Array.from({ length: steps + 1 }, (_, i) => i / steps);
  const reach = size * 0.32;
  const pts = input.map((i) => (swing ? swingAt(swing, i) : { x: 0, y: 0 }));
  const x = t.interpolate({ inputRange: input, outputRange: pts.map((p) => p.x * reach) });
  const y = t.interpolate({ inputRange: input, outputRange: pts.map((p) => p.y * reach) });
  const turn = swing ? swingAt(swing, 0.25) : { x: 0, y: 0 };
  return (
    <View style={[styles.swingBox, { width: size, height: size }]} accessible accessibilityRole="image" accessibilityLabel={swing ? `The pendulum swings ${SWINGS.find((s) => s.id === swing)?.label.toLowerCase()}` : 'The pendulum hangs still'}>
      <View style={[styles.pivot, { left: size / 2 - 3 }]} />
      <Animated.View
        style={[
          styles.bob,
          { left: size / 2 - 9, top: size * 0.6 - 9 },
          still || !swing ? { transform: [{ translateX: turn.x * reach }, { translateY: turn.y * reach }] } : { transform: [{ translateX: x }, { translateY: y }] },
        ]}
      />
    </View>
  );
}

function Calibrate({ initial, onKeep }: { initial: Calibration | null; onKeep: (c: Calibration) => void }) {
  const [c, setC] = useState<Partial<Calibration>>(initial ?? {});
  const problem = calibrationProblem(c);
  return (
    <View style={styles.box}>
      <Text style={type.caption}>Hold your pendulum still, ask it to show you yes, then no, then maybe, and note how it moves for each. Set the same here. It’s kept for next time, here and on the website.</Text>
      {ANSWERS.map((a) => (
        <View key={a.id} style={styles.box}>
          <Text style={styles.label}>{a.label}</Text>
          <ChipRow>
            {SWINGS.map((s) => (
              <Chip key={s.id} label={s.label} active={c[a.id] === s.id} onPress={() => setC((x) => ({ ...x, [a.id]: s.id }))} />
            ))}
          </ChipRow>
        </View>
      ))}
      {problem && <Text style={type.caption}>{problem}</Text>}
      <Button label="Keep these" disabled={!!problem} onPress={() => onKeep(c as Calibration)} />
      <Button label="Use the usual ones" variant="outline" onPress={() => onKeep(USUAL_CALIBRATION)} />
    </View>
  );
}

function Pendulum({ calibration, act }: { calibration: Calibration | null; act: CraftActs }) {
  const [changing, setChanging] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ answer: PendulumAnswer; swing: Swing } | null>(null);
  const [swinging, setSwinging] = useState(false);
  useEffect(() => {
    if (!swinging) return;
    const id = setTimeout(() => setSwinging(false), 3200);
    return () => clearTimeout(id);
  }, [swinging]);
  if (!calibration || changing) {
    return (
      <Calibrate
        initial={calibration}
        onKeep={(c) => {
          act.calibrate(c);
          setChanging(false);
        }}
      />
    );
  }
  return (
    <View style={styles.box}>
      <TextInput
        value={question}
        onChangeText={setQuestion}
        placeholder="Your question, for a yes or no"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Your question for the pendulum"
        style={styles.input}
        maxLength={200}
      />
      <PendulumSwing swing={answer?.swing ?? null} />
      {answer && !swinging && <Text style={[type.body, styles.answer]}>{ANSWERS.find((a) => a.id === answer.answer)?.label}</Text>}
      <Button
        label={swinging ? 'Swinging…' : 'Ask'}
        disabled={swinging}
        onPress={() => {
          const r = act.ask(question);
          if (!r) return;
          setAnswer(r);
          setSwinging(true);
        }}
      />
      <Text style={type.caption}>Each answer is kept in your readings and in the altar’s History. {PENDULUM_NOTE}</Text>
      <Button label="Change how it answers" variant="text" onPress={() => setChanging(true)} />
    </View>
  );
}

function Mortar({ object, choices, act }: { object: SavedObject; choices: MortarItem[]; act: CraftActs }) {
  const still = useReducedMotion();
  const m = mortarOf(object);
  const [search, setSearch] = useState('');
  const [grinding, setGrinding] = useState(false);
  const [turn] = useState(() => new Animated.Value(0));
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return choices.filter((c) => !m.items.some((i) => i.label.toLowerCase() === c.label.toLowerCase()) && (!q || c.label.toLowerCase().includes(q))).slice(0, 18);
  }, [choices, search, m.items]);
  const grind = () => {
    setGrinding(true);
    turn.setValue(0);
    Animated.timing(turn, { toValue: still ? 0 : 4, duration: still ? 1 : 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(() => {
      setGrinding(false);
      act.grind();
    });
  };
  const spin = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.box}>
      <Text style={styles.label}>In the mortar</Text>
      {m.items.length ? (
        <ChipRow>
          {m.items.map((i) => (
            <Chip key={i.label} label={i.label} symbol="✕" accessibilityLabel={`Take out ${i.label}`} disabled={grinding} onPress={() => act.takeHerb(i.label)} />
          ))}
        </ChipRow>
      ) : (
        <Text style={type.caption}>Nothing yet. Add herbs and resins from the altar or the cabinet.</Text>
      )}
      {grinding && (
        <View style={styles.grind} accessibilityLiveRegion="polite" accessibilityLabel="Grinding">
          <Animated.Text style={[styles.pestle, { transform: [{ rotate: spin }] }]}>⟋</Animated.Text>
          <Text style={type.caption}>Grinding…</Text>
        </View>
      )}
      {m.ground ? (
        <>
          <Text style={type.caption}>Ground into a loose blend. What will you do with it?</Text>
          <Button label="Set the blend on the altar" onPress={act.placeBlend} />
          <Button label="Burn it as loose incense" variant="outline" onPress={act.burnBlend} />
          <Button label="Bag it as a sachet" variant="outline" onPress={act.bagBlend} />
          <Button label="Save as an Apothecary recipe" variant="outline" onPress={act.saveBlend} />
          <Button label="Empty the mortar" variant="text" onPress={act.emptyMortar} />
        </>
      ) : (
        <>
          <TextInput value={search} onChangeText={setSearch} placeholder="Find a herb or resin" placeholderTextColor={colors.muted} accessibilityLabel="Find a herb or resin to add" style={styles.input} />
          <ChipRow>
            {shown.map((c) => (
              <Chip key={c.label} label={c.label} symbol="+" disabled={grinding} onPress={() => act.addHerb(c)} />
            ))}
            {!!search.trim() && !shown.some((c) => c.label.toLowerCase() === search.trim().toLowerCase()) && (
              <Chip label={`Add “${search.trim()}”`} symbol="+" onPress={() => { act.addHerb({ label: search.trim(), type: 'herb' }); setSearch(''); }} />
            )}
          </ChipRow>
          <Button label="Grind" disabled={!m.items.length || grinding} onPress={grind} />
        </>
      )}
    </View>
  );
}

function Cauldron({ object, act }: { object: SavedObject; act: CraftActs }) {
  const simmer = simmerOf(object);
  const dry = simmeredDry(object);
  const water = offeringOf(object)?.kind === 'water';
  const [chosen, setChosen] = useState<string[]>([]);
  return (
    <View style={styles.box}>
      {simmer && !dry ? (
        <>
          <Text style={type.caption}>A simmer pot is steaming{simmer.items.length ? ` with ${simmer.items.join(', ').toLowerCase()}` : ''}.</Text>
          <Button label="Take it off" variant="outline" onPress={act.unsimmer} />
        </>
      ) : (
        <>
          <Text style={type.caption}>{dry ? 'The simmer pot has simmered dry. Start it again to top it up.' : 'A simmer pot: water and a few things from the kitchen, steaming gently to scent the room.'}</Text>
          <ChipRow>
            {SIMMER_SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} active={chosen.includes(s)} onPress={() => setChosen((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))} />
            ))}
          </ChipRow>
          <Button label="Start the simmer pot" onPress={() => act.simmer(chosen)} />
        </>
      )}
      <Button label="Burn a petition in it" variant="outline" onPress={act.burnPetition} />
      {water ? <Button label="Scry in the water" variant="outline" onPress={() => act.scry('cauldron')} /> : <Button label="Fill it with water to scry" variant="outline" onPress={act.fillToScry} />}
      <Text style={type.caption}>For real fire, keep a cauldron on a heatproof surface, with sand or salt in the bottom, and never leave a simmer pot on the stove unattended.</Text>
    </View>
  );
}

function Crystal({ object, objects, inGrid, gridEntry, crystals, act }: { object: SavedObject; objects: SavedObject[]; inGrid: boolean; gridEntry?: string; crystals: number; act: CraftActs }) {
  const c = chargingOf(object);
  const glow = chargingGlow(object);
  const place = usePlace();
  const [intention, setIntention] = useState('');
  const now = new Date();
  const at = now.toISOString();
  // When each way may charge (crystalCare.ts): the moon by night, the sun by day, selenite touching.
  const gates = CHARGE_PLACES.map((p) => ({ p, gate: chargeGate(object, p.id, objects, now, place) }));
  const held = crystalIntention(object, at);
  return (
    <View style={styles.box}>
      {c ? (
        <>
          <Text style={type.caption}>
            Charging {chargePlace(c.how)!.label.toLowerCase()}: {glow >= 1 ? 'fully charged. Take it up when you’re ready.' : `about ${Math.round(glow * 100)}% so far; the glow builds as it sits.`}
          </Text>
          <Button label="Take it up" onPress={act.takeUp} />
        </>
      ) : (
        <>
          <Text style={styles.label}>Charge it</Text>
          <ChipRow>
            {gates.map(({ p, gate }) => (
              <Chip key={p.id} label={p.label} onPress={() => act.charge(p.id)} accessibilityLabel={gate.ok ? p.label : `${p.label}: ${gate.line}`} />
            ))}
          </ChipRow>
          {gates.map(({ p, gate }) => (
            <Text key={p.id} style={type.caption}>{`${p.label}: ${gate.line}${gate.warn ? ` ${gate.warn}` : ''}`}</Text>
          ))}
          <Button label={CLEAR_FORK_LABEL} variant="outline" onPress={act.clearFork} />
          <Text style={type.caption}>{CLEAR_FORK_NOTE}</Text>
          {gates.some(({ gate }) => gate.offerSelenite) && <Button label="Place selenite from the cabinet" variant="outline" onPress={act.placeSelenite} />}
          <Text style={type.caption}>{chargeIntentionLine(object, at)}</Text>
          <Text style={type.caption}>{CHARGE_NOTE}</Text>
        </>
      )}
      <Text style={styles.label}>{held ? 'Change its intention' : 'Add an intention'}</Text>
      <TextInput
        value={intention}
        onChangeText={setIntention}
        placeholder={held || 'What is it for?'}
        placeholderTextColor={colors.muted}
        accessibilityLabel={held ? 'Change the stone’s intention' : 'Add an intention to the stone'}
        style={styles.input}
        maxLength={160}
      />
      <Button
        label={held ? 'Change its intention' : 'Add an intention'}
        variant="outline"
        disabled={!intention.trim()}
        onPress={() => {
          act.setIntention(intention);
          setIntention('');
        }}
      />
      {inGrid ? (
        <>
          <Button label="Let the grid rest" variant="outline" onPress={act.releaseGrid} />
          <GridHomeLink entryId={gridEntry} />
        </>
      ) : (
        crystals >= GRID_MIN && <Text style={type.caption}>For a crystal grid, tap Select, choose {GRID_MIN} or more crystals, and activate them with the wand.</Text>
      )}
    </View>
  );
}

export function CraftPanel({
  object,
  objects,
  extra,
  calibration,
  choices,
  cords,
  act,
}: {
  object: SavedObject;
  objects: SavedObject[];
  extra: Record<string, unknown>;
  calibration: Calibration | null;
  choices: MortarItem[];
  cords: { id: string; label: string }[];
  act: CraftActs;
}) {
  const [question, setQuestion] = useState('');
  const grid = gridOf(extra);
  const crystals = objects.filter((o) => o.type === 'crystal').length;
  if (isPendulum(object)) return <Pendulum calibration={calibration} act={act} />;
  if (isMortar(object)) return <Mortar object={object} choices={choices} act={act} />;
  if (isCauldron(object)) return <Cauldron object={object} act={act} />;
  if (object.type === 'crystal') return <Crystal object={object} objects={objects} inGrid={!!grid?.ids.includes(String(object.altarObjectId))} gridEntry={grid?.entryId} crystals={crystals} act={act} />;
  if (isBolline(object)) {
    return (
      <View style={styles.box}>
        <Text style={styles.label}>Cut a cord</Text>
        {cords.length ? (
          <ChipRow>
            {cords.map((c) => (
              <Chip key={c.id} label={c.label} symbol="╳" onPress={() => act.cutCord(c.id)} />
            ))}
          </ChipRow>
        ) : (
          <Text style={type.caption}>No cord is tied on the altar. Tie one between two candles in Workings.</Text>
        )}
        <Button label="Harvest a sprig" variant="outline" onPress={act.harvest} />
        <Button label="Carve a candle" variant="outline" onPress={act.carve} />
      </View>
    );
  }
  const deck = deckKindOf(object);
  if (deck) {
    return (
      <View style={styles.box}>
        <TextInput value={question} onChangeText={setQuestion} placeholder="Your question (or leave it open)" placeholderTextColor={colors.muted} accessibilityLabel="Your question for the draw" style={styles.input} maxLength={200} />
        <Button
          label={DRAW_LABEL[deck]}
          onPress={() => {
            act.draw(question);
            setQuestion('');
          }}
        />
        <Text style={type.caption}>It’s laid beside the {deck === 'tarot' ? 'deck' : deck === 'runes' ? 'bag' : 'staves'} and kept in your readings.</Text>
      </View>
    );
  }
  if (isScryingGlass(object)) {
    return (
      <View style={styles.box}>
        <Button label="Scry in the mirror" onPress={() => act.scry('mirror')} />
        <Text style={type.caption}>The altar dims and the candlelight shows in the glass. A timer keeps the time, then a few words on what you saw.</Text>
      </View>
    );
  }
  if (isWand(object)) {
    if (grid)
      return (
        <View style={styles.box}>
          <Button label="Let the crystal grid rest" variant="outline" onPress={act.releaseGrid} />
          <GridHomeLink entryId={grid.entryId} />
        </View>
      );
    if (crystals >= GRID_MIN) {
      return (
        <View style={styles.box}>
          <Button label="Activate every crystal here as a grid" variant="outline" onPress={act.gridAll} />
          <Text style={type.caption}>Or tap Select, choose the crystals for the grid, and activate them with the wand.</Text>
        </View>
      );
    }
  }
  return null;
}

/** While choosing several: a grid of the chosen crystals, lit with the wand. */
export function GridBar({ count, onActivate }: { count: number; onActivate: () => void }) {
  if (count < GRID_MIN) return null;
  return (
    <View style={[styles.box, styles.bar]}>
      <Text style={type.caption}>{count} crystals chosen.</Text>
      <Button label="Activate with the wand" onPress={onActivate} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 10 },
  bar: { borderWidth: 1, borderColor: colors.goldLine, borderRadius: 12, padding: 12, marginBottom: 12 },
  label: { ...type.caption, color: colors.gold },
  input: { ...type.body, color: colors.cream, borderWidth: 1, borderColor: colors.hairline, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  answer: { textAlign: 'center', color: colors.gold, fontSize: 20 },
  swingBox: { alignSelf: 'center' },
  pivot: { position: 'absolute', top: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.muted },
  bob: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: colors.gold, borderWidth: 2, borderColor: colors.goldLine },
  grind: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pestle: { fontSize: 28, color: colors.gold },
});
