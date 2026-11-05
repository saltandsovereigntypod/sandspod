import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../../../../../components/Button';
import { useCharts } from '../../../../../components/astro/useCharts';
import { Body, Card, Chip, Chips, RitualScreen, SectionLabel, Title } from '../../../../../components/rituals/ui';
import { ShareCardButton } from '../../../../../components/share/ShareCard';
import { ordinalHouse } from '../../../../../lib/astro/interpret/compose';
import { composite, meet, overlays } from '../../../../../lib/astro/relationship';
import {
  GOOD_DAY_INTENTS,
  GROUP_TITLE,
  HOUSE_THEME,
  MAGIC_INTENTS,
  REL_TYPES,
  SIGN_FLAVOUR,
  type RelType,
} from '../../../../../lib/astro/relationshipText';
import { adviseTiming, anyIntent, windowPlanFields, windowWhen } from '../../../../../lib/craft/cosmic/timing';
import { PREMADE } from '../../../../../lib/rituals/premade';
import { setForParams } from '../../../../../lib/rituals/setFor';
import { usePlace } from '../../../../../lib/location';
import { type } from '../../../../../theme';

const WHERE: Record<string, string> = { Sun: 'Sun', Moon: 'Moon', Venus: 'Venus', Mars: 'Mars', Jupiter: 'Jupiter', Saturn: 'Saturn' };

// "How your charts meet": two saved charts, read for the kind of bond. No scores.
export default function Relationship() {
  const params = useLocalSearchParams<{ a?: string; b?: string; type?: string }>();
  const { charts } = useCharts();
  const place = usePlace();
  const usable = charts.filter((c) => c.chart);
  const [aId, setA] = useState(params.a ?? usable[0]?.saved.id ?? '');
  const a = usable.find((c) => c.saved.id === aId) ?? usable[0] ?? null;
  const [bId, setB] = useState(params.b ?? '');
  const b = usable.find((c) => c.saved.id === bId && c.saved.id !== a?.saved.id) ?? usable.find((c) => c.saved.id !== a?.saved.id) ?? null;
  const [kind, setKind] = useState<RelType>((REL_TYPES.find((t) => t.key === params.type)?.key as RelType) ?? 'romantic');
  const [dayKey, setDayKey] = useState(GOOD_DAY_INTENTS[0].key);
  const ca = a?.chart ?? null;
  const cb = b?.chart ?? null;
  const ready = !!ca && !!cb;
  const na = a?.saved.name ?? '';
  const nb = b?.saved.name ?? '';

  const groups = (ca && cb ? meet(ca, cb, kind) : []);
  const houses = (ca && cb ? overlays(ca, cb) : null);
  const comp = (ca && cb ? composite(ca, cb) : null);
  const day = GOOD_DAY_INTENTS.find((d) => d.key === dayKey) ?? GOOD_DAY_INTENTS[0];
  const windows = useMemo(() => {
    const intent = anyIntent(day.intent);
    if (!ready || !intent) return [];
    return adviseTiming(intent, { from: new Date(), days: 42, place, count: 4 }).windows;
  }, [ready, day, place]);
  const now = new Date();
  const intent = anyIntent(day.intent);

  const sign = (p: string) => comp?.positions.find((x) => x.point === p)?.sign;
  const compLines = ['Sun', 'Moon', 'Venus'].flatMap((p) => (sign(p) ? [`Composite ${p} in ${sign(p)}: ${SIGN_FLAVOUR[sign(p)!]}.`] : []));
  const strongest = (comp?.aspects ?? []).filter((h) => h.a in WHERE && h.b in WHERE).slice(0, 3);
  const magic = MAGIC_INTENTS[kind];
  const picks = magic.flatMap((m) => PREMADE.filter((p) => p.intention === m.intent || p.alsoFor?.includes(m.intent as never)).slice(0, 2));
  const shareLines = [...compLines, ...groups.flatMap((g) => g.contacts.slice(0, 1).map((c) => c.text))].slice(0, 6);

  return (
    <RitualScreen back="Charts">
      <Title eyebrow="Charts">How your charts meet</Title>
      <Body muted>Where two charts touch, described as tendencies and invitations, never a verdict or a score.</Body>
      {usable.length < 2 ? (
        <Card>
          <Body>Save a second chart to compare. Only add someone’s details with their blessing.</Body>
        </Card>
      ) : (
        <>
          <SectionLabel>First chart</SectionLabel>
          <Chips>
            {usable.map((c) => (
              <Chip key={c.saved.id} label={c.saved.name} selected={a?.saved.id === c.saved.id} onPress={() => setA(c.saved.id)} />
            ))}
          </Chips>
          <SectionLabel>The other chart</SectionLabel>
          <Chips>
            {usable.filter((c) => c.saved.id !== a?.saved.id).map((c) => (
              <Chip key={c.saved.id} label={c.saved.name} selected={b?.saved.id === c.saved.id} onPress={() => setB(c.saved.id)} />
            ))}
          </Chips>
          <SectionLabel>The relationship</SectionLabel>
          <Chips>
            {REL_TYPES.map((t) => (
              <Chip key={t.key} label={t.label} selected={kind === t.key} onPress={() => setKind(t.key)} />
            ))}
          </Chips>
          <Body muted>{REL_TYPES.find((t) => t.key === kind)?.blurb}</Body>
        </>
      )}

      {ready && (
        <>
          {groups.filter((g) => g.contacts.length).map((g) => (
            <Card key={g.key}>
              <SectionLabel>{GROUP_TITLE[g.key]}</SectionLabel>
              {g.contacts.slice(0, 4).map((c) => (
                <Body key={`${c.hit.a}${c.hit.b}${c.hit.aspect}`}>
                  {`${na}’s ${c.hit.a} ${c.hit.aspect} ${nb}’s ${c.hit.b}. ${c.text}${c.typeLine ? ` ${c.typeLine}` : ''}`}
                </Body>
              ))}
            </Card>
          ))}
          {groups.every((g) => !g.contacts.length) && <Body muted>No close contacts between these planets, which simply means the bond is shaped by other things.</Body>}

          <Card>
            <SectionLabel>House overlays</SectionLabel>
            {houses ? (
              houses.map((o) => (
                <Text key={`${o.whose}${o.point}`} style={type.body}>
                  {`${o.whose === 'a' ? na : nb}’s ${o.point} falls in ${o.whose === 'a' ? nb : na}’s ${ordinalHouse(o.house)}: ${HOUSE_THEME[o.house]}.`}
                </Text>
              ))
            ) : (
              <Body muted>House overlays need both birth times and places, so they are left out here.</Body>
            )}
          </Card>

          <Card accent>
            <SectionLabel>{`${na} and ${nb}: the composite`}</SectionLabel>
            <Body muted>The midpoint of each pair of planets: the relationship as a chart of its own.</Body>
            {compLines.map((l) => (
              <Body key={l}>{l}</Body>
            ))}
            {strongest.map((h) => (
              <Body key={`${h.a}${h.b}`}>{`Composite ${h.a} ${h.aspect} ${h.b}: a theme the two of you carry together.`}</Body>
            ))}
          </Card>

          <Card>
            <SectionLabel>Good days together</SectionLabel>
            <Chips>
              {GOOD_DAY_INTENTS.map((d) => (
                <Chip key={d.key} label={d.label} selected={dayKey === d.key} onPress={() => setDayKey(d.key)} />
              ))}
            </Chips>
            {windows.map((w) => (
              <Card key={w.start.toISOString()}>
                <Body>{`${windowWhen(w, now)}. ${w.why}`}</Body>
                <Button
                  label="Plan a ritual then"
                  variant="outline"
                  onPress={() =>
                    router.push({
                      pathname: '/rituals/templates/edit',
                      params: setForParams({ ...windowPlanFields(w, now), hour: w.hourPlanet ?? null, intent: intent?.key ?? null, why: w.why }),
                    } as unknown as Href)
                  }
                />
              </Card>
            ))}
          </Card>

          <Card>
            <SectionLabel>Magic for the relationship</SectionLabel>
            {magic.map((m) => (
              <Button key={m.intent + m.label} label={`Build a spell: ${m.label}`} variant="outline" onPress={() => router.push({ pathname: '/rituals/spell', params: { intent: m.intent } } as unknown as Href)} />
            ))}
            <Button label="Correspondence finder" variant="text" onPress={() => router.push({ pathname: '/rituals/finder', params: { intent: magic[0].intent } } as unknown as Href)} />
            {picks.slice(0, 4).map((p) => (
              <Button key={p.id} label={p.title} variant="text" onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: p.id } } as unknown as Href)} />
            ))}
            <Button
              label="Write about this"
              variant="outline"
              onPress={() => router.push({ pathname: '/rituals/journal/new', params: { aboutTitle: `${na} and ${nb}`, about: `How our charts meet (${REL_TYPES.find((t) => t.key === kind)?.label.toLowerCase()})` } } as unknown as Href)}
            />
            <ShareCardButton card={{ eyebrow: 'How our charts meet', title: `${na} and ${nb}`, subtitle: REL_TYPES.find((t) => t.key === kind)?.label ?? '', lines: shareLines }} />
          </Card>
        </>
      )}
    </RitualScreen>
  );
}
