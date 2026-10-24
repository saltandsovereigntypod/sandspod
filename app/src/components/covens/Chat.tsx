import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sheet } from '../altar/Sheet';
import { Button } from '../Button';
import { Field, Notice } from '../more/ui';
import { useReport } from './ui';
import * as api from '../../lib/covens/api';
import { useCoven } from '../../lib/covens/CovenContext';
import { chatMessages, errorMessage, relativeTime, type Message } from '../../lib/covens/model';
import { markRead, useUnread } from '../../lib/covens/unread';
import { colors, fonts, radius, type } from '../../theme';

/**
 * The coven's chat: the latest messages and a box to write in. Press and hold
 * a message to report it, block its writer, or (your own, or as a coven
 * moderator) remove it. Used on the Chat screen and in the chat sheet that
 * opens from the bubble on every coven screen.
 */
export function ChatMessages({ compact }: { compact?: boolean }) {
  const coven = useCoven();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const report = useReport(coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const blocked = useMemo(() => coven.me?.blocks ?? [], [coven.me?.blocks]);
  const { loadMessages } = coven;

  useEffect(() => {
    if (!covenId || coven.messages) return;
    loadMessages().catch((error) => setMessage(errorMessage(error)));
  }, [covenId, coven.messages, loadMessages]);

  const list = useMemo(() => chatMessages(coven.messages ?? [], blocked).slice(-150), [coven.messages, blocked]);
  const canTalk = coven.standing.ok && coven.perms.chat;

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
    <View style={styles.wrap}>
      {!coven.messages && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {coven.messages && !list.length && <Text style={type.caption}>No one has spoken yet. Say hello.</Text>}
      <View style={styles.list} accessibilityRole="list">
        {(compact ? list.slice(-60) : list).map((m) => {
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
      {canTalk ? (
        <View style={styles.compose}>
          <Field label="Message" value={draft} onChangeText={setDraft} multiline maxLength={2000} placeholder="Say something to the coven" />
          <Button label={sending ? 'Sending…' : 'Send'} onPress={send} disabled={sending || !draft.trim()} />
        </View>
      ) : coven.perms.member ? (
        <Text style={type.caption}>{coven.standing.ok ? 'Your position doesn’t talk in the chat here. The coven’s head decides who does.' : coven.standing.reasons[0]}</Text>
      ) : null}
      {message && <Notice>{message}</Notice>}
      {report.sheet}
    </View>
  );
}

/**
 * The chat bubble on every coven screen: how many messages you haven't read,
 * and the chat itself over whatever you're on.
 */
export function ChatBubble() {
  const coven = useCoven();
  const insets = useSafeAreaInsets();
  const covenId = coven.snapshot?.coven.id ?? null;
  const unread = useUnread(covenId);
  const [open, setOpen] = useState(false);
  const count = coven.messages?.length ?? 0;

  // While it's open, everything that arrives is read.
  useEffect(() => {
    if (!covenId || !open) return;
    markRead(covenId, true);
    return () => markRead(covenId, false);
  }, [covenId, open, count]);

  if (!covenId || !(coven.perms.member || coven.perms.site)) return null;
  const here = coven.presence.filter((p) => p.user_id !== coven.userId);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Coven chat${unread ? `, ${unread} unread` : ''}`}
        style={({ pressed }) => [styles.fab, { bottom: 16 + Math.max(0, insets.bottom - 34) }, pressed && styles.pressed]}
      >
        <Text style={styles.fabIcon} accessibilityElementsHidden importantForAccessibility="no">
          ✉
        </Text>
        <Text style={styles.fabLabel}>Chat</Text>
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
          </View>
        )}
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} eyebrow={here.length ? `Here now: ${here.map((p) => p.name).slice(0, 4).join(', ')}` : coven.snapshot?.coven.name} title="Coven chat">
        <ChatMessages compact />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  loading: { marginTop: 20 },
  list: { gap: 8 },
  bubble: { alignSelf: 'flex-start', maxWidth: '88%', backgroundColor: colors.surface, borderRadius: radius.tile, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.goldLine },
  who: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  body: { color: colors.cream },
  quiet: { fontStyle: 'italic' },
  compose: { gap: 8 },
  fab: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: radius.chip,
    backgroundColor: colors.night,
    borderWidth: 1,
    borderColor: colors.gold,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  fabIcon: { fontSize: 18, color: colors.gold },
  fabLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.cream },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  badgeText: { fontFamily: fonts.body, fontSize: 11, color: colors.night, fontWeight: '700' },
  pressed: { opacity: 0.8 },
});
