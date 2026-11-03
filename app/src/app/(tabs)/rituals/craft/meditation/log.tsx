import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, confirmAction, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { useGrimoire } from '../../../../../lib/grimoire/store';
import { CAME_UP_TAGS, findSitPage, newSit, normalizeSit, SETTLED_WORDS, SIT_KINDS, sitPage, SITS, type Sit, type SitKind } from '../../../../../lib/meditation/log';
import { localDateKey } from '../../../../../lib/rituals/lifecycle';

const pad = (n: number) => String(n).padStart(2, '0');
const timeOf = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "2026-11-03" and "07:30" back to a moment, or null. */
function moment(day: string, time: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day.trim());
  const t = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!d || !t) return null;
  const at = new Date(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  return Number.isNaN(at.getTime()) || +t[1] > 23 || +t[2] > 59 ? null : at;
}

// Log a sit, or change one: when, how long, the kind of practice, how
// settled, a note and what came up, and whether to keep it in the Grimoire.
export default function SitLog() {
  const params = useLocalSearchParams<{ id?: string; at?: string; minutes?: string; timed?: string; kind?: string; altar?: string; together?: string }>();
  const { entries, ready } = useCraft<unknown>(SITS);
  const grimoire = useGrimoire();
  const existing = params.id ? entries.find((e) => e.id === params.id) : null;
  const [draft, setDraft] = useState<Sit | null>(null);
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [minutes, setMinutes] = useState('');
  const [keep, setKeep] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (draft || !ready) return;
    const start = existing
      ? normalizeSit(existing.data)
      : newSit({ at: params.at && Number.isFinite(Date.parse(params.at)) ? params.at : new Date().toISOString(), minutes: Number(params.minutes) || 10, kind: (params.kind as SitKind) || 'breath', timed: params.timed === '1', altar: params.altar, together: params.together });
    const at = new Date(start.at);
    // Set once, when the entry has loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(start);
    setDay(localDateKey(at));
    setTime(timeOf(at));
    setMinutes(String(start.minutes));
  }, [draft, ready, existing, params.at, params.minutes, params.kind, params.timed, params.altar, params.together]);

  if (!draft) {
    return (
      <RitualScreen back="Meditation">
        <Title eyebrow="Meditation">A sit</Title>
        <Body>{ready && params.id ? 'This sit couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const set = (patch: Partial<Sit>) => setDraft({ ...draft, ...patch });
  const kept = existing && grimoire.snapshot ? findSitPage(grimoire.snapshot.pages, existing.id) : null;

  const save = async () => {
    const at = moment(day, time);
    const mins = Math.round(Number(minutes));
    if (!at || at.getTime() > Date.now() + 60_000) return setMessage('Write the date as year-month-day and the time as hours:minutes, and not in the future.');
    if (!(mins > 0)) return setMessage('How many minutes did you sit?');
    const sit = newSit({ ...draft, at: at.toISOString(), minutes: mins });
    let id = existing?.id ?? null;
    if (id) await updateEntry<Sit>(SITS, id, sit);
    else id = (await addEntry<Sit>(SITS, sit)).id;
    if (keep && grimoire.canEdit && id && !kept) grimoire.actions.saveHolyPage(sitPage(id, sit));
    router.back();
  };
  const remove = async () => {
    if (!existing || !(await confirmAction('Delete this sit?', 'It goes from your log on every device. A copy kept in your Grimoire stays there.', 'Delete'))) return;
    await removeEntry(SITS, existing.id);
    router.back();
  };

  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">{existing ? 'Your sit' : 'Log a sit'}</Title>
      <Card>
        <Field label="Date (year-month-day)" value={day} onChange={setDay} />
        <Field label="Time began (hours:minutes)" value={time} onChange={setTime} />
        <Field label="Minutes" value={minutes} onChange={setMinutes} keyboardType="numeric" />
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>What kind of practice</SectionLabel>
        <Chips>
          {SIT_KINDS.map((k) => (
            <Chip key={k.value} label={k.label} selected={draft.kind === k.value} onPress={() => set({ kind: k.value })} />
          ))}
        </Chips>
        {draft.kind === 'other' && <Field label="In your own words" value={draft.other} onChange={(other) => set({ other })} />}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>How settled</SectionLabel>
        <Chips>
          {[1, 2, 3, 4, 5].map((n) => (
            <Chip key={n} label={String(n)} a11yLabel={`${n}, ${SETTLED_WORDS[n]}`} selected={draft.settled === n} onPress={() => set({ settled: draft.settled === n ? null : n })} />
          ))}
        </Chips>
        <Body muted>{draft.settled ? SETTLED_WORDS[draft.settled] : '1 restless, 5 deeply settled. Leave it if you’d rather not say.'}</Body>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>What came up</SectionLabel>
        <Field label="Anything that came: images, words, feelings" value={draft.cameUp} onChange={(cameUp) => set({ cameUp })} multiline />
        <Chips>
          {CAME_UP_TAGS.map((t) => (
            <Chip key={t.value} label={t.label} selected={draft.tags.includes(t.value)} onPress={() => set({ tags: draft.tags.includes(t.value) ? draft.tags.filter((x) => x !== t.value) : [...draft.tags, t.value] })} />
          ))}
        </Chips>
        <Field label="A note" value={draft.note} onChange={(note) => set({ note })} multiline />
      </View>

      {kept ? (
        <Button label="Open it in my Grimoire" variant="outline" onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: kept.id } })} />
      ) : grimoire.canEdit ? (
        <Toggle label="Save to my Grimoire" detail="A page under Meditation. Later changes here aren’t copied over." value={keep} onChange={setKeep} />
      ) : (
        <Body muted>Signed in, a sit can also be kept in your Grimoire.</Body>
      )}
      {message && <Notice>{message}</Notice>}
      <Button label="Save" onPress={() => void save()} />
      {existing && <Button label="Delete this sit" variant="text" onPress={() => void remove()} />}
    </RitualScreen>
  );
}
