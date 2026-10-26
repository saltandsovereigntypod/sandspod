import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';

import { BeginCovenReading, CovenReadingCard } from './CovenReading';
import { Composer, ThreadRow, useMessageActions } from './Chat';
import { Notice } from '../more/ui';
import { blockedPartner } from '../../lib/covens/blocking';
import { conversationTitle, fetchConversations, fetchThread, othersIn, sendMessage, type Conversation, type ConversationMember } from '../../lib/covens/chat';
import { useCoven } from '../../lib/covens/CovenContext';
import { chatMessages, errorMessage, type Message } from '../../lib/covens/model';
import { cardBody, covenReadings, drawCovenCard, openingBody, type CovenReading } from '../../lib/covens/reading';
import { threadItems } from '../../lib/covens/thread';
import { drawOptions } from '../../lib/divination/draw';
import { useMySettings } from '../../lib/settings/store';
import { colors, type } from '../../theme';

// One thread of a coven's messages, wherever it's shown: the Messages screen
// (chat/[thread].tsx) and the small chat window over a coven altar
// (ChatPanel.tsx) both use this, so who may write, blocks, coven readings and
// live messages work the same in each. `conversationId` null is the whole
// coven's chat. One thread per mount: give it a `key` to switch threads.

/** Everything one thread needs: its messages, who's in it, whether you can write, and sending. */
export function useCovenThread(conversationId: string | null) {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const [own, setOwn] = useState<Message[] | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [members, setMembers] = useState<ConversationMember[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const { loadMessages, onMessage, loadNames } = coven;
  const { settings } = useMySettings();

  // The coven's chat lives in the coven's state; a conversation is loaded here.
  useEffect(() => {
    if (!covenId) return;
    if (!conversationId) {
      if (!coven.messages) loadMessages().catch((e) => setMessage(errorMessage(e)));
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
        setConversation(conversations.find((c) => c.id === conversationId) ?? null);
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
        if (eventType === 'INSERT') return list.some((x) => x.id === m.id) ? list : [...list, m];
        return list.map((x) => (x.id === m.id ? { ...x, ...m } : x));
      });
    });
  }, [conversationId, onMessage]);

  const raw = conversationId ? own : coven.messages;
  const blocked = useMemo(() => coven.me?.blocks ?? [], [coven.me?.blocks]);
  const group = !conversationId || conversation?.kind === 'group';
  const items = useMemo(() => threadItems(chatMessages(raw ?? [], blocked).slice(-300), coven.userId, group).reverse(), [raw, blocked, coven.userId, group]);
  // Coven readings in this thread, by their opening message, with the cards drawn into them so far.
  const readings = useMemo(() => {
    const list = covenReadings(chatMessages(raw ?? [], blocked));
    return new Map(list.map((r) => [r.id, r]));
  }, [raw, blocked]);
  const actions = useMessageActions((id) => {
    const gone = (list: Message[]) => list.map((x) => (x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x));
    if (conversationId) setOwn((list) => (list ? gone(list) : list));
    else coven.setMessages(gone);
  }, setMessage);

  const title = conversationId
    ? conversation
      ? conversationTitle(conversation, members, coven.userId, coven.nameOf)
      : 'Messages'
    : (coven.snapshot?.coven.name ?? 'Coven chat');
  const others = conversationId ? othersIn(conversationId, members, coven.userId) : [];
  const subtitle = conversationId
    ? conversation?.kind === 'group'
      ? others.map((id) => coven.nameOf(id)).join(', ')
      : 'Only the two of you can see this'
    : (() => {
        const here = coven.presence.filter((p) => p.user_id !== coven.userId);
        return here.length
          ? `Here now: ${here
              .map((p) => p.name)
              .slice(0, 3)
              .join(', ')}`
          : 'Everyone in the coven';
      })();
  const mine = members.find((m) => m.user_id === coven.userId);
  // A one-to-one chat with someone you've blocked stays quiet until you unblock them.
  const partnerBlocked = blockedPartner(conversation, members, coven.userId, blocked);
  const canTalk = coven.standing.ok && coven.perms.chat && !partnerBlocked && (!conversationId || (!!mine && !mine.left_at));
  const note = partnerBlocked
    ? `You’ve blocked ${coven.nameOf(partnerBlocked)}. To write here again, unblock them from ⓘ.`
    : !coven.standing.ok
      ? coven.standing.reasons[0]
      : !coven.perms.chat
        ? 'Your position doesn’t talk in the chat here. The coven’s head decides who does.'
        : 'You’ve left this conversation.';

  const send = async (body: string, replyTo: string | null = null) => {
    if (!covenId) return false;
    setMessage(null);
    try {
      const row = await sendMessage(covenId, conversationId, body, replyTo);
      if (conversationId) setOwn((list) => (list && !list.some((m) => m.id === row.id) ? [...list, row] : list));
      else coven.setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      return true;
    } catch (error) {
      setMessage(errorMessage(error));
      return false;
    }
  };

  const reversals = drawOptions(settings).reversals;
  const beginReading = (question: string) => send(openingBody(question, drawCovenCard(null, reversals)));
  const drawInto = async (reading: CovenReading) => {
    await send(cardBody(drawCovenCard(reading, reversals)), reading.id);
  };

  return {
    raw,
    count: raw?.length ?? 0,
    items,
    readings,
    actions,
    conversation,
    members,
    setMembers,
    title,
    subtitle,
    canTalk,
    note,
    message,
    send,
    beginReading,
    drawInto,
  };
}

export type CovenThreadState = ReturnType<typeof useCovenThread>;

/** The messages, newest at the bottom, and the box to write in. */
export function CovenThreadBody({ thread, conversationId, compact }: { thread: CovenThreadState; conversationId: string | null; compact?: boolean }) {
  const coven = useCoven();
  const { raw, items, readings, actions, canTalk } = thread;
  return (
    <>
      {!raw ? (
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      ) : (
        <FlatList
          inverted
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const reading = item.kind === 'message' ? readings.get(item.message.id) : undefined;
            return (
              <>
                <ThreadRow item={item} nameOf={(id) => coven.nameOf(id)} onLongPress={actions.open} />
                {reading && <CovenReadingCard reading={reading} me={coven.userId} nameOf={(id) => coven.nameOf(id)} onDraw={thread.drawInto} canTalk={canTalk} />}
              </>
            );
          }}
          contentContainerStyle={styles.list}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            items.length === 0 ? (
              <Text style={[type.caption, styles.empty]}>
                {conversationId ? 'Say hello. Only those in this conversation will see it.' : 'No one has spoken yet. Say hello to the coven.'}
              </Text>
            ) : null
          }
        />
      )}
      {thread.message && <Notice>{thread.message}</Notice>}
      {canTalk && !compact && <BeginCovenReading onBegin={thread.beginReading} />}
      <Composer onSend={thread.send} disabled={!canTalk} note={thread.note} />
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  loading: { marginTop: 40 },
  empty: { textAlign: 'center', padding: 24 },
});
