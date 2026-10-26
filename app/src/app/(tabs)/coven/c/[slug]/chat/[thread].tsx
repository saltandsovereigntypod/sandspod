import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Sheet } from "../../../../../../components/altar/Sheet";
import { Button } from "../../../../../../components/Button";
import { confirmBlock } from "../../../../../../components/covens/Chat";
import {
  CovenThreadBody,
  useCovenThread,
} from "../../../../../../components/covens/CovenThread";
import {
  CovenScreen,
  covenHref,
} from "../../../../../../components/covens/CovenScreen";
import {
  CheckRow,
  Notice,
  SwitchRow,
} from "../../../../../../components/more/ui";
import * as api from "../../../../../../lib/covens/api";
import { withBlock } from "../../../../../../lib/covens/blocking";
import {
  addToGroup,
  COVEN_THREAD,
  fetchConversations,
  leaveConversation,
  muteConversation,
  type Conversation,
  type ConversationMember,
} from "../../../../../../lib/covens/chat";
import { useCoven } from "../../../../../../lib/covens/CovenContext";
import {
  errorMessage,
  type Member,
} from "../../../../../../lib/covens/model";
import { markRead } from "../../../../../../lib/covens/unread";
import { colors, fonts, type } from "../../../../../../theme";

// One conversation, like a phone's messages: the whole coven's chat, a
// one-to-one chat, or a small group. The newest message is at the bottom by
// the box you write in; press and hold a message for more. The ⓘ button
// mutes it, shows who's in it, brings people in (a group), or leaves it.
export default function Thread() {
  const { thread } = useLocalSearchParams<{ thread: string }>();
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const conversationId =
    thread && thread !== COVEN_THREAD ? String(thread) : null;
  const [info, setInfo] = useState(false);
  const chat = useCovenThread(conversationId);
  const { conversation, members, actions, count } = chat;

  // While it's open, everything in it is read.
  useFocusEffect(
    useCallback(() => {
      if (!covenId) return;
      markRead(covenId, conversationId, true);
      return () => markRead(covenId, conversationId, false);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- a new message marks it read again
    }, [covenId, conversationId, count]),
  );

  if (coven.status !== "ready" || !(coven.perms.member || coven.perms.site)) {
    return (
      <CovenScreen title="Messages" need="member" chat={false}>
        <Text style={type.caption}>Opening…</Text>
      </CovenScreen>
    );
  }

  const { title, subtitle } = chat;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace(covenHref(coven.slug, "chat"))
          }
          accessibilityRole="button"
          accessibilityLabel="Back to messages"
          hitSlop={10}
          style={styles.headerButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text
            accessibilityRole="header"
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        {conversationId ? (
          <Pressable
            onPress={() => setInfo(true)}
            accessibilityRole="button"
            accessibilityLabel="About this conversation"
            hitSlop={10}
            style={styles.headerButton}
          >
            <Text style={styles.info}>ⓘ</Text>
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <CovenThreadBody thread={chat} conversationId={conversationId} />
      </KeyboardAvoidingView>
      {conversationId && conversation && (
        <ConversationInfo
          visible={info}
          conversation={conversation}
          members={members}
          onClose={() => setInfo(false)}
          onChanged={(next) => chat.setMembers(next)}
          onReport={(person) => {
            setInfo(false);
            // Let the info sheet finish closing before the report sheet opens.
            setTimeout(
              () =>
                actions.report({
                  target_type: "member",
                  target_id: person,
                  coven_id: conversation.coven_id,
                  target_user_id: person,
                  label: coven.nameOf(person),
                }),
              Platform.OS === "ios" ? 450 : 0,
            );
          }}
        />
      )}
      {actions.sheet}
    </SafeAreaView>
  );
}

function ConversationInfo({
  visible,
  conversation,
  members,
  onClose,
  onChanged,
  onReport,
}: {
  visible: boolean;
  conversation: Conversation;
  members: ConversationMember[];
  onClose: () => void;
  onChanged: (members: ConversationMember[]) => void;
  /** Report someone in this conversation to the site's moderators. */
  onReport: (userId: string) => void;
}) {
  const coven = useCoven();
  const mine = members.find((m) => m.user_id === coven.userId);
  const inIt = members.filter((m) => !m.left_at);
  const [adding, setAdding] = useState(false);
  const [everyone, setEveryone] = useState<Member[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (adding && coven.snapshot?.coven.id)
      api
        .fetchMembers(coven.snapshot.coven.id)
        .then(setEveryone)
        .catch(() => {});
  }, [adding, coven.snapshot?.coven.id]);

  const reload = async () => {
    const { members: people } = await fetchConversations(conversation.coven_id);
    onChanged(people.filter((m) => m.conversation_id === conversation.id));
  };
  const blocks = coven.me?.blocks ?? [];
  const block = async (userId: string, on: boolean) => {
    setMessage(null);
    try {
      if (on) await api.block(coven.userId!, userId);
      else await api.unblock(coven.userId!, userId);
      if (coven.me)
        coven.setMe({ ...coven.me, blocks: withBlock(coven.me.blocks, userId, on) });
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };
  const act = async (work: () => Promise<unknown>) => {
    setMessage(null);
    try {
      await work();
      await reload();
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={
        conversation.kind === "group"
          ? conversation.name || "Group"
          : "Conversation"
      }
      eyebrow={coven.snapshot?.coven.name}
    >
      <SwitchRow
        label="Mute"
        detail="No phone notifications from this conversation"
        value={!!mine?.muted}
        onChange={(muted) =>
          void act(() => muteConversation(conversation.id, muted))
        }
        last
      />
      <Text style={type.eyebrow}>
        {conversation.kind === "group"
          ? `${inIt.length} in this group`
          : "In this conversation"}
      </Text>
      {inIt.map((m) =>
        m.user_id === coven.userId ? (
          <Text key={m.user_id} style={type.body}>
            You
          </Text>
        ) : (
          <View key={m.user_id} style={styles.person}>
            <Text style={[type.body, styles.personName]}>
              {coven.nameOf(m.user_id)}
            </Text>
            <Button
              label="Report"
              variant="text"
              onPress={() => onReport(m.user_id)}
            />
            <Button
              label={blocks.includes(m.user_id) ? "Unblock" : "Block"}
              variant="text"
              onPress={() =>
                blocks.includes(m.user_id)
                  ? void block(m.user_id, false)
                  : confirmBlock(
                      coven.nameOf(m.user_id),
                      () => void block(m.user_id, true),
                    )
              }
            />
          </View>
        ),
      )}
      {conversation.kind === "group" &&
        (adding ? (
          <>
            {everyone
              .filter((m) => !inIt.some((x) => x.user_id === m.user_id))
              .map((m) => (
                <CheckRow
                  key={m.user_id}
                  label={coven.nameOf(m.user_id)}
                  value={chosen.includes(m.user_id)}
                  onChange={(on) =>
                    setChosen((list) =>
                      on
                        ? [...list, m.user_id]
                        : list.filter((x) => x !== m.user_id),
                    )
                  }
                />
              ))}
            <Button
              label={
                chosen.length ? `Add ${chosen.length}` : "Choose who to add"
              }
              onPress={() =>
                void act(async () => {
                  await addToGroup(conversation.id, chosen);
                  setChosen([]);
                  setAdding(false);
                })
              }
              disabled={!chosen.length}
            />
          </>
        ) : (
          <Button
            label="Add people"
            variant="outline"
            onPress={() => setAdding(true)}
          />
        ))}
      {message && <Notice>{message}</Notice>}
      {!!mine && !mine.left_at && (
        <Button
          label={
            conversation.kind === "group"
              ? "Leave the group"
              : "Leave this conversation"
          }
          variant="text"
          onPress={() =>
            Alert.alert(
              "Leave?",
              "You won’t see new messages here. Someone can bring you back into a group, or start a new chat with you.",
              [
                { text: "Stay", style: "cancel" },
                {
                  text: "Leave",
                  style: "destructive",
                  onPress: () =>
                    void act(async () => {
                      await leaveConversation(conversation.id);
                      onClose();
                      router.replace(covenHref(coven.slug, "chat"));
                    }),
                },
              ],
            )
          }
        />
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  fill: { flex: 1 },
  person: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  personName: { flex: 1, minWidth: 120 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  back: { fontSize: 32, color: colors.gold, marginTop: -4 },
  info: { fontSize: 22, color: colors.gold },
  headerText: { flex: 1, alignItems: "center" },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.cream },
  subtitle: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  list: { paddingVertical: 8 },
  loading: { marginTop: 40 },
  empty: { textAlign: "center", padding: 24 },
});
