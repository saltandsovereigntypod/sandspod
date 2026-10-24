import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Pill, Pills } from '../../../components/covens/ui';
import { Card, Chips, Field, MoreScreen, Notice } from '../../../components/more/ui';
import * as api from '../../../lib/covens/api';
import { errorMessage, filterDirectory, relativeTime, REPORT_REASONS, type Coven, type Profile } from '../../../lib/covens/model';
import { useSession } from '../../../lib/session';
import { supabase } from '../../../lib/supabase';
import { colors, radius, type } from '../../../theme';

const VIEWS = [
  { value: 'reports', label: 'Reports' },
  { value: 'covens', label: 'Covens' },
  { value: 'bans', label: 'Site bans' },
  { value: 'moderators', label: 'Moderators' },
] as const;
type View_ = (typeof VIEWS)[number]['value'];

const FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All' },
] as const;

const STATUSES = [
  { value: 'active', label: 'Open' },
  { value: 'suspended', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
] as const;

const reasonLabel = (value: string) => REPORT_REASONS.find((r) => r.value === value)?.label ?? value;

// Coven moderation, for Salt & Sovereignty's moderators, as on the website
// (covens/moderation/): every report, every coven (to open, pause or archive
// it), site bans, and, for admins, who the moderators are. Moderators can
// also open any coven and act on its chat, altars and members from there.
// The database answers these only for site moderators and admins.
export default function Moderation() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [me, setMe] = useState<api.Me | null>(null);
  const [view, setView] = useState<View_>('reports');
  const [names, setNames] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userId) api.fetchMe(userId).then(setMe).catch((error) => setMessage(errorMessage(error)));
  }, [userId]);

  const loadNames = useCallback(async (ids: (string | null | undefined)[]) => {
    const wanted = [...new Set(ids.filter((id): id is string => !!id))];
    if (!wanted.length) return;
    const { data } = await supabase.from('coven_profiles').select('user_id,display_name').in('user_id', wanted);
    setNames((prev) => ({ ...prev, ...Object.fromEntries(((data ?? []) as Pick<Profile, 'user_id' | 'display_name'>[]).map((p) => [p.user_id, p.display_name])) }));
  }, []);
  const nameOf = (id: string | null | undefined) => (id ? names[id] || 'A member' : 'a deleted account');

  const frame = (body: React.ReactNode) => (
    <MoreScreen title="Coven moderation" eyebrow="Covens" back={'/coven' as Href} backLabel="Back to Covens">
      {body}
    </MoreScreen>
  );
  if (!userId) return frame(<Text style={type.body}>Sign in to moderate covens.</Text>);
  if (!me) return frame(message ? <Notice>{message}</Notice> : <ActivityIndicator color={colors.gold} />);
  if (!me.siteModerator) return frame(<Notice>This is for Salt &amp; Sovereignty’s moderators.</Notice>);

  const views = me.admin ? VIEWS : VIEWS.filter((v) => v.value !== 'moderators');
  return frame(
    <>
      <Text style={type.caption}>Open any coven to read its chat and altars, remove messages and act on its members. Reports come here, never to coven leaders.</Text>
      <Chips label="Moderation" options={views} value={view} onChange={setView} />
      {view === 'reports' && <Reports userId={userId} nameOf={nameOf} loadNames={loadNames} />}
      {view === 'covens' && <Covens nameOf={nameOf} loadNames={loadNames} />}
      {view === 'bans' && <Bans userId={userId} nameOf={nameOf} loadNames={loadNames} />}
      {view === 'moderators' && me.admin && <Moderators />}
    </>,
  );
}

type Names = { nameOf: (id: string | null | undefined) => string; loadNames: (ids: (string | null | undefined)[]) => Promise<void> };

function Reports({ userId, nameOf, loadNames }: Names & { userId: string }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('open');
  const [rows, setRows] = useState<api.Report[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await api.fetchReports(filter);
      setRows(list);
      await loadNames(list.flatMap((r) => [r.reporter_id, r.target_user_id, r.resolved_by]));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [filter, loadNames]);
  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, work: () => Promise<unknown>, done: string, reload = true) => {
    setBusy(id);
    setMessage(null);
    try {
      await work();
      if (reload) await load();
      setMessage(done);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(null);
  };
  const confirm = (title: string, body: string, yes: string, then: () => void) =>
    Alert.alert(title, body, [
      { text: 'Cancel', style: 'cancel' },
      { text: yes, style: 'destructive', onPress: then },
    ]);

  return (
    <>
      <Chips label="Show" options={FILTERS} value={filter} onChange={setFilter} />
      {message && <Notice>{message}</Notice>}
      {!rows ? (
        <ActivityIndicator color={colors.gold} />
      ) : !rows.length ? (
        <Text style={type.caption}>No {filter === 'all' ? '' : `${filter} `}reports.</Text>
      ) : (
        rows.map((r) => {
          const note = notes[r.id] ?? r.resolution_note ?? '';
          return (
            <Card key={r.id}>
              <Pills>
                <Pill label={r.status} tone={r.status === 'open' ? 'warn' : undefined} />
                <Pill label={r.target_type.replace('_', ' ')} />
                <Pill label={reasonLabel(r.reason)} />
              </Pills>
              <Text style={type.caption}>
                {relativeTime(r.created_at)} · reported by {nameOf(r.reporter_id)}
                {r.covens ? ` · ${r.covens.name}` : ''}
              </Text>
              {!!r.target_user_id && <Text style={type.body}>About: {nameOf(r.target_user_id)}</Text>}
              {!!r.snapshot && (
                <View style={styles.quote}>
                  <Text style={type.body}>{r.snapshot}</Text>
                </View>
              )}
              {!!r.details && <Text style={type.body}>Reporter’s note: {r.details}</Text>}
              {!!r.resolution_note && r.status !== 'open' && (
                <Text style={type.caption}>
                  Resolution: {r.resolution_note}
                  {r.resolved_by ? ` · ${nameOf(r.resolved_by)}` : ''}
                </Text>
              )}
              <Field label="Note" value={note} onChangeText={(v) => setNotes((n) => ({ ...n, [r.id]: v }))} multiline maxLength={2000} />
              <View style={styles.actions}>
                <Button label="Mark reviewing" variant="outline" onPress={() => void act(r.id, () => api.resolveReport(r.id, userId, 'reviewing', note), 'Marked reviewing.')} disabled={busy === r.id} />
                <Button label="Resolved" onPress={() => void act(r.id, () => api.resolveReport(r.id, userId, 'resolved', note), 'Resolved.')} disabled={busy === r.id} />
                <Button label="Dismiss" variant="outline" onPress={() => void act(r.id, () => api.resolveReport(r.id, userId, 'dismissed', note), 'Dismissed.')} disabled={busy === r.id} />
                {r.covens && <Button label="Open the coven" variant="text" onPress={() => router.push(`/coven/c/${r.covens!.slug}` as Href)} />}
                {r.target_type === 'message' && !!r.target_id && (
                  <Button label="Remove the message" variant="text" onPress={() => void act(r.id, () => api.removeMessage(r.target_id!), 'Message removed. Its words stay in this report.', false)} disabled={busy === r.id} />
                )}
                {!!r.target_user_id && (
                  <Button
                    label="Ban from all covens"
                    variant="text"
                    onPress={() =>
                      confirm(`Ban ${nameOf(r.target_user_id)} from all covens?`, 'They keep their Sanctuary account but can’t join, speak in or tend any coven.', 'Ban', () =>
                        void act(r.id, () => api.banEveryCoven(r.target_user_id!, userId, note || reasonLabel(r.reason)), 'Banned.', false),
                      )
                    }
                    disabled={busy === r.id}
                  />
                )}
                {!!r.coven_id && (
                  <Button
                    label="Pause the coven"
                    variant="text"
                    onPress={() =>
                      confirm('Pause this coven?', 'Members can still read it, but nothing new can be added until you reopen it.', 'Pause', () =>
                        void act(r.id, () => api.moderateCoven(r.coven_id!, 'suspended', note), 'Coven paused.', false),
                      )
                    }
                    disabled={busy === r.id}
                  />
                )}
              </View>
            </Card>
          );
        })
      )}
    </>
  );
}

function Covens({ nameOf, loadNames }: Names) {
  const [rows, setRows] = useState<Coven[] | null>(null);
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api
      .fetchAllCovens()
      .then(async (list) => {
        setRows(list);
        await loadNames(list.map((c) => c.founder_id));
      })
      .catch((error) => setMessage(errorMessage(error)));
  }, [loadNames]);

  const list = useMemo(() => filterDirectory(rows ?? [], query), [rows, query]);
  const setStatus = async (coven: Coven, status: Coven['status']) => {
    setMessage(null);
    try {
      await api.moderateCoven(coven.id, status, note);
      setRows((prev) => (prev ?? []).map((c) => (c.id === coven.id ? { ...c, status, moderation_note: note.trim() || c.moderation_note } : c)));
      setMessage(`${coven.name} is ${status === 'active' ? 'open' : status === 'suspended' ? 'paused' : 'archived'}.`);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  return (
    <>
      <Field label="Search covens" value={query} onChangeText={setQuery} />
      <Field label="Note shown to a coven’s members when you pause it (optional)" value={note} onChangeText={setNote} maxLength={1000} />
      {message && <Notice>{message}</Notice>}
      {!rows ? (
        <ActivityIndicator color={colors.gold} />
      ) : (
        list.map((c) => (
          <Card key={c.id}>
            <Pressable onPress={() => router.push(`/coven/c/${c.slug}` as Href)} accessibilityRole="link" accessibilityLabel={`Open ${c.name}`}>
              <Text style={[type.cardTitle, styles.link]}>{c.name}</Text>
            </Pressable>
            <Text style={type.caption}>
              {c.joining} · {c.visibility} · founded by {nameOf(c.founder_id)} · {Number(c.member_count) || 0} members
            </Text>
            {!!c.moderation_note && <Text style={type.caption}>Note: {c.moderation_note}</Text>}
            <Chips label={`Status of ${c.name}`} options={STATUSES} value={(c.status as (typeof STATUSES)[number]['value']) ?? 'active'} onChange={(s) => void setStatus(c, s)} />
          </Card>
        ))
      )}
    </>
  );
}

function Bans({ userId, nameOf, loadNames }: Names & { userId: string }) {
  const [rows, setRows] = useState<api.Ban[] | null>(null);
  const [id, setId] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await api.fetchBans();
      setRows(list);
      await loadNames(list.flatMap((b) => [b.user_id, b.banned_by]));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [loadNames]);
  useEffect(() => {
    void load();
  }, [load]);

  const ban = async () => {
    setMessage(null);
    if (!/^[0-9a-fA-F-]{36}$/.test(id.trim())) return setMessage('That doesn’t look like an account id.');
    try {
      await api.banEveryCoven(id.trim(), userId, reason);
      setId('');
      setReason('');
      await load();
      setMessage('Banned.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  return (
    <>
      <Text style={type.caption}>Banned people keep their Sanctuary account but can’t take part in any coven. Ban someone from a report, or by their account id here.</Text>
      <Card>
        <Field label="Account id" value={id} onChangeText={setId} autoCapitalize="none" autoCorrect={false} />
        <Field label="Reason" value={reason} onChangeText={setReason} maxLength={1000} />
        <Button label="Ban" onPress={() => void ban()} disabled={!id.trim()} />
      </Card>
      {message && <Notice>{message}</Notice>}
      {!rows ? (
        <ActivityIndicator color={colors.gold} />
      ) : !rows.length ? (
        <Text style={type.caption}>No one is banned.</Text>
      ) : (
        rows.map((b) => (
          <Card key={b.user_id}>
            <Text style={type.body}>{nameOf(b.user_id)}</Text>
            <Text style={type.caption}>
              {b.reason || 'No reason given'} · {relativeTime(b.created_at)}
              {b.banned_by ? ` · by ${nameOf(b.banned_by)}` : ''}
            </Text>
            <Text style={type.caption} selectable>
              {b.user_id}
            </Text>
            <Button
              label="Lift the ban"
              variant="outline"
              onPress={() =>
                void api
                  .liftBan(b.user_id)
                  .then(load)
                  .then(() => setMessage('Ban lifted.'))
                  .catch((error) => setMessage(errorMessage(error)))
              }
            />
          </Card>
        ))
      )}
    </>
  );
}

function Moderators() {
  const [rows, setRows] = useState<api.Moderator[] | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setRows((await api.fetchModerators()) ?? []);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const set = async (who: string, enabled: boolean) => {
    setMessage(null);
    try {
      await api.setModerator(who, enabled);
      setEmail('');
      await load();
      setMessage(enabled ? 'They’re a moderator now.' : 'They’ve stood down.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };
  return (
    <>
      <Text style={type.caption}>Moderators can see and act on every coven. Admins can also name moderators.</Text>
      <Card>
        <Field label="Their Sanctuary account email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Button label="Make moderator" onPress={() => void set(email, true)} disabled={!email.trim()} />
      </Card>
      {message && <Notice>{message}</Notice>}
      {!rows ? (
        <ActivityIndicator color={colors.gold} />
      ) : (
        rows.map((m) => (
          <Card key={m.user_id}>
            <Text style={type.body}>{m.display_name || m.email || m.user_id}</Text>
            <Text style={type.caption}>
              {m.role}
              {m.email ? ` · ${m.email}` : ''}
            </Text>
            {m.role === 'moderator' && !!m.email && <Button label="Stand down" variant="outline" onPress={() => void set(m.email!, false)} />}
          </Card>
        ))
      )}
    </>
  );
}

const styles = StyleSheet.create({
  quote: { borderLeftWidth: 2, borderLeftColor: colors.gold, paddingLeft: 10, borderRadius: radius.button },
  actions: { gap: 8 },
  link: { color: colors.gold },
});
