import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'path-hellenic',
  kind: 'path',
  paths: ['hellenic'],
  title: `The Hellenic Path`,
  summary: `Thirteen weeks, about three turns of the Attic moon, learning the household worship of the Greek gods: purity, libation, prayer, the monthly holy days and the ethic of kharis.`,
  welcome: `This journey is for anyone drawn to the gods of ancient Greece and wanting to worship them the way people once did: at home, with clean hands, a little wine poured out and words that ask and thank. It runs about thirteen weeks, long enough to keep three Noumenias and three Deipna, and to find out whether this is your path.

It is a self-dedication, not an initiation. Ancient Greek religion had mysteries, like those at Eleusis, that were entered only through initiation, and some modern Hellenic groups have their own rites of membership. Nothing here replaces those. What it can give you is a grounded household practice and an honest sense of where the evidence ends.

You need very little: a bowl, a cup, a candle or lamp, some water, some wine or juice, a stick of incense if you like it, and a shelf you can keep clean.`,
  about: `Hellenic polytheism is the worship of the Greek gods, revived in the modern era from the texts, inscriptions and archaeology of the ancient world. Some practitioners call it Hellenismos and aim for careful reconstruction of ancient practice, usually built on the calendar of classical Athens. In Greece, groups such as YSEE call it the ethnic Hellenic religion and see it as an unbroken cultural inheritance being reclaimed. Others are eclectic, honouring the Greek gods within a wider pagan or witchcraft practice. What all of them share is a religion of doing more than believing: purity before approaching the gods, offerings given in a right manner, prayer that remembers the bond between worshipper and god, and a year shaped by festivals. No scripture, no creed and no single priesthood govern it, then or now. That freedom is real, and so is the responsibility to know which parts of your practice are ancient and which are modern.`,
  notes: [
    `This journey follows a reconstructionist approach based mainly on Athenian practice, because that is where the evidence is richest. Ancient Greece was hundreds of cities with their own calendars and cults; Athens is one window, not the whole house.`,
    `The app is inclusive. Some groups in Greece frame the religion in national or ethnic terms. Many Greek practitioners mean this culturally and welcome foreigners; a few go further. The gods of the Hymns were worshipped from Spain to the Black Sea, and you do not need Greek ancestry to honour them.`,
    `No animal sacrifice is taught here. It stood at the centre of ancient public worship, and most modern practitioners replace it with bloodless offerings and a shared festive meal.`,
    `The Eleusinian Mysteries and other mystery cults were secret, and their secrets were kept. Anyone claiming to teach "the real Eleusinian rite" is inventing it.`,
    `Myths are stories, told differently in different places and times, not scripture. Several involve violence and sexual coercion; you can read them critically without having to approve of them or of the gods in them.`,
    `Offerings of wine and food should be kept away from pets. Grapes and raisins, onion, garlic, chocolate and alcohol are dangerous to dogs and cats, and lilies are deadly to cats.`,
  ],
  holyDays: [
    'noumenia',
    'agathos_daimon',
    'deipnon',
    'kronia',
    'panathenaia',
    'eleusinia',
    'pyanepsia',
    'thesmophoria',
    'haloa',
    'lenaia',
    'anthesteria',
    'dionysia',
    'mounichia',
    'thargelia',
    'plynteria',
    'skira',
  ],
  stages: [
    // ───────────────────────────── THRESHOLD ─────────────────────────────
    {
      kind: 'threshold',
      title: `At the Hearth`,
      intro: `Every Greek household began its worship at the hearth, with Hestia. You begin the same way: a clean place, clean hands, a small libation, and a plain statement of why you have come. Before the opening rite, choose a shelf or small table for your shrine and clean it, and find a bowl you will use only for khernips, the purifying water.`,
      days: 5,
      lessons: [],
      practices: [
        {
          id: 'h-threshold-hands',
          title: `Wash before you pray`,
          instructions: `For five days, before anything else you do at your shrine, wash your hands in plain water and dry them on a clean cloth. Do it slowly. Notice how the small act changes the next minute. This is the seed of khernips, which you will learn properly in the study stage.`,
          times: 5,
          every: 'day',
          prompt: `What did it feel like to approach the shrine after washing, rather than straight from the rest of the day?`,
        },
      ],
      rite: {
        title: `Opening Rite: First Libation to Hestia`,
        summary: `A short, traditional-shaped rite to begin the journey: purify with khernips, pour first to Hestia, greet the gods, state your intention and pour last to Hestia.`,
        minutes: 20,
        ingredients: [
          { name: `A bowl of fresh water (your khernips bowl)`, ref: 'traditional/vessel/bowl' },
          { name: `A match, or a dry bay leaf to light`, ref: 'traditional/herb/bay' },
          { name: `A clean towel or cloth` },
          { name: `A cup, and wine mixed with a little water (or grape juice)` },
          { name: `A second bowl to pour into, or a plant pot of earth`, ref: 'traditional/vessel/offering_bowl' },
          { name: `A candle or oil lamp for Hestia`, ref: 'traditional/candle/white' },
          { name: `A pinch of frankincense or a stick of incense`, ref: 'traditional/herb/frankincense', optional: true },
        ],
        preparation: `Clean your shrine surface. Set the candle at the back, the cup and pouring bowl in front, and the khernips bowl to one side. Mix your wine: ancient Greeks almost never drank or poured wine neat to the Olympian gods, so add a splash of water. Dress in clean clothes. You are not performing for anyone; you are greeting the oldest goddess of the house.`,
        steps: [
          {
            title: `Make the khernips`,
            instructions: `Light the match or bay leaf from your candle flame, or light the candle first from the match. Plunge the burning match or leaf into the bowl of water so it hisses out. Fire has passed into the water: this is khernips. Wash your hands in it, and touch a little to your face. Dry them.`,
            spoken: `By fire and water, may I be clean to come before the gods.`,
            light: true,
          },
          {
            title: `First to Hestia`,
            instructions: `Pour a small amount of the mixed wine from the cup into the pouring bowl. Hestia receives the first portion of every offering.`,
            spoken: `Hestia, eldest and youngest, lady of the hearth, you have the first share. Be at the centre of this house and of what I begin here.`,
          },
          {
            title: `Incense for the gods`,
            instructions: `If you have incense, light it now and let the smoke rise. Raise your hands with palms up, the old gesture of prayer to the gods of the sky.`,
            spoken: `Gods of Olympus, gods of earth and sea, all the gods and goddesses who hold this world: I greet you. I come with clean hands and a small gift, as people have come to you for three thousand years.`,
          },
          {
            title: `Say why you have come`,
            instructions: `In your own words, say what you are setting out to do: to learn the old ways of honouring the gods, and to discover over these weeks whether this is your path. Keep it plain and honest. You are not making promises yet. Then pour a second small libation for all the gods.`,
            spoken: `I do not yet know you well. I ask to learn. Let what I do here be done rightly, and where I do it wrongly, let me learn better.`,
          },
          {
            title: `Last to Hestia`,
            instructions: `Pour a final small libation to Hestia. She is honoured first and last, so that the hearth frames everything else.`,
            spoken: `Hestia, the last share is yours too. Keep this fire, and keep this house.`,
          },
          {
            title: `Close`,
            instructions: `Sit for a minute. Then put out the candle (Greeks did not keep a hearth fire burning unattended, and neither should you). Leave the poured wine on the shrine for a while, then pour it onto earth outside or into a plant pot. Pour away the khernips onto the ground or down the drain with respect; it has done its work.`,
            snuff: true,
          },
        ],
        closing: `Write in your journal what you said and how it felt. You will come back to this at the dedication.`,
        safety: `Quench the match or leaf fully in the water and never leave a flame unattended. Keep incense in a heat-proof holder, ventilate the room, and skip it if you or anyone at home has asthma, or you keep birds, which are very sensitive to smoke. Grape juice works if you avoid alcohol. Pour offerings where pets cannot reach them; grapes and wine are toxic to dogs and cats.`,
      },
    },

    // ─────────────────────────────── STUDY ───────────────────────────────
    {
      kind: 'study',
      title: `Learning the Ways of the Gods`,
      intro: `Six weeks of reading and small daily practice. You will learn where our knowledge comes from, who the gods are and how to address them, and the core of household worship: kharis, purity, offering, libation and prayer. Each lesson builds on the one before. Keep washing before you pray; by the fourth lesson it will be khernips.`,
      days: 42,
      lessons: [
        {
          id: 'h-sources',
          title: `What Survives: Texts, Stones and Calendars`,
          summary: `Where knowledge of Greek religion comes from, what each source is good for, and what Hellenismos and wider Hellenic polytheism make of it.`,
          minutes: 6,
          sections: [
            {
              heading: `The poets`,
              body: `The oldest voices are the poets. Homer's Iliad and Odyssey, written down perhaps around 700 BCE from a long oral tradition, are full of religion in action: heroes washing before they pray, pouring wine on the ground, burning thigh-bones wrapped in fat, arguing with the gods and reminding them of past gifts. Hesiod, a farmer-poet of Boeotia writing around the same time, gave us the Theogony, the birth and family tree of the gods, and the Works and Days, a book of practical wisdom that includes rules for prayer and offering.

Then there are the Homeric Hymns, thirty-three poems in Homer's style, composed between about the seventh century BCE and the Hellenistic period. Some are long stories, like the Hymn to Demeter, which tells of Persephone's abduction and is our best literary window onto Eleusis. Others are a few lines long and were probably preludes sung before a recital. Practitioners still use them in worship.`,
            },
            {
              heading: `The later hymns and the travellers`,
              body: `The Orphic Hymns are a collection of eighty-seven hymns, most likely written in the second or third century CE for a religious association in western Asia Minor. They are late, and come from one particular group, but they are complete, devotional and give a suggested incense for each god, so many modern practitioners use them. Thomas Taylor's 1792 translation is in the public domain.

Pausanias, a Greek traveller of the second century CE, wrote a guidebook to Greece that records hundreds of local shrines, statues and customs. Plutarch, a priest at Delphi in the same era, wrote essays on the oracle and on religious questions. Plays by Aeschylus, Sophocles, Euripides and Aristophanes show rituals in passing, often in ways their audiences would have recognised.`,
            },
            {
              heading: `Stones, pots and calendars`,
              body: `The poets tell us how people imagined the gods. The inscriptions tell us what they actually did. Greek cities and villages carved their sacred laws in stone: who could enter a sanctuary, how long someone was impure after a birth or a funeral, what to offer to whom and on which day. Several sacred calendars survive from the villages of Attica, the countryside around Athens. The calendar of Erchia, from the fourth century BCE, lists dozens of sacrifices through the year, down to the animal, the price and whether the meat could be carried away. Pottery paintings show altars, libations and processions. Archaeology gives us household shrines, offering deposits and the lead tablets of Dodona, where ordinary people scratched their questions to Zeus.`,
            },
            {
              heading: `Hellenismos and its neighbours`,
              body: `Modern Hellenic polytheists use all of this, but in different ways. Those who call their religion Hellenismos generally aim at reconstruction: practice grounded in the evidence, usually following the Athenian calendar and Athenian customs, filling gaps carefully and saying when they do. In Greece, groups such as YSEE (the Supreme Council of Ethnikoi Hellenes) and the Labrys community see themselves as restoring their ancestral religion. Eclectic Hellenic pagans honour the Greek gods with more freedom, sometimes within Wicca or witchcraft, sometimes blending in modern ritual forms like casting circles, which have no ancient Greek basis. None of these is fake. They are different projects, and it helps to know which one you are doing. This journey leans reconstructionist, and says when it is offering a modern answer.`,
            },
          ],
          knowAndDont: {
            known: `We have a great deal: epic and lyric poetry, hymns, plays, philosophers, travel writers, hundreds of inscribed sacred laws and calendars, and the archaeology of temples, houses and offerings. For classical Athens, we can reconstruct the festival year in outline and many household customs in detail.`,
            unknown: `Most evidence is Athenian, male-authored and about public cult. Women's rites and household religion survive mostly in fragments, and the inner rites of the mysteries were never written down. The Orphic Hymns are much later than Homer and reflect one community. No ancient source sets out a complete "how to worship" manual: the modern household rite is a careful reconstruction from many pieces.`,
          },
          inPractice: `Get a copy of Hesiod and the Homeric Hymns (the Evelyn-White translation is free on Project Gutenberg) and read the short Hymn to Hestia (number 29) and the Hymn to Demeter this week. Start a page in your journal headed "ancient / modern", and as you learn, note which parts of your practice come from which.`,
          reflect: [
            `Are you drawn more to careful reconstruction or to a freer Hellenic practice? What draws you?`,
            `How do you feel about practising a religion pieced together from fragments?`,
          ],
          further: [
            `Hesiod, Theogony and Works and Days, and the Homeric Hymns, trans. H. G. Evelyn-White (1914; Project Gutenberg)`,
            `Jon D. Mikalson, Ancient Greek Religion`,
            `Simon Price, Religions of the Ancient Greeks`,
            `Walter Burkert, Greek Religion`,
          ],
        },
        {
          id: 'h-gods',
          title: `The Gods and How to Name Them`,
          summary: `Olympians, earth powers, heroes and nymphs; why epithets matter; and how to choose whom to honour.`,
          minutes: 7,
          sections: [
            {
              heading: `Many kinds of divine`,
              body: `Greek religion does not have one god or one tidy pantheon. There are the Olympians, the great gods who live on the mountain: Zeus, Hera, Poseidon, Demeter, Athena, Apollo, Artemis, Ares, Aphrodite, Hephaestus, Hermes, and either Hestia or Dionysus depending on who is counting. There are the gods of the earth and the underworld, like Hades, Persephone and Hekate, worshipped in other ways. There are heroes, mortals who after death received cult at their tombs, like Herakles or Theseus. There are nymphs of springs, trees and mountains, river gods, the winds, and daimones, spirits who are neither quite gods nor quite ghosts, like the Agathos Daimon, the good spirit of the house.

A Greek did not choose one of these and ignore the rest. You honoured the gods of your house, your city and your work, the gods of the festivals as they came round, and any god whose help you needed.`,
            },
            {
              heading: `Epithets: which Zeus?`,
              body: `Gods were almost always called by a name plus an epithet, a title that said which aspect, place or function you meant. Zeus Ktesios guards the storeroom; Zeus Xenios protects guests; Zeus Herkeios watches the courtyard; Zeus Meilichios, "the gentle", appears as a snake and receives offerings like an earth power. Athena Polias guards the city, Athena Ergane guides the craftworker's hands. Apollo Agyieus stands as a pillar by the front door.

Epithets were not decoration. They aimed the prayer. A sailor called on Poseidon Asphaleios, "the one who keeps safe", not Poseidon the earth-shaker. When you pray, choose the epithet that fits what you are asking, or name the god with a phrase that does the same work: "Hermes, guide of travellers".`,
            },
            {
              heading: `Sacred things`,
              body: `Each god has creatures, plants and places that belong to them, and these give you ways to decorate a shrine and choose offerings. Athena has the owl and the olive; Apollo the laurel (bay), the swan and the lyre; Artemis the deer, the bear and wild places; Demeter grain, poppies and the pig; Dionysus the vine, ivy and pine cones; Aphrodite the dove, myrtle and roses; Hermes the tortoise, the herm (a pillar with a head) and the roadside cairn; Hera the peacock and pomegranate; Poseidon the horse and the bull. Hekate's are the crossroads, torches, dogs and the threshold. Major sanctuaries such as Delphi, Olympia, Eleusis, Dodona and the Athenian Acropolis are still worth reading about even if you never visit them.`,
            },
            {
              heading: `Myths are not scripture`,
              body: `The myths you read in Hesiod or Ovid are stories, told differently in different cities and centuries. Greeks did not have to believe all of them, and philosophers from Xenophanes to Plato criticised the poets for showing the gods as thieves and adulterers. Many myths include violence and rape. You can honour Zeus without approving of every story told about him, and you can read the stories as poets' attempts to describe powers that are larger than human morality, without making them your rule of life. Be careful, too, with modern retellings: Roman versions (Ovid especially) and modern novels often reshape the Greek originals.`,
            },
          ],
          knowAndDont: {
            known: `Hundreds of epithets survive in inscriptions, dedications and literature, often tied to particular sanctuaries. Sacred animals and plants are well attested in art and texts. The Olympians as a group of twelve appear by the fifth century BCE, with an altar of the Twelve Gods in the Athenian agora.`,
            unknown: `The list of the Twelve varied. How ordinary people imagined the gods' natures, as persons, forces or both, differed widely and is hard to recover. Some popular modern ideas, such as "triple goddess" Hekate as maiden, mother and crone, are modern; Hekate was shown with three bodies from about the fifth century BCE, but as a guardian of crossroads, not as life stages.`,
          },
          inPractice: `Choose one or two gods to get to know through this journey, as well as Hestia, who comes first for everyone. Look them up in the Living Library and write down three epithets for each, what each one means, and one sacred animal or plant you could place on your shrine.`,
          reflect: [
            `Which god or gods have you felt drawn to, and is it the god or the story about them?`,
            `Which myth troubles you most, and how might you hold it?`,
          ],
          further: [
            `Jennifer Larson, Ancient Greek Cults: A Guide`,
            `Robert Parker, On Greek Religion`,
            `Hesiod, Theogony (Evelyn-White translation, Project Gutenberg)`,
          ],
          library: [
            'traditional/deity/hestia',
            'traditional/deity/athena',
            'traditional/deity/apollo',
            'traditional/deity/artemis',
            'traditional/deity/hermes',
            'traditional/deity/hekate',
            'traditional/deity/demeter',
            'traditional/deity/dionysus',
            'traditional/deity/aphrodite',
          ],
        },
        {
          id: 'h-kharis',
          title: `Kharis: Gift, Gratitude and Guest-Friendship`,
          summary: `The reciprocal bond at the heart of Greek worship, and the sacred duty of hospitality that mirrors it.`,
          minutes: 6,
          sections: [
            {
              heading: `A relationship, not a vending machine`,
              body: `The Greek word kharis means grace, charm, favour and gratitude all at once. In religion it names the goodwill that builds up between a worshipper and a god through a history of gifts and gratitude. You give because you have received, and because you hope to receive, and the gods give because they have been honoured. Over years, this becomes a relationship.

It is easy to call this a transaction, and scholars sometimes do. But kharis is closer to friendship between unequal partners. A gift does not buy a result. It keeps the bond alive, and a bond that has been tended for years can be called on when you need it. The gods owe you nothing in a legal sense. The point is to be someone with whom they have kharis.`,
            },
            {
              heading: `Eusebeia and hubris`,
              body: `Eusebeia, usually translated piety, means giving the gods their due: worshipping at the right times, in the right way, with a clean body and honest intention. It is about conduct more than feeling. Its opposite is not doubt but hubris, the arrogance that forgets you are mortal: boasting that you equal a god, abusing the helpless, or violating sacred things. Greek stories punish hubris harshly. Arachne, Niobe and Ajax all learn this.

You do not need a particular belief to practise eusebeia, and ancient Greeks held many views about the gods. What mattered was that you showed up and did it properly. Modern Hellenists often find this freeing.`,
            },
            {
              heading: `Xenia: the sacred guest`,
              body: `The same reciprocity runs through xenia, guest-friendship. A stranger at your door was under the protection of Zeus Xenios. You fed them, washed them, gave them a place by the fire and only then asked their name. A guest, in turn, did not abuse the host. The Trojan War began, in the myth, when Paris violated xenia by carrying off his host's wife. In the Odyssey, the suitors who devour Odysseus's household and mistreat a beggar (who is Odysseus in disguise) are destroyed for it. Gods were said to walk the earth disguised as travellers to test who kept the law.

For modern practitioners, xenia is a living ethic: generosity to guests, care for strangers, keeping faith with those who trust you, and not being the guest who takes without giving.`,
            },
            {
              heading: `Living it`,
              body: `Kharis begins small and regular. A little wine poured each Noumenia, thanks given when something goes well, a promise to a god kept to the letter. Many practitioners keep a short record of what they offered and when, and of what they asked for and what came, not to keep score but to remember. When something good arrives, thank the god you asked. Gratitude is itself a gift, and the old prayers are full of it.

Be careful with vows. Greeks promised dedications "if" a god helped, and then paid them. If you promise, keep the promise exactly, and promise only what you can give.`,
            },
          ],
          knowAndDont: {
            known: `The language of kharis appears in prayers, dedications and poetry from Homer onward. Votive offerings by the thousand, inscribed with thanks or with a vow fulfilled, survive in sanctuaries. Xenia is central to the Homeric poems and to later Greek ethics.`,
            unknown: `How individual worshippers felt about the gods' side of the bargain is mostly hidden; some ancient writers, like Plato in the Euthyphro, questioned whether we can give the gods anything at all. "Kharis" as a summary of the whole religion is partly a modern emphasis, useful but tidier than ancient practice.`,
          },
          inPractice: `Begin a simple record at the back of your journal: date, god, what you offered, what you asked or gave thanks for. This week, do one act of xenia on purpose: cook for someone, welcome a newcomer, or help a stranger.`,
          reflect: [
            `What is the difference, for you, between giving to get and giving within a relationship?`,
            `When have you been a good guest or host, and when not?`,
          ],
          further: [
            `Homer, Odyssey, books 6 to 8 (the Phaeacians' hospitality)`,
            `Robert Parker, "Pleasing Thighs: Reciprocity in Greek Religion", in Reciprocity in Ancient Greece (ed. Gill, Postlethwaite and Seaford)`,
          ],
        },
        {
          id: 'h-miasma',
          title: `Miasma and Purity: Making Khernips`,
          summary: `What ritual pollution is and isn't, what causes it, and how to make and use khernips correctly.`,
          minutes: 7,
          sections: [
            {
              heading: `Pollution is not sin`,
              body: `Miasma is ritual pollution: a kind of contagious uncleanness that makes a person unfit to approach the gods until it is removed. It is not moral guilt. You could become polluted by doing nothing wrong at all. Birth and death were the great sources: those who attended a birth, or a death and funeral, were impure for a set number of days. Sex, contact with blood and certain foods could also pollute for a short time. Murder brought the deepest pollution, which spread to the whole city if left unpurified, as in the story of Oedipus.

The idea is less about the gods being squeamish and more about keeping the boundaries of life and death, human and divine, clear. The gods are deathless; things touched by death and birth belong to the mortal world and are kept apart from them for a while.`,
            },
            {
              heading: `Fire into water`,
              body: `The basic purifier was khernips (sometimes spelled chernips), water made holy by quenching a flame in it. At a sacrifice, a burning brand from the altar was plunged into a basin of water, and the worshippers washed their hands in it and sprinkled the altar and the animal. Bowls of lustral water stood at the entrances of sanctuaries so that people could purify themselves on the way in. Hesiod gives the rule plainly:

"Never pour a libation of sparkling wine to Zeus after dawn with unwashen hands, nor to others of the deathless gods; else they do not hear your prayers but spit them back."

Sea water was also purifying. Euripides has a character say that the sea washes away all human ills, and some modern practitioners add a pinch of sea salt to their khernips for that reason. Bay leaves, sacred to Apollo, the great purifier, are a common modern choice of thing to burn.`,
            },
            {
              heading: `How to make khernips`,
              body: `Fill a clean bowl with fresh water. Light a match, a bay leaf or a small sprig of a fragrant herb, from your shrine flame or on its own. Say a short line such as "Be gone, all that is impure" if you like. Plunge the burning end into the water so it goes out with a hiss. Wash your hands, and touch the water to your face. Some people sprinkle the shrine, too.

Use khernips every time you approach the gods, even for a quick libation. Make it fresh each time, or at least each day. Afterwards, the used water carries what it has washed away, so pour it out onto the ground or down a drain, never back into the bowl you drink from.`,
            },
            {
              heading: `Modern questions about miasma`,
              body: `Modern Hellenists differ on how strictly to follow ancient purity rules. Most use khernips before every rite and avoid worship while bleeding from a wound or immediately after sex without washing. Many still observe a period of abstaining from shrine worship after a funeral, often from a few days to forty, and some groups count a death in the family as polluting the household for a time. Others think rules about menstruation and childbirth reflect ancient social attitudes, especially about women, and leave them aside; most ancient evidence for menstruation as polluting is late and thin.

Where you land is your choice, and it is fine to change it as you learn. What matters is that you approach the gods having made a deliberate break from ordinary life.`,
            },
          ],
          knowAndDont: {
            known: `Purification with water before sacrifice and prayer is everywhere in Greek literature and art. Sacred laws inscribed at sanctuaries list the days of impurity after birth, death and sex, and khernips made by quenching a brand appears in Euripides and in descriptions of sacrifice.`,
            unknown: `Rules varied from sanctuary to sanctuary and changed over time, and we rarely know what ordinary people did at home. Adding salt, or using bay leaves, is a modern habit with ancient associations rather than a recorded household recipe. Ancient rules about menstruation as polluting are poorly attested before late antiquity.`,
          },
          inPractice: `From today, make khernips before every act of worship. Keep a box of matches or a few dried bay leaves by your khernips bowl. Decide, and write down, your own purity rules for now: what makes you wait before approaching the shrine, and for how long.`,
          reflect: [
            `What, in your own life, feels like it needs washing off before you can approach something sacred?`,
            `Which ancient purity rules make sense to you, and which do you choose to set aside, and why?`,
          ],
          further: [
            `Robert Parker, Miasma: Pollution and Purification in Early Greek Religion`,
            `Hesiod, Works and Days, lines 724 to 759`,
          ],
          library: ['traditional/herb/bay', 'traditional/vessel/bowl'],
          premade: ['folk-khernips-libation'],
        },
        {
          id: 'h-offerings',
          title: `Ouranic and Chthonic: Two Ways of Giving`,
          summary: `Why offerings to the heavenly gods are burnt and shared, while offerings to the gods below and the dead are poured away and never eaten.`,
          minutes: 7,
          sections: [
            {
              heading: `Up to the sky`,
              body: `The main form of Greek public worship was thusia, a sacrifice followed by a feast. An animal was killed at a raised altar in front of the temple, in daylight. The gods received the thigh-bones wrapped in fat, burnt so that the savour rose to the sky, along with a few portions of meat and a pour of wine. The rest was cooked and eaten by the worshippers. This is the ouranic pattern, from ouranos, the sky. It belongs mainly to the Olympians: the offering goes up, and gods and people share a meal.

At home, this pattern became small bloodless offerings: incense, cakes, a little of the family meal set aside or burnt, wine poured from a cup the family then drank from. Hesiod tells his brother to sacrifice to the deathless gods "as far as you are able", with libations and incense at bedtime and at dawn.`,
            },
            {
              heading: `Down into the earth`,
              body: `Offerings to the dead, the heroes and some underworld powers looked different. They were often made at night, at a low hearth or a pit in the ground rather than a high altar. Animals might be burnt whole (a holocaust, "all-burnt") so nothing was eaten. Liquids were poured out entirely into the earth. These are called chthonic, from khthōn, earth. The logic is that what is given to the dead and the powers below goes to them completely. You do not sit down to eat with the dead.

This is why, in modern practice, offerings to chthonic gods are not shared. Hekate's supper is left at the crossroads and never eaten by the person who leaves it. Wine poured for Hades or Persephone or for the ancestors is poured out completely, not sipped first.`,
            },
            {
              heading: `The tidy picture and the messy truth`,
              body: `Older scholarship drew a hard line between the two types. Recent work, especially by Scott Scullion and Gunnel Ekroth, shows the line was blurry. Many heroes received ordinary shared sacrifices. Zeus Meilichios, an epithet of Zeus himself, received holocausts. Demeter, so close to the underworld, was given feasting festivals. Some gods had both kinds of rite in different settings.

So treat ouranic and chthonic as two modes of giving rather than two boxes to sort gods into. The questions to ask are: is this a meal shared with the god, or a gift wholly given away? Is it by day or by night? Raised up or poured down? Most modern practitioners use the sharing mode for the Olympians and the giving-away mode for the dead, for Hekate at the Deipnon and for the underworld gods.`,
            },
            {
              heading: `What to give`,
              body: `Traditional bloodless offerings include: wine mixed with water; honey; milk; olive oil; barley grains or barley groats; cakes, especially the flat round cakes called popana and pelanos (a mixture of meal, honey and oil); fruit and first fruits of the harvest; incense, especially frankincense and myrrh; flowers and garlands. Bread, cheese, eggs and a portion of a cooked meal are also good household offerings.

If you burn offerings, a small fire-safe dish with a candle or charcoal will do. Most apartment practitioners don't burn food at all: they leave it on the shrine for a while, then dispose of it. Ouranic offerings can be eaten by you afterwards if you shared them. Chthonic offerings should be buried, poured on earth or thrown away, never eaten.`,
            },
          ],
          knowAndDont: {
            known: `The procedure of thusia is described in Homer and confirmed by inscriptions, vase-paintings and bone deposits. Sacred calendars note when meat had to be eaten on the spot or wholly burnt. Low hearths (eschara) and pits for the dead are attested archaeologically.`,
            unknown: `The neat ouranic/chthonic division is a modern scholarly model, and ancient practice was more varied than it suggests. We know much less about daily household offerings than about public sacrifice. Most modern bloodless practice is a reasoned adaptation, not a direct ancient custom.`,
          },
          inPractice: `Set aside one small dish as your "given away" dish for the dead and the gods below, separate from your shared offering dish. Make or buy a plain round honey cake this week and offer part of it to Hestia and the Olympians, eating the rest yourself with thanks.`,
          reflect: [
            `How does it feel to give something you will not share, compared with sharing a meal with a god?`,
            `What in your kitchen could become a regular, honest offering?`,
          ],
          further: [
            `Gunnel Ekroth, The Sacrificial Rituals of Greek Hero-Cults`,
            `F. S. Naiden, Smoke Signals for the Gods`,
          ],
          library: ['traditional/herb/frankincense', 'traditional/herb/myrrh', 'traditional/deity/hades', 'traditional/deity/persephone'],
        },
        {
          id: 'h-libation',
          title: `The Libation`,
          summary: `How to pour wine, honey, milk or oil to the gods: the shared sponde, the wholly-given choe, and wineless offerings.`,
          minutes: 6,
          sections: [
            {
              heading: `The oldest offering`,
              body: `If you only do one thing, pour a libation. It was the simplest and most frequent Greek offering: a little liquid poured out to a god at a meal, a departure, an oath, a treaty, a prayer. Greek has several words for it. A spondē is a libation of wine poured from a cup or a shallow bowl called a phiale, a little given to the god and the rest drunk by the worshipper. The word also came to mean a truce, because truces were sealed by pouring together. A choē is a pouring-out of the whole vessel, usually for the dead and the gods below.

Wine for the Olympians was mixed with water, as Greeks drank it. Some powers were given nēphalia, wineless libations of honey, water or milk: the Eumenides (the Kindly Ones, the Furies) are a famous case in Sophocles' Oedipus at Colonus, and several sources add the Nymphs, the Muses and others.`,
            },
            {
              heading: `How to pour`,
              body: `Purify with khernips first. Hold the cup in your right hand. Pour a little out, onto the ground, into the fire, into an offering bowl or onto the altar, saying the god's name. For a shared libation, then drink some yourself; this is the god's portion and yours, poured from one cup. For a chthonic choē, pour the whole of the cup, slowly, often onto the earth or into a bowl that you will empty outside, and do not drink.

At a Greek meal, the first pour went to Hestia, or to the gods in general, and after dinner pure, unmixed wine was poured to the Agathos Daimon, the good spirit of the house. At a symposium, the first mixing bowl was dedicated to Zeus Olympios and the Olympians, the second to the heroes and the third to Zeus Soter, the Saviour.`,
            },
            {
              heading: `Hestia first and last`,
              body: `The Homeric Hymn to Hestia, in Evelyn-White's translation, puts the rule beautifully:

"Hestia, in the high dwellings of all, both deathless gods and men who walk on earth, you have gained an everlasting abode and highest honour: glorious is your portion and your right. For without you mortals hold no banquet,—where one does not duly pour sweet wine in offering to Hestia both first and last."

Modern Hellenists take this literally: in every rite, Hestia receives the first and the last libation, framing everything else. If you only have a moment, a pour to Hestia, then to the god you are honouring, then to Hestia again, is a complete small rite.`,
            },
            {
              heading: `Practical matters`,
              body: `Any wine will do, and juice is a fine substitute. Honey can be stirred into warm water, and olive oil is lovely for Hestia. Milk and honey are good for the dead and for earth powers. If you pour indoors into a bowl, leave the libation for a while (many leave it overnight) then pour it onto earth outside, into a potted plant that won't be harmed by it, or down a drain with a word of thanks. Wine and honey will kill some houseplants over time, so rotate where you pour.

Never pour from a dirty cup. Keep one cup or phiale for libations, wash it with care, and don't use it for your morning coffee.`,
            },
          ],
          knowAndDont: {
            known: `Libation scenes fill Greek vase-painting, and the vocabulary of spondē and choē, mixed and unmixed wine, and wineless libations is well attested in literature and sacred laws. The three bowls of the symposium and the after-dinner pour to the Agathos Daimon are described by several authors.`,
            unknown: `Exact household routines varied, and we don't know how often a typical family poured. "Hestia first and last" is stated in the Hymns but the strict modern rule of always beginning and ending every rite with her is a reasonable systematisation, not a recorded universal law.`,
          },
          inPractice: `Choose a cup or small bowl to be your libation vessel. Each evening this week, after khernips, pour to Hestia first, to one god you are getting to know, and to Hestia last. Pour the libation away outside the next morning.`,
          reflect: [
            `What is it like to give away something you would otherwise drink?`,
            `What changes when your day ends with a pour to Hestia?`,
          ],
          further: [
            `The Homeric Hymns, trans. H. G. Evelyn-White (Hymn 29, to Hestia, and Hymn 24, to Hestia)`,
            `Sophocles, Oedipus at Colonus, lines 466 to 492 (the libation to the Eumenides)`,
          ],
          library: ['traditional/deity/hestia', 'traditional/vessel/offering_bowl'],
          premade: ['folk-khernips-libation'],
        },
        {
          id: 'h-prayer',
          title: `Prayer: Invocation, Argument, Request`,
          summary: `The three-part shape of Greek prayer, the gestures that go with it, and how to write prayers of your own.`,
          minutes: 7,
          sections: [
            {
              heading: `Three parts`,
              body: `Greek prayers, from Homer to the inscriptions, tend to have the same bones. First comes the invocation: you name the god, with epithets, sometimes parents and favourite places, so it is clear exactly whom you address and that you know them. Next comes the argument, sometimes called the hypomnesis or "reminder": you give the god a reason to listen, usually by recalling the relationship. "If ever I gave you..." or "as you helped me before..." or "and I will give you...". Last comes the request: what you actually ask for, stated plainly.

This is kharis in words. The argument is not flattery or bargaining. It names the bond.`,
            },
            {
              heading: `Chryses prays to Apollo`,
              body: `The classic example is at the beginning of the Iliad. The priest Chryses, whose daughter has been taken by Agamemnon, prays to Apollo. In Samuel Butler's translation:

"Hear me," he cried, "O god of the silver bow, that protectest Chryse and holy Cilla and rulest Tenedos with thy might, hear me oh thou of Sminthe. If I have ever decked your temple with garlands, or burned your thigh-bones in fat of bulls or goats, grant my prayer, and let your arrows avenge these my tears upon the Danaans."

You can see all three parts: the invocation (silver bow, Chryse, Cilla, Tenedos, Sminthe), the argument (garlands and thigh-bones) and the request. Apollo hears him, and plague falls on the Greek camp. Your own requests will, one hopes, be gentler.`,
            },
            {
              heading: `Hands, voice and direction`,
              body: `Greeks usually prayed standing, aloud, with arms raised and palms turned up toward the sky when praying to the Olympians. To sea gods they might stretch their hands toward the sea. For powers below the earth, they turned their palms down, touched the ground or even struck it: in the Iliad, Althaea beats the earth with her hands as she calls on Hades and Persephone. Kneeling was less common and came to be associated with supplication. Silent prayer was unusual enough to seem suspicious; you spoke so the gods could hear.

Prayer usually went with an offering, a libation or incense, as the gift that carried the words. A hymn could replace or accompany the prayer: the Homeric and Orphic Hymns were written to be sung or recited to the gods.`,
            },
            {
              heading: `Writing your own`,
              body: `Begin with the god's name and two or three epithets that fit why you are praying. Add something they are known for, or a place sacred to them. Then give your argument honestly: what you have offered before, or that you are just beginning and offer this libation now, or what you promise to give if they help. Then ask for one clear thing, or simply give thanks. End with a line of goodbye or praise; the Homeric Hymns often close with "Hail, and I will remember you in another song."

Keep prayers short at first. A good prayer is a few true sentences, said out loud, with your hands raised and your cup ready.`,
            },
          ],
          knowAndDont: {
            known: `Hundreds of prayers survive in epic, drama, lyric poetry, hymns and inscriptions, and their structure has been studied closely (Simon Pulleyn's Prayer in Greek Religion is the standard study). Gestures of prayer are shown in vase-paintings and described in literature.`,
            unknown: `Most surviving prayers are literary or public; the everyday words of household prayer are mostly lost. The three-part scheme is a modern analysis of ancient patterns, not an ancient rulebook, and real prayers often bend it.`,
          },
          inPractice: `Write a short prayer in three parts to Hestia and another to one god you are learning about. Say them aloud with raised hands at your evening libation this week, and revise them as they settle.`,
          reflect: [
            `What argument can you honestly make to a god right now, at the very start?`,
            `How does it feel to pray aloud, standing, palms up?`,
          ],
          further: [
            `Simon Pulleyn, Prayer in Greek Religion`,
            `Homer, Iliad, trans. Samuel Butler (book 1; Project Gutenberg)`,
            `The Orphic Hymns, trans. Thomas Taylor (1792), or Apostolos Athanassakis's modern translation`,
          ],
          library: ['traditional/deity/apollo'],
        },
        {
          id: 'h-delphic',
          title: `The Delphic Maxims and Hellenic Ethics`,
          summary: `Know yourself, nothing in excess, and the wider list of sayings that modern Hellenists treat as an ethical guide.`,
          minutes: 6,
          sections: [
            {
              heading: `Words on the temple`,
              body: `At Delphi, the forecourt of Apollo's temple carried short sayings. Plato names two in the Protagoras: "Know yourself" (gnōthi sauton) and "Nothing in excess" (mēden agan). A third, "A pledge, and ruin is near", warned against rash promises. Plutarch, who served as a priest at Delphi, wrote a whole essay on a mysterious letter E dedicated there, whose meaning was already debated in his time.

"Know yourself" originally meant something like "know that you are mortal, not a god": an antidote to hubris. Philosophers, especially Socrates, turned it into a call to self-examination. Both readings are worth keeping.`,
            },
            {
              heading: `The longer list`,
              body: `A longer collection of about 147 maxims was preserved by the anthologist Stobaeus in the fifth century CE, credited to a Sosiades. A stone set up around 300 BCE by a man named Klearchos at Ai-Khanoum, a Greek city in what is now Afghanistan, copied some of them, which shows the list was travelling across the Greek world by then. In plain English, some of them say: follow the god; obey the law; worship the gods; honour your parents; help your friends; control your temper; honour the hearth (Hestia); be fair in judging; give back what you owe; respect the guest; keep a secret; do not boast of strength; be kind to all.

They are short and blunt, like proverbs. They were never a commandment list, and no one was required to follow them, but they show what educated Greeks thought a decent person looked like.`,
            },
            {
              heading: `Virtues that matter`,
              body: `Several big ideas run through Greek ethics and religion together. Sōphrosynē is self-control and soundness of mind, the opposite of excess. Dikē is justice, also a goddess, daughter of Zeus. Aidōs is respect or reverent shame, the feeling that stops you doing something unworthy before others or the gods. Xenia and kharis you know already. Philosophers added the virtues of wisdom, courage and justice, and debated whether piety could even be defined.

Modern Hellenists often draw their ethics from these sources rather than from any single law. YSEE and other groups have published their own ethical summaries built from the maxims and ancient virtues.`,
            },
            {
              heading: `Using the maxims`,
              body: `A common modern practice is to take one maxim a day, a week or a month, write it on a card at your shrine and try to live it. Another is to pair maxims with the gods: "know yourself" with Apollo, "honour the hearth" with Hestia, "respect the guest" with Zeus Xenios. Some practitioners recite a handful at the Noumenia as the month begins.

Don't use the list as a stick to beat yourself with. The maxims themselves recommend moderation.`,
            },
          ],
          knowAndDont: {
            known: `"Know yourself" and "nothing in excess" at Delphi are attested by Plato and many later writers. The longer list survives through Stobaeus and partly on the Ai-Khanoum inscription of Klearchos (around 300 BCE).`,
            unknown: `We do not know which sayings were actually inscribed at Delphi beyond the famous few, or whether Sosiades' list reflects Delphi itself. Exact wording and translation vary between versions. Their use as a modern code of ethics is a modern Hellenic practice.`,
          },
          inPractice: `Pick one maxim each week for the rest of this journey. Write it on a card on your shrine and note in your journal one time each day it was tested.`,
          reflect: [
            `Which maxim would most change your life if you really kept it?`,
            `What does "know yourself" mean to you: know your limits, or know your depths?`,
          ],
          further: [
            `Plato, Protagoras 343a to b`,
            `Plutarch, On the E at Delphi (Moralia)`,
            `Michael Scott, Delphi: A History of the Center of the Ancient World`,
          ],
          library: ['traditional/deity/apollo', 'traditional/deity/hestia'],
        },
      ],
      practices: [
        {
          id: 'h-study-evening',
          title: `Evening libation`,
          instructions: `Each evening, make khernips, pour to Hestia, to the god you are learning about and to Hestia again, and say a short prayer. Use what the week's lesson taught you: the right epithet, the three-part prayer, a wineless pour for a chthonic power.`,
          times: 42,
          every: 'day',
          prompt: `What did you offer, to whom, and what did you say?`,
          premade: 'folk-khernips-libation',
        },
        {
          id: 'h-study-noumenia',
          title: `Keep the Noumenia`,
          instructions: `When the new crescent appears, offer incense, fresh water and a small cake or fruit to the household gods, and ask for a good month. The app's Noumenia Household Blessing gives you the steps.`,
          times: 2,
          every: 'month',
          prompt: `What do you ask for this month, and what did last month bring?`,
          premade: 'folk-noumenia-blessing',
        },
      ],
    },

    // ───────────────────────────── PRACTICE ──────────────────────────────
    {
      kind: 'practice',
      title: `The Household, the Month and the Year`,
      intro: `Now you build the household shrine properly and live the Hellenic month: Noumenia, Agathos Daimon, the days of the gods and Hekate's Deipnon at month's end. You will also learn the Attic festival year, how the Greeks sought signs from the gods, and who keeps this religion alive today.`,
      days: 30,
      lessons: [
        {
          id: 'h-household',
          title: `The Household Gods and Your Shrine`,
          summary: `Hestia at the centre, Zeus Ktesios in the storeroom, Hermes and Hekate at the door, the Agathos Daimon, and how to set it all up in a flat.`,
          minutes: 8,
          sections: [
            {
              heading: `Hestia at the centre`,
              body: `In a Greek house the hearth was the religious centre. Hestia did not need a statue: the fire itself was the goddess. A newborn was carried round the hearth on the fifth or seventh day (the Amphidromia) to bring it into the family. A new bride was welcomed at it. Colonists carried fire from the hearth of their mother city to light the hearth of the new one.

You probably don't have a hearth. Most modern Hellenists use a lamp or candle as Hestia's flame, lit at the start of worship and put out at the end, or simply treat the stove as her place. Her offerings are first and last libations, olive oil, a portion of each meal and the first fruits of anything. A small oil lamp is closest to ancient practice.`,
            },
            {
              heading: `Zeus Ktesios and the kadiskos`,
              body: `Zeus Ktesios, "of the property", guarded the household's stores. He was often imagined as a snake living among the jars in the storeroom. An ancient religious handbook quoted by Athenaeus describes how to set up his kadiskos: a jar with two handles, its handles wreathed with white wool and a strand of saffron-coloured wool, filled with pure water, olive oil and "ambrosia", which the text describes as a mixture of grains and fruits. It was placed in the storeroom and given offerings.

Modern Hellenists make kadiskoi from a lidded jar: a mix of seeds and grains, water and oil (or the dry ingredients only, which keep better), wool tied round the neck. It sits in the kitchen or pantry and is topped up each Noumenia. Be practical: water, oil and grain together will go mouldy, so many use the dry form and add a few drops of oil, or empty and refresh it often.`,
            },
            {
              heading: `At the door`,
              body: `The front door had its guardians. Apollo Agyieus, "of the street", stood beside many Athenian doors as a conical pillar, sometimes garlanded and given incense. Hermes, god of boundaries and travel, guarded doorways and gates as Hermes Propylaios, "before the gate", often as a herm. And Hekate had small shrines (hekataia) at the entrance, especially where a house faced a road. She kept the threshold, the place between inside and out.

In a flat, these can be very simple: a small stone or image of Hermes by the door, a key or a little lamp for Hekate on a shelf in the hall, a sprig of bay for Apollo. Greet them as you leave and come home.`,
            },
            {
              heading: `The Agathos Daimon, and the shrine itself`,
              body: `The Agathos Daimon, the Good Spirit, is a guardian of the household's luck and wellbeing, often shown as a bearded snake. He received a pour of unmixed wine after the evening meal. Modern practice often gives him a small figure or picture of a snake, and the second day of every month.

Put your main shrine somewhere quiet and clean: a shelf at about chest height, a small table or a windowsill. A good basic layout: a lamp for Hestia at the back or centre; images or symbols of the gods you honour; an offering dish, a libation cup and an incense holder in front; your khernips bowl close by, or by the door of the room. Keep the dead and chthonic powers separate, on a lower shelf or in a different part of the house, and never put food for the dead on the main shrine. Dust it each Deipnon, and refresh it each Noumenia.`,
            },
          ],
          knowAndDont: {
            known: `The importance of the hearth, the Amphidromia, Zeus Ktesios and Herkeios, Apollo Agyieus and the hekataia at doors are all attested in literature and archaeology. The kadiskos recipe comes from Autokleides' Exegetikon, quoted in Athenaeus, Deipnosophists 11.473.`,
            unknown: `Few houses survive with shrines intact, and we know little of how most families arranged them or how often they made offerings. The four-part "Hestia, Ktesios, Hermes, Hekate" household is a modern synthesis, sensible but tidier than the evidence. The meaning of "ambrosia" in the kadiskos recipe is debated.`,
          },
          inPractice: `Set up your shrine fully this week, with a lamp for Hestia, a place for the god you are getting to know, and a small symbol for Hermes or Hekate by your front door. Make a dry kadiskos for Zeus Ktesios if you have space in your kitchen.`,
          reflect: [
            `Where is the real centre of your home, and how could Hestia be honoured there?`,
            `What crosses your threshold, and what would you like Hermes and Hekate to keep out?`,
          ],
          further: [
            `Labrys Religious Community, Hellenic Polytheism: Household Worship`,
            `Christopher A. Faraone, "Household Religion in Ancient Greece", in Household and Family Religion in Antiquity (ed. Bodel and Olyan)`,
          ],
          library: [
            'traditional/deity/hestia',
            'traditional/deity/hermes',
            'traditional/deity/hekate',
            'traditional/tool/altar',
            'traditional/herb/saffron',
          ],
          premade: ['kitchen-hearth-blessing', 'folk-noumenia-blessing'],
        },
        {
          id: 'h-month',
          title: `The Hellenic Month: Noumenia to Deipnon`,
          summary: `How the lunar month worked, which days belong to which gods, and how to keep the monthly cycle of household rites.`,
          minutes: 8,
          sections: [
            {
              heading: `A month that follows the moon`,
              body: `The Athenian month was lunar. It began when the first thin crescent appeared in the evening sky after the new moon, and lasted 29 or 30 days. The last day was called henē kai nea, "the old and the new". Each day began at sunset, not midnight, so an evening rite belongs to the day that follows it. The months had names of festivals, like Hekatombaion (the month of the hundred-ox sacrifice) and Anthesterion (the month of flowers).

Modern Hellenists usually take Noumenia as the evening when the crescent is first visible, typically a day or two after the astronomical new moon, and the Deipnon as the day before. The app's calendar does this for you.`,
            },
            {
              heading: `The holy days of every month`,
              body: `Certain days were sacred each month. The first, Noumenia, belonged to all the gods and especially the household gods; it was "the holiest of days" in later writers, a day for incense, cakes and fresh garlands. The second belonged, in modern practice, to the Agathos Daimon. The third was Athena's, the fourth belonged to Herakles, Hermes, Aphrodite and Eros, the sixth to Artemis, the seventh to Apollo (his birthday), and the eighth to Poseidon and Theseus.

You don't have to keep them all. Most people keep Noumenia and the Deipnon, and add the days of their own gods: a lamp for Artemis on the sixth, a bay leaf for Apollo on the seventh.`,
            },
            {
              heading: `Noumenia and Agathos Daimon`,
              body: `On Noumenia, clean the shrine (if you didn't on the Deipnon), make khernips, light Hestia's lamp, and offer incense, a little wine or water, and something sweet or a few grains to the household gods: Hestia, Zeus Ktesios (topping up the kadiskos), Hermes, Hekate at the door, Apollo Agyieus if you keep him. Ask for a good month. Some people put fresh flowers or bay on the shrine.

On the second day, after dinner, pour a little wine to the Agathos Daimon. Ancient Greeks poured pure wine to him after meals, and the gesture is the whole rite: a sip given to the good spirit of the house, with thanks.`,
            },
            {
              heading: `Hekate's Deipnon`,
              body: `On the last day of the month, the household cleaned itself. The sweepings and remains of household purifications were carried out, and food was left at the crossroads for Hekate, together with offerings for the restless dead. This is the Deipnon, "supper". Foods mentioned include cakes, bread, eggs, cheese, and small fish such as red mullet.

The modern rite: clean the house and shrine, take out the rubbish, purify with khernips or incense, then take a plate of food out after dark to a crossroads (or a place in your garden, or a bowl at the door), set it down and walk away without looking back. The food is not eaten: by you, your family or your guests. It belongs to Hekate and the dead. One honest note: Aristophanes jokes that the poor ate Hekate's suppers, so in Athens they were sometimes taken by the hungry. Many modern practitioners give food to a food bank on the Deipnon as well, or instead.`,
            },
          ],
          knowAndDont: {
            known: `The lunar month, the sanctity of Noumenia and the gods of the third to eighth days are attested in ancient writers and scholia. Hekate's suppers at the crossroads on the last day, and the carrying out of household purifications, are mentioned by Aristophanes, Plutarch and later lexicographers.`,
            unknown: `The detailed modern Noumenia and Deipnon rites are reconstructions from scattered references; no ancient text describes either in full. The link between the second day and the Agathos Daimon rests on thin and late evidence, though pouring to him after meals is well attested. Different cities had different month names and holy days.`,
          },
          inPractice: `Keep this month's Deipnon and the following Noumenia and Agathos Daimon in full, using the app's premade rites. Choose one more monthly day for one of your gods and keep it too.`,
          reflect: [
            `What does it feel like to end a month by cleaning and giving away, and begin by asking for blessing?`,
            `What leftovers, physical or not, would you carry to the crossroads?`,
          ],
          further: [
            `Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year`,
            `Aristophanes, Wealth (Plutus), lines 594 to 597`,
          ],
          library: ['traditional/deity/hekate', 'traditional/deity/hestia', 'traditional/deity/selene'],
          premade: ['folk-noumenia-blessing', 'folk-hekate-deipnon', 'kitchen-sweeping-out-the-old'],
        },
        {
          id: 'h-festivals',
          title: `The Attic Festival Year`,
          summary: `The great Athenian festivals through the year, what happened at each, and how to keep them at home.`,
          minutes: 8,
          sections: [
            {
              heading: `A year of festivals`,
              body: `The Athenian year began with the first new moon after the summer solstice. Athens had more festivals than any other city, well over a hundred days a year. Some were great civic events with processions and sacrifice for thousands; others were small rites kept by women, by a single family or by a village. The ones below are the major festivals the app marks, in the order they fall.

You will not keep them all, and nobody expects you to. Pick those that belong to your gods and the seasons where you live.`,
            },
            {
              heading: `Summer and autumn`,
              body: `Kronia (12 Hekatombaion), for Kronos: masters and the enslaved feasted together, remembering the golden age. Panathenaia (28 Hekatombaion), Athena's birthday: a procession carried a new peplos, a woven robe, to her ancient statue on the Acropolis, with games and sacrifice. At home: honour Athena, weave or mend something, offer olive oil.

Eleusinian Mysteries (from 15 Boedromion, nine days): initiation into the mysteries of Demeter and Persephone, kept secret. At home, honour the two goddesses with grain, poppies and pomegranates, without pretending to recreate the hidden rite. Pyanepsia (7 Pyanepsion), for Apollo: a pot of mixed beans was cooked, and boys carried the eiresione, an olive branch hung with wool, figs and little loaves, to hang over the door all year. You can make one. Thesmophoria (from 11 Pyanepsion), Demeter's festival kept by women only, for fertility of fields and families.`,
            },
            {
              heading: `Winter and spring`,
              body: `Haloa (26 Poseideon), for Demeter, Kore and Dionysus, a women's winter festival with feasting and ribald jokes. Lenaia (12 Gamelion), for Dionysus Lenaios, with comic and tragic contests. Anthesteria (11 to 13 Anthesterion), Dionysus's festival of flowers and new wine: the jars were opened, children received small jugs and garlands, and on the last day the spirits of the dead were thought to walk and were sent away with the words "Out, Keres, it is no longer Anthesteria." City Dionysia (from 10 Elaphebolion), when the great tragedies and comedies were staged.

Mounichia (16 Mounichion), for Artemis Mounichia, with round cakes ringed with small torches, amphiphontes, "shining all round", like the full moon. Thargelia (6 and 7 Thargelion), the birthdays of Artemis and Apollo, with first fruits and the purification of the city. Plynteria (25 Thargelion), when Athena's ancient statue was washed and her robes cleaned: a solemn, inauspicious day. Skira (12 Skirophorion), a midsummer women's festival of Demeter and Persephone.`,
            },
            {
              heading: `Keeping festivals at home`,
              body: `A festival day rite follows the shape you already know: khernips, Hestia first, a hymn to the festival's god (a Homeric Hymn if one exists), offerings that fit the festival, a prayer, a shared meal, Hestia last. Add one thing that belongs to the festival itself: beans and an eiresione for Pyanepsia, flowers and new wine for Anthesteria, candle-ringed cakes for Mounichia, washing your shrine images for Plynteria.

If you live in the southern hemisphere, or far from Greek seasons, you can follow the Athenian dates or shift them to your own harvests; both are done.`,
            },
          ],
          knowAndDont: {
            known: `The dates and main features of these festivals are well documented through Athenian literature, inscriptions, calendars and art, although some, like the Skira and Haloa, are known only in outline.`,
            unknown: `Women's festivals such as the Thesmophoria and Haloa are described mainly by male outsiders and later commentators. The rites of Eleusis were secret and remain unknown. Modern home versions are adaptations: no ancient household celebrated Panathenaia the way a modern Hellenist does in a flat.`,
          },
          inPractice: `Look at the app's calendar and find the next Attic festival. Plan a small home observance for it, with one ancient element that belongs to that festival, and put it in your planner.`,
          reflect: [
            `Which festival speaks to you most, and why?`,
            `How will you mark the turning of the year in your own place and season?`,
          ],
          further: [
            `H. W. Parke, Festivals of the Athenians`,
            `Erika Simon, Festivals of Attica`,
            `The Homeric Hymn to Demeter (Evelyn-White translation)`,
          ],
          library: [
            'traditional/deity/athena',
            'traditional/deity/demeter',
            'traditional/deity/persephone',
            'traditional/deity/dionysus',
            'traditional/deity/artemis',
            'traditional/deity/apollo',
          ],
        },
        {
          id: 'h-divination',
          title: `Oracles and Signs, Honestly`,
          summary: `How Greeks consulted Delphi, Dodona and other oracles, what kinds of everyday divination they used, and what a modern practitioner can honestly do.`,
          minutes: 7,
          sections: [
            {
              heading: `The great oracles`,
              body: `At Delphi, the Pythia, a woman of the town who served as Apollo's prophetess, sat on a tripod in the inner temple and gave answers inspired by the god. Consultations happened on set days, originally only Apollo's birthday on the seventh of the month, and a goat was sprinkled with cold water first: if it shivered, the god was willing. Answers came through male priests, sometimes in verse. Whether vapours from the rock played a part is still debated by geologists and historians.

At Dodona, Zeus spoke through the rustling of a sacred oak and other signs. Over four thousand small lead tablets survive there, scratched with ordinary people's questions: should I marry, is the child mine, will this trade go well. Other oracles included Apollo at Didyma and Claros, and the healing sanctuaries of Asklepios, where the sick slept in the temple hoping for a dream of the god.`,
            },
            {
              heading: `Everyday divination`,
              body: `Most Greeks never went to Delphi. They looked for signs nearer to hand. Seers read the entrails of sacrificed animals, and the flight and calls of birds. Dreams were taken seriously. A sneeze at the right moment could count as an omen. A kledōn was a chance word overheard, taken as a message.

Pausanias describes an oracle of Hermes in the marketplace at Pharai. At evening you burned incense on the hearth, filled and lit the lamps, put a coin on the altar, and whispered your question into the statue's ear. Then you covered your ears and walked out of the marketplace. When you uncovered them, the first words you heard were the answer. In parts of Asia Minor, people threw knucklebones or dice whose results matched lines on inscribed stone oracles, each linked to a god.`,
            },
            {
              heading: `What we can and can't do now`,
              body: `There is no living Pythia, and no modern group has an oracle with ancient authority. Be wary of anyone claiming to speak for Apollo on behalf of the community. That doesn't mean divination is closed to you. Many Hellenists use a simple form of the Pharai method: a question whispered to Hermes, ears covered, the first words heard. Others use knucklebones or dice with a list of answers, or a simple yes/no lot. Some keep a dream journal and ask a god for a dream before sleep. Tarot and other modern systems are also used, but they are not Greek.

Treat signs as conversation, not commands. Greeks argued with oracles, reinterpreted them and sometimes consulted twice. And never let divination replace sense: a seer could read the entrails, but a good general still looked at the ground.`,
            },
          ],
          knowAndDont: {
            known: `The workings of Delphi are described by Herodotus, Plutarch (himself a Delphic priest) and others; the Dodona tablets survive; Pausanias describes the Pharai oracle (7.22.2 to 3); dice and knucklebone oracle inscriptions survive from southern Asia Minor; incubation healing records survive from Epidauros.`,
            unknown: `What the Pythia experienced, and how exactly she spoke, is uncertain. The vapour theory is contested. Modern Hellenic divination methods are adaptations or personal practice; none has the authority of an ancient oracle, and the app doesn't claim otherwise.`,
          },
          inPractice: `Try the Pharai method once with a real but low-stakes question. Make khernips, light a lamp and incense, place a coin on your shrine for Hermes, whisper the question, cover your ears and step outside or to a window. Note the first words you hear, and what you make of them.`,
          reflect: [
            `What would you want to ask an oracle, and why?`,
            `How will you tell the difference between a sign and your own wishes?`,
          ],
          further: [
            `Sarah Iles Johnston, Ancient Greek Divination`,
            `Pausanias, Description of Greece, book 7 chapter 22`,
            `Plutarch, The Oracles at Delphi No Longer Given in Verse (Moralia)`,
          ],
          library: ['traditional/deity/apollo', 'traditional/deity/hermes'],
          premade: ['hedge-dark-bowl-scrying'],
        },
        {
          id: 'h-community',
          title: `Modern Hellenic Communities and What to Read Next`,
          summary: `YSEE, Labrys, Hellenion and the wider movement: where they agree, where they differ, and how to find your place.`,
          minutes: 7,
          sections: [
            {
              heading: `In Greece`,
              body: `Revival of the old religion in Greece began quietly in the twentieth century and grew from the 1990s. YSEE, the Supreme Council of Ethnikoi Hellenes, was founded in 1997. It calls the religion the ethnic Hellenic religion, holds public rites, including ceremonies at ancient sites, and campaigns for legal recognition; in 2017 a Greek court granted the religion legal status as a "known religion", allowing public places of worship. YSEE is a member of the European Congress of Ethnic Religions.

Labrys, a religious community founded in Athens in the 2000s, focuses on household worship, philosophy and festivals, and has published a well-regarded practical book in English. Other Greek groups exist, some more nationalistic than others. Many Greek practitioners face social pressure in a country where the Orthodox Church is part of national identity.`,
            },
            {
              heading: `Outside Greece`,
              body: `In the English-speaking world, Hellenion, a US-based organisation founded in 2001, follows the Attic calendar and has local groups (called proto-demoi and demoi). Elaion is another US organisation, and there are many online communities, blogs and podcasts. Practitioners vary from strict reconstructionists to people who mix Greek gods with Neoplatonism, with witchcraft or with their own personal practice.

Some disagreements you will meet: whether to perform animal sacrifice (most don't; a very few consider it); how strict to be about miasma; whether non-Greeks can fully belong; whether Neoplatonic philosophy, which came late, should shape the religion; and whether eclectic practice is "real". The app's view is simple: everyone may honour these gods, ancestry is not a condition, and accurate knowledge matters more than purity of label.`,
            },
            {
              heading: `Finding your place`,
              body: `Many Hellenists practise alone, especially at first. Household worship, which is the heart of this journey, needs no group. If you want community, look for a group whose practice you've seen, ideally one that welcomes questions and whose leaders don't claim special authority from the gods. Be cautious with any group that insists on ethnic belonging, demands money for "initiation" into Hellenismos, or claims secret ancient lineages; there are none.

Festivals are a good way to meet others. Many groups hold public or online rites for the Panathenaia, Anthesteria or Dionysia.`,
            },
            {
              heading: `What to read next`,
              body: `For ancient sources: Hesiod and the Homeric Hymns (Evelyn-White), Homer's Iliad and Odyssey, the Orphic Hymns (Taylor or Athanassakis), Pausanias, and the plays of Euripides and Aristophanes. For scholarship: Walter Burkert's Greek Religion; Jon Mikalson's Ancient Greek Religion; Robert Parker's Miasma and On Greek Religion; Simon Pulleyn's Prayer in Greek Religion; Jennifer Larson's Ancient Greek Cults. For modern practice: the Labrys community's Hellenic Polytheism: Household Worship, and Drew Campbell's Old Stones, New Temples. Read primary texts alongside the modern ones, and notice where they differ.`,
            },
          ],
          knowAndDont: {
            known: `YSEE was founded in 1997 and its religion was legally recognised in Greece in 2017. Labrys and Hellenion are well-established organisations with public writing and calendars.`,
            unknown: `Numbers of practitioners are not known with any accuracy; estimates for Greece range from a few thousand upward. Modern groups change, split and reform, and online communities are especially fluid.`,
          },
          inPractice: `Look up YSEE, Labrys and Hellenion online and read one statement of belief or practice from each. Note one thing you share with each and one thing you would do differently.`,
          reflect: [
            `Do you want community, solitude, or both?`,
            `What does it mean to you to practise a religion that belongs culturally to another country?`,
          ],
          further: [
            `Labrys Religious Community, Hellenic Polytheism: Household Worship`,
            `Drew Campbell, Old Stones, New Temples`,
            `Walter Burkert, Greek Religion`,
          ],
        },
      ],
      practices: [
        {
          id: 'h-practice-month',
          title: `Keep the whole month`,
          instructions: `Through this stage, keep the Deipnon, the Noumenia and the Agathos Daimon in full, and at least one day of a god you honour. Use the app's premade rites for Noumenia and Deipnon.`,
          times: 1,
          every: 'month',
          prompt: `Which day of the month felt most alive to you, and why?`,
          premade: 'folk-hekate-deipnon',
        },
        {
          id: 'h-practice-maxim',
          title: `A maxim a week`,
          instructions: `Each week, choose one Delphic maxim, place it on your shrine and practise it. At the end of the week, write what happened.`,
          times: 4,
          every: 'week',
          prompt: `Where did this week's maxim meet your real life?`,
        },
        {
          id: 'h-practice-festival',
          title: `Keep one festival`,
          instructions: `Choose one Attic festival falling in or near this stage, and keep it at home with khernips, Hestia first, a hymn, a festival offering, a prayer, a shared meal and Hestia last.`,
          times: 1,
          every: 'holy-day',
          prompt: `What did the festival teach you about its god?`,
        },
      ],
    },

    // ──────────────────────────── DISCERNMENT ────────────────────────────
    {
      kind: 'discernment',
      title: `Is This My Path?`,
      intro: `Before you dedicate, stop and look honestly at these weeks. The Greeks valued "nothing in excess" and "know yourself"; both apply here. Stopping, pausing, choosing a different path or simply continuing to honour the gods without a dedication are all good outcomes. Nothing is failed by deciding not to go on. A dedication made in doubt is worth less than an honest "not yet".`,
      days: 10,
      lessons: [],
      practices: [
        {
          id: 'h-discern-journal',
          title: `Read back`,
          instructions: `Read your journal from the opening rite to now. Notice what you kept doing without effort, what you skipped, and which gods you found yourself returning to.`,
          times: 1,
          prompt: `What does your own record tell you about this path?`,
        },
        {
          id: 'h-discern-ask',
          title: `Ask the gods`,
          instructions: `With khernips and a libation to Hestia, ask the gods plainly whether you should go on to dedication. Use a simple lot (a coin, a die, knucklebones) or the Pharai method. Whatever comes, sleep on it, and weigh it alongside your own judgement.`,
          times: 1,
          prompt: `What answer came, and what does your own judgement say?`,
        },
      ],
      questions: [
        `Did household worship, khernips and libation become something you want to keep doing, or did it feel like a chore?`,
        `Are you drawn to the Greek gods themselves, or mainly to the stories, art or aesthetic? Both are fine, but they lead to different places.`,
        `Can you keep the monthly rhythm, or something like it, for a year?`,
        `How do you hold the difficult parts: sacrifice, purity rules, violent myths, the nationalism of some groups?`,
        `Would a looser, eclectic practice, or a different path entirely, suit you better? If so, that is a good discovery.`,
        `Is now the right time, or would a pause serve you better?`,
      ],
    },

    // ──────────────────────────── DEDICATION ─────────────────────────────
    {
      kind: 'dedication',
      title: `Dedication to the Gods of the Hellenes`,
      intro: `If you have chosen to go on, this is the rite in which you dedicate yourself to the worship of the Greek gods, ideally on a Noumenia. It is a self-dedication: your own promise to the gods, in the manner of a Greek vow, made freely and kept honestly. It is not an initiation into any mystery, group or priesthood, and does not replace the membership rites of groups such as YSEE or Hellenion, or the initiations of ancient mysteries, which are lost.`,
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'h-dedication-prepare',
          title: `Prepare`,
          instructions: `On the Deipnon before, clean your house and shrine thoroughly, carry out the rubbish and leave Hekate her supper. Write your vow: what you will offer the gods this year (for example, keeping Noumenia and Deipnon, a libation to Hestia each evening, one festival per season). Promise only what you can keep. Bathe and wear clean clothes on the day.`,
          times: 1,
          prompt: `Write out your vow exactly as you will say it.`,
        },
      ],
      rite: {
        title: `Rite of Dedication`,
        summary: `A full household rite in the Greek shape: purification, procession to the shrine, Hestia first, barley and incense, hymn, the vow spoken with an offering, a shared meal and Hestia last.`,
        minutes: 40,
        ingredients: [
          { name: `Khernips bowl with fresh water and a bay leaf or match`, ref: 'traditional/herb/bay' },
          { name: `A lamp or candle for Hestia`, ref: 'traditional/candle/white' },
          { name: `Frankincense or other incense`, ref: 'traditional/herb/frankincense' },
          { name: `A small bowl of whole barley grains (or other grain)`, ref: 'traditional/vessel/bowl' },
          { name: `Wine mixed with water, or grape juice, and a libation cup` },
          { name: `A round honey cake or a flat loaf` },
          { name: `An offering bowl`, ref: 'traditional/vessel/offering_bowl' },
          { name: `Your written vow` },
          { name: `A garland or fresh flowers`, optional: true },
          { name: `A copy of a Homeric Hymn to read` },
        ],
        preparation: `Set out your shrine with the lamp at the centre, the god or gods you honour around it, the offering bowl, cup, barley and cake in front. Have the khernips bowl at the door of the room. If you wear a garland, as Greeks did at sacrifice, have it ready. Read through the rite once beforehand, and choose a Homeric Hymn to read: Hymn 29 to Hestia, or the hymn of your chosen god.`,
        steps: [
          {
            title: `Purify at the threshold`,
            instructions: `At the door of the room, light a bay leaf or match and plunge it into the water. Wash your hands, touch your face, and sprinkle a few drops ahead of you toward the shrine. Put on your garland if you have one. Walk to the shrine in silence, as a procession.`,
            spoken: `Be gone, all that is impure. I come clean before the gods.`,
            light: true,
          },
          {
            title: `Hestia first`,
            instructions: `Light Hestia's lamp if it isn't lit. Pour the first libation to her.`,
            spoken: `Hestia, first-born and last-born of Kronos, keeper of the hearth, honoured first in every house of gods and mortals: this first share is yours. Stand at the centre of what I do today.`,
          },
          {
            title: `Barley and incense`,
            instructions: `Take a pinch of barley and scatter it on the shrine or into the offering bowl, as Greeks scattered barley at the start of sacrifice. Light the incense and let it rise.`,
            spoken: `Barley for the gods, as it was given of old. Smoke for the gods, to rise where you dwell.`,
          },
          {
            title: `The hymn`,
            instructions: `Raise your hands, palms up, and read the Homeric Hymn you have chosen, slowly and aloud.`,
          },
          {
            title: `Invocation and argument`,
            instructions: `Name the gods you are dedicating to: all the gods, and by name any you especially honour, with their epithets. Then make your argument: tell them what you have done over these weeks, the libations, the Noumenias, the Deipna.`,
            spoken: `Gods of the Hellenes, Olympians and gods of the earth, heroes and nymphs and the good spirits of this house: hear me. For these weeks I have washed my hands and poured to you, kept the new moon and the old, and learned your names. Now I ask to be counted among those who honour you.`,
          },
          {
            title: `The vow`,
            instructions: `Read your vow aloud, exactly as written. As you finish, place the cake in the offering bowl and pour a full libation to all the gods, from the same cup you will drink from.`,
            spoken: `This I promise, for a year and a day, freely and according to my means. Receive this cake and this wine as the beginning of my keeping it.`,
          },
          {
            title: `Share the meal`,
            instructions: `Break off a piece of the cake and set it aside in the bowl as the gods' share. Sip from the libation cup and eat a piece of the cake yourself: this is an ouranic offering, a meal shared with the gods.`,
          },
          {
            title: `Hestia last`,
            instructions: `Pour the last libation to Hestia, and give thanks.`,
            spoken: `Hestia, the last share is yours, as the first was. Keep my hearth and keep my vow.`,
          },
          {
            title: `Close`,
            instructions: `Stand for a minute in silence, then put out the flame. Leave the gods' share of cake and wine on the shrine until the next morning, then place it outside on earth or dispose of it respectfully. Pour out the khernips.`,
            snuff: true,
          },
        ],
        closing: `Write your vow in your journal with today's date, and a note of how the rite went. You will renew it a year from now.`,
        safety: `Never leave a lamp, candle or incense unattended; use a heat-proof holder and ventilate the room, and skip incense with asthma or pet birds. Use grape juice if you avoid alcohol. Keep offerings of wine, grapes, cake (if it contains chocolate or raisins) and barley away from pets, and check that anything you leave outside is safe for local animals.`,
      },
    },

    // ───────────────────────────── ONGOING ───────────────────────────────
    {
      kind: 'ongoing',
      title: `Keeping Kharis`,
      intro: `Dedication is a beginning. A Hellenic practice lives in the small rhythms: Hestia's lamp, the evening libation, the Noumenia and Deipnon each month, the festivals as they come round, and a vow renewed each year. When life gets busy, shrink the practice rather than dropping it; a single pour to Hestia keeps the bond. When you miss something, simply begin again at the next Noumenia.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'h-ongoing-month',
          title: `Noumenia, Agathos Daimon and Deipnon`,
          instructions: `Keep the three monthly days. On the Deipnon, clean and leave Hekate's supper; on the Noumenia, bless the house and refresh the kadiskos; on the second day, pour to the Agathos Daimon after dinner.`,
          times: 12,
          every: 'month',
          prompt: `What did this month bring, and what do you ask of the next?`,
          premade: 'folk-noumenia-blessing',
        },
        {
          id: 'h-ongoing-festivals',
          title: `The festivals`,
          instructions: `Keep the Attic festivals of your gods, and at least one in each season. Use the app's calendar to plan ahead.`,
          times: 8,
          every: 'holy-day',
          prompt: `Which festival did you keep, and what did you do?`,
        },
        {
          id: 'h-ongoing-renew',
          title: `Renew your vow`,
          instructions: `On the Noumenia closest to a year after your dedication, repeat the dedication rite. Before it, read your record of offerings for the year, thank the gods for what came, and write a new vow, adjusted to what you can really keep.`,
          times: 1,
          prompt: `What did your vow this year give you, and what will you promise next?`,
        },
      ],
    },
  ],
  sources: [
    `Hesiod, Works and Days, lines 336 to 341 and 724 to 726, trans. H. G. Evelyn-White (1914), Project Gutenberg ebook 348: https://www.gutenberg.org/ebooks/348 (public domain).`,
    `Homeric Hymn 29, To Hestia, lines 1 to 6, trans. H. G. Evelyn-White (1914), Project Gutenberg ebook 348 (public domain).`,
    `Homer, Iliad book 1 (Chryses' prayer), trans. Samuel Butler (1898), Project Gutenberg ebook 2199: https://www.gutenberg.org/ebooks/2199 (public domain).`,
    `Athenaeus, Deipnosophists 11.473 (Autokleides on the kadiskos of Zeus Ktesios).`,
    `Pausanias, Description of Greece 7.22.2 to 3 (the oracle of Hermes at Pharai).`,
    `Plato, Protagoras 343a to b (the Delphic sayings); Stobaeus, Anthology 3.1.173 (the maxims of Sosiades); the Ai-Khanoum inscription of Klearchos.`,
    `Aristophanes, Wealth (Plutus) 594 to 597 (Hekate's suppers).`,
    `Walter Burkert, Greek Religion (1985).`,
    `Robert Parker, Miasma: Pollution and Purification in Early Greek Religion (1983).`,
    `Simon Pulleyn, Prayer in Greek Religion (1997).`,
    `Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (1975).`,
    `Gunnel Ekroth, The Sacrificial Rituals of Greek Hero-Cults (2002); Scott Scullion, "Olympian and Chthonian", Classical Antiquity 13 (1994).`,
    `Sarah Iles Johnston, Ancient Greek Divination (2008).`,
    `Labrys Religious Community, Hellenic Polytheism: Household Worship (2014).`,
  ],
};
