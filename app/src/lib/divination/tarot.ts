// The 78 cards of the Rider–Waite–Smith deck (Pamela Colman Smith's 1909
// art, public domain), with upright and reversed meanings after A. E. Waite's
// Pictorial Key to the Tarot, put plainly. Names match the reading log's
// TAROT list exactly, so a drawn card saves as the same name you'd pick by
// hand. Pure data.

export type Suit = 'Wands' | 'Cups' | 'Swords' | 'Pentacles';

export type Meaning = {
  /** A few words: "hope, renewal, calm". */
  keywords: string;
  /** Two or three sentences. */
  text: string;
};

export type TarotCard = {
  /** Stable id and the picture's file name: "00-the-fool", "cups-07". */
  id: string;
  /** As in the reading log: "The Fool", "Seven of Cups". */
  name: string;
  arcana: 'major' | 'minor';
  suit: Suit | null;
  upright: Meaning;
  reversed: Meaning;
};

type Pair = [string, string];

const major = (n: number, name: string, up: Pair, rev: Pair): TarotCard => ({
  id: `${String(n).padStart(2, '0')}-${name.toLowerCase().replace(/^the /, 'the-').replace(/ /g, '-')}`,
  name,
  arcana: 'major',
  suit: null,
  upright: { keywords: up[0], text: up[1] },
  reversed: { keywords: rev[0], text: rev[1] },
});

const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];

const suit = (name: Suit, cards: [Pair, Pair][]): TarotCard[] =>
  cards.map(([up, rev], i) => ({
    id: `${name.toLowerCase()}-${String(i + 1).padStart(2, '0')}`,
    name: `${RANKS[i]} of ${name}`,
    arcana: 'minor',
    suit: name,
    upright: { keywords: up[0], text: up[1] },
    reversed: { keywords: rev[0], text: rev[1] },
  }));

export const MAJORS: TarotCard[] = [
  major(
    0,
    'The Fool',
    ['beginnings, trust, the open road', 'A step off the edge with the sun on your face: a new start taken in trust rather than certainty. The Fool carries little and expects much of the road. Go lightly, and keep the small dog of good sense at your heels.'],
    ['carelessness, a leap not looked at, holding back', 'Either the step is taken without looking, or it isn’t taken at all. Ask which: are you being reckless, or is fear dressed up as caution? Check the ground, then decide.'],
  ),
  major(
    1,
    'The Magician',
    ['will, skill, the tools to hand', 'Everything you need is on the table: wand, cup, sword and coin. This is the card of focused will and the skill to use what you have. Name what you want and set to it.'],
    ['scattered will, trickery, unused gifts', 'Skill turned to show, or to sleight of hand, yours or someone else’s. It can also mean talents left lying on the table. Look for where the energy is leaking.'],
  ),
  major(
    2,
    'The High Priestess',
    ['secrets, intuition, the inner voice', 'She sits between the pillars with the scroll half hidden: what’s known here isn’t spoken aloud. Trust what you sense before you can explain it. Be still and let it come.'],
    ['surface knowledge, ignored instinct, secrets surfacing', 'The inner voice is being talked over, or something hidden is coming into the open. Stop gathering opinions and listen to your own. What do you already know?'],
  ),
  major(
    3,
    'The Empress',
    ['abundance, nurture, fruitfulness', 'Ripe corn, running water, a garden in full leaf. The Empress is growth, comfort and creative plenty, the body and the earth well tended. Something you’ve cared for is ready to flourish.'],
    ['neglect, smothering, blocked growth', 'The garden is either untended or overwatered. Care may be going everywhere but to yourself, or holding too tightly. Feed the roots again.'],
  ),
  major(
    4,
    'The Emperor',
    ['structure, authority, steadiness', 'Stone throne, armour under the robe: order that protects. This is the card of rules, plans and holding firm. Put a frame around what matters.'],
    ['rigidity, control, or no structure at all', 'Order gone hard and cold, or missing altogether. Watch for someone, maybe you, ruling by force of habit. Bend where you can, and set limits where you must.'],
  ),
  major(
    5,
    'The Hierophant',
    ['tradition, teaching, belonging', 'The keeper of the keys and the old forms. A teacher, a lineage, a community’s way of doing things. There is wisdom in what’s been handed down; learn it before you change it.'],
    ['breaking from convention, empty dogma', 'The old form no longer fits, or is being kept for its own sake. You may need your own way through. Keep what is true and leave the rest with thanks.'],
  ),
  major(
    6,
    'The Lovers',
    ['love, union, a true choice', 'Two people under an angel’s blessing: love, and the choice that love asks for. Waite saw it as attraction and trial together. Choose in line with what you truly value.'],
    ['imbalance, misaligned values, a choice dodged', 'Something is out of step between you and another, or between what you want and what you do. A choice is being put off. Make it honestly.'],
  ),
  major(
    7,
    'The Chariot',
    ['will, direction, victory', 'Two sphinxes pulling different ways, and the driver holds them with will alone. This is success won by self-command. Keep your eyes on where you’re going.'],
    ['lost direction, forcing, stalling', 'The sphinxes are pulling apart and the chariot stands still, or it runs over everything. Ease the reins and find your bearing again.'],
  ),
  major(
    8,
    'Strength',
    ['gentle courage, patience, compassion', 'A woman closes the lion’s mouth with her hands, not a weapon. This is strength as steadiness and kindness, mastering the wild thing without breaking it. Be patient with yourself and others.'],
    ['self-doubt, raw temper, weakness', 'The lion is loose, or you’ve stopped believing you can hold it. Fear or anger has the upper hand for now. Breathe, then try again softly.'],
  ),
  major(
    9,
    'The Hermit',
    ['solitude, inner light, seeking', 'An old man on the mountain with his lantern: wisdom found alone and in quiet. Step back from the noise to see your path. Your light may also guide someone behind you.'],
    ['isolation, withdrawal, refusing counsel', 'Solitude gone on too long, or turned into hiding. Or the quiet you need is being refused. Come down the mountain, or climb it, whichever you’ve been avoiding.'],
  ),
  major(
    10,
    'Wheel of Fortune',
    ['cycles, fate, a turning point', 'The wheel turns and what was down comes up. Luck, timing and the larger pattern you’re part of. Something is changing that you didn’t set in motion; ride it well.'],
    ['a downturn, resisting change, bad timing', 'The wheel is turning the other way for now. Clinging to how things were makes it harder. This too will turn; tend what you can.'],
  ),
  major(
    11,
    'Justice',
    ['fairness, truth, cause and effect', 'Sword raised, scales level. What has been done will be weighed, and the outcome will be fair. Be honest, and accept what follows from your choices.'],
    ['unfairness, dishonesty, dodging accountability', 'The scales are tipped. Something isn’t being told straight, or a consequence is being avoided. Set the record right where you can.'],
  ),
  major(
    12,
    'The Hanged Man',
    ['surrender, pause, a new way of seeing', 'He hangs by one foot, calm, with light round his head. A willing pause that turns the world upside down and shows it fresh. Stop pushing; let go and look again.'],
    ['stalling, needless sacrifice, impatience', 'The pause has become being stuck, or you’re giving up more than the moment asks. What are you waiting for, and is it coming?'],
  ),
  major(
    13,
    'Death',
    ['endings, transformation, clearing', 'Rarely a physical death: the end of a chapter, and the clearing that makes room for the next. The sun rises between the towers behind him. Let what is finished be finished.'],
    ['resisting an ending, lingering, stagnation', 'Something that has ended is being held onto, and nothing new can grow while it is. The change will come anyway; meet it.'],
  ),
  major(
    14,
    'Temperance',
    ['balance, moderation, patience', 'An angel pours water between two cups, one foot on land and one in the stream. The right mix, found slowly. Blend, don’t force; middle ways work here.'],
    ['excess, imbalance, haste', 'Too much of one thing and not enough of another. Rushing the mixing spills it. Find the middle again.'],
  ),
  major(
    15,
    'The Devil',
    ['attachment, temptation, the shadow', 'Two figures chained to the Devil’s perch, though the chains hang loose round their necks. Habits, cravings and bargains that bind us more by our consent than by force. Look at what you’re tied to.'],
    ['release, breaking free, facing the shadow', 'The chains are coming off, or you’re seeing them clearly at last. Freedom begins with naming the thing. Keep going.'],
  ),
  major(
    16,
    'The Tower',
    ['upheaval, revelation, sudden change', 'Lightning strikes the crown and the tower falls. What was built on a false foundation comes down, suddenly. Hard, but it clears the ground for something truer.'],
    ['upheaval delayed, fear of change, a narrow escape', 'The fall is feared, held off or happening slowly from the inside. You may have avoided disaster, or only put it off. Better to take down the wall yourself.'],
  ),
  major(
    17,
    'The Star',
    ['hope, renewal, calm', 'After the Tower, the Star: water poured on the land and back into the pool under a sky full of light. Healing, faith and quiet guidance. Rest; things are being restored.'],
    ['discouragement, lost faith, disconnection', 'The light seems far off. Hope is low and the well feels dry. It is still there; tend yourself gently until you can see it again.'],
  ),
  major(
    18,
    'The Moon',
    ['illusion, fear, the unconscious', 'A path between two towers under a dim moon, a dog and a wolf howling, something rising from the water. Not everything is as it seems. Go carefully and trust your instincts more than appearances.'],
    ['confusion lifting, fears released, truth emerging', 'The fog is thinning and what frightened you looks smaller in better light. Or a deception is coming to the surface. Let it.'],
  ),
  major(
    19,
    'The Sun',
    ['joy, success, vitality', 'A child on a white horse under a full sun. Warmth, clarity, success and plain happiness. Things are as good as they look; enjoy them.'],
    ['joy dimmed, delay, overconfidence', 'The sun is behind a cloud, not gone. Success may be slower or smaller than hoped, or you may be too sure of it. Still a good card.'],
  ),
  major(
    20,
    'Judgement',
    ['awakening, reckoning, a calling', 'The trumpet sounds and the dead rise from their graves. A call to wake up, to answer for the past and rise into something new. You know what you are being called to.'],
    ['self-doubt, refusing the call, harsh judgement', 'The trumpet is sounding and you’re pretending not to hear, or judging yourself too harshly to answer. Forgive what needs forgiving and get up.'],
  ),
  major(
    21,
    'The World',
    ['completion, wholeness, arrival', 'The dancer within the wreath, the four living creatures in the corners. A cycle finished well, everything in its place. Celebrate, and ready yourself for the next beginning.'],
    ['loose ends, incompletion, shortcuts', 'Nearly there, but something isn’t done. A shortcut may have left a gap. Finish it properly and the circle closes.'],
  ),
];

const WANDS = suit('Wands', [
  [
    ['inspiration, a spark, a new venture', 'A hand from the cloud holds out a budding wand. A new idea, a creative fire, the start of an enterprise. Take hold of it while it’s hot.'],
    ['delays, false starts, lost spark', 'The spark is there but won’t catch, or it’s fizzled. Don’t force it; find what would feed it.'],
  ],
  [
    ['planning, the wider world, decisions', 'He stands on the battlements with the world in his hand, one wand fixed and one held. Your plans are made and the horizon calls. Decide which way to go.'],
    ['fear of the unknown, poor planning', 'Staying safe behind the walls instead of going out. Or plans made without enough looking. Look further before you set off.'],
  ],
  [
    ['expansion, foresight, ships coming in', 'He watches his ships go out across the bay. Plans under way, trade and travel, the first returns on effort. Look ahead; more is coming.'],
    ['delays, obstacles, plans adrift', 'The ships are slow to come home. Plans meet setbacks or were made without enough foresight. Adjust the course.'],
  ],
  [
    ['celebration, homecoming, harmony', 'Garlands between four wands and people dancing at the gate. A festival, a homecoming, a settled place to rest. Enjoy what’s been built.'],
    ['unsettled home, a transition, quieter joy', 'Still a happy card, but less settled: a move, or harmony with a shadow on it. Find your footing.'],
  ],
  [
    ['conflict, competition, scuffling', 'Five young men brandishing wands, more sport than war. Rivalry, crossed purposes, a lot of noise. Find what the fight is really about.'],
    ['avoiding conflict, tension easing', 'The scuffle ends, or is being avoided when it should be had. Speak plainly and settle it.'],
  ],
  [
    ['victory, recognition, good news', 'A rider crowned with laurel, a crowd around him. Success seen by others, a deserved public win. Accept the praise gracefully.'],
    ['a fall from favour, ego, delay', 'Recognition doesn’t come, or goes to your head. Keep your worth independent of applause.'],
  ],
  [
    ['standing your ground, defence, conviction', 'One man on high ground holds off six wands from below. You have the advantage; defend what matters. Don’t give way.'],
    ['overwhelmed, giving up, worn down', 'Too many attacks at once and you’re tempted to step down. Choose which ground is worth holding.'],
  ],
  [
    ['speed, swift action, news', 'Eight wands flying through open air. Things move fast now: messages, travel, plans coming together. Go with it.'],
    ['delays, frustration, scattered energy', 'The wands are falling short or flying everywhere. Slow down and aim.'],
  ],
  [
    ['resilience, guardedness, the last stretch', 'Bandaged and wary, he leans on his wand with eight behind him. You’ve come through a lot and you’re nearly there. Hold on.'],
    ['exhaustion, defensiveness, suspicion', 'Guarding so hard you can’t rest, or too tired to keep guard. Let someone help.'],
  ],
  [
    ['burden, responsibility, overload', 'He carries ten wands bundled in his arms and can barely see past them. Too much taken on. Ask what you can put down.'],
    ['putting the load down, delegating, collapse', 'Either the burden is being shared at last, or it’s about to fall. Put it down before it drops you.'],
  ],
  [
    ['enthusiasm, news, exploring', 'A young messenger looking up at his budding wand. Good news, a new interest, an eager start. Be curious.'],
    ['scattered, bad news, hasty', 'Enthusiasm without follow-through, or news that disappoints. Steady before you run.'],
  ],
  [
    ['energy, adventure, boldness', 'A knight on a rearing horse, off on a journey. Passion and action, sometimes impulsive. Go, but know where.'],
    ['haste, recklessness, frustration', 'All fire and no aim. Plans rushed or abandoned. Count to ten.'],
  ],
  [
    ['confidence, warmth, determination', 'She holds a sunflower, a black cat at her feet. Warm, capable, generous and sure of herself. Lead with your heart and your nerve.'],
    ['jealousy, burnout, self-doubt', 'The warmth turns sharp or the fire runs low. Tend your own flame first.'],
  ],
  [
    ['leadership, vision, enterprise', 'A king with salamanders on his throne, looking out. Bold, honest leadership and a vision others follow. Take charge of the venture.'],
    ['impulsive, overbearing, high expectations', 'Vision without patience, or command without listening. Lead, don’t drive.'],
  ],
]);

const CUPS = suit('Cups', [
  [
    ['love, an open heart, overflow', 'A cup overflowing with five streams, a dove bringing the host. New love, joy, compassion pouring in. Let your heart be open.'],
    ['blocked feeling, emptiness, love held back', 'The cup is tipped or dry. Feelings held in, or not received. Be gentle with yourself first.'],
  ],
  [
    ['partnership, attraction, mutual respect', 'Two people pledging cups under the winged lion. A meeting of hearts, a friendship or a love, given and returned. Honour it.'],
    ['imbalance, a broken bond, distrust', 'One cup fuller than the other. A partnership out of step. Talk before it breaks.'],
  ],
  [
    ['friendship, celebration, community', 'Three women raise their cups in the harvest. Joy shared with friends, good company and gathering. Celebrate together.'],
    ['overindulgence, gossip, one too many', 'The party goes on too long, or a friendship sours with talk. Look after the circle.'],
  ],
  [
    ['apathy, contemplation, an offer overlooked', 'He sits under a tree, arms folded, while a hand offers a fourth cup. Discontent and turning inward. Is something good being missed?'],
    ['renewed interest, accepting, waking up', 'He looks up and sees the cup. Interest returns. Say yes to what’s offered.'],
  ],
  [
    ['loss, grief, regret', 'A cloaked figure mourns three spilled cups; two still stand behind him. Grief for what’s gone. When you’re ready, turn around.'],
    ['acceptance, moving on, forgiveness', 'The mourning lifts. You can see what remains and begin to pick it up.'],
  ],
  [
    ['nostalgia, childhood, kindness', 'A child gives another a cup of flowers in an old garden. Memories, innocence, simple kindness. Something from the past returns sweetly.'],
    ['stuck in the past, rose-coloured memory', 'Living back there rather than here. Keep the memory and come home to now.'],
  ],
  [
    ['choices, daydreams, illusion', 'Seven cups in the clouds, each holding a different vision. Too many options and some of them fantasies. Choose what is real.'],
    ['clarity, decision, seeing through', 'The clouds part and you can see what each cup really holds. Choose.'],
  ],
  [
    ['walking away, seeking more, disappointment', 'He leaves eight stacked cups by moonlight and climbs into the hills. Walking away from what no longer satisfies. Go and find the deeper thing.'],
    ['fear of leaving, drifting, hesitation', 'You know you should go and you stay, or you wander without aim. Decide.'],
  ],
  [
    ['contentment, wishes granted, satisfaction', 'The wish card: a well-fed man before nine cups, pleased with himself. Comfort, pleasure, a wish come true. Enjoy it.'],
    ['smugness, dissatisfaction, excess', 'Having it all and wanting more, or showing off. What would truly satisfy?'],
  ],
  [
    ['happiness, family, harmony', 'A couple and their children beneath a rainbow of cups. Lasting joy, home and love that holds. Treasure it.'],
    ['broken harmony, family strain', 'The rainbow fades. A home at odds or a dream of family that doesn’t match the real one. Mend what you can.'],
  ],
  [
    ['a message of feeling, intuition, a dreamer', 'A young person looks at a fish rising from his cup. A surprise of the heart, a creative idea, a gentle message. Be open to it.'],
    ['emotional immaturity, moodiness, blocked creativity', 'Feelings running ahead of sense, or a dream not acted on. Grow it up a little.'],
  ],
  [
    ['romance, an invitation, following the heart', 'A knight rides slowly, holding out his cup. An offer, an invitation, romance or art. Follow the heart, gracefully.'],
    ['moodiness, unrealistic, jealousy', 'All charm and no substance, or a promise not kept. Look past the gesture.'],
  ],
  [
    ['compassion, intuition, emotional depth', 'She gazes into her closed cup at the sea’s edge. Deep feeling, care, a gift for knowing what others need. Trust your heart.'],
    ['martyrdom, codependence, overwhelmed', 'Giving too much and drowning in it. Look after your own heart.'],
  ],
  [
    ['emotional balance, diplomacy, calm', 'A king on a throne afloat on a rough sea, steady. Feeling held with wisdom; calm in the storm. Be kind and composed.'],
    ['moodiness, manipulation, feelings repressed', 'The calm is a mask, or the sea has taken the throne. Let feeling out honestly.'],
  ],
]);

const SWORDS = suit('Swords', [
  [
    ['clarity, truth, a breakthrough', 'A hand from the cloud grips a crowned sword. A clear idea, a hard truth, the power to cut through. Speak it.'],
    ['confusion, misused force, clouded thinking', 'The blade is turned the wrong way: words used to wound, or a truth not seen. Think again before you strike.'],
  ],
  [
    ['stalemate, a hard choice, avoidance', 'Blindfolded, she holds two crossed swords before the sea. A choice refused, a truce held by not looking. Take off the blindfold.'],
    ['indecision overload, the truth comes out', 'The stalemate breaks, one way or another. Better to choose than have it chosen for you.'],
  ],
  [
    ['heartbreak, grief, sorrow', 'Three swords through a heart in the rain. Pain, plainly. Let it be felt; it passes through.'],
    ['recovery, releasing pain, forgiveness', 'The rain eases. The worst is over and healing has begun.'],
  ],
  [
    ['rest, recovery, retreat', 'A knight lies on his tomb in prayer, one sword beneath him. Rest after struggle; a truce. Recover your strength.'],
    ['restlessness, burnout, back too soon', 'Rest refused, or you’re up before you’ve healed. Lie down again.'],
  ],
  [
    ['conflict, a hollow win, defeat', 'He gathers the swords while the others walk away. A win that costs more than it’s worth. Is this the fight to have?'],
    ['reconciliation, making amends, letting go', 'The quarrel ends. Lay the swords down and make peace.'],
  ],
  [
    ['passage, leaving trouble behind, transition', 'A ferryman carries a woman and child across to calmer water. Moving on from hard times, slowly. The far shore is calmer.'],
    ['unfinished business, resisting the move', 'The boat won’t leave, or the trouble comes along. What still needs settling?'],
  ],
  [
    ['deception, stealth, strategy', 'A man slips away from camp with five swords, looking back. Cunning, getting away with something, going it alone. Is it you, or someone near you?'],
    ['coming clean, conscience, being found out', 'The secret is out, or ready to be. Own it.'],
  ],
  [
    ['restriction, feeling trapped, self-limiting', 'Bound and blindfolded among eight swords, but the way out is open. A trap more of the mind than of the world. Take one step.'],
    ['release, a new perspective, freedom', 'The blindfold slips. You see the way out at last.'],
  ],
  [
    ['anxiety, worry, sleepless nights', 'She sits up in bed with her face in her hands, nine swords on the wall. Fear at three in the morning. It looks worse in the dark.'],
    ['hope, reaching out, the worst passing', 'Morning comes. Speak your fears to someone and they shrink.'],
  ],
  [
    ['a painful ending, rock bottom', 'Ten swords in a body under a black sky, but the dawn rises at the edge. The end of something, done thoroughly. It can’t get worse; it will get better.'],
    ['recovery, regeneration, survival', 'Getting up from the ground. The ending is past and you are still here.'],
  ],
  [
    ['curiosity, vigilance, new ideas', 'A young figure on a windy hill, sword raised, watching. Sharp eyes and quick thought. Stay alert.'],
    ['gossip, haste, all talk', 'Words thrown about carelessly. Think before you speak.'],
  ],
  [
    ['action, ambition, charging in', 'A knight charges headlong into the wind. Fast, brave, sure of himself. Act, but don’t trample.'],
    ['recklessness, impatience, scattered', 'Charging with no plan, leaving damage behind. Slow down.'],
  ],
  [
    ['clear thinking, honesty, independence', 'She holds her sword upright and one hand open. Sharp, perceptive, honest, often from experience of sorrow. Tell it straight.'],
    ['coldness, bitterness, cruel words', 'Clarity turned to harshness. Truth can be told kindly.'],
  ],
  [
    ['intellect, authority, truth', 'A king sits facing forward with his sword upright. Judgement, clear principles, fair authority. Decide with your head.'],
    ['manipulation, tyranny, cold power', 'Reason used as a weapon. Watch for someone, maybe you, being right at others’ expense.'],
  ],
]);

const PENTACLES = suit('Pentacles', [
  [
    ['opportunity, prosperity, a new resource', 'A hand from the cloud offers a pentacle above a garden. A real chance: money, work, health or home. Take it and plant it.'],
    ['a missed chance, poor planning, scarcity', 'The opportunity slips, or the plan isn’t sound. Look at the ground before you build.'],
  ],
  [
    ['balance, juggling, adaptability', 'A young man dances with two pentacles in an endless loop; ships ride high waves behind. Keeping things in motion. Stay light on your feet.'],
    ['overcommitted, dropped balls, disorder', 'Too much in the air. Set something down.'],
  ],
  [
    ['craft, teamwork, learning', 'A mason works on a cathedral while monks and an architect consult. Skill recognised, work done together. Do it well.'],
    ['poor work, disharmony, not listening', 'The team pulls apart or the work is careless. Talk, then build.'],
  ],
  [
    ['security, holding on, control', 'He clutches one pentacle, balances another on his head and stands on two. Safety, savings, and the fear of losing them. Is it security or grip?'],
    ['greed, or letting go', 'The grip loosens: generosity, or spending without care. Find the middle.'],
  ],
  [
    ['hardship, exclusion, worry', 'Two figures in the snow pass a lit church window. Poverty, illness or feeling left out. Help is nearer than it looks.'],
    ['recovery, help found, the cold easing', 'The door opens. Things begin to improve. Accept the help.'],
  ],
  [
    ['generosity, giving and receiving, fairness', 'A merchant with scales gives coins to those in need. Charity and fair exchange. Give, or receive with grace.'],
    ['strings attached, debt, one-sided giving', 'A gift with a hook in it, or giving that leaves you empty. Watch the balance.'],
  ],
  [
    ['patience, assessment, long-term growth', 'He leans on his hoe and looks at the pentacles growing on the vine. Work done; now waiting for it to ripen. Be patient.'],
    ['impatience, little return, wasted effort', 'Not much to show yet, or effort in the wrong place. Change what you’re growing, or wait.'],
  ],
  [
    ['diligence, skill, apprenticeship', 'A craftsman carves pentacle after pentacle at his bench. Careful work and steady practice. Keep at it.'],
    ['perfectionism, carelessness, no focus', 'Either nothing is good enough or nothing is done well. Find the honest middle.'],
  ],
  [
    ['self-sufficiency, comfort, well earned', 'A woman in her own vineyard with a hooded falcon on her glove. Comfort and independence you have made yourself. Enjoy it.'],
    ['overwork, hollow success, dependence', 'The garden is fine but you’re never in it, or it isn’t truly yours. What would make it so?'],
  ],
  [
    ['legacy, family, lasting wealth', 'An old man with his dogs, his family under the arch of an old house. What lasts across generations: home, inheritance, roots. Build for the long term.'],
    ['family disputes, loss, short-term thinking', 'Quarrels over what was left, or the house not kept. Look after what endures.'],
  ],
  [
    ['study, a new skill, a practical start', 'A young person gazes at the pentacle held in their hands. Learning, the start of a practical plan, a message about money or work. Be a good student.'],
    ['procrastination, little progress, daydreaming', 'Studying the coin instead of spending it. Begin.'],
  ],
  [
    ['hard work, routine, reliability', 'A knight on a heavy horse at a standstill, looking at his pentacle over ploughed fields. Steady, patient, dependable. Slow and sure.'],
    ['stuck, boredom, laziness', 'The routine has become a rut. Move, even a little.'],
  ],
  [
    ['nurture, practicality, a warm home', 'She sits in a garden with a rabbit at her feet, the pentacle in her lap. Practical care, abundance at home, comfort for body and soul. Look after people, yourself included.'],
    ['smothering, neglecting self, work against home', 'Caring for everyone but you, or too busy to tend the home. Rebalance.'],
  ],
  [
    ['abundance, security, discipline', 'A king among vines and bulls, his robe embroidered with grapes. Wealth well managed, success, a steady hand. Enjoy the harvest and share it.'],
    ['greed, stubbornness, materialism', 'Holding too much or valuing only what can be counted. What is enough?'],
  ],
]);

/** All 78, in the reading log's order: the Major Arcana, then Wands, Cups, Swords and Pentacles, Ace to King. */
export const TAROT_DECK: TarotCard[] = [...MAJORS, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

export const tarotCard = (idOrName: string): TarotCard | null => TAROT_DECK.find((c) => c.id === idOrName || c.name === idOrName) ?? null;
