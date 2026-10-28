import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../components/covens/CovenScreen';
import { DisclosureCard, LineageSection, useDisclosure } from '../../../../../components/covens/lineage';
import { OpenPositionsHere } from '../../../../../components/covens/Positions';
import { Pill, Pills, Words, useReport } from '../../../../../components/covens/ui';
import { Card, MenuList, MenuRow, Notice, Section } from '../../../../../components/more/ui';
import { WEBSITE_ORIGIN } from '../../../../../lib/altar/assetPaths';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { ritualTasks } from '../../../../../lib/covens/contributions';
import { seesPaths, type PathsSettings } from '../../../../../lib/covens/paths';
import { assigneesOf } from '../../../../../lib/covens/picker';
import type { RecordSettings } from '../../../../../lib/covens/record';
import { pendingLabel } from '../../../../../lib/covens/requests';
import { usePendingDetail } from '../../../../../lib/covens/requestsBadge';
import { errorMessage, JOINING, KIND_LABELS, occasionLabel, orderDocuments, rankPowers, ritualGroups, riteTime } from '../../../../../lib/covens/model';
import { covenCalendarNames, covenNextHoliday } from '../../../../../lib/covens/programs';
import { copiedFrom, roleBadge } from '../../../../../lib/covens/lineage';
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

  const leads = coven.perms.review || coven.perms.manage || coven.perms.site;
  // What you're asked to write, place or do before the coven's rites.
  const [written, setWritten] = useState<{ step_id: string }[]>([]);
  const askingAhead = coven.steps.some((s) => (s.contribution as { timing?: string } | null)?.timing === 'ahead');
  useEffect(() => {
    if (coven.userId && askingAhead) api.fetchMyContributions(coven.userId).then(setWritten).catch(() => setWritten([]));
  }, [coven.userId, askingAhead, coven.rituals]);
  // Paths in the coven, for those it's open to (the head, the record's keepers, or everyone when the head shows it).
  const [pathsAccess, setPathsAccess] = useState<{ record: RecordSettings | null; paths: PathsSettings | null } | null>(null);
  const covenId = info?.id;
  useEffect(() => {
    if (!covenId || !insider) return;
    let off = false;
    void Promise.all([api.fetchRecordSettings(covenId).catch(() => null), api.fetchPathsSettings(covenId).catch(() => null)]).then(([record, paths]) => {
      if (!off) setPathsAccess({ record, paths });
    });
    return () => {
      off = true;
    };
  }, [covenId, insider]);
  // Invite people: those who lead or review, and members when the coven lets them (null before the database has invitations).
  const [inviting, setInviting] = useState<{ covenId: string; may: boolean } | null>(null);
  const member = coven.perms.member;
  const standingOk = coven.standing.ok;
  useEffect(() => {
    if (!covenId || !member) return;
    let off = false;
    void api.fetchInviteSettings(covenId).then((s) => {
      if (!off) setInviting({ covenId, may: !!s?.may_invite });
    });
    return () => {
      off = true;
    };
  }, [covenId, member, standingOk]);
  const mayInvite = member && !!inviting && inviting.covenId === covenId && inviting.may;
  // A daughter coven tells everyone, before they join, whose final say it is under.
  const disclosure = useDisclosure(coven.slug);
  const lineage = coven.lineage;
  const ancestor = !!coven.perms.ancestor;
  const memberHere = snap?.membership?.status === 'active';
  const badge = roleBadge({ ancestor, member: memberHere, founder: info?.founder_id === coven.userId, rankName: coven.perms.rank?.name });
  const elder = memberHere && !coven.perms.founder && (coven.perms.review || coven.perms.moderate);
  const showPaths =
    !!pathsAccess &&
    seesPaths({ founder: coven.perms.founder, site: coven.perms.site, member: coven.perms.member, record: pathsAccess.record, paths: pathsAccess.paths, membership: snap?.membership, userId: coven.userId });
  const lineageRow = !!coven.lineage && (coven.lineage.may_found || coven.lineage.may_decide || !!coven.lineage.mother || coven.lineage.daughters.length > 0);
  const tasks = useMemo(
    () => (coven.standing.ok ? ritualTasks(coven.rituals, coven.steps, written.map((w) => ({ step_id: w.step_id, mine: true })), snap?.membership ?? null, coven.userId, assigneesOf) : []),
    [coven.standing.ok, coven.rituals, coven.steps, written, snap?.membership, coven.userId],
  );

  const leave = () =>
    Alert.alert('Leave this coven?', 'You can ask to come back later. Your words in the chat stay.', [
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
            {!!badge && <Pill label={badge} tone="gold" />}
            <Pill label={JOINING[info.joining].label} />
            {!!info.tradition && <Pill label={info.tradition} />}
            {typeof info.member_count === 'number' && <Pill label={`${info.member_count} ${info.member_count === 1 ? 'member' : 'members'}`} />}
            {(info.tags ?? []).slice(0, 6).map((tag) => (
              <Pill key={tag} label={tag} />
            ))}
          </Pills>
          {info.status !== 'active' && <Notice>{info.status === 'suspended' ? `Paused by the moderators${info.moderation_note ? `: ${info.moderation_note}` : '.'}` : 'This coven has closed.'}</Notice>}

          <DisclosureCard text={disclosure} joining={!memberHere && !ancestor} />

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

          {tasks.length > 0 && (
            <Card>
              <Text style={type.eyebrow}>Before the rite</Text>
              {tasks.slice(0, 4).map((task) => (
                <MenuRow key={task.stepId} label={task.title} detail={task.scheduledFor ? riteTime(task.scheduledFor) : task.stepTitle} icon="letters" onPress={() => router.push(covenHref(coven.slug, `ritual/${task.ritualId}`))} />
              ))}
            </Card>
          )}

          {coven.perms.member && coven.unsigned.length > 0 && (
            <Card>
              <Text style={type.body}>The coven has updated its agreements. Sign them to keep taking part in the chat, the altars and rituals.</Text>
              <Button label="Read and sign" onPress={() => router.push(covenHref(coven.slug, 'join'))} />
            </Card>
          )}

          <OpenPositionsHere />

          {insider && (
            <Section label="The coven">
              <MenuList>
                <MenuRow label="Messages" detail={presenceLine(coven.presence.length)} icon="letters" onPress={() => router.push(covenHref(coven.slug, 'chat'))} />
                <MenuRow label="Rituals and rites" detail={upcoming.length ? `${upcoming.length} on the calendar` : 'Rites and their steps'} icon="moon" onPress={() => router.push(covenHref(coven.slug, 'rituals'))} />
                <MenuRow label="Altars" detail="The ritual altar and others, tended together" icon="altar" onPress={() => router.push(covenHref(coven.slug, 'altar'))} />
                <MenuRow label="Book of Shadows" detail="The coven’s own pages" icon="library" onPress={() => router.push(covenHref(coven.slug, 'book'))} />
                <MenuRow label="Petitions" detail="Prayers the circle holds" icon="offer" onPress={() => router.push(covenHref(coven.slug, 'petitions'))} />
                <MenuRow
                  label="Initiation & training"
                  detail={
                    [coven.waitingForMe ? `${coven.waitingForMe} to sign off` : '', coven.trainingUnread ? `${coven.trainingUnread} new message${coven.trainingUnread === 1 ? '' : 's'}` : '']
                      .filter(Boolean)
                      .join(' · ') || 'Your path, and those you mentor'
                  }
                  count={coven.waitingForMe + coven.trainingUnread}
                  icon="journey"
                  onPress={() => router.push(covenHref(coven.slug, 'programs'))}
                />
                <MenuRow label="Members" detail="Who’s in the circle" icon="community" last={!showPaths && !lineageRow} onPress={() => router.push(covenHref(coven.slug, 'members'))} />
                {showPaths && <MenuRow label="Paths in the coven" detail="How the coven practises and whom it honours" icon="journey" last={!lineageRow} onPress={() => router.push(covenHref(coven.slug, 'paths'))} />}
                {lineageRow && (
                  <MenuRow
                    label="Daughter covens"
                    detail={lineage?.pending_requests ? `${lineage.pending_requests} waiting for your answer` : lineage?.mother ? 'Your mother coven, its library and the log' : 'Found a daughter coven, what’s shared'}
                    count={lineage?.pending_requests ?? 0}
                    icon="journey"
                    last
                    onPress={() => router.push(covenHref(coven.slug, 'lineage'))}
                  />
                )}
              </MenuList>
              {mayInvite && <Button label="Invite" variant="outline" onPress={() => router.push(covenHref(coven.slug, 'invite'))} />}
            </Section>
          )}

          <Section label="About">
            {info.description ? <Words text={info.description} /> : <Text style={type.caption}>The coven hasn’t written about itself yet.</Text>}
            {!!info.meeting_rhythm && <Text style={type.caption}>Meets {info.meeting_rhythm}</Text>}
            {calendarLine(info) && <Text style={type.caption}>{calendarLine(info)}</Text>}
            <Text style={type.caption}>Led by {coven.nameOf(info.founder_id)}</Text>
          </Section>

          <LineageSection lineage={lineage} slug={coven.slug} />

          {documents.map((doc) => (
            <Section key={doc.id} label={KIND_LABELS[doc.kind] ?? 'Page'}>
              <Card>
                <Text style={type.cardTitle}>{doc.title}</Text>
                <Words text={doc.body} />
                {doc.requires_signature && <Text style={type.caption}>Members sign this.</Text>}
                {!!copiedFrom(lineage?.copies, 'document', doc.id) && <Text style={type.caption}>{copiedFrom(lineage?.copies, 'document', doc.id)}</Text>}
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
                  {!!copiedFrom(lineage?.copies, 'rank', rank.id) && <Text style={type.caption}>{copiedFrom(lineage?.copies, 'rank', rank.id)}</Text>}
                  {rank.seat_limit != null && <Text style={type.caption}>Up to {rank.seat_limit} may hold it.</Text>}
                </Card>
              ))}
              {coven.perms.member && <Text style={type.caption}>To ask to rise to a higher position, open My standing.</Text>}
            </Section>
          )}

          <Section label={coven.perms.member ? 'Your membership' : 'Joining'}>
            {!session ? (
              <Card>
                <Text style={type.body}>Sign in to join this coven.</Text>
                <Button label="Sign in" onPress={() => router.push('/sign-in')} />
              </Card>
            ) : ancestor && !memberHere ? (
              <View style={styles.actions}>
                <Text style={type.body}>You’re here as the head of {lineage?.mother?.name ?? 'its mother coven'}: you have every power its own head has, and the members’ private things stay private from you, as from them.</Text>
                <MenuList>
                  <LeaderRows />
                </MenuList>
              </View>
            ) : coven.perms.member ? (
              <View style={styles.actions}>
                <MenuList>
                  <MenuRow
                    label="My standing"
                    detail={coven.unsigned.length ? 'Agreements to sign' : 'Your position, rising higher, leaving'}
                    icon="journey"
                    last={!leads && !elder}
                    onPress={() => router.push(covenHref(coven.slug, 'path'))}
                  />
                  {elder && <MenuRow label="The head can’t be reached" detail="Tell the site moderators" icon="letters" last={!leads} onPress={() => router.push(covenHref(coven.slug, 'unreachable'))} />}
                  {leads && <LeaderRows />}
                </MenuList>
                {info.founder_id === coven.userId ? (
                  <Text style={type.caption}>To leave, hand on leadership first: open Members, tap the person, then Hand on leadership.</Text>
                ) : (
                  <Button label="Leave the coven" variant="text" onPress={leave} />
                )}
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
            {coven.perms.site && !coven.perms.member && (
              <MenuList>
                <LeaderRows />
              </MenuList>
            )}
            {coven.perms.site && <Button label="Pause or reopen it (website moderation)" variant="outline" onPress={() => void WebBrowser.openBrowserAsync(`${WEBSITE_ORIGIN}/covens/moderation/`)} />}
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

/** Review and Manage, for those the coven gives them to (and site moderators). */
function LeaderRows() {
  const coven = useCoven();
  const { review, manage, site } = coven.perms;
  const waiting = usePendingDetail(review ? coven.snapshot?.coven.id : null);
  // Training to sign off is listed at the top of Review too.
  const training = coven.waitingForMe;
  const count = (waiting?.applications ?? 0) + (waiting?.advancements ?? 0) + training;
  return (
    <>
      {(review || site) && (
        <MenuRow
          label="Review"
          detail={[training ? `${training} to sign off` : '', pendingLabel(waiting)].filter(Boolean).join(' · ') || 'Applications, requests to advance and training to sign off'}
          icon="offer"
          count={count}
          last={!(manage || site)}
          onPress={() => router.push(covenHref(coven.slug, 'review'))}
        />
      )}
      {(manage || site) && <MenuRow label="Manage" detail="Details, pages, positions and questions" icon="settings" last onPress={() => router.push(covenHref(coven.slug, 'manage'))} />}
    </>
  );
}

/** The coven's practice calendar and its next holiday. */
function calendarLine(info: Parameters<typeof covenCalendarNames>[0]): string {
  const names = covenCalendarNames(info);
  if (!names.length) return '';
  const next = covenNextHoliday(info, new Date());
  return `Keeps ${names.join(', ')}${next ? ` · next: ${next.name}, ${next.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}` : ''}`;
}

function presenceLine(count: number) {
  if (!count) return 'Talk with the coven';
  return `${count} ${count === 1 ? 'person' : 'people'} here now`;
}

const styles = StyleSheet.create({
  actions: { gap: 10 },
});
