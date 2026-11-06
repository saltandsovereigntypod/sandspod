import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { PracticeSwitch } from '../../../../components/PracticeSwitch';
import { Body, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { CRAFT_TOOLS, PSYCHIC_TOOLS } from '../../../../lib/craft/practices';
import { CRAFT, CRAFT_TOOLS as CRAFT_TOOLS_TITLE, WORKINGS_LIBRARY, YOUR_CRAFTS } from '../../../../lib/names';
import { myPractices, PRACTICES, type Practice } from '../../../../lib/rituals/premade';
import { useMySettings } from '../../../../lib/settings/store';

// My practice: the Craft home, Practice's third section (Grimoire · Rituals ·
// Craft), and the one place for every practice tool; the tools of your
// chosen crafts are listed here directly, each path's own page kept as its
// detail. The practice tools that aren't ritual work. Your body and the moon, the sky,
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
      <Title eyebrow={CRAFT}>My practice</Title>
      <Body muted>Every tool for your practice in one place: your body and the moon, the sky, the cards and sigils, meditation, hearth and land, and the tools of your own crafts first.</Body>

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
            onPress={go('/rituals/sigil')}
          />
          <Row
            icon="grimoire"
            title="Witch’s alphabets"
            detail="Theban, Malachim, Celestial, Passing the River, runes and ogham, to copy or carve"
            last
            onPress={go('/rituals/craft/eclectic/alphabets')}
          />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Psychic development</SectionLabel>
        <List>
          {PSYCHIC_TOOLS.map((t, i) => (
            <Row key={t.href} icon="wheel" title={t.title} detail={t.detail} last={i === PSYCHIC_TOOLS.length - 1} onPress={go(t.href)} />
          ))}
        </List>
        <List>
          <Row icon="wheel" title="Psychic development hub" detail="Warm-ups, four exercises and an honest record, kept in your Journal" last onPress={go('/rituals/craft/psychic')} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Meditation</SectionLabel>
        <List>
          <Row icon="wheel" title="Meditation" detail="A timer with gentle bells, breath pacing, a log of your sits and their patterns" last onPress={go('/rituals/craft/meditation')} />
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
          chosen.map((p) => (
            <View key={p.id} style={ui.gapSmall}>
              <Body muted>{p.name}</Body>
              <List>
                {CRAFT_TOOLS[p.id].map((t) => (
                  <Row key={t.title} icon="wheel" title={t.title} detail={t.detail} onPress={go(t.href)} />
                ))}
                <Row icon="grimoire" title={`All of ${p.name}`} detail="Its page: what’s happening now, the tools and its workings" last onPress={go(`/rituals/craft/${p.id}`)} />
              </List>
            </View>
          ))
        ) : (
          <Body muted>{`Choose your crafts in Settings → ${YOUR_CRAFTS} to put their tools here, one by one. Every practice’s tools are open to you either way.`}</Body>
        )}
        {chosen.length > 0 && <Body muted>Other practices</Body>}
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
