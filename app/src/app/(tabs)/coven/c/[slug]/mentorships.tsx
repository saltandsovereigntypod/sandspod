import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { useReport } from '../../../../../components/covens/ui';
import { Card, Chips, Field, MenuList, MenuRow, Notice, Section } from '../../../../../components/more/ui';
import { ListingCard, NeedsStanding } from '../../../../../components/together/Mentorship';
import * as covensApi from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage, type Member } from '../../../../../lib/covens/model';
import * as api from '../../../../../lib/together/api';
import { filterDirectory, myStanding, NOTE_MAX, STANDING_WORDS, type CovenPair, type MentorListing } from '../../../../../lib/together/mentorship';
import { type } from '../../../../../theme';

const WANT = [
  { value: 'mentor' as const, label: 'Mentors here' },
  { value: 'mentee' as const, label: 'Looking for a mentor' },
];

// Mentorship in a coven: its members who offer to mentor or are looking for
// a mentor (asking within the coven), and, for those who run its programs or
// see its progress, the pairings that exist here (never what is said in them)
// and pairing two members (both must say yes).
export default function CovenMentorships() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id ?? null;
  const userId = coven.userId;
  const leads = coven.perms.programs || coven.perms.progress;
  const [listing, setListing] = useState<MentorListing | null | undefined>(undefined);
  const [listings, setListings] = useState<MentorListing[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [pairs, setPairs] = useState<CovenPair[]>([]);
  const [want, setWant] = useState<'mentor' | 'mentee'>('mentor');
  const [mentor, setMentor] = useState('');
  const [mentee, setMentee] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const report = useReport(userId);

  const load = useCallback(async () => {
    if (!covenId || !userId) return;
    try {
      const [mine, people] = await Promise.all([api.myListing(userId), covensApi.fetchMembers(covenId)]);
      setListing(mine);
      const active = people.filter((p) => p.status === 'active');
      setMembers(active);
      void coven.loadNames(active.map((p) => p.user_id));
      if (mine) setListings(await api.directory());
      if (coven.perms.programs || coven.perms.progress) setPairs(await api.covenPairs(covenId).catch(() => []));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadNames is stable enough; reload by coven
  }, [covenId, userId, coven.perms.programs, coven.perms.progress]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const memberIds = useMemo(() => new Set(members.map((m) => m.user_id)), [members]);
  const standing = myStanding({ signedIn: !!userId, profile: (coven.me?.profile ?? null) as { age_confirmed_at?: string | null } | null, banned: !!coven.me?.banned, listing });
  const here = filterDirectory(
    listings.filter((l) => memberIds.has(l.user_id)),
    { want, tradition: null, topics: [] },
    userId,
    coven.me?.blocks ?? [],
    (id) => coven.nameOf(id),
  );
  const pick = (value: string, set: (v: string) => void, label: string) => (
    <Chips label={label} options={[{ value: '', label: 'Choose' }, ...members.map((m) => ({ value: m.user_id, label: coven.nameOf(m.user_id) }))]} value={value} onChange={set} />
  );

  return (
    <CovenScreen title="Mentorship" onRefresh={load}>
      <Text style={type.body}>Members who mentor, and members looking for a mentor. A pairing has its own private conversation; the coven’s leaders see only that it exists. Adults only, on both sides.</Text>
      {listing !== undefined && standing !== 'ok' && (
        <NeedsStanding
          words={STANDING_WORDS[standing]}
          action={{ label: 'Open Mentorship', onPress: () => router.push('/coven/mentorship' as Href) }}
        />
      )}
      {standing === 'ok' && (
        <Section label="In this coven">
          <Chips label="Show" options={WANT} value={want} onChange={setWant} />
          {here.length === 0 && <Notice tone="muted">No one here is listed for that just now.</Notice>}
          {here.map((l) => (
            <ListingCard
              key={l.user_id}
              listing={l}
              name={coven.nameOf(l.user_id)}
              want={want}
              covenId={covenId}
              onAsked={() => void load()}
              onReport={() => report.open({ target_type: 'member', target_user_id: l.user_id, coven_id: covenId, label: coven.nameOf(l.user_id) })}
            />
          ))}
          <MenuList>
            <MenuRow label="Your pairings and the open directory" icon="journey" last onPress={() => router.push('/coven/mentorship' as Href)} />
          </MenuList>
        </Section>
      )}

      {leads && (
        <Section label="Pairings in the coven">
          <Text style={type.caption}>You see that a pairing exists, never its conversation, goals or check-ins. Either of the pair can end it at any time.</Text>
          {pairs.length === 0 && <Text style={type.caption}>None yet.</Text>}
          {pairs.map((p) => (
            <Card key={p.id}>
              <Text style={type.body}>
                {coven.nameOf(p.mentor_id)} mentoring {coven.nameOf(p.mentee_id)}
              </Text>
              <Text style={type.caption}>{p.status === 'active' ? `Since ${new Date(p.started_at ?? p.created_at).toLocaleDateString()}` : 'Waiting for both to say yes'}</Text>
            </Card>
          ))}
          {coven.perms.programs && coven.standing.ok && (
            <Card>
              <Text style={type.cardTitle}>Pair two members</Text>
              <Text style={type.caption}>Both need a mentorship profile (adults only). They’re each asked, and it begins only if both say yes.</Text>
              {pick(mentor, setMentor, 'Mentor')}
              {pick(mentee, setMentee, 'Mentee')}
              <Field label="A note to them both (optional)" value={note} onChangeText={setNote} multiline maxLength={NOTE_MAX} />
              <Button
                label={busy ? 'Pairing…' : 'Suggest the pairing'}
                disabled={busy || !mentor || !mentee || mentor === mentee}
                onPress={() => {
                  if (!covenId) return;
                  setBusy(true);
                  setMessage(null);
                  api
                    .pairMentorship(covenId, mentor, mentee, note)
                    .then(() => {
                      setMessage('Suggested. They’ll each be asked.');
                      setMentor('');
                      setMentee('');
                      setNote('');
                      return load();
                    })
                    .catch((error) => setMessage(errorMessage(error)))
                    .finally(() => setBusy(false));
                }}
              />
            </Card>
          )}
          <Button label="Members’ record (training mentors)" variant="text" onPress={() => router.push(`/coven/c/${coven.slug}/record` as Href)} />
        </Section>
      )}
      {message && <Notice tone="muted">{message}</Notice>}
      {report.sheet}
    </CovenScreen>
  );
}
