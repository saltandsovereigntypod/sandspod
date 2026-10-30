// Glossary: the twelve signs.

import type { GlossaryEntry } from './types.ts';

type SignSeed = {
  name: string;
  symbol: string;
  simple: string;
  sky: string;
  history: string;
  traditions: string;
  craft: string;
  care: string;
  related: string[];
};

const seeds: SignSeed[] = [
  {
    name: 'Aries',
    symbol: '♈︎',
    simple: 'Aries, the Ram, is the first sign: fire and beginnings. Brave, direct, impatient, it meets life head-first.',
    sky: 'The Sun is in tropical Aries from the March equinox (about 20 March) to about 20 April. The sign begins at the spring equinox point; because of precession the constellation Aries now lies mostly behind the sign of Taurus.',
    history: 'Aries opened the zodiac because the Sun stood among its stars at the spring equinox in Greek times. Its ram is linked with the golden fleece of Greek myth and with the ram-headed Amun.',
    traditions: 'Cardinal fire, yang, ruled by Mars, the Sun exalted here, Venus in detriment, Saturn in fall. It rules the head and face. Modern readers: initiative, courage, self-assertion and the urge to be first.',
    craft: 'The Moon in Aries suits courage, new starts, protection and clearing obstacles. Aries season is a classic time to begin new workings and cleanse for spring. Colours: red; stones: carnelian, bloodstone; herbs: nettle, black pepper.',
    care: 'Aries energy starts better than it finishes; build in a plan for the middle.',
    related: ['mars', 'fire', 'cardinal', 'house-1'],
  },
  {
    name: 'Taurus',
    symbol: '♉︎',
    simple: 'Taurus, the Bull, is earth at its most settled: steady, sensual, patient, loyal and fond of good things that last.',
    sky: 'The Sun is in Taurus from about 20 April to 21 May. The Pleiades and the red star Aldebaran sit in the constellation, now behind the sign of Gemini.',
    history: 'The bull of heaven appears in the Epic of Gilgamesh; in Greek myth Zeus became a white bull to carry off Europa. Taurus held the spring equinox some 4,000 to 6,000 years ago.',
    traditions: 'Fixed earth, yin, ruled by Venus, the Moon exalted here, Mars and Pluto in detriment. It rules the throat and neck. Modern readers: stability, the body, resources, comfort and stubbornness.',
    craft: 'The Moon in Taurus suits money and prosperity, home blessings, gardening, slow steady spells and self-care. Beltane falls in Taurus season. Colours: green, rose; stones: rose quartz, emerald; herbs: rose, thyme, vanilla.',
    care: 'What Taurus gains it keeps; that can mean holding on past time.',
    related: ['venus', 'earth', 'fixed', 'house-2'],
  },
  {
    name: 'Gemini',
    symbol: '♊︎',
    simple: 'Gemini, the Twins, is restless air: curious, talkative, quick, playful and interested in everything at once.',
    sky: 'The Sun is in Gemini from about 21 May to 21 June. The bright twin stars Castor and Pollux mark the constellation.',
    history: 'Castor and Pollux (the Dioscuri), one mortal and one divine, shared their brother\'s fate between Olympus and the underworld; sailors prayed to them in storms.',
    traditions: 'Mutable air, yang, ruled by Mercury, Jupiter in detriment. It rules the arms, hands and lungs. Modern readers: communication, learning, siblings, wit and duality.',
    craft: 'The Moon in Gemini suits communication, study, writing, divination and quick errands. Colours: yellow, mixed colours; stones: agate, citrine; herbs: lavender, mint, fennel.',
    care: 'Gemini\'s breadth can scatter; pick one thread to follow.',
    related: ['mercury', 'air', 'mutable', 'house-3'],
  },
  {
    name: 'Cancer',
    symbol: '♋︎',
    simple: 'Cancer, the Crab, is cardinal water: tender, protective, home-loving and moody as the tides, soft inside a strong shell.',
    sky: 'The Sun is in Cancer from the June solstice (about 21 June) to about 22 July. The faint constellation holds the Beehive cluster (Praesepe).',
    history: 'The crab Hera sent against Heracles. Cancer held the summer solstice in classical times, which is why the northern tropic is the Tropic of Cancer.',
    traditions: 'Cardinal water, yin, ruled by the Moon, Jupiter exalted here, Saturn in detriment, Mars in fall. It rules the breasts and stomach. Modern readers: home, family, nurture, memory and belonging.',
    craft: 'The Moon in Cancer (its own sign) suits home and family blessings, emotional healing, dreamwork, kitchen witchery and ancestor offerings. Litha begins Cancer season. Colours: silver, white; stones: moonstone, pearl; herbs: lemon balm, jasmine, willow.',
    care: 'Cancer\'s care can tip into worry; nurture yourself too.',
    related: ['moon', 'water', 'cardinal', 'house-4'],
  },
  {
    name: 'Leo',
    symbol: '♌︎',
    simple: 'Leo, the Lion, is fixed fire: warm, proud, generous, creative and made to be seen.',
    sky: 'The Sun is in Leo from about 22 July to 23 August. The royal star Regulus, "the little king", sits near the ecliptic in the constellation.',
    history: 'The Nemean lion of Heracles\' first labour. In Egypt the Nile flood came as the Sun entered Leo, and lion-headed gods (Sekhmet among them) guarded the season.',
    traditions: 'Fixed fire, yang, ruled by the Sun, Saturn and Uranus in detriment. It rules the heart and spine. Modern readers: self-expression, play, children, romance, leadership and pride.',
    craft: 'The Moon in Leo suits confidence, creativity, joy, glamour and courage. Lughnasadh falls in Leo season. Colours: gold, orange; stones: sunstone, citrine, tiger eye; herbs: calendula, sunflower, bay.',
    care: 'Leo shines brightest when it isn\'t asking to be told it does.',
    related: ['sun', 'fire', 'fixed', 'house-5'],
  },
  {
    name: 'Virgo',
    symbol: '♍︎',
    simple: 'Virgo, the Maiden, is mutable earth: careful, skilled, helpful and discerning, always refining.',
    sky: 'The Sun is in Virgo from about 23 August to the September equinox (about 22 September). The bright star Spica, "the ear of wheat", lies in the constellation.',
    history: 'The maiden with a sheaf of wheat: Demeter or Persephone, Astraea who left the earth last at the end of the golden age, and in some readings Isis.',
    traditions: 'Mutable earth, yin, ruled by Mercury and exalted Mercury, Jupiter and Neptune in detriment, Venus in fall. It rules the digestion. Modern readers: service, health, craft, analysis and daily routine.',
    craft: 'The Moon in Virgo suits health, cleansing, herbcraft, organising and practical magic. Mabon closes Virgo season. Colours: green, brown, navy; stones: amazonite, moss agate; herbs: fennel, lavender, valerian.',
    care: 'Virgo\'s eye for flaws is a gift for craft and a weight on the self; turn it gently.',
    related: ['mercury', 'earth', 'mutable', 'house-6'],
  },
  {
    name: 'Libra',
    symbol: '♎︎',
    simple: 'Libra, the Scales, is cardinal air: gracious, fair, sociable and drawn to beauty and balance.',
    sky: 'The Sun is in Libra from the September equinox (about 22 September) to about 23 October, when day and night are near equal.',
    history: 'The only sign not a living being. Once the claws of the Scorpion, the scales were named by the Romans and linked to justice and Astraea; the equinox balance gave the image.',
    traditions: 'Cardinal air, yang, ruled by Venus, Saturn exalted here, Mars in detriment, the Sun in fall. It rules the kidneys and lower back. Modern readers: relationship, fairness, diplomacy, art and indecision.',
    craft: 'The Moon in Libra suits love and friendship, harmony, justice, beauty and partnership. Mabon opens Libra season. Colours: pink, pale blue; stones: rose quartz, lapis; herbs: rose, violet, thyme.',
    care: 'Keeping the peace isn\'t the same as making it.',
    related: ['venus', 'air', 'cardinal', 'house-7'],
  },
  {
    name: 'Scorpio',
    symbol: '♏︎',
    simple: 'Scorpio, the Scorpion, is fixed water: deep, private, intense and loyal, unafraid of what others look away from.',
    sky: 'The Sun is in Scorpio from about 23 October to 22 November. The red star Antares, "rival of Mars", is the scorpion\'s heart.',
    history: 'The scorpion that killed Orion, set opposite him in the sky so they never rise together. Samhain falls in Scorpio season, as does the Day of the Dead, both times of the thinning veil in modern practice.',
    traditions: 'Fixed water, yin, ruled by Mars (traditional) and Pluto (modern), Venus in detriment, the Moon in fall. It rules the genitals. Modern readers: intimacy, power, transformation, secrets, shared resources and regeneration.',
    craft: 'The Moon in Scorpio suits shadow work, banishing, transformation, protection and psychic work. Colours: black, deep red; stones: obsidian, garnet, smoky quartz; herbs: wormwood, basil, pomegranate.',
    care: 'Scorpio\'s intensity heals best with trust and air; not every secret needs keeping.',
    related: ['mars', 'pluto', 'water', 'fixed', 'house-8'],
  },
  {
    name: 'Sagittarius',
    symbol: '♐︎',
    simple: 'Sagittarius, the Archer, is mutable fire: free, honest, hopeful and hungry for meaning, travel and truth.',
    sky: 'The Sun is in Sagittarius from about 22 November to the December solstice (about 21 December). The centre of our galaxy lies in the constellation\'s direction.',
    history: 'A centaur archer, sometimes Chiron, sometimes Crotus. Babylonian images showed a winged centaur god, Pabilsag.',
    traditions: 'Mutable fire, yang, ruled by Jupiter, Mercury in detriment. It rules the hips and thighs. Modern readers: philosophy, faith, higher learning, travel, teaching and restlessness.',
    craft: 'The Moon in Sagittarius suits luck, travel, learning, expansion and seeking truth. Colours: purple, royal blue; stones: turquoise, lapis, amethyst; herbs: sage, clove, star anise.',
    care: 'Sagittarius\'s honesty is a gift when kind; aim the arrow carefully.',
    related: ['jupiter', 'fire', 'mutable', 'house-9'],
  },
  {
    name: 'Capricorn',
    symbol: '♑︎',
    simple: 'Capricorn, the Sea-Goat, is cardinal earth: serious, ambitious, patient and responsible, climbing steadily.',
    sky: 'The Sun is in Capricorn from the December solstice (about 21 December) to about 20 January. The southern tropic is the Tropic of Capricorn for the solstice once held here.',
    history: 'A goat with a fish\'s tail, the Babylonian emblem of Ea (Enki), god of fresh water and wisdom; in Greek myth Pan or Amalthea.',
    traditions: 'Cardinal earth, yin, ruled by Saturn, Mars exalted here, the Moon in detriment, Jupiter in fall. It rules the knees, bones and skin. Modern readers: career, discipline, authority, tradition and endurance.',
    craft: 'The Moon in Capricorn suits career, structure, long-term goals, boundaries and binding. Yule opens Capricorn season. Colours: black, brown, deep green; stones: onyx, jet, garnet; herbs: comfrey, cypress, patchouli.',
    care: 'Capricorn can carry everyone; let something be carried for you.',
    related: ['saturn', 'earth', 'cardinal', 'house-10'],
  },
  {
    name: 'Aquarius',
    symbol: '♒︎',
    simple: 'Aquarius, the Water-Bearer, is fixed air: independent, inventive, idealistic and devoted to friends and causes.',
    sky: 'The Sun is in Aquarius from about 20 January to 19 February. The constellation lies in a region the Babylonians called "the Sea".',
    history: 'Ganymede, cupbearer to the gods, or the Babylonian figure pouring the rivers. Imbolc falls in Aquarius season.',
    traditions: 'Fixed air, yang, ruled by Saturn (traditional) and Uranus (modern), the Sun in detriment. It rules the ankles and circulation. Modern readers: community, ideals, originality, detachment and the future.',
    craft: 'The Moon in Aquarius suits friendship, community, breaking habits, innovation and freedom. Colours: electric blue, silver; stones: amethyst, aquamarine, labradorite; herbs: lavender, mint.',
    care: 'Loving humanity is easier than loving the person in front of you; Aquarius learns both.',
    related: ['saturn', 'uranus', 'air', 'fixed', 'house-11'],
  },
  {
    name: 'Pisces',
    symbol: '♓︎',
    simple: 'Pisces, the Fishes, is mutable water: dreamy, compassionate, intuitive and porous to the world\'s feeling.',
    sky: 'The Sun is in Pisces from about 19 February to the March equinox (about 20 March). The spring equinox point now sits in the constellation Pisces, slowly drifting toward Aquarius.',
    history: 'Two fish tied by a cord: Aphrodite and Eros, turned to fish to escape the monster Typhon. The drift of the equinox through Pisces gave rise to talk of the "Age of Pisces" and the coming "Age of Aquarius".',
    traditions: 'Mutable water, yin, ruled by Jupiter (traditional) and Neptune (modern), Venus exalted here, Mercury in detriment and fall. It rules the feet. Modern readers: imagination, empathy, spirituality, surrender and escapism.',
    craft: 'The Moon in Pisces suits intuition, dreams, meditation, divination and spiritual healing. Colours: sea-green, lavender; stones: amethyst, aquamarine; herbs: mugwort, jasmine, willow.',
    care: 'Pisces feels everything; good boundaries and grounding keep its gifts its own.',
    related: ['jupiter', 'neptune', 'water', 'mutable', 'house-12'],
  },
];

export const SIGN_TERMS: GlossaryEntry[] = seeds.map((s) => ({
  id: s.name.toLowerCase(),
  term: s.name,
  category: 'sign',
  symbol: s.symbol,
  simple: s.simple,
  detailed: { sky: s.sky, history: s.history, traditions: s.traditions, craft: s.craft, care: s.care },
  related: s.related,
}));
