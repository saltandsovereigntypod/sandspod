// The coven ritual builder's rules, shared with the website (js/core/covens.js,
// covens/coven/builder.js). A gathering (a rite or a meeting) is an outline:
// SECTIONS the coven names and orders as it likes (Preparation, Opening, The
// work, Closing, Afterwards; or Invocation, Offerings, Aarti, Prasad; or a
// meeting's agenda), each holding steps. ROLES are named once for the whole
// gathering (High Priestess, Maiden, East caller, Chair, Secretary) and cast
// with people or positions; a step for a role is for whoever is cast in it,
// so swapping the person moves every step with them. Steps know what they are
// (fields.ts), can be done together, in turn, by those named only, or by one
// on behalf of all, and can refer to things named earlier ("Hekate’s candle").
// Before the rite there is a checklist each person ticks; afterwards the
// altar can be left untouched for a while, with notes and a follow-up.
//
// Saved through save_coven_ritual (supabase/migrations/20261103000000_coven_ritual_builder.sql):
// the plan on coven_rituals.plan, and on each step its section, its roles,
// its turn mode and details. Steps planned before sections go into a section
// by what they are; their one person or position still works. Pure, so it can
// be tested.

import { cleanStepItems, type StepItem } from '../altar/stepItems.ts';
import { cleanContribution, type RitualTask } from './contributions.ts';
import type { Rank, RitualStep } from './model.ts';
import { assigneeFromKey, assigneeKey, assigneeLabel, andList, cleanAssignees, includesMember, legacyColumns, WHOLE_COVEN, type Assignee, type PickEntry } from './picker.ts';
import { blankStep, draftFromStep, plannerProblem, stepsPayload, type Candidate, type DraftStep } from './draft.ts';
import { actionOf, type StepAction } from './stepActions.ts';
import { cleanFieldSpecs, cleanValues, fieldsFor, fieldSummary, namesIn, whoIn, type FieldSpec, type FieldValues, type ThingKind } from './fields.ts';

export type GatheringKind = 'rite' | 'meeting';

export const GATHERING_KINDS: { value: GatheringKind; label: string; detail: string }[] = [
  { value: 'rite', label: 'A rite', detail: 'A ritual the coven performs together.' },
  { value: 'meeting', label: 'A meeting', detail: 'Business, study or planning, with an agenda, votes and minutes.' },
];

export type PlanSection = { id: string; name: string };
export type PlanRole = { id: string; name: string; cast: Assignee[]; speaks?: boolean };
export type PrepRemind = 'none' | 'hour' | 'day';
export type PrepItem = { id: string; text: string; remind: PrepRemind };
export type FollowUp = { text: string; after_hours: number };
export type Afterwards = { hold_hours: number | null; notes: string; follow_up: FollowUp | null };

/** The gathering's plan (coven_rituals.plan). */
export type RitualPlan = { sections: PlanSection[]; roles: PlanRole[]; checklist: PrepItem[]; afterwards: Afterwards; template?: string };

export type TurnMode = 'together' | 'in_turn' | 'assigned' | 'on_behalf';

export const TURN_MODES: { value: TurnMode; label: string; detail: string }[] = [
  { value: 'together', label: 'Together', detail: 'Everyone joins in at once, led by the people named.' },
  { value: 'in_turn', label: 'One at a time', detail: 'Each person takes their turn. The live screen shows whose turn it is, and the leader can move on or skip.' },
  { value: 'assigned', label: 'Only those named', detail: 'The people named do it while everyone else watches.' },
  { value: 'on_behalf', label: 'One on behalf of all', detail: 'One of the people named does it for everyone.' },
];

/** What a step keeps beyond the columns (coven_ritual_steps.details). */
export type StepDetails = {
  /** The values of its fields (fields.ts). */
  fields?: FieldValues;
  /** Who it is for, as chosen: roles and people (the columns add those its fields name). */
  who?: { roles: string[]; people: Assignee[] };
  /** Its words are a page of the coven's Book, read as it stands now. */
  book_page_id?: string;
  book_page_title?: string;
  /** Made from one of the coven's own actions (coven_ritual_library). */
  custom_action?: string;
  /** Roles that speak its words (a hook for voice later); everyone named when empty. */
  speakers?: string[];
};

/** One step as the builder edits it. */
export type BuilderStep = DraftStep & {
  /** The builder's own key (saved steps keep their id here too). */
  key: string;
  section: string;
  roles: string[];
  turn_mode: TurnMode;
  details: StepDetails;
};

/** A coven's own action (coven_ritual_library, kind 'action'). */
export type CustomAction = { id: string; name: string; section?: string; directions: string; words: string; minutes: number | null; fields: FieldSpec[] };

let counter = 0;
/** A short id for sections, roles and checklist items (unique within a plan). */
export function shortId(prefix = 'x'): string {
  counter = (counter + 1) % 1e6;
  return `${prefix}-${Date.now().toString(36).slice(-4)}${Math.floor(Math.random() * 1296).toString(36)}${counter.toString(36)}`;
}

// ─── Sections ────────────────────────────────────────────────────────────

const RITE_SECTIONS: PlanSection[] = [
  { id: 'preparation', name: 'Preparation' },
  { id: 'opening', name: 'Opening' },
  { id: 'work', name: 'The work' },
  { id: 'closing', name: 'Closing' },
  { id: 'afterwards', name: 'Afterwards' },
];
const MEETING_SECTIONS: PlanSection[] = [
  { id: 'opening', name: 'Opening' },
  { id: 'reports', name: 'Reports' },
  { id: 'business', name: 'Business' },
  { id: 'other', name: 'Any other business' },
  { id: 'closing', name: 'Closing' },
];

export const defaultSections = (kind: GatheringKind): PlanSection[] => (kind === 'meeting' ? MEETING_SECTIONS : RITE_SECTIONS).map((s) => ({ ...s }));

export const defaultAfterwards = (): Afterwards => ({ hold_hours: null, notes: '', follow_up: null });

export const blankPlan = (kind: GatheringKind = 'rite'): RitualPlan => ({ sections: defaultSections(kind), roles: [], checklist: [], afterwards: defaultAfterwards() });

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** A saved plan, cleaned; a ritual planned before plans gets the default sections. */
export function cleanPlan(raw: unknown, kind: GatheringKind = 'rite'): RitualPlan {
  const p = raw && typeof raw === 'object' ? (raw as Partial<RitualPlan>) : {};
  const ids = new Set<string>();
  const unique = (id: unknown, prefix: string) => {
    let v = text(id, 40).replace(/[^A-Za-z0-9_-]/g, '') || shortId(prefix);
    while (ids.has(v)) v = `${v}-2`;
    ids.add(v);
    return v;
  };
  const sections = (Array.isArray(p.sections) ? p.sections : [])
    .map((s) => ({ id: unique(s?.id, 's'), name: text(s?.name, 60) }))
    .filter((s) => s.name)
    .slice(0, 20);
  const roles = (Array.isArray(p.roles) ? p.roles : [])
    .map((r) => {
      const role: PlanRole = { id: unique(r?.id, 'r'), name: text(r?.name, 60), cast: cleanAssignees(r?.cast) };
      if (r?.speaks === false) role.speaks = false;
      return role;
    })
    .filter((r) => r.name)
    .slice(0, 20);
  const checklist = (Array.isArray(p.checklist) ? p.checklist : [])
    .map((c) => ({ id: unique(c?.id, 'c'), text: text(c?.text, 200), remind: (['none', 'hour', 'day'] as const).includes(c?.remind as PrepRemind) ? (c!.remind as PrepRemind) : 'hour' }))
    .filter((c) => c.text)
    .slice(0, 20);
  const a = (p.afterwards ?? {}) as Partial<Afterwards>;
  const hours = Number(a.hold_hours);
  const follow = a.follow_up && typeof a.follow_up === 'object' ? a.follow_up : null;
  const afterHours = Number(follow?.after_hours);
  const plan: RitualPlan = {
    sections: sections.length ? sections : defaultSections(kind),
    roles,
    checklist,
    afterwards: {
      hold_hours: Number.isFinite(hours) && hours > 0 ? Math.min(168, Math.round(hours)) : null,
      notes: text(a.notes, 2000),
      follow_up: follow && text(follow.text, 200) && Number.isFinite(afterHours) && afterHours > 0 ? { text: text(follow.text, 200), after_hours: Math.min(24 * 60, Math.round(afterHours)) } : null,
    },
  };
  if (p.template) plan.template = text(p.template, 60);
  return plan;
}

/** Where an action belongs by default, among the sections the plan has (or the fallback). */
export function defaultSectionFor(actionId: string | null | undefined, sections: PlanSection[], fallback?: string): string {
  const a = actionOf(actionId);
  const has = (id: string) => sections.some((s) => s.id === id);
  const wanted: string[] = (() => {
    if (!a) return [];
    if (a.group === 'meeting') {
      if (a.id === 'open_meeting') return ['opening'];
      if (a.id === 'read_minutes' || a.id === 'officer_report') return ['reports', 'business'];
      if (a.id === 'any_other_business') return ['other', 'business'];
      if (a.id === 'close_meeting') return ['closing'];
      return ['business', 'work'];
    }
    if (a.group === 'opening') return ['opening'];
    if (a.group === 'closing' || a.id === 'snuff_all' || a.id === 'snuff_candle') return ['closing'];
    if (a.group === 'fire' && (a.id === 'light_candle' || a.id === 'light_all')) return ['opening', 'work'];
    return ['work', 'business'];
  })();
  return wanted.find(has) ?? (fallback && has(fallback) ? fallback : sections[Math.min(1, sections.length - 1)]?.id ?? 'work');
}

export function addSection(plan: RitualPlan, name: string, after?: string): RitualPlan {
  const section = { id: shortId('s'), name: name.trim().slice(0, 60) || 'New section' };
  const at = after ? plan.sections.findIndex((s) => s.id === after) + 1 : plan.sections.length;
  const sections = [...plan.sections];
  sections.splice(at <= 0 ? sections.length : at, 0, section);
  return { ...plan, sections: sections.slice(0, 20) };
}

export const renameSection = (plan: RitualPlan, id: string, name: string): RitualPlan => ({ ...plan, sections: plan.sections.map((s) => (s.id === id ? { ...s, name: name.slice(0, 60) } : s)) });

export function moveSection(plan: RitualPlan, id: string, by: -1 | 1): RitualPlan {
  const i = plan.sections.findIndex((s) => s.id === id);
  const j = i + by;
  if (i < 0 || j < 0 || j >= plan.sections.length) return plan;
  const sections = [...plan.sections];
  [sections[i], sections[j]] = [sections[j], sections[i]];
  return { ...plan, sections };
}

/** Remove a section; its steps move to the one before it (or after, for the first). The last section stays. */
export function removeSection(plan: RitualPlan, steps: BuilderStep[], id: string): { plan: RitualPlan; steps: BuilderStep[] } {
  if (plan.sections.length <= 1) return { plan, steps };
  const i = plan.sections.findIndex((s) => s.id === id);
  if (i < 0) return { plan, steps };
  const home = plan.sections[i > 0 ? i - 1 : 1].id;
  const next = { ...plan, sections: plan.sections.filter((s) => s.id !== id) };
  return { plan: next, steps: orderBySections(steps.map((s) => (s.section === id ? { ...s, section: home } : s)), next.sections) };
}

/** Steps in outline order: by section, keeping their order within each; steps in no known section go to the first. */
export function orderBySections(steps: BuilderStep[], sections: PlanSection[]): BuilderStep[] {
  const rank = (s: BuilderStep) => {
    const i = sections.findIndex((x) => x.id === s.section);
    return i < 0 ? 0 : i;
  };
  return steps.map((s, i) => ({ s: sections.some((x) => x.id === s.section) ? s : { ...s, section: sections[0]?.id ?? s.section }, i })).sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i).map((x) => x.s);
}

/** The outline: each section with its steps (and each step's place in the whole). */
export function outline(plan: RitualPlan, steps: BuilderStep[]): { section: PlanSection; steps: { step: BuilderStep; index: number }[] }[] {
  const ordered = orderBySections(steps, plan.sections);
  return plan.sections.map((section) => ({ section, steps: ordered.map((step, index) => ({ step, index })).filter((x) => x.step.section === section.id) }));
}

/** Move a step up or down; at a section's edge it crosses into the next section. */
export function moveStep(plan: RitualPlan, steps: BuilderStep[], key: string, by: -1 | 1): BuilderStep[] {
  const ordered = orderBySections(steps, plan.sections);
  const i = ordered.findIndex((s) => s.key === key);
  if (i < 0) return ordered;
  const step = ordered[i];
  const neighbour = ordered[i + by];
  const sectionAt = plan.sections.findIndex((s) => s.id === step.section);
  if (neighbour && neighbour.section === step.section) {
    const next = [...ordered];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    return next;
  }
  const target = plan.sections[sectionAt + by];
  if (!target) return ordered;
  const rest = ordered.filter((s) => s.key !== key);
  const moved = { ...step, section: target.id };
  if (by === -1) {
    // To the end of the section before.
    const lastOfTarget = rest.map((s) => s.section).lastIndexOf(target.id);
    const at = lastOfTarget >= 0 ? lastOfTarget + 1 : rest.findIndex((s) => plan.sections.findIndex((x) => x.id === s.section) > sectionAt + by);
    rest.splice(at < 0 ? rest.length : at, 0, moved);
  } else {
    // To the start of the section after.
    const firstOfTarget = rest.findIndex((s) => s.section === target.id);
    const at = firstOfTarget >= 0 ? firstOfTarget : rest.findIndex((s) => plan.sections.findIndex((x) => x.id === s.section) > sectionAt + by);
    rest.splice(at < 0 ? rest.length : at, 0, moved);
  }
  return orderBySections(rest, plan.sections);
}

/** Put a step at the end of a section (or after a given step). */
export function insertStep(plan: RitualPlan, steps: BuilderStep[], step: BuilderStep, section: string, afterKey?: string): BuilderStep[] {
  const ordered = orderBySections(steps, plan.sections);
  const placed = { ...step, section };
  const after = afterKey ? ordered.findIndex((s) => s.key === afterKey) : -1;
  const lastIn = ordered.map((s) => s.section).lastIndexOf(section);
  const at = after >= 0 ? after + 1 : lastIn >= 0 ? lastIn + 1 : ordered.length;
  const next = [...ordered];
  next.splice(at, 0, placed);
  return orderBySections(next, plan.sections);
}

// ─── Roles ───────────────────────────────────────────────────────────────

/** Role names to suggest, by kind of gathering. */
export const ROLE_SUGGESTIONS: Record<GatheringKind, string[]> = {
  rite: ['High Priestess', 'High Priest', 'Maiden', 'Summoner', 'East caller', 'South caller', 'West caller', 'North caller', 'Reader', 'Keeper of the flame', 'Officiant', 'Gothi', 'Gydja', 'Host'],
  meeting: ['Chair', 'Secretary', 'Treasurer', 'Timekeeper', 'Facilitator', 'Note taker'],
};

export function addRole(plan: RitualPlan, name: string): { plan: RitualPlan; id: string } {
  const id = shortId('r');
  return { plan: { ...plan, roles: [...plan.roles, { id, name: name.trim().slice(0, 60) || 'A role', cast: [] }].slice(0, 20) }, id };
}

export const renameRole = (plan: RitualPlan, id: string, name: string): RitualPlan => ({ ...plan, roles: plan.roles.map((r) => (r.id === id ? { ...r, name: name.slice(0, 60) } : r)) });

/** Cast people or positions in a role (every step for the role follows). */
export const castRole = (plan: RitualPlan, id: string, cast: Assignee[]): RitualPlan => ({ ...plan, roles: plan.roles.map((r) => (r.id === id ? { ...r, cast: cleanAssignees(cast).filter((a) => a.kind !== 'coven' || cast.length === 1) } : r)) });

/** Remove a role: steps lose it (and field parts naming it are left without a caller). */
export function removeRole(plan: RitualPlan, steps: BuilderStep[], id: string): { plan: RitualPlan; steps: BuilderStep[] } {
  const key = `role:${id}`;
  const strip = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.filter((x) => x !== key).map((x) => (x && typeof x === 'object' && (x as { who?: string }).who === key ? { ...(x as object), who: undefined } : x));
    return v;
  };
  return {
    plan: { ...plan, roles: plan.roles.filter((r) => r.id !== id) },
    steps: steps.map((s) => ({
      ...s,
      roles: s.roles.filter((r) => r !== id),
      details: { ...s.details, fields: s.details.fields ? (Object.fromEntries(Object.entries(s.details.fields).map(([k, v]) => [k, strip(v)])) as FieldValues) : undefined, speakers: s.details.speakers?.filter((r) => r !== id) },
    })),
  };
}

/** The people and positions cast in these roles. */
export function rolePeople(plan: Pick<RitualPlan, 'roles'>, roleIds: string[]): Assignee[] {
  return cleanAssignees(plan.roles.filter((r) => roleIds.includes(r.id)).flatMap((r) => r.cast));
}

export type WhoContext = { roles: PlanRole[]; ranks: Pick<Rank, 'id' | 'name'>[]; nameOf: (id: string) => string };

/** How a WHO key reads: a role ("High Priestess"), a position, a person, or the whole coven. */
export function whoLabel(key: string, ctx: WhoContext): string {
  if (key.startsWith('role:')) return ctx.roles.find((r) => `role:${r.id}` === key)?.name ?? 'A role';
  const a = assigneeFromKey(key);
  if (!a) return '';
  if (a.kind === 'rank') return ctx.ranks.find((r) => r.id === a.id)?.name ?? 'A position';
  return assigneeLabel(a, ctx.ranks, ctx.nameOf);
}

/** The gathering's roles for the WHO picker, before positions and people. */
export function roleEntries(roles: PlanRole[]): PickEntry[] {
  return roles.map((r) => ({ key: `role:${r.id}`, label: r.name, detail: 'Role in this gathering', keywords: ['role', 'part'], group: 'role' }));
}

/** A role with who plays it: "High Priestess (Rowan)", or "High Priestess (no one yet)". */
export function roleLabel(role: PlanRole, ctx: Omit<WhoContext, 'roles'>): string {
  const cast = role.cast.map((a) => (a.kind === 'rank' ? `every ${ctx.ranks.find((r) => r.id === a.id)?.name ?? 'position'}` : assigneeLabel(a, ctx.ranks, ctx.nameOf)));
  return `${role.name} (${cast.length ? andList(cast) : 'no one yet'})`;
}

// ─── Steps ───────────────────────────────────────────────────────────────

export const TURN_VALUES = TURN_MODES.map((t) => t.value);

/** A step's fields, from its action or the coven's own. */
export function specsOf(step: Pick<BuilderStep, 'action' | 'details'>, custom: CustomAction[] = []): FieldSpec[] {
  const own = step.details.custom_action ? custom.find((c) => c.id === step.details.custom_action) : null;
  return fieldsFor(step.action, own);
}

export function blankBuilderStep(section: string, key = shortId('k')): BuilderStep {
  return { ...blankStep(), key, section, roles: [], turn_mode: 'assigned', details: {} };
}

function cleanDetails(raw: unknown): StepDetails {
  const d = raw && typeof raw === 'object' ? (raw as StepDetails) : {};
  const out: StepDetails = {};
  if (d.fields && typeof d.fields === 'object') out.fields = d.fields;
  if (d.who && typeof d.who === 'object') out.who = { roles: Array.isArray(d.who.roles) ? d.who.roles.filter((r) => typeof r === 'string').slice(0, 20) : [], people: cleanAssignees(d.who.people) };
  if (typeof d.book_page_id === 'string' && d.book_page_id) out.book_page_id = d.book_page_id;
  if (typeof d.book_page_title === 'string' && d.book_page_title) out.book_page_title = d.book_page_title.slice(0, 120);
  if (typeof d.custom_action === 'string' && d.custom_action) out.custom_action = d.custom_action;
  if (Array.isArray(d.speakers)) out.speakers = d.speakers.filter((r) => typeof r === 'string').slice(0, 20);
  return out;
}

/** A saved step as the builder edits it. Steps from before sections go where their action belongs; their one person or position stays. */
export function builderStepFrom(step: RitualStep & { section?: string | null; roles?: unknown; turn_mode?: string | null; details?: unknown }, plan: RitualPlan): BuilderStep {
  const base = draftFromStep(step);
  const details = cleanDetails(step.details);
  const roles = details.who ? details.who.roles : Array.isArray(step.roles) ? (step.roles as unknown[]).filter((r): r is string => typeof r === 'string') : [];
  const people = details.who ? details.who.people : base.assignees;
  const known = plan.sections.some((s) => s.id === step.section);
  const turn = TURN_VALUES.includes(step.turn_mode as TurnMode) ? (step.turn_mode as TurnMode) : base.contribution?.mode === 'one' ? 'on_behalf' : 'assigned';
  return {
    ...base,
    // Older steps for the whole coven keep reading as such (an empty list is the whole coven).
    assignees: people.length === 1 && people[0].kind === 'coven' && roles.length ? [] : people,
    key: step.id,
    section: known ? step.section! : defaultSectionFor(step.action, plan.sections),
    roles: roles.filter((r) => plan.roles.some((x) => x.id === r)),
    turn_mode: turn,
    details,
  };
}

/** Whether the step is for the whole coven: chosen so, or chosen for no one at all. */
export const forWholeCoven = (step: Pick<BuilderStep, 'roles' | 'assignees'>) => !step.roles.length && (!step.assignees.length || step.assignees.some((a) => a.kind === 'coven'));

/**
 * Who a step is for, as the database takes it: its people, those cast in its
 * roles, and anyone its fields name (callers, presenters). The whole coven
 * when it names no one.
 */
export function stepWho(step: BuilderStep, plan: Pick<RitualPlan, 'roles'>, specs: FieldSpec[] = []): { roles: string[]; assignees: Assignee[] } {
  const fieldKeys = whoIn(specs, cleanValues(specs, step.details.fields));
  const fieldRoles = fieldKeys.filter((k) => k.startsWith('role:')).map((k) => k.slice(5));
  const fieldPeople = fieldKeys.map((k) => (k.startsWith('role:') ? null : assigneeFromKey(k))).filter((a): a is Assignee => !!a);
  // Voters may vote; they don't lead the step.
  const votersOnly = step.action === 'vote';
  const roles = [...new Set([...step.roles, ...(votersOnly ? [] : fieldRoles)])].filter((r) => plan.roles.some((x) => x.id === r));
  const named = cleanAssignees([...step.assignees, ...(votersOnly ? [] : fieldPeople)]);
  const assignees = cleanAssignees([...named, ...rolePeople(plan, roles)]);
  return { roles, assignees: assignees.length ? assignees : roles.length ? [] : [WHOLE_COVEN] };
}

/** "High Priestess (Rowan)", "The whole coven", "Maiden and Ash". */
export function stepWhoLabel(step: Pick<BuilderStep, 'roles' | 'assignees'>, ctx: WhoContext): string {
  if (forWholeCoven(step)) return 'The whole coven';
  const parts = [
    ...step.roles.map((r) => ctx.roles.find((x) => x.id === r)?.name).filter((n): n is string => !!n),
    ...cleanAssignees(step.assignees).filter((a) => a.kind !== 'coven').map((a) => whoLabel(assigneeKey(a), ctx)),
  ];
  return parts.length ? andList(parts) : 'The whole coven';
}

/** The step's card line in the outline: "Call the quarters · East: Rowan, South: Ash". */
export function stepSummary(step: BuilderStep, ctx: WhoContext, custom: CustomAction[] = []): string {
  const specs = specsOf(step, custom);
  const fields = fieldSummary(specs, cleanValues(specs, step.details.fields), (k) => whoLabel(k, ctx));
  const title = step.title.trim() || 'A step';
  return fields ? `${title} · ${fields}` : title;
}

/** The step's second line: who, and how (together, in turn…). */
export function stepWhoLine(step: BuilderStep, ctx: WhoContext): string {
  const who = stepWhoLabel(step, ctx);
  const how = step.turn_mode === 'together' ? 'together' : step.turn_mode === 'in_turn' ? 'one at a time' : step.turn_mode === 'on_behalf' ? 'one for all' : '';
  return how ? `${who} · ${how}` : who;
}

// ─── Linked steps ────────────────────────────────────────────────────────

export type NamedThing = { kind: ThingKind; name: string; stepKey: string; index: number };

/** Things named by the steps before `before` (a candle lit and named, offerings set down). */
export function namedThings(steps: BuilderStep[], custom: CustomAction[] = [], before = steps.length): NamedThing[] {
  const out: NamedThing[] = [];
  steps.slice(0, before).forEach((step, index) => {
    const specs = specsOf(step, custom);
    for (const n of namesIn(specs, cleanValues(specs, step.details.fields))) if (!out.some((o) => o.kind === n.kind && o.name === n.name)) out.push({ ...n, stepKey: step.key, index });
    // A light-a-candle step without a name still lights a candle: "the candle from step 3".
    if (step.altar_action === 'light_candle' && !namesIn(specs, cleanValues(specs, step.details.fields)).some((n) => n.kind === 'candle') && step.altar_label.trim()) {
      out.push({ kind: 'candle', name: step.altar_label.trim(), stepKey: step.key, index });
    }
  });
  return out;
}

/** What a later step points to that no earlier step names (a candle put out before it is lit). */
export function brokenLinks(steps: BuilderStep[], custom: CustomAction[] = []): { stepKey: string; index: number; name: string }[] {
  const out: { stepKey: string; index: number; name: string }[] = [];
  steps.forEach((step, index) => {
    const specs = specsOf(step, custom);
    const values = cleanValues(specs, step.details.fields);
    for (const spec of specs.filter((s) => s.type === 'ref')) {
      const name = values[spec.key];
      if (typeof name !== 'string' || !name || name === '*') continue;
      if (!namedThings(steps, custom, index).some((t) => t.name === name && (!spec.refKind || t.kind === spec.refKind || spec.refKind === 'thing'))) out.push({ stepKey: step.key, index, name });
    }
  });
  return out;
}

/** What a step does to something named earlier, on the altar: put out a named candle, clear named offerings. */
export function linkedEffect(step: { action?: string | null; details?: unknown }): { kind: 'snuff' | 'clear'; name: string } | null {
  const fields = (cleanDetails(step.details).fields ?? {}) as Record<string, unknown>;
  if (step.action === 'snuff_candle' && typeof fields.candle === 'string' && fields.candle) return { kind: 'snuff', name: fields.candle };
  if (step.action === 'clear_offerings' && typeof fields.what === 'string' && fields.what) return { kind: 'clear', name: fields.what };
  return null;
}

/** The name a step gives what it sets on the altar (a lit candle, offerings), if any. */
export function stepThingName(step: { action?: string | null; details?: unknown }, custom: CustomAction[] = []): string {
  const details = cleanDetails(step.details);
  const own = details.custom_action ? custom.find((c) => c.id === details.custom_action) : null;
  const specs = fieldsFor(step.action, own);
  return namesIn(specs, cleanValues(specs, details.fields))[0]?.name ?? '';
}

// ─── Turns ───────────────────────────────────────────────────────────────

/**
 * The order people take a one-at-a-time step in: those cast in the step's
 * roles first (in the order the roles are cast), then everyone else among the
 * step's people; those who are here before those who aren't. Mirrors the
 * database's default (coven_ritual_turn_order); the leader can skip.
 */
export function turnOrder(people: string[], present: string[], firstOnes: string[] = []): string[] {
  const here = new Set(present);
  const rank = (id: string) => {
    const lead = firstOnes.indexOf(id);
    return (here.size && !here.has(id) ? 1000 : 0) + (lead >= 0 ? lead : 100);
  };
  return [...new Set(people)].map((id, i) => ({ id, i })).sort((a, b) => rank(a.id) - rank(b.id) || a.i - b.i).map((x) => x.id);
}

/** Where a one-at-a-time step stands: whose turn it is, who's next, and whether everyone has had theirs. */
export function turnState(order: string[] | null | undefined, at: number | null | undefined): { current: string | null; next: string | null; done: boolean; position: number; total: number } {
  const list = order ?? [];
  const i = Math.max(0, at ?? 0);
  return { current: list[i] ?? null, next: list[i + 1] ?? null, done: i >= list.length, position: Math.min(i + 1, list.length), total: list.length };
}

// ─── Saving ──────────────────────────────────────────────────────────────

/** Fields that also set the step's columns: a candle's colour and name, the items an offering uses. */
function fieldColumns(step: BuilderStep, values: FieldValues): Partial<DraftStep> {
  const out: Partial<DraftStep> = {};
  if (typeof values.colour === 'string') out.altar_color = values.colour;
  if (step.action === 'light_candle' && typeof values.candle === 'string') out.altar_label = values.candle.slice(0, 80);
  const itemValues = Object.values(values).filter((v): v is StepItem[] => Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && 'key' in (v[0] as object) && 'name' in (v[0] as object));
  if (itemValues.length) out.items = cleanStepItems([...step.items, ...itemValues.flat().map((i) => ({ ...i, category: i.category ?? '' }))]);
  return out;
}

/**
 * A step with what its fields and people say put into its columns: its
 * people (roles and fields included), a candle's colour and name, the items
 * an offering uses. A step that sets things down but has nothing chosen
 * (each person brings their own, or nothing is picked yet) sets nothing of
 * its own.
 */
export function withFieldColumns(step: BuilderStep, plan: Pick<RitualPlan, 'roles'>, custom: CustomAction[] = []): BuilderStep {
  const specs = specsOf(step, custom);
  const values = cleanValues(specs, step.details.fields);
  const merged: BuilderStep = { ...step, ...fieldColumns(step, values), assignees: stepWho(step, plan, specs).assignees };
  // Nothing chosen to set down (or each person brings their own): the step is simply marked done.
  if (merged.altar_action === 'place_item' && !merged.items.some((i) => i.image) && !merged.altar_image) merged.altar_action = '';
  return merged;
}

/** What save_coven_ritual takes for a gathering's steps, in outline order. */
export function builderPayload(plan: RitualPlan, steps: BuilderStep[], custom: CustomAction[] = []) {
  const ordered = orderBySections(steps, plan.sections).filter((s) => s.title.trim());
  return ordered.map((step) => {
    const specs = specsOf(step, custom);
    const values = cleanValues(specs, step.details.fields);
    const who = stepWho(step, plan, specs);
    const merged: DraftStep = withFieldColumns(step, plan, custom);
    const [base] = stepsPayload([merged]);
    const contribution = cleanContribution(step.contribution);
    if (contribution) contribution.mode = step.turn_mode === 'on_behalf' ? 'one' : 'each';
    const details: StepDetails = { ...step.details, fields: values, who: { roles: step.roles, people: cleanAssignees(step.assignees) } };
    if (!Object.keys(values).length) delete details.fields;
    return {
      ...base,
      ...legacyColumns(who.assignees),
      assignees: who.assignees,
      action: step.details.custom_action ? 'custom' : base.action,
      contribution,
      section: step.section,
      roles: who.roles,
      turn_mode: step.turn_mode,
      details,
    };
  });
}

/** The ritual's own fields for save_coven_ritual, with its kind and plan. */
export function ritualPayload(fields: { title: string; intention: string; description: string; scheduled_for: string | null; status: string; occasion: string; occasion_name: string }, kind: GatheringKind, plan: RitualPlan) {
  return { ...fields, title: fields.title.trim(), intention: fields.intention.trim(), description: fields.description.trim(), occasion_name: fields.occasion_name.trim(), kind, plan: cleanPlan(plan, kind) };
}

/** What stops the gathering being saved, or ''. */
export function builderProblem(title: string, plan: RitualPlan, steps: BuilderStep[], people: Candidate[], nameOf: (id: string) => string, custom: CustomAction[] = []): string {
  const ordered = orderBySections(steps, plan.sections).filter((s) => s.title.trim());
  // Check each step with the people its roles and fields bring in.
  const expanded = ordered.map((s) => withFieldColumns(s, plan, custom));
  const base = plannerProblem(title, expanded, people, nameOf);
  if (base) return base;
  for (const role of plan.roles) {
    for (const a of role.cast.filter((c) => c.kind === 'user')) {
      const person = people.find((p) => p.id === a.id);
      if (!person) return `${role.name}: ${nameOf(a.id)} is no longer a member. Cast someone else.`;
      if (!person.eligible) return `${role.name}: ${nameOf(a.id)} hasn’t signed the coven’s current agreements, so can’t be given a part.`;
    }
  }
  const vote = ordered.findIndex((s) => s.action === 'vote' && !String((s.details.fields ?? {}).motion ?? '').trim());
  if (vote >= 0) return `Step ${vote + 1}: write the motion to be voted on.`;
  return '';
}

/** Things worth a second look that don't stop saving: roles no one plays, candles put out before they're lit. */
export function builderWarnings(plan: RitualPlan, steps: BuilderStep[], custom: CustomAction[] = []): string[] {
  const out: string[] = [];
  const ordered = orderBySections(steps, plan.sections).filter((s) => s.title.trim());
  for (const role of plan.roles) {
    if (!role.cast.length && ordered.some((s) => s.roles.includes(role.id) || whoIn(specsOf(s, custom), cleanValues(specsOf(s, custom), s.details.fields)).includes(`role:${role.id}`))) {
      out.push(`No one is cast as ${role.name} yet. Cast someone before the rite; until then anyone in the coven can take its steps.`);
    }
  }
  for (const link of brokenLinks(ordered, custom)) out.push(`Step ${link.index + 1} refers to “${link.name}”, which no earlier step names.`);
  return out;
}

/** Whether this person is among a step's people, roles included (for highlighting their parts). */
export function isMineInPlan(step: BuilderStep, plan: RitualPlan, membership: { status: string; rank_id: string | null } | null, userId: string | null, custom: CustomAction[] = []): boolean {
  const people = stepWho(step, plan, specsOf(step, custom)).assignees;
  // A step for a role no one plays yet is no one's in particular.
  return people.length > 0 && includesMember(people, membership, userId);
}

// ─── Starting points, copies and saved blocks ────────────────────────────

/** Steps copied fresh (no ids, new keys), e.g. from another ritual, a saved block or a template. */
export function freshSteps(steps: BuilderStep[]): BuilderStep[] {
  return steps.map((s) => ({ ...s, id: null, key: shortId('k') }));
}

/** A gathering as the coven keeps it to start from again (coven_ritual_library, kind 'template'). */
export type SavedTemplate = { kind: GatheringKind; title: string; intention: string; description: string; occasion: string; occasion_name: string; plan: RitualPlan; steps: BuilderStep[] };

/** Steps as they are kept in the library: without ids, saved row details or live state. */
export function libraryStep(step: BuilderStep): Omit<BuilderStep, 'id' | 'key'> & { key?: string } {
  const copy: Partial<BuilderStep> = { ...step };
  delete copy.id;
  delete copy.key;
  return copy as Omit<BuilderStep, 'id' | 'key'>;
}

/** A library entry's steps read back (each cleaned as a saved step would be). */
export function stepsFromLibrary(raw: unknown, plan: RitualPlan, section?: string): BuilderStep[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 60).map((r) => {
    const s = (r ?? {}) as Partial<BuilderStep>;
    const step: BuilderStep = {
      ...blankBuilderStep(section ?? (plan.sections.some((x) => x.id === s.section) ? s.section! : defaultSectionFor(s.action, plan.sections))),
      title: text(s.title, 120),
      instructions: typeof s.instructions === 'string' ? s.instructions.slice(0, 4000) : '',
      spoken_text: typeof s.spoken_text === 'string' ? s.spoken_text.slice(0, 4000) : '',
      duration_minutes: typeof s.duration_minutes === 'number' ? Math.max(0, Math.min(240, s.duration_minutes)) : null,
      assignees: cleanAssignees(s.assignees),
      action: typeof s.action === 'string' ? s.action : '',
      deity: typeof s.deity === 'string' ? s.deity : '',
      items: cleanStepItems(s.items),
      contribution: cleanContribution(s.contribution),
      altar_action: (s.altar_action ?? '') as BuilderStep['altar_action'],
      altar_color: s.altar_color || 'white',
      altar_form: s.altar_form || 'votive',
      altar_label: typeof s.altar_label === 'string' ? s.altar_label : '',
      altar_image: typeof s.altar_image === 'string' ? s.altar_image : '',
      altar_access: s.altar_access ?? 'assigned',
      roles: Array.isArray(s.roles) ? s.roles.filter((x) => plan.roles.some((r) => r.id === x)) : [],
      turn_mode: TURN_VALUES.includes(s.turn_mode as TurnMode) ? (s.turn_mode as TurnMode) : 'assigned',
      details: cleanDetails(s.details),
    };
    return step;
  });
}

/** A coven action's library body cleaned. */
export function cleanCustomAction(id: string, raw: unknown): CustomAction | null {
  const a = raw && typeof raw === 'object' ? (raw as Partial<CustomAction>) : null;
  if (!a || !text(a.name, 80)) return null;
  return {
    id,
    name: text(a.name, 80),
    section: text(a.section, 40) || undefined,
    directions: typeof a.directions === 'string' ? a.directions.slice(0, 4000) : '',
    words: typeof a.words === 'string' ? a.words.slice(0, 4000) : '',
    minutes: typeof a.minutes === 'number' && a.minutes >= 0 ? Math.min(240, Math.round(a.minutes)) : null,
    fields: cleanFieldSpecs(a.fields),
  };
}

/** A step made from one of the coven's own actions. */
export function applyCustomAction(action: CustomAction): Partial<BuilderStep> {
  return { action: 'custom', title: action.name.slice(0, 120), instructions: action.directions, spoken_text: action.words, duration_minutes: action.minutes, altar_action: '', contribution: null };
}

/** The action a builder step stands for, for its label in the editor. */
export function stepActionName(step: Pick<BuilderStep, 'action' | 'details'>, custom: CustomAction[] = []): string {
  if (step.details.custom_action) return custom.find((c) => c.id === step.details.custom_action)?.name ?? 'The coven’s own';
  const a: StepAction | null = actionOf(step.action);
  return a ? a.label ?? a.name.replace('{deity}', 'a deity') : '';
}

// ─── Before and after ────────────────────────────────────────────────────

export const PREP_REMIND: { value: PrepRemind; label: string }[] = [
  { value: 'hour', label: 'An hour before' },
  { value: 'day', label: 'The day before' },
  { value: 'none', label: 'No reminder' },
];

export function addPrep(plan: RitualPlan, itemText: string, remind: PrepRemind = 'hour'): RitualPlan {
  const clean = itemText.trim().slice(0, 200);
  if (!clean) return plan;
  return { ...plan, checklist: [...plan.checklist, { id: shortId('c'), text: clean, remind }].slice(0, 20) };
}

/** The checklist as reminders' tasks: each item you haven't ticked, for rites you're in. */
export function prepTasks(
  rituals: { id: string; title: string; status: string; scheduled_for: string | null; plan?: unknown; kind?: string | null }[],
  ticked: { ritual_id: string; item_id: string }[],
): RitualTask[] {
  const out: RitualTask[] = [];
  for (const r of rituals) {
    if (r.status !== 'scheduled') continue;
    for (const item of cleanPlan(r.plan, (r.kind as GatheringKind) ?? 'rite').checklist) {
      if (item.remind === 'none' || ticked.some((t) => t.ritual_id === r.id && t.item_id === item.id)) continue;
      out.push({ ritualId: r.id, stepId: `prep-${r.id}-${item.id}`, title: item.text, ritualTitle: r.title, stepTitle: `Before ${r.title}`, scheduledFor: r.scheduled_for, mine: true, hoursBefore: item.remind === 'day' ? 24 : 1 });
    }
  }
  return out;
}

/** "3 of 7 have", "Everyone has", "No one has yet". */
export function prepLine(done: number, expected: number): string {
  if (!expected) return done ? `${done} have done this.` : 'No one has ticked this yet.';
  if (done >= expected) return `Everyone has (${expected}).`;
  if (!done) return `No one has yet (${expected} coming).`;
  return `${done} of ${expected} have.`;
}

export const HOLD_CHOICES: { value: string; label: string }[] = [
  { value: '', label: 'No' },
  { value: '3', label: '3 hours' },
  { value: '12', label: '12 hours' },
  { value: '24', label: '24 hours' },
  { value: '72', label: '3 days' },
];

/** When the altar is free again after the rite, or null. */
export function holdUntil(endedAt: string | null | undefined, plan: RitualPlan): Date | null {
  if (!endedAt || !plan.afterwards.hold_hours) return null;
  return new Date(new Date(endedAt).getTime() + plan.afterwards.hold_hours * 3600000);
}

/** "Left untouched until 9pm tomorrow", for the ritual and the altar. */
export function holdLine(until: Date | null, now: number = Date.now()): string {
  if (!until) return '';
  if (until.getTime() <= now) return 'The altar’s quiet time after the rite is over. It can be cleared.';
  return `The altar is left untouched until ${until.toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}.`;
}

/**
 * After a rite: a reminder for its leader to clear the altar when its quiet
 * time is over, and the follow-up for everyone (a Noumenia the next day).
 */
export function afterwardsTasks(rituals: { id: string; title: string; status: string; ended_at: string | null; plan?: unknown; kind?: string | null; led_by?: string | null }[], userId: string | null, now: number = Date.now()): RitualTask[] {
  const out: RitualTask[] = [];
  for (const r of rituals) {
    if (r.status !== 'done' || !r.ended_at) continue;
    const plan = cleanPlan(r.plan, (r.kind as GatheringKind) ?? 'rite');
    const until = holdUntil(r.ended_at, plan);
    if (until && until.getTime() > now && r.led_by && r.led_by === userId) {
      out.push({ ritualId: r.id, stepId: `clear-${r.id}`, title: `Clear the altar after ${r.title}`, ritualTitle: r.title, stepTitle: 'Its quiet time is over', scheduledFor: until.toISOString(), mine: true, at: until.toISOString() });
    }
    const follow = plan.afterwards.follow_up;
    if (follow) {
      const at = new Date(new Date(r.ended_at).getTime() + follow.after_hours * 3600000);
      if (at.getTime() > now) out.push({ ritualId: r.id, stepId: `follow-${r.id}`, title: follow.text, ritualTitle: r.title, stepTitle: `After ${r.title}`, scheduledFor: at.toISOString(), mine: true, at: at.toISOString() });
    }
  }
  return out;
}
