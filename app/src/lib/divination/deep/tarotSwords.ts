// The Grimoire's longer pages on the suit of Swords: air, the mind, truth,
// conflict and sorrow. After Waite's Pictorial Key (1910) and the Golden
// Dawn's Book T for the decans and titles. Keyed by the card ids in
// tarot.ts. Pure data.

import type { TarotDeep } from './types.ts';

const COURT_NOTE = 'Some readers swap the Knight and the King, since the Golden Dawn’s court had a mounted Knight at the top and a Prince in a chariot below.';

export const SWORDS_DEEP: Record<string, TarotDeep> = {
  'swords-01': {
    words: ['clarity', 'truth', 'breakthrough'],
    image:
      'A hand comes out of a cloud grasping an upright double-edged sword. Its point passes through a golden crown, from which hang an olive branch on one side and a palm branch on the other. Small flames shaped like the Hebrew letter Yod fall through the air, and bare grey mountains stand below.',
    upright:
      'The Ace of Swords is the mind cutting through: a clear thought, a hard truth, a breakthrough, a decision that settles things. It is the power of the word and the idea at its sharpest. Waite gives triumph, the excessive degree in everything, conquest, and the triumph of force; a card of great force, in love as well as in hatred. Upright, say the true thing plainly, and act on what you now see.',
    reversed:
      'Reversed, the sword cuts the wrong way. Thinking is muddled, words wound, or force is used where clarity was needed. It can mean confusion, a decision you can’t make, or a truth that comes out cruelly. Waite says the same meanings, but the results are disastrous. Sharpen your thinking before you swing.',
    correspondences:
      'Ace, number 1: the root of the powers of air, and Kether, the crown. The Golden Dawn gave the aces no decan; they stand above the zodiac. The crown on the sword’s point, with olive for peace and palm for victory, shows the mind crowned by truth.',
    love:
      'Honest conversation, a clear decision about a relationship, seeing someone as they really are. Reversed, harsh words, or confusion about what you feel.',
    work:
      'A breakthrough idea, a clear plan, a decision that cuts through red tape. Good for exams, writing, law and argument. Reversed, miscommunication, or a plan that isn’t thought through.',
    spirit:
      'The athame and the word of power. Cutting cords, casting circles, banishing. Clear intention is the sharpest tool you have.',
    question: 'What truth would cut through the confusion, if you let yourself say it?',
  },
  'swords-02': {
    words: ['stalemate', 'indecision', 'truce'],
    image:
      'A woman in a white robe sits blindfolded on a stone bench with her back to the sea. Her arms are crossed over her chest, and she holds two long swords that balance out on either side of her. Behind her the water is dotted with rocks, and a crescent moon hangs in the sky.',
    upright:
      'The Two of Swords is a stalemate: two options balanced, and a choice put off by not looking. The blindfold keeps out the world, which can be wise, for a time, or can be avoidance. Waite gives conformity and the balance it suggests, courage, friendship, concord in a state of arms, tenderness and affection. Upright, a truce holds; but sooner or later you must lower the swords and look.',
    reversed:
      'Reversed, the balance breaks. Information you didn’t want comes in, or the decision you have avoided makes itself. It can also point to feeling torn, overwhelmed or deceived. Waite gives imposture, falsehood, duplicity and disloyalty. Take the blindfold off and see what is really there.',
    correspondences:
      'Two, Chokmah, wisdom. Golden Dawn title: the Lord of Peace Restored. The Moon in Libra, the first decan of Libra (0–10°): cardinal air in the sign of the scales, under the shifting moon.',
    love:
      'A stand-off, avoiding a conversation, or torn between two people or two paths. Reversed, the truth coming out, or finally choosing.',
    work:
      'A difficult decision, a negotiation at deadlock, two offers. Gather the facts you’ve been avoiding. Reversed, a decision forced on you, or information overload.',
    spirit:
      'Meditation, stillness, closing the eyes to see within. But don’t use spirituality to avoid a choice.',
    question: 'What are you choosing not to look at, and what would happen if you did?',
  },
  'swords-03': {
    words: ['heartbreak', 'grief', 'sorrow'],
    image:
      'A red heart hangs in the air, pierced through by three swords. Behind it, grey clouds pour with rain. There are no people at all: only the heart, the blades and the weather.',
    upright:
      'The Three of Swords is heartbreak: grief, sorrow, betrayal or painful truth. It is one of the plainest cards in the deck, and it doesn’t pretend the pain is anything else. Waite gives removal, absence, delay, division, rupture and dispersion. Upright, let yourself feel it. The rain falls, and it also clears the air.',
    reversed:
      'Reversed, the healing begins, or the pain is pushed down. It can mean recovering from grief, forgiving, or refusing to feel what hurts. Waite gives mental alienation, error, loss, distraction, disorder and confusion. Grief that isn’t felt has a way of coming back; let it move through.',
    correspondences:
      'Three, Binah, understanding, whose other face is sorrow. Golden Dawn title: the Lord of Sorrow. Saturn in Libra, the second decan of Libra (10–20°): the hard planet in the sign of relationships.',
    love:
      'Heartbreak, betrayal, separation, painful truths in a relationship. Reversed, healing and forgiveness, or old wounds reopened.',
    work:
      'Disappointment, rejection, painful news, or words that cut. Feel it, then look at what is actually true in it. Reversed, recovery after a setback; learning not to take it personally.',
    spirit:
      'Grief work and heart healing. Rain rituals, tears as offering. Rose quartz, hawthorn, and time. Write down what hurt you and what you believed because of it; the swords are often thoughts as much as events, and thoughts can be drawn out one at a time.',
    question: 'What sorrow needs to be felt fully before it can be let go?',
  },
  'swords-04': {
    words: ['rest', 'recovery', 'retreat'],
    image:
      'In a quiet church, the stone effigy of a knight lies on a tomb with his hands joined in prayer. Three swords hang on the wall above him, pointing down, and a fourth lies along the side of the tomb. A stained-glass window in the corner shows a figure and a child.',
    upright:
      'The Four of Swords is rest after struggle: retreat, recovery, contemplation and the stillness that lets you heal. The knight isn’t dead; he is laid down to recover. Waite gives vigilance, retreat, solitude, hermit’s repose, exile, and tomb and coffin. Upright, take the rest you need, before your body takes it for you.',
    reversed:
      'Reversed, rest is refused or comes to an end. It can mean restlessness, burnout, or returning to the fray too soon. It can also mean stagnation, rest gone on too long. Waite gives wise administration, circumspection, economy, avarice, precaution and testament. Pace yourself.',
    correspondences:
      'Four, Chesed, mercy. Golden Dawn title: the Lord of Rest from Strife. Jupiter in Libra, the third decan of Libra (20–30°): the great benefic bringing a pause in the air’s conflicts.',
    love:
      'A pause in a relationship; time apart to think; recovering after conflict. Reversed, rushing back before you are ready, or never stopping to talk.',
    work:
      'A break, leave, a sabbatical, recovery after a hard project. Plan before the next push. Reversed, burnout, or returning too soon.',
    spirit:
      'Meditation, retreat, sleep, prayer. Sanctuary. The quiet itself is practice. A day with no workings at all, only rest, can be the most useful rite of the month.',
    question: 'What would you let yourself rest from, if you trusted the world to wait?',
  },
  'swords-05': {
    words: ['conflict', 'defeat', 'hollow victory'],
    image:
      'A man with a sly, disdainful look gathers up swords: two over his shoulder and a third in his hand. Two other men walk away dejected, their swords on the ground. Ragged clouds race across the sky, and the sea lies behind. Waite calls him the master in possession of the field.',
    upright:
      'The Five of Swords is conflict with a sour aftertaste: someone wins, but at a cost that may not be worth it. It can be bullying, unfair victory, or a fight you can’t win. Waite gives degradation, destruction, revocation, infamy, dishonour and loss. Upright, ask whether this battle is worth fighting, and what kind of winner you want to be.',
    reversed:
      'Reversed, the conflict ends or festers. It can mean reconciliation, making amends, walking away, or an old resentment that won’t heal. Waite gives the same meanings, and also burial and obsequies. Put the swords down if you can.',
    correspondences:
      'Five, Geburah, severity. Golden Dawn title: the Lord of Defeat. Venus in Aquarius, the first decan of Aquarius (0–10°): the planet of harmony out of place in fixed air.',
    love:
      'Arguments where both lose; one partner needing to win; hurtful words. Reversed, apologising, making peace, or choosing to walk away.',
    work:
      'Office politics, unfair competition, a win that costs your reputation. Reversed, settling disputes, or learning from defeat.',
    spirit:
      'Shadow work about power and pride. Release rituals for old grudges: write the grudge down and bury it. Ask what kind of victory honours your gods, and whether any magic done to win at someone’s expense is worth what it costs you.',
    question: 'If you won this, what would it cost you?',
  },
  'swords-06': {
    words: ['transition', 'passage', 'moving on'],
    image:
      'A ferryman poles a punt across the water towards a far shore. In the boat sit a woman wrapped in a cloak and a child huddled beside her, with six swords standing upright in front of them. The water on one side of the boat is choppy; ahead of it lies smooth. Waite notes that the load is light, and the work is not beyond the ferryman’s strength.',
    upright:
      'The Six of Swords is passage: leaving troubled waters for calmer ones. It is a journey, physical or inward, that takes you away from difficulty, even if you carry some sorrow with you. Waite gives a journey by water, a route, a way, an envoy and an expedient. Upright, the worst is behind you. Let yourself be carried.',
    reversed:
      'Reversed, the passage is delayed or resisted. It can mean being unable to leave, unfinished business pulling you back, or a journey that’s harder than hoped. Waite gives declaration, confession and publicity, and one account says a proposal of love. Ask what you need to leave behind to cross.',
    correspondences:
      'Six, Tiphareth, beauty. Golden Dawn title: the Lord of Earned Success. Mercury in Aquarius, the second decan of Aquarius (10–20°): clear thought in fixed air.',
    love:
      'Moving on from a painful relationship, or a couple moving through a hard time together towards calmer days. Reversed, emotional baggage, or difficulty letting go.',
    work:
      'A transition: a new job, relocation, leaving a difficult situation. Reversed, delays, or a move that’s not yet possible.',
    spirit:
      'Crossing the water: the soul’s journey, ancestors, liminal travel. Rituals for transition and safe passage.',
    question: 'What are you carrying with you to the new shore, and what can stay behind?',
  },
  'swords-07': {
    words: ['stealth', 'strategy', 'deception'],
    image:
      'A man tiptoes away from a camp of bright tents carrying five swords in his arms, looking back over his shoulder with a half-smile. Two swords remain stuck in the ground behind him. In the distance, figures stand round a campfire. Waite calls it the act of carrying away five swords rapidly.',
    upright:
      'The Seven of Swords is cunning: getting away with something, acting alone, using strategy rather than strength. It can be clever or it can be dishonest. Waite gives design, attempt, wish, hope and confidence; also quarrelling, a plan that may fail, and annoyance. Upright, look for deception, yours or someone else’s, and ask whether you are being smart or sly.',
    reversed:
      'Reversed, the scheme comes to light, or conscience catches up. It can mean confession, getting caught, or coming clean. Waite gives good advice, counsel and instruction, and also slander and babbling. Honesty may cost less than you fear.',
    correspondences:
      'Seven, Netzach, victory. Golden Dawn title: the Lord of Unstable Effort. The Moon in Aquarius, the third decan of Aquarius (20–30°).',
    love:
      'Secrets, infidelity, or not being fully honest, with a partner or with yourself. Reversed, coming clean, or a secret discovered.',
    work:
      'Strategy, working alone, a clever workaround; or office theft and dishonesty. Protect your ideas, and keep copies. Reversed, being found out, or getting good counsel.',
    spirit:
      'Trickster energy, which has its place: Hermes and Loki are both thieves. Honest reflection on where you are fooling yourself. Protection against deception, and a clear look at where you are keeping secrets in your practice and why.',
    question: 'What are you trying to get away with, and from whom?',
  },
  'swords-08': {
    words: ['restriction', 'fear', 'helplessness'],
    image:
      'A woman stands bound and blindfolded, surrounded by eight swords stuck in the ground around her like a fence. Her feet are in shallow, muddy water, and a castle sits on a cliff behind her. The swords don’t close the way completely, and her legs are free. Waite calls it temporary durance rather than irretrievable bondage.',
    upright:
      'The Eight of Swords is feeling trapped: by circumstance, by fear, by the story you tell yourself. It is often a prison of the mind more than of the world. Waite gives bad news, violent chagrin, crisis, censure, power in trammels, conflict, calumny and also sickness. Upright, look again: the way out may be open if you take a step.',
    reversed:
      'Reversed, the bonds loosen. It can mean release, new perspective, taking back your power, or seeing a way out. Waite gives disquiet, difficulty, opposition, accident, treachery and what is unforeseen. Take the blindfold off, one fold at a time.',
    correspondences:
      'Eight, Hod, splendour. Golden Dawn title: the Lord of Shortened Force. Jupiter in Gemini, the first decan of Gemini (0–10°): expansion caught in the restless mind.',
    love:
      'Feeling trapped in a relationship, or trapped by fears about love. Reversed, freeing yourself, or seeing the situation clearly.',
    work:
      'Feeling stuck in a job with no way out; victim mindset; limiting beliefs. Reversed, finding options, asking for help.',
    spirit:
      'Unbinding spells; mindfulness to untangle anxious thoughts. Ask what story you are telling yourself, and write a truer one. Cut a cord tied in knots, one knot for each fear, and untie them as you name them.',
    question: 'Which of these bonds is real, and which only feels real?',
  },
  'swords-09': {
    words: ['anxiety', 'nightmares', 'worry'],
    image:
      'A woman sits up in bed in the dark, her face buried in her hands. Nine swords hang in a row on the black wall behind her. Her quilt is patterned with roses and astrological signs, and the side of the bed is carved with a scene of one figure overcoming another. Waite calls it a card of utter desolation.',
    upright:
      'The Nine of Swords is anxiety in the small hours: worry, guilt, nightmares and the mind that won’t stop. The swords are on the wall, not in her. Much of the pain is fear of what might be. Waite gives death, failure, miscarriage, delay, deception, disappointment and despair. Upright, the night is not the time to decide anything. Reach out, and wait for morning.',
    reversed:
      'Reversed, the anxiety eases, or deepens into despair. It can mean hope returning, or hitting bottom. Waite gives imprisonment, suspicion, doubt, reasonable fear and shame. If the weight is heavy, tell someone; you don’t have to hold it alone.',
    correspondences:
      'Nine, Yesod, foundation. Golden Dawn title: the Lord of Despair and Cruelty. Mars in Gemini, the second decan of Gemini (10–20°): conflict in the restless mind.',
    love:
      'Worry about a relationship; guilt; sleepless nights. Talk it through. Reversed, relief, or anxiety coming to a head.',
    work:
      'Stress, fear of failure, work keeping you awake. Reversed, things easing, or a need to seek support.',
    spirit:
      'Dream protection, sleep charms, lavender and mugwort. Ground at night; write the worries down and leave them on the page.',
    question: 'Which of your fears belong to the night, and which still stand in daylight?',
  },
  'swords-10': {
    words: ['ending', 'rock bottom', 'release'],
    image:
      'A man lies face down on the ground with ten swords in his back, a red cloth over him. The sky above is black, but on the horizon over calm water a band of yellow light is breaking. His right hand makes a gesture like a blessing. Waite insists it is not especially a card of violent death.',
    upright:
      'The Ten of Swords is the end: the worst has happened, the thing is over, there is nowhere lower to fall. It can be painful, even dramatic. But dawn is breaking behind it. Waite gives whatever the picture suggests, and also pain, affliction, tears, sadness and desolation. Upright, let it be over. From here, the only way is up.',
    reversed:
      'Reversed, recovery begins. It can mean surviving, getting up, or refusing to let something end that already has. Waite gives advantage, profit, success and favour, but none of them permanent; also power and authority. Stand up slowly.',
    correspondences:
      'Ten, Malkuth, the kingdom. Golden Dawn title: the Lord of Ruin. The Sun in Gemini, the third decan of Gemini (20–30°).',
    love:
      'A painful ending, betrayal, or the definite close of a relationship. Reversed, healing begins; you are going to be all right.',
    work:
      'A job lost, a project failed, a definite ending. No point pretending otherwise; there is relief in that. Reversed, recovery, and the lessons that go with it.',
    spirit:
      'Endings and rebirth; ego death in the old mystical sense. Dawn rituals and returning light. Get up early and watch the sun come up over something that has ended. You have survived it.',
    question: 'Now that this is over, what can begin?',
  },
  'swords-11': {
    words: ['curiosity', 'vigilance', 'ideas'],
    image:
      'A young figure strides across rough, windy ground holding an upright sword in both hands, looking over one shoulder. Clouds race across the sky, and birds fly high above. Waite calls him lithe and active, alert, looking this way and that as if an expected enemy might appear at any moment.',
    upright:
      'The Page of Swords is the eager mind: curious, quick, watchful, full of questions. He is the student, the investigator, the one who notices. Waite gives authority, overseeing, secret service, vigilance, spying and examination. Upright, ask questions, learn, and keep your wits about you. A new idea or a piece of news may arrive on the wind; test it before you pass it on.',
    reversed:
      'Reversed, curiosity turns to gossip, or watchfulness to paranoia. It can mean talk without action, or being unprepared. Waite gives the more evil side of these qualities, what is unforeseen, an unprepared state, and also sickness. Think before you speak.',
    correspondences:
      'Page: earth of air, the Golden Dawn’s Princess of the Rushing Winds. The mind beginning to take solid form in words and plans.',
    love:
      'Curiosity about someone; lively conversation; a new interest. Getting to know someone through words and questions. Reversed, gossip, or someone prying.',
    work:
      'Study, research, learning new skills, a new idea. Watch and learn. Reversed, hasty words, or not being ready.',
    spirit:
      'Study, divination, debate. Air magic; feathers and incense. Ask the hard questions about your practice, and check your sources. A good card for learning a new system, like the runes, from the ground up.',
    question: 'What are you curious about, and what are you watching for?',
  },
  'swords-12': {
    words: ['action', 'ambition', 'haste'],
    image:
      'A knight in armour charges at full gallop on a white horse, sword raised high, as if scattering his enemies. The trees bend in the wind and the clouds are torn. Butterflies and birds decorate the horse’s harness. Waite says he might almost be Galahad, a prototypical hero of romantic chivalry.',
    upright:
      'The Knight of Swords is the charge: fast, bold, focused, sure of himself. He goes straight for the goal and lets nothing stand in his way. Waite gives skill, bravery, capacity, defence, address, enmity, wrath, war, destruction, opposition, resistance and ruin. Upright, act decisively, but think about what you might trample.',
    reversed:
      'Reversed, the charge becomes reckless. It can mean rushing, rudeness, or a fight picked for its own sake. Waite gives imprudence, incapacity and extravagance. Rein in, and aim.',
    correspondences:
      'Knight: fire of air, in the mapping most readers use: thought set alight and driven forward. ' + COURT_NOTE,
    love:
      'A fast-moving romance, a bold declaration, or a sharp-tongued partner. Reversed, arguments, or rushing a relationship.',
    work:
      'Ambition, decisive action, driving a project through. Speak up in meetings, and move quickly while the way is clear. Reversed, burnout from haste, or conflict with colleagues.',
    spirit:
      'Swift, focused will in ritual. The sword as tool of courage, and air as the element of breath and speech. But check your direction before you charge, and leave room for what spirit might say back.',
    question: 'Where are you charging, and have you checked who is in your path?',
  },
  'swords-13': {
    words: ['perception', 'honesty', 'independence'],
    image:
      'A queen sits on a high throne carved with butterflies and a winged child’s head, among clouds. She holds an upright sword in her right hand, its hilt resting on the arm of the throne, and lifts her left hand as if to welcome or to bless. A single bird flies above. Waite says her face is severe but chastened; it suggests familiarity with sorrow.',
    upright:
      'The Queen of Swords is clear-sighted and honest: she has known sorrow and come through it wiser. She sees through pretence, speaks the truth plainly, and keeps her own counsel. Waite gives widowhood, female sadness, absence, mourning, privation and separation. Readers today often add independence and perception. Upright, be honest, be fair, and don’t apologise for clarity.',
    reversed:
      'Reversed, clarity turns cold or cruel. It can mean bitterness, harsh judgement, or words used as weapons. Waite gives malice, bigotry, artifice, prudery and deceit. Soften the edge without blunting the truth.',
    correspondences:
      'Queen: water of air, the Golden Dawn’s Queen of the Thrones of the Air. Thought tempered by feeling, which is how she can see clearly without being hard.',
    love:
      'Independence, honesty, healthy boundaries. Someone who knows what they want. Reversed, coldness, or a partner who wounds with words.',
    work:
      'Clear judgement, good editing, honest feedback. A sharp mentor who doesn’t flatter. Trust your assessment. Reversed, criticism without care.',
    spirit:
      'Wisdom from sorrow. Divination and truth-telling. The sword as discernment: separating what is true from what you wish were true. Work with the waning moon for clearing and cutting away.',
    question: 'What truth do you know because you have lived through it?',
  },
  'swords-14': {
    words: ['authority', 'judgement', 'intellect'],
    image:
      'A king sits facing us on a throne carved with butterflies, holding an unsheathed sword upright. Behind him are tall trees, a few clouds, and two birds. Waite says he sits in judgement and recalls the conventional symbol of Justice in the Major Arcana.',
    upright:
      'The King of Swords is intellectual authority: the judge, the expert, the clear thinker who weighs the facts and decides. Waite gives whatever arises from the idea of judgement: power, command, authority, militant intelligence, law, offices of the crown. Upright, think it through, make the fair decision, and stand by it.',
    reversed:
      'Reversed, authority turns harsh, or intellect turns cold. It can mean manipulation, cruelty, or misuse of power. Waite gives cruelty, perversity, barbarity, perfidy and evil intention. Use reason in the service of fairness.',
    correspondences:
      'King: air of air, in the mapping most readers use: the purest card of the suit, pure intellect. ' + COURT_NOTE,
    love:
      'A rational, fair partner; clear agreements; principles before passion. Reversed, coldness, or using logic to control.',
    work:
      'Leadership by reason; legal and professional authority; good decisions. A good time for contracts, law and formal judgement. Reversed, tyranny, or misuse of expertise.',
    spirit:
      'The discipline of study and clear thought. Ethics. Teaching. Use your mind as a sacred tool, and keep your practice honest: what you claim, what you know, and where your knowledge comes from.',
    question: 'What is the fair decision here, and are you willing to make it?',
  },
};
