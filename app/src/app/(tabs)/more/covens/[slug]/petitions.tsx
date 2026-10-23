import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Pill, Pills, Words, useReport } from '../../../../../components/covens/ui';
import { Card, Field, Notice, Section } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { CANDLE_COLORS, canTend, errorMessage, relativeTime, SWATCH, type Petition, type Tending } from '../../../../../lib/covens/model';
import { colors, type } from '../../../../../theme';

// Petitions the circle holds: a member asks, a candle is set for it on the
// shared altar, and anyone in the coven can tend it (relighting its candle)
// once every twelve hours. The person who asked closes it, or marks it answered.
export default function Petitions() {
  const coven = useCoven();
  const report = useReport(coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const { loadNames, petitionsVersion } = coven;
  const [petitions, setPetitions] = useState<Petition[] | null>(null);
  const [tendings, setTendings] = useState<Tending[]>([]);
  const [asking, setAsking] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<string>('white');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canAct = coven.standing.ok;

  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const list = await api.fetchPetitions(covenId);
      const tended = await api.fetchTendings(list.map((p) => p.id)).catch(() => [] as Tending[]);
      setPetitions(list);
      setTendings(tended);
      void loadNames([...list.map((p) => p.user_id), ...tended.map((t) => t.user_id)]);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, loadNames]);

  useEffect(() => {
    void load();
  }, [load, petitionsVersion]);

  const run = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      setMessage(done);
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const open = (petitions ?? []).filter((p) => p.status === 'open');
  const past = (petitions ?? []).filter((p) => p.status !== 'open').slice(0, 20);

  const card = (p: Petition) => {
    const mineToClose = p.user_id === coven.userId || coven.perms.moderate || coven.perms.site;
    const count = tendings.filter((t) => t.petition_id === p.id).length;
    const recent = tendings.filter((t) => t.petition_id === p.id && t.note).slice(0, 3);
    return (
      <Card key={p.id}>
        <View style={styles.head}>
          <View style={[styles.dot, { backgroundColor: SWATCH[p.color] ?? SWATCH.white }]} />
          <Text style={[type.cardTitle, styles.flex]}>{p.title}</Text>
        </View>
        <Text style={type.caption}>
          Asked by {p.user_id === coven.userId ? 'you' : coven.nameOf(p.user_id)} · {relativeTime(p.created_at)}
          {count ? ` · tended ${count} ${count === 1 ? 'time' : 'times'}` : ''}
        </Text>
        <Words text={p.body} />
        {p.status !== 'open' && (
          <Pills>
            <Pill label={p.status === 'answered' ? 'Answered' : 'Closed'} tone={p.status === 'answered' ? 'gold' : undefined} />
          </Pills>
        )}
        {!!p.outcome_note && <Text style={type.body}>“{p.outcome_note}”</Text>}
        {recent.map((t) => (
          <Text key={t.id} style={type.caption}>
            {coven.nameOf(t.user_id)}: “{t.note}”
          </Text>
        ))}
        {p.status === 'open' && canAct && (
          <>
            <Field label="A word as you tend it (optional)" value={notes[p.id] ?? ''} onChangeText={(text) => setNotes((prev) => ({ ...prev, [p.id]: text }))} maxLength={280} />
            <View style={styles.row}>
              <Button
                label={canTend(p, tendings, coven.userId) ? 'Tend its candle' : 'You’ve tended it today'}
                onPress={() => void run(() => api.tendPetition(p.id, notes[p.id] ?? ''), 'Its candle burns again.').then(() => setNotes((prev) => ({ ...prev, [p.id]: '' })))}
                disabled={busy || !canTend(p, tendings, coven.userId)}
              />
              {mineToClose && <Button label="Answered" variant="outline" onPress={() => void run(() => api.closePetition(p.id, 'answered', notes[p.id] ?? ''), 'Marked answered.')} disabled={busy} />}
              {mineToClose && <Button label="Close" variant="text" onPress={() => void run(() => api.closePetition(p.id, 'closed', notes[p.id] ?? ''), 'Closed.')} disabled={busy} />}
            </View>
          </>
        )}
        {p.user_id !== coven.userId && (
          <Button label="Report" variant="text" onPress={() => report.open({ target_type: 'petition', target_id: p.id, coven_id: p.coven_id, target_user_id: p.user_id, label: 'this petition' })} />
        )}
      </Card>
    );
  };

  return (
    <CovenScreen title="Petitions" need="standing" onRefresh={load}>
      <Text style={type.body}>Ask the circle to hold something for you. A candle is lit for it on the shared altar, and members tend it while it’s open.</Text>
      {canAct && !asking && <Button label="Ask the circle" onPress={() => setAsking(true)} />}
      {asking && (
        <Card>
          <Field label="What should the circle hold?" value={title} onChangeText={setTitle} maxLength={140} placeholder="Healing for my sister" />
          <Field label="More, if you’d like to share it (optional)" value={body} onChangeText={setBody} multiline maxLength={2000} />
          <Text style={type.caption}>Candle colour</Text>
          <View style={styles.swatches} accessibilityRole="radiogroup" accessibilityLabel="Candle colour">
            {CANDLE_COLORS.map((c) => (
              <Pressable key={c} accessibilityRole="radio" accessibilityLabel={c} accessibilityState={{ checked: color === c }} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: SWATCH[c] }, color === c && styles.swatchOn]} />
            ))}
          </View>
          <View style={styles.row}>
            <Button
              label={busy ? 'Asking…' : 'Ask'}
              disabled={busy || !title.trim()}
              onPress={() =>
                void run(() => api.askPetition(covenId!, title, body, color), 'The circle is holding it.').then(() => {
                  setAsking(false);
                  setTitle('');
                  setBody('');
                })
              }
            />
            <Button label="Cancel" variant="text" onPress={() => setAsking(false)} />
          </View>
        </Card>
      )}
      {message && <Notice>{message}</Notice>}
      {!petitions && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {petitions && (
        <Section label="Held now">
          {open.length ? open.map(card) : <Text style={type.caption}>The circle isn’t holding any petitions right now.</Text>}
        </Section>
      )}
      {past.length > 0 && <Section label="Answered and closed">{past.map(card)}</Section>}
      {report.sheet}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: colors.goldLine },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.gold },
});
