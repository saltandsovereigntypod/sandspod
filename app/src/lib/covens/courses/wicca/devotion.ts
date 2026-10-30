// Wiccan devotion: building relationship with the Goddess and the God. A
// daily practice, the esbats and the moon's month, the Goddess and the God in
// practice, offerings, the beloved dead and the Summerland, and discernment.
// Public, open practice in original words. The eclectic Wheel's lessons on
// the land and on the moon are linked from the tasks rather than repeated.
// British spelling.

import type { CourseModule } from '../types';
import { candle, deity, holy, journey, page, ritual, spread, vessel } from '../linkHelpers.ts';

export default {
  id: 'wicca-devotion',
  title: 'Wiccan devotion',
  docs: [
    {
      id: 'wicca-devotion-daily-practice',
      title: 'A daily Wiccan practice',
      summary: 'How to build a daily devotion to the Lady and the Lord that lasts: a five-minute morning and evening form, a fuller form for days with time, a household shrine, prayer in your own words, and what to do when you miss days or feel nothing.',
      minutes: 15,
      links: [ritual('wicca-daily-devotion'), ritual('kitchen-solitary-morning-practice'), ritual('kitchen-solitary-evening-reflection'), page('altar'), page('journal')],
      body: `## Why daily

Coven rites happen a few times a month. Relationship with the gods happens every day, or it fades. Most experienced Wiccans say that their daily practice, small and unglamorous, is what made the religion real for them. The sabbats and esbats are feasts; daily devotion is the bread.

The aim is not perfection. It is a practice simple enough to keep on your worst days, with room to grow on your best.

## The household shrine

A shrine is a small, permanent place for devotion, separate from (or part of) your working altar. It might be a shelf, a windowsill, or the top of a chest of drawers. On it:

- two candles, or one, for the Lady and the Lord;
- an image of each, or natural things that speak of them: a shell or a white stone for the Goddess, an antler, an acorn or a sunflower head for the God;
- a small offering bowl;
- something of the season.

Keep it clean and tended. Dust it weekly; change the seasonal things at each sabbat.

## A five-minute morning devotion

1. **Stand before the shrine.** Take three slow breaths, in for four and out for six.
2. **Light the candle** (or candles).
3. **Greet the Goddess and God.** For example: "Lady, Lord, I greet you in this new day. Be with me in all I do."
4. **Offer something small:** a few drops of water, a pinch of herbs, a flower, or simply your attention.
5. **Ask for one thing for the day,** or offer the day to them: "Help me to be patient today," or "Let my work today honour you."
6. **Stand quietly** for a minute.
7. **Close:** "Blessed be." Put out the candle before you leave the room.

## A five-minute evening devotion

1. **Light the candle.**
2. **Thank them** for one particular thing from the day. Be specific: "Thank you for the sound of rain this afternoon."
3. **Review the day honestly.** Where did you act well? Where would you act differently? This is not self-punishment; it is the Wiccan habit of taking responsibility.
4. **Ask for rest,** for yourself and anyone you are worried about (with their consent if it is a working; a prayer for someone is different from magic on them).
5. **Close** and put out the candle.

## A fuller devotion, once a week

On a day with more time, keep a longer devotion of twenty or thirty minutes: light incense, read something sacred to you (the Charge of the Goddess, a poem, a passage from a book), sing or chant, meditate in silence, write in your Book of Shadows. Some Wiccans cast a simple circle for this; most do not, for daily devotion.

## Praying in your own words

Wicca has few set prayers outside its rites. Most Wiccans pray in their own words. If that feels strange, a simple pattern helps:

1. **Address:** whom you are speaking to. "Lady of the moon..."
2. **Praise:** something true about them. "...who turns the tides and the seasons..."
3. **Thanks or request:** what you bring. "...thank you for carrying me through this hard week."
4. **Close:** "Blessed be."

Short is fine. Honest is better than beautiful.

## Through the day

Devotion need not stay at the shrine. Many Wiccans greet the moon when they see it, bow slightly to the sun at sunrise, thank the earth when they eat, or say "blessed be" when they pass a tree they love. These small acts weave the gods into ordinary life.

## Living with others

Not everyone lives alone, or with people who share their religion. If your household is not pagan, keep your shrine modest and your devotion quiet; a candle and a few whispered words disturb no one. If you cannot keep a shrine at all, a small box holding your candle and images can be brought out and put away again. Children can be welcomed into devotion simply, by lighting the candle or choosing the flower, without being pressed to believe anything.

## Devotion through the year

Let your daily devotion follow the Wheel. Change the seasonal things on the shrine at each sabbat, greet the Lady and Lord as the season shows them (the young God at Imbolc, the Lady in flower at Beltane, the God in the grain at Lammas), and let your words change with the light. Over a year, you will find that daily devotion and the sabbats teach each other.

## When you miss days

You will. Illness, travel, children, grief and plain forgetting happen to everyone. When you notice, simply start again, without guilt. The gods of Wicca are not keeping a register. If you miss weeks, a simple "I'm back" at the shrine is enough.

If daily is impossible for you, choose a rhythm you can keep: three times a week, or every weekend. Regular is more important than frequent.

## When you feel nothing

Many people go through long periods of feeling nothing in devotion. This is very common in every religion and has many causes: tiredness, depression, a phase of growth, or simply the ordinary rhythm of any relationship. Keep the practice simple and steady. Talk to your mentor. If the dryness comes with low mood that lasts more than a couple of weeks, please see a doctor too: devotion and medical care work well together.

> **Safety:** Daily candles are the commonest cause of fires in pagan homes. Put them out every time you leave the room. An electric candle on a shrine you pass often is a good idea.

> **Your coven:** Your coven may have a daily prayer or greeting it shares. Ask your mentor if there is one you might use.

> **Try this:** Keep the five-minute morning and evening devotions for thirty days. Log each day. At the end, write what changed.

## What's old and what's modern

- **Old:** household shrines and daily offerings, kept in ancient Greek, Roman and many other homes.
- **Modern:** Wiccan daily devotion to the Lady and the Lord, much of it shaped by the solitary Wicca books of the 1980s onwards.`,
    },
    {
      id: 'wicca-devotion-the-esbats',
      title: 'The esbats and the moon’s month',
      summary: 'The Wiccan esbat: where the word comes from, what is done at the full moon, the new and dark moon, the thirteen moons of a year and the popular moon names (and where those names really come from), keeping an esbat alone or with the coven, and magic by the moon.',
      minutes: 16,
      links: [holy('moon-full'), holy('moon-new'), ritual('wicca-full-moon-esbat'), ritual('wicca-blue-moon-long-wish'), ritual('wicca-harvest-moon'), spread('full-moon'), spread('new-moon'), page('moon')],
      body: `## What an esbat is

An **esbat** is a Wiccan rite kept at a phase of the moon, most often the full moon. Where the sabbats belong to the turning year and the story of the God, the esbats belong especially to the Goddess, whose sign is the moon. The esbat is also the usual time for a coven's magical work.

## The word

The word esbat was popularised by Margaret Murray in The Witch-Cult in Western Europe (1921). She found it in a sixteenth-century French account of witches' meetings and took it to mean the ordinary, smaller meetings of a coven, as distinct from the great sabbats. It probably comes from the Old French "s'esbattre", to frolic or amuse oneself. Wicca took up Murray's distinction: sabbats for the seasons, esbats for the moon.

The idea of meeting at the full moon has another source too: in Leland's Aradia (1899), the goddess Diana tells her followers to gather once a month, when the moon is full. Wicca drew on both.

## The moon's month

The moon goes from new to full and back in about twenty-nine and a half days. Wiccans often link its phases with the Goddess:

- **New moon:** the dark, hidden Goddess; beginnings, seeds, rest, inner work.
- **Waxing moon:** the Maiden; growth, drawing things in, building.
- **Full moon:** the Mother; fullness, power, worship, healing, blessing.
- **Waning moon:** the Crone; release, letting go, endings, banishing what harms.
- **Dark moon,** the last days before the new: rest, divination, the mysteries.

The core lessons on the moon and timing teach the phases in more depth. The app's moon page shows tonight's phase.

## What happens at a full moon esbat

A coven's full moon esbat usually follows the Wiccan shape, with the Goddess at its centre:

1. The circle is cast and the quarters called.
2. The Goddess (and often the God) is invited.
3. **Worship:** the Charge of the Goddess may be read or spoken; in some covens, the Goddess is drawn down into the High Priestess.
4. **Magic:** healing for those who have asked, blessings, workings for the coven or its members. Power is raised, often by chanting and dancing deosil, and sent.
5. **Cakes and ale.**
6. Thanks, release, and opening.
7. Often, a social time, and sometimes teaching.

The previous module's "complete esbat" is a full example for one person.

## The new and dark moon

Some covens also meet at the new or dark moon, for quieter work: meditation, divination, inner journeys, banishing and protection, or rest. Many solitary Wiccans keep a short new moon rite to set intentions for the month. Others keep the dark moon simply as a time not to work, letting the Goddess rest.

## Thirteen moons

A solar year holds twelve or thirteen full moons: twelve lunar months take about 354 days, so roughly every two and a half or three years there is a thirteenth. Wiccans often speak of "the thirteen moons" of a year.

A "blue moon" has two meanings: the popular modern one, a second full moon in a calendar month; and an older almanac meaning, the third of four full moons in one season. Either way, it is often treated as a time for long-term wishes.

## Moon names, honestly

You will meet names for each month's full moon: Wolf Moon, Snow Moon, Worm Moon, Pink Moon, Flower Moon, Strawberry Moon, Buck Moon, Sturgeon Moon, Harvest Moon, Hunter's Moon, Beaver Moon, Cold Moon. The app has a ready-made rite for each.

These names came into wide use through twentieth-century American almanacs, especially the Maine Farmers' Almanac from the 1930s and later the Old Farmer's Almanac. They mix colonial American, English and loosely attributed Native American sources, and many claims about which people used which name are uncertain. They fit the seasons of the northern temperate zone. Use them as seasonal folklore, not as an ancient or a single people's calendar, and in the southern hemisphere many Wiccans shift them by six months or make their own names from their land's year.

Some Wiccans name the moons from their own land: the moon of the first frost, the moon of the swifts' return. This is a beautiful practice.

## Keeping an esbat alone

Alone, an esbat can be as short as fifteen minutes or as long as an hour:

1. Look at the moon, if you can see it.
2. Cast a circle, or simply light your candles.
3. Greet the Goddess under her name as the full moon.
4. Read or speak words of praise.
5. Stand or sit in the moonlight, or before her candle, in silence.
6. Do one working, if you have one, with consent.
7. Share cakes and ale with her.
8. Thank her and close.
9. Write in your Book of Shadows.

## Magic by the moon

Wiccans commonly time magic by the moon: drawing things in while it waxes, giving thanks and blessing at the full, releasing while it wanes. The core lessons teach this. It is a help, not a rule: urgent healing need not wait for a full moon.

> **Safety:** Moon-gazing outdoors at night: tell someone where you are, take a torch, stay where you know the ground, and dress warmly. Charging water in moonlight is fine; drinking water left outdoors is not.

> **Your coven:** Ask your mentor when your coven keeps its esbats (on the night of the full moon, or the nearest convenient evening), whether it keeps the new moon too, and how members ask for healing.

> **Try this:** For three months, keep the full moon with an esbat, alone or with the coven, and the new moon with five minutes of quiet and one intention. Log each.

## What's old and what's modern

- **Old:** honouring the moon, in many ancient religions; the word esbat (from a sixteenth-century French source); Aradia's full moon gatherings (1899).
- **Modern:** the Wiccan esbat, the Triple Goddess reading of the phases, and the popular moon names as they are now listed.`,
    },
    {
      id: 'wicca-devotion-the-goddess',
      title: 'Coming to know the Goddess',
      summary: 'Practical ways to build a relationship with the Wiccan Goddess: the moon, the earth and the sea; reading the Charge as devotion; working with a particular goddess; offerings she is traditionally given; and noticing her in your own life.',
      minutes: 15,
      links: [deity('wiccan_goddess'), deity('diana'), deity('selene'), deity('brigid'), deity('aradia'), journey('deity-diana'), journey('deity-brigid'), candle('silver'), page('patron')],
      body: `## Knowing, not only knowing about

The tradition module explained what Wiccans believe about the Goddess. This lesson is about coming to know her: building a relationship through practice, as you would with a person. Like any relationship, it is built through time, attention, gifts and conversation.

## Where she is met

Wiccans meet the Goddess in many places. Choose one or two to begin with.

### The moon

The moon is the Goddess's best-known sign in Wicca. Watch it through a whole month: where it rises, how its shape changes, how it feels to stand under it. Greet it when you see it. Many Wiccans have a small gesture, such as touching the heart and then raising the hand, or a few words: "Hail, Lady."

### The earth

The Goddess is also the earth: the soil, the growing things, the land you live on. Gardening, walking, tending a houseplant, cooking food from the land, and caring for a place can all be devotion to her. The Wheel of the Year course's lesson on the land has more on this.

### The sea and the waters

For many, she is the sea, the tides that follow the moon, rivers and wells. If you live near water, visit it as a place of worship. Bring nothing that pollutes; take away litter.

### The body and life's turnings

Wicca honours the body and its cycles as sacred. The Goddess is met in birth and death, in love and pleasure, in menstruation, pregnancy, menopause and age. You need not be a woman to know her here. Many people find the Sanctuary's Cycle and Moon page helps them notice their own rhythms beside the moon's.

## The Charge as devotion

The Charge of the Goddess, in Doreen Valiente's words, is the nearest thing Wicca has to a scripture spoken by the Goddess. In it, she calls her worshippers to meet her at the full moon, to be free, to find her within themselves, and to keep mirth and reverence, beauty and strength, power and compassion, honour and humility.

Reading it slowly, aloud, as a prayer, is one of the best ways to come to know the Goddess of Wicca. Try reading it at every full moon for a year. Notice which lines catch you differently each time. Copy it by hand into your Book of Shadows; many Wiccans do. It is widely published, in Valiente's own books among others.

## A particular goddess

Many Wiccans come to honour a particular goddess as well as, or as a face of, the Goddess: Diana or Artemis of the moon and the wild; Brigid of the hearth, the forge and poetry; Selene, the moon herself; Isis, Hekate, Cerridwen, Aphrodite, or another. If one draws you:

1. **Learn her story** from good sources: the Library entry, the myths, and scholars' accounts of how she was worshipped.
2. **Learn what she was given:** offerings traditional to her.
3. **Try the dedication journey** in the app if there is one for her.
4. **Speak to her by name** at your shrine for a month, and notice.
5. **Respect her people.** If she belongs to a living religion, honour her in ways that religion would recognise.

## Offerings to the Goddess

Common Wiccan offerings to the Goddess include:

- **milk, water, wine or juice** poured into a bowl or onto the earth;
- **white or silver candles**;
- **flowers,** especially white flowers, and roses;
- **moon cakes** or bread, at the esbat;
- **incense,** such as jasmine, myrrh or sandalwood (from sustainable sources);
- **silver** or **shells** placed on the shrine;
- **acts**: time spent in nature, care for the earth, kindness to those who are vulnerable, art made for her.

Offer what you would want to give a beloved guest, and what you can afford. A sincere small gift is better than a grand one made grudgingly.

## Noticing her

Devotion includes listening. Over weeks, notice:

- dreams of the moon, the sea, or a woman who seems to be more than a woman;
- moments of unexpected comfort or awe;
- the same image or animal turning up repeatedly;
- a deepening sense, during rites, of being met.

Write these down, without deciding at once what they mean. The lesson on discernment will help you weigh them.

## A short full moon devotion to the Goddess

On a full moon when you are not keeping a full esbat, try this simple devotion of ten minutes:

1. Go where you can see the moon, or light a silver or white candle.
2. Stand with your arms raised and palms open towards her, and breathe slowly.
3. Greet her: "Lady of the moon, I see you in your fullness. Hail and welcome."
4. Read a few lines of the Charge, or speak your own praise.
5. Tell her one thing you are grateful for and one thing you need.
6. Pour a little water or milk onto the earth as an offering.
7. Stand in silence, letting the moonlight fall on you.
8. Close: "Thank you, Lady. Blessed be."

## If she feels distant

Some people find the Goddess immediately; others find her hard to reach, especially if they have complicated feelings about mothers, about women, or about their own bodies. If that is you, start with the face of her that feels safest: the moon in the sky, or the earth under your feet, rather than the Mother. Give it time, and talk it through with your mentor.

> **Your coven:** Your coven may honour the Goddess under particular names or with particular offerings. Ask your mentor what is customary.

> **Try this:** For one lunar month, greet the moon each time you see it, and read the Charge aloud at the full moon. At the end of the month, write a letter to the Goddess telling her what you have noticed.

## What's old and what's modern

- **Old:** the worship of moon, earth and sea goddesses, and of particular goddesses such as Diana, Selene and Brigid.
- **Modern:** the Wiccan Goddess as one who includes them all, and the Charge of the Goddess (1950s).`,
    },
    {
      id: 'wicca-devotion-the-god',
      title: 'Coming to know the God',
      summary: 'Practical ways to build a relationship with the Wiccan God: the Horned One of the wild, the sun, the grain that dies and is reborn, the Oak and Holly Kings; working with a particular god; offerings; and why some find the God harder to know at first.',
      minutes: 15,
      links: [deity('horned_god'), deity('cernunnos'), deity('pan'), deity('lugh'), deity('faunus'), journey('deity-cernunnos'), journey('deity-lugh'), candle('gold'), page('patron')],
      body: `## The often-overlooked partner

Many people come to Wicca drawn by the Goddess and find the God harder to know. Some have had difficult experiences of masculine images of God in other religions; some simply find less written about him. Yet Wicca is a religion of both, and many Wiccans say that coming to know the God changed their practice deeply. He is not a stern father in the sky. He is wild, joyful, sacrificial and tender, and he dies every year.

## Where he is met

### The wild

The Horned God is lord of the animals and the untamed places: forests, moors, the hunt, the beasts with antlers and horns. Wiccans meet him outdoors: walking in woods, watching deer at dusk, listening to wind in trees, feeling the animal in their own bodies when they run or dance.

He has ancient relatives. The Gaulish Cernunnos is known from a few images, most famously on the Gundestrup cauldron, and a single inscription; the Greek Pan and Roman Faunus were gods of the countryside and wild music. Herne the Hunter, the antlered ghost of Windsor Forest, is a figure of English folklore first written down by Shakespeare. Wicca gathered these into the Horned God. Knowing their separate stories helps you know him.

### The sun

The God is also the sun, born at the winter solstice, growing through spring, at full strength at midsummer, and waning towards winter. Watching the sunrise and sunset through the year is devotion to him.

### The grain

He is the grain: sown in the earth, growing, cut down at harvest, made into bread, and sown again. The harvest sabbats, especially Lammas, tell this story. Every loaf of bread can remind you of it.

### Death and rebirth

Because he dies and returns, the God is lord of death and what lies beyond, the comforter and guide of the dead. Many Wiccans find in him a gentle face for death.

## The Oak King and the Holly King

Some covens tell the God's year through two kings: the Oak King, who rules the waxing year from midwinter to midsummer, and the Holly King, who rules the waning year from midsummer to midwinter. They fight at the solstices, and each in turn gives way to the other. This is a modern image, popularised by Janet and Stewart Farrar from Robert Graves and James Frazer, and loosely connected with folk plays and the carol "The Holly and the Ivy". Many find it a lively way to dramatise the year. The lore module uses it in some sabbats.

## A particular god

As with the Goddess, many Wiccans come to honour a particular god: Cernunnos, Pan, Lugh, Apollo, Dionysus, Osiris, Herne. If one draws you, learn his story from good sources, learn what he was given, try the dedication journey if the app has one, and speak to him by name. Respect his own people's ways.

## Offerings to the God

Common Wiccan offerings to the God include:

- **ale, beer, cider, mead or wine,** or apple juice;
- **bread,** especially at the harvest;
- **gold, yellow or red candles**;
- **oak leaves, acorns, pine cones, antlers** (shed naturally), **seeds**;
- **incense** such as frankincense, pine or cedar;
- **meat** at a feast, shared;
- **acts:** physical work, protection of wild places, music and dance, courage for others.

## A practice for coming to know him

1. **Watch the sun.** For a week, note the time and place of sunrise or sunset, and greet the sun when you see it.
2. **Go to the wild.** Spend an hour in the most untamed place you can safely reach. Walk slowly. Listen. Greet the God of the place.
3. **Bake or buy bread.** At your shrine, hold the loaf and thank the God for his life, given in the grain. Share it.
4. **Dance.** Put on music with a drum beat and move for ten minutes, as an offering. Notice how it feels.
5. **Write.** Record what you noticed.

## If he is hard to know

If you find the God difficult:

- start with one face of him (the sun, the stag, the grain) rather than all at once;
- notice whether old associations from other religions are getting in the way, and talk about them with your mentor;
- remember that in Wicca he is a partner, not a ruler;
- be patient. Relationships take time.

## The Goddess and God together

Coming to know each separately is a start; Wicca also honours them together. Their relationship is the story of the year: meeting, union, parting and return. At your shrine, try greeting them as a pair, noticing how each changes in the light of the other: the Lady as the earth that receives the God's grain, the Lord as the sun that warms her fields. The sabbats tell this story in full, as the lore module will show.

> **Safety:** In wild places, stay on paths you know, tell someone where you are going, and keep your distance from animals, especially deer in the rut and cattle with calves. Shed antlers may be collected only where it is legal.

> **Your coven:** Ask your mentor how your coven honours the God, whether it uses the Oak and Holly Kings, and whether it honours a particular god.

> **Try this:** Keep the practice above over a fortnight. Then write a letter to the God, as you did to the Goddess, telling him what you have noticed.

## What's old and what's modern

- **Old:** Cernunnos, Pan, Faunus and other gods of the wild; sun and grain gods; Herne in folklore.
- **Modern:** the Wiccan Horned God (shaped by Murray's work), and the Oak and Holly Kings (Farrar, from Graves and Frazer).`,
    },
    {
      id: 'wicca-devotion-offerings-and-the-dead',
      title: 'Offerings, the beloved dead and the Summerland',
      summary: 'How Wiccans make offerings and dispose of them well; Wiccan ideas of death, the Summerland and rebirth and where they come from; honouring the beloved dead at home; and a simple Wiccan remembrance.',
      minutes: 15,
      links: [vessel('offering_bowl'), page('ancestors'), ritual('hedge-ancestor-candle-evening'), ritual('wicca-samhain-dumb-supper'), holy('wheel/samhain')],
      body: `## Offerings in Wicca

An **offering** is a gift given to the gods, the spirits or the dead. In Wicca, offerings are a way of saying thank you, of honouring, of building relationship and of sharing the good things of life. They are given freely: Wicca does not teach that the gods need feeding or will be angry without them.

## What to offer

Good offerings are things that are real gifts to you, given with attention:

- **food and drink:** bread, cakes, fruit, honey, milk, wine, juice, water, the first portion of a meal;
- **light and scent:** candles, incense, oil lamps;
- **flowers and greenery,** ideally grown or gathered with thanks;
- **things made:** poems, songs, drawings, crafts;
- **acts:** time, service, care for the earth or for people, done in a god's name.

## How to offer

1. Set out the offering in a bowl on your shrine or altar.
2. Say whom it is for and why: "Lady, Lord, I give you this bread in thanks for the harvest."
3. Leave it for a time: an hour, overnight, or until the next day.
4. Then dispose of it respectfully.

## Disposing of offerings

- **Liquids** can be poured onto the earth, into the garden or a plant pot, or, if you have nowhere else, down the sink with thanks.
- **Food** can be left outside where wildlife can eat it safely, buried, or composted. Avoid foods that harm animals (chocolate, grapes and raisins, onions, salty and sugary things for birds and dogs).
- **Flowers** go to the compost or the earth when they fade.
- **Candles and incense** are burned to the end where safe, or the remains are buried or put in the bin with thanks.
- Some Wiccans eat food offerings after a time, believing the gods have taken its essence; others do not. Ask your coven.

Never leave anything that will become litter or harm wildlife, and never leave offerings on private land or in sacred places of other religions without permission.

## Wicca and death

Wicca has no single doctrine of death, but some ideas are widely shared:

- **The Summerland.** Many Wiccans speak of a place of rest and renewal after death, called the Summerland. The name comes from nineteenth-century Spiritualism, especially the American writer Andrew Jackson Davis, and was taken up in Theosophy before Wicca adopted it.
- **Rebirth.** Many Wiccans believe in reincarnation: that after rest, the soul is born again. This idea came into Wicca from Theosophy and Eastern religions as understood in Britain in the early twentieth century, and fits the God's yearly death and rebirth.
- **The God as guide.** The God, as lord of death, is often seen as the one who receives and comforts the dead.
- **The Goddess as the cauldron of rebirth,** from whom all are born again.

Many Wiccans hold these as beliefs; others hold them as hopes, or as poetry. Some do not believe in any afterlife. Wicca does not require one view.

## Honouring the beloved dead

Wiccans honour their own dead: family, friends, teachers, and those of the Craft who have gone before (sometimes called "the Mighty Dead"). Samhain is the great festival of the dead, but you can honour them at any time.

### A place for them

Many Wiccans keep a small place for the dead, separate from the shrine of the gods: a photograph, a candle, a keepsake. The app's ancestors page lets you keep names and memories too.

### Who counts

The beloved dead are those you choose to honour. You do not have to honour relatives who harmed you. You can honour the dead of your choice: chosen family, teachers, those whose lives inspire you.

## A simple Wiccan remembrance

You can keep this on the anniversary of a death, at Samhain, or whenever you wish.

1. Set out a photograph or name of the person, a candle and a small offering of something they loved.
2. Light the candle: "Lord who guides the dead, Lady who receives all into the cauldron of rebirth, I remember [name]."
3. Speak to them: tell them something you remember, something you are grateful for, or news they would want to hear.
4. Sit quietly with them for a few minutes.
5. Offer the food or drink: "This is for you, with my love."
6. Close: "Rest well in the Summerland, and be reborn in joy, if that is your path. Blessed be."
7. Put out the candle, and dispose of the offering the next day.

## Grief

Honouring the dead can bring grief to the surface. That is natural and often healing. If grief is overwhelming, if you cannot function, or if it is very fresh, take care: keep rites short, talk to someone, and seek bereavement support or a doctor if you need to. Wicca does not ask you to be fine.

> **Safety:** Necromancy, trying to summon or speak with the dead in trance, is not a beginner's practice and is not part of this course. Remembrance is speaking to the dead in love; it does not require any reply.

> **Your coven:** Ask your mentor how your coven honours the dead, at Samhain and at members' deaths, and what it believes about the Summerland.

> **Try this:** Set up a place for your beloved dead. Keep the simple remembrance for one person. Write what you felt.

## What's old and what's modern

- **Old:** offerings to the gods and to the dead, in almost every ancient religion.
- **Modern:** the Summerland (Spiritualism, nineteenth century) and the Wiccan blend of rebirth and the God's yearly death.`,
    },
    {
      id: 'wicca-devotion-discernment',
      title: 'Discernment: telling real from wishful',
      summary: 'How to weigh experiences of the Goddess and God honestly: personal gnosis and its limits, simple tests (time, fruit, consistency, others), divination as a check, signs that something is wrong, and when to seek help from your mentor or a professional.',
      minutes: 14,
      links: [page('divination'), spread('patron-deity'), spread('before-working'), page('journal'), page('grimoire')],
      body: `## Why discernment matters

As your practice deepens, you may have experiences that feel like contact with the gods: a voice, an image, a strong feeling, a dream, a sign. Some will be deeply meaningful. Some will be ordinary mind-noise, wishful thinking or tiredness. A few might be signs that something is not well with you. **Discernment** is the skill of telling these apart, with humility and good sense. It is one of the most important skills in any religion that values direct experience, as Wicca does.

## Personal gnosis

Pagans often call personal religious experience **unverified personal gnosis**, or UPG: knowledge that feels true to you but cannot be checked against tradition or shared evidence. "The Goddess wants me to wear blue at the full moon" is UPG. So is "the God came to me as a stag in a dream".

UPG is not worthless. It is how much of anyone's religious life works. But it is personal: it guides you, not others, and it must be held lightly. When several people independently have the same experience, some call it **shared personal gnosis**, which carries a little more weight.

## Simple tests

When you have an experience that seems significant, ask:

1. **Time.** Write it down and wait. Does it still seem meaningful in a week, a month? Wishful experiences often fade; real ones tend to deepen.
2. **Fruit.** What does it lead to? Experiences of the gods in Wicca usually lead towards love, freedom, courage, responsibility, care for the earth and others. Experiences that lead towards fear, cruelty, isolation, grandiosity or harm are suspect.
3. **Consistency.** Does it fit what is known of this god, the tradition and your own experience so far? If it contradicts everything, be cautious, though not dismissive.
4. **Others.** What does your mentor think? What do experienced Wiccans say? A good mentor will neither dismiss nor inflate it.
5. **Ordinary explanations.** Were you tired, hungry, ill, emotional, on medication? Is there a simple, ordinary cause? Taking these seriously is not disbelief; it is honesty.
6. **Divination.** Some Wiccans check experiences with a tarot or rune reading. This can help, as long as you do not keep drawing until you get the answer you want.

## Warning signs

Be cautious, and talk to your mentor, if an experience:

- tells you that you are uniquely chosen, superior to others, or above ordinary rules;
- tells you to harm yourself or anyone else, or to cut yourself off from people;
- demands money, sex, secrecy or obedience to a person;
- brings persistent fear, dread or a sense of being watched;
- keeps you from sleeping, eating, working or caring for yourself;
- comes with voices or visions you cannot stop, outside ritual.

The gods of Wicca do not demand that you harm yourself or others. A coven leader who says "the Goddess told me" to justify pressure or harm is not to be obeyed.

## When to seek help

Religious experience and mental health can overlap, and anyone can become unwell. If you notice:

- low mood that does not lift for two weeks or more;
- anxiety that disrupts daily life;
- hearing or seeing things outside ritual that others do not;
- thoughts of harming yourself;

then please speak to your doctor or a mental health professional, and tell your mentor. Getting medical help does not mean your spiritual life is false; it means you are looking after the body and mind through which you meet the gods. Many devout Wiccans take medication and see therapists. If you are in crisis, contact emergency services or a crisis line straight away.

## Keeping a discernment journal

A simple record helps:

1. **What happened:** date, time, what you were doing, what you experienced.
2. **What you thought it meant** at the time.
3. **Your state:** tired, well, emotional, unwell.
4. **After a week:** does it still seem meaningful? What came of it?
5. **After a month:** the same question.

Over a year, patterns emerge. You learn which of your experiences tend to bear fruit.

## Sharing experiences in a coven

Covens differ in how they handle members' experiences. Some share them freely at the feast; others keep them for private conversation with a mentor. A few things help in any coven:

- share an experience as yours ("I felt the Goddess say..."), not as a message for everyone ("the Goddess says we must...");
- be glad for others' experiences without measuring yours against them;
- never pressure anyone to report an experience they did not have;
- let the coven's leaders help weigh anything that seems to concern the whole group.

## Divination as a check, used well

If you use cards or runes to check an experience, ask one clear question once ("What do I need to understand about this dream?"), read honestly, and write down the answer before you decide what it means. The app's spreads include one for questions about a patron deity and one for checking before a working. Don't keep drawing until you get the answer you hoped for: that is a sign you have already decided.

## Humility and wonder

Discernment is not cynicism. It is possible to hold an experience with wonder and gratitude while not being sure what it was. Many experienced Wiccans say they have had a handful of experiences in their life they would stake everything on, and many more that were lovely and uncertain. That is a healthy place to be.

> **Your coven:** Ask your mentor how your coven approaches personal experiences: whether members share them, and how the leaders help people weigh them.

> **Try this:** Keep a discernment journal for a month alongside your daily devotion. At the end, read it back and write what you have learned about how your own experiences tend to come.

## What's old and what's modern

- **Old:** the testing of visions and prophecies, in ancient oracle traditions and in many religions.
- **Modern:** the terms UPG and shared gnosis, from pagan discussion in the 1990s.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wicca-devotion',
      title: 'Wiccan devotion: test',
      intro: 'Twelve questions on daily devotion, the esbats, the Goddess and God, offerings and the dead, and discernment. Most are scored at once; your mentor scores the written answers. You need 80% to pass.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'What matters most in a daily devotion?',
          options: ['That it is long', 'That it is regular and simple enough to keep on hard days', 'That it uses set words', 'That it is done in a cast circle'],
          correct: [1],
          points: 1,
          explanation: 'A short, steady practice builds relationship. Regular is more important than frequent or elaborate.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'Where does the word esbat, as Wiccans use it, come from?',
          options: [
            'An ancient Celtic word for the moon',
            'Margaret Murray, who took it from a sixteenth-century French account of witches’ meetings',
            'Doreen Valiente’s poetry',
            'The Old Farmer’s Almanac',
          ],
          correct: [1],
          points: 1,
          explanation: 'Murray popularised it in 1921, probably from the Old French "s’esbattre", to frolic. Wicca used her distinction between sabbats and esbats.',
        },
        {
          id: 'q3',
          type: 'multi',
          prompt: 'Which statements about the popular full moon names are honest? Choose all that apply.',
          options: [
            'They spread through twentieth-century American almanacs',
            'Many claimed Native American origins are uncertain',
            'They are the ancient calendar of a single people',
            'They fit the northern temperate seasons; many in the south shift them',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Use them as seasonal folklore, not an ancient calendar. Naming moons from your own land is a fine practice too.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'Which phase do many Wiccans use for releasing and letting go?',
          options: ['The waxing moon', 'The full moon', 'The waning moon', 'None; the moon is never used'],
          correct: [2],
          points: 1,
          explanation: 'The waxing moon is for drawing in, the full for worship and blessing, the waning for release. It is a help, not a rule.',
        },
        {
          id: 'q5',
          type: 'truefalse',
          prompt: 'Herne the Hunter is first recorded in Shakespeare, as an antlered ghost of Windsor Forest.',
          options: ['True', 'False'],
          correct: [0],
          points: 1,
          explanation: 'True. Herne belongs to English folklore first written down by Shakespeare. Wicca gathered him, Cernunnos and Pan into the Horned God.',
        },
        {
          id: 'q6',
          type: 'multi',
          prompt: 'Which are good ways to dispose of offerings? Choose all that apply.',
          options: [
            'Pouring liquids onto the earth or a plant pot',
            'Leaving chocolate and grapes outside for wildlife',
            'Burying or composting food',
            'Putting remains in the bin with thanks if nothing else is possible',
          ],
          correct: [0, 2, 3],
          points: 1,
          explanation: 'Chocolate, grapes and raisins harm animals. Never leave offerings that become litter or harm wildlife.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'Where does the Wiccan idea of the Summerland come from?',
          options: ['Ancient Celtic texts', 'Nineteenth-century Spiritualism, through Theosophy', 'The Charge of the Goddess', 'Margaret Murray'],
          correct: [1],
          points: 1,
          explanation: 'The Summerland comes from Spiritualism, especially Andrew Jackson Davis, and Theosophy. Wiccans hold it as belief, hope or poetry.',
        },
        {
          id: 'q8',
          type: 'multi',
          prompt: 'Which are warning signs about a spiritual experience? Choose all that apply.',
          options: [
            'It tells you that you are uniquely chosen and above ordinary rules',
            'It leads you towards care for others and the earth',
            'It tells you to cut yourself off from friends',
            'It brings persistent dread and stops you sleeping',
          ],
          correct: [0, 2, 3],
          points: 1,
          explanation: 'Experiences that lead to grandiosity, isolation, harm or distress are suspect; talk to your mentor, and see a doctor if your health suffers.',
        },
        {
          id: 'q9',
          type: 'truefalse',
          prompt: 'If a coven leader says "the Goddess told me" you must give money to the coven, you should obey.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. No genuine revelation demands money, sex, secrecy or obedience to a person. That is abuse, not religion.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'What is unverified personal gnosis (UPG)?',
          options: [
            'A secret Wiccan text',
            'A personal religious experience or insight that feels true but cannot be checked against tradition or shared evidence',
            'A kind of divination',
            'A coven rank',
          ],
          correct: [1],
          points: 1,
          explanation: 'UPG guides you, not others, and is held lightly. Time, fruit, consistency and others’ counsel help you weigh it.',
        },
        {
          id: 'q11',
          type: 'short',
          prompt: 'After thirty days of morning and evening devotion, describe what you did, how often you kept it, and what changed, if anything.',
          points: 3,
          explanation: 'Honest accounts, including of missed days, are the most useful.',
          rubric: 'Full marks (3): describes their devotion concretely, including shrine and words (1); reports honestly how often they kept it, including missed days and how they started again (1); reflects on what changed or did not, without exaggeration (1).',
        },
        {
          id: 'q12',
          type: 'short',
          prompt: 'Compare coming to know the Goddess and the God in your practice: what drew you, what was harder, and what you will do next.',
          points: 3,
          explanation: 'Many find one easier than the other at first. Noticing why helps.',
          rubric: 'Full marks (3): describes at least one practice they kept for each (1); names honestly what was easier or harder, with a reason (1); names a concrete next step (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Wiccan devotion',
      intro: 'Here you build a living relationship with the Goddess and the God: a daily practice, the esbats, coming to know each of them, offerings and the beloved dead, and the discernment to weigh what you experience. This stage asks for steady practice over a couple of months; take the time it needs.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'Thirty days of devotion',
          kind: 'practice',
          instructions: `1. Read "A daily Wiccan practice" and set up your household shrine.
2. Keep the five-minute morning and evening devotions for thirty days.
3. Log each day. If you miss days, start again without guilt and say so in your note.`,
          times: 30,
          response: 'none',
          checked_by: 'self',
          minutes: 10,
          docs: ['wicca-devotion-daily-practice'],
          links: [ritual('wicca-daily-devotion'), page('altar')],
        },
        {
          title: 'Keep the moons',
          kind: 'ritual',
          instructions: `1. Read "The esbats and the moon's month". For more on the moon between festivals, the Wheel of the Year lesson "The moon between festivals" is good further reading.
2. For three months, keep each full moon with an esbat (alone or with the coven) and each new moon with five minutes of quiet and one intention.
3. Log each moon.`,
          times: 6,
          response: 'none',
          checked_by: 'self',
          minutes: 40,
          docs: ['wicca-devotion-the-esbats', 'wheel-devotion-the-moon'],
          links: [ritual('wicca-full-moon-esbat'), page('moon')],
        },
        {
          title: 'The Goddess',
          kind: 'practice',
          instructions: `1. Read "Coming to know the Goddess".
2. For one lunar month, greet the moon whenever you see it and read the Charge aloud at the full moon.
3. At the end, write a letter to the Goddess and put what you are willing to share in the answer box.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wicca-devotion-the-goddess'],
          links: [deity('wiccan_goddess')],
        },
        {
          title: 'The God',
          kind: 'practice',
          instructions: `1. Read "Coming to know the God".
2. Over a fortnight, keep the practice in the lesson: watch the sun, go to the wild, thank him with bread, dance.
3. Write a letter to the God and put what you are willing to share in the answer box.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['wicca-devotion-the-god'],
          links: [deity('horned_god')],
        },
        {
          title: 'Offerings and the dead',
          kind: 'ritual',
          instructions: `1. Read "Offerings, the beloved dead and the Summerland".
2. Make an offering to the Goddess and God and dispose of it well.
3. Set up a place for your beloved dead and keep the simple remembrance for one person.
4. Log each, with a short note.`,
          times: 2,
          response: 'none',
          checked_by: 'self',
          minutes: 30,
          docs: ['wicca-devotion-offerings-and-the-dead'],
          links: [page('ancestors')],
        },
        {
          title: 'A discernment journal',
          kind: 'reflection',
          instructions: `1. Read "Discernment: telling real from wishful".
2. Keep a discernment journal for a month alongside your devotion.
3. In the answer box, write what you have learned about how your own experiences come, and share anything you would like your mentor's view on.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wicca-devotion-discernment'],
          links: [page('journal')],
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
          quiz: 'quiz-wicca-devotion',
          links: [page('grimoire')],
        },
      ],
    },
  ],
} satisfies CourseModule;
