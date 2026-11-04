import { CommunityScreen } from '../../../../components/community/CommunityScreen';

// Community (Rituals · Writings · Mine), opened from Practice → Rituals:
// Rituals first, the Community Rituals this route always opened.
export default function RitualsCommunity() {
  return <CommunityScreen initial="rituals" back="/rituals" />;
}
