import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { useReport } from '../../../../components/covens/ui';
import { Card, CheckRow, Field, MoreScreen, Notice, Section } from '../../../../components/more/ui';
import { Boundaries } from '../../../../components/together/Mentorship';
import * as covens from '../../../../lib/covens/api';
import { courseLinkLabel, type CourseLink } from '../../../../lib/covens/courseLinks';
import { errorMessage, type Profile } from '../../../../lib/covens/model';
import { JOURNEY_CATALOG } from '../../../../lib/journeys/catalog';
import { useSession } from '../../../../lib/session';
import * as api from '../../../../lib/together/api';
import {
  CHECKIN_MAX,
  checkinDue,
  itemHref,
  itemsOf,
  linkChoices,
  MESSAGE_MAX,
  otherOf,
  pairingLine,
  roleOf,
  stageOf,
  type Mentorship,
  type MentorshipCheckin,
  type MentorshipItem,
  type MentorshipMessage,
} from '../../../../lib/together/mentorship';
import { colors, fonts, radius, type } from '../../../../theme';

// One mentorship: saying yes (or no), its private conversation, shared goals
// and a reading list linked into the Sanctuary, check-ins, and ending it.
// Only the two of you see any of it. Website: covens/mentorship/?id=….
export default function Pairing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pairId = String(id ?? '');
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [m, setM] = useState<Mentorship | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [messages, setMessages] = useState<MentorshipMessage[]>([]);
  const [items, setItems] = useState<MentorshipItem[]>([]);
  const [checkins, setCheckins] = useState<MentorshipCheckin[]>([]);
  const [names, setNames] = useState<Record<string, Profile>>({});
  const [coven, setCoven] = useState<{ name: string; slug: string } | null>(null);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [checkin, setCheckin] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const report = useReport(userId);

  const load = useCallback(async () => {
    if (!userId || !pairId) return;
    try {
      const row = await api.fetchMentorship(pairId);
      if (!row) return setStatus('missing');
      setM(row);
      const [rest, found, me] = await Promise.all([api.fetchPairing(pairId), covens.fetchProfiles([row.mentor_id, row.mentee_id]), covens.fetchMe(userId)]);
      setMessages(rest.messages);
      setItems(rest.items);
      setCheckins(rest.checkins);
      setNames(Object.fromEntries(found.map((p) => [p.user_id, p])));
      setBlocks(me.blocks);
      if (row.coven_id) setCoven(await api.covenOf(row.coven_id));
      setStatus('ready');
    } catch (error) {
      setMessage(errorMessage(error));
      setStatus((s) => (s === 'loading' ? 'missing' : s));
    }
  }, [userId, pairId]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  useEffect(() => (pairId && userId ? api.followPairing(pairId, () => void load()) : undefined), [pairId, userId, load]);

  const run = async (work: () => Promise<unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    await load();
    setBusy(false);
  };

  const nameOf = (u: string) => names[u]?.display_name ?? 'A witch';
  const screen = (children: React.ReactNode) => (
    <MoreScreen title="Mentorship" eyebrow="Covens" back={'/coven/mentorship' as Href} backLabel="Mentorship">
      {children}
    </MoreScreen>
  );
  if (!userId) return screen(<Button label="Sign in" onPress={() => router.push('/sign-in')} />);
  if (status === 'loading') return screen(<ActivityIndicator color={colors.gold} />);
  if (!m) return screen(<Notice>That mentorship wasn’t found.</Notice>);

  const stage = stageOf(m, userId);
  const other = otherOf(m, userId);
  const active = stage === 'active';
  const role = roleOf(m, userId);
  const shown = messages.filter((x) => !blocks.includes(x.user_id));
  const covenLink = coven ? { slug: coven.slug, siteHref: () => '' } : null;
  const confirmEnd = () =>
    Alert.alert(stage === 'active' ? 'End this mentorship?' : 'Withdraw?', 'Either of you can end a mentorship at any time. Its conversation, goals and check-ins stay readable to you both.', [
      { text: 'Cancel', style: 'cancel' },
      { text: stage === 'active' ? 'End it' : 'Withdraw', style: 'destructive', onPress: () => void run(() => api.endMentorship(m.id)) },
    ]);

  return screen(
    <>
      <Text style={type.title}>{pairingLine(m, userId, nameOf)}</Text>
      {coven && <Text style={type.caption}>Through {coven.name}. Its leaders can see that this pairing exists, never what is said in it.</Text>}
      {!!m.note && (
        <Card>
          <Text style={type.caption}>{m.paired_by && m.paired_by !== userId ? 'The coven’s note' : 'The note with the ask'}</Text>
          <Text style={type.body}>{m.note}</Text>
        </Card>
      )}

      {stage === 'waiting-me' && (
        <Card tone="gold">
          <Text style={type.body}>{role === 'mentor' ? `Would you like to mentor ${nameOf(other)}?` : `Would you like ${nameOf(other)} as your mentor?`} It begins only when you both say yes.</Text>
          <Boundaries />
          <Button label="Yes" disabled={busy} onPress={() => void run(() => api.answerMentorship(m.id, true))} />
          <Button label="No, thank you" variant="outline" disabled={busy} onPress={() => void run(() => api.answerMentorship(m.id, false))} />
        </Card>
      )}
      {stage === 'waiting-them' && <Notice tone="muted">Waiting for {nameOf(other)} to say yes.</Notice>}
      {(stage === 'ended' || stage === 'declined') && <Notice tone="muted">This mentorship is over. What you shared stays here for you both to read.</Notice>}

      {(active || stage === 'ended') && (
        <>
          {active && checkinDue(m, checkins) && <Notice>It has been a while. A check-in keeps you both in step.</Notice>}
          <ItemList title="Goals" kind="goal" items={itemsOf(items, 'goal')} pairing={m} userId={userId} active={active} inCoven={!!coven} covenLink={covenLink} run={run} busy={busy} />
          <ItemList title="Reading and study" kind="reading" items={itemsOf(items, 'reading')} pairing={m} userId={userId} active={active} inCoven={!!coven} covenLink={covenLink} run={run} busy={busy} />

          <Section label="Check-ins">
            {checkins.map((c) => (
              <Card key={c.id}>
                <Text style={type.caption}>
                  {nameOf(c.user_id)} · {new Date(c.created_at).toLocaleDateString()}
                </Text>
                <Text style={type.body}>{c.body}</Text>
              </Card>
            ))}
            {active && (
              <>
                <Field label="How it’s going: what you’ve tried, what you’d like next" value={checkin} onChangeText={setCheckin} multiline maxLength={CHECKIN_MAX} />
                <Button
                  label="Check in"
                  variant="outline"
                  disabled={busy || !checkin.trim()}
                  onPress={() =>
                    void run(async () => {
                      await api.checkIn(m.id, userId, checkin);
                      setCheckin('');
                    })
                  }
                />
              </>
            )}
          </Section>

          <Section label="Conversation">
            <Text style={type.caption}>Only the two of you read this.</Text>
            {shown.map((x) => (
              <View key={x.id} style={[styles.bubble, x.user_id === userId && styles.mine]}>
                <Text style={styles.who}>{x.user_id === userId ? 'You' : nameOf(x.user_id)}</Text>
                <Text style={type.body}>{x.body}</Text>
                {x.user_id !== userId && <Button label="Report" variant="text" onPress={() => report.open({ target_type: 'mentorship_message', target_id: x.id, label: 'this message' })} />}
              </View>
            ))}
            {active && (
              <>
                <Field label="Write to them" value={draft} onChangeText={setDraft} multiline maxLength={MESSAGE_MAX} />
                <Button
                  label="Send"
                  disabled={busy || !draft.trim()}
                  onPress={() =>
                    void run(async () => {
                      await api.sayToMentor(m.id, userId, draft);
                      setDraft('');
                    })
                  }
                />
              </>
            )}
          </Section>
        </>
      )}

      <Section label="Safety">
        <Boundaries />
        {(m.status === 'proposed' || active) && <Button label={active ? 'End the mentorship' : 'Withdraw'} variant="outline" disabled={busy} onPress={confirmEnd} />}
        <Button label={`Report ${nameOf(other)}`} variant="text" onPress={() => report.open({ target_type: 'mentorship', target_id: m.id, label: nameOf(other) })} />
        {!blocks.includes(other) && (
          <Button
            label={`Block ${nameOf(other)}`}
            variant="text"
            accessibilityHint="Blocking ends the mentorship"
            onPress={() =>
              Alert.alert(`Block ${nameOf(other)}?`, 'Blocking ends the mentorship, and you won’t see their messages anywhere.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Block', style: 'destructive', onPress: () => void run(() => covens.block(userId, other)) },
              ])
            }
          />
        )}
      </Section>
      {message && <Notice tone="muted">{message}</Notice>}
      {report.sheet}
    </>,
  );
}

function ItemList({
  title,
  kind,
  items,
  pairing,
  userId,
  active,
  inCoven,
  covenLink,
  run,
  busy,
}: {
  title: string;
  kind: 'goal' | 'reading';
  items: MentorshipItem[];
  pairing: Mentorship;
  userId: string;
  active: boolean;
  inCoven: boolean;
  covenLink: { slug: string; siteHref: (tab: string) => string } | null;
  run: (work: () => Promise<unknown>) => Promise<void>;
  busy: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [search, setSearch] = useState('');
  const [link, setLink] = useState<CourseLink | null>(null);
  const choices = useMemo(() => linkChoices(search, JOURNEY_CATALOG, inCoven, 6), [search, inCoven]);
  return (
    <Section label={title}>
      {items.length === 0 && <Text style={type.caption}>{kind === 'goal' ? 'Nothing set yet. What would you like to work towards?' : 'Nothing yet. Add a journey, a Library entry, a course or a page to read together.'}</Text>}
      {items.map((it) => {
        const href = itemHref(it.link, true, covenLink);
        return (
          <View key={it.id} style={styles.item}>
            <CheckRow label={it.title} value={!!it.done_at} onChange={(done) => (active ? void run(() => api.tickItem(it.id, done)) : undefined)} />
            {!!it.detail && <Text style={type.caption}>{it.detail}</Text>}
            <View style={styles.row}>
              {href && it.link && <Button label={`Open: ${courseLinkLabel(it.link)}`} variant="text" onPress={() => router.push(href as Href)} />}
              {active && <Button label="Remove" variant="text" disabled={busy} onPress={() => void run(() => api.removeItem(it.id))} />}
            </View>
          </View>
        );
      })}
      {active && !adding && <Button label={kind === 'goal' ? 'Add a goal' : 'Add to the reading list'} variant="outline" onPress={() => setAdding(true)} />}
      {active && adding && (
        <Card>
          <Field label={kind === 'goal' ? 'The goal' : 'What to read or study'} value={name} onChangeText={setName} maxLength={200} />
          <Field label="More about it (optional)" value={detail} onChangeText={setDetail} multiline maxLength={1000} />
          <Field label="Link it to (optional): search journeys and pages" value={search} onChangeText={setSearch} autoCapitalize="none" />
          <View style={styles.row}>
            {choices.map((c) => {
              const on = link?.kind === c.kind && link.id === c.id;
              return (
                <Pressable key={`${c.kind}:${c.id}`} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setLink(on ? null : c)} style={[styles.choice, on && styles.choiceOn]}>
                  <Text style={[styles.choiceText, on && styles.choiceTextOn]}>{courseLinkLabel(c)}</Text>
                </Pressable>
              );
            })}
          </View>
          <Button
            label="Add"
            disabled={busy || !(name.trim() || link)}
            onPress={() =>
              void run(async () => {
                await api.addItem(pairing.id, userId, { kind, title: name.trim() || (link ? courseLinkLabel(link) : ''), detail, link });
                setName('');
                setDetail('');
                setSearch('');
                setLink(null);
                setAdding(false);
              })
            }
          />
          <Button label="Not now" variant="text" onPress={() => setAdding(false)} />
        </Card>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  bubble: { backgroundColor: colors.surface, borderRadius: radius.tile, padding: 10, gap: 2, marginRight: 32 },
  mine: { marginRight: 0, marginLeft: 32, backgroundColor: colors.surfaceRaised },
  who: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 13 },
  item: { gap: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  choice: { borderRadius: radius.chip, borderWidth: 1, borderColor: colors.goldLine, paddingHorizontal: 10, paddingVertical: 6 },
  choiceOn: { backgroundColor: colors.gold },
  choiceText: { fontFamily: fonts.body, color: colors.parchment, fontSize: 13 },
  choiceTextOn: { color: colors.forestInk },
});
