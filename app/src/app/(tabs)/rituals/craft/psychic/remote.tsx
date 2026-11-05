import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { CountdownRing, DropIn, SoundPill, useDropIn, useRevealTimer } from '../../../../../components/psychic/DropIn';
import { AltarImage } from '../../../../../components/altar/AltarImage';
import { Button, Chip, Chips, ResultsLine, usePsychic } from '../../../../../components/psychic/shared';
import { Body, Card, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { altarPicture } from '../../../../../lib/altar/assets';
import { CLOSENESS, IMPRESSION_PROMPTS, REMOTE_CHANCE, remotePool, setUpRound, TUNE_IN_SECONDS, type RemotePicture } from '../../../../../lib/craft/psychic/remote';
import { colors } from '../../../../../theme';

function Pic({ p, size }: { p: RemotePicture; size: number }) {
  const picture = altarPicture(p.image);
  if (!picture) return <View style={{ width: size, height: size }} />;
  return <AltarImage picture={picture} resizeMode="contain" style={{ width: size, height: size }} accessibilityLabel={p.name} />;
}

// Remote viewing: a hidden picture from the altar art. Tune in, write what you
// pick up, then judge blind among four pictures before the answer is shown.
export default function Remote() {
  const { sessions, keep } = usePsychic();
  const pool = useMemo(() => remotePool(), []);
  const [phase, setPhase] = useState<'intro' | 'tune' | 'write' | 'judge' | 'reveal' | 'done'>('intro');
  const [round, setRound] = useState<{ target: RemotePicture; choices: RemotePicture[] } | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [judged, setJudged] = useState('');
  const [close, setClose] = useState(0);
  const drop = useDropIn();
  const timer = useRevealTimer();
  const startTimer = timer.start;
  const [left, setLeft] = useState(TUNE_IN_SECONDS);

  useEffect(() => {
    if (phase !== 'tune') return;
    const t = setTimeout(() => (left <= 0 ? (startTimer(), setPhase('write')) : setLeft((s) => s - 1)), 1000);
    return () => clearTimeout(t);
  }, [phase, left, startTimer]);

  const begin = () => {
    // The target is chosen now, before anything is written, and not shown.
    const recent = sessions.filter((s) => s.data.kind === 'remote').slice(0, 10).map((s) => String(s.data.detail.targetId ?? ''));
    setRound(setUpRound(pool, recent));
    setNotes({});
    setJudged('');
    setClose(0);
    setLeft(TUNE_IN_SECONDS);
    timer.reset();
    setPhase('tune');
  };

  const target = round?.target;
  const hit = !!target && judged === target.id;

  const finish = async () => {
    if (!target) return;
    await keep({
      kind: 'remote',
      trials: 1,
      hits: hit ? 1 : 0,
      chance: REMOTE_CHANCE,
      summary: `${target.name}: ${hit ? 'picked it blind' : 'did not pick it blind'}, closeness ${close || '-'} of 5`,
      meditation: drop.meditation(),
      detail: { revealSec: drop.settings.revealSec, targetId: target.id, targetName: target.name, judged, closeness: close, impressions: notes },
    });
    setPhase('done');
  };

  const hasNotes = Object.values(notes).some((v) => v.trim());

  return (
    <RitualScreen back="Psychic development">
      <Title eyebrow="Psychic development">Remote viewing</Title>
      {phase !== 'intro' && <SoundPill />}

      {phase === 'intro' && (
        <>
          <Body muted>A picture from the altar art has been hidden away. You write what you pick up about it, then try to spot it among four pictures before the answer is shown, so the judging is blind.</Body>
          <Body muted>Remote viewing is an old parapsychology experiment. Controlled tests have not shown it works, so treat this as practice in noticing, and let the record speak for itself.</Body>
          <Button label="Begin: a minute to tune in" onPress={begin} />
          <DropIn onStart={begin} startLabel="Start: choose the target" />
          <Card>
            <SectionLabel>Your results here</SectionLabel>
            <ResultsLine sessions={sessions} kind="remote" />
          </Card>
        </>
      )}

      {phase === 'tune' && (
        <>
          <Card accent>
            <SectionLabel>Tune in</SectionLabel>
            <Body>Close your eyes. Breathe slowly. Let go of wanting to get it right, and rest your attention on the hidden picture without trying to name it.</Body>
            <Body muted>{`${left} seconds`}</Body>
          </Card>
          <Button label="I am ready" variant="outline" onPress={() => { timer.start(); setPhase('write'); }} />
        </>
      )}

      {phase === 'write' && (
        <>
          <Body muted>Write what comes, in any prompt. Short and plain is best; skip any that is blank.</Body>
          {IMPRESSION_PROMPTS.map((p) => (
            <Field key={p.id} label={p.label} placeholder={p.hint} value={notes[p.id] ?? ''} onChange={(v) => setNotes((n) => ({ ...n, [p.id]: v }))} multiline={p.id !== 'words'} />
          ))}
          {drop.settings.revealSec !== null && <CountdownRing state={timer.state} />}
          <Button label="Go to judging" disabled={!hasNotes || timer.locked} onPress={() => setPhase('judge')} />
        </>
      )}

      {phase === 'judge' && round && (
        <>
          <Body>Which of these do you think was the hidden one? Choose by your impressions, not by what you would expect.</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {round.choices.map((c) => (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityLabel={c.name}
                onPress={() => setJudged(c.id)}
                style={{ flexBasis: '47%', flexGrow: 1, alignItems: 'center', gap: 6, padding: 10, borderRadius: 14, borderWidth: 2, borderColor: judged === c.id ? colors.gold : colors.hairline, backgroundColor: colors.surface }}
              >
                <Pic p={c} size={110} />
              </Pressable>
            ))}
          </View>
          <Button label="Lock in my choice" disabled={!judged} onPress={() => setPhase('reveal')} />
        </>
      )}

      {phase === 'reveal' && round && target && (
        <>
          <Card accent>
            <SectionLabel>The answer</SectionLabel>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Pic p={target} size={160} />
              <Body>{target.name}</Body>
            </View>
            <Body>{hit ? 'You picked it, blind.' : `You picked ${round.choices.find((c) => c.id === judged)?.name ?? 'another'}.`}</Body>
            {target.keywords.length > 0 && <Body muted>{`Traditionally linked with: ${target.keywords.slice(0, 6).join(', ')}.`}</Body>}
          </Card>
          <View style={ui.gapSmall}>
            <SectionLabel>How close were your impressions?</SectionLabel>
            <Chips>
              {[1, 2, 3, 4, 5].map((n) => (
                <Chip key={n} label={`${n}`} selected={close === n} onPress={() => setClose(n)} />
              ))}
            </Chips>
            <Body muted>{CLOSENESS[close] || 'Rate your written impressions against the picture, 1 to 5. This is your own judgement and is not counted against chance.'}</Body>
          </View>
          <Button label="Keep this session" disabled={!close} onPress={finish} />
        </>
      )}

      {phase === 'done' && (
        <>
          <Card accent>
            <Body>Kept in your Journal under Psychic development.</Body>
          </Card>
          <ResultsLine sessions={sessions} kind="remote" />
          <Notice>Only the blind pick among four counts against chance (one in four). Your 1 to 5 rating is for your own notes.</Notice>
          <Button label="Another picture" onPress={begin} />
        </>
      )}
    </RitualScreen>
  );
}
