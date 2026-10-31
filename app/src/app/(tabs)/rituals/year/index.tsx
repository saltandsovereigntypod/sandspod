import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { dayHref, dayWords, fullWords, LinkChips, moonHref, ProgressBar, shortWords } from '../../../../components/year/parts';
import { Body, Card, Chip, Chips, confirmAction, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, Toggle, ui } from '../../../../components/rituals/ui';
import { keepsSouthernWheel } from '../../../../lib/divination/seasonal';
import { askForYearReminders } from '../../../../lib/reminders/store';
import { useMySettings } from '../../../../lib/settings/store';
import {
  config,
  dayKey,
  isDayKey,
  MOONS,
  moonSummary,
  moonView,
  positionOn,
  setRemind,
  setStart,
  setTrack,
  startChoices,
  stopYear,
  summaryLine,
  todayLine,
  trackById,
  TRACKS,
  yearFraction,
  yearSchedule,
  yearStatus,
  type TrackId,
} from '../../../../lib/yearday';
import { useYear } from '../../../../lib/yearday/store';

// A Year and a Day: a year of study and practice alone, thirteen moons long,
// ending in a self-dedication. The chooser when none is begun; the year's
// moons once it is.
export default function YearHome() {
  const { progress, ready, begin, change } = useYear();
  return (
    <RitualScreen back="Rituals">
      <Title eyebrow="Thirteen moons · study · practice · self-dedication">A Year and a Day</Title>
      {!ready ? null : progress ? <YourYear key={progress.startedAt} /> : <Begin begin={begin} />}
      {ready && progress && <Settings change={change} />}
      <List>
        <Row icon="wheel" title="Dedication journeys" detail="The guided paths whose rite closes the year" onPress={() => router.push('/rituals/journeys')} />
        <Row icon="altar" title="Solitary practice" detail="Daily devotion, and workings for practising alone" last onPress={() => router.push('/rituals/craft/solitary')} />
      </List>
    </RitualScreen>
  );
}

function Begin({ begin }: { begin: (track: TrackId, start: string, south?: boolean) => Promise<void> }) {
  const { settings } = useMySettings();
  const [trackId, setTrackId] = useState<TrackId>('eclectic');
  const [south, setSouth] = useState(() => keepsSouthernWheel(settings));
  const track = trackById(trackId);
  const now = useMemo(() => new Date(), []);
  const choices = useMemo(() => startChoices(now, trackId, south), [now, trackId, south]);
  const [date, setDate] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const chosen = date ?? choices.find((c) => c.key === 'new-moon')?.date ?? dayKey(now);
  const typedOk = isDayKey(typed.trim());

  return (
    <View style={ui.gap}>
      <Body>
        A year and a day is an old span for learning a craft, and many modern paths keep it before a dedication. This is one for practising
        alone: thirteen moons of readings from the courses, practice with the moon, the festivals of your calendar, meditation, divination,
        your altar, offerings and spellcraft, a reflection each moon, and at the end a rite of self-dedication if you choose it.
      </Body>
      <Body muted>
        Nothing is graded or locked. The self-checks are for you alone, you can read ahead or fall behind, and a dedication is a promise to
        yourself, not an initiation.
      </Body>

      <SectionLabel>Your track</SectionLabel>
      <Chips>
        {TRACKS.map((t) => (
          <Chip key={t.id} label={t.name} selected={t.id === trackId} onPress={() => setTrackId(t.id)} />
        ))}
      </Chips>
      <Card>
        <Body>{track.about}</Body>
        {!!track.note && <Body muted>{track.note}</Body>}
        {!!track.noteLink && <LinkChips links={[track.noteLink]} />}
      </Card>
      {!!track.south && (
        <Toggle label="Southern hemisphere" detail="Keep the Wheel’s festivals by the southern seasons" value={south} onChange={setSouth} />
      )}

      <SectionLabel>When to begin</SectionLabel>
      <Chips>
        {choices.map((c) => (
          <Chip key={c.key} label={`${c.label} · ${shortWords(c.date)}`} selected={chosen === c.date && !typedOk} onPress={() => (setDate(c.date), setTyped(''))} />
        ))}
      </Chips>
      <Body muted>{choices.find((c) => c.date === chosen)?.detail ?? dayWords(chosen)}</Body>
      <Field label="Or another day (YYYY-MM-DD)" value={typed} onChange={setTyped} placeholder="2027-02-01" />
      {!!typed.trim() && !typedOk && <Notice>That doesn’t look like a date. Write it as year-month-day.</Notice>}
      <Button
        label={busy ? 'Beginning…' : 'Begin my year and a day'}
        disabled={busy || (!!typed.trim() && !typedOk)}
        onPress={async () => {
          setBusy(true);
          await begin(trackId, typedOk ? typed.trim() : chosen, !!track.south && south);
          setBusy(false);
        }}
      />
    </View>
  );
}

function YourYear() {
  const { progress } = useYear();
  const today = dayKey(new Date());
  if (!progress) return null;
  const s = yearSchedule(progress.startDate);
  const pos = positionOn(s, today);
  const status = yearStatus(progress, today);
  const line = todayLine(progress, today);
  const track = trackById(progress.track);
  return (
    <View style={ui.gap}>
      <Card accent>
        <SectionLabel>{`${track.name} · ${fullWords(s.start)} to ${fullWords(s.day)}`}</SectionLabel>
        <Body>{status === 'dedicated' ? `Dedicated on ${dayWords(dayKey(new Date(progress.dedicatedAt!)))}.` : line?.line ?? ''}</Body>
        {!!line?.detail && <Body muted>{line.detail}</Body>}
        <ProgressBar value={yearFraction(progress, today)} label="How far through the year" />
        {pos.phase === 'moon' && <Button label={`Open moon ${pos.n}`} variant="outline" onPress={() => router.push(moonHref(pos.n))} />}
      </Card>

      <SectionLabel>The thirteen moons</SectionLabel>
      <List>
        {s.windows.map((w) => {
          const view = moonView(config(progress), w.n)!;
          const sum = moonSummary(progress, view);
          const now = pos.phase === 'moon' && pos.n === w.n;
          return (
            <Row
              key={w.id}
              icon={now ? 'today' : 'calendar'}
              title={`Moon ${w.n}: ${view.moon.title}${now ? ' · now' : ''}`}
              detail={`${shortWords(w.start)} · ${view.moon.theme} · ${summaryLine(sum)}`}
              onPress={() => router.push(moonHref(w.n))}
            />
          );
        })}
        <Row icon="wheel" title="The day of dedication" detail={`${dayWords(s.day)} · a year and a day`} last onPress={() => router.push(dayHref())} />
      </List>
      {s.aligned && <Body muted>You began at a new moon, so each moon begins at the next new moon.</Body>}
      <Body muted>{`${MOONS.length} moons. Your progress is saved with your account (or on this phone as a guest), and shows on the website too.`}</Body>
    </View>
  );
}

function Settings({ change }: { change: ReturnType<typeof useYear>['change'] }) {
  const { progress } = useYear();
  const [date, setDate] = useState('');
  if (!progress) return null;
  const dateOk = isDayKey(date.trim());
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Your year</SectionLabel>
      <Toggle
        label="Remind me"
        detail="When each moon begins, a nudge to reflect before it ends, and the day of dedication"
        value={progress.remind}
        onChange={async (on) => {
          await change((p) => setRemind(p, on));
          if (on) await askForYearReminders();
        }}
      />
      <Chips>
        {TRACKS.map((t) => (
          <Chip key={t.id} label={t.name} selected={t.id === progress.track} onPress={() => change((p) => setTrack(p, t.id))} a11yLabel={`Track: ${t.name}`} />
        ))}
      </Chips>
      <Field label="Move the first day (YYYY-MM-DD)" value={date} onChange={setDate} placeholder={progress.startDate} />
      {dateOk && (
        <Button
          label={`Begin on ${dayWords(date.trim())} instead`}
          variant="outline"
          onPress={async () => {
            await change((p) => setStart(p, date.trim()));
            setDate('');
          }}
        />
      )}
      <Button
        label="Set this year aside"
        variant="text"
        onPress={async () => {
          if (await confirmAction('Set your year aside?', 'What you have done and written is kept. You can begin a new year whenever you like.', 'Set aside'))
            await change((p) => stopYear(p, new Date()));
        }}
      />
    </View>
  );
}
