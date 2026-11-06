import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Share, Text, View } from 'react-native';

import { AltarImage } from '../../../../../components/altar/AltarImage';
import { DropIn, SoundPill, useDropIn } from '../../../../../components/psychic/DropIn';
import { Button, Chip, Chips, EspSymbol, goTo, SuitMark, usePsychic } from '../../../../../components/psychic/shared';
import { Body, Card, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { altarPicture } from '../../../../../lib/altar/assets';
import { ESP_MODES } from '../../../../../lib/craft/psychic/esp';
import { remotePool } from '../../../../../lib/craft/psychic/remote';
import {
  alreadyKept,
  clockText,
  keptSession,
  optionsFor,
  resultsOf,
  scoreFor,
  sendingRounds,
  senderFor,
  sessionLine,
  sessionTable,
  inviteText,
  targetLabel,
  whereAt,
  type TargetType,
} from '../../../../../lib/craft/psychic/telepathy';
import { beginSession, cancelSession, fetchCovenPeople, fetchSnapshot, inviteMember, joinWithCode, lockIn, type Snapshot } from '../../../../../lib/craft/psychic/telepathyApi';
import { useSession } from '../../../../../lib/session';
import { colors, fonts } from '../../../../../theme';

const POOL = remotePool();

function Face({ type, id, size }: { type: TargetType; id: string; size: number }) {
  if (type === 'symbols') return <EspSymbol id={id} size={size} />;
  if (type === 'suits') return <SuitMark id={id} size={size} />;
  if (type === 'colours') return <View accessibilityLabel={id} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: ESP_MODES.find((m) => m.id === 'colours')?.options.find((o) => o.id === id)?.colour }} />;
  const pic = altarPicture(POOL.find((p) => p.id === id)?.image ?? '');
  return pic ? <AltarImage picture={pic} resizeMode="contain" style={{ width: size, height: size }} accessibilityLabel={id.split(':').pop() ?? id} /> : <Text style={{ color: colors.cream, fontFamily: fonts.display }}>{id.split(':').pop()}</Text>;
}

const labelOf = (type: TargetType, id: string) => (type === 'picture' ? id.split(':').pop() ?? id : ESP_MODES.find((m) => m.id === type)?.options.find((o) => o.id === id)?.label ?? id);

// One telepathy session. Before the start: who is in, the code to share, and
// an optional drop-in sound. From the start time every screen follows the same
// clock: send or receive each round, then everyone sees the target and each
// receiver's hit or miss. The target comes from the server only when it is
// yours to see (you send it, or the round's reveal time has passed).
export default function TelepathySession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const me = session?.user.id ?? '';
  const { sessions: kept, keep, ready } = usePsychic();
  const drop = useDropIn();
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [pick, setPick] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [covenMembers, setCovenMembers] = useState<{ id: string; name: string }[]>([]);
  const begun = useRef(false);
  const savedRound = useRef(0);
  const keptOnce = useRef(false);

  const refresh = useCallback(() => {
    if (id) void fetchSnapshot(id).then(setSnap).catch(() => undefined);
  }, [id]);
  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, 3000);
    const tick = setInterval(() => setNow(Date.now()), 500);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [refresh]);

  const s = snap?.session ?? null;
  const joined = useMemo(() => (snap?.people ?? []).filter((p) => p.status === 'joined').map((p) => p.user_id), [snap]);
  const name = useCallback((u: string) => (u === me ? 'You' : snap?.names[u] || 'A partner'), [snap, me]);
  const reveals = useMemo(() => Object.fromEntries((snap?.rounds ?? []).map((r) => [r.n, Date.parse(r.reveal_at)])), [snap]);
  const at = s ? whereAt(s, now, reveals) : null;
  const inIt = (snap?.people ?? []).some((p) => p.user_id === me);
  const isHost = !!s && s.host_id === me;

  // Make the rounds (on the server) as the start nears.
  useEffect(() => {
    if (!s || !inIt || begun.current || s.status !== 'scheduled') return;
    if (Date.parse(s.starts_at) - now < 100_000 && joined.length >= 2 && !(snap?.rounds.length)) {
      begun.current = true;
      void beginSession(s.id).then(refresh).catch(() => (begun.current = false));
    }
  }, [s, inIt, now, joined.length, snap?.rounds.length, refresh]);

  const loadCoven = () => {
    void fetchCovenPeople(me).then((x) => setCovenMembers(x.members.map((m) => ({ id: m.id, name: m.name })))).catch(() => undefined);
  };

  // A new round clears what was written; refetch as each phase changes so the target arrives.
  const n = at && (at.phase === 'round' || at.phase === 'reveal') ? at.n : 0;
  const phase = at?.phase ?? '';
  useEffect(() => {
    if (n && savedRound.current !== n) {
      savedRound.current = n;
      setPick('');
      setNotes('');
      setError('');
    }
    if (n) refresh();
  }, [n, phase, refresh]);

  const round = snap?.rounds.find((r) => r.n === n);
  const results = useMemo(() => resultsOf(snap?.rounds ?? [], snap?.targets ?? {}, snap?.guesses ?? []), [snap]);
  const myGuess = snap?.guesses.find((g) => g.round_n === n && g.user_id === me);

  // At the end, keep it once in the record and Journal.
  useEffect(() => {
    if (!s || !snap || at?.phase !== 'done' || keptOnce.current || !ready || !inIt || !snap.rounds.length) return;
    if (results.length < snap.rounds.length) return;
    keptOnce.current = true;
    if (alreadyKept(kept, s.id)) return;
    void keep({ ...keptSession({ sessionId: s.id, userId: me, type: s.target_type, title: s.title, results, names: { ...snap.names, [me]: 'You' }, kind: s.kind }), kind: 'telepathy', meditation: drop.meditation() });
  }, [s, snap, at?.phase, results, ready, inIt, kept, keep, me, drop]);

  if (!id || !session) return <RitualScreen back="Telepathy"><Title eyebrow="Telepathy">Session</Title><Notice>Sign in to take part.</Notice></RitualScreen>;
  if (!snap) return <RitualScreen back="Telepathy"><Title eyebrow="Telepathy">Session</Title><Body muted>Opening…</Body></RitualScreen>;
  if (!snap.ready || !s) return <RitualScreen back="Telepathy"><Title eyebrow="Telepathy">Session</Title><Notice>{snap.ready ? 'That session isn’t here, or isn’t for you.' : 'Telepathy sessions aren’t open yet. Please try again soon.'}</Notice><Button label="Back" variant="outline" onPress={goTo('/rituals/craft/psychic/telepathy')} /></RitualScreen>;

  const type = s.target_type;
  const title = s.title || `${targetLabel(type)} telepathy`;
  const sender = round?.sender_id ?? '';
  const iSend = sender === me;
  const target = snap.targets[n];
  const options = optionsFor(type, round?.options ?? []);
  const sendLine = joined.length ? `With ${joined.filter((p) => p !== me).map(name).join(', ') || 'no one yet'}` : '';
  const due = senderFor(s.sender_mode, joined, 1, s.host_sends || s.kind === 'coven' ? joined[0] : joined[1]);

  const lock = async () => {
    setError('');
    try {
      await lockIn(s.id, n, pick, notes);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    }
  };

  return (
    <RitualScreen back="Telepathy">
      <Title eyebrow="Telepathy">{title}</Title>
      <Body muted>{`${sessionLine(s)}. ${sendLine}`}</Body>
      {s.status === 'cancelled' && <Notice>This session was cancelled, or was never joined by a partner.</Notice>}
      {!!error && <Notice>{error}</Notice>}

      {at?.phase === 'before' && s.status === 'scheduled' && (
        <>
          <Card accent>
            <SectionLabel>Starts in</SectionLabel>
            <Text style={{ color: colors.cream, fontFamily: fonts.display, fontSize: 40 }}>{clockText(at.msToStart)}</Text>
            <Body muted>{new Date(s.starts_at).toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}. Keep this screen open: it begins by itself, on everyone’s device at the same moment.</Body>
          </Card>
          <Card>
            <SectionLabel>Who is in</SectionLabel>
            {(snap.people ?? []).map((p) => <Body key={p.user_id}>{`${name(p.user_id)}${p.user_id === s.host_id ? ' (host)' : ''}${p.status === 'invited' ? ' (invited)' : ''}`}</Body>)}
            {!inIt && s.kind === 'coven' && <Button label="Join this session" onPress={() => void joinWithCode(s.invite_code ?? '').then(refresh).catch((e: Error) => setError(e.message))} />}
            {s.kind === 'pair' && joined.length < 2 && <Body muted>Waiting for your partner. A session with no partner when it starts is cancelled.</Body>}
          </Card>
          {s.sender_mode === 'fixed' && joined.length >= 2 && <Body muted>{`${name(due)} will send every round.`}</Body>}
          {s.sender_mode === 'alternate' && <Body muted>Sending turns round by round, starting with the host.</Body>}
          {s.sender_mode === 'random' && <Body muted>The sender is drawn each round, when it begins.</Body>}
          {isHost && s.kind === 'pair' && joined.length < 2 && (
            <Card>
              <SectionLabel>Invite your partner</SectionLabel>
              <Text selectable style={{ color: colors.gold, fontFamily: fonts.display, fontSize: 28, letterSpacing: 2 }}>{s.invite_code}</Text>
              <Button label="Share the code" onPress={() => void Share.share({ message: inviteText(s.invite_code ?? '') }).catch(() => undefined)} />
              {covenMembers.length === 0 ? (
                <Button label="Or ask a member of one of my covens" variant="outline" onPress={loadCoven} />
              ) : (
                <Chips>
                  {covenMembers.map((m) => <Chip key={m.id} label={m.name} onPress={() => void inviteMember(s.id, m.id).then(refresh).catch((e: Error) => setError(e.message))} />)}
                </Chips>
              )}
              <Body muted>A member you ask sees the session in their list and joins it with the code, so share the code with them too.</Body>
            </Card>
          )}
          <SoundPill />
          <DropIn onStart={() => undefined} startLabel="Settle in" />
          {isHost && <Button label="Cancel the session" variant="text" onPress={() => void cancelSession(s.id).then(refresh).catch((e: Error) => setError(e.message))} />}
        </>
      )}

      {at && (at.phase === 'round' || at.phase === 'reveal') && inIt && (
        <>
          <SoundPill />
          {!round ? (
            <Body muted>Setting up the round…</Body>
          ) : (
            <>
              <Card accent>
                <SectionLabel>{`Round ${n} of ${s.rounds} · ${at.phase === 'round' ? clockText(at.msLeft) : `next in ${clockText(at.msLeft)}`}`}</SectionLabel>
                <Body>{iSend ? 'You are sending.' : `${name(sender)} is sending.`}</Body>
              </Card>

              {at.phase === 'round' && iSend && (
                <Card>
                  <SectionLabel>Your target</SectionLabel>
                  <View style={{ alignItems: 'center', gap: 8 }}>{target ? <Face type={type} id={target} size={140} /> : <Body muted>Fetching it…</Body>}</View>
                  {!!target && <Body>{labelOf(type, target)}</Body>}
                  <Body muted>Hold it in your mind. Feel its shape and its colour, and rest your attention on it. Do not say or write anything: there is nothing to pass but the thought.</Body>
                </Card>
              )}

              {at.phase === 'round' && !iSend && (
                <>
                  <Body muted>Close your eyes if you like. Write what comes (shape, colour, feeling), then choose.</Body>
                  <Field label="Impressions" value={myGuess ? myGuess.impressions ?? '' : notes} onChange={setNotes} placeholder="Short and plain is best" multiline />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {options.map((o) => (
                      <Chip key={o.id} label={o.label} selected={(myGuess?.guess ?? pick) === o.id} onPress={() => !myGuess && setPick(o.id)} />
                    ))}
                  </View>
                  {type === 'picture' && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {options.map((o) => <Face key={o.id} type="picture" id={o.id} size={70} />)}
                    </View>
                  )}
                  {myGuess ? <Body muted>Locked in. The target is shown when the time is up, or when everyone has locked in.</Body> : <Button label="Lock in" disabled={!pick} onPress={lock} />}
                </>
              )}

              {at.phase === 'reveal' && (
                <Card accent>
                  <SectionLabel>The target</SectionLabel>
                  {target ? (
                    <View style={{ alignItems: 'center', gap: 8 }}>
                      <Face type={type} id={target} size={120} />
                      <Body>{labelOf(type, target)}</Body>
                    </View>
                  ) : (
                    <Body muted>Fetching it…</Body>
                  )}
                  {!iSend && !myGuess && <Body muted>You did not lock in a choice this round.</Body>}
                  {results.find((r) => r.n === n)?.guesses.map((g) => (
                    <Body key={g.user_id}>{`${name(g.user_id)}: ${labelOf(type, g.guess)}, ${g.hit ? 'a hit' : 'a miss'}`}</Body>
                  ))}
                </Card>
              )}
            </>
          )}
        </>
      )}

      {at?.phase === 'done' && (
        <>
          <Card accent>
            <SectionLabel>Session complete</SectionLabel>
            {sessionTable(results, joined).map((r) => (
              <Body key={r.id}>{`${name(r.id)}: ${r.trials ? `${r.hits} of ${r.trials} received` : 'did not receive'}${r.sent ? `; sent ${r.sent}, ${r.sentHits} of ${r.sentTrials} hit` : ''}`}</Body>
            ))}
            <Body muted>{`You received ${scoreFor(results, me).hits} of ${scoreFor(results, me).trials}. Chance alone gives about ${(scoreFor(results, me).trials * (1 / (type === 'symbols' ? 5 : type === 'colours' ? 6 : 4))).toFixed(1)}. Kept in your Journal under Psychic development.`}</Body>
          </Card>
          {Object.entries(sendingRounds(snap.rounds)).length > 0 && <Body muted>{Object.entries(sendingRounds(snap.rounds)).map(([u, ns]) => `${name(u)} sent round${ns.length > 1 ? 's' : ''} ${ns.join(', ')}`).join('. ')}.</Body>}
          <Notice>Short sessions wander widely. The honest test is whether a pattern holds over many sessions: see your results by partner.</Notice>
          <Button label="Results by partner" onPress={goTo('/rituals/craft/psychic/progress')} />
          <Button label="Another session" variant="outline" onPress={goTo('/rituals/craft/psychic/telepathy')} />
        </>
      )}
      <View style={ui.gapSmall} />
    </RitualScreen>
  );
}
