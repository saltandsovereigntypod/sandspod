import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { STONE_CARE } from '../../../../../lib/craft/crystal/care';
import { SETTINGS, STONES } from '../../../../../lib/craft/crystal/collections';
import { cleanseStatus, normaliseRule, normaliseStone, type CrystalSettings, type Stone } from '../../../../../lib/craft/crystal/stones';
import { CRAFT_TOOLS } from '../../../../../lib/craft/practices';
import { useCraft } from '../../../../../lib/craft/store';
import { moonState, nextPhase } from '../../../../../lib/moon';
import { relativeDay } from '../../../../../lib/calendar';
import { PRACTICES } from '../../../../../lib/rituals/premade';
import { type } from '../../../../../theme';

const ROUTES = ['/rituals/craft/crystal/stones', '/rituals/craft/crystal/care'];

// Crystal practice: your stones and their care, and which stones can take water, sun and salt.
export default function CrystalPractice() {
  const about = PRACTICES.find((p) => p.id === 'crystal')?.about;
  const tools = CRAFT_TOOLS.crystal;
  const { entries } = useCraft<Stone>(STONES);
  const { entries: settings } = useCraft<CrystalSettings>(SETTINGS);
  const rule = normaliseRule(settings[0]?.data?.cleanse);
  const now = new Date();
  const due = entries.filter((e) => cleanseStatus(normaliseStone(e.data), rule, now).due).length;
  const moon = moonState(now);
  const full = nextPhase(now, 'full');

  const details = [
    entries.length ? `${entries.length} ${entries.length === 1 ? 'stone' : 'stones'}${due ? ` · ${due} due for cleansing` : ' · all cleansed'}` : null,
    `${STONE_CARE.length} stones: water, sun, salt and handling`,
  ];

  return (
    <RitualScreen back="My practice">
      <Title eyebrow="My practice">Crystal</Title>
      {!!about && <Body muted>{about}</Body>}

      <Card accent>
        <SectionLabel>The moon for your stones</SectionLabel>
        <Text style={type.cardTitle}>{moon.name === 'Full Moon' ? 'Full moon: a night for charging' : `Full moon ${relativeDay(now, full)}`}</Text>
        <Body muted>
          {moon.name === 'Full Moon'
            ? 'Set your stones out on a windowsill or outside tonight. Bring sun-fading ones in before morning.'
            : moon.waxing
              ? 'The moon is waxing: a time to programme stones for what you’re drawing in.'
              : 'The moon is waning: a time to cleanse stones and let go of what they’ve held.'}
        </Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Tools</SectionLabel>
        <List>
          {tools.map((tool, i) => (
            <Row
              key={tool.title}
              icon={i === 0 ? 'altar' : 'grimoire'}
              title={tool.title}
              detail={details[i] ?? tool.detail}
              last={i === tools.length - 1}
              onPress={() => router.push(ROUTES[i] as Href)}
            />
          ))}
        </List>
      </View>

      <List>
        <Row icon="rituals" title="Crystal workings" detail="Premade rituals and spells; filter by Crystal" last onPress={() => router.push('/rituals/premade' as Href)} />
      </List>
    </RitualScreen>
  );
}
