// The Grimoire's longer pages on the suit of Cups: water, feeling, love and
// the imagination. After Waite's Pictorial Key (1910) and the Golden Dawn's
// Book T for the decans and titles. Keyed by the card ids in tarot.ts.
// Pure data.

import type { TarotDeep } from './types.ts';

const COURT_NOTE = 'Some readers swap the Knight and the King, since the Golden Dawn’s court had a mounted Knight at the top and a Prince in a chariot below.';

export const CUPS_DEEP: Record<string, TarotDeep> = {
  'cups-01': {
    words: ['love', 'overflowing', 'grace'],
    image:
      'A hand comes out of a cloud holding a great cup in its open palm. Streams of water pour over its rim into a pool below, where water lilies float. A white dove descends towards the cup carrying a round wafer marked with a cross, and drops of water fall all around like dew. Waite reads it as the house of the true heart.',
    upright:
      'The Ace of Cups is the heart opened and overflowing: love, compassion, joy and emotional or spiritual renewal offered to you as a gift. It is the start of a feeling, a friendship, a love, or a deeper sense of grace. Waite gives the house of the true heart, joy, content, nourishment, abundance and fertility. Upright, let yourself receive. Then let it overflow to others; a full cup is meant to pour.',
    reversed:
      'Reversed, the cup tips the wrong way or is held closed. Feelings are blocked, love is withheld, or emotion spills out with nowhere good to go. Waite gives the house of the false heart, mutation, instability and revolution. It can also point to emptiness after giving too much. Refill your own cup first; tenderness to yourself counts.',
    correspondences:
      'Ace, number 1: the root of the powers of water, and Kether, the crown. The Golden Dawn gave the aces no decan; each stands above the zodiac as the pure source of its element. The dove and wafer make it the most sacramental of the minor cards.',
    love:
      'New love, a deepening bond, or a rush of affection. Sometimes a pregnancy or a birth in the family. Open your heart. Reversed, feelings held back, unrequited love, or a need to love yourself before you can receive it from others.',
    work:
      'Work that comes from the heart: caring, creative or healing roles. Good relations with colleagues; a new project you love. Reversed, burnout in a caring role, or work that leaves you emotionally empty.',
    spirit:
      'Grace, blessing and the sacred feminine of water. Moon water, chalice rites, offerings of water at a spring or well. Let your practice soften and fill you.',
    question: 'Where in your life is love trying to pour in, and have you made room for it?',
  },
  'cups-02': {
    words: ['partnership', 'connection', 'mutuality'],
    image:
      'A young man and a young woman face each other, each holding a cup, pledging one another. Between them rises the caduceus of Hermes, two serpents twined round a staff, and above it a lion’s head with great red wings. Behind them is a house on a green hill.',
    upright:
      'The Two of Cups is mutual connection: two people meeting as equals, each offering and each receiving. It is love, but also friendship, reconciliation and any partnership based on real sympathy. Waite gives love, passion, friendship, affinity, union, concord and sympathy. Upright, it says a bond is forming or deepening. Honour it with equal care on both sides.',
    reversed:
      'Reversed, the pledge falters. It can mean imbalance in a relationship, a falling-out, broken trust, or two people who no longer see each other clearly. Sometimes it is a partnership with yourself that needs mending. Talk honestly, and see whether the cups can be raised again.',
    correspondences:
      'Two, Chokmah, wisdom. Golden Dawn title: the Lord of Love. Venus in Cancer, the first decan of Cancer (0–10°): cardinal water warmed by the planet of love. The caduceus is Hermes’ staff of healing and exchange.',
    love:
      'Mutual attraction, a new romance, a commitment, or reconciliation. Equal partners. Reversed, imbalance, a quarrel, or a relationship that needs honest attention.',
    work:
      'A good partnership, a business deal, a collaborator who sees what you see. Agreements made in good faith. Reversed, a partnership strained by mistrust or unequal effort.',
    spirit:
      'The sacred marriage of opposites; working with a partner in ritual; love magic done with consent and care. Honour the bond between you and your gods, or between you and the land.',
    question: 'In this relationship, are you both giving and both receiving?',
  },
  'cups-03': {
    words: ['friendship', 'celebration', 'community'],
    image:
      'Three young women dance in a garden, raising their cups high in a toast. Garlands crown their heads, and around their feet lie the fruits of harvest: gourds, grapes and flowers. Waite calls them maidens in a garden-ground with cups uplifted, as if pledging one another.',
    upright:
      'The Three of Cups is joy shared: friendship, community, celebration and the people who lift you up. It is a gathering, a reunion, a toast to good news. Waite gives the conclusion of any matter in plenty, perfection and merriment; a happy issue, victory, fulfilment, solace and healing. Upright, gather your people and celebrate together.',
    reversed:
      'Reversed, the party goes too far or someone is left out. It can mean overindulgence, gossip, a friendship turned sour, or a triangle that hurts. Waite gives expedition, dispatch, achievement and end, and also excess in physical enjoyment and the pleasures of the senses. Look at who is in the circle, and who isn’t.',
    correspondences:
      'Three, Binah, understanding. Golden Dawn title: the Lord of Abundance. Mercury in Cancer, the second decan of Cancer (10–20°): feeling given voice and shared.',
    love:
      'Celebrations: engagements, weddings, friends who support your relationship. A fun, sociable time. Reversed, a third party, gossip, or a partner who prefers the party to you.',
    work:
      'Teamwork, collaboration, celebrating a success together. Networking and friendly colleagues. Reversed, office cliques or too much socialising and too little work.',
    spirit:
      'Coven work, circles and community festivals. Harvest celebrations. Magic shared is magic multiplied; sisterhood and friendship as sacred.',
    question: 'Who are your people, and when did you last celebrate together?',
  },
  'cups-04': {
    words: ['apathy', 'contemplation', 'withdrawal'],
    image:
      'A young man sits under a tree with his arms and legs crossed, looking down at three cups set on the grass in front of him. From a cloud beside him, a hand offers a fourth cup, which he doesn’t seem to notice. Waite says his expression is one of discontent with his surroundings.',
    upright:
      'The Four of Cups is discontent and withdrawal: you have what you have, and it doesn’t satisfy. You may be turning inward, bored, or so focused on what is missing that you miss what is offered. Waite gives weariness, disgust, aversion and imaginary vexations, as if the wine of this world had caused only satiety; another wine, as if a fairy gift, is now offered. Upright, look up: something new is being held out.',
    reversed:
      'Reversed, you come out of the slump. It can mean new interest, new motivation, saying yes to an offer, or finishing a period of reflection. Waite gives novelty, presage, new instruction and new relations. Take the cup that is held out, if it is the right one.',
    correspondences:
      'Four, Chesed, mercy. Golden Dawn title: the Lord of Blended Pleasure. The Moon in Cancer, the third decan of Cancer (20–30°): water under its own planet, moody and inward.',
    love:
      'Boredom or dissatisfaction in a relationship; taking someone for granted; or ignoring someone who is interested. Reversed, renewed interest, or being ready to try again.',
    work:
      'Apathy at work, missed opportunities, feeling stuck. Look at what is being offered before you turn it down. Reversed, new motivation, a fresh opportunity accepted.',
    spirit:
      'Meditation and contemplation, which this card can be at its best. But watch for spiritual dryness. Gratitude practice helps you see the cups you already have.',
    question: 'What is being offered to you that you haven’t yet noticed?',
  },
  'cups-05': {
    words: ['grief', 'loss', 'regret'],
    image:
      'A figure in a long black cloak stands with head bowed, looking down at three cups that have tipped over and spilled. Behind him, two cups still stand upright, unnoticed. A river runs past, with a bridge leading to a small keep or house on the far bank.',
    upright:
      'The Five of Cups is grief and regret: something is lost, and it hurts. It is natural to mourn. But the card also shows that not everything is gone: two cups remain, and there is a bridge home. Waite gives a card of loss, but something remains over; three have been taken, but two are left. Also inheritance, and patrimony that doesn’t match expectations. Upright, grieve what needs grieving, and when you are ready, turn round.',
    reversed:
      'Reversed, you begin to move on. It can mean acceptance, forgiveness, or finding what remains. It can also mean refusing to grieve, or being stuck in regret. Waite gives news, alliances, affinity, ancestry, return and false projects. Ask what you still have.',
    correspondences:
      'Five, Geburah, severity. Golden Dawn title: the Lord of Loss in Pleasure. Mars in Scorpio, the first decan of Scorpio (0–10°): fixed water stirred by the planet of conflict.',
    love:
      'Heartbreak, disappointment, regret over a relationship. Remember what remains. Reversed, healing, forgiveness, or the chance to reconcile.',
    work:
      'A setback or loss at work; a plan that failed. There are still options. Reversed, recovery, learning from a mistake, moving on.',
    spirit:
      'Grief rituals, ancestor work, honouring losses. Let the tears be part of the practice. Water carries grief away.',
    question: 'What remains standing behind you, while you look at what has spilled?',
  },
  'cups-06': {
    words: ['nostalgia', 'memory', 'innocence'],
    image:
      'In an old garden, a boy offers a cup filled with white flowers to a smaller girl. Six cups stand around them, each holding flowers. Behind them is an old house with a tower, and a figure with a staff walks away. Waite calls it children in an old garden, their cups filled with flowers.',
    upright:
      'The Six of Cups is memory and the past: childhood, nostalgia, old friends and the innocent kindness of a simple gift. Waite gives a card of the past and of memories, looking back as on childhood; happiness and enjoyment, but coming from the past; things that have vanished. Another reading, he says, gives new relations, new knowledge and a new environment. Upright, let good memories nourish you, and offer kindness simply.',
    reversed:
      'Reversed, the past has too strong a hold, or you are ready to leave it. It can mean living in nostalgia, idealising old times, or old patterns repeating. Waite gives the future, renewal, and that which will come to pass presently. Take what is good from the past into what is coming.',
    correspondences:
      'Six, Tiphareth, beauty. Golden Dawn title: the Lord of Pleasure. The Sun in Scorpio, the second decan of Scorpio (10–20°).',
    love:
      'An old flame returning, childhood sweethearts, a sweet and innocent love. Reversed, being stuck on an ex, or idealising the past.',
    work:
      'Returning to an old project or employer; work with children; using skills you learned long ago. Reversed, moving on from how things used to be done.',
    spirit:
      'Inner child work, ancestor memories, family traditions. Revisit the magic you loved as a child.',
    question: 'What memory still nourishes you, and what are you ready to leave in the garden?',
  },
  'cups-07': {
    words: ['choices', 'fantasy', 'illusion'],
    image:
      'A figure, seen from behind in shadow, stands before seven cups floating in a cloud. Each cup holds a vision: a head, a veiled and glowing figure, a serpent, a castle on a rock, a heap of jewels, a laurel wreath and a dragon. Waite calls them strange chalices of vision, the images of the fantastic spirit.',
    upright:
      'The Seven of Cups is choices and imagination: many possibilities, some wonderful, some illusions, and no way to have them all. It can be dreaming, wishful thinking, or the confusion of too many options. Waite gives fairy favours, images of reflection, sentiment, imagination, things seen in the glass of contemplation; some attainment, but nothing permanent or substantial. Upright, dream, but test your dreams against the ground.',
    reversed:
      'Reversed, the fog clears and you choose. It can mean clarity, focus and decision, or the end of an illusion. Waite gives desire, will, determination and project. Pick one cup and commit.',
    correspondences:
      'Seven, Netzach, victory. Golden Dawn title: the Lord of Illusionary Success. Venus in Scorpio, the third decan of Scorpio (20–30°).',
    love:
      'Many options, fantasies, or seeing someone as you wish they were. Reversed, seeing clearly, choosing one person, or letting go of a fantasy.',
    work:
      'Too many options; daydreaming instead of doing. Make a shortlist. Reversed, clarity about what you really want; decisive action.',
    spirit:
      'Visualisation, pathworking and scrying. A good card for vision work, but ground yourself afterwards. Not every vision is a message.',
    question: 'Which of these cups is real, and which is only a reflection of what you wish?',
  },
  'cups-08': {
    words: ['departure', 'leaving', 'searching'],
    image:
      'A man in a red cloak with a staff walks away from eight cups stacked carefully on the shore, heading towards rocky hills. Above, a moon with a face shows both a crescent and a full disc. Waite says he is deserting the cups of his happiness, enterprise or previous concern.',
    upright:
      'The Eight of Cups is walking away: leaving something that once mattered because it no longer fills you. It isn’t failure; the cups are stacked with care. It is a search for something deeper. Waite says it speaks for itself on the surface; in practice it often shows the decline of a matter, or that something thought important is really of slight consequence. Upright, it may be time to go.',
    reversed:
      'Reversed, you hesitate to leave, or turn back. It can mean fear of the unknown, staying too long, or aimless drifting. Waite, unusually, gives great joy, happiness and feasting. Ask whether you are staying from love or from fear.',
    correspondences:
      'Eight, Hod, splendour. Golden Dawn title: the Lord of Abandoned Success. Saturn in Pisces, the first decan of Pisces (0–10°): the planet of endings in the sea of feeling.',
    love:
      'Walking away from a relationship that no longer satisfies; seeking deeper connection. Reversed, staying for fear of being alone, or trying once more.',
    work:
      'Leaving a job, a career change, or abandoning a project to find more meaningful work. Reversed, fear of change, or staying for security.',
    spirit:
      'Pilgrimage, the spiritual quest, leaving behind a path that no longer fits. Moon rituals for release.',
    question: 'What are you outgrowing, and what are you searching for?',
  },
  'cups-09': {
    words: ['contentment', 'satisfaction', 'wishes'],
    image:
      'A well-fed man sits on a bench, arms folded, looking pleased with himself. Behind him, nine cups stand in a row on a long curved table covered with blue cloth. Waite says he has feasted to his heart’s content, and the abundant wine behind him suggests the future is also assured.',
    upright:
      'The Nine of Cups is the wish card: contentment, satisfaction, pleasure and the comfort of having what you wanted. Waite gives concord, contentment, physical well-being, victory, success, advantage, and satisfaction for the one who asks. Upright, your wish may come true. Enjoy it, and be grateful.',
    reversed:
      'Reversed, satisfaction is hollow or delayed. It can mean smugness, overindulgence, or a wish granted that doesn’t bring the happiness you expected. Waite gives truth, loyalty and liberty, though readings vary and include mistakes and imperfections. Ask what you truly wish for.',
    correspondences:
      'Nine, Yesod, foundation. Golden Dawn title: the Lord of Material Happiness. Jupiter in Pisces, the second decan of Pisces (10–20°): the great benefic in the sign it once ruled.',
    love:
      'Contentment, a wish fulfilled, happiness in love. Reversed, complacency, or wanting more than a partner can give.',
    work:
      'Success, satisfaction, goals reached. Good food and good company, and the comfort of having done enough. Let yourself rest on it for a while. Reversed, smugness, or success that doesn’t feel as good as it should.',
    spirit:
      'Wish magic and gratitude rites. Count your blessings, literally: name nine things and set a cup of water on the altar for each. Pleasure is sacred too, and contentment is a practice, not only a reward.',
    question: 'If your wish came true tomorrow, would it be enough?',
  },
  'cups-10': {
    words: ['happiness', 'family', 'harmony'],
    image:
      'A man and woman stand with their arms round each other, raising their free arms to a rainbow of ten cups arching across the sky. Beside them, two children dance, too happy in their own way to notice the rainbow. Beyond lie a river, trees and a house on a green hill.',
    upright:
      'The Ten of Cups is lasting happiness: home, family, love and emotional fulfilment, the whole heart at rest. Waite gives contentment, repose of the entire heart, the perfection of that state, and the perfection of human love and friendship; also the town or country where the questioner lives. Upright, cherish what you have built together.',
    reversed:
      'Reversed, harmony at home is disturbed. It can mean family conflict, broken dreams of the perfect home, or values that don’t match. Waite gives repose of the false heart, indignation and violence. Look beneath the picture-perfect surface, and tend what is real.',
    correspondences:
      'Ten, Malkuth, the kingdom. Golden Dawn title: the Lord of Perfected Success. Mars in Pisces, the third decan of Pisces (20–30°).',
    love:
      'A happy family, commitment, a home full of love. Soulmates in the plain sense. Reversed, family tension, or a relationship that looks better from outside than within.',
    work:
      'Work-life balance; success that supports the family; a team that feels like family. Good work done for the people you love. Reversed, work pulling you away from home.',
    spirit:
      'Hearth and home magic, family blessings, house wards. Honour your household gods and your chosen family, and the ancestors whose love made yours possible. A rainbow is a promise; keep yours.',
    question: 'What does a happy home really look like for you?',
  },
  'cups-11': {
    words: ['imagination', 'sensitivity', 'message'],
    image:
      'A young man in a blue tunic printed with lotus flowers stands by the sea, holding up a cup from which a small fish pokes its head to look at him. He looks back with calm interest. Waite calls him a fair, pleasing, studious page, and the fish the pictures of the mind taking form.',
    upright:
      'The Page of Cups is the dreamer and the beginner of feeling: imaginative, sensitive, open-hearted, ready to be surprised. He may bring a message of love or an intuition out of nowhere. Waite gives a fair young man, impelled to render service; a studious youth; news, message; application, reflection and meditation. Upright, follow the surprising feeling. Let your inner child play.',
    reversed:
      'Reversed, sensitivity turns to moodiness, or imagination to escapism. It can mean emotional immaturity, creative block, or a message that disappoints. Waite gives taste, inclination, attachment, seduction, deception and artifice. Take feelings seriously, but don’t let them run the show.',
    correspondences:
      'Page: earth of water, the Golden Dawn’s Princess of the Waters, the Lotus of the Palace of the Floods. Feeling given its first solid shape.',
    love:
      'A sweet, shy approach; a new romance; a love note. Reversed, emotional immaturity, or someone playing with feelings.',
    work:
      'Creative beginnings; artistic projects; unexpected ideas from unlikely places. Write them down before they swim away. Reversed, creative block, or daydreaming at the desk.',
    spirit:
      'Intuition, dreams, psychic beginnings. Keep a dream journal; trust small signs, even when they seem silly. Water and fish as allies. Play is a good way into magic, and wonder is a good teacher.',
    question: 'What surprising feeling or idea is trying to get your attention?',
  },
  'cups-12': {
    words: ['romance', 'idealism', 'invitation'],
    image:
      'A knight in armour with wings on his helmet and heels rides slowly on a white horse, holding a cup out before him. He is crossing towards a river, and his tunic is patterned with fish. Waite says he is graceful but not warlike, riding quietly; he too is a dreamer.',
    upright:
      'The Knight of Cups is the romantic: he follows his heart, carries an offer, and arrives with feeling. He can be a lover, an artist, or an invitation. Waite gives arrival, approach (sometimes of a messenger), advances, proposition, invitation and incitement. Upright, accept the invitation, or make the offer yourself.',
    reversed:
      'Reversed, romance turns to moodiness, jealousy, or promises not kept. It can mean someone charming but unreliable. Waite gives trickery, artifice, subtlety, swindling, duplicity and fraud. Check that the offer is real.',
    correspondences:
      'Knight: fire of water, in the mapping most readers use: passion carried on feeling. ' + COURT_NOTE,
    love:
      'A proposal, a romantic gesture, someone following their heart to you. Courtship that takes its time. Reversed, an unreliable romantic, or idealising someone.',
    work:
      'An offer; creative or caring work; following your passion. Reversed, unrealistic plans, or a deal that sounds too good.',
    spirit:
      'The quest for the grail: following the heart in your practice. Devotional work, poetry and art as offerings. Let beauty lead you, but check from time to time that it is leading somewhere real.',
    question: 'What is your heart offering, and to whom?',
  },
  'cups-13': {
    words: ['compassion', 'intuition', 'care'],
    image:
      'A queen sits on a throne at the edge of the sea, with carved sea-children on it. She gazes at an ornate covered cup with angel-like handles, the only closed cup in the suit. Pebbles and shells lie at her feet in the shallow water. Waite says she is dreamy, as one who sees visions in a cup, but she sees and also acts, and her activity feeds her dream.',
    upright:
      'The Queen of Cups is compassion and emotional wisdom: the person who listens, feels deeply and holds space for others. She trusts her intuition and acts from love. Waite gives a good, fair woman, honest and devoted; loving intelligence, and hence the gift of vision; success, happiness and pleasure; wisdom and virtue. Upright, lead with compassion, and trust what you sense.',
    reversed:
      'Reversed, feeling floods or dries. It can mean emotional overwhelm, martyrdom, or someone whose care hides control. Waite says the accounts vary: a good woman, or a distinguished woman not to be trusted, and vice and dishonour. Look after your own heart too.',
    correspondences:
      'Queen: water of water, the Golden Dawn’s Queen of the Thrones of the Waters. The purest card of the suit: deep, receptive, reflecting.',
    love:
      'A caring, empathetic partner; deep emotional connection, and feeling truly heard. Reversed, codependency or emotional manipulation.',
    work:
      'Counselling, nursing, healing or creative work; leading with empathy and reading the room well. Reversed, taking on everyone’s problems.',
    spirit:
      'Psychic gifts, water scrying, healing work. Your intuition is a tool; keep it clean and rested. Her closed cup is a reminder that some visions are kept, not shared.',
    question: 'Who is caring for the one who cares?',
  },
  'cups-14': {
    words: ['balance', 'diplomacy', 'calm'],
    image:
      'A king sits on a stone throne floating on a rough sea, holding a great cup in his right hand and a short sceptre in his left. A fish-shaped amulet hangs at his neck. On one side a ship sails; on the other a dolphin leaps from the waves. He is calm in the midst of moving water.',
    upright:
      'The King of Cups is emotional mastery: calm, wise and kind, able to feel deeply without being swept away. He keeps his head while the sea moves around him. Waite gives a fair man, a man of business, law or divinity; responsible and disposed to help; equity, art and science; creative intelligence. Upright, stay steady, and help others find their footing.',
    reversed:
      'Reversed, the calm is a mask or the sea breaks through. It can mean repressed feeling, moodiness, or someone manipulative. Waite gives a dishonest, double-dealing man; roguery, exaction, injustice, vice, scandal and loss. Let feelings be felt, and watch for charm that hides an agenda.',
    correspondences:
      'King: air of water, in the mapping most readers use: feeling given perspective and voice. ' + COURT_NOTE,
    love:
      'A mature, emotionally steady partner; a calm, supportive relationship. Reversed, someone emotionally unavailable or manipulative.',
    work:
      'Wise leadership, diplomacy, counselling. Stay calm under pressure. Reversed, emotional outbursts or hidden agendas at work.',
    spirit:
      'Mastery of feeling in practice; working with the sea and with water spirits. Balance heart and head in ritual.',
    question: 'How can you stay steady without shutting your feelings out?',
  },
};
