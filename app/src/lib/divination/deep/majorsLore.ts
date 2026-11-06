// More on each Major Arcana card for its Grimoire page: where the picture
// came from (the Rider–Waite–Smith deck, drawn by Pamela Colman Smith to
// A. E. Waite's direction and published by William Rider & Son in December
// 1909, and the Italian and French cards before it), how the Tarot de
// Marseille and the Sola Busca show the same trump, and what to do with the
// card. Sources: Waite's Pictorial Key (1910); the surviving 15th-century
// Italian hand-painted cards (the Visconti–Sforza and others); the Marseille
// pattern as printed by Jean Noblet (c. 1650), Jean Dodal (c. 1701) and
// Nicolas Conver (1760); the Sola Busca, engraved in north-east Italy about
// 1491 (Pinacoteca di Brera, Milan). Where scholars disagree or a story is
// a later invention, the text says so. Pure data, merged into MAJORS_DEEP
// by tarotDeep.ts.

export type MajorLore = {
  /** Where the picture comes from, and what Waite and Smith changed. */
  history: string;
  /** How the Tarot de Marseille and the Sola Busca show this trump. */
  decks: string;
  /** What to do with the card, upright and reversed. */
  advice: string;
};

export const MAJORS_LORE: Record<string, MajorLore> = {
  '00-the-fool': {
    history:
      'The earliest Fools, on Milanese cards of the mid-1400s, are ragged madmen with feathers in their hair, the village simpleton who wandered between towns. He had no number because he was not a trump at all in the old game: he was the Excuse, a card you could play to avoid following suit. Waite and Smith turned the beggar into a young traveller at a cliff’s edge, and the occultists of the 1800s gave him the number nought and set him at the head of the sequence. The sunny innocence most readers now feel in the card is largely their invention.',
    decks:
      'In the Marseille he is Le Mat, unnumbered, a vagabond in a jester’s cap with a bundle on a stick, while a dog or cat tugs at his breeches and exposes him; he walks on regardless. The Sola Busca’s Mato is a bagpiper in rags with a crow on his shoulder, playing as he goes, closer to the old wandering fool than to Waite’s seeker.',
    advice:
      'Upright: begin before you feel ready, and pack only what you can carry. Reversed: look down once before the step, and check that the dog is barking at a real edge.',
  },
  '01-the-magician': {
    history:
      'He began as a street conjuror with cups and balls, the Bagatto of the Italian game: a trickster at a trestle table, taking coins from a crowd. In the 1800s Éliphas Lévi read him as the adept, and the Golden Dawn gave him Mercury and the four elemental tools. Smith drew that reading: the cup, sword, wand and pentacle of the four suits lie on his table, the figure-of-eight floats over his head, and his raised hand draws power down. The conjuror’s sleight of hand survives only in the reversed meaning.',
    decks:
      'The Marseille Bateleur is still the showman, in a broad hat at a three-legged table scattered with dice, cups, coins and a knife, a wand held up between his fingers. The Sola Busca’s Panfilio is a young soldier seen from behind, striding off with his shield: a beginner setting out to make a name, not a magus.',
    advice:
      'Upright: choose the one aim and gather every tool you have toward it this week. Reversed: stop performing competence and do the actual work, and check the claims of anyone dazzling you.',
  },
  '02-the-high-priestess': {
    history:
      'The Italian and French cards show a woman in a papal tiara, the Popess. Some see the legend of Pope Joan; Gertrude Moakley proposed in 1966 that the Visconti card honours Sister Manfreda, a relative of the Visconti elected pope by a small heretical sect, and that remains a theory, not a fact. Court de Gébelin’s claim in 1781 that the tarot came from Egypt (it does not) helped turn her into Isis. Waite renamed her the High Priestess, and Smith seated her between the black and white pillars of Solomon’s temple, Boaz and Jachin, with a scroll marked TORA and a crescent moon at her feet.',
    decks:
      'The Marseille Papesse sits with an open book in her lap, wearing the triple crown, a veil hanging behind her: learning and the Church’s authority, not moonlit mystery. The Sola Busca’s Postumio is a soldier before a skull-topped pillar, and keeps none of her imagery; any link is through secrecy and the past, and is modern.',
    advice:
      'Upright: say less than you know for a while and listen for what isn’t said. Reversed: if you keep ignoring a hunch, write it down and test it against facts.',
  },
  '03-the-empress': {
    history:
      'The Renaissance Empress is a crowned ruler holding a shield with the imperial eagle, a figure of worldly sovereignty paired with the Emperor. The Golden Dawn gave her Venus, and Smith moved her out of the throne room into a cornfield: she reclines on cushions in a meadow, a heart-shaped shield marked with the sign of Venus at her side, wheat ripening before her and a stream falling through trees behind. Abundance and the body’s pleasures came into the card with that change.',
    decks:
      'The Marseille Impératrice sits frontally, holding a sceptre and an eagle shield, a ruler rather than a mother of fields; French readers took her as wise rule, intelligence and a powerful woman. The Sola Busca’s Lenpio is a soldier clutching his brow with a basin of blood at his feet, a picture far from fertility, and the modern reading built on it is of strain and endurance.',
    advice:
      'Upright: feed something, whether a garden, a project, or your own body, and let it grow at its own pace. Reversed: notice where care has become smothering, or where you are giving with nothing coming back.',
  },
  '04-the-emperor': {
    history:
      'The emperor on the old cards is the Holy Roman Emperor, crowned, with an eagle shield, often shown in profile with legs crossed in a posture of judicial authority. The Golden Dawn tied him to Aries, and Smith put rams’ heads on his stone throne and set him before bare red mountains, in armour under his robes. He became structure, fatherhood and the rule of law, with a hint of rigidity in all that stone.',
    decks:
      'The Marseille Empereur sits in profile on a low seat, one leg crossed over the other, a sceptre in his hand and his eagle shield propped at his feet: authority at ease. The Sola Busca’s Mario, Gaius Marius the Roman general, strides past a broken tree with shield and banner, which makes this trump about military will and ambition.',
    advice:
      'Upright: put a structure under the thing you care about, with a schedule, a budget and a rule you keep. Reversed: ask whether your rules still serve anyone, including you, or have become a wall.',
  },
  '05-the-hierophant': {
    history:
      'This is the Pope on the Italian and French cards, blessing two tonsured clergy kneeling before him. Waite, a Christian mystic who disliked anything that looked like Catholic propaganda in an occult deck, renamed him the Hierophant after the chief priest of the Eleusinian Mysteries. Smith kept the papal look: the triple crown, the crossed keys at his feet, two pillars and two acolytes. The card came to mean tradition and teaching, wherever they are found.',
    decks:
      'The Marseille Pape is plainly the Pope, enthroned with a triple cross, two smaller figures before him; old French readers read it as counsel, religious matters and convention. The Sola Busca’s Catulo, probably the Roman statesman Catulus, holds a surveyor’s staff and standard, measuring out the ground, a picture of order laid down by law rather than by priesthood.',
    advice:
      'Upright: find a teacher or a tradition that has kept knowledge for a long time, and learn its basics properly. Reversed: if a rule or institution asks you to betray your conscience, step back and decide for yourself.',
  },
  '06-the-lovers': {
    history:
      'In the Italian and French cards this is The Lover, singular: a young man between two women, one often older, while Cupid takes aim from above. It was a picture of choice and of love’s arrow. Waite turned it into Adam and Eve in the garden, naked, under the archangel Raphael, with the Tree of Life behind the man and the Tree of Knowledge, serpent wound round it, behind the woman. The choice became a moral and spiritual one, and the card became a card of union.',
    decks:
      'The Marseille Amoureux keeps the three figures and Cupid, and French readers read it as a choice, a test or a crossroads in love as much as romance itself. The Sola Busca’s Sesto is a young man in pale armour with a lit torch, an image of desire and its dangers that modern readers take as passion that needs a conscience.',
    advice:
      'Upright: make the choice your values would make, and say yes to it wholly. Reversed: look at where you are torn between two loyalties, and stop pretending you can keep both.',
  },
  '07-the-chariot': {
    history:
      'Early Italian chariots carry a crowned woman, sometimes a figure of Fame or a Triumph from a Renaissance procession; the whole series of trumps may come from such parades, as in Petrarch’s poem the Triumphs. The Marseille charioteer is a young prince behind two horses. Éliphas Lévi swapped the horses for two sphinxes, one black and one white, and Smith followed him: an armoured figure under a starry canopy, with no reins at all, steering by will.',
    decks:
      'In the Marseille Chariot two horses pull in different directions while the prince stands calm in his square car; old readers saw victory, travel and triumph. The Sola Busca’s Deo Tauro sits in a fantastic chariot curling into a fish-tail, halberd in hand, a stranger and more theatrical triumph whose identity scholars still argue over.',
    advice:
      'Upright: hold two opposing pulls in one direction with discipline and steer. Reversed: if you are being dragged, stop, regain the reins, and choose a road before you drive on.',
  },
  '08-strength': {
    history:
      'Fortitude, one of the four cardinal virtues, appears on early cards either as Hercules clubbing the Nemean lion or as a woman gently holding a lion’s jaws or breaking a column. In the Marseille order she is number XI. The Golden Dawn moved her to VIII, swapping places with Justice so the astrological order (Leo before Libra) would run true, and Waite followed. Smith gave her a crown of flowers and the figure-of-eight over her head, closing the lion’s mouth with her hands. Strength became calm, not force.',
    decks:
      'The Marseille Force is number XI, a woman in a wide hat calmly opening or closing a lion’s mouth. The Sola Busca’s Nerone, the emperor Nero, holds a baby upside down over a fire: brutality rather than fortitude, and the modern reading built on it is a warning against power turned cruel.',
    advice:
      'Upright: meet the wild thing, whether temper, fear or appetite, with steady gentleness, not a fight. Reversed: where you have been forcing or crushing yourself, try patience; where you have been giving way to an impulse, hold steady.',
  },
  '09-the-hermit': {
    history:
      'The earliest Hermits hold an hourglass, not a lantern: they were Old Man Time, and the card was called Il Gobbo, the Hunchback, or Il Tempo. Somewhere in the passage to the French cards the hourglass became a lamp. Smith set him alone on an icy peak, robed in grey, holding a lantern with a six-pointed star inside, looking down at those climbing after him. Time became wisdom, and the old man became a guide.',
    decks:
      'The Marseille Hermite walks with a staff and a half-shaded lantern, the light held close; readers take him as prudence, age and careful search. The Sola Busca’s Falco is an old king kneeling, his helmet cast down, looking to the sky, a picture of humility and turning inward that fits the old meaning surprisingly well.',
    advice:
      'Upright: take time alone, even an hour, with no input, and listen to what rises. Reversed: if you have withdrawn for too long, take one step back towards people.',
  },
  '10-wheel-of-fortune': {
    history:
      'The medieval Wheel of Fortune turns with four figures on it, often labelled regnabo, regno, regnavi, sum sine regno: I shall reign, I reign, I have reigned, I am without a kingdom. The Italian cards kept it. Lévi added an Egyptian dress, and Smith drew a wheel inscribed TARO and the Hebrew letters of the divine name, a sphinx on top, a jackal-headed Anubis rising and a serpent descending, with the four winged creatures of the Evangelists reading in the corners. A moral warning about pride became a picture of cycles and fate.',
    decks:
      'The Marseille Roue de Fortune shows strange animal-like figures, half human, climbing and falling on a crank-handled wheel, with a crowned creature on top. The Sola Busca’s Venturio, his name close to ventura, fortune, walks with a staff while a small winged thing lies at his feet, a quieter image of chance met on the road.',
    advice:
      'Upright: use the rising turn while it lasts and put something by for the descent. Reversed: notice the loop you keep coming round, and change one habit within it.',
  },
  '11-justice': {
    history:
      'Justice is one of the cardinal virtues, and her picture, a woman with a sword and scales, was old and familiar long before cards. In the Italian order she sits at VIII in many decks; Waite moved her to XI to make room for Strength. Smith seated her between two pillars before a purple veil, sword upright, scales level, one foot peeping from under her robe. She is not blindfolded; she sees.',
    decks:
      'The Marseille Justice is number VIII, crowned and seated, sword and scales in hand, a sober figure of law and balance. The Sola Busca’s Tulio, likely Tullus or Tullius from Roman history, raises a flaming torch and looks to the sky, and the modern reading built on it is judgement lit from above rather than by courts.',
    advice:
      'Upright: put your case in writing and act on the facts, not on your feelings about them. Reversed: own any part you had in the trouble, and get proper advice for any part you didn’t.',
  },
  '12-the-hanged-man': {
    history:
      'In fifteenth-century Italy a traitor or debtor was sometimes shown painted upside down, hung by one foot, on the walls of public buildings: the pittura infamante, a shaming picture. The card’s early name was Il Traditore, the Traitor. Later readers saw sacrifice and initiation in it instead. Smith hung him from a living T-shaped tree, his legs crossed, his hands behind his back and a halo round his head, his face perfectly calm.',
    decks:
      'The Marseille Pendu hangs between two trees whose branches have been lopped, coins sometimes spilling from his pockets in older versions; French readers saw trial, sacrifice and a test. The Sola Busca’s Carbone, probably the Roman consul Carbo, is an old man walking by night with an oil lamp under a crescent moon, which modern readers take as patience and a lonely watch.',
    advice:
      'Upright: stop pushing for a while and look at the matter from another side. Reversed: set a date to come down off the tree, because waiting has become a way of avoiding.',
  },
  '13-death': {
    history:
      'A skeleton with a scythe, the Grim Reaper of the late medieval danse macabre, was there on the earliest cards. In the French deck the card had no name at all, only its number. Smith armoured the skeleton and set him on a white horse with a black banner bearing a white rose; a king lies fallen, a bishop pleads, a maiden turns away and a child looks up unafraid, while a sun rises between two towers behind. Waite read it as transformation, and almost no tarot reader since takes it literally.',
    decks:
      'The Marseille XIII is unnamed: a skeleton mows a black field where crowned heads, hands and feet lie scattered among new shoots, a harvest of the old and the coming of the new. The Sola Busca’s Catone, Cato, is a young soldier reading a scroll while his spear pins a fallen head, a picture of the end of one rule and the reading of the next law.',
    advice:
      'Upright: end the finished thing properly, with a farewell, a clear-out or a rite, and make room. Reversed: let go of what you are propping up out of fear; it will go anyway.',
  },
  '14-temperance': {
    history:
      'Temperance, another cardinal virtue, was shown in the Middle Ages as a woman pouring water into wine: in ancient and medieval custom wine was diluted, and the virtue was in the mixing. The cards kept the image. Smith gave her angel’s wings and a triangle within a square on her breast, one foot on land and one in a pool, irises flowering beside her and a path running up to a crown of light between the mountains.',
    decks:
      'The Marseille Tempérance is winged and pours liquid from one jug into another, the flow drawn at an impossible slant; old readers took it as moderation, economy and health. The Sola Busca’s Bocho, Bocchus of Mauretania from Sallust, kneels gasping behind his shield, a figure caught between sides, and the modern reading built on it is the cost of compromise.',
    advice:
      'Upright: find the middle measure and keep to it long enough to work. Reversed: notice the excess you are running on, and halve it before you add anything new.',
  },
  '15-the-devil': {
    history:
      'Few early Italian Devils survive, and it may be that the card was often destroyed or left out. The French cards show a horned, bat-winged devil standing on a pedestal with two small horned figures roped to it. Smith based her Devil on Lévi’s drawing of Baphomet (1856): goat-horned, with an inverted pentagram on his brow and a torch held downwards, and below him a naked man and woman, chained, now with small horns and tails, a dark echo of the Lovers.',
    decks:
      'The Marseille Diable is a strange double-sexed figure with antlers and wings, holding a torch, while two little imps are tethered to its pedestal; old readers saw violence, passion and the bonds of the senses. The Sola Busca’s Metelo, Metellus, sits gesturing toward a column crowned with flame, an image modern readers take as ambition and pride.',
    advice:
      'Upright: name what has a hold on you, and loosen one link in the chain this week, with help if needed. Reversed: keep going; tell someone you trust so the freedom has a witness.',
  },
  '16-the-tower': {
    history:
      'Early Italian names include the Arrow, the Fire and the House of the Devil; in the French deck it is La Maison Dieu, the House of God, perhaps from the Hôtel-Dieu, a hospital, or from Babel. The French picture shows a tower whose crown is struck off by a plume of flame while two figures fall and coloured drops rain down. Smith kept it, with lightning, a crown flung off, two people falling headlong and twenty-two flames like the Hebrew letter Yod in the air.',
    decks:
      'The Marseille Maison Dieu shows the crenellated top lifted off the tower by a feathered flame, with figures tumbling and balls falling; French readers read it as sudden loss, but also as a house opened by heaven. The Sola Busca places Nenbroto, Nimrod of the Tower of Babel, at XX, where Judgement goes elsewhere; its XVI, Olivo, shows a young king pointing at a dark-rayed sun.',
    advice:
      'Upright: secure what truly matters and let the false structure fall. Reversed: fix the cracks you have been ignoring while they are still small.',
  },
  '17-the-star': {
    history:
      'Early Italian Stars sometimes show an astronomer or a woman holding up a star; the French cards settled on the nude woman kneeling at a pool, pouring from two jugs under eight great stars, a bird in a tree behind her. Smith followed the French picture closely, with one great eight-pointed star and seven smaller ones, one jug pouring into the pool and one onto the land in five streams, and an ibis, Thoth’s bird, in the tree.',
    decks:
      'The Marseille Étoile is almost the same picture, and French readers read it as hope, gifts and good prospects. The Sola Busca’s Ipeo is an old bat-winged figure in a pointed cap lifting his hands to a small winged head on a staff; nobody knows quite who he is, and its modern reading leans to guidance from uncanny quarters.',
    advice:
      'Upright: look up, name a hope, and feed it a little each day. Reversed: rest without guilt, and let the light come back before you ask it to do anything.',
  },
  '18-the-moon': {
    history:
      'The Italian Moon sometimes shows astronomers measuring the sky, or a woman holding a crescent. The French cards brought in the scene most people now know: a moon dropping dew, two dogs howling between two towers, and a crayfish crawling out of a pool. Smith made one of the dogs a wolf, the tame and the wild together, and drew a path winding from the water between the towers into far hills.',
    decks:
      'The Marseille Lune keeps the dogs, the towers and the crayfish; French readers read it as illusion, hidden enemies and travel by water. The Sola Busca’s Lentulo, a white-bearded old man at a stone altar before a burning flame, his helmet set down, is a scene of night vigil rather than the moon’s confusion.',
    advice:
      'Upright: wait for daylight before big decisions, and test what frightens you against facts. Reversed: write down what has become clear and act on that alone.',
  },
  '19-the-sun': {
    history:
      'Some early Suns show a single child carrying a sun’s face, or a woman at a spinning wheel. The French cards show two children, perhaps twins, before a low wall under a great sun dropping coloured tears. Smith put one naked child on a white horse, carrying a red banner, sunflowers over the wall behind, and the twins disappeared from the image most people know.',
    decks:
      'The Marseille Soleil keeps the two children holding each other under the sun; French readers saw happiness, friendship and a good marriage. The Sola Busca’s Sabino, a crowned king in armour with a great shell-shaped basin, shows nothing sun-like; the Brera catalogue suggests a contemporary, and the reading built on it is modern.',
    advice:
      'Upright: enjoy what is going well, out loud and in company. Reversed: get into daylight, keep a short list of what is going right, and give the good time to arrive.',
  },
  '20-judgement': {
    history:
      'The Last Judgement of Christian art: an angel blows a trumpet and the dead rise from their graves. Italian cards called it L’Angelo, the Angel. Smith drew Gabriel with a trumpet flying a banner with a red cross, and below grey figures rising from coffins that float on water, arms raised, a mountain range behind. Waite read it as resurrection and the call to a higher life, and it is rarely read as punishment.',
    decks:
      'The Marseille Jugement is close to Smith’s, an angel above a man, a woman and a figure rising from a tomb, and French readers saw a change of position, news, a legal judgement or a revival. The Sola Busca puts Nenbroto, Nimrod, at XX: a young man struck by fire from heaven while his column breaks, the Tower’s scene in all but name.',
    advice:
      'Upright: answer the call you have been hearing, and make one public step towards it. Reversed: lift the verdict you keep passing on yourself; the past is not a sentence.',
  },
  '21-the-world': {
    history:
      'Early Italian Worlds often show a globe held up by putti, with a city or landscape inside it, or a figure standing on the globe. The French card has a dancing figure in an oval wreath, with the four living creatures of Ezekiel and Revelation in the corners: the angel, the eagle, the lion and the ox, the symbols of the four Evangelists. Smith kept that, wrapping the dancer in a violet sash and putting a wand in each hand. Many readers think the dancer androgynous; Waite says little about it.',
    decks:
      'The Marseille Monde is the same dancer in a wreath held by the four creatures, and old readers read success, travel and a wide world opening. The Sola Busca’s Nabuchodenasor, Nebuchadnezzar from the Book of Daniel, sits sunk in straw with his crown cast down beneath the starry globe: the great king humbled, the world turning without him.',
    advice:
      'Upright: finish properly, celebrate it, then name the next journey. Reversed: close the last loose ends before you call it done.',
  },
};
