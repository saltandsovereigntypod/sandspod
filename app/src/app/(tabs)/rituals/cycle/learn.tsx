import { Text, View } from 'react-native';

import { SuggestionCard } from '../../../../components/cycle/ui';
import { Body, Card, Expander, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import {
  ARCHETYPE_NOTE,
  ARCHETYPES,
  FOLK_NOTES,
  FRAMEWORK_NOTE,
  MOON_ONLY_NOTE,
  NOT_MEDICAL,
  PATTERN_INFO,
  PATTERN_NOTE,
  SEASON_INFO,
  suggestionFor,
} from '../../../../lib/cycle/content';
import { QUARTER_NAMES, SEASONS } from '../../../../lib/cycle/model';
import { useCycle } from '../../../../lib/cycle/store';
import type { MoonPattern, MoonQuarter } from '../../../../lib/cycle/types';
import { type } from '../../../../theme';

const QUARTERS: MoonQuarter[] = ['dark', 'waxing', 'full', 'waning'];
const PATTERNS: MoonPattern[] = ['white', 'pink', 'red', 'purple'];

// The inner seasons (with what suits each and prompts), the archetype lens
// when chosen, the four moon patterns as the folk framework they are, and
// moon-time folk notes.
export default function CycleLearn() {
  const cycle = useCycle();
  const archetypes = !!cycle.data?.settings.archetypes;
  return (
    <RitualScreen back="Cycle & Moon">
      <Title eyebrow="Cycle & Moon">Inner seasons and moon patterns</Title>
      <Body muted>{FRAMEWORK_NOTE}</Body>

      <SectionLabel>The inner seasons</SectionLabel>
      {SEASONS.map((s) => {
        const info = SEASON_INFO[s];
        return (
          <Card key={s}>
            <Text style={type.cardTitle}>{info.title}</Text>
            <Text style={[type.caption, ui.gold]}>{info.when}</Text>
            <Body>{info.feel}</Body>
            <Body>{info.practice}</Body>
            {archetypes && <Body muted>{`${ARCHETYPES[s].name}, or ${ARCHETYPES[s].plain}: ${ARCHETYPES[s].line}`}</Body>}
            <Expander title="Journaling prompts">
              {info.prompts.map((p) => (
                <Body key={p}>{`•  ${p}`}</Body>
              ))}
            </Expander>
            <Expander title="Practice under each moon">
              <View style={ui.gap}>
                {QUARTERS.map((q) => (
                  <SuggestionCard key={q} eyebrow={QUARTER_NAMES[q]} suggestion={suggestionFor(s, q)} />
                ))}
              </View>
            </Expander>
          </Card>
        );
      })}
      {archetypes && <Notice>{ARCHETYPE_NOTE}</Notice>}
      <Card>
        <Text style={type.cardTitle}>Following the moon alone</Text>
        <Body>{MOON_ONLY_NOTE}</Body>
      </Card>

      <SectionLabel>The four moon patterns</SectionLabel>
      <Body muted>{PATTERN_NOTE}</Body>
      {PATTERNS.map((p) => (
        <Card key={p}>
          <Text style={type.cardTitle}>{PATTERN_INFO[p].name}</Text>
          <Text style={[type.caption, ui.gold]}>{PATTERN_INFO[p].when}</Text>
          <Body>{PATTERN_INFO[p].line}</Body>
        </Card>
      ))}

      <SectionLabel>Moon time and moon blood</SectionLabel>
      {FOLK_NOTES.map((n) => (
        <Card key={n.title}>
          <Text style={type.cardTitle}>{n.title}</Text>
          <Body>{n.body}</Body>
        </Card>
      ))}
      <Notice>{NOT_MEDICAL}</Notice>
    </RitualScreen>
  );
}
