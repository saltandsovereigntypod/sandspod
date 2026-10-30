// Cycle & Moon: symptoms. The common ones to log with how strongly they're
// felt (and the person's own, by name), what their notes show over the
// cycles (when a symptom tends to come, whether it's easing, which season
// and which part of the moon's month it keeps to), only once there's enough
// logged to say so and always with how much it rests on; gentle folk,
// herbal and ritual comfort for each, with safety notes and Living Library
// links; and a careful word when something logged is worth a doctor's eye.
// Never a diagnosis. Pure.

import type { PracticeLink } from './content.ts';
import { cycleDayOn, cycleStats, daysBetween, moonFraction, quarterOf, SEASON_NAMES, sortedBleeds, SEASONS } from './model.ts';
import type { CycleData, DayNote, Intensity, MoonQuarter, Season } from './types.ts';

export type SymptomGroup = 'body' | 'mood' | 'other';
export type SymptomDef = {
  id: string;
  /** The chip's label. */
  label: string;
  /** How it reads at the start of a sentence, and whether it takes a plural verb ("Headaches tend…", "Bloating tends…"). */
  noun: string;
  plural: boolean;
  group: SymptomGroup;
};

const def = (id: string, label: string, noun: string, plural: boolean, group: SymptomGroup): SymptomDef => ({ id, label, noun, plural, group });

/** The common symptoms, in the order the log shows them. Flow is logged with the bleed itself. */
export const SYMPTOMS: SymptomDef[] = [
  def('cramps', 'Cramps', 'Cramps', true, 'body'),
  def('bloating', 'Bloating', 'Bloating', false, 'body'),
  def('headache', 'Headache', 'Headaches', true, 'body'),
  def('tender_breasts', 'Tender breasts', 'Tender breasts', true, 'body'),
  def('back_pain', 'Back pain', 'Back pain', false, 'body'),
  def('acne', 'Acne', 'Breakouts', true, 'body'),
  def('fatigue', 'Tired', 'Tiredness', false, 'body'),
  def('insomnia', 'Poor sleep', 'Poor sleep', false, 'body'),
  def('cravings', 'Cravings', 'Cravings', true, 'body'),
  def('nausea', 'Nausea', 'Nausea', false, 'body'),
  def('anxious', 'Anxious', 'Feeling anxious', false, 'mood'),
  def('irritable', 'Irritable', 'Feeling irritable', false, 'mood'),
  def('low', 'Low', 'Feeling low', false, 'mood'),
  def('calm', 'Calm', 'Feeling calm', false, 'mood'),
  def('energised', 'Energised', 'Feeling energised', false, 'mood'),
  def('libido_low', 'Low libido', 'Low desire', false, 'other'),
  def('libido_high', 'High libido', 'High desire', false, 'other'),
  def('discharge', 'Discharge', 'Discharge', false, 'other'),
  def('spotting', 'Spotting', 'Spotting', false, 'other'),
];

export const SYMPTOM_IDS = SYMPTOMS.map((s) => s.id);
export const symptomDef = (id: string) => SYMPTOMS.find((s) => s.id === id) ?? null;
export const INTENSITY_NAMES: Record<Intensity, string> = { 1: 'mild', 2: 'moderate', 3: 'strong' };

/** The next intensity when a chip is tapped: off, mild, moderate, strong, off. */
export const nextIntensity = (level: number | undefined): Intensity | null => (!level ? 1 : level >= 3 ? null : ((level + 1) as Intensity));

/** A note with one symptom set (or cleared). `custom` for the person's own. */
export function withSymptom(note: DayNote, id: string, level: Intensity | null, custom = false): DayNote {
  const field = custom ? 'custom' : 'symptoms';
  const next = { ...note[field] };
  if (level) next[id.trim()] = level;
  else delete next[id.trim()];
  return { ...note, [field]: next };
}

/** Every custom symptom name they've used, most used first, to offer again. */
export function customNames(data: CycleData): string[] {
  const count = new Map<string, number>();
  for (const n of data.notes) for (const k of Object.keys(n.custom ?? {})) count.set(k, (count.get(k) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k]) => k);
}

// ── What the notes show ──────────────────────────────────────────────────

/** How much must be logged before anything is said. */
export const THRESHOLDS = {
  /** A symptom's timing or season: on this many days, across this many cycles. */
  days: 3,
  cycles: 2,
  /** A trend: this many cycles in a row with notes. */
  trendCycles: 3,
  /** The moon: this many days with notes, over at least this many days. */
  moonDays: 14,
  moonSpan: 45,
} as const;

export type Insight = {
  kind: 'timing' | 'trend' | 'season' | 'moon' | 'energy';
  symptom: string | null;
  text: string;
  /** What it rests on: "3 of 4 cycles", "12 days logged". */
  basis: string;
};

type Occurrence = { key: string; date: string; level: Intensity; cycle: string | null; day: number | null; before: number | null; season: Season | null; quarter: MoonQuarter };

const nounOf = (key: string) => (key.startsWith('custom:') ? key.slice(7) : (symptomDef(key)?.noun ?? key));
const pluralOf = (key: string) => (key.startsWith('custom:') ? /s$/i.test(key) : !!symptomDef(key)?.plural);
const verb = (key: string, one: string, many: string) => (pluralOf(key) ? many : one);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const noon = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

/** Each symptom logged on each day, placed in the cycle and the moon's month. */
function occurrences(data: CycleData): { list: Occurrence[]; logged: DayNote[] } {
  const stats = cycleStats(data);
  const bleeds = sortedBleeds(data);
  const list: Occurrence[] = [];
  const logged = data.notes.filter((n) => Object.keys(n.symptoms ?? {}).length || Object.keys(n.custom ?? {}).length);
  for (const n of logged) {
    const c = data.settings.mode === 'cycle' ? cycleDayOn(data, n.date, stats) : null;
    const i = c ? bleeds.findIndex((b) => b.id === c.bleed.id) : -1;
    const next = i >= 0 ? bleeds[i + 1] : undefined;
    const before = next ? daysBetween(n.date, next.start) : null;
    const quarter = quarterOf(moonFraction(noon(n.date)));
    const add = (key: string, level: Intensity) => list.push({ key, date: n.date, level, cycle: c?.bleed.id ?? null, day: c?.day ?? null, before, season: c?.season ?? null, quarter });
    for (const [k, v] of Object.entries(n.symptoms ?? {})) add(k, v);
    for (const [k, v] of Object.entries(n.custom ?? {})) add(`custom:${k}`, v);
  }
  return { list, logged };
}

/** The tightest window (up to five days) that holds the symptom in at least two thirds of its cycles. */
function bestWindow(occ: Occurrence[], pick: (o: Occurrence) => number | null): { from: number; to: number; cycles: number; of: number } | null {
  const placed = occ.filter((o) => pick(o) != null && o.cycle);
  const cycles = [...new Set(placed.map((o) => o.cycle))];
  if (cycles.length < THRESHOLDS.cycles) return null;
  const values = placed.map((o) => pick(o)!);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  for (let width = 1; width <= 5; width++) {
    let best: { from: number; to: number; cycles: number } | null = null;
    for (let from = lo; from <= hi; from++) {
      const to = from + width - 1;
      const hit = new Set(placed.filter((o) => pick(o)! >= from && pick(o)! <= to).map((o) => o.cycle)).size;
      if (!best || hit > best.cycles) best = { from, to, cycles: hit };
    }
    if (best && best.cycles >= THRESHOLDS.cycles && best.cycles / cycles.length >= 2 / 3) return { ...best, of: cycles.length };
  }
  return null;
}

const span = (a: number, b: number) => (a === b ? `${a}` : `${a}–${b}`);

/** What the symptom notes show, with how much each line rests on. Empty until there's enough. */
export function symptomInsights(data: CycleData): Insight[] {
  const { list, logged } = occurrences(data);
  const out: Insight[] = [];
  const keys = [...new Set(list.map((o) => o.key))];
  const cycleOrder = sortedBleeds(data).map((b) => b.id);
  const cyclesWithNotes = [...new Set(list.map((o) => o.cycle).filter((c): c is string => !!c))].sort((a, b) => cycleOrder.indexOf(a) - cycleOrder.indexOf(b));

  for (const key of keys) {
    const occ = list.filter((o) => o.key === key);
    const noun = nounOf(key);
    const cycles = new Set(occ.map((o) => o.cycle).filter(Boolean)).size;
    if (occ.length < THRESHOLDS.days || cycles < THRESHOLDS.cycles) continue;

    // When in the cycle: counted from the bleed, or back from the next.
    const fwd = bestWindow(occ, (o) => o.day);
    const back = bestWindow(occ, (o) => (o.before != null && o.before > 0 && o.before <= 10 ? o.before : null));
    if (back && (!fwd || back.cycles / back.of > fwd.cycles / fwd.of || (back.cycles / back.of === fwd.cycles / fwd.of && back.to - back.from < fwd.to - fwd.from))) {
      const when = back.from === back.to ? `${back.from} ${back.from === 1 ? 'day' : 'days'} before your bleed` : `${back.from}–${back.to} days before your bleed`;
      out.push({ kind: 'timing', symptom: key, text: `${noun} ${verb(key, 'tends', 'tend')} to come ${when}.`, basis: `${back.cycles} of the ${back.of} cycles you logged ${noun.toLowerCase()}` });
    } else if (fwd) {
      out.push({ kind: 'timing', symptom: key, text: `${noun} ${verb(key, 'tends', 'tend')} to come on cycle ${fwd.from === fwd.to ? 'day' : 'days'} ${span(fwd.from, fwd.to)}.`, basis: `${fwd.cycles} of the ${fwd.of} cycles you logged ${noun.toLowerCase()}` });
    }

    // Easing or growing over the latest cycles with notes.
    const recent = cyclesWithNotes.slice(-THRESHOLDS.trendCycles);
    if (recent.length === THRESHOLDS.trendCycles) {
      const load = recent.map((c) => occ.filter((o) => o.cycle === c).reduce((a, o) => a + o.level, 0));
      const down = load.every((v, i) => i === 0 || v < load[i - 1]) && load[0] - load[load.length - 1] >= 2;
      const up = load.every((v, i) => i === 0 || v > load[i - 1]) && load[load.length - 1] - load[0] >= 2;
      if (down) out.push({ kind: 'trend', symptom: key, text: `${noun} ${verb(key, 'has', 'have')} eased over your last ${recent.length} cycles: logged less often or more mildly each time.`, basis: `${recent.length} cycles with notes` });
      if (up) out.push({ kind: 'trend', symptom: key, text: `${noun} ${verb(key, 'has', 'have')} grown over your last ${recent.length} cycles: logged more often or more strongly each time.`, basis: `${recent.length} cycles with notes` });
    }

    // Which inner season it keeps to.
    const seasoned = occ.filter((o) => o.season);
    if (seasoned.length >= 4) {
      const top = SEASONS.map((s) => ({ s, n: seasoned.filter((o) => o.season === s).length })).sort((a, b) => b.n - a.n)[0];
      if (top.n / seasoned.length >= 0.6 && !out.some((i) => i.symptom === key && i.kind === 'timing')) {
        out.push({ kind: 'season', symptom: key, text: `${noun} ${verb(key, 'comes', 'come')} mostly in ${SEASON_NAMES[top.s]}.`, basis: `${top.n} of ${seasoned.length} days logged` });
      }
    }
  }

  // The moon: how often a symptom is logged near the full or the dark moon, against the rest of the month.
  const span0 = logged.length ? daysBetween(logged[0].date, logged[logged.length - 1].date) : 0;
  const days = data.notes;
  if (days.length >= THRESHOLDS.moonDays && span0 >= THRESHOLDS.moonSpan) {
    const qOf = new Map(days.map((n) => [n.date, quarterOf(moonFraction(noon(n.date)))]));
    for (const key of keys) {
      const occ = list.filter((o) => o.key === key);
      if (occ.length < 4) continue;
      for (const q of ['full', 'dark'] as const) {
        const near = days.filter((n) => qOf.get(n.date) === q).length;
        const rest = days.length - near;
        if (near < 3 || rest < 3) continue;
        const hitNear = occ.filter((o) => o.quarter === q).length;
        const hitRest = occ.length - hitNear;
        const a = hitNear / near;
        const b = hitRest / rest;
        if (hitNear >= 3 && a >= 2 * b && a - b >= 0.25) {
          const moon = q === 'full' ? 'the full moon' : 'the dark moon';
          const text = key === 'insomnia' ? `You sleep worse near ${moon}.` : `You log ${nounOf(key).toLowerCase()} more often near ${moon}.`;
          out.push({ kind: 'moon', symptom: key, text, basis: `${hitNear} of ${near} days with notes near it, against ${hitRest} of ${rest} at other times` });
        }
      }
    }
    // Energy by the moon.
    const rated = days.filter((n) => n.energy != null);
    for (const q of ['full', 'dark'] as const) {
      const near = rated.filter((n) => qOf.get(n.date) === q).map((n) => n.energy!);
      const rest = rated.filter((n) => qOf.get(n.date) !== q).map((n) => n.energy!);
      if (near.length < 3 || rest.length < 3) continue;
      const avg = (v: number[]) => v.reduce((x, y) => x + y, 0) / v.length;
      const d = avg(near) - avg(rest);
      if (Math.abs(d) >= 1) out.push({ kind: 'moon', symptom: null, text: `Your energy runs ${d > 0 ? 'higher' : 'lower'} near ${q === 'full' ? 'the full moon' : 'the dark moon'}.`, basis: `${near.length} rated days near it, ${rest.length} at other times` });
    }
  }
  return out;
}

/** What to say before there's enough for patterns. */
export function insightProgress(data: CycleData): string {
  const { list, logged } = occurrences(data);
  const cycles = new Set(list.map((o) => o.cycle).filter(Boolean)).size;
  if (!logged.length) return 'Log symptoms on the days you have them. Once one shows up on 3 or more days across at least 2 cycles, patterns will show here.';
  return `You’ve logged symptoms on ${logged.length} ${logged.length === 1 ? 'day' : 'days'} across ${cycles} ${cycles === 1 ? 'cycle' : 'cycles'}. Patterns show once a symptom appears on ${THRESHOLDS.days} or more days across at least ${THRESHOLDS.cycles} cycles, and the moon’s part once ${THRESHOLDS.moonDays} days are logged over six weeks or more.`;
}

export const INSIGHT_NOTE = 'These come from your own notes and nothing else. With a few months logged, some will be chance; they grow surer as you keep logging, and they can change.';

// ── Worth a doctor's eye ─────────────────────────────────────────────────

/** Gentle words when what's logged is worth a doctor's or nurse's eye. Never a diagnosis. */
export function redFlags(data: CycleData, now: Date): string[] {
  const out: string[] = [];
  const bleeds = sortedBleeds(data);
  const heavyDays = bleeds.map((b) => Object.values(b.flow).filter((f) => f === 'heavy').length);
  if (heavyDays.filter((n) => n >= 1).length >= 2 || heavyDays.some((n) => n >= 3)) {
    out.push('You’ve logged heavy flow more than once. Very heavy bleeding is worth talking over with a doctor or nurse, especially if you soak through a pad or tampon every hour or two, pass large clots, or feel faint or tired all the time. It’s common and there is help for it.');
  }
  if (bleeds.some((b) => b.end && daysBetween(b.start, b.end) + 1 > 8)) out.push('A bleed lasting more than about a week is worth mentioning to a doctor or nurse, especially if it happens again.');
  const strong = new Set(data.notes.filter((n) => n.symptoms?.cramps === 3).map((n) => cycleDayOn(data, n.date)?.bleed.id ?? n.date)).size;
  if (strong >= 2) out.push('You’ve logged strong cramps in more than one cycle. Pain that stops you doing ordinary things isn’t something you have to put up with; a doctor can help find out why and ease it.');
  const spotting = new Set(data.notes.filter((n) => n.symptoms?.spotting && !bleeds.some((b) => b.start === n.date)).map((n) => cycleDayOn(data, n.date)?.bleed.id ?? n.date)).size;
  if (spotting >= 2) out.push('Spotting between bleeds now and then is common, but if it keeps happening, comes after sex, or comes after menopause, see a doctor or nurse.');
  const stats = cycleStats(data);
  const odd = stats.lengths.filter((l) => l < 21 || l > 35).length;
  if (odd >= 2) out.push('More than one of your recent cycles was shorter than 21 days or longer than 35. That can be ordinary for some bodies, but it’s worth mentioning to a doctor or nurse, especially if it’s new for you.');
  const last = bleeds[bleeds.length - 1];
  const s = data.settings.situations;
  if (last && data.settings.mode === 'cycle' && !s.includes('pregnant') && !s.includes('perimenopause') && !s.includes('postpartum')) {
    const since = daysBetween(last.start, `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    if (since >= 45 && since <= 120) out.push(`It’s been ${since} days since the last bleed you logged. If you haven’t just missed logging one, a late or missed period can have many causes; a pregnancy test and a word with a doctor or nurse can help.`);
  }
  const low = data.notes.filter((n) => (n.symptoms?.low ?? 0) >= 3 || (n.symptoms?.anxious ?? 0) >= 3).length;
  if (low >= 3) out.push('You’ve logged feeling very low or very anxious on several days. If it’s heavy to carry, please tell someone: a doctor, or a helpline (More → Support lists some). Strong low mood before each bleed is real and treatable.');
  return out;
}

export const SYMPTOM_NOT_MEDICAL =
  'Not medical advice. See a doctor or nurse for severe pain, very heavy bleeding, missed or very irregular periods, bleeding after sex or after menopause, or anything that worries you. In an emergency, call your local emergency number.';

// ── Comfort, the witchy way ──────────────────────────────────────────────

export type Comfort = {
  title: string;
  /** Folk, herbal and ritual comfort, as traditionally used. */
  ideas: string[];
  /** What to watch for with these in particular. */
  safety: string;
  links: PracticeLink[];
};

const premade = (id: string, label: string): PracticeLink => ({ kind: 'premade', id, label });
const library = (id: string, label: string): PracticeLink => ({ kind: 'library', id, label });

/** Said with every herbal idea. */
export const HERB_SAFETY =
  'Herbs and oils can interact with medicines and aren’t right for everyone. Check with a doctor or pharmacist first if you’re pregnant or trying to be, breastfeeding, taking any medicine (blood thinners, blood pressure, diabetes, hormonal or mood medicines especially), or have allergies (chamomile and calendula are in the daisy family). Dilute essential oils and patch-test them; never take them by mouth.';

/** Comfort for each common symptom (and heavy flow). Library links name entries the app has. */
export const COMFORT: Record<string, Comfort> = {
  cramps: {
    title: 'For cramps',
    ideas: [
      'Warmth: a hot-water bottle wrapped in a cloth, or a warm compress of a flannel wrung out in hot water, on the belly or lower back. Warm, never hot enough to mark the skin.',
      'Ginger or chamomile tea, both traditionally used to ease cramping.',
      'Raspberry leaf tea is a traditional women’s herb, sipped through the cycle by many.',
      'A rest ritual: lie down with red jasper or hematite on your belly and breathe slowly into the ache.',
    ],
    safety: 'Raspberry leaf isn’t for pregnancy unless your midwife suggests it late on. Ginger can add to the effect of blood thinners. If painkillers don’t help or pain stops you doing ordinary things, see a doctor.',
    links: [library('traditional:herb:ginger', 'Ginger'), library('traditional:herb:chamomile', 'Chamomile'), library('traditional:crystal:red_jasper', 'Red Jasper')],
  },
  bloating: {
    title: 'For bloating',
    ideas: ['Fennel or peppermint tea after meals, both old kitchen remedies for a full belly.', 'A gentle belly rub with warm hands, slowly and clockwise.', 'Loose, soft clothes, and a slow walk if you can.'],
    safety: 'Peppermint can make reflux worse. Keep fennel to tea amounts in pregnancy. Bloating that lasts most days, not just before your bleed, is worth mentioning to a doctor.',
    links: [library('traditional:herb:fennel', 'Fennel'), library('traditional:herb:peppermint', 'Peppermint')],
  },
  headache: {
    title: 'For headaches',
    ideas: ['A cool cloth on the forehead in a dark, quiet room, and a glass of water.', 'A few drops of lavender on a cloth to breathe in, rather than on the skin.', 'Peppermint oil, well diluted, dabbed on the temples away from the eyes.', 'Amethyst held or laid by the pillow while you rest.'],
    safety: 'Dilute oils and keep them away from the eyes. A sudden, severe headache, or one with a stiff neck, fever, weakness or changes in vision, needs urgent medical help.',
    links: [library('traditional:herb:lavender', 'Lavender'), library('traditional:herb:peppermint', 'Peppermint'), library('traditional:crystal:amethyst', 'Amethyst')],
  },
  tender_breasts: {
    title: 'For tender breasts',
    ideas: ['Soft, well-fitting support, and a warm or cool compress, whichever feels kinder.', 'Less salt and caffeine in the days before your bleed is an old piece of advice many find helps.', 'Rose quartz for a tender heart as well as a tender body.'],
    safety: 'A new lump, or a change that doesn’t come and go with your cycle, needs a doctor’s check.',
    links: [library('traditional:crystal:rose_quartz', 'Rose Quartz'), library('traditional:herb:rose', 'Rose')],
  },
  back_pain: {
    title: 'For back pain',
    ideas: ['A warm compress on the lower back, and a slow stretch on the floor.', 'Ground while you rest: hematite or smoky quartz in your hand, breathing down into the earth.', 'A warm bath with a handful of salt, if you have one.'],
    safety: 'Don’t sleep on a heat pad. Severe or one-sided back pain with a fever, or pain that’s new and lasting, needs a doctor.',
    links: [library('traditional:crystal:hematite', 'Hematite'), library('traditional:crystal:smoky_quartz', 'Smoky Quartz'), premade('green-earth-stone-soil-grounding', 'Earth: Stone and Soil Grounding')],
  },
  acne: {
    title: 'For breakouts',
    ideas: ['A gentle face-washing ritual with plain water, no scrubbing, naming what you wash away.', 'Cooled chamomile tea on a soft cloth as a calming compress.', 'Calendula, long used in skin salves.'],
    safety: 'Patch-test anything new. Calendula and chamomile can cause reactions in people allergic to the daisy family. Painful or scarring acne is worth seeing a doctor about.',
    links: [library('traditional:herb:calendula', 'Calendula'), library('traditional:herb:chamomile', 'Chamomile')],
  },
  fatigue: {
    title: 'For tiredness',
    ideas: ['Rest is practice: lower the bar for today, without guilt.', 'Nettle tea, traditionally drunk as a strengthening tonic, and an iron-rich bowl of broth, greens or beans.', 'Carnelian for a gentle, warming spark.'],
    safety: 'Nettle can interact with blood pressure, diabetes and blood-thinning medicines. Tiredness that lasts, especially with heavy bleeding, is worth asking a doctor to check your iron.',
    links: [library('traditional:herb:nettle', 'Nettle'), premade('kitchen-healing-broth', 'Hearth Healing Broth'), library('traditional:crystal:carnelian', 'Carnelian')],
  },
  insomnia: {
    title: 'For poor sleep',
    ideas: ['Chamomile or lemon balm tea an hour before bed.', 'An amethyst and lavender sachet under the pillow.', 'A small closing ritual: screens away, one candle, three slow breaths, then snuff it out.'],
    safety: 'Valerian and other sleep herbs can add to sedatives, sleeping tablets and alcohol, and aren’t for pregnancy without advice. Sleeplessness that goes on for weeks is worth talking to a doctor about.',
    links: [premade('crystal-amethyst-sleep-sachet', 'Amethyst and Lavender Sleep Sachet'), library('traditional:herb:lemon_balm', 'Lemon Balm'), library('traditional:herb:valerian', 'Valerian')],
  },
  cravings: {
    title: 'For cravings',
    ideas: ['Honour them gently: warm, spiced food, and something sweet offered to yourself with thanks.', 'Cinnamon in food or a warm drink, an old comfort.', 'Bake something slowly, as a small sweetening working.'],
    safety: 'Cinnamon in food amounts is fine for most; supplements can affect blood sugar medicines.',
    links: [library('traditional:herb:cinnamon', 'Cinnamon'), premade('kitchen-honey-sweetening-cake', 'Honey Sweetening Cake')],
  },
  nausea: {
    title: 'For nausea',
    ideas: ['Ginger tea, or a thin slice of fresh ginger in hot water, sipped slowly.', 'Fresh air at an open window, and small, plain meals.', 'Peppermint tea, if it sits well with you.'],
    safety: 'Ginger can add to blood thinners; peppermint can make reflux worse. Nausea with a late bleed may mean a pregnancy test is worth doing. Vomiting that won’t stop needs a doctor.',
    links: [library('traditional:herb:ginger', 'Ginger'), library('traditional:herb:peppermint', 'Peppermint')],
  },
  anxious: {
    title: 'For anxiety',
    ideas: ['Ground: feet on the floor or the earth, a stone in your hand, slow breaths out longer than in.', 'Lemon balm or chamomile tea, both traditionally calming.', 'Lepidolite, kept in a pocket to hold.'],
    safety: 'If anxiety is constant or overwhelming, talk to a doctor; More → Support lists helplines.',
    links: [premade('kitchen-solitary-grounding-centering', 'Grounding and Centering Basics'), library('traditional:herb:lemon_balm', 'Lemon Balm'), library('traditional:crystal:lepidolite', 'Lepidolite')],
  },
  irritable: {
    title: 'For irritability',
    ideas: ['Give the edge somewhere to go: write it all out by candlelight, then tear or safely burn the page.', 'A brisk walk, or shaking out your hands and shoulders.', 'Black tourmaline by your desk, as a boundary.'],
    safety: 'If irritability or low mood before your bleed is strong enough to affect work or relationships most months, tell a doctor: it’s real and treatable.',
    links: [premade('kitchen-solitary-evening-reflection', 'Evening Reflection by Candlelight'), library('traditional:crystal:black_tourmaline', 'Black Tourmaline')],
  },
  low: {
    title: 'For low days',
    ideas: ['Be gentle: daylight if you can get it, a warm drink, someone kind to talk to.', 'Light a candle for yourself and say one true, kind thing in the mirror.', 'Citrine or rose quartz in your pocket.'],
    safety: 'Avoid St John’s wort unless a doctor agrees: it interacts with many medicines, including the pill. If low mood lasts more than two weeks, or you think about harming yourself, please reach out now; More → Support lists helplines.',
    links: [premade('kitchen-solitary-self-love-mirror', 'Self-Love Mirror Ritual'), library('traditional:crystal:citrine', 'Citrine'), library('traditional:crystal:rose_quartz', 'Rose Quartz')],
  },
  calm: {
    title: 'For calm days',
    ideas: ['Notice what helped and write it down: it’s a spell you can use again.', 'A moonstone by the bed, to remember the feeling by.'],
    safety: 'Nothing to watch for here.',
    links: [library('traditional:crystal:moonstone', 'Moonstone')],
  },
  energised: {
    title: 'For energised days',
    ideas: ['Spend some of it on a working or a creative task you’ve been saving.', 'Keep a little back for your autumn.'],
    safety: 'Nothing to watch for here.',
    links: [premade('cosmic-sunday-sun-success', 'Sunday Sun Crown'), library('traditional:crystal:carnelian', 'Carnelian')],
  },
  libido_low: {
    title: 'For low desire',
    ideas: ['Nothing is wrong with low desire. Rest, warmth and touch without expectation.', 'A rose bath for tenderness towards yourself.'],
    safety: 'A lasting change, especially after starting a new medicine, is worth raising with a doctor.',
    links: [premade('cosmic-friday-venus-love', 'Friday Venus Rose Bath'), library('traditional:herb:rose', 'Rose')],
  },
  libido_high: {
    title: 'For high desire',
    ideas: ['Inner summer often brings it. Dance, create, or turn it into a love working.', 'Garnet for passion and commitment.'],
    safety: 'Nothing to watch for here.',
    links: [premade('cosmic-friday-venus-love', 'Friday Venus Rose Bath'), library('traditional:crystal:garnet', 'Garnet')],
  },
  discharge: {
    title: 'For discharge',
    ideas: ['Changes through the cycle are normal. Cotton and loose clothes help.'],
    safety: 'Never put herbs, oils, vinegar or crystals inside the vagina, and don’t douche. An unusual smell or colour, itching or pain is worth checking with a doctor or nurse.',
    links: [],
  },
  spotting: {
    title: 'For spotting',
    ideas: ['Note it and take the day gently. A moonstone for a quiet day.'],
    safety: 'Spotting now and then is common, but tell a doctor if it keeps happening, comes after sex, or after menopause.',
    links: [library('traditional:crystal:moonstone', 'Moonstone')],
  },
  heavy_flow: {
    title: 'For heavy days',
    ideas: ['Rest, warmth and plenty to drink.', 'Iron-rich food: greens, beans, a nettle soup or a slow broth.', 'A red cord tied loosely at the wrist, as an old folk charm for staying steady.'],
    safety: 'Very heavy bleeding, soaking through protection every hour or two, large clots, or feeling faint or very tired needs a doctor.',
    links: [premade('kitchen-healing-broth', 'Hearth Healing Broth'), library('traditional:herb:nettle', 'Nettle')],
  },
};

/** Comfort for each season, beside the symptoms. */
export const SEASON_COMFORT: Record<Season, string> = {
  winter: 'Winter comfort: warmth, rest, broths and early nights. Grounding stones like hematite and red jasper, and nothing you don’t have to do.',
  spring: 'Spring comfort: fresh air, light food and new things. Herbs that lift, like lemon balm and rosemary, in a cup or a bath.',
  summer: 'Summer comfort: people, voice and movement. Rose, cinnamon and sun; drink water and remember to rest too.',
  autumn: 'Autumn comfort: fewer plans, more boundaries, and kindness to yourself. Chamomile, lavender and an early night before winter comes.',
};

/** The comfort to show now: for the symptoms logged in the last three days, strongest first (and heavy flow), else for those their notes say this season usually brings. */
export function comfortNow(data: CycleData, today: string, season: Season): { comforts: Comfort[]; from: 'recent' | 'season' | null } {
  const recent = new Map<string, number>();
  for (const n of data.notes) {
    const ago = daysBetween(n.date, today);
    if (ago < 0 || ago > 2) continue;
    for (const [k, v] of Object.entries(n.symptoms ?? {})) recent.set(k, Math.max(recent.get(k) ?? 0, v));
  }
  for (const b of data.bleeds) for (const [k, f] of Object.entries(b.flow)) if (f === 'heavy' && daysBetween(k, today) >= 0 && daysBetween(k, today) <= 2) recent.set('heavy_flow', 3);
  const pick = (keys: string[]) => keys.filter((k) => COMFORT[k] && COMFORT[k].ideas.length).slice(0, 3).map((k) => COMFORT[k]);
  if (recent.size) return { comforts: pick([...recent.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)), from: 'recent' };
  const { list } = occurrences(data);
  const seasonal = new Map<string, number>();
  for (const o of list) if (o.season === season && !o.key.startsWith('custom:')) seasonal.set(o.key, (seasonal.get(o.key) ?? 0) + 1);
  const usual = [...seasonal.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  return usual.length ? { comforts: pick(usual), from: 'season' } : { comforts: [], from: null };
}

/** "Cramps (strong), bloating (mild)": a day's symptoms in a line. */
export function symptomLine(note: DayNote): string {
  const parts = [
    ...Object.entries(note.symptoms ?? {}).map(([k, v]) => `${symptomDef(k)?.label ?? k} (${INTENSITY_NAMES[v]})`),
    ...Object.entries(note.custom ?? {}).map(([k, v]) => `${k} (${INTENSITY_NAMES[v]})`),
  ];
  return parts.length ? cap(parts.join(', ').toLowerCase()) : '';
}
