// Hellenic lore: the Attic festival year, with one lesson for each festival
// in the app's Hellenic calendar (holidays.ts, tradition 'hellenic'). Each
// festival task carries its holiday key. Consistent with the festival pages
// in holy/data/holidays.ts. British spelling.

import type { CourseModule, CourseTask } from '../types';

const festivals: { slug: string; name: string; when: string }[] = [
  { slug: 'kronia', name: 'the Kronia', when: '12 Hekatombaion, in high summer' },
  { slug: 'panathenaia', name: 'the Panathenaia', when: '28 Hekatombaion, in high summer' },
  { slug: 'eleusinia', name: 'the Eleusinian Mysteries', when: '15 to 23 Boedromion, in early autumn' },
  { slug: 'pyanepsia', name: 'the Pyanepsia', when: '7 Pyanepsion, in autumn' },
  { slug: 'thesmophoria', name: 'the Thesmophoria', when: '11 to 13 Pyanepsion, in autumn' },
  { slug: 'haloa', name: 'the Haloa', when: '26 Poseideon, in midwinter' },
  { slug: 'lenaia', name: 'the Lenaia', when: '12 Gamelion, in winter' },
  { slug: 'anthesteria', name: 'the Anthesteria', when: '11 to 13 Anthesterion, in early spring' },
  { slug: 'dionysia', name: 'the City Dionysia', when: '10 Elaphebolion onward, in spring' },
  { slug: 'mounichia', name: 'the Mounichia', when: '16 Mounichion, at the spring full moon' },
  { slug: 'thargelia', name: 'the Thargelia', when: '6 and 7 Thargelion, in late spring' },
  { slug: 'plynteria', name: 'the Plynteria', when: '25 Thargelion, in early summer' },
  { slug: 'skira', name: 'the Skira', when: '12 Skirophorion, at midsummer' },
];

const festivalTask = (f: (typeof festivals)[number]): CourseTask => ({
  title: `Keep ${f.name}`,
  kind: 'ritual',
  instructions: `1. A week or two before ${f.when}, read the lesson on ${f.name} (and "The Attic year" if you haven't yet). The app's calendar shows this year's date.
2. Plan how you will keep it: alone, with the coven, or both. Gather what you need.
3. On the day, keep it as the lesson describes, or in your coven's way.
4. Afterwards, write in the answer box what you did, what you noticed, what you learned about the festival's history, and one thing you'd do differently next year.
5. If you could not keep it on the day, keep a simple version within a few days and say so in your answer.`,
  times: 1,
  response: 'text',
  checked_by: 'mentor',
  minutes: 60,
  holiday: `hellenic/${f.slug}`,
  docs: [`hellenic-lore-${f.slug}`, 'hellenic-lore-the-attic-year'],
});

export default {
  id: 'hellenic-lore',
  title: 'The Hellenic festival year',
  docs: [
    {
      id: 'hellenic-lore-the-attic-year',
      title: 'The Attic year',
      summary: 'How the ancient Athenian calendar worked, why modern Hellenists use it, how the app dates the festivals, and how to keep a festival well as a beginner or a coven.',
      minutes: 15,
      body: `## A year of festivals

Ancient Athens kept more festivals than any other Greek city: by some counts, well over a hundred days a year had a public festival or sacrifice. Modern Hellenic polytheists mostly follow the Athenian calendar, called the Attic calendar after Attica, the region around Athens, because it is the best recorded. The app's Hellenic calendar holds thirteen of its great festivals, and this module gives one lesson to each.

## How the Attic calendar works

The Attic year was lunar. Each month began at the Noumenia, when the first crescent of the new moon was seen, and ran for 29 or 30 days. Twelve lunar months make about 354 days, eleven short of a solar year, so every few years an extra month was added to keep the festivals in their seasons.

The year began with the first new moon after the summer solstice. The months, with roughly where they fall in the northern year, are:

1. **Hekatombaion** (July to August): the Kronia and the Panathenaia.
2. **Metageitnion** (August to September).
3. **Boedromion** (September to October): the Eleusinian Mysteries.
4. **Pyanepsion** (October to November): the Pyanepsia and the Thesmophoria.
5. **Maimakterion** (November to December).
6. **Poseideon** (December to January): the Haloa.
7. **Gamelion** (January to February): the Lenaia.
8. **Anthesterion** (February to March): the Anthesteria.
9. **Elaphebolion** (March to April): the City Dionysia.
10. **Mounichion** (April to May): the Mounichia.
11. **Thargelion** (May to June): the Thargelia and the Plynteria.
12. **Skirophorion** (June to July): the Skira.

Festivals were dated by the day of the month, so they move against our calendar from year to year, as Easter does. You do not need to calculate any of this. The app's calendar works out each year's dates from the moon, and you can see the coming festivals in your calendar and on Today.

> **Note:** Ancient Athenian officials sometimes shifted days or inserted extra ones for political reasons, and scholars disagree about details of the calendar. Modern calendars, including the app's, follow a consistent rule. Different Hellenic groups may keep a festival a day apart. That is normal.

## The southern hemisphere

The Attic festivals follow the seasons of Greece. If you live in the southern hemisphere, the Haloa's midwinter falls in your summer, and the Panathenaia's high summer in your winter. Practitioners in the south make different choices: some keep the Athenian dates and honour the festivals' stories rather than their seasons; others shift harvest and seasonal festivals by six months. Talk with your coven about what you will do.

## What a festival is

A Greek festival (heorte) was a day when the gods were especially honoured, usually with a procession, sacrifice, a shared meal and something particular to the day: a contest, a play, a ritual meal, a cleaning of a statue. Many festivals were for the whole city; some were for women only; some were family affairs. Most had stories attached explaining why they were kept.

The festivals tell you who the Athenians thought the gods were, and the year as a whole tells a story: summer celebrations of the city and its goddess; autumn's harvest and the Mysteries; winter's wine and theatre; spring's flowers and the return of the dead; early summer's cleansing and first fruits; and the year's close at midsummer.

## Keeping a festival as a beginner

Each festival lesson gives you a way to keep the day. In general:

1. **Read ahead.** Read the lesson and the festival's page in the app a week or two before.
2. **Choose something you can do.** A short household rite with one custom from the festival is a full observance.
3. **Prepare.** Gather offerings, food and anything the custom needs.
4. **Purify and begin with Hestia**, as in every rite.
5. **Honour the festival's gods** with prayer, libation and offering.
6. **Do the festival's own custom**: cook the bean pot, open the new wine, clean the image.
7. **End with Hestia** and share food.
8. **Write it up** in the app afterwards.

## Keeping a festival with a coven

Covens usually gather for some festivals and leave others to members' households. A coven festival follows the order of a Hellenic rite at greater length, often with a shared meal, a reading of the myth, and roles for many members. Online gatherings in the app let members far apart keep the day together, each at their own shrine.

> **Your coven:** Ask your mentor which festivals your coven keeps together, which it leaves to households, and whether it keeps any festivals that are not in the app's calendar, such as the Diasia for Zeus Meilichios or the Genesia for the dead.

## Honesty about what we know

Every festival lesson separates what we know from what we do not. For some festivals, like the Panathenaia, we know a great deal. For others, like the Skira, almost nothing beyond a few details. Where evidence is thin, modern practice fills the gap with reasonable creativity. That is fine, as long as we do not pretend our inventions are ancient.

> **Safety:** Several festivals involve wine. Alcohol is never required; grape juice and water are traditional substitutes in modern practice. Several involve fasting: only fast if your health allows, and never if you are pregnant, diabetic, have a history of eating disorders or are advised against it. Several involve candles and fire: never leave a flame unattended.

## What's ancient and what's modern

- **Ancient:** the lunar months, the festivals, their dates and their customs, as far as the evidence goes.
- **Modern:** computed calendars, household versions of civic festivals, southern hemisphere adaptations, and online gatherings.`,
    },
    {
      id: 'hellenic-lore-kronia',
      title: 'Kronia',
      summary: 'The festival of Kronos in high summer, when masters and the enslaved ate at the same table in memory of the Golden Age, and how to keep it today as a feast of equality.',
      minutes: 15,
      body: `## The day

The Kronia falls on 12 Hekatombaion, in high summer, in the first month of the Athenian year. The app's calendar shows this year's date.

## Whom it honours

Kronos is the Titan who ruled the world before Zeus, with his consort Rhea. In the myth, Kronos swallowed his children for fear one would overthrow him; Rhea saved the youngest, Zeus, who did overthrow him. But the Greeks also remembered Kronos's reign as the Golden Age. In Works and Days, Hesiod describes it: people "lived like gods without sorrow of heart, remote and free from toil and grief", and "the fruitful earth unforced bare them fruit abundantly and without stint".

The Kronia remembers that lost age of plenty, when no one served anyone.

## What we know

The Kronia was one of Athens's older festivals. Demosthenes mentions it as a day when the Council did not sit. The Roman writer Macrobius, quoting the Athenian historian Philochorus and the poet Accius, tells us its most famous custom: at the Kronia, heads of households ate together with the people they enslaved, and even served them. Accius says the Greeks kept this custom long before the Romans kept the Saturnalia, the similar Roman festival of Saturn.

Kronos and Rhea had a sanctuary in Athens near the great temple of Olympian Zeus. The festival came just after the grain harvest, and Kronos was often shown with a sickle, so the Kronia was also a harvest-home feast.

## What we don't know

We know very little about any public sacrifice or temple rite at the Kronia. Even ancient writers explained the festival in different ways. Whether the reversal of roles was a real, widespread practice in every household or something done by some is not clear.

## Its meaning today

Ancient Athens kept enslaved people, and the Kronia's day of equality did not change that. Modern practitioners keep the festival as a day of shared food and equality, and many use it to think about justice, labour and who serves whom in our own world. It is a festival that asks: what would a fair world look like, and what could I do toward it?

## Keeping it as a beginner

1. **Plan a meal.** Invite friends, family or housemates, or simply cook for yourself with care. Make the best food you reasonably can: summer fruit, bread, honey cakes, figs.
2. **Begin with khernips and Hestia.** Light Hestia's flame, make khernips, and give her the first offering.
3. **Pour to Kronos and Rhea.** Pour a little wine, juice or water: "Kronos and Rhea, rulers of the Golden Age, I remember the time when the earth gave freely and no one served another. Let there be enough for all."
4. **Read Hesiod's Golden Age passage** (Works and Days, lines 109 to 126), aloud if you are with others.
5. **Reverse the roles.** Let the person who usually cooks or serves be served. If you live alone, cook for someone else, or give a meal to a stranger.
6. **Eat at one table**, with no head and no ranks; sit people at random.
7. **Name one thing** you will do to share more fairly this year.
8. **End with Hestia.**

A further offering many practitioners make: a day's pay or a day's work for a cause that supports workers or people in poverty.

## Words for the day

A prayer you can use, in the three-part shape of Greek prayer:

"Kronos, ancient king, and Rhea, mother of the gods: in your age the earth gave freely and no one was master or servant. I remember that time, and I have laid this table for all who come to it. Let there be enough for everyone, and let me do my part to share it."

Say it with arms raised, then pour your libation.

## Common difficulties

- **"I have no one to serve."** Serve a stranger instead: buy someone a meal, give to a food bank, or cook for a neighbour. The festival is about turning the usual order over, not about having a household.
- **"Kronos ate his children. Why honour him?"** The Greeks honoured Kronos for the Golden Age while telling dark stories about him. You can hold both, or honour the Golden Age itself and Rhea, who saved her children.
- **"It feels like charity, not religion."** For the Greeks, how you treated people was religion. Pour your libation first, and let the meal be the rite.

## Keeping it with a coven

A coven Kronia is a feast. Members bring food; the leaders cook and serve; everyone eats at one table. A reading of Hesiod, a libation to Kronos and Rhea, and conversation about fairness make a full rite. It is a good festival for welcoming new members and guests, in the spirit of xenia.

> **Your coven:** Your coven may hold its Kronia with a community meal, a donation, or an act of service. Ask your mentor what is planned, and offer to help serve.

> **Safety:** If you host, think about guests' allergies and diets. Keep alcohol optional. If you give to a cause, give what you can afford; generosity that puts you in hardship is not what the festival asks.

## Reflect

- Who serves you in your daily life, often unseen? How could you honour them?
- What does "enough for all" mean to you?
- The Golden Age myth looks backward. Can a festival of the past also be a hope for the future?

## What's ancient and what's modern

- **Ancient:** the date, the feast with the enslaved, the link with the Golden Age and harvest, a sanctuary of Kronos and Rhea.
- **Modern:** the focus on social justice and labour, giving to causes, and the household feast of equality as a festival rite.`,
    },
    {
      id: 'hellenic-lore-panathenaia',
      title: 'Panathenaia',
      summary: 'Athena\'s birthday festival, with its great procession carrying a new robe to her ancient statue, its contests and sacrifice, and how to keep it with a gift of craft.',
      minutes: 15,
      body: `## The day

The Panathenaia falls on 28 Hekatombaion, in high summer, near the end of the first month of the Athenian year. Tradition held it to be Athena's birthday. The app's calendar shows this year's date.

## Whom it honours

Athena Polias, guardian of the city: goddess of wisdom, weaving and crafts, of the olive tree and of disciplined courage. In myth she was born fully armed from the head of Zeus, and won Athens in a contest with Poseidon by giving the city the olive tree. At the Panathenaia, the city honoured its goddess and, through her, itself.

## What we know

The Panathenaia was the greatest festival of Athens. Every year there was a procession and sacrifice. Every fourth year, from 566 BCE, the Great Panathenaia added days of contests: athletics, horse races, music and poetry recitation. Winners received large painted amphorae filled with oil from Athena's sacred olive trees; hundreds of these prize jars survive.

The heart of the festival was the peplos, a robe woven for Athena's ancient olive-wood statue. Women and girls of Athens spent months weaving it, saffron yellow and decorated with the battle of the gods against the giants. On the night before, there was an all-night celebration (pannychis) with torch races, singing and dancing. At dawn, the great procession set off from the Dipylon gate, through the Agora and up to the Acropolis: young women carrying baskets, men leading cattle for sacrifice, musicians, horsemen, and the peplos itself. A hecatomb, a great sacrifice of cattle, followed, and the meat was shared among the citizens.

The frieze that ran around the Parthenon, much of it now in the British Museum, is often read as a picture of this procession.

## What we don't know

Whether the Parthenon frieze really shows the Panathenaic procession is debated. The order of events changed over the centuries, and some details are reconstructed from scattered evidence.

## Its meaning today

The Panathenaia is a festival of craft, community and civic life. Many modern practitioners use it to give Athena a gift of their own handwork, to celebrate learning and skill, and to do something for their own town or city.

## Keeping it as a beginner

1. **Make a peplos.** In the weeks before, weave, sew, knit, embroider or mend something: a ribbon, a small cloth, a scarf. Imperfect work made with care is exactly right.
2. **Prepare** olive oil, incense and a small food offering such as olives, figs or a honey cake.
3. **Begin with khernips and Hestia.**
4. **Process.** Carry the cloth in a short procession through your home to your shrine, or to a high window. If you can, walk to a high point in your town.
5. **Offer.** Lay the cloth on or by Athena's image. Burn incense and pour a few drops of olive oil.
6. **Pray** to Athena Polias for wisdom in your work and courage in your community. Read the short Homeric Hymn to Athena if you like.
7. **Hold a friendly contest**, if you are with others: a race, a quiz, a reading.
8. **End with Hestia**, and share food.
9. **Keep the cloth** on her image through the year until the next Panathenaia.

## Words for the day

A prayer you can use as you lay your cloth before Athena:

"Athena Polias, grey-eyed daughter of Zeus, guardian of cities, mistress of the loom and the olive: on your birthday the Athenians brought you a robe woven by many hands. I bring you this, made by mine, small and imperfect but made for you. Give me wisdom in my work, steadiness in my courage, and care for the place where I live."

## Common difficulties

- **"I can't sew or weave."** Mend a button, tie a ribbon, plait three threads together, or buy a simple scarf and embroider one stitch on it. Effort and care are the offering, not skill.
- **"I'm not interested in civic life."** Athena's city is any community you belong to: your street, your workplace, your coven. Do one good thing for it.
- **"A procession at home feels silly."** Walk slowly and in silence for twenty steps, holding the cloth with both hands. That is a procession.

## Keeping it with a coven

A coven Panathenaia is a natural procession festival. Members may each bring a piece of craft as an offering, process together, and present a shared peplos made over the year. Contests of poetry, song or skill suit the day. An act of civic service, such as cleaning a public space or volunteering together, makes a fine offering.

> **Your coven:** Some covens weave a peplos together over the whole year, each member adding a row or a stitch. Ask your mentor what your coven does.

> **Safety:** Torch races are best left to the ancient world; use battery lanterns for any night procession. Olive oil is flammable when hot; keep it away from naked flames except in an oil lamp designed for it.

## Reflect

- What craft or skill could you offer Athena? What would it mean to work on it all year?
- What does your town or city need, and what could you give it?
- Athena is goddess of both wisdom and war. How do you hold those together?

## What's ancient and what's modern

- **Ancient:** the date as Athena's birthday, the procession, the peplos, the hecatomb, the contests and prize amphorae, the all-night festival.
- **Modern:** small household peploi, bloodless offerings, acts of civic service as offerings.`,
    },
    {
      id: 'hellenic-lore-eleusinia',
      title: 'The Eleusinian Mysteries',
      summary: 'The Greater Mysteries of Demeter and Persephone at Eleusis, the most revered initiation of the ancient world: what we know, what remains secret, and how to honour them respectfully today.',
      minutes: 20,
      body: `## The days

The Greater Mysteries ran from 15 to 23 Boedromion, in early autumn. The app's calendar shows this year's dates.

## Whom they honour

Demeter, goddess of grain, and her daughter Persephone, also called Kore, "the Maiden". The Homeric Hymn to Demeter tells the founding story. Hades, lord of the dead, seized Persephone and carried her to the underworld. Demeter, grieving, searched the earth with torches, then came to Eleusis disguised as an old woman. Hekate and Helios helped her learn what had happened. In her grief she let nothing grow, until Zeus sent Hermes to bring Persephone back. But Persephone had eaten pomegranate seeds in the underworld, and so she must spend part of each year below. When she was restored, Demeter taught her rites to the people of Eleusis.

The Hymn says: "Happy is he among men upon earth who has seen these mysteries; but he who is uninitiate and who has no part in them, never has lot of like good things once he is dead, down in the darkness and gloom."

## What we know

For nearly two thousand years, people came from across the Greek and Roman world to be initiated at Eleusis, near Athens. Men and women, free and enslaved, could take part if they spoke Greek and were free of blood-guilt. Initiation probably came in stages, with the Lesser Mysteries in spring as a first step.

The outline of the Greater Mysteries is known:

1. **Day one:** the initiates gathered in Athens.
2. **Day two:** "To the sea, initiates!" Each bathed in the sea with a piglet, which was then sacrificed.
3. **Days three and four:** sacrifices, and a day for latecomers.
4. **Day five:** a great procession walked the Sacred Way, about twenty kilometres, to Eleusis, crying out to Iakchos, a god who led them.
5. **The following days:** the initiates fasted, drank the kykeon (a drink of barley and mint), and entered the great hall called the Telesterion at night to see and hear what was shown.
6. **Day nine:** they returned home.

The Mysteries ended in the late 4th century CE, under imperial bans on traditional worship, and Eleusis was sacked in 396.

## What we don't know

The secret was kept. We do not know what was shown inside the Telesterion. A Christian writer later claimed it was an ear of grain reaped in silence; others have suggested a drama of Persephone's return. Theories of a psychedelic kykeon are speculation. Any modern "Eleusinian" rite is a respectful reimagining, not the real thing. No living person holds the ancient Mysteries.

## Their meaning today

The Mysteries speak of loss and return, of grief and its turning, of the seed that goes into the dark and comes back. Modern practitioners honour them as a time to sit with what has been lost, to give thanks for what returns, and to honour Demeter and Persephone, without claiming to perform the secret rites.

## Keeping them as a beginner

You do not need to do something every one of the nine days. A simple pattern:

1. **Read the Hymn.** Over the first few evenings, read the Homeric Hymn to Demeter slowly, a section a night.
2. **Wash.** On the second day, take a cleansing bath or shower with intention, remembering the sea bathing.
3. **Walk.** On or near the fifth day, walk a meaningful route in silence for as long as you comfortably can.
4. **Fast lightly**, if your health allows, during one day, and break the fast at nightfall.
5. **Make a simple kykeon**: barley water flavoured with fresh mint, or barley porridge. Never use pennyroyal, the ancient herb: it is toxic.
6. **Hold a night rite.** After dark, make khernips, light Hestia's flame, then a candle for Demeter searching. Read the Hymn's account of Persephone's return. Hold an ear of wheat or a handful of grain in silence. Name what you have lost and what you hope will return. Pour a libation of barley water to Demeter and Persephone. End with Hestia.
7. **Keep the grain** to sow in spring.

## Keeping them with a coven

Covens often keep one night of the Mysteries together: a procession, a reading or enactment of the Hymn, a shared kykeon, and a long silence. Be clear with members that this is a modern rite in honour of the Mysteries, not the Mysteries themselves.

> **Your coven:** Some covens hold their own initiations near the Mysteries; some keep the Mysteries as a time of reflection only. Ask your mentor.

> **Safety:** Do not use pennyroyal in any form; it can cause serious liver damage and miscarriage. Fast only if you are well, and never if you are pregnant, diabetic, have a history of eating disorders or are advised against it. Grief can rise strongly at this festival; be gentle with yourself and talk to your mentor if it becomes heavy.

## Reflect

- What have you lost this year? What has returned?
- What do you think the Hymn means by the "good things" the initiates receive?
- How does it feel to honour something whose secret is lost?

## What's ancient and what's modern

- **Ancient:** the founding Hymn, the calendar of days, the sea bathing, the procession to Eleusis, the fasting and kykeon, and the night in the Telesterion.
- **Modern:** household rites in honour of the Mysteries, safe kykeon recipes, and every theory about the secret.`,
    },
    {
      id: 'hellenic-lore-pyanepsia',
      title: 'Pyanepsia',
      summary: 'Apollo\'s autumn festival of the bean pot and the eiresione, a branch hung with wool and fruits and carried home to bless the house for a year, and how to make and hang your own.',
      minutes: 15,
      body: `## The day

The Pyanepsia falls on 7 Pyanepsion, in autumn. The seventh of every month was Apollo's day, and the month took its name from this festival. The app's calendar shows this year's date.

## Whom it honours

Apollo, god of light, healing, music and order, at the harvest. Some ancient writers link the festival with Helios and the Horai, the Seasons. The day also remembers Theseus and the young Athenians he brought home safely from Crete after killing the Minotaur.

## What we know

The writer Plutarch tells the festival's story in his Life of Theseus. When Theseus returned from Crete, he paid his vows to Apollo on the seventh of Pyanepsion. The young people who came back with him gathered the last of their provisions, "boiled it in one common pot, feasted upon it, and ate it all up together." So, Plutarch says, Athenians boiled a pot of beans and pulses on this day. The festival's name means something like "bean-boiling".

The other great custom was the eiresione (ay-reh-see-OH-neh): "a bough of olive wreathed with wool, such as Theseus used at the time of his supplication, and laden with all sorts of fruit-offerings". Plutarch preserves the song sung as it was carried:

"Eiresione for us brings figs and bread of the richest,
Brings us honey in pots and oil to rub off from the body,
Strong wine too in a beaker, that one may go to bed mellow."

Boys carried these branches from house to house, singing, and each family hung one over its door, where it stayed until it was replaced the next year.

## What we don't know

Ancient writers explained the festival in different ways; some connected the eiresione with other stories. We know little about the public sacrifices.

## Its meaning today

The Pyanepsia is a homely, joyful festival: a shared pot of beans, a branch of blessing by the door, thanks to Apollo for health and safe return. It is one of the easiest festivals to keep at home, and one of the most satisfying.

## Keeping it as a beginner

1. **Make your eiresione** a day or two before. Take a branch, olive if you can find it, or any sturdy branch with leaves. Wind white and red wool or yarn around it. Tie on dried figs, a small bread roll or biscuit, nuts, a little fruit, and if you like a tiny pot or wrapped portion of honey.
2. **Put a pot of mixed beans** and pulses to simmer: any combination of lentils, chickpeas, beans and split peas, with onion, oil and herbs.
3. **Begin with khernips and Hestia.**
4. **Pour to Apollo**: "Apollo, healer, bringer of light, as you brought Theseus and the young ones home, bring us safely through this year."
5. **Carry the eiresione** to your front door, singing or speaking the song.
6. **Hang it** over or beside the door, inside or out, asking Apollo to keep the house well fed and healthy for the year.
7. **Eat the beans** together, leaving none, as the young Athenians did.
8. **End with Hestia.**

Next year, take down the old eiresione before you hang the new one, and compost it or burn it safely.

## Words for the day

A prayer to speak as you hang the eiresione:

"Apollo, son of Leto, healer and bringer of light, who received Theseus's vows when he came home safe from Crete: as the Athenians hung this branch at their doors, I hang it at mine. As I have honoured you with bay and song, keep this house fed and healthy through the year, and bring all who belong here safely home."

Then sing or speak the eiresione song.

## Common difficulties

- **"I can't find an olive branch."** Any branch with leaves will do: bay, laurel, rosemary, a fallen bough from a park tree. Some people use a bundle of herbs.
- **"I don't like beans."** Any shared pot of mixed grains or pulses fits the story: a soup, a stew, a risotto. The point is one pot, shared, and finished.
- **"Fruit on the branch goes mouldy."** Use dried fruit, nuts and wrapped biscuits, and swap anything that spoils. Some people tie on small wooden or paper fruits.

## Keeping it with a coven

A coven might make eiresionai together, each member taking one home, and share a bean pot with bread and wine. Some covens walk from house to house with a branch, as the boys of Athens did, blessing members' homes.

> **Your coven:** Ask your mentor whether your coven makes its eiresionai together, and whether anyone would welcome a visit to bless their door.

> **Safety:** Dried kidney beans must be soaked and boiled hard for at least ten minutes to destroy a natural toxin; never slow-cook them from dry. Fruit on an outdoor branch will attract wasps and birds, and may rot; hang the branch indoors if that is a problem, and replace fruit that spoils.

## Reflect

- Who has come home safely to you this year?
- What blessings would you want hung over your door?
- Apollo is both healer and bringer of plague in myth. What does it mean to pray to him for health?

## What's ancient and what's modern

- **Ancient:** the date, the bean pot, the eiresione and its song, the link with Theseus and Apollo.
- **Modern:** the choice of branch and fruits, keeping the branch indoors, bean-pot recipes.`,
    },
    {
      id: 'hellenic-lore-thesmophoria',
      title: 'Thesmophoria',
      summary: 'The women\'s festival of Demeter Thesmophoros and Persephone at the autumn sowing, with its fasting, joking and feast, and how to keep it today with care for inclusion.',
      minutes: 15,
      body: `## The days

The Thesmophoria ran from 11 to 13 Pyanepsion, in autumn, at the time of sowing. The app's calendar shows this year's dates.

## Whom it honours

Demeter Thesmophoros, a title usually understood as "bringer of law" or "of the things laid down", and her daughter Persephone. It also honoured the women of the city, who kept the festival alone, and the seed about to be sown.

## What we know

The Thesmophoria was the most widespread festival of Demeter in the Greek world, kept in many cities. In Athens it was one of the few times citizen women met as a body on their own, away from men, and it lasted three days.

1. **The Anodos, "the going up".** The women climbed to the Thesmophorion, Demeter's sanctuary, and set up camp.
2. **The Nesteia, "the fast".** They fasted, sitting on the ground on mats of plant stalks in memory of Demeter's grief. They traded rude jokes (aischrologia), recalling Iambe, the woman whose jokes made the grieving goddess laugh in the Hymn to Demeter.
3. **The Kalligeneia, "fair birth".** A feast, perhaps with prayers for children.

An ancient commentary on the writer Lucian adds a famous detail: piglets had been thrown into underground chambers (megara) earlier in the year, and their remains were brought up by women called "bailers", placed on the altars, and mixed with seed for a good harvest.

Men were strictly excluded. Aristophanes' comedy Women at the Thesmophoria (411 BCE) imagines a man sneaking in disguised as a woman, and getting caught.

## What we don't know

The secret rites themselves are mostly unknown. The piglet account comes from a late commentary, and its timing is debated. We do not know exactly what prayers were said or what the Kalligeneia involved.

## Its meaning today

The Thesmophoria is a festival of women's community, of the bond between mother and daughter, of grief that turns to laughter, and of seed going into the earth. Modern groups differ on whether to keep it women-only. Many keep it for women, including all trans women, and anyone who feels the festival is theirs; some open it to everyone; some hold separate gatherings. What matters is that no one is excluded in a hurtful or careless way.

## Keeping it as a beginner

1. **Gather** seed, bulbs or a pot of compost, a candle, khernips, and bread or cake.
2. **Day one:** prepare a space, as the women set up camp. Clean your shrine and make a sitting place on the floor with a mat or cushions.
3. **Day two:** if your health allows, fast for part of the day. Sit on the ground for a while in silence, remembering Demeter's grief for Persephone. Then share a joke or funny story, aloud or with friends, as Iambe did.
4. **Day three:** purify with khernips and light Hestia's flame, then a candle for Demeter. Bless the seed in Demeter's name and plant it. Break bread for the Kalligeneia, the fair birth, and pour a libation to Demeter and Persephone. End with Hestia.

If three days is too much, do day three alone with a short silence and a joke before the planting.

## Words for the day

A prayer to speak as you bless the seed:

"Demeter Thesmophoros, mother of the grain, giver of the laws by which fields are sown and families kept; and Persephone, her daughter, who goes down and returns: as the women of Athens sat on the ground in your grief and laughed with Iambe, I have sat and remembered and laughed. Take this seed into the dark, and bring it back to the light."

## Common difficulties

- **"I'm not a woman, or not sure I'm welcome."** Ask your coven. If its gathering is for women only, you can keep the festival privately as a time to honour the women in your life and the bond of parent and child. If you are a woman, you belong.
- **"I can't fast."** Then don't. Sit on the ground in silence for ten minutes instead, remembering Demeter's grief.
- **"I have no garden."** Plant bulbs or seeds in a pot on a windowsill, or give a packet of seeds to someone who gardens.

## Keeping it with a coven

Covens often hold a women's gathering, or an open one, with food, laughter, frank talk and a sowing. Some combine it with a reflection on the bodies, labour and lives of women: mothers, midwives, carers.

> **Your coven:** Ask your mentor how your coven keeps the Thesmophoria: who it is for, and whether there are separate gatherings. If you are unsure whether you are welcome, ask; a good coven will answer kindly.

> **Safety:** Fast only if you are well, and never if you are pregnant, diabetic, have a history of eating disorders or are advised against it. Ribald joking should stay within everyone's comfort; consent applies to humour too, and anyone can ask for the jokes to stop.

## Reflect

- What does community among women, or among any group you belong to, give you?
- When has laughter helped you through grief?
- What are you sowing this autumn, in the earth or in your life?

## What's ancient and what's modern

- **Ancient:** the three days, the fasting, the sitting on the ground, the joking, the exclusion of men, the feast.
- **Modern:** inclusive gatherings, sowing seed at home, and choices about who the festival is for.`,
    },
    {
      id: 'hellenic-lore-haloa',
      title: 'Haloa',
      summary: 'A midwinter festival of Demeter, Kore and Dionysus at Eleusis, kept by women with feasting, joking and sexual symbols to quicken the young crops, and how to keep it today with joy and care.',
      minutes: 15,
      body: `## The day

The Haloa falls on 26 Poseideon, in midwinter. The app's calendar shows this year's date.

## Whom it honours

Demeter and Kore, for the young green grain sprouting in the winter fields, and Dionysus, for the vines being pruned. Its name comes from the halos, the threshing floor. It was a festival of fertility and growth in the dead of winter.

## What we know

The Haloa was held at Eleusis. An ancient commentary on the writer Lucian describes it: the women alone went in, joking and mocking one another, and carrying models of genitals. Wine and rich foods were set out, but not those forbidden at the Mysteries, such as pomegranates, eggs, apples and certain fish. The city's magistrates laid the tables and then left the women to themselves. There were cakes shaped like sexual organs.

An Athenian court speech, Against Neaira, tells of a priest who was condemned for making a sacrifice at the Haloa on behalf of a courtesan, on the altar in the courtyard at Eleusis, when on that day sacrifices were the priestess's business. That small detail shows women held religious authority at this festival.

The mixture of Demeter and Dionysus, of laughter and feasting, shows how much fertility was a matter of joy as well as solemnity.

## What we don't know

The commentary is late and brief. We do not know how the festival related to threshing, since grain is not threshed in winter, or exactly what rites the women performed. Some scholars think men had a separate part of the festival.

## Its meaning today

The Haloa is a festival of pleasure and growth in the darkest time of year: a reminder that the young crop is already green under the frost, and that bodily joy is sacred. Modern practitioners keep it with feasting, laughter, and honour to the body without shame.

## Preparing ahead

A week before, decide who you will feast with, or plan a good solitary evening. Shop for bread, cheese, honey, wine or juice, and anything you love to eat. If you want to bake playful cakes, try the recipe once in advance. Look at what is growing: a winter field, a pot of bulbs, a pruned vine or fruit tree. If you have a vine or fruit tree, the Haloa is a traditional time to prune it, so check what it needs. Read the Haloa page in the app and this lesson again the evening before, and tell anyone joining you what the evening will involve.

## Keeping it as a beginner

1. **Lay a table** with bread, cakes, cheese, wine or juice, and anything that delights you. Leave pomegranates and eggs off the table for the day, as the Athenians did.
2. **Bake**, if you like, playful cakes or biscuits in suggestive shapes. Laughter is the point.
3. **Begin with khernips and Hestia.**
4. **Pour libations** to Demeter and Kore, for the green shoots, and to Dionysus, for the vines.
5. **Feast**, jest and tell stories, alone with a good book and good food or with friends.
6. **Tend growing things**: prune a vine, fruit tree or houseplant, or look at the young green in a winter field.
7. **Name one thing** you want to grow in the coming spring.
8. **End with Hestia.**

## Words for the day

A prayer for the Haloa table:

"Demeter and Kore, whose young wheat is already green under the frost; Dionysus, lord of the pruned vine: in the darkest weeks the women of Eleusis feasted and laughed for you. I have laid this table and I will laugh at it. Quicken what is growing in the dark, in the fields and in me, and bring it up strong in spring."

## Common difficulties

- **"The sexual symbols make me uncomfortable."** You do not have to use them. The festival's laughter, rich food and honour to growth are enough. Discomfort is a reasonable boundary, not prudishness.
- **"I'm alone at midwinter."** A good meal, a funny book or film, and a libation make a full Haloa. Joy alone is still joy.
- **"Why leave pomegranates out?"** The Athenians kept certain foods away from the Haloa, as from the Mysteries. Leaving them out is a small way of following an ancient custom whose reason we do not fully know.

## Keeping it with a coven

Many covens hold a Haloa feast, often for women or with a women's part. The adult themes of the festival mean it is wise to say clearly beforehand what will be involved, so people can choose whether to come. A coven may keep a gentler, all-ages version focused on feasting and growth, and a separate adults' gathering.

> **Your coven:** Ask your mentor how your coven keeps the Haloa, who it is for, and what it involves. You can always choose not to attend any part of a rite.

> **Safety:** Sexual symbols and joking are part of the ancient festival, but consent comes first: everyone should know beforehand what to expect, no one should be pressured to take part, and nothing sexual should involve anyone under age or anyone who has not agreed. Keep alcohol optional.

## Reflect

- What is growing in you now, unseen, in the dark of the year?
- How do you feel about joy, pleasure and the body as sacred?
- Why might the Greeks have kept a festival of laughter in midwinter?

## What's ancient and what's modern

- **Ancient:** the date, the place at Eleusis, the women's feast, the forbidden foods, the joking and symbols, the priestess's authority.
- **Modern:** household feasts, choices about who the festival is for, and clear consent practices around its themes.`,
    },
    {
      id: 'hellenic-lore-lenaia',
      title: 'Lenaia',
      summary: 'The winter festival of Dionysus Lenaios, with contests in comedy and tragedy, where many of Aristophanes\' plays were first performed, and how to keep it with theatre, masks and laughter.',
      minutes: 15,
      body: `## The day

The Lenaia falls on 12 Gamelion, in winter. The app's calendar shows this year's date.

## Whom it honours

Dionysus Lenaios. His title may come from the lenos, the wine-press, or from the lenai, a name for his ecstatic women followers, also called maenads. Dionysus is god of wine, theatre, masks, ecstasy and release, the god who frees people from care and from themselves for a while. In midwinter, the new wine was settling in its jars.

## What we know

The Lenaia was held in Gamelion (January to February), when sailing was over and few foreigners were in Athens. It was a more local festival than the great City Dionysia in spring. There was a procession and a sacrifice, and from about 440 BCE official contests in comedy, and later tragedy too.

Many of Aristophanes' comedies were first performed at the Lenaia: Acharnians, Knights and Frogs among them. In Acharnians, a character jokes that "we are by ourselves now, at the Lenaia", with no foreigners present, so he can say what he likes about the city. Political satire was the Lenaia's speciality.

A group of Athenian vases shows women ladling wine before a masked pillar-image of Dionysus. Some scholars connect these with the Lenaia, though this is debated.

## What we don't know

The religious rites are less clear than the dramatic contests. The meaning of "Lenaios", wine-press or maenads, is debated, and so is the link with the vases.

## Its meaning today

The Lenaia is a winter festival of comedy, masks and the freedom to laugh at power. Modern practitioners keep it with theatre, play and a cup for Dionysus, in the cold heart of the year.

## Preparing ahead

A week or two before, choose your comedy and find a copy or recording. If you plan a reading with friends, send them the parts in advance so no one is caught out. Make or buy a simple mask: a paper plate with eye holes, decorated, is enough. Find a sprig of ivy, or print a picture of Dionysus or of ancient theatre masks for your shrine. Choose your libation: a new bottle of wine or grape juice saved for the day. If you know nothing about the Lenaia's plays, read a short summary of Aristophanes' Frogs, in which Dionysus goes down to the underworld in search of a great poet; it sets the mood perfectly.

## Keeping it as a beginner

1. **Choose a comedy** to read or watch: an ancient one such as Aristophanes' Frogs (in which Dionysus himself goes down to the underworld to bring back a good poet) or any modern comedy you love.
2. **Make or find a mask**, or set an ivy sprig or image of Dionysus on your shrine.
3. **Begin with khernips and Hestia.**
4. **Pour** the first of the wine or grape juice to Dionysus: "Dionysus Lenaios, god of the wine-press and the mask, loosen our cares tonight and give us joy."
5. **Watch or read** the comedy with your full attention, as an offering. Or perform a scene with friends.
6. **Laugh at power**: political satire was the Lenaia's gift.
7. **End with Hestia**, a toast and a song.

## Words for the day

A prayer to pour the first cup:

"Dionysus Lenaios, lord of the wine-press, god of the mask and the laughing chorus, who loosens what is bound: in the cold of the year the Athenians gathered to laugh at their leaders and themselves. I pour you the first of this cup, and I will give you my full attention and my laughter tonight. Lift our cares, and let us see ourselves clearly through the mask."

## Common difficulties

- **"I don't find ancient comedy funny."** Much of Aristophanes is topical humour from 2,400 years ago. A modern translation with notes helps, or choose a modern comedy you love. The offering is laughter, not the text.
- **"I don't drink."** Grape juice is a perfectly good libation and drink. Dionysus is the god of release, not of alcohol alone; theatre, music and dance honour him fully.
- **"Satire feels mean."** Satire at the Lenaia aimed at the powerful. Laugh upward, at those with power, not downward at those without it.

## Keeping it with a coven

A coven Lenaia might be a play reading, a comedy night, a mask-making evening, or a winter party with music. Members can perform short scenes or satirical pieces. Online, members can watch the same comedy together in the app's gathering, pausing to pour.

> **Your coven:** Ask your mentor whether your coven holds a play reading or performance for the Lenaia, and whether you'd like a part.

> **Safety:** Dionysus is honoured by many people in recovery from alcohol or drug dependence, with juice, theatre and dance. Alcohol is never required, and no one should be pressed to drink. If you drink, drink moderately; the Greeks themselves mixed their wine with water and thought drunkenness a failure of sophrosyne.

## Reflect

- What makes you laugh, and why might laughter be holy?
- What would you satirise, given a stage and a safe audience?
- Dionysus is a god of masks. When do you wear one, and when do you take it off?

## What's ancient and what's modern

- **Ancient:** the date, the procession and sacrifice, the comedy and tragedy contests, the plays of Aristophanes.
- **Modern:** household play readings, sober honouring of Dionysus, online watch parties.`,
    },
    {
      id: 'hellenic-lore-anthesteria',
      title: 'Anthesteria',
      summary: 'Dionysus\'s three-day festival of flowers and the new wine, when the jars were opened, children were garlanded, and the dead walked among the living before being sent away.',
      minutes: 20,
      body: `## The days

The Anthesteria ran from 11 to 13 Anthesterion, in early spring, when the first flowers appear. Its name comes from anthos, flower. The app's calendar shows this year's dates.

## Whom it honours

Dionysus, whose new wine was opened; Hermes Chthonios, Hermes of the underworld, guide of souls; and the dead of the city, who were believed to return and wander the streets for a day.

## What we know

The Anthesteria was one of the oldest festivals of Athens, and each of its three days had its own name and character.

1. **Pithoigia, "jar-opening".** The new wine of the autumn harvest was opened at the sanctuary of Dionysus in the Marshes, and offered to the god.
2. **Choes, "jugs".** Everyone, including slaves and children of about three, drank from their own jug in a drinking contest held in silence, each at a separate table. A myth explained this: Orestes, polluted after killing his mother, once came to Athens, and the king served him and all the guests separately and in silence, so no one shared his pollution. Small children received tiny jugs and garlands of flowers; many of these little choes survive, painted with children playing. On this day the wife of the official called the archon basileus was ceremonially married to Dionysus.
3. **Chytroi, "pots".** A pot of mixed grains was cooked for Hermes Chthonios and the dead, not for the gods above.

The Choes was also a day of pollution, because the dead were abroad. People chewed buckthorn leaves in the morning and smeared their doors with pitch to keep spirits away. At the end of the festival the dead were sent off with words recorded by ancient lexicographers: "Out of doors, Keres! It is no longer Anthesteria."

## What we don't know

Whether the Keres sent away were ghosts or another kind of spirit, and whether the phrase was originally "Kares" (a people), is debated. The details of the sacred marriage were secret.

## Its meaning today

The Anthesteria joins spring, new wine, childhood and the dead. It is a festival of opening and of sending home: of welcoming what is new, remembering who has gone, and closing the door gently behind them. It is one of the best festivals for remembering your own dead.

## Keeping it as a beginner

1. **Day one, opening.** Open a new bottle or jar of something: wine, juice, preserves, honey. Make khernips, light Hestia's flame, and pour the first of it to Dionysus. Share it.
2. **Day two, jugs and flowers.** At dusk, pour yourself a cup and drink it in silence at your own place, alone even if others are present. Crown yourself, or any children, with spring flowers. Mark your door against wandering spirits with a dab of oil or a sprig of hawthorn.
3. **Day three, pots.** Cook a pot of mixed grains or pulses: barley, lentils, wheat, rice. Set a portion outside or at the threshold for Hermes Chthonios and the dead. Do not eat that portion. Speak the names of your dead.
4. **Sending home.** At nightfall, open the door and say: "Out of doors, Keres! It is no longer Anthesteria." Close the door, wash your hands, and light a fresh flame for Hestia.

## Words for the day

Words for the third day, as you set out the pot for the dead:

"Hermes Chthonios, guide of souls, and all my dead who walk tonight: this pot is for you, of every grain, and none of the living will eat from it. I speak your names. Be at peace, take what is given, and when the night ends go home gently."

Then, at nightfall: "Out of doors, Keres! It is no longer Anthesteria."

## Common difficulties

- **"Three days is too long."** Keep the third day alone: the pot for the dead and the sending words. That is the festival's heart.
- **"I'm afraid of the dead walking."** The Athenians took simple precautions and went about their festival. Mark the door, keep Hestia's flame, and remember that the festival ends by sending the dead home. If you feel frightened, stop, wash, ground and talk to your mentor.
- **"I have no dead I want to remember."** Remember the dead of your town, your craft, or all who have died unremembered.

## Keeping it with a coven

Many covens make the Anthesteria their great festival of remembrance: members bring the names of their dead, share a silent cup, cook a grain pot, and close with the sending words together. Online, each member does the same at their own threshold.

> **Your coven:** Ask your mentor whether your coven keeps a remembrance of members' dead at the Anthesteria, and how to add your names.

> **Safety:** Children may share in flowers and tiny cups of juice, as Athenian children did, never wine. The grain portion for the dead should be safe for any animal that finds it. Remembering the dead can bring grief; take care of yourself and talk to your mentor if you need to.

## Reflect

- What is new in your life this spring?
- Who are the dead you want to remember, and what would you say to them?
- How does it feel to send the dead home, rather than keep them close?

## What's ancient and what's modern

- **Ancient:** the three days and their names, the opening of the wine, the silent drinking, the children's jugs and garlands, the sacred marriage, the pitch and buckthorn, the pot for Hermes and the dead, the sending words.
- **Modern:** household versions, juice for children, hawthorn or oil in place of pitch, and the festival as a time to remember personal dead.`,
    },
    {
      id: 'hellenic-lore-dionysia',
      title: 'City Dionysia',
      summary: 'Athens\' great spring festival of Dionysus, where the tragedies and comedies we still read were first performed, and how to keep it as a festival of theatre, art and being moved.',
      minutes: 15,
      body: `## The days

The City Dionysia, also called the Great Dionysia, began around 10 Elaphebolion, in spring, and lasted several days. The app's calendar shows this year's dates.

## Whom it honours

Dionysus Eleuthereus, "of Eleutherai", whose wooden image was said to have been brought to Athens from the border town of that name. He is god of wine, ecstasy, masks and theatre, the god who frees and transforms. Eleuthereus also sounds like eleutheros, free.

## What we know

The City Dionysia was held in spring, when the sea was open and visitors filled Athens. It was a showcase for the city as much as a festival of the god.

- **The arrival.** Before the festival, the image of Dionysus was taken out of the city and brought back in a torchlight procession, re-enacting his first arrival.
- **The procession.** A great procession followed, with bulls for sacrifice, phallic poles carried in the god's honour, and citizens and foreigners in fine clothes.
- **The contests.** First came dithyrambs, hymns to Dionysus sung and danced by choruses of men and boys. Then came the drama: three days of tragedy, each poet presenting three tragedies and a satyr play, and from 486 BCE comedies too. Thespis is said to have won the first tragic contest around 534 BCE. Aeschylus, Sophocles and Euripides all competed here; Sophocles won some eighteen times.
- **Civic display.** Before the plays, tribute from Athens's allies was displayed in the theatre, and the sons of men killed in war, raised at public expense, were paraded in armour.

Many of the plays we still read and perform, such as Oedipus the King, the Oresteia and the Bacchae, were first seen here.

## What we don't know

The exact sequence of days changed over the centuries. How tragedy grew out of Dionysian ritual, if it did, is one of the great debates of classical scholarship.

## Its meaning today

The City Dionysia reminds us that theatre and art can be worship: that being moved to tears or laughter in the presence of the god is a religious act. Modern practitioners keep it by watching, reading, writing and performing, with libations to Dionysus.

## Preparing ahead

Plan which days you will keep: the whole festival or a single evening. Choose your play a week ahead and find a translation or recording; many Greek tragedies have been filmed or recorded for radio. If you want to make something of your own, start a few days before so it is ready to offer. Prepare an image of Dionysus, an ivy wreath or a print of a theatre mask to carry in. If you will read with others, assign parts. Read the City Dionysia page in the app and this lesson the night before, and set your libation aside so it is waiting for you.

## Keeping it as a beginner

1. **Choose a play.** A Greek tragedy is ideal: Euripides' Bacchae is about Dionysus himself; Sophocles' Antigone is short and powerful. Or choose any play, film or performance that moves you.
2. **Bring the god in.** On the first day, carry an image of Dionysus, or an ivy wreath, in a short procession into your home or to where you will watch, remembering his arrival.
3. **Begin with khernips and Hestia.**
4. **Pour** a libation of wine or grape juice to Dionysus Eleuthereus.
5. **Watch, read or perform** the play, giving it your full attention, as an offering.
6. **Let yourself be moved.** Tragedy was worship too.
7. **Afterwards**, talk with others about what moved you, or write about it, and pour a last libation in thanks.
8. **Make something** of your own over the festival days, if you like: a scene, a song, a poem, a dance.

## Words for the day

A prayer as you bring the god's image in:

"Dionysus Eleuthereus, who came to Athens from Eleutherai and was welcomed with torches; god of the mask, the chorus and the stage, who frees: as the Athenians brought you into their theatre, I bring you into my home. I will watch and listen with my whole heart. Let me be moved, and let me be changed."

## Common difficulties

- **"Greek tragedy is hard to read."** Watch a recorded performance instead, or read a modern adaptation. Read aloud with friends, each taking parts; it comes alive.
- **"I don't have time for several days."** Choose one evening: bring the god in, pour, watch a play, talk about it.
- **"I'm not creative."** You do not need to make anything. Giving full attention to someone else's art is the oldest offering of this festival: the audience was part of the rite.

## Keeping it with a coven

A coven Dionysia might include a procession with the god's image, a reading or performance of a Greek play, a dithyramb sung together, and a discussion afterwards. Some covens hold an arts evening where members offer their own work.

> **Your coven:** Ask your mentor whether your coven will read or perform a play this year, and whether you'd like a part, or to offer something of your own.

> **Safety:** Tragedies deal with violence, grief and loss. If a play affects you strongly, take a break, ground yourself, and talk about it afterwards. Keep alcohol optional.

## Reflect

- When has a play, a film or a song changed how you saw something?
- Why might the Athenians have honoured a god with tragedy?
- What would you make as an offering to Dionysus?

## What's ancient and what's modern

- **Ancient:** the god's arrival, the procession, the dithyrambs and dramatic contests, the civic display, the great plays.
- **Modern:** household play readings, film as offering, arts evenings, and the idea of any moving art as worship of Dionysus.`,
    },
    {
      id: 'hellenic-lore-mounichia',
      title: 'Mounichia',
      summary: 'The festival of Artemis Mounichia at the spring full moon, with round cakes ringed by little torches, and how to keep it with a shining cake and honour to girls, sailors and wild things.',
      minutes: 15,
      body: `## The day

The Mounichia falls on 16 Mounichion, near the full moon of spring. The app's calendar shows this year's date.

## Whom it honours

Artemis Mounichia, worshipped at her sanctuary on the hill of Mounichia above the harbour of Piraeus, the port of Athens. Artemis was goddess of the wild, of hunting, of girls growing toward womanhood and of childbirth. At Mounichia she protected sailors and the harbour too. In later times the festival also gave thanks for the great naval victory over the Persians at Salamis in 480 BCE.

## What we know

Worshippers brought Artemis amphiphontes (am-fee-FON-tez), "shining all round": cakes set with small torches or lights around the edge, glowing like the full moon. The goat was Artemis's sacrifice here, and later the ephebes, young men in military training, held boat races in her honour.

Plutarch says the Athenians dedicated the sixteenth of Mounichion to Artemis because on that day the goddess shone with a full moon on the Greeks as they won at Salamis.

Like her more famous sanctuary at Brauron, Artemis's sanctuary at Mounichia was a place where young girls served the goddess, sometimes called "little bears". A story was told there of a bear killed in the sanctuary, and of a girl to be sacrificed to atone for it, replaced at the last moment by a goat dressed as a girl.

## What we don't know

The Salamis link may be a later explanation of an older festival. The bear stories survive in confusing versions, and we do not know exactly what the girls' service involved.

## Its meaning today

The Mounichia is a festival of light in the night, of the full moon, of protection for the young and for all who travel by water. Modern practitioners keep it with a shining cake and honour to girls and young women, wildlife and the sea.

## Preparing ahead

Check the moon in the app's calendar and the weather forecast: if you hope to go outside, choose a sheltered spot in advance. Buy small candles and a fireproof plate or tray. If you bake, a simple round honey cake or cheesecake suits Artemis well. Think about the young people you will pray for, and choose a cause to support if you plan to give. Find an image of Artemis, or a symbol such as a bow, a deer or a crescent, for your shrine. Read the Mounichia page in the app and this lesson again the day before.

## Keeping it as a beginner

1. **Bake or buy a round cake.** Set small candles, such as birthday candles, around its rim. Put it on a fireproof plate.
2. **Begin with khernips and Hestia.**
3. **Light the candles** and carry the cake carefully to your shrine, or outside under the moon if it is calm and safe.
4. **Pray to Artemis Mounichia**: "Artemis, shining one, lady of the harbour and the hill, protect the young as they grow, and all who travel by water."
5. **Let the candles burn** for a minute, then put them out.
6. **Share the cake**, and set one piece aside for Artemis, to be given to the earth outdoors later.
7. **End with Hestia.**
8. **Honour the young**: celebrate a milestone of a girl or young woman in your life, or give to a charity that supports girls' education or wildlife.

If the sky is clear, go out and greet the full moon.

## Words for the day

A prayer as you light the cake:

"Artemis Mounichia, shining one, who stood on the hill above the harbour and shone full on the Greeks at Salamis; protector of girls as they grow and of all who go by water: I bring you this cake that shines all round, as the Athenians did. Keep the young safe as they grow, and bring every traveller home across the water."

## Common difficulties

- **"Cloudy sky, no moon."** The moon is there behind the clouds; the calendar says so. Keep the rite indoors with the shining cake as your moon.
- **"I have no young people in my life."** Give to a cause that supports girls' education or safety, or that protects wildlife or the sea. Artemis cares for all young and wild things.
- **"A cake with candles feels like a birthday party."** That is not far off: the amphiphontes was a bright, festive offering. Enjoy it.

## Keeping it with a coven

A coven Mounichia might gather under the full moon with a shining cake for each member or one large one, a hymn to Artemis, and a collection for a cause that protects girls, wildlife or the sea. Covens near water sometimes hold the rite on a shore.

> **Your coven:** Ask your mentor whether your coven gathers under the moon for the Mounichia, and what cause, if any, it supports.

> **Safety:** Lit candles on a cake are a real fire risk: use a fireproof plate, keep hair and sleeves back, never carry a lit cake near curtains or children, and do not leave it burning unattended. Outdoors, use a lantern or keep the cake sheltered from wind. If you visit the shore at night, go with others and watch the tide.

## Reflect

- Who are the young people you would ask Artemis to protect?
- What does the full moon mean to you?
- The bear story speaks of a debt paid and a life spared. What do you make of it?

## What's ancient and what's modern

- **Ancient:** the date at the full moon, the amphiphontes, the goat, the ephebes' boat races, the girls' service, the Salamis story.
- **Modern:** birthday-candle cakes, charitable giving for girls and wildlife, shoreline rites.`,
    },
    {
      id: 'hellenic-lore-thargelia',
      title: 'Thargelia',
      summary: 'The festival of Apollo and Artemis on their birthdays, joining the purification of the city with the first fruits of the harvest, and how to keep it with cleansing and a first loaf.',
      minutes: 15,
      body: `## The days

The Thargelia ran over 6 and 7 Thargelion, in late spring. In Athenian tradition, Artemis was born on the sixth and Apollo on the seventh. The app's calendar shows this year's dates.

## Whom it honours

Apollo, as purifier, healer and god of the first ripened grain, and his twin sister Artemis. Their mother Leto, who wandered the earth looking for a place to give birth until the island of Delos received her, is often remembered too.

## What we know

**The first day: cleansing.** On the sixth, Athens was purified. Two people, called pharmakoi, were led out of the city, wearing strings of figs, and driven out as scapegoats, carrying the city's pollution away with them. Ancient sources disagree about how harshly this was done. In classical Athens it was probably expulsion, not death; claims that pharmakoi were killed rely on doubtful sources.

**The second day: first fruits.** On the seventh came Apollo's feast. The thargelos was carried in his honour: a pot of the first grain, cooked, or a first loaf. Choruses of men and boys competed in song, and the winners dedicated tripods. The philosophers Socrates and Plato were said to have been born at the Thargelia, and Plato's followers kept his birthday on the seventh.

The Thargelia joined cleansing with harvest: before the first fruits could be enjoyed, the community had to be set right.

## What we don't know

Exactly how the pharmakoi were chosen and treated is uncertain. We know little about the details of the offerings to Artemis on the sixth.

## Its meaning today

The Thargelia is a festival of clearing out and beginning to enjoy: cleaning before celebrating, letting go of burdens before taking in the harvest. Modern practitioners keep it with a thorough cleaning, a release of something they have carried, and a first loaf or pot of grain for Apollo.

The pharmakos custom is one of the hardest parts of ancient practice for modern people. It placed a community's troubles on the shoulders of two people, probably poor or outcast. We do not imitate it with any person. Many practitioners use an object instead, and many use the day to think about who carries the blame in their own communities.

## Preparing ahead

Plan your cleaning a few days ahead so that the first day is manageable: gather bags for rubbish and things to give away. Find fig leaves or plain paper for writing what you will release. Buy new-season flour or grain if you can, or a good loaf. Choose a hymn or song for Apollo; the Homeric Hymn to Apollo is long, so you might read just its opening. If you want a bay leaf for your shrine, buy or pick one in advance. Read the Thargelia page in the app and this lesson again before the first day.

## Keeping it as a beginner

**Day one, for Artemis and cleansing:**

1. **Clean and air your home** thoroughly. Take rubbish and old things out of the house.
2. **Write** on a fig leaf or a slip of paper what you want to send out of your life: a habit, a grudge, a burden you have carried for others.
3. **Take it outside** and compost it, bury it or put it in the bin, and walk away.
4. **Make khernips**, light Hestia's flame, and pour a libation to Artemis for her birthday.

**Day two, for Apollo and first fruits:**

1. **Cook a pot of grain** or bake a small loaf, the first of the season's new flour if you can find it.
2. **Begin with khernips and Hestia.**
3. **Offer the first spoonful or slice** to Apollo, with a hymn or a song: the Homeric Hymn to Apollo, or any song you love.
4. **Share the rest.**
5. **Keep a bay leaf** from the day on your shrine.
6. **End with Hestia.**

## Words for the day

A prayer for the second day, with the first loaf:

"Apollo, born on Delos on the seventh day, purifier and healer, lord of the first ripe grain: yesterday I cleaned my house and sent out what I no longer carry. Today I bring you the first of this bread, as the Athenians brought you the thargelos. Keep me clean in body and mind, and let me enjoy the harvest with a clear heart."

## Common difficulties

- **"My house is too big to clean in a day."** Clean one room thoroughly, and the shrine. The purpose is a clear break, not a perfect house.
- **"I can't bake."** Buy a good loaf, or cook a pot of porridge, rice or barley. The first spoonful is the offering.
- **"Writing down what I release brings up hard feelings."** Go gently. Write one small thing. If it becomes heavy, stop and talk to your mentor.

## Keeping it with a coven

A coven Thargelia might begin with a shared cleaning of the coven's meeting place or a public space, followed the next day by a feast with a first loaf and singing, perhaps a song contest in honour of Apollo's choruses.

> **Your coven:** Ask your mentor how your coven marks the two days, and whether there is a coven cleaning or a song to learn.

> **Safety:** Never single out a person to carry blame or "bad luck", even in play; that is the one part of this festival we leave in the past. When cleaning, do not mix bleach with ammonia or other cleaners.

## Reflect

- What burden are you ready to put down?
- Who carries the blame in your communities, and is it fair?
- What is your first harvest this year, in any sense?

## What's ancient and what's modern

- **Ancient:** the two birthdays, the purification, the pharmakoi, the thargelos, the song contests and tripods.
- **Modern:** household cleaning as purification, objects instead of people as scapegoats, first loaves from shop flour.`,
    },
    {
      id: 'hellenic-lore-plynteria',
      title: 'Plynteria',
      summary: 'The solemn day when Athena\'s ancient statue was undressed, covered and washed and her robes cleaned, and how to keep it by washing your shrine and images and keeping the day quiet.',
      minutes: 15,
      body: `## The day

The Plynteria falls on 25 Thargelion, in early summer. The app's calendar shows this year's date.

## Whom it honours

Athena Polias, whose ancient olive-wood image on the Acropolis was the city's most sacred object, believed by some to have fallen from heaven. The festival also involved Aglauros, a daughter of Athens's legendary first king, linked with Athena's cult.

## What we know

The name means "washing". The festival was the work of the Praxiergidai, a family of hereditary priests. They removed the robe and ornaments from Athena's ancient image, covered it, and roped off the temple. The image was then washed, possibly carried to the sea at Phaleron, and a procession went with it carrying a cake of figs. The robe was cleaned too. The Kallynteria, a day of sweeping and decorating the temple, came around the same time.

Because the goddess was, in a sense, away or unclothed, the Plynteria counted among the most unlucky days of the year, when no public business was done. Plutarch and Xenophon both note that the politician Alcibiades returned to Athens from exile on the day of the Plynteria in 407 BCE, and people took it as a bad omen. He was exiled again soon after.

## What we don't know

Whether the statue was carried to the sea to be washed, or washed in the city, is debated, as are the exact day and the order of the Kallynteria and Plynteria.

## Its meaning today

The Plynteria is a festival of care for sacred things: washing the images of the gods, cleaning the shrine, renewing what has grown dusty. It is also a quiet day, a pause from new ventures. For a household practitioner, it is the great annual cleaning of the shrine.

## Preparing ahead

A day or two before, look at your shrine with fresh eyes: what is dusty, chipped, faded or worn? Gather what you will need: soft cloths, a brush for fragile images, a bowl of water, a little salt if suitable, and a clean cloth to cover the shrine. Wash and dry any altar cloths the day before if they take long to dry. Buy a fig or two and good olive oil for the evening offering, and perhaps fresh flowers to re-dress the shrine. Clear your diary as far as you can, so the day can be quiet. Read the Plynteria page in the app and this lesson again the night before.

## Keeping it as a beginner

1. **Begin with khernips** in the morning. Do not light Hestia's flame yet.
2. **Cover your shrine**, or the image of your god, with a clean cloth, as the Praxiergidai covered Athena.
3. **Take everything off the shrine**: images, bowls, cups, cloths, candleholders.
4. **Wash** each thing gently, with plain water. Use a little salt water only for things it won't damage. Wash the cloths. Wipe down the surface itself.
5. **Let everything dry**, and keep the day quiet: don't start new projects, sign contracts or make big decisions.
6. **Mend** anything that needs mending: a chipped bowl, a frayed cloth.
7. **In the evening, re-dress the shrine**, placing each thing back with care, perhaps with a new cloth or fresh flowers.
8. **Uncover the image**, light Hestia's flame, and offer olive oil and a fig to Athena.
9. **End with Hestia.**

## Words for the day

A prayer as you uncover the image in the evening:

"Athena Polias, whose ancient image the Praxiergidai washed and dressed again each year: today I have washed your place and all that stands in it. As I have kept your shrine through the year, take this oil and this fig, and be at home here again, clean and bright, for the year to come."

## Common difficulties

- **"I can't keep the whole day quiet."** Keep the evening quiet, or simply put off any big decision until tomorrow.
- **"My images are fragile."** Dust them with a soft brush instead of washing. The care is the rite.
- **"I don't honour Athena."** The Plynteria is still a good day to wash your whole shrine for whichever gods you honour. Pour a small libation to Athena for the day, and to your own gods as you re-dress it.

## Keeping it with a coven

A coven Plynteria might gather to clean the coven's shared shrine, tools and regalia together, ending with a short rite to re-dress the altar. It is a good festival for service: everyone works, and the coven's sacred things are renewed.

> **Your coven:** Ask your mentor whether your coven has shared sacred things that need washing, and offer to help.

> **Safety:** Old statues, painted images and some stones can be damaged by water or salt. Dust them gently instead, or test a hidden spot first. Check that electrical items such as electric candles are unplugged and dry before cleaning. Do not mix cleaning chemicals.

## Reflect

- What in your practice has grown dusty and needs renewing?
- How does caring for sacred objects change how you feel about them?
- Why might a day without the goddess's presence be unlucky? Have you had days that felt that way?

## What's ancient and what's modern

- **Ancient:** the date, the Praxiergidai, the undressing, covering and washing of the image, the fig cake, the ill-omened day.
- **Modern:** household shrine cleaning as the festival's main rite, quiet days at home.`,
    },
    {
      id: 'hellenic-lore-skira',
      title: 'Skira',
      summary: 'A midsummer women\'s festival of Demeter and Persephone at the very end of the Athenian year, with a procession under a great white parasol, and how to keep it as a time of taking stock.',
      minutes: 15,
      body: `## The day

The Skira falls on 12 Skirophorion, at midsummer, in the last month of the Athenian year. The month takes its name from this festival. The app's calendar shows this year's date.

## Whom it honours

Demeter and Kore, the goddesses of grain, at the time of threshing. In the public procession, Athena, Poseidon-Erechtheus (a combined form of the sea god and the legendary king of Athens) and Helios the sun were honoured too.

## What we know

A procession left the Acropolis for a place called Skiron, on the road to Eleusis. The priestess of Athena, the priest of Poseidon-Erechtheus and the priest of Helios walked together under a great white parasol, the skiron, which may have given the festival its name. There was a sacrifice there, and a festival held by women.

Ancient writers tell us that women at the Skira ate garlic, so as to keep their husbands at a distance. Aristophanes' comedy Assemblywomen imagines women plotting at the Skira to take over the government of Athens. A late ancient commentary seems to connect the Skira with the piglets placed in the megara, underground chambers, to be brought up at the Thesmophoria in autumn.

The Skira came at the hottest point of the year, before the threshing and the new year. It seems to have been a festival of separation and readiness.

## What we don't know

The Skira is one of the least understood Athenian festivals. Its connection with the Thesmophoria, the meaning of the parasol, and what the women did are all debated.

## Its meaning today

Because so little is known, modern practitioners keep the Skira freely, as a midsummer gathering of women or of friends, a festival of the grain at its fullest, and a time to take stock of the year that is ending before the new year begins at the next new moon.

## Preparing ahead

Plan your gathering, or your solitary afternoon, in the shade: a garden, a park, a balcony with an umbrella, or a cool room with a white cloth. Check the weather forecast for heat. Buy garlic, bread and barley or other grain for the meal, and plenty of water. Look back through your journal or the app's records for the year, so you have something to take stock of: festivals kept, offerings made, things learned. Read the Skira page in the app and this lesson again, and decide what you might leave behind with the old year.

## Keeping it as a beginner

1. **Find shade.** Set up a white parasol, umbrella or sheet for shade outside, or lay a white cloth over your shrine.
2. **Begin with khernips and Hestia.**
3. **Pour libations** to Demeter and Kore, for the grain, and to Athena, for the city.
4. **Eat a simple meal** with plenty of garlic: bread rubbed with garlic, garlic and barley, roasted garlic.
5. **Take stock of the year.** Alone or with others, talk or write about what this year has been: what grew, what was harvested, what failed.
6. **Name one thing** you will leave behind with the old year, before the new moon of Hekatombaion begins the next.
7. **End with Hestia.**

If you can, walk a stretch of road at midday under a sunshade or parasol, remembering the procession, and drink plenty of water.

## Words for the day

A prayer under the white shade:

"Demeter and Kore, ladies of the grain at its fullest; Athena, guardian of the city; Helios, who stands highest now: as the priests walked under the white parasol at the year's end, I sit in your shade and look back on my year. Take what I leave behind, keep what I have harvested, and bring me well into the new year."

## Common difficulties

- **"We know so little. Am I making it up?"** Yes, partly, and honestly. Use the few ancient details (the parasol, the women's gathering, the garlic, the year's end) and say plainly that the rest is modern.
- **"I don't like garlic."** Then leave it out. Bread, barley and fruit honour the grain goddesses well.
- **"Taking stock feels gloomy."** Begin with what grew and what you harvested, and end with what you look forward to. The year's end is also the eve of a new one.

## Keeping it with a coven

A coven Skira might be a midsummer women's gathering, or an open one, under shade, with food and talk. It is also a natural time for the coven to look back on its own year before the festival cycle begins again with the Kronia: what worked, what to change, who has joined and who has left.

> **Your coven:** Ask your mentor whether your coven holds a year's-end gathering at the Skira, and how it is used.

> **Safety:** Midsummer heat can be dangerous. Stay in the shade, drink water, wear a hat, and avoid long walks in the hottest part of the day. Keep garlic offerings indoors or clear them promptly, as garlic is toxic to dogs and cats.

## Reflect

- What has this year been for you?
- What will you leave behind before the new year?
- Why might the end of the year have been a time for women to gather apart?

## What's ancient and what's modern

- **Ancient:** the date, the procession under the white parasol with the priestess of Athena and priests of Poseidon-Erechtheus and Helios, the women's gathering, the garlic.
- **Modern:** almost everything about how the festival is kept today, which is fitting for a festival we know so little about.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-hellenic-lore',
      title: 'The Hellenic festival year: test',
      intro: 'Twelve questions on the Attic calendar and its festivals: their stories, customs and safe modern keeping. You need 80% to pass. Your mentor will score the written answers.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'When does the Attic year begin?',
          options: [
            'On 1 January',
            'At the first new moon after the summer solstice',
            'At the spring equinox',
            'At the first full moon of autumn',
          ],
          correct: [1],
          points: 1,
          explanation: 'The Attic year began with the first new moon after the summer solstice, with the month Hekatombaion. Festivals move against our calendar because the months follow the moon.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'What was the most famous custom of the Kronia?',
          options: [
            'Masters and the enslaved ate together, and masters served',
            'A night procession to Eleusis',
            'Washing Athena\'s statue',
            'Opening the new wine',
          ],
          correct: [0],
          points: 1,
          explanation: 'At the Kronia, remembering the Golden Age of Kronos, heads of households ate with and served those they enslaved. Modern practitioners keep it as a feast of equality.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'What is the peplos at the Panathenaia?',
          options: [
            'A cake for Athena',
            'A robe woven for Athena\'s ancient statue and carried in procession',
            'The prize for the torch race',
            'Athena\'s owl',
          ],
          correct: [1],
          points: 1,
          explanation: 'Women and girls wove the peplos for months; it was carried in the great procession and given to Athena\'s olive-wood image. A household peplos of your own craft is a lovely offering.',
        },
        {
          id: 'q4',
          type: 'truefalse',
          prompt: 'We know exactly what was shown to initiates inside the Telesterion at Eleusis.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. The secret was kept. Any modern rite in honour of the Mysteries is a respectful reimagining, not the ancient Mysteries.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'You want to make a kykeon for the Eleusinia. Which ingredient must you never use?',
          options: ['Barley', 'Fresh mint', 'Pennyroyal', 'Water'],
          correct: [2],
          points: 1,
          explanation: 'Pennyroyal, the ancient herb, is toxic and can cause liver damage and miscarriage. Barley water with fresh mint is a safe modern kykeon.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'What is an eiresione?',
          options: [
            'A branch wound with wool and hung with fruits and bread, hung by the door for a year',
            'A torch for Artemis',
            'A jug used at the Anthesteria',
            'The parasol of the Skira',
          ],
          correct: [0],
          points: 1,
          explanation: 'At the Pyanepsia, the eiresione was carried home with a song and hung over the door until the next year, along with a shared pot of beans.',
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: 'Which customs belong to the Anthesteria? Choose all that apply.',
          options: [
            'Opening the new wine',
            'Children given little jugs and flower garlands',
            'A pot of grains for Hermes Chthonios and the dead, not eaten by the living',
            'Weaving a robe for Athena',
            'Sending the spirits away with "Out of doors, Keres!"',
          ],
          correct: [0, 1, 2, 4],
          points: 1,
          explanation: 'The Anthesteria\'s three days were jar-opening, jugs and pots; the dead walked and were sent away at its end. The peplos belongs to the Panathenaia.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'At the Thargelia, Athens drove out the pharmakoi. How do modern practitioners treat this custom?',
          options: [
            'They choose two people to carry the community\'s bad luck',
            'They never single out a person; many use an object, such as a written leaf, to carry what they release',
            'They ignore the festival entirely',
            'They hold a trial',
          ],
          correct: [1],
          points: 1,
          explanation: 'Placing blame on a person is the part of this festival we leave in the past. Writing what you release on a fig leaf or paper and taking it out keeps the meaning without harm.',
        },
        {
          id: 'q9',
          type: 'single',
          prompt: 'How can a household practitioner keep the Plynteria?',
          options: [
            'By starting several new projects',
            'By covering, emptying and washing the shrine and images, keeping the day quiet, and re-dressing it in the evening',
            'By holding a loud party',
            'By fasting for three days',
          ],
          correct: [1],
          points: 1,
          explanation: 'The Plynteria washed Athena\'s image and was an unlucky day for new business. At home it is the great annual cleaning of the shrine, kept quietly.',
        },
        {
          id: 'q10',
          type: 'multi',
          prompt: 'Which are good safety practices for festival rites? Choose all that apply.',
          options: [
            'Offering juice instead of wine when anyone prefers not to drink',
            'Fasting only if your health allows, and never if pregnant or with a history of eating disorders',
            'Leaving the Mounichia cake candles burning while you go outside',
            'Making sure everyone knows beforehand what a Haloa gathering involves',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Alcohol is always optional, fasting must be safe, and adult themes need clear consent beforehand. Never leave candles burning unattended.',
        },
        {
          id: 'q11',
          type: 'short',
          prompt: 'Choose one festival and explain what we know about it, what we don\'t know, and how you would keep it at home.',
          points: 3,
          explanation: 'Each festival lesson separates the evidence from the gaps, and gives a household way to keep it that follows the shape of a Hellenic rite.',
          rubric: 'Full marks: accurate account of what is known, consistent with the lesson (1 point); honest statement of at least one thing not known or debated (1 point); a realistic household observance with Hestia first and last and the festival\'s own custom, with any relevant safety point (1 point).',
        },
        {
          id: 'q12',
          type: 'short',
          prompt: 'Why do the festival dates move against our calendar each year, and what might a practitioner in the southern hemisphere decide about them?',
          points: 2,
          explanation: 'The Attic months follow the moon and the year begins after the summer solstice, so dates shift. Southern practitioners may keep Athenian dates and honour the stories, or shift seasonal festivals by six months, in discussion with their coven.',
          rubric: 'Full marks: explains that the months are lunar and the year is tied to the moon after the summer solstice (1 point); describes at least one reasonable southern hemisphere choice, such as keeping the Athenian dates or shifting seasonal festivals six months, and mentions deciding with the coven (1 point).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The festival year',
      intro: 'The Attic year turns through festivals of the city, the harvest, wine and theatre, the dead and the cleansing of sacred things. Here you keep each festival as it comes, reading its lesson ahead of time and writing up what you did. A full turn of the year takes a year; your mentor will help you plan.',
      passed_by: 'mentor',
      tasks: [
        ...festivals.map(festivalTask),
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Read "The Attic year" and the lessons for any festivals you haven't kept yet.
2. Take the test. You can take it before the year is out; the choice questions are scored at once and your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, read the explanations, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['hellenic-lore-the-attic-year'],
          quiz: 'quiz-hellenic-lore',
        },
      ],
    },
  ],
} satisfies CourseModule;
