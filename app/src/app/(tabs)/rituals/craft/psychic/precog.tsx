import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Chips, goTo, ResultsLine, usePsychic } from '../../../../../components/psychic/shared';
import { Body, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';

import { todaysCard } from '../../../../../lib/divination/daily';
import { normalizeReading, READINGS, type ReadingEntry } from '../../../../../lib/craft/hedge/readings';
import { PSYCHIC_SESSIONS, type PsychicSession } from '../../../../../lib/craft/psychic/log';
import { MINOR_RANKS, nextDay, PRECOG_SUITS, resolvePrecog, suitChance, type PrecogEntry, type PrecogGuess, type PrecogSuit } from '../../../../../lib/craft/psychic/precog';
import { updateEntry, useCraft } from '../../../../../lib/craft/store';
import { dateFromKey, localDateKey } from '../../../../../lib/rituals/lifecycle';

const MAJOR_NUMBERS = Array.from({ length: 22 }, (_, n) => n);

const words = (e: PrecogEntry) => {
  const s = PRECOG_SUITS.find((x) => x.id === e.guess.suit)?.label;
  const n = e.guess.suit === 'major' ? e.guess.number : (MINOR_RANKS.find((r) => r.n === e.guess.number)?.label ?? null);
  return [s, n !== null && n !== undefined ? String(n) : null, e.guess.text.trim() ? `“${e.guess.text.trim().slice(0, 60)}”` : null].filter(Boolean).join(' · ') || 'No guess';
};

// Tomorrow's card: say today what tomorrow's card of the day will be. Tomorrow,
// once that card has been drawn in Divination, the guess is checked against it
// automatically and scored.
export default function Precog() {
  const { sessions, keep } = usePsychic();
  const { entries: readingEntries } = useCraft<unknown>(READINGS);
  const readings = useMemo<ReadingEntry[]>(() => readingEntries.map((e) => ({ id: e.id, createdAt: e.createdAt, data: normalizeReading(e.data) })), [readingEntries]);
  const today = localDateKey(new Date());
  const tomorrow = nextDay(today);
  const [suit, setSuit] = useState<PrecogSuit | ''>('');
  const [number, setNumber] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const mine = sessions.filter((s) => s.data.kind === 'precog');
  const entries = mine.map((s) => ({ id: s.id, session: s.data, p: s.data.detail as unknown as PrecogEntry }));
  const already = entries.some((e) => e.p.forDate === tomorrow);

  // Resolve anything whose day has come and whose card has been drawn.
  useEffect(() => {
    const cardFor = (day: string) => {
      const d = dateFromKey(day);
      return d ? (todaysCard(readings, d)?.name ?? null) : null;
    };
    for (const e of entries) {
      if (e.p.status !== 'waiting') continue;
      const done = resolvePrecog(e.p, cardFor, today);
      if (done === e.p) continue;
      const scored = done.status === 'resolved' && !!done.score && done.score.suit !== null;
      const next: PsychicSession = {
        ...e.session,
        trials: scored ? 1 : 0,
        hits: scored && done.score!.suit ? 1 : 0,
        chance: e.p.guess.suit ? suitChance(e.p.guess.suit) : 0.5,
        summary:
          done.status === 'resolved' && done.card
            ? `${words(e.p)}, then ${done.card.name}${done.score?.exact ? ': exact' : done.score?.suit ? ': right suit' : ''}`
            : `${words(e.p)}: no card drawn that day`,
        detail: done as unknown as Record<string, unknown>,
      };
      void updateEntry(PSYCHIC_SESSIONS, e.id, next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings, sessions, today]);

  const save = async () => {
    const guess: PrecogGuess = { suit, number, text };
    const entry: PrecogEntry = { date: today, forDate: tomorrow, guess, status: 'waiting' };
    await keep({ kind: 'precog', trials: 0, hits: 0, chance: suit ? suitChance(suit) : 0.5, summary: `${words(entry)} (waiting for ${tomorrow})`, detail: entry as unknown as Record<string, unknown> });
    setSaved(true);
  };

  const numbers = suit === 'major' ? MAJOR_NUMBERS.map((n) => ({ n, label: String(n) })) : MINOR_RANKS;
  const canSave = !already && !saved && (suit !== '' || text.trim() !== '');
  const resolved = entries.filter((e) => e.p.status === 'resolved');

  return (
    <RitualScreen back="Psychic development">
      <Title eyebrow="Psychic development">Tomorrow’s card</Title>
      <Body muted>Guess today which card will be tomorrow’s card of the day. Tomorrow, draw it in Divination as usual; the guess is then checked and scored for you. The card is drawn at random, so nothing you do can change it.</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>{`Your guess for ${tomorrow}`}</SectionLabel>
        <Chips>
          {PRECOG_SUITS.map((s) => (
            <Chip key={s.id} label={s.label} selected={suit === s.id} onPress={() => { setSuit(suit === s.id ? '' : s.id); setNumber(null); }} />
          ))}
        </Chips>
      </View>
      {suit !== '' && (
        <View style={ui.gapSmall}>
          <SectionLabel>{suit === 'major' ? 'Which number (0 to 21), if you have one' : 'Which rank, if you have one'}</SectionLabel>
          <Chips>
            {numbers.map((r) => (
              <Chip key={r.n} label={r.label} selected={number === r.n} onPress={() => setNumber(number === r.n ? null : r.n)} />
            ))}
          </Chips>
        </View>
      )}
      <Field label="Impressions (optional)" placeholder="A colour, a figure, a feeling, a word" value={text} onChange={setText} multiline />
      {already || saved ? <Notice>Your guess for tomorrow is kept. Come back after drawing tomorrow’s card.</Notice> : null}
      <Button label="Keep my guess" disabled={!canSave} onPress={save} />
      <Notice>Naming a suit or the major arcana is what is scored against chance (a major has 22 chances in 78, a suit 14 in 78). Impressions alone are kept in your Journal but not scored.</Notice>
      <Button label="Draw a card of the day" variant="outline" onPress={goTo('/rituals/divination/draw')} />

      <View style={ui.gapSmall}>
        <SectionLabel>Your guesses</SectionLabel>
        {entries.length === 0 ? (
          <Body muted>None yet.</Body>
        ) : (
          <List>
            {entries.slice(0, 12).map((e, i, all) => (
              <Row
                key={e.id}
                icon="wheel"
                title={`${e.p.forDate}: ${words(e.p)}`}
                detail={e.p.status === 'resolved' && e.p.card ? `Card: ${e.p.card.name}. ${e.p.score?.exact ? 'Exact. ' : ''}${e.p.score?.suit ? 'Suit or arcana right. ' : ''}${e.p.score?.number ? 'Number right.' : ''}` : e.p.status === 'missed' ? 'No card was drawn that day' : 'Waiting for that day’s card'}
                last={i === all.length - 1}
                onPress={goTo('/rituals/divination')}
              />
            ))}
          </List>
        )}
        {resolved.length > 0 && <ResultsLine sessions={sessions} kind="precog" />}
      </View>
    </RitualScreen>
  );
}
