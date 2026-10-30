// Saturn in each sign: where life asks for discipline, patience and
// maturity, and what you master slowly. Saturn spends about two and a half
// years in each sign, so a generation-sized group shares it. Domicile in
// Capricorn and Aquarius, exalted in Libra; detriment in Cancer and Leo,
// fall in Aries.

import type { ZodiacSign } from '../../signs.ts';
import type { Interpretation } from '../types.ts';

export const SATURN_IN_SIGN: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "With Saturn in Aries you learn to act with patience and earned courage. Self-assertion may feel hard at first, and becomes a real strength with practice.",
    detailed:
      "Saturn is in fall in Aries, opposite its exaltation in Libra. Traditional astrologers read this as Saturn's caution at odds with Aries's urge to act. In life it can show as hesitancy about putting yourself first, or the opposite: a defensive, push-through will that never rests. Early on, starting things may feel blocked, or you may have learned that your anger or independence was not welcome.\n\nThe lesson is disciplined courage: learning to act from a settled centre, take initiative responsibly and lead without either freezing or forcing. Over time, people with this placement often become strong, self-made leaders who know exactly what it costs to begin.\n\nSaturn takes about two and a half years to cross a sign, so your whole age group shares this. Its house shows where you meet the lesson. Your Saturn return, around twenty-nine, is often a time when this placement's work comes due.",
    magic: "Courage built slowly is your Saturn magic: a candle lit for a few minutes each day before a hard task, protection charms for independence, and banishing spells for fear. Saturdays and Tuesdays suit you. Bloodstone, Hematite, Onyx and nettle steady the will.",
    shadow: "Frustration, blocked anger, and pushing on alone when you could ask for help.",
  },
  Taurus: {
    simple: "With Saturn in Taurus you learn the slow building of security, worth and resources. Money and comfort may be hard-won, and you build them to last.",
    detailed:
      "Saturn in Taurus asks you to take the material world seriously. You may have grown up with scarcity or with a strong fear of it, and security can feel like something you must earn with effort. Over time you tend to become patient, practical and wise about money, land, the body and what really has value.\n\nThe lesson is grounded self-worth: knowing your value is not the same as your bank balance, and building stability without hoarding or denying yourself pleasure. People with this placement often become excellent stewards of resources and builders of lasting things.\n\nEveryone born in the same two or three years carries it, so the personal story is in its house: the part of life where you learn what security really means. Venus rules Taurus, so your Venus has much to say about how you learn to enjoy what you build.",
    magic: "Slow prosperity and grounding magic suit your Saturn: a money jar added to every Saturday, a garden tended as a long-term spell, and rituals to bless and protect what you own. Saturdays and Fridays suit you. Smoky Quartz, Jet, Pyrite and patchouli help build steady worth.",
    shadow: "Scarcity thinking, hoarding, and denying yourself pleasure.",
  },
  Gemini: {
    simple: "With Saturn in Gemini you learn to think, speak and study with depth and care. Communication may feel like hard work early, and becomes your mastery.",
    detailed:
      "Saturn in Gemini brings seriousness to the mind. You may have felt slow or unheard as a child, struggled with school, or had a sibling or early learning situation that was difficult. In response you often become careful, precise and thorough in how you think and speak, and you may master a subject or craft of words over many years.\n\nThe lesson is disciplined thought: learning to focus, to finish, and to trust your mind. People with this placement often become excellent writers, teachers, researchers or editors precisely because nothing came easily.\n\nYour schoolmates share it; its house shows where in life your mind is asked to slow down and go deep. Mercury rules Gemini, so your Mercury shows how this work is done.",
    magic: "Structured word magic suits your Saturn: a daily writing practice as ritual, carefully worded petitions, binding spells for gossip, and study blessings before exams. Saturdays and Wednesdays suit you. Fluorite, Sodalite, rosemary and Clear Quartz support focus and memory.",
    shadow: "Self-doubt about your mind, rigid thinking, and fear of speaking.",
  },
  Cancer: {
    simple: "With Saturn in Cancer you learn to build emotional security and a true home. Feelings and family may have felt heavy early, and you become a steady keeper of both.",
    detailed:
      "Saturn is in detriment in Cancer, opposite its home in Capricorn. Traditionally this means Saturn's coolness sits uneasily in the sign of nurture. In life it can show as early experiences of emotional reserve, responsibility for family, or a home that felt more duty than comfort. You may have learned to hide your needs or to look after others before you were ready.\n\nThe lesson is building your own emotional foundation: learning to care for yourself, create a home that truly holds you, and let others in. Over time people with this placement often become deeply reliable protectors and wise keepers of family history.\n\nSaturn returns to this place around twenty-nine and again near fifty-eight, and many people with Saturn in Cancer find those years are when they finally build the home they needed. The Moon rules Cancer, so your Moon is part of how you heal it.",
    magic: "Ancestor and hearth magic is your Saturn work: ancestor altars, family healing rituals, home protection, and slow, nourishing kitchen spells. Saturdays and Mondays, and the waning Moon for release, suit you. Moonstone, Jet, Smoky Quartz and comfrey support emotional healing and steady roots.",
    shadow: "Emotional coldness, fear of dependency, and duty in place of tenderness.",
  },
  Leo: {
    simple: "With Saturn in Leo you learn to shine with confidence and authentic self-expression. Being seen may feel risky at first, and you grow into real presence.",
    detailed:
      "Saturn is in detriment in Leo, opposite its home in Aquarius. Traditionally this means Saturn's restraint is uncomfortable in the sign of joy and display. In life it can show as shyness about being seen, a feeling that play and creativity had to be earned, or a strong need for recognition paired with fear of it.\n\nThe lesson is authentic confidence: learning to express yourself, create, play and lead without needing applause or hiding from it. People with this placement often become serious, dedicated artists, teachers or leaders, whose presence is earned and steady.\n\nIt is shared by a cohort born across two or three years; its house shows the stage on which you learn to be seen. The Sun rules Leo, so your Sun shows where the work of shining is done.",
    magic: "Confidence built slowly is your Saturn magic: a creative practice kept as devotion, a self-worth spell renewed each Sunday, and rituals for courage to be seen. Saturdays and Sundays suit you. Sunstone, Tiger Eye, Onyx and Calendula help you hold your light.",
    shadow: "Fear of being seen, rigid pride, and joy kept on a short leash.",
  },
  Virgo: {
    simple: "With Saturn in Virgo you learn mastery through work, health and service. You hold high standards and become truly skilled with time.",
    detailed:
      "Saturn in Virgo asks for precision and discipline in daily life. You may feel a strong pressure to do things perfectly, be useful, or keep your body and routines under control. Health and work can be areas of anxiety, especially early, and the inner critic can be loud.\n\nThe lesson is skilled, kind service: learning that good enough is often good, that routine can support rather than imprison you, and that your worth is not only in your usefulness. People with this placement often become masters of a craft and excellent healers or organisers.\n\nEveryone born near you shares it, so look to its house for the part of life where your standards are highest. Mercury rules Virgo, so your Mercury shows how the work is done.",
    magic: "Ordered, practical magic suits your Saturn: herbal remedies made with care, cleansing rituals, routine devotions, and spells for health (beside proper care). Saturdays and Wednesdays suit you. Amazonite, Smoky Quartz, rosemary and Chamomile help soften perfectionism.",
    shadow: "Perfectionism, anxiety about health, and harsh self-criticism.",
  },
  Libra: {
    simple: "With Saturn in Libra, where it is exalted, you learn fairness, commitment and balance in relationships. Partnership is serious work, and it can become your strength.",
    detailed:
      "Saturn is exalted in Libra, which traditional astrologers read as Saturn's most honoured place: law and justice in their finest form. You take relationships, contracts and fairness seriously, and you may be drawn to law, mediation, design or diplomacy. Partnerships can be a place of lessons, delays or responsibilities, especially early.\n\nThe lesson is mature partnership: learning to commit, to be fair to yourself as well as others, and to build relationships on respect and clear agreements. Over time people with this placement often become wise, steady partners and just leaders.\n\nA whole cohort shares it; its house shows where your commitments are tested and proved. Venus rules Libra, so your Venus shows how love and law meet in you.",
    magic: "Justice and commitment magic suits your Saturn: spells for a fair outcome, partnership blessings, binding agreements written and sealed, and rituals for balance. Saturdays and Fridays suit you. Lapis Lazuli, Jade, Vervain and Rose Quartz support just, lasting bonds; Maat's feather of truth is a good image for the altar.",
    shadow: "Fear of commitment or rigid duty in it, and judging by rules rather than hearts.",
  },
  Scorpio: {
    simple: "With Saturn in Scorpio you learn to face depths, power and transformation with courage. Trust and intimacy may come slowly, and become profound.",
    detailed:
      "Saturn in Scorpio brings seriousness to the hidden places: intimacy, shared resources, death, sexuality, power and control. You may have met loss, secrets or crisis early, and learned to guard yourself carefully. Trust is hard-won.\n\nThe lesson is mastery of the depths: learning to face fear, share power, let go and transform. People with this placement often become strong, wise guides through crisis, and gifted researchers, therapists or financial stewards.\n\nYour generation shares it, and its house shows where you will be asked to face what frightens you most, and where you grow strongest for having done so. Mars and Pluto, the rulers of Scorpio, colour this Saturn.",
    magic: "Deep, slow transformation magic suits your Saturn: shadow work, ancestor healing, banishing and protection, and rituals for grief. Saturdays and Tuesdays, and the dark Moon, suit you. Obsidian, Jet, Smoky Quartz and cypress support the work; Hekate and Hades are old guardians of these thresholds.",
    shadow: "Control, distrust, and fear of vulnerability.",
  },
  Sagittarius: {
    simple: "With Saturn in Sagittarius you learn to build a faith and philosophy that is truly your own. Belief is serious work, and you earn your wisdom.",
    detailed:
      "Saturn in Sagittarius asks you to take meaning seriously. You may have grown up with strict beliefs, doubts, or a sense that wisdom and freedom must be earned. Higher education, travel or religion can be places of effort, delay or deep commitment.\n\nThe lesson is a lived philosophy: building your own beliefs through study and experience, and holding them with humility. People with this placement often become serious teachers, scholars, lawyers or spiritual guides whose wisdom is tested.\n\nThose born in the same few years share it; its house shows where your beliefs are tested by life. Jupiter rules Sagittarius, so your Jupiter shows how your faith can grow.",
    magic: "Study and devotion suit your Saturn: a disciplined reading or meditation practice, pilgrimage, and long-term devotions to a god of your path. Saturdays and Thursdays suit you. Lapis Lazuli, Sodalite, Sage and Juniper support steady faith.",
    shadow: "Dogmatism, cynicism, and fear of believing anything.",
  },
  Capricorn: {
    simple: "With Saturn in Capricorn, its own sign, you learn mastery through ambition, discipline and responsibility. You are built for the long climb.",
    detailed:
      "Saturn is at home in Capricorn, and here it is strong and steady. You understand structure, time, effort and consequence, and you often carry responsibility early. You can be ambitious, patient and deeply reliable, and you build things that last: careers, institutions, families.\n\nThe lesson is wise authority: learning to lead without coldness, to rest without guilt, and to measure success by more than status. Traditional astrologers read Saturn in its own sign as able to deliver its gifts of endurance and mastery.\n\nYour cohort shares it; its house shows the mountain you are climbing. As Saturn rules this sign, its house and aspects tell the story.",
    magic: "Structured, long-term magic is natural for you: career and success spells over a season, boundary charms, ancestor rites, and devotions on Saturdays. The waning Moon helps clear obstacles. Onyx, Garnet, Jet and cypress are allies; Saturn himself, god of time and the harvest, is the old patron.",
    shadow: "Workaholism, rigidity, and coldness in the name of duty.",
  },
  Aquarius: {
    simple: "With Saturn in Aquarius, its traditional home, you learn to build communities and systems that serve everyone. You bring structure to new ideas.",
    detailed:
      "Saturn is at home in Aquarius, its day house, and here it is the builder of the future: principled, systematic, community-minded. You take friendship, groups and social responsibility seriously, and you can turn ideals into working structures.\n\nThe lesson is belonging without losing yourself: learning to work with others, to be part of a group while staying true to your vision, and to let your principles have warmth. People with this placement often become strong organisers, scientists, reformers or community builders.\n\nYour cohort shares this; its house shows the group or system you are here to help build. Uranus, the modern ruler of Aquarius, adds its own story.",
    magic: "Communal and systematic magic suits your Saturn: group rituals, coven structure, sigils and planetary squares, and long-term spells for a cause. Saturdays suit you. Amethyst, Hematite, Labradorite and Clear Quartz support steady vision.",
    shadow: "Emotional distance, rigid ideals, and loneliness in a crowd.",
  },
  Pisces: {
    simple: "With Saturn in Pisces you learn to give shape to dreams, compassion and spirit. Boundaries may be hard, and become a gift with practice.",
    detailed:
      "Saturn in Pisces asks you to bring structure to what is fluid. You may feel the pull between duty and dreams, between the practical world and spiritual longing. Boundaries, both emotional and physical, may be difficult, and you may have absorbed others' sorrows early.\n\nThe lesson is grounded compassion: learning to serve without losing yourself, to create with discipline, and to build a spiritual practice that holds you. People with this placement often become dedicated artists, healers or mystics whose work is both deep and real.\n\nA cohort born across two or three years shares it; its house shows where your dreams most need a container. Jupiter and Neptune, the rulers of Pisces, colour this Saturn.",
    magic: "Disciplined spiritual practice is your Saturn magic: daily meditation, dream journals, cleansing baths, and protective rituals for sensitive people. Saturdays and Mondays suit you. Amethyst, Smoky Quartz, Black Tourmaline and mugwort support boundaries and vision.",
    shadow: "Escapism, martyrdom, and fear of the unknown.",
  },
};
