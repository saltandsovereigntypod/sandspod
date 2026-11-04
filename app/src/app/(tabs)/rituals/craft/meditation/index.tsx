import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { useDayContext } from '../../../../../components/craft/hearth';
import { beginSit } from '../../../../../components/meditation/begin';
import { PlanForm, useLastPlan } from '../../../../../components/meditation/PlanForm';
import { useSigils } from '../../../../../components/meditation/SitGuide';
import { lastListenMix, SoundForm, useLastMix } from '../../../../../components/meditation/SoundForm';
import { Body, Card, Chip, Chips, Expander, Field, List, RitualScreen, Row, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { useCraft } from '../../../../../lib/craft/store';
import { NO_EXTRAS, type SitExtras } from '../../../../../lib/meditation/extras';
import { FOCUSES } from '../../../../../lib/meditation/focus';
import { kindLabel, MOOD_WORDS, normalizeSit, SIT_KINDS, sitLine, SITS } from '../../../../../lib/meditation/log';
import { minutesWords, sitStats } from '../../../../../lib/meditation/patterns';
import { suggestionsFor, yearFestivals, type Suggestion } from '../../../../../lib/meditation/programmes';
import { PRESETS, presetParams, SCRIPTS } from '../../../../../lib/meditation/scripts';
import { mixLine, mixOn } from '../../../../../lib/meditation/sound';
import { planLine } from '../../../../../lib/meditation/timer';
import { useMySettings } from '../../../../../lib/settings/store';
import { myDeities } from '../../../../../lib/patron/mine';
import { localDateKey } from '../../../../../lib/rituals/lifecycle';

// Meditation (Craft → Meditation): choose a sit (its length and bells, what
// you bring to it, guidance, something to look at and sound) and begin;
// presets for before a ritual; suggestions for today; Listen (sound on its
// own), breath pacing, the
// mala, walking, programmes; log a sit, your sits, and their patterns. Sits
// are craft entries (meditation.sits). Website: /practice/meditation/.
const MEDITATION = '/rituals/craft/meditation';

export default function MeditationHome() {
  const [plan, setPlan] = useLastPlan();
  const [mix, setMix] = useLastMix();
  const [extras, setExtras] = useState<SitExtras>(NO_EXTRAS);
  const [withSound, setWithSound] = useState(false);
  const { entries, ready } = useCraft<unknown>(SITS);
  const sigils = useSigils();
  const { settings } = useMySettings();
  const { choice } = useDayContext();
  const sits = useMemo(() => entries.map((e) => ({ id: e.id, data: normalizeSit(e.data) })).sort((a, b) => b.data.at.localeCompare(a.data.at)), [entries]);
  const stats = useMemo(() => sitStats(sits, new Date()), [sits]);
  const suggestions = useMemo(() => {
    const now = new Date();
    const today = yearFestivals(now, choice).filter((f) => f.date === localDateKey(now));
    return suggestionsFor(now, today, myDeities(settings));
  }, [choice, settings]);
  const go = (href: string) => () => router.push(href as Href);
  const set = (patch: Partial<SitExtras>) => setExtras({ ...extras, ...patch });
  const chosen: SitExtras = { ...extras, sound: withSound && mixOn(mix) ? mix : null };
  const suggest = (s: Suggestion) => () => beginSit(plan, { ...chosen, kind: s.kind, script: s.script, intention: s.intention ?? chosen.intention, programme: s.programme ?? '', step: s.step ?? '' });

  return (
    <RitualScreen back="Craft">
      <Title eyebrow="Craft">Meditation</Title>
      <Body muted>A timer with gentle bells, guidance, sound and something to rest your eyes on, breath pacing, a mala, and a log of your sits: how you felt and what came up. Private to you, and kept with your account when you’re signed in.</Body>

      {sits.length > 0 && (
        <Card>
          <Body>{[stats.streak.current > 1 ? `${stats.streak.current} days in a row` : null, `${minutesWords(stats.minutes.week)} this week`, `${minutesWords(stats.minutes.month)} this month`].filter(Boolean).join(' · ')}</Body>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Sit</SectionLabel>
        <Card>
          <PlanForm plan={plan} onChange={setPlan} />
          <Expander title="What you bring to it">
            <Field label="An intention (optional)" value={extras.intention} onChange={(intention) => set({ intention })} />
            <Body muted>How you feel now</Body>
            <Chips>
              {[1, 2, 3, 4, 5].map((n) => (
                <Chip key={n} label={String(n)} a11yLabel={`${n}, ${MOOD_WORDS[n]}`} selected={extras.before === n} onPress={() => set({ before: extras.before === n ? null : n })} />
              ))}
            </Chips>
            <Body muted>{extras.before ? MOOD_WORDS[extras.before] : '1 low, 5 bright. You’ll be asked again afterwards.'}</Body>
            <Body muted>The kind of practice</Body>
            <Chips>
              {SIT_KINDS.filter((k) => k.value !== 'other').map((k) => (
                <Chip key={k.value} label={k.label} selected={extras.kind === k.value} onPress={() => set({ kind: extras.kind === k.value ? null : k.value })} />
              ))}
            </Chips>
            {extras.kind === 'walking' && <Body muted>On a phone with a step counter, your steps are counted as you walk.</Body>}
          </Expander>
          <Expander title="Guidance on screen">
            <Body muted>One line at a time, paced to the length of your sit.</Body>
            <Chips>
              <Chip label="None" selected={!extras.script} onPress={() => set({ script: null })} />
              {SCRIPTS.map((s) => (
                <Chip key={s.id} label={s.title} selected={extras.script === s.id} onPress={() => set({ script: s.id })} />
              ))}
            </Chips>
            {extras.script && <Body muted>{SCRIPTS.find((s) => s.id === extras.script)!.source}</Body>}
          </Expander>
          <Expander title="Something to look at">
            <Chips>
              {FOCUSES.map((f) => (
                <Chip key={f.value} label={f.label} selected={extras.focus === f.value} onPress={() => set({ focus: f.value })} />
              ))}
            </Chips>
            <Body muted>{FOCUSES.find((f) => f.value === extras.focus)!.line}</Body>
            {extras.focus === 'sigil' &&
              (sigils.length ? (
                <Chips>
                  {sigils.map((s) => (
                    <Chip key={s.id} label={s.name} selected={(extras.sigil || sigils[0].id) === s.id} onPress={() => set({ sigil: s.id })} />
                  ))}
                </Chips>
              ) : (
                <Body muted>You haven’t saved a sigil yet. Make one in Craft → Sigils.</Body>
              ))}
          </Expander>
          <Expander title="Sound">
            <Toggle label="Play sound with the sit" detail={withSound && mixOn(mix) ? mixLine(mix) : 'Layers you mix yourself, faded in and out, stopping with the timer.'} value={withSound} onChange={setWithSound} />
            {withSound && <Button label="Use my last Listen mix" variant="text" onPress={() => void lastListenMix().then((m) => m && setMix(m))} />}
            {withSound && <SoundForm mix={mix} onChange={setMix} />}
          </Expander>
          <Body muted>{[planLine(plan), chosen.sound ? mixLine(chosen.sound) : ''].filter(Boolean).join(' · ')}</Body>
          <Button label="Begin" onPress={() => beginSit(plan, chosen)} />
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Before a ritual</SectionLabel>
        <List>
          {PRESETS.map((p, i) => (
            <Row key={p.id} icon="rituals" title={p.label} detail={p.line} last={i === PRESETS.length - 1} onPress={() => router.push({ pathname: '/rituals/craft/meditation/sit', params: presetParams(p.id) })} />
          ))}
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>For today</SectionLabel>
        <List>
          {suggestions.map((s, i) => (
            <Row key={s.title} icon={s.programme ? 'calendar' : s.kind === 'devotional' ? 'altar' : 'wheel'} title={s.title} detail={s.line} last={i === suggestions.length - 1} onPress={suggest(s)} />
          ))}
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>More ways in</SectionLabel>
        <List>
          <Row icon="wheel" title="Listen" detail="Binaural beats, noise, rain, fire, a drone, drum or bowls on their own, with a stop timer" onPress={go(`${MEDITATION}/listen`)} />
          <Row icon="wheel" title="Breath pacing" detail="A circle, wave or square path to breathe with: box breathing, 4-7-8 or your own count" onPress={go(`${MEDITATION}/breath`)} />
          <Row icon="rituals" title="Mala and mantra" detail="Count beads with a tap: 27, 54 or 108, and keep the mantra in your log" onPress={go(`${MEDITATION}/mala`)} />
          <Row icon="today" title="Walking meditation" detail="A timed walk, with your steps counted where the phone can" onPress={() => beginSit(plan, { ...chosen, kind: 'walking' })} />
          <Row icon="calendar" title="Programmes" detail="7 days of grounding, a 28-day moon cycle, and Sabbat sits" onPress={go(`${MEDITATION}/programmes`)} />
          <Row icon="rituals" title="Log a sit" detail="One you sat without the timer" onPress={go(`${MEDITATION}/log`)} />
          <Row icon="altar" title="Meditate at your altar" detail="Open an altar, then Workings → Meditate here" onPress={go('/altar')} />
          <Row icon="today" title="Sit together" detail="With your coven or friends: everyone’s timer starts at once, with a shared drum or bowls if you like" onPress={go('/rituals/together?sit=1')} />
          <Row icon="today" title="Public sits" detail="Group sits anyone can join, in Community: schedule one, or join one coming up" onPress={go('/rituals/community?tab=sits')} />
          <Row icon="calendar" title="A daily reminder to sit" detail="In Reminders, under Daily practice" last onPress={go('/rituals/reminders?section=practice')} />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Your sits</SectionLabel>
        {!ready ? (
          <Body muted>Opening…</Body>
        ) : sits.length === 0 ? (
          <Body muted>None yet. When you finish a sit, you can note how it went here.</Body>
        ) : (
          <List>
            {sits.slice(0, 30).map((s, i) => (
              <Row key={s.id} icon="today" title={kindLabel(s.data)} detail={`${sitLine(s.data)}${s.data.settled ? ` · settled ${s.data.settled} of 5` : ''}`} last={i === Math.min(sits.length, 30) - 1} onPress={go(`${MEDITATION}/log?id=${s.id}`)} />
            ))}
          </List>
        )}
        {sits.length > 0 && (
          <List>
            <Row icon="wheel" title="Your patterns" detail="Streaks, minutes, before and after, the kinds you come back to, and the moon, weekday and time of day" last onPress={go(`${MEDITATION}/patterns`)} />
          </List>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Elsewhere</SectionLabel>
        <List>
          <Row icon="today" title="To tend" detail="Turn on “Count my meditations” on a thing of your own, and each sit marks it done" onPress={go('/today/tend')} />
          <Row icon="grimoire" title="Your Grimoire" detail="Sits you keep there are under Meditation" onPress={go('/grimoire')} />
          <Row icon="wheel" title="Sigils" detail="Make a sigil to gaze on as you sit" onPress={go('/rituals/craft/eclectic/sigil')} />
          <Row icon="wheel" title="Cycle & Moon" detail="The moon tonight" last onPress={go('/rituals/cycle')} />
        </List>
      </View>
    </RitualScreen>
  );
}
