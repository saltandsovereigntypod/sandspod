import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { CountdownRing, DropIn, SoundPill, useDropIn, useRevealTimer } from '../../../../../components/psychic/DropIn';
import { Bars, Button, Chip, Chips, EspSymbol, ResultsLine, SuitMark, usePsychic } from '../../../../../components/psychic/shared';
import { Body, Card, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { ESP_MODES, espChance, espMode, isHit, nextTarget, RUN_LENGTHS, type EspMode, type Trial } from '../../../../../lib/craft/psychic/esp';
import { colors, fonts } from '../../../../../theme';

const SIT_SECONDS = 8;

function Face({ mode, id, size }: { mode: EspMode; id: string; size: number }) {
  if (mode === 'symbols') return <EspSymbol id={id} size={size} />;
  if (mode === 'suits') return <SuitMark id={id} size={size} />;
  if (mode === 'colours') return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: espMode(mode).options.find((o) => o.id === id)?.colour }} />;
  return <Text style={{ color: colors.cream, fontFamily: fonts.display, fontSize: size / 2 }}>{id === 'yes' ? 'Yes' : 'No'}</Text>;
}

// Card and colour guessing. The hidden target for each trial is chosen before
// you guess (crypto randomness where the device has it) and kept out of sight
// until you have chosen.
export default function Esp() {
  const { sessions, keep } = usePsychic();
  const [mode, setMode] = useState<EspMode>('symbols');
  const [length, setLength] = useState<number>(10);
  const [sit, setSit] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'guess' | 'reveal' | 'done'>('setup');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [target, setTarget] = useState('');
  const [guess, setGuess] = useState('');
  const [wait, setWait] = useState(0);
  const kept = useRef(false);
  const m = espMode(mode);
  const drop = useDropIn();
  const timer = useRevealTimer();
  const timed = drop.settings.revealSec !== null;

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const begin = () => {
    kept.current = false;
    setTrials([]);
    setGuess('');
    setTarget(nextTarget(mode, []));
    setWait(sit && !timed ? SIT_SECONDS : 0);
    timer.start();
    setPhase('guess');
  };

  const choose = (id: string) => {
    setGuess(id);
    setPhase('reveal');
  };

  const next = () => {
    const all = [...trials, { target, guess }];
    setTrials(all);
    if (all.length >= length) {
      setPhase('done');
      if (!kept.current) {
        kept.current = true;
        const hits = all.filter(isHit).length;
        void keep({ kind: 'esp', trials: all.length, hits, chance: espChance(mode), summary: `${m.label}: ${hits} of ${all.length}`, detail: { mode, trials: all, revealSec: drop.settings.revealSec }, meditation: drop.meditation() });
      }
      return;
    }
    setTarget(nextTarget(mode, all.map((t) => t.target)));
    setGuess('');
    setWait(sit && !timed ? SIT_SECONDS : 0);
    timer.start();
    setPhase('guess');
  };

  const hits = trials.filter(isHit).length;
  const mine = sessions.filter((s) => s.data.kind === 'esp');
  const recent = mine.slice(0, 8).reverse().map((s) => ({ label: s.data.date.slice(8), value: s.data.trials ? s.data.hits / s.data.trials : 0 }));

  return (
    <RitualScreen back="Psychic development">
      <Title eyebrow="Psychic development">Card & colour guessing</Title>
      {phase !== 'setup' && <SoundPill />}

      {phase === 'setup' && (
        <>
          <Body muted>A hidden target is chosen first, then you guess, then it is shown. Each guess is one trial. Expect to land near chance; the point is practice, and an honest record.</Body>
          <View style={ui.gapSmall}>
            <SectionLabel>What to guess</SectionLabel>
            <Chips>
              {ESP_MODES.map((o) => (
                <Chip key={o.id} label={o.label} selected={mode === o.id} onPress={() => setMode(o.id)} />
              ))}
            </Chips>
            <Body muted>{m.detail}</Body>
          </View>
          <View style={ui.gapSmall}>
            <SectionLabel>How many trials</SectionLabel>
            <Chips>
              {RUN_LENGTHS.map((n) => (
                <Chip key={n} label={`${n} trials`} selected={length === n} onPress={() => setLength(n)} />
              ))}
            </Chips>
          </View>
          <Toggle label="Sit with it" detail={`A ${SIT_SECONDS}-second pause before each guess, to settle and notice`} value={sit} onChange={setSit} />
          <Button label="Begin" onPress={begin} />
          <DropIn onStart={begin} />
          <Card>
            <SectionLabel>Your results here</SectionLabel>
            <ResultsLine sessions={sessions} kind="esp" />
            {recent.length > 0 && <Bars items={recent} max={1} a11y="Hit rate of your last runs" />}
          </Card>
        </>
      )}

      {(phase === 'guess' || phase === 'reveal') && (
        <>
          <Body muted>{`Trial ${trials.length + 1} of ${length} · ${m.label}`}</Body>
          {phase === 'guess' && (
            <>
              <Card accent>
                {timed && <CountdownRing state={timer.state} />}
                <Body>{timer.locked ? 'Sit with it. Let an impression arrive.' : wait > 0 ? `Sit with it for ${wait} second${wait === 1 ? '' : 's'}. Let an impression arrive.` : 'The target is chosen and hidden. What comes to you?'}</Body>
              </Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {m.options.map((o) => (
                  <View key={o.id} style={{ flexBasis: m.options.length > 4 ? '30%' : '47%', flexGrow: 1 }}>
                    <Button label={o.label} variant="outline" disabled={wait > 0 || timer.locked} onPress={() => choose(o.id)} />
                  </View>
                ))}
              </View>
            </>
          )}
          {phase === 'reveal' && (
            <>
              <Card accent>
                <Body>{guess === target ? 'A hit.' : 'Not this time.'}</Body>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Body muted>You chose</Body>
                    <Face mode={mode} id={guess} size={72} />
                  </View>
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Body muted>It was</Body>
                    <Face mode={mode} id={target} size={72} />
                  </View>
                </View>
              </Card>
              <Button label={trials.length + 1 >= length ? 'Finish' : 'Next trial'} onPress={next} />
            </>
          )}
          <Button label="Stop without keeping" variant="text" onPress={() => setPhase('setup')} />
        </>
      )}

      {phase === 'done' && (
        <>
          <Card accent>
            <SectionLabel>Run finished</SectionLabel>
            <Body>{`${hits} of ${trials.length} right. Chance alone gives about ${(trials.length * espChance(mode)).toFixed(1)}.`}</Body>
            <Body muted>It is kept in your Journal under Psychic development.</Body>
          </Card>
          <ResultsLine sessions={sessions} kind="esp" />
          <Notice>One run proves nothing either way. Hit rates settle near chance over many trials, and wander a lot in short runs.</Notice>
          <Button label="Another run" onPress={() => setPhase('setup')} />
        </>
      )}
    </RitualScreen>
  );
}
