// Aspects of Mercury, Venus and Mars to everything after them in BODY_ORDER.
// Mercury and Venus are never more than about 76° apart, so they meet only by
// conjunction and sextile.

import type { PairSeed } from './types.ts';

export const PERSONAL_PAIRS: Record<string, PairSeed> = {
  "Mercury|Venus": {
    core: "Mercury and Venus show how thought and affection combine: how gracefully you speak, and how much you love words, art and good company.",
    magic: "Mercury with Venus suits love letters, sweetening spells written on pink paper, poetry as offering, and charm work for kind speech. Wednesdays and Fridays, rose, lavender and green aventurine are allies.",
    conjunction: [
      "You speak with charm and think about beauty. Words, art and good conversation give you real pleasure.",
      "Mercury conjunct Venus gives a graceful mind and a pleasing voice. You have a feel for language, music and design, and you tend to smooth over disagreements with tact and humour.\n\nIt is a lovely placement for writers, singers and diplomats. The care is telling people what they want to hear; your kindness is strongest when it is also honest.",
    ],
    sextile: [
      "You have an easy way with words and people. Your tact and taste win you friends.",
      "The sextile between Mercury and Venus gives a light, sociable intelligence. You know how to say difficult things kindly, enjoy learning about art and beauty, and do well in any work that needs good manners and clear thinking together.\n\nUse it on purpose: write the letter, make the introduction, design the thing.",
    ],
  },
  "Mercury|Mars": {
    core: "Mercury and Mars show how your mind meets action: how sharp, quick and forceful your words are, and how you argue.",
    magic: "Mercury with Mars gives power to spoken and written spells of protection and courage: binding words, warding sigils, and petitions read aloud with force. Wednesdays and Tuesdays, red ink, pepper, basil and carnelian suit.",
    conjunction: [
      "Your mind is quick and your words are direct. You love a debate and say what you think.",
      "Mercury conjunct Mars gives a sharp, fast mind and a tongue to match. You think on your feet, decide quickly and enjoy arguing a point, sometimes for the sport of it.\n\nThe gift is courage in speech; the care is words that cut deeper than you meant. Pause before you send.",
    ],
    sextile: [
      "You think and act decisively. You can make a case clearly and get things moving.",
      "Mercury sextile Mars links thought and action in a practical way: you plan and then do. You are good at persuading, organising and solving problems under pressure.\n\nIt suits campaigning, teaching, writing to deadlines and any skilled handwork.",
    ],
    square: [
      "Your words can come out sharper than you mean. Learning to argue fairly makes you formidable.",
      "Mercury square Mars brings mental restlessness and quick irritation. You may find yourself in arguments you didn't plan, or rushing decisions.\n\nThe friction also gives a brilliant, combative mind. Learn to pick your battles and to listen to the end of the sentence.",
    ],
    trine: [
      "You think clearly under pressure and speak with confidence.",
      "Mercury trine Mars gives mental energy and decisiveness. You learn quickly, argue well and are not afraid to speak up.\n\nUse it in advocacy, debate, sport strategy or crafts that need quick hands and a clear head.",
    ],
    opposition: [
      "Arguments and challenges tend to come through others, and they sharpen your mind.",
      "Mercury opposite Mars often brings debate into relationships: people who contradict you, or ideas you have to defend.\n\nThe growth is in arguing to understand rather than to win. You can become a superb negotiator.",
    ],
  },
  "Mercury|Jupiter": {
    core: "Mercury and Jupiter show how big your mind is: your love of learning, your breadth of thought, and whether you see the forest or the trees.",
    magic: "Mercury with Jupiter suits study blessings, spells for exams and publishing, travel protection and divination with books (bibliomancy). Wednesdays and Thursdays, sage, bay and sodalite suit.",
    conjunction: [
      "You love ideas, learning and big questions. You are a natural teacher and storyteller.",
      "Mercury conjunct Jupiter gives an expansive mind: you think in big pictures, love to learn and to share what you know, and tend to be optimistic in what you say.\n\nThe care is detail and overstatement; check the small print before you promise the world.",
    ],
    sextile: [
      "You learn easily and enjoy sharing what you know.",
      "Mercury sextile Jupiter gives curiosity and good judgement. Study, travel and teaching tend to open doors for you.\n\nTake the course, write the article; opportunities follow.",
    ],
    square: [
      "Your mind races ahead of the details. Focus turns big ideas into wisdom.",
      "Mercury square Jupiter can bring over-promising, scattered study or strong opinions held too quickly.\n\nThe gift is vision; the work is follow-through. Finish one book before starting the next three.",
    ],
    trine: [
      "You think broadly and wisely, and people listen to you.",
      "Mercury trine Jupiter gives a generous, philosophical mind and a talent for explaining. Learning feels like joy rather than work.\n\nIt suits teaching, writing and law.",
    ],
    opposition: [
      "You learn through other people's beliefs, and balance detail with vision.",
      "Mercury opposite Jupiter brings dialogue between your own reasoning and others' philosophies.\n\nThe growth is in listening without losing your own judgement.",
    ],
  },
  "Mercury|Saturn": {
    core: "Mercury and Saturn show how disciplined and careful your mind is: your capacity for focus, structure and serious thought, and any fear of being wrong.",
    magic: "Mercury with Saturn suits binding words, contracts with spirits written carefully, study rituals kept over months, and spells for focus. Wednesdays and Saturdays, black ink, rosemary and onyx are allies.",
    conjunction: [
      "You think carefully and seriously. Your words carry weight because you choose them well.",
      "Mercury conjunct Saturn gives a deep, methodical mind. You may have been slow to speak as a child, or felt your ideas were not taken seriously, and you built mastery through patience.\n\nThe gift is depth and precision; the care is pessimism and self-doubt. Your mind is better than your fear says.",
    ],
    sextile: [
      "You have a practical, organised mind and good judgement.",
      "Mercury sextile Saturn gives focus and common sense. You can plan, study and work steadily toward mastery.\n\nIt suits any craft that rewards patience.",
    ],
    square: [
      "You may doubt your own mind. Patience and practice build real expertise.",
      "Mercury square Saturn can bring learning struggles, fear of speaking, or harsh self-criticism.\n\nOver time it gives a mind that is thorough and hard to fool. Be kind to the part of you that worries.",
    ],
    trine: [
      "You think clearly and carefully, and you finish what you start.",
      "Mercury trine Saturn gives disciplined thinking and good concentration.\n\nYou are reliable in your word and suited to research, law, crafts and teaching.",
    ],
    opposition: [
      "Others may test or doubt your ideas. You learn to stand by your thinking.",
      "Mercury opposite Saturn brings critics and authorities into your intellectual life.\n\nThe growth is in trusting your own mind while still hearing fair critique.",
    ],
  },
  "Mercury|Uranus": {
    core: "Mercury and Uranus show how original and quick your mind is: flashes of insight, unusual ideas and a love of the new.",
    magic: "Mercury with Uranus suits sigil magic, technology spells, sudden divination and inventive workings. Wednesdays, storm water and clear quartz suit.",
    conjunction: [
      "Your mind is brilliant and unconventional. Ideas come in flashes.",
      "Mercury conjunct Uranus gives an inventive, fast and independent mind. You see connections others miss and may be drawn to science, technology or radical ideas.\n\nThe care is impatience and scattered focus; write the flashes down.",
    ],
    sextile: [
      "You have original ideas and enjoy new ways of thinking.",
      "Mercury sextile Uranus gives mental agility and openness.\n\nUse it in invention, writing and problem solving.",
    ],
    square: [
      "Your mind can be restless and contrary. Channelled, it is genuinely inventive.",
      "Mercury square Uranus brings nervous energy and a love of disagreement.\n\nGive your mind a big puzzle and it stops picking small fights.",
    ],
    trine: [
      "You think freely and originally, with ease.",
      "Mercury trine Uranus gives intuitive intelligence and quick learning.\n\nTrust your unusual ideas.",
    ],
    opposition: [
      "Others challenge your thinking with surprising ideas.",
      "Mercury opposite Uranus brings unexpected ideas through others.\n\nThe growth is in staying open without losing your own thread.",
    ],
  },
  "Mercury|Neptune": {
    core: "Mercury and Neptune show how imagination and thought blend: poetic, intuitive thinking, and how clear or misty your mind is.",
    magic: "Mercury with Neptune suits dream journals, automatic writing, poetry as spell, and divination by symbols. Wednesdays, mugwort, lavender and amethyst suit.",
    conjunction: [
      "You think in images and feelings. You are imaginative and intuitive.",
      "Mercury conjunct Neptune gives a poetic, visionary mind. You may be drawn to music, poetry, film or spiritual writing.\n\nThe care is vagueness; double-check facts and contracts.",
    ],
    sextile: [
      "Your imagination supports clear thought.",
      "Mercury sextile Neptune gives intuitive intelligence and creative writing ability.\n\nUse it in art and symbolic work.",
    ],
    square: [
      "Your mind can drift or misread. Grounding gives your imagination a channel.",
      "Mercury square Neptune can bring confusion, misunderstandings or self-deception.\n\nWrite things down and ask clarifying questions; your imagination is a gift.",
    ],
    trine: [
      "You have an intuitive mind and a gift for symbol and story.",
      "Mercury trine Neptune gives creative and psychic thinking.\n\nIt suits writing, tarot and art.",
    ],
    opposition: [
      "Others may confuse or inspire you. Discernment sharpens your mind.",
      "Mercury opposite Neptune brings misunderstandings and inspiration through others.\n\nThe growth is in clear communication.",
    ],
  },
  "Mercury|Pluto": {
    core: "Mercury and Pluto show how deeply and powerfully your mind works: research, secrets, persuasion and words that change things.",
    magic: "Mercury with Pluto suits binding and banishing words, research into hidden lore, and spells written and burned. Wednesdays at the dark moon, obsidian and black ink.",
    conjunction: [
      "Your mind is penetrating and intense. You see beneath the surface.",
      "Mercury conjunct Pluto gives investigative depth and persuasive power.\n\nThe care is obsessive thinking and using words as weapons.",
    ],
    sextile: [
      "You think deeply and persuasively.",
      "Mercury sextile Pluto gives research ability and psychological insight.\n\nIt suits investigation and therapy.",
    ],
    square: [
      "Your thoughts can become intense or controlling. Depth becomes wisdom with care.",
      "Mercury square Pluto brings mental power struggles and obsession.\n\nThe work is letting go of needing to be right.",
    ],
    trine: [
      "You see to the heart of things easily.",
      "Mercury trine Pluto gives profound insight.\n\nUse it in research, healing and writing.",
    ],
    opposition: [
      "Others may try to influence your thinking, or you theirs.",
      "Mercury opposite Pluto brings intense conversations and persuasion.\n\nThe growth is in honest, respectful exchange.",
    ],
  },
  "Mercury|Chiron": {
    core: "Mercury and Chiron show where your mind or voice was wounded, and how that becomes a gift for teaching and healing with words.",
    magic: "Mercury with Chiron suits healing words, affirmations and written release rites. Wednesdays, chamomile and blue lace agate.",
    conjunction: [
      "You may have felt unheard or misunderstood. Your words now heal others.",
      "Mercury conjunct Chiron puts a wound in the mind or voice: learning difficulties, being silenced, or feeling stupid.\n\nMany teachers and counsellors have it; your voice matters.",
    ],
    sextile: [
      "You have a gift for healing words.",
      "Mercury sextile Chiron gives an ability to explain painful things gently.\n\nUse it in teaching and support.",
    ],
    square: [
      "Speaking up may feel risky. Practice turns this into strength.",
      "Mercury square Chiron brings tension around being heard.\n\nThe work is finding safe places to speak.",
    ],
    trine: [
      "You teach and heal through words naturally.",
      "Mercury trine Chiron gives an easy gift for helpful speech.\n\nShare it.",
    ],
    opposition: [
      "Conversations can touch old wounds, and heal them.",
      "Mercury opposite Chiron brings healing through dialogue.\n\nListen, and be listened to.",
    ],
  },
  "Mercury|North Node": {
    core: "Mercury and the North Node show how thinking, learning and communication relate to your path of growth.",
    magic: "Mercury with the nodes suits journalling across eclipse seasons and divination about your path.",
    conjunction: [
      "Learning and communicating move you along your path.",
      "Mercury conjunct the North Node makes your mind a vehicle for growth.\n\nWrite, teach, study.",
    ],
    sextile: [
      "Your mind supports your growth.",
      "Mercury sextile the North Node gives opportunities through learning.\n\nTake them.",
    ],
    square: [
      "Your thinking habits may pull against your growth.",
      "Mercury square the nodal axis asks you to change how you think.\n\nStay curious.",
    ],
    trine: [
      "Ideas flow toward your purpose.",
      "Mercury trine the North Node aligns mind and path.\n\nFollow your curiosity.",
    ],
    opposition: [
      "Familiar ways of thinking come easily; growth asks new ones.",
      "Mercury opposite the North Node sits on the South Node.\n\nLearn something new.",
    ],
  },
  "Mercury|Ascendant": {
    core: "Mercury and the Ascendant show how much your mind and voice shape the way you come across.",
    magic: "Mercury on the Ascendant suits spoken charms and personal sigils.",
    conjunction: [
      "You come across as bright, talkative and curious.",
      "Mercury conjunct the Ascendant puts the mind on display: you are articulate and alert.\n\nThe care is nervous energy.",
    ],
    sextile: [
      "You communicate easily and make a good impression.",
      "Mercury sextile the Ascendant gives social intelligence.\n\nUse it.",
    ],
    square: [
      "What you think and how you come across may differ.",
      "Mercury square the Ascendant brings tension between mind and manner.\n\nSay what you mean.",
    ],
    trine: [
      "You speak and present yourself with ease.",
      "Mercury trine the Ascendant gives graceful communication.\n\nA natural presenter.",
    ],
    opposition: [
      "You think through conversations with others.",
      "Mercury opposite the Ascendant sits on the Descendant: partners are your sounding board.\n\nDialogue is your teacher.",
    ],
  },
  "Mercury|Midheaven": {
    core: "Mercury and the Midheaven show how your mind and communication shape your career and reputation.",
    magic: "Mercury on the Midheaven suits career spells for writing, speaking and trade.",
    conjunction: [
      "Your career may centre on words, teaching or trade.",
      "Mercury conjunct the Midheaven puts communication at the heart of your vocation.\n\nYour voice is your work.",
    ],
    sextile: [
      "Your mind helps your career.",
      "Mercury sextile the Midheaven gives professional opportunities through skill and contacts.\n\nNetwork.",
    ],
    square: [
      "Your ideas and your career may clash.",
      "Mercury square the Midheaven brings tension between thought and role.\n\nFind work that uses your mind.",
    ],
    trine: [
      "Your intelligence flows into your work.",
      "Mercury trine the Midheaven gives professional ease with words.\n\nA strong placement for writers.",
    ],
    opposition: [
      "Your mind turns to home and roots.",
      "Mercury opposite the Midheaven sits at the IC: thinking about family and the past.\n\nWrite your history.",
    ],
  },
};
