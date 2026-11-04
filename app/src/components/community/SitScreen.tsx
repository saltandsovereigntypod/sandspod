// One public sit (lib/community/sits.ts): join or leave, a countdown to the
// shared start, then the timer, started from the same moment for everyone
// (each person's own bells and sound, no pause). How many are sitting is
// shown, never who. Report, hide and block work as for Community Rituals.

import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, MoreScreen, Notice } from '../more/ui';
import { confirmAction } from '../rituals/ui';
import { SitTimer } from '../meditation/SitTimer';
import { block as blockOnServer } from '../../lib/covens/api';
import { blockAuthor, hidePost } from '../../lib/community/hidden';
import { SUPPORT_EMAIL } from '../../lib/community/model';
import { cleanSitSound, sitClock, sitElapsed, sitMix, sitPhase, sitPlanOf, sitReportUrl, sitStart, sitWhenLine, soundLabel, type PublicSit } from '../../lib/community/sits';
import { cancelSit, fetchSit, joinSit, leaveSit, useSits } from '../../lib/community/sitsApi';
import { markTendForSit } from '../../lib/meditation/afterSit';
import { fromTimer } from '../../lib/meditation/log';
import { clockLabel, planLine, sitStateAt } from '../../lib/meditation/timer';
import { type } from '../../theme';

export function SitScreen({ back }: { back: '/more' | '/rituals' }) {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const sits = useSits();
  const [sit, setSit] = useState<PublicSit | null | undefined>(undefined);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [done, setDone] = useState<{ at: string; minutes: number } | null>(null);
  const marked = useRef(false);
  const listHref = back === '/more' ? '/more/community' : '/rituals/community';

  const get = useCallback(async () => (id ? fetchSit(String(id)).catch(() => null) : null), [id]);
  const load = useCallback(async () => setSit(await get()), [get]);
  const phase = sit ? sitPhase(sit, now) : null;
  // The sit, and again as it begins (for a fresh count).
  const begun = phase === 'sitting';
  useEffect(() => {
    let off = false;
    void get().then((next) => !off && setSit(next));
    return () => {
      off = true;
    };
  }, [get, begun]);
  useEffect(() => {
    if (phase === 'ended' || phase === 'cancelled') return;
    const t = setInterval(() => setNow(Date.now()), phase === 'upcoming' ? 500 : 15_000);
    return () => clearInterval(t);
  }, [phase]);

  const plan = useMemo(() => (sit ? sitPlanOf(sit) : null), [sit]);
  const sound = useMemo(() => (sit ? cleanSitSound(sit.sound) : null), [sit]);
  const mix = useMemo(() => (sound ? sitMix(sound) : null), [sound]);
  const clock = useMemo(() => (sit ? sitClock(sit) : null), [sit]);

  const userId = sits.userId;
  const joined = !!sit && !!sits.data?.joined.includes(sit.id);
  const host = !!sit && sit.host_id === userId;
  const hostName = sit ? (host ? 'you' : sits.data?.names[sit.host_id] ?? 'someone') : '';

  const act = async (fn: () => Promise<unknown>, after?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      await Promise.all([load(), sits.refresh()]);
      if (after) setMessage(after);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const finish = (sitMs: number) => {
    if (done || !sit || !plan) return;
    setDone(fromTimer(sitStart(sit), sitMs, plan));
    if (!marked.current) {
      marked.current = true;
      void markTendForSit(new Date());
    }
  };
  const report = async () => {
    if (!sit) return;
    try {
      await Linking.openURL(sitReportUrl(sit));
    } catch {
      setMessage(`To report this sit, email ${SUPPORT_EMAIL} and mention “${sit.title}”.`);
    }
  };
  const hide = async () => {
    if (!sit || !(await confirmAction('Hide this sit?', 'You won’t see it in Community on this device.', 'Hide'))) return;
    hidePost(`sit:${sit.id}`);
    router.replace(listHref as never);
  };
  const blockHost = async () => {
    if (!sit || !(await confirmAction('Block this person?', `You won’t see sits, rituals or community pages from ${hostName}. They aren’t told.`, 'Block'))) return;
    blockAuthor(sit.host_id);
    if (userId && sit.host_id !== userId) await blockOnServer(userId, sit.host_id).catch(() => undefined);
    router.replace(listHref as never);
  };

  return (
    <MoreScreen title={sit?.title ?? 'Sit'} eyebrow="A sit together" back={`${listHref}?tab=sits` as never} backLabel="Back to Community">
      {sit === undefined ? (
        <Text style={type.caption}>Loading…</Text>
      ) : !sit || !plan || !clock ? (
        <Notice tone="muted">This sit couldn’t be found. It may have been cancelled.</Notice>
      ) : (
        <>
          <Text style={type.body}>{sitWhenLine(sit, now)}</Text>
          <Text style={type.caption}>{[`With ${hostName}`, planLine(plan), sound ? soundLabel(sound) : ''].filter(Boolean).join(' · ')}</Text>
          {!!sit.intention && <Text style={type.body}>Intention: {sit.intention}</Text>}
          {phase === 'cancelled' ? (
            <Notice tone="muted">This sit was cancelled.</Notice>
          ) : phase === 'ended' && !done ? (
            <Notice tone="muted">This sit has ended.</Notice>
          ) : (
            <Card tone="gold">
              <Text style={type.eyebrow}>{`${sit.joined_count} ${phase === 'sitting' ? 'sitting' : 'joined'}`}</Text>
              {done ? (
                <>
                  <Text style={type.body}>{`${done.minutes} ${done.minutes === 1 ? 'minute' : 'minutes'}, sat together.`}</Text>
                  <Button label="Keep it in your log" onPress={() => router.push({ pathname: '/rituals/craft/meditation/log', params: { at: done.at, minutes: String(done.minutes), timed: '1' } })} />
                </>
              ) : phase === 'upcoming' ? (
                <Text style={type.cardTitle}>{`Beginning in ${clockLabel(sitStart(sit) - now)}`}</Text>
              ) : joined || host ? (
                <SitTimer shared sound={mix} plan={plan} clock={clock} endedAtMs={endedAt} onEnd={(ms) => (plan.minutes === null ? setEndedAt(ms) : finish(sitStateAt(plan, ms).sitMs))} onFinished={finish} />
              ) : (
                <Text style={type.body}>{`Under way: ${clockLabel(sitElapsed(sit, now))} in. Join to sit with them; your timer picks up where everyone is.`}</Text>
              )}
              {!done && !host && sits.signedIn && (
                <Button
                  label={joined ? 'Leave the sit' : 'Join the sit'}
                  variant={joined ? 'text' : 'primary'}
                  disabled={busy}
                  onPress={() => void act(() => (joined ? leaveSit(sit.id, userId!) : joinSit(sit.id, userId!)), joined ? undefined : 'You’ve joined. Your timer starts with everyone’s.')}
                />
              )}
            </Card>
          )}
          <Text style={type.caption}>Everyone’s timer starts at the same moment, wherever they are. Nothing is heard or seen of anyone; only how many are sitting is shown.</Text>
          {message && <Notice>{message}</Notice>}
          <View style={styles.row}>
            {host && phase === 'upcoming' && (
              <Button
                label="Cancel the sit"
                variant="outline"
                disabled={busy}
                onPress={() => void confirmAction('Cancel this sit?', 'Those who joined will see it was cancelled.', 'Cancel it').then((ok) => (ok ? act(() => cancelSit(sit.id)) : undefined))}
              />
            )}
            {!host && (
              <>
                <Button label="Report" variant="text" onPress={() => void report()} />
                <Button label="Hide" variant="text" onPress={() => void hide()} />
                <Button label="Block" variant="text" onPress={() => void blockHost()} />
              </>
            )}
          </View>
        </>
      )}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
