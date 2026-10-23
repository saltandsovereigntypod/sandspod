// Meanings for the runes of the Elder Futhark (and the modern blank rune) and
// the twenty feda of the ogham, for drawing them. Names, glyphs and glosses
// come from the reading log's lists, so a drawn rune saves under the same
// name you'd pick by hand. Pure data.

import { ELDER_FUTHARK, OGHAM } from '../craft/hedge/readings.ts';

export type Stave = {
  /** As in the reading log: "Fehu", "Beith". */
  name: string;
  /** The Unicode letter: ᚠ, ᚁ. Blank for the blank rune. */
  glyph: string;
  /** What it names: "cattle, wealth", "birch". */
  gloss: string;
  keywords: string;
  /** Two or three sentences. */
  text: string;
};

type Words = [string, string];

const RUNE_WORDS: Record<string, Words> = {
  Fehu: ['wealth, earnings, what you share', 'Cattle were wealth that walked: earned, tended and given. This is money, goods and good fortune, and the duty to let them move. Spend well and share.'],
  Uruz: ['strength, health, raw will', 'The wild ox, untamed and enormous. Vitality, endurance and the body’s own strength. You have more in you than you think.'],
  Thurisaz: ['a thorn, a threshold, defence', 'The giant’s thorn, and Thor’s hammer against giants. A sharp point to pass with care: a hard moment, or a force that protects. Pause at the gate before you go through.'],
  Ansuz: ['the word, a message, wisdom', 'The god’s mouth: Odin’s rune of speech, poetry and counsel. A message, advice worth hearing, the right word. Listen, then speak.'],
  Raidho: ['a journey, rhythm, right order', 'Riding, and the order of a well-made journey. Travel, progress, things in their proper sequence. Move at the pace that gets you there.'],
  Kenaz: ['a torch, knowing, craft', 'The torch that lights the forge and the hall. Understanding, skill and creative fire. Something becomes clear; make something of it.'],
  Gebo: ['a gift, exchange, partnership', 'A gift asks for a gift. Generosity, bonds and agreements kept on both sides. Give, receive, and honour the exchange.'],
  Wunjo: ['joy, belonging, harmony', 'The joy of being among your own people, the work going well. Contentment and fellowship. Let yourself have it.'],
  Hagalaz: ['hail, disruption, a storm that passes', 'Hail falls from outside and can’t be stopped, but it melts into water that feeds the ground. Upheaval beyond your control. Shelter, then make use of what it leaves.'],
  Nauthiz: ['need, constraint, the need-fire', 'Need that grinds, and the fire kindled by friction when all others are out. Hardship that teaches what matters. Work with what you have.'],
  Isa: ['ice, stillness, a pause', 'Ice: still, clear and slippery. A freeze on movement; things on hold. Wait, and keep your footing.'],
  Jera: ['the year, harvest, reward in time', 'The turning year that brings the harvest to those who sowed. Patience rewarded, the natural season of things. You reap what you tended.'],
  Eihwaz: ['the yew, endurance, death and life', 'The evergreen yew of the graveyard, which lives for millennia. Strength through hardship, the bridge between endings and beginnings. Hold steady.'],
  Perthro: ['the lot-cup, mystery, chance', 'The cup the lots are shaken in: fate, chance and what isn’t yet shown. Something hidden is at work. Leave room for the unknown.'],
  Algiz: ['protection, warding, the higher self', 'The elk-sedge, sharp-edged, and a figure with arms raised. Protection, sanctuary and a guardian presence. You are watched over; stand guard over what’s yours.'],
  Sowilo: ['the sun, success, wholeness', 'The sun that guides ships and warms the field. Victory, health, clear purpose. Things go well; shine.'],
  Tiwaz: ['justice, courage, honour', 'Tyr, who gave his hand to bind the wolf. Justice, sacrifice for what is right, keeping your word. Do the honourable thing, even if it costs you.'],
  Berkano: ['birch, birth, growth, care', 'The birch is the first tree back after winter. New growth, birth, nurture and quiet beginnings. Tend the shoot.'],
  Ehwaz: ['the horse, partnership, trust', 'Horse and rider moving as one. Trust, teamwork, steady progress with a good companion. Work together.'],
  Mannaz: ['humankind, the self among others', 'The human being, and our debt to one another. Who you are, and your place in the community. Know yourself, and be kind.'],
  Laguz: ['water, flow, intuition', 'Water, the lake and the sea: deep, moving, sometimes dangerous. Feeling, dreams and the tide of things. Go with the flow and trust your instincts.'],
  Ingwaz: ['the seed, gestation, a finished stage', 'Ing, the god of the fertile earth, and the seed in the ground. Something completing within before it begins again. Let it rest and ripen.'],
  Dagaz: ['day, dawn, breakthrough', 'Daybreak: the moment light comes. Awakening, clarity and change for the better. The way through opens.'],
  Othala: ['inheritance, home, heritage', 'The ancestral land and what is kept in the family. Home, belonging, gifts and burdens handed down. Look after what you’ll pass on.'],
};

/** The modern blank rune (from the 1980s; not one of the old twenty-four). */
export const BLANK_RUNE: Stave = {
  name: 'Blank rune',
  glyph: '',
  gloss: 'the unknown',
  keywords: 'the unknowable, what isn’t yours to see yet',
  text: 'A modern addition to the set, not one of the old twenty-four. It stands for what can’t yet be known. Let the question rest and come back to it.',
};

export const RUNES: Stave[] = ELDER_FUTHARK.map((r) => ({ ...r, keywords: RUNE_WORDS[r.name][0], text: RUNE_WORDS[r.name][1] }));

/** The ogham letters, Beith to Iodhadh, in the reading log's order. */
const OGHAM_GLYPHS = ['ᚁ', 'ᚂ', 'ᚃ', 'ᚄ', 'ᚅ', 'ᚆ', 'ᚇ', 'ᚈ', 'ᚉ', 'ᚊ', 'ᚋ', 'ᚌ', 'ᚍ', 'ᚎ', 'ᚏ', 'ᚐ', 'ᚑ', 'ᚒ', 'ᚓ', 'ᚔ'];

const OGHAM_WORDS: Record<string, Words> = {
  Beith: ['beginnings, cleansing, a fresh start', 'The birch, first to green after winter, whose twigs swept the old year out. A new start with the slate wiped clean. Begin.'],
  Luis: ['protection, insight, quickening', 'Rowan, the tree hung over doors against harm, its red berries bright. Protection and a quickened mind. Trust what you notice.'],
  Fearn: ['steadiness, a shield, foundation', 'Alder, which stands in wet ground and made shields and bridge-piles. Bran’s tree, who made himself a bridge for his people. Stand firm and support others.'],
  Sail: ['the moon, feeling, bending', 'Willow by the water, bending without breaking. Feeling, dreams, the moon’s tides. Be flexible; let intuition lead.'],
  Nion: ['connection, the weave, between worlds', 'Ash, whose wood made spears and whose roots reach deep. Links between things and between worlds. See how it all connects.'],
  Uath: ['restraint, a pause, a thorny threshold', 'Hawthorn, the fairy tree: blossom and thorn together. A pause, a test or a holding back before what you hope for. Wait patiently.'],
  Dair: ['strength, endurance, a doorway', 'Oak, king of the wood; the old lore links its name with the word for a door. Strength, steadiness and an opening. Stand tall and go through.'],
  Tinne: ['balance, a test, the fighter', 'Holly, green in winter and sharp. A challenge met with courage and fairness. Hold your ground, justly.'],
  Coll: ['wisdom, insight, inspiration', 'Hazel, whose nuts fed the salmon of knowledge. Wisdom, inspiration, the flash of seeing. Trust the idea that comes.'],
  Ceirt: ['choice, beauty, the otherworld', 'Apple, the fruit of Emain Ablach, the otherworld isle. Beauty, wholeness and a choice to make. Choose what nourishes.'],
  Muin: ['harvest, truth-telling, prophecy', 'Vine or bramble, the harvest that loosens the tongue. Truth spoken plainly and things coming to fruit. Say what’s true.'],
  Gort: ['tenacity, the spiral, inner growth', 'Ivy, which spirals and holds on through winter. Persistence and growth that turns inward before it climbs. Keep going.'],
  nGéadal: ['direct action, healing, purpose', 'Broom or reed, straight and quick-growing, used to sweep and to heal. Clear purpose and decisive action. Act now.'],
  Straif: ['hard necessity, strife, the unexpected', 'Blackthorn, with its long thorns and sloes that sweeten only after frost. Hardship and forces you can’t control. What can’t be changed must be faced.'],
  Ruis: ['endings, transition, renewal', 'Elder, the last of the feda before the vowels, a tree that grows back from any cutting. An ending that makes room. Let it close.'],
  Ailm: ['clear sight, the long view, healing', 'Pine or fir, tall and evergreen, seeing far from the hill. Perspective and healing. Look at the whole.'],
  Onn: ['gathering, persistence, hope', 'Gorse, in flower almost all year, bright on bare hills. Steady effort and gathering in. Keep at it; it blooms.'],
  Úr: ['luck, healing, warmth of spirit', 'Heather on the moor, bedding and good fortune. Healing and the warmth of spirit. Rest and be renewed.'],
  Eadhadh: ['courage, endurance, facing fear', 'Aspen, whose leaves tremble in the slightest wind. Fear felt and overcome. Be brave anyway.'],
  Iodhadh: ['death and rebirth, the ancestors, eternity', 'Yew, the longest-lived of trees, in every old churchyard. Endings that are also beginnings, and the presence of the dead. Remember them.'],
};

export const FEDA: Stave[] = OGHAM.map((o, i) => ({ ...o, glyph: OGHAM_GLYPHS[i], keywords: OGHAM_WORDS[o.name][0], text: OGHAM_WORDS[o.name][1] }));

/** A word on where the meanings come from, for the draw screen. */
export const STAVE_NOTES = {
  runes: 'The rune poems are old; the meanings readers use today grew from them and from much later practice. Hold them lightly and let your own sense of each rune grow.',
  ogham: 'The ogham was an alphabet first. Its tree names come from medieval word-lists, and most of the meanings readers use are modern. Hold them lightly and let your own sense of each stave grow.',
};

export const staveOf = (name: string): Stave | null => RUNES.find((r) => r.name === name) ?? FEDA.find((f) => f.name === name) ?? (name === BLANK_RUNE.name ? BLANK_RUNE : null);
