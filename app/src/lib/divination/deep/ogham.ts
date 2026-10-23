// The Grimoire's longer pages on the twenty feda of the ogham. The names'
// meanings follow the medieval Irish sources (the Auraicept na nÉces and In
// Lebor Ogaim) and Damian McManus's A Guide to Ogam (1991); the word-oghams
// (Bríatharogam) are quoted briefly and put into English. Many tree names
// come from medieval lists rather than from the letters themselves, and most
// divinatory meanings are modern; each page says so where it matters.
// Keyed by the names in staves.ts. Pure data.

import type { StaveDeep } from './types.ts';

const B = 'On a standing stone, ogham is cut along an edge and read from the bottom up; in manuscripts it runs left to right along a line.';

export const OGHAM_DEEP: Record<string, StaveDeep> = {
  Beith: {
    words: ['beginnings', 'cleansing', 'renewal'],
    stave:
      'One short stroke to one side of the stem line: to the right of an upright edge, or below a written line. Its sound is b. The name, beithe, means birch, one of the few letter names whose tree is certain. ' + B,
    meaning:
      'The Auraicept na nÉces, the medieval Scholars’ Primer, says the first thing ever written in ogham was seven b’s cut on a birch rod, a warning to the god Lug that his wife would be taken unless birch guarded her. The word-oghams describe the tree: Morann calls it “féochos foltchain”, withered foot with fine hair, and another list calls it “glaisem cnis”, greyest of skin, for the pale bark. Birch is the first tree to green after winter and the first in the row. Readers today take it as beginnings, cleansing and a fresh start.',
    correspondences:
      'First letter of the first aicme, Aicme Beithe (B, L, F, S, N), whose strokes all fall on the same side. Letter B. Tree: birch.',
    practice:
      'In a reading, Beith says begin: the slate is wiped clean. Birch twigs made brooms in many places, and people still sweep out the old year with them, or use birch in rites of cleansing and new starts. Carve it on birch as Ogma’s first letter was carved.',
    question: 'What would you begin if the slate were clean?',
  },
  Luis: {
    words: ['protection', 'insight', 'vigilance'],
    stave:
      'Two short strokes to the same side as Beith. Its sound is l. The name is uncertain: luis may mean a flame, or a herb. The medieval tree lists give rowan (cáerthann), but that may have been worked back from the letter. ' + B,
    meaning:
      'The word-oghams speak of brightness and of cattle. Morann calls it “lí súla”, lustre of the eye; another list calls it “carae cethrae”, friend of cattle, and a third “lúth cethrae”, sustenance of cattle. Whether flame or herb, it is something bright and useful. Rowan suits the bright eye well, with its red berries, and Irish and Scottish folklore is full of rowan sprigs tied with red thread over doors and byres against harm. Readers today take Luis as protection, quickened insight and seeing clearly.',
    correspondences:
      'Second letter of Aicme Beithe. Letter L. Tree: rowan in the medieval lists; the name may mean flame or herb.',
    practice:
      'In a reading, Luis says trust what you notice; you are guarded. Rowan crosses bound with red thread are a well-known folk charm for the home, the cattle and the cradle, and the rune-like ogham can be cut on a rowan twig to make one.',
    question: 'What have you noticed that you haven’t yet trusted?',
  },
  Fearn: {
    words: ['steadiness', 'shield', 'support'],
    stave:
      'Three short strokes to the same side as Beith. Its sound was originally w or v, later f. The name, fern, means alder; this tree is one of the certain ones. ' + B,
    meaning:
      'The word-oghams make alder a defender. Morann calls it “airenach fían”, the vanguard of warrior-bands, for shields were made of alder; others call it “comét lachta”, guarding of milk, for milk vessels, and “dín cridi”, protection of the heart, again the shield. Alder grows in wet ground and its wood lasts under water, so it was used for piles and bridges. Modern writers link it to Bran the Blessed, who in the Welsh Mabinogi lies down as a bridge for his army, saying “he who is chief, let him be a bridge”; that link comes from Robert Graves in the 1940s. Readers take it as steadiness and support.',
    correspondences:
      'Third letter of Aicme Beithe. Letter F (V). Tree: alder.',
    practice:
      'In a reading, Fearn asks you to stand firm and hold the way open for others. It suits charms for protection of the home and for anyone who must be a bridge: carers, mediators, leaders.',
    question: 'Who are you holding up, and who holds you?',
  },
  Sail: {
    words: ['feeling', 'flexibility', 'intuition'],
    stave:
      'Four short strokes to the same side as Beith. Its sound is s. The name, sail, means willow, the same root as the Latin salix; this tree is certain. ' + B,
    meaning:
      'The word-oghams are bittersweet. Morann calls it “lí ambí”, the colour of a lifeless one, for the pale willow; others call it “lúth bech”, sustenance of bees, and “tosach mela”, beginning of honey, for the early willow catkins the bees feed on. Willow grows by water, bends without breaking and roots easily from a cutting. The link with the moon is modern. Readers take it as feeling, flexibility, dreams and intuition.',
    correspondences:
      'Fourth letter of Aicme Beithe. Letter S. Tree: willow.',
    practice:
      'In a reading, Sail says bend, don’t break; let feeling guide you. Willow is used in dream and moon work, for wands and for weaving; in many places it is a tree of grief, too. Plant a willow cutting by water as a living spell for resilience. Willow bark gave an old remedy for pain and fever, which is a good reminder that what bends can also heal.',
    question: 'Where could you bend, rather than break?',
  },
  Nion: {
    words: ['connection', 'weaving', 'peace'],
    stave:
      'Five short strokes to the same side as Beith, the last of the first aicme. Its sound is n. The name, nin, may mean a fork or forked branch; the medieval lists give ash (uinnius). ' + B,
    meaning:
      'The word-oghams speak of peace and of women’s work. Morann calls it “costud síde”, establishing of peace, and another list “bág ban”, the boast of women, perhaps for a weaver’s beam. Ash made spear-shafts, tool handles and looms; in Irish lore, some of the great sacred trees of Ireland were ash. The link with Yggdrasil, the Norse world-ash, is a modern borrowing. Readers take Nion as connection: between people, between things, between worlds.',
    correspondences:
      'Fifth letter of Aicme Beithe. Letter N. Tree: ash in the medieval lists; ash is one of the “nobles of the wood” in Old Irish law.',
    practice:
      'In a reading, Nion asks you to see how things connect, and where a link has frayed. It suits weaving and cord magic, knot spells, and peace-making between people who have fallen out. An ash stave makes a traditional staff or wand, strong and springy.',
    question: 'What thread connects the things you are worried about?',
  },
  Uath: {
    words: ['fear', 'restraint', 'threshold'],
    stave:
      'One short stroke to the other side of the stem line from Beith: to the left of an upright edge, or above a written line. Its sound is h. The name, úath, means fear or horror; the medieval lists give hawthorn (sceith). ' + B,
    meaning:
      'The word-oghams keep the fear. Morann calls it “conál cuan”, an assembly of packs of hounds; another list “bánad gnúise”, a blanching of faces; and another “ansam aidche”, most difficult at night. Hawthorn is a fitting tree: thorned, and in Irish folklore the lone fairy thorn that no one cuts. Readers today take Uath as a pause or test before what you hope for, a threshold that asks for patience and respect.',
    correspondences:
      'First letter of the second aicme, Aicme hÚatha (H, D, T, C, Q). Letter H. Tree: hawthorn in the medieval lists; the name itself means fear.',
    practice:
      'In a reading, Uath says wait: something must be faced before you go on. Hawthorn blossom belongs to May and Bealtaine; but it is old Irish custom not to bring it indoors, and never to cut a fairy thorn. Work with it outdoors and with respect.',
    question: 'What fear stands at the gate, and what is it guarding?',
  },
  Dair: {
    words: ['strength', 'endurance', 'doorway'],
    stave:
      'Two short strokes on the same side as Uath. Its sound is d. The name, dair, means oak; this tree is certain. ' + B,
    meaning:
      'The word-oghams praise its height and its wood. Morann calls it “ardam dossaib”, highest of bushes; others call it “grés soír”, a craftsman’s handiwork, and “slechtam soíre”, most carved of craftsmanship. The medieval scholars also linked dair with the word for a door, and doors were made of oak. In Old Irish law the oak was one of the seven “nobles of the wood”, with heavy fines for felling one. Readers take Dair as strength, endurance, steadiness and an opening. The modern idea of the oak king of the waxing year is much later, from twentieth-century writers.',
    correspondences:
      'Second letter of Aicme hÚatha. Letter D. Tree: oak, a noble of the wood.',
    practice:
      'In a reading, Dair says stand tall and go through the door that opens. Oak is used for strength, protection and endurance, and acorns are carried for luck and long life. Many groves and gatherings meet under an oak. Its slow growth is part of its lesson: strength that lasts is built over years.',
    question: 'What door is opening, and are you strong enough to walk through it?',
  },
  Tinne: {
    words: ['challenge', 'balance', 'mettle'],
    stave:
      'Three short strokes on the same side as Uath. Its sound is t. The name, tinne, means a bar of metal, an ingot; the medieval lists give holly (cuileann), perhaps for the sound. ' + B,
    meaning:
      'The word-oghams are all metalwork. Morann calls it “trian roith”, a third of a wheel, perhaps the iron rim; others “smiur gúaile”, marrow of charcoal, and “trian n-airm”, a third of a weapon. So Tinne is about metal tested in fire. Holly, with its hard white wood and green leaves through winter, also stood among the nobles of the wood. Readers take Tinne as a challenge met with courage and fairness. The holly king of the waning year is a modern idea, not from the ogham.',
    correspondences:
      'Third letter of Aicme hÚatha. Letter T. Tree: holly in the medieval lists; the name means a metal bar.',
    practice:
      'In a reading, Tinne says hold your ground, justly; you are being tested. Holly is used for protection and for winter rites, and brought in at midwinter. Smiths’ work and anything forged suit it too. Lay a nail or a piece of iron beside the holly on your altar to honour both the letter and its tree, and to ask for the steadiness to face a trial fairly.',
    question: 'What is this test showing you about what you are made of?',
  },
  Coll: {
    words: ['wisdom', 'inspiration', 'insight'],
    stave:
      'Four short strokes on the same side as Uath. Its sound is c, a hard k. The name, coll, means hazel; this tree is certain. ' + B,
    meaning:
      'The word-oghams find it sweet. Morann calls it “caíniu fedaib”, fairest of trees; others “carae blóesc”, friend of nutshells, and “milsem fedo”, sweetest of wood. In Irish story, nine hazels grow over the well of Segais, and their nuts fall into the water and feed the salmon of knowledge; Fionn mac Cumhaill gains his wisdom by burning his thumb on that salmon and sucking it. Readers take Coll as wisdom, inspiration and the flash of seeing. It is one of the few feda where the old lore and the modern meaning agree closely.',
    correspondences:
      'Fourth letter of Aicme hÚatha. Letter C (K). Tree: hazel, a noble of the wood.',
    practice:
      'In a reading, Coll says trust the idea that comes. Hazel makes the traditional dowsing rod and many wands, and hazelnuts are eaten or offered for wisdom and poetry. It suits study, writing and divination. Keep a few hazelnuts in a bowl on your desk or altar, and eat one before you begin something that needs a clear head.',
    question: 'What do you know that you didn’t learn from anyone?',
  },
  Ceirt: {
    words: ['choice', 'wholeness', 'beauty'],
    stave:
      'Five short strokes on the same side as Uath. Its sound was kw, written Q. The name, ceirt, probably means a rag or a bush; the medieval lists give apple (aball), possibly by way of an old spelling, quert. ' + B,
    meaning:
      'The word-oghams fit a rag better than a tree: one calls it “dígu fethail”, the dregs of clothing. Apple, the tree it is given in the lists, is among the nobles of the wood, and in Irish story Emain Ablach, the isle of apples, is a paradise across the sea; a silver branch with apples summons Bran mac Febail there. Readers today take Ceirt through the apple: beauty, wholeness, the otherworld, and a choice to make.',
    correspondences:
      'Fifth letter of Aicme hÚatha. Letter Q. Tree: apple in the medieval lists; the name may mean rag.',
    practice:
      'In a reading, Ceirt asks what truly nourishes you, and to choose that. Apples are offered at Samhain and used in love and otherworld work; cut one across and you find a five-pointed star.',
    question: 'Which choice would leave you more whole?',
  },
  Muin: {
    words: ['effort', 'truth', 'harvest'],
    stave:
      'One stroke slanting across the stem line. Its sound is m. The name is uncertain: muin may mean the neck or upper back, or a trick, or love. The medieval lists give vine (finemain), which didn’t grow in early Ireland. ' + B,
    meaning:
      'The word-oghams point to the neck. Morann calls it “tressam fedmae”, strongest of effort, as of an ox’s neck under the yoke; another list calls it “conar gotha”, path of the voice. Modern readings follow the vine of the lists: harvest, wine that loosens the tongue, and truth spoken plainly. Some use bramble instead, which does grow wild in Ireland. Both are later choices; the old sense is effort and the voice.',
    correspondences:
      'First letter of the third aicme, Aicme Muine (M, G, NG, Z, R), whose strokes slant across the line. Letter M. Plant: vine or bramble in later lists.',
    practice:
      'In a reading, Muin says put your shoulder to it, and say what is true. Brambles are used in binding and protective work, and their fruit at the harvest; a bowl of blackberries suits Lúnasa.',
    question: 'What truth are you carrying that is ready to be spoken?',
  },
  Gort: {
    words: ['tenacity', 'growth', 'abundance'],
    stave:
      'Two strokes slanting across the stem line. Its sound is g. The name, gort, means a field or garden; the medieval lists give ivy (eidenn). ' + B,
    meaning:
      'The word-oghams speak of fields and plenty. Morann calls it “millsiu féraib”, sweeter than grasses; others “ined erco”, a place for cows, and “sásad ile”, the sating of multitudes. So Gort was first the cornfield. Ivy, the lists’ plant, spirals and holds fast and stays green all winter. Readers today take Gort through the ivy, as persistence and inner growth, and through the field, as plenty.',
    correspondences:
      'Second letter of Aicme Muine. Letter G. Plant: ivy in the medieval lists; the name means field.',
    practice:
      'In a reading, Gort says keep going; hold on. Ivy is used in binding and in winter decorations, and in love charms for faithfulness. Garden and field work honour the older meaning: sow, weed and harvest with attention, and share what the ground gives you. A strand of ivy wound round a candle or a cord is a simple charm for staying power.',
    question: 'What are you holding on to, and is it holding you up?',
  },
  nGéadal: {
    words: ['healing', 'purpose', 'action'],
    stave:
      'Three strokes slanting across the stem line. Its sound is ng, perhaps once gw. The name, gétal, is uncertain, possibly “killing”; the medieval lists give broom or reed (gilcach). ' + B,
    meaning:
      'The word-oghams are about healing and slaying at once. Morann calls it “lúth lego”, a physician’s strength; another list “étiud midach”, a physician’s robe; and another “tosach n-échto”, the beginning of slaying. Broom and reed grow straight and quick; reeds made pens and roofs, broom made brooms. The links to these plants come from the medieval lists, and the healing meaning from the word-oghams. Readers take nGéadal as clear purpose, decisive action, and healing.',
    correspondences:
      'Third letter of Aicme Muine. Letter NG. Plant: broom or reed in the medieval lists.',
    practice:
      'In a reading, nGéadal says act now, with purpose. Broom sweeps a space clean before ritual, and reeds are used for wands, pens and pipes. It suits healing work that needs a firm hand, and decisions that cut cleanly. Sweep your working space with a broom of broom twigs before a rite, and write your intention with a reed pen.',
    question: 'What would you do if you stopped hesitating?',
  },
  Straif: {
    words: ['necessity', 'hardship', 'resolve'],
    stave:
      'Four strokes slanting across the stem line. Its sound is written Z, probably st or sw in early Irish. The name, straif, is of uncertain meaning, perhaps sulphur; the medieval lists give blackthorn (draigen). ' + B,
    meaning:
      'Morann’s word-ogham is “tressam ruamna”, strongest of red dye, which may mean sulphur or a strong dye; another list gives “saigid nél”, the seeking of clouds, like smoke rising. Blackthorn, the lists’ tree, has long thorns and sloes that are only fit to eat after the frost, and in folklore it is a tree of hard winters and of strife. Readers take Straif as hardship, forces you can’t control, and the resolve to face them.',
    correspondences:
      'Fourth letter of Aicme Muine. Letter Z (st). Tree: blackthorn in the medieval lists.',
    practice:
      'In a reading, Straif says what can’t be changed must be faced. Blackthorn is used for protection and for binding, and the traditional shillelagh is cut from it. Many use it cautiously, as a tree of difficult magic. The sloes, picked after the first frost, are a reminder that some sweetness only comes after hardship.',
    question: 'What can’t be changed, and how will you meet it?',
  },
  Ruis: {
    words: ['endings', 'transition', 'renewal'],
    stave:
      'Five strokes slanting across the stem line, the last of the third aicme. Its sound is r. The name may mean redness; the medieval lists give elder (trom). ' + B,
    meaning:
      'The word-oghams are all reddening. Morann calls it “tindi ruccae”, the most intense of blushes; another list “bruth fergae”, the glow of anger. Elder, the lists’ tree, grows back from any cutting and is surrounded by folklore in Ireland and Britain: a tree not to be burned or cut without asking. Readers take Ruis as an ending that makes room, transition and renewal; it closes the consonants of the row, and the vowels follow.',
    correspondences:
      'Fifth letter of Aicme Muine. Letter R. Tree: elder in the medieval lists; the name may mean red.',
    practice:
      'In a reading, Ruis says let it close; something will grow back. Elder flowers and berries are used in healing, and in folk custom you ask the elder’s leave before cutting. It suits rites of ending and of release: write what is ending on a leaf and leave it under the elder, or drink elderflower cordial to welcome what grows back.',
    question: 'What is ready to end, so that something can grow back?',
  },
  Ailm: {
    words: ['perspective', 'clarity', 'healing'],
    stave:
      'One short notch or stroke across the stem line, the first of the vowels. Its sound is a. The name, ailm, is of uncertain meaning; the medieval lists give pine or fir (ochtach), and some take ailm itself to mean pine. ' + B,
    meaning:
      'The word-oghams are about the sound itself, the open “ah”. Morann calls it “ardam íachtadh”, loudest of groanings; another list calls it “tosach frecrai”, the beginning of an answer, and another “tosach garma”, the beginning of a call. Pine stood among the nobles of the wood, prized for its resin. Readers take Ailm as clear sight, the long view, and healing.',
    correspondences:
      'First letter of the fourth aicme, Aicme Ailme (A, O, U, E, I), the vowels. Letter A. Tree: pine or fir in the medieval lists; a noble of the wood.',
    practice:
      'In a reading, Ailm says look at the whole, from higher up. Pine resin and needles are burned to cleanse a space and used in winter rites; a pine cone on the altar is a sign of long life.',
    question: 'What would you see if you stood further back?',
  },
  Onn: {
    words: ['persistence', 'gathering', 'hope'],
    stave:
      'Two notches across the stem line. Its sound is o. The name is uncertain, perhaps “ash tree” or “stone”; the medieval lists give gorse or furze (aitenn). ' + B,
    meaning:
      'The word-oghams are hard to read here; one gives “congnamaid echraide”, helper of horses, perhaps the wheels of a chariot. Gorse, the lists’ plant, is in flower almost all the year, bright on bare hillsides, and there is an old saying that kissing is out of fashion when the gorse is out of bloom. Readers take Onn as steady effort, gathering in, and hope, almost all of it from the gorse rather than the letter.',
    correspondences:
      'Second letter of Aicme Ailme. Letter O. Plant: gorse in the medieval lists.',
    practice:
      'In a reading, Onn says keep at it; it blooms. Gorse is used in fire festivals and for protection, and its coconut-scented flowers in spring cordials. It suits work for hope and stamina. Gorse fires were once lit on hillsides to clear the old growth, and the new shoots fed the animals; endings and beginnings again.',
    question: 'What keeps flowering in you, even in a hard season?',
  },
  Úr: {
    words: ['grounding', 'healing', 'home'],
    stave:
      'Three notches across the stem line. Its sound is u. The name, úr, means earth, clay or soil; the medieval lists give heather (fráech). ' + B,
    meaning:
      'The word-oghams speak of earth and of death. Morann calls it “úaraib adbaib”, in cold dwellings; another list “sílad cland”, the propagation of plants; and another “forbbaid ambí”, the shroud of a lifeless one. So Úr is the soil that holds seed and grave alike. Heather, the lists’ plant, gave bedding, thatch and brooms, and white heather is still given for luck. Readers take Úr as grounding, healing and the warmth of home.',
    correspondences:
      'Third letter of Aicme Ailme. Letter U. Plant: heather in the medieval lists; the name means earth.',
    practice:
      'In a reading, Úr says come down to earth, and rest. Heather is used for luck and for cleansing, and soil from home is carried in charms by people far from it. It suits grounding work and grave-tending. Walk barefoot, plant something, or hold a handful of soil while you breathe; the oldest healing is often the simplest.',
    question: 'Where is the ground that holds you?',
  },
  Eadhadh: {
    words: ['courage', 'endurance', 'resilience'],
    stave:
      'Four notches across the stem line. Its sound is e. The name, edad, has no known meaning; the medieval lists give aspen (crithach), with some doubt. ' + B,
    meaning:
      'The word-oghams are spare: Morann calls it “érgnaid fid”, distinguished wood, and another list “bráthair bethi”, brother of birch, which fits aspen, a pale-barked tree that often grows with birch. Aspen leaves tremble in the faintest wind on their flat stalks. Readers today take Eadhadh as fear felt and overcome, and endurance. Its meaning is almost entirely modern, built on the tree, so hold it lightly.',
    correspondences:
      'Fourth letter of Aicme Ailme. Letter E. Tree: aspen in the medieval lists, with doubt.',
    practice:
      'In a reading, Eadhadh says be brave anyway. Fear is not a sign you are on the wrong path; often it is a sign the path matters. Aspen is used in charms for courage and for speaking well, and its quivering leaves for listening to the wind. Some sit under an aspen and let the sound of its leaves carry their worries off.',
    question: 'What would you do if you let yourself be afraid and went on?',
  },
  Iodhadh: {
    words: ['ancestors', 'eternity', 'rebirth'],
    stave:
      'Five notches across the stem line, the last of the twenty. Its sound is i. The name, idad, has no certain meaning, but the medieval lists give yew (ibar or eó), and that is widely accepted. ' + B,
    meaning:
      'Morann calls it “sinem fedaib”, the oldest of trees, and another list “caínem sen”, the fairest of the ancients. Yew lives for many centuries and stands in old churchyards, and was a noble of the wood. In the story Tochmarc Étaíne, the druid Dalán cuts four rods of yew and writes ogham on them to find where Étaín has been taken: one of the very few old tales of ogham used for divination. Readers take Iodhadh as death and rebirth, and the presence of the ancestors.',
    correspondences:
      'Fifth letter of Aicme Ailme, and the last of the twenty feda. Letter I. Tree: yew, a noble of the wood.',
    practice:
      'In a reading, Iodhadh says remember those who came before. Yew is used in ancestor work and at Samhain; but every part of it except the red flesh of the berry is poisonous, so work with it with care and keep it from children and animals.',
    question: 'Who came before you, and what do you carry of theirs?',
  },
};
