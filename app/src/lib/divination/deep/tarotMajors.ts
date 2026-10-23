// The Grimoire's longer pages on the twenty-two Major Arcana, after A. E.
// Waite's Pictorial Key to the Tarot (1910) and the Golden Dawn's
// attributions, which Waite and Pamela Colman Smith drew on. Keyed by the
// card ids in tarot.ts. Pure data.

import type { TarotDeep } from './types.ts';

export const MAJORS_DEEP: Record<string, TarotDeep> = {
  '00-the-fool': {
    words: ['beginnings', 'trust', 'freedom'],
    image:
      'A young man in a bright tunic patterned with flowers and wheels stands at the very edge of a cliff, high among snowy mountains. He looks up and out, not down. Over his shoulder is a staff with a small wallet tied to it, and in his other hand a white rose. A little white dog leaps at his heels, and a white sun shines in a yellow sky behind him. Waite calls him a prince of the other world on his travels through this one.',
    upright:
      'The Fool is the first step of any journey, taken before you know how it ends. He stands for openness, curiosity and the kind of trust that lets you begin at all. Drawn upright, it says a new start is here or close, and that you needn’t have every answer to set out. Travel light. The white rose is innocence, not ignorance: you can be unguarded and still be wise.',
    reversed:
      'Reversed, the leap is either taken without looking or never taken at all. It can point to carelessness, a decision made on a whim, or a risk you haven’t counted. Just as often it means holding back from something you want because the ground isn’t certain. Waite gives negligence, distraction and apathy. Ask which way the card tips for you, then check the ground and decide.',
    correspondences:
      'Number 0, the card before all the others and sometimes after them. Golden Dawn: the element of Air, the Hebrew letter Aleph (the ox), the path between Kether and Chokmah on the Tree of Life. Air suits him: breath, spirit, the open sky.',
    love:
      'A fresh start in love, or a new way of being in an old relationship. It favours openness and play over planning. If you’re single, say yes to the unexpected invitation. Reversed, watch for rushing in, or for keeping everyone at arm’s length because commitment feels like a cliff.',
    work:
      'A new job, a new venture or a change of direction, often without a full map. Good for starting, less good for detailed budgets. Reversed, look for a gamble you haven’t thought through.',
    spirit:
      'The beginner’s mind: coming to your practice without assuming you already know. A good card for starting a new path, a new year of the wheel, or a new tool. Let curiosity lead and keep the dog of good sense close.',
    question: 'What would you begin if you trusted the road to meet you?',
  },
  '01-the-magician': {
    words: ['will', 'skill', 'focus'],
    image:
      'A young magician in a white tunic and red robe stands behind a table. One hand lifts a white wand to the sky; the other points down to the earth: as above, so below. Over his head floats the figure-of-eight sign of infinity, and a serpent biting its own tail girds his waist. On the table lie a cup, a sword, a pentacle and a wand, the four suits. Red roses hang above him and red roses and white lilies grow at his feet.',
    upright:
      'The Magician is will joined to skill. Everything you need is already on the table; the card asks you to pick it up and use it with intention. It speaks of focus, resourcefulness and the power to make an idea real. Waite reads it as skill, diplomacy and will. Upright, it says you are able, and that now is a good time to act on purpose rather than by habit.',
    reversed:
      'Reversed, the energy leaks. Gifts sit unused, plans scatter, or skill is turned to manipulation and sleight of hand, by you or by someone near you. Waite gives disquiet and mental disease, which most readers soften to a troubled or divided will. Look for where your attention is going, and be wary of anyone who seems too clever by half.',
    correspondences:
      'Number 1. Golden Dawn: the planet Mercury, the Hebrew letter Beth (house), the path between Kether and Binah. Mercury is the messenger and the trickster, quick of mind and hand, which is both the gift and the warning of this card.',
    love:
      'Attraction you can act on, and the confidence to say what you want. A good time to make the first move or to put real effort into a relationship. Reversed, watch for charm without substance, or for someone saying the right things for the wrong reasons.',
    work:
      'Skill, initiative and a project you can lead. Interviews, pitches and launches go well when you prepare. Use every tool you have. Reversed, a plan with too many threads, or a colleague who promises more than they can deliver.',
    spirit:
      'The card of working magic in the plain sense: clear intention, the right tools, and the will to see it through. Lay out your altar, name what you want, and connect heaven and earth through your own hands. Practice makes the magician.',
    question: 'What is already on your table that you haven’t yet picked up?',
  },
  '02-the-high-priestess': {
    words: ['intuition', 'mystery', 'stillness'],
    image:
      'A priestess in blue robes sits between two pillars, a black one marked B and a white one marked J: Boaz and Jachin, from Solomon’s Temple. Behind her hangs a veil embroidered with pomegranates, and through its edges you glimpse water. She wears a crown of a full moon between two horns, an equal-armed cross on her breast, and a crescent moon at her feet. In her lap is a scroll marked TORA, partly hidden by her mantle.',
    upright:
      'The High Priestess keeps what can’t be said outright. She is intuition, the inner voice, and knowledge that comes in silence rather than argument. Waite gives secrets, mystery and the future as yet unrevealed. Upright, she asks you to be still and listen, to trust what you sense before you can explain it, and to let some things stay hidden until they’re ready.',
    reversed:
      'Reversed, the inner voice is drowned out. You may be gathering everyone’s opinion except your own, or ignoring a feeling because it’s inconvenient. It can also mean secrets coming into the open, or surface knowledge mistaken for the whole. Waite gives passion and surface knowledge. Go quiet and ask what you already know.',
    correspondences:
      'Number 2. Golden Dawn: the Moon, the Hebrew letter Gimel (camel), the long path between Kether and Tiphareth that crosses the Abyss. The camel carries water across the desert, as she carries the deep knowledge across what can’t be crossed by reason alone.',
    love:
      'Something unspoken between you, or feelings that run deeper than they show. Don’t force a declaration; let it come. Reversed, a secret may surface, or you may be ignoring what your instincts say about someone.',
    work:
      'Keep your counsel. Not every plan needs announcing. Trust your read of a situation, especially of people. Reversed, information is being withheld, or you’re acting on gossip rather than knowledge.',
    spirit:
      'A card for divination, dreamwork and meditation. Keep a dream journal, sit with the moon, and give the quiet more room. Her scroll is half hidden for a reason: some learning only comes by waiting.',
    question: 'What do you know that you haven’t yet said out loud, even to yourself?',
  },
  '03-the-empress': {
    words: ['abundance', 'nurture', 'growth'],
    image:
      'A fair woman sits at ease on cushions in a field of ripe corn, with a stream falling through a wood of cypress behind her. She wears a crown of twelve stars and a gown printed with pomegranates, and holds a sceptre topped with a globe. Beside her rests a heart-shaped shield bearing the sign of Venus. Waite calls her the inferior Garden of Eden, the earthly paradise.',
    upright:
      'The Empress is fruitfulness in every sense: growth, comfort, beauty and creative plenty. She is the body well fed and the garden well tended, and the pleasure of both. Waite gives fruitfulness, action and initiative. Upright, she says something you have cared for is ready to flourish, and that rest and pleasure are part of the work, not a reward for finishing it.',
    reversed:
      'Reversed, the garden is either untended or smothered. Care may be going everywhere except to you, or held so tightly that nothing can breathe. It can point to creative block, dependence, or neglect of the body. Waite’s own reversed meanings are oddly bright (light, truth, the untangling of involved matters) with vacillation as another reading. Feed the roots again, starting with yourself.',
    correspondences:
      'Number 3. Golden Dawn: the planet Venus, the Hebrew letter Daleth (door), the path between Chokmah and Binah. Venus rules love, beauty and growing things, and the door is the way life comes into the world.',
    love:
      'Warmth, affection and sensual pleasure. A loving, generous relationship, or a time when love grows easily. Sometimes it points to pregnancy or a new family member. Reversed, care that has become smothering, or giving love you aren’t receiving back.',
    work:
      'Projects that grow well with patient tending: creative work, gardening, caring roles, anything that nourishes. Abundance is possible. Reversed, overwork in the name of looking after others, or an idea left too long to wither.',
    spirit:
      'The earth itself as sacred. Garden, cook, walk barefoot, keep the seasons. Hearth and kitchen witchcraft sit well here. Honour your body as part of your practice, not as something to rise above.',
    question: 'What in your life is ripening, and how could you tend it more gently?',
  },
  '04-the-emperor': {
    words: ['structure', 'authority', 'stability'],
    image:
      'A stern, white-bearded ruler sits on a great stone throne carved with rams’ heads. Under his red robe you can see armour. In his right hand is a sceptre shaped like an ankh and in his left an orb. Behind him rise bare, rugged mountains, with a thin stream running at their foot. Waite describes him as executive and realisation, the power of this world clothed with the highest of its natural attributes.',
    upright:
      'The Emperor is order that protects: rules, plans, boundaries and the steady hand that keeps them. He is the father principle in the old sense, responsibility as much as power. Waite gives stability, power, protection and reason. Upright, he asks you to build a frame around what matters, make a plan, and hold firm to it. Structure here is shelter, not a cage.',
    reversed:
      'Reversed, order has gone hard or gone missing. It may be rigidity, control for its own sake, or an authority who rules by habit or temper. Or it may be the opposite: no boundaries, no plan, chaos at home or work. Waite gives benevolence and compassion, but also confusion to enemies and obstruction. Ask whether you need more structure or less.',
    correspondences:
      'Number 4. Golden Dawn: the sign of Aries, cardinal fire, ruled by Mars; the Hebrew letter Heh (window); the path between Chokmah and Tiphareth. The rams on his throne are Aries, the first sign, the start of the year’s fire.',
    love:
      'A steady, dependable partner or a relationship built on commitment and shared plans. It can mean someone older or more settled. Reversed, a partner who needs to control, or a relationship with no agreed shape at all.',
    work:
      'Leadership, management and good systems. A time to take charge, set rules, and put your affairs in order. Dealings with institutions and authorities go well with preparation. Reversed, a domineering boss, red tape, or your own perfectionism blocking progress.',
    spirit:
      'Discipline in practice: a daily routine, a set altar, a calendar of observance. Protection and boundary work, warding the home. Structure gives your practice somewhere to stand.',
    question: 'Where would a clear boundary make you feel safer, and where has one become a wall?',
  },
  '05-the-hierophant': {
    words: ['tradition', 'teaching', 'belonging'],
    image:
      'A high priest in red robes and a triple crown sits between two grey pillars. His right hand is raised in blessing, and in his left he holds a staff topped with a triple cross. Two crossed keys lie at his feet, and two tonsured ministers kneel before him, one in robes patterned with roses and the other with lilies. Waite calls him the ruling power of external religion.',
    upright:
      'The Hierophant is tradition and the people who keep it: teachers, mentors, institutions and the shared forms of a community. He is learning the established way before you change it. Waite gives marriage, alliance, captivity and servitude, and also mercy and goodness. Upright, the card favours seeking a teacher, joining a group, following a proven method, or taking part in a ceremony.',
    reversed:
      'Reversed, the old forms no longer fit, or are being kept for their own sake. It can point to empty ritual, rigid rules, or a teacher who confuses authority with wisdom. It can also mean finding your own way outside convention. Waite gives society, understanding and concord, and also over-kindness and weakness. Keep what is true, and leave the rest with thanks.',
    correspondences:
      'Number 5. Golden Dawn: the sign of Taurus, fixed earth, ruled by Venus; the Hebrew letter Vav (nail or hook); the path between Chokmah and Chesed. The nail joins things together, as tradition joins one generation to the next.',
    love:
      'Commitment and its rites: engagement, marriage, handfasting, meeting the family. Shared values matter more than sparks here. Reversed, a relationship that doesn’t fit expected shapes, or pressure to conform to someone else’s idea of love.',
    work:
      'Institutions, qualifications, mentors and established methods. Good for study, training and joining an organisation. Follow the procedure. Reversed, rules that stifle, or a chance to do things in a new way.',
    spirit:
      'Lineage, initiation, and learning from those who went before. Study the sources, find a teacher or a coven, and learn the rites as they were given. Then ask what is yours to add.',
    question: 'Which tradition has shaped you, and what from it do you choose to keep?',
  },
  '06-the-lovers': {
    words: ['love', 'union', 'choice'],
    image:
      'A naked man and woman stand in a landscape under a great sun. Above them an angel with outspread wings and arms blesses them, often named as Raphael, the angel of air. Behind the woman is a tree bearing fruit with a serpent coiled round it; behind the man is a tree whose fruits are flames. A tall mountain rises between them. The man looks at the woman, and the woman looks up at the angel. They are Adam and Eve in the garden, before the fall.',
    upright:
      'The Lovers is love and the choice love asks of us. It is attraction, union and harmony, but also the moment of decision when you must choose in line with what you truly value. Waite gives attraction, love and beauty, and trials overcome. Upright, it speaks of a meaningful relationship or a choice of the heart, made honestly and with your whole self.',
    reversed:
      'Reversed, something is out of step: between you and another person, or between what you value and what you do. It can mean a choice being dodged, a relationship under strain, or temptation pulling against commitment. Waite gives failure and foolish designs. Name the choice and make it honestly.',
    correspondences:
      'Number 6. Golden Dawn: the sign of Gemini, mutable air, ruled by Mercury; the Hebrew letter Zayin (sword); the path between Binah and Tiphareth. Gemini is the twins, the pair; the sword is the discernment that divides one path from another.',
    love:
      'A strong bond, deep attraction, or a relationship moving to a new level of commitment. Values shared and spoken. Reversed, imbalance, mixed signals, or a choice between two people or two futures you’ve been putting off.',
    work:
      'Partnerships and a decision that reflects your values: which offer, which path, which collaborator. Choose what you can stand behind. Reversed, a partnership in conflict, or taking work that goes against your grain.',
    spirit:
      'The sacred marriage, the union of opposites within. Work with pairs: sun and moon, god and goddess, will and feeling. And let your practice reflect what you actually love, not what you think you should.',
    question: 'What do you value enough to choose, even at the cost of something else?',
  },
  '07-the-chariot': {
    words: ['willpower', 'direction', 'victory'],
    image:
      'A crowned young prince stands in a stone chariot under a canopy of stars, with a walled city and a river behind him. He wears armour with crescent moons on the shoulders and holds a wand like a sceptre. Two sphinxes, one black and one white, sit before the chariot, and there are no reins: he steers them by will. On the chariot’s front is a winged disc.',
    upright:
      'The Chariot is victory won by self-command. Two forces pull different ways, and the driver holds them together by focus and resolve. Waite gives succour, providence, war, triumph, vengeance and trouble: it is a card of struggle that comes out well. Upright, it says you can get where you are going if you keep your eyes on it and don’t let either sphinx have its head.',
    reversed:
      'Reversed, the chariot stalls or runs wild. The opposing forces win, direction is lost, or you are forcing your way and running over everything in your path. Waite gives riot, quarrel, dispute and defeat. Ease the reins, find your bearing, and decide where you’re actually going before you set off again.',
    correspondences:
      'Number 7. Golden Dawn: the sign of Cancer, cardinal water, ruled by the Moon; the Hebrew letter Cheth (fence or enclosure); the path between Binah and Geburah. The moons on his armour are Cancer’s; the enclosure is the chariot itself, the protected self that moves through the world.',
    love:
      'Determination in love: pursuing someone, or two people pulling together through difficulty. Getting a relationship back on track. Reversed, a power struggle, or a relationship heading in two directions at once.',
    work:
      'Ambition, drive and a goal won through effort. Good for competitions, moves, travel and pushing a project over the line. Reversed, scattered energy, a stalled project, or winning at too high a cost.',
    spirit:
      'Disciplined will in practice. Set a goal for your craft and pursue it. The card also asks you to master inner opposites rather than suppress one of them. Both sphinxes are yours.',
    question: 'Which two parts of you are pulling different ways, and where do you want them both to go?',
  },
  '08-strength': {
    words: ['courage', 'patience', 'compassion'],
    image:
      'A woman in white, crowned and girdled with flowers, gently closes (or opens) the jaws of a lion. Over her head floats the same figure-of-eight sign of infinity that hangs above the Magician. A chain of flowers runs from her waist to the lion. Behind them is a blue mountain under a yellow sky. Waite numbered this card eight, swapping it with Justice from the older order to fit the Golden Dawn’s scheme.',
    upright:
      'Strength is courage as steadiness, and power that works through kindness. The lion isn’t beaten; it is tamed by patience and love. Waite gives power, energy, action, courage and magnanimity. Upright, it says you can meet the wild thing, in yourself or in the world, without breaking it or being broken. Be patient, be brave, and be gentle with yourself.',
    reversed:
      'Reversed, the lion is loose or you’ve lost faith that you can hold it. It can mean self-doubt, raw temper, impatience, or strength used as force. Waite gives despotism, abuse of power, weakness and discord. Breathe, come back to your body, and try again more softly.',
    correspondences:
      'Number 8 in Waite’s deck (11 in older ones). Golden Dawn: the sign of Leo, fixed fire, ruled by the Sun; the Hebrew letter Teth (serpent); the path between Chesed and Geburah, mercy and severity. The lion is Leo; the card balances the two.',
    love:
      'Love that is patient and brave: forgiving, steady, warm. Taming a difficult dynamic with compassion rather than force. Reversed, insecurity, jealousy, or tempers flaring.',
    work:
      'Quiet confidence and resilience. Handle difficult people and pressure with calm. Persistence wins here. Reversed, burnout, self-doubt, or losing your temper when it matters.',
    spirit:
      'Shadow work done kindly. Befriend the parts of yourself you’d rather not see. Animal allies, the body, breath. Strength in practice is endurance and gentleness together.',
    question: 'What wild thing in you needs patience rather than a cage?',
  },
  '09-the-hermit': {
    words: ['solitude', 'wisdom', 'seeking'],
    image:
      'An old man in a grey hooded cloak stands alone on a snowy peak. In his right hand he holds up a lantern in which shines a six-pointed star, and in his left he leans on a long staff. The sky behind him is dark. Waite insists he is not seeking truth so much as showing it: his light is held up so that others may find their way.',
    upright:
      'The Hermit is wisdom found in solitude. Step back from the noise, go inward, and see your path by your own light. It can point to study, retreat, meditation, or a wise teacher who shows the way rather than leading you down it. Waite gives prudence and circumspection. Upright, it says a time apart will serve you, and that what you find may light the way for someone behind you.',
    reversed:
      'Reversed, solitude has become isolation, or the quiet you need is being refused. It can mean loneliness, withdrawal, or rejecting good counsel. Waite gives concealment, disguise, policy, fear and unreasoned caution. Come down the mountain if you’ve stayed too long, or climb it if you’ve been avoiding the climb.',
    correspondences:
      'Number 9. Golden Dawn: the sign of Virgo, mutable earth, ruled by Mercury; the Hebrew letter Yod (hand), the small flame from which the other letters are said to grow; the path between Chesed and Tiphareth.',
    love:
      'Time alone, by choice or by need, to understand what you want. A slow, thoughtful love. Reversed, loneliness, or withdrawing from someone who is reaching for you.',
    work:
      'Research, study, specialist knowledge, mentoring. Work best done alone and carefully. Reversed, cutting yourself off from colleagues, or being unwilling to share what you know.',
    spirit:
      'Retreat, meditation, journaling and solitary practice. A season for inner work over group work. Light your lantern and walk slowly.',
    question: 'What would you hear if the noise around you stopped for a week?',
  },
  '10-wheel-of-fortune': {
    words: ['cycles', 'fate', 'change'],
    image:
      'A great wheel floats in a blue sky. On its rim are the letters T, A, R, O, which read as ROTA, TARO and other words, alternating with the Hebrew letters of the divine name. Inside are the alchemical signs for mercury, sulphur, salt and water. A sphinx with a sword sits on top, a serpent slides down the left side, and a jackal-headed figure rises on the right. In the four corners, winged creatures read books on clouds: an angel, an eagle, a lion and a bull.',
    upright:
      'The Wheel is the turning of fortune, and the larger cycles we are part of. What was down comes up, what was up comes down. Waite gives destiny, fortune, success, elevation and luck. Upright, it often marks a turning point for the better, or a change you didn’t set in motion. Ride it well: notice the pattern, and act at the right moment.',
    reversed:
      'Reversed, the wheel turns the other way for a while. Things go against you, or you resist a change that is coming regardless. Waite gives increase, abundance and superfluity, which modern readers rarely use; most read a downturn or bad timing. Remember that the wheel keeps turning. Tend what you can and let go of what you can’t.',
    correspondences:
      'Number 10. Golden Dawn: the planet Jupiter, the Hebrew letter Kaph (palm of the hand); the path between Chesed and Netzach. Jupiter is the greater fortune, expansive and generous; the open palm receives what comes.',
    love:
      'A turning point: a chance meeting, a reunion, or a new phase in a relationship. Something feels fated. Reversed, the timing is wrong, or old patterns keep repeating.',
    work:
      'Luck, opportunity and change you didn’t plan. Seize the chance when the wheel comes up. Reversed, setbacks outside your control; ride them out and learn the cycle.',
    spirit:
      'The Wheel of the Year and every cycle: moon, season, life. Mark the turnings. Fate and free will meet here; learn which is which.',
    question: 'What pattern keeps coming round in your life, and what is it asking of you this time?',
  },
  '11-justice': {
    words: ['fairness', 'truth', 'consequence'],
    image:
      'A crowned figure in a red robe sits between two grey pillars with a purple veil hung between them. In the right hand is an upright double-edged sword; in the left, a pair of scales. A white shoe peeps from under the robe. Unlike older Justice cards, she is not blindfolded: she sees what she weighs. Waite placed this card at eleven, swapping it with Strength.',
    upright:
      'Justice is truth, fairness and cause and effect. What has been done will be weighed, and the outcome will be fair, though not always comfortable. Waite gives equity, rightness, probity and executive power. Upright, the card favours honesty, clear thinking, legal matters decided rightly, and taking responsibility for your choices.',
    reversed:
      'Reversed, the scales are tipped. Something isn’t being told straight, a decision is unfair, or a consequence is being dodged. Waite gives law in all its departments, legal complications, bigotry, bias and excessive severity. Set the record right where you can, and be honest about your own part.',
    correspondences:
      'Number 11 in Waite’s deck (8 in older ones). Golden Dawn: the sign of Libra, cardinal air, ruled by Venus; the Hebrew letter Lamed (ox-goad); the path between Geburah and Tiphareth. Libra is the scales; the goad keeps the ox to its furrow.',
    love:
      'Fairness and balance between two people. Honest conversations, agreements kept. Sometimes legal matters around partnership. Reversed, one-sidedness, blame, or an imbalance that needs naming.',
    work:
      'Contracts, legal decisions, fair dealing. Read the small print and act with integrity. Reversed, unfair treatment, or a dispute that needs careful handling.',
    spirit:
      'Ethics in practice: what you put out returns, not as punishment but as consequence. Work with truth, oaths and clear intention. Weigh your workings before you cast them.',
    question: 'If you looked at this situation with clear eyes and no excuses, what would you see?',
  },
  '12-the-hanged-man': {
    words: ['surrender', 'pause', 'perspective'],
    image:
      'A young man hangs upside down by one foot from a T-shaped cross of living wood, still in leaf. His free leg is bent behind the other to make a cross, and his hands are folded behind his back. His face is calm, even rapt, and a bright halo shines round his head. Waite stresses that it is not a punishment: the figure is in suspended life, not death.',
    upright:
      'The Hanged Man is a willing pause that turns the world upside down and shows it fresh. He has stopped struggling and in that stillness sees what he couldn’t see before. Waite gives wisdom, trials, sacrifice, intuition and prophecy. Upright, it asks you to stop pushing, let go of how you thought this would go, and look again from a different angle.',
    reversed:
      'Reversed, the pause has turned into being stuck, or the sacrifice is more than the moment asks. It can mean stalling, martyrdom, or impatience to get on before you’ve learned what the wait was for. Waite gives selfishness and the crowd. Ask what you are waiting for, and whether it is coming.',
    correspondences:
      'Number 12. Golden Dawn: the element of Water, the Hebrew letter Mem (water); the path between Geburah and Hod. Water dissolves and reflects; it shows the world upside down, as he sees it.',
    love:
      'A relationship in suspension, waiting for clarity. Seeing your partner, or yourself, in a new light. Reversed, waiting for someone to change, or giving too much of yourself away.',
    work:
      'A delay that could be useful: reassess before you act. A project paused, a decision put on hold. Reversed, procrastination, or effort that goes nowhere because the approach needs changing.',
    spirit:
      'Surrender in practice: trance, meditation, vigil, and the lesson of Odin hanging on the tree for the runes. Insight that comes from letting go rather than grasping.',
    question: 'What might you see if you stopped trying to make this go your way?',
  },
  '13-death': {
    words: ['endings', 'transformation', 'release'],
    image:
      'A skeleton in black armour rides a white horse, carrying a black banner marked with a white five-petalled rose. A king lies fallen beneath the hooves. A bishop stands with his hands joined, a maiden turns her face away, and a child kneels and looks up. Behind them a river flows past a boat, and a sun shines between two towers on the far horizon.',
    upright:
      'Death is rarely about a physical death. It is the end of a chapter: a relationship, a job, a way of being. And it is the clearing that makes room for what comes next. Waite gives end, mortality, destruction and corruption, but notes it often means transformation. Upright, it says something is finished. Let it be finished, grieve it if you need to, and look to the sun between the towers.',
    reversed:
      'Reversed, an ending is being resisted. You may be holding on to something that has already gone, and nothing new can grow while you do. It can mean stagnation, fear of change, or a slow ending dragged out. Waite gives inertia, sleep, lethargy and petrifaction. The change will come anyway; meet it.',
    correspondences:
      'Number 13. Golden Dawn: the sign of Scorpio, fixed water, ruled by Mars; the Hebrew letter Nun (fish); the path between Tiphareth and Netzach. Scorpio is death and rebirth, the scorpion and the eagle; the fish lives in the deep water of change.',
    love:
      'The end of a relationship or of a phase within one: the old way of being together has to die so a new one can begin. Reversed, holding on to a relationship that has ended, or fear of letting it change.',
    work:
      'A job or project ending, a restructure, a door closing. Often the start of something better, once the grief is done. Reversed, staying in a role you’ve outgrown.',
    spirit:
      'Ancestor work, Samhain, and the mysteries of death and renewal. Banishing, release and cutting cords. Honour what ends; the mystic rose on the banner is life beyond it.',
    question: 'What in your life has already ended, and are you ready to let it go?',
  },
  '14-temperance': {
    words: ['balance', 'moderation', 'patience'],
    image:
      'A winged angel in white stands with one foot on the land and one in a pool, pouring water from one cup into another. On the robe’s breast is a square with a triangle inside it, and on the brow a sign of the sun. Yellow irises grow beside the water. A path winds from the pool towards distant mountains, where a crown of light shines.',
    upright:
      'Temperance is the right mix, found slowly. It is balance, moderation and the patient blending of opposites until they make something new. Waite gives economy, moderation, frugality, management and accommodation. Upright, it asks for a middle way: don’t force, don’t rush, keep one foot on land and one in the water. Healing and harmony come in their own time.',
    reversed:
      'Reversed, the mix is off. Too much of one thing and not enough of another; haste spills the water. It can point to excess, imbalance, conflict of interests or impatience. Waite gives things connected with churches and priesthoods, and also disunion and competing interests. Slow down and find the middle again.',
    correspondences:
      'Number 14. Golden Dawn: the sign of Sagittarius, mutable fire, ruled by Jupiter; the Hebrew letter Samekh (prop or support); the path between Tiphareth and Yesod. The archer aims straight up the path to the crown of light.',
    love:
      'A balanced, patient love; compromise that works for both. Healing after conflict. Reversed, one partner giving too much, or arguments from imbalance and impatience.',
    work:
      'Steady progress, good management, blending skills or teams. Moderation in spending and effort. Reversed, overwork, overspending, or a team that won’t mix.',
    spirit:
      'Alchemy in the old sense: blending opposites into gold. Good for healing work, potions and herbal blends, and finding a sustainable rhythm in practice.',
    question: 'What in your life needs a little less, and what needs a little more?',
  },
  '15-the-devil': {
    words: ['bondage', 'temptation', 'shadow'],
    image:
      'A horned, goat-headed figure with bat wings squats on a black half-cube. An inverted pentagram glows on its brow, its right hand is raised, and its left holds a lit torch pointed down. A naked man and woman, like the Lovers grown small horns and tails, stand chained to the block by the neck. The chains hang loose: they could lift them off.',
    upright:
      'The Devil is attachment: habits, cravings, fears and bargains that bind us more by our consent than by force. It is the shadow side of desire, the material world held too tightly. Waite gives ravage, violence and fatality. Upright, it asks you to look honestly at what you are chained to, and to notice that the chains are loose. Naming the thing is the first step to freedom.',
    reversed:
      'Reversed, the chains are coming off, or you’re finally seeing them for what they are. It can mean release from an addiction or a bad situation, or facing the shadow at last. Waite gives evil fatality, weakness, pettiness and blindness, but most readers today read the reversal as release. Keep going.',
    correspondences:
      'Number 15. Golden Dawn: the sign of Capricorn, cardinal earth, ruled by Saturn; the Hebrew letter Ayin (eye); the path between Tiphareth and Hod. The goat is Capricorn; the eye is how we see, and how we can be deceived.',
    love:
      'Intense attraction, obsession, or a relationship held together by habit, fear or dependence. Reversed, breaking free of an unhealthy bond.',
    work:
      'Feeling trapped by money, a job or ambition. Golden handcuffs. Reversed, finding a way out, or seeing the trap clearly enough to plan your escape.',
    spirit:
      'Shadow work: meet what you deny in yourself. Cord-cutting and freeing rituals. Honour pleasure and the body without being ruled by them.',
    question: 'What are you chained to, and what would happen if you lifted the chain off?',
  },
  '16-the-tower': {
    words: ['upheaval', 'revelation', 'awakening'],
    image:
      'A tall grey tower stands on a rocky peak against a black sky. Lightning strikes its top and knocks off a crown, flames burst from its windows, and two figures, one crowned, fall headfirst from it. Small tongues of flame shaped like the Hebrew letter Yod fall through the air around them.',
    upright:
      'The Tower is sudden change. What was built on a false foundation comes down, quickly, often painfully. It can be a shock, a revelation, a crisis or a truth you can’t unsee. Waite gives distress, ruin, disgrace, deception and unforeseen calamity. Upright, it is hard, but it clears the ground for something truer. After the Tower comes the Star.',
    reversed:
      'Reversed, the fall is feared, held off, or happening slowly from the inside. You may have narrowly escaped disaster, or only delayed it. Waite gives the same in a lesser degree: oppression and imprisonment. Better to take down a crumbling wall yourself than wait for the lightning.',
    correspondences:
      'Number 16. Golden Dawn: the planet Mars, the Hebrew letter Peh (mouth); the path between Netzach and Hod. Mars is force and fire; the mouth speaks the word that brings walls down.',
    love:
      'A sudden break, a revelation, or a crisis that shakes the foundations. Sometimes a relationship that survives it is stronger. Reversed, avoiding a needed confrontation, or a slow crumbling.',
    work:
      'Sudden change: redundancy, collapse of a plan, a shock that forces a new direction. Reversed, a narrow escape, or warning signs worth heeding now.',
    spirit:
      'Breakthrough and awakening. Old beliefs shattered by direct experience. Lightning is illumination as well as destruction.',
    question: 'What in your life is built on a foundation you no longer believe in?',
  },
  '17-the-star': {
    words: ['hope', 'healing', 'renewal'],
    image:
      'A naked woman kneels by a pool under a night sky, one knee on the land and one foot in the water. From two jugs she pours water, one into the pool and one onto the earth, where it runs in five streams. Above her shines a great eight-pointed star, with seven smaller stars around it. Behind her, on a tree on the hill, perches a bird.',
    upright:
      'After the Tower, the Star: hope, healing and quiet renewal. The storm has passed, and water is being poured back on the land. Waite gives loss, theft and abandonment in older lists, but also hope and bright prospects, which is how it is almost always read now. Upright, it says rest, things are being restored, and there is guidance if you look up.',
    reversed:
      'Reversed, the light seems far off. Hope is low, faith is shaken, the well feels dry. It can mean discouragement, disconnection or feeling unseen. Waite gives arrogance, haughtiness and impotence. The star is still there behind the cloud; tend yourself gently until you can see it again.',
    correspondences:
      'Number 17. Golden Dawn: the sign of Aquarius, fixed air, ruled by Saturn; the Hebrew letter Tzaddi (fish-hook); the path between Netzach and Yesod. Aquarius is the water-bearer, pouring for everyone.',
    love:
      'Healing after hurt; an open, honest love; hope returning. Reversed, feeling unloved or losing faith in love; be gentle with yourself first.',
    work:
      'Inspiration, renewed purpose, and work that serves something larger. A good card for creative and healing work. Reversed, discouragement; take a step back and remember why you started.',
    spirit:
      'Star magic, wishing, healing and water rites. Sit under a clear sky. Spiritual renewal after crisis; the soul’s quiet guidance.',
    question: 'What gives you hope, even now?',
  },
  '18-the-moon': {
    words: ['illusion', 'dreams', 'intuition'],
    image:
      'A full moon with a face in profile hangs in the sky, shedding drops shaped like the Hebrew letter Yod. Below, a dog and a wolf howl at it. From a pool in the foreground a crayfish crawls onto the land. A path runs from the pool between two towers and away into far hills.',
    upright:
      'The Moon is the uncertain path at night. Things aren’t as they seem; fear and imagination run together, and the unconscious rises like the crayfish from the pool. Waite gives hidden enemies, danger, darkness, terror, deception and error. Upright, it asks you to go carefully, trust your instincts more than appearances, and pay attention to dreams.',
    reversed:
      'Reversed, the fog is lifting. What frightened you looks smaller in better light, or a deception comes to the surface. Waite gives instability, inconstancy and silence, and lesser degrees of deception and error. Let what is hidden come out, and see it plainly.',
    correspondences:
      'Number 18. Golden Dawn: the sign of Pisces, mutable water, ruled by Jupiter; the Hebrew letter Qoph (back of the head); the path between Netzach and Malkuth. Pisces is the deep sea of the unconscious; the back of the head is the old brain, instinct and dream.',
    love:
      'Uncertainty, confusion, or something not being said. Projections and fantasies. Reversed, a truth coming out, or doubts clearing.',
    work:
      'Unclear situations; don’t sign anything until you understand it. Trust your gut about people. Reversed, confusion lifting, or a hidden problem surfacing in time to deal with it.',
    spirit:
      'Moon magic, dreamwork, divination and trance. The liminal and the uncanny. Work with your fears rather than around them.',
    question: 'What are you afraid of in the dark, and what does it look like in the light?',
  },
  '19-the-sun': {
    words: ['joy', 'success', 'vitality'],
    image:
      'A great sun with a face shines over a grey wall topped with sunflowers. In front, a naked child wearing a wreath with a red feather rides a white horse bareback, arms open, holding a long red banner. Nothing is hidden: the light falls on everything, and the child rides without saddle or bridle, perfectly at ease. Waite calls the child the great and holy light which goes before the endless procession of humanity.',
    upright:
      'The Sun is joy, warmth, clarity and plain happiness. Things are as good as they look. Waite gives material happiness, fortunate marriage and contentment. Upright, it speaks of success, health, energy and the delight of being alive, often with a childlike simplicity. After the uncertain path of the Moon, you can see where you are and where you are going. Enjoy it, and let others enjoy it with you; the Sun is generous.',
    reversed:
      'Reversed, the sun is behind a cloud, not gone. Joy may be dimmed, success slower or smaller than hoped, or you may be too sure of it. Waite gives the same in a lesser sense. It is still a good card. Look for the warmth that is there. Sometimes it asks you to let go of a need to shine and simply be glad.',
    correspondences:
      'Number 19. Golden Dawn: the Sun, the Hebrew letter Resh (head or face); the path between Hod and Yesod. The Sun is the centre around which the rest of the system turns.',
    love:
      'Happiness, warmth and openness. A joyful relationship, a celebration, sometimes a child. Honesty comes easily, and play matters as much as plans. Reversed, a passing cloud; don’t let small troubles hide what’s good.',
    work:
      'Success, recognition and energy. Things go well, and your work is seen. A good time to step forward, apply, present or launch. Reversed, success delayed or a bit of overconfidence; keep going.',
    spirit:
      'Solar magic, Litha and every summer festival. Greet the sun in the morning, work with sunflowers, gold and marigold. Celebrate. Spirit as joy, not only as discipline.',
    question: 'What makes you feel fully alive, and how could you have more of it?',
  },
  '20-judgement': {
    words: ['awakening', 'calling', 'renewal'],
    image:
      'A great angel blows a trumpet from the clouds; from it hangs a banner with a red cross. Below, men, women and children rise from open coffins that float on water, arms raised to the sky. Snowy mountains stand behind. The scene is the Last Judgement, but Waite reads it as a summons from within: the call to rise into new life.',
    upright:
      'Judgement is the trumpet call: an awakening, a reckoning with the past, and rising into something new. It can mean a calling, a second chance, or a decision made with full understanding of what went before. Waite gives change of position, renewal and outcome. Upright, you know what you are being called to. Answer.',
    reversed:
      'Reversed, the trumpet is sounding and you are pretending not to hear, or judging yourself too harshly to get up. It can mean self-doubt, regret, or a decision put off. Waite gives weakness, cowardice, simplicity, and deliberation or decision. Forgive what needs forgiving, and rise.',
    correspondences:
      'Number 20. Golden Dawn: the element of Fire (and of Spirit), the Hebrew letter Shin (tooth); the path between Hod and Malkuth. Shin is the fire of spirit coming down into the four elements.',
    love:
      'A turning point; a reckoning; a love renewed or ended with understanding. Reunions. Reversed, holding on to old hurts, or fear of being judged.',
    work:
      'A calling, a vocation, a decision about your direction. Answering the call to the work that is yours. Reversed, ignoring the call, or self-doubt holding you back.',
    spirit:
      'Rebirth and initiation. Ancestor work and the voice that calls you to your path. Reflect, forgive and rise.',
    question: 'What is calling you, and what do you need to forgive in order to answer?',
  },
  '21-the-world': {
    words: ['completion', 'wholeness', 'fulfilment'],
    image:
      'A dancing figure wrapped in a violet scarf floats inside a large oval wreath of leaves, bound at top and bottom with red ribbons. In each hand she holds a wand. In the four corners are the same four creatures as on the Wheel of Fortune: an angel, an eagle, a lion and a bull, the fixed signs of the zodiac.',
    upright:
      'The World is completion: a cycle finished well, everything in its place, the circle closed. Waite gives assured success, recompense, voyage and route. Upright, it speaks of achievement, wholeness and arrival, the joy of a job done and a self fully inhabited. Celebrate, then ready yourself for the next beginning; after the World comes the Fool again.',
    reversed:
      'Reversed, the circle isn’t quite closed. Something is unfinished, a shortcut has left a gap, or you can’t quite let a chapter end. Waite gives inertia, fixity and stagnation. Finish it properly, and the circle closes.',
    correspondences:
      'Number 21. Golden Dawn: the planet Saturn (and the element of Earth), the Hebrew letter Tav (cross or mark); the path between Yesod and Malkuth. Tav is the last letter, the seal on the whole.',
    love:
      'Fulfilment and wholeness; a relationship that has come into its own, or a cycle of love completed. Reversed, unfinished business, or not quite letting go.',
    work:
      'Success, completion, recognition. Travel and international work. Reversed, a project nearly done; don’t stop at ninety per cent.',
    spirit:
      'Integration: all four elements and spirit at the centre. Mark endings with ritual. You are part of the whole dance.',
    question: 'What in your life is complete, and have you let yourself feel it?',
  },
};
