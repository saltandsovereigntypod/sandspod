// The one Community: Rituals · Writings · Mine. Rituals is Community Rituals
// (shared rituals and spells), Writings the Community Grimoire (reflections,
// dreams and practice wisdom) and Mine what you have shared or offered to
// either, with where each stands. Opened from More (/more/community) and from
// Practice → Rituals (/rituals/community), the same screen in each tab so Back
// stays where you were; ?tab= chooses the part (the old …/mine routes arrive
// with tab=mine).

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { RefreshControl } from 'react-native';

import { MoreScreen } from '../more/ui';
import { SegmentedSwitch } from '../SegmentedSwitch';
import { useMySubmissions, usePublished } from '../../lib/community/api';
import { useMyShares, usePublishedRituals } from '../../lib/rituals/communityApi';
import { colors } from '../../theme';
import { MyRituals } from './MyRituals';
import { MyWritings } from './MyWritings';
import { RitualsList } from './RitualsList';
import { WritingsList } from './WritingsList';

export type CommunityTab = 'rituals' | 'writings' | 'mine';

const TABS = [
  { key: 'rituals', label: 'Rituals' },
  { key: 'writings', label: 'Writings' },
  { key: 'mine', label: 'Mine' },
] as const;

const asTab = (v: unknown): CommunityTab | null => (v === 'rituals' || v === 'writings' || v === 'mine' ? v : null);

export function CommunityScreen({ initial, back }: { initial: CommunityTab; back: '/more' | '/rituals' }) {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<CommunityTab>(asTab(params.tab) ?? initial);
  const [pulling, setPulling] = useState(false);
  const published = usePublished();
  const rituals = usePublishedRituals();
  const shares = useMyShares();
  const offered = useMySubmissions();

  const choose = (next: CommunityTab) => {
    setTab(next);
    router.setParams({ tab: next });
  };

  return (
    <MoreScreen
      title="Community"
      eyebrow="Shared by the community"
      back={back}
      backLabel={back === '/more' ? 'Back to More' : 'Back to Rituals'}
      scrollKey={tab}
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          tintColor={colors.gold}
          onRefresh={async () => {
            setPulling(true);
            await Promise.all(tab === 'mine' ? [shares.refresh(), offered.refresh()] : tab === 'rituals' ? [rituals.refresh()] : [published.refresh()]);
            setPulling(false);
          }}
        />
      }
    >
      <SegmentedSwitch label="Community" options={TABS} value={tab} onChange={choose} />
      {tab === 'rituals' ? (
        <RitualsList onMine={() => choose('mine')} />
      ) : tab === 'writings' ? (
        <WritingsList />
      ) : (
        <>
          <MyRituals />
          <MyWritings />
        </>
      )}
    </MoreScreen>
  );
}
