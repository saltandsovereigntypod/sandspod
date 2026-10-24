import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import {
  Composer,
  ThreadRow,
  useMessageActions,
} from "../../../../../../components/covens/Chat";
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
import {
  addToGroup,
  conversationTitle,
  COVEN_THREAD,
  fetchConversations,
  fetchThread,
  leaveConversation,
  muteConversation,
  othersIn,
  sendMessage,
  type Conversation,
  type ConversationMember,
} from "../../../../../../lib/covens/chat";
import { useCoven } from "../../../../../../lib/covens/CovenContext";
import {
  chatMessages,
  errorMessage,
  type Member,
  type Message,
} from "../../../../../../lib/covens/model";
import { threadItems } from "../../../../../../lib/covens/thread";
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
  const [own, setOwn] = useState<Message[] | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [members, setMembers] = useState<ConversationMember[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [info, setInfo] = useState(false);
  const { loadMessages, onMessage, loadNames } = coven;

  // The coven's chat lives in the coven's state; a conversation is loaded here.
  useEffect(() => {
    if (!covenId) return;
    if (!conversationId) {
      if (!coven.messages)
        loadMessages().catch((e) => setMessage(errorMessage(e)));
      return;
    }
    fetchThread(covenId, conversationId)
      .then((list) => {
        setOwn(list);
        void loadNames(list.map((m) => m.user_id));
      })
      .catch((e) => setMessage(errorMessage(e)));
    fetchConversations(covenId)
      .then(({ conversations, members: people }) => {
        setConversation(
          conversations.find((c) => c.id === conversationId) ?? null,
        );
        setMembers(people.filter((m) => m.conversation_id === conversationId));
        void loadNames(people.map((m) => m.user_id));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per thread
  }, [covenId, conversationId]);

  // New messages in this conversation arrive live.
  useEffect(() => {
    if (!conversationId) return;
    return onMessage((m, eventType) => {
      if (m.conversation_id !== conversationId) return;
      setOwn((list) => {
        if (!list) return list;
        if (eventType === "INSERT")
          return list.some((x) => x.id === m.id) ? list : [...list, m];
        return list.map((x) => (x.id === m.id ? { ...x, ...m } : x));
      });
    });
  }, [conversationId, onMessage]);

  const raw = conversationId ? own : coven.messages;
  const count = raw?.length ?? 0;
  // While it's open, everything in it is read.
  useFocusEffect(
    useCallback(() => {
      if (!covenId) return;
      markRead(covenId, conversationId, true);
      return () => markRead(covenId, conversationId, false);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- a new message marks it read again
    }, [covenId, conversationId, count]),
  );

  const blocked = useMemo(() => coven.me?.blocks ?? [], [coven.me?.blocks]);
  const group = !conversationId || conversation?.kind === "group";
  const items = useMemo(
    () =>
      threadItems(
        chatMessages(raw ?? [], blocked).slice(-300),
        coven.userId,
        group,
      ).reverse(),
    [raw, blocked, coven.userId, group],
  );
  const actions = useMessageActions((id) => {
    const gone = (list: Message[]) =>
      list.map((x) =>
        x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x,
      );
    if (conversationId) setOwn((list) => (list ? gone(list) : list));
    else coven.setMessages(gone);
  }, setMessage);

  if (coven.status !== "ready" || !(coven.perms.member || coven.perms.site)) {
    return (
      <CovenScreen title="Messages" need="member" chat={false}>
        <Text style={type.caption}>Opening…</Text>
      </CovenScreen>
    );
  }

  const title = conversationId
    ? conversation
      ? conversationTitle(conversation, members, coven.userId, coven.nameOf)
      : "Messages"
    : (coven.snapshot?.coven.name ?? "Coven chat");
  const others = conversationId
    ? othersIn(conversationId, members, coven.userId)
    : [];
  const subtitle = conversationId
    ? conversation?.kind === "group"
      ? others.map((id) => coven.nameOf(id)).join(", ")
      : "Only the two of you can see this"
    : (() => {
        const here = coven.presence.filter((p) => p.user_id !== coven.userId);
        return here.length
          ? `Here now: ${here
              .map((p) => p.name)
              .slice(0, 3)
              .join(", ")}`
          : "Everyone in the coven";
      })();
  const mine = members.find((m) => m.user_id === coven.userId);
  const canTalk =
    coven.standing.ok &&
    coven.perms.chat &&
    (!conversationId || (!!mine && !mine.left_at));

  const send = async (body: string) => {
    if (!covenId) return false;
    setMessage(null);
    try {
      const row = await sendMessage(covenId, conversationId, body);
      if (conversationId)
        setOwn((list) =>
          list && !list.some((m) => m.id === row.id) ? [...list, row] : list,
        );
      else
        coven.setMessages((prev) =>
          prev.some((m) => m.id === row.id) ? prev : [...prev, row],
        );
      return true;
    } catch (error) {
      setMessage(errorMessage(error));
      return false;
    }
  };

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
        {!raw ? (
          <ActivityIndicator color={colors.gold} style={styles.loading} />
        ) : (
          <FlatList
            inverted
            data={items}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <ThreadRow
                item={item}
                nameOf={(id) => coven.nameOf(id)}
                onLongPress={actions.open}
              />
            )}
            contentContainerStyle={styles.list}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              items.length === 0 ? (
                <Text style={[type.caption, styles.empty]}>
                  {conversationId
                    ? "Say hello. Only those in this conversation will see it."
                    : "No one has spoken yet. Say hello to the coven."}
                </Text>
              ) : null
            }
          />
        )}
        {message && <Notice>{message}</Notice>}
        <Composer
          onSend={send}
          disabled={!canTalk}
          note={
            !coven.standing.ok
              ? coven.standing.reasons[0]
              : !coven.perms.chat
                ? "Your position doesn’t talk in the chat here. The coven’s head decides who does."
                : "You’ve left this conversation."
          }
        />
      </KeyboardAvoidingView>
      {conversationId && conversation && (
        <ConversationInfo
          visible={info}
          conversation={conversation}
          members={members}
          onClose={() => setInfo(false)}
          onChanged={(next) => setMembers(next)}
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
}: {
  visible: boolean;
  conversation: Conversation;
  members: ConversationMember[];
  onClose: () => void;
  onChanged: (members: ConversationMember[]) => void;
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
      {inIt.map((m) => (
        <Text key={m.user_id} style={type.body}>
          {m.user_id === coven.userId ? "You" : coven.nameOf(m.user_id)}
        </Text>
      ))}
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
