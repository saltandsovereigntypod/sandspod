// Three workings made on the altar and tended there: a poppet (made step by
// step, held weekly, and in the end unmade), a witch's ladder or knotted cord
// (knots tied one by one with a line spoken over each, untied to release),
// and a crystal grid (planned, set out in its shape with the cabinet's own
// crystals, tended and taken down). Each placed thing keeps its own state in
// livingState.app; grids keep their log in Craft → Crystal → Grids.

import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Button } from '../../Button';
import { GridBuilder } from '../../craft/GridBuilder';
import { shortLabel } from '../../../lib/altar/cabinet';
import { gridLinkOf, gridObjects } from '../../../lib/altar/workings/crystalGrid';
import { chantLine, emptyKnots, endKnots, KNOT_CHARMS, KNOT_COUNTS, KNOT_ENDS, knotObject, knotOrder, knotsLine, knotsProblem, knotStateOf, MODES, nextKnot, STYLES, tieKnot, tiedCount, TRADITIONAL_KNOTS, UNTIE_LINE, untieKnot, untiedToday, type KnotDraft } from '../../../lib/altar/workings/knots';
import { addDraftPin, addPoppetFilling, BODIES, emptyPoppet, endPoppet, ENDINGS, FOCUS, holdCount, MAKING_STEPS, pinPoppet, POPPET_ETHICS, poppetItem, poppetLine, poppetObject, poppetProblem, poppetStateOf, removeDraftPin, setLook, tendPoppet, toggleStep, unpinPoppet, type PoppetDraft, type PoppetEnd } from '../../../lib/altar/workings/poppet';
import { artBodyOf, lookWords } from '../../../lib/altar/workings/poppetLook';
import { startItemLookBack } from '../../../lib/altar/apothecaryLookBack';
import type { SavedObject } from '../../../lib/altar/types';
import { saveApothecary, useWorkshop } from '../../../lib/altar/workshop';
import type { FillingKind } from '../../../lib/altar/workings/sachet';
import { activationSteps, emptyGrid, gridName, gridProblem, gridProgress, GRIDS, logGrid, normaliseGrid, tendedToday, type Grid } from '../../../lib/craft/crystal/grids';
import { addEntry, updateEntry, useCraft } from '../../../lib/craft/store';
import { useLibrary } from '../../../lib/library';
import { colors, touch, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Field, IngredientPicker, Label, nowIso, sheetStyles, type AltarContext, type Picked } from './common';
import { BodyChooser, ColourChooser, EyeChooser, LinkChooser, PinBoard, PinList, PinMaker, SealChooser, StuffingChooser, usesOf } from './PoppetParts';
import type { PlacedWorking } from './SpellJarSheet';

const PURPOSES = ['Healing', 'Protection', 'Rest', 'Courage', 'Self-love', 'A fresh start'];

type Center = { cx: number; cy: number };

// ─── Poppet ───────────────────────────────────────────────────────────────

/** A simple figure, filled with the colours of what's inside. */
function Figure({ colors: fill, ended }: { colors: string[]; ended?: boolean }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`A poppet${fill.length ? ` filled with ${fill.length} thing${fill.length === 1 ? '' : 's'}` : ''}${ended ? ', its work done' : ''}`} style={sheetStyles.center}>
      <Svg width={100} height={110} viewBox="0 0 100 110">
        <Path d="M50 8 a12 12 0 1 1 -0.1 0 z M38 30 h24 l22 12 -4 8 -18 -6 v22 l10 34 -9 3 -13 -30 -13 30 -9 -3 10 -34 v-22 l-18 6 -4 -8 z" fill={ended ? '#6a5e4c' : '#c8b28a'} stroke="#5c4632" strokeWidth={1.5} />
        {fill.slice(0, 6).map((c, i) => (
          <Circle key={i} cx={42 + (i % 3) * 8} cy={44 + Math.floor(i / 3) * 9} r={3.2} fill={c} />
        ))}
        <Path d="M38 30 v40 M62 30 v40" stroke="#5c4632" strokeWidth={0.8} strokeDasharray="2 2" />
      </Svg>
    </View>
  );
}

export function PoppetSheet(props: { visible: boolean; altar: AltarContext; center?: Center; onClose: () => void; onPlace: (r: PlacedWorking) => void }) {
  return (
    <Sheet visible={props.visible} eyebrow="Poppet" title="Make a poppet" onClose={props.onClose}>
      {props.visible && <PoppetBuilder {...props} />}
    </Sheet>
  );
}

function PoppetBuilder({ altar, center, onPlace }: { altar: AltarContext; center?: Center; onPlace: (r: PlacedWorking) => void }) {
  const { entries } = useLibrary();
  const { userId } = useWorkshop();
  const [d, setD] = useState<PoppetDraft>(emptyPoppet);
  const [kind, setKind] = useState<FillingKind>('herb');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const add = (p: Picked) => setD((x) => addPoppetFilling(x, p.label, p.type === 'crystal' ? 'stone' : p.type === 'herb' ? 'herb' : kind, { herb: p.herb, crystal: p.crystal }, entries));

  const place = async () => {
    const why = poppetProblem(d);
    if (why) return setProblem(why);
    setBusy(true);
    const now = nowIso();
    let item = startItemLookBack(poppetItem(d, now), 'suggested', new Date(now), '');
    let kept = true;
    try {
      item = await saveApothecary(userId, item, null);
    } catch {
      kept = false;
    }
    const result = poppetObject(d, altar.objects, now, center, item);
    setBusy(false);
    onPlace({ ...result, kept });
  };

  return (
    <View style={sheetStyles.section}>
      {artBodyOf(d.body) ? <PinBoard look={{ ...d.look, body: d.body }} pins={d.pins} /> : <Figure colors={d.fillings.map((f) => f.color)} />}
      {artBodyOf(d.body) && <Text style={[type.caption, styles.centerText]}>{lookWords({ ...d.look, body: d.body })}</Text>}
      <View style={sheetStyles.card}>
        <Label>Before you begin</Label>
        <Text style={sheetStyles.body}>{POPPET_ETHICS}</Text>
      </View>
      <Label>Who or what it stands for</Label>
      <ChipRow>
        {FOCUS.map((f) => (
          <Chip key={f.key} label={f.label} active={d.focus === f.key} onPress={() => setD((x) => ({ ...x, focus: f.key, consent: f.key === 'other' ? x.consent : false }))} />
        ))}
      </ChipRow>
      <Text style={type.caption}>{FOCUS.find((f) => f.key === d.focus)?.detail}</Text>
      {d.focus !== 'self' && <Field label="Who or what it stands for" value={d.who} onChangeText={(who) => setD((x) => ({ ...x, who }))} placeholder={d.focus === 'other' ? 'Their name' : 'The situation, in a few words'} maxLength={80} />}
      {d.focus === 'other' && (
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: d.consent }} onPress={() => setD((x) => ({ ...x, consent: !x.consent }))} style={styles.toggle}>
          <Text style={sheetStyles.value}>{d.consent ? '✓ They asked for this and agreed' : 'They asked for this and agreed'}</Text>
        </Pressable>
      )}

      <Label>What it’s for</Label>
      <ChipRow>
        {PURPOSES.map((p) => (
          <Chip key={p} label={p} active={d.purpose === p} onPress={() => setD((x) => ({ ...x, purpose: p }))} />
        ))}
      </ChipRow>
      <Field label="Its purpose, in your words" value={d.purpose} onChangeText={(purpose) => setD((x) => ({ ...x, purpose }))} placeholder="Or in your own words" maxLength={120} />

      <Label>Make it</Label>
      {MAKING_STEPS.map((step, i) => (
        <View key={step.id} style={styles.stepBox}>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: d.made.includes(step.id) }} onPress={() => setD((x) => toggleStep(x, step.id))} style={styles.stepHead}>
            <Text style={sheetStyles.value}>{`${d.made.includes(step.id) ? '✓' : `${i + 1}.`} ${step.title}`}</Text>
            <Text style={sheetStyles.body}>{step.text}</Text>
          </Pressable>
          {step.id === 'shape' && (
            <>
              <BodyChooser bodies={BODIES} body={d.body} onBody={(body) => setD((x) => setLook(x, { body }))} />
              {artBodyOf(d.body) && (
                <>
                  <ColourChooser look={{ ...d.look, body: d.body }} onColour={(colour) => setD((x) => setLook(x, { colour }))} />
                  <EyeChooser eyes={d.look.eyes} onEyes={(eyes) => setD((x) => setLook(x, { eyes }))} />
                </>
              )}
            </>
          )}
          {step.id === 'fill' && (
            <>
              <StuffingChooser
                stuffing={d.look.stuffing}
                onStuffing={(stuffing) => setD((x) => setLook(x, { stuffing }))}
                chosen={d.fillings.map((f) => f.label)}
                onAdd={(label, k) => setD((x) => addPoppetFilling(x, label, k, {}, entries))}
              />
              <Label>Herbs, stones and small things</Label>
              <ChipRow>
                {(['herb', 'stone', 'item'] as const).map((k) => (
                  <Chip key={k} label={k === 'herb' ? 'Herbs' : k === 'stone' ? 'Stones' : 'Small things'} active={kind === k} onPress={() => setKind(k)} />
                ))}
              </ChipRow>
              <IngredientPicker key={kind} onPick={add} kinds={kind === 'herb' ? ['herb', 'cabinet'] : kind === 'stone' ? ['crystal', 'cabinet'] : ['salt', 'apothecary', 'cabinet']} suggestFor={d.purpose} placeholder={kind === 'item' ? 'A written name, a button, a thread…' : kind === 'stone' ? 'Search stones…' : 'Search herbs…'} chosen={d.fillings.map((f) => f.label)} />
              {d.fillings.length > 0 && (
                <ChipRow>
                  {d.fillings.map((f, j) => (
                    <Chip key={`${f.label}-${j}`} label={`${f.label}  ×`} accessibilityLabel={`Take out ${f.label}`} onPress={() => setD((x) => ({ ...x, fillings: x.fillings.filter((_, n) => n !== j) }))} />
                  ))}
                </ChipRow>
              )}
              {d.fillings.some((f) => usesOf(f.label)) && <Text style={type.caption}>{d.fillings.map((f) => (usesOf(f.label) ? `${f.label}: ${usesOf(f.label)}` : '')).filter(Boolean).join('. ')}</Text>}
            </>
          )}
          {step.id === 'link' && <LinkChooser taglock={d.look.taglock} onTaglock={(taglock) => setD((x) => setLook(x, { taglock }))} />}
          {step.id === 'close' && <SealChooser seal={d.look.seal} onSeal={(seal) => setD((x) => setLook(x, { seal }))} />}
        </View>
      ))}

      {artBodyOf(d.body) && (
        <View style={sheetStyles.section}>
          <Label>Pins (optional)</Label>
          <Text style={type.caption}>Pins in a poppet here are for healing and focus: each one sets an intention into that part of the body. You can add or take them out later on the altar.</Text>
          <PinMaker look={{ ...d.look, body: d.body }} pins={d.pins} onSet={(pin) => setD((x) => addDraftPin(x, pin))} />
          <PinList pins={d.pins} onRemove={(i) => setD((x) => removeDraftPin(x, i))} removeLabel="Remove" />
        </View>
      )}

      <Field label="Name the poppet" value={d.name} onChangeText={(name) => setD((x) => ({ ...x, name }))} placeholder="A name of its own (optional)" maxLength={60} />
      {problem && <Text style={sheetStyles.problem}>{problem}</Text>}
      <Button label={busy ? 'Placing…' : 'Name it and set it on the altar'} onPress={place} disabled={busy} />
    </View>
  );
}

export function PoppetTendSheet({ visible, object, onClose, onUpdate }: { visible: boolean; object: SavedObject | null; onClose: () => void; onUpdate: (o: SavedObject, said: string) => void }) {
  const state = object ? poppetStateOf(object) : null;
  const [words, setWords] = useState('');
  const [ending, setEnding] = useState<PoppetEnd | null>(null);
  const now = new Date();
  return (
    <Sheet visible={visible && !!state} size="half" eyebrow="Poppet" title={shortLabel(object?.label, 'Poppet')} onClose={onClose}>
      {state && object && (
        <View style={sheetStyles.section}>
          {state.look && artBodyOf(state.body) ? (
            <View style={{ opacity: state.ended ? 0.62 : 1 }}>
              <PinBoard look={{ ...state.look, body: state.body }} pins={state.pins} />
            </View>
          ) : (
            <Figure colors={state.fillings.map((f) => f.color)} ended={!!state.ended} />
          )}
          {state.look && <Text style={[type.caption, styles.centerText]}>{lookWords({ ...state.look, body: state.body })}</Text>}
          <Text style={type.body}>{`For ${state.purpose.toLowerCase() || 'a working'}${state.who ? `, standing for ${state.who}` : state.focus === 'self' ? ', standing for you' : ''}.`}</Text>
          <Text style={type.caption}>{poppetLine(state, now)}</Text>
          {!state.ended && (
            <>
              <Field label="What you say as you hold it" value={words} onChangeText={setWords} placeholder="Held and spoken to" maxLength={300} />
              <Button
                label="Hold it"
                onPress={() => {
                  onUpdate(tendPoppet(object, nowIso(), words), 'Held and spoken to.');
                  setWords('');
                }}
              />
              {state.look && artBodyOf(state.body) && (
                <>
                  <Label>Pins</Label>
                  <PinList
                    pins={state.pins}
                    onRemove={(i) => {
                      onUpdate(unpinPoppet(object, i, nowIso(), words), 'The pin is out. Thank it for its work.');
                      setWords('');
                    }}
                  />
                  {state.pins.length > 0 && <Text style={type.caption}>Taking a pin out is kept as its own moment, with anything you say above.</Text>}
                  <PinMaker look={{ ...state.look, body: state.body }} pins={state.pins} label="Set it in" onSet={(pin) => onUpdate(pinPoppet(object, pin, nowIso()), 'The pin is in.')} />
                </>
              )}
              <Label>When the work is done</Label>
              <ChipRow>
                {ENDINGS.map((e) => (
                  <Chip key={e.key} label={e.label} active={ending === e.key} onPress={() => setEnding(e.key)} />
                ))}
              </ChipRow>
              {ending && (
                <>
                  <Text style={sheetStyles.body}>{ENDINGS.find((e) => e.key === ending)?.text}</Text>
                  <Button label="It’s done" variant="outline" onPress={() => onUpdate(endPoppet(object, ending, nowIso(), words), 'The poppet’s work is done. Thank it.')} />
                </>
              )}
            </>
          )}
          {holdCount(state) > 0 && <Text style={type.caption}>{`Held ${holdCount(state)} time${holdCount(state) === 1 ? '' : 's'}.`}</Text>}
          {state.tendings.some((t) => t.kind === 'pin' || t.kind === 'unpin') && (
            <View style={sheetStyles.section}>
              {state.tendings
                .filter((t) => t.kind === 'pin' || t.kind === 'unpin')
                .slice(-6)
                .map((t, i) => (
                  <Text key={`${t.at}-${i}`} style={type.caption}>{`${new Date(t.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}: ${t.text}`}</Text>
                ))}
            </View>
          )}
        </View>
      )}
    </Sheet>
  );
}

// ─── Witch's ladder and knotted cord ─────────────────────────────────────

/** The cord drawn with its knots where they sit, tied ones filled. */
function Cord({ count, tied, untied }: { count: number; tied: number[]; untied: number[] }) {
  const h = 200;
  const y = (place: number) => 14 + ((h - 28) * (place - 1)) / Math.max(1, count - 1);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`A cord with ${count} knots, ${tied.length - untied.length} tied`} style={sheetStyles.center}>
      <Svg width={60} height={h}>
        <Line x1={30} y1={4} x2={30} y2={h - 4} stroke="#a82428" strokeWidth={3} />
        {Array.from({ length: count }, (_, i) => i + 1).map((place) => {
          const on = tied.includes(place) && !untied.includes(place);
          return <Circle key={place} cx={30} cy={y(place)} r={on ? 7 : 4} fill={on ? '#6a1418' : 'transparent'} stroke="#a82428" strokeWidth={1.5} />;
        })}
      </Svg>
    </View>
  );
}

export function KnotSheet({ visible, altar, center, onClose, onPlace }: { visible: boolean; altar: AltarContext; center?: Center; onClose: () => void; onPlace: (o: SavedObject) => void }) {
  const [d, setD] = useState<KnotDraft>(() => emptyKnots());
  const [problem, setProblem] = useState<string | null>(null);
  const order = knotOrder(d.count);
  return (
    <Sheet visible={visible} eyebrow="Knot magic" title="A witch’s ladder or knotted cord" onClose={onClose}>
      {visible && (
        <View style={sheetStyles.section}>
          <ChipRow>
            {STYLES.map((s) => (
              <Chip key={s.key} label={s.label} active={d.style === s.key} onPress={() => setD((x) => ({ ...x, style: s.key, count: s.key === 'ladder' ? TRADITIONAL_KNOTS : x.count }))} />
            ))}
          </ChipRow>
          <Text style={type.caption}>{STYLES.find((s) => s.key === d.style)?.line}</Text>
          <Label>What the knots hold</Label>
          <Field label="What the knots hold" value={d.intent} onChangeText={(intent) => setD((x) => ({ ...x, intent }))} placeholder="A safe home, a wish, an illness to let go" maxLength={120} />
          <ChipRow>
            {MODES.map((m) => (
              <Chip key={m.key} label={m.label} active={d.mode === m.key} onPress={() => setD((x) => ({ ...x, mode: m.key }))} />
            ))}
          </ChipRow>
          <Text style={type.caption}>{MODES.find((m) => m.key === d.mode)?.line}</Text>
          <Label>How many knots</Label>
          <ChipRow>
            {KNOT_COUNTS.map((n) => (
              <Chip key={n} label={n === TRADITIONAL_KNOTS ? `${n} · the usual` : String(n)} active={d.count === n} onPress={() => setD((x) => ({ ...x, count: n }))} />
            ))}
          </ChipRow>
          <Text style={type.caption}>{`Tied in this order along the cord: ${order.join(', ')}. The ends first, then the middle, then the gaps between.`}</Text>
          {d.style === 'ladder' && (
            <>
              <Label>Into each knot</Label>
              <Text style={type.caption}>{`Choose up to ${d.count}, in the order you’ll tie them. Real feathers from moulted birds, not wild-caught.`}</Text>
              <ChipRow>
                {KNOT_CHARMS.map((c) => (
                  <Chip key={c} label={c} onPress={() => setD((x) => (x.with.length >= x.count ? x : { ...x, with: [...x.with, c] }))} />
                ))}
              </ChipRow>
              {d.with.length > 0 && (
                <ChipRow>
                  {d.with.map((c, i) => (
                    <Chip key={`${c}-${i}`} label={`${i + 1}. ${c}  ×`} accessibilityLabel={`Take out ${c}`} onPress={() => setD((x) => ({ ...x, with: x.with.filter((_, j) => j !== i) }))} />
                  ))}
                </ChipRow>
              )}
            </>
          )}
          <View style={sheetStyles.card}>
            <Label>The words</Label>
            {Array.from({ length: Math.min(d.count, 9) }, (_, i) => (
              <Text key={i} style={sheetStyles.body}>
                {chantLine(i + 1, d.count, d.mode)}
              </Text>
            ))}
            {d.count === 9 && d.mode === 'bind' && <Text style={type.caption}>A modern Wiccan knot chant, widely shared; its author isn’t known for certain.</Text>}
          </View>
          {problem && <Text style={sheetStyles.problem}>{problem}</Text>}
          <Button
            label="Set the cord on the altar"
            onPress={() => {
              const why = knotsProblem(d);
              if (why) return setProblem(why);
              onPlace(knotObject(d, altar.objects, nowIso(), center));
              setD(emptyKnots(d.style));
            }}
          />
          <Text style={type.caption}>The name comes from a cord of feathers found in a house in Wellington, Somerset, in 1878, now in the Pitt Rivers Museum; what it was for is unknown. Knot charms themselves are old: Olaus Magnus (1555) tells of winds sold tied in three knots.</Text>
        </View>
      )}
    </Sheet>
  );
}

export function KnotTendSheet({ visible, object, onClose, onUpdate }: { visible: boolean; object: SavedObject | null; onClose: () => void; onUpdate: (o: SavedObject, said: string) => void }) {
  const s = object ? knotStateOf(object) : null;
  const now = new Date();
  if (!s || !object) return null;
  const order = knotOrder(s.count);
  const next = nextKnot(s);
  const tiedPlaces = s.knots.map((k) => order[k.n - 1]);
  const untiedPlaces = s.knots.filter((k) => k.untiedAt).map((k) => order[k.n - 1]);
  const still = tiedCount(s);
  return (
    <Sheet visible={visible} size="half" eyebrow={STYLES.find((x) => x.key === s.style)?.label} title={s.intent || shortLabel(object.label, 'Cord')} onClose={onClose}>
      <View style={sheetStyles.section}>
        <Cord count={s.count} tied={tiedPlaces} untied={untiedPlaces} />
        <Text style={type.caption}>{knotsLine(s)}</Text>
        {!s.ended && next && (
          <>
            <View style={sheetStyles.card}>
              <Label>{`Knot ${next.n}, at place ${next.place} of ${s.count}`}</Label>
              {!!s.plan[next.n - 1] && <Text style={sheetStyles.body}>{`Into it: ${s.plan[next.n - 1].toLowerCase()}.`}</Text>}
              <Text style={sheetStyles.value}>{chantLine(next.n, s.count, s.mode)}</Text>
            </View>
            <Button label="Tie it" onPress={() => onUpdate(tieKnot(object, nowIso()), chantLine(next.n, s.count, s.mode))} />
          </>
        )}
        {!s.ended && !next && still > 0 && (
          <>
            <Text style={sheetStyles.body}>{s.mode === 'release' ? `${UNTIE_LINE} One a day, the last tied first.` : 'They hold. Untie one only when you mean to loosen the working.'}</Text>
            <Button label={untiedToday(s, now) && s.mode === 'release' ? 'Untied one today' : 'Untie a knot'} variant={s.mode === 'release' ? 'primary' : 'outline'} disabled={untiedToday(s, now) && s.mode === 'release'} onPress={() => onUpdate(untieKnot(object, nowIso()), UNTIE_LINE)} />
          </>
        )}
        {!s.ended && (
          <>
            <Label>Ending it</Label>
            <ChipRow>
              {KNOT_ENDS.filter((e) => e.key !== 'untied').map((e) => (
                <Chip key={e.key} label={e.label} onPress={() => onUpdate(endKnots(object, e.key, nowIso()), e.text)} />
              ))}
            </ChipRow>
            <Text style={type.caption}>{KNOT_ENDS.map((e) => `${e.label}: ${e.text}`).join(' ')}</Text>
          </>
        )}
      </View>
    </Sheet>
  );
}

// ─── Crystal grid ─────────────────────────────────────────────────────────

export function GridSheet({ visible, altar, center, onClose, onPlace }: { visible: boolean; altar: AltarContext; center?: Center; onClose: () => void; onPlace: (objects: SavedObject[], name: string) => void }) {
  const { entries } = useCraft<Grid>(GRIDS);
  const [draft, setDraft] = useState<Grid>(() => emptyGrid());
  const [problem, setProblem] = useState<string | null>(null);
  const open = entries.map((e) => ({ id: e.id, g: normaliseGrid(e.data) })).filter((x) => x.g.status !== 'closed');
  const setOut = async (gridId: string, g: Grid) => {
    const objects = gridObjects(gridId, g, altar.objects, nowIso(), center);
    await updateEntry<Grid>(GRIDS, gridId, { ...logGrid(g, 'note', `Set out on ${altar.name || 'the altar'}`, nowIso()), altarId: altar.id });
    onPlace(objects, gridName(g));
  };
  return (
    <Sheet visible={visible} eyebrow="Crystal grid" title="Set out a grid" onClose={onClose}>
      {visible && (
        <View style={sheetStyles.section}>
          {open.length > 0 && (
            <>
              <Label>Your grids</Label>
              {open.map(({ id, g }) => (
                <Pressable key={id} accessibilityRole="button" onPress={() => void setOut(id, g)} style={styles.step}>
                  <Text style={sheetStyles.value}>{gridName(g)}</Text>
                  <Text style={type.caption}>{`${gridProgress(g, new Date()).line} · tap to set it out here`}</Text>
                </Pressable>
              ))}
              <Label>Or plan a new one</Label>
            </>
          )}
          <GridBuilder grid={draft} onChange={setDraft} />
          {problem && <Text style={sheetStyles.problem}>{problem}</Text>}
          <Button
            label="Set it out"
            onPress={async () => {
              const why = gridProblem(draft);
              if (why) return setProblem(why);
              const saved = await addEntry<Grid>(GRIDS, logGrid(draft, 'set', 'Planned on the altar', nowIso()));
              await setOut(saved.id, normaliseGrid(saved.data));
              setDraft(emptyGrid());
            }}
          />
        </View>
      )}
    </Sheet>
  );
}

export function GridTendSheet({ visible, object, onClose, onTakeDown }: { visible: boolean; object: SavedObject | null; onClose: () => void; onTakeDown: (gridId: string, name: string) => void }) {
  const link = gridLinkOf(object);
  const { entries } = useCraft<Grid>(GRIDS);
  const entry = link ? entries.find((e) => e.id === link.id) : null;
  const g = entry ? normaliseGrid(entry.data) : null;
  const now = new Date();
  const log = (kind: Parameters<typeof logGrid>[1], text: string) => entry && g && void updateEntry<Grid>(GRIDS, entry.id, logGrid(g, kind, text, nowIso()));
  return (
    <Sheet visible={visible && !!link} size="half" eyebrow="Crystal grid" title={g ? gridName(g) : 'A grid'} onClose={onClose}>
      {link && (
        <View style={sheetStyles.section}>
          {!g ? (
            <Text style={sheetStyles.body}>This grid’s log isn’t on this device yet, or it was deleted.</Text>
          ) : (
            <>
              <Text style={type.caption}>{`${gridProgress(g, now).line}${link.role === 'centre' ? ' · the centre stone' : ` · point ${link.place}`}`}</Text>
              {g.status === 'planned' && (
                <>
                  {activationSteps(g).slice(0, 4).map((s, i) => (
                    <Text key={i} style={sheetStyles.body}>{`${i + 1}. ${s}`}</Text>
                  ))}
                  <Button label="Activate it" onPress={() => log('activated', 'Lines traced and activated on the altar')} />
                </>
              )}
              {g.status === 'active' && <Button label={tendedToday(g, now) ? 'Tended today' : 'Sit with it today'} disabled={tendedToday(g, now)} onPress={() => log('tended', 'Sat with it and restated the intent')} />}
              {g.status !== 'closed' && (
                <Button
                  label="Take it down"
                  variant="outline"
                  onPress={() => {
                    log('closed', 'Thanked, taken up in reverse and cleansed');
                    onTakeDown(link.id, gridName(g));
                  }}
                />
              )}
              <Button label="Its log" variant="text" onPress={() => router.push({ pathname: '/rituals/craft/crystal/grids', params: { id: link.id } })} />
            </>
          )}
        </View>
      )}
    </Sheet>
  );
}

// ─── On the object panel ─────────────────────────────────────────────────

export type CraftWorkingKind = 'poppet' | 'knots' | 'grid';

/** What the object panel shows for a poppet, a knotted cord or a grid stone, with the way in to tend it. */
export function CraftWorkingPanel({ object, onOpen }: { object: SavedObject; onOpen: (kind: CraftWorkingKind) => void }) {
  const poppet = poppetStateOf(object);
  const knots = knotStateOf(object);
  const grid = gridLinkOf(object);
  const now = new Date();
  if (poppet)
    return (
      <View style={styles.living}>
        <Text style={type.eyebrow}>{poppet.ended ? 'Poppet · its work done' : 'Poppet'}</Text>
        <Text style={type.caption}>{poppetLine(poppet, now)}</Text>
        <ChipRow>
          <Chip label={poppet.ended ? 'Its story' : 'Hold it'} symbol="✋" onPress={() => onOpen('poppet')} />
        </ChipRow>
      </View>
    );
  if (knots)
    return (
      <View style={styles.living}>
        <Text style={type.eyebrow}>{STYLES.find((s) => s.key === knots.style)?.label ?? 'Knots'}</Text>
        <Text style={type.caption}>{knotsLine(knots)}</Text>
        <ChipRow>
          <Chip label={nextKnot(knots) ? 'Tie the next knot' : 'Knots'} symbol="➰" onPress={() => onOpen('knots')} />
        </ChipRow>
      </View>
    );
  if (grid)
    return (
      <View style={styles.living}>
        <Text style={type.eyebrow}>{grid.role === 'centre' ? 'Crystal grid · centre stone' : 'Crystal grid'}</Text>
        <ChipRow>
          <Chip label="The grid" symbol="✣" onPress={() => onOpen('grid')} />
        </ChipRow>
      </View>
    );
  return null;
}

const styles = StyleSheet.create({
  toggle: { minHeight: touch, justifyContent: 'center', borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 8 },
  step: { minHeight: touch, gap: 4, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.hairline },
  stepBox: { gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.hairline },
  stepHead: { minHeight: touch, gap: 4 },
  centerText: { textAlign: 'center' },
  living: { gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.hairline },
});
