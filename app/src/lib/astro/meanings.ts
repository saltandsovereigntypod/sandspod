// What the sky means for the day: the Moon's sign and phase, the Sun's
// season, the planets, retrogrades, the void-of-course Moon and eclipses.
// Short, plain, and in the spirit of common modern witchcraft practice.

import type { PhaseName, ZodiacSign } from '../moon.ts';
import type { Planet } from './planets.ts';
import type { EclipseKind } from './eclipses.ts';

/** What the Moon's sign colours the day with, and what it is good for. */
export const MOON_IN_SIGN: Record<ZodiacSign, { mood: string; goodFor: string }> = {
  Aries: { mood: 'bold, quick and impatient', goodFor: 'courage, new starts, protection and clearing obstacles' },
  Taurus: { mood: 'steady, sensual and grounded', goodFor: 'money and prosperity work, home blessings, gardening and self-care' },
  Gemini: { mood: 'curious, talkative and restless', goodFor: 'communication, study, writing, divination and quick errands' },
  Cancer: { mood: 'tender, intuitive and home-loving', goodFor: 'home and family blessings, emotional healing, dreamwork and kitchen witchery' },
  Leo: { mood: 'warm, proud and expressive', goodFor: 'confidence, creativity, joy, glamour and courage' },
  Virgo: { mood: 'practical, careful and detail-minded', goodFor: 'health, cleansing, herbcraft, organizing and practical magic' },
  Libra: { mood: 'gracious, social and balance-seeking', goodFor: 'love and friendship, harmony, justice, beauty and partnership' },
  Scorpio: { mood: 'deep, intense and private', goodFor: 'shadow work, banishing, transformation, protection and psychic work' },
  Sagittarius: { mood: 'optimistic, free and searching', goodFor: 'luck, travel, learning, expansion and seeking truth' },
  Capricorn: { mood: 'serious, ambitious and disciplined', goodFor: 'career, structure, long-term goals, boundaries and binding' },
  Aquarius: { mood: 'independent, inventive and community-minded', goodFor: 'friendship, community, breaking habits, innovation and freedom' },
  Pisces: { mood: 'dreamy, compassionate and psychic', goodFor: 'intuition, dreams, meditation, divination and spiritual healing' },
};

/** What each phase of the Moon is traditionally good for. */
export const PHASE_GOOD_FOR: Record<PhaseName, string> = {
  'New Moon': 'rest, setting intentions and planting seeds in the dark',
  'Waxing Crescent': 'beginnings, hope and taking the first small steps',
  'First Quarter': 'action, courage and pushing through challenges',
  'Waxing Gibbous': 'refining, building and nurturing what you’ve begun',
  'Full Moon': 'power, charging, celebration, divination and gratitude',
  'Waning Gibbous': 'sharing wisdom, giving thanks and beginning to let go',
  'Last Quarter': 'release, breaking habits and clearing out',
  'Waning Crescent': 'banishing, rest, reflection and preparing to begin again',
};

/** The Sun's sign as a season. */
export const SUN_SEASON: Record<ZodiacSign, string> = {
  Aries: 'a season of beginnings and courage',
  Taurus: 'a season of growth, pleasure and patience',
  Gemini: 'a season of curiosity and connection',
  Cancer: 'a season of home, family and feeling',
  Leo: 'a season of warmth, creativity and joy',
  Virgo: 'a season of harvest, service and order',
  Libra: 'a season of balance, beauty and relationship',
  Scorpio: 'a season of depth, endings and transformation',
  Sagittarius: 'a season of adventure, learning and hope',
  Capricorn: 'a season of structure, endurance and goals',
  Aquarius: 'a season of community, ideals and change',
  Pisces: 'a season of dreams, compassion and endings',
};

/** What each planet rules, for "Venus in Scorpio" lines. */
export const PLANET_RULES: Record<Planet, string> = {
  Sun: 'self, vitality and purpose',
  Moon: 'emotions, intuition and the home',
  Mercury: 'thought, communication and travel',
  Venus: 'love, beauty, pleasure and money',
  Mars: 'drive, courage and conflict',
  Jupiter: 'luck, growth and wisdom',
  Saturn: 'structure, discipline and limits',
  Uranus: 'change, freedom and surprise',
  Neptune: 'dreams, spirituality and illusion',
  Pluto: 'power, transformation and rebirth',
};

/** How each sign expresses a planet. */
export const SIGN_STYLE: Record<ZodiacSign, string> = {
  Aries: 'boldly and directly',
  Taurus: 'slowly and sensually',
  Gemini: 'curiously and changeably',
  Cancer: 'tenderly and protectively',
  Leo: 'warmly and dramatically',
  Virgo: 'carefully and practically',
  Libra: 'gracefully and fairly',
  Scorpio: 'deeply and intensely',
  Sagittarius: 'freely and optimistically',
  Capricorn: 'seriously and ambitiously',
  Aquarius: 'unconventionally and independently',
  Pisces: 'dreamily and compassionately',
};

/** What a planet's retrograde asks of us. */
export const RETROGRADE_MEANING: Partial<Record<Planet, string>> = {
  Mercury: 'Communication, travel and technology can tangle. Double-check plans, back up files, and revisit rather than begin.',
  Venus: 'Old loves and old values resurface. Reflect on relationships and money rather than starting new ones.',
  Mars: 'Energy turns inward and progress slows. Rework plans and tend old frustrations before pushing ahead.',
  Jupiter: 'Growth turns inward: a time to deepen faith and wisdom rather than expand outward.',
  Saturn: 'A time to review commitments, structures and responsibilities.',
  Uranus: 'Inner change and quiet awakenings before outward upheaval.',
  Neptune: 'Illusions lift; a clearer look at dreams and spiritual paths.',
  Pluto: 'Deep inner transformation and facing what has been buried.',
};

export const VOID_OF_COURSE_MEANING =
  'While the Moon is void of course, traditional advice is to rest, reflect and finish things rather than start new workings or make big decisions.';

export function eclipseMeaning(type: 'solar' | 'lunar', kind: EclipseKind): string {
  if (type === 'solar') {
    return `A solar eclipse is a supercharged new moon: a portal for sudden beginnings. Many witches rest and observe rather than cast during it${kind === 'partial' ? '' : ', and work with the new direction afterwards'}.`;
  }
  return 'A lunar eclipse is a supercharged full moon: endings, revelations and release. A powerful time for letting go and shadow work.';
}

export const planetInSign = (planet: Planet, sign: ZodiacSign) =>
  `${planet} (${PLANET_RULES[planet]}) works ${SIGN_STYLE[sign]} in ${sign}.`;
