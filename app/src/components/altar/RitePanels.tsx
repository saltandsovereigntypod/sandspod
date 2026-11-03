// The altar's working tools in the editor's panel: casting and releasing the
// circle with an athame or wand, the circle panel (the quarters, and what's
// still open), the singing bowl, the chalice, the besom, and the matches,
// lighter and snuffer. The logic is lib/altar/circle.ts, bowl.ts and
// toolRites.ts, shared with the website (altar/js/features/altar-rites.js).

import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BOWL_TONES, EVERY_MAX, EVERY_MIN, EVERY_LABEL, isSingingBowl, STOP_LABEL, STRIKE_LABEL, toneLabel, toneOf } from '../../lib/altar/bowl';
import {
  CAST_FOR_ME_LABEL,
  CAST_LABEL,
  CIRCLE_COLORS,
  circleOf,
  circleReminder,
  cleanColor,
  isCircleTool,
  nextToCall,
  nextToRelease,
  QUARTERS,
  quarterColor,
  quartersOf,
  RELEASE_LABEL,
  type QuarterId,
} from '../../lib/altar/circle';
import type { SavedObject } from '../../lib/altar/types';
import { CHALICE_DRINKS, chaliceDrink, chaliceLevel, isBesom, isChalice, isFireTool, isLighter, isSnuffer } from '../../lib/altar/toolRites';
import type { BowlRinging } from '../../lib/altar/useAltarRites';
import { colors, type } from '../../theme';
import { Button } from '../Button';
import { Chip, ChipRow } from './Chip';

/** Whether the panel has anything for this object. */
export const hasToolRites = (o: SavedObject | null | undefined) => !!o && (isCircleTool(o) || isSingingBowl(o) || isChalice(o) || isBesom(o) || isFireTool(o) || isSnuffer(o));

export type ToolRiteActs = {
  trace: (releasing: boolean) => void;
  castForMe: () => void;
  releaseForMe: () => void;
  quarters: () => void;
  bowlTone: (id: string) => void;
  strike: () => void;
  every: (minutes: number | null) => void;
  fill: (drink: string) => void;
  raise: () => void;
  pour: () => void;
  drink: () => void;
  sweep: () => void;
};

export function ToolRitePanel({
  object,
  extra,
  color,
  onColor,
  ringing,
  canSweep,
  act,
}: {
  object: SavedObject;
  extra: Record<string, unknown>;
  /** The colour a circle will be cast in. */
  color: string;
  onColor: (color: string) => void;
  ringing: BowlRinging;
  canSweep: boolean;
  act: ToolRiteActs;
}) {
  const [every, setEvery] = useState(ringing?.every ?? 3);
  const [own, setOwn] = useState('');
  const cast = !!circleOf(extra);

  if (isCircleTool(object)) {
    return (
      <View style={styles.box}>
        <Text style={type.caption}>
          {cast
            ? 'The circle is cast. To release it, trace it back anticlockwise with the tool, or let it go with a tap.'
            : 'Trace round the altar with the tool, sunwise (clockwise), and a thin line of light follows it. Most of the way round, it closes into a ring.'}
        </Text>
        {!cast && (
          <>
            <Text style={styles.label}>Colour of the light</Text>
            <ChipRow>
              {CIRCLE_COLORS.map((c) => (
                <Chip key={c.id} label={c.label} symbol="●" active={cleanColor(color) === c.color} onPress={() => onColor(c.color)} />
              ))}
            </ChipRow>
            <TextInput
              value={own}
              onChangeText={setOwn}
              onEndEditing={() => own && onColor(cleanColor(own, color))}
              placeholder="Your own colour, as #hex"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Your own colour for the circle, as a hex code"
              style={styles.input}
            />
          </>
        )}
        {cast ? (
          <>
            <Button label={RELEASE_LABEL} onPress={() => act.trace(true)} />
            <Button label="Release it for me" variant="outline" onPress={act.releaseForMe} />
          </>
        ) : (
          <>
            <Button label={CAST_LABEL} onPress={() => act.trace(false)} />
            <Button label={CAST_FOR_ME_LABEL} variant="outline" onPress={act.castForMe} />
          </>
        )}
        <Button label="Call the quarters" variant="outline" onPress={act.quarters} />
      </View>
    );
  }

  if (isSingingBowl(object)) {
    const tone = toneOf(object);
    return (
      <View style={styles.box}>
        <Text style={styles.label}>Tone: {toneLabel(tone)}</Text>
        <ChipRow>
          {BOWL_TONES.map((t) => (
            <Chip key={t.id} label={t.id === '432' ? '432 Hz' : `${t.label} ${t.note}`} active={t.id === tone.id} onPress={() => act.bowlTone(t.id)} />
          ))}
        </ChipRow>
        <Text style={type.caption}>
          Pairing the chakras with the notes C to B is a modern convention, one of several, and 432 Hz is a modern preference rather than an old tuning. Choose what sounds right to you.
        </Text>
        <Button label={STRIKE_LABEL} onPress={act.strike} />
        {ringing ? (
          <>
            <Text style={type.caption}>Ringing every {ringing.every} minute{ringing.every === 1 ? '' : 's'}.</Text>
            <Button label={STOP_LABEL} variant="outline" onPress={() => act.every(null)} />
          </>
        ) : (
          <>
            <Text style={styles.label}>{EVERY_LABEL}</Text>
            <ChipRow>
              <Chip label="Fewer" symbol="−" disabled={every <= EVERY_MIN} onPress={() => setEvery((n) => Math.max(EVERY_MIN, n - 1))} />
              <Text style={styles.count}>
                Every {every} minute{every === 1 ? '' : 's'}
              </Text>
              <Chip label="More" symbol="+" disabled={every >= EVERY_MAX} onPress={() => setEvery((n) => Math.min(EVERY_MAX, n + 1))} />
            </ChipRow>
            <Button label={`Ring every ${every} minute${every === 1 ? '' : 's'}`} variant="outline" onPress={() => act.every(every)} />
          </>
        )}
      </View>
    );
  }

  if (isChalice(object)) {
    const level = chaliceLevel(object);
    const what = chaliceDrink(object);
    return (
      <View style={styles.box}>
        <Text style={type.caption}>{level > 0 ? `The chalice holds ${what}, ${level >= 0.98 ? 'full' : `about ${Math.round(level * 4)} parts in 4`}.` : 'The chalice is empty.'}</Text>
        <Text style={styles.label}>Fill it with</Text>
        <ChipRow>
          {CHALICE_DRINKS.map((d) => (
            <Chip key={d.id} label={d.label} onPress={() => act.fill(d.id)} />
          ))}
        </ChipRow>
        <Button label="Raise it in a toast" disabled={level <= 0} onPress={act.raise} />
        <Button label="Pour a libation" variant="outline" disabled={level <= 0} onPress={act.pour} />
        <Button label="Drink" variant="outline" disabled={level <= 0} onPress={act.drink} />
      </View>
    );
  }

  if (isBesom(object)) {
    return (
      <View style={styles.box}>
        <Text style={type.caption}>{canSweep ? 'Sweep away the ash, spent matches and burned remains on the altar.' : 'The altar is clean: nothing to sweep.'}</Text>
        <Button label="Sweep the altar" disabled={!canSweep} onPress={act.sweep} />
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={type.caption}>
        {isSnuffer(object)
          ? 'Bring it to a lit candle or incense and tap “Snuff” when it appears.'
          : `Bring the ${isLighter(object) ? 'lighter' : 'matches'} to an unlit candle or incense and tap “Light” when it appears. It never lights on its own.`}
      </Text>
    </View>
  );
}

/** What's open: the circle and the quarters, with calling and releasing in order. */
export function CirclePanel({
  extra,
  onCall,
  onRelease,
  onColor,
  onReleaseCircle,
  onClose,
}: {
  extra: Record<string, unknown>;
  onCall: (id: QuarterId) => void;
  onRelease: (id: QuarterId) => void;
  onColor: (id: QuarterId, color: string | null) => void;
  onReleaseCircle: () => void;
  onClose: () => void;
}) {
  const [tinting, setTinting] = useState<QuarterId | null>(null);
  const circle = circleOf(extra);
  const state = quartersOf(extra);
  const next = nextToCall(state);
  const last = nextToRelease(state);
  const reminder = circleReminder(extra);
  return (
    <View style={[styles.box, styles.panel]} accessibilityLabel="The circle">
      <Text style={styles.label}>The circle</Text>
      <Text style={type.caption}>{circle ? 'Cast.' : 'Not cast.'}</Text>
      {QUARTERS.map((q) => {
        const open = state.open.includes(q.id);
        return (
          <View key={q.id} style={styles.quarter}>
            <View style={[styles.swatch, { backgroundColor: quarterColor(state, q.id), opacity: open ? 1 : 0.35 }]} />
            <Text style={[type.body, styles.quarterName]}>
              {q.name} · {q.element}
              {open ? ' · open' : ''}
            </Text>
            {open ? (
              <Chip label="Release" disabled={last !== q.id} onPress={() => onRelease(q.id)} />
            ) : (
              <Chip label="Call" active={next === q.id} onPress={() => onCall(q.id)} />
            )}
            <Chip label="Colour" accessibilityLabel={`Colour for the ${q.name}`} onPress={() => setTinting(tinting === q.id ? null : q.id)} />
          </View>
        );
      })}
      {tinting && (
        <ChipRow>
          {[...QUARTERS.map((q) => q.color), ...CIRCLE_COLORS.map((c) => c.color)].map((c) => (
            <Chip key={c} label={c} symbol="●" active={quarterColor(state, tinting) === c} onPress={() => onColor(tinting, c)} />
          ))}
          <Chip label="Usual colour" onPress={() => onColor(tinting, null)} />
        </ChipRow>
      )}
      <Text style={type.caption}>Called East, South, West, North, and released in reverse. The colours are the common modern ones; change them to your own.</Text>
      {reminder && <Text style={[type.caption, styles.reminder]}>{reminder}</Text>}
      {circle && !state.open.length && <Button label={RELEASE_LABEL} variant="outline" onPress={onReleaseCircle} />}
      <Button label="Close this panel" variant="outline" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 10 },
  panel: { borderWidth: 1, borderColor: colors.goldLine, borderRadius: 12, padding: 14, marginBottom: 14 },
  label: { ...type.caption, color: colors.gold },
  count: { ...type.body, alignSelf: 'center', paddingHorizontal: 6 },
  input: { ...type.body, color: colors.cream, borderWidth: 1, borderColor: colors.hairline, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  quarter: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  swatch: { width: 14, height: 14, borderRadius: 7 },
  quarterName: { flex: 1, minWidth: 120 },
  reminder: { color: colors.gold },
});
