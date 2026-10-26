import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, ChatBubble } from './Chat';
import { covenHref } from './CovenScreen';
import { CovenThreadBody, useCovenThread } from './CovenThread';
import { badgeLabel, chatPanelFrame, myConversations } from '../../lib/covens/altarPanel';
import { conversationTitle, COVEN_THREAD, fetchConversations, type Conversation, type ConversationMember } from '../../lib/covens/chat';
import { useCoven } from '../../lib/covens/CovenContext';
import { markRead, useUnread } from '../../lib/covens/unread';
import { colors, fonts, radius, type } from '../../theme';

// The coven's chat in a small window over a coven altar, so you can talk with
// the others without leaving the altar. It sits along the bottom (down the
// side on a wide screen), so the altar stays in view and can still be tended
// above it. The coven's chat first; "Chats" switches to one of your
// conversations, and "Open" goes to the full Messages screen. The thread
// itself is the Messages screen's own (CovenThread.tsx): who may write,
// blocks, agreements and coven readings work the same.

/** The chat button and its window, for a coven altar's overlay. */
export function AltarChat() {
  const [open, setOpen] = useState(false);
  // Once opened it stays mounted (hidden), so the report sheet inside it is never torn down mid-close.
  const [opened, setOpened] = useState(false);
  return (
    <>
      {opened && <ChatPanel visible={open} onClose={() => setOpen(false)} />}
      {!open && (
        <ChatBubble
          onPress={() => {
            setOpened(true);
            setOpen(true);
          }}
        />
      )}
    </>
  );
}

function ChatPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const coven = useCoven();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const frame = chatPanelFrame(width, height - insets.top);
  const [thread, setThread] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);

  const openFull = () => {
    onClose();
    router.push(covenHref(coven.slug, `chat/${thread ?? COVEN_THREAD}`));
  };

  return (
    <KeyboardAvoidingView
      pointerEvents="box-none"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[StyleSheet.absoluteFill, frame.side === 'right' ? styles.holderRight : styles.holderBottom, !visible && styles.hidden]}
    >
      <View
        accessibilityLabel="Messages"
        style={[
          styles.panel,
          frame.side === 'right'
            ? [styles.panelRight, { width: frame.width, marginTop: insets.top, paddingRight: insets.right }]
            : [styles.panelBottom, { height: frame.height }],
        ]}
      >
        {choosing ? (
          <ThreadPicker
            current={thread}
            onPick={(id) => {
              setThread(id);
              setChoosing(false);
            }}
            onBack={() => setChoosing(false)}
            onClose={onClose}
          />
        ) : (
          <ThreadPane key={thread ?? COVEN_THREAD} conversationId={thread} visible={visible} onChoose={() => setChoosing(true)} onOpenFull={openFull} onClose={onClose} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function ThreadPane({
  conversationId,
  visible,
  onChoose,
  onOpenFull,
  onClose,
}: {
  conversationId: string | null;
  visible: boolean;
  onChoose: () => void;
  onOpenFull: () => void;
  onClose: () => void;
}) {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id ?? null;
  const chat = useCovenThread(conversationId);
  const { count } = chat;
  // What's unread elsewhere (the coven's other threads), shown on "Chats".
  const all = useUnread(covenId);

  // While the window shows this thread, everything in it is read.
  useEffect(() => {
    if (!covenId || !visible) return;
    markRead(covenId, conversationId, true);
    return () => markRead(covenId, conversationId, false);
  }, [covenId, conversationId, visible, count]);

  return (
    <>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
            {chat.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {chat.subtitle}
          </Text>
        </View>
        <HeadButton label={all > 0 ? `Chats ${badgeLabel(all)}` : 'Chats'} accessibilityLabel={`Your chats${all > 0 ? `, ${badgeLabel(all)} unread` : ''}`} onPress={onChoose} />
        <HeadButton label="Open" accessibilityLabel="Open the full Messages screen" onPress={onOpenFull} />
        <HeadButton label="Close" accessibilityLabel="Close messages and go back to the altar" onPress={onClose} strong />
      </View>
      <View style={styles.body}>
        <CovenThreadBody thread={chat} conversationId={conversationId} compact />
      </View>
      {chat.actions.sheet}
    </>
  );
}

/** The coven's chat and your conversations in this coven, to choose which the window shows. */
function ThreadPicker({ current, onPick, onBack, onClose }: { current: string | null; onPick: (id: string | null) => void; onBack: () => void; onClose: () => void }) {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const [list, setList] = useState<{ conversations: Conversation[]; members: ConversationMember[] } | null>(null);
  const { loadNames } = coven;

  useEffect(() => {
    if (!covenId) return;
    fetchConversations(covenId)
      .then((found) => {
        setList(found);
        void loadNames(found.members.map((m) => m.user_id));
      })
      .catch(() => setList({ conversations: [], members: [] }));
  }, [covenId, loadNames]);

  const mine = list ? myConversations(list.conversations, list.members, coven.userId) : [];
  return (
    <>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text accessibilityRole="header" style={styles.title}>
            Your chats
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {coven.snapshot?.coven.name}
          </Text>
        </View>
        <HeadButton label="Back" accessibilityLabel="Back to the conversation" onPress={onBack} />
        <HeadButton label="Close" accessibilityLabel="Close messages and go back to the altar" onPress={onClose} strong />
      </View>
      <ScrollView style={styles.body} contentContainerStyle={styles.pickList} keyboardShouldPersistTaps="handled">
        <PickRow title={coven.snapshot?.coven.name ?? 'The coven'} tag="Everyone" group covenId={covenId} conversationId={null} current={current === null} onPress={() => onPick(null)} />
        {mine.map((c) => (
          <PickRow
            key={c.id}
            title={conversationTitle(c, list?.members ?? [], coven.userId, coven.nameOf)}
            group={c.kind === 'group'}
            covenId={covenId}
            conversationId={c.id}
            current={current === c.id}
            onPress={() => onPick(c.id)}
          />
        ))}
        {list && !mine.length && <Text style={[type.caption, styles.pickNote]}>Your one-to-one chats and groups in this coven will be listed here. Start one from Messages.</Text>}
      </ScrollView>
    </>
  );
}

function PickRow({
  title,
  tag,
  group,
  covenId,
  conversationId,
  current,
  onPress,
}: {
  title: string;
  tag?: string;
  group?: boolean;
  covenId: string | undefined;
  conversationId: string | null;
  current: boolean;
  onPress: () => void;
}) {
  const unread = useUnread(covenId, conversationId);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: current }}
      accessibilityLabel={`${title}${tag ? `, ${tag.toLowerCase()}` : ''}${unread ? `. ${badgeLabel(unread)} unread` : ''}`}
      style={({ pressed }) => [styles.pickRow, current && styles.pickCurrent, pressed && styles.pressed]}
    >
      <Avatar label={title} group={group} />
      <Text style={[styles.pickTitle, unread > 0 && styles.bold]} numberOfLines={1}>
        {title}
        {tag ? <Text style={styles.tag}>{`  ${tag}`}</Text> : null}
      </Text>
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel(unread)}</Text>
        </View>
      )}
    </Pressable>
  );
}

function HeadButton({ label, accessibilityLabel, onPress, strong }: { label: string; accessibilityLabel: string; onPress: () => void; strong?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [styles.headButton, strong && styles.headButtonStrong, pressed && styles.pressed]}
    >
      <Text style={[styles.headButtonText, strong && styles.headButtonTextStrong]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  holderBottom: { justifyContent: 'flex-end' },
  holderRight: { alignItems: 'flex-end' },
  hidden: { display: 'none' },
  panel: {
    backgroundColor: colors.ground,
    borderColor: colors.goldLine,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 12,
  },
  // Shrinks with the keyboard rather than running off the top of the screen.
  panelBottom: { alignSelf: 'stretch', flexShrink: 1, maxHeight: '100%', borderTopWidth: 1, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  panelRight: { flex: 1, borderLeftWidth: 1, borderTopLeftRadius: radius.card, borderBottomLeftRadius: radius.card },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  headText: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.display, fontSize: 17, color: colors.cream },
  subtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  headButton: { minHeight: 36, paddingHorizontal: 10, justifyContent: 'center', borderRadius: radius.chip, borderWidth: 1, borderColor: colors.hairline },
  headButtonStrong: { borderColor: colors.gold },
  headButtonText: { fontFamily: fonts.body, fontSize: 13, color: colors.cream },
  headButtonTextStrong: { color: colors.gold },
  body: { flex: 1 },
  pickList: { padding: 8, gap: 2 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: radius.tile },
  pickCurrent: { backgroundColor: colors.surface },
  pickTitle: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  pickNote: { padding: 10 },
  bold: { fontWeight: '700' },
  tag: { fontSize: 12, color: colors.muted, fontWeight: '400' },
  badge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  badgeText: { fontFamily: fonts.body, fontSize: 11, color: colors.night, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
