// The Tarot de Marseille read in its own way, card by card, for Nicolas
// Conver's deck of 1760. The trumps follow the French and Italian pictures
// and the cartomancy that grew up around them, not Waite's Pictorial Key:
// their numbers and names are Conver's (Justice is VIII and Strength XI, and
// XIII has no name). The numbered cards show only their suit signs, so they
// are read in the European way, by number and suit: the suits after French
// cartomancy (Coupes the heart, Deniers money and the body, Bâtons work and
// drive, Épées conflict and the sharp mind), and the numbers after the
// counting through of a suit that modern Marseille readers use, Alejandro
// Jodorowsky and Marianne Costa's The Way of Tarot (2004) and Yoav Ben-Dov's
// Tarot: The Open Reading (2013) among them. None of these readings is
// ancient: cartomancy with the tarot is French, from Etteilla in the 1780s,
// and the occult readings of the trumps are of the 18th to 20th centuries.
// Many Marseille readers don't read reversals; the reversed meanings here
// are gentle, for those who do. Ids as in tarot.ts. Pure data.

import type { DeckCardMeaning, DeckMeanings } from './types.ts';

type Pair = [string, string];

const card = (picture: string, up: Pair, rev: Pair, more: { title?: string; note?: string } = {}): DeckCardMeaning => ({
  ...(more.title ? { title: more.title } : {}),
  picture,
  upright: { keywords: up[0], text: up[1] },
  reversed: { keywords: rev[0], text: rev[1] },
  ...(more.note ? { note: more.note } : {}),
});

const MAJORS: DeckMeanings = {
  '00-the-fool': card(
    'A wanderer in a jester’s cap and motley strides along with a bundle on a stick over his shoulder and a staff in his other hand. An animal tugs at his breeches from behind, and they have torn.',
    ['freedom, the urge to go, unreason', 'Le Mat, the madman or the fool: the one who belongs nowhere and goes anyway. He is energy without a plan, a freedom that pays no mind to rules, and the push to move on. Go, but know that something is snapping at your heels.'],
    ['aimlessness, being chased, a journey stalled', 'The going has no direction, or something keeps tearing at you until you turn and deal with it. Look at what follows you. Then choose a road on purpose.'],
    {
      title: 'Le Mat',
      note: 'Unnumbered, like the old Fool of the Italian games, and not the first card: older French readers put him at the end or outside the trumps. There is no cliff in the Marseille picture; the danger is the animal at his back. In Etteilla’s and later French cartomancy he reads as folly, thoughtlessness or extravagance; the freer reading is modern.',
    },
  ),
  '01-the-magician': card(
    'A young conjuror stands at a table set with cups, dice, a knife, coins and a bag, a little wand in one hand and a ball or coin in the other. His wide hat curls into a figure of eight.',
    ['a beginning, skill, a quick hand', 'Le Bateleur is the conjuror at the fair: the one who starts the show with whatever lies on his table. A beginning, a new skill, wit and a little daring. You have more to work with than you think; begin.'],
    ['sleight of hand, a false start, inexperience', 'The trick shows, or the hand is not yet quick enough. Watch for smooth talk, your own or someone else’s. Practise before you perform.'],
    {
      title: 'I · Le Bateleur',
      note: 'Bateleur means a street performer or juggler, not a magician; the card was renamed the Magus by 19th-century occultists such as Éliphas Lévi. Some Marseille readers still read a hint of the trickster in him.',
    },
  ),
  '02-the-high-priestess': card(
    'A woman in a papal tiara sits before a hanging veil with a great book open in her lap. She wears a nun’s wimple under the crown.',
    ['knowledge kept, study, quiet authority', 'La Papesse, the she-pope, keeps the book open and the door closed. Learning, patience and a knowing that takes its time; a woman of judgement, or your own wisdom gathering. Read, wait and keep your counsel.'],
    ['closedness, rigid belief, knowledge withheld', 'The book is shut, or held too tightly to the chest. Coldness, secrecy or a rule followed without thought. Let something new be written in.'],
    {
      title: 'II · La Papesse',
      note: 'The she-pope is likely older than the legend she is often tied to: a female pope in the tradition of Pope Joan, or a figure of Faith or the Church. Waite made her the High Priestess with a scroll; here it is an open book.',
    },
  ),
  '03-the-empress': card(
    'A crowned woman sits facing us on a throne whose back rises like wings, a sceptre in one hand and a shield with an eagle in the other.',
    ['growth, eloquence, creative force', 'L’Impératrice is creation that pours out: ideas, words, things growing. She is intelligence and abundance at their most fertile, and a woman of influence. Let what you’ve begun bud and flower.'],
    ['scattered growth, vanity, ideas without root', 'Too much comes out at once, or nothing will grow. Talk outruns action; beauty is admired but not tended. Choose one thing and feed it.'],
    {
      title: 'III · L’Impératrice',
      note: 'French cartomancers read her for intelligence, charm and fruitfulness. The garden of wheat and the Venus sign are Waite’s and Smith’s additions, not hers.',
    },
  ),
  '04-the-emperor': card(
    'A bearded emperor sits in profile on a low throne, legs crossed, a sceptre raised. His eagle shield rests at his feet.',
    ['power, stability, protection', 'L’Empereur has made his place in the world and keeps it. Order, material security, a father or a patron, a word that holds. Build on solid ground and stand by what you’ve built.'],
    ['domineering, stuck, power misused', 'The throne becomes a fortress, or the ground under it gives. Control where care would do better, or no one at the helm. Loosen your grip without letting go of the reins.'],
    { title: 'IIII · L’Empereur' },
  ),
  '05-the-hierophant': card(
    'The pope sits between two pillars with a triple cross, his hand raised in blessing. Two smaller figures kneel before him with their backs to us, one in a broad round hat.',
    ['teaching, counsel, a bridge between', 'Le Pape is the one who passes knowledge on: a teacher, a counsellor, a tradition that helps. He stands between heaven and the people kneeling. Ask for good advice, or give it.'],
    ['dogma, bad advice, a closed door', 'The teacher stops listening, or the rule no longer fits the person. Beware counsel that serves the giver. Seek your own understanding.'],
    { title: 'V · Le Pape' },
  ),
  '06-the-lovers': card(
    'A young man stands between two women, one older with a hand on his shoulder, one younger. Above them a winged Cupid in a blazing sun aims his arrow.',
    ['choice, affection, the heart pulled two ways', 'L’Amoureux is a young man who must choose: between two loves, two paths, or the family and a new bond. It is the card of feeling, of attraction and of the choice the heart has to make. Let Cupid’s arrow fall where it will, then commit.'],
    ['indecision, a wrong choice, divided loyalties', 'He can’t choose, or chooses to please everyone. Feelings tangled, or a choice made for the wrong reasons. Be honest with yourself about what you want.'],
    {
      title: 'VI · L’Amoureux',
      note: 'Not Waite’s Adam and Eve under an angel: the Marseille card shows a choice between two women, often read as virtue and vice, or a mother and a bride. Older French cartomancy reads it as a choice, a love affair or a marriage.',
    },
  ),
  '07-the-chariot': card(
    'A crowned young man in armour, with crescent faces on his shoulders, rides a canopied chariot. His two horses face forward but seem to step in different directions.',
    ['triumph, progress, going out into the world', 'Le Chariot is success in motion: the victor riding home, or the young man setting out. Action, travel, a goal reached through effort. Hold the reins and go.'],
    ['scattered effort, a stall, pride before a fall', 'The horses pull apart, or the triumph is for show. Drive without direction. Gather your forces before you set off again.'],
    { title: 'VII · Le Chariot' },
  ),
  '08-strength': card(
    'A woman in a wide hat, its brim curved like the Bateleur’s, holds open a lion’s jaws with her bare hands, calmly and without strain.',
    ['courage, mastery, gentle force', 'La Force is strength that doesn’t need a weapon: the instinct tamed and turned to good use. Courage, patience, a will that persuades rather than forces. You are equal to it.'],
    ['force without control, weakness, fear', 'The lion pulls free, or the hand won’t reach out. Anger, impatience, or a doubt in your own strength. Breathe, and go gently.'],
    {
      title: 'XI · La Force',
      note: 'In the Marseille this is XI, after the Wheel; the Golden Dawn and Waite moved it to VIII. Your lists keep it in Waite’s place, but the card carries Conver’s number.',
    },
  ),
  '09-the-hermit': card(
    'An old man in a hooded cloak leans on his staff and holds up a lantern, half hidden in its folds, as he walks.',
    ['prudence, the wisdom of age, a search', 'L’Hermite walks slowly and lights the way a step at a time. Experience, care, time taken, a guide or a teacher. The answer comes with patience and looking closely.'],
    ['isolation, slowness, a lamp hidden', 'Withdrawal becomes loneliness, or caution becomes delay. The wisdom is there but kept under the cloak. Share the light you have.'],
    {
      title: 'VIIII · L’Hermite',
      note: 'In earlier Italian decks the old man held an hourglass and was called Time; the lantern came later, and with it the hermit. Something of Father Time remains in the reading: things ripen slowly.',
    },
  ),
  '10-wheel-of-fortune': card(
    'A wheel on a crank turns with no hand on it. A creature climbs up one side and another sinks down the other, while a crowned, winged beast with a sword sits on top.',
    ['change, fortune, a turn of events', 'La Roue de Fortune turns, and what was down comes up. A change of luck, a new cycle, events that move by themselves. Take the moment while it’s yours.'],
    ['a downturn, stagnation, waiting for the turn', 'The wheel sticks, or turns against you for now. What goes down comes up again. Hold steady until it moves.'],
    {
      title: 'X · La Roue de Fortune',
      note: 'The old figure of Fortune’s wheel, with those rising, ruling and falling; the Marseille shows them as half-animals. The sphinx and Hebrew letters of Waite’s card are not here.',
    },
  ),
  '11-justice': card(
    'A crowned woman sits facing us, a sword upright in one hand and scales in the other.',
    ['balance, fairness, a decision', 'La Justice weighs and then decides. Fairness, order, the right measure, legal or official matters. Weigh it honestly, then act.'],
    ['imbalance, bias, a hard judgement', 'The scales are tilted, by someone else or by you. Severity, or a decision put off. Look for what’s fair, not just what’s strict.'],
    {
      title: 'VIII · La Justice',
      note: 'VIII in the Marseille, as in most French decks before the Golden Dawn swapped it with Strength. Your lists keep it in Waite’s place, but the card carries Conver’s number.',
    },
  ),
  '12-the-hanged-man': card(
    'A young man hangs upside down by one foot from a bar between two lopped trees, his other leg crossed behind and his hands behind his back. His face is calm.',
    ['suspension, waiting, another view', 'Le Pendu has stopped: tied, but not suffering. A pause, a sacrifice made willingly, a time to see the world turned over. Don’t push; let it hang a while.'],
    ['stuck, pointless sacrifice, resistance', 'Waiting without end, or a sacrifice nobody asked for. Struggling against the rope makes it tighter. Ask what you could let go of.'],
    {
      title: 'XII · Le Pendu',
      note: 'In 15th-century Italy, traitors were painted hanging by one foot as a public shame, and the card was sometimes called the Traitor. The reading as willing sacrifice and inner change is much later.',
    },
  ),
  '13-death': card(
    'A skeleton with a scythe mows a dark field. Heads, hands and feet lie in the earth, one head still crowned. The card has a number, XIII, and no name.',
    ['ending, clearing, deep change', 'The card without a name cuts away what is finished so something new can grow. An ending, a transformation, ground cleared. Let it go.'],
    ['resisted change, a slow ending, stagnation', 'The harvest is left standing, or the ending drags on. Fear of change makes it harder. Put the scythe to what’s already dead.'],
    {
      title: 'XIII · the card without a name',
      note: 'Called La Mort in Italy and in some French decks, it is left unnamed in the Marseille pattern; modern readers call it l’Arcane sans nom, the nameless card. It is rarely read as a death.',
    },
  ),
  '14-temperance': card(
    'A winged woman pours a stream from one vessel into another. Her feet stand on the ground among small plants.',
    ['moderation, health, the right mixture', 'Tempérance blends and balances: water into wine, one feeling into another. Healing, patience, a calm that comes from measure. Take your time and find the mix.'],
    ['excess, imbalance, impatience', 'Too much of one thing, too little of another. Health or harmony lost a little. Go back to the middle way.'],
    { title: 'XIIII · Tempérance' },
  ),
  '15-the-devil': card(
    'A horned devil with bat’s wings and both breasts and a man’s sex stands on an anvil, a torch or bare blade in his hand. Two small horned imps with tails are tied to it by halters.',
    ['passion, desire, a bond that holds', 'Le Diable is raw force: desire, ambition, appetite, the pull of what tempts. It binds, but it also gives energy and creative fire. Know what holds you, and use what drives you.'],
    ['release, or a habit worse than it seems', 'The halter loosens, or you pretend it isn’t there. An obsession, an unhealthy bond, money or lust running the show. Name it, and step back.'],
    {
      title: 'XV · Le Diable',
      note: 'French cartomancy reads the Devil as great force, often for ill: violence, passion, illicit gain. Modern Marseille readers such as Ben-Dov also read it as vitality and the energy of desire.',
    },
  ),
  '16-the-tower': card(
    'A tower is struck at the top, and its crown-shaped roof is blown off by a plume of fire. Two men fall or tumble to the ground, and coloured balls fill the air.',
    ['upheaval, release, a breaking open', 'La Maison Dieu is the house that breaks open: sudden news, a shock, the end of something built on pride. What was shut in gets out. Let it fall, and see what’s freed.'],
    ['a shake-up delayed, confinement, a narrow escape', 'The roof holds, for now, or the walls close in. A crisis avoided, or one waiting to happen. Open a window before it opens for you.'],
    {
      title: 'XVI · La Maison Dieu',
      note: 'The name means God’s house, which in old French also meant a hospital. Some read the falling men as leaping free, and the fire as heaven’s touch as much as a punishment. Waite called it the Tower.',
    },
  ),
  '17-the-star': card(
    'A naked woman kneels on one knee at the water’s edge and pours out two jugs into the stream. A great star shines among seven smaller ones, and a bird sits on top of a tree.',
    ['hope, generosity, a gift', 'L’Étoile gives freely: water poured out, light to the night. Hope, renewal, a good omen, a gift without strings. Trust that it’s flowing your way.'],
    ['hope delayed, giving too much, doubt', 'The jugs run dry, or you pour out everything and keep nothing. Disappointment or self-doubt. Refill yourself first.'],
    { title: 'XVII · L’Étoile' },
  ),
  '18-the-moon': card(
    'A moon with a face in profile draws drops up from the earth. Two dogs howl between two towers, and a crayfish rises from a pool.',
    ['dreams, imagination, the uncertain', 'La Lune is the night world: dreams, longing, intuition, and the things that look different in the dark. Feelings run deep; nothing is clear yet. Let the imagination speak, but don’t mistake it for fact.'],
    ['confusion lifting, deception, fear', 'Either the fog begins to clear, or it hides something false. Old fears surface. Wait for daylight before you decide.'],
    {
      title: 'XVIII · La Lune',
      note: 'Older French cartomancy reads the Moon as deception, hidden enemies or danger by night; modern Marseille readers make more of dreams, intuition and the mother.',
    },
  ),
  '19-the-sun': card(
    'A great sun with a face sheds drops of light over two children, nearly naked, standing before a low wall. One rests a hand on the other.',
    ['joy, friendship, clarity', 'Le Soleil is warmth shared: friendship, love that is simple, success in the open. Things are clear and good. Enjoy it with someone.'],
    ['a cloudy day, pride, joy postponed', 'Still a good card, but the warmth is held back, or the wall is built too high. Let people in.'],
    {
      title: 'XVIIII · Le Soleil',
      note: 'Not Waite’s child on a horse: the Marseille shows two children or companions under the sun, read as friendship, partnership and brotherhood.',
    },
  ),
  '20-judgement': card(
    'An angel in the clouds blows a trumpet hung with a cross banner. Below, a figure rises from a tomb with its back to us, between a man and a woman with hands joined.',
    ['awakening, a call, news', 'Le Jugement is the call that wakes you: news, a vocation, a fresh start after a long sleep. Something rises again. Answer.'],
    ['a call ignored, doubt, old regret', 'The trumpet sounds and you turn over. Or old judgements, your own, keep you in the tomb. Get up.'],
    { title: 'XX · Le Jugement' },
  ),
  '21-the-world': card(
    'A dancing figure, bare but for a scarf, stands in an oval wreath with a little flask in one hand and a wand in the other. An angel, an eagle, a lion and an ox fill the four corners.',
    ['fulfilment, completion, the whole', 'Le Monde is the work done and the dance in the middle of it: success, wholeness, the world opening. Everything is in its place. Enjoy it, and know it opens on to the next.'],
    ['incompletion, a closed circle, delay', 'Almost there, or the wreath has become a wall. Something is left unfinished. Tie the last thread.'],
    {
      title: 'XXI · Le Monde',
      note: 'The four corners are the old signs of the four evangelists. Older French cartomancy reads the card as travel, success and the world at large.',
    },
  ),
};

// ─── The numbered cards and the courts ───────────────────────────────────
// The numbers, as Marseille readers count through a suit: one the seed, two
// gathering, three the first burst, four stability, five a new step or a
// test, six pleasure, seven action, eight fullness, nine a turning, ten the
// end of the cycle. Every numbered card and court without a note of its own
// gets the note below (see MARSEILLE_MEANINGS).

const PIP_NOTE =
  'The numbered cards of the Marseille show only their suit signs, so they are read by number and suit, as in French cartomancy and among modern Marseille readers, not by a scene: the scenes on these cards in the Rider–Waite–Smith are Pamela Colman Smith’s own, of 1909.';

const COURT_NOTE =
  'The Marseille courts are read by rank: the Valet a beginner or a messenger, the Cavalier someone or something on the move, the Reine mastery turned inward, the Roi mastery turned outward. In older cartomancy they also stand for people in your life.';

const WANDS: DeckMeanings = {
  'wands-01': card(
    'A hand comes out of a cloud and grips a great rough club, its branches lopped short, with little flames or leaves falling round it.',
    ['raw energy, a start, desire', 'The As de Bâton is the whole force of the suit in one hand: drive, desire, the will to make and do. A venture, a new work, a strong urge. Grasp it.'],
    ['energy blocked, a false start, force misused', 'The club is heavy and won’t swing, or swings too hard. Frustration or wasted strength. Find the right thing to put it to.'],
    { note: 'An ace is read as the root of its suit. Bâtons, the clubs of the old card games, stand for work, enterprise and the energy of the body in French cartomancy.' },
  ),
  'wands-02': card(
    'Two long staves cross in a tall X, with leafy flowers in the gaps between them.',
    ['plans, gathering strength, a partnership', 'Two is the number of gathering and waiting: energy held before it is spent. Plans being made, a working partnership, desire not yet acted on. Prepare.'],
    ['hesitation, a stand-off, impatience', 'The two staves block each other. Plans stall, or a partnership pulls two ways. Decide who leads.'],
  ),
  'wands-03': card(
    'Two staves cross like those of the two, with a third standing straight up through the middle.',
    ['enthusiasm, first growth, initiative', 'Three is the first burst outward: energy that jumps into action before it knows quite how. Enterprise, eagerness, a project leaping forward. Go, and learn as you go.'],
    ['rashness, scattered starts', 'Too much begun, not enough finished. Haste over craft. Slow the rush a little.'],
  ),
  'wands-04': card(
    'Four staves cross two and two in a broad X, with flowers in the gaps above, below and at the sides.',
    ['stability, a firm base, steady work', 'Four is the number of the foundation. Work that is secure, a settled place, energy put into building. Rest on it.'],
    ['routine, rigidity, a shaky base', 'Security turns into a rut, or the ground isn’t as firm as it looks. Check the foundations, and make room to move.'],
  ),
  'wands-05': card(
    'The X of four staves, with a fifth standing upright through the middle.',
    ['challenge, a new ambition, competition', 'Five breaks the square: a new desire, a test, a contest. Rivalry and struggle, or a step beyond the safe. The effort is worth it.'],
    ['quarrels, pointless rivalry', 'The struggle has become its own reason. Disputes over small things. Pick your contests.'],
  ),
  'wands-06': card(
    'Six staves cross three and three in a broad X, with flowers set in its gaps.',
    ['pleasure in work, harmony, success', 'Six is the number of pleasure and of things fitting together. Work you enjoy, energy that flows, recognition for it. Do what you love doing.'],
    ['vanity, pleasure without effort', 'Enjoyment slides into self-satisfaction, or the pleasure fades. Remember why you began.'],
  ),
  'wands-07': card(
    'The X of six staves, with a seventh upright through the middle.',
    ['action, courage, holding your ground', 'Seven is action in the world: energy aimed and used. Effort, initiative, standing up for what you do. Keep at it.'],
    ['overwhelm, giving way, strain', 'Too much to hold at once, and effort turned to strain. Choose what to defend.'],
  ),
  'wands-08': card(
    'Eight staves cross four and four in a great X that fills the card, a flower above and below.',
    ['full power, order, momentum', 'Eight is fullness and order: energy at its height and well directed. Things move fast and well. Use the momentum.'],
    ['haste, overload, a tangle', 'Too much at once, or things run ahead of you. Sort out what matters first.'],
  ),
  'wands-09': card(
    'The X of eight staves, with a ninth upright through the middle.',
    ['a turning point, endurance, change ahead', 'Nine is a crisis of passage: an effort near its end, energy changing form. Hold on; something is closing so another can start.'],
    ['exhaustion, stubbornness, letting go too late', 'Pushing on after the work is done, weary and on guard. Rest, and let it change.'],
  ),
  'wands-10': card(
    'Ten staves crowd the card: eight crossing in a great X, with two standing straight through the middle.',
    ['the end of a cycle, a load laid down, a new start', 'Ten closes the suit: the work is done, and its energy is about to begin again in a new shape. A finished task, or a burden nearly put down. Begin to think of what is next.'],
    ['overburdened, unable to finish', 'Still carrying it all, long after it should be set down. Share the load, or let some of it go.'],
  ),
  'wands-11': card(
    'A young man in a small cap stands in profile with a great green club planted on the ground beside him, both hands on it.',
    ['eagerness, a beginner, a first venture', 'The Valet de Bâton has more energy than skill: a young worker, an apprentice, news of a venture. Enthusiasm and a strong pair of hands. Learn the craft.'],
    ['clumsiness, impatience, bluster', 'More force than sense, or the club too heavy for the hands. Be patient with the learning.'],
  ),
  'wands-12': card(
    'A rider on a stepping horse carries a great club upright before him.',
    ['an undertaking, travel, going after it', 'The Cavalier de Bâton carries the suit’s energy out into the world: a mission, a move, a departure for work. Passion in motion. Ride out.'],
    ['impulsiveness, a broken journey', 'Galloping without knowing where, or turning back too soon. Steer.'],
  ),
  'wands-13': card(
    'A crowned queen sits holding a great baton against her, her other hand at her waist.',
    ['self-possession, creative strength, warmth', 'The Reine de Bâton holds her energy well: a capable woman, creative and sure of herself, at home in her house and her work. Be at ease in your own strength.'],
    ['domineering, jealous, held-in energy', 'Strength turns to control, or desire is kept back until it sours. Let it out kindly.'],
  ),
  'wands-14': card(
    'A king in armour, his crown set on a wide hat, sits holding a long baton slanted down to the floor before him, his other hand on his hip.',
    ['leadership, mastery, an honest man', 'The Roi de Bâton knows his work and leads by doing it: an employer, a skilled hand, a decisive and fair man. Take charge.'],
    ['harshness, impatience, a tyrant', 'Leadership turns hard or hasty, and pride in the work becomes pride in himself. Lead, don’t drive.'],
  ),
};

const CUPS: DeckMeanings = {
  'cups-01': card(
    'A single great cup fills the card, its tall lid and stem built up like a little church or castle.',
    ['love, joy, the heart full', 'The As de Coupe is the heart opening: a new love, a joy, a feeling that fills you. A house well loved, a feast, a gift. Let it brim over.'],
    ['a heart closed, emptiness, a feeling unmet', 'The cup is shut or poured away. Love held back, or a sadness. Open it a little.'],
    { note: 'An ace is read as the root of its suit. Coupes, the hearts of the old card games, stand for love, feeling and the home in French cartomancy.' },
  ),
  'cups-02': card(
    'Two cups stand side by side beneath a flowering ornament, with two fish-like heads leaning out over them.',
    ['a meeting, affection, a pair', 'Two cups: a bond, an attraction, two hearts learning each other. Love beginning, a friendship, a reconciliation. Meet halfway.'],
    ['misunderstanding, a quarrel between friends', 'The cups face each other but don’t touch. A feeling not returned, or not spoken. Say what you feel.'],
  ),
  'cups-03': card(
    'Three cups, one above and two below, with stems of flowers curling between them.',
    ['joy, celebration, a feeling blossoming', 'Three is the first burst: happiness that wants to be shared, a celebration, a love that shows itself. Be glad together.'],
    ['excess, a feeling too quick', 'Too much, too soon: a crush, or an evening that goes on too long. Enjoy it, but steady.'],
  ),
  'cups-04': card(
    'Four cups set two and two in a square, with flowers between them.',
    ['contentment, security in love, a steady home', 'Four is stability: a settled heart, a home that holds, feelings you can rely on. Enjoy what is safe and good.'],
    ['boredom, a heart gone flat', 'Security becomes sameness, or you can’t feel the good you have. Look again at what’s in front of you.'],
  ),
  'cups-05': card(
    'Five cups, two above and two below and one in the middle, among flowering stems.',
    ['a new feeling, a stirring, unrest', 'Five is a new interest that unsettles the old: a feeling that calls you elsewhere, a spiritual opening, or a small grief. Follow what moves you, gently.'],
    ['regret, disappointment, a feeling lost', 'Something was spilt, and there is sorrow over what’s gone. Look at what remains.'],
  ),
  'cups-06': card(
    'Six cups in two columns of three, with branches and flowers between them.',
    ['pleasure, affection, harmony', 'Six is delight: love that pleases, kindness, memories and friendships that warm. Enjoy the company.'],
    ['nostalgia, sentimentality', 'Living in yesterday’s feeling, a love that is more memory than present. Come back to now.'],
  ),
  'cups-07': card(
    'Three cups above, three below and a seventh in the middle, with vines curling round them.',
    ['feeling put to work, generosity, a dream acted on', 'Seven is action: love that goes out and does something, help given, a dream made real. Let your feelings reach the world.'],
    ['illusion, wishful thinking', 'Many cups, few full. Daydreams, or choices made on a fancy. Find the one that’s real.'],
  ),
  'cups-08': card(
    'Eight cups, three above, two in the middle and three below, with flowering stems between them.',
    ['fullness of heart, peace, love fulfilled', 'Eight is fullness: a heart complete and at peace, love given and returned. Rest in it.'],
    ['a heart overfull, or emptied', 'Overflowing feeling, or giving until there is nothing left. Find the measure.'],
  ),
  'cups-09': card(
    'Nine cups in three rows of three, with flowers between them.',
    ['a wish granted, satisfaction, a turning', 'Nine is the wish card of old fortune-telling, and feeling ripened and ready to change. Contentment; then let it move on.'],
    ['smugness, a satisfaction that won’t last', 'Pleased with yourself, or pleased with too little. Look past the moment.'],
    { note: 'The nine of hearts was the wish card of French and English fortune-telling with playing cards, and it carried the meaning over to the nine of cups. The rest is read by number and suit.' },
  ),
  'cups-10': card(
    'Nine cups in three rows of three, and a tenth, larger, lying on its side across the top over them all.',
    ['the heart’s home, completion, family', 'Ten closes the suit: love fulfilled, a family or a place where you belong, and feeling ready for a new cycle. Be at home.'],
    ['a home disturbed, an ending in love', 'A family quarrel, or the close of a chapter of feeling. What ends makes room.'],
  ),
  'cups-11': card(
    'A bareheaded young man with flowers in his hair walks along holding up an open cup in one hand and its lid low in the other, as if about to show what is inside.',
    ['a tender start, an offer, a sensitive young person', 'The Valet de Coupe offers his heart, still shy: a message of love, a gentle beginner, a feeling just opening. Lift the lid.'],
    ['shyness, emotional immaturity', 'Feelings kept covered, or too easily hurt. Be brave with your heart.'],
  ),
  'cups-12': card(
    'A rider on a walking horse carries a cup carefully out in front of him.',
    ['a proposal, an offer of love, a gentle approach', 'The Cavalier de Coupe brings the heart out to someone: an invitation, a proposal, a peacemaker. Accept what is carried to you, or carry it yourself.'],
    ['seduction, false promises', 'The cup is offered to charm, not to give. Look at the hands as well as the cup.'],
  ),
  'cups-13': card(
    'A crowned queen sits holding a great covered cup in one hand and a sword in the other, its blade resting against her shoulder.',
    ['deep feeling, care, a loving woman', 'The Reine de Coupe keeps her feelings close and deep, and has a blade by her to guard them: devotion, intuition, a love that holds. Tend your inner life.'],
    ['moodiness, a closed heart', 'The lid stays shut. Feelings brooded on, or kept from those who need them. Open the cup.'],
    { note: 'Hers is the one closed cup among the courts, and Marseille readers make much of it as feeling held within; the sword in her other hand is read as the clear mind that keeps it. The courts are read by rank: the Reine is mastery turned inward.' },
  ),
  'cups-14': card(
    'A crowned king in a wide hat sits on a bench holding a great open cup in one hand, his other hand on his hip.',
    ['emotional maturity, kindness, a generous man', 'The Roi de Coupe is feeling mastered and shared: a kind man, a protector, generosity without show. Be steady and warm.'],
    ['manipulation, indulgence', 'Feeling used to sway others, or comfort taken too far. Keep your heart honest.'],
  ),
};

const SWORDS: DeckMeanings = {
  'swords-01': card(
    'A hand comes out of a cloud holding a sword upright. Its point passes through a crown hung with a palm and a laurel branch.',
    ['clarity, a decision, victory won by thought', 'The As d’Épée is the cutting edge of the mind: a clear idea, a firm decision, a battle won. It cuts through doubt. Say it plainly and act on it.'],
    ['confusion, a harsh word, force turned back', 'The blade cuts the wrong way: a quarrel, a cruel remark, a decision made in anger. Sheathe it until you see clearly.'],
    { note: 'An ace is read as the root of its suit. Épées, the spades of the old card games, stood for trouble, quarrels and grief in French cartomancy; modern Marseille readers add the mind, decision and the courage to cut.' },
  ),
  'swords-02': card(
    'Two curved blades cross above and below to make an oval, with a flower blooming in the middle.',
    ['a truce, thought held in balance, waiting', 'Two is gathering: two ideas weighed side by side, a peace kept, a decision not yet made. Let it ripen before you choose.'],
    ['a stalemate, tension, a choice avoided', 'The blades lock. Two minds, or two sides, that won’t give. Someone has to speak first.'],
  ),
  'swords-03': card(
    'The oval of curved blades with a straight sword standing through the middle.',
    ['a sharp idea, a first stand, a break', 'Three is the first burst: a thought that wants out, a line drawn, a break made. It can sting, and it clears the air. Say it kindly.'],
    ['a hurt, quarrels, words too quick', 'The blade goes in deeper than meant. A grief or a falling-out. Let it heal before you strike again.'],
  ),
  'swords-04': card(
    'Four curved blades make a double oval around a flower, closed and still.',
    ['rest, a settled mind, a truce', 'Four is stability: a mind at peace, a decision that stands, a pause in the fighting. Rest and gather your thoughts.'],
    ['fixed opinions, enforced rest', 'Stillness becomes stuck thinking, or rest you didn’t choose. Let a new idea in.'],
  ),
  'swords-05': card(
    'The double oval of curved blades with a straight sword through the middle.',
    ['a new conviction, a test, a dispute', 'Five breaks the settled square: a new idea that challenges the old, a dispute, a stand taken. Fight fair.'],
    ['a hollow win, spite, loss', 'Winning the argument and losing the friend. Let it go.'],
  ),
  'swords-06': card(
    'Six curved blades interlace in a tall oval, with flowers at its heart.',
    ['ease of mind, understanding, a way through', 'Six is pleasure: thinking that flows, understanding reached, a calmer passage after strain. Enjoy the clarity.'],
    ['self-deception, a problem carried along', 'The calm is only on the surface, or the trouble comes with you. Look honestly at what you’re carrying.'],
  ),
  'swords-07': card(
    'The six curved blades, with a straight sword through the middle.',
    ['action, strategy, a plan carried out', 'Seven is action: the mind put to work, a plan made and done, cleverness in the world. Think it through and go.'],
    ['scheming, half-truths, a plan undone', 'Cunning without honesty, yours or another’s. A plan that leaves something out. Be straight.'],
  ),
  'swords-08': card(
    'Eight curved blades make a dense oval lattice around a flower.',
    ['order, discipline, a mind at full stretch', 'Eight is fullness: thought ordered and thorough, rigour, a mind at its sharpest. Do the careful work.'],
    ['overthinking, a mind boxed in', 'Too many thoughts, crossed like blades, until you feel trapped. Step outside the oval.'],
  ),
  'swords-09': card(
    'The eight curved blades, with a straight sword through the middle.',
    ['a crisis of mind, a cutting away, endurance', 'Nine is a turning: an old way of thinking ends, sometimes painfully. Worry, a sleepless night, and then a clearer mind. It will pass.'],
    ['anxiety eased, or anguish held too long', 'Either the worst of the worry lifts, or it turns over and over. Talk to someone.'],
  ),
  'swords-10': card(
    'Eight curved blades make the oval, and two straight swords cross through the middle of it, ten in all.',
    ['the end of a struggle, a mind made new', 'Ten closes the suit: a conflict over, an idea fully spent, the ground cleared for new thinking. Let the fight end.'],
    ['an ending that drags, defeat', 'The struggle won’t quite finish, or you hold on to the loss. Lay down the swords.'],
  ),
  'swords-11': card(
    'A young man in a wide hat stands holding a drawn sword upright in one hand and its scabbard in the other, glancing down and aside.',
    ['vigilance, a quick mind, a beginner’s boldness', 'The Valet d’Épée has drawn his blade but hasn’t used it: alert, curious, ready to defend an idea. A young person of wit, or news that needs care. Watch and learn.'],
    ['suspicion, gossip, rashness', 'The sword waved about, or watched for in everyone. Sharp words, idle talk. Put the blade back until it’s needed.'],
  ),
  'swords-12': card(
    'An armoured rider on a stepping horse holds up his sword as he goes.',
    ['decision in motion, a mission, defence', 'The Cavalier d’Épée rides out to settle something: a cause, a decision carried through, help that arrives quickly. Go and do what you’ve decided.'],
    ['aggression, a hasty departure', 'Charging in before thinking, or a sudden going. Pull the horse up.'],
  ),
  'swords-13': card(
    'A crowned queen sits holding a sword upright, her other hand at her waist.',
    ['clear judgement, independence, honesty', 'The Reine d’Épée sees clearly and says what she sees: a woman of sense and independence, perhaps one who has known grief. Be honest, with yourself first.'],
    ['coldness, a sharp tongue, loneliness', 'Clarity turns cold, or words cut more than they need to. Let warmth back in.'],
  ),
  'swords-14': card(
    'A king in armour, his crown set on a wide hat, sits on a stone block holding an upright sword in one hand and a short sceptre in the other.',
    ['authority, judgement, a man of law', 'The Roi d’Épée decides and stands by it: a judge, an adviser, a mind used with authority. Make the decision and own it.'],
    ['severity, cruelty, injustice', 'Judgement without mercy, or power used to cut people down. Temper the law with kindness.'],
  ),
};

const PENTACLES: DeckMeanings = {
  'pentacles-01': card(
    'A single great coin fills the card, patterned like a flower, with leafy stems growing round it.',
    ['prosperity, a solid start, the body', 'The As de Deniers is material life in one coin: money, health, a home, a sound beginning. It is real and it can grow. Plant it well.'],
    ['greed, a loss, a chance not taken', 'Money held too tightly, or slipping away. Look after the ground you stand on.'],
    { note: 'An ace is read as the root of its suit. Deniers, the old coins, stand for money, work that pays, the body and the home in French cartomancy; the diamonds of the playing cards.' },
  ),
  'pentacles-02': card(
    'Two coins, one above the other, are joined by a long ribbon that winds round them like an S. Printers put their name or the date on it; this one reads N. Conver and 1760.',
    ['exchange, movement, juggling resources', 'Two is gathering: money coming in and going out, an exchange, a partnership in business. Keep it moving.'],
    ['money worries, a balance lost', 'Too much to juggle, and the ribbon tangles. Simplify your accounts.'],
  ),
  'pentacles-03': card(
    'Three coins, one above and two below, with flowering stems between them.',
    ['first growth, skill, a project taking shape', 'Three is the first burst: work beginning to show, a skill being learned, the first profit. Keep building.'],
    ['amateurism, a slow start', 'Growth stalls, or the work isn’t done with care. Learn the trade properly.'],
  ),
  'pentacles-04': card(
    'Four coins at the corners of a square, with a shield of three fleurs-de-lis at the centre.',
    ['security, savings, a firm footing', 'Four is stability: money kept, a house secure, a body well rooted. Enjoy the ground under you.'],
    ['miserliness, holding on too hard', 'Security becomes clutching, or fear of losing. Loosen your hand a little.'],
  ),
  'pentacles-05': card(
    'Four coins at the corners with a fifth in the middle, among flowering stems.',
    ['a new venture, a change of values, a test', 'Five is a new step: an opportunity beyond the safe, a change in what you value, a lesson in money or health. Take it, with care.'],
    ['hardship, a loss, feeling left out', 'Money or health under strain for a while. Ask for help; it is there.'],
  ),
  'pentacles-06': card(
    'Six coins, one at the top, four in a square around a flower and one at the bottom, with leafy stems winding round them.',
    ['generosity, comfort, a fair exchange', 'Six is pleasure: enough to share, give and take in balance, comfort in the body. Be generous.'],
    ['debts, unequal giving', 'Gifts with strings, or giving more than you can. Even the scales.'],
  ),
  'pentacles-07': card(
    'Six coins in two columns of three, with a seventh between the top two pairs.',
    ['effort, work that pays, patience', 'Seven is action in the world: steady work, money earned, things built with your hands. Keep tending it.'],
    ['impatience, effort without return', 'Waiting for a harvest that hasn’t ripened, or working without reward. Look at where effort is going.'],
  ),
  'pentacles-08': card(
    'Eight coins in two columns of four, with stems of flowers between them.',
    ['prosperity, order, mastery', 'Eight is fullness: material life in good order, well earned, a skill perfected. Enjoy what is secure.'],
    ['perfectionism, too much detail', 'Polishing what is already done, or order turned fussy. Good enough is good.'],
  ),
  'pentacles-09': card(
    'Eight coins in two columns of four with a ninth set in the middle.',
    ['ripeness, independence, a change in fortune', 'Nine is a turning: comfort earned and a readiness to move on, perhaps a change of work or home. Enjoy it, and see what comes next.'],
    ['insecurity, a loss of footing', 'The ground shifts under what you’ve built. Hold to what matters most.'],
  ),
  'pentacles-10': card(
    'Ten coins fill the card, two columns of four with two more down the middle, and flowering stems between them.',
    ['wealth, inheritance, the end of a cycle', 'Ten closes the suit: material life complete, a family’s wealth, a cycle ended and a new one ready to start. Share it and pass it on.'],
    ['family quarrels over money, a fortune at risk', 'Disputes about what is inherited or owed. Keep it fair, and keep perspective.'],
  ),
  'pentacles-11': card(
    'A young man in a wide hat stands holding up a coin, while another lies on the ground at his feet.',
    ['study, a practical beginning, a careful student', 'The Valet de Deniers looks at his coin and wonders what it is worth: an apprentice, a student, a small sum and its promise. Learn the value of what you have.'],
    ['wasted chances, lack of focus', 'The coin on the ground goes unnoticed. Distraction, or a lesson skipped. Pick it up.'],
  ),
  'pentacles-12': card(
    'A rider holds a stick or wand, and a coin floats in the air before him.',
    ['steady progress, a sound proposal, travel for work', 'The Cavalier de Deniers moves slowly but surely after something real: a business trip, a careful offer, money coming. Keep on.'],
    ['stagnation, a deal delayed', 'Too slow, or riding after something just out of reach. Check that the goal is solid.'],
  ),
  'pentacles-13': card(
    'A crowned queen, seen in profile, holds a coin up before her face, a sceptre resting against her shoulder and her other hand at her waist.',
    ['practical care, abundance, good sense', 'The Reine de Deniers looks after what she has: a capable, generous woman, a home that runs well, health well kept. Tend your resources.'],
    ['worry over money, neglect', 'Too much fret about having, or too little care for what you have. Find the balance.'],
  ),
  'pentacles-14': card(
    'A king in a wide hat sits outdoors on the grass with his legs crossed, holding his coin low in his lap.',
    ['prosperity, reliability, a man of means', 'The Roi de Deniers has built something that lasts: a businessman, a provider, a steady hand with money. Be generous with what you’ve made.'],
    ['greed, materialism, stubbornness', 'Wealth valued for itself, or a hand that won’t open. Remember what it’s for.'],
  ),
};

const pipOrCourt = (id: string) => /-(0[2-9]|1[0-4])$/.test(id);

/** All 78 cards of the Tarot de Marseille, read in its own way. */
export const MARSEILLE_MEANINGS: DeckMeanings = Object.fromEntries(
  Object.entries({ ...MAJORS, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES }).map(([id, m]) => {
    if (m.note || !pipOrCourt(id)) return [id, m];
    return [id, { ...m, note: Number(id.slice(-2)) > 10 ? COURT_NOTE : PIP_NOTE }];
  }),
);
