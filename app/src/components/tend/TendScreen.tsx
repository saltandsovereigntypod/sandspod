// To tend: everything you look after, from anywhere, in one list. Due today
// first, then what's ongoing; each with where it came from, tended right
// here by its own source's tending (so the altar, the coven and the journal
// all show it), with a rhythm and a reminder of its own, and an ending with
// "how did it go?" kept in your Grimoire. The logic is lib/tend, shared with
// the website's /today/tend/.

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { DidItWork } from '../rituals/DidItWork';
import { ItemDidItWork } from '../rituals/ItemDidItWork';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle } from '../rituals/ui';
import { useWorkshop } from '../../lib/altar/workshop';
import { useGrimoire } from '../../lib/grimoire/store';
import { useRituals } from '../../lib/rituals/store';
import {
  END_WORDS,
  filterList,
  GROUP_FILTERS,
  KIND_LABEL,
  MOON_MARKS,
  RHYTHMS,
  rhythmOf,
  untilChoices,
  type ListItem,
  type Rhythm,
  type TendEnd,
  type TendGroup,
} from '../../lib/tend/model';
import { useTendActions, useTendList, type Outcome, type TendContext } from '../../lib/tend/store';
import { colors, fonts, radius, type } from '../../theme';

export const KIND_MARK: Record<ListItem['kind'], string> = {
  petition: '✉',
  candle: '🕯',
  offering: '❦',
  plant: '❧',
  'coven-petition': '✦',
  contribution: '✧',
  journey: '☽',
  lookback: '?',
  'coven-task': '✎',
  checkin: '☉',
  action: '✓',
};

/** Its own endings, and letting it go from the list (it won't ask again). */
const endsOf = (item: ListItem): TendEnd[] => [...item.ends, ...(item.ends.includes('let-go') ? [] : (['let-go'] as TendEnd[]))];

const HOURS = [7 * 60, 9 * 60, 12 * 60, 18 * 60, 20 * 60, 21 * 60];
const hourLabel = (m: number) => new Date(2000, 0, 1, Math.floor(m / 60), m % 60).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export function TendScreen() {
  const [now] = useState(() => new Date());
  const ctx = useTendList(now);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<'all' | TendGroup>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pick = <T extends ListItem>(list: T[]) => filterList(group === 'all' ? list : list.filter((i) => i.group === group), query);
  const today = pick(ctx.list.today);
  const ongoing = pick(ctx.list.ongoing);
  const nothing = !ctx.list.today.length && !ctx.list.ongoing.length;

  return (
    <RitualScreen back="Back" onRefresh={async () => void (await Promise.all([ctx.refresh(), ctx.altarStore.refresh()]))}>
      <Title eyebrow="Everything you look after">To tend</Title>
      <Body muted>
        Your petitions, candles, offerings and plants, what you hold in your covens, your journeys and your “Did it work?” days, wherever they began. Tend them
        here and the altar, the coven and the journal keep up.
      </Body>
      <Field label="Find something" value={query} onChange={setQuery} placeholder="A petition, a plant, a coven, a ritual" />
      <Chips>
        {GROUP_FILTERS.map((g) => (
          <Chip key={g.value} label={g.label} selected={group === g.value} onPress={() => setGroup(g.value)} />
        ))}
      </Chips>
      {message && <Notice>{message}</Notice>}
      {!ctx.ready && <ActivityIndicator color={colors.gold} />}
      {ctx.ready && nothing && (
        <Card>
          <Body>Nothing to tend yet. A petition on your altar, a candle burning, an offering set out, a coven petition you hold or a journey begun will gather here.</Body>
        </Card>
      )}
      {!!today.length && <SectionLabel>{`Due today · ${today.length}`}</SectionLabel>}
      {today.map((item) => (
        <TendCard key={item.key} item={item} ctx={ctx} open={open === item.key} onToggle={() => setOpen(open === item.key ? null : item.key)} onDone={(text) => setMessage(text)} />
      ))}
      {!!ongoing.length && <SectionLabel>{`Ongoing · ${ongoing.length}`}</SectionLabel>}
      {ongoing.map((item) => (
        <TendCard key={item.key} item={item} ctx={ctx} open={open === item.key} onToggle={() => setOpen(open === item.key ? null : item.key)} onDone={(text) => setMessage(text)} />
      ))}
      {!nothing && !today.length && !ongoing.length && <Body muted>Nothing here matches. Try another word, or Everything.</Body>}
      {!ctx.userId && <Body muted>Sign in to see what you hold in your covens, and to keep how things went in your Grimoire.</Body>}
    </RitualScreen>
  );
}

function TendCard({ item, ctx, open, onToggle, onDone }: { item: ListItem; ctx: TendContext; open: boolean; onToggle: () => void; onDone: (text: string) => void }) {
  const kind = KIND_LABEL[item.kind].label;
  const line = [item.due.line, item.detail].filter(Boolean).join(' · ');
  return (
    <View style={[styles.card, item.due.state === 'ending' && styles.ending]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        aria-expanded={open}
        accessibilityLabel={`${item.title}. ${kind}. ${item.source}. ${line}${item.private ? '. Private to you' : ''}`}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <View style={styles.mark}>
          <Text style={styles.markText}>{KIND_MARK[item.kind]}</Text>
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={type.caption}>{item.source}</Text>
          {!!line && <Text style={[type.caption, item.due.state !== 'later' && item.due.state !== 'resting' && styles.gold]}>{line}</Text>}
          {item.private && <Text style={styles.private}>Private to you</Text>}
        </View>
      </Pressable>
      {open && <TendPanel item={item} ctx={ctx} onDone={onDone} />}
    </View>
  );
}

function TendPanel({ item, ctx, onDone }: { item: ListItem; ctx: TendContext; onDone: (text: string) => void }) {
  const act = useTendActions(ctx);
  const grimoire = useGrimoire();
  const { journal } = useRituals();
  const { apothecary } = useWorkshop();
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [ending, setEnding] = useState<TendEnd | null>(null);
  const [note, setNote] = useState('');
  const [keep, setKeep] = useState(true);
  const [sealed, setSealed] = useState(item.ref.visibility === 'me');
  const rhythm = rhythmOf(item, item.record);
  const choices = useMemo(() => untilChoices(new Date()), []);

  const run = async (work: () => Promise<Outcome>, close = false) => {
    setBusy(true);
    setStatus(null);
    const outcome = await work();
    setBusy(false);
    if (outcome.ok) {
      setWord('');
      setNote('');
      setEnding(null);
      if (close) onDone(outcome.message);
      else setStatus(outcome.message);
    } else setStatus(outcome.message);
  };

  const has = (a: ListItem['actions'][number]) => item.actions.includes(a);
  const setRhythm = (next: Rhythm) => void run(() => act.setRhythm(item, { rhythm: next }));

  // "Did it work?" is answered as the journal answers it.
  if (item.kind === 'lookback') {
    const entry = journal.find((e) => e.id === item.ref.journalId);
    const made = apothecary.find((a) => a.id === item.ref.itemId);
    return (
      <View style={styles.panel}>
        {entry ? <DidItWork key={entry.id} entry={entry} compact /> : made ? <ItemDidItWork key={made.id} item={made} compact /> : <Body muted>Open it to answer.</Body>}
        <Button label="Open it" variant="text" onPress={() => router.navigate(item.href as never)} />
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      {status && <Notice>{status}</Notice>}

      {item.kind === 'coven-task' ? (
        <>
          <Field label="What you’ll bring" value={word} onChange={setWord} multiline placeholder="In your own words" />
          <Toggle label="Seal it as private" detail="It still takes part, sealed. No one else reads it, the leaders too." value={sealed} onChange={setSealed} />
          <Button label={busy ? 'Writing…' : 'Write it'} disabled={busy || !word.trim()} onPress={() => void run(() => act.write(item, word, sealed), true)} />
        </>
      ) : item.kind === 'checkin' ? (
        <>
          <Field label="A note from your check-in (optional)" value={word} onChange={setWord} multiline />
          <Button label={busy ? 'Logging…' : 'We met today'} disabled={busy} onPress={() => void run(() => act.checkin(item, word), true)} />
        </>
      ) : item.kind === 'action' ? (
        <>
          <Body muted>Agreed at a coven meeting. Mark it done here or on the meeting’s page.</Body>
          <Button label={busy ? 'A moment…' : 'It’s done'} disabled={busy} onPress={() => void run(() => act.done(item), true)} />
        </>
      ) : item.kind === 'journey' && has('practice') ? (
        <>
          <Field label="A note (optional)" value={word} onChange={setWord} multiline />
          <Button label={busy ? 'Keeping it…' : 'Done for today'} disabled={busy} onPress={() => void run(() => act.practice(item, word), true)} />
        </>
      ) : (
        <>
          {(has('word') || has('tend')) && <Field label="Add a word (optional)" value={word} onChange={setWord} multiline placeholder="What you said, or what you noticed" />}
          <Chips>
            {has('light') && <Chip label="Light the candle" onPress={() => void run(() => act.tend(item, 'light', word))} />}
            {has('snuff') && <Chip label="Let the candle rest" onPress={() => void run(() => act.tend(item, 'snuff', word))} />}
            {has('refresh') && <Chip label="Refresh the offering" onPress={() => void run(() => act.tend(item, 'refresh', word))} />}
            {has('water') && <Chip label="Water it" onPress={() => void run(() => act.tend(item, 'water', word))} />}
            {has('tend') && <Chip label={item.kind === 'coven-petition' ? 'Tend it (a candle in your name)' : 'Keep holding it'} onPress={() => void run(() => act.tend(item, 'tend', word))} />}
            {has('word') && !!word.trim() && <Chip label="Keep the word" onPress={() => void run(() => act.tend(item, 'word', word))} />}
          </Chips>
          {item.kind === 'coven-petition' && !has('tend') && <Body muted>You tended it in the last twelve hours. Its candle is still burning for you.</Body>}
        </>
      )}

      <SectionLabel>Its rhythm</SectionLabel>
      <Chips>
        {RHYTHMS.map((r) => (
          <Chip
            key={r.value}
            label={r.label}
            selected={rhythm.kind === r.value}
            onPress={() => setRhythm(r.value === 'moon' ? { kind: 'moon', moon: 'full' } : r.value === 'until' ? { kind: 'until', until: choices[0]?.date ?? '', untilWhy: choices[0]?.why ?? '' } : { kind: r.value })}
          />
        ))}
      </Chips>
      {rhythm.kind === 'moon' && (
        <Chips>
          {MOON_MARKS.map((m) => (
            <Chip key={m.value} label={m.label} selected={rhythm.moon === m.value} onPress={() => setRhythm({ kind: 'moon', moon: m.value })} />
          ))}
        </Chips>
      )}
      {rhythm.kind === 'until' && (
        <Chips>
          {choices.map((c) => (
            <Chip key={c.id} label={`${c.label} · ${new Date(`${c.date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`} selected={rhythm.until === c.date} onPress={() => setRhythm({ kind: 'until', until: c.date, untilWhy: c.why })} />
          ))}
        </Chips>
      )}
      {rhythm.kind === 'asks' && <Body muted>It asks in its own time{item.kind === 'plant' || item.kind === 'offering' ? ', and your tending reminders ring for it' : ''}.</Body>}
      {rhythm.kind !== 'asks' && (
        <>
          <Toggle label="Remind me" detail="With your other reminders, keeping your quiet hours and any pause." value={!!item.record?.remind} onChange={(on) => void run(() => act.setRhythm(item, { remind: on, rhythm }))} />
          {!!item.record?.remind && (
            <Chips>
              {HOURS.map((m) => (
                <Chip key={m} label={hourLabel(m)} selected={item.record?.at === m} onPress={() => void run(() => act.setRhythm(item, { at: m }))} />
              ))}
            </Chips>
          )}
        </>
      )}

      <SectionLabel>When it’s done</SectionLabel>
      <Chips>
        {endsOf(item).map((how) => (
          <Chip key={how} label={END_WORDS[how].label} selected={ending === how} onPress={() => setEnding(ending === how ? null : how)} />
        ))}
      </Chips>
      {ending && (
        <Card>
          <Field label="How did it go? (optional)" value={note} onChange={setNote} multiline placeholder="What happened, what changed, what you’d do again" />
          {grimoire.canEdit ? <Toggle label="Keep it in my Grimoire" detail="A page under How it went, with the words you added along the way." value={keep} onChange={setKeep} /> : <Body muted>Signed in, how it went can be kept in your Grimoire.</Body>}
          <Button label={busy ? 'A moment…' : END_WORDS[ending].label} disabled={busy} onPress={() => void run(() => act.end(item, ending, note, keep), true)} />
        </Card>
      )}

      <Button label="Open where it lives" variant="text" onPress={() => router.navigate(item.href as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 14, gap: 10 },
  ending: { borderColor: colors.gold },
  head: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', minHeight: 44 },
  pressed: { opacity: 0.7 },
  mark: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.goldLine, alignItems: 'center', justifyContent: 'center' },
  markText: { color: colors.gold, fontSize: 15 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 22, color: colors.cream },
  gold: { color: colors.gold },
  private: { ...type.caption, color: colors.fern },
  panel: { gap: 12, paddingTop: 4 },
});
