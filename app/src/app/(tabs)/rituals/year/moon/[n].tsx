import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { dayHref, dayWords, lessonHref, LinkChips, moonHref, yearHref } from '../../../../../components/year/parts';
import { Body, Card, Field, List, RitualScreen, Row, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import {
  checkKey,
  config,
  dayKey,
  MOONS,
  moonSummary,
  moonView,
  newYear,
  PRACTICE_WORD,
  readKey,
  REFLECTION_MAX,
  setCheck,
  setDone,
  setReflection,
  summaryLine,
} from '../../../../../lib/yearday';
import { useYear } from '../../../../../lib/yearday/store';

// One moon of A Year and a Day: what to read, what to practise (with the
// festivals and the moon's rite that fall in it), the reflection, and the
// private self-checks. Readable before the year is begun.
export default function MoonScreen() {
  const { n: raw } = useLocalSearchParams<{ n: string }>();
  const n = Math.max(1, Math.min(MOONS.length, Number(raw) || 1));
  const { progress, change } = useYear();
  const now = new Date();
  const p = progress ?? newYear('eclectic', dayKey(now), now);
  const view = moonView(config(p), n)!;
  const sum = moonSummary(p, view);
  const begun = !!progress;
  const saved = p.reflections[view.moon.id]?.text ?? '';
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? saved;

  return (
    <RitualScreen back="A Year and a Day">
      <Title eyebrow={`Moon ${n} of ${MOONS.length} · ${dayWords(view.window.start)}`}>{view.moon.title}</Title>
      <Body>{view.moon.intro}</Body>
      {begun ? <Body muted>{summaryLine(sum)}</Body> : <Body muted>Begin your year to keep your progress here. You can read ahead either way.</Body>}

      <View style={ui.gapSmall}>
        <SectionLabel>Read</SectionLabel>
        <List>
          {view.readings.map((r, i) => (
            <Row
              key={r.id}
              icon="grimoire"
              title={r.title}
              detail={[r.festival ? `For ${r.festival}` : null, `${r.minutes} min`, p.done[readKey(r.id)] ? 'Read' : null].filter(Boolean).join(' · ')}
              last={i === view.readings.length - 1}
              onPress={() => router.push(lessonHref(r.id, n))}
            />
          ))}
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Practise</SectionLabel>
        {view.practices.map((item) => (
          <Card key={item.key} accent={!!item.date && item.date >= dayKey(now) && !p.done[item.key]}>
            <SectionLabel>{PRACTICE_WORD[item.kind]}</SectionLabel>
            <Body>{item.title}</Body>
            <Body muted>{item.detail}</Body>
            <LinkChips links={item.links} />
            {begun && <Toggle label="Done" value={!!p.done[item.key]} onChange={(on) => change((x) => setDone(x, item.key, on, new Date()))} />}
          </Card>
        ))}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Reflect</SectionLabel>
        {view.moon.reflect.map((q) => (
          <Body key={q}>{q}</Body>
        ))}
        {begun && (
          <>
            <Field label="Your reflection (private)" value={text} onChange={(t) => setDraft(t.slice(0, REFLECTION_MAX))} multiline placeholder="A few lines, as long or short as you like" />
            <Button
              label={draft === null || draft === saved ? (saved ? 'Saved' : 'Save reflection') : 'Save reflection'}
              variant="outline"
              disabled={draft === null || draft === saved}
              onPress={async () => {
                await change((x) => setReflection(x, view.moon.id, text, new Date()));
                setDraft(null);
              }}
            />
          </>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Self-check</SectionLabel>
        <Body muted>For you alone. Nobody sees these, and there is no score.</Body>
        {view.moon.milestones.map((m, i) =>
          begun ? (
            <Toggle key={m} label={m} value={!!p.checks[checkKey(view.moon.id, i)]} onChange={(on) => change((x) => setCheck(x, checkKey(view.moon.id, i), on, new Date()))} />
          ) : (
            <Body key={m}>{m}</Body>
          ),
        )}
      </View>

      <List>
        {n > 1 && <Row icon="calendar" title={`Moon ${n - 1}: ${MOONS[n - 2].title}`} detail="The moon before" onPress={() => router.replace(moonHref(n - 1))} />}
        {n < MOONS.length ? (
          <Row icon="calendar" title={`Moon ${n + 1}: ${MOONS[n].title}`} detail="The next moon" onPress={() => router.replace(moonHref(n + 1))} />
        ) : (
          <Row icon="wheel" title="The day of dedication" detail="A year and a day" onPress={() => router.push(dayHref())} />
        )}
        <Row icon="wheel" title="All thirteen moons" last onPress={() => router.navigate(yearHref())} />
      </List>
    </RitualScreen>
  );
}
