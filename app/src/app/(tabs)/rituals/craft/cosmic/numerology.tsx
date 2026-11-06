import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Expander, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { coreNumbers, hourFor, meaningOf, MASTERS, NUMBER_PLANETS, NUMBER_ROLES, NUMEROLOGY_ORIGINS, readBirth, reduce, SYSTEMS, type Reading, type System } from '../../../../../lib/craft/cosmic/numerology';
import { type } from '../../../../../theme';

function NumberCard({ label, line, reading }: { label: string; line: string; reading: Reading }) {
  const m = meaningOf(reading.number);
  const root = reduce(reading.number, false);
  const planet = NUMBER_PLANETS[root];
  return (
    <Card accent={MASTERS.includes(reading.number)}>
      <SectionLabel>{label}</SectionLabel>
      <Text style={type.cardTitle}>{`${reading.number} · ${m.title}`}</Text>
      <Body muted>{m.keywords}</Body>
      {!!reading.steps && <Body muted>{reading.steps}</Body>}
      <Body muted>{line}</Body>
      <Expander title={`Read ${reading.number} in depth`}>
        {m.essay.map((p) => (
          <Body key={p.slice(0, 20)}>{p}</Body>
        ))}
        <Body muted>{`Shadow: ${m.shadow}`}</Body>
        <Body>{`In the craft: ${m.work}`}</Body>
        {!!planet && <Body muted>{`Its planet: ${planet.planet}.${planet.note ? ` ${planet.note}` : ''}`}</Body>}
        <Button label={`${hourFor(reading.number)} hours`} variant="outline" onPress={() => router.push(`/rituals/craft/cosmic/hours?planet=${hourFor(reading.number)}` as Href)} />
      </Expander>
    </Card>
  );
}

// Numerology: the core numbers of a name and birth date, two systems, and the personal cycles.
export default function Numerology() {
  const [name, setName] = useState('');
  const [d, setD] = useState('');
  const [m, setM] = useState('');
  const [y, setY] = useState('');
  const [system, setSystem] = useState<System>('pythagorean');
  const now = useMemo(() => new Date(), []);
  const birth = readBirth(d, m, y);
  const core = coreNumbers(name, birth, system, now);
  const hasName = /[a-z]/i.test(name);

  return (
    <RitualScreen back="Cosmic">
      <Title eyebrow="Cosmic">Numerology</Title>
      <Body muted>Your life path from your birth date; your expression, soul urge and personality from your name; and the personal year, month and day for timing. Nothing you type here is saved or sent anywhere.</Body>

      <View style={ui.gap}>
        <Field label="Full name at birth (or the name you go by)" value={name} onChange={setName} placeholder="As on your birth certificate, for the classic reading" />
        <View style={ui.actions}>
          <View style={{ flex: 1 }}>
            <Field label="Day" value={d} onChange={setD} keyboardType="numeric" placeholder="29" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Month" value={m} onChange={setM} keyboardType="numeric" placeholder="12" />
          </View>
          <View style={{ flex: 1.4 }}>
            <Field label="Year" value={y} onChange={setY} keyboardType="numeric" placeholder="1987" />
          </View>
        </View>
        <Chips>
          {SYSTEMS.map((s) => (
            <Chip key={s.id} label={s.label} selected={system === s.id} onPress={() => setSystem(s.id)} />
          ))}
        </Chips>
        <Body muted>{SYSTEMS.find((s) => s.id === system)!.about}</Body>
      </View>

      {!core ? (
        <Card>
          <Body>{d || m || y ? 'That date doesn’t look right: check the day, month and four-figure year.' : 'Put in your birth date to begin; add your name for the name numbers.'}</Body>
        </Card>
      ) : (
        <>
          <View style={ui.gapSmall}>
            <SectionLabel>Now</SectionLabel>
            <Card>
              <Text style={type.cardTitle}>{`Personal year ${core.personalYear} · month ${core.personalMonth} · day ${core.personalDay}`}</Text>
              <Body>{meaningOf(core.personalYear).year}</Body>
              <Body muted>{`This month (${core.personalMonth}): ${meaningOf(core.personalMonth).keywords.toLowerCase()}. Today (${core.personalDay}): ${meaningOf(core.personalDay).day}`}</Body>
              <Button label={`Today suits ${hourFor(core.personalDay)} hours`} variant="outline" onPress={() => router.push(`/rituals/craft/cosmic/hours?planet=${hourFor(core.personalDay)}` as Href)} />
            </Card>
          </View>
          {NUMBER_ROLES.filter((r) => hasName || r.key === 'lifePath' || r.key === 'birthday').map((r) => (
            <NumberCard key={r.key} label={r.label} line={r.line} reading={core[r.key]} />
          ))}
          {system === 'chaldean' && hasName && <Body muted>{`Chaldean readers keep the compound before it’s reduced: your name totals ${core.expression.compound}.`}</Body>}
        </>
      )}

      <Expander title="Where numerology comes from">
        {NUMEROLOGY_ORIGINS.map((p) => (
          <Body key={p.slice(0, 20)}>{p}</Body>
        ))}
      </Expander>
      <List>
        <Row icon="calendar" title="Planetary hours" detail="Time a working by the planet of its number" onPress={() => router.push('/rituals/craft/cosmic/hours' as Href)} />
        <Row icon="calendar" title="Find a good time" detail="The spell timing advisor" onPress={() => router.push('/rituals/craft/cosmic/timing' as Href)} />
        <Row icon="altar" title="Sigils on the planetary squares" detail="Kameas and the planets’ seals" last onPress={() => router.push('/rituals/sigil' as Href)} />
      </List>
    </RitualScreen>
  );
}
