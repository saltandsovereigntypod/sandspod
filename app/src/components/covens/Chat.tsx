import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { covenHref } from './CovenScreen';
import { useReport } from './ui';
import * as api from '../../lib/covens/api';
import { useCoven } from '../../lib/covens/CovenContext';
import type { Message } from '../../lib/covens/model';
import type { ThreadItem } from '../../lib/covens/thread';
import { useUnread } from '../../lib/covens/unread';
import { useAccessibleText } from '../../lib/accessibility/store';
import { colors, fonts, radius, type } from '../../theme';

// The coven's messages look and feel like a phone's: bubbles, yours on the
// right, a box at the bottom to write in, and a bubble button on every coven
// screen that opens your conversations.

/** The chat button on every coven screen, with how many messages you haven't read. */
export function ChatBubble() {
  const coven = useCoven();
  const insets = useSafeAreaInsets();
  const covenId = coven.snapshot?.coven.id ?? null;
  const unread = useUnread(covenId);
  if (!covenId || !(coven.perms.member || coven.perms.site)) return null;
  return (
    <Pressable
      onPress={() => router.push(covenHref(coven.slug, 'chat'))}
      accessibilityRole="button"
      accessibilityLabel={`Messages${unread ? `, ${unread} unread` : ''}`}
      style={({ pressed }) => [styles.fab, { bottom: 16 + Math.max(0, insets.bottom - 34) }, pressed && styles.pressed]}
    >
      <Text style={styles.fabIcon} accessibilityElementsHidden importantForAccessibility="no">
        ✉
      </Text>
      <Text style={styles.fabLabel}>Messages</Text>
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Press and hold a message: remove (yours, or as a moderator), report, or block its writer. */
export function useMessageActions(onRemoved: (id: string) => void, onProblem: (message: string) => void) {
  const coven = useCoven();
  const report = useReport(coven.userId);
  const open = useCallback(
    (m: Message) => {
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
              onRemoved(m.id);
            } catch (error) {
              onProblem(error instanceof Error ? error.message : 'That message couldn’t be removed.');
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
              onProblem(error instanceof Error ? error.message : 'That didn’t work. Please try again.');
            }
          },
        });
      }
      buttons.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert(name, m.body.slice(0, 140), buttons);
    },
    [coven, report, onRemoved, onProblem],
  );
  return { open, sheet: report.sheet };
}

/** One row of a thread: a time between runs, or a bubble. */
export function ThreadRow({ item, nameOf, onLongPress }: { item: ThreadItem; nameOf: (id: string | null) => string; onLongPress: (m: Message) => void }) {
  const t = useAccessibleText();
  if (item.kind === 'time') return <Text style={styles.time}>{item.label}</Text>;
  const { message, mine, first, last, showName } = item;
  const quiet = message.hidden ? 'A message from someone you blocked.' : message.deleted_at ? 'Message removed' : null;
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, last && styles.rowLast]}>
      {showName && <Text style={styles.name}>{nameOf(message.user_id)}</Text>}
      <Pressable
        onLongPress={() => !quiet && onLongPress(message)}
        delayLongPress={300}
        accessibilityRole="text"
        accessibilityLabel={`${mine ? 'You' : nameOf(message.user_id)}: ${quiet ?? message.body}`}
        accessibilityHint={quiet ? undefined : 'Press and hold for more'}
        accessibilityActions={quiet ? undefined : [{ name: 'longpress', label: 'More' }]}
        onAccessibilityAction={() => !quiet && onLongPress(message)}
        style={[
          styles.bubble,
          mine ? styles.mine : styles.theirs,
          mine ? (first ? null : styles.mineJoinTop) : first ? null : styles.theirsJoinTop,
          mine ? (last ? styles.mineTail : styles.mineJoinBottom) : last ? styles.theirsTail : styles.theirsJoinBottom,
          !!quiet && styles.quietBubble,
        ]}
      >
        <Text style={[t(styles.text), mine ? styles.textMine : styles.textTheirs, !!quiet && styles.textQuiet]}>
          {quiet ?? message.body}
          {message.edited_at && !quiet ? <Text style={styles.edited}> (edited)</Text> : null}
        </Text>
      </Pressable>
    </View>
  );
}

/** The box at the bottom: write, and send with the arrow. */
export function Composer({ onSend, disabled, note }: { onSend: (body: string) => Promise<boolean>; disabled?: boolean; note?: string | null }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const t = useAccessibleText();
  const ready = !!draft.trim() && !sending && !disabled;
  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    const ok = await onSend(body);
    if (ok) setDraft('');
    setSending(false);
  };
  if (disabled) return note ? <Text style={[type.caption, styles.composerNote]}>{note}</Text> : null;
  return (
    <View style={styles.composer}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Message"
        placeholderTextColor={colors.tabInactive}
        multiline
        maxLength={2000}
        accessibilityLabel="Message"
        style={[t(styles.input)]}
      />
      <Pressable
        onPress={() => void send()}
        disabled={!ready}
        accessibilityRole="button"
        accessibilityLabel="Send"
        accessibilityState={{ disabled: !ready }}
        style={({ pressed }) => [styles.send, !ready && styles.sendOff, pressed && styles.pressed]}
      >
        <Text style={styles.sendIcon}>↑</Text>
      </Pressable>
    </View>
  );
}

/** A round initial, for the list of conversations. */
export function Avatar({ label, group }: { label: string; group?: boolean }) {
  return (
    <View style={[styles.avatar, group && styles.avatarGroup]} accessibilityElementsHidden importantForAccessibility="no">
      <Text style={styles.avatarText}>{group ? '✶' : (label.trim()[0] ?? '?').toUpperCase()}</Text>
    </View>
  );
}

const BUBBLE = 18;
const styles = StyleSheet.create({
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
  pressed: { opacity: 0.75 },
  time: { alignSelf: 'center', marginTop: 14, marginBottom: 6, fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  row: { paddingHorizontal: 12, marginTop: 2 },
  rowMine: { alignItems: 'flex-end' },
  rowTheirs: { alignItems: 'flex-start' },
  rowLast: { marginBottom: 6 },
  name: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginLeft: 12, marginBottom: 2, marginTop: 4 },
  bubble: { maxWidth: '78%', paddingHorizontal: 13, paddingVertical: 8, borderRadius: BUBBLE },
  mine: { backgroundColor: colors.gold },
  theirs: { backgroundColor: colors.surfaceRaised },
  mineJoinTop: { borderTopRightRadius: 6 },
  mineJoinBottom: { borderBottomRightRadius: 6 },
  mineTail: { borderBottomRightRadius: 4 },
  theirsJoinTop: { borderTopLeftRadius: 6 },
  theirsJoinBottom: { borderBottomLeftRadius: 6 },
  theirsTail: { borderBottomLeftRadius: 4 },
  quietBubble: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.hairline },
  text: { fontFamily: fonts.body, fontSize: 16, lineHeight: 21 },
  textMine: { color: colors.night },
  textTheirs: { color: colors.cream },
  textQuiet: { color: colors.muted, fontStyle: 'italic' },
  edited: { fontSize: 12, opacity: 0.7 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    backgroundColor: colors.night,
  },
  composerNote: { padding: 14, textAlign: 'center', backgroundColor: colors.night },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 9,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.hairline,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  sendOff: { opacity: 0.35 },
  sendIcon: { fontSize: 20, fontWeight: '700', color: colors.night, marginTop: -2 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.goldLine },
  avatarGroup: { backgroundColor: colors.night },
  avatarText: { fontFamily: fonts.body, fontSize: 18, color: colors.gold },
});
