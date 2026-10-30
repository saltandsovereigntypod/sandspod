// The chart's balance. Key: keys.balance(kind, what):
//   'dominant|fire' … 'missing|water'            the elements
//   'dominant|cardinal' … 'missing|mutable'      the modalities
//   'dominant|above' / below / east / west       the hemispheres
//   'dominant|quadrant-1' … 'quadrant-4'         the quadrants
//   'dominant|yang' / 'dominant|yin'             polarity
// Complete.

import type { InterpretationTable } from './types.ts';

export const ELEMENT_READINGS: InterpretationTable = {
  'dominant|fire': {
    simple: 'Mostly fire: you are enthusiastic, warm and quick to act. You run on inspiration and need something to believe in.',
    detailed:
      'Fire (Aries, Leo, Sagittarius) is the element of spirit, will and inspiration. A fire-heavy chart lives by enthusiasm: you act first, think in visions, and light others up. You recover fast and hate being bored.\n\nThe ancient temperament was choleric: hot and dry. The care is burning out, or burning others; fire needs fuel (rest, food, earth) and something to warm rather than scorch. Earth and water in your chart, or in the people you love, keep the flame steady.',
    magic: 'Fire is your natural element: candle magic, bonfire rites, sun work, courage and protection spells. Work in Aries, Leo or Sagittarius seasons and at noon.',
  },
  'dominant|earth': {
    simple: 'Mostly earth: you are practical, patient and grounded. You trust what you can touch and build things that last.',
    detailed:
      'Earth (Taurus, Virgo, Capricorn) is the element of form, the body and the material world. An earth-heavy chart is realistic, reliable and sensual, good with money, craft and care of the body.\n\nThe ancient temperament was melancholic: cold and dry. The care is getting stuck: routine can become a rut and caution a cage. Fire and air bring vision and change.',
    magic: 'Earth is your element: herbs, stones, gardens, money and home magic, charm bags and slow spells over many days. Work outdoors and with your hands.',
  },
  'dominant|air': {
    simple: 'Mostly air: you are curious, social and quick-minded. Ideas, words and people are your world.',
    detailed:
      'Air (Gemini, Libra, Aquarius) is the element of mind, speech and connection. An air-heavy chart thinks, talks, links people and sees patterns. You can be fair and detached when others are swept away.\n\nThe ancient temperament was sanguine: hot and moist. The care is living in your head: feelings and the body can be neglected. Water and earth bring depth and grounding.',
    magic: 'Air is your element: word magic, petitions, sigils, incense, breath work and divination. Work at dawn and in the wind.',
  },
  'dominant|water': {
    simple: 'Mostly water: you are feeling, intuitive and deep. You sense what others miss and bond strongly.',
    detailed:
      'Water (Cancer, Scorpio, Pisces) is the element of feeling, memory and the unseen. A water-heavy chart is empathic, imaginative and loyal, attuned to atmosphere.\n\nThe ancient temperament was phlegmatic: cold and moist. The care is being overwhelmed by feeling or absorbing others\' moods. Fire and air bring perspective and lift.',
    magic: 'Water is your element: moon water, baths, scrying, dreamwork, healing and psychic work. Work at night and by water.',
  },
  'missing|fire': {
    simple: 'No fire: enthusiasm and confidence may not come naturally, and you may admire, or be drawn to, people who have them.',
    detailed:
      'With no planets in fire signs, spontaneity and self-belief may feel like things you have to work at. You may be cautious about putting yourself forward, or find energy low.\n\nA missing element is often over-compensated: some people with no fire become very driven. Others find fire in partners and friends. Look at Mars and the Sun by house for where fire still lives in you.',
    magic: 'Build fire on purpose: candle magic, sun salutations, red and gold, bonfires at the fire festivals, and courage spells.',
  },
  'missing|earth': {
    simple: 'No earth: practical matters and the body may be harder for you, and you may long for stability.',
    detailed:
      'With no planets in earth signs, routine, money and the body\'s needs may feel unnatural. You might live in ideas, feelings or plans, and forget to eat.\n\nMany people compensate by becoming very organised; others draw earthy friends. Saturn and Venus by house show where you can build your ground.',
    magic: 'Build earth on purpose: gardening, stones in pockets, salt, bread-making, money jars and walking barefoot.',
  },
  'missing|air': {
    simple: 'No air: detachment and easy talk may not come naturally; you feel or act before you analyse.',
    detailed:
      'With no planets in air signs, stepping back to see objectively may be hard. You may struggle to put things into words, or prefer doing to discussing.\n\nSome people with no air become great readers and talkers to make up for it. Mercury\'s placement shows how your mind still works.',
    magic: 'Build air on purpose: journalling, incense and feathers, breath work, learning a new language, and speaking spells aloud.',
  },
  'missing|water': {
    simple: 'No water: feelings may be hard to read or express, and you may seek emotional depth in others.',
    detailed:
      'With no planets in water signs, emotions may feel unfamiliar or overwhelming when they come. You might intellectualise feelings or act them out.\n\nMany people with no water are drawn to watery partners or healing work. The Moon\'s house shows where your feelings live.',
    magic: 'Build water on purpose: ritual baths, moon water, tears allowed, scrying, and time by the sea or rivers.',
  },
  'dominant|cardinal': {
    simple: 'Mostly cardinal: you are a starter. You like to begin, lead and take action when things need to change.',
    detailed:
      'The cardinal signs (Aries, Cancer, Libra, Capricorn) begin each season. A cardinal-heavy chart initiates: you see what needs doing and start it, and you handle crises well.\n\nThe care is finishing: the thrill is in beginning, so projects may be left for others to complete.',
    magic: 'Cardinal energy suits beginnings: the equinoxes and solstices, new moons, and opening spells.',
  },
  'dominant|fixed': {
    simple: 'Mostly fixed: you are steady and determined. You sustain, protect and finish what you start.',
    detailed:
      'The fixed signs (Taurus, Leo, Scorpio, Aquarius) are the middle of each season. A fixed-heavy chart has staying power, loyalty and will.\n\nThe care is stubbornness: change can feel like a threat even when it is needed.',
    magic: 'Fixed energy suits binding, protection and long workings: the cross-quarter festivals (Imbolc, Beltane, Lammas, Samhain) and full moons.',
  },
  'dominant|mutable': {
    simple: 'Mostly mutable: you are adaptable and versatile. You adjust, learn and bridge between things.',
    detailed:
      'The mutable signs (Gemini, Virgo, Sagittarius, Pisces) end each season and prepare the next. A mutable-heavy chart is flexible, curious and good at change.\n\nThe care is scattering: so many options can make commitment hard.',
    magic: 'Mutable energy suits transition and adaptation: waning moons, the ends of seasons, and divination.',
  },
  'missing|cardinal': {
    simple: 'No cardinal: starting things may be hard. You may prefer to build on what others begin.',
    detailed:
      'With little or nothing in cardinal signs, initiating can feel awkward. You may wait for the right moment for too long.\n\nYou are often excellent at sustaining or adapting once things are under way. Deliberate small starts help.',
    magic: 'Practise beginnings: new-moon intentions kept short and acted on the next day.',
  },
  'missing|fixed': {
    simple: 'No fixed: staying with things may be hard. You may move on quickly.',
    detailed:
      'With little in fixed signs, persistence and stability may need to be built deliberately. You adapt and start easily but may struggle to stay.\n\nRoutines and commitments, kept small, give you the steadiness you lack.',
    magic: 'Practise steadiness: a spell worked every night for a lunar month.',
  },
  'missing|mutable': {
    simple: 'No mutable: adapting may be hard. You prefer a clear plan.',
    detailed:
      'With little in mutable signs, change can feel disruptive and flexibility uncomfortable.\n\nYour strength is clarity and will; learning to bend a little keeps you from breaking.',
    magic: 'Practise flexibility: divination before workings, and letting a spell change as you work it.',
  },
  'dominant|yang': {
    simple: 'Mostly yang (fire and air): outgoing, active and expressive.',
    detailed:
      'The yang or masculine signs (fire and air) reach outward. A yang-heavy chart is extroverted, initiating and expressive.\n\nThe care is listening and receiving.',
    magic: 'Yang magic: active, outward workings, sun and fire.',
  },
  'dominant|yin': {
    simple: 'Mostly yin (earth and water): receptive, inward and steady.',
    detailed:
      'The yin or feminine signs (earth and water) draw inward. A yin-heavy chart is reflective, receptive and nurturing.\n\nThe care is asserting yourself.',
    magic: 'Yin magic: receptive, inward workings, moon and earth.',
  },
  'dominant|above': {
    simple: 'Most planets above the horizon: your life tends to be outward, public and lived in the world.',
    detailed:
      'Planets in houses 7 to 12 are above the horizon (they were in the visible sky at birth). Many astrologers read a chart weighted this way as outward-facing: relationships, career, society and the wider world shape you.\n\nThe care is the inner life: make time to be private.',
    magic: 'Your magic often works through others and in public: group rites, career magic and community work.',
  },
  'dominant|below': {
    simple: 'Most planets below the horizon: your life tends to be inward, private and personal.',
    detailed:
      'Planets in houses 1 to 6 are below the horizon. A chart weighted this way is often read as private and self-developing: home, family, skills and inner life matter most, at least in the first half of life.\n\nThe gift is depth; the care is hiding.',
    magic: 'Your magic is often solitary and domestic: hearth, ancestors and personal practice.',
  },
  'dominant|east': {
    simple: 'Most planets on the eastern side: you shape your own life and act on your own initiative.',
    detailed:
      'The eastern half (houses 10 to 3, around the Ascendant) is read as self-directed: you make things happen and need independence.\n\nThe care is going it alone.',
    magic: 'Self-directed magic: personal workings, glamour and courage.',
  },
  'dominant|west': {
    simple: 'Most planets on the western side: your life is shaped through other people and relationships.',
    detailed:
      'The western half (houses 4 to 9, around the Descendant) is read as relational: you respond, cooperate and grow through others.\n\nThe care is your own direction.',
    magic: 'Relational magic: partnership spells, coven work and devotion.',
  },
  'dominant|quadrant-1': {
    simple: 'Most planets in the first quadrant (houses 1–3): you are focused on self-development and your near world.',
    detailed:
      'The first quadrant, from the Ascendant to the IC, is read as the self: identity, resources and learning. A weighted first quadrant suggests a personal, self-made path.',
    magic: 'Personal practice and self-blessing are your foundation.',
  },
  'dominant|quadrant-2': {
    simple: 'Most planets in the second quadrant (houses 4–6): home, creativity and daily life are central.',
    detailed:
      'The second quadrant, from the IC to the Descendant, is read as self-expression: home, creativity, children, work and health.',
    magic: 'Hearth, creative and health magic suit you.',
  },
  'dominant|quadrant-3': {
    simple: 'Most planets in the third quadrant (houses 7–9): relationships and wider horizons are central.',
    detailed:
      'The third quadrant, from the Descendant to the Midheaven, is read as relating: partnership, shared resources, travel and belief.',
    magic: 'Partnership and journey magic suit you.',
  },
  'dominant|quadrant-4': {
    simple: 'Most planets in the fourth quadrant (houses 10–12): public life, community and spirit are central.',
    detailed:
      'The fourth quadrant, from the Midheaven to the Ascendant, is read as the collective: career, community and the spiritual life.',
    magic: 'Career, community and spiritual magic suit you.',
  },
};
