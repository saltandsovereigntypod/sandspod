import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, confirmAction, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { fullDate, shortDate } from '../../../../../lib/calendar';
import { careBadges, CLEANSE_METHODS, ELIXIR_NOTE, findCare, methodWarning } from '../../../../../lib/craft/crystal/care';
import { SETTINGS, STONES } from '../../../../../lib/craft/crystal/collections';
import {
  careHistory,
  careId,
  CHARGE_METHODS,
  CLEANSE_PRESETS,
  cleanseStatus,
  isDateKey,
  KIND_LABEL,
  lastCare,
  normaliseRule,
  normaliseStone,
  STONE_FORMS,
  type CareKind,
  type CareLog,
  type CrystalSettings,
  type Stone,
} from '../../../../../lib/craft/crystal/stones';
import { removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { ritualsLibraryHref } from '../../../../../lib/library';
import { colors, fonts, radius, type } from '../../../../../theme';

const KINDS: CareKind[] = ['cleansed', 'charged', 'programmed'];

// One stone: what it is, how to care for it, and everything you've done for it.
export default function StoneDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useCraft<Stone>(STONES);
  const { entries: settings } = useCraft<CrystalSettings>(SETTINGS);
  const entry = entries.find((e) => e.id === id) ?? null;
  const stone = useMemo(() => (entry ? normaliseStone(entry.data) : null), [entry]);
  const rule = normaliseRule(settings[0]?.data?.cleanse);
  const now = new Date();

  const [kind, setKind] = useState<CareKind>('cleansed');
  const [method, setMethod] = useState('');
  const [intention, setIntention] = useState('');
  const [note, setNote] = useState('');
  const [earlier, setEarlier] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  if (!stone || !entry) {
    return (
      <RitualScreen back="My stones">
        <Title eyebrow="My stones">Stone</Title>
        {ready && <Body muted>This stone isn’t in your collection any more.</Body>}
      </RitualScreen>
    );
  }

  const care = findCare(stone.key, stone.name);
  const status = cleanseStatus(stone, rule, now);
  const history = careHistory(stone);
  const form = STONE_FORMS.find((f) => f.key === stone.form)?.label;
  const warning = kind !== 'programmed' && method ? methodWarning(care, method) : null;
  const presets = kind === 'cleansed' ? CLEANSE_PRESETS : kind === 'charged' ? CHARGE_METHODS : [];
  const lastCharged = lastCare(stone, 'charged');
  const lastProgrammed = lastCare(stone, 'programmed');

  const save = async (data: Stone) => updateEntry(STONES, entry.id, data);

  const log = async () => {
    setProblem(null);
    setSaved(null);
    if (kind === 'programmed' && !intention.trim()) return setProblem('What are you programming it for?');
    if (earlier.trim() && !isDateKey(earlier.trim())) return setProblem('Enter the date as year-month-day, or leave it blank for now.');
    const at = earlier.trim() ? new Date(`${earlier.trim()}T12:00:00`) : new Date();
    if (at.getTime() > Date.now() + 60_000) return setProblem('That date is still to come.');
    const item: CareLog = {
      id: careId(),
      kind,
      at: at.toISOString(),
      method: kind === 'programmed' ? undefined : method.trim() || undefined,
      intention: kind === 'programmed' ? intention.trim() : undefined,
      note: note.trim() || undefined,
    };
    const intentions = kind === 'programmed' && !stone.intentions.includes(item.intention!) ? [...stone.intentions, item.intention!] : stone.intentions;
    await save({ ...stone, intentions, care: [item, ...stone.care] });
    setMethod('');
    setIntention('');
    setNote('');
    setEarlier('');
    setSaved(`${KIND_LABEL[kind]} ${earlier.trim() ? `on ${shortDate(at)}` : 'today'}.`);
  };

  const forget = async (item: CareLog) => {
    if (!(await confirmAction('Remove this from the history?', `${KIND_LABEL[item.kind]} on ${fullDate(item.at)}.`, 'Remove'))) return;
    await save({ ...stone, care: stone.care.filter((c) => c.id !== item.id) });
  };

  const remove = async () => {
    if (!(await confirmAction(`Delete ${stone.name}?`, 'It and its care history are deleted from your collection. This can’t be undone.', 'Delete'))) return;
    await removeEntry(STONES, entry.id);
    router.back();
  };

  return (
    <RitualScreen back="My stones">
      <Title eyebrow={form ?? 'Stone'}>{stone.name}</Title>

      <Card accent={status.due}>
        <SectionLabel>Cleansing</SectionLabel>
        <Text style={[type.cardTitle, status.due && styles.gold]}>{status.due ? 'Due for cleansing' : 'Cleansed'}</Text>
        <Body muted>{status.last ? `Last cleansed ${fullDate(status.last)}. ${status.label}.` : 'Not cleansed yet.'}</Body>
        {lastCharged && <Body muted>{`Last charged ${fullDate(lastCharged.at)}${lastCharged.method ? ` · ${lastCharged.method}` : ''}`}</Body>}
        {lastProgrammed && <Body muted>{`Programmed for ${lastProgrammed.intention} · ${fullDate(lastProgrammed.at)}`}</Body>}
      </Card>

      {care ? (
        <Card>
          <SectionLabel>Care</SectionLabel>
          <Chips>
            {careBadges(care).map((b) => (
              <Chip key={b} label={b} />
            ))}
          </Chips>
          <Body>{care.note}</Body>
          <Body muted>{`Suits: ${care.cleanse.map((m) => CLEANSE_METHODS.find((x) => x.key === m)!.label.toLowerCase()).join(', ')}.`}</Body>
          {care.handling !== 'none' ? <Notice>{ELIXIR_NOTE}</Notice> : <Body muted>{ELIXIR_NOTE}</Body>}
        </Card>
      ) : (
        <Card>
          <SectionLabel>Care</SectionLabel>
          <Body muted>
            Stone care has no notes for this name. Until you know it’s hardy, keep it out of water, salt and strong sun; smoke, sound and moonlight
            are safe for every stone.
          </Body>
        </Card>
      )}

      <View style={ui.gap}>
        <SectionLabel>Log care</SectionLabel>
        <Card>
          <Chips>
            {KINDS.map((k) => (
              <Chip
                key={k}
                label={KIND_LABEL[k]}
                selected={kind === k}
                onPress={() => {
                  setKind(k);
                  setMethod('');
                }}
              />
            ))}
          </Chips>
          {kind === 'programmed' ? (
            <Field label="Programmed for" value={intention} onChange={setIntention} placeholder="e.g. Steady sleep" />
          ) : (
            <>
              <Chips>
                {presets.map((p) => {
                  const unsafe = methodWarning(care, p);
                  return (
                    <Chip
                      key={p}
                      label={unsafe ? `${p} ⚠` : p}
                      selected={method === p}
                      onPress={() => setMethod(method === p ? '' : p)}
                      a11yLabel={unsafe ? `${p}, not advised for this stone` : p}
                    />
                  );
                })}
              </Chips>
              <Field label={kind === 'cleansed' ? 'How you cleansed it' : 'How you charged it'} value={method} onChange={setMethod} placeholder="Pick one above or describe your own" />
            </>
          )}
          {!!warning && <Notice>{warning}</Notice>}
          <Field label="Note (optional)" value={note} onChange={setNote} placeholder="Anything you noticed" />
          <Field label="On an earlier day? (year-month-day)" value={earlier} onChange={setEarlier} placeholder="Leave blank for now" />
          {!!problem && <Notice>{problem}</Notice>}
          {!!saved && <Notice>{saved}</Notice>}
          <Button label={`Log ${KIND_LABEL[kind].toLowerCase()}`} onPress={() => void log()} />
        </Card>
      </View>

      {(stone.intentions.length > 0 || stone.source || stone.acquired || stone.notes) && (
        <Card>
          <SectionLabel>About this stone</SectionLabel>
          {stone.intentions.length > 0 && <Body>{`Working on: ${stone.intentions.join(', ')}`}</Body>}
          {!!stone.source && <Body muted>{`From ${stone.source}`}</Body>}
          {!!stone.acquired && <Body muted>{`Acquired ${fullDate(stone.acquired) ?? stone.acquired}`}</Body>}
          {!!stone.notes && <Body>{stone.notes}</Body>}
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>History</SectionLabel>
        {history.length === 0 ? (
          <Body muted>Nothing logged yet.</Body>
        ) : (
          <View style={styles.history}>
            {history.map((c, i) => (
              <View key={c.id} style={[styles.item, i < history.length - 1 && styles.rule]}>
                <View style={styles.flex}>
                  <Text style={styles.kind}>{`${KIND_LABEL[c.kind]}${c.method ? ` · ${c.method}` : ''}${c.intention ? ` for ${c.intention}` : ''}`}</Text>
                  <Text style={type.caption}>{fullDate(c.at)}</Text>
                  {!!c.note && <Text style={type.caption}>{c.note}</Text>}
                </View>
                <Button label="Remove" variant="text" onPress={() => void forget(c)} accessibilityHint={`Removes ${KIND_LABEL[c.kind].toLowerCase()} on ${fullDate(c.at)}`} />
              </View>
            ))}
          </View>
        )}
      </View>

      <List>
        {care && <Row icon="grimoire" title="Stone care" detail={`${care.name} and similar stones`} last={!care.library} onPress={() => router.push({ pathname: '/rituals/craft/crystal/care', params: { key: care.key } } as Href)} />}
        {care?.library && <Row icon="grimoire" title={`${care.name} in the Library`} detail="Correspondences, uses and lore" last onPress={() => router.push(ritualsLibraryHref({ id: `traditional:crystal:${care.key}` }))} />}
        {!care && <Row icon="grimoire" title="Stone care" detail="Which stones are safe in water, sun and salt" last onPress={() => router.push('/rituals/craft/crystal/care' as Href)} />}
      </List>

      <View style={ui.actions}>
        <Button label="Edit stone" variant="outline" onPress={() => router.push({ pathname: '/rituals/craft/crystal/stone-edit', params: { id: entry.id } } as Href)} />
        <Button label="Delete from my collection" variant="text" onPress={() => void remove()} />
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  gold: { color: colors.gold },
  history: { backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 14 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, minHeight: 56 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  flex: { flex: 1, gap: 2 },
  kind: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
});
