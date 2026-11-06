import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { CLOSED_TRADITIONS } from '../../../../../lib/library/closed';
import { CUSTOM_COLLECTION, cleanCustom, customMinutes, GROUPS, openPrograms, patronChoice, PROGRAM_HONESTY, programById, PROGRAMS, programMeta, programsIn, type CustomProgram } from '../../../../../lib/meditation/programs';
import { myDeities } from '../../../../../lib/patron/mine';
import { useCraft } from '../../../../../lib/craft/store';
import { useMySettings } from '../../../../../lib/settings/store';

// Binaural programs (lib/meditation/programs.ts): sessions whose beat and
// carrier change over time, grouped Everyday / Craft & spirit / Devotional,
// plus the ones you have built yourself. Played on /program.
const open = (pathname: string, params?: Record<string, string>) => () => router.push({ pathname, params } as Href);
const PLAY = '/rituals/craft/meditation/program';

export default function Programs() {
  const { settings } = useMySettings();
  const mine = useCraft<CustomProgram>(CUSTOM_COLLECTION);
  const list = openPrograms(PROGRAMS, CLOSED_TRADITIONS.map((t) => t.id));
  const patron = patronChoice(myDeities(settings));
  const patronProgram = programById(patron.programId)!;

  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">Binaural programs</Title>
      <Body muted>Sessions that change as they go: a beat that eases down, holds and brings you back, over a carrier tone, a bed of sound and a few words on screen. Headphones needed.</Body>
      <Body muted>{PROGRAM_HONESTY}</Body>

      {patron.deity && (
        <View style={ui.gapSmall}>
          <SectionLabel>For your deity</SectionLabel>
          <List>
            <Row icon="rituals" title={`${patron.deity.name}`} detail={patronProgram.id === 'patron' ? 'A devotional sit tuned to your deity’s planet and element' : programMeta(patronProgram)} last onPress={open(PLAY, { id: patron.programId })} />
          </List>
        </View>
      )}

      {GROUPS.map((g) => (
        <View key={g.id} style={ui.gapSmall}>
          <SectionLabel>{g.label}</SectionLabel>
          <Body muted>{g.line}</Body>
          <List>
            {programsIn(g.id, list).map((p, i, all) => (
              <Row key={p.id} icon="rituals" title={p.title} detail={`${p.line} ${programMeta(p)}`} last={i === all.length - 1} onPress={open(PLAY, { id: p.id })} />
            ))}
          </List>
        </View>
      ))}

      <View style={ui.gapSmall}>
        <SectionLabel>Your own</SectionLabel>
        {mine.entries.length > 0 && (
          <List>
            {mine.entries.map((e, i) => {
              const s = cleanCustom(e.data);
              return <Row key={e.id} icon="rituals" title={s.title} detail={`${customMinutes(s)} min · ${s.start} to ${s.hold} Hz`} last={i === mine.entries.length - 1} onPress={open(PLAY, { id: `custom:${e.id}` })} />;
            })}
          </List>
        )}
        <Button label="Build your own program" variant="outline" onPress={open('/rituals/craft/meditation/program-build')} />
      </View>
    </RitualScreen>
  );
}
