import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { useReport } from '../../../../components/covens/ui';
import { Card, Chips, Field, MenuList, MenuRow, MoreScreen, Notice, Section } from '../../../../components/more/ui';
import { Boundaries, ListingCard, ListingForm, ManyChips, NeedsStanding } from '../../../../components/together/Mentorship';
import * as covens from '../../../../lib/covens/api';
import { errorMessage, type Profile } from '../../../../lib/covens/model';
import { useSession } from '../../../../lib/session';
import * as api from '../../../../lib/together/api';
import {
  filterDirectory,
  MENTOR_TOPICS,
  MENTOR_TRADITIONS,
  myStanding,
  pairingLine,
  sortPairings,
  STANDING_WORDS,
  type MentorListing,
  type Mentorship,
} from '../../../../lib/together/mentorship';
import { colors, type } from '../../../../theme';

const WANT = [
  { value: 'mentor' as const, label: 'Find a mentor' },
  { value: 'mentee' as const, label: 'Find someone to mentor' },
];

// Mentorship: your pairings, your mentorship profile, and the directory of
// those who offer to mentor or are looking for one (the open directory, and
// members of your covens), filtered by tradition and topics. Adults only:
// nothing here shows until you have confirmed it. A pairing is ./[id].tsx;
// a coven's own is coven/c/[slug]/mentorships.tsx. Website: covens/mentorship/.
export default function MentorshipHome() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [me, setMe] = useState<covens.Me | null>(null);
  const [listing, setListing] = useState<MentorListing | null>(null);
  const [pairings, setPairings] = useState<Mentorship[]>([]);
  const [listings, setListings] = useState<MentorListing[]>([]);
  const [names, setNames] = useState<Record<string, Profile>>({});
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [want, setWant] = useState<'mentor' | 'mentee'>('mentor');
  const [tradition, setTradition] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const report = useReport(userId);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [who, mine] = await Promise.all([covens.fetchMe(userId), api.myListing(userId)]);
      setMe(who);
      setListing(mine);
      if (myStanding({ signedIn: true, profile: who.profile as never, banned: who.banned, listing: mine }) === 'ok') {
        const [pairs, all] = await Promise.all([api.myMentorships(), api.directory()]);
        setPairings(pairs);
        setListings(all);
        const ids = [...pairs.flatMap((m) => [m.mentor_id, m.mentee_id]), ...all.map((l) => l.user_id)];
        const found = await covens.fetchProfiles(ids);
        setNames(Object.fromEntries(found.map((p) => [p.user_id, p])));
      }
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setLoaded(true);
  }, [userId]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const standing = myStanding({ signedIn: !!userId, profile: (me?.profile ?? null) as { age_confirmed_at?: string | null } | null, banned: !!me?.banned, listing });
  const nameOf = (id: string) => names[id]?.display_name ?? 'A witch';
  const shown = useMemo(
    () => filterDirectory(listings, { want, tradition: tradition[tradition.length - 1] ?? null, topics, query }, userId, me?.blocks ?? [], (id) => names[id]?.display_name ?? ''),
    [listings, want, tradition, topics, query, userId, me, names],
  );

  const screen = (children: React.ReactNode) => (
    <MoreScreen title="Mentorship" eyebrow="Covens" back={'/coven' as Href} backLabel="Covens">
      {children}
    </MoreScreen>
  );
  if (!userId) return screen(<NeedsStanding words={STANDING_WORDS['sign-in']} action={{ label: 'Sign in', onPress: () => router.push('/sign-in') }} />);
  if (!loaded) return screen(<ActivityIndicator color={colors.gold} />);
  if (standing === 'profile') return screen(<NeedsStanding words={STANDING_WORDS.profile} action={{ label: 'Make your community profile', onPress: () => router.push('/coven/profile' as Href) }} />);
  if (standing === 'banned') return screen(<NeedsStanding words={STANDING_WORDS.banned} />);

  return screen(
    <>
      <Text style={type.body}>An experienced witch who shares what they know, and someone learning who asks: a pairing with its own private conversation, shared goals and reading, and check-ins. Adults only, on both sides.</Text>
      {standing === 'setup' ? (
        <Section label="Your mentorship profile">
          <Text style={type.caption}>{STANDING_WORDS.setup}</Text>
          <ListingForm userId={userId} listing={null} onSaved={() => void load()} />
        </Section>
      ) : (
        <>
          {pairings.length > 0 && (
            <Section label="Your pairings">
              <MenuList>
                {sortPairings(pairings, userId).map((m, i, list) => (
                  <MenuRow key={m.id} label={pairingLine(m, userId, nameOf)} icon="journey" last={i === list.length - 1} onPress={() => router.push(`/coven/mentorship/${m.id}` as Href)} />
                ))}
              </MenuList>
            </Section>
          )}

          <Section label="Directory">
            <Chips label="Looking for" options={WANT} value={want} onChange={setWant} />
            <ManyChips label="Tradition" options={MENTOR_TRADITIONS} value={tradition} onChange={(next) => setTradition(next.slice(-1))} />
            <ManyChips label="Topics" options={MENTOR_TOPICS} value={topics} onChange={setTopics} />
            <Field label="Search" value={query} onChangeText={setQuery} autoCapitalize="none" />
            {shown.length === 0 && <Notice tone="muted">No one matches just now. Try fewer topics, or come back later.</Notice>}
            {shown.map((l) => (
              <ListingCard
                key={l.user_id}
                listing={l}
                name={nameOf(l.user_id)}
                want={want}
                covenId={null}
                onAsked={() => void load()}
                onReport={() => report.open({ target_type: 'member', target_user_id: l.user_id, label: nameOf(l.user_id) })}
              />
            ))}
          </Section>

          <Section label="Your mentorship profile">
            {editing && listing ? (
              <ListingForm
                userId={userId}
                listing={listing}
                onSaved={(next) => {
                  setListing(next);
                  if (!next) void load();
                }}
              />
            ) : (
              <MenuList>
                <MenuRow label="Change what you offer or look for" detail="Traditions, topics, and where you’re shown" icon="account" last onPress={() => setEditing(true)} />
              </MenuList>
            )}
          </Section>

          <Section label="Boundaries">
            <Card>
              <Boundaries />
            </Card>
          </Section>
        </>
      )}
      {message && <Notice tone="muted">{message}</Notice>}
      {report.sheet}
    </>,
  );
}
