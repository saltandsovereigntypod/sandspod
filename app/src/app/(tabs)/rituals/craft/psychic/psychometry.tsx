import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Chips, goTo, usePsychic } from '../../../../../components/psychic/shared';
import { Body, Card, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { INTUITION_PROMPTS, knownAbout, promptFor, PSYCHOMETRY_STEPS } from '../../../../../lib/craft/psychic/prompts';
import { CLOSENESS } from '../../../../../lib/craft/psychic/remote';
import { useShelves } from '../../../../../lib/shelves/store';
import { localDateKey } from '../../../../../lib/rituals/lifecycle';

// Psychometry with your own things, and one intuition prompt a day. Neither is
// scored against chance: they are practice in noticing, written down before you
// look anything up.
export default function Psychometry() {
  const { keep } = usePsychic();
  const { entries } = useShelves();
  const things = useMemo(() => entries.slice(0, 40), [entries]);
  const [tab, setTab] = useState<'object' | 'prompt'>('object');

  const [pick, setPick] = useState<{ name: string; ref: string } | null>(null);
  const [free, setFree] = useState('');
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [close, setClose] = useState(0);
  const [saved, setSaved] = useState(false);
  const name = pick?.name || free.trim();
  const known = useMemo(() => knownAbout(name, pick?.ref ?? ''), [name, pick]);

  const today = localDateKey(new Date());
  const prompt = promptFor(today);
  const [pIndex, setPIndex] = useState(prompt.index);
  const [pNote, setPNote] = useState('');
  const [pSaved, setPSaved] = useState(false);

  const saveObject = async () => {
    await keep({ kind: 'psychometry', summary: `${name}${close ? `, closeness ${close} of 5` : ''}`, detail: { object: name, ref: pick?.ref ?? '', impressions: notes, closeness: close } });
    setSaved(true);
  };
  const savePrompt = async () => {
    await keep({ kind: 'intuition', summary: INTUITION_PROMPTS[pIndex].slice(0, 70), detail: { prompt: INTUITION_PROMPTS[pIndex], note: pNote } });
    setPSaved(true);
  };

  return (
    <RitualScreen back="Psychic development">
      <Title eyebrow="Psychic development">Psychometry & intuition</Title>
      <Chips>
        <Chip label="With an object" selected={tab === 'object'} onPress={() => setTab('object')} />
        <Chip label="Prompt of the day" selected={tab === 'prompt'} onPress={() => setTab('prompt')} />
      </Chips>

      {tab === 'object' && (
        <>
          {step === 0 && (
            <>
              <Body muted>Psychometry is the old practice of sensing impressions from an object by holding it. Choose something of yours, ideally something you know little about, such as a stone you were given or an item you found.</Body>
              {things.length > 0 && (
                <View style={ui.gapSmall}>
                  <SectionLabel>From your shelves</SectionLabel>
                  <Chips>
                    {things.map((e) => (
                      <Chip key={e.id} label={e.item.name} selected={pick?.name === e.item.name} onPress={() => { setPick({ name: e.item.name, ref: e.item.ref }); setFree(''); }} />
                    ))}
                  </Chips>
                </View>
              )}
              <Field label={things.length ? 'Or something else' : 'Your object'} placeholder="A ring, a shell, a stone, a book" value={free} onChange={(v) => { setFree(v); setPick(null); }} />
              <Button label="Begin" disabled={!name} onPress={() => setStep(1)} />
            </>
          )}
          {step >= 1 && step <= 2 && (
            <>
              <Card accent>
                <SectionLabel>{`${PSYCHOMETRY_STEPS[step - 1].title}: ${name}`}</SectionLabel>
                <Body>{PSYCHOMETRY_STEPS[step - 1].text}</Body>
              </Card>
              {step === 2 && <Field label="What you noticed" placeholder="Images, feelings, places, words…" value={notes} onChange={setNotes} multiline />}
              <Button label={step === 1 ? 'I have held it' : 'Compare with what is known'} disabled={step === 2 && !notes.trim()} onPress={() => setStep(step + 1)} />
            </>
          )}
          {step === 3 && (
            <>
              <Card accent>
                <SectionLabel>{PSYCHOMETRY_STEPS[2].title}</SectionLabel>
                <Body>{PSYCHOMETRY_STEPS[2].text}</Body>
                <Body muted>{`Your impressions: ${notes}`}</Body>
                {known.keywords.length > 0 && <Body>{`In the altar art, ${name} is linked with: ${known.keywords.join(', ')}.`}</Body>}
                {known.libraryId ? (
                  <Button label="Read its Library entry" variant="outline" onPress={() => router.push({ pathname: '/more/library/[entryId]', params: { entryId: known.libraryId! } } as Href)} />
                ) : (
                  <Button label="Search the Library" variant="outline" onPress={goTo('/more/library')} />
                )}
                <Body muted>Its history, if you know it, is the other half: ask whoever gave it to you.</Body>
              </Card>
              <View style={ui.gapSmall}>
                <SectionLabel>How much lined up?</SectionLabel>
                <Chips>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Chip key={n} label={`${n}`} selected={close === n} onPress={() => setClose(n)} />
                  ))}
                </Chips>
                <Body muted>{CLOSENESS[close] || 'Your own judgement, 1 to 5.'}</Body>
              </View>
              {saved ? <Notice>Kept in your Journal under Psychic development.</Notice> : <Button label="Keep this session" disabled={!close} onPress={saveObject} />}
              {saved && <Button label="Another object" onPress={() => { setStep(0); setNotes(''); setClose(0); setSaved(false); setPick(null); setFree(''); }} />}
            </>
          )}
        </>
      )}

      {tab === 'prompt' && (
        <>
          <Card accent>
            <SectionLabel>{pIndex === prompt.index ? 'Today' : `Prompt ${pIndex + 1} of ${INTUITION_PROMPTS.length}`}</SectionLabel>
            <Body>{INTUITION_PROMPTS[pIndex]}</Body>
          </Card>
          <Field label="What you noticed" value={pNote} onChange={setPNote} multiline />
          {pSaved ? <Notice>Kept in your Journal under Psychic development.</Notice> : <Button label="Keep it" disabled={!pNote.trim()} onPress={savePrompt} />}
          <Button label="A different prompt" variant="text" onPress={() => { setPIndex((pIndex + 1) % INTUITION_PROMPTS.length); setPSaved(false); setPNote(''); }} />
          <Notice>Come back and look at what you wrote once the day has run its course. Write down misses as readily as hits.</Notice>
        </>
      )}
    </RitualScreen>
  );
}
