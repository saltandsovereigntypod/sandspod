import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { covenHref, CovenScreen, openOnWebsite } from '../../../../../components/covens/CovenScreen';
import { Pill, Pills, Words, useReport } from '../../../../../components/covens/ui';
import { Card, MenuList, MenuRow, Notice, Section } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage, JOINING, KIND_LABELS, occasionLabel, orderDocuments, rankPowers, ritualGroups, riteTime } from '../../../../../lib/covens/model';
import { useSession } from '../../../../../lib/session';
import { type } from '../../../../../theme';

export default function CovenHome() {
  const coven = useCoven();
  const { session } = useSession();
  const report = useReport(coven.userId);
  const [message, setMessage] = useState<string | null>(null);
  const snap = coven.snapshot;
  const info = snap?.coven;
  const insider = coven.perms.member || coven.perms.site;
  const documents = snap ? orderDocuments(snap.documents).filter((d) => d.published !== false && (insider || d.visibility === 'public')) : [];
  const { live, upcoming } = ritualGroups(coven.rituals);
  const next = upcoming.find((r) => r.scheduled_for && new Date(r.scheduled_for).getTime() > Date.now() - 3600000);

  const leave = () =>
    Alert.alert('Leave this coven?', 'You can ask to come back later. Your words in the gathering stay.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.leave(info!.id);
            await coven.refresh();
          } catch (error) {
            setMessage(errorMessage(error));
          }
        },
      },
    ]);

  return (
    <CovenScreen title="Coven" eyebrow={info?.tagline ?? 'Coven'} need="public" home onRefresh={coven.refreshRituals}>
      {info && snap && (
        <>
          <Pills>
            {coven.perms.member && <Pill label={coven.perms.founder ? 'Founder' : coven.perms.rank?.name ?? 'Member'} tone="gold" />}
            <Pill label={JOINING[info.joining].label} />
            {!!info.tradition && <Pill label={info.tradition} />}
            {typeof info.member_count === 'number' && <Pill label={`${info.member_count} ${info.member_count === 1 ? 'member' : 'members'}`} />}
            {(info.tags ?? []).slice(0, 6).map((tag) => (
              <Pill key={tag} label={tag} />
            ))}
          </Pills>
          {info.status !== 'active' && <Notice>{info.status === 'suspended' ? `Paused by the moderators${info.moderation_note ? `: ${info.moderation_note}` : '.'}` : 'This coven has closed.'}</Notice>}

          {coven.turn && (
            <Card tone="gold">
              <Text style={type.eyebrow}>It’s your turn</Text>
              <Text style={type.cardTitle}>{coven.turn.step.title}</Text>
              <Text style={type.caption}>{coven.turn.ritual.title}</Text>
              <Button label="Open the ritual" onPress={() => router.push(covenHref(coven.slug, `ritual/${coven.turn!.ritual.id}`))} />
            </Card>
          )}
          {!coven.turn &&
            live.map((r) => (
              <Card key={r.id} tone="gold">
                <Text style={type.eyebrow}>Happening now</Text>
                <Text style={type.cardTitle}>{r.title}</Text>
                <Button label="Join the ritual" onPress={() => router.push(covenHref(coven.slug, `ritual/${r.id}`))} />
              </Card>
            ))}
          {!live.length && next && (
            <Card>
              <Text style={type.eyebrow}>Coming up</Text>
              <Text style={type.cardTitle}>{next.title}</Text>
              <Text style={type.caption}>{[riteTime(next.scheduled_for), occasionLabel(next)].filter(Boolean).join(' · ')}</Text>
              <Button label="See the rite" variant="outline" onPress={() => router.push(covenHref(coven.slug, `ritual/${next.id}`))} />
            </Card>
          )}

          {coven.perms.member && coven.unsigned.length > 0 && (
            <Card>
              <Text style={type.body}>The coven has updated its agreements. Sign them to keep taking part in the gathering, the altar and rituals.</Text>
              <Button label="Read and sign" onPress={() => router.push(covenHref(coven.slug, 'join'))} />
            </Card>
          )}

          {insider && (
            <Section label="The coven">
              <MenuList>
                <MenuRow label="Gathering" detail={presenceLine(coven.presence.length)} icon="letters" onPress={() => router.push(covenHref(coven.slug, 'gathering'))} />
                <MenuRow label="Rituals and rites" detail={upcoming.length ? `${upcoming.length} on the calendar` : 'Rites and their steps'} icon="moon" onPress={() => router.push(covenHref(coven.slug, 'rituals'))} />
                <MenuRow label="Shared altar" detail="Light a candle together" icon="altar" onPress={() => router.push(covenHref(coven.slug, 'altar'))} />
                <MenuRow label="Book of Shadows" detail="The coven’s own pages" icon="library" onPress={() => router.push(covenHref(coven.slug, 'book'))} />
                <MenuRow label="Petitions" detail="Prayers the circle holds" icon="offer" onPress={() => router.push(covenHref(coven.slug, 'petitions'))} />
                <MenuRow label="Members" detail="Who’s in the circle" icon="community" last onPress={() => router.push(covenHref(coven.slug, 'members'))} />
              </MenuList>
            </Section>
          )}

          <Section label="About">
            {info.description ? <Words text={info.description} /> : <Text style={type.caption}>The coven hasn’t written about itself yet.</Text>}
            {!!info.meeting_rhythm && <Text style={type.caption}>Meets {info.meeting_rhythm}</Text>}
            <Text style={type.caption}>Founded by {coven.nameOf(info.founder_id)}</Text>
          </Section>

          {documents.map((doc) => (
            <Section key={doc.id} label={KIND_LABELS[doc.kind] ?? 'Page'}>
              <Card>
                <Text style={type.cardTitle}>{doc.title}</Text>
                <Words text={doc.body} />
                {doc.requires_signature && <Text style={type.caption}>Members sign this.</Text>}
              </Card>
            </Section>
          ))}

          {snap.ranks.length > 0 && (
            <Section label="Positions">
              {snap.ranks.map((rank) => (
                <Card key={rank.id}>
                  <Text style={type.cardTitle}>{rank.name}</Text>
                  {!!rank.description && <Words text={rank.description} />}
                  {rankPowers(rank).length > 0 && <Text style={type.caption}>This position {rankPowers(rank).join(', ')}.</Text>}
                  {!!rank.requirements && <Text style={type.caption}>Requirements: {rank.requirements}</Text>}
                </Card>
              ))}
              {coven.perms.member && <Text style={type.caption}>To apply for a higher position, open the coven on the website.</Text>}
            </Section>
          )}

          <Section label={coven.perms.member ? 'Your membership' : 'Joining'}>
            {!session ? (
              <Card>
                <Text style={type.body}>Sign in to join this coven.</Text>
                <Button label="Sign in" onPress={() => router.push('/sign-in')} />
              </Card>
            ) : coven.perms.member ? (
              <View style={styles.actions}>
                {coven.perms.review && <Button label="Review applications (website)" variant="outline" onPress={() => openOnWebsite(coven.slug, 'review')} />}
                {coven.perms.manage && <Button label="Manage the coven (website)" variant="outline" onPress={() => openOnWebsite(coven.slug, 'manage')} />}
                <Button label="My path and positions (website)" variant="outline" onPress={() => openOnWebsite(coven.slug, 'path')} />
                {!coven.perms.founder && <Button label="Leave the coven" variant="text" onPress={leave} />}
              </View>
            ) : snap.application?.status === 'pending' ? (
              <Card>
                <Text style={type.body}>Your application is waiting for the coven to review it.</Text>
                <Button label="See your application" variant="outline" onPress={() => router.push(covenHref(coven.slug, 'join'))} />
              </Card>
            ) : (
              <Card>
                <Text style={type.body}>{JOINING[info.joining].detail}</Text>
                {snap.application?.status === 'declined' && <Text style={type.caption}>Your last application wasn’t accepted{snap.application.reviewer_note ? `: ${snap.application.reviewer_note}` : '.'}</Text>}
                {info.joining !== 'closed' && info.status === 'active' && (
                  <Button label={info.joining === 'open' ? 'Join this coven' : 'Apply to join'} onPress={() => router.push(covenHref(coven.slug, 'join'))} />
                )}
              </Card>
            )}
            {coven.perms.site && <Button label="Moderate on the website" variant="outline" onPress={() => openOnWebsite(coven.slug, 'manage')} />}
            {session && !coven.perms.founder && (
              <Button label="Report this coven" variant="text" onPress={() => report.open({ target_type: 'coven', target_id: info.id, coven_id: info.id, label: info.name })} />
            )}
          </Section>
          {message && <Notice>{message}</Notice>}
          {report.sheet}
        </>
      )}
    </CovenScreen>
  );
}

function presenceLine(count: number) {
  if (!count) return 'Talk with the coven';
  return `${count} ${count === 1 ? 'person' : 'people'} here now`;
}

const styles = StyleSheet.create({
  actions: { gap: 10 },
});
