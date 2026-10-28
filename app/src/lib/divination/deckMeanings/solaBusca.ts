// The Sola Busca tarot's own card meanings: what each engraving shows, and
// a reading built from that picture and from the figure it names.
//
// The deck was engraved in northern Italy (Ferrara or Venice) and coloured
// by hand in 1491; the one complete coloured set has been in the Pinacoteca
// di Brera, Milan, since 2009. Its 22 trumps are named figures from Roman
// history and the Bible, its 16 court cards include the circle of Alexander
// the Great, and every pip is a scene.
//
// There is no old divinatory tradition for this deck: it was made for play,
// display or (some argue) ritual, and was little known until the twentieth
// century. Every reading below is a modern one, made for this app. Where a
// picture or a figure's story is clear, the reading leans on it; where a card
// takes the place of a familiar trump, or where Pamela Colman Smith clearly
// drew on it for the Rider–Waite–Smith, the note says so.
//
// Sources:
// - The coloured Brera deck itself (the app's scans, from Wikimedia Commons),
//   read card by card for every `picture`.
// - L. P. Gnaccolini, ed., Il mistero dei tarocchi Sola Busca (Pinacoteca di
//   Brera exhibition catalogue, Milan 2012–13), for figure identifications
//   and the alchemical readings, partly as summarised by Michael S. Howard
//   (newmaterialsolabusca.blogspot.com, 2015).
// - British Museum catalogue entries for the uncoloured impressions
//   (1845,0825.483–486), and A. M. Hind, Early Italian Engraving (1938).
// - Simon Wintle, "Sola-Busca Tarocchi", The World of Playing Cards.
// - Peter Mark Adams, The Game of Saturn: Decoding the Sola-Busca Tarocchi
//   (Scarlet Imprint, 2017): his readings (Deo Tauro as "god bull", Catone and
//   Algol, Postumio and Tulio as Mithraic torchbearers, Ammon and a dark
//   Saturn) are cited from published reviews of the book, and named as his.
// - For the figures' stories: Plutarch, Sallust's Jugurthine War (Bocchus),
//   Genesis 10 (Nimrod), Daniel 4 (Nebuchadnezzar), and the medieval
//   Alexander Romance (Nectanebo, Olympias, Ammon, Alexander's flight).

import type { DeckMeanings } from './types.ts';

/** A plain note for readers, shown with the deck's meanings. */
export const SOLA_BUSCA_NOTE =
  'The Sola Busca has no centuries-old tradition of reading. Nobody knows quite what its makers meant by it, and scholars still argue over who many of its figures are. These meanings are modern ones, built from what each engraving shows and from the stories of the people it names.';

const m = (keywords: string, text: string) => ({ keywords, text });

export const SOLA_BUSCA_MEANINGS: DeckMeanings = {
  // ─── Trumps ──────────────────────────────────────────────────────────────

  '00-the-fool': {
    title: 'Mato',
    picture: 'A ragged man in a red shirt and a feathered cap plays a bagpipe as he walks, a crow perched on his bare shoulder and a twisted tree just coming into leaf behind him.',
    upright: m('freedom, the outsider, the first note', 'The fool walks to his own tune with a crow for company, outside the order of named heroes who follow him. He has nothing to guard, so he can go anywhere. Begin without waiting to be ready.'),
    reversed: m('noise, drifting, a warning ignored', 'The piping drowns out everything, and the crow on his shoulder goes unnoticed. Freedom has slid into drift. Stop playing long enough to hear where you are.'),
    note: 'The only trump without a Roman or biblical name. The crow and the barely leafing tree have been read as the blackening at the start of the alchemical work (the Brera catalogue, via Howard); that is a modern reading.',
  },
  '01-the-magician': {
    title: 'Panfilio',
    picture: 'A young soldier seen from behind strides away in a red turban and green tunic, a great oval shield on his arm, a sword at his side and his free hand raised as if calling to someone ahead.',
    upright: m('setting out, initiative, a call answered', 'The first of the deck’s soldiers is already on the move, shield up, hailing whoever is ahead. This is the card of starting: committing yourself and going. Take the first step and speak up as you take it.'),
    reversed: m('haste, turning away, all show', 'He walks off so fast we never see his face. Beware of starting things only to be seen leaving, or hurrying past the detail that matters. Turn round and look at what you’re doing.'),
    note: 'Number I, the Magician’s place in other decks, but there is no juggler or table here, and the card is titled Panfilio, not Il Bagatto. The name is unidentified; a Venetian game and Boccaccio’s Panfilo have both been suggested. Modern reading.',
  },
  '02-the-high-priestess': {
    title: 'Postumio',
    picture: 'A soldier seen from behind, a club and a sword in his hands, stands before a brick pillar with a skull on top; his shield carries his name and a motto.',
    upright: m('mortality, endurance, facing fate', 'Postumio stands armed and steady before a skull. The card asks you to look plainly at endings and limits, and carry on regardless. What you can’t change, you can still meet well.'),
    reversed: m('fatalism, dread, giving up', 'Looking at the skull too long turns endurance into resignation. Not everything is fated. Find the one thing still in your hands.'),
    note: 'The name points to the Roman Postumii, but which one is unknown. Peter Mark Adams reads Postumio and Tulio (XI) as the paired torchbearers of the Mithraic mysteries; that is his argument, not settled scholarship. Modern reading.',
  },
  '03-the-empress': {
    title: 'Lenpio',
    picture: 'A soldier in a light helmet clutches his brow, a tuft of roots or flame in his other hand, his red banner furled on its lance beside him and a basin of blood at his feet.',
    upright: m('reckoning, remorse, facing a mistake', 'Lenpio holds his head over a basin of blood, his banner furled. Something has gone wrong and he knows it. Honest regret is where repair begins; let it teach you rather than sink you.'),
    reversed: m('guilt that stalls, denial, brooding', 'Remorse has become a place to live, or the mistake is being looked away from. Name it, make what amends you can, and walk on.'),
    note: 'Not identified; Lepidus has been suggested. The Brera catalogue sees an alchemical fire rite here. This reading follows the gesture of distress, and is modern.',
  },
  '04-the-emperor': {
    title: 'Mario',
    picture: 'A soldier in a winged helmet and red cloak, seen from behind, strides past a broken tree with his shield and banner, looking up at the sky.',
    upright: m('drive, ambition, self-made strength', 'Gaius Marius came from no great family and was consul seven times, by will and soldiering. This is the card of building your own authority. Use your strength and your plan; don’t wait to be given a place.'),
    reversed: m('ruthlessness, overreaching, old grudges', 'Marius ended his life in bloody feuding, holding on to power too long. Ambition can curdle into a need to win at any cost. Know when you have enough.'),
    note: 'Gaius Marius, the Roman general. Number IIII, the Emperor’s place elsewhere, and the theme of authority carries over. The red and the winged helmet have been read as signs of Mars. Modern reading.',
  },
  '05-the-hierophant': {
    title: 'Catulo',
    picture: 'A laurel-crowned young man with a bandaged leg holds a measuring staff hung with plumb-weights, a surveyor’s groma, beside a tall red standard and a shield.',
    upright: m('measure, sound judgement, earned honour', 'Catulo wears the victor’s laurel but holds a measuring tool, not a sword. Wins that last are measured and planned. Take the level of things before you build.'),
    reversed: m('rules for their own sake, fussiness, a wound ignored', 'Measuring can become a way of never acting, and the bandaged leg says something still needs tending. Let the rule serve the work, and see to the hurt.'),
    note: 'A Lutatius Catulus: either Gaius, whose sea victory ended the First Punic War, or Quintus, Marius’s colleague against the Cimbri. Number V, the Hierophant’s place elsewhere; Howard relates the groma to Temperance. Modern reading.',
  },
  '06-the-lovers': {
    title: 'Sesto',
    picture: 'A young man in pale armour stands facing us with a lit torch in one hand, a sword at his hip and his shield set down beside him.',
    upright: m('desire, a torch lit, choosing', 'A young man holds a burning torch: passion, warmth, the will that lights a way. In the place of the Lovers, it asks what you are burning for. Carry the flame where you mean it to go.'),
    reversed: m('recklessness, desire that harms, burning out', 'A torch can light a room or set it on fire. If Sesto is Sextus Tarquinius, this is the card of a desire that brought down a kingdom. Hold your fire until you know what it will catch.'),
    note: 'Uncertain: Sextus Pompey, Pompey’s son, and Sextus Tarquinius, whose crime against Lucretia ended Rome’s kings, have both been proposed; the Brera catalogue reads the figure as Mercury. Modern reading.',
  },
  '07-the-chariot': {
    title: 'Deo Tauro',
    picture: 'A laurelled man sits in a fantastic chariot whose back curls up like a scaled fish-tail, a halberd in his hand and a shield marked SC on its wheel.',
    upright: m('triumph, momentum, a steady seat', 'Deo Tauro rides in state, calm in a strange and splendid car. This is success carried with composure. Keep your seat and your aim, and let the momentum do its work.'),
    reversed: m('stalled progress, pomp, a shaky alliance', 'Deiotarus kept his throne by backing whoever was winning in Rome, and nearly lost it for that. Watch for a triumph that depends on someone else’s favour. Steer by your own course.'),
    note: 'Plainly the deck’s Chariot. The name is Deiotarus, king of Galatia, whom Cicero defended; Peter Mark Adams argues the spelling, “god bull”, deliberately points to Taurus and the Mithraic bull. Modern reading.',
  },
  '08-strength': {
    title: 'Nerone',
    picture: 'A wild-haired man in armour holds a baby upside down by the leg over a fire, a staff hung with metal balls over his shoulder and a shield at his side.',
    upright: m('power and its test, restraint, the fire', 'Nero stands for strength without conscience, and here he holds a child over the flames. As a reading, the card asks what you will do with power over something small and helpless. Real strength is the hand that holds back.'),
    reversed: m('cruelty, harm done, power abused', 'The fire is lit and someone small is in danger. Watch for harshness, yours or another’s, toward the vulnerable. Step in, or step back; don’t look away.'),
    note: 'The emperor Nero. Number VIII, where the Rider–Waite–Smith puts Strength, but it shares nothing with that gentle card. Alchemical readings see the child in the fire as matter put to the flame. Modern reading.',
  },
  '09-the-hermit': {
    title: 'Falco',
    picture: 'An old bearded king, crowned, kneels with sceptre and shield and looks up at the sky, his helmet cast down on the ground beside him.',
    upright: m('humility, looking up, wisdom in age', 'A crowned king kneels and looks up, his helmet set aside. Even the mighty have something above them. Quiet your own voice and seek counsel beyond yourself.'),
    reversed: m('pride, refusing help, self-absorption', 'The king won’t kneel, or kneels only for show. Asking for guidance can feel like losing face. It isn’t.'),
    note: 'Falco is unidentified; a Roman consul, Quintus Sosius Falco, has been suggested. Number VIIII, the Hermit’s place elsewhere; the old man looking skyward fits it loosely. Modern reading.',
  },
  '10-wheel-of-fortune': {
    title: 'Venturio',
    picture: 'A soldier in a broad red hat walks with a staff, raising his other hand, a small winged shape at his feet.',
    upright: m('fortune, a turn, seizing the moment', 'Venturio’s name holds ventura, fortune, and he lifts a hand as if to catch it. If he is Ventidius Bassus, he was led as a child captive in a Roman triumph and later rode in a triumph of his own. Luck is turning; be ready.'),
    reversed: m('impatience, bad timing, waiting on luck', 'Grabbing at fortune too early, or waiting for it to do all the work. The wheel turns at its own pace. Prepare, then watch.'),
    note: 'No wheel is shown, though the card stands where Fortune stands. The link with Publius Ventidius Bassus is a suggestion, not settled. Modern reading.',
  },
  '11-justice': {
    title: 'Tulio',
    picture: 'A bearded man in a horned cap, seen from behind with his cloak swirling, holds up a tall flaming torch and looks into the sky.',
    upright: m('clarity, reason, a light held up', 'Tulio carries a torch high and looks beyond it. If he is Cicero, he is the voice of argument and law. Bring the matter into the light and judge it fairly.'),
    reversed: m('fine words, hiding, avoiding judgement', 'A torch can be held for show, and eloquence can cover an unfair case. Or a question that needs answering is being turned away from. Face it.'),
    note: 'A Tullius: Cicero, or Rome’s kings Tullus Hostilius and Servius Tullius. Number XI, where the Rider–Waite–Smith puts Justice, though no scales are shown. Peter Mark Adams pairs Tulio with Postumio as Mithraic torchbearers. Modern reading.',
  },
  '12-the-hanged-man': {
    title: 'Carbone',
    picture: 'An old bearded man in a winged cap walks with a staff under a crescent moon, carrying an oil lamp, a quiver marked S.P.Q.R. at his side.',
    upright: m('searching, patience, a light in the dark', 'An old man walks by moonlight with a small lamp. This is patient seeking through uncertain times. You don’t need to see the whole road, only the next stretch.'),
    reversed: m('confusion, suspicion, getting lost', 'Moonlight plays tricks and the lamp is small. Fears may be filling the gaps in what you know. Check before you believe.'),
    note: 'The Papirii Carbones were Roman consuls; which one is meant is unknown. Number XII, the Hanged Man’s place elsewhere, but the crescent links it to the Moon. Modern reading.',
  },
  '13-death': {
    title: 'Catone',
    picture: 'A young soldier studies an unrolled scroll while his spear pins the head of a fallen man to the ground; a star shines above him.',
    upright: m('endings, resolve, what must be cut', 'The only trump with a death on it. Catone stands over the fallen as if checking what fate has written. Something is over; let it be over, and act with integrity in what follows.'),
    reversed: m('harshness, refusing an ending, violence', 'An ending is being resisted, or met with more force than it needs. Cato’s stern virtue could be merciless. Let go cleanly, without cruelty.'),
    note: 'Cato, the Elder or the Younger. At XIII, as Death is elsewhere. Peter Mark Adams connects the head and the star to Algol, the “demon star” in the Gorgon’s head; that is his reading. The deck’s motto TRAHOR FATIS, “I am drawn by the fates”, appears here and on the Aces of Cups and Coins.',
  },
  '14-temperance': {
    title: 'Bocho',
    picture: 'A wild-haired man kneels behind a great shield, gasping up at the sky, a red banner on a lance in his hands.',
    upright: m('pressure, a hard choice, waiting it out', 'Bocchus, king of Mauretania, was caught between Rome and his son-in-law Jugurtha, and wavered for months. The card is that suspended moment under pressure. Wait if you must, but know the choice will come.'),
    reversed: m('betrayal, frustration, a choice made badly', 'Bocchus chose in the end by handing Jugurtha over in chains. Watch for an easy way out that costs someone else. Choose what you could live with.'),
    note: 'Bocchus I of Mauretania, from Sallust’s Jugurthine War. Number XIIII, Temperance’s place elsewhere; Howard sees the kneeling traitor as closer to the Hanged Man. Modern reading.',
  },
  '15-the-devil': {
    title: 'Metelo',
    picture: 'A bearded warrior in a red cap sits gesturing toward a purple column crowned with flame, a banner marked SC above him and his shield at his knee.',
    upright: m('self-command, steadiness, a fire kept', 'Metelo sits calmly before a column of flame, one hand raised as if to steady it. Strong feeling, desire or anger, kept in its place. Tend your fire; don’t feed it blindly.'),
    reversed: m('temper, compulsion, being held', 'The flame has the upper hand. In the Devil’s place, this points to habits and appetites that hold you. Notice what you keep returning to, and why.'),
    note: 'One of the Caecilii Metelli. Lucius Caecilius Metellus rescued the sacred objects from the burning temple of Vesta, which the flaming column may recall; that link is only a suggestion. Number XV, the Devil’s place elsewhere. Modern reading.',
  },
  '16-the-tower': {
    title: 'Olivo',
    picture: 'A crowned young man, seen from behind, points up at a dark-rayed sun, a basilisk crouching at his feet.',
    upright: m('radiance, change by fire, breakthrough', 'A young king points to a blazing sun while a basilisk crouches at his feet. In alchemical writing the basilisk belongs to the making of gold. Something is being burned clear to make room for something finer.'),
    reversed: m('pride, sudden upheaval, scorching', 'The sun that ripens can also scorch. Watch for pride before a shake-up, or a change forced too fast. Step back out of the glare.'),
    note: 'Olivo is unidentified. Number XVI, the Tower’s place elsewhere, though the picture shows the sun. The Brera catalogue links the basilisk to gold-making. Modern reading.',
  },
  '17-the-star': {
    title: 'Ipeo',
    picture: 'An old bearded man with great bat wings and a pointed cap, in a long robe, lifts his hands toward a small winged head set on a staff.',
    upright: m('invocation, reverence, help from beyond', 'Ipeo, bat-winged, prays to a winged head on a pole. This is the card of reaching for help beyond the everyday. Ask, and ask honestly, and be careful what you ask for.'),
    reversed: m('false idols, superstition, a bad bargain', 'What is being prayed to may not deserve it. Watch for trust placed in the wrong thing, or a promise that costs too much. Look hard at what you revere.'),
    note: 'Unidentified; Hippias has been suggested. Number XVII, the Star’s place elsewhere, but the wings and the idol are closer to a Devil, and Howard reads it so. Modern reading.',
  },
  '18-the-moon': {
    title: 'Lentulo',
    picture: 'A white-bearded old man in a long robe leans on a stone altar before a tall stand with a flame burning on top, his helmet laid on the ground at his feet.',
    upright: m('devotion, quiet practice, keeping vigil', 'Lentulo has laid down his helmet to tend a flame at an altar. This is patient, private devotion. Keep your practice quietly and let it work.'),
    reversed: m('secrecy, mixed motives, plotting', 'If he is Lentulus Sura, he is a conspirator behind a dignified face. Things done in private may not be what they seem. Ask what the rite is really for.'),
    note: 'One of the Cornelii Lentuli, perhaps Lentulus Sura of Catiline’s conspiracy. Number XVIII, the Moon’s place elsewhere; the Brera catalogue sees a figure of Time, the flame standing in for an hourglass. Modern reading.',
  },
  '19-the-sun': {
    title: 'Sabino',
    picture: 'A crowned, bearded king in armour holds a long staff and a great shell-shaped basin, and looks up and away.',
    upright: m('plenty, generosity, looking ahead', 'Sabino holds a full basin and looks ahead with calm confidence. This is warmth and plenty held openly. Share what you have; there is enough.'),
    reversed: m('hesitation, hoarding, uncertainty', 'The basin is held tight, or the gaze wavers. Plenty kept back loses its warmth. Decide what to give.'),
    note: 'Unidentified; the Brera catalogue proposes a contemporary humanist. Number XVIIII, the Sun’s place elsewhere, though nothing sun-like is shown. The reading is a modern one from the picture.',
  },
  '20-judgement': {
    title: 'Nenbroto',
    picture: 'A young man reels back under a blast of fire from the sky; the top of a column breaks away beside him and a small crown lies on the ground.',
    upright: m('a fall from pride, shock, a structure broken', 'Nimrod, the mighty hunter said to have built Babel, is struck from above as his tower breaks. What was built on pride is coming down. Painful as it is, the ground is being cleared.'),
    reversed: m('disaster averted, clinging to ruins, defiance', 'The warning is heard, or it is shouted down. Holding on to what is falling only adds to the fall. Get clear, then build lower and truer.'),
    note: 'Nimrod, from Genesis 10 and the Babel story. Number XX, where the Rider–Waite–Smith puts Judgement, but the picture is the Tower’s, and the reading follows the Rider–Waite–Smith Tower closely.',
  },
  '21-the-world': {
    title: 'Nabuchodenasor',
    picture: 'A king sits sunk in a bed of grass or straw, his crown cast down beside him and a staff in his hand, beneath a great starry globe crossed by bands where a winged dragon flies.',
    upright: m('completion, humility, the world restored', 'In the Book of Daniel, Nebuchadnezzar is driven out to eat grass like an ox, and is restored when he learns humility. Here he sits under the whole world with his crown off. The cycle is complete; you come back wiser.'),
    reversed: m('stagnation, pride before the lesson, unfinished', 'The king is still in the field, not yet ready to look up. A lesson is waiting before things can close. Let go of the crown.'),
    note: 'Nebuchadnezzar of Babylon, as in Daniel 4. The deck’s World, with the globe of the heavens; the story is clear in the picture, and the reading built on it is modern.',
  },

  // ─── Batons ──────────────────────────────────────────────────────────────

  'wands-01': {
    picture: 'Two winged children steady a great knotted club planted in an empty suit of blue armour, a helmet and shield beside it, garlands above and the letters M and S on either side.',
    upright: m('energy, potential, a new venture', 'Two children raise a mighty club out of an empty breastplate. Strength is there, waiting for someone to take it up. Begin.'),
    reversed: m('delay, a false start, force with no one to use it', 'The armour stands empty. Energy with no body behind it, or a start that never gets going. Step into it.'),
    note: 'The letters M S are also on the Ace of Swords, perhaps a maker’s or patron’s mark; the arms on the Aces of Batons and Swords have been read as those of the Venetian Venier family (Brera catalogue). Modern reading.',
  },
  'wands-02': {
    picture: 'A stout naked man in a red cap and red boots walks along with two long staves, looking up.',
    upright: m('planning, setting out, a choice of path', 'He carries two staves and walks with his face lifted. Ideas are forming into plans. Choose your way.'),
    reversed: m('limits, fear, staying put', 'Two staves and no direction. Know your limits, but don’t use them as an excuse.'),
    note: 'Modern reading.',
  },
  'wands-03': {
    picture: 'A winged head is pierced through by three batons, one of them stopping its mouth, with a laurel wreath and a red ribbon below.',
    upright: m('silence, watching, waiting for the moment', 'A winged head held still by three staves, its mouth closed. Watch, think and say nothing yet. Your time to move is coming.'),
    reversed: m('frustration, words held back, impatience', 'Silence turns to choking. Something needs saying. Find a careful way to say it.'),
    note: 'The Brera catalogue and Howard read this card alchemically, without agreeing. The meaning here is a modern reading of the picture.',
  },
  'wands-04': {
    picture: 'A man in profile wears a huge red helmet through which four batons are thrust, a round shield behind him.',
    upright: m('defence, stability, holding your ground', 'A man wears his staves like a crown and a guard. What you know and have built is well defended. Stand firm.'),
    reversed: m('stubbornness, a closed mind, insecurity', 'Defending too fiercely, as if every question were an attack. Lower the guard a little.'),
    note: 'The Rider–Waite–Smith Four of Wands is a celebration; this card is a guard. Modern reading.',
  },
  'wands-05': {
    picture: 'A man in a red cloak hurries along with five batons slung across his back and a gourd swinging from his hand.',
    upright: m('effort, carrying, energy in motion', 'Laden and hurrying, gourd in hand. Lots of energy, many things on the go. Keep moving, but check where.'),
    reversed: m('scattered energy, wasted effort, strife', 'Running in circles with your arms full. Some of this effort is going nowhere. Put down what isn’t yours.'),
    note: 'The Brera catalogue links the gourd to the alchemist’s cucurbit, a distilling vessel. Modern reading.',
  },
  'wands-06': {
    picture: 'A youth in blue carries a bundle of batons tied with a ribbon under one arm and a lantern in his other hand.',
    upright: m('progress, guidance, light for the way', 'He carries his bundle and a lantern too. Progress made with care, the way ahead lit. Keep going; you can see enough.'),
    reversed: m('running low, fading light, delay', 'The lantern burns low and the bundle slips. Something needs replenishing. Stop and restock.'),
    note: 'The Rider–Waite–Smith Six of Wands is a victory ride; this card is a plainer journey. Modern reading.',
  },
  'wands-07': {
    picture: 'A man bends low beneath a bundle of batons tied with a purple ribbon, setting staves into the ground.',
    upright: m('groundwork, perseverance, digging in', 'He bends to set the staves in the ground. Hard, unglamorous work that stakes your claim. Keep at it.'),
    reversed: m('exhaustion, giving ground, a needed pause', 'Bent over too long. A rest isn’t a defeat. Stand up straight before you go on.'),
    note: 'Modern reading.',
  },
  'wands-08': {
    picture: 'Eight batons stand gathered in a tub bound with laurel wreaths, set on a red flower-shaped base.',
    upright: m('abundance, things in place, satisfaction', 'All the staves gathered and crowned with laurel. Things are in order and going well. Enjoy it.'),
    reversed: m('stagnation, stuck in place, delay', 'Gathered so tight nothing can move. Loosen something to let it flow again.'),
    note: 'The Rider–Waite–Smith Eight of Wands is staves in flight; this card is staves at rest. Modern reading.',
  },
  'wands-09': {
    picture: 'A naked youth wades through a stream, carrying nine batons in his arms.',
    upright: m('crossing over, endurance, nearly there', 'He wades the stream with his arms full. You are in the middle of the crossing. Keep going; the far bank is close.'),
    reversed: m('fatigue, fear of deep water, defensiveness', 'The current is strong and you are tired. Set something down before it pulls you over.'),
    note: 'Howard reads the crossing as the washing stage of the alchemical work. Modern reading.',
  },
  'wands-10': {
    picture: 'Ten batons stand in a red case, two of them crossed in front of a laurel-wreathed medallion with a Roman profile.',
    upright: m('achievement, honour, work completed', 'The staves stand together over a portrait in a laurel wreath. Work finished and honoured. Be proud of what you carried.'),
    reversed: m('resting on laurels, too much, a burden', 'The honour becomes a weight. Don’t let past success turn into one more load.'),
    note: 'Pamela Colman Smith’s Ten of Wands, a man bowed under his staves, follows the Sola Busca Ten of Swords rather than this card. Modern reading.',
  },
  'wands-11': {
    picture: 'A young man in a pale tunic walks with a long baton over his shoulder, a sword and a purse at his belt.',
    upright: m('enthusiasm, news, exploring', 'A youth sets out with his staff and purse. Curiosity and fresh energy. Go and look.'),
    reversed: m('restlessness, unprepared, careless', 'Off without a plan. Check the ground before you stride; a little preparation goes a long way.'),
    note: 'Modern reading.',
  },
  'wands-12': {
    title: 'Apolino',
    picture: 'A rider in a red cloak and close helmet leans forward on a grey horse, a baton in his hand, pointing ahead.',
    upright: m('pursuit, eagerness, a goal in sight', 'Apolino points ahead and rides for it. The goal is in sight. Go after it with energy.'),
    reversed: m('haste, scattered aims, overconfidence', 'Pointing everywhere at once: speed without aim. Pick one direction.'),
    note: 'The name may point to Apollo or to an Apollonius; it is unidentified. Modern reading.',
  },
  'wands-13': {
    title: 'Palas',
    picture: 'A crowned woman sits on a throne lettered D P, holding a baton and raising her other hand, a shield behind her.',
    upright: m('confidence, warmth, wise protection', 'Pallas Athena, goddess of wisdom and of crafts, sits with her staff and lifts a hand. Lead warmly, and protect what you value.'),
    reversed: m('control, jealousy, temper', 'Protection can become control. Watch for warmth turning to temper. Lower the staff.'),
    note: 'Palas is Pallas Athena. Modern reading.',
  },
  'wands-14': {
    title: 'Levio Plauto R.',
    picture: 'A crowned king in blue armour sits on a throne between two lions, pointing, a baton in his hand and a helmet at his feet.',
    upright: m('leadership, vision, direction', 'A king between lions, pointing the way. Vision, and the authority to see it through. Show people where to go.'),
    reversed: m('domineering, impulsive, bossy', 'Pointing without listening. Leadership slides into giving orders. Ask before you direct.'),
    note: 'A Roman name, perhaps a Plautius, with R. for re, king; unidentified. Modern reading.',
  },

  // ─── Cups ────────────────────────────────────────────────────────────────

  'cups-01': {
    picture: 'Three winged children play above a great carved vase lettered TRAHOR FATIS, “I am drawn by the fates”; one pours from a jug, one plays a pipe, and a shield of arms stands at its foot.',
    upright: m('abundance, grace, a gift of fate', 'Children pour and pipe over a vessel fit for a feast. The Ace of Cups is the heart’s plenty opening, and the motto calls it a gift of fate. Receive it.'),
    reversed: m('emptiness, a gift refused, waiting', 'The cup is there but nothing is poured, or what is offered isn’t taken. Feelings may be blocked or held back. Make room to receive.'),
    note: 'The arms on the Aces of Cups and Coins have been read as those of the Venetian Sanudo family (Brera catalogue). Modern reading.',
  },
  'cups-02': {
    picture: 'A small winged child sits in the bowl of a tall double vase, two great vessels stacked one on the other.',
    upright: m('balance, a pairing, care', 'Two vessels balanced one on another, with a small winged spirit on top. A partnership held in careful balance. Tend it gently.'),
    reversed: m('imbalance, a wobble, a mismatch', 'Stacked vessels topple easily. Something between two people is off-level. Steady it before adding more.'),
    note: 'The Rider–Waite–Smith Two of Cups shows two lovers; here the pairing is of vessels. Modern reading.',
  },
  'cups-03': {
    picture: 'Two covered cups hang from curling stems that grow out of a third vessel, purple leaves spreading below them.',
    upright: m('growth, fruit, things shared', 'The cups grow on stems like fruit from a shared root. What was planted together is ripening. Celebrate what grew.'),
    reversed: m('overstretched, a cutting off, hanging by a thread', 'The fruit hangs on thin stems. Something meant to be shared is being drawn off by one side. Feed the root.'),
    note: 'Modern reading.',
  },
  'cups-04': {
    picture: 'A naked man and a winged child bundle a cup into a big sack, while three covered cups stand on a shelf above them.',
    upright: m('storing, effort, keeping safe', 'Two figures work hard to bag up a cup and put it away. There is a time to gather and keep what you have. Look after it.'),
    reversed: m('hoarding, feelings shut away, effort wasted', 'Stuffing things in a sack isn’t the same as keeping them. What are you putting away so as not to look at it? Take it out again.'),
    note: 'Modern reading.',
  },
  'cups-05': {
    picture: 'A man walks with a pole across his shoulder and five covered jars hung about him on cords, looking up at the sky, a small dog at his heels.',
    upright: m('burden, carrying on, hope', 'He is laden with jars and still looks up. Some loads must be carried for a while. Keep your eyes on the sky.'),
    reversed: m('overload, a spill, letting go', 'Too many jars on too many cords: something is going to break. Set some down. Not every load is yours.'),
    note: 'The Rider–Waite–Smith Five of Cups is a scene of loss; this one is about carrying. Modern reading.',
  },
  'cups-06': {
    picture: 'Winged children clamber over a huge carved vase, clutching round covered cups.',
    upright: m('play, childhood, simple pleasure', 'Children climb a great vase, playing with the cups. Like the Six of Cups in other decks, it has a child’s gladness in it. Let yourself enjoy something simply.'),
    reversed: m('clinging to the past, mischief, immaturity', 'Play turns to scrambling for more, or the past is being climbed back into. Come down and live where you are.'),
    note: 'Close in spirit to the Rider–Waite–Smith Six of Cups and its children. Modern reading.',
  },
  'cups-07': {
    picture: 'A naked boy stands on a great crown-shaped dish set on a red chest, covered cups all around him, two of them sprouting.',
    upright: m('display, imagination, standing out', 'A boy poses on a pedestal of vessels, the centre of the show. This is imagination and the wish to be seen. Enjoy it, and keep your feet on something solid.'),
    reversed: m('showing off, illusion, empty display', 'The show is bigger than what is behind it. Watch for fantasies standing in for plans. Step down and check.'),
    note: 'Modern reading.',
  },
  'cups-08': {
    picture: 'Two winged children on a purple chest tie covered cups with red cords and hang them down its sides.',
    upright: m('arranging, setting down, a pause', 'Children busy hanging and arranging cups. It looks like play, but things are being put in order. Set your feelings out where you can see them.'),
    reversed: m('distraction, avoidance, a tangle', 'Busyness that fills the time so you needn’t feel anything, or things left in a tangle. Leave the game for a moment.'),
    note: 'The Rider–Waite–Smith Eight of Cups is a walking away; there is no such scene here. Modern reading.',
  },
  'cups-09': {
    picture: 'A merman with a long serpent tail rises from the sea, carrying covered cups in his arms while more float around him.',
    upright: m('wishes, plenty from the deep, contentment', 'Out of the sea comes a merman bearing cups. Good things are surfacing from below. Enjoy what arrives.'),
    reversed: m('excess, secrets surfacing, smugness', 'What comes up from the deep may not be what you wished for, or enjoyment slides into indulgence. Take only what you need.'),
    note: 'The Brera catalogue links the triton to a contemporary tale of miraculous water. Modern reading.',
  },
  'cups-10': {
    picture: 'A bearded old man’s face looks out from among ten covered cups, one balanced on his head, a string of red beads below.',
    upright: m('wholeness, wisdom, a full heart', 'An old, wise face sits among all the cups. Fullness of feeling comes with years and reflection. Take stock of how much you have.'),
    reversed: m('heaviness, brooding, too much to hold', 'Surrounded by cups and weighed down by one. Plenty can feel like a load. Put something down and breathe.'),
    note: 'The Brera catalogue reads the face as Hermes Trismegistus. Modern reading.',
  },
  'cups-11': {
    picture: 'A young man in red raises his hands toward a flaming vessel set on a purple pillar.',
    upright: m('wonder, devotion, a new feeling', 'A youth stops before a burning vessel with his hands lifted. Something has caught your heart and you want to understand it. Stay open.'),
    reversed: m('naivety, moods, infatuation', 'Wonder can tip into infatuation. Don’t worship the flame before you know it. Look again.'),
    note: 'Modern reading.',
  },
  'cups-12': {
    title: 'Natanabo',
    picture: 'A winged, bearded man in red rides a brown horse, turning to gesture behind him; a covered cup stands on the ground.',
    upright: m('charm, persuasion, an offer', 'In the Alexander Romance, Nectanebo the magician-king won Queen Olympias by coming to her in the guise of a god. This is a card of charm, offers and messages of the heart. Enjoy it, and know who is really at the door.'),
    reversed: m('seduction, deceit, a mask', 'The visitor is not who he says. Watch for flattery, or a promise dressed up as something grander. Look under the wings.'),
    note: 'Nectanebo, the last native pharaoh, who in medieval legend fathered Alexander the Great: one of the court cards drawn from Alexander’s circle. Modern reading.',
  },
  'cups-13': {
    title: 'Polisena',
    picture: 'A crowned woman sits on a wheeled throne with a dragon’s tail curling up behind it, reaching toward a vase on a red pedestal from which snakes or flames rise.',
    upright: m('deep feeling, loyalty, grace', 'Polyxena of Troy, loved by Achilles, met her fate with dignity. This queen holds strong feeling with grace. Be faithful to what you love.'),
    reversed: m('sacrifice, being used, feelings turned bitter', 'The vase is full of serpents. Watch for love that demands too much of you, or feelings gone sour. You need not lay yourself down on anyone’s tomb.'),
    note: 'Polisena is usually taken for Polyxena, Priam’s daughter, sacrificed on Achilles’ tomb. Modern reading.',
  },
  'cups-14': {
    title: 'Lucio Cecilio R.',
    picture: 'A young crowned king in red sits on a carved throne, a shield behind him, a covered cup at his feet and a small tree with a bird beside him.',
    upright: m('calm authority, generosity, steadiness', 'A king at ease on his throne, his cup set at his feet. This is the person who can hold feeling without being ruled by it. Be steady, and kind.'),
    reversed: m('moodiness, manipulation, rising anger', 'The king starts up from the throne. Feelings used to control others, or kept under a lid until they spill. Settle before you speak.'),
    note: 'A Roman name, perhaps one of the Caecilii Metelli, with R. for re, king; unidentified. Modern reading.',
  },

  // ─── Swords ──────────────────────────────────────────────────────────────

  'swords-01': {
    picture: 'Two men, one in red and one in blue, clasp each other around a single upright sword, the letters M and S on either side and a shield of arms behind.',
    upright: m('alliance, a clear decision, joined force', 'Two men grip one sword together. The Ace of Swords is a clear mind and a cutting decision; here it is a decision made with someone. Agree, and act.'),
    reversed: m('a struggle, a split, force misused', 'The embrace might be a wrestle. Watch for an alliance turning into a fight over who holds the blade. Clear the air.'),
    note: 'The letters M S appear also on the Ace of Batons. The arms have been read as the Venier family’s (Brera catalogue). Modern reading.',
  },
  'swords-02': {
    picture: 'Two naked figures with small horns each hold a sword, pressed close and leaning together.',
    upright: m('truce, standoff, two minds', 'Two figures each hold a sword, close enough to embrace or to fight. A balance holds, for now. Talk before anyone moves.'),
    reversed: m('tension breaking, mistrust, a decision forced', 'The truce won’t last. Someone will have to choose. Make the choice yourself.'),
    note: 'The Rider–Waite–Smith Two of Swords is a blindfolded woman; this card shares only the uneasy balance. Modern reading.',
  },
  'swords-03': {
    picture: 'A red heart is pierced by three swords, with a garland hung beneath it.',
    upright: m('heartache, grief, a painful truth', 'A heart run through by three swords: sorrow, plainly shown. Let it hurt; it is real. Grief that is felt can heal.'),
    reversed: m('healing, releasing pain, old wounds', 'The swords are coming out. The pain eases, or an old hurt is being let go. Be gentle with the place it was.'),
    note: 'Pamela Colman Smith’s Three of Swords follows this card almost exactly, and the reading here follows hers.',
  },
  'swords-04': {
    picture: 'Four swords cross through a laurel wreath tied with ribbons, an animal’s skull hanging below.',
    upright: m('rest, truce, a pause after struggle', 'Swords laid through a victor’s wreath, a skull beneath. The fight is over for now. Rest while you can.'),
    reversed: m('restlessness, burnout, back too soon', 'Picking up the swords before you have recovered. Rest isn’t laziness. Take the pause.'),
    note: 'Close in sense to the Rider–Waite–Smith Four of Swords, a knight at rest. Modern reading.',
  },
  'swords-05': {
    picture: 'Five swords stand bundled in a blue vase set on a stand, ribbons tied around their hilts.',
    upright: m('ideas gathered, strategy, holding back', 'Swords stored in a vase rather than wielded. Plans and arguments are gathering, and not every quarrel needs to be had. Choose which is worth it.'),
    reversed: m('conflict, a hollow win, tension', 'The swords are coming out of the vase. A fight may cost more than it gains. Walk away if you can.'),
    note: 'The reversed reading borrows from the Rider–Waite–Smith Five of Swords, a hollow victory. Modern reading.',
  },
  'swords-06': {
    picture: 'A heavy-bellied man bends under a basket of swords on his back, carrying more in his hands.',
    upright: m('moving on, a burden carried, transition', 'He carries all his swords with him, bowed under them. You are moving on, but taking the troubles too. Carry them somewhere you can set them down.'),
    reversed: m('stuck, too heavy, going nowhere', 'Heavy work that doesn’t move you forward. Lighten the load before taking another step.'),
    note: 'Modern reading.',
  },
  'swords-07': {
    picture: 'A laurel-crowned young man clambers into a boot-shaped quiver full of swords, gripping one, a shield marked S.P.Q.R. on the ground beneath him.',
    upright: m('strategy, stealth, getting what you need', 'He climbs into the quiver to take a sword. Cleverness, a plan, perhaps a back way in. Be strategic, and honest with yourself about why.'),
    reversed: m('deceit, getting caught, a poor plan', 'The climb is awkward and everyone can see. Sneaking rarely works for long. Ask openly.'),
    note: 'Loosely echoes the Rider–Waite–Smith Seven of Swords, a man making off with swords. Modern reading.',
  },
  'swords-08': {
    picture: 'A naked young man gathers eight swords into a garlanded urn.',
    upright: m('gathering, victory, order', 'He gathers the swords into a fine urn hung with garlands. Arguments settled, weapons put away with honour. Enjoy the clear space.'),
    reversed: m('feeling trapped, restriction, crowded thoughts', 'Too many swords in one vessel. Thoughts crowd in on each other. Take some out and look at them one by one.'),
    note: 'The reversed reading borrows from the Rider–Waite–Smith Eight of Swords, a bound woman. Modern reading.',
  },
  'swords-09': {
    picture: 'A man stoops to draw a sword from a purple well-head hung with laurel, a winged child standing on its rim among the other swords.',
    upright: m('a solution found, release, worry answered', 'He draws a sword out of the well while a winged child watches. The answer to what has kept you awake is within reach. Reach for it.'),
    reversed: m('anxiety, sleeplessness, despair', 'The well seems bottomless and worries multiply at night. Say them aloud to someone in daylight.'),
    note: 'The reversed reading borrows from the Rider–Waite–Smith Nine of Swords, a night of anguish. Modern reading.',
  },
  'swords-10': {
    picture: 'A man seen from behind bends double, pushing a bundle of ten swords into a sack.',
    upright: m('an end, packing up, enough', 'All the swords go into the sack. A struggle is finished and you are putting it away. It is over; let it be.'),
    reversed: m('dragging it on, overload, a burden carried too far', 'Bent double under too much. The struggle is over, but you are still carrying it. Set it down.'),
    note: 'Pamela Colman Smith’s Ten of Wands, a man bowed under his bundle, closely follows this card. The Rider–Waite–Smith Ten of Swords, a man struck down, is a different picture.',
  },
  'swords-11': {
    picture: 'A young man with roses in his hair plays a lute as he walks, a sword standing upright beside a tree.',
    upright: m('curiosity, wit, a light touch', 'A youth with a lute, his sword set aside. Quick thinking goes best with a light heart. Learn, listen and play.'),
    reversed: m('idle talk, distraction, gossip', 'All song and no edge. Watch for chatter where thought is needed. Pick up the sword.'),
    note: 'Modern reading.',
  },
  'swords-12': {
    title: 'Amone',
    picture: 'A half-naked bearded rider on a dark horse swings an enormous sword over his head, a bare tree behind him.',
    upright: m('force, speed, conviction', 'Amone swings a huge sword at full stretch. Bold, decisive action, the kind that clears the way. Strike when you know you are right.'),
    reversed: m('aggression, rashness, a blow regretted', 'All force and no aim. Anger is doing the thinking. Lower the blade.'),
    note: 'Usually read as Zeus Ammon, the god whom Alexander claimed as his father; the British Museum’s catalogue suggests Amon, king of Judah. Peter Mark Adams ties Ammon to the deck’s dark Saturn. Modern reading.',
  },
  'swords-13': {
    title: 'Olinpia',
    picture: 'A crowned woman sits holding an upright sword in one hand and a slender rod in the other, a great curling leaf behind her.',
    upright: m('clear sight, independence, sharp judgement', 'Olympias, mother of Alexander, was known for her sharp mind and her mysteries. This queen sees clearly and isn’t fooled. Say what you see.'),
    reversed: m('ruthlessness, scheming, coldness', 'Olympias was also ruthless in her son’s cause. Watch for cleverness turned to cutting others down. Keep the edge, lose the cruelty.'),
    note: 'Olympias, Alexander’s mother, remembered in legend as a sorceress. Modern reading.',
  },
  'swords-14': {
    title: 'Alecxandro M.',
    picture: 'Alexander the Great in red armour stands with sword and orb, griffins at his back and a chariot wheel beside him.',
    upright: m('mastery, ambition, command', 'Alexander, with the griffins that legend says carried him up into the sky. This is the commanding mind that sees far. Lead with clarity.'),
    reversed: m('overreach, arrogance, a fall', 'In the legend, Alexander’s flight is turned back from heaven. Ambition can climb too high. Know the limit.'),
    note: 'Alexander the Great, at the centre of the deck’s court cards. The griffins recall the medieval tale of his flight. Modern reading.',
  },

  // ─── Coins ───────────────────────────────────────────────────────────────

  'pentacles-01': {
    picture: 'A winged child holds up a great medallion ringed with the words SERVIR CHI PERSEVERA INFIN OTIENE, while two more sit or sleep beside him, under garlands and an ox skull, a scroll reading TRAHOR FATIS at one side.',
    upright: m('reward, patience, a solid beginning', 'The ring around the coin reads, roughly, “Serve: whoever perseveres wins in the end.” This is the seed of material good, earned by patience. Start, and keep at it.'),
    reversed: m('impatience, short cuts, a chance slept through', 'One child holds the coin while another sleeps. Wanting the reward without the long service. Wake up and do the steady part.'),
    note: 'The arms have been read as those of the Venetian Sanudo family (Brera catalogue). Modern reading.',
  },
  'pentacles-02': {
    picture: 'Two linked laurel medallions hold profile portraits: above, a laurelled man in the antique style; below, an old man in a blue cap and red robe.',
    upright: m('partnership, exchange, two sides balanced', 'Two faces joined link to link. A useful partnership, or two needs being balanced. Keep both in view.'),
    reversed: m('strain, unequal terms, juggling', 'The link is pulling. One side may be getting more than the other. Rebalance it.'),
    note: 'The Brera catalogue identifies the portraits as Ercole d’Este, duke of Ferrara, and the physician Michele Savonarola; argued, not certain. Modern reading.',
  },
  'pentacles-03': {
    picture: 'A small child staggers under a draped purple vessel crowned with three coins and an ox skull, red ribbons flying.',
    upright: m('effort, learning the work, first results', 'A child bears a load bigger than he is, and bears it. Skill grows by doing. Keep working and it will get lighter.'),
    reversed: m('strain, poor footing, work out of reach', 'The load is more than one small pair of hands can carry. Ask for help, or take on less for now.'),
    note: 'Modern reading.',
  },
  'pentacles-04': {
    picture: 'A stout naked woman with a crescent on her brow carries a huge purple basin of coins on her back, holding another coin at her side.',
    upright: m('holding, security, earthy strength', 'She carries the whole store herself, steady and broad. This is security built and kept. Hold what you have with a firm grip.'),
    reversed: m('greed, a heavy load, fear of loss', 'Carrying everything yourself because you won’t let it go. Holding on can bend your back. Share the load.'),
    note: 'The Brera catalogue reads her as an earth mother. Close in sense to the Rider–Waite–Smith Four of Pentacles. Modern reading.',
  },
  'pentacles-05': {
    picture: 'A figure in a feathered bird costume, with horns and a red shield, bends over a bench; coins hang on cords around him and a small fire burns at his foot.',
    upright: m('disguise, hard times, getting through', 'A man dressed as a bird, crouched and hidden. Hard times call for odd shifts. Get through them however you must, and keep your dignity.'),
    reversed: m('deception, hidden motives, exposure', 'The costume slips. Watch for people or plans that are not what they seem. Come out from behind it.'),
    note: 'The Brera catalogue reads the costume and fire alchemically. The Rider–Waite–Smith Five of Pentacles shows poverty; this reading is modern.',
  },
  'pentacles-06': {
    picture: 'A man in a purple cloak and cap kneels at an anvil, hammering a plate, six coins heaped over a doorway behind him.',
    upright: m('craft, diligence, fair work', 'A smith beats a plate on the anvil. Good work done well is its own wealth. Keep hammering.'),
    reversed: m('drudgery, perfectionism, work unpaid', 'The hammering never ends, or the work isn’t valued. Ask whether the effort is going where it should.'),
    note: 'Often compared with Pamela Colman Smith’s Eight of Pentacles, the craftsman at his bench; the likeness is close, and the reading follows it.',
  },
  'pentacles-07': {
    picture: 'A naked young man sits working a staff in a blue vase heaped with coins, beneath purple wings and a red band, a falcon standing by.',
    upright: m('tending, patience, work in progress', 'He keeps working at the vessel while the falcon waits. Growth takes time and attention. Keep tending; don’t pull it up to look at the roots.'),
    reversed: m('impatience, wasted effort, poor returns', 'Stirring for the sake of it, or giving up just before it is ready. Check whether the work still makes sense.'),
    note: 'Howard reads the youth as regulating the heat of the alchemical work. Modern reading.',
  },
  'pentacles-08': {
    picture: 'A basket of coins hangs from a dead tree above a skull and bones, one coin fallen beside them and a little bird in the branches.',
    upright: m('savings, reckoning, what lasts', 'Wealth hangs on a dead tree above a skull: you can’t take it with you. Gather sensibly, and remember what it is for.'),
    reversed: m('hoarding, hidden riches, skills unused', 'The basket hangs out of reach and does no one any good. What knowledge or means are you sitting on? Bring it down and use it.'),
    note: 'The Rider–Waite–Smith Eight of Pentacles is a craftsman; this card is closer to a memento mori. Modern reading.',
  },
  'pentacles-09': {
    picture: 'A basket full of coins is set over a fire, and a small figure burns among the flames beneath it.',
    upright: m('refining, trial, gain through heat', 'Coins over a fire, and someone in the flames: wealth won through hardship. What you are going through is refining you. Hold steady.'),
    reversed: m('burnout, loss, too high a price', 'The fire costs more than the gold is worth. Watch for gain that is burning you up. Step out of the flames.'),
    note: 'The Brera catalogue reads the burning child as the nigredo, the blackening of the alchemical work. The Rider–Waite–Smith Nine of Pentacles is ease in a garden; this reading is modern.',
  },
  'pentacles-10': {
    picture: 'A winged child drops a coin into an open chest already full of coins, a candlestick behind it and a small white animal, perhaps a dog, beside the chest.',
    upright: m('wealth secured, legacy, home', 'The last coin goes into a full chest. Something lasting is complete, a store for the household and those to come. Close the lid and be glad.'),
    reversed: m('family money troubles, something unguarded, secrets', 'The chest stands open. Watch for disputes over what is shared or inherited, or for something left unguarded. See to the lock.'),
    note: 'Close in sense to the Rider–Waite–Smith Ten of Pentacles. Modern reading.',
  },
  'pentacles-11': {
    picture: 'A young man in red points down at a coin by his feet, a falcon on a perch behind him and another bird in flight.',
    upright: m('study, a new chance, care', 'A youth with his hawks points to a coin on the ground. A practical opportunity is at your feet. Pick it up and learn its worth.'),
    reversed: m('hesitation, holding too tight, distraction', 'Eyes on the bird, not the coin. Or the chance is held so close it can’t grow. Let it fly a little.'),
    note: 'Modern reading.',
  },
  'pentacles-12': {
    title: 'Sarafino',
    picture: 'A young man in red reins in a rearing white horse that twists its head back, his shield on his arm and a great coin on the ground below.',
    upright: m('control, steadiness, work in hand', 'Sarafino holds a rearing horse in check. Practical matters need a firm, patient hand. Keep the reins.'),
    reversed: m('stubbornness, things getting away, a bolt', 'The horse is winning. Something practical is running out of control, or you are holding so hard it fights you. Loosen, then steer.'),
    note: 'The Brera catalogue identifies Sarafino with a contemporary humanist; unconfirmed. Modern reading.',
  },
  'pentacles-13': {
    title: 'Elena',
    picture: 'A crowned woman in red sits by a pillar, gazing into a round coin like a mirror and touching it with a slender rod, a glass flask on the pillar beside her.',
    upright: m('beauty, resourcefulness, skill with what is at hand', 'Helen studies a coin as if it were a mirror, a small flask beside her. She knows the worth of things, herself included. Use your gifts with care.'),
    reversed: m('vanity, trading on looks, magical thinking', 'Looking in the mirror too long, or hoping a charm will do what work should. Put the mirror down.'),
    note: 'Elena is usually taken for Helen of Troy. Some read her gesture as a rite, some as a craft; it is unclear. Modern reading.',
  },
  'pentacles-14': {
    title: 'R. Filipo',
    picture: 'A crowned king in red armour sits holding a banner marked PAX, a great shield and a coin beside him and a bird perched above.',
    upright: m('prosperity, peace through strength, a provider', 'Philip of Macedon built a kingdom’s wealth and army, and here he holds a banner of peace. This is the person who secures prosperity and keeps it. Lead with a steady hand.'),
    reversed: m('greed, power before peace, stubbornness', 'The banner says peace, but the shield is very large. Watch for wealth used to dominate. Ask what the strength is protecting.'),
    note: 'Philip II of Macedon, Alexander’s father, one of the Alexander court figures. Modern reading.',
  },
};
