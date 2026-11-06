import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { go } from '../../../../../components/craft/BathParts';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { BATH_HOME, BATH_LOG, BATH_OWN, GROUPS, mixHref, normalizeMix, shelfMatch } from '../../../../../lib/craft/bath/bath';
import { BATH_MIXES, type BathMix } from '../../../../../lib/craft/bath/mixes';
import { bathSafety } from '../../../../../lib/craft/bath/safety';
import { SPELL_INTENTS } from '../../../../../lib/rituals/spellcraft/suggest';
import { useCraft } from '../../../../../lib/craft/store';
import { useShelves } from '../../../../../lib/shelves/store';

// Bath & body: spiritual and comfort baths. Thirty premade mixes by intention,
// moon and season, your own mixes, what you have on your shelves, and a log
// that goes into the one Journal. The website's twin is /practice/hearth/.
export default function BathHome() {
  const [group, setGroup] = useState<BathMix['group'] | 'all'>('all');
  const [intent, setIntent] = useState<string | null>(null);
  const { entries: shelves } = useShelves();
  const mine = useCraft<unknown>(BATH_OWN).entries;
  const logged = useCraft<unknown>(BATH_LOG).entries.length;
  const own = useMemo(() => mine.map((e) => normalizeMix(e.data, e.id)).filter((m): m is BathMix => !!m), [mine]);
  const shown = BATH_MIXES.filter((m) => (group === 'all' || m.group === group) && (!intent || m.intent === intent));
  const line = (m: BathMix) => {
    const s = shelfMatch(m, shelves);
    const flags = bathSafety(m.ingredients).filter((n) => n.group !== 'stone' && n.group !== 'allergy').length;
    return [m.intention.replace(/\.$/, ''), shelves.length ? `You have ${s.have.length} of ${s.total}` : null, flags ? 'has safety notes' : null].filter(Boolean).join(' · ');
  };

  return (
    <RitualScreen back="Kitchen witchery">
      <Title eyebrow="Craft">Bath & body</Title>
      <Body muted>
        Bath-magic as it is practised today: salts, herbs, flowers and a few words, to cleanse, protect, comfort or mark the turn of the moon and year. Every mix lists what is in it, when it suits, what to say, and what to do with the water afterwards. Cautions
        for skin, pregnancy, children and stones are worked out from each ingredient, so they always show. A comfort practice, not a treatment.
      </Body>

      <List>
        <Row icon="grimoire" title="Build your own" detail="Choose an intention, and the Library suggests herbs, stones and amounts" onPress={go(`${BATH_HOME}/build`)} />
        <Row icon="calendar" title="Log a bath" detail={logged ? `${logged} kept in your Journal` : 'How it felt and what you noticed, kept in your Journal'} onPress={go(`${BATH_HOME}/log`)} />
        <Row icon="altar" title="My Shelves" detail="What you have, and what is running low" last onPress={go('/altar?tab=shelves')} />
      </List>

      {own.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>My mixes</SectionLabel>
          <List>
            {own.map((m, i) => (
              <Row key={m.id} icon="rituals" title={m.title} detail={line(m)} last={i === own.length - 1} onPress={go(mixHref(m.id))} />
            ))}
          </List>
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>{`The mixes · ${BATH_MIXES.length}`}</SectionLabel>
        <Chips>
          {GROUPS.map((g) => (
            <Chip key={g.value} label={g.label} selected={group === g.value} onPress={() => setGroup(g.value)} />
          ))}
        </Chips>
        <Chips>
          <Chip label="Any intention" selected={!intent} onPress={() => setIntent(null)} />
          {SPELL_INTENTS.filter((i) => BATH_MIXES.some((m) => m.intent === i.key)).map((i) => (
            <Chip key={i.key} label={i.label} selected={intent === i.key} onPress={() => setIntent(intent === i.key ? null : i.key)} />
          ))}
        </Chips>
        {shown.length === 0 ? (
          <Card>
            <Body>Nothing matches both. Clear one of the filters.</Body>
          </Card>
        ) : (
          <List>
            {shown.map((m, i) => (
              <Row key={m.id} icon="rituals" title={m.title} detail={line(m)} last={i === shown.length - 1} onPress={go(mixHref(m.id))} />
            ))}
          </List>
        )}
      </View>

      <List>
        <Row icon="calendar" title="Find a good time" detail="The spell timing advisor: moon, day and planetary hour" onPress={go('/rituals/craft/cosmic/timing?title=Bath')} />
        <Row icon="wheel" title="Correspondence finder" detail="Look up herbs, stones and colours, then build a bath from them" onPress={go('/rituals/finder')} />
        <Row icon="altar" title="Stone care" detail="Which stones are safe in water, sun and salt" onPress={go('/rituals/craft/crystal/care')} />
        <Row icon="rituals" title="How bath mixes work" detail="Preparing, timing, safety and what to do afterwards" last onPress={go('/more/help')} />
      </List>
      <Button label="Back to Kitchen witchery" variant="text" onPress={go('/rituals/craft/hearth')} />
    </RitualScreen>
  );
}
