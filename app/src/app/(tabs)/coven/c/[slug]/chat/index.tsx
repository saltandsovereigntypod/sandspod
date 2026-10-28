import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../../../../../../components/Button";
import { Avatar } from "../../../../../../components/covens/Chat";
import {
  CovenScreen,
  covenHref,
} from "../../../../../../components/covens/CovenScreen";
import {
  Notice,
  Section,
} from "../../../../../../components/more/ui";
import {
  conversationTitle,
  COVEN_THREAD,
  fetchConversations,
  fetchPreviews,
  type Conversation,
  type ConversationMember,
} from "../../../../../../lib/covens/chat";
import { useCoven } from "../../../../../../lib/covens/CovenContext";
import { errorMessage, type Message } from "../../../../../../lib/covens/model";
import { blockedPreview } from "../../../../../../lib/covens/blocking";
import { listTime } from "../../../../../../lib/covens/thread";
import { refreshUnread, useUnread } from "../../../../../../lib/covens/unread";
import { colors, fonts, radius, type } from "../../../../../../theme";

// The coven's messages: its whole chat first, then your one-to-one chats and
// groups, newest first, each with its last message and how many you haven't
// read. Start a new one from the top; choose your phone notifications below.
export default function Messages() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [members, setMembers] = useState<ConversationMember[]>([]);
  const [previews, setPreviews] = useState<Record<string, Message>>({});
  const [message, setMessage] = useState<string | null>(null);
  const { onMessage, loadNames } = coven;

  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const { conversations: list, members: people } =
        await fetchConversations(covenId);
      const mine = list.filter((c) =>
        people.some(
          (m) =>
            m.conversation_id === c.id &&
            m.user_id === coven.userId &&
            !m.left_at,
        ),
      );
      setConversations(mine);
      setMembers(people);
      setPreviews(
        await fetchPreviews(
          covenId,
          mine.map((c) => c.id),
        ),
      );
      void loadNames(people.map((m) => m.user_id));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- per coven
  }, [covenId, coven.userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  // A new message moves its conversation to the top (and a new conversation appears).
  useEffect(
    () =>
      onMessage((m, eventType) => {
        if (eventType !== "INSERT") return;
        const key = m.conversation_id ?? COVEN_THREAD;
        setPreviews((p) => ({ ...p, [key]: m }));
        if (m.conversation_id) {
          setConversations((list) => {
            const found = list.find((c) => c.id === m.conversation_id);
            if (!found) {
              void load();
              void refreshUnread();
              return list;
            }
            return [
              { ...found, last_message_at: m.created_at },
              ...list.filter((c) => c.id !== found.id),
            ];
          });
        }
      }),
    [onMessage, load],
  );

  const open = (thread: string) =>
    router.push(covenHref(coven.slug, `chat/${thread}`));
  const canTalk = coven.standing.ok && coven.perms.chat;
  const blocks = coven.me?.blocks ?? [];

  return (
    <CovenScreen title="Messages" need="member" chat={false} onRefresh={load}>
      {canTalk && (
        <Button
          label="New message"
          onPress={() => router.push(covenHref(coven.slug, "chat/new"))}
        />
      )}
      {message && <Notice>{message}</Notice>}
      <View style={styles.list} accessibilityRole="list">
        <ThreadRow
          title={coven.snapshot?.coven.name ?? "The coven"}
          detail={blockedPreview(
            previews[COVEN_THREAD],
            coven.userId,
            coven.nameOf,
            true,
            blocks,
          )}
          time={listTime(previews[COVEN_THREAD]?.created_at)}
          covenId={covenId}
          conversationId={null}
          group
          tag="Everyone"
          onPress={() => open(COVEN_THREAD)}
        />
        {conversations.map((c) => (
          <ThreadRow
            key={c.id}
            title={conversationTitle(c, members, coven.userId, coven.nameOf)}
            detail={blockedPreview(
              previews[c.id],
              coven.userId,
              coven.nameOf,
              c.kind === "group",
              blocks,
            )}
            time={listTime(previews[c.id]?.created_at ?? c.last_message_at)}
            covenId={covenId}
            conversationId={c.id}
            group={c.kind === "group"}
            muted={members.some(
              (m) =>
                m.conversation_id === c.id &&
                m.user_id === coven.userId &&
                m.muted,
            )}
            onPress={() => open(c.id)}
          />
        ))}
      </View>
      {!conversations.length && (
        <Text style={type.caption}>
          Message someone one to one, or start a small group, with “New
          message”. No phone numbers needed.
        </Text>
      )}
      <Notifications />
    </CovenScreen>
  );
}

function ThreadRow({
  title,
  detail,
  time,
  covenId,
  conversationId,
  group,
  tag,
  muted,
  onPress,
}: {
  title: string;
  detail: string;
  time: string;
  covenId: string | undefined;
  conversationId: string | null;
  group?: boolean;
  tag?: string;
  muted?: boolean;
  onPress: () => void;
}) {
  const unread = useUnread(covenId, conversationId);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${tag ? `, ${tag.toLowerCase()}` : ""}. ${detail}${unread ? `. ${unread} unread` : ""}${muted ? ". Muted" : ""}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar label={title} group={group} />
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <Text
            style={[styles.rowTitle, unread > 0 && styles.bold]}
            numberOfLines={1}
          >
            {title}
            {tag ? <Text style={styles.tag}>{`  ${tag}`}</Text> : null}
            {muted ? <Text style={styles.tag}>{"  Muted"}</Text> : null}
          </Text>
          <Text style={styles.rowTime}>{time}</Text>
        </View>
        <View style={styles.rowTop}>
          <Text
            style={[styles.rowDetail, unread > 0 && styles.detailUnread]}
            numberOfLines={2}
          >
            {detail}
          </Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unread > 99 ? "99+" : unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// Phone notifications for this coven live in Settings → Notifications &
// reminders → Covens (opened here, inside the Coven tab).
function Notifications() {
  return (
    <Section label="Phone notifications">
      <Button
        label="Notification settings ›"
        variant="outline"
        accessibilityHint="The coven’s chat, your conversations, its gatherings and applications, and this phone"
        onPress={() => router.push({ pathname: "/coven/settings/notifications", params: { section: "covens" } })}
      />
      <Text style={type.caption}>
        Mute a single conversation from its ⓘ button.
      </Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  list: { gap: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  pressed: { opacity: 0.7 },
  rowText: { flex: 1, gap: 2 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowTitle: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.cream,
  },
  bold: { fontWeight: "700" },
  tag: { fontSize: 12, color: colors.muted, fontWeight: "400" },
  rowTime: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  rowDetail: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  detailUnread: { color: colors.cream },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.chip,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
  },
  badgeText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.night,
    fontWeight: "700",
  },
});
