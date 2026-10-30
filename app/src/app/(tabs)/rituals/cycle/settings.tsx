import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { ChoiceChips, errorText, PassphraseInput, passphraseProblem, Progress, RecoveryCard } from '../../../../components/cycle/ui';
import { Body, Card, Chip, Chips, confirmAction, Notice, RitualScreen, SectionLabel, tell, Title, Toggle, ui } from '../../../../components/rituals/ui';
import { MOON_ONLY_NOTE } from '../../../../lib/cycle/content';
import { changeSettings, REMINDER_AHEAD_CHOICES } from '../../../../lib/cycle/model';
import {
  changePassphrase,
  deleteAllCycleData,
  keepOnDeviceOnly,
  lockNow,
  protectWithPassphrase,
  setAskEachTime,
  updateCycle,
  useCycle,
} from '../../../../lib/cycle/store';
import type { CycleSettings, Situation } from '../../../../lib/cycle/types';
import { askForCycleReminders } from '../../../../lib/reminders/store';
import { useSession } from '../../../../lib/session';
import { type } from '../../../../theme';

const SITUATIONS: { value: Situation; label: string }[] = [
  { value: 'irregular', label: 'My cycles are irregular' },
  { value: 'hormonal', label: 'Hormonal birth control' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'postpartum', label: 'After a birth' },
  { value: 'perimenopause', label: 'Perimenopause' },
];
const TIMES = [
  { value: 8 * 60, label: 'Morning' },
  { value: 12 * 60, label: 'Midday' },
  { value: 19 * 60, label: 'Evening' },
];

// Cycle & Moon's choices: following the moon alone, what they've told us
// about their body, Today's card, the archetype lens, the moon-time altar,
// the Grimoire, reminders, the passphrase and sync, and deleting everything.
export default function CycleSettingsScreen() {
  const cycle = useCycle();
  const { session } = useSession();
  const s = cycle.data?.settings;
  const set = (change: Partial<CycleSettings>) => updateCycle((d) => changeSettings(d, change, new Date()));

  return (
    <RitualScreen back="Cycle & Moon">
      <Title eyebrow="Cycle & Moon">Settings and privacy</Title>
      {cycle.phase === 'open' && s ? (
        <>
          <SectionLabel>Follow</SectionLabel>
          <Card>
            <ChoiceChips
              options={[
                { value: 'cycle', label: 'My cycle' },
                { value: 'moon', label: 'The moon alone' },
              ]}
              value={s.mode}
              onChange={(mode) => set({ mode })}
            />
            <Body muted>{MOON_ONLY_NOTE}</Body>
          </Card>

          {s.mode === 'cycle' && (
            <>
              <SectionLabel>About my body</SectionLabel>
              <Card>
                <Body muted>Optional. It changes the wording and when an estimate would be honest: none while pregnant, and a range rather than a day when cycles vary.</Body>
                <Chips>
                  {SITUATIONS.map((x) => (
                    <Chip
                      key={x.value}
                      label={x.label}
                      selected={s.situations.includes(x.value)}
                      onPress={() => set({ situations: s.situations.includes(x.value) ? s.situations.filter((y) => y !== x.value) : [...s.situations, x.value] })}
                    />
                  ))}
                </Chips>
                {s.situations.includes('hormonal') && <Body muted>With hormonal birth control, the bleed is usually a withdrawal bleed rather than a period, and the inner seasons are a lens rather than a description. Many people follow the moon alone instead.</Body>}
              </Card>
            </>
          )}

          <SectionLabel>What it shows</SectionLabel>
          <Card>
            <Toggle label="A small card on Today" detail="Today’s day, season and moon, one suggestion and Log today" value={s.today} onChange={(today) => set({ today })} />
            <Toggle label="The archetype lens" detail="Maiden, Mother, Enchantress and Crone, with plainer names beside them" value={s.archetypes} onChange={(archetypes) => set({ archetypes })} />
            <Toggle label="The moon-time altar" detail="While you bleed, offer a starter altar: a moon bowl, red candles and a red cord" value={s.altar} onChange={(altar) => set({ altar })} />
            <Toggle
              label="Moon Time in my Grimoire"
              detail="Offer to keep a reflection you write in a Moon Time section. Grimoire pages aren’t encrypted, so only what you write there goes there."
              value={s.grimoire}
              onChange={(grimoire) => set({ grimoire })}
            />
          </Card>

          <SectionLabel>Reminders</SectionLabel>
          <Card>
            <Toggle
              label="Remind me"
              detail={s.mode === 'cycle' ? 'A few days before your bleed may start (only when there’s an honest estimate)' : 'The evening before the new and the full moon'}
              value={s.reminders.on}
              onChange={(on) => {
                set({ reminders: { ...s.reminders, on } });
                if (on && Platform.OS !== 'web') void askForCycleReminders();
              }}
            />
            {s.reminders.on && (
              <View style={ui.gap}>
                {s.mode === 'cycle' && (
                  <>
                    <Text style={type.caption}>How many days ahead</Text>
                    <ChoiceChips options={REMINDER_AHEAD_CHOICES.map((n) => ({ value: n as number, label: `${n} ${n === 1 ? 'day' : 'days'}` }))} value={s.reminders.ahead} onChange={(ahead) => set({ reminders: { ...s.reminders, ahead } })} />
                  </>
                )}
                <Text style={type.caption}>When</Text>
                <ChoiceChips options={TIMES} value={TIMES.some((t) => t.value === s.reminders.at) ? s.reminders.at : TIMES[0].value} onChange={(at) => set({ reminders: { ...s.reminders, at } })} />
                <Toggle
                  label="Say what it’s about"
                  detail={s.reminders.full ? 'Shows, for example, “Your bleed may start in about 3 days.” Anyone who sees your screen could read it.' : 'Off: every reminder just says “Cycle & Moon has a note for you.”'}
                  value={s.reminders.full}
                  onChange={(full) => set({ reminders: { ...s.reminders, full } })}
                />
                <Body muted>Reminders ring on this phone and on any other phone where Cycle &amp; Moon is open. They hide their words on an Android lock screen, and are never added to a calendar.</Body>
              </View>
            )}
          </Card>
        </>
      ) : (
        <Notice>{cycle.phase === 'locked' ? 'Open Cycle & Moon to change its settings. You can still delete everything below.' : 'Begin Cycle & Moon to choose its settings.'}</Notice>
      )}

      <SectionLabel>Privacy and sync</SectionLabel>
      <Privacy synced={cycle.synced} open={cycle.phase === 'open'} askEachTime={cycle.askEachTime} signedIn={!!session} />

      <SectionLabel>Delete</SectionLabel>
      <Card>
        <Body>Delete every Cycle &amp; Moon note, setting and shared status, from this phone and from your account. This can’t be undone.</Body>
        <Button
          label="Delete all my Cycle & Moon data"
          variant="outline"
          onPress={async () => {
            if (!(await confirmAction('Delete all your Cycle & Moon data?', 'Your notes, settings and any status you share are deleted from this phone and from your account. This can’t be undone.', 'Delete all'))) return;
            try {
              await deleteAllCycleData();
              tell('Deleted', 'Your Cycle & Moon data is gone from this phone and your account.');
              router.replace('/rituals/cycle');
            } catch (e) {
              tell('Nothing was deleted', errorText(e));
            }
          }}
        />
      </Card>
    </RitualScreen>
  );
}

function Privacy({ synced, open, askEachTime, signedIn }: { synced: boolean; open: boolean; askEachTime: boolean; signedIn: boolean }) {
  const [mode, setMode] = useState<'idle' | 'protect' | 'change'>('idle');
  const [pass, setPass] = useState('');
  const [again, setAgain] = useState('');
  const [newRecovery, setNewRecovery] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const problem = passphraseProblem(pass, again);

  const run = async () => {
    setError(null);
    setProgress(0);
    try {
      const r = mode === 'protect' ? await protectWithPassphrase(pass, setProgress) : await changePassphrase(pass, newRecovery, setProgress);
      setRecovery(r);
      setMode('idle');
      setPass('');
      setAgain('');
    } catch (e) {
      setError(errorText(e));
    } finally {
      setProgress(null);
    }
  };

  return (
    <Card>
      <Body>
        {synced
          ? 'Kept with your account, encrypted on this phone first with a key only your passphrase or recovery key can open. The server holds only scrambled text.'
          : 'Kept on this phone only, encrypted. Nothing is sent.'}
      </Body>
      <Body muted>
        This phone remembers the key in the app’s own storage (not the phone’s keychain, which would need an app update from the store), so anyone who can open your apps could open Cycle &amp; Moon. Choose “Ask for my passphrase each time” if that matters.
      </Body>
      {recovery && <RecoveryCard recovery={recovery} onDone={() => setRecovery(null)} />}
      {open && synced && (
        <Toggle label="Ask for my passphrase each time" detail="The key is kept only until the app closes. Reminders need Cycle & Moon open to ring." value={askEachTime} onChange={(v) => void setAskEachTime(v)} />
      )}
      {open && mode === 'idle' && (
        <View style={ui.gap}>
          {!synced && signedIn && <Button label="Keep it with my account (set a passphrase)" variant="outline" onPress={() => setMode('protect')} />}
          {synced && <Button label="Change my passphrase" variant="outline" onPress={() => setMode('change')} />}
          {synced && <Button label="Close it on this phone now" variant="text" onPress={() => void lockNow()} />}
          {synced && (
            <Button
              label="Keep it on this phone only"
              variant="text"
              onPress={async () => {
                if (!(await confirmAction('Keep it on this phone only?', 'Your account’s encrypted copy is deleted. Other phones and the website will no longer have it.', 'Keep on this phone'))) return;
                try {
                  await keepOnDeviceOnly();
                } catch (e) {
                  tell('Couldn’t change it', errorText(e));
                }
              }}
            />
          )}
        </View>
      )}
      {mode !== 'idle' && (
        <View style={ui.gap}>
          <PassphraseInput label="New passphrase" value={pass} onChange={setPass} autoFocus />
          <PassphraseInput label="The same again" value={again} onChange={setAgain} />
          {!!pass && !!problem && <Text style={type.caption}>{problem}</Text>}
          {mode === 'change' && <Toggle label="Make a new recovery key too" detail="The old one stops working" value={newRecovery} onChange={setNewRecovery} />}
          {progress != null && <Progress done={progress} label="Making your key. This takes a few seconds on purpose." />}
          {error && <Notice>{error}</Notice>}
          <Button label={progress != null ? 'Working…' : mode === 'protect' ? 'Protect and keep with my account' : 'Change it'} disabled={!!problem || progress != null} onPress={run} />
          <Button label="Cancel" variant="text" onPress={() => setMode('idle')} />
        </View>
      )}
      <Body muted>If both your passphrase and recovery key are lost, nobody can open your notes again, including the people who run Salt &amp; Sovereignty. You can always delete them and start again.</Body>
    </Card>
  );
}
