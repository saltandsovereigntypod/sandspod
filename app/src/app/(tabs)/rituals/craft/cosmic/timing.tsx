import { router, useLocalSearchParams, usePathname, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { MoonDisc } from '../../../../../components/MoonDisc';
import { TermChips } from '../../../../../components/astro/Explain';
import { Body, Card, Chip, Chips, Expander, List, RitualScreen, Row, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { myChart, refreshAstro, useAstro } from '../../../../../lib/astro/store';
import { natalChart } from '../../../../../lib/craft/cosmic/chart';
import {
  adviseTiming,
  anyIntent,
  FACTORS,
  keepingFrom,
  LEVEL_LABELS,
  levelOf,
  pointsText,
  scoreWord,
  shapeIntent,
  TIMING_FRAMING,
  TIMING_INTENTS,
  TIMING_SPANS,
  windowPlanFields,
  windowWhen,
  type FactorLevel,
  type FactorLevels,
  type TimingAdvice,
  type TimingWindow,
} from '../../../../../lib/craft/cosmic/timing';
import { usePlace } from '../../../../../lib/location';
import { useRituals } from '../../../../../lib/rituals/store';
import { useMySettings } from '../../../../../lib/settings/store';
import { settingsHref } from '../../../../../lib/settings/links';
import { colors, fonts, radius, type } from '../../../../../theme';

type Params = {
  intent?: string;
  /** A working's own moon ("full,new"), from a premade. */
  moon?: string;
  /** A working's own weekday (0 = Sunday), from a premade. */
  weekday?: string;
  /** What's being timed, for the heading ("Rose quartz love spell"). */
  title?: string;
  days?: string;
  /** Passed on to the planner, so the plan keeps its ritual. */
  planId?: string;
  templateId?: string;
  fromSpell?: string;
};

const LEVELS: FactorLevel[] = [0, 1, 2, 3];

// The spell timing advisor: say what a working is for, and it suggests the
// best times over the next week, month or three months, with a score and
// the reasons for each (lib/craft/cosmic/timing.ts). Its factors can be
// weighed or turned off; your festivals, deities and (when your charts are
// open) your own chart count too. Choosing a time opens the planner with
// it filled in. The website's twin is /practice/cosmic/timing/.
export default function SpellTiming() {
  const params = useLocalSearchParams<Params>();
  const pathname = usePathname();
  const place = usePlace();
  const { settings } = useMySettings();
  const astro = useAstro();
  const rituals = useRituals();
  const editing = params.planId ? (rituals.plans.find((p) => p.id === params.planId) ?? null) : null;

  // What it's for: chosen here, or else from the link or the plan being moved.
  const [chosen, setIntentKey] = useState<string | null | undefined>(undefined);
  const intentKey = chosen !== undefined ? chosen : (anyIntent(params.intent ?? editing?.intentionKey)?.key ?? null);
  const [days, setDays] = useState<number>(() => (TIMING_SPANS as readonly number[]).includes(Number(params.days)) ? Number(params.days) : 30);
  const [levels, setLevels] = useState<FactorLevels>({});
  const [smallHours, setSmallHours] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [result, setResult] = useState<{ inputs: unknown; advice: TimingAdvice | null } | null>(null);

  useEffect(() => {
    void refreshAstro();
  }, []);

  const base = anyIntent(intentKey);
  const intent = useMemo(() => {
    if (!base) return null;
    const moon = params.moon ? params.moon.split(',') : null;
    const weekday = params.weekday != null && params.weekday !== '' ? Number(params.weekday) : null;
    return base.key === anyIntent(params.intent)?.key ? shapeIntent(base, { moon, weekday }) : base;
  }, [base, params.moon, params.weekday, params.intent]);

  const saved = astro.phase === 'open' ? myChart(astro.data) : null;
  const chart = useMemo(() => (saved ? natalChart(saved.input) : null), [saved]);
  const keeping = useMemo(() => keepingFrom(settings, now, days), [settings, now, days]);

  // Working it out takes a moment over three months, so it runs after the screen draws.
  const inputs = useMemo(() => ({ intent, now, days, place, levels, smallHours, keeping, chart }), [intent, now, days, place, levels, smallHours, keeping, chart]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const { intent: i, ...rest } = inputs;
      setResult({ inputs, advice: i ? adviseTiming(i, { ...rest, from: rest.now }) : null });
    }, 30);
    return () => clearTimeout(timer);
  }, [inputs]);
  const advice = intent ? (result?.advice ?? null) : null;
  const working = !!intent && result?.inputs !== inputs;

  const setLevel = (factor: keyof FactorLevels, level: FactorLevel) => setLevels((l) => ({ ...l, [factor]: level }));
  const changed = FACTORS.some((f) => levelOf(levels, f.key) !== 2) || smallHours;

  const plan = (w: TimingWindow) => {
    const { date, time } = windowPlanFields(w, new Date());
    router.push({
      pathname: '/rituals/planner',
      params: {
        date,
        time,
        ...(w.hourPlanet ? { hour: w.hourPlanet } : {}),
        ...(intent?.plannerKey ? { intention: intent.plannerKey } : {}),
        ...(params.planId ? { planId: params.planId } : {}),
        ...(params.templateId ? { templateId: params.templateId } : {}),
        ...(params.fromSpell ? { fromSpell: params.fromSpell } : {}),
      },
    } as unknown as Href);
  };

  const what = params.title || editing?.title || null;
  const festivalsNamed = [...new Set(keeping.festivals.map((f) => f.name))].slice(0, 4);

  return (
    <RitualScreen back="Cosmic & celestial">
      <Title eyebrow="Cosmic & celestial">Find a good time</Title>
      <Body muted>{what ? `For “${what}”: the best times ahead from the moon, the planets, and what you keep.` : 'Say what a working is for, and see the best times ahead from the moon, the planets, and what you keep.'}</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>What is it for?</SectionLabel>
        <Chips>
          {TIMING_INTENTS.map((i) => (
            <Chip key={i.key} label={i.label} selected={intentKey === i.key} onPress={() => setIntentKey(intentKey === i.key ? null : i.key)} />
          ))}
        </Chips>
        {intent && <Body muted>{intent.why}</Body>}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>How far ahead?</SectionLabel>
        <Chips>
          {TIMING_SPANS.map((d) => (
            <Chip key={d} label={d === 7 ? 'The next week' : d === 30 ? 'The next month' : 'The next three months'} selected={days === d} onPress={() => setDays(d)} />
          ))}
        </Chips>
      </View>

      {!place && (
        <Card>
          <Body>Planetary hours run from your sunrise and sunset, so they need your place. Without it, the advisor judges three-hour stretches of each day.</Body>
          <Button label="Add your place" variant="outline" onPress={() => router.push(settingsHref('location', pathname) as Href)} />
        </Card>
      )}

      {!intent && <Body muted>Choose what the working is for to see the best times.</Body>}
      {intent && working && !advice && <Body muted>Working it out…</Body>}

      {intent && advice && (
        <>
          {advice.now && (
            <Card accent={advice.goodEnoughNow}>
              <SectionLabel>{advice.goodEnoughNow ? 'Good enough now' : 'Right now'}</SectionLabel>
              <Text style={type.cardTitle}>{`${scoreWord(advice.now.score)} · ${advice.now.score}`}</Text>
              <Body>{advice.now.why}</Body>
              <Body muted>
                {advice.goodEnoughNow
                  ? 'Now is close to the best in this span. If the need is real, there’s no need to wait.'
                  : advice.windows[0]
                    ? `The best time in this span scores ${advice.windows[0].score}. Now will do if it has to, but waiting gives the working more behind it.`
                    : 'Now will do if it has to.'}
              </Body>
              <Expander title="Why">
                <Parts window={advice.now} />
              </Expander>
            </Card>
          )}

          <View style={ui.gapSmall}>
            <SectionLabel>{`The best times in ${days === 7 ? 'the next week' : days === 30 ? 'the next month' : 'the next three months'}`}</SectionLabel>
            {working && <Body muted>Working it out again…</Body>}
            {advice.windows.length === 0 && <Body muted>Nothing stands out in this span. Try a longer one, or turn a factor down.</Body>}
            {advice.windows.map((w, i) => (
              <WindowCard key={w.start.toISOString()} window={w} now={now} best={i === 0} onPlan={() => plan(w)} planLabel={params.planId ? 'Move the plan to then' : 'Plan it then'} />
            ))}
          </View>
        </>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>What counts</SectionLabel>
        <Body muted>{`${advice?.usedHours ? 'Planetary hours from your place' : levelOf(levels, 'hour') === 0 ? 'Planetary hours turned off' : 'No planetary hours (they need your place)'} · ${chart ? `your chart (${saved?.name || 'yours'})` : 'no birth chart'}${festivalsNamed.length ? ` · ${festivalsNamed.join(', ')}` : ''}${keeping.deities.length ? ` · ${keeping.deities.map((d) => d.name).join(', ')}` : ''}`}</Body>
        {astro.phase === 'locked' && (
          <Card>
            <Body>Your charts are locked on this device. Open them to weigh the sky’s touch on your own chart too (optional).</Body>
            <Button label="Open your charts" variant="outline" onPress={() => router.push('/rituals/craft/cosmic/charts' as Href)} />
          </Card>
        )}
        {astro.phase === 'empty' && <Body muted>Add your birth chart under Astrology to weigh transits to it as well. It is optional.</Body>}
        <Expander title="Weigh the factors">
          <Body muted>Turn a factor up, down or off. Nothing is kept: the next visit starts from the usual weights.</Body>
          {FACTORS.map((f) => (
            <View key={f.key} style={styles.factor}>
              <Text style={type.body}>{f.label}</Text>
              <Text style={type.caption}>{f.detail}</Text>
              <Chips>
                {LEVELS.map((level) => (
                  <Chip key={level} label={LEVEL_LABELS[level]} selected={levelOf(levels, f.key) === level} onPress={() => setLevel(f.key, level)} a11yLabel={`${f.label}: ${LEVEL_LABELS[level]}`} />
                ))}
              </Chips>
            </View>
          ))}
          <Toggle label="Include the small hours" detail="Midnight to six in the morning" value={smallHours} onChange={setSmallHours} />
          {changed && (
            <Button
              label="Back to the usual weights"
              variant="text"
              onPress={() => {
                setLevels({});
                setSmallHours(false);
              }}
            />
          )}
        </Expander>
        <Button label="Look again from now" variant="text" onPress={() => setNow(new Date())} />
      </View>

      <Card>
        <Body muted>{TIMING_FRAMING}</Body>
      </Card>

      <TermChips ids={['moon-phases', 'void-of-course', 'planetary-days', 'planetary-hours', 'retrograde']} />
      <List>
        <Row icon="calendar" title="Planetary hours" detail="This hour, and the hours today" onPress={() => router.push('/rituals/craft/cosmic/hours' as Href)} />
        <Row icon="calendar" title="The ritual planner" detail="Find the night, then the hour" onPress={() => router.push('/rituals/planner' as Href)} />
        <Row icon="today" title="The sky today" detail="Planets, retrogrades, eclipses and your place" onPress={() => router.push('/today/sky' as Href)} />
        <Row
          icon="wheel"
          title="Choosing a time"
          detail="Learn astrology · electional astrology made simple"
          last
          onPress={() => router.push({ pathname: '/rituals/craft/cosmic/lesson', params: { l: 'astro-magic-timing' } } as unknown as Href)}
        />
      </List>
    </RitualScreen>
  );
}

function WindowCard({ window: w, now, best, onPlan, planLabel }: { window: TimingWindow; now: Date; best: boolean; onPlan: () => void; planLabel: string }) {
  return (
    <Card accent={best}>
      <View style={styles.head}>
        <MoonDisc size={36} illumination={w.moon.illumination} waxing={w.moon.waxing} halo={false} />
        <View style={styles.flex}>
          <Text style={styles.when}>{windowWhen(w, now)}</Text>
          <Text style={type.caption}>{`${scoreWord(w.score)} · ${w.score}${best ? ' · the best' : ''}`}</Text>
        </View>
      </View>
      <Body>{w.why}</Body>
      <Expander title="Why">
        <Parts window={w} />
      </Expander>
      <Button label={planLabel} variant="outline" onPress={onPlan} />
    </Card>
  );
}

function Parts({ window: w }: { window: TimingWindow }) {
  return (
    <View style={ui.gapSmall}>
      {w.parts.map((p, i) => (
        <View key={`${p.factor}-${i}`} style={styles.part} accessible accessibilityLabel={`${p.label}, ${pointsText(p.points)}. ${p.note}`}>
          <Text style={[styles.points, p.points < 0 && styles.against]}>{pointsText(p.points)}</Text>
          <View style={styles.flex}>
            <Text style={type.body}>{p.label}</Text>
            <Text style={type.caption}>{p.note}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, gap: 2 },
  when: { fontFamily: fonts.display, fontSize: 19, color: colors.cream },
  factor: { gap: 4, paddingVertical: 6, borderRadius: radius.tile },
  part: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  points: { width: 44, fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
  against: { color: colors.muted },
});
