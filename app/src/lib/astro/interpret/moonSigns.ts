// The Moon in each sign: feelings, needs and inner life. Complete (phase 1).

import type { ZodiacSign } from '../signs.ts';
import type { Interpretation } from './types.ts';

export const MOON_IN_SIGN_READING: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: 'With the Moon in Aries your feelings are quick and fiery. You need freedom, action and honesty to feel safe, and your moods flare and pass fast.',
    detailed:
      'An Aries Moon reacts first and reflects later. Feelings arrive as impulses to do something, and you tend to meet hurt with anger or movement rather than tears. You are emotionally brave and direct, and you need room to be independent.\n\nYou soothe yourself best by moving: exercise, a new project, a fresh start. The growth is in pausing long enough to feel what is under the spark.',
    magic: 'Your emotional reset is fire: lighting a candle and naming what you feel, burning written worries, a brisk walk at dawn. When the Moon is in Aries each month you may feel more yourself; it is a good time for courage spells.',
    shadow: 'Temper, impatience with your own and others\' feelings.',
  },
  Taurus: {
    simple: 'With the Moon in Taurus your feelings are steady and grounded. You need comfort, routine, good food and touch to feel safe.',
    detailed:
      'The Moon is exalted in Taurus: feelings here are calm, warm and loyal. You are slow to upset and slow to let go, and you find peace in the body and the senses: a garden, a meal, a soft blanket, a familiar walk.\n\nYou soothe yourself best through the senses and through things staying the same. The growth is in trusting change when it comes.',
    magic: 'Your emotional reset is earth: hands in soil, a herbal bath, a slow meal made as ritual, holding a stone. The monthly Taurus Moon is a strong time for money, home and self-care spells.',
    shadow: 'Holding on to hurts, and comfort-seeking that avoids feeling.',
  },
  Gemini: {
    simple: 'With the Moon in Gemini you understand feelings by talking them through. You need conversation, variety and mental play to feel at ease.',
    detailed:
      'A Gemini Moon processes emotion through words: talking, writing, texting, reading about it. Your moods change quickly and you can be lively, funny and curious company, with a restless inner life.\n\nYou soothe yourself best by naming things and by change of scene. The growth is in letting a feeling be felt before it is explained.',
    magic: 'Your emotional reset is air and words: journaling, a letter you burn or keep, talking to a friend, a change of place. The monthly Gemini Moon suits divination, study and communication spells.',
    shadow: 'Over-thinking feelings, and nervous restlessness.',
  },
  Cancer: {
    simple: 'With the Moon in Cancer, its own sign, your feelings run deep and tender. You need home, belonging and people to care for to feel safe.',
    detailed:
      'The Moon is at home in Cancer: you are intuitive, nurturing, protective and strongly tied to memory, family and place. You feel others\' moods as if they were your own and you give care naturally.\n\nYou soothe yourself best at home, in water, and by being looked after. The growth is in letting others care for you as you care for them, and in not carrying every tide.',
    magic: 'Your emotional reset is water and hearth: a bath, a home-cooked meal, tidying your altar, sitting by moonlight. The monthly Cancer Moon is one of the strongest times for home, family, healing and dream work.',
    shadow: 'Moodiness, clinging, and retreating when hurt.',
  },
  Leo: {
    simple: 'With the Moon in Leo your feelings are warm, proud and generous. You need to be appreciated and to express yourself to feel safe.',
    detailed:
      'A Leo Moon wears its heart openly. You are affectionate, loyal and playful, and you feel best when you can create, perform or simply be noticed and loved. Hurt can show as pride.\n\nYou soothe yourself best with joy: play, creativity, music, being with people who delight in you. The growth is in knowing your worth without needing it shown back.',
    magic: 'Your emotional reset is sun and joy: dancing, making something, dressing up, a candle for your own heart. The monthly Leo Moon suits confidence, glamour and creative spells.',
    shadow: 'Wounded pride and needing reassurance.',
  },
  Virgo: {
    simple: 'With the Moon in Virgo you feel safest when life is in order. You show care through practical help and need to be useful.',
    detailed:
      'A Virgo Moon handles feelings by doing something useful with them: cleaning, organising, fixing, helping. You are modest, observant and attentive to the body and health, and you notice what others need.\n\nYou soothe yourself best with routines and small tasks done well. The growth is in letting feelings be messy and in being as gentle with yourself as you are with others.',
    magic: 'Your emotional reset is cleansing and craft: tidying, a herbal tea brewed with intention, sorting your herbs, a cleansing wash. The monthly Virgo Moon suits healing, herbcraft and practical magic.',
    shadow: 'Worry, self-criticism, and anxiety in the body.',
  },
  Libra: {
    simple: 'With the Moon in Libra you feel safest in harmony. You need fairness, beauty and good company, and conflict unsettles you.',
    detailed:
      'A Libra Moon finds emotional balance through relationship. You are considerate, gracious and attuned to others, and you often soothe the room before yourself. Ugliness and discord affect you deeply.\n\nYou soothe yourself best with beauty, music, kind company and fair resolution. The growth is in naming your own needs, not only weighing everyone else\'s.',
    magic: 'Your emotional reset is beauty: arranging flowers, art, music, a pretty altar, time with a friend. The monthly Libra Moon suits love, friendship and harmony spells.',
    shadow: 'Avoiding conflict and losing your own feelings in someone else\'s.',
  },
  Scorpio: {
    simple: 'With the Moon in Scorpio your feelings run deep and private. You need trust, loyalty and emotional honesty to feel safe.',
    detailed:
      'The Moon is in fall in Scorpio: feelings here are intense, all-or-nothing and often hidden. You are perceptive, loyal and fiercely protective, and you can sit with pain others turn away from, which makes you a strong friend in crisis.\n\nYou soothe yourself best in privacy and with people you trust completely. The growth is in letting things go and letting yourself be seen.',
    magic: 'Your emotional reset is the dark: candlelight, shadow work, a release ritual, time alone. The monthly Scorpio Moon is a strong time for banishing, protection and transformation.',
    shadow: 'Brooding, suspicion, and holding grudges.',
  },
  Sagittarius: {
    simple: 'With the Moon in Sagittarius you need freedom, meaning and adventure to feel safe. You cheer yourself and others with hope and humour.',
    detailed:
      'A Sagittarius Moon meets feelings with optimism and movement. You need space, honesty and something to look forward to; being fenced in makes you restless. You recover from sorrow by finding its meaning.\n\nYou soothe yourself best outdoors, travelling, learning, or laughing. The growth is in staying with hard feelings without rushing to the bright side.',
    magic: 'Your emotional reset is the open sky: a long walk, a journey, a sacred text, a question to the cards. The monthly Sagittarius Moon suits luck, travel and expansion spells.',
    shadow: 'Restlessness and skipping over pain.',
  },
  Capricorn: {
    simple: 'With the Moon in Capricorn you feel safest when you are in control and doing something useful. You are self-reliant and keep your feelings close.',
    detailed:
      'The Moon is in detriment in Capricorn: feelings here are held carefully and handled responsibly. You may have grown up early, and you show love through reliability and effort. You are steady in a crisis and slow to show hurt.\n\nYou soothe yourself best with structure and accomplishment. The growth is in letting yourself need others and in feeling without fixing.',
    magic: 'Your emotional reset is structure: a list, a routine, a walk among stones and old trees, a protective charm. The monthly Capricorn Moon suits goals, boundaries and binding.',
    shadow: 'Holding feelings in until they come out as tiredness or coldness.',
  },
  Aquarius: {
    simple: 'With the Moon in Aquarius you need freedom and friendship to feel safe. You understand feelings by stepping back and thinking them through.',
    detailed:
      'An Aquarius Moon is cool, kind and independent. You care deeply but from a little distance, and you feel most at home among friends and like-minded people. You need space to be yourself and dislike emotional pressure.\n\nYou soothe yourself best with friends, causes and time alone to think. The growth is in letting feelings close enough to be felt.',
    magic: 'Your emotional reset is air and community: a group ritual, a coven gathering, helping a cause, stargazing. The monthly Aquarius Moon suits breaking habits, freedom and friendship spells.',
    shadow: 'Detachment and intellectualising feelings.',
  },
  Pisces: {
    simple: 'With the Moon in Pisces you feel everything, your own feelings and others\'. You need quiet, imagination and spiritual connection to feel safe.',
    detailed:
      'A Pisces Moon is deeply empathic, imaginative and intuitive. You absorb the moods around you and need time alone to sort yours from everyone else\'s. Music, art, water and the spirit restore you.\n\nYou soothe yourself best by retreating, dreaming and creating. The growth is in boundaries and in grounding your sensitivity so it stays a gift.',
    magic: 'Your emotional reset is water and dream: a ritual bath, music, meditation, a dream journal. The monthly Pisces Moon is one of the strongest times for divination, dreamwork and spiritual healing.',
    shadow: 'Overwhelm, escapism, and taking on others\' pain.',
  },
};
