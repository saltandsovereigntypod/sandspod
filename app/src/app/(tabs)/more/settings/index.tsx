import { router, type Href } from 'expo-router';
import { Text } from 'react-native';

import type { MoreIconName } from '../../../../components/more/MoreIcon';
import { MenuList, MenuRow, MoreScreen, Section } from '../../../../components/more/ui';
import { myDeities } from '../../../../lib/patron/mine';
import { useSession } from '../../../../lib/session';
import { holidayChoice, TRADITIONS } from '../../../../lib/holidays';
import { chosenDeck, deckInfo } from '../../../../lib/divination/decks';
import { hemisphereOf } from '../../../../lib/calendars';
import { usePlace } from '../../../../lib/location';
import { layerOrderLabel, type Settings } from '../../../../lib/settings/defaults';
import { myPractices, practiceName } from '../../../../lib/rituals/premade';
import { countsMe } from '../../../../lib/covens/paths';
import { useMySettings } from '../../../../lib/settings/store';
import { type } from '../../../../theme';

type Row = { key: string; label: string; detail: string; icon?: MoreIconName; href: Href };

function deitySummary(settings: Record<string, unknown> | null | undefined) {
  const list = myDeities(settings);
  if (!list.length) return 'Patron, dedicated and exploring';
  return list.map((d) => (d.level === 'patron' ? `${d.name} (patron)` : d.name)).join(', ');
}

// Settings: the one place every choice is made, in seven groups. Each row
// opens its own page; the older routes (Appearance, Companion panel, Living
// Objects, Reminders) still open, and lead to where they now live.
export default function SettingsIndex() {
  const { session } = useSession();
  const { settings } = useMySettings();
  const place = usePlace();
  const name = settings?.preferred_name || settings?.magical_name || '';
  const hemisphere = settings ? `${hemisphereOf(settings, place) === 'south' ? 'Southern' : 'Northern'} hemisphere` : '';

  const groups: { label: string; rows: Row[] }[] = [
    {
      label: 'You',
      rows: [
        {
          key: 'identity',
          label: 'Identity',
          detail: name ? `${name}${settings?.pronouns ? ` · ${settings.pronouns}` : ''}` : 'Names and pronouns',
          icon: 'account',
          href: '/more/settings/identity',
        },
        {
          key: 'location',
          label: 'Location & hemisphere',
          detail: [place ? (place.source === 'device' ? 'From your phone' : 'Set by hand') : 'No place set', hemisphere].filter(Boolean).join(' · '),
          icon: 'moon',
          href: '/more/settings/location',
        },
      ],
    },
    {
      label: 'Your practice',
      rows: [
        { key: 'practice', label: 'Your crafts', detail: practiceSummary(settings), icon: 'journey', href: '/more/settings/practice' },
        { key: 'path', label: 'Path & traditions', detail: 'The traditions you keep, first in the Library', icon: 'journey', href: '/more/settings/library' },
        { key: 'deities', label: 'My deities', detail: deitySummary(settings), icon: 'journey', href: '/more/settings/deities' },
        { key: 'calendar', label: 'Calendars & holidays', detail: calendarSummary(settings), icon: 'moon', href: '/more/settings/calendar' },
      ],
    },
    {
      label: 'Screens',
      rows: [
        { key: 'today', label: 'Today', detail: 'Moon and holiday, card of the day, Deipnon, dreams', icon: 'moon', href: '/more/settings/today' },
        { key: 'book', label: 'Grimoire', detail: 'Page font, mundane mode, Traditional pages', icon: 'community', href: '/more/settings/book' },
        {
          key: 'library',
          label: 'Living Library',
          detail: settings ? layerOrderLabel(settings.library_layer_order) : 'Layers and what they show',
          icon: 'library',
          href: '/more/settings/library',
        },
        {
          key: 'divination',
          label: 'Divination',
          detail: settings ? `Tarot deck: ${deckInfo(chosenDeck(settings)).name}` : 'Deck, reversals, what to draw',
          icon: 'moon',
          href: '/more/settings/divination',
        },
        { key: 'altar', label: 'Altar', detail: 'Default background, About sheet, Home screen widget', icon: 'altar', href: '/more/settings/altar' },
      ],
    },
    {
      label: 'Notifications & reminders',
      rows: [
        {
          key: 'notifications',
          label: 'Notifications & reminders',
          detail: 'Moon, holidays, tending, planning, covens, quiet hours',
          icon: 'moon',
          href: '/more/settings/notifications',
        },
      ],
    },
    {
      label: 'Accessibility',
      rows: [{ key: 'accessibility', label: 'Accessibility', detail: 'Text size, spacing, contrast, motion', icon: 'settings', href: '/more/accessibility' }],
    },
    {
      label: 'Covens & privacy',
      rows: [
        {
          key: 'covens',
          label: 'Covens & privacy',
          detail: `Coven profile · ${settings && !countsMe(settings) ? 'left out of covens’ paths' : 'counted in covens’ paths'}`,
          icon: 'community',
          href: '/more/settings/covens',
        },
      ],
    },
    {
      label: 'Account & data',
      rows: [
        {
          key: 'account',
          label: 'Account',
          detail: session ? `Signed in as ${session.user.email ?? 'your account'}` : 'Guest · saved on this device',
          icon: 'account',
          href: '/more/account',
        },
        { key: 'backup', label: 'Backup and restore', detail: 'Keep a copy of your Sanctuary', icon: 'backup', href: '/more/backup' },
        { key: 'guest', label: 'Guest work', detail: 'Bring what you made as a guest into your account', icon: 'backup', href: '/more/guest-data' },
        ...(session ? [{ key: 'delete', label: 'Delete account', detail: 'Your account and everything in it', icon: 'account' as const, href: '/more/delete-account' as Href }] : []),
      ],
    },
  ];

  return (
    <MoreScreen title="Settings" eyebrow="Shape your Sanctuary" back="/more" backLabel="Back to More">
      {groups.map((group) => (
        <Section key={group.label} label={group.rows.length > 1 || group.rows[0].label !== group.label ? group.label : undefined}>
          <MenuList>
            {group.rows.map((row, index) => (
              <MenuRow key={row.key} icon={row.icon} label={row.label} detail={row.detail} last={index === group.rows.length - 1} onPress={() => router.push(row.href)} />
            ))}
          </MenuList>
        </Section>
      ))}
      <Text style={type.caption}>
        {session
          ? 'Settings are shared with the website, so a change here shows up there too. Each change saves itself.'
          : 'As a guest, settings stay on this device. Each change saves itself.'}
      </Text>
    </MoreScreen>
  );
}

function practiceSummary(settings: Settings | null): string {
  const chosen = myPractices(settings);
  return chosen.length ? chosen.map(practiceName).join(', ') : 'Green, Kitchen, Hedge, Cosmic…';
}

function calendarSummary(settings: Settings | null): string {
  if (!settings) return 'The calendars you keep';
  const { traditions } = holidayChoice(settings);
  const names = traditions.map((id) => (id === 'custom' ? 'Your own calendar' : TRADITIONS.find((t) => t.id === id)?.name ?? id));
  return names.length ? names.join(', ') : 'No calendars chosen';
}
