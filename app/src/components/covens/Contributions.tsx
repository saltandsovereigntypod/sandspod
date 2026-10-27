import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cleanStepItems, searchItems, stepItemOf, type ItemEntry, type StepItem } from '../../lib/altar/itemIndex';
import {
  canRead,
  canSupport,
  contributionLabel,
  contributionNote,
  contributionProblem,
  contributionTask,
  kindOf,
  ownerActions,
  participationLine,
  participationNames,
  type Contribution,
  type ParticipationRow,
  type Reader,
  type StepContribution,
} from '../../lib/covens/contributions';
import { andList } from '../../lib/covens/picker';
import { type } from '../../theme';
import { Button } from '../Button';
import { CheckRow, Field, Notice } from '../more/ui';
import { Words } from './ui';
import { SearchPicker } from './SearchPicker';

const STATUS_WORDS: Record<Contribution['status'], string> = {
  written: 'Written',
  offered: 'Offered',
  burned: 'Burned',
  buried: 'Buried',
  released: 'Released',
  held: 'Held by the coven',
  answered: 'Answered',
  closed: 'Closed',
};

/**
 * Your own part in a step that asks something: write it (or choose what you
 * place), seal it as private, leave your name off, and offer it when the
 * step comes. As the website's (covens/coven/rituals.js contributionBox).
 * Give it a key that changes with the saved contribution, so it starts afresh.
 */
export function MyContribution({
  ask,
  mine,
  canWrite,
  canOffer,
  forCoven,
  items,
  busy,
  onSave,
  onRemove,
  onOffer,
}: {
  ask: StepContribution;
  mine: Contribution | undefined;
  /** Writing is open now (ahead of time, or the step is under way). */
  canWrite: boolean;
  /** The step is under way: it can be offered. */
  canOffer: boolean;
  /** Writing the coven's one (the leader stepping in, or whoever is first). */
  forCoven: boolean;
  items: ItemEntry[];
  busy: boolean;
  onSave: (body: string, items: StepItem[], isPrivate: boolean, anonymous: boolean) => void;
  onRemove: () => void;
  onOffer: () => void;
}) {
  const kind = kindOf(ask.kind);
  const [body, setBody] = useState(mine?.body ?? '');
  const [chosen, setChosen] = useState<StepItem[]>(cleanStepItems(mine?.items));
  const [sealed, setSealed] = useState(!!mine?.private);
  const [nameless, setNameless] = useState(!!mine?.anonymous);
  const [editing, setEditing] = useState(!mine);
  const [problem, setProblem] = useState('');
  const task = contributionTask({ kind: ask.kind, mode: forCoven ? 'one' : ask.mode });
  if (mine && mine.status !== 'written') {
    return (
      <View style={styles.box}>
        <Text style={type.eyebrow}>{task}</Text>
        <Text style={type.caption}>
          {STATUS_WORDS[mine.status]}
          {mine.private ? ' · private' : ''}
          {mine.support_count ? ` · ${mine.support_count} holding it` : ''}
        </Text>
        <Words text={mine.body} />
      </View>
    );
  }
  if (!canWrite && !mine) return null;
  const save = () => {
    const why = contributionProblem(ask, body, chosen);
    setProblem(why);
    if (!why) onSave(body, chosen, sealed, nameless);
  };
  return (
    <View style={styles.box}>
      <Text style={type.eyebrow}>{task}</Text>
      {!!ask.prompt && <Text style={type.body}>{ask.prompt}</Text>}
      <Text style={type.caption}>{contributionNote(ask)}</Text>
      {editing ? (
        <>
          {kind.verb === 'place' && (
            <SearchPicker
              label={`Your ${kind.noun}`}
              chips={chosen.map((i) => ({ key: i.key, label: i.name, image: i.image }))}
              entries={items}
              search={(q, picked) => searchItems(items, q, { limit: 6, picked })}
              onAdd={(entry) => setChosen((list) => [...list, stepItemOf(entry as ItemEntry)].slice(0, 6))}
              onRemove={(key) => setChosen((list) => list.filter((i) => i.key !== key))}
              placeholder="A candle in your colour, bread, a flower…"
            />
          )}
          <Field
            label={kind.verb === 'write' ? `Your ${kind.noun}` : 'A note (optional)'}
            value={body}
            onChangeText={setBody}
            multiline={kind.verb === 'write'}
            maxLength={2000}
            placeholder={kind.id === 'card' ? 'The card you drew' : undefined}
          />
          {kind.verb === 'write' && (
            <CheckRow label="Keep mine private" value={sealed} onChange={setSealed}>
              <Text style={type.caption}>It still takes part. On the altar it shows sealed, and no one else reads it, the leaders included. Others can still hold it for you.</Text>
            </CheckRow>
          )}
          {kind.verb === 'write' && ask.visibility === 'coven' && (
            <CheckRow label="Leave my name off" value={nameless} onChange={setNameless}>
              <Text style={type.caption}>Others see it without knowing it’s yours.</Text>
            </CheckRow>
          )}
          {!!problem && <Notice>{problem}</Notice>}
          <Button label={busy ? 'Saving…' : mine ? 'Save the changes' : 'Save it'} onPress={save} disabled={busy || !canWrite} />
          {!!mine && <Button label="Cancel" variant="text" onPress={() => setEditing(false)} />}
        </>
      ) : (
        <>
          <Words text={mine?.body} />
          {!!mine?.items.length && <Text style={type.caption}>{cleanStepItems(mine.items).map((i) => i.name).join(', ')}</Text>}
          <Text style={type.caption}>
            {mine?.private ? 'Private. ' : ''}
            {mine?.anonymous ? 'Without your name. ' : ''}
            {canOffer ? 'Offer it now, or it is offered when the step ends.' : 'It is offered when its step comes.'}
          </Text>
          {canOffer && <Button label="Offer it" onPress={onOffer} disabled={busy} />}
          {canWrite && <Button label="Change it" variant="outline" onPress={() => setEditing(true)} disabled={busy} />}
          {canWrite && <Button label="Take it back" variant="text" onPress={onRemove} disabled={busy} />}
        </>
      )}
    </View>
  );
}

/** What others brought to a step, as you may see it: sealed, nameless, and held by others, as each should be. */
export function ContributionList({
  list,
  reader,
  nameOf,
  busy,
  onSupport,
  onTend,
}: {
  list: Contribution[];
  reader: Reader;
  nameOf: (id: string) => string;
  busy: boolean;
  onSupport: (c: Contribution, kind: 'candle' | 'holding', on: boolean) => void;
  onTend: (c: Contribution, status: 'held' | 'answered' | 'closed', note: string) => void;
}) {
  const [note, setNote] = useState<Record<string, string>>({});
  if (!list.length) return null;
  return (
    <View style={styles.list}>
      {list.map((c) => {
        const label = contributionLabel(c, nameOf);
        const readable = canRead({ ...c, owner: c.mine ? reader.userId : null }, reader) && c.body;
        const holders = c.mine && c.supporters?.length ? andList(c.supporters.map(nameOf)) : '';
        return (
          <View key={c.id} style={styles.item} accessibilityLabel={`${label}. ${STATUS_WORDS[c.status]}.`}>
            <Text style={type.body}>{label}</Text>
            {readable ? <Words text={c.body} /> : <Text style={type.caption}>{c.private ? 'Sealed. Only its writer reads it.' : ''}</Text>}
            <Text style={type.caption}>
              {STATUS_WORDS[c.status]}
              {c.support_count ? ` · ${c.support_count} holding it` : ''}
              {holders ? ` · ${holders}` : ''}
              {c.outcome_note && readable ? ` · ${c.outcome_note}` : ''}
            </Text>
            {canSupport({ ...c, owner: null }, reader) && (
              <View style={styles.row}>
                <Button label={c.supported_by_me ? 'You’re holding this' : 'Hold this for them'} variant={c.supported_by_me ? 'outline' : 'text'} onPress={() => onSupport(c, 'holding', !c.supported_by_me)} disabled={busy} />
              </View>
            )}
            {ownerActions(c).length > 0 && (
              <>
                <Field label="A note (optional)" value={note[c.id] ?? ''} onChangeText={(v) => setNote((n) => ({ ...n, [c.id]: v }))} maxLength={1000} />
                <View style={styles.row}>
                  {ownerActions(c).map((a) => (
                    <Button key={a} label={a === 'held' ? 'Keep holding it' : a === 'answered' ? 'It’s answered' : 'Close it'} variant="text" onPress={() => onTend(c, a, note[c.id] ?? '')} disabled={busy} />
                  ))}
                </View>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

/** "14 of 20 have written", and who has and hasn't for those allowed to see it. */
export function Participation({ row, ask, nameOf }: { row: ParticipationRow | undefined; ask: StepContribution; nameOf: (id: string) => string }) {
  if (!row) return null;
  const names = row.done_users || row.waiting_users ? participationNames(row, nameOf) : null;
  return (
    <View style={styles.list}>
      <Text style={type.caption}>{participationLine(row, ask)}</Text>
      {!!names?.done && <Text style={type.caption}>Done: {names.done}</Text>}
      {!!names?.waiting && <Text style={type.caption}>Not yet: {names.waiting}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 8 },
  list: { gap: 8 },
  item: { gap: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
