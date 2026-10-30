// Chiron in each sign: the wound that teaches, and the healer it makes of
// you. Chiron's orbit is very uneven: it spends about eight years in Aries
// and Pisces and under two in Libra, so its sign is shared by a cohort and
// its house and aspects make it personal. Discovered in 1977; modern
// astrology only, named for the centaur healer of Greek myth.

import type { ZodiacSign } from '../../signs.ts';
import type { Interpretation } from '../types.ts';

export const CHIRON_IN_SIGN: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "Chiron in Aries points to a tender place around your right to exist, act and take up space. Healing comes as you learn courage, and you can help others find theirs.",
    detailed:
      "In myth Chiron was the wise centaur, teacher of heroes, who could heal others but not his own wound. In the chart he points to a sore place that becomes a source of wisdom. In Aries the sore place is identity and self-assertion: you may have felt, early on, that being yourself or being angry was dangerous, or that you had to fight simply to be allowed. Some people with this placement doubt their right to be here at all; others over-prove it.\n\nThe healing is learning to act from your own centre, to be brave without armour, and to be angry in clean, honest ways. As you do, you often become someone who helps others find their courage: a coach, advocate or teacher of confidence.\n\nChiron stayed in Aries for years at a time (around 1968 to 1977 and 2018 to 2027), so many people share it. Its house shows where the wound and the gift live in your life.",
    magic: "Courage and self-blessing magic is healing for you: a daily candle lit for your own life, a self-dedication rite, and protection spells for your right to take up space. Carnelian, Bloodstone and nettle support the work; Asclepius, the healer Chiron taught, is an old patron for this road.",
    shadow: "Self-doubt, or over-fighting to prove your right to exist.",
  },
  Taurus: {
    simple: "Chiron in Taurus points to a tender place around worth, security and the body. Healing comes as you learn to feel safe and valuable, and you help others do the same.",
    detailed:
      "With Chiron in Taurus the sore place is security and self-worth: perhaps scarcity, a difficult relationship with the body or food, or a feeling that your value depends on what you have or produce. You may hold on tightly to comfort, or feel you never quite have enough.\n\nThe healing is learning that your worth is inherent, that the body is a home rather than a problem, and that safety can be built from within. People with this placement often become gifted at helping others with money, body image or grounding.\n\nChiron was in Taurus around 1976 to 1983 (and returns around 2026 to 2034). Its house shows where this work lives for you.",
    magic: "Grounding and body magic is healing for you: herbal baths, gardening as prayer, prosperity spells done from gratitude rather than fear, and self-love rituals. Rose Quartz, Smoky Quartz and patchouli steady and comfort.",
    shadow: "Scarcity fear, and difficulty receiving pleasure or plenty.",
  },
  Gemini: {
    simple: "Chiron in Gemini points to a tender place around your voice, mind and learning. Healing comes as you trust your intelligence, and you become a gifted communicator.",
    detailed:
      "With Chiron in Gemini the sore place is the mind and the voice: perhaps you felt stupid at school, were not listened to, or had a difficult relationship with a sibling. You may doubt your intelligence or over-talk to prove it.\n\nThe healing is learning that your way of thinking is valid and valuable, and finding your own voice. People with this placement often become excellent teachers, writers and translators for those who struggle to be understood.\n\nChiron was in Gemini around 1983 to 1988. Look to its house for the part of life where you most fear being misunderstood, and where your words can most heal.",
    magic: "Word and voice magic is healing for you: journaling, speaking affirmations aloud, writing letters you may never send, and blessing your study space. Blue Lace Agate, Fluorite and lavender support a clear, kind voice.",
    shadow: "Self-doubt about your mind, and fear of speaking.",
  },
  Cancer: {
    simple: "Chiron in Cancer points to a tender place around home, family and being cared for. Healing comes as you learn to nurture yourself, and you become a true carer.",
    detailed:
      "With Chiron in Cancer the sore place is belonging and nurture: perhaps a family that could not care for you as you needed, a home that did not feel safe, or a feeling of being emotionally alone. You may give care easily but struggle to receive it.\n\nThe healing is learning to mother yourself, building a home that holds you and letting others in. People with this placement often become deeply compassionate carers, therapists and keepers of chosen family.\n\nChiron was in Cancer around 1988 to 1991. Its house shows which room of your life most needs mothering, by you.",
    magic: "Hearth and moon magic is healing for you: moon water baths, ancestor healing, home blessings and kitchen magic. Moonstone, Rose Quartz and Lemon Balm comfort and soothe.",
    shadow: "Fear of abandonment, and caring for everyone except yourself.",
  },
  Leo: {
    simple: "Chiron in Leo points to a tender place around being seen, loved and creative. Healing comes as you learn to shine for yourself, and you help others find their light.",
    detailed:
      "With Chiron in Leo the sore place is self-expression and recognition: perhaps you felt unseen or unappreciated as a child, or that play and joy were not safe. You may hide your light, or need constant reassurance that you matter.\n\nThe healing is learning that you are worthy of love and attention as you are, and finding joy in creating for its own sake. People with this placement often become generous mentors who help others shine.\n\nChiron was in Leo around 1991 to 1993. Its house shows where you hide your light, and where you will one day help others find theirs.",
    magic: "Creative and solar magic is healing for you: art as devotion, confidence rituals, play as sacred practice, and celebrating yourself on your birthday. Sunstone, Citrine and Calendula support a warm heart.",
    shadow: "Hiding your light, or needing applause to feel real.",
  },
  Virgo: {
    simple: "Chiron in Virgo points to a tender place around being good enough, useful and well. Healing comes as you accept imperfection, and you become a gentle healer.",
    detailed:
      "With Chiron in Virgo the sore place is perfection and health: perhaps you felt you had to be perfect to be loved, or struggled with illness, anxiety or a body that did not cooperate. You may be harsh with yourself about small mistakes.\n\nThe healing is learning self-acceptance, kindness toward the body and the value of good enough. People with this placement often become skilled healers, herbalists and helpers who understand from the inside.\n\nChiron was in Virgo around 1993 to 1995. Its house shows where you are hardest on yourself, and where gentleness heals most.",
    magic: "Herbal and healing magic is your own medicine: herbal remedies (beside proper care), cleansing rituals, and self-acceptance spells. Amazonite, Moss Agate and Chamomile soothe the inner critic.",
    shadow: "Perfectionism, and anxiety about health or worth.",
  },
  Libra: {
    simple: "Chiron in Libra points to a tender place around relationship, fairness and balance. Healing comes as you learn to be whole on your own, and you become a wise partner.",
    detailed:
      "With Chiron in Libra the sore place is relationship: perhaps an early experience of unfairness, a parent's difficult marriage, or a fear of being alone. You may lose yourself in partners or keep the peace at your own cost.\n\nThe healing is learning to be whole on your own, to stand up for fairness to yourself, and to choose partnerships of equals. People with this placement often become gifted counsellors, mediators and advocates.\n\nChiron moved through Libra quickly, around 1995 to 1996 (and again around 1945 to 1946). Its house shows the kind of relationship where the old hurt and the new wisdom meet.",
    magic: "Relationship and balance magic heals you: self-love rituals, cord cutting from unhealthy bonds, and spells for justice. Rose Quartz, Lapis Lazuli and rose support a balanced heart.",
    shadow: "Codependence, and peacekeeping at your own cost.",
  },
  Scorpio: {
    simple: "Chiron in Scorpio points to a tender place around trust, intimacy and loss. Healing comes as you face the depths, and you become a guide through crisis.",
    detailed:
      "With Chiron in Scorpio the sore place is trust and power: perhaps early loss, betrayal or a crisis that taught you the world is not safe. You may guard yourself fiercely or test people before letting them close.\n\nThe healing is learning to trust again, to share power and to let go. People with this placement often become powerful healers, therapists and guides for others through grief and transformation.\n\nChiron was in Scorpio around 1996 to 1999. Its house shows where trust is hardest won and most precious.",
    magic: "Deep healing magic suits you: shadow work, grief rituals, cord cutting and protection. Obsidian, Rhodochrosite and Wormwood support the work; Persephone, who returned from the underworld, is a fitting companion.",
    shadow: "Distrust, and control as protection.",
  },
  Sagittarius: {
    simple: "Chiron in Sagittarius points to a tender place around faith, meaning and freedom. Healing comes as you find your own truth, and you become a wise teacher.",
    detailed:
      "With Chiron in Sagittarius the sore place is meaning and belief: perhaps a strict or broken faith, or a feeling that life has no meaning. You may search endlessly or reject every belief.\n\nThe healing is finding your own philosophy through experience, and holding it with humility. People with this placement often become teachers and guides who help others find meaning. Sagittarius is itself pictured as a centaur, and some ancient writers took the archer for Chiron, so astrologers often feel the link strongly here.\n\nChiron was in Sagittarius around 1999 to 2001. Its house shows where you are searching, and where your hard-won truth can guide others.",
    magic: "Seeking and devotional magic heals you: pilgrimage, study as devotion, and gratitude rituals. Turquoise, Lapis Lazuli and Sage support steady faith.",
    shadow: "Cynicism, and endless searching without arriving.",
  },
  Capricorn: {
    simple: "Chiron in Capricorn points to a tender place around success, authority and responsibility. Healing comes as you define success your own way, and you become a wise elder.",
    detailed:
      "With Chiron in Capricorn the sore place is achievement and authority: perhaps a demanding parent, early responsibility, or a feeling that you will never achieve enough. You may overwork or fear failure deeply.\n\nThe healing is learning that your worth is not in your achievements, and defining success on your own terms. People with this placement often become mentors and leaders who use authority with kindness.\n\nChiron was in Capricorn around 2001 to 2005. Its house shows where you push hardest, and where rest is part of the healing.",
    magic: "Structured, ancestral magic heals you: ancestor rituals, boundary charms, and spells for gentle, sustainable success. Onyx, Garnet and comfrey support steady healing.",
    shadow: "Fear of failure, and working to be worthy.",
  },
  Aquarius: {
    simple: "Chiron in Aquarius points to a tender place around belonging and being different. Healing comes as you embrace your uniqueness, and you help outsiders find their place.",
    detailed:
      "With Chiron in Aquarius the sore place is belonging: perhaps feeling like an outsider, rejected by groups, or too different to fit in. You may hide your uniqueness or push others away first.\n\nThe healing is embracing your difference and finding your true community. People with this placement often become champions for outsiders and builders of inclusive communities.\n\nChiron was in Aquarius around 2005 to 2011. Its house shows where you feel most like an outsider, and where you can make a place for others.",
    magic: "Communal and inventive magic heals you: group rituals, friendship spells, and rituals that honour your difference. Amethyst, Aquamarine and lavender support a clear, free heart.",
    shadow: "Isolation, and feeling like an outsider everywhere.",
  },
  Pisces: {
    simple: "Chiron in Pisces points to a tender place around boundaries, spirit and feeling everything. Healing comes as you learn to protect your sensitivity, and you become a spiritual healer.",
    detailed:
      "With Chiron in Pisces the sore place is sensitivity and boundaries: perhaps you absorbed others' pain early, felt overwhelmed by the world, or struggled to know where you end and others begin. You may escape or over-give.\n\nThe healing is learning to protect your sensitivity, to ground spiritual gifts, and to serve without dissolving. People with this placement often become compassionate healers, artists and spiritual guides.\n\nChiron was in Pisces for years at a time (around 1960 to 1968 and 2010 to 2019), so many people share it. Its house shows where your sensitivity is most exposed, and where it is most needed.",
    magic: "Dream and water magic heals you: cleansing baths, protection rituals for sensitive people, meditation and dreamwork. Amethyst, Black Tourmaline and mugwort support boundaries and vision.",
    shadow: "Overwhelm, escapism, and losing yourself in others' pain.",
  },
};
