// The lunar nodes in each sign. The nodes are where the Moon's path crosses
// the Sun's; they always sit opposite each other and move backwards through
// the zodiac, about eighteen months in each sign pair. Modern astrology
// reads the North Node as the direction of growth and the South Node as
// what comes easily from the past; medieval astrologers read the North as
// increasing (like Jupiter and Venus) and the South as diminishing (like
// Saturn and Mars); Jyotish knows them as Rahu and Ketu.

import type { ZodiacSign } from '../../signs.ts';
import type { Interpretation } from '../types.ts';

export const NORTH_NODE_IN_SIGN: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "With the North Node in Aries you grow by learning to stand on your own feet, choose for yourself and act with courage. Your comfort zone is keeping the peace for others.",
    detailed:
      "The North Node in Aries always pairs with the South Node in Libra. What comes easily to you is partnership, diplomacy, seeing the other side and adjusting yourself to keep things pleasant. Those are real gifts, but leaning on them can mean waiting for permission, deferring every decision, or losing track of what you want.\n\nThe growth direction is Aries: independence, initiative, healthy selfishness, honest anger, doing the brave thing first and asking afterwards. It can feel uncomfortable, even rude, at first. Over time it brings a clearer, stronger self who can then partner from a place of choice rather than need.\n\nIn medieval astrology the North Node was said to increase whatever it touches, and in Jyotish it is Rahu, a hungry, worldly force; both point to Aries matters growing in your life. Its house shows the area where this courage is most needed.",
    magic: "Courage and self-trust magic supports your path: a candle lit before each decision you make for yourself, a self-dedication rite, a crossroads working to choose your own road. Tuesdays and the new Moon, especially in Aries, suit you. Carnelian, Bloodstone and basil help.",
    shadow: "Swinging from people-pleasing to self-centredness without finding the middle.",
  },
  Taurus: {
    simple: "With the North Node in Taurus you grow by building steady, simple security and trusting your own values. Your comfort zone is crisis, intensity and other people's resources.",
    detailed:
      "The North Node in Taurus pairs with the South Node in Scorpio. What comes easily is depth, intensity, crisis management and merging with others' power or money. You may be drawn again and again to drama or transformation, even when calm would serve you better.\n\nThe growth direction is Taurus: patience, simplicity, earning your own way, enjoying the body and the senses, and building something slow and solid. Peace can feel boring at first. With time it becomes the ground you stand on.\n\nIts house shows where this steadiness is most needed. Venus, ruler of Taurus, is a good guide: its sign and house show what kind of security truly feeds you.",
    magic: "Slow, earthy magic supports your path: a prosperity jar fed weekly, gardening as devotion, and grounding rituals with your hands in soil. Fridays and the new Moon in Taurus suit you. Green Aventurine, Moss Agate and thyme are steadying allies.",
    shadow: "Clinging to crisis because calm feels unfamiliar.",
  },
  Gemini: {
    simple: "With the North Node in Gemini you grow by asking questions, listening and staying curious. Your comfort zone is already being sure you know the answer.",
    detailed:
      "The North Node in Gemini pairs with the South Node in Sagittarius. What comes easily is the big picture, strong beliefs, preaching and wandering off in search of meaning. You may be used to being the one with the answers.\n\nThe growth direction is Gemini: curiosity, local connection, listening, gathering facts, learning from neighbours and siblings, and holding opinions lightly. Over time this makes your wisdom grounded and your teaching real.\n\nIts house shows where curiosity is most needed. Mercury, ruler of Gemini, shows how your mind learns best.",
    magic: "Word and study magic supports your path: journaling, daily divination, letter spells, and blessing your local roads and neighbourhood. Wednesdays and the new Moon in Gemini suit you. Citrine, Fluorite and peppermint keep curiosity lively.",
    shadow: "Certainty that stops you listening.",
  },
  Cancer: {
    simple: "With the North Node in Cancer you grow by letting yourself feel, nurture and belong. Your comfort zone is work, status and staying in control.",
    detailed:
      "The North Node in Cancer pairs with the South Node in Capricorn. What comes easily is responsibility, ambition, discipline and holding it together. You may be very good at achieving and very unpractised at resting or needing.\n\nThe growth direction is Cancer: emotion, home, family, vulnerability and care, given and received. It can feel like weakness at first, and it turns out to be the thing that makes your achievements worth having.\n\nIts house shows where this tenderness is most needed. The Moon, ruler of Cancer, shows how you are best cared for.",
    magic: "Hearth and moon magic supports your path: home blessings, ancestor offerings, moon water, and kitchen spells for those you love. Mondays and the full Moon suit you. Moonstone, Rose Quartz and Lemon Balm soften and comfort.",
    shadow: "Hiding behind work to avoid feeling.",
  },
  Leo: {
    simple: "With the North Node in Leo you grow by shining, creating and following your heart. Your comfort zone is blending into the group.",
    detailed:
      "The North Node in Leo pairs with the South Node in Aquarius. What comes easily is detachment, group work, ideas and being one of many. You may be comfortable in the background, serving a cause or a crowd.\n\nThe growth direction is Leo: personal creativity, joy, romance, play and the courage to be seen as an individual. Standing out can feel exposing at first; over time it becomes your gift to the group.\n\nIts house shows where you are called to shine. The Sun, ruler of Leo, shows the heart you are growing into.",
    magic: "Solar and creative magic supports your path: art as devotion, confidence spells, and joyful celebration rituals. Sundays and the new Moon in Leo suit you. Sunstone, Citrine and Sunflower bring warmth and courage.",
    shadow: "Hiding in the crowd to avoid the risk of being seen.",
  },
  Virgo: {
    simple: "With the North Node in Virgo you grow by bringing your gifts down to earth through practical work and service. Your comfort zone is dreaming and drifting.",
    detailed:
      "The North Node in Virgo pairs with the South Node in Pisces. What comes easily is intuition, compassion, imagination and escape. You may be used to going with the flow, rescuing others or retreating into dreams.\n\nThe growth direction is Virgo: discernment, routines, health, skill, boundaries and real, useful service. Order can feel limiting at first; it turns out to be the vessel your gifts needed.\n\nIts house shows where this practicality is most needed. Mercury, ruler of Virgo, shows how you are best organised.",
    magic: "Practical, ordered magic supports your path: herbcraft, cleansing rituals, a daily devotional routine and a carefully kept grimoire. Wednesdays and the new Moon in Virgo suit you. Amazonite, Fluorite and fennel focus and steady.",
    shadow: "Drifting, and helping in ways that drain you.",
  },
  Libra: {
    simple: "With the North Node in Libra you grow by learning partnership, cooperation and fairness. Your comfort zone is doing everything alone.",
    detailed:
      "The North Node in Libra pairs with the South Node in Aries. What comes easily is independence, quick action, self-reliance and looking after yourself. You may be used to fighting your own battles and finding it hard to ask for help.\n\nThe growth direction is Libra: partnership, listening, compromise, beauty and diplomacy. Considering others can feel like losing yourself at first; it becomes a deeper kind of strength.\n\nIts house shows where cooperation is most needed. Venus, ruler of Libra, shows how you relate best.",
    magic: "Relationship and balance magic supports your path: sweetening spells, partnership blessings and rituals for harmony. Fridays and the new Moon in Libra suit you. Rose Quartz, Lapis Lazuli and rose support the work.",
    shadow: "Going it alone out of habit, not choice.",
  },
  Scorpio: {
    simple: "With the North Node in Scorpio you grow by letting go, sharing deeply and embracing change. Your comfort zone is security and things staying the same.",
    detailed:
      "The North Node in Scorpio pairs with the South Node in Taurus. What comes easily is stability, comfort, self-reliance and holding on. You may be used to building security and resisting change.\n\nThe growth direction is Scorpio: intimacy, shared resources, transformation, depth and letting go of what is finished. Change can feel like loss at first; it turns out to be rebirth.\n\nIts house shows where transformation is most needed. Mars and Pluto, the rulers of Scorpio, show how you meet change.",
    magic: "Transformation magic supports your path: shadow work, release rituals at the waning Moon, and divination. Tuesdays and the dark Moon suit you. Obsidian, Labradorite and Wormwood help.",
    shadow: "Holding on to comfort when it is time to change.",
  },
  Sagittarius: {
    simple: "With the North Node in Sagittarius you grow by seeking meaning, trusting your intuition and exploring wide horizons. Your comfort zone is endless information and chatter.",
    detailed:
      "The North Node in Sagittarius pairs with the South Node in Gemini. What comes easily is collecting facts, talking, adapting and staying busy. You may be used to knowing a little about everything.\n\nThe growth direction is Sagittarius: faith, philosophy, travel, higher learning and trusting the big picture. Committing to a belief can feel risky at first; it gives your life direction.\n\nIts house shows where meaning is most needed. Jupiter, ruler of Sagittarius, shows how you grow.",
    magic: "Seeking and devotional magic supports your path: pilgrimage, travel blessings, and study as devotion. Thursdays and the new Moon in Sagittarius suit you. Turquoise, Lapis Lazuli and Sage support the search.",
    shadow: "Busyness that keeps meaning out of reach.",
  },
  Capricorn: {
    simple: "With the North Node in Capricorn you grow by taking responsibility, building structure and pursuing goals. Your comfort zone is the safety of home and feeling.",
    detailed:
      "The North Node in Capricorn pairs with the South Node in Cancer. What comes easily is nurturing, emotional sensitivity and retreating to the safety of home and family. You may be used to being looked after or looking after others.\n\nThe growth direction is Capricorn: ambition, discipline, public responsibility and standing on your own authority. Stepping into the world can feel cold at first; it becomes your own solid ground.\n\nIts house shows where responsibility is most needed. Saturn, ruler of Capricorn, shows how you build.",
    magic: "Structured, long-term magic supports your path: career spells, ancestor rites for guidance, and boundary charms. Saturdays and the new Moon in Capricorn suit you. Onyx, Garnet and cypress steady the climb.",
    shadow: "Retreating into the familiar when the world calls.",
  },
  Aquarius: {
    simple: "With the North Node in Aquarius you grow by joining with others for a shared vision. Your comfort zone is being the star of your own story.",
    detailed:
      "The North Node in Aquarius pairs with the South Node in Leo. What comes easily is self-expression, creativity, drama and needing to be seen. You may be used to being the centre.\n\nThe growth direction is Aquarius: friendship, community, ideals and working for something bigger than yourself. Sharing the stage can feel like losing yourself at first; it turns out to be belonging.\n\nIts house shows where community is most needed. Saturn and Uranus, the rulers of Aquarius, show how you connect.",
    magic: "Communal magic supports your path: group rituals, coven work, and spells for a cause. Saturdays and the new Moon in Aquarius suit you. Amethyst, Aquamarine and lavender help.",
    shadow: "Needing the spotlight when the group needs you.",
  },
  Pisces: {
    simple: "With the North Node in Pisces you grow by trusting, surrendering and opening to spirit. Your comfort zone is control, analysis and keeping busy.",
    detailed:
      "The North Node in Pisces pairs with the South Node in Virgo. What comes easily is order, analysis, service and criticism. You may be used to fixing, worrying and staying in control.\n\nThe growth direction is Pisces: faith, compassion, imagination, rest and surrender to something greater. Letting go can feel frightening at first; it becomes peace.\n\nIts house shows where surrender is most needed. Jupiter and Neptune, the rulers of Pisces, show how you open to spirit.",
    magic: "Dream and devotional magic supports your path: meditation, dreamwork, prayer and water rituals. Thursdays and the new Moon in Pisces suit you. Amethyst, Aquamarine and mugwort help.",
    shadow: "Worry and over-control in place of trust.",
  },
};

export const SOUTH_NODE_IN_SIGN: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "With the South Node in Aries, independence and quick action come easily to you, perhaps too easily. The North Node in Libra asks you to grow into partnership.",
    detailed:
      "The South Node shows a familiar groove: talents you arrive with, and habits that can hold you back if you lean on them alone. In Aries that groove is self-reliance, courage and acting first. You can look after yourself, fight your own battles and start things on your own.\n\nThe risk is staying there: impatience, going it alone, and not letting others in. Many astrologers read the South Node as what you are here to share and slowly release, not to discard. Your courage is a gift; the North Node in Libra asks you to offer it within partnership.",
    magic: "Release and gratitude magic suits the South Node: thank the old strength at the waning Moon, then turn toward the new. Bloodstone and rose together honour courage and partnership.",
    shadow: "Fighting alone out of habit.",
  },
  Taurus: {
    simple: "With the South Node in Taurus, security and steadiness come easily to you. The North Node in Scorpio asks you to grow into change and intimacy.",
    detailed:
      "With the South Node in Taurus the familiar groove is comfort, stability, self-sufficiency and holding on. You know how to build security and enjoy simple pleasures, and those are real gifts.\n\nThe risk is resisting change, accumulating for safety, and staying in what is comfortable after it has stopped feeding you. The North Node in Scorpio asks you to share, merge and let go, so that what you have built can be transformed.",
    magic: "Release magic suits this node: give away what you no longer need at the waning Moon, with thanks. Smoky Quartz and Obsidian together honour holding and letting go.",
    shadow: "Holding on past the time.",
  },
  Gemini: {
    simple: "With the South Node in Gemini, quick thinking and talking come easily to you. The North Node in Sagittarius asks you to grow into faith and meaning.",
    detailed:
      "With the South Node in Gemini the familiar groove is information, communication, adaptability and staying busy. You can learn fast and connect easily.\n\nThe risk is scattering, collecting facts without wisdom, and talking around the big questions. The North Node in Sagittarius asks you to choose a direction, trust intuition and seek meaning.",
    magic: "Clearing magic suits this node: a waning Moon ritual to let go of mental clutter, followed by quiet contemplation. Fluorite and Sage help.",
    shadow: "Busyness that avoids depth.",
  },
  Cancer: {
    simple: "With the South Node in Cancer, nurturing and emotional sensitivity come easily to you. The North Node in Capricorn asks you to grow into responsibility in the world.",
    detailed:
      "With the South Node in Cancer the familiar groove is family, home, feeling and care. You know how to nurture and how to retreat into safety.\n\nThe risk is staying in the shell, depending on family, or avoiding the wider world. The North Node in Capricorn asks you to step into your own authority and build something lasting outside the home.",
    magic: "Ancestral thanksgiving suits this node: honour your family's gifts at the ancestor altar, then ask for their blessing on your own road. Moonstone and Onyx together hold both.",
    shadow: "Retreating into the familiar nest.",
  },
  Leo: {
    simple: "With the South Node in Leo, self-expression and confidence come easily to you. The North Node in Aquarius asks you to grow into community.",
    detailed:
      "With the South Node in Leo the familiar groove is creativity, warmth, leadership and being seen. You know how to shine.\n\nThe risk is needing the spotlight, pride and making everything personal. The North Node in Aquarius asks you to use your light for the group and to find belonging as one among many.",
    magic: "Gratitude and sharing magic suits this node: a creative offering made for your community. Sunstone and Amethyst together balance heart and vision.",
    shadow: "Needing to be the centre.",
  },
  Virgo: {
    simple: "With the South Node in Virgo, order, analysis and service come easily to you. The North Node in Pisces asks you to grow into trust and surrender.",
    detailed:
      "With the South Node in Virgo the familiar groove is skill, detail, health routines and being useful. You know how to fix things and help.\n\nThe risk is worry, perfectionism and criticism. The North Node in Pisces asks you to let go, trust life and open to spirit.",
    magic: "Release magic suits this node: let go of a list of worries at the waning Moon, then meditate. Amazonite and Amethyst together help.",
    shadow: "Worry in place of faith.",
  },
  Libra: {
    simple: "With the South Node in Libra, partnership and diplomacy come easily to you. The North Node in Aries asks you to grow into independence.",
    detailed:
      "With the South Node in Libra the familiar groove is harmony, partnership, charm and considering others. You know how to keep the peace.\n\nThe risk is losing yourself in others, indecision and people-pleasing. The North Node in Aries asks you to know your own mind and act on it.",
    magic: "Balancing magic suits this node: thank your gift for harmony, then light a red candle for your own will. Rose Quartz and Carnelian together help.",
    shadow: "People-pleasing at your own cost.",
  },
  Scorpio: {
    simple: "With the South Node in Scorpio, depth, intensity and crisis come easily to you. The North Node in Taurus asks you to grow into peace and simplicity.",
    detailed:
      "With the South Node in Scorpio the familiar groove is intensity, crisis, intimacy and transformation. You know how to survive and go deep.\n\nThe risk is drama, control and being drawn to crisis. The North Node in Taurus asks you to build calm, simple security and to enjoy life.",
    magic: "Grounding magic suits this node: after shadow work, always ground with earth: soil, bread, a long walk. Obsidian and Green Aventurine together help.",
    shadow: "Seeking intensity when peace would heal.",
  },
  Sagittarius: {
    simple: "With the South Node in Sagittarius, faith, adventure and big ideas come easily to you. The North Node in Gemini asks you to grow into curiosity and listening.",
    detailed:
      "With the South Node in Sagittarius the familiar groove is belief, philosophy, travel and freedom. You know how to inspire.\n\nThe risk is preaching, restlessness and certainty. The North Node in Gemini asks you to listen, ask questions and stay curious about the people near you.",
    magic: "Humility magic suits this node: honour your teachers, then learn something new from someone near you. Turquoise and Citrine together help.",
    shadow: "Certainty that does not listen.",
  },
  Capricorn: {
    simple: "With the South Node in Capricorn, ambition and responsibility come easily to you. The North Node in Cancer asks you to grow into tenderness.",
    detailed:
      "With the South Node in Capricorn the familiar groove is achievement, discipline, control and duty. You know how to work and lead.\n\nThe risk is coldness, overwork and hiding feeling behind responsibility. The North Node in Cancer asks you to come home to your heart and let yourself be cared for.",
    magic: "Hearth magic suits this node: a home blessing and a nourishing meal made as ritual. Onyx and Moonstone together help.",
    shadow: "Work as a shield against feeling.",
  },
  Aquarius: {
    simple: "With the South Node in Aquarius, detachment, ideas and group work come easily to you. The North Node in Leo asks you to grow into personal expression.",
    detailed:
      "With the South Node in Aquarius the familiar groove is objectivity, friendship and the collective. You know how to be part of a group.\n\nThe risk is hiding in the crowd and detaching from personal feeling. The North Node in Leo asks you to create, love and shine as yourself.",
    magic: "Creative magic suits this node: make something just for joy, and offer it. Amethyst and Sunstone together help.",
    shadow: "Detachment from your own heart.",
  },
  Pisces: {
    simple: "With the South Node in Pisces, intuition and compassion come easily to you. The North Node in Virgo asks you to grow into practical service.",
    detailed:
      "With the South Node in Pisces the familiar groove is spirituality, imagination, empathy and escape. You know how to dream and feel.\n\nThe risk is drifting, confusion and losing yourself in others. The North Node in Virgo asks you to ground your gifts in daily practice and useful work.",
    magic: "Grounding magic suits this node: after dreamwork, write it down and act on one small thing. Amethyst and Amazonite together help.",
    shadow: "Drifting instead of doing.",
  },
};
