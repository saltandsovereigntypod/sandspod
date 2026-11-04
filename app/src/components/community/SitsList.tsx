// Sits in Community: public group meditations (lib/community/sits.ts). Anyone
// signed in schedules one (a time, a length, a sound from the meditation
// module); others join, and at the start time everyone's timer starts
// together. Only how many are sitting is shown. Hidden sits and people you've
// blocked are left out, as for the rest of Community.

import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, Chips, Field, MenuList, MenuRow, Notice, Section, SwitchRow } from '../more/ui';
import { showEverything, useHiddenCommunity } from '../../lib/community/hidden';
import { isSitHidden, listedSits, sitPayload, SIT_LENGTHS, SOUND_CHOICES, soundFromChoice, soundLabel, startChoices, cleanSitSound, sitWhenLine } from '../../lib/community/sits';
import { scheduleSit, useSits } from '../../lib/community/sitsApi';
import { DEFAULT_PLAN } from '../../lib/meditation/timer';
import { type } from '../../theme';

/** The sit's page, inside the tab Community was opened from. */
export function openSit(id: string, base: '/more' | '/rituals') {
  router.push({ pathname: base === '/more' ? '/more/community/sit' : '/rituals/community/sit', params: { id } });
}

export function SitsList({ base }: { base: '/more' | '/rituals' }) {
  const sits = useSits();
  const hidden = useHiddenCommunity();
  const [now, setNow] = useState(() => Date.now());
  const [form, setForm] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const list = useMemo(() => (sits.data ? listedSits(sits.data.sits, now, hidden) : []), [sits.data, now, hidden]);
  const anyHidden = (sits.data?.sits ?? []).some((s) => isSitHidden(s, hidden));

  if (!sits.signedIn) {
    return (
      <Card>
        <Text style={type.body}>Sit with others: public group meditations, where everyone’s timer starts at the same moment, wherever they are.</Text>
        <Button label="Sign in to sit with others" variant="outline" onPress={() => router.push('/sign-in')} />
      </Card>
    );
  }
  if (!sits.data) return <Text style={type.caption}>{sits.status === 'offline' ? 'Sits couldn’t be loaded. Pull down to try again.' : 'Loading…'}</Text>;
  if (!sits.data.ready) return <Notice tone="muted">Public sits aren’t open yet. They will appear here soon.</Notice>;

  return (
    <>
      <Text style={type.body}>Sit with others. Everyone’s timer starts at the same moment, wherever they are; nothing is heard or seen of anyone, only how many are sitting.</Text>
      {form ? (
        <ScheduleSit
          onDone={(id) => {
            setForm(false);
            void sits.refresh();
            if (id) openSit(id, base);
          }}
        />
      ) : (
        <Button label="Schedule a sit" variant="outline" onPress={() => setForm(true)} />
      )}
      <Section label="Sits coming up">
        {!list.length ? (
          <Text style={type.caption}>No sits are on the calendar. Schedule one and others can join.</Text>
        ) : (
          <MenuList>
            {list.map((s, i) => (
              <MenuRow
                key={s.id}
                label={s.title}
                detail={[sitWhenLine(s, now), soundLabel(cleanSitSound(s.sound)), sits.data!.joined.includes(s.id) ? 'you’ve joined' : '', `with ${sits.data!.names[s.host_id] ?? 'someone'}`].filter(Boolean).join(' · ')}
                icon="moon"
                last={i === list.length - 1}
                onPress={() => openSit(s.id, base)}
              />
            ))}
          </MenuList>
        )}
        {anyHidden && (
          <Button label="Show what I’ve hidden" variant="text" onPress={showEverything} />
        )}
      </Section>
    </>
  );
}

function ScheduleSit({ onDone }: { onDone: (id: string | null) => void }) {
  const choices = useMemo(() => startChoices(new Date()), []);
  const [title, setTitle] = useState('');
  const [intention, setIntention] = useState('');
  const [start, setStart] = useState(choices[0]?.at.toISOString() ?? '');
  const [minutes, setMinutes] = useState('20');
  const [sound, setSound] = useState('');
  const [interval, setIntervalBell] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    const result = sitPayload(
      { title, intention, startsAt: start ? new Date(start) : null, minutes: Number(minutes), plan: { ...DEFAULT_PLAN, every: interval ? 5 : 0 }, sound: soundFromChoice(sound) },
      new Date(),
    );
    if (!result.ok) return setMessage(result.error);
    setBusy(true);
    try {
      const saved = await scheduleSit(result.row);
      onDone(saved.id);
    } catch (e) {
      const text = e instanceof Error ? e.message : '';
      setMessage(/row-level security|violates/i.test(text) ? 'To schedule a sit, set up your community profile first (Coven → your profile).' : text || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Text style={type.cardTitle}>Schedule a sit</Text>
      <Field label="Name" value={title} onChangeText={setTitle} maxLength={80} placeholder="New moon sit" />
      <Field label="Intention (optional)" value={intention} onChangeText={setIntention} maxLength={280} multiline />
      <Chips label="Begins" options={choices.map((c) => ({ value: c.at.toISOString(), label: c.label }))} value={start} onChange={setStart} />
      <Chips label="Length" options={SIT_LENGTHS.map((m) => ({ value: String(m), label: `${m} min` }))} value={minutes} onChange={setMinutes} />
      <Chips label="Sound" options={SOUND_CHOICES} value={sound} onChange={setSound} />
      <MenuList>
        <SwitchRow label="A soft bell every five minutes" value={interval} onChange={setIntervalBell} last />
      </MenuList>
      <Text style={type.caption}>A bell begins and ends it for everyone. The drum and bowls play in step for all; binaural layers need headphones and play for each person on their own.</Text>
      <View style={styles.row}>
        <Button label={busy ? 'Scheduling…' : 'Schedule it'} disabled={busy} onPress={() => void save()} />
        <Button label="Cancel" variant="text" onPress={() => onDone(null)} />
      </View>
      {message && <Notice>{message}</Notice>}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
});
