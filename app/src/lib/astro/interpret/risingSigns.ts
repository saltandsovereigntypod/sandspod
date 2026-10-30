// The Ascendant (rising sign) in each sign: manner, body and approach to
// life, with the chart ruler it brings. Complete (phase 1).

import type { ZodiacSign } from '../signs.ts';
import type { Interpretation } from './types.ts';

export const RISING_IN_SIGN: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: 'With Aries rising you meet the world head-first: quick, frank and ready to begin. People see you as energetic and brave.',
    detailed:
      'Aries on the Ascendant gives a direct, active manner and often a quick walk and a strong presence. You approach life as a series of challenges and start things easily. Mars is your chart ruler: its sign and house show where your life\'s energy is directed.\n\nThe lesson of this rising is patience and listening; the gift is courage that gets things going for everyone.',
    magic: 'Mars is your planetary ally: Tuesdays, Mars hours, red candles, iron, basil, nettle, garnet. Protection and courage spells come naturally.',
    shadow: 'Coming across as rushed, combative or careless.',
  },
  Taurus: {
    simple: 'With Taurus rising you come across calm, steady and warm. People find you trustworthy, grounded and easy to be near.',
    detailed:
      'Taurus on the Ascendant gives a relaxed, unhurried manner, often a love of comfort and a good eye for beauty. You take life at your own pace and build security around you. Venus is your chart ruler: its sign and house show what draws you and what you build your life around.\n\nThe lesson is flexibility; the gift is steadiness others can rest on.',
    magic: 'Venus is your planetary ally: Fridays, Venus hours, green and pink, copper, rose, vervain, rose quartz. Prosperity and home magic come naturally.',
    shadow: 'Coming across as stubborn or slow to move.',
  },
  Gemini: {
    simple: 'With Gemini rising you meet people with curiosity and conversation. You come across lively, witty and quick.',
    detailed:
      'Gemini on the Ascendant gives an animated, youthful manner and a mind that is always gathering. You approach life by asking, talking and trying things. Mercury is your chart ruler: its sign and house show where your curiosity leads.\n\nThe lesson is focus; the gift is connecting people and ideas.',
    magic: 'Mercury is your planetary ally: Wednesdays, Mercury hours, yellow and mixed colours, lavender, mint, agate. Word and divination magic come naturally.',
    shadow: 'Seeming scattered or hard to pin down.',
  },
  Cancer: {
    simple: 'With Cancer rising you come across gentle and caring, a little guarded at first. People feel looked after around you.',
    detailed:
      'Cancer on the Ascendant gives a soft, receptive manner, sensitive to atmosphere, and a protective outer shell. You approach life cautiously, testing whether it is safe, then give wholeheartedly. The Moon is your chart ruler: its sign, phase and house matter greatly for you.\n\nThe lesson is to let your strength show; the gift is making others feel at home.',
    magic: 'The Moon is your planetary ally: Mondays, Moon hours, silver and white, moonstone, jasmine, mugwort. Every phase of the Moon is a timing tool for you.',
    shadow: 'Seeming moody or withdrawn.',
  },
  Leo: {
    simple: 'With Leo rising you arrive warmly and get noticed. You come across confident, generous and bright.',
    detailed:
      'Leo on the Ascendant gives a warm, dignified presence and often a striking look. You approach life as something to create and to share generously. The Sun is your chart ruler: its sign and house show where you are meant to shine.\n\nThe lesson is humility without dimming; the gift is lighting up a room.',
    magic: 'The Sun is your planetary ally: Sundays, Sun hours, gold and orange, sunstone, calendula, bay. Confidence and success magic come naturally.',
    shadow: 'Coming across as proud or attention-seeking.',
  },
  Virgo: {
    simple: 'With Virgo rising you come across thoughtful, capable and modest. People see you as the one who notices what needs doing.',
    detailed:
      'Virgo on the Ascendant gives a neat, observant, helpful manner and often a youthful, careful presence. You approach life by analysing and improving. Mercury is your chart ruler: its sign and house show where your skill is put to use.\n\nThe lesson is self-acceptance; the gift is making things work.',
    magic: 'Mercury is your planetary ally: Wednesdays, Mercury hours, fennel, lavender, amazonite. Herbcraft, healing and practical magic come naturally.',
    shadow: 'Seeming critical or anxious.',
  },
  Libra: {
    simple: 'With Libra rising you meet the world with charm and tact. You come across graceful, pleasant and fair.',
    detailed:
      'Libra on the Ascendant gives an easy, gracious manner and often a love of style and beauty. You approach life through relationship, seeking balance in every room. Venus is your chart ruler: its sign and house show what you love and how you connect.\n\nThe lesson is decisiveness; the gift is bringing people together.',
    magic: 'Venus is your planetary ally: Fridays, Venus hours, pink and pale blue, rose, violet, rose quartz. Love, harmony and glamour magic come naturally.',
    shadow: 'Seeming indecisive or too eager to please.',
  },
  Scorpio: {
    simple: 'With Scorpio rising you come across quiet and intense. You read a room before you show yourself, and people sense your depth.',
    detailed:
      'Scorpio on the Ascendant gives a magnetic, watchful presence and a strong privacy. You approach life cautiously and deeply, and you are hard to fool. Mars (traditional) and Pluto (modern) are your chart rulers: their signs and houses show where your power goes.\n\nThe lesson is openness; the gift is the courage to face what is real.',
    magic: 'Mars and Pluto are your allies: Tuesdays, Mars hours, black and deep red, obsidian, garnet. Protection, shadow work and transformation come naturally.',
    shadow: 'Seeming secretive or intimidating.',
  },
  Sagittarius: {
    simple: 'With Sagittarius rising you meet life openly and with humour. You come across friendly, frank and adventurous.',
    detailed:
      'Sagittarius on the Ascendant gives an open, expansive manner and a restless love of horizons. You approach life as a journey and a search for meaning. Jupiter is your chart ruler: its sign and house show where your luck and faith grow.\n\nThe lesson is follow-through; the gift is hope that is catching.',
    magic: 'Jupiter is your planetary ally: Thursdays, Jupiter hours, royal blue and purple, tin, sage, clove, lapis. Luck, travel and devotional magic come naturally.',
    shadow: 'Seeming tactless or restless.',
  },
  Capricorn: {
    simple: 'With Capricorn rising you come across composed and serious, someone who means what they say. People trust your competence.',
    detailed:
      'Capricorn on the Ascendant gives a reserved, dignified manner, often looking older when young and younger when old. You approach life with a plan and a long view. Saturn is your chart ruler: its sign and house show where you build your life\'s work.\n\nThe lesson is lightness; the gift is endurance.',
    magic: 'Saturn is your planetary ally: Saturdays, Saturn hours, black and indigo, onyx, jet, cypress. Boundary, protection and long-term magic come naturally.',
    shadow: 'Seeming cold or guarded.',
  },
  Aquarius: {
    simple: 'With Aquarius rising you meet the world as yourself: friendly, a little apart and hard to predict.',
    detailed:
      'Aquarius on the Ascendant gives an independent, unusual presence and an open, friendly manner that keeps some distance. You approach life by questioning and doing it your own way. Saturn (traditional) and Uranus (modern) are your chart rulers: their signs and houses show how you build and how you break the mould.\n\nThe lesson is closeness; the gift is originality.',
    magic: 'Saturn and Uranus are your allies: Saturdays, Saturn hours, electric blue, aquamarine, labradorite. Community, freedom and breaking-free magic come naturally.',
    shadow: 'Seeming aloof or contrary.',
  },
  Pisces: {
    simple: 'With Pisces rising you come across soft, kind and dreamy, catching moods before words.',
    detailed:
      'Pisces on the Ascendant gives a gentle, receptive presence, often a faraway look and a chameleon quality. You approach life intuitively, feeling your way. Jupiter (traditional) and Neptune (modern) are your chart rulers: their signs and houses show where your faith and dreams lead.\n\nThe lesson is boundaries; the gift is compassion that others feel at once.',
    magic: 'Jupiter and Neptune are your allies: Thursdays, Jupiter hours, sea-green and lavender, amethyst, mugwort. Dream, water and divination magic come naturally.',
    shadow: 'Seeming vague or easily swayed.',
  },
};
