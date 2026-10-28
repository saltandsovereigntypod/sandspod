import { router, type Href } from 'expo-router';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

import type { MoreIconName } from '../../../components/more/MoreIcon';
import { runningUpdateLabel } from '../../../components/UpdateBanner';
import { MenuList, MenuRow, MoreScreen, Section } from '../../../components/more/ui';
import { useIsReviewer, useReview } from '../../../lib/community/api';
import { inReviewFolder, SUPPORT_EMAIL } from '../../../lib/community/model';
import { greetingName } from '../../../lib/settings/defaults';
import { useMySettings } from '../../../lib/settings/store';

type Row = { key: string; label: string; detail: string; icon: MoreIconName; href: Href | null };

const PRIVACY_URL = 'https://saltandsovereignty.com/privacy.html';
const TERMS_URL = 'https://saltandsovereignty.com/submission-terms.html';

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
      { key: 'practice', label: 'My practice', detail: 'Tools for your craft', icon: 'journey', href: '/rituals/craft' },
      { key: 'chart', label: 'Your birth chart', detail: 'Big three, planets, houses and aspects', icon: 'moon', href: '/rituals/craft/cosmic/chart' },
    ],
  },
  {
    label: 'Your Sanctuary',
    rows: [
      { key: 'journey', label: 'My Journey', detail: 'A chronicle of your practice', icon: 'journey', href: '/more/journey' },
      { key: 'settings', label: 'Settings', detail: 'Notifications, accessibility, account and backup', icon: 'settings', href: '/more/settings' },
    ],
  },
];

export default function More() {
  const { settings } = useMySettings();
  const name = settings ? greetingName(settings) : '';
  const isReviewer = useIsReviewer();
  const { data: review } = useReview();
  const pending = review?.submissions.filter((row) => inReviewFolder(row, 'pending')).length ?? 0;
  const unread = review?.unread.byFolder.all ?? 0;

  return (
    <MoreScreen title="More" eyebrow={name ? `Welcome, ${name}` : 'Your Sanctuary'}>
      <MenuList>
        <MenuRow
          label="Search your practice"
          detail="Library, grimoire, journal and templates"
          icon="search"
          last
          onPress={() => router.push('/more/search')}
        />
      </MenuList>
      {GROUPS.map((group) => {
        const rows = [
          ...group.rows,
          ...(group.label === 'Community' && isReviewer
            ? [{ key: 'review', label: 'Review submissions', detail: '', icon: 'letters' as const, href: '/more/community/review' as Href }]
            : []),
        ].filter((row) => row.href);
        return (
          <Section key={group.label} label={group.label}>
            <MenuList>
              {rows.map((row, index) => (
                <MenuRow
                  key={row.key}
                  label={row.label}
                  detail={
                    row.key === 'review'
                      ? [`${pending} pending`, unread ? `${unread} new ${unread === 1 ? 'reply' : 'replies'}` : null].filter(Boolean).join(' · ')
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
      <Section label="Help & legal">
        <MenuList>
          <MenuRow label="How to use the app" detail="A guide to everything, with search" icon="search" onPress={() => router.push('/more/help' as Href)} />
          <MenuRow
            label="Support"
            detail="Crisis, grief and other support lines"
            icon="support"
            onPress={() => router.push('/more/support' as Href)}
          />
          <MenuRow
            label="A note on our research"
            detail="How it was researched, and how to send a correction"
            onPress={() => router.push('/more/research' as Href)}
          />
          <MenuRow label="Contact us" detail={SUPPORT_EMAIL} onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} />
          <MenuRow label="Privacy Policy" onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)} />
          <MenuRow label="Submission Terms" onPress={() => void WebBrowser.openBrowserAsync(TERMS_URL)} />
          <MenuRow label={`Version ${Constants.expoConfig?.version ?? ''}`.trim()} detail={runningUpdateLabel() ?? undefined} last />
        </MenuList>
      </Section>
    </MoreScreen>
  );
}
