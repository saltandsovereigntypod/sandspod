import { router, type Href } from 'expo-router';

import type { MoreIconName } from '../../../components/more/MoreIcon';
import { MenuList, MenuRow, MoreScreen, Section } from '../../../components/more/ui';
import { useSession } from '../../../lib/session';
import { greetingName } from '../../../lib/settings/defaults';
import { useMySettings } from '../../../lib/settings/store';

type Row = { key: string; label: string; detail: string; icon: MoreIconName; href: Href | null };

// ─── MERGE POINTS ────────────────────────────────────────────────────────
// Rows other milestones will fill in. A row stays hidden while its href is
// null; point it at the new route when merging, e.g. '/rituals/reminders'.
const MOON_REMINDERS_HREF: Href | null = '/rituals/reminders';
const ALTAR_HREF: Href | null = '/altar';
// ─────────────────────────────────────────────────────────────────────────

const GROUPS: { label: string; rows: Row[] }[] = [
  {
    label: 'Community',
    rows: [
      {
        key: 'community',
        label: 'Community Grimoire',
        detail: 'Pages shared by the community',
        icon: 'community',
        href: '/more/community',
      },
      { key: 'offer', label: 'Make an offering', detail: 'Share a ritual, dream or story', icon: 'offer', href: '/more/community/offer' },
      { key: 'mine', label: 'My submissions', detail: 'Status and replies', icon: 'letters', href: '/more/community/mine' },
    ],
  },
  {
    label: 'Practice',
    rows: [
      { key: 'library', label: 'Living Library', detail: 'Herbs, crystals, candles, deities', icon: 'library', href: '/more/library' },
      { key: 'moon-reminders', label: 'Moon reminders', detail: 'Phases and planned rituals', icon: 'moon', href: MOON_REMINDERS_HREF },
      { key: 'altar', label: 'Altar', detail: 'Your saved altars', icon: 'altar', href: ALTAR_HREF },
    ],
  },
  {
    label: 'Your Sanctuary',
    rows: [
      { key: 'settings', label: 'Settings', detail: 'Names, Book of Shadows, Library', icon: 'settings', href: '/more/settings' },
      { key: 'backup', label: 'Backup and restore', detail: 'Keep a copy of your Sanctuary', icon: 'backup', href: '/more/backup' },
      { key: 'account', label: 'Account', detail: '', icon: 'account', href: '/more/account' },
    ],
  },
];

export default function More() {
  const { session } = useSession();
  const { settings } = useMySettings();
  const name = settings ? greetingName(settings) : '';

  return (
    <MoreScreen title="Your Sanctuary" eyebrow={name ? `Welcome, ${name}` : 'More'}>
      {GROUPS.map((group) => {
        const rows = group.rows.filter((row) => row.href);
        return (
          <Section key={group.label} label={group.label}>
            <MenuList>
              {rows.map((row, index) => (
                <MenuRow
                  key={row.key}
                  label={row.label}
                  detail={
                    row.key === 'account'
                      ? session
                        ? `Signed in as ${session.user.email ?? 'your account'}`
                        : 'Guest · saved on this device'
                      : row.detail
                  }
                  icon={row.icon}
                  last={index === rows.length - 1}
                  onPress={() => router.push(row.href as Href)}
                />
              ))}
            </MenuList>
          </Section>
        );
      })}
    </MoreScreen>
  );
}
