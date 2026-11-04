import { CommunityScreen } from '../../../../components/community/CommunityScreen';

// Community (Rituals · Writings · Mine), opened from More: Writings first,
// the Community Grimoire this route always opened.
export default function MoreCommunity() {
  return <CommunityScreen initial="writings" back="/more" />;
}
