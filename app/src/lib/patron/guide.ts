// The patron deity guide: what a patron is (and where the idea comes from),
// how people come to one, how to tell, how to say yes or no, and how it
// changes a practice. Honest about what is old and what is modern. Pure data.

import type { PatronGuide } from './types';

export const PATRON_GUIDE: PatronGuide = {
  title: 'Patron deities',
  intro:
    'What it means to have a patron god or goddess, where the idea comes from, how people come to one and how to tell, and what changes when you say yes. Nobody needs one, and nothing here is a test.',
  sections: [
    {
      id: 'meaning',
      heading: 'What “patron deity” means',
      body: `“Patron deity” is a modern phrase for an old kind of bond: a god or goddess who has a special relationship with one person, family, craft or place, and whom that person honours above or alongside the others.

The word itself is borrowed. A Roman patronus was a powerful protector with clients (clientela) who owed him loyalty and received help in return, and Christianity later gave the world patron saints, each with their trade, town or trouble. Modern Wicca and Paganism took the phrase from there in the twentieth century, and it is now the everyday word for a personal god. Some people say “matron” for a goddess; others keep “patron” for everyone.

The idea underneath it is older than the word, and it turns up in many places in different shapes:`,
      points: [
        'City gods. Athena belonged to Athens, Hera to Argos and Samos, Artemis to Ephesus. A city honoured many gods but had one who held it, and whose festival was its great day.',
        'Household gods. Every Greek house had Hestia at the hearth and Zeus Ktesios guarding the stores; every Roman house had Vesta, the Lares and the Penates, honoured daily with a little food and a flame.',
        'Families and individuals. Greek and Roman families kept their own cults, sometimes for generations, and people had gods they turned to first: Odysseus has Athena in the Odyssey, and Augustus made Apollo his own.',
        'The Norse fulltrúi, “one fully trusted”. In Víga-Glúms saga (ch. 9) Þorkell the Tall leads an old ox to Freyr’s temple and calls Freyr the one “who has long been my fulltrúi”. Landnámabók tells of settlers who “believed in Thor”, like Þórólfr Mostrarskegg, and of Helgi the Lean, who believed in Christ but called on Thor for sea voyages and hard times; Hrafnkels saga says Hrafnkell loved no god more than Freyr. These are thirteenth-century Christian writings about pagan ancestors, so they show the idea, not a manual.',
        'The Kemetic “Parent”. In Kemetic Orthodoxy, a modern Egyptian religion founded in 1988, those who fully join receive a divination that names their Parent deity (or pair), and sometimes “Beloveds”. It is a modern practice of that one community, and other Kemetic paths do things differently.',
        'Iṣṭa-devatā and kula-devatā. In Hinduism, a living religion, many people have an iṣṭa-devatā, a “chosen” or cherished deity who is the focus of their devotion, and many families have a kula-devatā, the family or lineage deity whose temple they return to for weddings and first haircuts. These are part of real people’s faith today, not a model for Pagans to borrow.',
      ],
    },
    {
      id: 'words',
      heading: 'Words, kept distinct',
      body: `People use these words loosely, and it helps to keep them apart, because they promise different things.`,
      points: [
        'Patron (or matron): a deity at the centre of your practice, with a lasting bond, usually honoured more often and more fully than others.',
        'A deity you work with: one you honour or call on for a season, a task or a festival, without any claim of a lifelong bond. Most practitioners have several of these.',
        'A devotional relationship: honouring a deity for their own sake, with prayer, offerings and attention, whether or not you ever call them your patron.',
        'Dedication: a promise you make yourself, to a deity or a path. Anyone can make one, alone, and the app’s journeys end in one.',
        'Initiation: a rite given to you by a group, lineage or teacher who already holds the tradition. You cannot initiate yourself into Gardnerian Wicca, a Hellenic temple or Kemetic Orthodoxy; a self-dedication is real and meaningful, but it is not that.',
      ],
    },
    {
      id: 'no-requirement',
      heading: 'There is no requirement',
      body: `You do not need a patron to be a witch, a Pagan, a Heathen or a polytheist. Plenty of experienced practitioners never have one, and honour many gods evenly through the festivals of the year. Others have one for life, or two, or a family of gods who arrived together.

None, one or several are all normal. Ancient religion was mostly about honouring the right gods at the right times, not about each person having a personal god, and many modern Hellenic, Roman and Heathen groups say the same. If social media has left you feeling that everyone else has been “called” and you have not, set that down. Nothing is missing from you.`,
    },
    {
      id: 'coming-to',
      heading: 'How people come to a patron',
      body: `People describe four common ways in, and they often overlap.`,
      points: [
        'Study. You read a myth or a hymn, or learn about a festival, and keep coming back to one god. Interest is a perfectly good start.',
        'A feeling. A sense of warmth, presence or recognition at a shrine, in a place, or in prayer. Real for many people, and worth testing over time.',
        'Recurring encounters. The same animal, symbol, name or theme turns up again and again, in dreams, readings or daily life.',
        'Choosing. You look at your life and choose deliberately: a weaver choosing Athena, a nurse choosing Apollo or Sekhmet, a household choosing Hestia. Many ancient people did exactly this, by trade or by need, and it is no less real for being a decision.',
      ],
    },
    {
      id: 'discernment',
      heading: 'How to know',
      body: `There is no test that settles it, but there are honest ways to look. The aim is to give a real relationship room to show itself, and to let a passing enthusiasm pass.`,
      points: [
        'Look for patterns over months, not one omen. A crow on your windowsill is a crow. Crows every week for half a year, alongside dreams and a pull towards a god’s stories, is worth noticing.',
        'Keep a record. Write down what happened, when, and what you did, as plainly as you can, in the journal. Read it back after a few months; memory improves on things.',
        'Divine honestly. If you use tarot, runes or another method, ask a clear question, decide beforehand what would count as yes or no, and accept the answer you did not want. Ask again a week later rather than drawing until it agrees.',
        'Know about confirmation bias. Once a god is on your mind you will see their symbols everywhere: owls, ravens and the moon are common. Test it: also note the times the signs did not come, or look for a different god’s symbols for a fortnight and see whether they turn up just as often.',
        'Talk with people in the tradition. Hellenic, Roman, Heathen, Kemetic and Celtic communities have years of experience with this, and can tell you how that god is usually honoured, and gently when something does not fit.',
        'Ask what the relationship asks of you. A real bond tends to make you steadier, kinder and more yourself over time.',
      ],
    },
    {
      id: 'red-flags',
      heading: 'Red flags',
      body: `Gods in the old stories can be demanding, but a healthy devotional life does not hurt you or the people around you. Step back, and talk to someone, if what you are experiencing:`,
      points: [
        'urges harm to yourself or anyone else, or asks you to put your safety at risk;',
        'pushes you to cut off friends or family, or to keep everything secret from the people who care about you;',
        'pushes you to spend money you do not have, or to pay a person who says they speak for the god;',
        'leaves you frightened, sleepless or distressed most of the time, rather than now and then;',
        'feels like a voice that will not stop, or that you cannot set aside when you need to.',
      ],
    },
    {
      id: 'red-flags-help',
      heading: 'If something feels wrong',
      body: `None of this means you are imagining things or doing it wrong. It means this is the moment to put the spiritual work down for a while and look after yourself first. Talk to someone you trust, a doctor, or a support line; there are some listed under More → Support in the app. A good tradition, and a good god, will still be there when you are well.`,
    },
    {
      id: 'accepting',
      heading: 'Saying yes',
      body: `If you decide to accept, start small. A shelf, a candle, a cup of water and a few minutes most days will build more than a grand vow you cannot keep.

The app has a dedication journey for each of the 61 deities in the Living Library, under Rituals → Dedication journeys: a few weeks of study, simple practice and honest discernment, ending in a dedication rite. You can stop or pause at any point, and nothing is ever failed.

A dedication promises what you say it promises, and no more. Most people promise attention: to learn about the god, keep their days, make offerings, and live a little more by what they stand for. It does not make you a priest, initiate you into a tradition, or bind the god to grant your wishes. Make promises you can keep; you can always add more later.`,
    },
    {
      id: 'declining',
      heading: 'Saying no, or not yet',
      body: `You are allowed to decline, or to say “not yet”. In most modern Pagan and polytheist practice a god who seems to be calling can be thanked, given an offering, and told honestly that you are not ready, or that your path lies elsewhere. Many people find the pull eases, or comes back years later at a better time.

Some traditions take vows very seriously, and treat a sworn oath to a god as binding, so think before you swear anything formal. That is one more reason to start with attention rather than an oath.`,
    },
    {
      id: 'practice',
      heading: 'How a patron changes a practice',
      body: `Having a patron does not mean dropping everything else. It usually means one god becomes the place you start from.`,
      points: [
        'A shrine. A small dedicated space with an image or symbol, a light and an offering bowl. A shelf or windowsill is plenty.',
        'Offerings. Small and regular is better than lavish and rare: water, a little food or drink, incense, a flower, your work. Dispose of them respectfully: food offerings are usually not eaten afterwards in Greek practice but left, buried or composted; liquids poured onto earth; nothing left where animals could be harmed.',
        'Holy days. Their festivals and monthly days become the fixed points of your year. Each deity page shows their days, and the app can remind you.',
        'Prayer and hymns. Old prayers are a gift: the Homeric and Orphic hymns are in the public domain, and Roman, Norse and Egyptian sources have prayers and praise poems too. Your own words count just as much.',
        'Study. Reading their myths, history and cult, and how living communities honour them, is a form of devotion in itself.',
        'Workings. Many people align spells and rituals with their patron’s domains, asking Hermes for safe travel or Brigid for healing, and leave other matters to other gods.',
        'Service and ethics. Much devotion is lived: a patron of justice asks for fairness, a hearth goddess for hospitality, a god of the wild for care of wild places. Volunteering, craft and kindness in their name are offerings too.',
      ],
    },
    {
      id: 'changes',
      heading: 'When it changes or ends',
      body: `Relationships with gods change, as other relationships do. Some last a lifetime. Some are close for a season and then settle into ordinary respect. Sometimes another god comes forward, or your path moves on.

If you need to step back, do it respectfully rather than by vanishing. Make a closing offering, say thank you for what the relationship gave you, and say plainly that you are stepping back. Keep or give away their images and objects with care; burying, burning or passing them to someone who honours that god are all common. If you made a vow, keep what you can of it, or say honestly what you are setting down. Leaving well is part of a good practice, and you can always come back.`,
    },
    {
      id: 'respect',
      heading: 'Cultural respect',
      body: `Many of these gods belong to living people. Hellenic, Roman, Kemetic, Heathen, Celtic and Slavic polytheists honour them today, and Hindu deities like Ganesha and Durga are worshipped by more than a billion people in a living religion with its own temples, priests, festivals and teachings. If you feel drawn to a Hindu deity, learn from Hindu sources and communities, follow their customs, and approach as a guest.

Some traditions are closed or initiatory, and some practices belong only to members. The Living Library has a guide on this, Closed & living traditions, that is worth reading before you choose. Where the app has written a modern devotion, it says so.`,
    },
  ],
  knowAndDont: {
    known:
      'Ancient Greeks and Romans honoured city, household and family gods, and individuals often had gods they turned to first. Old Norse texts use fulltrúi for a deity someone trusted above others, and the sagas and Landnámabók describe people devoted to Thor or Freyr. Hinduism has long-standing ideas of a chosen deity (iṣṭa-devatā) and a family deity (kula-devatā). The phrase “patron deity” and the practice of seeking one are recognisably modern, shaped by Wicca and twentieth-century Paganism, and Kemetic Orthodoxy’s Parent divination is a modern rite.',
    unknown:
      'We do not know how most ordinary ancient people experienced their gods day to day, how many felt personally chosen, or whether anyone “dedicated” themselves alone in the way people do now. The Norse sources were written by Christians centuries after the conversion. No old source gives a method for discovering your patron, so every method in use today, including the ones here, is modern practice built on old foundations.',
  },
  further: [
    'Walter Burkert, Greek Religion (1985), on household, city and personal cult',
    'Jon D. Mikalson, Ancient Greek Religion (2nd edn, 2010)',
    'Hesiod, the Homeric Hymns and Homerica, trans. H. G. Evelyn-White (1914), public domain: https://www.gutenberg.org/ebooks/348',
    'The Hymns of Orpheus, trans. Thomas Taylor (1792), public domain',
    'Mary Beard, John North and Simon Price, Religions of Rome (1998), vol. 1, on household and family cult',
    'The Book of Settlements: Landnámabók, trans. Hermann Pálsson and Paul Edwards (1972)',
    'Víga-Glúms saga and Hrafnkels saga, in The Complete Sagas of Icelanders, ed. Viðar Hreinsson (1997)',
    'Ronald Hutton, The Triumph of the Moon: A History of Modern Pagan Witchcraft (1999; 2nd edn 2019)',
    'Ronald Hutton, Pagan Britain (2013)',
    'Kemetic Orthodoxy, “What is Kemetic Orthodoxy?”, on the Parent divination in that community: https://kemet.org/about',
    'Gavin Flood, An Introduction to Hinduism (1996), on household and temple worship',
    'The Troth, “Patron Deities”, a modern Heathen view: https://thetroth.org/resource/patron-deities/',
  ],
};
