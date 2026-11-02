// Reactions and reply buttons on coven messages (the coven's chat and
// conversations), and a gathering's chat reminder in its plan. Pure, so the
// app, the website (js/core/covens.js, SaltCore.covens.messageExtras) and the
// tests read them the same way. The database keeps them
// (supabase/migrations/20261123000000_coven_message_reactions_replies.sql);
// the phone notes are coven-notify's (supabase/functions/coven-notify/messages.ts).

export type Reaction = { id?: string; message_id: string; user_id: string; emoji: string; created_at?: string };
export type Answer = { id?: string; message_id: string; user_id: string; choice: number; updated_at?: string };
export type ReplyPreset = 'gathering' | 'yesno' | 'custom';
/** The buttons under a message (coven_messages.reply_buttons). */
export type ReplyButtons = { labels: string[]; preset: ReplyPreset; ritual_id?: string; reminder_at?: string };

// ─── Reactions ───────────────────────────────────────────────────────────

/** The row shown first when you react. */
export const QUICK_REACTIONS = ['🕯️', '🌙', '✨', '🔥', '🙏', '❤️', '😂', '👍'];

/** "More": a small grid of emoji in groups, searched by their words. */
export const EMOJI_GROUPS: { label: string; emoji: [string, string][] }[] = [
  {
    label: 'Feelings',
    emoji: [
      ['😀', 'grin happy smile'],
      ['😊', 'smile blush warm'],
      ['🥰', 'love hearts adore'],
      ['😍', 'heart eyes love'],
      ['🤗', 'hug'],
      ['😌', 'calm relieved peace'],
      ['🥲', 'happy tear'],
      ['😢', 'sad cry tear'],
      ['😭', 'sob cry'],
      ['😮', 'wow surprised'],
      ['🤔', 'thinking wonder'],
      ['😅', 'phew sweat laugh'],
      ['🤣', 'laugh rolling'],
      ['😴', 'sleep tired'],
      ['🫶', 'heart hands love'],
      ['💜', 'purple heart love'],
      ['🖤', 'black heart'],
      ['💛', 'yellow heart'],
      ['💚', 'green heart'],
      ['💙', 'blue heart'],
    ],
  },
  {
    label: 'Gestures',
    emoji: [
      ['👏', 'clap applause'],
      ['🙌', 'raised hands celebrate'],
      ['👋', 'wave hello'],
      ['🤝', 'handshake agree'],
      ['✌️', 'peace victory'],
      ['🤞', 'fingers crossed luck'],
      ['👀', 'eyes look'],
      ['💪', 'strong strength'],
      ['👎', 'thumbs down no'],
      ['🫂', 'hug people'],
    ],
  },
  {
    label: 'Nature and the sky',
    emoji: [
      ['🌕', 'full moon'],
      ['🌑', 'new moon dark'],
      ['🌒', 'waxing crescent moon'],
      ['🌘', 'waning crescent moon'],
      ['☀️', 'sun'],
      ['⭐', 'star'],
      ['🌟', 'glowing star'],
      ['💫', 'dizzy star'],
      ['🌈', 'rainbow'],
      ['⚡', 'lightning'],
      ['🌊', 'wave water sea'],
      ['💧', 'drop water'],
      ['🌿', 'herb leaf'],
      ['🍃', 'leaves wind'],
      ['🌱', 'seedling sprout'],
      ['🌸', 'blossom flower'],
      ['🌹', 'rose flower'],
      ['🍂', 'autumn leaves'],
      ['🍄', 'mushroom'],
      ['🌲', 'tree evergreen'],
      ['🐈‍⬛', 'black cat'],
      ['🦉', 'owl'],
      ['🐦‍⬛', 'raven crow'],
      ['🦋', 'butterfly'],
      ['🐍', 'snake serpent'],
    ],
  },
  {
    label: 'The craft',
    emoji: [
      ['🔮', 'crystal ball'],
      ['💎', 'gem crystal stone'],
      ['🪄', 'wand'],
      ['📜', 'scroll'],
      ['📖', 'book open'],
      ['🧿', 'eye amulet'],
      ['🪶', 'feather'],
      ['🗝️', 'key old'],
      ['⚱️', 'urn'],
      ['🍵', 'tea'],
      ['🍷', 'wine'],
      ['🍯', 'honey'],
      ['🍎', 'apple'],
      ['🎃', 'pumpkin'],
      ['🌾', 'grain wheat harvest'],
      ['🪔', 'lamp oil'],
      ['🧂', 'salt'],
      ['🔔', 'bell'],
      ['💀', 'skull'],
      ['☕', 'coffee'],
    ],
  },
  {
    label: 'Symbols',
    emoji: [
      ['✅', 'check yes done'],
      ['❌', 'no cross'],
      ['❓', 'question'],
      ['❗', 'exclamation'],
      ['💯', 'hundred'],
      ['🎉', 'party celebrate'],
      ['🎂', 'birthday cake'],
      ['☮️', 'peace'],
      ['☯️', 'yin yang'],
      ['♾️', 'infinity'],
    ],
  },
];

/** The "More" grid's emoji matching the search words (all of them for none). */
export function searchEmoji(query: string): string[] {
  const q = query.trim().toLowerCase();
  const all = EMOJI_GROUPS.flatMap((g) => g.emoji);
  return (q ? all.filter(([e, words]) => e === q || words.split(' ').some((w) => w.startsWith(q))) : all).map(([e]) => e);
}

/**
 * One emoji from what someone typed or pasted (the fallback to the grid): its
 * first grapheme, if it is a pictograph; else null.
 */
export function oneEmoji(raw: string): string | null {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter;
  const first = Seg ? ([...new Seg(undefined, { granularity: 'grapheme' }).segment(text)][0]?.segment ?? '') : Array.from(text)[0];
  if (!first || first.length > 16 || !/\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(first)) return null;
  return first;
}

export type ReactionGroup = { emoji: string; count: number; mine: boolean; who: string[] };

/** A message's reactions, grouped by emoji: the row's own order first, then by when each was first used. */
export function reactionGroups(reactions: Reaction[], messageId: string, me: string | null, blocked: string[] = []): ReactionGroup[] {
  const groups = new Map<string, ReactionGroup>();
  for (const r of reactions) {
    if (r.message_id !== messageId || blocked.includes(r.user_id)) continue;
    const g = groups.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false, who: [] };
    if (g.who.includes(r.user_id)) continue;
    g.who.push(r.user_id);
    g.count += 1;
    if (r.user_id === me) g.mine = true;
    groups.set(r.emoji, g);
  }
  const rank = (e: string) => {
    const i = QUICK_REACTIONS.indexOf(e);
    return i < 0 ? QUICK_REACTIONS.length : i;
  };
  return [...groups.values()].sort((a, b) => rank(a.emoji) - rank(b.emoji));
}

/** Whether tapping this emoji adds your reaction ('add') or takes it back ('remove'). */
export function reactionToggle(reactions: Reaction[], messageId: string, me: string, emoji: string): 'add' | 'remove' {
  return reactions.some((r) => r.message_id === messageId && r.user_id === me && r.emoji === emoji) ? 'remove' : 'add';
}

/** The list after a toggle (or a live change): added once, or taken away. */
export function withReaction(reactions: Reaction[], row: Reaction, on: boolean): Reaction[] {
  const same = (r: Reaction) => r.message_id === row.message_id && r.user_id === row.user_id && r.emoji === row.emoji;
  const rest = reactions.filter((r) => !same(r));
  return on ? [...rest, row] : rest;
}

/** "2 people reacted with 🔥" for screen readers. */
export function reactionLabel(g: ReactionGroup): string {
  return `${g.count === 1 ? '1 person' : `${g.count} people`} reacted with ${g.emoji}${g.mine ? ', including you' : ''}`;
}

// ─── Reply buttons ───────────────────────────────────────────────────────

export const REPLY_PRESETS: { value: ReplyPreset; label: string; labels: string[] }[] = [
  { value: 'gathering', label: 'Gathering', labels: ['Coming', 'Running late', 'Can’t make it'] },
  { value: 'yesno', label: 'Yes / No', labels: ['Yes', 'No'] },
  { value: 'custom', label: 'Custom', labels: [] },
];
export const GATHERING_LABELS = REPLY_PRESETS[0].labels;
/** Short words for the tally: "Coming 5 · Late 1 · Can’t 2". */
const SHORT: Record<string, string> = { 'Running late': 'Late', 'Can’t make it': 'Can’t' };

/** Buttons ready to send: two to four tidy labels (40 characters each), or null. A gathering link only with the Gathering buttons. */
export function cleanReplyButtons(raw: unknown): ReplyButtons | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const preset: ReplyPreset = r.preset === 'gathering' || r.preset === 'yesno' ? r.preset : 'custom';
  const source = preset === 'custom' ? r.labels : REPLY_PRESETS.find((p) => p.value === preset)!.labels;
  const labels = (Array.isArray(source) ? source : [])
    .map((l) => String(l ?? '').replace(/\s+/g, ' ').trim().slice(0, 40).trim())
    .filter(Boolean)
    .slice(0, 4);
  if (labels.length < 2) return null;
  const out: ReplyButtons = { labels, preset };
  if (preset === 'gathering' && typeof r.ritual_id === 'string' && r.ritual_id) out.ritual_id = r.ritual_id;
  if (typeof r.reminder_at === 'string' && r.reminder_at) out.reminder_at = r.reminder_at;
  return out;
}

/** A message's buttons as saved, or null. */
export const buttonsOf = (message: { reply_buttons?: unknown } | null | undefined): ReplyButtons | null => cleanReplyButtons(message?.reply_buttons);

export type Tally = { label: string; short: string; count: number; who: string[]; mine: boolean }[];

/** Each button with how many chose it and who (one answer each, the latest). */
export function answerTally(buttons: ReplyButtons, answers: Answer[], messageId: string, me: string | null, blocked: string[] = []): Tally {
  const latest = new Map<string, Answer>();
  for (const a of answers) {
    if (a.message_id !== messageId || blocked.includes(a.user_id)) continue;
    const prev = latest.get(a.user_id);
    if (!prev || String(a.updated_at ?? '') >= String(prev.updated_at ?? '')) latest.set(a.user_id, a);
  }
  return buttons.labels.map((label, i) => {
    const who = [...latest.values()].filter((a) => a.choice === i).map((a) => a.user_id);
    return { label, short: SHORT[label] ?? label, count: who.length, who, mine: !!me && who.includes(me) };
  });
}

/** "Coming 5 · Late 1 · Can’t 2", or "No answers yet". */
export function tallyWords(tally: Tally): string {
  const parts = tally.filter((t) => t.count > 0).map((t) => `${t.short} ${t.count}`);
  return parts.length ? parts.join(' · ') : 'No answers yet';
}

/** Your answer now, if any. */
export function myAnswer(answers: Answer[], messageId: string, me: string | null): number | null {
  const a = answers.find((x) => x.message_id === messageId && x.user_id === me);
  return a ? a.choice : null;
}

/** What tapping a button does: answer, change your answer, or take it back (the one you chose). */
export function answerChange(current: number | null, tapped: number): { action: 'answer' | 'change' | 'clear'; choice: number | null } {
  if (current === tapped) return { action: 'clear', choice: null };
  return { action: current == null ? 'answer' : 'change', choice: tapped };
}

/** The list after your answer (or a live change): one per person. */
export function withAnswer(answers: Answer[], row: Answer, on: boolean): Answer[] {
  const rest = answers.filter((a) => !(a.message_id === row.message_id && a.user_id === row.user_id));
  return on ? [...rest, row] : rest;
}

/**
 * The RSVP a Gathering answer sets, when the message is linked to one of the
 * coven's gatherings: Coming and Running late are going, Can't make it is not
 * going; taking the answer back clears it. Undefined: leave the RSVP alone.
 */
export function rsvpFor(buttons: ReplyButtons | null, choice: number | null): 'going' | 'not_going' | null | undefined {
  if (!buttons?.ritual_id || buttons.preset !== 'gathering') return undefined;
  if (choice == null) return null;
  return choice === 2 ? 'not_going' : choice === 0 || choice === 1 ? 'going' : undefined;
}

// ─── The chat reminder in a gathering's plan ─────────────────────────────

export const REMINDER_MINUTES = [10, 15, 30, 60];
export const DEFAULT_REMINDER_MINUTES = 10;

/** The plan's chat reminder, minutes before it begins; null when off. */
export function chatReminder(plan: unknown): number | null {
  const v = plan && typeof plan === 'object' ? (plan as Record<string, unknown>).chatReminder : null;
  return typeof v === 'number' && REMINDER_MINUTES.includes(v) ? v : null;
}

/** The plan with the reminder set (minutes) or turned off (null). */
export function withChatReminder<T extends object>(plan: T, minutes: number | null): T {
  const next = { ...plan } as T & { chatReminder?: number };
  if (minutes != null && REMINDER_MINUTES.includes(minutes)) next.chatReminder = minutes;
  else delete next.chatReminder;
  return next;
}

/** "10 minutes before", "1 hour before". */
export const reminderChoiceLabel = (m: number) => (m === 60 ? '1 hour before' : `${m} minutes before`);
