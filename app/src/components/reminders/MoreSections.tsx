// Notifications & reminders → Ritual planning, Covens, Quiet hours & pause,
// and Daily practice.

import { useEffect, useMemo, useState } from 'react';
import { Platform, View } from 'react-native';

import { Button } from '../Button';

import { Body, Card, Chip, Chips, SectionLabel, Toggle, ui } from '../rituals/ui';
import { TimeRow } from './parts';
import { covenPlanning, dayKey } from '../../lib/reminders/plan';
import { BUNDLE_CHOICES, isPaused, PLAN_DAY_CHOICES, setGatheringsFor, setRequestsFor, timeLabel, withChange, type ReminderPrefs } from '../../lib/reminders/prefs';
import { covenNotifyRows, wantsCovenPush, type ChatChoice, type CovenNotifySource } from '../../lib/reminders/covenNotifications';
import { reviewsCoven } from '../../lib/reminders/covens';
import { fetchMyStandings } from '../../lib/covens/api';
import { fetchChatSettings, saveChatSettings } from '../../lib/covens/chat';
import { errorMessage } from '../../lib/covens/model';
import { covenPushOn, disableCovenPush, enableCovenPush } from '../../lib/covens/push';
import type { CovenSource } from '../../lib/reminders/plan';
import type { ReminderSettings } from '../../lib/reminders/schedule';

type Props = { prefs: ReminderPrefs; update: (next: ReminderPrefs) => void };

const daysWord = (d: number) => (d === 7 ? 'A week' : d === 14 ? 'Two weeks' : d === 21 ? 'Three weeks' : d === 30 ? 'A month' : `${d} days`);

export function PlanningSection({ prefs, update, covens, signedIn }: Props & { covens: CovenSource[]; signedIn: boolean }) {
  const p = prefs.planning;
  const set = (path: string, value: unknown) => update(withChange(prefs, `planning.${path}`, value));
  return (
    <>
      <View style={ui.gapSmall}>
        <SectionLabel>Your holidays</SectionLabel>
        <Card>
          <Toggle
            label="Remind me to plan a ritual"
            detail="Before each yearly holiday you’ve chosen under Holidays, unless you’ve already planned one for it"
            value={p.holidays}
            onChange={(on) => set('holidays', on)}
          />
          {p.holidays && (
            <Chips>
              {PLAN_DAY_CHOICES.map((d) => (
                <Chip key={d} label={`${daysWord(d)} before`} selected={p.days === d} onPress={() => set('days', d)} />
              ))}
            </Chips>
          )}
          <TimeRow label="At" minutes={p.at} onChange={(at) => set('at', at)} />
        </Card>
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>Your covens</SectionLabel>
        <Card>
          <Toggle
            label="For my covens’ holidays and rites"
            detail="On for covens you lead (as head of the coven, or in a position that leads or schedules rites), and earlier; for others, only if you turn it on"
            value={p.covens}
            onChange={(on) => set('covens', on)}
          />
          {p.covens && (
            <>
              <Body muted>For covens you lead</Body>
              <Chips>
                {PLAN_DAY_CHOICES.map((d) => (
                  <Chip key={d} label={`${daysWord(d)} before`} selected={p.leaderDays === d} onPress={() => set('leaderDays', d)} />
                ))}
              </Chips>
              {covens.map((coven) => {
                const own = covenPlanning(prefs, coven);
                return (
                  <View key={coven.id} style={ui.gapSmall}>
                    <Toggle
                      label={coven.name}
                      detail={`${coven.leader ? 'You lead it' : 'A member'} · ${own.on ? `${daysWord(own.days).toLowerCase()} ahead` : 'off'}`}
                      value={own.on}
                      onChange={(on) => set('perCoven', { ...p.perCoven, [coven.id]: { ...p.perCoven[coven.id], on } })}
                    />
                    {own.on && (
                      <Chips>
                        {PLAN_DAY_CHOICES.map((d) => (
                          <Chip key={d} label={daysWord(d)} selected={own.days === d} onPress={() => set('perCoven', { ...p.perCoven, [coven.id]: { ...p.perCoven[coven.id], on: true, days: d } })} />
                        ))}
                      </Chips>
                    )}
                  </View>
                );
              })}
              {!covens.length && <Body muted>{signedIn ? 'Your covens will be listed here once they’ve loaded.' : 'Sign in to hear about your covens.'}</Body>}
              <Body muted>Rites you’ve said you’ll come to are always reminded the day before and an hour before.</Body>
            </>
          )}
        </Card>
      </View>
      <Body muted>Coven gatherings and new applications are under Covens.</Body>
    </>
  );
}

/** Your covens, whether you review each, and each one's chat settings. */
async function readCovens(userId: string): Promise<{ sources: CovenNotifySource[]; chat: Record<string, ChatChoice | undefined>; problem: string | null }> {
  try {
    const standings = await fetchMyStandings(userId);
    const choices = await Promise.all(standings.map((st) => fetchChatSettings(st.coven.id, userId).catch(() => undefined)));
    return {
      sources: standings.map((st) => ({ id: st.coven.id, slug: st.coven.slug, name: st.coven.name, reviewer: reviewsCoven(st, userId) })),
      chat: Object.fromEntries(standings.map((st, i) => [st.coven.id, choices[i]])),
      problem: null,
    };
  } catch (error) {
    return { sources: [], chat: {}, problem: errorMessage(error) };
  }
}

/**
 * Covens: for each coven, its chat and your conversations there (the coven's
 * chat settings), its gatherings and, where you review them, new applications
 * (the synced reminder choices), and whether this phone gets coven
 * notifications at all. Each is saved where it always was.
 */
export function CovensSection({ prefs, update, userId }: Props & { userId: string | null }) {
  const [sources, setSources] = useState<CovenNotifySource[] | null>(null);
  const [chat, setChat] = useState<Record<string, ChatChoice | undefined>>({});
  const [device, setDevice] = useState<boolean | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (userId)
      readCovens(userId).then((found) => {
        if (!active) return;
        setSources(found.sources);
        setChat(found.chat);
        if (found.problem) setNote(found.problem);
      });
    covenPushOn().then((on) => active && setDevice(on));
    return () => {
      active = false;
    };
  }, [userId]);

  const rows = useMemo(() => covenNotifyRows(sources ?? [], prefs, chat), [sources, prefs, chat]);
  const ids = rows.map((r) => r.id);
  const reviewing = rows.filter((r) => r.applications !== null).map((r) => r.id);

  const turnOnDevice = async () => {
    const result = await enableCovenPush();
    setDevice(result.ok);
    if (!result.ok)
      setNote(
        result.reason === 'denied'
          ? 'Notifications are turned off for this app in your phone’s Settings. Turn them on there, then try again.'
          : result.reason === 'offline'
            ? 'Couldn’t reach your account. Check your connection and try again.'
            : Platform.OS === 'web'
              ? 'Your choices are saved. Coven notifications ring on phones with the Salt & Sovereignty app.'
              : 'Your choices are saved. Phone notifications start with the next version of the app from the App Store or Google Play.',
      );
  };
  // Turning something on signs this phone up, as a coven's Messages did.
  const andDevice = (on: boolean) => {
    if (on && device === false && Platform.OS !== 'web') void turnOnDevice();
  };
  const changeChat = async (covenId: string, next: ChatChoice) => {
    if (!userId) return;
    setChat((prev) => ({ ...prev, [covenId]: next }));
    setNote(null);
    try {
      await saveChatSettings(covenId, userId, next);
    } catch (error) {
      setNote(errorMessage(error));
    }
    andDevice(next.notify_coven || next.notify_direct);
  };

  if (!userId) return <Body muted>Sign in to hear from your covens: their chat, gatherings and applications.</Body>;
  if (!sources) return <Body muted>Reading your covens…</Body>;

  return (
    <>
      <View style={ui.gapSmall}>
        <SectionLabel>On this phone</SectionLabel>
        <Card>
          {device ? (
            <Toggle
              label="Coven notifications on this phone"
              detail="Turn off to stop every coven notification here; your choices below are kept"
              value
              onChange={() =>
                void disableCovenPush().then(() => {
                  setDevice(false);
                  setNote('This phone won’t get coven notifications. Turn them back on here to start again.');
                })
              }
            />
          ) : (
            <>
              <Body muted>
                {Platform.OS === 'web'
                  ? 'Coven notifications ring on phones with the Salt & Sovereignty app. Your choices here follow you there.'
                  : 'This phone isn’t signed up for coven notifications yet.'}
              </Body>
              {Platform.OS !== 'web' && wantsCovenPush(rows, prefs) && (
                <Button label="Turn on notifications on this phone" variant="outline" onPress={() => void turnOnDevice()} />
              )}
            </>
          )}
          {!!note && <Body muted>{note}</Body>}
        </Card>
      </View>

      {rows.map((row) => (
        <View key={row.id} style={ui.gapSmall}>
          <SectionLabel>{row.name}</SectionLabel>
          <Card>
            {row.chat !== null && row.conversations !== null ? (
              <>
                <Toggle label="The coven’s chat" detail="New messages to everyone in the coven" value={row.chat} onChange={(v) => void changeChat(row.id, { notify_coven: v, notify_direct: row.conversations ?? true })} />
                <Toggle label="Your conversations" detail="One-to-one chats and groups you’re in" value={row.conversations} onChange={(v) => void changeChat(row.id, { notify_coven: row.chat ?? true, notify_direct: v })} />
              </>
            ) : (
              <Body muted>Its chat settings couldn’t be read just now.</Body>
            )}
            <Toggle
              label="Gatherings"
              detail="A rite or meeting you’re asked to hear about goes on the calendar, moves, or comes off it"
              value={row.gatherings}
              onChange={(on) => {
                update(setGatheringsFor(prefs, row.id, on, ids));
                andDevice(on);
              }}
            />
            {row.applications !== null && (
              <Toggle
                label="New applications"
                detail="Someone asks to join, or to advance, here (you review them)"
                value={row.applications}
                onChange={(on) => {
                  update(setRequestsFor(prefs, row.id, on, reviewing));
                  andDevice(on);
                }}
              />
            )}
          </Card>
        </View>
      ))}
      {!rows.length && <Body muted>When you join a coven, its notifications are chosen here.</Body>}

      <View style={ui.gapSmall}>
        <SectionLabel>Every coven</SectionLabel>
        <Card>
          <Toggle
            label="Tell me about my covens’ gatherings"
            detail="Off turns gatherings off for every coven; on, each coven above as you chose"
            value={prefs.gatherings.on}
            onChange={(on) => update(withChange(prefs, 'gatherings.on', on))}
          />
          <Toggle
            label="Tell me about new applications"
            detail="In covens you review. Off turns them off for every coven"
            value={prefs.requests.on}
            onChange={(on) => update(withChange(prefs, 'requests.on', on))}
          />
          <Toggle
            label="When my own is answered"
            detail="Your application to a coven, or your request to advance"
            value={prefs.requests.answers}
            onChange={(on) => {
              update(withChange(prefs, 'requests.answers', on));
              andDevice(on);
            }}
          />
          <Toggle
            label="Invitations"
            detail="Someone invites you to a coven"
            value={prefs.invitations.on}
            onChange={(on) => {
              update(withChange(prefs, 'invitations.on', on));
              andDevice(on);
            }}
          />
          <Toggle
            label="When my invitation is accepted"
            detail="Someone you invited joins the coven"
            value={prefs.invitations.accepted}
            onChange={(on) => {
              update(withChange(prefs, 'invitations.accepted', on));
              andDevice(on);
            }}
          />
          <Toggle
            label="Training messages"
            detail="A message on a step of your training, from your mentor or the coven’s leaders, or from someone you mentor"
            value={prefs.training.on}
            onChange={(on) => {
              update(withChange(prefs, 'training.on', on));
              andDevice(on);
            }}
          />
          <Body muted>Each coven chooses who hears about which gatherings. Mute a single conversation from its ⓘ button in the coven’s Messages.</Body>
        </Card>
      </View>
    </>
  );
}

const PAUSES: { label: string; days: number | null }[] = [
  { label: 'Until I turn them back on', days: null },
  { label: 'A day', days: 1 },
  { label: 'Three days', days: 3 },
  { label: 'A week', days: 7 },
  { label: 'Two weeks', days: 14 },
  { label: 'A month', days: 30 },
];

export function QuietSection({ prefs, update }: Props) {
  const now = new Date();
  const paused = isPaused(prefs, now);
  const until = (days: number | null) => {
    if (days == null) return '';
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
    return dayKey(d);
  };
  return (
    <>
      <View style={ui.gapSmall}>
        <SectionLabel>Pause</SectionLabel>
        <Card>
          <Toggle
            label="Pause all reminders"
            detail={paused ? (prefs.pausedUntil ? `Back on the morning of ${new Date(`${prefs.pausedUntil}T00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}` : 'Until you turn them back on') : 'Nothing rings while paused; your choices are kept'}
            value={paused}
            onChange={(on) => update(withChange(withChange(prefs, 'paused', on), 'pausedUntil', on ? until(7) : ''))}
          />
          {paused && (
            <Chips>
              {PAUSES.map((p) => (
                <Chip key={p.label} label={p.label} selected={prefs.pausedUntil === until(p.days)} onPress={() => update(withChange(prefs, 'pausedUntil', until(p.days)))} />
              ))}
            </Chips>
          )}
        </Card>
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>Quiet hours</SectionLabel>
        <Card>
          <Toggle
            label="Keep quiet at night"
            detail={`Reminders that would ring between ${timeLabel(prefs.quiet.start)} and ${timeLabel(prefs.quiet.end)} come when quiet hours end; one about a set time (a ritual, a rite, a candle burning down) comes just before they begin`}
            value={prefs.quiet.on}
            onChange={(on) => update(withChange(prefs, 'quiet.on', on))}
          />
          {prefs.quiet.on && (
            <>
              <TimeRow label="From" minutes={prefs.quiet.start} onChange={(m) => update(withChange(prefs, 'quiet.start', m))} />
              <TimeRow label="Until" minutes={prefs.quiet.end} onChange={(m) => update(withChange(prefs, 'quiet.end', m))} />
            </>
          )}
        </Card>
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>A busy day</SectionLabel>
        <Card>
          <Toggle
            label="Gather a busy day into one note"
            detail="Holidays, planning and tending on the same day come together in the morning, instead of one after another. The moon, your rituals, rites and daily practice still come on their own."
            value={prefs.bundle.on}
            onChange={(on) => update(withChange(prefs, 'bundle.on', on))}
          />
          {prefs.bundle.on && (
            <Chips>
              {BUNDLE_CHOICES.map((n) => (
                <Chip key={n} label={`More than ${n}`} selected={prefs.bundle.max === n} onPress={() => update(withChange(prefs, 'bundle.max', n))} />
              ))}
            </Chips>
          )}
        </Card>
      </View>
    </>
  );
}

export function PracticeSection({ settings, change }: { settings: ReminderSettings; change: (c: Partial<ReminderSettings>) => void }) {
  return (
    <Card>
      <Toggle label="Morning devotion" detail="A short prompt to begin the day, from Daily devotion" value={settings.devotionMorning} onChange={(devotionMorning) => change({ devotionMorning })} />
      {settings.devotionMorning && <TimeRow minutes={settings.devotionMorningAt} onChange={(devotionMorningAt) => change({ devotionMorningAt })} />}
      <Toggle label="Evening devotion" detail="A short prompt to close the day" value={settings.devotionEvening} onChange={(devotionEvening) => change({ devotionEvening })} />
      {settings.devotionEvening && <TimeRow minutes={settings.devotionEveningAt} onChange={(devotionEveningAt) => change({ devotionEveningAt })} />}
      <Toggle label="Last night’s dream" detail="A gentle morning nudge to write it down, for Dreams in your Grimoire" value={settings.dreamMorning} onChange={(dreamMorning) => change({ dreamMorning })} />
      {settings.dreamMorning && <TimeRow minutes={settings.dreamMorningAt} onChange={(dreamMorningAt) => change({ dreamMorningAt })} />}
      <Body muted>Kept on this phone.</Body>
    </Card>
  );
}
