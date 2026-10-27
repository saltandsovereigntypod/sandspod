// A gathering read back two ways, and what it leaves behind.
//
// * The SCRIPT: the whole ritual in order, section by section, with every word
//   spoken and who says it (printed on the website, shared from the app, and
//   saved to the coven's Book as a page under "Rites").
// * The RUN-THROUGH: the same, as one person or role will see it, with their
//   own parts marked.
// * VOTES: the answers counted, and the result in words.
// * The RECORD: when a gathering ends the database keeps who was there, the
//   steps as they happened and how many took part in what (never what anyone
//   wrote) in coven_ritual_records; this writes it out for the coven's Book
//   and for each person's own grimoire ("Coven rites").
//
// Pure, so it can be tested; the website uses the same (js/core/covens.js).

import { moonState } from '../moon.ts';
import { HIDDEN_PAGE } from '../grimoire/access.ts';
import { applyOps, ensureBook, nextOrder, sectionInsert, type Op } from '../grimoire/edits.ts';
import type { GrimoireSnapshot } from '../grimoire/types.ts';
import { kindOf } from './contributions.ts';
import { cleanValues, defaultPartWords, optionLabel, partsOf, voteOptions, type FieldSpec, type PartValue } from './fields.ts';
import { cleanPlan, holdUntil, orderBySections, rolePeople, specsOf, stepWho, stepWhoLabel, TURN_MODES, whoLabel, type BuilderStep, type CustomAction, type GatheringKind, type RitualPlan, type WhoContext } from './builder.ts';
import { assigneeFromKey, includesMember } from './picker.ts';

export type ScriptLine = { who: string; words: string; mine: boolean; part?: string; fromBook?: string };
export type ScriptStep = {
  n: number;
  key: string;
  title: string;
  who: string;
  how: string;
  directions: string;
  /** What its fields say, one line each ("How: Khernips"). */
  facts: string[];
  lines: ScriptLine[];
  minutes: number | null;
  /** What it asks of people ("Each writes an intention"). */
  asks: string;
  mine: boolean;
};
export type Script = {
  title: string;
  kind: GatheringKind;
  sections: { id: string; name: string; steps: ScriptStep[] }[];
  roles: { name: string; who: string; mine: boolean }[];
  checklist: string[];
  afterwards: string[];
  minutes: number;
};

export type Viewer = { membership: { status: string; rank_id: string | null } | null; userId: string | null } | null;

/** A page of the coven's Book as the builder reads it; `hidden` when it's there but this viewer can't open it. */
type BookPageLike = { id: string; title: string; body: string; hidden?: boolean };

/** Whether a WHO key (a role, a position, a person, the whole coven) takes in this viewer. */
function keyIncludes(key: string, plan: Pick<RitualPlan, 'roles'>, viewer: Viewer): boolean {
  if (!viewer?.userId) return false;
  const list = key.startsWith('role:') ? rolePeople(plan, [key.slice(5)]) : [assigneeFromKey(key)].filter((a) => !!a);
  return list.length > 0 && includesMember(list as never, viewer.membership, viewer.userId);
}

/** A step's words: its linked Book page as it stands now, or its own. */
export function stepWords(step: Pick<BuilderStep, 'spoken_text' | 'details'>, pages: BookPageLike[] = []): { words: string; fromBook?: string } {
  const id = step.details.book_page_id;
  const page = id ? pages.find((p) => p.id === id) : null;
  if (page?.hidden) return { words: '', fromBook: HIDDEN_PAGE };
  if (page) return { words: page.body, fromBook: page.title };
  return { words: step.spoken_text ?? '' };
}

function facts(specs: FieldSpec[], values: Record<string, unknown>, ctx: WhoContext): string[] {
  const out: string[] = [];
  for (const s of specs) {
    const v = values[s.key];
    if (v == null || s.type === 'parts' || (Array.isArray(v) && !v.length)) continue;
    if (s.type === 'multi' && specs.some((x) => x.type === 'parts' && x.partsFrom === s.key)) continue;
    let shown: string;
    if (s.type === 'choice') shown = optionLabel(s, String(v));
    else if (s.type === 'multi') shown = (v as string[]).map((x) => optionLabel(s, x)).join(', ');
    else if (s.type === 'who') shown = (v as string[]).map((k) => whoLabel(k, ctx)).join(', ');
    else if (s.type === 'items') shown = (v as { name: string }[]).map((i) => i.name).join(', ');
    else if (s.type === 'list') shown = (v as string[]).join(', ');
    else shown = String(v);
    out.push(`${s.label}: ${shown}`);
  }
  return out;
}

/** What a step asks of people, in a few words. */
function asksLine(step: BuilderStep): string {
  const c = step.contribution;
  if (!c) return '';
  const k = kindOf(c.kind);
  const who = step.turn_mode === 'on_behalf' || c.mode === 'one' ? 'One person, for everyone,' : step.turn_mode === 'in_turn' ? 'Each in turn' : 'Each person';
  const verb = k.verb === 'write' ? 'writes' : k.verb === 'place' ? 'places' : k.id === 'libation' ? 'pours' : k.id === 'card' ? 'draws' : 'lights';
  return `${who} ${verb} ${k.verb === 'do' ? `their own ${k.noun}` : `${/^[aeiou]/i.test(k.noun) ? 'an' : 'a'} ${k.noun}`}${c.timing === 'ahead' ? ' ahead of the rite' : ''}.`;
}

/** The whole gathering in order, every word with who says it; parts belonging to `viewer` marked as theirs. */
export function buildScript(input: {
  title: string;
  kind: GatheringKind;
  plan: RitualPlan;
  steps: BuilderStep[];
  ctx: Omit<WhoContext, 'roles'>;
  custom?: CustomAction[];
  pages?: BookPageLike[];
  viewer?: Viewer;
}): Script {
  const plan = input.plan;
  const ctx: WhoContext = { ...input.ctx, roles: plan.roles };
  const custom = input.custom ?? [];
  const viewer = input.viewer ?? null;
  const ordered = orderBySections(input.steps, plan.sections).filter((s) => s.title.trim());
  let n = 0;
  let minutes = 0;
  const sections = plan.sections.map((section) => ({
    id: section.id,
    name: section.name,
    steps: ordered
      .filter((s) => s.section === section.id)
      .map((step): ScriptStep => {
        n += 1;
        minutes += step.duration_minutes ?? 0;
        const specs = specsOf(step, custom);
        const values = cleanValues(specs, step.details.fields);
        const who = stepWhoLabel(step, ctx);
        const people = stepWho(step, plan, specs).assignees;
        const mine = !!viewer?.userId && people.length > 0 && includesMember(people, viewer.membership, viewer.userId);
        const speakers = (step.details.speakers ?? []).map((r) => plan.roles.find((x) => x.id === r)?.name).filter((x): x is string => !!x);
        const lines: ScriptLine[] = [];
        const partsSpec = specs.find((s) => s.type === 'parts');
        const parts: PartValue[] = partsSpec ? partsOf(partsSpec, values, specs) : [];
        if (partsSpec && parts.length) {
          const source = specs.find((s) => s.key === partsSpec.partsFrom);
          for (const p of parts) {
            const words = p.words?.trim() || defaultPartWords(step.action, p.part);
            lines.push({ part: optionLabel(source, p.part), who: p.who ? whoLabel(p.who, ctx) : who, words, mine: p.who ? keyIncludes(p.who, plan, viewer) : mine });
          }
        } else {
          const { words, fromBook } = stepWords(step, input.pages);
          // Words from a page this viewer can't open: only that there are some.
          if (words.trim() || fromBook === HIDDEN_PAGE) {
            const together = step.turn_mode === 'together';
            lines.push({ who: speakers.length ? speakers.join(' and ') : together ? 'Everyone' : who, words: words.trim(), mine: together ? !!viewer?.userId : mine, ...(fromBook ? { fromBook } : {}) });
          }
        }
        return {
          n,
          key: step.key,
          title: step.title.trim(),
          who,
          how: TURN_MODES.find((t) => t.value === step.turn_mode)?.label ?? '',
          directions: step.instructions.trim(),
          facts: facts(specs, values, ctx),
          lines,
          minutes: step.duration_minutes,
          asks: asksLine(step),
          mine,
        };
      }),
  }));
  const after: string[] = [];
  if (plan.afterwards.hold_hours) after.push(`Leave the altar untouched for ${plan.afterwards.hold_hours} hours.`);
  if (plan.afterwards.notes.trim()) after.push(plan.afterwards.notes.trim());
  if (plan.afterwards.follow_up) after.push(`${plan.afterwards.follow_up.text} (${plan.afterwards.follow_up.after_hours} hours after).`);
  return {
    title: input.title.trim(),
    kind: input.kind,
    sections: sections.filter((s) => s.steps.length),
    roles: plan.roles.map((r) => ({ name: r.name, who: r.cast.length ? r.cast.map((a) => whoLabel(a.kind === 'coven' ? 'coven' : `${a.kind}:${a.id}`, ctx)).join(', ') : 'No one yet', mine: keyIncludes(`role:${r.id}`, plan, viewer) })),
    checklist: plan.checklist.map((c) => c.text),
    afterwards: after,
    minutes,
  };
}

/** The script as plain text, for sharing, printing and the Book. With `mineOnly`, only the viewer's own steps. */
export function scriptText(script: Script, options: { mineOnly?: boolean } = {}): string {
  const out: string[] = [script.title, ''];
  if (script.roles.length) {
    out.push('Roles');
    for (const r of script.roles) out.push(`  ${r.name}: ${r.who}`);
    out.push('');
  }
  if (script.checklist.length) {
    out.push('Before');
    for (const c of script.checklist) out.push(`  • ${c}`);
    out.push('');
  }
  for (const section of script.sections) {
    const steps = options.mineOnly ? section.steps.filter((s) => s.mine || s.lines.some((l) => l.mine)) : section.steps;
    if (!steps.length) continue;
    out.push(section.name.toUpperCase());
    for (const s of steps) {
      out.push(`${s.n}. ${s.title}  (${s.who}${s.how && s.how !== 'Only those named' ? `, ${s.how.toLowerCase()}` : ''}${s.minutes ? `, about ${s.minutes} min` : ''})`);
      if (s.directions) out.push(`   ${s.directions}`);
      for (const f of s.facts) out.push(`   ${f}`);
      if (s.asks) out.push(`   ${s.asks}`);
      for (const l of s.lines) {
        out.push(`   ${l.part ? `${l.part}, ` : ''}${l.who}${l.fromBook ? ` (from the Book: ${l.fromBook})` : ''}:`);
        for (const line of l.words.split(/\n/)) out.push(`      ${line}`);
      }
      out.push('');
    }
  }
  if (script.afterwards.length) {
    out.push('AFTERWARDS');
    for (const a of script.afterwards) out.push(`  ${a}`);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ─── Votes ───────────────────────────────────────────────────────────────

export type VoteTally = { options: string[]; counts: Record<string, number>; total: number };

/** Count the answers given (unknown answers are left out). */
export function tallyVotes(options: string[], votes: { choice: string }[]): VoteTally {
  const counts: Record<string, number> = Object.fromEntries(options.map((o) => [o, 0]));
  for (const v of votes) if (v.choice in counts) counts[v.choice] += 1;
  return { options, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) };
}

const isMotion = (options: string[]) => options.length === 3 && options[0] === 'For' && options[1] === 'Against' && options[2] === 'Abstain';

/** The result in words: "Carried: 5 for, 2 against, 1 abstaining", "Chosen: The first Saturday (4 of 7)". */
export function voteResult(tally: VoteTally): string {
  if (!tally.total) return 'No votes were cast.';
  if (isMotion(tally.options)) {
    const { For: yes = 0, Against: no = 0, Abstain: abstain = 0 } = tally.counts;
    const counts = `${yes} for, ${no} against${abstain ? `, ${abstain} abstaining` : ''}`;
    return yes > no ? `Carried: ${counts}.` : yes === no ? `Tied, so not carried: ${counts}.` : `Not carried: ${counts}.`;
  }
  const best = Math.max(...tally.options.map((o) => tally.counts[o] ?? 0));
  const top = tally.options.filter((o) => (tally.counts[o] ?? 0) === best);
  if (top.length > 1) return `Tied between ${top.join(' and ')} (${best} each, ${tally.total} votes).`;
  return `Chosen: ${top[0]} (${best} of ${tally.total} votes).`;
}

/** Whether this person may vote on the step: among its voters (roles, positions, people), or anyone in the coven when none are named. */
export function mayVote(step: Pick<BuilderStep, 'details'>, plan: Pick<RitualPlan, 'roles'>, viewer: Viewer): boolean {
  if (!viewer?.userId || viewer.membership?.status !== 'active') return false;
  const voters = ((step.details.fields ?? {}).voters as string[] | undefined) ?? [];
  if (!voters.length) return true;
  return voters.some((k) => keyIncludes(k, plan, viewer));
}

export { voteOptions };

// ─── The record ──────────────────────────────────────────────────────────

/** What the database keeps when a gathering ends (coven_ritual_records). */
export type RitualRecord = {
  ritual_id: string;
  coven_id: string;
  title: string;
  kind: GatheringKind;
  held_at: string | null;
  ended_at: string | null;
  led_by: string | null;
  attendees: string[];
  steps: { title: string; section: string | null; done: boolean; completed_by?: string | null }[];
  /** How many of each kind were offered (never what they said). */
  counts: Record<string, number>;
  votes: { title: string; motion: string; options: string[]; counts: Record<string, number>; total: number }[];
  notes: string | null;
  notes_by?: string | null;
  notes_at?: string | null;
  plan?: unknown;
};

/** "Waxing Gibbous", from the moon on the day it was held. */
export const recordMoon = (record: Pick<RitualRecord, 'held_at' | 'ended_at'>) => {
  const at = record.held_at ?? record.ended_at;
  return at ? moonState(new Date(at)).name : '';
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** How many took part in what: "4 intentions, 6 offerings". */
export function countsLine(counts: Record<string, number>): string {
  const parts = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([kind, n]) => {
      const noun = kindOf(kind).noun;
      return plural(n, noun, noun.endsWith('s') ? noun : `${noun}s`);
    });
  return parts.join(', ');
}

/** The record written out, as blocks ({ type, content }) for the Book and the grimoire. */
export function recordBlocks(record: RitualRecord, nameOf: (id: string) => string): { type: string; content: string }[] {
  const plan = cleanPlan(record.plan, record.kind);
  const date = record.held_at ?? record.ended_at;
  const blocks: { type: string; content: string }[] = [
    { type: 'heading', content: 'When' },
    { type: 'text', content: [date ? new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '', recordMoon(record)].filter(Boolean).join(' · ') },
  ];
  if (record.led_by) blocks.push({ type: 'heading', content: 'Led by' }, { type: 'text', content: nameOf(record.led_by) });
  blocks.push({ type: 'heading', content: 'Who was there' }, { type: 'text', content: record.attendees.length ? record.attendees.map(nameOf).sort((a, b) => a.localeCompare(b)).join(', ') : 'Not recorded.' });
  const sectionName = (id: string | null) => plan.sections.find((s) => s.id === id)?.name ?? '';
  const steps = record.steps.map((s) => `${s.title}${s.done ? '' : ' (not reached)'}${sectionName(s.section) ? ` · ${sectionName(s.section)}` : ''}`);
  if (steps.length) blocks.push({ type: 'heading', content: record.kind === 'meeting' ? 'The agenda' : 'The steps' }, { type: 'numbered_list', content: steps.join('\n') });
  const counts = countsLine(record.counts);
  if (counts) blocks.push({ type: 'heading', content: 'What was offered' }, { type: 'text', content: counts });
  for (const v of record.votes) {
    blocks.push({ type: 'heading', content: `Vote: ${v.title}` }, { type: 'text', content: [v.motion, voteResult({ options: v.options, counts: v.counts, total: v.total })].filter(Boolean).join('\n') });
  }
  blocks.push({ type: 'heading', content: record.kind === 'meeting' ? 'Minutes and notes' : 'Notes and reflection' }, { type: 'text', content: record.notes?.trim() ?? '' });
  return blocks;
}

/** The record as one page of text (the coven Book's "Ritual records", minutes). */
export function recordText(record: RitualRecord, nameOf: (id: string) => string): string {
  return recordBlocks(record, nameOf)
    .map((b) => (b.type === 'heading' ? `\n${b.content.toUpperCase()}` : b.type === 'numbered_list' ? b.content.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n') : b.content))
    .join('\n')
    .trim();
}

/** When the altar is free again after this gathering. */
export const recordHold = (record: Pick<RitualRecord, 'ended_at' | 'kind' | 'plan'>) => holdUntil(record.ended_at, cleanPlan(record.plan, record.kind));

// ─── Your own grimoire: "Coven rites" ────────────────────────────────────

export const COVEN_RITES_SECTION = 'Coven rites';

/** Your grimoire page for a coven rite, if you have one (tagged with its ritual). */
export function findCovenRitePage<T extends { metadata?: unknown }>(pages: T[], ritualId: string): T | null {
  return pages.find((p) => p.metadata && (p.metadata as Record<string, unknown>).covenRite === ritualId) ?? null;
}

/** The rows that keep a coven rite in your grimoire: the book if there's none, the "Coven rites" section if missing, the page and its blocks. */
export function covenRitePageOps(
  snapshot: GrimoireSnapshot,
  ctx: { userId: string; now: string },
  input: { ritualId: string; covenName: string; record: RitualRecord; nameOf: (id: string) => string },
  makeId: () => string,
): { id: string; ops: Op[] } {
  const { bookId, ops } = ensureBook(snapshot, ctx, makeId);
  let next = applyOps(snapshot, ops);
  const all: Op[] = [...ops];
  let section = next.sections.find((x) => x.book_id === bookId && x.title.trim().toLowerCase() === COVEN_RITES_SECTION.toLowerCase());
  if (!section) {
    const sectionId = makeId();
    const op = sectionInsert(next, ctx, { id: sectionId, bookId, title: COVEN_RITES_SECTION });
    all.push(op);
    next = applyOps(next, [op]);
    section = next.sections.find((x) => x.id === sectionId);
  }
  const sectionId = section?.id ?? null;
  const id = makeId();
  const siblings = next.pages.filter((p) => p.book_id === bookId && (p.section_id ?? null) === sectionId);
  all.push({
    kind: 'insert',
    table: 'grimoire_pages',
    id,
    row: { id, user_id: ctx.userId, book_id: bookId, section_id: sectionId, title: `${input.record.title} · ${input.covenName}`.slice(0, 200), icon: '', page_type: 'ritual', sort_order: nextOrder(siblings), metadata: { covenRite: input.ritualId } },
  });
  const blocks = [...recordBlocks(input.record, input.nameOf), { type: 'heading', content: 'My own reflection' }, { type: 'text', content: '' }];
  blocks.forEach((block, index) => {
    const blockId = makeId();
    all.push({
      kind: 'insert',
      table: 'grimoire_blocks',
      id: blockId,
      row: { id: blockId, user_id: ctx.userId, book_id: bookId, page_id: id, block_type: block.type, content: block.content, metadata: {}, rich_content: null, sort_order: index },
    });
  });
  return { id, ops: all };
}
