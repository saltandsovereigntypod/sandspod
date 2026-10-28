// Open positions in a coven, as members see them: the "Open positions" card
// on the coven's home and on My standing (each open position above you, its
// places left and closing date, what it asks with ✓ and ✗, and Apply), and
// the checklist the Review screen shows too. The logic is
// lib/covens/positions.ts; the website's is covens/coven/positions.js.

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { covenHref } from './CovenScreen';
import { Words } from './ui';
import { Card, Field, Notice, Section } from '../more/ui';
import * as api from '../../lib/covens/api';
import { useCoven } from '../../lib/covens/CovenContext';
import { errorMessage, type Advancement } from '../../lib/covens/model';
import { openLine, openPositions, rankQuestions, readAnswers, statusMark, type OpenPosition, type PositionsOverview, type RequirementCheck } from '../../lib/covens/positions';
import { colors, type } from '../../theme';

/** What a position asks, each with ✓ (met), ✗ (not yet) or ○ (for the reviewer), and its line. */
export function Checklist({ checks }: { checks: RequirementCheck[] }) {
  if (!checks.length) return null;
  return (
    <View style={styles.list} accessibilityRole="list">
      {checks.map((c) => (
        <View key={c.id || c.label} style={styles.check} accessible accessibilityLabel={`${c.label}: ${c.status === 'met' ? 'met' : c.status === 'unmet' ? 'not yet' : 'for the reviewer'}. ${c.line}`}>
          <Text style={[styles.mark, c.status === 'met' && styles.met, c.status === 'unmet' && styles.unmet]}>{statusMark(c.status)}</Text>
          <View style={styles.checkText}>
            <Text style={type.body}>{c.label}</Text>
            {!!c.line && <Text style={type.caption}>{c.line}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

/** The coven's open positions above you, with what they ask of you; null before the database has them. */
export function useOpenPositions() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const member = coven.perms.member;
  const [loaded, setLoaded] = useState<PositionsOverview | null | undefined>(undefined);
  const load = useCallback(async () => {
    if (covenId && member) setLoaded(await api.fetchPositionsOverview(covenId));
  }, [covenId, member]);
  useEffect(() => {
    if (!covenId || !member) return;
    let off = false;
    api.fetchPositionsOverview(covenId).then((next) => !off && setLoaded(next));
    return () => {
      off = true;
    };
  }, [covenId, member]);
  const overview = covenId && member ? loaded : null;
  const positions = openPositions(coven.snapshot?.ranks ?? [], overview ?? null);
  return { overview, positions, reload: load };
}

/**
 * "Open positions": each open position above you. On the coven's home
 * (`apply` off) Apply opens My standing at that position; on My standing it
 * opens the form here.
 */
export function OpenPositionsCard({
  positions,
  pending,
  applyHere,
  chosen,
  onApplied,
}: {
  positions: OpenPosition[];
  pending?: Advancement | null;
  applyHere?: boolean;
  chosen?: string | null;
  onApplied?: () => void;
}) {
  const coven = useCoven();
  const [open, setOpen] = useState<string | null>(chosen ?? null);
  if (!positions.length) return null;
  return (
    <Section label="Open positions">
      {positions.map((p) => (
        <Card key={p.rank.id} tone={p.ready ? 'gold' : undefined}>
          <Text style={type.cardTitle}>{p.rank.name}</Text>
          {!!openLine(p) && <Text style={type.caption}>{openLine(p)}</Text>}
          <Words text={p.rank.opening_note} />
          <Checklist checks={p.checks} />
          {!!p.rank.requirements && (
            <View style={styles.words}>
              <Text style={type.caption}>In their words</Text>
              <Words text={p.rank.requirements} />
            </View>
          )}
          {pending ? (
            <Text style={type.caption}>{pending.rank_id === p.rank.id ? 'You’ve asked for this. The coven’s reviewers will decide.' : 'You have a request waiting already; one at a time.'}</Text>
          ) : !p.ready ? (
            <Text style={type.caption}>You can apply once everything marked ✗ is met.</Text>
          ) : applyHere && open === p.rank.id ? (
            <ApplyForm position={p} onDone={() => (setOpen(null), onApplied?.())} />
          ) : (
            <Button
              label={`Apply for ${p.rank.name}`}
              variant="outline"
              disabled={!coven.standing.ok}
              onPress={() => (applyHere ? setOpen(p.rank.id) : router.push(`${covenHref(coven.slug, 'path')}?apply=${p.rank.id}` as never))}
            />
          )}
          {!pending && p.ready && !coven.standing.ok && <Text style={type.caption}>{coven.standing.reasons.join(' ')}</Text>}
        </Card>
      ))}
    </Section>
  );
}

/** The card on its own, for the coven's home and Your record: Apply opens My standing at that position. */
export function OpenPositionsHere() {
  const coven = useCoven();
  const { positions } = useOpenPositions();
  const covenId = coven.snapshot?.coven.id;
  const userId = coven.userId;
  const [pending, setPending] = useState<Advancement | null>(null);
  useEffect(() => {
    if (!covenId || !userId || !positions.length) return;
    let off = false;
    api.fetchMyAdvancements(covenId, userId).then(
      (list) => !off && setPending(list.find((a) => a.status === 'pending') ?? null),
      () => {},
    );
    return () => {
      off = true;
    };
  }, [covenId, userId, positions.length]);
  if (!coven.perms.member) return null;
  return <OpenPositionsCard positions={positions} pending={pending} />;
}

/** Applying: why you're ready, and the position's own questions. */
function ApplyForm({ position, onDone }: { position: OpenPosition; onDone: () => void }) {
  const coven = useCoven();
  const questions = rankQuestions(position.rank);
  const [statement, setStatement] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const send = async () => {
    const read = readAnswers(questions, answers);
    if (read.missing) return setMessage(`Please answer: ${read.missing.prompt}`);
    if (!statement.trim()) return setMessage('Say why you’re ready.');
    setBusy(true);
    setMessage(null);
    try {
      await api.requestAdvancement(coven.snapshot!.coven.id, position.rank.id, statement, read.answers);
      onDone();
    } catch (error) {
      setMessage(errorMessage(error));
      setBusy(false);
    }
  };
  return (
    <View style={styles.form}>
      {questions.map((q) => (
        <Field key={q.id} label={`${q.prompt}${q.required ? '' : ' (optional)'}`} value={answers[q.id] ?? ''} onChangeText={(text) => setAnswers((prev) => ({ ...prev, [q.id]: text }))} multiline maxLength={4000} />
      ))}
      <Field label="Why you’re ready, and how you’ve met what it asks" value={statement} onChangeText={setStatement} multiline maxLength={4000} />
      <Button label={busy ? 'Sending…' : 'Send my application'} onPress={() => void send()} disabled={busy || !coven.standing.ok} />
      {message && <Notice>{message}</Notice>}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 6 },
  check: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  checkText: { flex: 1, gap: 1 },
  mark: { width: 18, fontSize: 16, color: colors.tabInactive, textAlign: 'center' },
  met: { color: colors.gold },
  unmet: { color: 'rgb(243,160,110)' },
  words: { gap: 2 },
  form: { gap: 10 },
});
