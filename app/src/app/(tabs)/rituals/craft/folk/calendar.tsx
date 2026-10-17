import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Chip, Chips, Expander, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { longDate, relativeDay, shortDate } from '../../../../../lib/calendar';
import { customsAhead, customsInMonth, SOUTHERN_NOTE, type CustomOn } from '../../../../../lib/craft/folk/calendar';
import { monthName } from '../../../../../lib/craft/folk/weather';
import { usePlace } from '../../../../../lib/location';
import { premadeById } from '../../../../../lib/rituals/premade';

function when(c: CustomOn, now: Date, ahead: boolean): string {
  const end = new Date(c.date.getFullYear(), c.date.getMonth(), c.date.getDate() + c.days - 1);
  const span = c.days > 1 ? `${shortDate(c.date)}–${shortDate(end)}` : longDate(c.date);
  if (!ahead) return span;
  const running = c.date.getTime() <= now.getTime();
  return `${span} · ${running ? (c.days > 1 ? 'now' : 'today') : relativeDay(now, c.date)}`;
}

function CustomCard({ c, now, ahead }: { c: CustomOn; now: Date; ahead: boolean }) {
  const p = c.custom;
  const premade = premadeById(p.premade);
  return (
    <Expander title={`${p.name} · ${ahead && c.inDays === 0 ? 'now' : shortDate(c.date)}`}>
      <Body muted>{`${when(c, now, ahead)} · ${p.region}`}</Body>
      <SectionLabel>What people did</SectionLabel>
      <Body>{p.did}</Body>
      <SectionLabel>Keeping it now</SectionLabel>
      <Body>{p.keep}</Body>
      {!!p.when && <Body muted>{p.when}</Body>}
      {!!p.care && <Notice>{`Take care: ${p.care}`}</Notice>}
      {premade && (
        <Button
          label={premade.title}
          variant="outline"
          accessibilityHint="Opens a premade working for this custom"
          onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: premade.id } })}
        />
      )}
    </Expander>
  );
}

export default function FolkCalendar() {
  const place = usePlace();
  const now = useMemo(() => new Date(), []);
  const ahead = useMemo(() => customsAhead(now, 30), [now]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  // Browse forward: a month already gone this year shows next year's dates.
  const year = month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
  const inMonth = useMemo(() => customsInMonth(month, year), [month, year]);

  return (
    <RitualScreen back="Traditional & folk">
      <Title eyebrow="Old customs through the year">Folk calendar</Title>
      <Body muted>Customs of Britain, Ireland and wider Europe: where they were kept, what people did, and a way to keep each one now. Feasts that move with Easter are worked out for each year.</Body>
      {place && place.latitude < 0 && <Notice>{SOUTHERN_NOTE}</Notice>}

      <View style={ui.gapSmall}>
        <SectionLabel>The next 30 days</SectionLabel>
        {ahead.length === 0 ? <Body muted>A quiet stretch in the old calendar.</Body> : ahead.map((c) => <CustomCard key={`${c.custom.id}-${c.date.getFullYear()}`} c={c} now={now} ahead />)}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Through the year</SectionLabel>
        <Chips>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <Chip key={m} label={monthName(m - 1).slice(0, 3)} a11yLabel={monthName(m - 1)} selected={month === m} onPress={() => setMonth(m)} />
          ))}
        </Chips>
        <Body muted>{`${monthName(month - 1)} ${year}`}</Body>
        {inMonth.map((c) => (
          <CustomCard key={c.custom.id} c={c} now={now} ahead={false} />
        ))}
      </View>

      <Body muted>Dates and regions are drawn from Ronald Hutton’s The Stations of the Sun, Steve Roud’s The English Year and regional folklore collections. Customs vary from village to village; the ones near you may differ.</Body>
    </RitualScreen>
  );
}
