import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { PracticeSwitch } from '../../../../components/PracticeSwitch';
import { Body, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { CRAFT_TOOLS } from '../../../../lib/craft/practices';
import { CRAFT, CRAFT_TOOLS as CRAFT_TOOLS_TITLE, WORKINGS_LIBRARY, YOUR_CRAFTS } from '../../../../lib/names';
import { myPractices, PRACTICES, type Practice } from '../../../../lib/rituals/premade';
import { useMySettings } from '../../../../lib/settings/store';

// The Craft home, Practice's third section (Grimoire · Rituals · Craft): the
// practice tools that aren't ritual work. Your body and the moon, the sky,
// divination and the sigil maker, then a page of tools for each kind of
// practice, yours first. It keeps the old Craft tools address
// (/rituals/craft), and its tools keep theirs (/rituals/cycle,
// /rituals/divination, /rituals/sigil, /rituals/craft/…), so every link
// still opens. The website's /practice/ (practice/hub.js) is grouped the same
// way. Dedication journeys stay on the Rituals home; Craft points to them.
export default function CraftHome() {
  const { settings } = useMySettings();
  const mine = myPractices(settings);
  const chosen = PRACTICES.filter((p) => mine.includes(p.id));
  const others = PRACTICES.filter((p) => !mine.includes(p.id));
  const go = (href: string) => () => router.push(href as Href);

  const row = (p: Practice, i: number, all: Practice[]) => (
    <Row
      key={p.id}
      icon="wheel"
      title={p.name}
      detail={CRAFT_TOOLS[p.id].map((t) => t.title).join(' · ')}
      last={i === all.length - 1}
      onPress={go(`/rituals/craft/${p.id}`)}
    />
  );

  return (
    <RitualScreen>
      <PracticeSwitch current="craft" />
      <Title eyebrow="Tools for your practice">{CRAFT}</Title>
      <Body muted>The tools that aren’t rituals: your body and the moon, the sky, the cards, and a page of tools for each kind of craft.</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>Body & moon</SectionLabel>
        <List>
          <Row
            icon="today"
            title="Cycle & Moon"
            detail="Your cycle beside the moon, or the moon alone · private and encrypted"
            last
            onPress={go('/rituals/cycle')}
          />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>The sky</SectionLabel>
        <List>
          <Row
            icon="wheel"
            title="Astrology"
            detail="Your birth chart, today’s transits and planetary hours · private and encrypted"
            onPress={go('/rituals/craft/cosmic')}
          />
          <Row icon="calendar" title="Planetary hours" detail="The planet ruling this hour and day, and what each is good for" onPress={go('/rituals/craft/cosmic/hours')} />
          <Row
            icon="calendar"
            title="Find a good time"
            detail="The spell timing advisor: the best times ahead for a working, and why"
            onPress={go('/rituals/craft/cosmic/timing')}
          />
          <Row
            icon="wheel"
            title="Learn astrology"
            detail="Every planet, sign, house and aspect explained · simply or in depth"
            last
            onPress={go('/rituals/craft/cosmic/learn')}
          />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Divination & sigils</SectionLabel>
        <List>
          <Row
            icon="wheel"
            title="Divination"
            detail="Draw cards, runes or ogham · your readings, decks and card meanings"
            onPress={go('/rituals/divination')}
          />
          <Row
            icon="wheel"
            title="Draw cards, runes or ogham"
            detail="A card for the day, the Celtic Cross and many more spreads, or one of your own"
            onPress={go('/rituals/divination/draw')}
          />
          <Row
            icon="grimoire"
            title="Card meanings"
            detail="Tarot, runes, ogham, Lenormand and Kipper, as in your Grimoire"
            onPress={go('/rituals/divination/meanings')}
          />
          <Row
            icon="altar"
            title="Sigil maker"
            detail="An intent made into one mark, from its letters or a planetary square"
            last
            onPress={go('/rituals/sigil')}
          />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Hearth & land</SectionLabel>
        <List>
          <Row icon="wheel" title="Land journal" detail="Your places through the year: frosts, birdsong, blooms, water, offerings · this time last year" onPress={go('/rituals/craft/hearth/land')} />
          <Row icon="wheel" title="Foraging & garden" detail="What grows where, what to gather this month, and your harvests · safety first" onPress={go('/rituals/craft/hearth/forage')} />
          <Row icon="rituals" title="Kitchen witchery" detail="Recipes with intent, festival foods and offerings, kept in your Grimoire" last onPress={go('/rituals/craft/hearth/recipes')} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`${CRAFT_TOOLS_TITLE} by path`}</SectionLabel>
        {chosen.length ? (
          <>
            <Body muted>{YOUR_CRAFTS}</Body>
            <List>{chosen.map(row)}</List>
            <Body muted>Other practices</Body>
          </>
        ) : (
          <Body muted>{`Choose your crafts in Settings → ${YOUR_CRAFTS} to put their tools first. Every practice’s tools are open to you either way.`}</Body>
        )}
        <List>{others.map(row)}</List>
        <List>
          <Row icon="grimoire" title="Choose your crafts" detail={`Settings → ${YOUR_CRAFTS}`} last onPress={go('/rituals/settings/practice')} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Elsewhere in Practice</SectionLabel>
        <List>
          <Row
            icon="wheel"
            title="Dedication journeys"
            detail="On Rituals · study, practice and a rite of self-dedication to a path or a god"
            onPress={go('/rituals/journeys')}
          />
          <Row
            icon="grimoire"
            title={WORKINGS_LIBRARY}
            detail="On Rituals · premade rituals and spells for every practice, yours first"
            onPress={go('/rituals/premade')}
          />
          <Row icon="grimoire" title="Your dreams" detail="In your Grimoire · your dream journal and a dictionary of symbols" last onPress={go('/grimoire/dreams')} />
        </List>
      </View>
    </RitualScreen>
  );
}
