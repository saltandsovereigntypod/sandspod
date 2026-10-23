import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { useReport } from '../../../../../../components/covens/ui';
import { Field, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { chatMessages, errorMessage, relativeTime, type Message } from '../../../../../../lib/covens/model';
import { colors, fonts, radius, type } from '../../../../../../theme';

// The coven's live chat. Press and hold a message to report it, block its
// writer, or (your own, or as a coven moderator) remove it.
export default function Gathering() {
  const coven = useCoven();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const report = useReport(coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const blocked = useMemo(() => coven.me?.blocks ?? [], [coven.me?.blocks]);
  const { loadMessages, track } = coven;

  useEffect(() => {
    if (!covenId) return;
    loadMessages().catch((error) => setMessage(errorMessage(error)));
    track('gathering');
    return () => track('coven');
  }, [covenId, loadMessages, track]);

  const list = useMemo(() => chatMessages(coven.messages ?? [], blocked).slice(-150), [coven.messages, blocked]);
  const here = coven.presence.filter((p) => p.place === 'gathering');

  const send = async () => {
    const body = draft.trim();
    if (!body || !covenId) return;
    setSending(true);
    setMessage(null);
    try {
      const row = await api.sendMessage(covenId, body);
      coven.setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      setDraft('');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setSending(false);
  };

  const actions = (m: Message) => {
    const mine = m.user_id === coven.userId;
    const name = coven.nameOf(m.user_id);
    const buttons: Parameters<typeof Alert.alert>[2] = [];
    if (mine || coven.perms.moderate || coven.perms.site)
      buttons.push({
        text: 'Remove message',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.removeMessage(m.id);
            coven.setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, deleted_at: new Date().toISOString() } : x)));
          } catch (error) {
            setMessage(errorMessage(error));
          }
        },
      });
    if (!mine && m.user_id) {
      buttons.push({ text: 'Report', onPress: () => report.open({ target_type: 'message', target_id: m.id, coven_id: m.coven_id, target_user_id: m.user_id, label: `${name}’s message` }) });
      buttons.push({
        text: `Block ${name}`,
        onPress: async () => {
          try {
            await api.block(coven.userId!, m.user_id!);
            if (coven.me) coven.setMe({ ...coven.me, blocks: [...coven.me.blocks, m.user_id!] });
          } catch (error) {
            setMessage(errorMessage(error));
          }
        },
      });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(name, m.body.slice(0, 140), buttons);
  };

  return (
    <CovenScreen title="Gathering" need="standing" onRefresh={loadMessages}>
      <Text style={type.caption}>
        {here.length ? `Here now: ${here.map((p) => p.name).join(', ')}` : 'Talk with your coven. Messages stay for the coven to read.'}
      </Text>
      {!coven.messages && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {coven.messages && !list.length && <Text style={type.caption}>No one has spoken yet. Say hello.</Text>}
      <View style={styles.list} accessibilityRole="list">
        {list.map((m) => {
          const mine = m.user_id === coven.userId;
          if (m.hidden)
            return (
              <Text key={m.id} style={[type.caption, styles.quiet]}>
                A message from someone you blocked.
              </Text>
            );
          if (m.deleted_at)
            return (
              <Text key={m.id} style={[type.caption, styles.quiet]}>
                A message was removed.
              </Text>
            );
          return (
            <Pressable
              key={m.id}
              onLongPress={() => actions(m)}
              accessibilityRole="button"
              accessibilityHint="Press and hold for more"
              accessibilityLabel={`${coven.nameOf(m.user_id)}, ${relativeTime(m.created_at)}: ${m.body}`}
              accessibilityActions={[{ name: 'longpress', label: 'More' }]}
              onAccessibilityAction={() => actions(m)}
              style={[styles.bubble, mine && styles.mine]}
            >
              <Text style={styles.who}>
                {mine ? 'You' : coven.nameOf(m.user_id)} · {relativeTime(m.created_at)}
                {m.edited_at ? ' · edited' : ''}
              </Text>
              <Text style={[type.body, styles.body]}>{m.body}</Text>
            </Pressable>
          );
        })}
      </View>
      {coven.standing.ok && (
        <View style={styles.compose}>
          <Field label="Message" value={draft} onChangeText={setDraft} multiline maxLength={2000} placeholder="Say something to the coven" />
          <Button label={sending ? 'Sending…' : 'Send'} onPress={send} disabled={sending || !draft.trim()} />
        </View>
      )}
      {message && <Notice>{message}</Notice>}
      {report.sheet}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  list: { gap: 8 },
  bubble: { alignSelf: 'flex-start', maxWidth: '88%', backgroundColor: colors.surface, borderRadius: radius.tile, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.goldLine },
  who: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  body: { color: colors.cream },
  quiet: { fontStyle: 'italic' },
  compose: { gap: 8 },
});
