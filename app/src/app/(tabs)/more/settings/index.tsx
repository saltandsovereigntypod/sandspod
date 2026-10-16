import { myDeities } from '../../../../lib/patron/mine';
import { router } from 'expo-router';
import { Text } from 'react-native';

import { MenuList, MenuRow, MoreScreen } from '../../../../components/more/ui';
import { useSession } from '../../../../lib/session';
import { holidayChoice, TRADITIONS } from '../../../../lib/holidays';
import { layerOrderLabel, type Settings } from '../../../../lib/settings/defaults';
import { myPractices, practiceName } from '../../../../lib/rituals/premade';
import { useMySettings } from '../../../../lib/settings/store';
import { type } from '../../../../theme';

function deitySummary(settings: Record<string, unknown> | null | undefined) {
  const list = myDeities(settings);
  if (!list.length) return 'Patron, dedicated and exploring';
  return list.map((d) => (d.level === 'patron' ? `${d.name} (patron)` : d.name)).join(', ');
}

export default function SettingsIndex() {
  const { session } = useSession();
  const { settings } = useMySettings();
  const name = settings?.preferred_name || settings?.magical_name || '';

  return (
    <MoreScreen title="Settings" eyebrow="Shape your Sanctuary" back="/more" backLabel="Back to More">
      <MenuList>
        <MenuRow icon="search" label="How to use the app" detail="A guide to everything, with search" last onPress={() => router.push('/more/help')} />
      </MenuList>
      <MenuList>
        <MenuRow
          icon="account"
          label="Identity"
          detail={name ? `${name}${settings?.pronouns ? ` · ${settings.pronouns}` : ''}` : 'Names and pronouns'}
          onPress={() => router.push('/more/settings/identity')}
        />
        <MenuRow
          icon="altar"
          label="Appearance"
          detail={settings?.default_altar_background ? `New altars: ${settings.default_altar_background}` : 'Default altar background'}
          onPress={() => router.push('/more/settings/appearance')}
        />
        <MenuRow
          icon="community"
          label="Book of Shadows"
          detail="Mundane mode, page font"
          onPress={() => router.push('/more/settings/book')}
        />
        <MenuRow
          icon="journey"
          label="My practice"
          detail={practiceSummary(settings)}
          onPress={() => router.push('/more/settings/practice')}
        />
        <MenuRow
          icon="journey"
          label="My deities"
          detail={deitySummary(settings)}
          onPress={() => router.push('/more/settings/deities')}
        />
        <MenuRow
          icon="library"
          label="Living Library"
          detail={settings ? layerOrderLabel(settings.library_layer_order) : 'Layers and what they show'}
          onPress={() => router.push('/more/settings/library')}
        />
        <MenuRow
          icon="altar"
          label="Companion panel"
          detail={
            settings?.companion_copy_grimoire_settings === false
              ? layerOrderLabel(String(settings.companion_layer_order || 'myPractice,traditional,community'))
              : 'Same as Living Library pages'
          }
          onPress={() => router.push('/more/settings/companion')}
        />
        <MenuRow
          icon="moon"
          label="Living Objects"
          detail="What an object’s living state shows"
          onPress={() => router.push('/more/settings/objects')}
        />
        <MenuRow
          icon="moon"
          label="Calendar & holidays"
          detail={calendarSummary(settings)}
          onPress={() => router.push('/more/settings/calendar')}
          last
        />
      </MenuList>
      <Text style={type.caption}>
        {session
          ? 'Settings are shared with the website, so a change here shows up there too.'
          : 'As a guest, settings stay on this device.'}
      </Text>
    </MoreScreen>
  );
}

function practiceSummary(settings: Settings | null): string {
  const chosen = myPractices(settings);
  return chosen.length ? chosen.map(practiceName).join(', ') : 'Green, Kitchen, Hedge, Cosmic…';
}

function calendarSummary(settings: Settings | null): string {
  if (!settings) return 'Holidays and what Today shows';
  const { traditions } = holidayChoice(settings);
  const names = traditions.map((id) => (id === 'custom' ? 'Your own calendar' : TRADITIONS.find((t) => t.id === id)?.name ?? id));
  return names.length ? names.join(', ') : 'No calendars chosen';
}
