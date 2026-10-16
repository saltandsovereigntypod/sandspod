import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { ANY_MONTH, BY_MONTH, monthName, seasonalMonth, VERDICT_LABEL, type WeatherSaying } from '../../../../../lib/craft/folk/weather';
import { askDeviceLocation, usePlace } from '../../../../../lib/location';
import { colors, type } from '../../../../../theme';

function Saying({ s }: { s: WeatherSaying }) {
  return (
    <Card>
      <Text style={type.cardTitle}>{s.saying}</Text>
      <Text style={[type.caption, { color: s.verdict === 'sound' ? colors.gold : s.verdict === 'partly' ? colors.parchment : colors.muted }]}>{VERDICT_LABEL[s.verdict]}</Text>
      <Body>{s.note}</Body>
    </Card>
  );
}

export default function WeatherLore() {
  const place = usePlace();
  const south = !!place && place.latitude < 0;
  const now = useMemo(() => new Date(), []);
  const [followSeason, setFollowSeason] = useState(true);
  const [asking, setAsking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const current = followSeason ? seasonalMonth(now.getMonth(), place?.latitude) : now.getMonth();
  const [picked, setPicked] = useState<number | null>(null);
  const month = picked ?? current;

  const locate = async () => {
    setAsking(true);
    const result = await askDeviceLocation();
    setAsking(false);
    setProblem(result === 'ok' ? null : 'Your location isn’t available, so the sayings follow the northern year.');
  };

  return (
    <RitualScreen back="Traditional & folk">
      <Title eyebrow="Old sayings for the month">Weather lore</Title>
      <Body muted>Sayings from the farms, fishing boats and hedgerows of Britain and Ireland, each with a plain note on whether the weather bears it out. Some are sound short-range signs, some are farming wisdom, and some are only charming.</Body>

      {!place && (
        <Card>
          <Body>These sayings follow the northern year. If you live south of the equator, share your location so the months match your seasons.</Body>
          <Button label={asking ? 'Finding you…' : 'Use my location'} variant="outline" onPress={locate} disabled={asking} />
          {!!problem && <Notice>{problem}</Notice>}
        </Card>
      )}
      {south && (
        <Toggle
          label="Follow my seasons"
          detail={`You’re south of the equator, so ${monthName(now.getMonth())} is shown with the sayings for ${monthName(seasonalMonth(now.getMonth(), place?.latitude))}, the same point in the northern year.`}
          value={followSeason}
          onChange={(v) => {
            setFollowSeason(v);
            setPicked(null);
          }}
        />
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>{picked === null ? `${monthName(month)}${south && followSeason ? ' (your season)' : ''}` : monthName(month)}</SectionLabel>
        <Chips>
          {Array.from({ length: 12 }, (_, m) => (
            <Chip key={m} label={monthName(m).slice(0, 3)} a11yLabel={monthName(m)} selected={month === m} onPress={() => setPicked(m)} />
          ))}
        </Chips>
        {BY_MONTH[month].map((s) => (
          <Saying key={s.saying} s={s} />
        ))}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Any time of year</SectionLabel>
        {ANY_MONTH.map((s) => (
          <Saying key={s.saying} s={s} />
        ))}
      </View>

      <Body muted>Saints’ days in these sayings are by today’s calendar. Many were first said under the old Julian calendar, eleven days behind, which is why some sayings seem a little early.</Body>
    </RitualScreen>
  );
}
