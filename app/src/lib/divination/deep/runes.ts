// The Grimoire's longer pages on the twenty-four runes of the Elder Futhark
// and the modern blank rune. The rune poems are quoted briefly and put into
// plain English after Bruce Dickins's translations (1915, public domain).
// Most divinatory meanings, and nearly all reversed or "merkstave" readings,
// are modern; each page says so where it matters. Keyed by the names in
// staves.ts. Pure data.

import type { StaveDeep } from './types.ts';

// Said on every rune that can lie reversed.
const MODERN = 'Reading runes reversed is modern practice, from the 1980s on; there is no evidence the old rune-masters did it.';

export const RUNES_DEEP: Record<string, StaveDeep> = {
  Fehu: {
    words: ['wealth', 'abundance', 'sharing'],
    stave:
      'An upright stave with two short branches rising up and to the right, like a beast’s horns or a young plant. Its sound is f. The old Germanic name, *fehu, is reconstructed from the later rune names; it means cattle, and through cattle, wealth that moves. The English word fee comes from the same root.',
    meaning:
      'All three rune poems speak of it, and they pull two ways. The Old English poem begins “Feoh byþ frofur fira gehwylcum”, wealth is a comfort to everyone, but every man must share it freely if he wants honour before the Lord. The Norwegian poem says “Fé vældr frænda róge”, wealth causes strife among kin, and the Icelandic agrees: fé is the discord of kinsmen, the fire of the sea and the serpent’s path. So Fehu is wealth as blessing and as burden: it must move, be shared, and not be hoarded.',
    reversed:
      'Read reversed, it is usually loss, money troubles, greed, or wealth that has become a source of quarrels. ' + MODERN,
    correspondences:
      'The first rune of the first aett, often called Freyr’s aett after the Vanir god of plenty (the aettir’s names are later tradition). Position 1 of 24. In the Younger Futhark it kept its name, fé.',
    practice:
      'Drawn in a reading, Fehu speaks of money, earnings and resources, and of how you use them. People carve it on purses, candles and money charms, often in bindrunes with Jera (harvest) or Gebo (gift) so that wealth comes in and goes out generously. The old poems would say: keep it moving.',
    question: 'What do you have that is meant to be shared?',
  },
  Uruz: {
    words: ['strength', 'vitality', 'endurance'],
    stave:
      'A shape like an upturned U, with the left leg longer than the right. Its sound is u. The reconstructed name, *ūruz, means the aurochs, the great wild ox of Europe, now extinct. In Norse the rune’s name, úr, came to mean drizzle or slag instead.',
    meaning:
      'The Old English poem gives the wild beast: “Ur byþ anmod ond oferhyrned”, the aurochs is fierce and has great horns, a savage beast that fights with them, a mighty stalker of the moors. The Norwegian poem says “Úr er af illu jarne”, dross comes from bad iron, and the Icelandic calls úr the weeping of the clouds and the ruin of the hay harvest. Modern readers follow the Old English: raw strength, health, endurance and will that hasn’t been tamed.',
    reversed:
      'Reversed, it is read as weakness, illness, strength misused, or a chance missed for lack of energy. ' + MODERN,
    correspondences:
      'The second rune of Freyr’s aett. Position 2 of 24. In the Younger Futhark, úr also stood for o and w sounds.',
    practice:
      'In a reading, Uruz points to the body and its vigour: health, stamina, courage to take something on. It is used in healing charms and bindrunes for strength and recovery, sometimes with Sowilo (the sun) for vitality.',
    question: 'Where could you use your raw strength, and where does it need guiding?',
  },
  Thurisaz: {
    words: ['thorn', 'defence', 'threshold'],
    stave:
      'An upright stave with a triangle, like a thorn, sticking out from its middle on the right. Its sound is th, as in thin; the letter þ (thorn) still used in Icelandic comes from it. The reconstructed name, *þurisaz, means a giant, one of the þursar; the Old English poem renamed it ðorn, thorn.',
    meaning:
      'The Old English poem says “Ðorn byþ ðearle scearp”, the thorn is very sharp, painful for any warrior to grasp, and cruel to anyone who lies among them. The Norwegian poem says the giant causes anguish to women and misfortune makes few men cheerful; the Icelandic calls þurs the torment of women and the dweller in the cliffs. It is a rune of danger and hostile force. Modern readers often add Thor’s hammer, the force that defends against giants, so it reads as both threat and protection.',
    reversed:
      'Reversed, it can mean danger ignored, defencelessness, or spite. ' + MODERN,
    correspondences:
      'The third rune of Freyr’s aett. Position 3 of 24. In the Younger Futhark it kept the name þurs.',
    practice:
      'In a reading, Thurisaz is a gate with thorns: pause before you go through. It is carved for protection and warding, on doors and boundaries. Old charms did use it to cause harm (one line in the Eddic poem Skírnismál threatens to carve þurs), so many practitioners use it with care.',
    question: 'What thorn in your path is actually protecting you?',
  },
  Ansuz: {
    words: ['word', 'wisdom', 'message'],
    stave:
      'An upright stave with two branches sloping down to the right, like a banner. Its sound is a. The reconstructed name, *ansuz, means one of the Æsir, a god; Odin above all.',
    meaning:
      'The Old English poem plays on the word os, which also meant mouth in Latin: “Os byþ ordfruma ælcre spræce”, the mouth is the source of all speech, a pillar of wisdom and comfort to the wise. The Icelandic poem keeps the god: óss is the aged Gautr, prince of Asgard and lord of Valhalla. The Norwegian poem, by a sound-shift, makes it óss, an estuary, the way of most journeys. Readers today take it as the rune of Odin: speech, poetry, counsel, inspiration and signs.',
    reversed:
      'Reversed, it is read as miscommunication, bad advice, manipulation by words, or a message missed. ' + MODERN,
    correspondences:
      'The fourth rune of Freyr’s aett. Position 4 of 24. In the Younger Futhark it is óss, often shaped ᚬ.',
    practice:
      'In a reading, Ansuz asks you to listen: a message, a teacher, the right word at the right time. It is used in charms for eloquence, study and divination itself, and as an invocation of Odin, who in the Hávamál hangs nine nights on the windy tree to win the runes.',
    question: 'What is being said to you that you haven’t quite heard?',
  },
  Raidho: {
    words: ['journey', 'rhythm', 'order'],
    stave:
      'A shape like a capital R, with a stave, a pointed bowl and a leg. Its sound is r. The reconstructed name, *raidō, means riding, a journey, and perhaps the vehicle itself.',
    meaning:
      'The Old English poem teases: “Rad byþ on recyde rinca gehwylcum sefte”, riding is easy for every warrior indoors, and very hard for the one who sits on a strong horse over the long miles. The Norwegian poem says riding is the worst thing for horses, and Reginn forged the finest sword. The Icelandic calls it the joy of the rider, the speedy journey and the toil of the horse. Readers today take it as travel, progress and right order: the journey well made, at the right pace.',
    reversed:
      'Reversed, it is read as delays, a journey gone wrong, or things out of order. ' + MODERN,
    correspondences:
      'The fifth rune of Freyr’s aett. Position 5 of 24. In the Younger Futhark it is reið.',
    practice:
      'In a reading, Raidho speaks of travel, moves and processes, and of whether you are going at the right speed. It is carved as a travel charm, on luggage or in the car, and in bindrunes for safe journeys, often with Ehwaz (the horse).',
    question: 'Is the pace you are going the one that will get you there?',
  },
  Kenaz: {
    words: ['torch', 'knowledge', 'craft'],
    stave:
      'An angle opening to the right, like a < . Its sound is k. The Elder name is uncertain: it may be *kaunan, an ulcer or sore, as in the Norse poems, or *kenaz, a torch, as in the Old English cen.',
    meaning:
      'The Old English poem gives the torch: “Cen byþ cwicera gehwam cuþ on fyre”, the torch is known to every living being by its flame, bright and shining; it burns where nobles rest within. The Norse poems give the sore: kaun is fatal to children and turns a corpse pale, says the Norwegian; the Icelandic calls it the bane of children and the house of rotting flesh. Modern reading follows the Old English: light, knowledge, insight, the forge-fire of craft and creativity.',
    reversed:
      'Reversed, it is read as confusion, a creative block, or a sickness not yet understood; some use the Norse sore here. ' + MODERN,
    correspondences:
      'The sixth rune of Freyr’s aett. Position 6 of 24. In the Younger Futhark it is kaun, shaped ᚴ.',
    practice:
      'In a reading, Kenaz is a light coming on: understanding, a skill learned, a project lit up. It is used in charms for study, creativity and craft, and at the hearth or forge. Some healers use it with the old sense of the sore, to draw an illness out.',
    question: 'What has just become clear to you, and what will you make of it?',
  },
  Gebo: {
    words: ['gift', 'exchange', 'bond'],
    stave:
      'Two crossing lines, an X. Its sound is g, as in give. The reconstructed name, *gebō, means a gift. Because the shape is the same either way up, it can’t be reversed.',
    meaning:
      'Only the Old English poem has it, since the rune was dropped from the Younger Futhark: “Gyfu gumena byþ gleng and herenys”, generosity brings credit and honour to men, a support and dignity; and to the outcast with nothing else, help and sustenance. In the old Germanic world a gift bound giver and receiver: the Hávamál says a gift always looks for a gift in return. Modern readers take it as generosity, exchange, partnership and agreements honoured on both sides.',
    correspondences:
      'The seventh rune of Freyr’s aett. Position 7 of 24. Not in the Younger Futhark.',
    practice:
      'In a reading, Gebo asks about balance in giving: what you give, what you receive, and whether it is fair. It is a common part of bindrunes, since its X joins easily with other staves, and is carved on gifts, love tokens and agreements. Some readers read it as merkstave in a dark position, but there is no upside-down form.',
    question: 'What have you been given, and what would be a fitting gift in return?',
  },
  Wunjo: {
    words: ['joy', 'fellowship', 'harmony'],
    stave:
      'A stave with a small pointed flag at the top right, like a pennant or a P. Its sound is w. The reconstructed name, *wunjō, means joy. The Old English letter wynn, used in early English writing for w, comes from it.',
    meaning:
      'Only the Old English poem has it: “Wenne bruceþ ðe can weana lyt”, joy is had by the one who knows little of woe, sorrow or care, and has for himself prosperity and bliss and a good enough dwelling. That is a modest, domestic joy: enough, among your own. Modern readers take it as happiness, belonging, fellowship and work going well.',
    reversed:
      'Reversed, it is read as sorrow, alienation, or joy that depends on others. ' + MODERN,
    correspondences:
      'The eighth and last rune of Freyr’s aett. Position 8 of 24. Not in the Younger Futhark.',
    practice:
      'In a reading, Wunjo says things are good, or can be: let yourself have them. It is carved for harmony at home and among friends, and in bindrunes for a happy household, sometimes with Othala (home) or Gebo (gift).',
    question: 'What does “a good enough dwelling” look like for you?',
  },
  Hagalaz: {
    words: ['hail', 'disruption', 'transformation'],
    stave:
      'Two upright staves joined by one slanting crossbar, like an H that has slipped. (In the Younger Futhark it became a star with six points, ᚼ.) Its sound is h. The reconstructed name, *hagalaz, means hail. The same either way up, it can’t be reversed.',
    meaning:
      'All three poems speak of hail. The Old English says “Hægl byþ hwitust corna”, hail is the whitest of grain; it whirls from heaven, is tossed by the wind, and then turns to water. The Norwegian says hail is the coldest of grain, and the Icelandic calls it cold grain, a shower of sleet and the sickness of serpents. Hail comes from outside and can’t be stopped, but it melts into water that feeds the ground. So Hagalaz is disruption beyond your control, and what grows from it afterwards.',
    correspondences:
      'The first rune of the second aett, called Hagal’s aett after it. Position 9 of 24. In the Younger Futhark it kept the name hagall.',
    practice:
      'In a reading, Hagalaz is a storm: take shelter, then use what it leaves. Most practitioners don’t carve it lightly in charms, since it brings upheaval; some use it to break a stuck situation open, or for protection against storms. Some read it as merkstave in a dark position, though its shape doesn’t change.',
    question: 'When the hail has melted, what will it have watered?',
  },
  Nauthiz: {
    words: ['need', 'constraint', 'resilience'],
    stave:
      'An upright stave crossed by a short slanting stroke. Its sound is n. The reconstructed name, *naudiz, means need, necessity or distress. Its shape looks the same either way up.',
    meaning:
      'The Old English poem: “Nyd byþ nearu on breostan”, need is tight on the chest, yet it often becomes help and salvation to the children of men, if they heed it in time. The Norwegian: constraint leaves little choice; a naked man is chilled by the frost. The Icelandic: the grief of the bondmaid, a hard condition and toilsome work. Need hurts, and teaches. Modern readers add the need-fire, kindled by friction when all other fires were out.',
    correspondences:
      'The second rune of Hagal’s aett. Position 10 of 24. In the Younger Futhark it is nauðr.',
    practice:
      'In a reading, Nauthiz asks what you truly need, as against what you want, and how to work within a limit. The Eddic poem Sigrdrífumál tells you to mark it on your fingernail to guard against a poisoned drink. It is used in charms for endurance and for getting through hardship, and in need-fire rites, where a new fire is kindled by friction for the household or the community. Some read it as merkstave in a dark position.',
    question: 'What does this hardship show you that you really need?',
  },
  Isa: {
    words: ['stillness', 'pause', 'clarity'],
    stave:
      'A single upright line, the simplest rune of all. Its sound is i. The reconstructed name, *īsaz, means ice. It looks the same either way up.',
    meaning:
      'The Old English poem: “Is byþ ofereald, ungemetum slidor”, ice is very cold and very slippery; it glistens clear as glass, like jewels, a floor made by frost, fair to see. The Norwegian: ice we call the broad bridge; the blind must be led. The Icelandic: the bark of rivers, the roof of the wave, and danger to the doomed. Ice is beautiful, still and treacherous, and it makes a bridge where there wasn’t one. Readers take it as a freeze, a pause, things on hold, and clarity in stillness.',
    correspondences:
      'The third rune of Hagal’s aett. Position 11 of 24. In the Younger Futhark it is íss.',
    practice:
      'In a reading, Isa says wait and keep your footing; nothing moves yet. It is used to halt or bind: to stop gossip, freeze a situation, or still the mind in meditation. It often stands as the upright of a bindrune, holding the others together. In winter, it is a good rune to sit with: the stillness of ice is a kind of rest the land takes too. Some read it as merkstave in a dark position.',
    question: 'What would you see if you stopped, and let things be still?',
  },
  Jera: {
    words: ['harvest', 'cycles', 'reward'],
    stave:
      'Two hooks or angles facing each other, one above and one below, as if turning round each other. (In the Younger Futhark it became ᛅ.) Its sound is j, as in year. The reconstructed name, *jēra, means year, and in particular a good year, a harvest.',
    meaning:
      'The Old English poem: “Ger byþ gumena hiht”, the year is a hope to men, when God, holy king of heaven, lets the earth give her bright fruits to rich and poor alike. The Norwegian: plenty is a boon to men; I say that Fróði was generous. The Icelandic: a boon to men, a good summer, and a ripened field. Jera is the turning year that brings in the harvest: reward in due time, not by force.',
    correspondences:
      'The fourth rune of Hagal’s aett. Position 12 of 24, the middle of the row. In the Younger Futhark it is ár, used for a.',
    practice:
      'In a reading, Jera says patience: what you sowed will come in, in its season. It is carved for good harvests, fertility of land and projects, and in money bindrunes with Fehu. It can’t be reversed, though some read it as merkstave in a dark position.',
    question: 'What did you sow that is ripening now?',
  },
  Eihwaz: {
    words: ['yew', 'endurance', 'between worlds'],
    stave:
      'An upright stave with a hook at the top to the right and a hook at the bottom to the left, like a stretched S standing straight. Its sound is uncertain, probably a vowel between e and i. The reconstructed name, *eihwaz or *īwaz, means the yew tree.',
    meaning:
      'Only the Old English poem has it: “Eoh byþ utan unsmeþe treow”, the yew is a tree rough on the outside, hard and fast in the earth, keeper of fire, supported by its roots, a joy upon an estate. Yew lives for many centuries, stays green all winter, and is deadly poison; it made the best bows. Modern readers take it as endurance, steadiness through hardship, and the meeting of death and life. Some link it to Yggdrasil, the world tree, which the Eddas call an ash, though a few scholars argue it was a yew.',
    correspondences:
      'The fifth rune of Hagal’s aett. Position 13 of 24, the centre of the row. Not in the Younger Futhark (whose yr, a yew rune, has a different shape).',
    practice:
      'In a reading, Eihwaz says hold steady; this will last, and you will come through. It is used in protection charms, in ancestor work, and for strength in long trials; it is sometimes carved on yew itself. Its shape looks the same either way up, so it isn’t read reversed.',
    question: 'What in you is evergreen, through every winter?',
  },
  Perthro: {
    words: ['mystery', 'chance', 'fate'],
    stave:
      'An upright stave with two short branches bent towards each other on the right, like a cup lying on its side. Its sound is p, a rare sound in early Germanic. The meaning of its name is unknown: *perþō has been guessed as a lot-cup, a dice-cup, a pear tree, or a game.',
    meaning:
      'Only the Old English poem has it, and the stanza is a puzzle: “Peorð byþ symble plega and hlehter wlancum”, peorð is always play and laughter to the proud, where warriors sit merrily together in the beer-hall. That suggests a game, perhaps of dice or lots. Modern readers take it as chance, fate, mystery, and what is hidden; the cup the lots are shaken in.',
    reversed:
      'Reversed, it is read as secrets kept, bad luck, or a refusal to accept what can’t be known. ' + MODERN,
    correspondences:
      'The sixth rune of Hagal’s aett. Position 14 of 24. Not in the Younger Futhark.',
    practice:
      'In a reading, Perthro says something is still hidden; leave room for it. Many rune-readers keep it as a rune of divination itself, and carve it on their rune bag or casting cloth. It is used in charms for luck and for opening to intuition.',
    question: 'What are you not yet meant to know?',
  },
  Algiz: {
    words: ['protection', 'sanctuary', 'guardian'],
    stave:
      'An upright stave with two branches rising to either side, like a Y with a stalk through it, or a figure lifting its arms. Its sound was a buzzing z that later became r. The name is uncertain: *algiz may mean an elk, or a protection; the Old English poem calls it eolhx, elk-sedge, a sharp marsh grass.',
    meaning:
      'The Old English poem: “Eolhx seccard hæfþ oftust on fenne”, the elk-sedge lives mostly in the fen, grows in the water, and wounds grimly, staining with blood any man who grasps it. That is protection by sharpness: hard to touch. In the Younger Futhark the same shape, turned over, became yr, the yew, so the Norse poems don’t speak of it. Readers today take it as protection, warding and a guardian presence.',
    reversed:
      'Reversed, it is read as vulnerability, a warning, or protection withdrawn. ' + MODERN,
    correspondences:
      'The seventh rune of Hagal’s aett. Position 15 of 24.',
    practice:
      'In a reading, Algiz says you are watched over, and asks you to keep guard over what is yours. It is one of the commonest protection runes, carved over doors, on amulets and in protective bindrunes. Be aware that the Nazis used it as a “life rune”, and some hate groups still do; most heathens today use it in its older sense and say so plainly.',
    question: 'What needs your protection, and what protects you?',
  },
  Sowilo: {
    words: ['sun', 'success', 'wholeness'],
    stave:
      'A lightning-like zigzag of three strokes, ᛊ, sometimes with more bends. Its sound is s. The reconstructed name, *sōwilō, means the sun.',
    meaning:
      'The Old English poem: “Sigel semannum symble biþ on hihte”, the sun is always a hope to seafarers as they cross the fishes’ bath, until the sea-horse brings them to land. The Norwegian: the sun is the light of the world; I bow to the holy judgement. The Icelandic: the shield of the clouds, the shining ray, and the destroyer of ice. Sowilo is guidance, warmth, success and life: the sun that shows sailors the way home.',
    correspondences:
      'The eighth and last rune of Hagal’s aett. Position 16 of 24. In the Younger Futhark it is sól.',
    practice:
      'In a reading, Sowilo says things go well; shine. It is one of the most welcome runes to draw, a sign of clear purpose and good health. It is used in charms for health, victory and confidence, in healing bindrunes with Uruz, and in rites at the solstices. Its shape is the same either way up. Be aware that two Sowilo runes side by side were the badge of the Nazi SS; carve it on its own or in other combinations.',
    question: 'Where do you need to let yourself shine?',
  },
  Tiwaz: {
    words: ['justice', 'courage', 'honour'],
    stave:
      'An upright stave with two short branches sloping down from its top, like an arrow pointing up. Its sound is t. The name is the god Tyr (*Tīwaz), from whom Tuesday is named.',
    meaning:
      'The Old English poem: “Tir biþ tacna sum”, Tir is a guiding sign; it keeps faith well with princes, always on its course through the mists of night, never failing; perhaps a star. The Norwegian: Tyr is the one-handed among the Æsir; often must the smith blow. The Icelandic: the one-handed god, the leavings of the wolf, the ruler of temples. Tyr gave his hand to bind the wolf Fenrir, knowing he would lose it. Tiwaz is justice, courage and keeping your word, whatever it costs.',
    reversed:
      'Reversed, it is read as injustice, cowardice, or a broken oath. ' + MODERN,
    correspondences:
      'The first rune of the third aett, called Tyr’s aett after it. Position 17 of 24. In the Younger Futhark it is Týr.',
    practice:
      'In a reading, Tiwaz asks you to do the honourable thing. It is an old victory rune: the Eddic poem Sigrdrífumál says to carve victory-runes on a sword’s hilt and name Tyr twice. It is used in charms for courage, legal matters and fair outcomes, sometimes stacked as several arrows on one stave.',
    question: 'What is the right thing to do here, even if it costs you?',
  },
  Berkano: {
    words: ['birth', 'growth', 'nurture'],
    stave:
      'A shape like a capital B with pointed bowls. Its sound is b. The reconstructed name, *berkanan, means birch, or a birch twig.',
    meaning:
      'The Old English poem: “Beorc byþ bleda leas”, the birch bears no fruit, yet sends up shoots without seed; its branches are beautiful and its crown high and well adorned, reaching to the sky. (Dickins translated it poplar; most now read birch.) The Norwegian: the birch has the greenest leaves of any shrub; Loki was lucky in his deceit. The Icelandic: a leafy twig, a little tree, a fresh young shrub. Birch is the first tree back after the ice. Readers take it as birth, new growth, motherhood and quiet care.',
    reversed:
      'Reversed, it is read as growth stalled, family trouble, or care withheld. ' + MODERN,
    correspondences:
      'The second rune of Tyr’s aett. Position 18 of 24. In the Younger Futhark it is bjarkan.',
    practice:
      'In a reading, Berkano says something new is growing; tend it gently. It is carved for fertility, childbirth, healing and new beginnings, and used in blessings for babies and new homes, often on birch.',
    question: 'What young thing in your life needs tending?',
  },
  Ehwaz: {
    words: ['partnership', 'trust', 'movement'],
    stave:
      'A shape like a capital M, with the middle meeting low. Its sound is e. The reconstructed name, *ehwaz, means horse; it is related to the Latin equus.',
    meaning:
      'Only the Old English poem has it: “Eh byþ for eorlum æþelinga wyn”, the horse is a joy to princes in the presence of warriors, proud in its hooves when rich men on horseback talk about it, and always a comfort to the restless. Horse and rider are partners. Readers take it as trust, teamwork, loyalty and steady progress with a good companion.',
    reversed:
      'Reversed, it is read as mistrust, a partnership out of step, or restlessness without direction. ' + MODERN,
    correspondences:
      'The third rune of Tyr’s aett. Position 19 of 24. Not in the Younger Futhark.',
    practice:
      'In a reading, Ehwaz asks about your partners, people or animals, and whether you are moving together. It is used for travel with Raidho, and in charms for loyalty and cooperation. Horses held a sacred place in Germanic religion; Odin’s Sleipnir has eight legs, and Freyr’s horses were kept at his temple. The rune can stand for any bond in which two beings learn to trust each other’s pace.',
    question: 'Who do you move well with, and do they know you trust them?',
  },
  Mannaz: {
    words: ['humanity', 'self', 'community'],
    stave:
      'Two upright staves joined by crossing diagonals, like an M with an X in it. Its sound is m. The reconstructed name, *mannaz, means a human being.',
    meaning:
      'The Old English poem: “Man byþ on myrgþe his magan leof”, the joyful man is dear to his kin, yet each must fail the other, since the Lord will commit the poor flesh to the earth. The Norwegian: man is an increase of the dust; great is the claw of the hawk. The Icelandic: the joy of man, an increase of the earth, the adorner of ships. All three remember that we are mortal and need one another. Readers take it as the self, our place among others, and our shared humanity.',
    reversed:
      'Reversed, it is read as isolation, self-deception, or being let down by others. ' + MODERN,
    correspondences:
      'The fourth rune of Tyr’s aett. Position 20 of 24. In the Younger Futhark it is maðr, shaped ᛘ.',
    practice:
      'In a reading, Mannaz asks how you are with yourself and with others. It is used in charms for self-knowledge, for community, and for help from people.',
    question: 'Who are you among your people, and who are you on your own?',
  },
  Laguz: {
    words: ['water', 'flow', 'intuition'],
    stave:
      'An upright stave with one branch sloping down to the right from its top, like a hook or a wave. Its sound is l. The reconstructed name, *laguz, means water, a lake or the sea; some suggest *laukaz, leek, a word found carved on old charms.',
    meaning:
      'The Old English poem: “Lagu byþ leodum langsum geþuht”, the sea seems endless to men if they venture on the rolling ship, and the waves terrify them, and the sea-horse won’t heed its bridle. The Norwegian: a waterfall falls from the mountain; but ornaments are of gold. The Icelandic: the welling stream, the broad geyser, the land of the fish. Water is deep, moving and dangerous. Readers take it as feeling, dreams, intuition and the tides of things.',
    reversed:
      'Reversed, it is read as confusion, fear, being overwhelmed, or ignoring your instincts. ' + MODERN,
    correspondences:
      'The fifth rune of Tyr’s aett. Position 21 of 24. In the Younger Futhark it is lögr.',
    practice:
      'In a reading, Laguz says trust the current, and your gut. It is used in charms for dreams, intuition and safe sea journeys. The word laukaz, leek, appears on several old gold charms (bracteates), so leek, growth and well-being may be part of it too.',
    question: 'What is your instinct telling you, under all the noise?',
  },
  Ingwaz: {
    words: ['seed', 'gestation', 'completion'],
    stave:
      'A small diamond, or a diamond with crossing legs (ᛝ). Its sound is ng, as in sing. The name is the god Ing (*Ingwaz), the Yngvi of the Swedish kings, often identified with Freyr.',
    meaning:
      'Only the Old English poem has it: “Ing wæs ærest mid East-Denum gesewen secgun”, Ing was first seen among the East-Danes, till he went away east over the waves, his wagon following after; so the Heardings named the hero. Ing is a god of the land’s fertility. Readers take the rune as the seed in the ground, gestation, and a stage completed inwardly before something new begins.',
    correspondences:
      'The sixth rune of Tyr’s aett. Position 22 of 24. Not in the Younger Futhark.',
    practice:
      'In a reading, Ingwaz says let it rest and ripen; something is completing. It can mark the end of one cycle and the gathering of strength for the next, like a seed through winter. It is used in fertility charms, for finishing projects, and for storing up energy; in bindrunes it is said to hold and protect the others, since its closed diamond can sit inside other staves. Freyr is honoured with it at harvest and at Yule. It looks the same either way up.',
    question: 'What is growing in you quietly, out of sight?',
  },
  Dagaz: {
    words: ['dawn', 'breakthrough', 'awakening'],
    stave:
      'Two triangles meeting at their points between two upright staves, like an hourglass on its side or a butterfly. Its sound is d. The reconstructed name, *dagaz, means day.',
    meaning:
      'Only the Old English poem has it: “Dæg byþ drihtnes sond, deore mannum”, day is the Lord’s messenger, dear to men, the glorious light of the Creator, a joy and hope to rich and poor, of use to all. Readers take it as daybreak: awakening, clarity, breakthrough and change for the better. It sits beside Othala at the end of the row, so the futhark closes on a day dawning and a home kept.',
    correspondences:
      'The seventh rune of Tyr’s aett. Position 23 of 24 in the usual modern order; some old rows put Othala before it. Not in the Younger Futhark.',
    practice:
      'In a reading, Dagaz says the way through is opening; light is coming. It often turns up after a hard stretch, as the moment when you can see again. It is used in charms for clarity, hope, and turning points, and painted as a protection on windows and doors. Some greet the morning with it, as a small daily rite of waking. It looks the same either way up, so it isn’t read reversed.',
    question: 'What dawn are you on the edge of?',
  },
  Othala: {
    words: ['heritage', 'home', 'inheritance'],
    stave:
      'A diamond standing on two legs, like a house on its stilts or a pair of crossed legs. Its sound is o. The reconstructed name, *ōþala, means inherited land, the ancestral home.',
    meaning:
      'Only the Old English poem has it, as eþel: “Eþel byþ oferleof æghwylcum men”, the homeland is very dear to every man, if he can enjoy there in his house what is right and fitting in lasting prosperity. Readers take it as home, family, inheritance, and what is handed down: gifts and burdens both.',
    reversed:
      'Reversed, it is read as a troubled inheritance, homelessness, or ties to family that bind. ' + MODERN,
    correspondences:
      'The eighth and last rune of Tyr’s aett. Position 24 of 24 in the usual modern order. Not in the Younger Futhark.',
    practice:
      'In a reading, Othala asks what you have inherited and what you will pass on. It is used in house blessings and ancestor work. Be aware that a form of Othala with wings or feet was used by the Nazis and is still a hate symbol; heathen groups have worked to reclaim the plain rune, and make that clear in how they use it.',
    question: 'What will you leave behind for those who come after?',
  },
};

/** The blank rune, a modern addition (1980s); not one of the twenty-four. */
export const BLANK_RUNE_DEEP: StaveDeep = {
  words: ['unknown', 'mystery', 'surrender'],
  stave:
    'A smooth, uncarved stone or tile. It has no shape, no name and no sound. It came into rune sets with Ralph Blum’s The Book of Runes (1982), which called it Wyrd, and many sets sold since include one.',
  meaning:
    'There is no rune poem or old source for it, and there was no blank rune in the old futhark. Blum read it as the unknowable, the hand of fate in matters not yet decided, and that is how most people who use it read it now. Many rune-readers and heathens leave it out, feeling that the runes already include fate in Perthro, and that a stone with nothing on it isn’t a rune. Both choices are fine; know where it comes from.',
  correspondences:
    'None. It belongs to no aett and has no place in the row. The draw lets you leave it in or take it out.',
  practice:
    'In a reading, the blank rune says this isn’t yours to see yet: let the question rest, and come back to it. If it comes up often, you may be asking about something you can’t control. Some people use a blank stone as a focus for meditation on what lies beyond knowing.',
  question: 'Can you let this question rest without an answer for now?',
};
