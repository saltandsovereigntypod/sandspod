import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import * as api from '../../lib/covens/api';
import { roleEntries, cleanPlan } from '../../lib/covens/builder';
import { useCoven } from '../../lib/covens/CovenContext';
import type { Member, Ritual } from '../../lib/covens/model';
import { addNoticeKey, maySendNotice, noticeEntries, noticeKeyLabel, NOTE_MAX, reachLine, sendLabel, sentLine, waitLine, type NoticePreview } from '../../lib/covens/notices';
import { whoEntries, whoSuggestions } from '../../lib/covens/picker';
import { colors, type } from '../../theme';
import { Button } from '../Button';
import { Card, Field, Notice } from '../more/ui';
import { SearchPicker } from './SearchPicker';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * "Send a notification" on a scheduled gathering's page, a rite's or a
 * meeting's (lib/covens/notices.ts; supabase/functions/coven-notify): its
 * note that it's on the calendar, if that never went (gatherings planned
 * before these notes), else a reminder, with a short note of your own and,
 * for this send only, who it goes to. For those with 'notices', the coven's
 * moderators and head, and whoever planned it. As the website's
 * (covens/coven/rituals.js sendNoticeHtml).
 */
export function SendNotice({ ritual }: { ritual: Ritual }) {
  const coven = useCoven();
  const { loadNames } = coven;
  const covenId = coven.snapshot?.coven.id;
  const ranks = useMemo(() => coven.snapshot?.ranks ?? [], [coven.snapshot?.ranks]);
  const plan = useMemo(() => cleanPlan(ritual.plan, ritual.kind === 'meeting' ? 'meeting' : 'rite'), [ritual.plan, ritual.kind]);
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [who, setWho] = useState<string[]>([]);
  const [changing, setChanging] = useState(false);
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState<NoticePreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const allowed = maySendNotice(ritual, coven.perms, coven.userId);

  // Counted again whenever who changes, and after each send.
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!open || !allowed) return;
    let off = false;
    api
      .previewNotice(ritual.id, who)
      .then((p) => {
        if (!off) setPreview(p);
      })
      .catch(() => {
        if (off) return;
        setPreview(null);
        setMessage('Notifications by hand aren’t ready for this coven yet.');
      });
    return () => {
      off = true;
    };
  }, [open, allowed, ritual.id, who, tick]);
  useEffect(() => {
    if (!changing || members || !covenId) return;
    void api
      .fetchMembers(covenId)
      .then((list) => {
        setMembers(list);
        void loadNames(list.map((m) => m.user_id));
      })
      .catch(() => setMembers([]));
  }, [changing, members, covenId, loadNames]);

  const entries = useMemo(
    () => noticeEntries([...roleEntries(plan.roles), ...whoEntries(ranks, (members ?? []).map((m) => ({ id: m.user_id, name: coven.nameOf(m.user_id) })))], { parts: plan.roles.length > 0 }).filter((e) => e.key !== 'none'),
    [plan.roles, ranks, members, coven],
  );
  if (!allowed) return null;

  const wait = waitLine(preview?.next_at);
  const send = async () => {
    setBusy(true);
    setMessage(null);
    const result = await api.sendNotice(ritual.id, note.trim(), changing ? who : null);
    setMessage(sentLine(result, preview?.next_at));
    if (result && !result.error) {
      setNote('');
      setWho([]);
      setChanging(false);
    }
    refresh();
    setBusy(false);
  };

  if (!open) return <Button label="Send a notification" variant="outline" onPress={() => setOpen(true)} />;
  return (
    <Card>
      <Text style={type.eyebrow}>Send a notification</Text>
      {!preview && !message && <ActivityIndicator color={colors.gold} />}
      {!!preview && (
        <View>
          <Text style={type.body}>{reachLine(preview.recipients)}</Text>
          <Text style={type.caption}>
            {preview.announced ? 'It goes as a reminder of when it is.' : 'It goes as the note that it’s on the coven’s calendar, so later changes to it are sent too.'}
          </Text>
        </View>
      )}
      {changing ? (
        <SearchPicker
          label="Who it goes to, this once"
          chips={who.map((k) => ({ key: k, label: cap(noticeKeyLabel(k, { roles: plan.roles, ranks, nameOf: coven.nameOf })) }))}
          entries={entries}
          suggestions={[...plan.roles.map((r) => `role:${r.id}`).slice(0, 2), ...whoSuggestions(entries, 3)]}
          onAdd={(entry) => setWho((list) => addNoticeKey(list, entry.key))}
          onRemove={(key) => setWho((list) => list.filter((k) => k !== key))}
          placeholder="The whole coven, Elders, the Chair…"
          empty="As usual for this gathering."
        />
      ) : (
        <Button label="Choose who, this once" variant="text" onPress={() => setChanging(true)} />
      )}
      <Field label={`A note of your own (optional, up to ${NOTE_MAX} characters)`} value={note} onChangeText={(t) => setNote(t.slice(0, NOTE_MAX))} maxLength={NOTE_MAX} placeholder="Bring a candle and something for the shared meal." />
      {!!wait && <Notice tone="muted">{wait}</Notice>}
      <Button label={busy ? 'Sending…' : sendLabel(preview)} onPress={() => void send()} disabled={busy || !preview || !!wait || preview.recipients === 0} />
      <Button label="Not now" variant="text" onPress={() => setOpen(false)} />
      {message && <Notice>{message}</Notice>}
    </Card>
  );
}
