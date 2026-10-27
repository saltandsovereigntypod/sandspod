// What a coven ritual step can be: about fifty actions in six groups
// (opening, candles and fire, offerings, words and sound, the work, closing),
// each with a short name, directions for whoever does it, words to speak
// where there are words, and what it shows on the shared altar when the
// altar can show it (otherwise the step is simply marked done). Choosing an
// action fills the step in; everything stays editable.
//
// Templates (a Deipnon, a full moon, the sabbats) will be lists of these ids
// with a few overrides, so the defaults live here once. The website uses the
// same catalogue (js/core/covens.js). Pure, so it can be tested.

import { defaultContribution, type ContributionKind, type StepContribution } from './contributions.ts';

/** What a step does on the shared altar. '' marks it done and nothing more. */
export type AltarEffect = '' | 'light_candle' | 'place_item' | 'light_all' | 'snuff_all' | 'release_papers';

export const ALTAR_EFFECTS: { value: AltarEffect; label: string; detail: string }[] = [
  { value: '', label: 'Nothing on the altar', detail: 'The step is marked done when it is finished.' },
  { value: 'light_candle', label: 'Light a candle', detail: 'A candle is lit on the shared altar. When the step is the whole coven’s, each lights their own and the candles gather in a circle. Pick a candle under Items for its colour.' },
  { value: 'place_item', label: 'Set the items down', detail: 'The step’s items are set on the shared altar.' },
  { value: 'light_all', label: 'Light every candle', detail: 'Every candle on the shared altar is lit.' },
  { value: 'snuff_all', label: 'Put out every candle', detail: 'Every candle on the shared altar is put out.' },
  { value: 'release_papers', label: 'Release the papers', detail: 'The folded papers set down earlier in the ritual are burned, buried or released, each as its step said.' },
];

export type ActionGroup = 'opening' | 'fire' | 'offerings' | 'words' | 'work' | 'closing';

export const ACTION_GROUPS: { id: ActionGroup; label: string }[] = [
  { id: 'opening', label: 'Opening' },
  { id: 'fire', label: 'Candles and fire' },
  { id: 'offerings', label: 'Offerings' },
  { id: 'words', label: 'Words and sound' },
  { id: 'work', label: 'The work' },
  { id: 'closing', label: 'Closing' },
];

export type StepAction = {
  id: string;
  group: ActionGroup;
  /** The step's name when chosen (short). */
  name: string;
  /** What it's called in the list of actions, when it differs. */
  label?: string;
  directions: string;
  words?: string;
  effect: AltarEffect;
  minutes?: number;
  /** What it asks of people, if anything (contributions.ts). */
  asks?: ContributionKind;
  ask?: Partial<StepContribution>;
  /** Searches to suggest in the Items picker ("white candle", "salt"). */
  suggestItems?: string[];
  /** It names a deity ({deity} in its text): chosen from the Items picker's deities. */
  deity?: boolean;
  keywords?: string[];
};

const QUARTERS = [
  { id: 'air', element: 'Air', dir: 'East', gifts: 'breath, thought and new beginnings', color: 'yellow' },
  { id: 'fire', element: 'Fire', dir: 'South', gifts: 'will, passion and change', color: 'red' },
  { id: 'water', element: 'Water', dir: 'West', gifts: 'feeling, dreams and healing', color: 'blue' },
  { id: 'earth', element: 'Earth', dir: 'North', gifts: 'body, home and steadiness', color: 'green' },
] as const;

export const STEP_ACTIONS: StepAction[] = [
  // ── Opening ──────────────────────────────────────────────────────────
  { id: 'cleanse_space', group: 'opening', name: 'Cleanse the space', directions: 'Sweep or walk the space widdershins (anticlockwise), clearing away whatever the day left behind. Open a window if you can.', words: 'Be gone, all that does not belong here. This space is made clean.', effect: '', minutes: 3, suggestItems: ['besom', 'salt'], keywords: ['sweep', 'besom', 'clear'] },
  { id: 'smoke_cleanse', group: 'opening', name: 'Smoke cleanse', label: 'Smoke cleanse the space and people', directions: 'Light the herbs or incense and let the smoke drift over the space, the altar and each person in turn. Waft it with your hand or a feather.', words: 'By smoke and air, I cleanse this circle and all within it.', effect: 'place_item', minutes: 4, suggestItems: ['rosemary', 'incense', 'feather'], keywords: ['smoke', 'incense', 'herbs', 'cleanse'] },
  { id: 'asperge', group: 'opening', name: 'Asperge with salt water', directions: 'Stir a pinch of salt into a bowl of water. Walk the circle sunwise, sprinkling it with your fingers or a sprig, and touch a drop to each person’s brow.', words: 'Salt and water, earth and sea, cleanse and bless all here with me.', effect: 'place_item', minutes: 3, suggestItems: ['salt', 'chalice'], keywords: ['salt', 'water', 'sprinkle', 'bless'] },
  { id: 'ground_centre', group: 'opening', name: 'Ground and centre', directions: 'Guide everyone to stand or sit comfortably, close their eyes and breathe slowly. Picture roots reaching down into the earth and light coming down from above, meeting at the heart.', effect: '', minutes: 5, keywords: ['ground', 'centre', 'center', 'breathe', 'roots'] },
  { id: 'cast_circle', group: 'opening', name: 'Cast the circle', directions: 'Walk the edge of the circle sunwise (clockwise), pointing your athame, wand or finger, and see a ring of light rise where you point. Close it where you began.', words: 'I cast this circle, a world between the worlds, a place of power and protection. As I will, so mote it be.', effect: '', minutes: 3, suggestItems: ['athame', 'wand'], keywords: ['circle', 'cast', 'athame', 'wand'] },
  ...QUARTERS.map((q) => ({
    id: `call_${q.id}`,
    group: 'opening' as const,
    name: `Call ${q.element}`,
    label: `Call a quarter: ${q.element} in the ${q.dir}`,
    directions: `Face the ${q.dir}. Raise your hand or light the ${q.color} candle there, and call ${q.element} into the circle.`,
    words: `Guardians of the ${q.dir}, powers of ${q.element}, of ${q.gifts}: we call you to this circle. Hail and welcome.`,
    effect: 'light_candle' as const,
    minutes: 1,
    suggestItems: [`${q.color} candle`],
    keywords: ['quarter', 'element', q.element, q.dir, 'watchtower'],
  })),
  { id: 'call_quarters', group: 'opening', name: 'Call the quarters', label: 'Call all four quarters', directions: 'Turn to each direction in turn, East, South, West and North, and call its element into the circle. Light each quarter’s candle as you go if you have them.', words: 'Powers of the East, of Air; powers of the South, of Fire; powers of the West, of Water; powers of the North, of Earth: we call you to this circle. Hail and welcome.', effect: 'light_all', minutes: 4, keywords: ['quarters', 'elements', 'watchtowers', 'directions'] },
  { id: 'welcome_deity', group: 'opening', name: 'Welcome {deity}', label: 'Welcome a deity', directions: 'Face the altar and the image of {deity}. Speak your welcome and, if you like, light a candle or set down an offering for them.', words: '{deity}, we welcome you to this circle. Be with us tonight, and bless the work we do in your name.', effect: '', minutes: 2, deity: true, keywords: ['god', 'goddess', 'deity', 'invoke', 'invite'] },
  { id: 'welcome_ancestors', group: 'opening', name: 'Welcome the ancestors', directions: 'Turn to the ancestor frame or an empty chair. Invite the beloved dead to be with the circle. Each person may speak a name aloud.', words: 'Ancestors of blood and of spirit, those who came before us: you are remembered, and you are welcome here.', effect: '', minutes: 3, asks: 'ancestor', ask: { timing: 'live' }, suggestItems: ['ancestor frame', 'white candle'], keywords: ['ancestors', 'beloved dead', 'names'] },
  { id: 'welcome_land', group: 'opening', name: 'Welcome the spirits of the land', directions: 'Turn outward to the land you stand on. Greet the spirits of the place, thank them for holding the circle, and pour a little water or set down a small offering for them.', words: 'Spirits of this land, of stone and root and water, we greet you as guests. Thank you for holding us tonight.', effect: '', minutes: 2, keywords: ['land', 'spirits', 'place', 'genius loci'] },

  // ── Candles and fire ─────────────────────────────────────────────────
  { id: 'light_candle', group: 'fire', name: 'Light a candle', directions: 'Light the candle and take a breath to watch the flame catch before you speak.', effect: 'light_candle', minutes: 1, suggestItems: ['white candle'], keywords: ['candle', 'light', 'flame'] },
  { id: 'light_all', group: 'fire', name: 'Light the altar', label: 'Light every candle', directions: 'Light every candle on the altar, one from another, from the centre outward.', effect: 'light_all', minutes: 2, keywords: ['candles', 'light all'] },
  { id: 'dress_candle', group: 'fire', name: 'Dress a candle', directions: 'Rub oil onto the candle, from the middle to the ends to draw something in, or from the ends to the middle to send it away. Roll it in herbs if you like, holding the intention as you work.', effect: '', minutes: 4, suggestItems: ['oil', 'white candle'], keywords: ['dress', 'anoint', 'oil', 'candle'] },
  { id: 'carve_candle', group: 'fire', name: 'Carve a candle', directions: 'With a pin or the tip of your athame, carve a word, name, rune or sigil into the candle’s wax.', effect: '', minutes: 4, suggestItems: ['athame', 'white candle'], keywords: ['carve', 'inscribe', 'sigil', 'rune'] },
  { id: 'snuff_candle', group: 'fire', name: 'Put out a candle', label: 'Snuff one candle', directions: 'Put out the candle with a snuffer or your fingers rather than blowing on it, and thank its flame.', effect: '', minutes: 1, suggestItems: ['snuffer'], keywords: ['snuff', 'extinguish', 'put out'] },
  { id: 'snuff_all', group: 'fire', name: 'Put out the candles', label: 'Snuff every candle', directions: 'Put out every candle on the altar, one by one, thanking each flame.', effect: 'snuff_all', minutes: 2, keywords: ['snuff', 'extinguish', 'put out'] },

  // ── Offerings ────────────────────────────────────────────────────────
  { id: 'place_offering', group: 'offerings', name: 'Place an offering', directions: 'Set the offering on the altar with both hands and say who it is for.', words: 'This we give with open hands and grateful hearts.', effect: 'place_item', minutes: 2, suggestItems: ['bread', 'apple', 'honey', 'flowers'], keywords: ['offering', 'give', 'gift'] },
  { id: 'pour_libation', group: 'offerings', name: 'Pour a libation', directions: 'Pour a little wine, mead, milk or water into the libation bowl or onto the earth, and say who it is for.', words: 'To those who hold us: drink, and be honoured.', effect: 'place_item', minutes: 2, suggestItems: ['chalice', 'wine', 'mead', 'libation bowl'], keywords: ['libation', 'pour', 'wine', 'drink'] },
  { id: 'burn_incense', group: 'offerings', name: 'Burn incense', directions: 'Light the incense and let its smoke rise as an offering.', words: 'Let this smoke rise with our prayers.', effect: 'place_item', minutes: 1, suggestItems: ['incense', 'frankincense'], keywords: ['incense', 'smoke', 'resin'] },
  { id: 'cakes_ale', group: 'offerings', name: 'Cakes and ale', directions: 'Bless the cakes and the drink. Set a portion aside for the gods and the land, then pass them round the circle so each person eats and drinks.', words: 'May you never hunger. May you never thirst.', effect: 'place_item', minutes: 8, suggestItems: ['bread', 'cake', 'chalice', 'mead'], keywords: ['cakes', 'ale', 'bread', 'wine', 'share'] },
  { id: 'toast_blessing', group: 'offerings', name: 'Toast and blessing', directions: 'Raise the cup and speak a blessing. Each person may add their own, then drink.', words: 'To the gods, to the land, to the ones beside us.', effect: '', minutes: 4, suggestItems: ['chalice'], keywords: ['toast', 'blessing', 'cup'] },

  // ── Words and sound ──────────────────────────────────────────────────
  { id: 'read_aloud', group: 'words', name: 'Read aloud', directions: 'Read the passage slowly, pausing at the end of each line.', effect: '', minutes: 3, keywords: ['read', 'charge', 'poem', 'reading'] },
  { id: 'chant', group: 'words', name: 'Chant', directions: 'Begin the chant softly and let the circle join in. Let it build, then fall away to silence together.', effect: '', minutes: 5, keywords: ['chant', 'repeat'] },
  { id: 'song', group: 'words', name: 'Song', directions: 'Lead the song. Those who don’t know the words can hum along.', effect: '', minutes: 4, keywords: ['song', 'sing'] },
  { id: 'call_response', group: 'words', name: 'Call and response', directions: 'Speak each line; the circle answers with the response.', effect: '', minutes: 3, keywords: ['call', 'response', 'answer'] },
  { id: 'ring_bell', group: 'words', name: 'Ring the bell', directions: 'Ring the bell three times and let each note fade before the next.', effect: '', minutes: 1, suggestItems: ['bell'], keywords: ['bell', 'chime'] },
  { id: 'drumming', group: 'words', name: 'Drumming', directions: 'Keep a steady heartbeat rhythm. Others may join with drums, rattles or clapping.', effect: '', minutes: 8, suggestItems: ['frame drum', 'rattle'], keywords: ['drum', 'rhythm', 'rattle'] },
  { id: 'silence', group: 'words', name: 'Silence', directions: 'Hold a stretch of silence together. Breathe, listen and notice.', effect: '', minutes: 3, keywords: ['silence', 'stillness', 'quiet'] },
  { id: 'meditation', group: 'words', name: 'Guided meditation', directions: 'Read the meditation slowly, leaving long pauses. Bring everyone gently back at the end and ask them to wriggle their fingers and toes.', effect: '', minutes: 12, keywords: ['meditation', 'pathworking', 'visualisation', 'journey'] },

  // ── The work ─────────────────────────────────────────────────────────
  { id: 'write_petition', group: 'work', name: 'Write a petition', directions: 'Write what you ask for, plainly and in the present tense, as though it is already so. Fold the paper towards you.', effect: '', minutes: 5, asks: 'petition', keywords: ['petition', 'ask', 'prayer'] },
  { id: 'write_intention', group: 'work', name: 'Write an intention', directions: 'Write your intention for the season ahead in a sentence or two.', effect: '', minutes: 5, asks: 'intention', keywords: ['intention', 'goal'] },
  { id: 'write_gratitude', group: 'work', name: 'Write a gratitude note', directions: 'Write what you are grateful for. It is yours alone; no one else will read it.', effect: '', minutes: 5, asks: 'gratitude', ask: { prompt: 'What are you grateful for?' }, keywords: ['gratitude', 'thanks', 'thank you'] },
  { id: 'write_vow', group: 'work', name: 'Make a vow', directions: 'Write the vow you are making, and to whom. Read it over before you speak it.', effect: '', minutes: 5, asks: 'vow', keywords: ['vow', 'oath', 'promise', 'dedication'] },
  { id: 'read_petitions', group: 'work', name: 'Read the petitions', directions: 'Read aloud the petitions the coven may read, one by one, pausing after each. Sealed ones are held in silence.', effect: '', minutes: 6, keywords: ['petitions', 'read'] },
  { id: 'burn_petitions', group: 'work', name: 'Burn the petitions', directions: 'Burn the folded papers one at a time in the cauldron or a fireproof bowl, watching the smoke carry each away. Keep water close.', words: 'By fire we send these out. May they be heard.', effect: 'release_papers', minutes: 5, suggestItems: ['cauldron'], keywords: ['burn', 'petitions', 'fire', 'release'] },
  { id: 'bury_petitions', group: 'work', name: 'Bury the petitions', directions: 'Bury the folded papers in the earth or a pot of soil, to grow in the dark.', words: 'Into the earth, to root and grow.', effect: 'release_papers', minutes: 5, keywords: ['bury', 'earth', 'petitions'] },
  { id: 'release_petitions', group: 'work', name: 'Release the petitions', directions: 'Tear the papers small and give them to running water or the wind, or let them go however your coven does.', words: 'We let these go, and trust them to the world.', effect: 'release_papers', minutes: 5, keywords: ['release', 'let go', 'wind', 'water'] },
  { id: 'charge_sigil', group: 'work', name: 'Charge a sigil', directions: 'Hold the sigil in view. Breathe into it, gaze until the mind goes quiet, then release the charge with a breath, a word or a shout, and set it aside to be forgotten.', effect: '', minutes: 5, suggestItems: ['sigil'], keywords: ['sigil', 'charge', 'chaos'] },
  { id: 'knot_magic', group: 'work', name: 'Knot magic', directions: 'Tie the knots into the cord one by one, speaking the charge for each, from the first to the ninth.', words: 'By knot of one, the spell’s begun. By knot of two, it cometh true. By knot of three, so mote it be.', effect: '', minutes: 6, suggestItems: ['cord', 'ribbon'], keywords: ['knot', 'cord', 'witch’s ladder', 'ribbon'] },
  { id: 'cord_cutting', group: 'work', name: 'Cord cutting', directions: 'Hold the cord between your hands, naming what you are cutting away. Cut it cleanly, or burn it through over a candle, safely.', effect: '', minutes: 5, suggestItems: ['cord', 'athame'], keywords: ['cord', 'cut', 'release', 'ties'] },
  { id: 'raise_energy', group: 'work', name: 'Raise energy', label: 'Raise energy (the cone of power)', directions: 'Join hands and begin to chant, dance or drum, building speed and sound together. At the peak, the leader calls the release and everyone sends the power out to its purpose, then grounds.', effect: '', minutes: 8, keywords: ['cone of power', 'energy', 'raise', 'dance'] },
  { id: 'divination_draw', group: 'work', name: 'Coven divination', label: 'Coven divination draw', directions: 'Shuffle while the circle holds the question in mind, then draw for the coven. Read it together.', effect: '', minutes: 8, asks: 'card', ask: { mode: 'one' }, suggestItems: ['tarot'], keywords: ['divination', 'tarot', 'cards', 'runes', 'oracle'] },
  { id: 'journaling', group: 'work', name: 'Journaling', label: 'Journaling prompt', directions: 'Read the prompt aloud, then give everyone quiet time to write.', effect: '', minutes: 10, asks: 'reflection', ask: { timing: 'live', prompt: 'What are you ready to let go of?' }, keywords: ['journal', 'write', 'prompt', 'reflect'] },
  { id: 'sharing_round', group: 'work', name: 'Sharing round', directions: 'Go round the circle. Each person may share a few words, or pass. Listen without answering.', effect: '', minutes: 10, keywords: ['share', 'talking stick', 'round'] },

  // ── Closing ──────────────────────────────────────────────────────────
  { id: 'release_quarters', group: 'closing', name: 'Thank and release the quarters', directions: 'Turn to each direction in reverse, North, West, South and East, thanking each element and bidding it farewell. Put out each quarter’s candle as you go.', words: 'Powers of the North, West, South and East: thank you for your presence. Go if you must, stay if you will. Hail and farewell.', effect: 'snuff_all', minutes: 3, keywords: ['quarters', 'release', 'dismiss', 'farewell'] },
  { id: 'farewell_deity', group: 'closing', name: 'Farewell to {deity}', label: 'Farewell the deity', directions: 'Face the altar and thank {deity} for being with the circle.', words: '{deity}, thank you for your presence and your blessing. Go if you must, stay if you will. Hail and farewell.', effect: '', minutes: 1, deity: true, keywords: ['farewell', 'thank', 'deity', 'god', 'goddess'] },
  { id: 'ground_energy', group: 'closing', name: 'Ground the energy', directions: 'Have everyone place their palms on the floor or the earth and let any extra energy drain away. Eat something if you feel light-headed.', effect: '', minutes: 3, keywords: ['ground', 'earth', 'settle'] },
  { id: 'open_circle', group: 'closing', name: 'Open the circle', directions: 'Walk the circle widdershins (anticlockwise), drawing the circle’s light back into your athame or hand.', words: 'The circle is open, but unbroken. Merry meet, and merry part, and merry meet again.', effect: '', minutes: 2, suggestItems: ['athame'], keywords: ['open', 'close', 'circle', 'merry meet'] },
  { id: 'feast', group: 'closing', name: 'Feast', directions: 'Share food and talk. This is part of the ritual too.', effect: '', minutes: 30, keywords: ['feast', 'food', 'potluck', 'share'] },
];

/** Something not in the list: a blank step. */
export const CUSTOM_ACTION = 'custom';

export const actionOf = (id: string | null | undefined): StepAction | null => STEP_ACTIONS.find((a) => a.id === id) ?? null;

/** {deity} filled in (or "the deity" when none is chosen). */
export function fillAction(text: string, values: { deity?: string } = {}): string {
  return text.replace(/\{deity\}/g, values.deity?.trim() || 'the deity');
}

/** What choosing an action puts into a step (each field still editable). */
export function applyAction(action: StepAction, values: { deity?: string } = {}) {
  return {
    action: action.id,
    title: fillAction(action.name, values).slice(0, 120),
    instructions: fillAction(action.directions, values),
    spoken_text: action.words ? fillAction(action.words, values) : '',
    duration_minutes: action.minutes ?? null,
    altar_action: action.effect,
    contribution: action.asks ? defaultContribution(action.asks, action.ask) : null,
  };
}

/**
 * Changing the deity on a deity action: the step's text is refilled where it
 * still reads as the action wrote it (anything rewritten by hand is kept).
 */
export function refillDeity<T extends { title: string; instructions: string; spoken_text: string }>(step: T, action: StepAction, before: string | undefined, after: string): T {
  const same = (current: string, template: string | undefined) => !!template && current === fillAction(template, { deity: before });
  return {
    ...step,
    title: same(step.title, action.name) ? fillAction(action.name, { deity: after }) : step.title,
    instructions: same(step.instructions, action.directions) ? fillAction(action.directions, { deity: after }) : step.instructions,
    spoken_text: same(step.spoken_text, action.words) ? fillAction(action.words ?? '', { deity: after }) : step.spoken_text,
  };
}

/** The action a step stands for: its own, or for steps planned before actions, the one its altar action matches. */
export function actionForStep(step: { action?: string | null; altar_action?: string | null }): StepAction | null {
  const own = actionOf(step.action);
  if (own) return own;
  if (step.action) return null;
  switch (step.altar_action) {
    case 'light_candle':
      return actionOf('light_candle');
    case 'place_item':
      return actionOf('place_offering');
    case 'light_all':
      return actionOf('light_all');
    case 'snuff_all':
      return actionOf('snuff_all');
    default:
      return null;
  }
}

/** Search the actions (by name, group and keywords); an empty search lists them all in their groups. */
export function searchActions(query: string): StepAction[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return STEP_ACTIONS;
  return STEP_ACTIONS.filter((a) => {
    const hay = [a.label ?? a.name, a.name, ACTION_GROUPS.find((g) => g.id === a.group)?.label ?? '', ...(a.keywords ?? [])].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** The actions in their groups, for a list. */
export function actionsByGroup(list: StepAction[] = STEP_ACTIONS): { group: (typeof ACTION_GROUPS)[number]; actions: StepAction[] }[] {
  return ACTION_GROUPS.map((group) => ({ group, actions: list.filter((a) => a.group === group.id) })).filter((g) => g.actions.length > 0);
}

/** An action's name in a list ("Call a quarter: Air in the East"). */
export const actionLabel = (a: StepAction) => a.label ?? fillAction(a.name, { deity: 'a deity' });
