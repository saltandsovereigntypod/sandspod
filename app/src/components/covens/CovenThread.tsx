import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';

import { BeginCovenReading, CovenReadingCard } from './CovenReading';
import { Composer, ThreadRow, useMessageActions } from './Chat';
import { MessageExtrasRow, ReactionPicker } from './MessageExtras';
import { Notice } from '../more/ui';
import { blockedPartner } from '../../lib/covens/blocking';
import { rsvp } from '../../lib/covens/api';
import { answerButtons, conversationTitle, fetchConversations, fetchExtras, fetchThread, othersIn, react, sendMessage, type Conversation, type ConversationMember } from '../../lib/covens/chat';
import { useCoven } from '../../lib/covens/CovenContext';
import { answerChange, buttonsOf, myAnswer, reactionToggle, rsvpFor, withAnswer, withReaction, type Answer, type Reaction, type ReplyButtons } from '../../lib/covens/messageExtras';
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

/**
 * Reactions and reply-button answers on a thread's messages: loaded with it,
 * kept live, and changed by you (lib/covens/messageExtras.ts). A Gathering
 * answer on a message linked to a gathering sets your RSVP too.
 */
function useMessageExtras(raw: Message[] | null, setProblem: (message: string | null) => void) {
  const coven = useCoven();
  const me = coven.userId;
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const ids = useMemo(() => (raw ?? []).map((m) => m.id), [raw]);
  const idKey = ids.length ? `${ids.length}:${ids[ids.length - 1]}` : '';
  useEffect(() => {
    if (!idKey) return;
    let live = true;
    fetchExtras(ids).then((x) => {
      if (!live) return;
      setReactions(x.reactions);
      setAnswers(x.answers);
      void coven.loadNames([...x.reactions, ...x.answers].map((r) => r.user_id));
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when the thread gains a message
  }, [idKey]);
  const { onMessageExtra } = coven;
  useEffect(
    () =>
      onMessageExtra((change) => {
        const row = (change.eventType === 'DELETE' ? change.old : change.new) as Record<string, unknown>;
        if (change.table === 'coven_message_reactions') {
          const r = row as unknown as Reaction;
          if (change.eventType === 'DELETE') setReactions((list) => list.filter((x) => x.id !== r.id));
          else setReactions((list) => withReaction(list, r, true));
        } else {
          const a = row as unknown as Answer;
          if (change.eventType === 'DELETE') setAnswers((list) => list.filter((x) => x.id !== a.id));
          else setAnswers((list) => withAnswer(list, a, true));
        }
      }),
    [onMessageExtra],
  );

  const toggleReaction = useCallback(
    async (m: Message, emoji: string) => {
      if (!me) return;
      const on = reactionToggle(reactions, m.id, me, emoji) === 'add';
      const row: Reaction = { message_id: m.id, user_id: me, emoji };
      setReactions((list) => withReaction(list, row, on));
      try {
        await react(m.id, me, emoji, on);
      } catch (error) {
        setReactions((list) => withReaction(list, row, !on));
        setProblem(errorMessage(error));
      }
    },
    [me, reactions, setProblem],
  );

  const answer = useCallback(
    async (m: Message, tapped: number) => {
      if (!me) return;
      const before = myAnswer(answers, m.id, me);
      const { choice } = answerChange(before, tapped);
      const row: Answer = { message_id: m.id, user_id: me, choice: choice ?? 0, updated_at: new Date().toISOString() };
      setAnswers((list) => withAnswer(list, row, choice != null));
      try {
        await answerButtons(m.id, me, choice);
        const response = rsvpFor(buttonsOf(m), choice);
        const ritualId = buttonsOf(m)?.ritual_id;
        if (response !== undefined && ritualId) await rsvp(ritualId, response).catch(() => null);
      } catch (error) {
        setAnswers((list) => (before == null ? withAnswer(list, row, false) : withAnswer(list, { ...row, choice: before }, true)));
        setProblem(errorMessage(error));
      }
    },
    [me, answers, setProblem],
  );

  return { reactions, answers, toggleReaction, answer };
}

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

  const extras = useMessageExtras(raw, setMessage);
  const [reacting, setReacting] = useState<Message | null>(null);
  // The coven's upcoming gatherings, for a message's Gathering buttons to link to (its own chat only).
  const gatherings = useMemo(() => {
    if (conversationId) return null;
    const now = Date.now();
    return coven.rituals
      .filter((r) => r.status === 'scheduled' && r.scheduled_for && new Date(r.scheduled_for).getTime() > now)
      .sort((a, b) => String(a.scheduled_for).localeCompare(String(b.scheduled_for)))
      .slice(0, 6)
      .map((r) => ({ id: r.id, title: r.title }));
  }, [conversationId, coven.rituals]);

  const send = async (body: string, replyTo: string | null = null, buttons: ReplyButtons | null = null) => {
    if (!covenId) return false;
    setMessage(null);
    try {
      const row = await sendMessage(covenId, conversationId, body, replyTo, buttons);
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
    extras,
    reacting,
    setReacting,
    gatherings,
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
                <ThreadRow
                  item={item}
                  nameOf={(id) => coven.nameOf(id)}
                  onLongPress={thread.setReacting}
                  under={
                    item.kind === 'message' ? (
                      <MessageExtrasRow
                        message={item.message}
                        mine={item.mine}
                        me={coven.userId}
                        reactions={thread.extras.reactions}
                        answers={thread.extras.answers}
                        blocked={coven.me?.blocks ?? []}
                        nameOf={(id) => coven.nameOf(id)}
                        onReact={thread.extras.toggleReaction}
                        onAnswer={thread.extras.answer}
                        canTalk={canTalk}
                      />
                    ) : null
                  }
                />
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
      <Composer onSend={(body, buttons) => thread.send(body, null, buttons ?? null)} disabled={!canTalk} note={thread.note} replyButtons={{ gatherings: thread.gatherings }} />
      <ReactionPicker
        message={thread.reacting}
        onPick={(emoji) => thread.reacting && canTalk && void thread.extras.toggleReaction(thread.reacting, emoji)}
        onMore={() => thread.reacting && actions.open(thread.reacting)}
        onClose={() => thread.setReacting(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  loading: { marginTop: 40 },
  empty: { textAlign: 'center', padding: 24 },
});
