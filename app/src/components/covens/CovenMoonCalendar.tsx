// The coven's moon calendar: those who manage the coven set how it counts its
// days (Manage → Practice calendar), and every member sees it in plain words
// on the coven's page ("What the coven follows"), with the choice to take it
// for their own Settings or keep their own. Nothing changes anyone's settings
// unless they choose it, and taking it can be undone.

import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CALENDARS, COUNT_KEY, EXTRA_KEY, MOON_CALENDAR, primaryCalendar, withShown } from '../../lib/calendars';
import * as api from '../../lib/covens/api';
import { useCoven } from '../../lib/covens/CovenContext';
import { errorMessage, type Coven } from '../../lib/covens/model';
import {
  canRestore,
  covenCalendarChanges,
  covenCalendarState,
  covenFollowsLines,
  covenMoonLine,
  covenMoonLineIfDifferent,
  covenSettings,
  keepMyCalendar,
  readCovenMoon,
  restoreMyCalendar,
  takeCovenCalendar,
} from '../../lib/covens/moonCalendar';
import { usePlace } from '../../lib/location';
import { useMySettings } from '../../lib/settings/store';
import type { Settings } from '../../lib/settings/defaults';
import { colors, fonts, type } from '../../theme';
import { Button } from '../Button';
import { ChoiceList } from '../more/CalendarCounting';
import { Card, CheckRow, Chips, Notice, Section } from '../more/ui';

/** The coven's moon calendar, read once per coven (null until read, {} when not set or not readable yet). */
export function useCovenMoon(covenId: string | undefined): [Record<string, unknown> | null, () => void] {
  const [moon, setMoon] = useState<Record<string, unknown> | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!covenId) return;
    let off = false;
    api
      .fetchCovenMoon(covenId)
      .then((value) => !off && setMoon(value ?? {}))
      .catch(() => !off && setMoon({}));
    return () => {
      off = true;
    };
  }, [covenId, tick]);
  return [moon, () => setTick((n) => n + 1)];
}

const COUNT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'moon', label: 'The moon' },
] as const;

/** Manage → Practice calendar: how the coven counts its days. */
export function CovenCountingForm({ info }: { info: Coven }) {
  const covenContext = useCoven();
  const [moon, reload] = useCovenMoon(info.id);
  // What's changed here, over the coven's calendar as saved.
  const [edits, setEdits] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const draft = edits ?? (moon ? covenSettings({ ...info, moon_calendar: moon }) : null);
  if (!draft) return null;

  const set = (key: string, value: string) => setEdits({ ...draft, [key]: value });
  const lead = primaryCalendar(draft);
  const shown = new Set((draft[EXTRA_KEY] ?? '').split(',').filter(Boolean));
  const usesMoon = lead === 'moon' || shown.has('moon');
  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const calendars = CALENDARS.filter((c) => shown.has(c.id) && !(lead === 'moon' && c.id === 'moon')).map((c) => c.id);
      await api.saveCovenCounting(info.id, calendars, readCovenMoon({ ...draft, [COUNT_KEY]: lead }));
      await covenContext.refresh();
      reload();
      setEdits(null);
      setMessage('Saved. Members see it on the coven’s page, and may take it for their own.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <Section label="How the coven counts its days">
      <Text style={type.caption}>
        The coven’s own way of counting days, as members choose theirs in Settings → Calendar & holidays. Members see it on the coven’s page and may take it for their own; it never changes anyone’s settings unless they choose.
      </Text>
      <Text style={styles.label}>Count the coven’s days by</Text>
      <Chips label="Count the coven’s days by" options={COUNT_OPTIONS} value={lead} onChange={(v) => set(COUNT_KEY, v)} />
      <Text style={styles.label}>Also show</Text>
      <Text style={type.caption}>The calendars the coven keeps beside the date. The moon’s months can follow the Attic, Coligny or Hindu calendar when the coven shows it.</Text>
      <Card>
        {CALENDARS.filter((c) => !(lead === 'moon' && c.id === 'moon')).map((def) => (
          <CheckRow key={def.id} label={def.name} value={shown.has(def.id)} onChange={(on) => set(EXTRA_KEY, withShown(draft, def.id, on))} />
        ))}
      </Card>
      {usesMoon && (
        <Card>
          <Text style={styles.name}>{MOON_CALENDAR.name}</Text>
          <ChoiceList def={MOON_CALENDAR} draft={draft} set={set} />
        </Card>
      )}
      <Button label={busy ? 'Saving…' : 'Save how the coven counts'} onPress={save} disabled={busy} />
      {message && <Notice>{message}</Notice>}
    </Section>
  );
}

/** The coven's page: what the coven follows, and taking it for your own. */
export function CovenFollowsCard({ info, member, moon }: { info: Coven; member: boolean; moon: Record<string, unknown> | null }) {
  const place = usePlace();
  const { settings, save, status } = useMySettings();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const coven = useMemo(() => ({ ...info, moon_calendar: moon ?? {} }), [info, moon]);
  const lines = covenFollowsLines(coven);
  if (!moon || !lines.length) return null;

  const today = new Date();
  const theirs = covenMoonLine(coven, today, place);
  const differs = settings ? covenMoonLineIfDifferent(coven, settings, today, place) : theirs;
  const state = settings ? covenCalendarState(settings, coven) : 'none';
  const changes = settings ? covenCalendarChanges(settings, coven).lines : [];
  const ready = member && !!settings && status !== 'loading';

  const apply = async (changes: Record<string, string>, done: string) => {
    if (!settings) return;
    setBusy(true);
    setMessage(null);
    try {
      await save({ ...settings, ...changes } as Settings);
      setConfirming(false);
      setMessage(done);
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <Section label="What the coven follows">
      <Card>
        {lines.map((line) => (
          <Text key={line} style={type.body}>
            {line}
          </Text>
        ))}
        {!!theirs && <Text style={type.caption}>{differs ? `Today, by the coven’s count: ${theirs}.` : `Today, by the coven’s count and yours: ${theirs}.`}</Text>}
        {ready && (state === 'offer' || state === 'changed') && !confirming && (
          <View style={styles.actions}>
            {state === 'changed' && <Text style={type.caption}>The coven’s calendar has changed since you took it. Update yours to match?</Text>}
            <Button label={state === 'changed' ? 'Update mine' : 'Use the coven’s calendar for my own'} onPress={() => setConfirming(true)} />
            <Button label={state === 'changed' ? 'Keep mine as it is' : 'Keep my own'} variant="outline" onPress={() => void apply(keepMyCalendar(settings, coven), 'Your own calendar stays as it is.')} disabled={busy} />
          </View>
        )}
        {ready && confirming && (
          <View style={styles.actions}>
            <Text style={styles.label}>This changes your Settings → Calendar & holidays:</Text>
            {changes.map((c) => (
              <Text key={c.label} style={type.caption}>
                {c.from ? `${c.label}: ${c.from} → ${c.to}` : `${c.label}: ${c.to}`}
              </Text>
            ))}
            <Text style={type.caption}>Everything else stays yours, and you can put your own back afterwards.</Text>
            <Button label={busy ? 'Saving…' : 'Yes, use it'} onPress={() => void apply(takeCovenCalendar(settings, coven), 'Your calendar now follows the coven’s.')} disabled={busy} />
            <Button label="Not now" variant="text" onPress={() => setConfirming(false)} />
          </View>
        )}
        {ready && state === 'applied' && <Text style={type.caption}>Your calendar follows the coven’s.</Text>}
        {ready && state === 'same' && <Text style={type.caption}>Your calendar already counts as the coven’s does.</Text>}
        {ready && state === 'kept' && (
          <View style={styles.actions}>
            <Text style={type.caption}>You keep your own calendar.</Text>
            <Button label="Use the coven’s after all" variant="text" onPress={() => setConfirming(true)} />
          </View>
        )}
        {ready && canRestore(settings, coven) && !confirming && (
          <Button label="Put back my own calendar" variant="text" onPress={() => void apply(restoreMyCalendar(settings), 'Your own calendar is back as it was.')} disabled={busy} />
        )}
        {message && <Notice>{message}</Notice>}
      </Card>
    </Section>
  );
}

/**
 * For a gathering's date: "Hekatombaion · day 7 by the coven’s count", when
 * the coven keeps the moon's months and its date differs from yours, or ''.
 * Pass the coven's moon calendar when it is already read.
 */
export function useCovenMoonFor(info: Coven | undefined, known?: Record<string, unknown> | null) {
  const [read] = useCovenMoon(known === undefined ? info?.id : undefined);
  const moon = known === undefined ? read : known;
  const place = usePlace();
  const { settings } = useMySettings();
  return (when: string | Date | null | undefined) => {
    if (!info || !moon || !when) return '';
    const line = covenMoonLineIfDifferent({ ...info, moon_calendar: moon }, settings, new Date(when), place);
    return line ? `${line} by the coven’s count` : '';
  };
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.parchment, paddingTop: 6 },
  name: { fontFamily: fonts.display, fontSize: 21, lineHeight: 25, color: colors.cream },
  actions: { gap: 8, paddingTop: 6 },
});
