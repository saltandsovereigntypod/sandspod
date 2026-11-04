// The altar's working tools, wired into the editor: tracing the circle with
// an athame or wand (the stage reports the finger, the tool follows it and a
// line of light is left behind), the quarters, the singing bowl, the
// chalice, the besom, and a match, lighter or snuffer brought near a candle
// offering to light or snuff it (never by itself). Everything done is kept in
// the altar's History; on a coven altar the circle, quarters, cup and debris
// travel with the altar, and the sounds and moments are broadcast
// (lib/altar/useAltarRites.ts). The logic is lib/altar/circle.ts, bowl.ts and
// toolRites.ts, shared with the website.

import { useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { toneOf, type BowlToneId } from '../../lib/altar/bowl';
import { shortLabel } from '../../lib/altar/cabinet';
import {
  callQuarter,
  castCircle,
  castLine,
  CIRCLE_CAST_STATUS,
  circleOf,
  circleReminder,
  DEFAULT_CIRCLE_COLOR,
  DEFAULT_RING,
  isCircleTool,
  MIN_RADIUS,
  nextToCall,
  nextToRelease,
  quarterOf,
  quartersOf,
  readTrace,
  RELEASED_LINE,
  releaseCircle,
  releaseQuarter,
  setQuarterColor,
  traceHint,
  type Pt,
  type QuarterId,
} from '../../lib/altar/circle';
import { moveObject, toggleLight, updateObjects } from '../../lib/altar/editor';
import { lightingWith } from '../../lib/altar/feel';
import { boxToPixels, displayBox, STAGE_ASPECT } from '../../lib/altar/geometry';
import { clearAsh, lightIncense, putOutIncense } from '../../lib/altar/incense';
import { isCandle } from '../../lib/altar/livingState';
import type { AltarDocument } from '../../lib/altar/snapshot';
import {
  applySweep,
  burnedCordSpots,
  drinkChalice,
  dropDebris,
  fillChalice,
  hasDebris,
  isChalice,
  isFireTool,
  isLighter,
  isSnuffer,
  libationBowlIndex,
  nearTarget,
  pourLibation,
  raiseChalice,
  sweepAlong,
  sweepLine,
} from '../../lib/altar/toolRites';
import type { SavedObject } from '../../lib/altar/types';
import { useAltarRites } from '../../lib/altar/useAltarRites';
import type { AltarDeed } from '../../lib/covens/altarActions';
import type { SharedAltar } from '../../lib/covens/altarSync';
import { colors, fonts } from '../../theme';
import type { Viewport } from './AltarStage';
import { CirclePanel, hasToolRites, ToolRitePanel } from './RitePanels';

const nowIso = () => new Date().toISOString();

type Deps = {
  doc: AltarDocument | null;
  docRef: { current: AltarDocument | null };
  commit: (next: (d: AltarDocument) => AltarDocument, recordUndo?: boolean) => void;
  selected: number | null;
  setSelected: (i: number | null) => void;
  say: (line: string) => void;
  log: (line: string) => void;
  moment: (uids: string[], methods: string[]) => void;
  shared: SharedAltar | undefined;
  me: string;
  stageWidth: number;
  viewport: Viewport;
  finishDeed: (kind: AltarDeed, quarter?: QuarterId) => void;
  toCabinet: (what: string) => void;
  /** A coven ritual's own calling order for the quarters, while one is under way (quarterSteps.ts). */
  quarterOrder?: QuarterId[] | null;
  /** Whether you may change this altar now (a coven altar may be look-only). */
  canEdit: boolean;
};

type Tracing = { releasing: boolean; uid: string; from: { cx: number; cy: number } };

export function useToolRites(deps: Deps) {
  const { doc, docRef, commit, selected, say, log, moment, shared, me } = deps;
  const rites = useAltarRites(shared, me, (uid, methods) => moment([uid], methods), say, log);
  const [color, setColor] = useState(DEFAULT_CIRCLE_COLOR);
  const [tracing, setTracing] = useState<Tracing | null>(null);
  const [trail, setTrail] = useState<Pt[]>([]);
  const points = useRef<Pt[]>([]);
  const [panel, setPanel] = useState(false);
  const extra = doc?.extra ?? {};
  const selectedObject = doc && selected != null ? doc.objects[selected] ?? null : null;
  const uidOf = (o: SavedObject | null | undefined) => String(o?.altarObjectId || '');
  const indexOf = (uid: string) => (docRef.current?.objects ?? []).findIndex((o) => uidOf(o) === uid);
  const nameOf = (o: SavedObject) => shortLabel(o.label, isCandle(o) ? 'the candle' : 'the incense').replace(/^(?=[A-Z])/, 'the ');

  // ── The circle ──────────────────────────────────────────────────────
  const cast = (ring: { cx: number; cy: number; r: number }, auto: boolean) => {
    commit((d) => ({ ...d, extra: castCircle(d.extra, ring, color, nowIso(), me || undefined, auto) }));
    log(castLine(color));
    say(`${CIRCLE_CAST_STATUS}.`);
    setPanel(true);
    deps.finishDeed('circle');
  };
  const release = () => {
    if (!circleOf(docRef.current?.extra)) return;
    commit((d) => ({ ...d, extra: releaseCircle(d.extra) }));
    log(RELEASED_LINE);
    say('The circle is released.');
    deps.finishDeed('release_circle');
  };
  const putToolBack = (t: Tracing) => {
    const i = indexOf(t.uid);
    if (i >= 0) commit((d) => moveObject(d, i, t.from.cx, t.from.cy), false);
  };
  const startTrace = (releasing: boolean, uid = uidOf(selectedObject)) => {
    const i = indexOf(uid);
    const tool = i >= 0 ? docRef.current!.objects[i] : null;
    if (!tool) return;
    const box = displayBox(tool);
    points.current = [];
    setTrail([]);
    setTracing({ releasing, uid, from: { cx: box.cx, cy: box.cy } });
    say(releasing ? 'Trace the ring back anticlockwise with the tool, all the way round.' : 'Trace round the altar with the tool, sunwise (clockwise), until the line meets where you began.');
  };
  const onTrace = (phase: 'start' | 'move' | 'end', x: number, y: number) => {
    const t = tracing;
    if (!t) return;
    if (phase === 'start') {
      points.current = [{ x, y }];
      setTrail(points.current);
      return;
    }
    if (phase === 'move') {
      const last = points.current[points.current.length - 1];
      if (last && Math.hypot(last.x - x, (last.y - y) / STAGE_ASPECT) < 0.004) return;
      points.current = [...points.current, { x, y }];
      setTrail(points.current);
      const i = indexOf(t.uid);
      // The tool follows the finger, as if carried round the altar.
      if (i >= 0) commit((d) => moveObject(d, i, x, y), false);
      return;
    }
    // Let go: read the trace in equal units (y in widths).
    const reading = readTrace(
      points.current.map((p) => ({ x: p.x, y: p.y / STAGE_ASPECT })),
      MIN_RADIUS,
    );
    putToolBack(t);
    const done = reading.closes && reading.direction === (t.releasing ? 'widdershins' : 'deosil');
    if (!done) {
      say(traceHint(reading, t.releasing));
      points.current = [];
      setTrail([]);
      return;
    }
    setTracing(null);
    setTrail([]);
    if (t.releasing) release();
    else cast({ cx: reading.centre.x, cy: reading.centre.y * STAGE_ASPECT, r: reading.radius }, false);
  };
  const stopTrace = () => {
    if (tracing) putToolBack(tracing);
    setTracing(null);
    setTrail([]);
  };

  // ── The quarters ────────────────────────────────────────────────────
  const call = (id: QuarterId) => {
    const r = callQuarter(docRef.current?.extra ?? {}, id, deps.quarterOrder);
    if (r.ok) {
      commit((d) => ({ ...d, extra: callQuarter(d.extra, id, deps.quarterOrder).extra }));
      log(r.line);
      deps.finishDeed('call_quarter', id);
      if (!nextToCall(quartersOf(r.extra))) deps.finishDeed('quarters');
    }
    say(r.line);
  };
  const uncall = (id: QuarterId) => {
    const r = releaseQuarter(docRef.current?.extra ?? {}, id);
    if (r.ok) {
      commit((d) => ({ ...d, extra: releaseQuarter(d.extra, id).extra }));
      log(r.line);
      deps.finishDeed('release_quarter', id);
      if (!quartersOf(r.extra).open.length) deps.finishDeed('release_quarters');
    }
    say(r.line);
  };

  // ── Lighting and snuffing by hand ───────────────────────────────────
  const handTool = selectedObject && (isFireTool(selectedObject) || isSnuffer(selectedObject)) && !tracing ? selectedObject : null;
  const mode: 'light' | 'snuff' = handTool && isSnuffer(handTool) ? 'snuff' : 'light';
  const target = handTool && doc && selected != null ? nearTarget(doc.objects, selected, mode) : -1;
  const lightOrSnuff = () => {
    const d0 = docRef.current;
    if (!d0 || selected == null || !handTool) return;
    const t = nearTarget(d0.objects, selected, mode, Date.now());
    if (t < 0) return;
    const thing = d0.objects[t];
    const at = nowIso();
    const name = nameOf(thing);
    if (mode === 'snuff') {
      commit((d) => (isCandle(thing) ? toggleLight(d, t, at) : updateObjects(d, [t], (o) => putOutIncense(o, at))));
      log(`Snuffed ${name}.`);
      say(`${name[0].toUpperCase()}${name.slice(1)} is out.`);
      return;
    }
    const how = isLighter(handTool) ? 'lighter' : 'match';
    lightingWith(how);
    rites.fire(how, uidOf(thing));
    commit((d) => {
      let next = isCandle(thing) ? toggleLight(d, t, at) : updateObjects(d, [t], (o) => lightIncense(o, at));
      // A struck match is laid down beside it, for the besom later.
      if (how === 'match') next = { ...next, extra: dropDebris(next.extra, 'match', thing, at) };
      return next;
    });
    log(`Lit ${name} with ${how === 'match' ? 'a match' : 'a lighter'}.`);
    deps.finishDeed('light');
    if (how === 'match') deps.finishDeed('match');
  };
  let floating: ReactNode = null;
  if (doc && target >= 0) {
    const zoom = deps.viewport.zoom;
    const rect = boxToPixels(displayBox(doc.objects[target]), deps.stageWidth * zoom);
    const label = mode === 'snuff' ? (isCandle(doc.objects[target]) ? 'Snuff candle' : 'Put out incense') : isCandle(doc.objects[target]) ? 'Light candle' : 'Light incense';
    const left = Math.max(4, Math.min(deps.stageWidth - 124, rect.centerX - deps.viewport.offsetX - 60));
    const top = Math.max(4, rect.top - deps.viewport.offsetY - 40);
    floating = (
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${nameOf(doc.objects[target])}`} onPress={lightOrSnuff} style={[styles.float, { left, top }]}>
        <Text style={styles.floatText}>{label}</Text>
      </Pressable>
    );
  }

  // ── The chalice and the besom ──────────────────────────────────────
  const chalice = (fn: 'raise' | 'pour' | 'drink', drink?: string) => {
    const d0 = docRef.current;
    if (!d0 || selected == null) return;
    const cup = d0.objects[selected];
    if (!isChalice(cup)) return;
    const at = nowIso();
    const uid = uidOf(cup);
    if (drink) {
      commit((d) => updateObjects(d, [selected], (o) => fillChalice(o, drink, at)));
      log(`Filled the chalice with ${drink}.`);
      return say(`The chalice is filled with ${drink}.`);
    }
    if (fn === 'raise') {
      commit((d) => updateObjects(d, [selected], (o) => raiseChalice(o, at)));
      rites.show('toast', uid);
      log('Raised the chalice in a toast.');
      deps.finishDeed('toast');
      return say('The chalice is raised.');
    }
    if (fn === 'drink') {
      commit((d) => updateObjects(d, [selected], (o) => drinkChalice(o, at)));
      log('Drank from the chalice.');
      return say('The chalice is empty.');
    }
    const b = libationBowlIndex(d0.objects, selected);
    const poured = pourLibation(cup, b >= 0 ? d0.objects[b] : null, at);
    if (!poured) return say('The chalice is empty. Fill it first.');
    commit((d) => ({ ...d, objects: d.objects.map((o, i) => (i === selected ? poured.chalice : i === b && poured.bowl ? poured.bowl : o)) }));
    rites.show('pour', b >= 0 ? uidOf(d0.objects[b]) : uid);
    log(poured.line);
    say(poured.line);
    deps.finishDeed('libation');
  };
  const cords = doc ? burnedCordSpots(doc) : [];
  const canSweep = !!doc && hasDebris(doc.objects, extra, cords.length);
  const sweep = (uid = uidOf(selectedObject)) => {
    const d0 = docRef.current;
    if (!d0) return;
    const r = sweepAlong(d0.objects, d0.extra, [], burnedCordSpots(d0), true);
    const line = sweepLine(r);
    if (!line) return say('The altar is clean: nothing to sweep.');
    const at = nowIso();
    commit((d) => applySweep(d, r, (o) => clearAsh(o, at)));
    rites.show('sweep', uid);
    log(line);
    say(line);
    deps.finishDeed('sweep');
  };

  // ── In the panel ────────────────────────────────────────────────────
  const open = circleReminder(extra);
  const panels = (
    <>
      {tracing && (
        <View style={styles.tracing}>
          <Text style={styles.tracingText}>{tracing.releasing ? 'Releasing the circle: trace it back anticlockwise.' : 'Casting the circle: trace round the altar, sunwise.'}</Text>
          <Pressable accessibilityRole="button" onPress={stopTrace} style={styles.tracingStop}>
            <Text style={styles.floatText}>Stop</Text>
          </Pressable>
        </View>
      )}
      {(panel || (!!open && isCircleTool(selectedObject))) && (
        <CirclePanel extra={extra} order={deps.quarterOrder} onCall={call} onRelease={uncall} onColor={(id, c) => commit((d) => ({ ...d, extra: setQuarterColor(d.extra, id, c) }))} onReleaseCircle={release} onClose={() => setPanel(false)} />
      )}
      {!panel && open && (
        <Pressable accessibilityRole="button" accessibilityHint="Shows the circle panel" onPress={() => setPanel(true)}>
          <Text style={styles.reminder}>{open} Show the circle.</Text>
        </Pressable>
      )}
      {selectedObject && hasToolRites(selectedObject) && !tracing && (
        <ToolRitePanel
          object={selectedObject}
          extra={extra}
          color={color}
          onColor={setColor}
          ringing={rites.ringing}
          canSweep={canSweep}
          act={{
            trace: (releasing) => startTrace(releasing),
            castForMe: () => cast(DEFAULT_RING, true),
            releaseForMe: release,
            quarters: () => setPanel(true),
            bowlTone: (id) => commit((d) => (selected == null ? d : updateObjects(d, [selected], (o) => ({ ...o, bowlTone: id })))),
            strike: () => {
              rites.strike(toneOf(selectedObject).id, uidOf(selectedObject));
              deps.finishDeed('bowl');
            },
            every: (n) => rites.every(toneOf(selectedObject).id as BowlToneId, uidOf(selectedObject), n),
            fill: (drink) => chalice('raise', drink),
            raise: () => chalice('raise'),
            pour: () => chalice('pour'),
            drink: () => chalice('drink'),
            sweep: () => sweep(),
          }}
        />
      )}
    </>
  );

  /** A ritual step's deed at the altar: find the tool and begin. */
  const startDeed = (kind: AltarDeed): boolean => {
    const objects = docRef.current?.objects ?? [];
    const find = (test: (o: SavedObject) => boolean) => objects.findIndex(test);
    const pick = (i: number) => deps.setSelected(i);
    switch (kind) {
      case 'circle':
      case 'release_circle': {
        const i = find((o) => isCircleTool(o));
        if (kind === 'release_circle' && !circleOf(docRef.current?.extra)) {
          say('The circle isn’t cast here.');
          deps.finishDeed(kind);
          return true;
        }
        if (i < 0) {
          // No athame or wand: draw (or let go of) it for you.
          if (kind === 'circle') cast(DEFAULT_RING, true);
          else release();
          return true;
        }
        pick(i);
        startTrace(kind === 'release_circle', uidOf(objects[i]));
        return true;
      }
      case 'quarters':
      case 'release_quarters': {
        setPanel(true);
        const state = quartersOf(docRef.current?.extra);
        const next = kind === 'quarters' ? nextToCall(state, deps.quarterOrder) : nextToRelease(state);
        say(next ? `${kind === 'quarters' ? 'Call' : 'Release'} the ${quarterOf(next)!.name} first, then each in turn, in the circle panel.` : kind === 'quarters' ? 'All four quarters are open.' : 'No quarters are open.');
        if (!next) deps.finishDeed(kind);
        return true;
      }
      case 'call_quarter':
      case 'release_quarter': {
        // Done by tapping the quarter's own marker at the altar's edge: say where it is.
        const state = quartersOf(docRef.current?.extra);
        if (kind === 'release_quarter' && !state.open.length) {
          say('No quarters are open.');
          return true;
        }
        say(kind === 'call_quarter' ? 'Tap your quarter’s glowing spot at the edge of the altar to call it. North is at the back, East to the right.' : 'Tap your lit quarter at the edge of the altar to release it. North is at the back, East to the right.');
        return true;
      }
      case 'bowl': {
        const i = find((o) => o.type === 'tool' && /singing-bowl/.test(String(o.tool || '')));
        if (i < 0) {
          deps.toCabinet('singing bowl');
          return true;
        }
        pick(i);
        rites.strike(toneOf(objects[i]).id, uidOf(objects[i]));
        deps.finishDeed('bowl');
        return true;
      }
      case 'toast':
      case 'libation': {
        const i = find((o) => isChalice(o));
        if (i < 0) {
          deps.toCabinet('chalice');
          return true;
        }
        pick(i);
        say(kind === 'toast' ? 'Fill the chalice if it’s empty, then raise it.' : 'Fill the chalice if it’s empty, then pour your libation.');
        return true;
      }
      case 'sweep': {
        const i = find((o) => o.type === 'tool' && /besom|broom/.test(String(o.tool || '')));
        if (i >= 0) pick(i);
        sweep(i >= 0 ? uidOf(objects[i]) : '');
        deps.finishDeed('sweep');
        return true;
      }
      case 'match': {
        const i = find((o) => isFireTool(o) && !isLighter(o));
        if (i < 0) {
          deps.toCabinet('box of matches');
          return true;
        }
        pick(i);
        say('Bring the matches to an unlit candle, then tap “Light candle”.');
        return true;
      }
      default:
        return false;
    }
  };

  return {
    panels,
    floating,
    startDeed,
    /** A tap on a quarter's marker: call or release it (as the step under way does), or, unsaid, whichever it needs. */
    tapQuarter: (id: QuarterId, mode?: 'call' | 'release') => ((mode ?? (quartersOf(docRef.current?.extra).open.includes(id) ? 'release' : 'call')) === 'release' ? uncall(id) : call(id)),
    /** A moment here and for the others at a coven altar (the round-two tools use it: useCraftTools). */
    show: rites.show,
    stage: { onTrace: tracing && deps.canEdit ? onTrace : undefined, trail: tracing && trail.length ? { points: trail, color: circleOf(extra)?.color ?? color } : null },
    /** Leave a burned petition's ash on the altar (the besom sweeps it). */
    ashAt: (d: AltarDocument, near: SavedObject | null, at: string): AltarDocument => ({ ...d, extra: dropDebris(d.extra, 'ash', near, at) }),
  };
}

const styles = StyleSheet.create({
  float: { position: 'absolute', width: 120, minHeight: 36, borderRadius: 18, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  floatText: { color: colors.forestInk, fontFamily: fonts.bodySemi, fontSize: 14 },
  tracing: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.goldLine, borderRadius: 12, padding: 10, marginBottom: 12 },
  tracingText: { flex: 1, color: colors.cream, fontFamily: fonts.body, fontSize: 15 },
  tracingStop: { minHeight: 44, minWidth: 64, borderRadius: 22, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  reminder: { color: colors.gold, fontFamily: fonts.body, fontSize: 14, marginBottom: 12, textDecorationLine: 'underline' },
});
