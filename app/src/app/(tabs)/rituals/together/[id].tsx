import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Pill, Spoken, useReport, Words } from '../../../../components/covens/ui';
import { Card, CheckRow, Field, MoreScreen, Notice, Section } from '../../../../components/more/ui';
import { copyText } from '../../../../lib/copyText';
import * as covens from '../../../../lib/covens/api';
import { errorMessage, type Profile } from '../../../../lib/covens/model';
import { blankAnswers } from '../../../../lib/rituals/lifecycle';
import { saveJournal } from '../../../../lib/rituals/store';
import { useSession } from '../../../../lib/session';
import * as api from '../../../../lib/together/api';
import {
  canChat,
  endingCount,
  isOver,
  journalAnswers,
  leaderOf,
  liveLink,
  MESSAGE_MAX,
  NOTE_MAX,
  shareLiveMessage,
  sourceHref,
  statusLine,
  whoIsHere,
  type LiveAction,
  type LiveMessage,
  type LivePerson,
  type LiveRitual,
} from '../../../../lib/together/live';
import { colors, fonts, radius, type } from '../../../../theme';

// A ritual together, live: the same step for everyone as the leader moves on,
// the shared candle, who's here, the chat (or quiet), and the shared ending
// with an optional note to your own journal. Follows the ritual on Supabase
// Realtime, with a check-in every so often for "who's here".
// Website: rituals/together/?id=… (rituals/together/together.js).
export default function RitualTogether() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const liveId = String(id ?? '');
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [live, setLive] = useState<LiveRitual | null>(null);
  const [people, setPeople] = useState<LivePerson[]>([]);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [me, setMe] = useState<covens.Me | null>(null);
  const [names, setNames] = useState<Record<string, Profile>>({});
  const [online, setOnline] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const report = useReport(userId);
  const namesRef = useRef(names);
  useEffect(() => {
    namesRef.current = names;
  }, [names]);

  const load = useCallback(async () => {
    if (!liveId || !userId) return;
    try {
      const next = await api.fetchLive(liveId);
      if (!next.live) return setStatus('missing');
      setLive(next.live);
      setPeople(next.people);
      setMessages(next.messages);
      setStatus('ready');
      const unknown = [next.live.host_id, ...next.people.map((p) => p.user_id), ...next.messages.map((m) => m.user_id)].filter((u) => !namesRef.current[u]);
      if (unknown.length) {
        const found = await covens.fetchProfiles(unknown);
        setNames((prev) => ({ ...prev, ...Object.fromEntries(found.map((p) => [p.user_id, p])) }));
      }
    } catch (error) {
      setMessage(errorMessage(error));
      setStatus((s) => (s === 'loading' ? 'missing' : s));
    }
  }, [liveId, userId]);

  useEffect(() => {
    if (userId) void covens.fetchMe(userId).then(setMe).catch(() => undefined);
  }, [userId]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  const mine = people.find((p) => p.user_id === userId) ?? null;
  const inIt = !!mine && !mine.left_at && !mine.removed_at;
  const myName = (userId && names[userId]?.display_name) || me?.profile?.display_name || 'A witch';

  // Live: the ritual's changes as they happen, who's on the channel, a check-in each 20 seconds and a look again each 30.
  useEffect(() => {
    if (!liveId || !userId || !inIt) return;
    const stop = api.followLive(liveId, userId, myName, () => void load(), setOnline);
    void api.hereLive(liveId).catch(() => undefined);
    const beat = setInterval(() => {
      void api.hereLive(liveId).catch(() => undefined);
      setNow(new Date());
    }, 20_000);
    const again = setInterval(() => void load(), 30_000);
    return () => {
      stop();
      clearInterval(beat);
      clearInterval(again);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one channel per ritual; the name only labels you
  }, [liveId, userId, inIt, load]);

  const nameOf = (u: string) => names[u]?.display_name ?? 'A witch';
  const blocks = useMemo(() => new Set(me?.blocks ?? []), [me]);
  const here = useMemo(() => whoIsHere(people, online, now), [people, online, now]);

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
  const act = (action: LiveAction) => live && run(() => api.actLive(live.id, live.version, action));

  if (!session) {
    return (
      <MoreScreen title="Ritual together" back={'/rituals/together' as Href} backLabel="Rituals together">
        <Button label="Sign in" onPress={() => router.push('/sign-in')} />
      </MoreScreen>
    );
  }
  if (status === 'loading') {
    return (
      <MoreScreen title="Ritual together" back={'/rituals/together' as Href} backLabel="Rituals together">
        <ActivityIndicator color={colors.gold} />
      </MoreScreen>
    );
  }
  if (!live || status === 'missing') {
    return (
      <MoreScreen title="Ritual together" back={'/rituals/together' as Href} backLabel="Rituals together">
        <Notice>That ritual together wasn’t found. It may have ended, or the host may have asked you to leave.</Notice>
        {message && <Notice tone="muted">{message}</Notice>}
      </MoreScreen>
    );
  }

  const over = isOver(live, now);
  const hosts = live.host_id === userId;
  const leads = leaderOf(live) === userId;
  const step = live.status === 'live' ? live.steps[live.current_step] : null;
  const ending = endingCount(people);
  const back = sourceHref(live.source, true);
  const link = liveLink(live.invite_code);
  const shown = messages.filter((m) => !blocks.has(m.user_id));

  return (
    <MoreScreen title={live.title} eyebrow="Ritual together" back={'/rituals/together' as Href} backLabel="Rituals together">
      <Text style={type.caption}>{over ? 'This ritual has ended.' : statusLine(live)}</Text>
      {!!live.intention && <Words text={live.intention} />}
      {mine?.removed_at && <Notice>The host has asked you to leave this ritual.</Notice>}

      {!inIt && !mine?.removed_at && !over && (
        <Card tone="gold">
          <Text style={type.body}>Hosted by {nameOf(live.host_id)}. Join to follow the steps with everyone.</Text>
          <Button label={busy ? 'Joining…' : 'Join'} disabled={busy} onPress={() => void run(() => api.joinLive(live.id, null))} />
        </Card>
      )}

      {inIt && (
        <>
          <Card tone={live.candle_lit_at ? 'gold' : undefined}>
            <View style={styles.candleRow}>
              <View style={[styles.flame, !live.candle_lit_at && styles.unlit]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
              <Text style={[type.body, styles.flex]}>
                {live.candle_lit_at
                  ? `The candle is lit${live.candle_lit_by ? ` by ${nameOf(live.candle_lit_by)}` : ''}. Light yours now, wherever you are.`
                  : 'When the leader lights the candle, everyone lights their own together.'}
              </Text>
            </View>
            {(leads || hosts) && !live.candle_lit_at && !over && <Button label="Light the candle together" variant="outline" disabled={busy} onPress={() => void act({ type: 'light' })} />}
          </Card>

          {live.status === 'gathering' && !!live.source.preparation && (
            <Section label="Before you begin">
              <Words text={live.source.preparation} />
            </Section>
          )}

          {step && (
            <Card>
              <Text style={type.eyebrow}>
                Step {live.current_step + 1} of {live.steps.length}
              </Text>
              <Text style={type.cardTitle}>{step.title}</Text>
              {!!step.body && <Words text={step.body} />}
              {!!step.spoken && <Spoken text={step.spoken} />}
              {!!step.minutes && <Text style={type.caption}>About {step.minutes} min</Text>}
            </Card>
          )}

          {!over && leads && (
            <View style={styles.controls}>
              {live.status === 'gathering' && <Button label="Begin the ritual" disabled={busy} onPress={() => void act({ type: 'begin' })} />}
              {live.status === 'live' && (
                <Button label={live.current_step >= live.steps.length - 1 ? 'To the ending' : 'Next step'} disabled={busy} onPress={() => void act({ type: 'next' })} />
              )}
              {(live.status === 'live' && live.current_step > 0) || live.status === 'closing' ? <Button label="Back a step" variant="outline" disabled={busy} onPress={() => void act({ type: 'back' })} /> : null}
            </View>
          )}
          {!over && !leads && live.status !== 'closing' && <Text style={type.caption}>{nameOf(leaderOf(live))} is leading. The steps move on for everyone together.</Text>}

          {live.status === 'closing' && (
            <Section label="The ending">
              {!!live.source.closing && <Words text={live.source.closing} />}
              <Text style={type.body}>
                {ending.done} of {ending.of} {ending.all ? '· it is done, for all of you.' : 'have said it is done.'}
              </Text>
              {mine?.done_at ? (
                <Text style={type.caption}>You said it is done.</Text>
              ) : (
                <Button label="It is done" disabled={busy} onPress={() => void run(() => api.mineLive(live.id, { done: true }))} />
              )}
            </Section>
          )}

          {(live.status === 'closing' || over) && (
            <Section label="For your own journal">
              {saved ? (
                <>
                  <Notice tone="muted">Kept in your ritual journal.</Notice>
                  <Button label="Open your journal" variant="outline" onPress={() => router.push('/rituals/journal')} />
                  <Button label="Open your Grimoire" variant="text" onPress={() => router.push('/grimoire' as Href)} />
                </>
              ) : (
                <>
                  <Text style={type.caption}>Only you see this. It goes into your ritual journal, with the ritual’s steps.</Text>
                  <Field label="A note (optional)" value={note} onChangeText={setNote} multiline maxLength={NOTE_MAX} />
                  <Button
                    label="Keep in my journal"
                    variant="outline"
                    disabled={busy}
                    onPress={() =>
                      void run(async () => {
                        const at = new Date();
                        await saveJournal({ session: null, answers: { ...blankAnswers(null, at), ...journalAnswers(live, note, Math.max(1, ending.of), at) } });
                        setSaved(true);
                      })
                    }
                  />
                </>
              )}
            </Section>
          )}

          {!over && (leads || hosts) && live.status !== 'closing' && live.status !== 'gathering' && (
            <Button label="Open the ending now" variant="text" disabled={busy} onPress={() => void act({ type: 'close' })} />
          )}

          <Section label={`Who’s here · ${here.length}`}>
            {here.map((p) => (
              <View key={p.user_id} style={styles.person}>
                <View style={styles.personHead}>
                  <Text style={[type.body, styles.flex]}>{nameOf(p.user_id)}</Text>
                  {p.role === 'host' && <Pill label="Host" />}
                  {leaderOf(live) === p.user_id && <Pill label="Leading" tone="gold" />}
                  {live.status === 'closing' && p.done_at && <Pill label="Done" />}
                </View>
                {!over && p.user_id !== userId && (
                  <View style={styles.personActions}>
                    {(leads || hosts) && leaderOf(live) !== p.user_id && <Button label="Pass the lead" variant="text" disabled={busy} onPress={() => void act({ type: 'pass', to: p.user_id })} />}
                    {hosts && <Button label="Ask to leave" variant="text" disabled={busy} onPress={() => void run(() => api.removeFromLive(live.id, p.user_id))} />}
                    <Button label="Report" variant="text" onPress={() => report.open({ target_type: 'member', target_user_id: p.user_id, coven_id: live.coven_id, label: nameOf(p.user_id) })} />
                    {!blocks.has(p.user_id) && userId && (
                      <Button
                        label="Block"
                        variant="text"
                        onPress={() =>
                          void run(async () => {
                            await covens.block(userId, p.user_id);
                            setMe(await covens.fetchMe(userId));
                          })
                        }
                      />
                    )}
                  </View>
                )}
              </View>
            ))}
            {hosts && leaderOf(live) !== userId && !over && <Button label="Take the lead back" variant="outline" disabled={busy} onPress={() => void act({ type: 'pass', to: live.host_id })} />}
          </Section>

          <Section label="Chat">
            <CheckRow label="Quiet mode: hide the chat for me" value={!!mine?.quiet} onChange={(on) => void run(() => api.mineLive(live.id, { quiet: on }))} />
            {hosts && !over && <CheckRow label="Quiet for everyone (no chat)" value={live.quiet} onChange={(on) => void act({ type: 'quiet', on })} />}
            {live.quiet && <Text style={type.caption}>The host has asked for quiet. The chat is closed.</Text>}
            {!mine?.quiet && (
              <View style={styles.chat}>
                {shown.length === 0 && <Text style={type.caption}>Nothing said yet.</Text>}
                {shown.map((m) => (
                  <View key={m.id} style={styles.message}>
                    <Text style={styles.who}>{nameOf(m.user_id)}</Text>
                    <Text style={type.body}>{m.body}</Text>
                    <View style={styles.personActions}>
                      {m.user_id !== userId && <Button label="Report" variant="text" onPress={() => report.open({ target_type: 'live_message', target_id: m.id, label: 'this message' })} />}
                      {(m.user_id === userId || hosts) && <Button label="Take down" variant="text" onPress={() => void run(() => api.hideLiveMessage(m.id))} />}
                    </View>
                  </View>
                ))}
                {canChat(live, mine) && userId && (
                  <>
                    <Field label="Say something" value={draft} onChangeText={setDraft} multiline maxLength={MESSAGE_MAX} />
                    <Button
                      label="Send"
                      variant="outline"
                      disabled={busy || !draft.trim()}
                      onPress={() =>
                        void run(async () => {
                          await api.sayLive(live.id, userId, draft);
                          setDraft('');
                        })
                      }
                    />
                  </>
                )}
              </View>
            )}
          </Section>

          {!over && (
            <Section label="Invite">
              <Text style={type.caption}>
                Code {live.invite_code}
                {live.coven_ritual_id ? ' · everyone the gathering is for can also join from its page' : ''}
              </Text>
              <View style={styles.controls}>
                <Button label="Share the link" variant="outline" onPress={() => void Share.share({ message: shareLiveMessage(live.title, link) }).catch(() => undefined)} />
                <Button label="Copy the link" variant="text" onPress={() => void copyText(link).then((ok) => setMessage(ok ? 'Link copied.' : link))} />
              </View>
            </Section>
          )}

          <View style={styles.controls}>
            {!over && hosts && <Button label="End the ritual for everyone" variant="text" disabled={busy} onPress={() => void act({ type: 'end' })} />}
            {!over && !hosts && (
              <Button
                label="Leave"
                variant="text"
                disabled={busy}
                onPress={() =>
                  void run(async () => {
                    await api.leaveLive(live.id);
                    router.replace('/rituals/together' as Href);
                  })
                }
              />
            )}
            {!hosts && <Button label="Report this ritual" variant="text" onPress={() => report.open({ target_type: 'live_ritual', target_id: live.id, label: 'this ritual' })} />}
          </View>
        </>
      )}

      {back && <Button label="Open the ritual it came from" variant="text" onPress={() => router.push(back as Href)} />}
      {message && <Notice tone="muted">{message}</Notice>}
      {report.sheet}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  candleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flame: { width: 14, height: 22, borderRadius: 999, backgroundColor: colors.gold, shadowColor: colors.gold, shadowOpacity: 0.8, shadowRadius: 10 },
  unlit: { backgroundColor: colors.surfaceRaised, shadowOpacity: 0 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  person: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline, paddingVertical: 6, gap: 2 },
  personHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  personActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chat: { gap: 8 },
  message: { backgroundColor: colors.surface, borderRadius: radius.tile, padding: 10, gap: 2 },
  who: { fontFamily: fonts.bodySemi, color: colors.gold, fontSize: 13 },
});
