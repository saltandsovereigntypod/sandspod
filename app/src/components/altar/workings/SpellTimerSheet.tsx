// Multi-day spells on this altar: start one (a seven-day candle, nine nights,
// a moon's jar, a novena or your own), tend it each day, and close it with a
// reflection. Saved in the craft store, `altar.spells`.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Button } from '../../Button';
import { addEntry, updateEntry, useCraft } from '../../../lib/craft/store';
import { lookBackChoices, suggestedWhen, type LookBackWhen } from '../../../lib/rituals/lookBack';
import { localDateKey } from '../../../lib/rituals/lifecycle';
import { saveJournal } from '../../../lib/rituals/store';
import { shortDate } from '../../../lib/calendar';
import {
  closeSpell,
  newSpell,
  spellJournalAnswers,
  SPELL_KINDS,
  SPELLS_COLLECTION,
  spellProgress,
  spellsForAltar,
  spellToday,
  tickSpell,
  type SpellEntry,
  type SpellKind,
} from '../../../lib/altar/workings/spells';
import { colors, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Field, Label, nowIso, sheetStyles, type AltarContext } from './common';

type Props = {
  visible: boolean;
  altar: AltarContext;
  /** The object it's worked with (its altarObjectId and name), when opened from one. */
  objectUid?: string;
  objectLabel?: string;
  onClose: () => void;
};

function Ring({ progress, label }: { progress: number; label: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
      <Svg width={46} height={46} viewBox="0 0 46 46">
        <Circle cx={23} cy={23} r={r} stroke={colors.hairline} strokeWidth={4} fill="none" />
        <Circle cx={23} cy={23} r={r} stroke={colors.gold} strokeWidth={4} fill="none" strokeDasharray={`${c * progress} ${c}`} strokeLinecap="round" transform="rotate(-90 23 23)" />
      </Svg>
    </View>
  );
}

export function SpellTimerSheet({ visible, altar, objectUid, objectLabel, onClose }: Props) {
  const { entries } = useCraft<SpellEntry>(SPELLS_COLLECTION);
  const [starting, setStarting] = useState(false);
  const now = new Date();
  const list = spellsForAltar(entries, altar.id, now).filter((e) => !objectUid || e.data.objectUid === objectUid || !e.data.objectUid);
  const open = list.filter((e) => !e.data.closedAt);
  const closed = list.filter((e) => e.data.closedAt).slice(0, 5);

  return (
    <Sheet visible={visible} eyebrow="Spells over days" title={objectLabel ? `With ${objectLabel}` : 'Spells on this altar'} onClose={onClose}>
      {open.map((e) => (
        <SpellCard key={e.id} id={e.id} spell={e.data} />
      ))}
      {open.length === 0 && !starting && <Text style={type.body}>Some workings take days: a candle burned a little each evening, a jar tended for a moon. Start one and the altar will keep count.</Text>}
      {starting ? (
        <StartSpell
          altar={altar}
          objectUid={objectUid}
          onStarted={() => setStarting(false)}
          onCancel={() => setStarting(false)}
        />
      ) : (
        <Button label="Start a spell" variant={open.length ? 'outline' : 'primary'} onPress={() => setStarting(true)} />
      )}
      {closed.length > 0 && (
        <View style={sheetStyles.section}>
          <Label>Closed</Label>
          {closed.map((e) => (
            <View key={e.id} style={sheetStyles.card}>
              <Text style={sheetStyles.value}>{e.data.title}</Text>
              {e.data.reflection ? <Text style={type.caption}>“{e.data.reflection}”</Text> : null}
            </View>
          ))}
        </View>
      )}
    </Sheet>
  );
}

function SpellCard({ id, spell }: { id: string; spell: SpellEntry }) {
  const [note, setNote] = useState('');
  const [reflection, setReflection] = useState('');
  const [closing, setClosing] = useState(false);
  const now = new Date();
  const today = spellToday(spell, now);
  // Closing a spell can keep it in the ritual journal, to ask later whether it worked.
  const working = { title: spell.title, intention: spell.intention ?? null, moon_phase: null, ritual_date: localDateKey(now) };
  const [lookBack, setLookBack] = useState<LookBackWhen | null>(() => suggestedWhen(working));
  const [problem, setProblem] = useState('');
  const close = async () => {
    const closed = closeSpell(spell, reflection, new Date());
    await updateEntry(SPELLS_COLLECTION, id, closed);
    if (!lookBack) return;
    try {
      await saveJournal({ session: null, answers: spellJournalAnswers(closed, new Date()), lookBack });
    } catch {
      setProblem('The spell is closed, but it couldn’t be added to your journal to look back on.');
    }
  };
  return (
    <View style={sheetStyles.card}>
      <View style={sheetStyles.row}>
        <Ring progress={spellProgress(spell)} label={`${spell.title}: ${today.label}`} />
        <View style={styles.cardText}>
          <Text style={sheetStyles.value}>{spell.title}</Text>
          <Text style={type.caption}>{today.label}</Text>
        </View>
      </View>
      {today.waited ? <Text style={type.caption}>{today.waited}</Text> : null}
      <Text style={type.body}>{today.instruction}</Text>
      {today.status === 'tend' && (
        <>
          <Field label="A note on today, optional" value={note} onChangeText={setNote} placeholder="How it felt, what you noticed…" maxLength={280} />
          <Button
            label="Tended today"
            onPress={() => {
              void updateEntry(SPELLS_COLLECTION, id, tickSpell(spell, new Date(), note));
              setNote('');
            }}
          />
        </>
      )}
      {(today.status === 'complete' || closing) && (
        <>
          <Field label="Closing reflection" value={reflection} onChangeText={setReflection} placeholder="How did it go? What changed?" multiline maxLength={1000} />
          <Label>Ask me later if it worked</Label>
          <ChipRow>
            {lookBackChoices(working, now).map((c) => {
              const day = new Date(`${c.date}T12:00:00`);
              return <Chip key={c.when} label={`${c.label} · ${shortDate(day)}`} active={lookBack === c.when} onPress={() => setLookBack(c.when)} />;
            })}
            <Chip label="Not needed" active={lookBack === null} onPress={() => setLookBack(null)} />
          </ChipRow>
          {lookBack ? <Text style={type.caption}>It will be kept in your ritual journal, and you’ll be asked then.</Text> : null}
          <Button label="Close the spell" onPress={() => void close()} />
        </>
      )}
      {problem ? <Text style={type.caption}>{problem}</Text> : null}
      {today.status !== 'complete' && !closing && (
        <ChipRow>
          <Chip label="End it early" onPress={() => setClosing(true)} />
        </ChipRow>
      )}
    </View>
  );
}

function StartSpell({ altar, objectUid, onStarted, onCancel }: { altar: AltarContext; objectUid?: string; onStarted: () => void; onCancel: () => void }) {
  const [kind, setKind] = useState<SpellKind>('seven-day-candle');
  const [title, setTitle] = useState('');
  const [days, setDays] = useState('7');
  const [intention, setIntention] = useState('');
  const info = SPELL_KINDS[kind];
  const start = async () => {
    await addEntry(SPELLS_COLLECTION, newSpell({ altarId: altar.id, kind, title, days: Number(days), objectUid, intention }, nowIso()));
    onStarted();
  };
  return (
    <View style={sheetStyles.section}>
      <Label>Which kind</Label>
      <ChipRow>
        {(Object.keys(SPELL_KINDS) as SpellKind[]).map((k) => (
          <Chip key={k} label={SPELL_KINDS[k].label} active={kind === k} onPress={() => setKind(k)} />
        ))}
      </ChipRow>
      <Text style={type.caption}>{info.blurb}</Text>
      {kind === 'custom' && <Field label="How many days" value={days} onChangeText={(v) => setDays(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="7" maxLength={2} />}
      <Field label="Name it" value={title} onChangeText={setTitle} placeholder={info.label} maxLength={60} />
      <Field label="What it’s for" value={intention} onChangeText={setIntention} placeholder="Steady work, a calmer home…" maxLength={160} />
      <Text style={type.caption}>Miss a day and it simply waits for you; nothing breaks.</Text>
      <View style={sheetStyles.row}>
        <Button label="Not now" variant="outline" onPress={onCancel} />
        <Button label="Begin today" onPress={() => void start()} disabled={kind === 'custom' && !(Number(days) > 0)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardText: { flex: 1, gap: 2 },
});
