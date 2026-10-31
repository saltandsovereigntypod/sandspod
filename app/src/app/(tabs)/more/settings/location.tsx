import { Text } from 'react-native';

import { LocationForm } from '../../../../components/more/LocationForm';
import { Chips, Section } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { HEMISPHERE_KEY, hemisphereOf } from '../../../../lib/calendars';
import { usePlace } from '../../../../lib/location';
import { SEASON_COUNT_KEY, SEASON_COUNTINGS, seasonCounting, seasonLine } from '../../../../lib/seasons';
import { type } from '../../../../theme';

const HEMISPHERE_OPTIONS = [
  { value: 'auto', label: 'From my place' },
  { value: 'north', label: 'Northern' },
  { value: 'south', label: 'Southern' },
] as const;
type Hemisphere = (typeof HEMISPHERE_OPTIONS)[number]['value'];

// Settings → Location & hemisphere: where you are (`sky.place`, on this phone
// only), used by Today, the sky, tides, weather, seasons and planetary hours;
// and which hemisphere the seasons and moon names follow (`calendar_hemisphere`,
// with your settings, as before under Calendar & holidays); and how the
// seasons of the year are counted (`season_count_by`, lib/seasons.ts).
export default function LocationSettings() {
  const place = usePlace();
  return (
    <SettingsForm title="Location & hemisphere">
      {(draft, set) => {
        const hemisphere = ((draft[HEMISPHERE_KEY] as string) || 'auto') as Hemisphere;
        return (
          <>
            <Text style={type.body}>Your place gives Today and the sky their sunrise, moonrise and planetary hours, and the tides, weather and seasons in your crafts.</Text>
            <LocationForm hasPlace={!!place} source={place?.source} />
            <Section label="Hemisphere">
              <Chips label="Hemisphere" options={HEMISPHERE_OPTIONS} value={hemisphere} onChange={(v) => set(HEMISPHERE_KEY, v)} />
              <Text style={type.caption}>
                {`Seasons, the Wheel and moon names follow the ${hemisphereOf(draft, place)}ern hemisphere${hemisphere === 'auto' ? (place ? ', from your place' : '; add your place above to set it') : ''}.`}
              </Text>
            </Section>
            <Section label="Seasons">
              <Chips label="Count the seasons by" options={SEASON_COUNTINGS} value={seasonCounting(draft)} onChange={(v) => set(SEASON_COUNT_KEY, v)} />
              <Text style={type.caption}>{SEASON_COUNTINGS.find((c) => c.value === seasonCounting(draft))!.about}</Text>
              <Text style={type.caption}>{`Now: ${seasonLine(new Date(), hemisphereOf(draft, place), seasonCounting(draft))} Today’s sky, the Wheel’s festival pages, Cycle & Moon and the kitchen’s simmer pots count them this way.`}</Text>
            </Section>
          </>
        );
      }}
    </SettingsForm>
  );
}
