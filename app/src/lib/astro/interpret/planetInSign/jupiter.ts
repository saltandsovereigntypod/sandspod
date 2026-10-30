// Jupiter in each sign: where faith, generosity, growth and luck take their
// shape. Jupiter spends about a year in each sign, so a whole school year
// shares it. Domicile in Sagittarius and Pisces, exalted in Cancer;
// detriment in Gemini and Virgo, fall in Capricorn.

import type { ZodiacSign } from '../../signs.ts';
import type { Interpretation } from '../types.ts';

export const JUPITER_IN_SIGN: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "With Jupiter in Aries you grow by being brave. Luck tends to come when you take the first step, back yourself and lead.",
    detailed:
      "Jupiter in Aries puts faith into action. You believe in initiative and independence, and your opportunities often come from going first: starting the business, applying before you feel ready, speaking up for what is right. You can be a natural pioneer and an inspiring leader, generous with encouragement and quick to back a person or idea you believe in.\n\nThe gift is optimistic courage. You recover quickly from setbacks and trust that there is always another beginning. The challenge is excess in the Aries direction: overconfidence, impatience, and starting more than you can sustain. Jupiter makes things bigger, including the temper and the rush.\n\nBecause Jupiter stays about a year in each sign, everyone born within a twelvemonth of you shares it; the house it falls in and the planets it touches make it yours. Mars rules Aries, so Jupiter here works through Mars: look to your Mars to see how your luck likes to move.",
    magic: "Luck magic for you is active: a candle lit on the day you begin something, a courage-and-fortune charm carried to interviews, and spells cast at the first new Moon of spring. Thursdays and Tuesdays suit you. Carnelian, Citrine, cinnamon and Star Anise draw bold good fortune.",
    shadow: "Overconfidence, haste, and believing that will alone is enough.",
  },
  Taurus: {
    simple: "With Jupiter in Taurus you grow through patience, the senses and steady building. Abundance comes slowly and stays.",
    detailed:
      "Jupiter in Taurus finds the sacred in the material world: good food, land, beauty, the body, money well earned and well kept. You tend to trust what you can touch, and your faith is practical. Wealth often grows for you through patience, sound investment, craft or the earth, and you are generous with comfort and hospitality.\n\nThe gift is a genuine talent for enjoying and sharing abundance. You can make a home or garden flourish and help others feel secure. The challenge is excess of comfort: indulgence, materialism, or so much attachment to stability that you miss the growth that change brings.\n\nEveryone born in your year has Jupiter in Taurus too. What sets yours apart is its house, which shows where in life the abundance gathers. Venus rules Taurus, so Jupiter here works through Venus, and your Venus says what kind of abundance truly feeds you.",
    magic: "Prosperity magic suits you very well: money jars filled over months, a herb or vegetable garden blessed at each planting, and gratitude offerings of bread, honey and coins. Thursdays and Fridays, and the waxing Moon in Taurus, suit you. Green Aventurine, Pyrite, basil and cinnamon draw steady abundance.",
    shadow: "Overindulgence, materialism, and comfort mistaken for growth.",
  },
  Gemini: {
    simple: "With Jupiter in Gemini you grow by learning, talking and connecting. Luck comes through ideas, words, networks and curiosity.",
    detailed:
      "Jupiter is in detriment in Gemini, opposite its home in Sagittarius. Traditionally this means Jupiter's big vision is pulled into Gemini's many small pieces of information. In life that often gives a mind hungry for everything: languages, books, facts, people, places. Your opportunities often come through communication, teaching, writing, trading or simply knowing the right person.\n\nThe gift is breadth: you can see connections across many fields and are often a generous, entertaining teacher. The challenge is depth and wisdom. Collecting information is not the same as understanding, and Jupiter's tendency to overdo can scatter you across too many projects.\n\nYour whole school year shares this Jupiter. Its house is the personal part, the area of life where curiosity pays. Mercury rules Gemini, so look to your Mercury to see how your luck likes to talk.",
    magic: "Your fortune magic works through words and travel: petitions written for opportunities, luck charms carried on short journeys, and divination for guidance. Thursdays and Wednesdays suit you. Citrine, Fluorite, Star Anise and peppermint open the way for good news.",
    shadow: "Scattered enthusiasm, knowing a little about everything, and talking more than understanding.",
  },
  Cancer: {
    simple: "With Jupiter in Cancer, where it is exalted, you grow through caring, belonging and home. Your generosity is warm and your luck often flows through family.",
    detailed:
      "Jupiter is exalted in Cancer, which traditional astrologers read as one of its most honoured places: generosity at its most nurturing. You have a big heart and a strong instinct to protect and provide. Family, roots, home, the past and emotional security are where your faith lives, and you often have a gift for making people feel welcome and fed.\n\nThe gift is real kindness and the ability to create a home that blesses everyone in it. Opportunities may come through family, property, the land, food or caring work. The challenge is over-protection and sentimentality: smothering, holding on to the past, or giving so much that you neglect yourself.\n\nA year's worth of births share it; your Jupiter's house shows which part of life most wants your generosity. The Moon rules Cancer, so your Moon shows how your generosity is best received.",
    magic: "Hearth and family magic is where your fortune lives: kitchen blessings, ancestor offerings, a prosperity spell for the household, and moon water used to bless the home. Thursdays and Mondays, and the full Moon, suit you. Moonstone, Selenite, Lemon Balm and a bowl of salt at the hearth draw protection and plenty home; Demeter and Ceres, mothers of the harvest, are fitting patrons.",
    shadow: "Smothering, clinging to the past, and giving until there is nothing left.",
  },
  Leo: {
    simple: "With Jupiter in Leo you grow by shining, creating and leading with your heart. Your generosity is big, warm and a bit theatrical.",
    detailed:
      "Jupiter in Leo is a king's Jupiter: generous, proud, warm and grand. You believe in joy, play and self-expression, and you can lift a whole room with your enthusiasm. Opportunities often come through creativity, performance, leadership, children or anything where your heart is visibly involved.\n\nThe gift is magnanimity: you are generous with praise, encouragement and celebration, and you inspire others to believe in themselves. The challenge is grandiosity: needing to be the centre, overspending on show, or taking yourself too seriously. Pride can blind you to good advice.\n\nClassmates born near you share it, so look to its house for where your own faith in life is strongest. The Sun rules Leo, so your Sun says much about where your fortune wants to shine.",
    magic: "Solar success and joy magic suits you: a spell for recognition, a creative work offered as thanks, a celebration ritual at Lughnasadh or midsummer. Thursdays and Sundays suit you. Sunstone, Citrine, Calendula and Sunflower draw warmth and success; Apollo and Lugh, gods of many skills and the sun's bright strength, are fitting patrons.",
    shadow: "Grandiosity, showing off, and pride that will not take advice.",
  },
  Virgo: {
    simple: "With Jupiter in Virgo you grow through service, skill and doing things well. Your luck comes from attention to detail and practical help.",
    detailed:
      "Jupiter is in detriment in Virgo, opposite its home in Pisces. Traditionally this means Jupiter's broad faith is narrowed into Virgo's detail. In life it often gives a person whose generosity is practical: you help by fixing, teaching skills, healing and improving. You believe in work, health and craft, and your opportunities often come through competence.\n\nThe gift is useful wisdom: you can make big ideas practical and help many people in small, real ways. The challenge is that Jupiter's tendency to expand can turn Virgo's precision into worry, perfectionism or a never-ending list of improvements. Faith may need to be found in the process rather than the finish line.\n\nLike everyone born that year you carry it, and its house shows where your quiet usefulness grows into luck. Mercury rules Virgo, so your Mercury colours how your gifts are offered.",
    magic: "Herbcraft, healing and household magic are your fortune: remedies made with care, cleansing rituals, a well-kept grimoire, and spells for good, steady work. Thursdays and Wednesdays, and the harvest months, suit you. Amazonite, Moss Agate, fennel and Chamomile support health and steady luck.",
    shadow: "Worry, perfectionism, and missing the forest for the trees.",
  },
  Libra: {
    simple: "With Jupiter in Libra you grow through partnership, fairness and beauty. Luck often comes through other people and through being gracious.",
    detailed:
      "Jupiter in Libra believes in justice, harmony and relationship. You are often generous in partnership, good at bringing people together, and drawn to law, diplomacy, the arts and anything where fairness matters. Opportunities tend to arrive through partners, collaborators, clients and social connections.\n\nThe gift is graciousness: people enjoy working with you, and you can build bridges between very different sides. The challenge is overdoing the wish to please: promising too much, avoiding necessary conflict, or relying on others for your growth instead of building your own.\n\nIt is shared by a whole year of births. Its house shows where partnership most opens doors for you. Venus rules Libra, so your Venus shows how your luck is shared.",
    magic: "Your fortune magic is about relationship and justice: sweetening spells for business partnerships, petitions for a fair outcome, beauty rituals as devotion. Thursdays and Fridays, and the Moon in Libra, suit you. Lapis Lazuli, Rose Quartz, rose and Vervain are allies; Athena and Maat are fitting patrons of wise judgement.",
    shadow: "People-pleasing, overcommitting, and growth that waits for someone else.",
  },
  Scorpio: {
    simple: "With Jupiter in Scorpio you grow through depth, intensity and transformation. Your luck is often found in crisis, research and shared resources.",
    detailed:
      "Jupiter in Scorpio looks for meaning in the depths. You are drawn to psychology, the occult, research, healing and the mysteries of life, death and sex. Your faith is not easy optimism but something tested and earned. Opportunities can come through other people's money, inheritance, investment, or work that others are afraid of.\n\nThe gift is regenerative power: you can find gold in the dark, help others through crisis and rebuild after loss. The challenge is excess intensity: obsession, power struggles, or using your insight to control rather than heal.\n\nA whole year shares it; your Jupiter's house shows where you dig for treasure and find it. Mars and Pluto, the traditional and modern rulers of Scorpio, colour how this Jupiter seeks.",
    magic: "Deep magic suits your fortune: divination, shadow work, transformation rituals, and protection for shared finances. Thursdays and Tuesdays, and the dark Moon, suit you. Obsidian, Labradorite, Wormwood and Dragon’s Blood are allies; Hekate and Persephone, keepers of the hidden ways, are fitting patrons.",
    shadow: "Obsession, power games, and suspicion of good fortune.",
  },
  Sagittarius: {
    simple: "With Jupiter in Sagittarius, its own sign, you grow through faith, travel, learning and adventure. Your optimism is natural and catching.",
    detailed:
      "Jupiter is at home in Sagittarius, and here it is at its most expansive. You are a natural seeker: philosophy, religion, foreign lands, higher learning and big ideas are where you feel alive. You have faith in life's goodness, and your generosity is open-handed and frank. Opportunities often come through travel, teaching, publishing or simply saying yes.\n\nThe gift is real wisdom and an infectious enthusiasm for life. You can be a wonderful teacher and a generous friend. Traditional astrologers read Jupiter in its own sign as strong and beneficent. The challenge is excess: overpromising, overconfidence, preachiness, or restlessness that never lets you settle into what you have found.\n\nYour year shares it, and every twelve years Jupiter comes home to its own place in your chart, a return many people feel as a fresh start. As Jupiter rules this sign, Jupiter here is its own ruler: the story is told by its house and aspects.",
    magic: "Expansive, lucky magic is yours: travel blessings, spells for success in study or publishing, and devotions to the gods of your path. Thursdays and Jupiter hours, and the Moon in Sagittarius, suit you. Turquoise, Lapis Lazuli, Sage and nutmeg draw luck and wisdom; Zeus and Jupiter themselves are the old patrons of this placement.",
    shadow: "Overconfidence, preachiness, and promising more than you can give.",
  },
  Capricorn: {
    simple: "With Jupiter in Capricorn you grow through discipline, responsibility and long-term ambition. Luck comes slowly, earned by hard work.",
    detailed:
      "Jupiter is in fall in Capricorn, opposite its exaltation in Cancer. Traditional astrologers read this as Jupiter's generosity constrained by Saturn's caution. In life it often gives someone who believes in effort, structure and earned success rather than easy luck. You can be very good at building institutions, businesses and careers, and your faith grows with each real achievement.\n\nThe gift is practical wisdom and the ability to make dreams real and lasting. The challenge is scarcity thinking: doubting that good things can come easily, being too cautious to take an opportunity, or measuring worth only by status and results.\n\nYour birth year shares it, and its house shows where patient work turns into fortune. Saturn rules Capricorn, so your Saturn shows what your growth is built on.",
    magic: "Your fortune magic is structured and patient: career spells worked over a season, a prosperity plan blessed at each new Moon, and ancestor rites for guidance on the long road. Thursdays and Saturdays suit you. Garnet, Onyx, Pyrite and cypress support steady, earned success.",
    shadow: "Pessimism about luck, status-seeking, and too much caution.",
  },
  Aquarius: {
    simple: "With Jupiter in Aquarius you grow through friendship, community and new ideas. Luck comes through networks, causes and thinking ahead.",
    detailed:
      "Jupiter in Aquarius believes in humanity, progress and freedom. You are often drawn to science, technology, social causes and groups, and your generosity is directed toward the collective. Opportunities may come through friends, networks, online communities or innovative projects.\n\nThe gift is visionary thinking and an open mind: you can imagine a better future and help build it with others. The challenge is detachment and dogma: loving ideas more than people, or holding your progressive views as fiercely as any orthodoxy.\n\nYour year shares this Jupiter; its house shows where your friendships and networks are luckiest. Saturn and Uranus, the traditional and modern rulers of Aquarius, both colour this Jupiter.",
    magic: "Communal and future-minded magic suits your fortune: group rituals, coven work, spells for a cause, and astrological timing for new projects. Thursdays and Saturdays, and the Moon in Aquarius, suit you. Amethyst, Aquamarine, Labradorite and lavender help vision stay grounded.",
    shadow: "Detachment, ideological rigidity, and loving humanity more than the person in front of you.",
  },
  Pisces: {
    simple: "With Jupiter in Pisces, its traditional home, you grow through compassion, imagination and spiritual faith. Your generosity is boundless.",
    detailed:
      "Jupiter is at home in Pisces, its night house, and here it is gentle, mystical and kind. You believe in the unseen, in compassion and in the oneness of all things. You are often drawn to spirituality, the arts, healing and service, and your generosity can be selfless. Opportunities may come through intuition, faith, creative work or simply being in the right place at the right time.\n\nThe gift is spiritual wisdom and deep compassion: you can comfort, heal and inspire. Traditional astrologers read Jupiter in its own sign as strong and beneficent. The challenge is boundaries and escapism: giving too much, believing too easily, or avoiding the hard edges of life.\n\nYour year shares it with you; its house shows where you are most likely to feel held by something larger. As the traditional ruler of Pisces, Jupiter here is its own ruler; Neptune, the modern ruler, adds its dreaming.",
    magic: "Devotional, dreamy magic is yours: meditation, prayer, dreamwork, healing spells and offerings to the gods of the sea. Thursdays and Mondays, and the Moon in Pisces, suit you. Amethyst, Aquamarine, Sandalwood and jasmine open the way; a bowl of water on the altar, refreshed each Thursday, is a simple, lovely devotion.",
    shadow: "Escapism, gullibility, and giving until you dissolve.",
  },
};
