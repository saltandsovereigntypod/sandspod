import { router, usePathname } from 'expo-router';
import { Text } from 'react-native';

import { Button } from '../../../../components/Button';
import { Chips, MenuList, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { DREAM_PROMPT_KEY, dreamPromptOnToday, settingsHref } from '../../../../lib/settings/links';
import { type } from '../../../../theme';

const SHOW_OPTIONS = [
  { value: 'both', label: 'Moon and holiday' },
  { value: 'moon', label: 'Moon only' },
  { value: 'holiday', label: 'Holiday only' },
] as const;

const LAYOUT_OPTIONS = [
  { value: 'stacked', label: 'One above the other' },
  { value: 'side', label: 'Side by side' },
] as const;

// Settings → Today: what the Today screen shows. The same keys as ever
// (today_show, today_layout, today_draw, deipnon_prompt), which used to sit
// under Calendar & holidays, and the morning dream prompt.
export default function TodaySettings() {
  const pathname = usePathname();
  return (
    <SettingsForm title="Today">
      {(draft, set) => {
        const show = (draft.today_show as string) || 'both';
        return (
          <>
            <Section label="The moon and the day’s holiday">
              <Chips label="Show on Today" options={SHOW_OPTIONS} value={show as (typeof SHOW_OPTIONS)[number]['value']} onChange={(v) => set('today_show', v)} />
              {show === 'both' && (
                <Chips
                  label="Layout"
                  options={LAYOUT_OPTIONS}
                  value={(draft.today_layout as (typeof LAYOUT_OPTIONS)[number]['value']) || 'stacked'}
                  onChange={(v) => set('today_layout', v)}
                />
              )}
              <Text style={type.caption}>On the horizon, on Today, always shows the next moon phase and the next holiday.</Text>
            </Section>
            <Section label="Also on Today">
              <MenuList>
                <SwitchRow
                  label="A card for the day"
                  detail="A small “Draw a card for the day” line, and the card once you’ve kept it."
                  value={draft.today_draw !== false}
                  onChange={(on) => set('today_draw', on)}
                />
                <SwitchRow
                  label="Hekate’s Deipnon"
                  detail="On the last day of each Attic month, if you keep the Hellenic monthly days or Hekate is your patron: a gentle note on Today, and a reminder on your phone (choose when in Notifications & reminders → Holidays). Off turns off both."
                  value={draft.deipnon_prompt !== false}
                  onChange={(on) => set('deipnon_prompt', on)}
                />
                <SwitchRow
                  label="Last night’s dream"
                  detail="In the morning, if you keep a dream journal: a line to catch last night’s dream before it fades."
                  value={dreamPromptOnToday(draft)}
                  onChange={(on) => set(DREAM_PROMPT_KEY, on)}
                  last
                />
              </MenuList>
            </Section>
            <Section label="Elsewhere">
              <Text style={type.caption}>Which holidays show comes from your calendars, and the sky from your location.</Text>
              <Button label="Calendars & holidays" variant="outline" onPress={() => router.push(settingsHref('calendar', pathname))} />
              <Button label="Location & hemisphere" variant="outline" onPress={() => router.push(settingsHref('location', pathname))} />
            </Section>
          </>
        );
      }}
    </SettingsForm>
  );
}
