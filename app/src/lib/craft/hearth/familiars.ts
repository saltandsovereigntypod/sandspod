// Familiars: the animals you live with, the spirit companions you work
// beside, and the ones who have died. Their care days (and when each is
// next due), the work they join, the signs you notice, and a memorial for
// those gone. Pet safety reads the blending lab's own plant notes
// (kitchen/blend.ts), so a cat's page warns about the oils you burn.
//
// Kept as craft entries (collection hearth.familiars). Pure, so it can be
// tested and shared with the website (js/core/spirit.js).

import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';
import { plantSafety } from '../kitchen/blend.ts';
import { nextOccurrence } from '../hedge/ancestors.ts';

export const FAMILIARS = 'hearth.familiars';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const day = (v: unknown) => (dateFromKey(str(v)) ? str(v) : '');
const DAY = 86_400_000;

export type FamiliarKind = 'living' | 'spirit' | 'remembered';
export const FAMILIAR_KINDS: { id: FamiliarKind; label: string; hint: string }[] = [
  { id: 'living', label: 'Living animal', hint: 'An animal you live with and care for' },
  { id: 'spirit', label: 'Spirit familiar', hint: 'A companion met in trance, dream or working, with no body in this world' },
  { id: 'remembered', label: 'Remembered', hint: 'An animal who has died, kept with love' },
];

export type Animal = 'cat' | 'dog' | 'bird' | 'rabbit' | 'small' | 'reptile' | 'fish' | 'horse' | 'other';
export const ANIMALS: { id: Animal; label: string }[] = [
  { id: 'cat', label: 'Cat' },
  { id: 'dog', label: 'Dog' },
  { id: 'bird', label: 'Bird' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'small', label: 'Rat, mouse, hamster or guinea pig' },
  { id: 'reptile', label: 'Reptile or amphibian' },
  { id: 'fish', label: 'Fish' },
  { id: 'horse', label: 'Horse' },
  { id: 'other', label: 'Another animal' },
];
export const animalLabel = (id: string) => ANIMALS.find((a) => a.id === id)?.label ?? 'Animal';

export type WorkKind = 'altar' | 'divination' | 'protection' | 'healing' | 'grounding' | 'dreams' | 'spellwork' | 'ritual' | 'trance';
export const WORK_KINDS: { id: WorkKind; label: string }[] = [
  { id: 'altar', label: 'Sits by the altar' },
  { id: 'ritual', label: 'Joins rituals' },
  { id: 'spellwork', label: 'Spellwork' },
  { id: 'divination', label: 'Divination' },
  { id: 'protection', label: 'Guards the house' },
  { id: 'healing', label: 'Comfort and healing' },
  { id: 'grounding', label: 'Grounding' },
  { id: 'dreams', label: 'Dreams' },
  { id: 'trance', label: 'Trance and journeying' },
];

export type CareDay = { what: string; every: number; last: string };
export type FamiliarNoteKind = 'sign' | 'work' | 'care' | 'note';
export const NOTE_KINDS: { id: FamiliarNoteKind; label: string }[] = [
  { id: 'sign', label: 'A sign' },
  { id: 'work', label: 'Worked together' },
  { id: 'care', label: 'Care' },
  { id: 'note', label: 'A note' },
];
export type FamiliarNote = { on: string; kind: FamiliarNoteKind; text: string };

export type Familiar = {
  name: string;
  kind: FamiliarKind;
  animal: Animal;
  /** Breed, species or form: "tabby", "a grey hare", "a raven seen in trance". */
  form: string;
  born: string;
  /** When they came into your life. */
  came: string;
  /** For those remembered. */
  died: string;
  care: CareDay[];
  work: WorkKind[];
  /** Herbs, oils, incense and stones used around them, one to a line or comma separated, for the safety check. */
  around: string;
  about: string;
  notes: FamiliarNote[];
  /** The memorial, once they've gone. */
  memorial: { words: string; resting: string; keepsake: string };
};

export const blankFamiliar = (kind: FamiliarKind = 'living'): Familiar => ({
  name: '',
  kind,
  animal: 'cat',
  form: '',
  born: '',
  came: '',
  died: '',
  care: [],
  work: [],
  around: '',
  about: '',
  notes: [],
  memorial: { words: '', resting: '', keepsake: '' },
});

export function normalizeFamiliar(raw: unknown): Familiar {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const m = (r.memorial && typeof r.memorial === 'object' ? r.memorial : {}) as Record<string, unknown>;
  const care = (Array.isArray(r.care) ? r.care : [])
    .map((c) => (c && typeof c === 'object' ? (c as Record<string, unknown>) : {}))
    .map((c) => ({ what: str(c.what).trim().slice(0, 80), every: Math.min(365, Math.max(1, Math.round(Number(c.every) || 0))), last: day(c.last) }))
    .filter((c) => c.what && Number(c.every) > 0)
    .slice(0, 12);
  const notes = (Array.isArray(r.notes) ? r.notes : [])
    .map((n) => (n && typeof n === 'object' ? (n as Record<string, unknown>) : {}))
    .map((n) => ({ on: day(n.on), kind: (NOTE_KINDS.some((k) => k.id === n.kind) ? n.kind : 'note') as FamiliarNoteKind, text: str(n.text) }))
    .filter((n) => n.on && n.text.trim())
    .sort((a, b) => b.on.localeCompare(a.on))
    .slice(0, 500);
  return {
    name: str(r.name).trim() || 'Unnamed',
    kind: FAMILIAR_KINDS.some((k) => k.id === r.kind) ? (r.kind as FamiliarKind) : 'living',
    animal: ANIMALS.some((a) => a.id === r.animal) ? (r.animal as Animal) : 'other',
    form: str(r.form),
    born: day(r.born),
    came: day(r.came),
    died: day(r.died),
    care,
    work: Array.isArray(r.work) ? (r.work.filter((w) => WORK_KINDS.some((k) => k.id === w)) as WorkKind[]) : [],
    around: str(r.around),
    about: str(r.about),
    notes,
    memorial: { words: str(m.words), resting: str(m.resting), keepsake: str(m.keepsake) },
  };
}

/** Suggested care days for an animal, to add with a tap. Rhythms are common guidance; your vet's word comes first. */
export function careSuggestions(animal: Animal): { what: string; every: number }[] {
  const flea = { what: 'Flea and worming treatment', every: 30 };
  switch (animal) {
    case 'cat':
      return [{ what: 'Fresh litter, full clean', every: 7 }, flea, { what: 'Brush and check coat, claws, teeth', every: 7 }, { what: 'Vet check and vaccinations', every: 365 }];
    case 'dog':
      return [flea, { what: 'Brush and check ears, paws, teeth', every: 7 }, { what: 'Nail trim', every: 30 }, { what: 'Vet check and vaccinations', every: 365 }];
    case 'rabbit':
    case 'small':
      return [{ what: 'Full clean of the hutch or cage', every: 7 }, { what: 'Check teeth, nails and weight', every: 14 }, { what: 'Vet check', every: 365 }];
    case 'bird':
      return [{ what: 'Clean the cage and perches', every: 7 }, { what: 'Check beak, nails and feathers', every: 14 }];
    case 'reptile':
      return [{ what: 'Full clean of the enclosure', every: 30 }, { what: 'Check heat and UV lamps (UV bulbs fade)', every: 180 }];
    case 'fish':
      return [{ what: 'Partial water change', every: 7 }, { what: 'Test the water', every: 7 }, { what: 'Clean the filter', every: 30 }];
    case 'horse':
      return [{ what: 'Farrier', every: 42 }, { what: 'Worming check', every: 90 }, { what: 'Teeth checked', every: 365 }];
    default:
      return [];
  }
}

export type CareDue = { index: number; what: string; due: string; inDays: number };

/** When each care day is next due, soonest (or most overdue) first. Never done counts as due today. */
export function careDue(f: Familiar, now: Date): CareDue[] {
  if (f.kind !== 'living') return [];
  const today = dateFromKey(localDateKey(now))!;
  return f.care
    .map((c, index) => {
      const last = dateFromKey(c.last);
      const due = last ? new Date(last.getFullYear(), last.getMonth(), last.getDate() + c.every) : today;
      return { index, what: c.what, due: localDateKey(due), inDays: Math.round((due.getTime() - today.getTime()) / DAY) };
    })
    .sort((a, b) => a.inDays - b.inDays);
}

export function markCareDone(f: Familiar, index: number, on: string): Familiar {
  return { ...f, care: f.care.map((c, i) => (i === index ? { ...c, last: on } : c)) };
}

/** "3 years", "7 months", "2 weeks": how long since a date, or between two. */
export function spanWords(from: string, to: string): string {
  const a = dateFromKey(from);
  const b = dateFromKey(to);
  if (!a || !b || b < a) return '';
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  if (months >= 24) return `${Math.floor(months / 12)} years`;
  if (months >= 12) return months === 12 ? 'a year' : `a year and ${months - 12} ${months - 12 === 1 ? 'month' : 'months'}`;
  if (months >= 1) return `${months} ${months === 1 ? 'month' : 'months'}`;
  const weeks = Math.floor((b.getTime() - a.getTime()) / (7 * DAY));
  return weeks >= 1 ? `${weeks} ${weeks === 1 ? 'week' : 'weeks'}` : 'a few days';
}

/** Their line in a list. */
export function familiarLine(f: Familiar, now: Date): string {
  const today = localDateKey(now);
  if (f.kind === 'remembered') return [animalLabel(f.animal), f.died ? `died ${f.died}` : 'remembered'].filter(Boolean).join(' · ');
  if (f.kind === 'spirit') return ['Spirit familiar', f.form].filter(Boolean).join(' · ');
  const age = f.born ? spanWords(f.born, today) : '';
  return [f.form || animalLabel(f.animal), age ? `${age} old` : '', f.came ? `with you ${spanWords(f.came, today) || 'since recently'}` : ''].filter(Boolean).join(' · ');
}

/** The day they died, next time it comes round, for remembering. */
export function memorialDay(f: Familiar, now: Date): { date: Date; years: number } | null {
  const died = dateFromKey(f.died);
  if (!died || f.kind !== 'remembered') return null;
  const date = nextOccurrence(died.getMonth() + 1, died.getDate(), now);
  return { date, years: date.getFullYear() - died.getFullYear() };
}

export type PetCaution = { title: string; text: string };

const ANIMAL_CAUTIONS: Partial<Record<Animal, PetCaution[]>> = {
  cat: [
    { title: 'Essential oils and diffusers', text: 'Cats’ livers can’t break down many compounds in essential oils (phenols, some terpenes). Don’t diffuse oils in a room a cat can’t leave, and never put oils on their fur.' },
    { title: 'Lilies', text: 'Every part of true lilies and day lilies, even pollen licked from fur or water from the vase, can cause fatal kidney failure in cats. Keep them off the altar entirely.' },
    { title: 'Salt and salt lamps', text: 'Salt lines, salt bowls and licked salt lamps can cause salt poisoning. Keep salt work where paws can’t reach.' },
  ],
  dog: [
    { title: 'Offerings', text: 'Chocolate, grapes and raisins, onion and garlic, xylitol (in sweets and some peanut butter), alcohol and cooked bones are dangerous to dogs. Clear food offerings away before they can be eaten.' },
    { title: 'Essential oils', text: 'Tea tree, pennyroyal and wintergreen oils are toxic to dogs; keep oils capped and high up.' },
  ],
  bird: [
    { title: 'Smoke and fumes', text: 'Birds’ lungs are extremely sensitive. Incense, smoke cleansing, scented candles, aerosols and fumes from non-stick pans can kill a bird. Burn nothing in the room they live in.' },
  ],
  rabbit: [{ title: 'Smoke and scent', text: 'Rabbits and small animals have delicate airways; keep incense and oil diffusers well away from them.' }],
  small: [{ title: 'Smoke and scent', text: 'Rats, mice and guinea pigs are prone to breathing trouble; keep incense, smoke and diffusers well away.' }],
  fish: [{ title: 'Stones in the water', text: 'Don’t put crystals in a tank: malachite, azurite and other copper stones are poisonous in water, and limestone, calcite and shells change its hardness.' }],
  reptile: [{ title: 'Heat and stones', text: 'Keep candles away from enclosures, and don’t add stones you haven’t checked to their water bowl.' }],
  horse: [{ title: 'Plants', text: 'Yew, ragwort, foxglove and acorns in quantity are poisonous to horses: mind what grows by a field shrine.' }],
};

const ALL_ANIMALS: PetCaution[] = [
  { title: 'Flames', text: 'Tails, whiskers and curious noses find candles. Use enclosed holders, or put lit candles where they can’t go, and never leave a flame alone with them.' },
];

/**
 * What to take care over with this animal: the general cautions for its kind,
 * and anything named in "used around them" that the blending lab marks as
 * harmful to cats or dogs.
 */
export function petCautions(f: Pick<Familiar, 'animal' | 'around' | 'kind'>): PetCaution[] {
  if (f.kind !== 'living') return [];
  const out = [...(ANIMAL_CAUTIONS[f.animal] ?? []), ...ALL_ANIMALS];
  if (f.animal === 'cat' || f.animal === 'dog') {
    const flagged: string[] = [];
    for (const name of f.around.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)) {
      const s = plantSafety(name);
      if (s && (f.animal === 'cat' ? s.cats : s.dogs)) flagged.push(name);
    }
    if (flagged.length)
      out.unshift({
        title: `Among what you use around them`,
        text: `${flagged.join(', ')} ${flagged.length === 1 ? 'is' : 'are'} on pet-safety lists as harmful to ${f.animal === 'cat' ? 'cats' : 'dogs'}. Use ${flagged.length === 1 ? 'it' : 'them'} where they can’t reach or breathe it in, or choose something else. If they eat some, call a vet.`,
      });
  }
  return out;
}

/** An honest word on where familiars come from. */
export const FAMILIAR_HISTORY =
  'The familiar of the English witch trials was a small animal or imp said to serve the accused: Matthew Hopkins’s Discovery of Witches (1647) lists names such as Vinegar Tom, Pyewacket and Grizzel Greedigut, recorded from frightened women under questioning. Cunning folk across Europe also spoke of helping spirits. The idea of a beloved pet as a partner in the craft is modern, and none the worse for it: here, the animal’s welfare comes before any work.';
