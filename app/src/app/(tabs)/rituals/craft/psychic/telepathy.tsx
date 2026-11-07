import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Chips, goTo, ResultsLine, usePsychic } from '../../../../../components/psychic/shared';
import { Body, Card, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { remotePool } from '../../../../../lib/craft/psychic/remote';
import {
  cleanCode,
  draftPayload,
  ROUND_CHOICES,
  SECONDS_CHOICES,
  SENDER_MODES,
  sessionLine,
  sessionMinutes,
  startOptions,
  TARGET_TYPES,
  targetLabel,
  type Draft,
  type TelepathySession,
} from '../../../../../lib/craft/psychic/telepathy';
import { createSession, fetchCovenPeople, fetchMySessions, joinWithCode } from '../../../../../lib/craft/psychic/telepathyApi';
import { useSession } from '../../../../../lib/session';

const open = (id: string) => router.push({ pathname: '/rituals/craft/psychic/telepathy-session', params: { id } } as Href);

const when = (s: TelepathySession) => new Date(s.starts_at).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// Partner and coven telepathy: make a session, join one with a code, or open
// one you are in. The play itself is on the session screen.
export default function Telepathy() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const { sessions: kept } = usePsychic();
  const [list, setList] = useState<{ ready: boolean; sessions: TelepathySession[] } | null>(null);
  const [covens, setCovens] = useState<{ id: string; name: string }[]>([]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [making, setMaking] = useState(false);
  const [draft, setDraft] = useState<Draft>({ kind: 'pair', covenId: null, title: '', target: 'symbols', rounds: 8, seconds: 60, startsAt: null, senderMode: 'alternate', hostSends: true, sound: '', pool: [] });
  const [startIx, setStartIx] = useState(0);
  const starts = useMemo(() => startOptions(new Date()), []);

  const load = useCallback(() => {
    if (!userId) return;
    void fetchMySessions().then(setList).catch(() => setList({ ready: false, sessions: [] }));
  }, [userId]);
  useEffect(load, [load]);
  useEffect(() => {
    if (userId) void fetchCovenPeople(userId).then((x) => setCovens(x.covens)).catch(() => undefined);
  }, [userId]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const join = async () => {
    setBusy(true);
    setError('');
    try {
      open(await joinWithCode(cleanCode(code)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    }
    setBusy(false);
  };

  const make = async () => {
    const pool = draft.target === 'picture' ? remotePool().map((p) => p.id) : [];
    const made = draftPayload({ ...draft, pool, startsAt: starts[startIx]?.at ?? null }, new Date());
    if (!made.ok) return setError(made.error);
    setBusy(true);
    setError('');
    try {
      open((await createSession(made.row)).id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    }
    setBusy(false);
  };

  const mine = list?.sessions.filter((s) => s.status === 'scheduled').sort((a, b) => b.starts_at.localeCompare(a.starts_at)) ?? [];

  return (
    <RitualScreen back="Psychic development">
      <Title eyebrow="Psychic development">Telepathy</Title>
      <Body muted>One person sends: they look at a target and hold it in mind. The others write what they pick up, then choose. Nothing passes between you but the time, so there is no call: every screen follows the same clock. Targets are drawn on the server and kept from the receivers until the round is over, so they cannot be known early, and every result is set against chance.</Body>

      {!userId ? (
        <Notice>Sign in (under More) to practise with a partner or your coven.</Notice>
      ) : (
        <>
          {list && !list.ready && <Notice>Telepathy sessions aren’t open yet. Please try again soon.</Notice>}
          {!!error && <Notice>{error}</Notice>}

          <Card>
            <SectionLabel>Join with a code</SectionLabel>
            <Field label="Code" value={code} onChange={(v) => setCode(cleanCode(v))} placeholder="Eight letters and numbers" />
            <Button label="Join" disabled={busy || cleanCode(code).length < 8} onPress={join} />
          </Card>

          {!making ? (
            <Button label="Make a session" onPress={() => setMaking(true)} />
          ) : (
            <Card accent>
              <SectionLabel>A new session</SectionLabel>
              <Chips label="A new session">
                <Chip label="A pair" selected={draft.kind === 'pair'} onPress={() => set({ kind: 'pair', covenId: null })} />
                <Chip label="A coven" selected={draft.kind === 'coven'} onPress={() => set({ kind: 'coven', covenId: covens[0]?.id ?? null })} />
              </Chips>
              {draft.kind === 'pair' ? (
                <Body muted>Invite a friend with a code, or ask a member of one of your covens, once it is made.</Body>
              ) : covens.length ? (
                <Chips>
                  {covens.map((c) => (
                    <Chip key={c.id} label={c.name} selected={draft.covenId === c.id} onPress={() => set({ covenId: c.id })} />
                  ))}
                </Chips>
              ) : (
                <Body muted>You are not in a coven yet.</Body>
              )}
              <Field label="Name (optional)" value={draft.title} onChange={(v) => set({ title: v })} placeholder="Full moon circle" />
              <SectionLabel>Target</SectionLabel>
              <Chips label="Target">
                {TARGET_TYPES.map((t) => (
                  <Chip key={t.id} label={t.label} selected={draft.target === t.id} onPress={() => set({ target: t.id })} />
                ))}
              </Chips>
              <Body muted>{TARGET_TYPES.find((t) => t.id === draft.target)?.detail}</Body>
              <SectionLabel>Rounds</SectionLabel>
              <Chips label="Rounds">
                {ROUND_CHOICES.map((n) => (
                  <Chip key={n} label={String(n)} selected={draft.rounds === n} onPress={() => set({ rounds: n })} />
                ))}
              </Chips>
              <SectionLabel>Seconds a round</SectionLabel>
              <Chips label="Seconds a round">
                {SECONDS_CHOICES.map((n) => (
                  <Chip key={n} label={String(n)} selected={draft.seconds === n} onPress={() => set({ seconds: n })} />
                ))}
              </Chips>
              <SectionLabel>Who sends</SectionLabel>
              <Chips label="Who sends">
                {SENDER_MODES.map((m) => (
                  <Chip key={m.id} label={m.label} selected={draft.senderMode === m.id} onPress={() => set({ senderMode: m.id })} />
                ))}
              </Chips>
              <Body muted>{SENDER_MODES.find((m) => m.id === draft.senderMode)?.detail}</Body>
              {draft.senderMode === 'fixed' && draft.kind === 'pair' && (
                <Chips>
                  <Chip label="I send" selected={draft.hostSends} onPress={() => set({ hostSends: true })} />
                  <Chip label="My partner sends" selected={!draft.hostSends} onPress={() => set({ hostSends: false })} />
                </Chips>
              )}
              {draft.kind === 'coven' && <Body muted>In a coven session one person sends each round and everyone else receives. With the same sender, that is you.</Body>}
              <SectionLabel>Start</SectionLabel>
              <Chips label="Start">
                {starts.map((o, i) => (
                  <Chip key={o.label} label={o.label} selected={startIx === i} onPress={() => setStartIx(i)} />
                ))}
              </Chips>
              <Body muted>{`About ${sessionMinutes({ rounds: draft.rounds, round_seconds: draft.seconds })} minutes, with a short reveal after each round.`}</Body>
              <Button label="Make the session" disabled={busy} onPress={make} />
            </Card>
          )}

          {mine.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Your sessions</SectionLabel>
              <List>
                {mine.map((s, i) => (
                  <Row key={s.id} icon="wheel" title={`${s.title || targetLabel(s.target_type)} · ${when(s)}`} detail={sessionLine(s)} last={i === mine.length - 1} onPress={() => open(s.id)} />
                ))}
              </List>
            </View>
          )}
        </>
      )}

      <Card>
        <SectionLabel>Your telepathy results</SectionLabel>
        <ResultsLine sessions={kept} kind="telepathy" />
      </Card>
      <Button label="Your results, by partner" variant="outline" onPress={goTo('/rituals/craft/psychic/progress')} />
    </RitualScreen>
  );
}
