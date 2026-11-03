// The live step's parts in the Ritual tab over a coven altar (AltarRitual.tsx,
// LiveStepCard atAltar): how to do it, the items as tiles to set down, a
// petition written straight onto the altar, and a sit that runs in the
// panel, in step for everyone from the step's own start. What they say and
// decide is lib/covens/ritualPanel.ts; the altar's own hands come through
// altarDesk.ts, so nothing here leaves the altar.

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { AltarImage } from '../altar/AltarImage';
import { useAltarDesk } from '../altar/altarDesk';
import { SitGuide, useNow } from '../meditation/SitGuide';
import { SitTimer } from '../meditation/SitTimer';
import { Field } from '../more/ui';
import { Words } from './ui';
import { altarPicture } from '../../lib/altar/assets';
import { formImage, shortLabel } from '../../lib/altar/cabinet';
import { stepItemForm } from '../../lib/covens/deedTargets';
import { gazesAtCandle, ritualSitMix, ritualSitPlan, ritualSitPrefs, ritualSitScript, RITUAL_BREATH, sitSync } from '../../lib/covens/ritualPanel';
import type { PresetId } from '../../lib/meditation/scripts';
import { BREATH_WORDS, breathAt, startClock } from '../../lib/meditation/timer';
import { useMySettings } from '../../lib/settings/store';
import { colors, fonts, radius, type } from '../../theme';

/** "How to": the builder's own words, or the plain default for the step's kind. */
export function HowTo({ text, builder }: { text: string; builder: boolean }) {
  return (
    <View style={styles.how}>
      <Text style={type.eyebrow}>How to</Text>
      {builder ? <Words text={text} /> : <Text style={type.body}>{text}</Text>}
    </View>
  );
}

/** The step's items as tiles: each tap sets one on the altar, as the cabinet does. Arranging is done on the altar. */
export function ItemTiles({ items, placed }: { items: { key?: string; name: string; image?: string }[]; placed: { name: string; placed: boolean }[] | null }) {
  const desk = useAltarDesk();
  const [said, setSaid] = useState<string | null>(null);
  if (!desk || !items.length) return null;
  return (
    <View style={styles.gap}>
      <Text style={type.eyebrow}>To place</Text>
      <View style={styles.tiles}>
        {items.map((it, i) => {
          const found = stepItemForm(it, desk.cabinet);
          const on = placed?.find((p) => p.name === it.name)?.placed;
          const picture = altarPicture(found ? formImage(found.item, found.form, desk.overrides) : it.image || '');
          return (
            <Pressable
              key={`${it.key ?? it.name}-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`Set ${it.name} on the altar${on ? ' (one is there already)' : ''}`}
              disabled={!found || !desk.canEdit}
              onPress={() => {
                if (!found) return;
                setSaid(desk.place(found.item, found.form) ? `${shortLabel(it.name)} is on the altar. Move it where it belongs.` : 'It can’t be set down just now.');
              }}
              style={({ pressed }) => [styles.tile, on && styles.tileOn, (!found || !desk.canEdit) && styles.tileOff, pressed && styles.pressed]}
            >
              <View style={styles.thumb}>{picture && <AltarImage picture={picture} style={styles.thumbImage} resizeMode="contain" />}</View>
              <Text style={styles.tileLabel} numberOfLines={2}>
                {`${on ? '✓ ' : ''}${it.name}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={type.caption}>{said ?? (desk.canEdit ? 'Tap a tile to set it on the altar.' : 'You can’t tend the altar during this step.')}</Text>
    </View>
  );
}

/** A petition written here and folded onto the altar, as the altar's own petition writer does. */
export function PetitionBox() {
  const desk = useAltarDesk();
  const [title, setTitle] = useState('');
  const [words, setWords] = useState('');
  const [busy, setBusy] = useState(false);
  if (!desk) return null;
  if (!desk.canWrite) return <Text style={type.caption}>This altar keeps no petition box yet.</Text>;
  return (
    <View style={styles.gap}>
      <Field label="Your petition" value={title} onChangeText={setTitle} placeholder="What you ask, in a few words" maxLength={120} />
      <Field label="In full (if you like)" value={words} onChangeText={setWords} multiline placeholder="The words of your petition" />
      <Button
        label="Place it on the altar"
        disabled={busy || !title.trim() || !desk.canEdit}
        onPress={() => {
          setBusy(true);
          void desk
            .writePetition({ title, words, intention: '', timing: 'now' })
            .then(() => {
              setTitle('');
              setWords('');
            })
            .finally(() => setBusy(false));
        }}
      />
    </View>
  );
}

/** A slow circle to breathe with: in for four, out for six. */
function BreathCircle({ startMs }: { startMs: number }) {
  const now = useNow(100);
  const b = breathAt(RITUAL_BREATH, Math.max(0, now - startMs));
  return (
    <View style={styles.breath} accessibilityLabel={BREATH_WORDS[b.stage]}>
      <View style={[styles.circle, { transform: [{ scale: 0.4 + 0.6 * b.scale }] }]} />
      <Text style={styles.breathWord}>{BREATH_WORDS[b.stage]}</Text>
    </View>
  );
}

/**
 * The step's sit, in the panel: everyone's clock from the step's start (never
 * begun early), with the guidance, breath circle, bells and sound each person
 * chose (Settings → Covens & privacy → During coven rituals). Candle gazing
 * looks at the altar's own lit candle.
 */
export function RitualSit({ preset, startedAt, onFinished }: { preset: PresetId; startedAt: string | null | undefined; onFinished: () => void }) {
  const { settings } = useMySettings();
  const prefs = ritualSitPrefs(settings as unknown as Record<string, unknown>);
  const layersKey = prefs.layers.join(',');
  const plan = useMemo(() => ritualSitPlan(preset, prefs), [preset, prefs.bells]); // eslint-disable-line react-hooks/exhaustive-deps
  const mix = useMemo(() => ritualSitMix(prefs), [prefs.sound, layersKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const now = useNow(1000);
  const sync = sitSync({ startedAt, minutes: plan.minutes ?? 0, now });
  const clock = useMemo(() => (sync.startMs === null ? null : startClock(sync.startMs)), [sync.startMs]);
  const [stopped, setStopped] = useState(false);
  const script = ritualSitScript(preset, prefs);

  if (sync.phase === 'waiting' || !clock) return <Text style={type.caption}>The sit begins for everyone together when the leader starts this step.</Text>;
  if (sync.phase === 'over') return <Text style={type.caption}>The sit has ended.</Text>;
  if (stopped) return <Text style={type.caption}>You’ve stepped out of the sit. The others carry on until it ends.</Text>;
  return (
    <View style={styles.sit}>
      {gazesAtCandle(preset) && <Text style={type.body}>Gaze at the lit candle on the altar.</Text>}
      <SitTimer plan={plan} clock={clock} endedAtMs={null} onEnd={() => setStopped(true)} onFinished={onFinished} compact shared sound={mix} />
      {prefs.breath && <BreathCircle startMs={clock.startedAt} />}
      {!!script && <SitGuide plan={plan} clock={clock} endedAtMs={null} script={script} focus="none" sigilId="" />}
    </View>
  );
}

const styles = StyleSheet.create({
  how: { gap: 4 },
  gap: { gap: 8 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: 84,
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  tileOn: { borderColor: colors.gold },
  tileOff: { opacity: 0.5 },
  thumb: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: { width: 56, height: 56 },
  tileLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.cream,
    textAlign: 'center',
  },
  sit: { alignItems: 'center', gap: 6 },
  breath: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(226,195,109,0.18)',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  breathWord: { fontFamily: fonts.body, fontSize: 13, color: colors.cream },
  pressed: { opacity: 0.75 },
});
