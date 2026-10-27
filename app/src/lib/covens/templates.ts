// Ready-made starting points for the coven ritual builder (builder.ts), across
// traditions and for meetings. Each is an outline: its sections, the roles it
// suggests, a checklist for before, what happens afterwards, and its steps,
// made from the step actions (stepActions.ts) with their fields filled in.
// Everything stays editable once chosen.
//
// Written to be respectful: modern practice is labelled as modern, closed or
// initiatory rites are not invented, and where a coven has its own words (an
// opening prayer, an oath) the template leaves a clear place for them rather
// than supplying them. The website offers the same list (js/core/covens.js).
// Pure, so it can be tested.

import { defaultContribution, type ContributionKind, type StepContribution } from './contributions.ts';
import { blankBuilderStep, type Afterwards, type MeetingSettings, type BuilderStep, type GatheringKind, type PlanSection, type PrepRemind, type RitualPlan, type StepDetails, type TurnMode } from './builder.ts';
import { WHOLE_COVEN } from './picker.ts';
import { actionOf, applyAction, type AltarEffect } from './stepActions.ts';
import type { FieldValues } from './fields.ts';

/** One step of a template: an action (or none), its section, who, how, and anything it changes from the action's own. */
type TStep = {
  a?: string;
  s: string;
  t?: string;
  /** Role ids, or 'all' for the whole coven. */
  r?: string[];
  turn?: TurnMode;
  f?: FieldValues;
  d?: string;
  w?: string;
  m?: number;
  ask?: ContributionKind;
  askWith?: Partial<StepContribution>;
  fx?: AltarEffect;
};

export type RitualTemplate = {
  id: string;
  name: string;
  kind: GatheringKind;
  /** The tradition or kind of practice, shown with it ("Hellenic", "Modern pagan", "Meeting"). */
  tradition: string;
  summary: string;
  /** A line about where it comes from, when it matters. */
  note?: string;
  occasion?: string;
  occasionName?: string;
  intention?: string;
  sections: PlanSection[];
  roles: { id: string; name: string }[];
  checklist?: { text: string; remind?: PrepRemind }[];
  afterwards?: Partial<Afterwards>;
  /** A meeting's settings (role ids are the template's own). */
  meeting?: MeetingSettings;
  steps: TStep[];
};

const RITE: PlanSection[] = [
  { id: 'preparation', name: 'Preparation' },
  { id: 'opening', name: 'Opening' },
  { id: 'work', name: 'The work' },
  { id: 'closing', name: 'Closing' },
  { id: 'afterwards', name: 'Afterwards' },
];

// A key stands for the crossroads until there is a picture of one.
const CROSSROADS_MARKER = { key: 'tools:key|standard', name: 'Key', image: '/assets/altar/objects/tools/key/key.png', category: 'tools' };

const LINK_PRAYER = '[Link your coven’s prayer from the Book here, or write it in.]';

// ─── The eight sabbats, briefly (modern pagan practice) ──────────────────

type Sabbat = { id: string; name: string; theme: string; offering: string; words: string; work: string; workTitle: string; ask?: ContributionKind; prompt?: string };

const SABBATS: Sabbat[] = [
  { id: 'samhain', name: 'Samhain', theme: 'the year’s end and the beloved dead', offering: 'apples, bread or a plate set for the dead', words: 'At the turning of the year we remember those who came before us. You are not forgotten.', workTitle: 'Speak the names of the dead', work: 'Go round the circle. Each person may speak the name of someone they have lost, or pass.', ask: 'ancestor', prompt: 'Whose name will you speak?' },
  { id: 'yule', name: 'Yule', theme: 'the longest night and the sun’s return', offering: 'evergreens, oranges or spiced cake', words: 'In the longest night we keep the flame. The sun returns; the light grows from here.', workTitle: 'Keep vigil with a single flame', work: 'Put out every light but one. Sit together in the dark for a while, then light candles from that one flame.' },
  { id: 'imbolc', name: 'Imbolc', theme: 'first stirrings of spring, and hearth and well', offering: 'milk, butter or seeds', words: 'The earth stirs beneath the frost. We welcome the first light of spring.', workTitle: 'Name what you are tending', work: 'Each person names one thing they will tend through the coming season.', ask: 'intention', prompt: 'What will you tend as the light grows?' },
  { id: 'ostara', name: 'Ostara', theme: 'the spring equinox and balance', offering: 'eggs, flowers or seeds', words: 'Day and night stand level. We plant what we hope to grow.', workTitle: 'Bless seeds', work: 'Pass round a bowl of seeds. Each person holds a few and names what they hope will grow, then they are planted later.' },
  { id: 'beltane', name: 'Beltane', theme: 'the fullness of spring and life', offering: 'flowers, honey or ribbons', words: 'The land is in flower. We celebrate life, joy and the fire of summer coming.', workTitle: 'Tie ribbons of wishes', work: 'Each person ties a ribbon to a branch or cord, naming a wish for the summer.' },
  { id: 'litha', name: 'Litha', theme: 'midsummer and the sun at its height', offering: 'summer flowers, mead or fruit', words: 'The sun stands at its height. We give thanks for light and warmth.', workTitle: 'Give thanks to the sun', work: 'Each person names something the light has brought them this year.', ask: 'gratitude' },
  { id: 'lughnasadh', name: 'Lughnasadh', theme: 'the first harvest', offering: 'bread from the new grain', words: 'The first grain is cut. We share the bread and give thanks for the harvest.', workTitle: 'Break the harvest bread', work: 'Bless a loaf, set a piece aside as an offering, and pass it round so each person eats.' },
  { id: 'mabon', name: 'Mabon', theme: 'the autumn equinox and thanks for the harvest', offering: 'fruit, wine or nuts', words: 'Day and night stand level again. We give thanks for all that has been gathered.', workTitle: 'Name your harvest', work: 'Each person names something they have gathered in this year.', ask: 'gratitude', prompt: 'What have you harvested this year?' },
];

function sabbatTemplate(s: Sabbat): RitualTemplate {
  return {
    id: `sabbat_${s.id}`,
    name: s.name,
    kind: 'rite',
    tradition: 'Modern pagan',
    summary: `A short rite for ${s.name}: ${s.theme}.`,
    note: 'The Wheel of the Year as many modern pagans and Wiccans keep it. Change anything to suit your coven.',
    occasion: 'sabbat',
    occasionName: s.name,
    sections: RITE,
    roles: [{ id: 'leader', name: 'High Priestess' }, { id: 'maiden', name: 'Maiden' }],
    checklist: [{ text: `Bring an offering: ${s.offering}.`, remind: 'day' }],
    steps: [
      { a: 'cleanse', s: 'opening', r: ['maiden'], f: { method: 'smoke' } },
      { a: 'cast_circle', s: 'opening', r: ['leader'] },
      { a: 'call_quarters', s: 'opening', r: ['leader'], f: { directions: ['east', 'south', 'west', 'north'], order: 'sunwise' } },
      { a: 'read_aloud', s: 'opening', t: `The meaning of ${s.name}`, r: ['leader'], d: `Speak briefly about ${s.name}: ${s.theme}.`, w: s.words, f: { source: s.name } },
      { s: 'work', t: s.workTitle, r: ['all'], turn: s.ask ? 'in_turn' : 'together', d: s.work, ask: s.ask, askWith: s.prompt ? { prompt: s.prompt, timing: 'live' } : { timing: 'live' }, m: 10 },
      { a: 'place_offering', s: 'work', r: ['all'], turn: 'in_turn', f: { to: 'the gods and the land', where: 'On the altar' }, ask: 'offering', askWith: { timing: 'live' } },
      { a: 'cakes_ale', s: 'closing', r: ['maiden'] },
      { a: 'release_quarters', s: 'closing', r: ['leader'], f: { directions: ['east', 'south', 'west', 'north'], order: 'widdershins' } },
      { a: 'open_circle', s: 'closing', r: ['leader'] },
    ],
  };
}

// ─── The templates ───────────────────────────────────────────────────────

export const RITUAL_TEMPLATES: RitualTemplate[] = [
  {
    id: 'hekate_deipnon',
    name: 'Hekate’s Deipnon',
    kind: 'rite',
    tradition: 'Hellenic',
    summary: 'The meal for Hekate at the dark moon: cleansing, releasing the month past, and offerings at the crossroads.',
    note: 'The Deipnon is kept on the last day of the lunar month in Hellenic practice. This version is the one Salt & Sovereignty’s own coven keeps.',
    occasion: 'new_moon',
    occasionName: 'Hekate’s Deipnon',
    intention: 'To honour Hekate and release what the past moon has left behind.',
    sections: RITE,
    roles: [{ id: 'hps', name: 'High Priestess' }],
    checklist: [{ text: 'Wash your hands before you arrive.', remind: 'hour' }],
    afterwards: { hold_hours: 24, notes: 'The offerings and papers stay at the crossroads for Hekate. After a day, the High Priestess clears the altar.' },
    steps: [
      { a: 'prayer', s: 'opening', t: 'Opening prayer', r: ['all'], turn: 'together', f: { prayer: 'Our opening prayer' }, d: 'Say the coven’s opening prayer together.', w: LINK_PRAYER },
      { a: 'light_candle', s: 'opening', t: 'Light Hekate’s candle', r: ['hps'], f: { candle: 'Hekate’s candle', colour: 'black' }, d: 'Light Hekate’s candle and let the flame settle before you speak.', w: 'Hail Hekate, guide. Hail Hekate, guardian. Hail Hekate, gatekeeper.' },
      { a: 'cleanse', s: 'opening', r: ['hps'], turn: 'together', f: { method: 'khernips' }, d: 'Light a bay leaf or a sprig of rosemary and quench it in a bowl of water. Each person washes their hands in it and touches a few drops to their face. (Khernips is the cleansing water of Hellenic practice; choose another way if you prefer.)' },
      { a: 'write_intention', s: 'work', t: 'Write what you are releasing', r: ['all'], turn: 'together', d: 'Each person writes what they are letting go of from the past moon’s cycle, and folds the paper.', ask: 'intention', askWith: { timing: 'live', visibility: 'leader', fate: 'altar', prompt: 'What are you releasing from the past moon’s cycle?' } },
      { a: 'lay_crossroads', s: 'work', r: ['hps'], f: { name: 'The crossroads', marker: [CROSSROADS_MARKER] }, d: 'Lay out the crossroads on the altar. Until the coven has a crossroads picture, a key stands for it (change it to anything your coven uses).' },
      { a: 'place_offering', s: 'work', t: 'Offerings at the crossroads', r: ['all'], turn: 'in_turn', f: { to: 'Hekate', where: 'At the crossroads', name: 'The crossroads offerings' }, d: 'The High Priestess invites each member in turn to bring their offering and set it at the crossroads.', w: '', ask: 'offering', askWith: { timing: 'live' } },
      { a: 'snuff_candle', s: 'closing', t: 'Put out Hekate’s candle', r: ['hps'], f: { candle: 'Hekate’s candle' }, d: 'Put out Hekate’s candle with a snuffer or your fingers, and thank her.' },
      { a: 'prayer', s: 'closing', t: 'Closing prayer', r: ['all'], turn: 'together', f: { prayer: 'Our closing prayer' }, d: 'Say the coven’s closing prayer together.', w: LINK_PRAYER },
    ],
  },
  {
    id: 'noumenia',
    name: 'Noumenia',
    kind: 'rite',
    tradition: 'Hellenic',
    summary: 'The new month’s first day: offerings to the household gods, and a fresh start.',
    note: 'Kept the day after the Deipnon, at the first sliver of the new moon, in modern Hellenic practice.',
    occasion: 'new_moon',
    occasionName: 'Noumenia',
    sections: RITE,
    roles: [{ id: 'host', name: 'Host' }],
    checklist: [{ text: 'Bring a little incense, honey cake or fruit to offer.', remind: 'day' }],
    steps: [
      { a: 'cleanse', s: 'opening', r: ['all'], turn: 'together', f: { method: 'khernips' }, d: 'Each person washes their hands in the khernips before approaching the shrine.' },
      { a: 'prayer', s: 'opening', t: 'Prayer to Hestia', r: ['host'], f: { prayer: 'To Hestia' }, d: 'In Hellenic practice Hestia is honoured first. Speak a short prayer to her.', w: 'Hestia, keeper of the hearth, first and last of every offering: be honoured here.' },
      { a: 'burn_incense', s: 'work', r: ['host'], d: 'Burn incense for the household gods and for the gods of your devotion.' },
      { a: 'place_offering', s: 'work', r: ['all'], turn: 'in_turn', f: { to: 'the household gods', where: 'At the shrine' }, ask: 'offering', askWith: { timing: 'live' } },
      { a: 'write_intention', s: 'work', t: 'An intention for the month', r: ['all'], ask: 'intention', askWith: { timing: 'live', visibility: 'me', fate: 'keep', prompt: 'What do you hope for this month?' } },
      { a: 'prayer', s: 'closing', t: 'Closing prayer to Hestia', r: ['host'], f: { prayer: 'To Hestia' }, w: 'Hestia, first and last: thank you.' },
    ],
  },
  {
    id: 'full_moon',
    name: 'Full moon esbat',
    kind: 'rite',
    tradition: 'Modern pagan',
    summary: 'A full moon circle: cast, call the quarters, the work of the month, cakes and ale.',
    note: 'An esbat as many modern Wiccan and pagan covens hold it.',
    occasion: 'full_moon',
    sections: RITE,
    roles: [{ id: 'hps', name: 'High Priestess' }, { id: 'hp', name: 'High Priest' }, { id: 'maiden', name: 'Maiden' }],
    steps: [
      { a: 'cleanse', s: 'preparation', r: ['maiden'], f: { method: 'salt_water' } },
      { a: 'ground_centre', s: 'opening', r: ['hps'], turn: 'together' },
      { a: 'cast_circle', s: 'opening', r: ['hps'] },
      { a: 'call_quarters', s: 'opening', r: ['hp'], f: { directions: ['east', 'south', 'west', 'north'], order: 'sunwise' } },
      { a: 'welcome_deity', s: 'opening', r: ['hps'] },
      { a: 'meditation', s: 'work', t: 'Drawing down the moon’s light', r: ['hps'], turn: 'together', d: 'Read a short meditation on the full moon’s light, leaving long pauses.' },
      { a: 'write_petition', s: 'work', r: ['all'], ask: 'petition', askWith: { timing: 'ahead' } },
      { a: 'raise_energy', s: 'work', r: ['all'], turn: 'together' },
      { a: 'cakes_ale', s: 'closing', r: ['maiden'] },
      { a: 'farewell_deity', s: 'closing', r: ['hps'] },
      { a: 'release_quarters', s: 'closing', r: ['hp'], f: { directions: ['east', 'south', 'west', 'north'], order: 'widdershins' } },
      { a: 'open_circle', s: 'closing', r: ['hps'] },
    ],
  },
  {
    id: 'new_moon',
    name: 'New moon intentions',
    kind: 'rite',
    tradition: 'Modern pagan',
    summary: 'A quiet new moon gathering for setting intentions for the month ahead.',
    occasion: 'new_moon',
    sections: RITE,
    roles: [{ id: 'leader', name: 'Facilitator' }],
    steps: [
      { a: 'ground_centre', s: 'opening', r: ['leader'], turn: 'together' },
      { a: 'light_candle', s: 'opening', r: ['leader'], f: { candle: 'The new moon candle', colour: 'white' } },
      { a: 'write_intention', s: 'work', r: ['all'], ask: 'intention', askWith: { timing: 'live', visibility: 'me', fate: 'keep', prompt: 'What will you begin with this moon?' } },
      { a: 'sharing_round', s: 'work', r: ['all'], turn: 'in_turn' },
      { a: 'snuff_candle', s: 'closing', r: ['leader'], f: { candle: 'The new moon candle' } },
    ],
  },
  ...SABBATS.map(sabbatTemplate),
  {
    id: 'hellenic_household',
    name: 'Hellenic household offering',
    kind: 'rite',
    tradition: 'Hellenic',
    summary: 'Khernips, a libation and prayer, as households have kept the gods in modern Hellenic practice.',
    note: 'A simple household rite in the modern Hellenic way. Hestia is honoured first and last.',
    sections: [
      { id: 'preparation', name: 'Preparation' },
      { id: 'opening', name: 'Purification' },
      { id: 'work', name: 'Prayer and offering' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'host', name: 'Host' }],
    checklist: [{ text: 'Bring wine, water or milk for the libation.', remind: 'day' }],
    steps: [
      { a: 'cleanse', s: 'opening', t: 'Khernips', r: ['all'], turn: 'together', f: { method: 'khernips' }, d: 'Light a bay leaf, quench it in water, and let each person wash their hands. Sprinkle the space and the altar.' },
      { a: 'prayer', s: 'opening', t: 'To Hestia, first', r: ['host'], f: { prayer: 'To Hestia' }, w: 'Hestia, first of all and last: be honoured here.' },
      { a: 'prayer', s: 'work', t: 'Prayer to the god honoured', r: ['host'], f: { prayer: 'The god honoured today' }, d: 'Raise your hands, palms up, and speak to the god you are honouring: who they are, what they have given, and what you ask.', w: '' },
      { a: 'pour_libation', s: 'work', r: ['host'], f: { liquid: 'wine', where: 'the_libation_bowl', to: 'the god honoured' } },
      { a: 'place_offering', s: 'work', r: ['all'], turn: 'in_turn', f: { to: 'the god honoured', where: 'At the shrine' }, ask: 'offering', askWith: { timing: 'live' } },
      { a: 'prayer', s: 'closing', t: 'To Hestia, last', r: ['host'], f: { prayer: 'To Hestia' }, w: 'Hestia, last as you are first: thank you.' },
    ],
  },
  {
    id: 'norse_blot',
    name: 'A simple blót',
    kind: 'rite',
    tradition: 'Modern heathen',
    summary: 'Hallowing the space, an offering of mead to the gods, ancestors and land spirits, shared and then poured out.',
    note: 'A simple blót as many modern heathen groups hold one. Each kindred has its own customs; follow yours.',
    sections: [
      { id: 'opening', name: 'Hallowing' },
      { id: 'work', name: 'The blót' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'gothi', name: 'Gothi or Gydja' }],
    checklist: [{ text: 'Bring mead, ale or juice to share.', remind: 'day' }],
    steps: [
      { a: 'cleanse', s: 'opening', t: 'Hallow the space', r: ['gothi'], f: { method: 'other', how: 'Walk the space with fire or a hammer sign, as your kindred does.' } },
      { a: 'welcome_deity', s: 'opening', r: ['gothi'], d: 'Call to the god or goddess the blót is for, by their names and deeds.' },
      { a: 'welcome_ancestors', s: 'opening', r: ['gothi'] },
      { a: 'welcome_land', s: 'opening', r: ['gothi'] },
      { a: 'pour_libation', s: 'work', t: 'Bless and share the mead', r: ['all'], turn: 'in_turn', f: { liquid: 'mead', to: 'the gods, the ancestors and the land', where: 'the_libation_bowl' }, d: 'The gothi blesses the mead. The horn or cup goes round; each person may speak a toast, drink, and pour a little into the bowl.' },
      { a: 'pour_libation', s: 'closing', t: 'Pour the offering out', r: ['gothi'], f: { liquid: 'mead', to: 'the gods, the ancestors and the land', where: 'the_earth' }, d: 'Pour what is in the bowl onto the earth.', w: 'From the gods to the earth to us, from us to the earth to the gods: a gift for a gift.' },
    ],
  },
  {
    id: 'home_puja',
    name: 'Home puja (personal devotion)',
    kind: 'rite',
    tradition: 'Hindu-style devotion',
    summary: 'A simple home puja as personal devotion: preparing, inviting the deity of your devotion, offerings, aarti and prasad.',
    note: 'Offered as personal devotion, as many households practise it. It is not an initiatory or priestly rite. Where you have a family or teacher’s practice, follow theirs, and add your own prayers and songs.',
    sections: [
      { id: 'preparation', name: 'Preparation' },
      { id: 'opening', name: 'Invocation' },
      { id: 'work', name: 'Offerings' },
      { id: 'aarti', name: 'Aarti' },
      { id: 'closing', name: 'Prasad' },
    ],
    roles: [{ id: 'host', name: 'Host' }],
    checklist: [{ text: 'Bathe or wash before you come, and bring flowers or fruit.', remind: 'day' }],
    steps: [
      { s: 'preparation', t: 'Clean the shrine', r: ['host'], d: 'Tidy and wipe the shrine, set out fresh water, and arrange the flowers and food to be offered.', m: 5 },
      { a: 'light_candle', s: 'opening', t: 'Light the lamp', r: ['host'], f: { candle: 'The lamp', colour: 'gold' }, d: 'Light the oil lamp or a candle at the shrine.' },
      { a: 'ring_bell', s: 'opening', r: ['host'] },
      { a: 'prayer', s: 'opening', t: 'Invite the deity', r: ['host'], f: { prayer: 'Invitation' }, d: 'With folded hands, invite the deity of your devotion in your own words or a prayer you know.', w: '' },
      { a: 'place_offering', s: 'work', t: 'Offer flowers, water and food', r: ['all'], turn: 'in_turn', f: { to: 'the deity of your devotion', where: 'At the shrine' }, d: 'Each person offers flowers, water or food with both hands.', ask: 'offering', askWith: { timing: 'live' } },
      { a: 'burn_incense', s: 'work', r: ['host'] },
      { s: 'aarti', t: 'Aarti', r: ['host'], turn: 'together', d: 'Wave the lamp before the deity in slow circles while everyone sings an aarti you know, or sits in silence. Then pass the lamp so each person may draw its warmth towards them.', m: 6 },
      { s: 'closing', t: 'Share the prasad', r: ['host'], d: 'Share the blessed food so each person receives a little.', m: 5 },
    ],
  },
  {
    id: 'ancestors',
    name: 'An evening for the ancestors',
    kind: 'rite',
    tradition: 'Any tradition',
    summary: 'Remembering the beloved dead: names spoken, a plate set for them, and stories shared.',
    sections: RITE,
    roles: [{ id: 'host', name: 'Host' }],
    checklist: [{ text: 'Bring a photo, an object or a name of someone you remember.', remind: 'day' }],
    steps: [
      { a: 'light_candle', s: 'opening', t: 'Light the ancestor candle', r: ['host'], f: { candle: 'The ancestor candle', colour: 'white' } },
      { a: 'welcome_ancestors', s: 'opening', r: ['host'], turn: 'together' },
      { s: 'work', t: 'Set a plate for the dead', r: ['host'], d: 'Set a small plate of food and a glass of water at the empty place.', m: 3 },
      { a: 'sharing_round', s: 'work', t: 'Stories of those we remember', r: ['all'], turn: 'in_turn', ask: 'ancestor', askWith: { timing: 'live', prompt: 'Whose name will you speak?' } },
      { a: 'silence', s: 'work', r: ['all'], turn: 'together' },
      { a: 'snuff_candle', s: 'closing', r: ['host'], f: { candle: 'The ancestor candle' } },
    ],
  },
  {
    id: 'healing_circle',
    name: 'Healing circle',
    kind: 'rite',
    tradition: 'Any tradition',
    summary: 'Holding someone, or each other, in care. Always with their consent, and never in place of medical care.',
    note: 'Ask before naming anyone or sending them healing. This is a circle of care, not a treatment.',
    sections: RITE,
    roles: [{ id: 'leader', name: 'Facilitator' }],
    steps: [
      { a: 'ground_centre', s: 'opening', r: ['leader'], turn: 'together' },
      { a: 'light_candle', s: 'opening', t: 'Light the healing candle', r: ['leader'], f: { candle: 'The healing candle', colour: 'blue' } },
      { a: 'write_petition', s: 'work', t: 'Names held in care', r: ['all'], ask: 'petition', askWith: { timing: 'ahead', visibility: 'leader', prompt: 'Who are you holding in care, with their consent?' }, d: 'Each person names someone who has asked to be held, or themselves.' },
      { a: 'meditation', s: 'work', t: 'Holding them in care', r: ['leader'], turn: 'together', d: 'Read a short meditation sending warmth and care to those named. Leave long pauses.' },
      { a: 'snuff_candle', s: 'closing', r: ['leader'], f: { candle: 'The healing candle' } },
      { a: 'ground_energy', s: 'closing', r: ['all'], turn: 'together' },
    ],
  },
  {
    id: 'officials_meeting',
    name: 'Officials’ meeting',
    kind: 'meeting',
    tradition: 'Meeting',
    summary: 'For the coven’s officers only: last time’s actions, reports, motions and what comes next, with private minutes.',
    note: 'Choose who it is for (the High Priestess, the Elders, the Maiden) under Who it’s for. No one else sees it, its chat or its minutes.',
    sections: [
      { id: 'opening', name: 'Opening' },
      { id: 'reports', name: 'Reports' },
      { id: 'business', name: 'Business' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'chair', name: 'Chair' }, { id: 'secretary', name: 'Secretary' }, { id: 'treasurer', name: 'Treasurer' }],
    checklist: [{ text: 'Read the last minutes and your outstanding actions.', remind: 'day' }],
    meeting: { lead_minutes: 15, length_minutes: 60, chair_role: 'chair', secretary_role: 'secretary', series: 'officials', minutes_view: 'audience' },
    steps: [
      { a: 'open_meeting', s: 'opening', r: ['chair'] },
      { a: 'roll_call', s: 'opening', r: ['secretary'] },
      { a: 'approve_minutes', s: 'opening', r: ['chair'], f: { motion: 'That the minutes of the last meeting are a fair record.', ballot: 'open' } },
      { a: 'review_actions', s: 'reports', r: ['secretary'] },
      { a: 'officer_report', s: 'reports', r: ['treasurer'], f: { from: ['role:treasurer'], topic: 'The coven’s funds' } },
      { a: 'agenda_item', s: 'business', r: ['chair'], f: { item: '[The first item]', presenter: ['role:chair'] } },
      { a: 'motion', s: 'business', r: ['chair'], f: { motion: '[Write the motion here.]', proposer: ['role:chair'], ballot: 'open', threshold: 'simple' } },
      { a: 'open_floor', s: 'business', r: ['chair'] },
      { a: 'set_next_meeting', s: 'closing', r: ['secretary'] },
      { a: 'close_meeting', s: 'closing', r: ['chair'] },
    ],
  },
  {
    id: 'business_meeting',
    name: 'Full coven business meeting',
    kind: 'meeting',
    tradition: 'Meeting',
    summary: 'The whole coven: reports, discussion, motions and votes, with minutes kept in the coven’s Book.',
    sections: [
      { id: 'opening', name: 'Opening' },
      { id: 'reports', name: 'Reports' },
      { id: 'business', name: 'Business' },
      { id: 'other', name: 'Any other business' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'chair', name: 'Chair' }, { id: 'secretary', name: 'Secretary' }, { id: 'treasurer', name: 'Treasurer' }, { id: 'timekeeper', name: 'Timekeeper' }],
    checklist: [{ text: 'Read the agenda and the last minutes.', remind: 'day' }],
    afterwards: { notes: 'The minutes are kept in the coven’s Book under Meeting minutes.' },
    meeting: { lead_minutes: 15, length_minutes: 90, chair_role: 'chair', secretary_role: 'secretary', series: 'business', minutes_view: 'coven' },
    steps: [
      { a: 'open_meeting', s: 'opening', r: ['chair'] },
      { a: 'roll_call', s: 'opening', r: ['secretary'] },
      { a: 'approve_minutes', s: 'opening', r: ['chair'], f: { motion: 'That the minutes of the last meeting are a fair record.', ballot: 'open' } },
      { a: 'review_actions', s: 'reports', r: ['secretary'] },
      { a: 'officer_report', s: 'reports', r: ['treasurer'], f: { from: ['role:treasurer'], topic: 'The coven’s funds' } },
      { a: 'agenda_item', s: 'business', r: ['chair'], f: { item: 'The first item', presenter: ['role:chair'] } },
      { a: 'discussion', s: 'business', r: ['chair'], turn: 'together' },
      { a: 'motion', s: 'business', r: ['chair'], f: { motion: '[Write the motion here.]', proposer: ['role:chair'], ballot: 'open', threshold: 'simple' } },
      { a: 'vote', s: 'business', r: ['chair'], f: { motion: '[Write the question here.]', ballot: 'open' } },
      { a: 'announcement', s: 'other', r: ['chair'], f: { news: '[Anything the coven should know.]' } },
      { a: 'any_other_business', s: 'other', r: ['chair'] },
      { a: 'set_next_meeting', s: 'closing', r: ['secretary'] },
      { a: 'close_meeting', s: 'closing', r: ['chair'] },
    ],
  },
  {
    id: 'rite_planning',
    name: 'Planning meeting for a rite',
    kind: 'meeting',
    tradition: 'Meeting',
    summary: 'Shape a coming rite together: its intention, who takes which part, what to gather, and who does what before it.',
    sections: [
      { id: 'opening', name: 'Opening' },
      { id: 'rite', name: 'The rite' },
      { id: 'parts', name: 'Who does what' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'chair', name: 'Chair' }, { id: 'secretary', name: 'Secretary' }, { id: 'lead', name: 'Ritual lead' }],
    meeting: { lead_minutes: 15, length_minutes: 60, chair_role: 'chair', secretary_role: 'secretary', series: 'rite-planning', minutes_view: 'audience' },
    steps: [
      { a: 'open_meeting', s: 'opening', r: ['chair'] },
      { a: 'round', s: 'opening', r: ['chair'], turn: 'in_turn', f: { question: 'What would you like this rite to hold?' } },
      { a: 'agenda_item', s: 'rite', r: ['lead'], f: { item: 'The intention and the shape of the rite', presenter: ['role:lead'] } },
      { a: 'discussion', s: 'rite', r: ['chair'], turn: 'together', f: { question: 'Which tradition’s words, and which of our own?' } },
      { a: 'agenda_item', s: 'parts', r: ['lead'], f: { item: 'Who takes which part', presenter: ['role:lead'] } },
      { a: 'agenda_item', s: 'parts', r: ['chair'], f: { item: 'What to gather, and who brings it', presenter: ['role:chair'] } },
      { a: 'vote', s: 'parts', r: ['chair'], f: { motion: 'Which date suits us best?', options: ['[A first date]', '[A second date]'], ballot: 'open' } },
      { a: 'set_next_meeting', s: 'closing', r: ['secretary'] },
      { a: 'close_meeting', s: 'closing', r: ['chair'] },
    ],
  },
  {
    id: 'elections',
    name: 'Elections',
    kind: 'meeting',
    tradition: 'Meeting',
    summary: 'Electing the coven’s officers: each position on its own secret ballot, with the results in the minutes.',
    note: 'Name your coven’s own positions. The Chair runs the election; if they are standing, choose someone else to chair it.',
    sections: [
      { id: 'opening', name: 'Opening' },
      { id: 'elections', name: 'Elections' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'chair', name: 'Chair' }, { id: 'secretary', name: 'Secretary' }],
    checklist: [{ text: 'If you are standing, think about what you would say.', remind: 'day' }],
    meeting: { lead_minutes: 15, length_minutes: 60, chair_role: 'chair', secretary_role: 'secretary', series: 'elections', minutes_view: 'coven' },
    steps: [
      { a: 'open_meeting', s: 'opening', r: ['chair'] },
      { a: 'roll_call', s: 'opening', r: ['secretary'] },
      { a: 'announcement', s: 'opening', r: ['chair'], f: { news: 'The positions open, who is standing, and how the voting works.' } },
      { a: 'election', s: 'elections', r: ['chair'], f: { position: 'Treasurer', candidates: ['[A candidate]'], ballot: 'secret' } },
      { a: 'election', s: 'elections', r: ['chair'], f: { position: 'Secretary', candidates: ['[A candidate]'], ballot: 'secret' } },
      { a: 'election', s: 'elections', r: ['chair'], f: { position: '[Another position]', candidates: ['[A candidate]'], ballot: 'secret' } },
      { a: 'announcement', s: 'closing', r: ['chair'], t: 'The results', f: { news: 'Read the results and thank everyone who stood.' } },
      { a: 'close_meeting', s: 'closing', r: ['chair'] },
    ],
  },
  {
    id: 'treasury_review',
    name: 'Treasury and budget review',
    kind: 'meeting',
    tradition: 'Meeting',
    summary: 'The accounts, the year’s budget and any spending to approve, with the Treasurer’s papers linked from the Book.',
    sections: [
      { id: 'opening', name: 'Opening' },
      { id: 'accounts', name: 'The accounts' },
      { id: 'budget', name: 'The budget' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'chair', name: 'Chair' }, { id: 'treasurer', name: 'Treasurer' }, { id: 'secretary', name: 'Secretary' }],
    checklist: [{ text: 'Look over the accounts the Treasurer has shared.', remind: 'day' }],
    meeting: { lead_minutes: 15, length_minutes: 60, chair_role: 'chair', secretary_role: 'secretary', series: 'treasury', minutes_view: 'audience' },
    steps: [
      { a: 'open_meeting', s: 'opening', r: ['chair'] },
      { a: 'review_actions', s: 'opening', r: ['secretary'] },
      { a: 'officer_report', s: 'accounts', r: ['treasurer'], f: { from: ['role:treasurer'], topic: 'The accounts since we last met' } },
      { a: 'discussion', s: 'budget', r: ['chair'], turn: 'together', f: { question: 'What do we need to spend on in the coming months?' } },
      { a: 'motion', s: 'budget', r: ['treasurer'], f: { motion: 'That the coven adopts the budget as presented.', proposer: ['role:treasurer'], ballot: 'open', threshold: 'two_thirds' } },
      { a: 'set_next_meeting', s: 'closing', r: ['secretary'] },
      { a: 'close_meeting', s: 'closing', r: ['chair'] },
    ],
  },
  {
    id: 'study_checkin',
    name: 'Study circle check-in',
    kind: 'meeting',
    tradition: 'Meeting',
    summary: 'A short check-in for those studying together: where each is, what is hard, and what to read next.',
    sections: [
      { id: 'opening', name: 'Opening' },
      { id: 'checkin', name: 'Check-in' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'chair', name: 'Facilitator' }, { id: 'secretary', name: 'Note taker' }],
    meeting: { lead_minutes: 10, length_minutes: 45, chair_role: 'chair', secretary_role: 'secretary', series: 'study', minutes_view: 'audience' },
    steps: [
      { a: 'open_meeting', s: 'opening', r: ['chair'] },
      { a: 'review_actions', s: 'opening', r: ['secretary'], t: 'What we each said we would do' },
      { a: 'round', s: 'checkin', r: ['chair'], turn: 'in_turn', f: { question: 'Where are you in your study, and what is hard just now?' } },
      { a: 'discussion', s: 'checkin', r: ['chair'], turn: 'together', f: { question: 'What should we read or practise next?' } },
      { a: 'set_next_meeting', s: 'closing', r: ['secretary'] },
      { a: 'close_meeting', s: 'closing', r: ['chair'] },
    ],
  },
  {
    id: 'study_circle',
    name: 'Study circle',
    kind: 'meeting',
    tradition: 'Meeting',
    summary: 'Reading and talking together, with time for questions.',
    sections: [
      { id: 'opening', name: 'Opening' },
      { id: 'business', name: 'Study' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'leader', name: 'Facilitator' }],
    checklist: [{ text: 'Read the passage before you come.', remind: 'day' }],
    steps: [
      { a: 'open_meeting', s: 'opening', r: ['leader'], d: 'Welcome everyone and say what you are studying today.' },
      { a: 'study', s: 'business', r: ['all'], turn: 'in_turn' },
      { a: 'discussion', s: 'business', r: ['leader'], turn: 'together' },
      { a: 'journaling', s: 'business', r: ['all'], ask: 'reflection', askWith: { timing: 'live', visibility: 'me', prompt: 'What will you take with you?' } },
      { a: 'close_meeting', s: 'closing', r: ['leader'], d: 'Agree what to read for next time, and close.' },
    ],
  },
  {
    id: 'dedication_shell',
    name: 'Initiation or dedication (a frame to fill)',
    kind: 'rite',
    tradition: 'Your coven’s own',
    summary: 'The shape of a dedication or initiation, with every word left for your coven to write.',
    note: 'This is only a frame. It supplies no oaths and no secret material: your coven writes its own words, or links them from its Book.',
    sections: [
      { id: 'preparation', name: 'Preparation' },
      { id: 'opening', name: 'Opening' },
      { id: 'challenge', name: 'Challenge and answer' },
      { id: 'work', name: 'Dedication' },
      { id: 'welcome', name: 'Welcome' },
      { id: 'closing', name: 'Closing' },
    ],
    roles: [{ id: 'hps', name: 'High Priestess' }, { id: 'candidate', name: 'Candidate' }, { id: 'sponsor', name: 'Sponsor' }],
    steps: [
      { s: 'preparation', t: 'The candidate prepares', r: ['candidate', 'sponsor'], d: '[How the candidate prepares, as your coven teaches.]' },
      { a: 'cast_circle', s: 'opening', r: ['hps'] },
      { s: 'challenge', t: 'The challenge', r: ['hps', 'candidate'], d: '[Your coven’s challenge and the candidate’s answer. Link them from the Book, or write them here.]', w: '' },
      { s: 'work', t: 'The dedication', r: ['candidate'], d: '[The candidate’s words, in your coven’s form. This frame supplies no oath.]', w: '' },
      { s: 'welcome', t: 'Welcome', r: ['all'], turn: 'together', d: '[How the coven welcomes them.]' },
      { a: 'open_circle', s: 'closing', r: ['hps'] },
    ],
  },
];

export const templateOf = (id: string | null | undefined) => RITUAL_TEMPLATES.find((t) => t.id === id) ?? null;

/** Templates for a kind of gathering, searched by name, tradition and summary. */
export function searchTemplates(query: string, kind?: GatheringKind): RitualTemplate[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return RITUAL_TEMPLATES.filter((t) => (!kind || t.kind === kind) && words.every((w) => `${t.name} ${t.tradition} ${t.summary}`.toLowerCase().includes(w)));
}

/** A template as the builder edits it: the gathering's fields, its plan and its steps. */
export function draftFromTemplate(template: RitualTemplate): {
  kind: GatheringKind;
  title: string;
  intention: string;
  occasion: string;
  occasionName: string;
  plan: RitualPlan;
  steps: BuilderStep[];
} {
  const plan: RitualPlan = {
    sections: template.sections.map((s) => ({ ...s })),
    roles: template.roles.map((r) => ({ id: r.id, name: r.name, cast: [] })),
    checklist: (template.checklist ?? []).map((c, i) => ({ id: `c-${template.id.slice(0, 20)}-${i + 1}`, text: c.text, remind: c.remind ?? 'hour' })),
    afterwards: { hold_hours: template.afterwards?.hold_hours ?? null, notes: template.afterwards?.notes ?? '', follow_up: template.afterwards?.follow_up ?? null },
    template: template.id,
  };
  if (template.meeting) plan.meeting = { ...template.meeting };
  const steps = template.steps.map((t, i) => {
    const action = actionOf(t.a);
    const base = blankBuilderStep(t.s, `k-${template.id.slice(0, 20)}-${i + 1}`);
    const filled = action ? { ...base, ...applyAction(action) } : base;
    const all = t.r?.includes('all');
    const details: StepDetails = {};
    if (t.f) details.fields = { ...t.f };
    const step: BuilderStep = {
      ...filled,
      title: (t.t ?? filled.title).slice(0, 120),
      instructions: t.d ?? filled.instructions,
      spoken_text: t.w ?? filled.spoken_text,
      duration_minutes: t.m ?? filled.duration_minutes,
      altar_action: t.fx ?? filled.altar_action,
      roles: (t.r ?? []).filter((r) => r !== 'all'),
      assignees: all ? [WHOLE_COVEN] : [],
      turn_mode: t.turn ?? 'assigned',
      details,
      contribution: t.ask ? defaultContribution(t.ask, t.askWith ?? {}) : t.askWith && filled.contribution ? { ...filled.contribution, ...t.askWith } : filled.contribution,
    };
    if (step.contribution && step.turn_mode === 'on_behalf') step.contribution = { ...step.contribution, mode: 'one' };
    if (typeof details.fields?.colour === 'string') step.altar_color = details.fields.colour;
    if (step.action === 'light_candle' && typeof details.fields?.candle === 'string') step.altar_label = details.fields.candle;
    return step;
  });
  return { kind: template.kind, title: template.name, intention: template.intention ?? '', occasion: template.occasion ?? '', occasionName: template.occasionName ?? '', plan, steps };
}
