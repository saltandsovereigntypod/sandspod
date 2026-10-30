// Uranus in each sign: where a generation breaks the mould. Uranus takes
// about seven years to cross a sign, so these readings describe the
// generation as much as the person; the house it falls in, and its aspects
// to personal planets, are what make it yours. Uranus was discovered in
// 1781 and has no traditional dignities; modern astrologers give it
// rulership of Aquarius.

import type { ZodiacSign } from '../../signs.ts';
import type { Interpretation } from '../types.ts';

export const URANUS_IN_SIGN: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "Uranus in Aries marks a generation of pioneers who break rules by acting first. In you it can show as a restless, independent streak and a need to be free to start things your own way.",
    detailed:
      "Uranus was in Aries from about 1927 to 1935 and again from 2010 to 2019. Both groups arrived when individual will and new technologies were reshaping the world: radio and flight for the first, smartphones and social platforms for the second. The generation's gift is courage to try the new; its risk is impatience and rebellion without a plan.\n\nPersonally, this placement matters most if Uranus touches your Sun, Moon, Ascendant or chart ruler, or sits in an angular house. Then it can show as sudden decisions, a strong allergy to being told what to do, and an inventive, impulsive streak. Its house shows where you need the most freedom to act.",
    magic: "Lightning-quick, improvised magic suits this energy: spells cast on the spot, sigils made in a moment of inspiration, and fire-and-air workings to break a stuck pattern. Storm energy, captured carefully in water or a charged object, is a classic Uranian tool. Carnelian, Labradorite and ginger hold the spark.",
    shadow: "Rebellion for its own sake, and impatience with anything slow.",
  },
  Taurus: {
    simple: "Uranus in Taurus marks a generation that changes how we value money, food, land and the body. In you it can bring surprising ideas about security and worth.",
    detailed:
      "Uranus was in Taurus from about 1934 to 1942 and again from 2018 to 2026. The first group grew up through depression and war, when money and food were overturned; the second arrives with digital currencies, a changing climate and new ways of farming, eating and owning. The generation's gift is reinventing what security means; its risk is stubborn resistance to change, or upheaval in the things that should be steady.\n\nPersonally, it matters most when it aspects your personal planets or sits on an angle. Then it can show as an unusual relationship to money, possessions or the body, sudden changes in income, and a taste for unconventional beauty. Its house shows where your security keeps being reinvented.",
    magic: "Earth magic with a twist suits this placement: new methods of growing, money spells that experiment, and grounding rituals to steady sudden change. Green Aventurine, Labradorite and Smoky Quartz help hold the ground when the earth shifts.",
    shadow: "Clinging to old security while it crumbles, or recklessness with resources.",
  },
  Gemini: {
    simple: "Uranus in Gemini marks a generation of quick, inventive minds who change how we talk and learn. In you it can show as original ideas and restless curiosity.",
    detailed:
      "Uranus was in Gemini from about 1941 to 1949 and entered it again in 2025, staying until 2033. The first group grew up as radio, early computing and codebreaking changed communication; the new one is born into a world remade by artificial intelligence and instant networks. The generation's gift is brilliant, unconventional thinking; its risk is scattered attention and information without wisdom.\n\nPersonally, when Uranus touches your personal planets or angles, it can bring flashes of insight, an unusual way of speaking or writing, and a mind that jumps across subjects. Its house shows where your thinking breaks new ground.",
    magic: "Word and air magic with innovation suits this energy: digital sigils, new forms of divination, spells written in code or cipher, and rituals for clear communication. Fluorite, Citrine and peppermint steady a fast-moving mind.",
    shadow: "Nervous restlessness, and clever ideas that never land.",
  },
  Cancer: {
    simple: "Uranus in Cancer marks a generation that changed what family and home can be. In you it can bring unusual roots and a need for freedom within belonging.",
    detailed:
      "Uranus was in Cancer from about 1948 to 1956, the post-war years of new suburbs, television in the living room and changing family roles. That generation later reshaped ideas of family, gender and home. The gift is reinventing belonging; the risk is emotional unpredictability or a home life that never quite settles.\n\nPersonally, when this Uranus touches your Moon, Sun or angles, it can show as an unconventional family, frequent moves, a need for independence even in close bonds, and sudden emotional insights. Its house shows where your sense of home is reinvented.",
    magic: "Hearth magic with a new shape suits this placement: blessing a chosen family, unusual home altars, ancestor work that includes the family you made, and rituals for emotional freedom. Moonstone, Labradorite and Lemon Balm steady changing tides.",
    shadow: "Restlessness at home, and fear of being tied by belonging.",
  },
  Leo: {
    simple: "Uranus in Leo marks a generation that rebelled through creativity and self-expression. In you it can show as a bold, original creative streak.",
    detailed:
      "Uranus was in Leo from about 1955 to 1962. This generation grew up with rock and roll and youth culture, and came of age insisting on the right to be themselves. The gift is creative revolution and fearless self-expression; the risk is ego and the need to be the unique one in every room.\n\nPersonally, when it aspects your personal planets or angles, it can show as an unusual creative talent, unconventional romance, and a strong need to express yourself in your own way. Its house shows where you insist on being original.",
    magic: "Creative and performative magic suits this energy: improvised ritual, dance and song as power, and glamour that breaks the rules. Sunstone, Labradorite and Sunflower hold bright, original fire.",
    shadow: "Self-centred rebellion, and drama to prove you are different.",
  },
  Virgo: {
    simple: "Uranus in Virgo marks a generation that changed work, health and technology. In you it can bring inventive skill and new ideas about wellbeing.",
    detailed:
      "Uranus was in Virgo from about 1961 to 1969, alongside Pluto for much of that time. This generation saw computers move into work and grew up as ideas about diet, ecology and alternative health took root. The gift is practical innovation; the risk is nervous tension and anxious perfectionism about systems that keep changing.\n\nPersonally, when it touches your personal planets or angles, it can show as unusual work patterns, a gift for technology or alternative healing, and a restless, inventive approach to daily routines. Its house shows where you reform the everyday.",
    magic: "Practical, experimental magic suits this placement: new herbal methods, healing rituals beside proper care, and spells to reorganise daily life. Fluorite, Amazonite and fennel steady an inventive, anxious mind.",
    shadow: "Nervous tension, and critical restlessness with every routine.",
  },
  Libra: {
    simple: "Uranus in Libra marks a generation that changed the rules of relationship and partnership. In you it can show as a need for freedom and equality in love.",
    detailed:
      "Uranus was in Libra from about 1968 to 1975. This generation grew up as divorce became common and the shapes of marriage and partnership opened up. The gift is reinventing relationship on equal terms; the risk is instability, or valuing freedom so much that commitment feels impossible.\n\nPersonally, when it aspects your Venus, Moon or angles, it can show as unconventional relationships, sudden attractions and endings, and a strong sense of justice. Its house shows where you need fairness on new terms.",
    magic: "Relationship magic with freedom built in suits this energy: spells for equal partnership, honest agreements, and rituals that honour unusual bonds. Rose Quartz, Lapis Lazuli and Labradorite suit this airy, changeable heart.",
    shadow: "Restlessness in love, and keeping one foot out of the door.",
  },
  Scorpio: {
    simple: "Uranus in Scorpio marks a generation that broke taboos around sex, death and power. In you it can bring sudden transformations and deep, radical insight.",
    detailed:
      "Uranus was in Scorpio from about 1974 to 1981. This generation grew up as taboos around sexuality, death and psychology were being challenged, and as new crises and medical discoveries changed how we think of the body and survival. The gift is fearless honesty about the depths; the risk is upheaval in intimacy and power.\n\nPersonally, when it touches your personal planets or angles, it can show as sudden changes in shared resources or intimacy, intense intuition, and a drive to expose and transform what is hidden. Its house shows where you break through.",
    magic: "Radical transformation magic suits this placement: shadow work, breaking curses or old patterns, and rituals for rebirth after upheaval. Obsidian, Labradorite and Wormwood suit this intense, electric depth.",
    shadow: "Explosive intensity, and upheaval for its own sake.",
  },
  Sagittarius: {
    simple: "Uranus in Sagittarius marks a generation that changed beliefs, travel and education. In you it can bring unconventional ideas about faith and freedom.",
    detailed:
      "Uranus was in Sagittarius from about 1981 to 1988. This generation grew up as travel became cheap, the world became connected and religious and philosophical ideas began to mix. The gift is open-minded, global thinking; the risk is restless searching and rejecting every tradition without finding one's own.\n\nPersonally, when it aspects your personal planets or angles, it can show as sudden changes of belief, unusual education or travel, and a strong need for intellectual freedom. Its house shows where you seek new horizons.",
    magic: "Eclectic, seeking magic suits this energy: rituals that blend traditions with care and respect, travel spells, and divination by new methods. Turquoise, Labradorite and Star Anise suit this wide, restless mind.",
    shadow: "Restless seeking, and rebellion against every belief.",
  },
  Capricorn: {
    simple: "Uranus in Capricorn marks a generation that challenges and rebuilds structures and institutions. In you it can show as innovative ambition.",
    detailed:
      "Uranus was in Capricorn from about 1988 to 1996, mostly with Neptune alongside. This generation was born as the Berlin Wall fell, the internet arrived and old institutions began to shake. The gift is rebuilding structures in new ways; the risk is cynicism about all authority, or rigid rebellion.\n\nPersonally, when it touches your personal planets or angles, it can show as an unusual career path, sudden changes in status, and a drive to reform how things are run. Its house shows where you rebuild the rules.",
    magic: "Structured innovation suits this placement: spells for unconventional success, rituals to break outdated rules in your life, and grounding work for sudden change. Onyx, Labradorite and cypress steady this ambitious, restless energy.",
    shadow: "Cynicism about authority, and rebellion that becomes its own rigid rule.",
  },
  Aquarius: {
    simple: "Uranus in Aquarius, its modern home, marks a generation of digital natives and network thinkers. In you it can bring originality and a strong sense of community.",
    detailed:
      "Uranus was in Aquarius from about 1995 to 2003, the sign modern astrologers give it to rule. This generation grew up with the internet and networks as a given. The gift is collective vision and comfort with the new; the risk is detachment, and living more in the network than in the body.\n\nPersonally, when it aspects your personal planets or angles, it can show as strong individuality, unusual friendships and a natural gift for technology and group work. Its house shows where you are most yourself by being unlike anyone else.",
    magic: "Networked, communal magic suits this energy: online circles, group sigils, rituals for a cause and astrology-timed spells. Amethyst, Labradorite and lavender support this clear, electric vision.",
    shadow: "Detachment, and feeling like an outsider everywhere.",
  },
  Pisces: {
    simple: "Uranus in Pisces marks a generation that changes spirituality, art and compassion. In you it can bring sudden intuitions and unusual spiritual gifts.",
    detailed:
      "Uranus was in Pisces from about 2003 to 2011. This generation is growing up with streaming art, virtual worlds and changing ideas of spirituality and mental health. The gift is imaginative, compassionate innovation; the risk is confusion, and escaping into the virtual.\n\nPersonally, when it touches your personal planets or angles, it can show as sudden psychic flashes, unusual creative talent, and a need for spiritual freedom. Its house shows where your intuition breaks new ground.",
    magic: "Dream and water magic with new forms suits this placement: digital art as offering, new forms of meditation, and dreamwork. Amethyst, Aquamarine and mugwort suit this sensitive, inventive spirit.",
    shadow: "Confusion, and escape into dreams or screens.",
  },
};
