// The planner's planetary hours: which planet's hour the chosen time falls
// in, and that day's hours of any planet to pick a time from.

import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { planetaryHours, type HourPlanet } from '../../lib/astro/hours';
import { HOUR_PLANETS, HOUR_SUITS } from '../../lib/craft/cosmic/hours';
import { timeOfDay } from '../../lib/calendar';
import { usePlace } from '../../lib/location';
import { type } from '../../theme';
import { Chip, Chips, SectionLabel } from '../rituals/ui';
import { TermText } from './Explain';

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export function PlannerHours({ night, time, onPick, initialPlanet }: { night: Date; time: string; onPick: (time: string) => void; initialPlanet?: string }) {
  const place = usePlace();
  const [planet, setPlanet] = useState<HourPlanet | null>(HOUR_PLANETS.includes(initialPlanet as HourPlanet) ? (initialPlanet as HourPlanet) : null);
  const dayKey = `${night.getFullYear()}-${night.getMonth()}-${night.getDate()}`;
  // The planetary day that starts at that date's sunrise (and runs through its night).
  const hours = useMemo(() => (place ? planetaryHours(new Date(night.getFullYear(), night.getMonth(), night.getDate(), 12), place) : null), [place, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!place || !hours) return null;
  const [h, m] = time.split(':').map(Number);
  let at = new Date(night.getFullYear(), night.getMonth(), night.getDate(), h, m);
  if (at.getTime() < hours[0].start.getTime()) at = new Date(at.getTime() + 86_400_000);
  const inHour = hours.find((x) => at.getTime() >= x.start.getTime() && at.getTime() < x.end.getTime());
  const ofPlanet = planet ? hours.filter((x) => x.planet === planet) : [];
  return (
    <View style={{ gap: 8 }}>
      <SectionLabel>Planetary hours that day</SectionLabel>
      {inHour && <TermText style={type.caption} text={`${timeOfDay(at)} falls in the hour of ${inHour.planet}: ${HOUR_SUITS[inHour.planet].short}. The day belongs to ${hours[0].planet}.`} />}
      <Chips>
        {HOUR_PLANETS.map((p) => (
          <Chip key={p} label={p} selected={planet === p} onPress={() => setPlanet(planet === p ? null : p)} a11yLabel={`${p} hours that day`} />
        ))}
      </Chips>
      {planet && (
        <Chips>
          {ofPlanet.map((x) => (
            <Chip key={x.start.toISOString()} label={`${timeOfDay(x.start)}${x.night ? ' (night)' : ''}`} selected={inHour === x} onPress={() => onPick(hhmm(x.start))} a11yLabel={`Plan it for the ${planet} hour at ${timeOfDay(x.start)}`} />
          ))}
        </Chips>
      )}
    </View>
  );
}
