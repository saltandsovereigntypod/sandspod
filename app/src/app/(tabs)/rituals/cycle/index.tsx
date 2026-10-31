import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { CycleWheel } from '../../../../components/cycle/CycleWheel';
import { ReadingCard } from '../../../../components/cycle/parts';
import { errorText, PassphraseInput, passphraseProblem, Progress, RecoveryCard } from '../../../../components/cycle/ui';
import { Body, Card, List, Notice, RitualScreen, Row, SectionLabel, Title, tell, ui } from '../../../../components/rituals/ui';
import { ARCHETYPES, FRAMEWORK_NOTE, NOT_MEDICAL, SEASON_INFO } from '../../../../lib/cycle/content';
import { historyReading } from '../../../../lib/cycle/history';
import { exactReading } from '../../../../lib/cycle/readings';
import { redFlags, symptomInsights } from '../../../../lib/cycle/symptoms';
import {
  bleedDays,
  bleedMoons,
  dayKey,
  notePatterns,
  PATTERN_NAMES,
  patternSummary,
  seasonTitle,
  todayView,
  wheelModel,
} from '../../../../lib/cycle/model';
import {
  bringInGuestNotes,
  protectWithPassphrase,
  refreshCycle,
  startOnDevice,
  unlock,
  unlockRecovery,
  useCycle,
  type CycleState,
} from '../../../../lib/cycle/store';
import { moonState } from '../../../../lib/moon';
import { useSession } from '../../../../lib/session';
import { type } from '../../../../theme';

const SYNC_LINE: Record<CycleState['sync'], string> = {
  synced: 'Encrypted on this phone · kept with your account',
  saving: 'Encrypted on this phone · saving to your account…',
  offline: 'Encrypted · couldn’t reach your account just now, kept on this phone',
  unavailable: 'Encrypted · kept on this phone (sync isn’t ready on the server yet)',
  device: 'Encrypted · kept on this phone only',
  'signed-out': 'Encrypted · kept on this phone only',
};

// Practice → Craft → Cycle & Moon: the whole tool (its address stays /rituals/cycle). Today shows one small
// card from it (components/cycle/CycleToday.tsx); the website's twin is
// /rituals/cycle/.
export default function CycleHome() {
  const cycle = useCycle();
  const now = new Date();
  const moon = moonState(now);
  const [recovery, setRecovery] = useState<string | null>(null);

  return (
    <RitualScreen back="Back" onRefresh={refreshCycle}>
      <Title eyebrow={moon.name}>Cycle &amp; Moon</Title>
      {cycle.phase === 'loading' && <ActivityIndicator />}
      {cycle.phase === 'new' && <Begin onRecovery={setRecovery} />}
      {cycle.phase === 'locked' && <Unlock />}
      {recovery && <RecoveryCard recovery={recovery} onDone={() => setRecovery(null)} />}
      {cycle.phase === 'open' && cycle.data && <Open cycle={cycle} now={now} />}
      <Notice>{NOT_MEDICAL}</Notice>
    </RitualScreen>
  );
}

function Begin({ onRecovery }: { onRecovery: (r: string) => void }) {
  const { session } = useSession();
  const [choosing, setChoosing] = useState(false);
  const [pass, setPass] = useState('');
  const [again, setAgain] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const problem = passphraseProblem(pass, again);

  return (
    <View style={ui.gap}>
      <Card>
        <Text style={type.cardTitle}>Your cycle, beside the moon</Text>
        <Body>
          Log your bleeds and how the days feel, see where each bleed falls in the lunar month, and find practice that suits your inner season. If you don’t bleed, you can follow the moon alone.
        </Body>
        <Body muted>
          Everything is encrypted on this phone before it’s kept anywhere. Choose how to keep it; you can change this later.
        </Body>
      </Card>
      {session && !choosing && (
        <Card accent>
          <Text style={type.cardTitle}>Keep it with my account</Text>
          <Body>Protected by a Cycle &amp; Moon passphrase only you know, so it shows on any phone you sign in on and on the website. The server only ever holds it encrypted.</Body>
          <Button label="Set a passphrase" onPress={() => setChoosing(true)} />
        </Card>
      )}
      {choosing && (
        <Card accent>
          <Text style={type.cardTitle}>Choose a passphrase</Text>
          <Body muted>Not your account password. A few unrelated words are easy to remember and hard to guess. You’ll also get a recovery key to write down.</Body>
          <PassphraseInput label="Passphrase" value={pass} onChange={setPass} autoFocus />
          <PassphraseInput label="The same again" value={again} onChange={setAgain} />
          {!!pass && !!problem && <Text style={type.caption}>{problem}</Text>}
          {progress != null && <Progress done={progress} label="Making your key. This takes a few seconds on purpose." />}
          {error && <Notice>{error}</Notice>}
          <Button
            label={progress != null ? 'Protecting…' : 'Protect and keep with my account'}
            disabled={!!problem || progress != null}
            onPress={async () => {
              setError(null);
              setProgress(0);
              try {
                onRecovery(await protectWithPassphrase(pass, setProgress));
              } catch (e) {
                setError(errorText(e));
              } finally {
                setProgress(null);
              }
            }}
          />
          <Button label="Not now" variant="text" onPress={() => setChoosing(false)} />
        </Card>
      )}
      {!choosing && (
        <Card>
          <Text style={type.cardTitle}>Keep it on this phone only</Text>
          <Body>No passphrase. Nothing is sent anywhere, so it won’t show on the website or another phone. Deleting the app deletes it.</Body>
          <Button label="Keep it on this phone" variant="outline" onPress={() => void startOnDevice()} />
          {!session && <Body muted>Sign in to keep it with your account, encrypted, instead.</Body>}
        </Card>
      )}
    </View>
  );
}

function Unlock() {
  const [pass, setPass] = useState('');
  const [code, setCode] = useState('');
  const [useCode, setUseCode] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <Card accent>
      <Text style={type.cardTitle}>Open your Cycle &amp; Moon</Text>
      <Body muted>Your notes are encrypted. Enter your Cycle &amp; Moon passphrase to open them on this phone; it will remember them after that.</Body>
      {!useCode ? (
        <PassphraseInput label="Passphrase" value={pass} onChange={setPass} />
      ) : (
        <View style={ui.gapSmall}>
          <Text style={type.caption}>Recovery key (eight groups of four)</Text>
          <PassphraseInput label="Recovery key" value={code} onChange={setCode} />
        </View>
      )}
      {progress != null && <Progress done={progress} label="Opening…" />}
      {error && <Notice>{error}</Notice>}
      <Button
        label={progress != null ? 'Opening…' : 'Open'}
        disabled={progress != null || (!useCode ? !pass : !code)}
        onPress={async () => {
          setError(null);
          setProgress(0);
          try {
            if (useCode) await unlockRecovery(code);
            else await unlock(pass, setProgress);
          } catch (e) {
            setError(errorText(e));
          } finally {
            setProgress(null);
          }
        }}
      />
      <Button label={useCode ? 'Use my passphrase' : 'I forgot it: use my recovery key'} variant="text" onPress={() => setUseCode(!useCode)} />
      <Body muted>Without the passphrase or the recovery key, nobody can open these notes, including the people who run Salt &amp; Sovereignty. You can delete them and start again in Settings below.</Body>
      <Button label="Cycle & Moon settings" variant="text" onPress={() => router.push('/rituals/cycle/settings')} />
    </Card>
  );
}

function Open({ cycle, now }: { cycle: CycleState; now: Date }) {
  const data = cycle.data!;
  const { session } = useSession();
  const view = todayView(data, now);
  const wheel = useMemo(() => wheelModel(data, now), [data]); // eslint-disable-line react-hooks/exhaustive-deps -- once per change of the notes
  const summary = patternSummary(data);
  const patterns = useMemo(() => notePatterns(data), [data]);
  const moons = useMemo(() => bleedMoons(data), [data]);
  const reading = exactReading(data, now);
  const past = useMemo(() => historyReading(data), [data]);
  const found = useMemo(() => ({ insights: symptomInsights(data), flags: redFlags(data, new Date()) }), [data]);
  const info = SEASON_INFO[view.season];
  const s = data.settings;
  const today = dayKey(now);

  return (
    <View style={ui.gap}>
      <Text style={type.caption}>{SYNC_LINE[cycle.sync]}</Text>
      {cycle.error && <Notice>{cycle.error}</Notice>}

      {cycle.guestCopy && (
        <Card>
          <Body>You kept Cycle &amp; Moon notes on this phone before signing in. Bring them into your account’s notes?</Body>
          <Button
            label="Bring them in"
            variant="outline"
            onPress={async () => {
              try {
                const n = await bringInGuestNotes();
                tell('Brought in', `${n} ${n === 1 ? 'entry' : 'entries'} added to your notes.`);
              } catch (e) {
                tell('Couldn’t bring them in', errorText(e));
              }
            }}
          />
        </Card>
      )}

      <Card accent>
        <Text style={[type.eyebrow, ui.gold]}>Today</Text>
        <Text style={type.cardTitle}>{view.line}</Text>
        {view.bleeding && <Body>In moon time. Rest counts as practice.</Body>}
        {view.estimate && <Body>{view.estimate.line}</Body>}
        {s.mode === 'cycle' && !data.bleeds.length && <Body muted>Add your past periods, or log when your next bleed begins, and the days will count from there. Until then, the moon gives the season.</Body>}
        {s.archetypes && <Body muted>{`${ARCHETYPES[view.season].name} (${ARCHETYPES[view.season].plain}): ${ARCHETYPES[view.season].line}`}</Body>}
        <Button label="Log today" onPress={() => router.push({ pathname: '/rituals/cycle/log', params: { date: today } })} />
        {s.mode === 'cycle' && data.bleeds.length < 3 && <Button label="Add past periods" variant="outline" onPress={() => router.push('/rituals/cycle/past')} />}
      </Card>

      <ReadingCard reading={reading} onWrite={() => router.push({ pathname: '/rituals/cycle/log', params: { date: today } })} />

      {view.bleeding && s.altar && (
        <Card>
          <Text style={type.cardTitle}>Your moon-time altar</Text>
          <Body>A moon bowl of water, red candles and a red cord, moonstone and red jasper, mugwort and rose. Set it out while you bleed, put it away when you’re done.</Body>
          <Button label="Set out the moon-time altar" variant="outline" onPress={() => router.navigate({ pathname: '/altar/[altarId]', params: { altarId: 'moon-time' } })} />
        </Card>
      )}

      <Card>
        <Text style={[type.eyebrow, ui.gold]}>{seasonTitle(view.season)}</Text>
        <Body>{info.feel}</Body>
        <Body>{info.practice}</Body>
      </Card>

      {s.mode === 'cycle' && (
        <Card>
          <Text style={[type.eyebrow, ui.gold]}>What am I?</Text>
          <Text style={type.cardTitle}>{past.type ? past.type.headline : 'Add your past periods to find out'}</Text>
          {past.average != null && <Body>{past.lines[0]}</Body>}
          <Button label="Your history, read" variant="text" onPress={() => router.push('/rituals/cycle/history')} />
        </Card>
      )}

      <Card>
        <Text style={[type.eyebrow, ui.gold]}>Symptoms and insights</Text>
        {found.flags.length > 0 && <Body>{found.flags[0]}</Body>}
        {found.insights.slice(0, 3).map((i) => (
          <Body key={i.text}>{i.text}</Body>
        ))}
        {!found.insights.length && !found.flags.length && <Body muted>Log symptoms on the days you have them, and patterns, comfort and folk remedies for them will show here.</Body>}
        <Button label="Symptoms, patterns and comfort" variant="text" onPress={() => router.push('/rituals/cycle/insights')} />
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>The moon wheel</SectionLabel>
        <CycleWheel wheel={wheel} />
        {summary && <Body>{summary}</Body>}
        <Text style={type.caption}>{FRAMEWORK_NOTE}</Text>
      </View>

      {patterns.length > 0 && (
        <Card>
          <Text style={[type.eyebrow, ui.gold]}>Over time</Text>
          {patterns.map((line) => (
            <Body key={line}>{line}</Body>
          ))}
        </Card>
      )}

      {moons.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Your bleeds and the moon</SectionLabel>
          <List>
            {moons.slice(0, 12).map((m, i, all) => (
              <Row
                key={m.bleed.id}
                icon="today"
                title={new Date(`${m.bleed.start}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                detail={`${m.phase} · ${PATTERN_NAMES[m.pattern]} · ${m.bleed.end ? `${bleedDays(m.bleed)} days` : 'end not marked'}`}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/rituals/cycle/log', params: { date: m.bleed.start } })}
              />
            ))}
          </List>
          {s.grimoire && session && (
            <Button label="Keep a reflection in my Grimoire" variant="outline" onPress={() => router.push({ pathname: '/rituals/cycle/keep', params: { bleed: moons[0].bleed.id } })} />
          )}
        </View>
      )}

      <List>
        <Row icon="grimoire" title="Log a day" detail="A bleed, its flow, symptoms and how the day feels" onPress={() => router.push({ pathname: '/rituals/cycle/log', params: { date: today } })} />
        {s.mode === 'cycle' && <Row icon="calendar" title="Past periods" detail="Add many at once, paste a list, or change one" onPress={() => router.push('/rituals/cycle/past')} />}
        {s.mode === 'cycle' && <Row icon="today" title="What am I?" detail="Your average cycle, its rhythm and your moon pattern" onPress={() => router.push('/rituals/cycle/history')} />}
        <Row icon="wheel" title="Symptoms and insights" detail="Patterns over your cycles and the moon, and comfort for each" onPress={() => router.push('/rituals/cycle/insights')} />
        <Row icon="wheel" title="Inner seasons and moon patterns" detail="What suits each season, prompts, and the four moon patterns" onPress={() => router.push('/rituals/cycle/learn')} />
        <Row icon="calendar" title="The moon on the land" detail="Your land journal reads the moon on every day you note" onPress={() => router.push('/rituals/craft/hearth/land')} />
        <Row icon="grimoire" title="Shadow work journal" detail="Gentle prompts, with the moon and its season noted as you write" onPress={() => router.push('/grimoire/journals/shadow')} />
        <Row icon="coven" title="Share with my covens" detail="Only “in moon time” or “resting”, if you choose" onPress={() => router.push('/rituals/cycle/share')} />
        <Row icon="more" title="Settings and privacy" detail="Cycle length, moon only, reminders, passphrase, delete" last onPress={() => router.push('/rituals/cycle/settings')} />
      </List>
    </View>
  );
}
