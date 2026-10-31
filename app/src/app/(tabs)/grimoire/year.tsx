import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Bars } from '../../../components/charts/Bars';
import { Progress } from '../../../components/cycle/ui';
import { Body, Card, Chip, Chips, Expander, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../components/rituals/ui';
import { useAltars } from '../../../lib/altar/store';
import { COURSE_COLLECTION, normalizeCourseProgress, pickProgress, type CourseProgress } from '../../../lib/astro/course/progress';
import { COURSE_TITLE } from '../../../lib/grimoire/yearReview';
import { fullDate } from '../../../lib/calendar';
import { hemisphereOf } from '../../../lib/calendars';
import { copyText } from '../../../lib/copyText';
import { DREAMS, normalizeDream } from '../../../lib/craft/hedge/dreams';
import { normalizeReading, READINGS } from '../../../lib/craft/hedge/readings';
import { useCraft } from '../../../lib/craft/store';
import { useCycle } from '../../../lib/cycle/store';
import { divinationReadingRoute } from '../../../lib/divination/links';
import { DREAM_ROUTES } from '../../../lib/grimoire/dreams';
import { useGrimoire } from '../../../lib/grimoire/store';
import {
  altarRecords,
  astroCourse,
  covenRecords,
  reflectionPrompts,
  shareCard,
  shareText,
  yearLines,
  yearPage,
  yearPageRef,
  yearReview,
  type CourseInput,
  type Dated,
} from '../../../lib/grimoire/yearReview';
import { nextSpan, previousSpan, YEAR_START_KEY, YEAR_STARTS, yearSpanAt, yearStartChoice, type YearSpan } from '../../../lib/grimoire/yearSpan';
import { hasHolyPage } from '../../../lib/holy';
import { holidayChoice } from '../../../lib/holidays';
import { JOURNEY_CATALOG } from '../../../lib/journeys/catalog';
import { useJourneyProgress } from '../../../lib/journeys/store';
import { usePlace } from '../../../lib/location';
import { dateFromKey } from '../../../lib/rituals/lifecycle';
import { useRituals } from '../../../lib/rituals/store';
import { useMySettings } from '../../../lib/settings/store';
import { supabase } from '../../../lib/supabase';
import { colors, fonts, radius, type } from '../../../theme';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const shortDay = (key: string) => fullDate(key.slice(0, 10))?.replace(/, \d{4}$/, '') ?? key.slice(0, 10);

/** Coven gatherings you were at and your coven programs, from the database (your own rows only). */
function useCovenYear(userId: string | null): { gatherings: Dated[]; courses: CourseInput[] } {
  const [found, setFound] = useState<{ gatherings: Dated[]; courses: CourseInput[] }>({ gatherings: [], courses: [] });
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      const [attendance, enrollments, progress] = await Promise.all([
        supabase.from('coven_ritual_attendance').select('ritual_id,present,joined_at').eq('user_id', userId),
        supabase.from('coven_program_enrollments').select('id,program_id,started_at,completed_at,status').eq('user_id', userId),
        supabase.from('coven_program_progress').select('enrollment_id,submitted_at,checked_at,updated_at').eq('user_id', userId),
      ]);
      const ritualIds = (attendance.data ?? []).map((a) => a.ritual_id);
      const programIds = [...new Set((enrollments.data ?? []).map((e) => e.program_id))];
      const [rituals, programs] = await Promise.all([
        ritualIds.length ? supabase.from('coven_rituals').select('id,coven_id,title,scheduled_for,ended_at').in('id', ritualIds) : Promise.resolve({ data: [] }),
        programIds.length ? supabase.from('coven_programs').select('id,title').in('id', programIds) : Promise.resolve({ data: [] }),
      ]);
      const covenIds = [...new Set((rituals.data ?? []).map((r: { coven_id: string }) => r.coven_id))];
      const covens = covenIds.length ? await supabase.from('covens').select('id,name').in('id', covenIds) : { data: [] };
      if (!alive) return;
      setFound(
        covenRecords({
          attendance: attendance.data ?? [],
          rituals: rituals.data ?? [],
          covens: covens.data ?? [],
          enrollments: enrollments.data ?? [],
          programs: programs.data ?? [],
          progress: progress.data ?? [],
        }),
      );
    })().catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [userId]);
  return found;
}

/**
 * Your year in review, from the Grimoire (and Today, around your year's turn):
 * the year of your practice by your own new year (lib/grimoire/yearReview.ts).
 * Private: only you see it. The website has the same page at /grimoire/year/.
 */
export default function YearInReview() {
  const params = useLocalSearchParams<{ start?: string }>();
  const { settings, save, signedIn } = useMySettings();
  const place = usePlace();
  const now = useMemo(() => new Date(), []);
  const s = settings as Record<string, unknown> | null;
  const startKey = `${s?.[YEAR_START_KEY] ?? ''}|${s?.calendar_count_by ?? ''}|${s?.calendar_opt_moon_yearStart ?? ''}|${s?.calendar_hemisphere ?? ''}`;
  const [at, setAt] = useState<Date>(() => dateFromKey(params.start) ?? now);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- startKey stands in for the settings the year reads
  const span: YearSpan = useMemo(() => yearSpanAt(at, s, place), [at, startKey, place]);

  const rituals = useRituals();
  const { entries: readingRows } = useCraft<unknown>(READINGS);
  const { entries: dreamRows } = useCraft<unknown>(DREAMS);
  const { entries: courseRows } = useCraft<CourseProgress>(COURSE_COLLECTION);
  const { entries: journeyRows } = useJourneyProgress();
  const { snapshot, actions } = useGrimoire();
  const { altars } = useAltars();
  const cycle = useCycle();
  const coven = useCovenYear(rituals.userId);
  const [notice, setNotice] = useState<string | null>(null);

  const review = useMemo(() => {
    const fromAltars = altarRecords(altars, now);
    const course = pickProgress(courseRows);
    const astro = astroCourse(course ? normalizeCourseProgress(course.data) : null, COURSE_TITLE);
    return yearReview(
      {
        journal: rituals.journal,
        plans: rituals.plans,
        readings: readingRows.map((e) => ({ ...e, data: normalizeReading(e.data) })),
        dreams: dreamRows.map((e) => ({ ...e, data: normalizeDream(e.data) })),
        pages: snapshot?.pages ?? [],
        holidayChoice: holidayChoice(s),
        offerings: fromAltars.offerings,
        gatherings: coven.gatherings,
        altarChanges: fromAltars.changes,
        journeys: journeyRows.map((e) => ({ id: e.data.journeyId, title: JOURNEY_CATALOG.find((j) => j.id === e.data.journeyId)?.title ?? 'A journey', progress: e.data })),
        courses: [...(astro ? [astro] : []), ...coven.courses],
        cycle: cycle.phase === 'open' ? cycle.data : null,
        south: hemisphereOf(s, place) === 'south',
      },
      span,
      now,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startKey stands in for the settings it reads
  }, [altars, courseRows, rituals.journal, rituals.plans, readingRows, dreamRows, snapshot, coven, journeyRows, cycle.phase, cycle.data, span, startKey, now]);

  const lines = yearLines(review);
  const prompts = reflectionPrompts(review);
  const card = shareCard(review);
  const kept = snapshot?.pages.find((p) => (p.metadata as Record<string, unknown> | null)?.holyRef === yearPageRef(span)) ?? null;

  const writePage = () => {
    if (kept) return router.push({ pathname: '/grimoire/[pageId]', params: { pageId: kept.id } });
    const id = actions.saveHolyPage(yearPage(review, prompts));
    if (id) router.push({ pathname: '/grimoire/[pageId]', params: { pageId: id } });
    else setNotice('Your Grimoire couldn’t be opened just now. Try again in a moment.');
  };
  const share = async () => {
    const text = shareText(review);
    if (Platform.OS !== 'web') {
      try {
        await Share.share({ message: text });
        return;
      } catch {
        /* fall back to copying */
      }
    }
    setNotice((await copyText(text)) ? 'Copied. Paste it wherever you like.' : 'It couldn’t be copied here.');
  };

  const r = review;
  return (
    <RitualScreen back="Grimoire">
      <Title eyebrow={r.span.label}>Your year in review</Title>
      <Body muted>{`${r.span.range}${r.ongoing ? ', still going' : ''}. Only you see this.`}</Body>
      <View style={styles.nav}>
        <Button label="‹ The year before" variant="outline" onPress={() => setAt(previousSpan(span, s, place).start)} />
        {!r.ongoing ? <Button label="The year after ›" variant="outline" onPress={() => setAt(nextSpan(span, s, place).start)} /> : null}
      </View>

      {r.empty ? (
        <Card>
          <Body>Nothing kept in this year yet. As you journal rituals, draw cards, write down dreams and tend your altar, your year gathers here.</Body>
        </Card>
      ) : (
        lines.length > 0 && (
          <Card accent>
            {lines.map((line) => (
              <Text key={line} style={styles.line}>
                {line}
              </Text>
            ))}
          </Card>
        )
      )}

      {(r.rituals.done > 0 || r.plans.planned > 0) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Rituals</SectionLabel>
          <Card>
            <Body>{`${plural(r.rituals.done, 'ritual', 'rituals')} journaled · ${plural(r.plans.planned, 'working', 'workings')} planned${r.plans.ahead ? `, ${r.plans.ahead} still ahead` : ''}`}</Body>
            {r.rituals.done > 0 && <Bars unit={['ritual', 'rituals']} rows={r.rituals.byMonth.map((m) => ({ key: m.key, label: m.label, count: m.count }))} />}
            {r.rituals.themes.length > 0 && (
              <Chips>
                {r.rituals.themes.map((t) => (
                  <Chip key={t.label} label={`${t.label} · ${t.count}`} />
                ))}
              </Chips>
            )}
            <Row icon="grimoire" title="Your ritual journal" onPress={() => router.push('/rituals/journal' as Href)} />
            <Row icon="today" title="Your moon" detail="Which moons you work under, and what works for you" onPress={() => router.push('/rituals/journal/insights' as Href)} />
            <Row icon="calendar" title="Plan a working" last onPress={() => router.push('/rituals/planner' as Href)} />
          </Card>
        </View>
      )}

      {(r.workings.lookedBack > 0 || r.workings.waiting > 0) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Did it work?</SectionLabel>
          <Card>
            <Bars
              unit={['working', 'workings']}
              rows={[
                { key: 'yes', label: 'It worked', count: r.workings.worked },
                { key: 'partly', label: 'Partly', count: r.workings.partly },
                { key: 'not_yet', label: 'Not yet', count: r.workings.notYet },
                { key: 'no', label: 'It didn’t', count: r.workings.no },
              ]}
            />
            {r.workings.waiting > 0 && <Body muted>{`${plural(r.workings.waiting, 'working is', 'workings are')} still waiting for you to look back.`}</Body>}
            {r.workings.boreOut.slice(0, 6).map((w, i, list) => (
              <Row key={w.id} icon="rituals" title={w.title} detail={w.outcome === 'yes' ? 'It worked' : 'Partly'} last={i === list.length - 1} onPress={() => router.push({ pathname: '/rituals/journal/[id]', params: { id: w.id } })} />
            ))}
          </Card>
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Moons and holidays</SectionLabel>
        <Card>
          {r.moons.full > 0 && <Progress done={r.moons.fullKept / r.moons.full} label={`Full moons met: ${r.moons.fullKept} of ${r.moons.full}`} />}
          {r.moons.new > 0 && <Progress done={r.moons.newKept / r.moons.new} label={`New moons met: ${r.moons.newKept} of ${r.moons.new}`} />}
          <Expander title="The full moons">
            <Chips>
              {r.moons.list
                .filter((m) => m.kind === 'full')
                .map((m) => (
                  <Chip
                    key={m.date}
                    label={`${m.name}, ${shortDay(m.date)}${m.kept ? ' · kept' : ''}`}
                    a11yLabel={`${m.name}, ${shortDay(m.date)}${m.kept ? ', kept' : ''}. Opens the full moon’s page`}
                    onPress={() => router.push({ pathname: '/today/holy/[ref]', params: { ref: 'moon-full' } })}
                  />
                ))}
            </Chips>
          </Expander>
          {r.holidays.list.length > 0 && (
            <>
              <Progress done={r.holidays.total ? r.holidays.kept / r.holidays.total : 0} label={`Holidays kept: ${r.holidays.kept} of ${r.holidays.total} so far`} />
              <Expander title="Your holidays this year">
                <List>
                  {r.holidays.list.map((h, i, list) => (
                    <Row
                      key={h.id}
                      icon="samhain"
                      title={h.name}
                      detail={[shortDay(h.date), h.kept ? 'kept' : h.planned ? 'planned' : h.past ? null : 'ahead'].filter(Boolean).join(' · ')}
                      last={i === list.length - 1}
                      onPress={() => (hasHolyPage(h.id) ? router.push({ pathname: '/today/holy/[ref]', params: { ref: h.ref } }) : router.push('/today/calendar' as Href))}
                    />
                  ))}
                </List>
              </Expander>
            </>
          )}
          <Body muted>A moon or holiday counts as met when a ritual, a reading or an offering falls on it, or the day either side.</Body>
        </Card>
      </View>

      {r.readings.count > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Cards drawn most</SectionLabel>
          <Card>
            <Body>{`${plural(r.readings.count, 'reading', 'readings')}, ${plural(r.readings.draws, 'card, rune or stave', 'cards, runes and staves')} drawn.`}</Body>
            <Bars
              wideLabel
              unit={['time', 'times']}
              rows={r.readings.top.map((c) => ({ key: c.name, label: c.name, count: c.count, detail: c.title, onPress: c.ref ? () => router.push(divinationReadingRoute(c.ref!, c.deck) as Href) : undefined }))}
            />
            <Row icon="calendar" title="Your divination patterns" detail="Suits, moons, days, and the cards you haven’t met" last onPress={() => router.push('/rituals/divination/patterns' as Href)} />
          </Card>
        </View>
      )}

      {(r.pages.made > 0 || r.dreams.count > 0) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Grimoire and dreams</SectionLabel>
          <Card>
            {r.pages.made > 0 && <Body>{`${plural(r.pages.made, 'new page', 'new pages')}: ${r.pages.titles.slice(0, 5).map((p) => p.title).join(', ')}${r.pages.made > 5 ? ', …' : ''}`}</Body>}
            {r.dreams.count > 0 && (
              <Body>{`${plural(r.dreams.count, 'dream', 'dreams')} written down${r.dreams.lucid ? `, ${r.dreams.lucid} lucid` : ''}${r.dreams.recurring ? `, ${r.dreams.recurring} recurring` : ''}.`}</Body>
            )}
            {r.dreams.symbols.length > 0 && (
              <Chips>
                {r.dreams.symbols.map((d) => (
                  <Chip key={d.symbol} label={`${d.symbol} · ${d.count}`} onPress={() => router.push(DREAM_ROUTES.patterns as Href)} />
                ))}
              </Chips>
            )}
            {r.dreams.count > 0 && <Row icon="today" title="Your dreams and their symbols" last onPress={() => router.push(DREAM_ROUTES.patterns as Href)} />}
          </Card>
        </View>
      )}

      {r.cycle && r.cycle.bleeds > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Cycle & Moon</SectionLabel>
          <Card>
            <Body>{`${plural(r.cycle.bleeds, 'bleed', 'bleeds')} began this year${r.cycle.averageLength ? `, about ${r.cycle.averageLength} days apart` : ''}${r.cycle.notedDays ? `; ${plural(r.cycle.notedDays, 'day', 'days')} with notes` : ''}.`}</Body>
            <Body muted>Private to you, read on this device only, and never on the shareable card.</Body>
            <Row icon="today" title="Cycle & Moon" last onPress={() => router.push('/rituals/cycle/history' as Href)} />
          </Card>
        </View>
      )}
      {cycle.phase === 'locked' && <Body muted>Cycle & Moon is locked on this device, so it isn’t included. Open it to see it here; it stays private.</Body>}

      {(r.journeys.length > 0 || r.courses.length > 0) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Journeys and courses</SectionLabel>
          <List>
            {r.journeys.map((j) => (
              <Row
                key={j.id}
                icon="wheel"
                title={j.title}
                detail={[j.started ? 'begun' : null, j.dedicated ? 'dedicated' : null, j.stages ? plural(j.stages, 'stage finished', 'stages finished') : null, j.lessons ? plural(j.lessons, 'lesson', 'lessons') : null, j.practices ? plural(j.practices, 'practice', 'practices') : null]
                  .filter(Boolean)
                  .join(' · ')}
                onPress={() => router.push({ pathname: '/rituals/journeys/[id]', params: { id: j.id } })}
              />
            ))}
            {r.courses.map((c, i) => (
              <Row
                key={c.id}
                icon="grimoire"
                title={c.title}
                detail={[c.started ? 'begun' : null, c.completed ? 'completed' : null, c.steps ? `${c.steps}${c.total ? ` of ${c.total}` : ''} steps this year` : null].filter(Boolean).join(' · ')}
                last={i === r.courses.length - 1}
                onPress={() => router.push((c.id === 'astro-course' ? '/rituals/craft/cosmic/course' : '/coven') as Href)}
              />
            ))}
          </List>
        </View>
      )}

      {(r.offerings.count > 0 || r.gatherings.count > 0 || r.altar.count > 0) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Altar, offerings and coven</SectionLabel>
          <Card>
            {r.offerings.count > 0 && <Body>{`${plural(r.offerings.count, 'offering', 'offerings')}${r.offerings.to.length ? `, most to ${r.offerings.to.map((o) => o.label).slice(0, 3).join(', ')}` : ''}.`}</Body>}
            {r.altar.count > 0 && <Body>{`${plural(r.altar.count, 'change', 'changes')} at your altars.`}</Body>}
            {r.gatherings.count > 0 && (
              <Expander title={plural(r.gatherings.count, 'coven gathering', 'coven gatherings')}>
                {r.gatherings.list.map((g) => (
                  <Body key={`${g.id}-${g.at}`}>{`${shortDay(g.at)}: ${g.label}${g.detail ? `, ${g.detail}` : ''}`}</Body>
                ))}
              </Expander>
            )}
            <Row icon="altar" title="Your altars" onPress={() => router.navigate('/altar' as Href)} />
            <Row icon="coven" title="Your covens" last onPress={() => router.navigate('/coven' as Href)} />
          </Card>
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Reflect</SectionLabel>
        <Card>
          {prompts.map((p) => (
            <Text key={p} style={styles.prompt}>
              {p}
            </Text>
          ))}
          {signedIn ? (
            <Button label={kept ? 'Open your year-end page' : 'Write a year-end page in my Grimoire'} accessibilityHint="A page with these questions and room to answer, under Year in review" onPress={writePage} />
          ) : (
            <Body muted>Sign in to keep a year-end page in your Grimoire.</Body>
          )}
        </Card>
      </View>

      {card.lines.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>A card to share</SectionLabel>
          <View style={styles.share} accessible accessibilityLabel={`${card.title}. ${card.lines.join(', ')}`}>
            <Text style={styles.shareTitle}>{card.title}</Text>
            {card.lines.map((l) => (
              <Text key={l} style={styles.shareLine}>
                {l}
              </Text>
            ))}
            <Text style={[type.caption, styles.shareMark]}>Salt & Sovereignty</Text>
          </View>
          <Body muted>Counts only: no questions, cards, dreams, workings, names or Cycle & Moon. Nothing is shared unless you choose to.</Body>
          <Button label={Platform.OS === 'web' ? 'Copy the card’s words' : 'Share the card'} variant="outline" onPress={() => void share()} />
        </View>
      )}
      {!!notice && <Notice>{notice}</Notice>}

      <View style={ui.gapSmall}>
        <SectionLabel>Where your year begins</SectionLabel>
        <Chips>
          {YEAR_STARTS.map((o) => (
            <Chip
              key={o.id}
              label={o.label}
              hint={o.detail}
              selected={yearStartChoice(s) === o.id}
              onPress={() => {
                if (settings) void save({ ...settings, [YEAR_START_KEY]: o.id });
                setAt(now);
              }}
            />
          ))}
        </Chips>
        <Row icon="calendar" title="Your calendars" detail="Counting by the moon, and where the moon’s year begins" last onPress={() => router.push('/today/calendar' as Href)} />
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  line: { ...type.body, color: colors.cream },
  prompt: { ...type.body, fontFamily: fonts.displayItalic, fontSize: 18, color: colors.cream },
  share: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.goldLine, padding: 20, gap: 6, alignItems: 'center' },
  shareTitle: { ...type.cardTitle, textAlign: 'center', color: colors.gold },
  shareLine: { ...type.body, textAlign: 'center' },
  shareMark: { marginTop: 6 },
});
