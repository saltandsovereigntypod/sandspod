import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { LevelSwitch, TermText, useExplainLevel } from '../../../../../components/astro/Explain';
import { useCharts } from '../../../../../components/astro/useCharts';
import { Body, Card, Chip, Chips, List, Notice, RitualScreen, Row, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { parseOrbs } from '../../../../../lib/astro/aspects';
import { HOUSE_SYSTEM_LABEL, type HouseSystem } from '../../../../../lib/astro/houses';
import { bigThreeLine } from '../../../../../lib/astro/natal';
import { patchMySettings, useMySettings } from '../../../../../lib/settings/store';
import { type } from '../../../../../theme';

const SYNC_WORDS: Record<string, string> = {
  device: 'Kept on this device only, encrypted.',
  'signed-out': 'Kept on this device only, encrypted.',
  synced: 'Encrypted and kept with your account under your passphrase.',
  saving: 'Saving to your account…',
  offline: 'Kept here; your account’s copy will catch up when you’re online.',
  unavailable: 'Kept on this device; keeping charts with your account isn’t ready on the server yet.',
};

// Every chart the person keeps (theirs and others'), chart settings, and how they're kept.
export default function Charts() {
  const { astro, charts } = useCharts();
  const { settings } = useMySettings();
  const [level, setLevel] = useExplainLevel();
  const set = (patch: Record<string, string>) => void patchMySettings(patch).catch(() => {});
  const orbs = parseOrbs(settings?.astro_orbs ?? '');

  return (
    <RitualScreen back="Cosmic & celestial">
      <Title eyebrow="Cosmic & celestial">Birth charts</Title>
      <TermText
        style={type.caption}
        text="A birth chart is the sky at the moment you were born: the Sun, Moon and planets in the zodiac, the rising sign and the houses. Tap any underlined word to learn what it means. These are traditional meanings for reflection, not destiny."
      />

      {astro.phase === 'locked' ? (
        <Card accent>
          <SectionLabel>Your charts are locked</SectionLabel>
          <Body>They’re kept with your account under a passphrase. Enter it once on this device to open them.</Body>
          <Button label="Open my charts" onPress={() => router.push('/rituals/craft/cosmic/keep' as Href)} />
        </Card>
      ) : (
        <View style={ui.gapSmall}>
          <SectionLabel>Charts</SectionLabel>
          {charts.length === 0 ? (
            <Card accent>
              <Body>Start with your own: your birth date is enough, and a time and place add your rising sign and houses.</Body>
              <Button label="Add my chart" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/chart-edit', params: { relation: 'me' } } as unknown as Href)} />
            </Card>
          ) : (
            <List>
              {charts.map(({ saved, chart }, i) => (
                <Row
                  key={saved.id}
                  icon="wheel"
                  title={saved.relation === 'me' ? `${saved.name} (you)` : saved.name}
                  detail={chart ? bigThreeLine(chart) : 'Its birth date couldn’t be read'}
                  last={i === charts.length - 1}
                  onPress={() => router.push({ pathname: '/rituals/craft/cosmic/chart', params: { id: saved.id } } as unknown as Href)}
                />
              ))}
            </List>
          )}
          {charts.length > 0 && (
            <View style={ui.actions}>
              <Button label="Add someone’s chart" variant="outline" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/chart-edit', params: { relation: charts.some((c) => c.saved.relation === 'me') ? 'other' : 'me' } } as unknown as Href)} />
              {charts.length > 1 && <Button label="Compare two charts (synastry)" variant="outline" onPress={() => router.push('/rituals/craft/cosmic/synastry' as Href)} />}
            </View>
          )}
        </View>
      )}

      <Card>
        <SectionLabel>How your charts are kept</SectionLabel>
        <Body>{SYNC_WORDS[astro.sync] ?? SYNC_WORDS.device}</Body>
        {!!astro.error && <Notice>{astro.error}</Notice>}
        <Button label="Privacy and syncing" variant="outline" onPress={() => router.push('/rituals/craft/cosmic/keep' as Href)} />
      </Card>

      <Card>
        <SectionLabel>Explanations</SectionLabel>
        <Body muted>Simple gives a sentence or two; Detailed adds the astronomy, history, traditions, the craft and cautions. Each card can be switched on its own too.</Body>
        <LevelSwitch value={level} onChange={setLevel} label="Explanations everywhere" />
      </Card>

      <Card>
        <SectionLabel>How charts are drawn</SectionLabel>
        <TermText style={type.caption} text="House systems: Placidus is the most common; Whole Sign is the oldest; Equal works everywhere." />
        <Chips>
          {(['placidus', 'whole-sign', 'equal'] as HouseSystem[]).map((h) => (
            <Chip key={h} label={HOUSE_SYSTEM_LABEL[h]} selected={(settings?.astro_house_system ?? 'placidus') === h} onPress={() => set({ astro_house_system: h })} />
          ))}
        </Chips>
        <TermText style={type.caption} text="Zodiac: tropical (Western, by the seasons) or sidereal (by the stars, Lahiri ayanamsa)." />
        <Chips>
          <Chip label="Tropical" selected={settings?.astro_zodiac !== 'sidereal'} onPress={() => set({ astro_zodiac: 'tropical' })} />
          <Chip label="Sidereal" selected={settings?.astro_zodiac === 'sidereal'} onPress={() => set({ astro_zodiac: 'sidereal' })} />
        </Chips>
        <TermText style={type.caption} text="The Moon’s nodes: true (osculating) or mean (smoothed)." />
        <Chips>
          <Chip label="True node" selected={settings?.astro_nodes !== 'mean'} onPress={() => set({ astro_nodes: 'true' })} />
          <Chip label="Mean node" selected={settings?.astro_nodes === 'mean'} onPress={() => set({ astro_nodes: 'mean' })} />
        </Chips>
        <Toggle
          label="Show minor aspects"
          detail="Quincunx, semisextile, semisquare, sesquiquadrate, quintile and biquintile"
          value={orbs.minors}
          onChange={(v) => set({ astro_orbs: JSON.stringify({ ...orbs, minors: v }) })}
        />
        <Toggle
          label="Wider orbs"
          detail="Two degrees more on the major aspects (some astrologers prefer them)"
          value={(orbs.orbs.conjunction ?? 8) > 8}
          onChange={(v) =>
            set({ astro_orbs: JSON.stringify({ ...orbs, orbs: v ? { conjunction: 10, opposition: 10, trine: 9, square: 9, sextile: 6 } : {} }) })
          }
        />
      </Card>

      <List>
        <Row icon="wheel" title="Learn astrology" detail="Every term explained, simply or in depth" onPress={() => router.push('/rituals/craft/cosmic/learn' as Href)} />
        <Row icon="calendar" title="Planetary days and hours" detail="The seven planets, their hours where you are, and their guides" last onPress={() => router.push('/rituals/craft/cosmic/hours' as Href)} />
      </List>
    </RitualScreen>
  );
}
