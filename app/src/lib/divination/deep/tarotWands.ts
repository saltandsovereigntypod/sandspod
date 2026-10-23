// The Grimoire's longer pages on the suit of Wands: fire, will, enterprise
// and spirit. After Waite's Pictorial Key (1910) and the Golden Dawn's Book T
// for the decans and titles. Keyed by the card ids in tarot.ts. Pure data.

import type { TarotDeep } from './types.ts';

// The court cards' element pairs follow the mapping most readers use for
// Waite's deck. Said once here and again briefly on each court card.
const COURT_NOTE = 'Some readers swap the Knight and the King, since the Golden Dawn’s court had a mounted Knight at the top and a Prince in a chariot below.';

export const WANDS_DEEP: Record<string, TarotDeep> = {
  'wands-01': {
    words: ['spark', 'inspiration', 'potential'],
    image:
      'A hand comes out of a cloud holding a stout wand that is sprouting fresh leaves, and a few leaves drift down through the air. Below lies a green landscape with a river, trees, and a castle on a hill. The wands of this suit are always in leaf, Waite notes: they are living wood, not dead sticks.',
    upright:
      'The Ace of Wands is the spark: a new idea, a creative fire, the first stirring of an enterprise or a passion. It is energy offered to you, as the hand from the cloud offers the wand. Waite gives creation, invention, enterprise, beginning and source, and also birth, family and origin. Upright, take hold of the wand while it is hot. Start the thing.',
    reversed:
      'Reversed, the spark won’t catch, or it fizzles out after a promising start. It can mean delays, false starts, lost motivation, or energy spent before it has anywhere to go. Waite gives fall, decadence and ruin, and also a certain clouded joy. Don’t force a flame; look for what would feed it, and be ready when it comes again.',
    correspondences:
      'Ace, number 1: the root of the powers of fire, and Kether, the crown, on the Tree of Life. The Golden Dawn did not give the aces a decan; they stand above the zodiac, as the pure source of their element.',
    love:
      'New attraction, chemistry and excitement; a spark between you, or a passion rekindled. Act on it. Reversed, interest that flares and fades, or bad timing.',
    work:
      'A new venture, a creative project, a business idea, the energy to begin. A good card for launches and pitches. Reversed, a project slow to start or a plan with no fuel behind it.',
    spirit:
      'Fire magic and candle work, and the spark of a new path or practice. Light a candle for a beginning. Notice what fires your spirit, and give it room.',
    question: 'What idea keeps coming back to you, asking to be begun?',
  },
  'wands-02': {
    words: ['planning', 'vision', 'decision'],
    image:
      'A tall man in a red cap stands on the battlements of a castle, looking out over sea and shore. In his right hand he holds a small globe; in his left, a wand resting on the wall, while a second wand is fixed to the stonework by a ring. On the wall to one side is a cross of roses and lilies. Waite likens him to Alexander amid the grandeur of this world’s wisdom.',
    upright:
      'The Two of Wands is the moment after the spark, when you hold the world in your hand and plan what to do with it. You have some security behind you and a horizon in front. Waite pairs riches, greatness and magnificence with physical suffering, chagrin and sadness: the restlessness of someone who has much and wants more. Upright, make your plans, then decide which way to go.',
    reversed:
      'Reversed, the plan stays on the battlements. It can point to fear of the unknown, playing safe, or plans made without enough looking ahead. Waite gives surprise, wonder, enchantment, emotion, trouble and fear. Take a wider view before you set off, or admit that you want to stay.',
    correspondences:
      'Two, Chokmah, wisdom. Golden Dawn title: the Lord of Dominion. Mars in Aries, the first decan of Aries (0–10°): cardinal fire under the planet that rules it, pure drive at its outset.',
    love:
      'Thinking about the future together, or deciding whether to take a relationship further. Sometimes a long-distance love. Reversed, holding back out of fear, or wanting more than the relationship can give.',
    work:
      'Planning, strategy and looking abroad: expansion, travel, new markets. You have a base; now choose the direction. Reversed, poor planning, or staying put when you’ve outgrown it.',
    spirit:
      'Setting intentions with a long view. Map your year, or your path. Work with Mars for courage to choose.',
    question: 'You have the world in your hand. Where do you actually want to go?',
  },
  'wands-03': {
    words: ['expansion', 'foresight', 'enterprise'],
    image:
      'A calm, stately figure stands with his back to us on a cliff-top, looking out at ships passing over a golden sea towards distant hills. Three wands are planted in the ground around him, and he leans slightly on one of them. Waite says those are his ships, bearing his merchandise.',
    upright:
      'The Three of Wands is plans under way and the first returns coming in. You have set things moving and can now watch from a height, with foresight, as they go out into the world. Waite gives established strength, enterprise, effort, trade, commerce and discovery. Upright, look ahead: more is coming, and you are in a position to see it.',
    reversed:
      'Reversed, the ships are slow to come home. Plans meet delays, or were made with too little foresight, or you are waiting passively for results instead of steering. Waite reads it as the end of troubles: the suspension or cessation of adversity, toil and disappointment. Most readers now take it as setbacks needing a change of course; either way, adjust the sails.',
    correspondences:
      'Three, Binah, understanding. Golden Dawn title: the Lord of Established Strength. The Sun in Aries, the second decan of Aries (10–20°): the fire of the sign in full light.',
    love:
      'A relationship growing beyond its first stage; looking to the future together. Sometimes a partner abroad or travelling. Reversed, waiting for someone to come back, or plans that don’t match.',
    work:
      'Trade, exports, growth and travel. Your early work is paying off. Leadership with a long view. Reversed, delays in shipping, contracts or replies.',
    spirit:
      'The view from the hill: seeing your path in a wider landscape. A good card for spells sent out to do their work. Let them go and watch.',
    question: 'What have you already set in motion that you could trust to come home?',
  },
  'wands-04': {
    words: ['celebration', 'homecoming', 'harmony'],
    image:
      'Four tall wands stand in the foreground with a great garland of flowers and fruit hung between them. Two women raise bunches of flowers above their heads, and behind them other figures gather near a bridge over a moat leading to an old manor house. It is a festival at the gate.',
    upright:
      'The Four of Wands is celebration and arrival: a homecoming, a wedding, a harvest-home, the joy of something built and finished well enough to rest in. Waite gives country life, a haven of refuge, a kind of domestic harvest-home, repose, concord, harmony, prosperity and peace. Upright, enjoy what has been built, and share it with your people.',
    reversed:
      'Waite says the meaning of this card remains unaltered when reversed: prosperity, increase, felicity, beauty and embellishment. Many readers today read a little less ease into it: a celebration with a shadow on it, a move or transition, or home feeling unsettled for a while. It is still a happy card. Find your footing and keep the garland up.',
    correspondences:
      'Four, Chesed, mercy. Golden Dawn title: the Lord of Perfected Work. Venus in Aries, the third decan of Aries (20–30°): fire softened by pleasure and beauty.',
    love:
      'Commitment celebrated: an engagement, a wedding, moving in together, a happy home. Reversed, tension at home, or a celebration that doesn’t feel as you hoped.',
    work:
      'A milestone reached; a project completed; team celebrations. A stable base for what comes next. Reversed, a transition at work, or success not fully shared.',
    spirit:
      'Festivals and sabbats, house blessings and handfastings. Celebrate the turning of the wheel with others. Bless the threshold.',
    question: 'What have you built that deserves celebrating, and who would you celebrate it with?',
  },
  'wands-05': {
    words: ['competition', 'conflict', 'rivalry'],
    image:
      'Five young men in different coloured clothes brandish wands at one another on rough ground. No one seems hurt and no one seems to be winning: the wands clash in a tangle above their heads. Waite calls it mimic warfare, as if in sport or strife.',
    upright:
      'The Five of Wands is struggle and rivalry: crossed purposes, competing ideas, a lot of noise and energy without a clear result. It can be healthy competition or tiresome squabbling. Waite gives imitation, as in a sham fight, but also the strenuous competition and struggle of the search after riches and fortune: the battle of life. Upright, find what the fight is really about, and whether it’s worth having.',
    reversed:
      'Reversed, the scuffle ends or goes underground. It can mean avoiding a conflict that needs to be had, or tensions easing at last. Waite gives litigation, disputes, trickery and contradiction. Speak plainly and settle it, so it doesn’t simmer on.',
    correspondences:
      'Five, Geburah, severity. Golden Dawn title: the Lord of Strife. Saturn in Leo, the first decan of Leo (0–10°): fixed fire weighed down and pushed against.',
    love:
      'Bickering, clashing wants, or rivals for your attention. Sometimes playful sparring. Reversed, avoiding the argument you need, or peace after friction.',
    work:
      'Competitive markets, office politics, brainstorming that turns into argument. Find common ground or a fair way to compete. Reversed, a dispute settled, or conflict moving behind the scenes.',
    spirit:
      'Inner conflict between competing desires or paths. Sort out what each voice wants. Sport and movement as practice: burn the energy off.',
    question: 'What is this conflict really about, underneath the noise?',
  },
  'wands-06': {
    words: ['victory', 'recognition', 'pride'],
    image:
      'A rider crowned with laurel sits on a white horse, carrying a wand topped with a laurel wreath. Footmen with wands walk beside him and look up at him. Waite says it is a victor triumphing, but also great news, such as might be carried in state by the king’s courier.',
    upright:
      'The Six of Wands is success seen by others: a public win, recognition, praise deserved. Waite gives a victor triumphing, great news, and expectation crowned with its own desire: the crown of hope. Upright, accept the praise gracefully. You earned it, and others are glad to walk beside you.',
    reversed:
      'Reversed, recognition doesn’t come, or comes and goes to your head. It can mean a fall from favour, pride before a fall, or success delayed. Waite gives apprehension, fear as of a victorious enemy at the gate, treachery, disloyalty and indefinite delay. Keep your worth independent of applause.',
    correspondences:
      'Six, Tiphareth, beauty. Golden Dawn title: the Lord of Victory. Jupiter in Leo, the second decan of Leo (10–20°): the lion’s fire expanded and honoured.',
    love:
      'Pride in each other, being seen and celebrated together. A relationship that others admire. Reversed, needing validation, or rivalry for attention.',
    work:
      'Promotion, awards, good reviews, public success. Lead with confidence, and share the credit generously; it makes the next win easier. Reversed, credit going elsewhere, or arrogance getting in the way.',
    spirit:
      'Victory and success charms; bay laurel, the victor’s leaf, on the altar. Honour your achievements rather than rushing past them. Remember the footmen: no one wins alone, and gratitude keeps a victory sweet.',
    question: 'How do you carry success, and who helped you win it?',
  },
  'wands-07': {
    words: ['defence', 'courage', 'perseverance'],
    image:
      'A young man stands on a craggy height, brandishing a wand against six others raised towards him from below. He holds the high ground, but he is outnumbered. If you look closely, he is wearing odd footwear, a shoe on one foot and a boot on the other, as if he dressed in a hurry.',
    upright:
      'The Seven of Wands is standing your ground. You have the advantage of position, but you must defend it. Waite gives valour, since on the surface six are attacking one who has the vantage point; in thought, discussion and wordy strife; in business, negotiation and competition; and success. Upright, hold firm: you can win this if you don’t give way.',
    reversed:
      'Reversed, the defence wavers. It can mean feeling overwhelmed, giving up ground you should have kept, or being so defensive that you fight everyone. Waite gives perplexity, embarrassment and anxiety, and a caution against indecision. Decide what is worth defending, and let the rest go.',
    correspondences:
      'Seven, Netzach, victory. Golden Dawn title: the Lord of Valour. Mars in Leo, the third decan of Leo (20–30°): fire made fierce.',
    love:
      'Defending a relationship or your own needs within it; protecting what you have from outside pressure. Reversed, constant arguments, or giving in for the sake of peace.',
    work:
      'Competition, defending your position, sticking to your principles under pressure. Reversed, burnout from fighting on all fronts.',
    spirit:
      'Protection magic and boundary work: a ring of salt, a warded threshold, a line you won’t let anyone cross. Stand up for your beliefs, including in rooms where they aren’t shared. Courage charms, and Mars for backbone.',
    question: 'What is worth defending here, and what are you fighting from habit?',
  },
  'wands-08': {
    words: ['speed', 'movement', 'news'],
    image:
      'Eight wands fly through open sky in parallel, slanting down to the ground, over a landscape with a river and a house on a hill. There are no people in the card. Waite calls it motion through the immovable: a flight of wands through an open country, drawing to the end of their course.',
    upright:
      'The Eight of Wands is swift action. Things are moving: messages arrive, plans come together, the wait is over. Waite gives activity in undertakings, swiftness like an express messenger, great haste, great hope, speed towards an end that promises happiness; that which is on the move; and also the arrows of love. Upright, act quickly and let things land.',
    reversed:
      'Reversed, the arrows go astray. It can mean delays, crossed messages, haste that leads to mistakes, or frustration that nothing is moving. Waite gives arrows of jealousy, internal dispute, stings of conscience and quarrels, especially domestic ones. Slow down, check your aim, and let tempers cool.',
    correspondences:
      'Eight, Hod, splendour. Golden Dawn title: the Lord of Swiftness. Mercury in Sagittarius, the first decan of Sagittarius (0–10°): the messenger riding mutable fire.',
    love:
      'Things moving fast: messages, sudden attraction, Waite’s arrows of love. Travel to see someone. Reversed, jealousy, mixed signals, or a love that moves too fast.',
    work:
      'Fast progress, quick decisions, news arriving, travel for work. Clear your desk for action. Reversed, delays and miscommunication; double-check before you send.',
    spirit:
      'Spells that work quickly, and messages from spirit. Pay attention to signs. Movement as practice.',
    question: 'What is suddenly moving in your life, and are you ready to catch it?',
  },
  'wands-09': {
    words: ['resilience', 'vigilance', 'persistence'],
    image:
      'A man with a bandaged head leans on his wand and looks over his shoulder, wary, as if expecting an enemy. Behind him eight other wands stand upright in an orderly row like a palisade. He has been in the fight and is still on guard.',
    upright:
      'The Nine of Wands is resilience: you have taken some knocks, but you are still standing, and you are nearly there. Waite gives strength in opposition: if attacked, this person will meet the onslaught boldly; and also delay, suspension and adjournment. Upright, hold on a little longer. You have more reserves than you think, and your defences are good.',
    reversed:
      'Reversed, vigilance has turned into exhaustion or paranoia. It can mean feeling worn down, unable to carry on, or so braced for the next attack that you can’t rest. Waite gives obstacles, adversity and calamity. Ask for help, and let your guard down where it’s safe to.',
    correspondences:
      'Nine, Yesod, foundation. Golden Dawn title: the Lord of Great Strength. The Moon in Sagittarius, the second decan of Sagittarius (10–20°).',
    love:
      'Guardedness after past hurt; wanting to trust again but bracing for disappointment. Reversed, defensiveness pushing someone away.',
    work:
      'The last push of a long project; persistence despite setbacks. You have learned from the earlier battles, and you will finish. Reversed, burnout; rest before you break.',
    spirit:
      'Warding and protection, a ring of stakes around what you hold sacred. Heal old wounds with care rather than pressing on regardless, and notice which fears are still useful and which you can put down.',
    question: 'What are you still guarding against, and is the danger still there?',
  },
  'wands-10': {
    words: ['burden', 'responsibility', 'effort'],
    image:
      'A man bent nearly double carries ten heavy wands in his arms, his face hidden among them, walking towards a house in the distance. He can barely see where he is going. Waite calls him a man oppressed by the weight of the ten staves which he carries.',
    upright:
      'The Ten of Wands is the burden of too much: responsibilities, commitments and success that has become heavy to carry. Waite gives oppression simply, but also fortune, gain and any kind of success, and then the oppression of those things; also false-seeming, disguise and perfidy. Upright, you will get there, but ask what you could set down or share.',
    reversed:
      'Reversed, the load becomes too much, or you finally put some of it down. It can mean collapse under pressure, or learning to delegate. Waite gives contrarieties, difficulties and intrigues. Not all of these wands are yours to carry.',
    correspondences:
      'Ten, Malkuth, the kingdom. Golden Dawn title: the Lord of Oppression. Saturn in Sagittarius, the third decan of Sagittarius (20–30°): fire weighed down by the planet of limits.',
    love:
      'Carrying the relationship alone, or one partner overloaded with duties. Reversed, sharing the load at last, or the strain breaking something.',
    work:
      'Overwork, too many projects, the weight of leadership. The goal is in sight, but the way you are carrying things is costing you. Prioritise and delegate. Reversed, burnout, or letting go of what isn’t yours.',
    spirit:
      'Release work: write down your burdens, one to a slip, and burn them. Ask which commitments you took on because you wanted to, and which because no one else would. Practice should lighten you; if it has become another duty, simplify it.',
    question: 'Which of these wands could you put down today?',
  },
  'wands-11': {
    words: ['enthusiasm', 'exploration', 'message'],
    image:
      'A young man stands in a dry, open landscape with three pyramid-shaped mounds in the distance. He holds a tall wand upright before him and looks at it with interest. His tunic is patterned with salamanders, creatures of fire, and a feather stands up from his cap. Waite says he stands in the act of proclamation.',
    upright:
      'The Page of Wands is the eager beginner of fire: curious, enthusiastic, full of ideas and ready to explore. He brings news, or is the news. Waite gives a dark young man, faithful, a lover, an envoy or a postman: someone who carries a message. Upright, follow your curiosity, try something new, and say yes to the invitation.',
    reversed:
      'Reversed, enthusiasm burns out quickly, or the message is bad news. It can mean scattered ideas, restlessness, or plans with no follow-through. Waite gives anecdotes, announcements and evil news, and indecision with the instability that goes with it. Pick one spark and tend it.',
    correspondences:
      'Page: earth of fire, the Golden Dawn’s Princess of the Shining Flame. The solid, grounding part of fire: the first fuel the flame takes hold of.',
    love:
      'Flirtation, new attraction, playful energy, a message from someone. Reversed, mixed signals, or interest that fades quickly.',
    work:
      'A new idea, an apprenticeship, a creative brief, news about a job. Explore. Reversed, too many ideas and too little focus.',
    spirit:
      'The beginner’s enthusiasm in practice. Try a new form of magic, learn fire-scrying, read about a tradition that excites you.',
    question: 'What are you curious about right now, and how could you follow it?',
  },
  'wands-12': {
    words: ['adventure', 'passion', 'impulse'],
    image:
      'A knight in armour, with a tunic patterned with salamanders and a long plume, rides a rearing horse past mounds or pyramids. He holds a short wand in leaf. Waite says he is shown as if on a journey, and though armed is not on a warlike errand; the motion of the horse is a key to the character of its rider.',
    upright:
      'The Knight of Wands is fire on the move: bold, passionate, adventurous and impatient. He leaps before the gate is open. Waite gives departure, absence, flight and emigration; a dark young man, friendly; a change of residence. Upright, go: travel, move, take the bold action. Just keep an eye on where you are landing.',
    reversed:
      'Reversed, the fire becomes recklessness or burns out. It can mean haste, a temper, a project abandoned, or someone charming who won’t stay. Waite gives rupture, division, interruption and discord. Slow the horse enough to choose your direction.',
    correspondences:
      'Knight: fire of fire, the most fiery card in the deck, in the mapping most readers use. ' + COURT_NOTE,
    love:
      'Passionate, exciting romance; someone sweeping you off your feet. Reversed, all fire and no staying power; or commitment-shy energy.',
    work:
      'Bold moves, travel, a new venture launched quickly. Reversed, rushing, recklessness, or starting many things and finishing none.',
    spirit:
      'Passion for your path; fire rituals; pilgrimage and travel as practice. Ride with the energy, but don’t burn out.',
    question: 'Where is your impatience taking you, and is it where you want to go?',
  },
  'wands-13': {
    words: ['confidence', 'warmth', 'determination'],
    image:
      'A queen sits on a throne carved with lions, a tall wand in leaf in her right hand and a sunflower in her left. Lions and sunflowers decorate the throne’s back, and a black cat sits at her feet. Waite says her personality corresponds to the King’s but is more magnetic.',
    upright:
      'The Queen of Wands is warm, confident, generous and determined: fire that heats the hearth rather than burning the house down. She knows her worth and lights up a room. Waite gives a dark woman, a countrywoman, friendly, chaste, loving and honourable; a love of money; success in business. Upright, step into your power with warmth.',
    reversed:
      'Reversed, the warmth turns to jealousy, temper or self-doubt. It can mean someone demanding or overbearing, or your own confidence faltering. Waite gives good, economical, obliging and serviceable, and also opposition, jealousy, deceit and infidelity. Come back to your centre, and to the things that make you feel like yourself.',
    correspondences:
      'Queen: water of fire, the Golden Dawn’s Queen of the Thrones of Flame. Fire that is steady and warm because it is tempered by feeling.',
    love:
      'A confident, passionate, loyal partner; warmth, attraction and a busy, sociable home. She loves openly and expects the same. Reversed, jealousy, possessiveness or insecurity.',
    work:
      'Leadership with charisma; a confident manager; success in business. She juggles many things and keeps them warm. Speak up for your ideas. Reversed, overcommitment, or a demanding colleague.',
    spirit:
      'Sun and fire magic, cat familiars, sunflowers on the altar. Own your power and let it warm others.',
    question: 'Where could you step forward with more confidence and warmth?',
  },
  'wands-14': {
    words: ['leadership', 'vision', 'boldness'],
    image:
      'A king sits on a throne whose back is carved with lions and salamanders, holding up a flowering wand. Like the other kings, he wears a cap beneath his crown, and a small salamander sits at his feet. Waite describes the nature this card stands for as dark, ardent, lithe, animated, impassioned and noble.',
    upright:
      'The King of Wands is the visionary leader: bold, honourable, inspiring and able to make big ideas happen. Waite gives a dark man, friendly, a countryman, generally married, honest and conscientious; the card always signifies honesty. Upright, lead with vision and integrity, and take the long view.',
    reversed:
      'Reversed, leadership turns to domineering or recklessness, or vision without follow-through. Waite gives good but severe, austere yet tolerant. Check whether you are inspiring people or simply pushing them, and whether your plans have room for anyone else’s.',
    correspondences:
      'King: air of fire, in the mapping most readers use: fire fanned by air into vision and direction. ' + COURT_NOTE,
    love:
      'A passionate, committed partner who leads with honesty and keeps their word. Big plans made together. Reversed, a controlling or hot-tempered partner, or high expectations.',
    work:
      'Entrepreneurship, leadership and vision. Start the business; lead the team; set the direction and trust others with the details. Reversed, impulsive decisions, or bossiness.',
    spirit:
      'Mastery of fire: the will directed by vision. Teaching, leading a group, carrying a tradition forward with honesty.',
    question: 'What vision are you being asked to lead?',
  },
};
