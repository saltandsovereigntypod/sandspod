// Manage → Positions → a position, for the coven's leaders: how many may
// hold it and who does, opening it for applications (a note, a closing date,
// who hears) and closing it, what it asks (requirements chosen from the
// coven's positions, programs and pages), and the questions it asks people who
// apply. The logic is lib/covens/positions.ts; the website's is
// covens/coven/positions.js. The database checks each again.

import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, CheckRow, Chips, Field, Notice, Section } from '../more/ui';
import * as api from '../../lib/covens/api';
import { useCoven } from '../../lib/covens/CovenContext';
import { errorMessage, normalizeQuestions, type Member, type Question, type Rank } from '../../lib/covens/model';
import {
  AUDIENCES,
  DAY_CHOICES,
  MAX_NOTE,
  MAX_REQUIREMENTS,
  REQUIREMENT_KINDS,
  cleanRequirements,
  closeAtFromDate,
  dateOfCloseAt,
  daysWords,
  deadlineWords,
  flaggedOpen,
  lowerRanks,
  newRequirement,
  overLimit,
  pastDeadline,
  placesLine,
  positionStatus,
  rankQuestions,
  readPlaces,
  requirementItems,
  requirementLabel,
  type Audience,
  type RequirementItem,
  type RequirementKind,
} from '../../lib/covens/positions';
import { type } from '../../theme';

/** Places, who holds it, and opening it for applications. */
export function OpeningEditor({ rank, members, onSaved }: { rank: Rank; members: Member[] | null; onSaved: () => Promise<void> }) {
  const coven = useCoven();
  const holders = (members ?? []).filter((m) => m.rank_id === rank.id);
  const held = holders.length;
  const [places, setPlaces] = useState(rank.seat_limit == null ? '' : String(rank.seat_limit));
  const [note, setNote] = useState(rank.opening_note ?? '');
  const [closeDay, setCloseDay] = useState(dateOfCloseAt(rank.applications_close_at));
  const [notify, setNotify] = useState<Audience>('everyone');
  const [preview, setPreview] = useState<{ everyone: number; eligible: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const open = flaggedOpen(rank) && !pastDeadline(rank);
  const status = positionStatus(rank, held);

  useEffect(() => {
    if (rank.is_default || open) return;
    let off = false;
    api.previewPositionNotice(rank.id).then(
      (p) => !off && setPreview(p),
      () => {},
    );
    return () => {
      off = true;
    };
  }, [rank.id, rank.is_default, open]);

  const act = async (work: () => Promise<string>) => {
    setBusy(true);
    setMessage(null);
    try {
      const done = await work();
      await onSaved();
      setMessage(done);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const readPlacesOr = () => {
    const read = readPlaces(places);
    if (read.error) throw new Error(read.error);
    return read.value;
  };
  const savePlaces = () =>
    act(async () => {
      const saved = await api.setPositionPlaces(rank.id, readPlacesOr());
      return saved && !saved.applications_open && open ? 'Saved. Every place is held now, so it has stopped taking applications.' : 'Saved.';
    });
  const openIt = () =>
    act(async () => {
      const closeAt = closeDay.trim() ? closeAtFromDate(closeDay) : null;
      if (closeDay.trim() && !closeAt) throw new Error('Write the closing date as year-month-day, such as 2026-12-21.');
      const out = await api.openPosition(rank.id, readPlacesOr(), note, closeAt, notify);
      if (out?.closed_full) return 'Saved. Every place is held now, so it has stopped taking applications.';
      if (open) return 'Saved.';
      return out?.notify ? `${rank.name} is open for applications. Those you chose are being told.` : `${rank.name} is open for applications.`;
    });
  const closeIt = () =>
    act(async () => {
      await api.closePosition(rank.id);
      return 'Closed. Requests already waiting stay for you to decide.';
    });

  return (
    <>
      <Section label="Places">
        <Card>
          <Text style={type.body}>{placesLine(rank, held)}</Text>
          {overLimit(rank, held) && <Text style={type.caption}>More hold it than its places now. Nobody loses it; no one new can be given it until there’s room.</Text>}
          {members && (
            <Text style={type.caption}>{held ? `Held by ${holders.map((m) => coven.nameOf(m.user_id)).join(', ')}` : 'No one holds it yet.'}</Text>
          )}
          <Field label="How many may hold it (empty for no limit)" value={places} onChangeText={(t) => setPlaces(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={4} />
          <Button label="Save places" variant="outline" onPress={() => void savePlaces()} disabled={busy} />
        </Card>
      </Section>

      <Section label="Open for applications">
        {rank.is_default ? (
          <Text style={type.caption}>Everyone joins the coven here, so there’s nothing to apply for.</Text>
        ) : (
          <Card>
            <Text style={type.body}>{status.label}</Text>
            {!!rank.applications_close_at && <Text style={type.caption}>{deadlineWords(rank.applications_close_at)}</Text>}
            <Field label="Why it’s open (a note for those who could apply)" value={note} onChangeText={setNote} multiline maxLength={MAX_NOTE} />
            <Field label="Applications close on (year-month-day; empty for no date)" value={closeDay} onChangeText={setCloseDay} placeholder="2026-12-21" maxLength={10} />
            {!open && (
              <>
                <Chips<Audience>
                  label="Who hears that it’s open"
                  options={AUDIENCES.map((a) => ({ value: a.value, label: preview && a.value !== 'none' ? `${a.label} (${preview[a.value]})` : a.label }))}
                  value={notify}
                  onChange={setNotify}
                />
                <Text style={type.caption}>{AUDIENCES.find((a) => a.value === notify)?.detail}. Each person’s own notification choices still count, and no one who has blocked you is told.</Text>
              </>
            )}
            <View style={styles.row}>
              <Button label={busy ? 'Saving…' : open ? 'Save changes' : 'Open for applications'} onPress={() => void openIt()} disabled={busy} />
              {open && <Button label="Close applications" variant="outline" onPress={() => void closeIt()} disabled={busy} />}
            </View>
            {open && <Text style={type.caption}>Changing an open position tells no one again.</Text>}
          </Card>
        )}
        {message && <Notice>{message}</Notice>}
      </Section>
    </>
  );
}

type Draft = Partial<RequirementItem>;

/** What it asks, and the questions it asks people who apply. */
export function RequirementsEditor({ rank, onSaved }: { rank: Rank; onSaved: () => Promise<void> }) {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const [items, setItems] = useState<Draft[]>(() => requirementItems(rank));
  const [questions, setQuestions] = useState<Question[]>(() => rankQuestions(rank));
  const [adding, setAdding] = useState<RequirementKind | ''>('');
  const [programs, setPrograms] = useState<{ id: string; title: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!covenId) return;
    let off = false;
    api.fetchPrograms(covenId).then(
      (list) => !off && setPrograms(list.filter((p) => p.status !== 'archived').map((p) => ({ id: p.id, title: p.title }))),
      () => {},
    );
    return () => {
      off = true;
    };
  }, [covenId]);

  const ctx = useMemo(
    () => ({ rank, ranks: coven.snapshot?.ranks ?? [], programs, documents: (coven.snapshot?.documents ?? []).map((d) => ({ id: d.id, title: d.title })) }),
    [rank, coven.snapshot, programs],
  );
  const below = lowerRanks(ctx);
  const change = (i: number, next: Draft) => setItems((prev) => prev.map((x, j) => (j === i ? { ...x, ...next } : x)));

  const add = (kind: RequirementKind) => {
    setAdding('');
    setItems((prev) => [...prev, newRequirement(kind, ctx, prev.map((x) => String(x.id ?? '')))]);
  };

  const save = async () => {
    const cleaned = cleanRequirements(items, ctx);
    if (cleaned.error) return setMessage(cleaned.error);
    setBusy(true);
    setMessage(null);
    try {
      await api.saveRankRequirements(rank.id, cleaned.items, normalizeQuestions(questions));
      await onSaved();
      setMessage('Saved.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <>
      <Section label="What it asks">
        <Text style={type.caption}>Up to {MAX_REQUIREMENTS}. Those checked from the coven’s record must be met before someone can apply; their mentor’s approval and anything in your words are ticked by whoever decides.</Text>
        {items.map((item, i) => {
          const kind = REQUIREMENT_KINDS.find((k) => k.kind === item.kind);
          return (
            <Card key={`${item.id}-${i}`}>
              <Text style={type.cardTitle}>{requirementLabel(item, ctx)}</Text>
              <Text style={type.caption}>{kind?.detail}</Text>
              {(item.kind === 'min_days_in_position' || item.kind === 'holds_position') &&
                (below.length ? (
                  <Chips label="Position" options={below.map((r) => ({ value: r.id, label: r.name }))} value={item.rank_id ?? ''} onChange={(rank_id) => change(i, { rank_id })} />
                ) : (
                  <Text style={type.caption}>There are no positions below this one to choose.</Text>
                ))}
              {(item.kind === 'min_days_in_coven' || item.kind === 'min_days_in_position') && (
                <>
                  <Chips label="How long" options={DAY_CHOICES.map((d) => ({ value: String(d), label: daysWords(d) }))} value={String(item.days ?? '')} onChange={(d) => change(i, { days: Number(d) })} />
                  <Field label="Or how many days" value={item.days ? String(item.days) : ''} onChangeText={(t) => change(i, { days: Number(t.replace(/[^0-9]/g, '')) || undefined })} keyboardType="number-pad" maxLength={4} />
                </>
              )}
              {item.kind === 'min_rites_attended' && (
                <Field label="How many rites" value={item.count ? String(item.count) : ''} onChangeText={(t) => change(i, { count: Number(t.replace(/[^0-9]/g, '')) || undefined })} keyboardType="number-pad" maxLength={4} />
              )}
              {item.kind === 'program_completed' &&
                (programs.length ? (
                  <Chips label="Program" options={programs.map((p) => ({ value: p.id, label: p.title }))} value={item.program_id ?? ''} onChange={(program_id) => change(i, { program_id })} />
                ) : (
                  <Text style={type.caption}>The coven has no programs yet. Make one under Initiation & training.</Text>
                ))}
              {item.kind === 'document_signed' &&
                (ctx.documents.length ? (
                  <Chips label="Page" options={ctx.documents.map((d) => ({ value: d.id, label: d.title }))} value={item.document_id ?? ''} onChange={(document_id) => change(i, { document_id })} />
                ) : (
                  <Text style={type.caption}>The coven has no pages yet. Add them under Manage → Pages.</Text>
                ))}
              {item.kind === 'custom' && <Field label="In your words" value={item.text ?? ''} onChangeText={(text) => change(i, { text })} multiline maxLength={300} />}
              <Button label="Remove" variant="text" onPress={() => setItems((prev) => prev.filter((_, j) => j !== i))} />
            </Card>
          );
        })}
        {items.length < MAX_REQUIREMENTS && (
          <Chips<RequirementKind | ''>
            label="Add a requirement"
            options={REQUIREMENT_KINDS.filter((k) => k.kind !== 'mentor_approval' || !items.some((x) => x.kind === 'mentor_approval')).map((k) => ({ value: k.kind, label: `+ ${k.label}` }))}
            value={adding}
            onChange={(kind) => kind && add(kind)}
          />
        )}
      </Section>

      <Section label="Questions for those who apply">
        <Text style={type.caption}>Up to 20, answered when someone asks for this position. Empty questions are left out.</Text>
        {questions.map((q, i) => (
          <Card key={q.id || `new-${i}`}>
            <Field label={`Question ${i + 1}`} value={q.prompt} onChangeText={(prompt) => setQuestions((prev) => prev.map((x, j) => (j === i ? { ...x, prompt } : x)))} maxLength={300} multiline />
            <CheckRow label="Required" value={q.required} onChange={(required) => setQuestions((prev) => prev.map((x, j) => (j === i ? { ...x, required } : x)))} />
            <Button label="Remove" variant="text" onPress={() => setQuestions((prev) => prev.filter((_, j) => j !== i))} />
          </Card>
        ))}
        {questions.length < 20 && <Button label="Add a question" variant="outline" onPress={() => setQuestions((prev) => [...prev, { id: '', prompt: '', required: false }])} />}
      </Section>
      <Button label={busy ? 'Saving…' : 'Save what it asks'} onPress={() => void save()} disabled={busy} />
      {message && <Notice>{message}</Notice>}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
