import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { ProgramPlayer } from '../../../../../components/meditation/ProgramPlayer';
import { Body, Card, Chip, Chips, Expander, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { planetaryHours } from '../../../../../lib/astro/hours';
import { removeEntry, useCraft } from '../../../../../lib/craft/store';
import { ritualsLibraryHref } from '../../../../../lib/library';
import { usePlace } from '../../../../../lib/location';
import { carrierLabel, compile, CUSTOM_COLLECTION, customProgram, deityProgramId, patronChoice, planetNow, PROGRAM_HONESTY, programById, resolveProgram, type CustomProgram, type Opts } from '../../../../../lib/meditation/programs';
import { programVoiceAt, programVoiceLengths } from '../../../../../lib/meditation/voice';
import { programVoice } from '../../../../../lib/meditation/voiceTracks';
import { setSitAlarm } from '../../../../../lib/reminders/notifier';
import { myDeities } from '../../../../../lib/patron/mine';
import { useMySettings } from '../../../../../lib/settings/store';

// One binaural program (lib/meditation/programs.ts): what it is for, how to
// use it, its length and carrier, the options it offers (the breathing pacer
// for any of them), and the player. The planetary hour and your patron are
// worked out from the moment and from My deities. Opened from the list, the
// moon and sabbat kits, the ritual builder and the Psychic drop-in.
export default function ProgramScreen() {
  const { id = '', minutes: askedMinutes } = useLocalSearchParams<{ id?: string; minutes?: string }>();
  const custom = useCraft<CustomProgram>(CUSTOM_COLLECTION);
  const place = usePlace();
  const { settings } = useMySettings();
  const entry = id.startsWith('custom:') ? custom.entries.find((e) => `custom:${e.id}` === id) : null;
  const base = entry ? customProgram(entry.data, id) : programById(id);

  const planet = useMemo(() => (place ? planetNow(planetaryHours(new Date(), place), new Date()) : null), [place]);
  const deity = useMemo(() => patronChoice(myDeities(settings)).deity, [settings]);
  const program = useMemo(() => (base ? resolveProgram(base, { planet, deity }) : null), [base, planet, deity]);

  const [minutes, setMinutes] = useState<number | null>(null);
  const [opts, setOpts] = useState<Opts>({});
  const [wbtbHours, setWbtbHours] = useState<number | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [captions, setCaptions] = useState(true);
  // Cues Ashley has recorded: offered at the lengths they fit.
  const track = program ? programVoice(program.id) : null;
  const voiceLengths = useMemo(() => (track && program ? programVoiceLengths(track, program) : []), [track, program]);
  const voiced = !!track && voiceOn && voiceLengths.length > 0;
  const lengths = voiced ? voiceLengths : (program?.lengths ?? []);
  const wanted = minutes ?? (askedMinutes && program?.lengths.includes(Number(askedMinutes)) ? Number(askedMinutes) : program?.length ?? 10);
  const len = lengths.length && !lengths.includes(wanted) ? lengths.reduce((a, b) => (Math.abs(b - wanted) < Math.abs(a - wanted) ? b : a)) : wanted;
  const compiled = useMemo(() => (program ? compile(program, len, opts) : null), [program, len, opts]);
  const voice = useMemo(() => (voiced && track && program ? programVoiceAt(track, program, len) : null), [voiced, track, program, len]);

  // The wake-back-to-bed alarm: a notification some hours from now, cleared when you leave.
  useEffect(() => {
    if (!wbtbHours) {
      void setSitAlarm(null);
      return;
    }
    void setSitAlarm({ at: new Date(Date.now() + wbtbHours * 3_600_000), title: 'Wake, and write down your dream', body: 'Recall what you can, set your intention, and go back to sleep.' });
  }, [wbtbHours]);

  if (!program || !compiled) {
    return (
      <RitualScreen back="Programs">
        <Title>Program</Title>
        <Body muted>{id.startsWith('custom:') && !custom.ready ? 'Opening…' : 'That program is not here.'}</Body>
      </RitualScreen>
    );
  }
  const d = program.deity;
  const patronId = deityProgramId(deity);

  return (
    <RitualScreen back="Programs">
      <Title eyebrow="Binaural program">{program.title}</Title>
      <Body>{program.line}</Body>

      <ProgramPlayer compiled={compiled} voice={voice} captions={captions} />

      <View style={ui.gapSmall}>
        <SectionLabel>Length</SectionLabel>
        <Chips>
          {lengths.map((m) => (
            <Chip key={m} label={`${m} min`} selected={len === m} onPress={() => setMinutes(m)} />
          ))}
        </Chips>
        {!!track && voiceLengths.length > 0 && (
          <>
            <Toggle label="Guided by voice" detail="The cues read aloud by Ashley, each on its moment; the sound dips a little while she speaks." value={voiceOn} onChange={setVoiceOn} />
            {voiceOn && <Toggle label="Show the words as well" value={captions} onChange={setCaptions} />}
            {voiceOn && voiceLengths.length < program.lengths.length && <Body muted>Read aloud, it comes in these lengths. Turn the voice off for the others.</Body>}
          </>
        )}
        {program.deep && <Body muted>It always ends with a return to waking, however long you choose.</Body>}
        {program.carriers.length > 1 && (
          <>
            <SectionLabel>Carrier tone</SectionLabel>
            <Chips>
              {program.carriers.slice(0, 5).map((cid) => (
                <Chip key={cid} label={carrierLabel(cid)} selected={compiled.carrier === cid} onPress={() => setOpts((o) => ({ ...o, carrier: cid }))} />
              ))}
            </Chips>
          </>
        )}
        <Toggle label="Breathing pacer" detail="A circle on screen to breathe with, six breaths a minute." value={compiled.breath} onChange={(breath) => setOpts((o) => ({ ...o, breath }))} />
        {program.alt && <Toggle label={program.alt.label} detail={`Hold ${program.alt.hold} Hz instead of ${program.hold} Hz.`} value={!!opts.schumann} onChange={(schumann) => setOpts((o) => ({ ...o, schumann }))} />}
        {program.forks && <Toggle label="4096 Hz fork strikes" detail="A very bright fork, struck three times (quietly)." value={!!opts.forks} onChange={(forks) => setOpts((o) => ({ ...o, forks }))} />}
        {program.drumOption && <Toggle label="Journey drum" detail="A frame drum at 4.5 beats a second, with the callback near the end." value={!!opts.drum} onChange={(drum) => setOpts((o) => ({ ...o, drum }))} />}
        {program.wbtb && (
          <>
            <Toggle label="Wake-back-to-bed alarm" detail="Wakes you in a few hours so you can recall a dream and return to sleep with intent." value={!!wbtbHours} onChange={(on) => setWbtbHours(on ? 5 : null)} />
            {!!wbtbHours && (
              <Chips>
                {[4, 5, 6].map((h) => (
                  <Chip key={h} label={`In ${h} hours`} selected={wbtbHours === h} onPress={() => setWbtbHours(h)} />
                ))}
              </Chips>
            )}
          </>
        )}
      </View>

      {d && (
        <Card>
          <SectionLabel>{program.group === 'devotional' ? `Devotion: ${d.name}` : 'About'}</SectionLabel>
          <Body>{d.framing}</Body>
          <Body muted>{`Offering ideas: ${d.offering}`}</Body>
          {d.key ? <Button label={`Read about ${d.name} in the Library`} variant="text" onPress={() => router.push(ritualsLibraryHref({ id: `traditional:deity:${d.key}` }) as Href)} /> : null}
        </Card>
      )}
      {program.id === 'patron' && !deity && <Notice>Add a deity under Settings, My practice, My deities, and this tunes itself to them.</Notice>}
      {program.id === 'planetary-hour' && <Notice>{planet ? `Right now it is the hour of ${planet}.` : 'Set your place in Craft, Timing to follow the current hour; until then it uses the Sun.'}</Notice>}
      {program.id === 'patron' && patronId && <Button label={`Open the ${deity?.name} program`} variant="outline" onPress={() => router.replace({ pathname: '/rituals/craft/meditation/program', params: { id: patronId } } as Href)} />}

      <Expander title="How to use it" initiallyOpen>
        <Body>{program.how}</Body>
      </Expander>
      <Expander title="Stages">
        {compiled.segments.map((s) => (
          <Body key={s.id} muted>{`${s.label}: ${Math.round(s.startMs / 6000) / 10} to ${Math.round(s.endMs / 6000) / 10} min, ${s.beat[0]} to ${s.beat[s.beat.length - 1]} Hz`}</Body>
        ))}
      </Expander>
      <Expander title="About the evidence">
        <Body muted>{PROGRAM_HONESTY}</Body>
      </Expander>

      {entry && (
        <View style={ui.actions}>
          <Button label="Edit" variant="outline" onPress={() => router.push({ pathname: '/rituals/craft/meditation/program-build', params: { id: entry.id } } as Href)} />
          <Button label="Delete" variant="outline" onPress={() => void removeEntry(CUSTOM_COLLECTION, entry.id).then(() => router.back())} />
        </View>
      )}
    </RitualScreen>
  );
}
