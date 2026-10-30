// Pluto in each sign: what a generation is here to break down and remake.
// Pluto's orbit is uneven, so it spends from about twelve to over thirty
// years in a sign. These readings are generational; Pluto's house and its
// aspects to personal planets are what make it personal. Discovered in
// 1930; modern astrologers give it rulership of Scorpio.

import type { ZodiacSign } from '../../signs.ts';
import type { Interpretation } from '../types.ts';

export const PLUTO_IN_SIGN: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "Pluto in Aries marks a generation that transforms the world through raw will and new beginnings. Nobody alive has it; it last occurred from about 1822 to 1853.",
    detailed:
      "Pluto was last in Aries from about 1822 to 1853, a time of revolutions, nationalism and the rise of the individual will. It will return around 2068. The gift of the placement is the courage to begin again from nothing; its risk is violence and conquest.\n\nIf you see it, you are looking at a historical chart or one cast far into the future. For a person born then, its house showed where they were called to fight for renewal.",
    magic: "Fire and rebirth magic suits this energy: burning what is finished, courage rites, and the phoenix as an image. Bloodstone, Obsidian and nettle honour fierce renewal.",
    shadow: "Destruction for its own sake, and power taken by force.",
  },
  Taurus: {
    simple: "Pluto in Taurus marks a generation that transforms wealth, land and resources. Nobody alive has it; it last occurred from about 1851 to 1884.",
    detailed:
      "Pluto was last in Taurus from about 1851 to 1884, the height of the industrial age, when land, money and the means of production were transformed and fought over. The gift is deep resourcefulness and endurance; the risk is greed and exploitation of the earth.\n\nIf you see it, you are looking at a historical chart. For a person born then, its house showed where they met the power of money and land.",
    magic: "Earth and prosperity magic with respect for the land suits this energy: offerings to land spirits and rituals for honest wealth. Smoky Quartz, Moss Agate and patchouli honour deep earth.",
    shadow: "Greed, and holding on to power through ownership.",
  },
  Gemini: {
    simple: "Pluto in Gemini marks a generation that transforms communication and ideas. Very few, if any, alive now have it; it occurred from about 1882 to 1914.",
    detailed:
      "Pluto was in Gemini from about 1882 to 1914, as telephones, cars, radio and mass newspapers transformed how ideas spread. The gift is powerful, penetrating thought and the drive to transform through information; the risk is propaganda and the misuse of words.\n\nIf you see it, you are most likely looking at a historical chart. For a person born then, its house showed where their mind had transforming power.",
    magic: "Word magic of power suits this energy: binding with words, deep research as devotion, and spells for truth to come out. Fluorite, Obsidian and rosemary honour a deep mind.",
    shadow: "Manipulation through words, and obsessive thinking.",
  },
  Cancer: {
    simple: "Pluto in Cancer marks a generation transformed through family, home and homeland. In you it can show as deep, protective emotional intensity.",
    detailed:
      "Pluto was in Cancer from about 1912 to 1939, through world war, revolution and the Depression, when homes and homelands were destroyed and rebuilt. That generation knew the power of family and nation, for good and ill. The gift is fierce protectiveness and emotional resilience; the risk is clannishness and the misuse of belonging.\n\nFor elders who carry it, when Pluto touches personal planets or angles, it can show as intense family bonds, deep emotional memory, and a drive to protect the home at any cost. Its house shows where they rebuilt their roots.",
    magic: "Ancestral and protective magic suits this placement: ancestor healing, home warding, and rituals for family wounds. Moonstone, Obsidian and rosemary support deep emotional protection.",
    shadow: "Clannishness, and controlling through family ties.",
  },
  Leo: {
    simple: "Pluto in Leo marks a generation that transforms through self-expression, creativity and power. In you it can show as a strong will to create and lead.",
    detailed:
      "Pluto was in Leo from about 1937 to 1958, through the Second World War and the post-war boom. This generation saw the power of charismatic leaders, for terrible ill and great good, and later transformed creativity and youth culture. The gift is creative power and personal authority; the risk is ego and the abuse of power.\n\nFor those who carry it, when Pluto touches personal planets or angles, it can show as a powerful need for self-expression and a strong presence. Its house shows where they insist on their power.",
    magic: "Solar transformation magic suits this energy: creative work as ritual, confidence rituals, and spells to reclaim personal power. Sunstone, Obsidian and Sunflower honour a strong heart.",
    shadow: "Ego, and the urge to dominate.",
  },
  Virgo: {
    simple: "Pluto in Virgo marks a generation that transforms work, health and the environment. In you it can show as a deep drive to fix, heal and perfect.",
    detailed:
      "Pluto was in Virgo from about 1956 to 1972, much of it alongside Uranus. This generation saw computing, ecology and alternative health become forces for change, and later reshaped work and medicine. The gift is the power to heal, reform and purify; the risk is obsessive perfectionism and anxious control.\n\nPersonally, when Pluto touches your personal planets or angles, it can show as intensity about health, work and service, and a talent for deep analysis. Its house shows where you transform the everyday.",
    magic: "Healing and purification magic suits this placement: herbal medicine made with care, cleansing rituals, and spells for health beside proper care. Amazonite, Obsidian and Hyssop support deep purification.",
    shadow: "Obsessive control, and perfectionism that never rests.",
  },
  Libra: {
    simple: "Pluto in Libra marks a generation that transforms relationship, partnership and justice. In you it can show as intense relationships that change you.",
    detailed:
      "Pluto was in Libra from about 1971 to 1984. This generation grew up as divorce, equal rights and new forms of partnership reshaped relationship. The gift is the power to transform how we relate and to fight for justice; the risk is power struggles in love and control through charm.\n\nPersonally, when Pluto touches your personal planets or angles, it can show as intense, transforming relationships and a deep sense of fairness. Its house shows where you meet power in partnership.",
    magic: "Relationship and justice magic suits this energy: rituals for healing partnership wounds, justice spells, and cord cutting when needed. Rose Quartz, Obsidian and Vervain support balance and depth.",
    shadow: "Power struggles in love, and manipulation through charm.",
  },
  Scorpio: {
    simple: "Pluto in Scorpio, its modern home, marks a generation of great depth and intensity. In you it can show as fearless emotional power and a drive for truth.",
    detailed:
      "Pluto was in Scorpio from about 1983 to 1995, the sign modern astrologers give it to rule. This generation grew up amid the AIDS crisis, the end of the Cold War and new conversations about sex, death and trauma. The gift is resilience and fearless honesty about the depths; the risk is intensity, control and survival mode.\n\nPersonally, when Pluto touches your personal planets or angles, it can show as strong intuition, emotional intensity and the power to transform yourself and others. Its house shows where you go deepest.",
    magic: "Deep transformation magic suits this placement: shadow work, banishing, protection, and death-and-rebirth rituals. Obsidian, Garnet and Wormwood honour the depths; Hades and Persephone are their old keepers.",
    shadow: "Control, obsession, and living in survival mode.",
  },
  Sagittarius: {
    simple: "Pluto in Sagittarius marks a generation that transforms beliefs, education and global culture. In you it can show as a powerful search for truth.",
    detailed:
      "Pluto was in Sagittarius from about 1995 to 2008. This generation grew up with globalisation, religious conflict and the internet opening the world. The gift is the power to transform beliefs and to seek a truth that holds for everyone; the risk is extremism and dogmatic certainty.\n\nPersonally, when Pluto touches your personal planets or angles, it can show as intense beliefs, a passion for learning and travel, and a drive to change how people think. Its house shows where you seek deeper truth.",
    magic: "Seeking, devotional magic suits this energy: pilgrimage, study as devotion, and rituals for truth and wisdom. Turquoise, Obsidian and Sage honour the search.",
    shadow: "Fanaticism, and certainty that silences others.",
  },
  Capricorn: {
    simple: "Pluto in Capricorn marks a generation that transforms institutions, governments and structures of power. In you it can show as deep ambition and resilience.",
    detailed:
      "Pluto was in Capricorn from about 2008 to 2024. This generation was born through financial crisis, a pandemic and the shaking of many institutions. The gift is the power to rebuild structures from the ground up and to wield authority responsibly; the risk is cynicism about power or a hunger for control.\n\nPersonally, when Pluto touches your personal planets or angles, it can show as strong ambition, endurance and a drive to transform how things are run. Its house shows where you rebuild.",
    magic: "Structured, powerful magic suits this placement: long-term spells for success, ancestor rites, and banishing outdated structures. Onyx, Obsidian and cypress support steady, deep change.",
    shadow: "Hunger for control, and cynicism about authority.",
  },
  Aquarius: {
    simple: "Pluto in Aquarius marks a generation transforming technology, community and collective power. In you it can show as a radical vision for the future.",
    detailed:
      "Pluto entered Aquarius in 2023 to 2024 and will stay until about 2044. Children born now arrive in a world being remade by artificial intelligence, networks and new ideas of community. The gift is the power to transform society and give power to the many; the risk is the misuse of technology and collective control.\n\nPersonally, Pluto's house and its aspects to personal planets show where a child of this generation carries the collective's change most strongly.",
    magic: "Communal and visionary magic suits this energy: group ritual, spells for social change, and protection in digital spaces. Amethyst, Obsidian and Labradorite suit this transforming vision.",
    shadow: "Collective control, and losing the person to the cause.",
  },
  Pisces: {
    simple: "Pluto in Pisces marks a generation that transforms spirituality, art and compassion. Nobody alive has it; it last occurred from about 1797 to 1823.",
    detailed:
      "Pluto was last in Pisces from about 1797 to 1823, the Romantic age, when art, mysticism and feeling transformed culture. It will return around 2043. The gift is spiritual transformation and deep compassion; the risk is escapism, addiction and confusion of power.\n\nIf you see it, you are looking at a historical chart or one cast for the future. For a person born then, its house showed where they dissolved and were remade.",
    magic: "Spiritual, dreaming magic suits this energy: meditation, trance, water rituals and dreamwork. Amethyst, Obsidian and mugwort honour the depths of the sea.",
    shadow: "Escapism, and dissolving into others.",
  },
};
