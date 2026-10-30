import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { ChartWheel, type WheelTap } from '../../../../../components/astro/ChartWheel';
import { ExplainCard, openTerm, Term, TermChips, TermText } from '../../../../../components/astro/Explain';
import { AspectDetail, HouseDetail, PositionDetail } from '../../../../../components/astro/PointDetail';
import { useCharts } from '../../../../../components/astro/useCharts';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { aspectDef, PATTERN_LABEL, type AspectHit } from '../../../../../lib/astro/aspects';
import { deitiesForChart, natalAltarPlanet, personalAllies, transitLineFor } from '../../../../../lib/astro/craftLinks';
import { progressionsFor, retrogradePeriods, retroPhaseAt, returnChart, transitHouses, transitsTo } from '../../../../../lib/astro/forecast';
import { termIdFor } from '../../../../../lib/astro/glossary';
import { composeReading, ordinalHouse, progressedPieces, readingProgress, returnPieces, type ReadingPiece } from '../../../../../lib/astro/interpret/compose';
import { bigThreeLine, formatDegree, positionOf, type Chart, type Position } from '../../../../../lib/astro/natal';
import { POINT_GLYPH, type ChartPointName } from '../../../../../lib/astro/signs';
import { shortDate, timeOfDay } from '../../../../../lib/calendar';
import { parseDate } from '../../../../../lib/craft/cosmic/chart';
import { nextHourOnItsDay } from '../../../../../lib/craft/cosmic/hours';
import { JOURNEY_CATALOG } from '../../../../../lib/journeys/catalog';
import { findByName } from '../../../../../lib/library/model';
import { libraryHref } from '../../../../../lib/library';
import { useLibrary } from '../../../../../lib/library/store';
import { usePlace } from '../../../../../lib/location';
import { offsetLabel } from '../../../../../lib/astro/birth';
import { colors, fonts, radius, type } from '../../../../../theme';

type Tab = 'wheel' | 'placements' | 'aspects' | 'balance' | 'reading' | 'transits' | 'returns' | 'progressions' | 'craft';
const TABS: { key: Tab; label: string }[] = [
  { key: 'wheel', label: 'Wheel' },
  { key: 'placements', label: 'Placements' },
  { key: 'aspects', label: 'Aspects' },
  { key: 'balance', label: 'Balance' },
  { key: 'reading', label: 'Read in full' },
  { key: 'transits', label: 'Transits' },
  { key: 'returns', label: 'Returns' },
  { key: 'progressions', label: 'Progressions' },
  { key: 'craft', label: 'In your craft' },
];

const NOTE_TEXT: Record<string, string> = {
  'no-time': 'No birth time: the planets are for local noon, so the Moon may be a few degrees out. There is no rising sign and no houses.',
  'no-place': 'No birthplace: there is no rising sign and no houses.',
  'polar-fallback': 'Born inside the polar circle, where Placidus houses can’t be drawn: Porphyry houses are shown instead.',
  'outside-range': 'The planet tables are tuned for 1800 to 2050, so positions for this date are rougher.',
  'chiron-range': 'Chiron’s table covers 1800 to 2100, so it isn’t shown for this date.',
  sidereal: 'Sidereal zodiac (Lahiri): the signs are measured from the stars, about 24° behind the tropical ones.',
};

// One chart: the wheel, its placements, aspects and balance, the reading in
// full, and what moves against it (transits, returns, progressions), with
// where it meets the craft.
export default function ChartScreen() {
  const params = useLocalSearchParams<{ id?: string; tab?: string }>();
  const { astro, charts, mine } = useCharts();
  const cast = params.id ? charts.find((c) => c.saved.id === params.id) ?? null : mine;
  const [tab, setTab] = useState<Tab>((TABS.find((t) => t.key === params.tab)?.key as Tab) ?? 'wheel');
  const [solar, setSolar] = useState(false);
  const { charts: solarCharts } = useCharts({ solarChart: true });
  const chart = solar && cast ? (solarCharts.find((c) => c.saved.id === cast.saved.id)?.chart ?? cast.chart) : (cast?.chart ?? null);

  if (astro.phase === 'loading') {
    return (
      <RitualScreen back="Charts">
        <Title eyebrow="Charts">Chart</Title>
      </RitualScreen>
    );
  }
  if (!cast || !chart) {
    return (
      <RitualScreen back="Charts">
        <Title eyebrow="Cosmic & celestial">My chart</Title>
        <Card accent>
          <Text style={type.cardTitle}>Your sun, moon and rising</Text>
          <TermText
            style={type.body}
            text="Add your birth date to see where the Sun, Moon and planets stood when you arrived. With a birth time and place you’ll see your rising sign, houses and Midheaven too, and each day which planets are touching them."
          />
          {astro.phase === 'locked' ? (
            <Button label="Open my charts" onPress={() => router.push('/rituals/craft/cosmic/keep' as Href)} />
          ) : (
            <Button label="Add my birth details" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/chart-edit', params: { relation: 'me' } } as unknown as Href)} />
          )}
        </Card>
        <Button label="All charts" variant="outline" onPress={() => router.push('/rituals/craft/cosmic/charts' as Href)} />
      </RitualScreen>
    );
  }

  const { saved } = cast;
  return (
    <RitualScreen back="Charts">
      <Title eyebrow={saved.relation === 'me' ? 'Your chart' : 'A chart'}>{saved.name}</Title>
      <Body muted>{bigThreeLine(chart)}</Body>
      <Chips>
        {TABS.map((t) => (
          <Chip key={t.key} label={t.label} selected={tab === t.key} onPress={() => setTab(t.key)} />
        ))}
      </Chips>
      {chart.notes.map((n) => (
        <Notice key={n}>{NOTE_TEXT[n]}</Notice>
      ))}
      {!chart.timeKnown && (
        <Chips>
          <Chip label={solar ? 'Solar chart houses: on' : 'Show solar chart houses'} selected={solar} onPress={() => setSolar(!solar)} />
          <Chip label="What is a solar chart?" onPress={() => openTerm('houses')} />
        </Chips>
      )}

      {tab === 'wheel' && <WheelTab chart={chart} />}
      {tab === 'placements' && <Placements chart={chart} />}
      {tab === 'aspects' && <Aspects chart={chart} />}
      {tab === 'balance' && <Balance chart={chart} />}
      {tab === 'reading' && <Reading chart={chart} />}
      {tab === 'transits' && <Transits chart={chart} />}
      {tab === 'returns' && <Returns chart={chart} />}
      {tab === 'progressions' && <Progressions chart={chart} />}
      {tab === 'craft' && <Craft chart={chart} />}

      <Card>
        <SectionLabel>Birth details</SectionLabel>
        <Body>{[saved.input.date, chart.timeKnown ? saved.input.time : 'time unknown', `${offsetLabel(saved.input.utcOffsetMinutes)}${saved.input.offsetOverridden ? ' (set by hand)' : saved.input.zone ? ` (${saved.input.zone})` : ''}`].join(' · ')}</Body>
        <Body muted>{saved.input.placeLabel ?? 'No birthplace'}</Body>
        <Body muted>{`${chart.options.zodiac === 'sidereal' ? 'Sidereal (Lahiri)' : 'Tropical'} zodiac · ${chart.houses ? `${chart.houses.system === 'whole-sign' ? 'Whole Sign' : chart.houses.system[0].toUpperCase() + chart.houses.system.slice(1)} houses` : 'no houses'} · ${chart.options.nodes} node`}</Body>
        <Button label="Edit birth details" variant="outline" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/chart-edit', params: { id: saved.id } } as unknown as Href)} />
        <Button label="All charts and settings" variant="text" onPress={() => router.push('/rituals/craft/cosmic/charts' as Href)} />
      </Card>
    </RitualScreen>
  );
}

function useWheelSize() {
  const { width } = useWindowDimensions();
  return Math.min(width - 40, 460);
}

type Picked = { kind: 'point'; position: Position } | { kind: 'house'; house: number } | { kind: 'aspect'; aspect: AspectHit; transit?: boolean } | null;

function Detail({ picked, chart }: { picked: Picked; chart: Chart }) {
  if (!picked) return null;
  if (picked.kind === 'point') return <PositionDetail position={picked.position} chart={chart} />;
  if (picked.kind === 'house') return <HouseDetail house={picked.house} chart={chart} />;
  return <AspectDetail aspect={picked.aspect} transit={picked.transit} />;
}

function WheelTab({ chart }: { chart: Chart }) {
  const size = useWheelSize();
  const [picked, setPicked] = useState<Picked>(null);
  const onTap = (t: WheelTap) => {
    if (t.kind === 'sign') return openTerm(termIdFor(t.sign));
    if (t.kind === 'point') return setPicked({ kind: 'point', position: t.position });
    if (t.kind === 'house') return setPicked({ kind: 'house', house: t.house });
    setPicked({ kind: 'aspect', aspect: t.aspect });
  };
  return (
    <View style={ui.gap}>
      <View style={styles.centre}>
        <ChartWheel chart={chart} size={size} onTap={onTap} />
      </View>
      <TermText style={type.caption} text="Tap a planet, a house number, a sign or an aspect line. The Ascendant is on the left; the houses run counter-clockwise from it. Blue lines are trines and sextiles, red are squares and oppositions, gold are conjunctions." />
      {picked ? <Detail picked={picked} chart={chart} /> : <BigThree chart={chart} onPick={(p) => setPicked({ kind: 'point', position: p })} />}
    </View>
  );
}

function BigThree({ chart, onPick }: { chart: Chart; onPick: (p: Position) => void }) {
  const items = (['Sun', 'Moon', 'Ascendant'] as ChartPointName[]).map((n) => positionOf(chart, n)).filter((p): p is Position => !!p);
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Your big three</SectionLabel>
      {items.map((p) => (
        <Pressable key={p.point} accessibilityRole="button" onPress={() => onPick(p)} style={styles.row}>
          <Text style={styles.glyph}>{POINT_GLYPH[p.point]}</Text>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{p.point === 'Ascendant' ? `${p.sign} rising` : `${p.point} in ${p.sign}`}</Text>
            <Text style={type.caption}>{formatDegree(p)}{p.house ? ` · ${ordinalHouse(p.house)}` : ''}{p.orSign ? ` · or ${p.orSign}, depending on the time` : ''}</Text>
          </View>
        </Pressable>
      ))}
      {!positionOf(chart, 'Ascendant') && <TermText style={type.caption} text="The rising sign (Ascendant) needs a birth time and place." />}
    </View>
  );
}

function Placements({ chart }: { chart: Chart }) {
  const [open, setOpen] = useState<ChartPointName | null>(null);
  const rows = chart.positions.filter((p) => p.point !== 'Descendant' && p.point !== 'IC');
  return (
    <View style={ui.gapSmall}>
      {rows.map((p) => (
        <View key={p.point}>
          <Pressable
            accessibilityRole="button"
            aria-expanded={open === p.point}
            accessibilityLabel={`${p.point}, ${p.degree} degrees ${p.sign}${p.house ? `, ${ordinalHouse(p.house)}` : ''}${p.retrograde ? ', retrograde' : ''}`}
            onPress={() => setOpen(open === p.point ? null : p.point)}
            style={styles.row}
          >
            <Text style={styles.glyph}>{POINT_GLYPH[p.point]}</Text>
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{p.point}</Text>
              <Text style={type.caption}>
                {[formatDegree(p), p.house ? `house ${p.house}` : null, p.retrograde ? '℞ retrograde' : null, p.dignity, p.orSign ? `or ${p.orSign}` : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </Pressable>
          {open === p.point && <PositionDetail position={p} chart={chart} />}
        </View>
      ))}
      <TermChips ids={['dignity', 'retrograde', 'decans', 'house-systems']} label="Words in this list" />
    </View>
  );
}

const GRID: ChartPointName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'Ascendant', 'Midheaven'];

function Aspects({ chart }: { chart: Chart }) {
  const { width } = useWindowDimensions();
  const [picked, setPicked] = useState<AspectHit | null>(null);
  const points = GRID.filter((p) => positionOf(chart, p));
  const cell = Math.max(20, Math.min(30, Math.floor((Math.min(width, 500) - 40) / (points.length + 1))));
  const find = (a: ChartPointName, b: ChartPointName) => chart.aspects.find((h) => (h.a === a && h.b === b) || (h.a === b && h.b === a)) ?? null;
  return (
    <View style={ui.gap}>
      <View accessibilityLabel="Aspect grid">
        {points.map((row, i) => (
          <View key={row} style={styles.gridRow}>
            {points.slice(0, i).map((col) => {
              const hit = find(row, col);
              return (
                <Pressable
                  key={col}
                  disabled={!hit}
                  accessibilityRole="button"
                  accessibilityLabel={hit ? `${row} ${hit.aspect} ${col}, ${hit.orb.toFixed(1)} degrees` : `${row} and ${col}: no aspect`}
                  onPress={() => hit && setPicked(hit)}
                  style={[styles.cell, { width: cell, height: cell }, hit && picked === hit && styles.cellOn]}
                >
                  {hit && <Text style={[styles.cellText, { color: aspectDef(hit.aspect).tone === 'hard' ? '#d9826a' : aspectDef(hit.aspect).tone === 'soft' ? '#7fb0c9' : colors.gold }]}>{aspectDef(hit.aspect).symbol}</Text>}
                </Pressable>
              );
            })}
            <View style={[styles.cell, styles.cellHead, { width: cell, height: cell }]}>
              <Text style={styles.cellGlyph}>{POINT_GLYPH[row]}</Text>
            </View>
          </View>
        ))}
      </View>
      {picked && <AspectDetail aspect={picked} />}
      <SectionLabel>Tightest first</SectionLabel>
      {chart.aspects.slice(0, 30).map((a) => (
        <Pressable key={`${a.a}-${a.b}`} accessibilityRole="button" onPress={() => setPicked(a)} style={styles.row}>
          <Text style={styles.glyph}>{aspectDef(a.aspect).symbol}</Text>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{`${a.a} ${a.aspect} ${a.b}`}</Text>
            <Text style={type.caption}>{`${a.orb.toFixed(1)}°${a.applying === null ? '' : a.applying ? ' · applying' : ' · separating'}`}</Text>
          </View>
        </Pressable>
      ))}
      {chart.patterns.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Patterns</SectionLabel>
          {chart.patterns.map((p) => (
            <Pressable key={`${p.name}-${p.points.join()}`} accessibilityRole="button" onPress={() => openTerm(p.name)} style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>{PATTERN_LABEL[p.name]}</Text>
                <Text style={type.caption}>{`${p.points.join(', ')}${p.apex ? ` · focus ${p.apex}` : ''}${p.sign ? ` · in ${p.sign}` : p.house ? ` · ${ordinalHouse(p.house)}` : ''}`}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
      <TermChips ids={['aspects', 'orb', 'applying-separating', 'aspect-patterns', 'conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx']} />
    </View>
  );
}

function Bar({ label, score, max, points, term: id }: { label: string; score: number; max: number; points: string[]; term: string }) {
  return (
    <View style={styles.bar}>
      <View style={styles.barHead}>
        <Term id={id} style={styles.barLabel}>
          {label}
        </Term>
        <Text style={type.caption}>{score}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${max ? (score / max) * 100 : 0}%` }]} />
      </View>
      <Text style={type.caption}>{points.length ? points.join(', ') : 'none'}</Text>
    </View>
  );
}

function Balance({ chart }: { chart: Chart }) {
  const b = chart.balance;
  const maxE = Math.max(...Object.values(b.elements).map((e) => e.score));
  const maxM = Math.max(...Object.values(b.modalities).map((e) => e.score));
  return (
    <View style={ui.gap}>
      <Card>
        <SectionLabel>Elements</SectionLabel>
        {(['fire', 'earth', 'air', 'water'] as const).map((e) => (
          <Bar key={e} label={e[0].toUpperCase() + e.slice(1)} score={b.elements[e].score} max={maxE} points={b.elements[e].points} term={e} />
        ))}
        <TermText style={type.body} text={`Mostly ${b.dominantElement}${b.missingElements.length ? `, with no ${b.missingElements.join(' or ')}` : ''}. The Sun, Moon and Ascendant count twice.`} />
      </Card>
      <Card>
        <SectionLabel>Modalities</SectionLabel>
        {(['cardinal', 'fixed', 'mutable'] as const).map((m) => (
          <Bar key={m} label={m[0].toUpperCase() + m.slice(1)} score={b.modalities[m].score} max={maxM} points={b.modalities[m].points} term={m} />
        ))}
      </Card>
      <Card>
        <SectionLabel>Polarity</SectionLabel>
        <TermText style={type.body} text={`Yang (fire and air): ${b.polarity.yang.score}. Yin (earth and water): ${b.polarity.yin.score}. See Polarity.`} />
      </Card>
      {b.hemispheres && b.quadrants ? (
        <Card>
          <SectionLabel>Hemispheres and quadrants</SectionLabel>
          <Body>{`Above the horizon (houses 7–12): ${b.hemispheres.above.join(', ') || 'none'}`}</Body>
          <Body>{`Below the horizon (houses 1–6): ${b.hemispheres.below.join(', ') || 'none'}`}</Body>
          <Body>{`East, the rising side (houses 10–3): ${b.hemispheres.east.join(', ') || 'none'}`}</Body>
          <Body>{`West, the setting side (houses 4–9): ${b.hemispheres.west.join(', ') || 'none'}`}</Body>
          {b.quadrants.map((q, i) => (
            <Body key={i} muted>{`Quadrant ${i + 1} (houses ${i * 3 + 1}–${i * 3 + 3}): ${q.join(', ') || 'none'}`}</Body>
          ))}
          <Body muted>Many astrologers read a chart heavy above the horizon as outward and public, below as inward and private; east as self-directed, west as shaped through others.</Body>
        </Card>
      ) : (
        <Body muted>Hemispheres and quadrants need the houses, so a birth time and place.</Body>
      )}
      {chart.ruler && (
        <TermText style={type.body} text={`Chart ruler: ${chart.ruler.traditional}${chart.ruler.modern !== chart.ruler.traditional ? ` (modern: ${chart.ruler.modern})` : ''}. ${chart.sect === 'day' ? 'A day chart: the Sun was above the horizon.' : 'A night chart: the Sun was below the horizon.'} See Sect.`} />
      )}
    </View>
  );
}

function Reading({ chart }: { chart: Chart }) {
  const sections = useMemo(() => composeReading(chart), [chart]);
  const progress = readingProgress(sections);
  return (
    <View style={ui.gap}>
      <TermText style={type.caption} text={`Your chart read in full, section by section. ${progress.ready} of ${progress.total} pieces are written so far; the rest show a short sketch and the terms to read while their full readings are being written.`} />
      {sections.map((s) => (
        <View key={s.id} style={ui.gapSmall}>
          <SectionLabel>{s.title}</SectionLabel>
          {!!s.intro && <TermText style={type.body} text={s.intro} />}
          {s.pieces.map((p) => (
            <PieceView key={p.title} piece={p} />
          ))}
        </View>
      ))}
    </View>
  );
}

function PieceView({ piece: p }: { piece: ReadingPiece }) {
  return p.status === 'ready' ? (
    <ExplainCard title={p.title} reading={p.reading} terms={p.terms} />
  ) : (
    <Card>
      <Text style={type.cardTitle}>{p.title}</Text>
      <TermText style={type.body} text={p.sketch} />
      <Text style={type.caption}>Full reading coming soon.</Text>
      <TermChips ids={p.terms} />
    </Card>
  );
}

const DAY = 86_400_000;

function Transits({ chart }: { chart: Chart }) {
  const size = useWheelSize();
  const [when, setWhen] = useState(() => new Date());
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<Picked>(null);
  const hits = useMemo(() => transitsTo(chart, when), [chart, when]);
  const sky = useMemo(() => transitHouses(chart, when), [chart, when]);
  const retros = useMemo(
    () => (['Mercury', 'Venus', 'Mars'] as const).flatMap((p) => retrogradePeriods(p, new Date(when.getTime() - 30 * DAY), new Date(when.getTime() + 300 * DAY))),
    [when],
  );
  const choose = (d: Date) => {
    setWhen(d);
    setPicked(null);
  };
  const go = () => {
    const d = parseDate(text);
    if (d) choose(new Date(d.year, d.month - 1, d.day, 12));
  };
  const today = new Date();
  const outerAspects = hits.map((h) => ({ ...h }));
  return (
    <View style={ui.gap}>
      <Chips>
        <Chip label="Now" selected={Math.abs(when.getTime() - today.getTime()) < 3_600_000} onPress={() => choose(new Date())} />
        <Chip label="Tomorrow" onPress={() => choose(new Date(today.getTime() + DAY))} />
        <Chip label="In a week" onPress={() => choose(new Date(today.getTime() + 7 * DAY))} />
        <Chip label="In a month" onPress={() => choose(new Date(today.getTime() + 30 * DAY))} />
      </Chips>
      <View style={styles.dateRow}>
        <View style={styles.flex}>
          <Field label="Or a date (year-month-day)" value={text} onChange={setText} placeholder="e.g. 2027-03-21" />
        </View>
        <Button label="Show" variant="outline" onPress={go} />
      </View>
      <Body muted>{`The sky on ${shortDate(when)} at ${timeOfDay(when)}, in the outer ring, against the chart.`}</Body>
      <View style={styles.centre}>
        <ChartWheel
          chart={chart}
          size={size}
          outer={sky.map((s) => s.position)}
          outerLabel="Transiting"
          aspects={outerAspects}
          onTap={(t) => {
            if (t.kind === 'sign') return openTerm(termIdFor(t.sign));
            if (t.kind === 'house') return setPicked({ kind: 'house', house: t.house });
            if (t.kind === 'aspect') return setPicked({ kind: 'aspect', aspect: t.aspect, transit: true });
            setPicked({ kind: 'point', position: t.position });
          }}
        />
      </View>
      {picked && <Detail picked={picked} chart={chart} />}
      <SectionLabel>What touches the chart</SectionLabel>
      {hits.length === 0 && <TermText style={type.body} text="No planet is in close aspect to this chart at this moment: a quiet sky, good for steady, ordinary work." />}
      {hits.slice(0, 14).map((h) => (
        <Pressable key={`${h.transiting}-${h.natal}-${h.aspect}`} accessibilityRole="button" onPress={() => setPicked({ kind: 'aspect', aspect: h, transit: true })} style={styles.row}>
          <Text style={styles.glyph}>{aspectDef(h.aspect).symbol}</Text>
          <View style={styles.flex}>
            <TermText style={styles.rowTitle} text={transitLineFor(h)} />
            <Text style={type.caption}>{`${h.orb.toFixed(1)}° ${h.applying ? 'and closing' : 'and parting'}${h.house ? ` · moving through your ${ordinalHouse(h.house)}` : ''}`}</Text>
          </View>
        </Pressable>
      ))}
      <SectionLabel>Retrogrades around this date</SectionLabel>
      {retros.map((r) => {
        const phase = retroPhaseAt(r, when);
        return (
          <Card key={`${r.planet}-${r.start.getTime()}`}>
            <TermText style={type.cardTitle} text={`${r.planet} retrograde`} />
            <Body>{`Pre-shadow from ${shortDate(r.shadowStart)} · retrograde ${shortDate(r.start)} – ${shortDate(r.end)} · post-shadow until ${shortDate(r.shadowEnd)}`}</Body>
            <Body muted>{`Between ${Math.floor(r.endLongitude % 30)}° and ${Math.floor(r.startLongitude % 30)}° of its signs.${phase ? ` On this date: ${phase.replace('-', ' ')}.` : ''}`}</Body>
          </Card>
        );
      })}
      <TermChips ids={['transit', 'retrograde', 'shadow-period', 'station', 'applying-separating']} />
    </View>
  );
}

function Returns({ chart }: { chart: Chart }) {
  const here = usePlace();
  const [atHere, setAtHere] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const place = atHere && here ? { latitude: here.latitude, longitude: here.longitude, label: 'where you are now' } : null;
  const solar = useMemo(() => returnChart(chart, 'solar', new Date(Date.UTC(year, 0, 1)), place), [chart, year, place?.latitude, place?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps
  const lunar = useMemo(() => returnChart(chart, 'lunar', new Date(), place), [chart, place?.latitude, place?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps
  const size = Math.min(useWheelSize(), 340);
  return (
    <View style={ui.gap}>
      <TermText style={type.body} text="A solar return is the moment each year the Sun comes back to its birth degree; a lunar return, each month, the Moon. Their charts are read for the year or month ahead." />
      <Chips>
        <Chip label={`${year - 1}`} onPress={() => setYear(year - 1)} />
        <Chip label={`${year}`} selected />
        <Chip label={`${year + 1}`} onPress={() => setYear(year + 1)} />
      </Chips>
      {here && <Chip label={atHere ? 'Cast for where you are now' : 'Cast for the birthplace'} selected={atHere} onPress={() => setAtHere(!atHere)} />}
      {[solar, lunar].map((r) => (
        <Card key={r.kind}>
          <SectionLabel>{r.kind === 'solar' ? `Solar return ${year}` : 'Next lunar return'}</SectionLabel>
          <Text style={type.cardTitle}>{`${shortDate(r.when)} ${r.when.getFullYear()}, ${timeOfDay(r.when)}`}</Text>
          <TermText style={type.body} text={bigThreeLine(r.chart)} />
          {r.chart.houses && (
            <TermText
              style={type.body}
              text={`${r.kind === 'solar' ? 'The Sun' : 'The Moon'} falls in the return's ${ordinalHouse(positionOf(r.chart, r.kind === 'solar' ? 'Sun' : 'Moon')!.house!)}: ${r.kind === 'solar' ? 'a focus for the year' : 'a focus for the month'}.`}
            />
          )}
          <View style={styles.centre}>
            <ChartWheel chart={r.chart} size={size} noAspects onTap={(t) => (t.kind === 'sign' ? openTerm(termIdFor(t.sign)) : t.kind === 'point' ? openTerm(termIdFor(t.point)) : t.kind === 'house' ? openTerm(`house-${t.house}`) : null)} />
          </View>
          <Body muted>{`Cast for ${r.placeLabel ?? (chart.placeKnown ? 'the birthplace' : 'no place (no houses)')}. Times are in this device’s time zone.`}</Body>
          {returnPieces(r).map((p) => (
            <PieceView key={p.title} piece={p} />
          ))}
        </Card>
      ))}
      <TermChips ids={['returns', 'solar-return', 'lunar-return']} />
    </View>
  );
}

function Progressions({ chart }: { chart: Chart }) {
  const p = useMemo(() => progressionsFor(chart, new Date()), [chart]);
  const m = p.moon;
  return (
    <View style={ui.gap}>
      <TermText style={type.body} text={`Secondary progressions: the sky ${Math.floor(p.age)} days after birth stands for this year of life (age ${Math.floor(p.age)}).`} />
      <Card accent>
        <SectionLabel>The progressed Moon</SectionLabel>
        <TermText style={type.cardTitle} text={`Progressed Moon in ${m.position.sign}`} />
        <Body>{`${formatDegree(m.position)}${m.natalHouse ? ` · in your natal ${ordinalHouse(m.natalHouse)}` : ''}`}</Body>
        {m.nextSign && <TermText style={type.body} text={`It enters ${m.nextSign.sign} around ${shortDate(m.nextSign.date)} ${m.nextSign.date.getFullYear()}: a new emotional chapter, about every two and a half years.`} />}
        <TermText style={type.body} text={`Progressed lunar phase: ${p.phase} (${Math.round(p.phaseAngle)}° from the progressed Sun), part of a thirty-year cycle.`} />
      </Card>
      {progressedPieces(p).map((piece) => (
        <PieceView key={piece.title} piece={piece} />
      ))}
      {p.ascendant && p.midheaven && <TermText style={type.body} text={`By solar arc, the progressed Ascendant is in ${p.ascendant.sign} and the progressed Midheaven in ${p.midheaven.sign}.`} />}
      {p.changedSign.length > 0 && (
        <Card>
          <SectionLabel>Changed sign since birth</SectionLabel>
          {p.changedSign.map((c) => (
            <TermText key={c.point} style={type.body} text={`${c.point}: ${c.from} → ${c.to}`} />
          ))}
        </Card>
      )}
      {p.stationed.length > 0 && <TermText style={type.body} text={`Turned direction by progression: ${p.stationed.join(', ')}.`} />}
      <SectionLabel>Progressed positions</SectionLabel>
      {p.positions.map((pos) => (
        <View key={pos.point} style={styles.row}>
          <Text style={styles.glyph}>{POINT_GLYPH[pos.point]}</Text>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{pos.point}</Text>
            <Text style={type.caption}>{`${formatDegree(pos)}${pos.retrograde ? ' ℞' : ''}`}</Text>
          </View>
        </View>
      ))}
      <TermChips ids={['progressions', 'moon-phases', 'transit']} />
    </View>
  );
}

function Craft({ chart }: { chart: Chart }) {
  const allies = useMemo(() => personalAllies(chart), [chart]);
  const deities = useMemo(() => deitiesForChart(chart), [chart]);
  const { entries } = useLibrary();
  const place = usePlace();
  const altarPlanet = natalAltarPlanet(chart);
  const openLib = (name: string) => {
    const e = findByName(entries, name);
    if (e) router.push(libraryHref(e));
  };
  const ruler = allies[0];
  const next = ruler && place ? nextHourOnItsDay(ruler.planet, new Date(), place) : null;
  return (
    <View style={ui.gap}>
      <TermText style={type.body} text="Your chart ruler and the rulers of your Sun and Moon signs make a natural set of planetary allies: their days, hours, colours, herbs, stones and gods." />
      {allies.map((a) => (
        <Card key={a.planet} accent={a === allies[0]}>
          <SectionLabel>{a.why}</SectionLabel>
          <TermText style={type.cardTitle} text={`${POINT_GLYPH[a.planet]} ${a.planet}`} />
          <Body>{`${a.guide.day} · ${a.guide.metal.split('.')[0]} · ${a.guide.colours.join(', ')}`}</Body>
          <Text style={type.caption}>Herbs</Text>
          <Chips>
            {a.guide.herbs.slice(0, 6).map((h) => (
              <Chip key={h} label={h} onPress={findByName(entries, h) ? () => openLib(h) : undefined} />
            ))}
          </Chips>
          <Text style={type.caption}>Stones</Text>
          <Chips>
            {a.guide.stones.slice(0, 6).map((s) => (
              <Chip key={s} label={s} onPress={findByName(entries, s) ? () => openLib(s) : undefined} />
            ))}
          </Chips>
          <Button label={`${a.planet}: the full guide`} variant="text" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/planet', params: { planet: a.planet } } as unknown as Href)} />
        </Card>
      ))}

      <Card>
        <SectionLabel>A natal altar</SectionLabel>
        <TermText style={type.body} text={`A starter altar for ${altarPlanet}, ${chart.ruler ? 'your chart ruler' : 'the ruler of your Sun sign'}: its colours, stones, herbs and incense, laid out ready to change.`} />
        <Button label={`Set a ${altarPlanet} altar`} onPress={() => router.push({ pathname: '/altar/[altarId]', params: { altarId: 'natal', planet: altarPlanet, from: 'chart' } } as unknown as Href)} />
      </Card>

      {ruler && (
        <Card>
          <SectionLabel>Your ruler’s time</SectionLabel>
          {next ? (
            <TermText style={type.body} text={`The next hour of ${ruler.planet} on its own day: ${shortDate(next.start)}, ${timeOfDay(next.start)} – ${timeOfDay(next.end)}.`} />
          ) : (
            <Body muted>Add your location (The sky today) to find your ruler’s planetary hours.</Body>
          )}
          <Button label="Planetary days and hours" variant="outline" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/hours', params: { planet: ruler.planet } } as unknown as Href)} />
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Deities tied to your strongest planets</SectionLabel>
        <Body muted>The gods whom the planets were named for, or whom their own traditions tie to that light. A place to start, never an assignment; each is approached through their own tradition.</Body>
        {deities.map((d) => {
          const lib = findByName(entries, d.name);
          const journey = JOURNEY_CATALOG.find((j) => j.kind === 'deity' && j.id === `deity-${d.name.toLowerCase().replace(/[^a-z]/g, '')}`);
          return (
            <Card key={d.name}>
              <Text style={type.cardTitle}>{d.name}</Text>
              <Body muted>{`${d.tradition} · ${d.planet} (${d.why})`}</Body>
              <Body>{d.note}</Body>
              <View style={styles.actions}>
                {lib && <Button label="In the Living Library" variant="outline" onPress={() => router.push(libraryHref(lib))} />}
                {journey && <Button label="Dedication journey" variant="outline" onPress={() => router.push({ pathname: '/rituals/journeys/[id]', params: { id: journey.id } })} />}
              </View>
            </Card>
          );
        })}
      </View>
      <TermChips ids={['chart-ruler', 'planetary-days', 'planetary-hours', 'dignity']} />
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: radius.tile, marginBottom: 6 },
  glyph: { width: 28, fontSize: 20, color: colors.gold, textAlign: 'center' },
  rowTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.cream },
  gridRow: { flexDirection: 'row' },
  cell: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center' },
  cellHead: { backgroundColor: colors.surfaceRaised },
  cellOn: { backgroundColor: colors.surfaceRaised },
  cellText: { fontSize: 13 },
  cellGlyph: { fontSize: 13, color: colors.cream },
  bar: { gap: 4 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontFamily: fonts.bodySemi, fontSize: 15 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.gold },
  dateRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
