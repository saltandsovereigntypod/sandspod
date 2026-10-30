// The sign on the cusps of the first, second and third houses. The first
// cusp is the Ascendant (the rising sign has its own fuller reading in
// risingSigns.ts); these say how the house's matters are met.

import type { ZodiacSign } from '../../signs.ts';
import type { Interpretation } from '../types.ts';

export const CUSP_1: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "Aries on the first cusp makes you meet life head-on, quick to act and slow to wait.",
    detailed: "The door you walk through into every situation is a fiery one: you arrive moving, you say what you think, and you take the first step before most people have stood up. Mars rules your Ascendant, so Mars's sign and house show where your vitality goes and how you defend yourself. Your body may run hot, and you recover quickly.",
    magic: "Begin self-work on a Tuesday or at the Aries new Moon; a red candle and Carnelian make a simple personal altar for courage.",
  },
  Taurus: {
    simple: "Taurus on the first cusp gives a calm, steady, sensual way of meeting the world.",
    detailed: "You take your time to arrive, and when you do, you bring a sense of ease and solidity that steadies others. People trust you. Venus rules your Ascendant, so Venus's sign and house show what makes you feel most like yourself: beauty, comfort, a particular pleasure or value.",
    magic: "Self-blessing with oils, flowers and a slow bath on a Friday suits you; Rose Quartz and rose make a gentle personal altar.",
  },
  Gemini: {
    simple: "Gemini on the first cusp makes you curious, quick and talkative as you meet the world.",
    detailed: "You meet life with questions, often with a quick smile and quicker words, and you can seem younger than your years. Mercury rules your Ascendant, so Mercury's sign and house show where your restless mind leads your whole life.",
    magic: "Personal sigils and spoken charms suit you; Wednesday and Mercury hours are your self-work times, with Citrine and lavender close by.",
  },
  Cancer: {
    simple: "Cancer on the first cusp gives a gentle, protective and sensitive way of meeting the world.",
    detailed: "You approach new situations cautiously, sensing the mood before you open up, and you often look after people instinctively. The Moon rules your Ascendant, so its sign, house and phase say a great deal about your whole temperament and how your moods colour your days.",
    magic: "Moon-timed self-care is your craft: a Monday bath, moon water on the brow, Moonstone worn close.",
  },
  Leo: {
    simple: "Leo on the first cusp gives a warm, bright, generous presence that people notice.",
    detailed: "You walk into a room as if you belong there, and you usually make others feel welcome too. Pride and dignity matter to you. The Sun rules your Ascendant, so the Sun's house shows where you are most meant to shine, and your Sun sign gains extra weight.",
    magic: "Sunday glamour and confidence spells suit you; Sunstone, Calendula and a gold candle make a personal sun altar.",
  },
  Virgo: {
    simple: "Virgo on the first cusp gives a careful, modest and observant way of meeting the world.",
    detailed: "You notice details others miss and tend to be useful before you are noticed. You may seem reserved, neat or quietly competent. Mercury rules your Ascendant, so its sign and house show where your discerning mind directs your life.",
    magic: "Cleansing rituals and herbal self-care suit you, especially on Wednesdays; Amazonite and lavender calm the inner critic.",
  },
  Libra: {
    simple: "Libra on the first cusp gives a graceful, charming and diplomatic way of meeting the world.",
    detailed: "You make people feel at ease, you care how things look and sound, and you often see both sides before you take one. Venus rules your Ascendant, so Venus's sign and house show what brings your life into balance.",
    magic: "Beauty rituals and balance spells suit you on Fridays; Rose Quartz and a pair of matched candles make a good personal altar.",
  },
  Scorpio: {
    simple: "Scorpio on the first cusp gives a private, intense and perceptive way of meeting the world.",
    detailed: "You read people quickly and reveal yourself slowly. Others may find you magnetic or hard to read. Mars rules your Ascendant traditionally and Pluto in modern astrology; Mars's house shows where your power is directed, Pluto's where it is deepened.",
    magic: "Protective and transformation work suits you, especially at the dark Moon; Obsidian and a black candle make a strong personal ward.",
  },
  Sagittarius: {
    simple: "Sagittarius on the first cusp gives an open, adventurous and optimistic way of meeting the world.",
    detailed: "You approach life as a journey, often with humour and frankness, and you need room to roam. Jupiter rules your Ascendant, so Jupiter's sign and house show where your life finds its meaning and luck.",
    magic: "Luck and travel blessings suit you on Thursdays; Turquoise and a sprig of Sage make a lucky personal charm.",
  },
  Capricorn: {
    simple: "Capricorn on the first cusp gives a serious, capable and reserved way of meeting the world.",
    detailed: "You may seem older or more composed than those around you, and you approach life with a plan. Respect matters. Saturn rules your Ascendant, so Saturn's sign and house show where your life's effort and mastery are centred.",
    magic: "Protection and long-term goal magic suit you on Saturdays; Onyx and cypress make a steady personal ward.",
  },
  Aquarius: {
    simple: "Aquarius on the first cusp gives an independent, friendly and slightly unusual way of meeting the world.",
    detailed: "You come across as your own person, open to everyone and owned by no one. Saturn rules your Ascendant traditionally and Uranus in modern astrology; Saturn shows what you build, Uranus where you break the mould.",
    magic: "Invented rituals and personal sigils suit you; Amethyst and Labradorite on a Saturday make a clear personal altar.",
  },
  Pisces: {
    simple: "Pisces on the first cusp gives a gentle, dreamy and compassionate way of meeting the world.",
    detailed: "You absorb the atmosphere around you and often reflect back what others feel. You may seem soft, mysterious or artistic. Jupiter rules your Ascendant traditionally and Neptune in modern astrology; their houses show where your compassion and dreams lead your life.",
    magic: "Cleansing baths and protective veiling suit you, especially on Thursdays and Mondays; Amethyst and Aquamarine keep your edges clear.",
  },
};

export const CUSP_2: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "Aries on the second cusp: you earn by initiative and spend on impulse.",
    detailed: "Money comes through effort, competition and being first: starting your own thing, selling, physical or pioneering work. Spending can be quick and impulsive. Mars rules this house for you, so Mars's place shows where your income is won.",
    magic: "Money spells with a red and a green candle on a Tuesday suit you; Carnelian and cinnamon spark income.",
  },
  Taurus: {
    simple: "Taurus on the second cusp: you build wealth slowly and value quality and comfort.",
    detailed: "Taurus is at home here. You tend to save, invest in lasting things and earn steadily, often through beauty, food, land or craft. Venus rules your second house, so Venus's place shows where money and pleasure meet.",
    magic: "A money jar fed every Friday and a blessed purse suit you; Green Aventurine and patchouli draw slow plenty.",
  },
  Gemini: {
    simple: "Gemini on the second cusp: you earn through words, ideas and variety, often from more than one source.",
    detailed: "Income may come through writing, teaching, sales, trade or several jobs at once. You value information and connection. Mercury rules your second house, so its place shows where your wits earn.",
    magic: "Written prosperity petitions on Wednesdays suit you; Citrine and basil help.",
  },
  Cancer: {
    simple: "Cancer on the second cusp: money is tied to feeling safe, family and home.",
    detailed: "You may earn through caring, food, property or family business, and save carefully for security. Income can ebb and flow. The Moon rules your second house, so its place shows where you find financial safety.",
    magic: "Prosperity spells begun at the new Moon and grown through the waxing suit you; Moonstone and a bowl of rice on the altar help.",
  },
  Leo: {
    simple: "Leo on the second cusp: you earn through creativity and leadership, and you like to spend generously.",
    detailed: "Money may come through performance, management or creative work, and you value things that let you shine. Generosity can outrun income. The Sun rules your second house, so its place shows where you earn your gold.",
    magic: "Sunday success spells with a gold candle suit you; Citrine and Sunflower draw golden income.",
  },
  Virgo: {
    simple: "Virgo on the second cusp: you earn through skill, service and attention to detail, and manage money carefully.",
    detailed: "Income often comes from practical work, health, craft or analysis, and you keep good accounts. Worry about money is the thing to watch. Mercury rules your second house, so its place shows where your skill earns.",
    magic: "A carefully kept money ledger blessed each new Moon suits you; Amazonite and Moss Agate help.",
  },
  Libra: {
    simple: "Libra on the second cusp: you earn through partnership, beauty and good relations.",
    detailed: "Money may come through design, art, law, clients or a partner, and you value fairness and beauty. Venus rules your second house, so its place shows where money and harmony meet.",
    magic: "Honey-sweetened money spells on Fridays suit you; Rose Quartz and Green Aventurine together help.",
  },
  Scorpio: {
    simple: "Scorpio on the second cusp: money is intense, private and tied to shared resources and power.",
    detailed: "You may earn through research, finance, investment or crisis work, and guard your resources closely. Gains and losses can be dramatic. Mars and Pluto rule your second house; their places show where your resources transform.",
    magic: "Prosperity and protection magic at the dark Moon suits you; Obsidian and Pyrite together guard and draw.",
  },
  Sagittarius: {
    simple: "Sagittarius on the second cusp: money comes generously and goes generously.",
    detailed: "Income may come through teaching, travel, publishing or law, and you value freedom more than security. Overspending in optimism is the risk. Jupiter rules your second house, so its place shows where your luck with money lies.",
    magic: "Thursday luck spells suit you; Citrine and nutmeg draw expansive fortune.",
  },
  Capricorn: {
    simple: "Capricorn on the second cusp: you build wealth slowly and carefully, often through long-term work.",
    detailed: "You save, plan and earn through steady effort and expertise. Security matters a great deal. Saturn rules your second house, so its place shows where your resources are built.",
    magic: "A Saturday money jar fed patiently suits you; Pyrite and cypress support lasting wealth.",
  },
  Aquarius: {
    simple: "Aquarius on the second cusp: you earn in unusual ways and value freedom over security.",
    detailed: "Money may come through technology, innovation or group work, and income can be irregular. Saturn and Uranus rule your second house; Saturn's place shows how you build, Uranus's where money surprises you.",
    magic: "Sigils for income and experimental money magic suit you; Labradorite and Green Aventurine help.",
  },
  Pisces: {
    simple: "Pisces on the second cusp: money and values are fluid, generous and sometimes unclear.",
    detailed: "Income may come through art, healing or spiritual work, and you may give freely. Clear records protect you. Jupiter and Neptune rule your second house; their places show where your money flows.",
    magic: "Prosperity spells with clarity built in suit you; Amethyst and Green Aventurine together help.",
  },
};

export const CUSP_3: Record<ZodiacSign, Interpretation> = {
  Aries: {
    simple: "Aries on the third cusp: you think fast, speak bluntly and learn by doing.",
    detailed: "Conversation is lively and sometimes combative, and you rush about your neighbourhood. Siblings may be competitive. Mars rules your third house, so its place shows where your words have force.",
    magic: "Courage-to-speak spells on Tuesdays suit you; Carnelian at the throat helps.",
  },
  Taurus: {
    simple: "Taurus on the third cusp: you think slowly, speak calmly and learn through the senses.",
    detailed: "You learn best by handling things and repeating them, and your words are measured. Siblings and neighbours are steady presences. Venus rules your third house, so its place shows where your mind finds pleasure.",
    magic: "Slow, repeated charms spoken over seven nights suit you; Green Aventurine helps.",
  },
  Gemini: {
    simple: "Gemini on the third cusp: your mind is quick, curious and endlessly busy.",
    detailed: "Gemini is at home here. You love talk, books and short trips, and you may write or teach. Mercury rules your third house, so its place shows how your mind travels.",
    magic: "Letter spells and divination on Wednesdays suit you; Citrine and peppermint help.",
  },
  Cancer: {
    simple: "Cancer on the third cusp: you think with feeling and remember everything.",
    detailed: "Your mind is shaped by memory and mood, and family talk matters. Siblings may feel like parents, or need you as one. The Moon rules your third house, so its place shows where your mind finds safety.",
    magic: "A moon journal and family stories as spells suit you; Moonstone helps.",
  },
  Leo: {
    simple: "Leo on the third cusp: you speak with warmth and flair and love to tell a story.",
    detailed: "Your communication is dramatic, generous and confident. You may teach, perform or write creatively. The Sun rules your third house, so its place shows where your words shine.",
    magic: "Spoken confidence charms on Sundays suit you; Sunstone helps.",
  },
  Virgo: {
    simple: "Virgo on the third cusp: you think precisely and communicate carefully.",
    detailed: "You notice detail, edit well and learn methodically. Worry can loop in the mind. Mercury rules your third house, so its place shows how your careful mind works.",
    magic: "Carefully worded petitions and study blessings on Wednesdays suit you; Fluorite helps.",
  },
  Libra: {
    simple: "Libra on the third cusp: you speak diplomatically and think in terms of balance.",
    detailed: "Your words are gracious and you see both sides. Relationships with siblings and neighbours matter, and you dislike conflict nearby. Venus rules your third house, so its place shows where your words find harmony.",
    magic: "Sweetening spells for neighbours or siblings on Fridays suit you; Blue Lace Agate helps.",
  },
  Scorpio: {
    simple: "Scorpio on the third cusp: your mind is deep, private and searching.",
    detailed: "You say less than you know, and your words cut to the truth. Siblings may hold secrets or intensity. Mars and Pluto rule your third house; their places show where your mind digs.",
    magic: "Written banishings and scrying suit you; Obsidian helps.",
  },
  Sagittarius: {
    simple: "Sagittarius on the third cusp: you think big and speak frankly.",
    detailed: "You love ideas, travel and big conversations, and you may talk in principles rather than details. Jupiter rules your third house, so its place shows where your mind finds meaning.",
    magic: "Bibliomancy and travel blessings on Thursdays suit you; Turquoise helps.",
  },
  Capricorn: {
    simple: "Capricorn on the third cusp: you think carefully and speak with authority.",
    detailed: "Your communication is structured and serious, and early learning may have been hard work. Saturn rules your third house, so its place shows where your mind builds.",
    magic: "A daily writing practice as ritual on Saturdays suits you; Onyx helps.",
  },
  Aquarius: {
    simple: "Aquarius on the third cusp: your mind is original and independent.",
    detailed: "You think in systems and ideas, and your communication can be unusual. Saturn and Uranus rule your third house; their places show where your mind breaks new ground.",
    magic: "Digital sigils and new divination methods suit you; Labradorite helps.",
  },
  Pisces: {
    simple: "Pisces on the third cusp: your mind is intuitive, poetic and imaginative.",
    detailed: "You think in images and feelings, and details can slip. You may write poetry or music. Jupiter and Neptune rule your third house; their places show where your mind dreams.",
    magic: "Automatic writing and dream journals suit you; Amethyst helps.",
  },
};
