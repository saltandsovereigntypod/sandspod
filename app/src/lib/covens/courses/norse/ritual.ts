// Norse ritual: the two great rites of Heathenry and the holy space they
// happen in. The blót (what the sagas describe, chiefly Hákonar saga góða,
// and a modern blót step by step, without animal sacrifice); the sumbel
// (Beowulf, the bragarfull, the rounds, boasts and oaths, and keeping it
// safe for people who don't drink); and hallowing and holy places (vé, hörgr
// and hof, the fire carried round the land, Thor's hallowing, the modern
// hammer rite), with a coven rite and a solitary one. Modern practice marked
// as modern. British spelling.

import type { CourseModule } from '../types';
import { closed, coven, deity, herb, holy, journey, page, ritual, seasonal, tool, vessel } from '../linkHelpers.ts';

export default {
  id: 'norse-ritual',
  title: 'Heathen ritual: blót, sumbel and holy space',
  docs: [
    {
      id: 'norse-ritual-the-blot',
      title: 'The blót: a gift to the gods',
      summary: 'What the word blót means, what the sagas describe of the great sacrificial feasts and how far to trust them, and a modern blót step by step: hallowing, the call, the horn, the words, the pouring, the sprinkling and the gift to the earth.',
      minutes: 16,
      links: [ritual('folk-simple-blot'), seasonal('hlautbolli'), seasonal('drinking-horn'), vessel('offering_bowl'), deity('freyr'), holy('norse/jol'), coven('ritual-builder')],
      body: `## The word

The Old Norse verb **blóta** means to worship with sacrifice, and the noun **blót** is the rite. The Old English cognate, **blōtan,** survives in Bede's name for November, Blōtmōnaþ, "sacrifice month", when he says the English slaughtered the cattle they could not keep through winter and gave them to their gods. Whatever else it was, a blót was a gift, and usually a shared meal.

## What the sagas describe

The fullest description is in Snorri Sturluson's **Hákonar saga góða** in Heimskringla, about a great feast at Lade in Norway in the tenth century. All the farmers came, bringing ale and food. Animals, including horses, were slaughtered. Their blood, the **hlaut,** was caught in bowls, the **hlautbollar,** and sprinkled with twigs, the **hlautteinar,** over the altars, the walls of the temple inside and out, and the people. The meat was boiled over fires in the middle of the hall and eaten. The chieftain blessed the cups and the food, and toasts were drunk: first to Odin, for victory and power to the king; then to Njord and Freyr, **til árs ok friðar,** "for a good year and peace"; then the **bragafull,** the chieftain's cup; and the **minni,** toasts to kinsmen who had died.

How far can we trust this? Snorri wrote about three hundred years later, as a Christian, and may have built his scene partly from older poems and partly from imagination. But other sources agree on the broad picture: shared feasts, animal sacrifice, sprinkling, toasts for a good year. Archaeology finds animal bones, especially of horses, cattle and pigs, at sites of feasting and cult. So the outline is probably sound; the details are Snorri's.

## Sacrifice then and now

Animal sacrifice was the centre of the great blót. It was not cruelty for its own sake: in a farming world, killing an animal for a feast and sharing it with the gods was the normal way to eat meat on a holy day. Almost all modern Heathens, however, give **mead, ale, milk, bread, food, crafts, time or work** instead. This course does not teach animal sacrifice, and a coven should never practise it. The gift that matters is a real gift: something of value, given well.

## A modern blót, step by step

Here is the shape this course teaches. Your coven will have its own wording.

1. **Prepare.** Set up an altar, called in Old Norse a **stalli,** with a cloth, a candle or fire, a horn or cup, a bowl (the hlautbolli), a sprig of evergreen or birch, and the drink. Mead is traditional; ale, cider, milk or juice are fine. If the gods of the day have images, set them out.
2. **Hallow the space.** The next lesson teaches ways to do this: fire carried round, the hammer sign, or simple words.
3. **State the purpose.** The leader says what the blót is for and whom it honours: "We hold blót at Winter Nights, for a good winter, to Freyr and the álfar."
4. **Call.** The leader, or everyone, invites the powers by name, with their deeds and by-names: "Freyr, lord of the Vanir, giver of good seasons, ruler of rain and sun, we call you to our blót." Praise is a gift in itself.
5. **Bless the drink.** The leader raises the horn and asks the gods to bless it, sometimes making the sign of the hammer over it.
6. **The horn goes round.** Each person takes the horn, speaks briefly to the god if they wish, drinks or touches it to their lips, and passes it on. What is left is poured into the bowl.
7. **The blessing.** The leader dips the sprig into the bowl and sprinkles the altar and the people: the gift returns as blessing. This is the modern echo of the hlautteinar.
8. **The gift to the earth.** The bowl is carried out and poured onto the ground, at a tree, a stone or a special spot. Indoors, it is poured later.
9. **Close.** Thanks are given, and the leader declares the blót ended. A feast often follows, with a portion set aside for the gods.

A blót for a household can take ten minutes; for a coven, half an hour or more with the feast.

## Words for the call

There is no fixed liturgy. Many Heathens use the old poems: the greeting of the sleeping valkyrie Sigrdrífa in the poem **Sigrdrífumál,** "Hail to the day, hail to the sons of day, hail to night and her daughter", is beloved for opening a rite, in your own chosen translation. Others write their own praise, using the gods' by-names from the Eddas. Speak clearly, and mean it. Short and sincere is better than long and borrowed.

## What a good gift is

- **Valued.** Mead you made, bread you baked, money given to a cause the god cares for, time spent cleaning a beach for Njord.
- **Fitting.** Ale and food for Thor, the first of the harvest for Freyr, something lovely for Freyja.
- **Given, not lent.** Once poured out or set down, it is not taken back or eaten by you afterwards, except where the coven shares the feast with the gods, as at the old blót.
- **Sustainable.** Don't pour alcohol into a river or stream; pour onto soil. Don't leave plastic, glitter or food that harms wildlife.

> **Safety:** Keep fire safe, keep candles away from hair and sleeves, and know what is in the drink. Always have a non-alcoholic choice, and never pressure anyone to drink.

## Alone

A solitary blót is the same rite with one person: hallow your space, state your purpose, call, bless and drink, pour, and give the gift to the earth. The app's "A Simple Blót" walks you through it.

## What's old and what's modern

- **Old:** the word blót, shared feasts with the gods, sprinkling from the bowl, and toasts for victory, for a good year and peace, and to the dead.
- **Modern:** the blót without animal sacrifice, the shape of the rite step by step, and most of its words.`,
    },
    {
      id: 'norse-ritual-sumbel',
      title: 'Sumbel: the horn, the rounds and the weight of words',
      summary: 'The sumbel in Beowulf and the sagas, the bragarfull and the vow made over it, how a modern sumbel runs (rounds to the gods, the ancestors and heroes, and boasts and oaths), the horn-bearer, and how to keep it safe and welcoming for people who don’t drink.',
      minutes: 16,
      links: [seasonal('drinking-horn'), ritual('folk-havamal-reflection'), deity('bragi'), deity('odin'), holy('norse/thorrablot'), coven('rituals')],
      body: `## What sumbel is

**Sumbel** (Old Norse **sumbl,** Old English **symbel**) is a feast of drinking in which a cup or horn is passed in order, and the words spoken over it matter. Where the blót is a gift to the gods, the sumbel is a gathering of people in the presence of the gods and the dead, building bonds through words: praise, memory, boasts and promises.

## In the old sources

The most vivid picture is in the Old English poem **Beowulf,** probably composed between the eighth and tenth centuries. In King Hrothgar's hall, Heorot, the queen **Wealhtheow** carries the cup round in order of rank, greeting the king, the warriors and the guest. Beowulf, taking the cup, makes a formal boast of what he will do: fight the monster Grendel or die. Earlier, the warrior Unferth challenges his reputation, and Beowulf answers with an account of his deeds. Words spoken at symbel bind the speaker.

In the Norse sources, the **bragarfull,** "the chief's cup" or "the best cup", is drunk at feasts, and over it men made vows. In **Ynglinga saga,** King Ingjald, at the funeral feast for his father, stands, drinks the bragarfull and vows to enlarge his kingdom by half towards every quarter or die, and then burns six of his guests, kings all, in the hall. The vow over the cup, **heitstrenging,** appears in other sagas too, often with grim results: a vow made in drink was still a vow.

Note what the sources do and don't say. They show cups passed in order, a woman bearing the cup, vows and boasts and toasts to gods and the dead. They do not describe a fixed sequence of three rounds. That is modern.

## A modern sumbel

Most groups keep something like this:

1. **Opening.** The host welcomes everyone, names the purpose, and may hallow the hall. Some ask the gods and ancestors to witness what is said.
2. **The horn-bearer.** One person, often the host's partner or an honoured woman in memory of Wealhtheow, though any person may do it, fills and carries the horn, offering it to each in turn. Some groups pass it hand to hand instead.
3. **First round: the gods.** Each person toasts a god or goddess, perhaps with a few words of thanks or praise: "Hail Frigg, who knows what is to come and keeps silent. Thank you for keeping my house through a hard winter."
4. **Second round: ancestors and heroes.** Each person toasts someone who has died, kin by blood or by love, or a hero of story or history whose deeds they admire.
5. **Third round: boasts and oaths.** Each person may boast of something they have done, or promise something they will do. Many groups end here; some go on with open rounds.
6. **Closing.** The host thanks the gods and the dead, and the last of the horn is poured out as a gift.

## Boasts and oaths

A **boast,** in this old sense, is not bragging. It is putting your deeds before the community so they become part of its story: "I finished my degree this year, after three hard ones." Others may hail it.

An **oath** is a promise that binds you. Modern Heathens hold that words spoken over the horn are laid into the **well of wyrd,** the deep pool of what has been, and shape what comes. This image comes partly from modern writers reflecting on the Norns' well in Völuspá, and is best called a modern teaching, but its point is sound: keep your word, especially in public.

So:

- **Swear small.** "I will finish the garden fence by Midsummer" is a good oath. "I will change my whole life" is not.
- **Never swear in drink what you would not swear sober.**
- **You may always pass.** "Hail" and passing the horn is always enough.
- **A group should never pressure anyone to swear.**
- **If you break an oath,** say so to the people who heard it, and make it right as best you can. Heathenry is unforgiving of oath-breaking that is hidden, and more forgiving of failure that is owned.

## Speaking at sumbel

Some customs that make for a good sumbel:

- Speak only when the horn is in your hands; listen when it is not.
- Keep toasts short, unless the occasion asks for more.
- Don't argue with or mock someone's toast. An old Heathen custom holds that a challenge to a boast must be answered, but in a modern group, disagreement belongs after the sumbel.
- Don't toast gods or beings your group has asked not to hear at its sumbel. Many groups ask that Loki and the giants not be hailed at shared sumbel, though they may be honoured privately; ask your mentor.
- What is said at sumbel stays at sumbel, unless the speaker shares it.

## Without alcohol

Mead and ale were the drinks of the old hall, but the sumbel is about words, not alcohol. A good host:

- always offers a non-alcoholic choice, and asks before filling;
- uses a second horn or cups, so no one in recovery has to touch alcohol;
- never comments on what anyone drinks;
- keeps the rounds short enough that no one is drunk by the third;
- makes sure people can get home safely.

> **Safety:** Three rounds of mead add up. Sip, don't drain. A host who lets a sumbel turn into heavy drinking has failed the guests, not honoured the gods.

## Alone

Sumbel needs company, but a solitary Heathen can keep a quiet version: a horn or cup, three toasts said aloud at the hearth, to a god, to an ancestor, and a small promise for the season, written down in your book. Online sumbel, with each person at their own hearth, is also common.

## What's old and what's modern

- **Old:** the drinking feast with cups in order, the woman bearing the cup, the bragarfull, toasts to the gods and the dead, and vows made over the cup.
- **Modern:** the three rounds as most groups keep them, the teaching of words laid in the well, and the care for those who don't drink.`,
    },
    {
      id: 'norse-ritual-hallowing-and-holy-space',
      title: 'Hallowing and holy space: vé, hörgr, hof and the hearth',
      summary: 'Where the heathen Norse worshipped (the vé, the hörgr, the hall and the debated “temple”), how land and things were made holy (fire carried round, Thor’s hallowing), the modern hammer rite, and how to set up a coven’s and a solitary holy space.',
      minutes: 15,
      links: [tool('altar'), herb('juniper'), deity('thor'), ritual('hedge-hearing-the-land-walk'), ritual('kitchen-hearth-blessing'), page('altar'), coven('altar')],
      body: `## Holy places in the old sources

Old Norse has several words for holy places, and they tell us something about how worship was done.

- **Vé** means a holy enclosure or sanctuary. It survives in place-names across Scandinavia, such as Odense in Denmark, "Odin's vé". A vé was a place set apart, where violence was forbidden.
- **Hörgr** seems to mean a cairn or stone altar, perhaps open to the sky. Hyndluljóð in the Poetic Edda says Óttarr built a hörgr of stones for Freyja and reddened it with blood.
- **Hof** is used in the sagas for a temple. But archaeologists have found few buildings used only for worship. More often, cult happened in the great **hall** of a chieftain's farm, sometimes with a small special building beside it, as at Uppåkra in Sweden. At Hofstaðir in Iceland, a large hall had the skulls of sacrificed cattle once hung on its walls. Many scholars now think the saga writers imagined heathen temples partly on the model of churches.
- **Groves, springs, stones and mounds** were also holy: Tacitus wrote of the Germans worshipping in groves, and Adam of Bremen of a sacred tree at Uppsala.

So the heathen Norse worshipped in their halls, at outdoor sites, at the household hearth, and in a few special buildings. Modern Heathens do all of these: most rites happen in homes and gardens, some in woods or by water, and a few groups now have temples, such as the one being built by Ásatrúarfélagið in Reykjavík.

## How land and things were made holy

Several kinds of hallowing appear in the sources:

- **Fire carried round.** In Landnámabók, the Icelandic Book of Settlements, settlers claim land by carrying fire round its bounds. Landnámabók also says that one of Iceland's first laws ordered ships with dragon-heads to take them down when approaching land, so as not to frighten the **landvættir,** the spirits of the land.
- **Thor's hallowing.** Several runestones ask Thor to hallow the runes or the monument: "Þórr vígi þessar rúnar", "may Thor hallow these runes". In the comic poem Þrymskviða, the giant Þrymr calls for Thor's hammer to be laid in the bride's lap to hallow the marriage. Thor's hammer amulets were worn widely in the late Viking age.
- **Marked bounds.** Holy assembly places and vé were marked out, sometimes with ropes or hazel poles, the **vébönd.**

## The hammer hallowing

Many modern Heathen groups open a rite with a **hammer hallowing:** the leader faces each direction in turn, makes the sign of the hammer (an upside-down T, like Mjölnir) in the air, and says words such as "Hammer in the north, hallow and hold this holy stead." This rite was devised in the twentieth century, partly on the model of ceremonial magic's banishing rituals. It is **modern,** not ancient, though the idea of Thor's hammer hallowing is old. Many groups use it; others prefer fire, or simple words.

## Ways to hallow

Choose one, with your coven:

1. **Fire.** Carry a lit candle or torch sunwise round the space, saying: "With fire I claim this ground as holy for our rite."
2. **The hammer.** Make the hammer sign over the altar, the drink and the people, with words of your coven's choosing.
3. **Water and juniper.** Sprinkle water from the bowl with a sprig of juniper, birch or evergreen. Juniper smoke was used for cleansing in Scandinavian and Scottish folk custom.
4. **Words alone.** "This is a holy place, for the gods, the wights and our kin. Let there be frith here." Declaring frith, peace, is itself a hallowing: no quarrels, no weapons drawn, no harm done within the bounds.

## Setting up a coven's holy space

- **The altar:** a table, stone or stump, with a cloth if you like, a candle or fire, the horn, the bowl and sprig, and images or tokens of the gods being honoured.
- **The bounds:** a circle of people, stones, rope or simply the room. No circle has to be "cast" in the Wiccan sense; the space is hallowed and frith is declared.
- **The direction:** many groups face north, the direction of the gods' realm in some modern readings; others face the altar wherever it is. There is no old rule; follow your coven.
- **Outdoors:** ask permission of the landowner and, many Heathens would add, of the land itself, with a small gift. Leave the place cleaner than you found it.

## A holy space at home

A household **altar** or **vé** for a Heathen can be very simple: a shelf with a candle, a small bowl, a hammer or other token, an image of a god you honour, and a stone or plant from your land. Some keep a separate place for the ancestors, with photos and names. Keep it clean, and give it a small gift now and then. The app's altar can hold the same things for you on your phone.

> **Your coven:** Ask how your coven hallows its space, whether it uses the hammer rite, and where it pours its offerings.

> **Try this:** Walk round the place where you will pour your offerings. Find a tree, stone or patch of earth that feels right, and give it a first small gift with a word of greeting.

## What's old and what's modern

- **Old:** the vé, hörgr and hall, groves and stones; fire carried round the land; Thor's hallowing on runestones; the landvættir.
- **Modern:** the hammer hallowing as most groups do it, facing north, and the household altar as a fixed shrine.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-norse-ritual',
      title: 'Heathen ritual: test',
      intro: 'Twelve questions on the blót, the sumbel and holy space. Most are scored at once; your mentor reads the two written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'In Hákonar saga góða, what were the toasts to Njord and Freyr for?',
          options: ['Victory in battle', 'A good year and peace (til árs ok friðar)', 'Safe sea voyages only', 'Revenge on enemies'],
          correct: [1],
          points: 1,
          explanation: 'To Njord and Freyr for a good year and peace; the toast to Odin was for victory.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'What was the hlautbolli?',
          options: ['A drinking horn', 'The bowl that caught the offering, sprinkled with twigs', 'A rune poem', 'A burial mound'],
          correct: [1],
          points: 1,
          explanation: 'The hlautbolli held the hlaut, sprinkled with the hlautteinar. Today it holds mead or another drink.',
        },
        {
          id: 'q3',
          type: 'truefalse',
          prompt: 'This course teaches animal sacrifice as part of a modern blót.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. Almost all modern Heathens give drink, food, crafts, time or work, and a coven should never practise animal sacrifice.',
        },
        {
          id: 'q4',
          type: 'multi',
          prompt: 'Which are good practice for a blót offering? Choose all that apply.',
          options: ['Pour alcohol onto soil, not into a stream', 'Give something of value, given well', 'Take the offering back and eat it yourself afterwards', 'Avoid leaving plastic or food that harms wildlife'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'A gift is not taken back. Give well, and give in a way that does not harm the land.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'Which old poem shows a queen carrying the cup round the hall and a hero making a boast over it?',
          options: ['Völuspá', 'Beowulf', 'Þrymskviða', 'Hávamál'],
          correct: [1],
          points: 1,
          explanation: 'In Beowulf, Wealhtheow carries the cup at Heorot and Beowulf vows to fight Grendel.',
        },
        {
          id: 'q6',
          type: 'truefalse',
          prompt: 'The old sources describe a fixed sumbel of exactly three rounds: gods, ancestors, boasts.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. The three rounds are a modern form; the sources show toasts and vows in order but no fixed sequence.',
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: 'Which are good rules for oaths at sumbel? Choose all that apply.',
          options: ['Swear small and specific', 'Never swear in drink what you would not swear sober', 'Everyone must make an oath in the third round', 'If you break an oath, own it and make it right'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'You may always pass. Oaths are freely made, small and kept, and failures are owned.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'What do many archaeologists now think about heathen “temples” (hof)?',
          options: ['Every farm had a stone temple', 'Cult happened mostly in chieftains’ halls, sometimes with a small special building, and saga writers may have imagined temples on the model of churches', 'There was no religion at all', 'Temples were only in Iceland'],
          correct: [1],
          points: 1,
          explanation: 'Halls such as Hofstaðir and Uppåkra show cult in and beside the hall.',
        },
        {
          id: 'q9',
          type: 'single',
          prompt: 'What is the hammer hallowing used by many modern groups?',
          options: ['A rite described in the Poetic Edda', 'A modern rite, partly modelled on ceremonial magic, built on the old idea of Thor’s hallowing', 'A Wiccan circle casting', 'A runestone inscription'],
          correct: [1],
          points: 1,
          explanation: 'Thor’s hallowing is old (runestones, Þrymskviða); the four-direction hammer rite is twentieth-century.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'In Landnámabók, why were dragon-heads to be taken down from ships approaching Iceland?',
          options: ['To save weight', 'So as not to frighten the landvættir, the spirits of the land', 'To honour Thor', 'Because they were Christian symbols'],
          correct: [1],
          points: 1,
          explanation: 'Respect for the land spirits is one of the best-attested ideas in Icelandic sources.',
        },
        {
          id: 'q11',
          type: 'long',
          prompt: 'Describe a blót you kept, alone or with the coven: whom it honoured and why, how you hallowed the space, what words you spoke, what you gave and where it went. Then say which parts are old and which are modern.',
          points: 4,
          explanation: 'Knowing the old from the modern in your own practice is the heart of honest Heathenry.',
          rubric: 'Full marks (4): describes a real blót in order, with its purpose and the powers honoured (1); names how the space was hallowed and what words were used (1); describes the gift and how it was given safely and respectfully to the land (1); correctly sorts at least two elements into old (such as toasts, sprinkling, gifts for a good year) and modern (such as the hammer hallowing or the step-by-step shape) (1).',
        },
        {
          id: 'q12',
          type: 'short',
          prompt: 'You are hosting a sumbel and one guest is in recovery from alcohol. What will you do to make the sumbel safe and welcoming for them?',
          points: 2,
          explanation: 'The sumbel is about words, not alcohol.',
          rubric: 'Full marks (2): names at least two practical measures, such as a separate horn or cups, a non-alcoholic drink offered as normal, never commenting on what anyone drinks, or short rounds (1); shows the principle that no one is pressured to drink and the rite’s worth is in the words (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Heathen ritual',
      intro: 'Here you learn the two great Heathen rites, the blót and the sumbel, and how holy space is made. You keep a blót alone several times, take part in the coven’s blót and sumbel, and learn to plan a rite. Each lesson says what is old and what is modern.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'Learn the blót',
          kind: 'study',
          instructions: `1. Read "The blót: a gift to the gods" and "Hallowing and holy space".
2. Read the description of the feast at Lade in Hákonar saga góða (in Heimskringla), in translation.
3. In the answer box, write which details you think are likely old, and which may be Snorri's.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['norse-ritual-the-blot', 'norse-ritual-hallowing-and-holy-space'],
          links: [ritual('folk-simple-blot')],
        },
        {
          title: 'Set up a holy space',
          kind: 'practice',
          instructions: `1. Set up a simple altar or vé at home, as the lesson describes, or in the app's altar.
2. Do the "Try this": find the place you will pour your offerings, and give it a first gift.
3. In the answer box, describe your space and why you set it up as you did.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['norse-ritual-hallowing-and-holy-space'],
          links: [page('altar'), tool('altar')],
        },
        {
          title: 'Keep a blót',
          kind: 'ritual',
          instructions: `1. Keep a blót alone, following the steps in the lesson or the app's "A Simple Blót": hallow, state the purpose, call, bless and drink, pour, sprinkle if you wish, and give the gift to the earth.
2. Honour a different power each time if you like: a god, the land wights, your ancestors.
3. Log each time with a line in the app's journal. Do it three times over the stage.`,
          times: 3,
          response: 'none',
          checked_by: 'self',
          minutes: 30,
          docs: ['norse-ritual-the-blot'],
          links: [ritual('folk-simple-blot'), page('journal')],
        },
        {
          title: 'The coven’s blót',
          kind: 'attend',
          instructions: `1. Take part in a blót held by your coven, in person or in the app.
2. Afterwards, write in the answer box how the coven hallowed its space, the order of the rite, and one thing you'd like to understand better.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 90,
          docs: ['norse-ritual-the-blot'],
          links: [coven('rituals')],
          solitary: 'Keep a fuller blót alone on a holy day from the app’s Norse calendar: hallow with fire or words, call the god of the day with praise you have written, bless and pour the drink, sprinkle your home with the sprig, and give the gift to the earth. Write the whole rite out in your Grimoire.',
        },
        {
          title: 'Take part in a sumbel',
          kind: 'attend',
          instructions: `1. Read "Sumbel: the horn, the rounds and the weight of words".
2. Take part in a sumbel with your coven. Toast in the first two rounds; boast, promise or pass in the third, as you choose.
3. In the answer box, write how it felt, and what you noticed about how the words were heard.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['norse-ritual-sumbel'],
          links: [coven('rituals'), seasonal('drinking-horn')],
          solitary: 'Keep a quiet sumbel at your hearth: three toasts said aloud, to a god, to someone who has died, and a small, specific promise for the season, written down in your book. Or join an open online sumbel run by an inclusive Heathen group.',
        },
        {
          title: 'Plan a rite',
          kind: 'book',
          instructions: `1. Using the app's ritual planner (or the coven's ritual builder if your coven uses it), write out a blót for a holy day of your choice: purpose, hallowing, call, words, gift and closing.
2. Mark each part as old, re-created or modern.
3. Save it to your Grimoire and send it to your mentor on this step.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['norse-ritual-the-blot', 'norse-ritual-hallowing-and-holy-space'],
          links: [page('planner'), coven('ritual-builder'), page('grimoire')],
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Re-read any lesson you're unsure of.
2. Take the test. The choice questions are scored at once; your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          quiz: 'quiz-norse-ritual',
          links: [journey('path-norse'), closed()],
        },
      ],
    },
  ],
} satisfies CourseModule;
