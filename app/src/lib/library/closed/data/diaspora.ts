// African and African diaspora traditions for the "Closed & living traditions"
// guide. These entries explain; they never teach. No workings, ceremonies,
// prayers, songs, vèvè or spirit names for casual use appear here.
//
// Facts checked against scholarship and community sources (see the reading
// lists). Where history is contested, the entries say so.

import type { ClosedTradition } from '../types';

export const DIASPORA: ClosedTradition[] = [
  // ───────────────────────────────────────────────────────────── Hoodoo
  {
    id: 'hoodoo',
    name: 'Hoodoo',
    aka: ['Rootwork', 'Conjure', 'Root doctoring', 'Working roots'],
    group: 'african-diaspora',
    openness: 'debated',
    peoples:
      "African American, born among enslaved Africans and their descendants in the American South, and carried north and west by the Great Migration.",
    summary:
      "Hoodoo is African American folk magic and healing: a body of ancestral knowledge, not a religion, shaped by Black Americans under slavery and Jim Crow. Whether outsiders should practise it is a live debate within the Black community itself.",
    sections: [
      {
        heading: 'What it is',
        body:
          "Hoodoo, also called rootwork or conjure, is a practical tradition of protection, healing, luck, justice and spiritual help. It was carried by Black families and community specialists, often called root doctors or conjure doctors, and handed down through kin and neighbourhood rather than through books.\n\nIt is not a religion and has no priesthood or initiation in the formal sense. Most traditional practitioners were and are Christian, and the Bible, especially the Psalms, sits at its heart alongside the honouring of ancestors. It draws on West and Central African (especially Kongo) ways of seeing the world, and over time absorbed some Native American plant knowledge and European folk material.",
      },
      {
        heading: 'Where it comes from',
        body:
          "Hoodoo grew among enslaved people in the American South, where it offered healing when doctors would not treat them, protection when the law would not, and a sense of power in a system built to deny it. Historians such as Yvonne Chireau and Katrina Hazzard-Donald trace how it survived slavery, emancipation and Jim Crow, and how practitioners were often both respected and feared in their own communities.\n\nIn the early twentieth century, mail-order curio companies and drugstores, many of them not Black-owned, began packaging and selling 'hoodoo' products to a mass market. Hazzard-Donald distinguishes this 'marketeered' hoodoo from the older, community-rooted tradition. That history of others profiting from Black knowledge is part of why the openness debate matters so much today.",
      },
      {
        heading: 'Hoodoo is not Voodoo',
        body:
          "Hoodoo is often confused with Vodou or Voodoo, partly because the words sound alike and partly because New Orleans, where Louisiana Voodoo and Hoodoo meet, blurred them in the popular imagination. They are different things. Haitian Vodou and Louisiana Voodoo are religions with spirits, priests and initiation. Hoodoo is a folk practice, mostly lived by Protestant Black Southerners.",
      },
      {
        heading: "A note on 'mojo bags' and our word 'charm bag'",
        body:
          "In Hoodoo, the small cloth bag carried for luck or protection has its own names: mojo, mojo hand, hand, toby, gris-gris (a word shared with Louisiana), and in Memphis the 'nation sack' carried by women. These names belong to the tradition and to its history.\n\nCarrying herbs and objects in a pouch is a very widespread human practice, found in many cultures. When this app talks about the practice in its own spells, it uses the plain term 'charm bag' on purpose, so that we don't present our work as Hoodoo or borrow its language.",
      },
    ],
    howPeopleComeIn:
      "Traditionally, through family and community: a grandmother, an uncle, a neighbour who was known for the work. Knowledge was passed down in the home and the church, alongside lived experience of Black Southern life. There is no initiation to buy. Many Black practitioners today describe coming into it by reclaiming what their families knew, talking with elders and researching their own ancestry.",
    openAndClosed:
      "This is genuinely debated, and the clearest voices to listen to are Black ones. Many Black practitioners hold that Hoodoo is closed: it is ancestral, it was forged in the specific experience of enslavement and anti-Black oppression, and its practice is inseparable from Black American heritage and ancestor veneration. From that view, non-Black people can learn about its history and respect it, but should not practise it or call what they do Hoodoo.\n\nOther Black rootworkers do teach respectful outsiders, often with conditions: honour its Black roots, credit and pay Black teachers, learn the history and don't strip it of its Christian and ancestral framework. Some point out that the tradition has always absorbed outside influences.\n\nWhat almost everyone agrees on: Hoodoo should not be commodified by people outside the community, its history should not be erased, and it should not be rebranded as generic 'witchcraft'. This app does not teach Hoodoo. If you feel drawn to it, the respectful starting point is to read Black scholars and practitioners and hear the debate from them directly.",
    myths: [
      {
        myth: 'Hoodoo is the same as Voodoo.',
        truth:
          'Hoodoo is African American folk magic, largely Christian in framework. Vodou and Voodoo are religions with their own priesthoods and initiations.',
      },
      {
        myth: 'Hoodoo is dark or evil magic.',
        truth:
          'Most traditional work was about healing, protection, love, luck, justice and survival. The stereotype grew from racist fear of Black spiritual power.',
      },
      {
        myth: 'Buying products labelled "hoodoo" means you practise Hoodoo.',
        truth:
          'Much of what is sold under that label is a twentieth-century commercial product. The tradition lives in Black families and communities, not in a catalogue.',
      },
    ],
    please: [
      "Please don't call your practice Hoodoo, rootwork or conjure unless you come from it or have been brought into it by Black teachers.",
      "Please don't sell 'mojo bags', 'hoodoo kits' or 'conjure oils'.",
      "Please don't treat Hoodoo as an aesthetic or a trend separate from Black history.",
      'Please do pay and credit Black authors, teachers and shop owners when you learn about it.',
    ],
    learn:
      "Start with history written by Black scholars and practitioners, and listen to the debate from Black rootworkers themselves before deciding anything. Support Black-owned spiritual shops and botánicas, Black authors and Black-led history projects. If you are Black American and drawn to the tradition, many practitioners recommend beginning with your own family: elders' memories, family Bibles, ancestral research.",
    reading: [
      "Katrina Hazzard-Donald, Mojo Workin': The Old African American Hoodoo System (2013)",
      'Yvonne P. Chireau, Black Magic: Religion and the African American Conjuring Tradition (2003)',
      'Jeffrey E. Anderson, Conjure in African American Society (2005)',
      'Zora Neale Hurston, Mules and Men (1935)',
      'Stephanie Rose Bird, Sticks, Stones, Roots & Bones: Hoodoo, Mojo & Conjuring with Herbs (2004)',
    ],
    related: ['louisiana-voodoo', 'haitian-vodou', 'obeah'],
  },

  // ───────────────────────────────────────────────────────────── Haitian Vodou
  {
    id: 'haitian-vodou',
    name: 'Haitian Vodou',
    aka: ['Vodou', 'Vodoun', 'Sèvis Lwa', 'Serving the spirits', 'Vaudou'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'The Haitian people, in Haiti and across the Haitian diaspora (notably New York, Miami, Montreal and Paris).',
    summary:
      'Haitian Vodou is a religion forged in colonial Saint-Domingue by enslaved Africans of many nations, centred on serving the lwa (spirits) and the ancestors within a community led by priests and priestesses. It is entered through houses and initiation.',
    sections: [
      {
        heading: 'What it is',
        body:
          "Vodou is a complete religion. Its followers, who often call themselves those who 'serve the spirits', recognise a distant creator, Bondye, and serve the lwa, spirits who are close to human life, along with the ancestors. Worship is communal: drumming, song, dance and offerings in a temple (ounfò) under an oungan (priest) or manbo (priestess).\n\nIt is a family and community religion as much as a personal one. Many Haitians inherit relationships with particular lwa through their family line and land. Most Vodou practitioners also consider themselves Catholic; the two have lived side by side for centuries.",
      },
      {
        heading: 'Where it comes from',
        body:
          "Vodou took shape in the French colony of Saint-Domingue, where enslaved people from Dahomey (Fon), Yorubaland, Kongo and many other African nations were brought in vast numbers to work the sugar and coffee plantations, one of the most brutal slave regimes in the Americas. Different African religious lineages, survivals and Catholic elements came together into the 'nations' (nanchon) of spirits Vodou still honours.\n\nVodou is closely tied to the Haitian Revolution (1791–1804), which ended slavery and created the first independent Black republic. Haitian tradition holds that the uprising was sealed at a ceremony at Bois Caïman in August 1791, led by Dutty Boukman and, in many tellings, the manbo Cécile Fatiman.",
      },
      {
        heading: 'Bois Caïman: tradition and history',
        body:
          "Bois Caïman is a founding story of the Haitian nation, and many Haitians hold it as sacred history. Historians agree that enslaved leaders met in mid-August 1791, shortly before the uprising of 22 August. The details of the ceremony itself rest on thin early sources, the main one written by a hostile French colonist, Antoine Dalmas, and published in 1814.\n\nScholars disagree about the date (14 or around 21 August), the place, and how much later writers embellished it. Some sceptics have argued the ceremony was largely invented; others, such as the historian David Geggus, conclude that a ceremony probably did happen but was elaborated afterwards. Both things can be held at once: Bois Caïman is a real tradition of enormous meaning, and its precise details are historically uncertain.\n\nThe story has also been twisted. Some outsiders have claimed Haiti made a 'pact with the devil' at Bois Caïman, a slander that has been repeated even after national disasters. It reflects centuries of hostility to Black freedom and to Vodou, not anything in the tradition.",
      },
      {
        heading: 'Persecution and recognition',
        body:
          "Vodou was suppressed under French colonial law and then by successive Haitian governments and the Catholic Church. A 1935 decree-law outlawed 'superstitious practices', and in the early 1940s a Church-backed 'anti-superstition' campaign destroyed temples and sacred objects. During the US occupation of Haiti (1915–1934), American writers spread sensational 'voodoo' stories that fed Hollywood for decades.\n\nArticle 297 of the 1987 constitution, won after protests that included a large march in 1986, abrogated the 1935 decree-law by name. An April 2003 decree under President Aristide recognised Vodou as a religion, allowing its priests to perform legally recognised ceremonies such as marriages. A constitutional amendment that took effect in 2012 dropped Article 297, which worried many Vodou leaders; the government said the 2003 recognition still stands. Practitioners still face stigma and, at times, violence.",
      },
    ],
    howPeopleComeIn:
      "Many Haitians are born into the religion and inherit their family's spirits. Others come in by attending ceremonies at a house (sosyete) and building a relationship with an oungan or manbo over time. There are several levels of initiation (kanzo being the best known), carried out within a lineage and a community. A person's path is usually discerned through the community and the spirits, not chosen from a menu.",
    openAndClosed:
      "Vodou is initiatory. It does not belong only to Haitians by blood, and there are respected non-Haitian initiates, but it is entered through a real house, a real lineage and real relationships, usually over years. Public ceremonies may welcome respectful visitors if a member invites them. What is not open: the initiatory knowledge, the ritual songs, vèvè and secrets, which are learned only inside the community. Serving the lwa outside that structure, from books or videos, is not Vodou and many practitioners consider it disrespectful and spiritually unwise.",
    myths: [
      {
        myth: "Voodoo dolls stuck with pins are part of Vodou.",
        truth:
          "Pin-stuck dolls are not a feature of Haitian Vodou. The image comes mainly from European folk magic, early twentieth-century travel writing and Hollywood films. Dolls and figures do appear in some Vodou spaces, but not as the cursing tools of the movies.",
      },
      {
        myth: 'Vodou is devil worship or black magic.',
        truth:
          'Vodou is a religion of community, healing, ancestors and service to the spirits. The "devil worship" label came from colonial and missionary hostility.',
      },
      {
        myth: 'Haiti made a pact with the devil at Bois Caïman.',
        truth:
          "This is a slander. Bois Caïman is honoured in Haiti as a sacred moment in the fight against slavery.",
      },
      {
        myth: 'Zombies in the films are what Vodou is about.',
        truth:
          'The Hollywood zombie owes far more to American fiction than to Haitian religion. Haitian folklore about the zonbi is mostly a story about the horror of enslavement and losing one\'s will, not a practice of the faith.',
      },
    ],
    please: [
      "Please don't call your practice Vodou unless you've been brought into a house.",
      "Please don't use lwa names or vèvè as décor, tattoos or merchandise.",
      "Please don't buy initiations online or from anyone without a real community behind them.",
      "Please don't attend ceremonies uninvited or film them without permission.",
      "Please don't sell or buy 'voodoo dolls'.",
    ],
    learn:
      "Read Haitian and Vodou-practising authors and serious scholars first. Support Haitian artists, musicians and community organisations, and learn about Haiti's history beyond the headlines. If you feel a real call, the only path in is through a legitimate house, which takes time, humility and relationship.",
    reading: [
      'Mambo Chita Tann, Haitian Vodou: An Introduction to Haiti\'s Indigenous Spiritual Tradition (2012)',
      'Karen McCarthy Brown, Mama Lola: A Vodou Priestess in Brooklyn (1991)',
      'Kate Ramsey, The Spirits and the Law: Vodou and Power in Haiti (2011)',
      'Leslie G. Desmangles, The Faces of the Gods: Vodou and Roman Catholicism in Haiti (1992)',
      'Maya Deren, Divine Horsemen: The Living Gods of Haiti (1953)',
      'David Geggus, Haitian Revolutionary Studies (2002)',
    ],
    community: [
      'KOSANBA, the scholarly association for the study of Haitian Vodou, founded in 1997 at the University of California, Santa Barbara',
    ],
    related: ['west-african-vodun', 'louisiana-voodoo', 'hoodoo'],
  },

  // ───────────────────────────────────────────────────────────── Louisiana Voodoo
  {
    id: 'louisiana-voodoo',
    name: 'Louisiana / New Orleans Voodoo',
    aka: ['New Orleans Voodoo', 'Louisiana Voodoo', 'Voudou', 'Voudoun'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'Black and Creole communities of New Orleans and south Louisiana, with roots in Senegambia, the Bight of Benin, Kongo and Haiti.',
    summary:
      'Historic New Orleans Voodoo was an African-rooted religion of the city\'s free and enslaved Black and Creole people. It is distinct both from Haitian Vodou and from the tourist "Voodoo" sold on Bourbon Street today.',
    sections: [
      {
        heading: 'Historic Voodoo',
        body:
          "Voodoo in New Orleans grew among enslaved and free Black people in French and then Spanish colonial Louisiana, drawing on West and Central African religion and Catholicism. Its practice was strengthened when refugees from the Haitian Revolution, many travelling via Cuba, arrived in the city around 1809, roughly doubling its population and bringing Saint-Domingue Vodou with them.\n\nIn the nineteenth century, Voodoo had priestesses and priests, ceremonies, healing and spiritual consultation. Gatherings, including those on St John's Eve, were reported in the press, usually with lurid racism. Sunday gatherings of enslaved people in Congo Square, famous for drumming and dance, are often linked with Voodoo in popular memory, though historians caution that Congo Square was a broader cultural space.",
      },
      {
        heading: 'Suppression and the blending with Hoodoo',
        body:
          "Authorities repeatedly tried to control Black gatherings, and the Voodoo community was policed and mocked in the press. By the early twentieth century, much organised Voodoo had faded or gone underground, while the practical side lived on in Louisiana Hoodoo and in the city's Spiritual churches. Scholars such as Kodi Roberts have shown how practitioners worked as spiritual professionals in this period.",
      },
      {
        heading: 'Marie Laveau: myth and history',
        body:
          "Marie Laveau (c. 1801–1881), a free woman of colour, was New Orleans's most famous Voodoo priestess. The historical record shows a Catholic woman, a hairdresser and healer who nursed the sick during yellow fever epidemics, and who visited and ministered to prisoners. She was a respected and powerful figure in her community.\n\nMuch of the rest is legend: secret spy networks among the households she served, ceremonies with a great snake, magical feats, and a belief that she never aged, which probably grew from confusion with her daughter, also named Marie, who may have carried on her work. Historians Carolyn Morrow Long and Ina Johanna Fandrich have worked to separate record from story.\n\nThe 'make three X's on her tomb' custom in St Louis Cemetery No. 1 is a twentieth-century tourist practice, not a tradition, and it damaged the tomb. Since 2015 the Archdiocese of New Orleans has admitted visitors only with an authorised guide (or as relatives of those buried there), largely because of this vandalism.",
      },
      {
        heading: 'Tourist Voodoo today',
        body:
          "Much of what is sold as 'Voodoo' in New Orleans today, the pin-stuck dolls, skull keychains and spell kits, is a tourist industry that grew in the twentieth century and has little to do with the historic religion. Alongside it, real practitioners exist: some serve in lineages connected to Haitian Vodou or other African diaspora religions, some carry on local family traditions, and some temples and shops are run by sincere, initiated priests and priestesses.",
      },
    ],
    howPeopleComeIn:
      "Historically, through community and the guidance of a priestess or priest. Today, people who practise seriously in New Orleans usually come in through a specific house or temple, many of which trace their initiations to Haitian Vodou or another established lineage, or through family tradition. Openness and practice vary by house.",
    openAndClosed:
      "Historic New Orleans Voodoo as a nineteenth-century religion did not survive intact in a single public form, and how it should be revived is debated among practitioners. Those who serve today generally see it as initiatory: you come in through a real teacher and community. Learning the history, visiting public sites respectfully and supporting Black-owned spiritual businesses is open to everyone. Practising 'New Orleans Voodoo' from a tourist shop kit is not the tradition.",
    myths: [
      {
        myth: 'Voodoo dolls are the heart of New Orleans Voodoo.',
        truth:
          'The pin-stuck "voodoo doll" is largely a product of Hollywood and the tourist trade, drawing on European poppet magic. It is not central to the historic religion.',
      },
      {
        myth: 'Marie Laveau was an evil witch who cursed people.',
        truth:
          'The record shows a Catholic healer, nurse and spiritual leader. The sinister image was largely created by hostile newspapers and later legend.',
      },
      {
        myth: 'Marking X\'s on Marie Laveau\'s tomb is an old custom that grants wishes.',
        truth:
          'It is a modern tourist practice that defaced a historic tomb. Respectful visitors leave it untouched.',
      },
    ],
    please: [
      "Please don't mark or damage tombs in New Orleans cemeteries.",
      "Please don't sell 'voodoo dolls' or 'Voodoo spell kits'.",
      "Please don't call your practice Voodoo unless you've been brought into a real house.",
      "Please do seek out Black-owned shops and temples rather than novelty stores.",
    ],
    learn:
      "Read historians who have done the archival work, and visit New Orleans's historic sites with licensed local guides, ideally Black-led tours. Support Black-owned spiritual shops and cultural institutions in the city. If you're drawn to practise, look for a lineage with a long, accountable community behind it.",
    reading: [
      'Carolyn Morrow Long, A New Orleans Voudou Priestess: The Legend and Reality of Marie Laveau (2006)',
      'Ina Johanna Fandrich, The Mysterious Voodoo Queen, Marie Laveaux (2005)',
      'Kodi A. Roberts, Voodoo and Power: The Politics of Religion in New Orleans, 1881–1940 (2015)',
      'Martha Ward, Voodoo Queen: The Spirited Lives of Marie Laveau (2004)',
      'Yvonne P. Chireau, Black Magic: Religion and the African American Conjuring Tradition (2003)',
    ],
    related: ['haitian-vodou', 'hoodoo', 'west-african-vodun'],
  },

  // ───────────────────────────────────────────────────────────── West African Vodun
  {
    id: 'west-african-vodun',
    name: 'West African Vodun',
    aka: ['Vodun', 'Vodoun', 'Vodú', 'Vodu', 'Voodoo (Benin)'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'The Fon, Ewe, Gun, Mina and related peoples of Benin, Togo and southeastern Ghana, with neighbouring Yoruba influence.',
    summary:
      'Vodun is the ancestral religion of the Fon, Ewe and neighbouring peoples of coastal West Africa, the root from which Haitian Vodou drew much of its name and spirit. It is lived through families, shrines and initiatory orders.',
    sections: [
      {
        heading: 'What it is',
        body:
          "In Fon, 'vodun' means a spirit or divine power. Vodun is the religion of serving these powers, alongside the ancestors, through shrines, priesthoods and convents where initiates are trained. Different vodun have their own orders, priests and lands, and many are tied to particular families, towns and lineages.\n\nIt is a living, everyday religion for millions of people. It shapes healing, justice, family life, art and politics, and it sits alongside Christianity and Islam, which many people also practise.",
      },
      {
        heading: 'History',
        body:
          "Vodun was central to the Kingdom of Dahomey (in present-day Benin) and to Ewe societies. The coast between the Volta and Lagos, the 'Slave Coast' of European records, was one of the largest points of departure in the transatlantic slave trade. Ouidah, now a centre of Vodun, was a major slave port, and enslaved Fon and Ewe people carried Vodun to Saint-Domingue, Brazil and elsewhere.\n\nUnder French colonial rule and again under Mathieu Kérékou's Marxist-Leninist government in the 1970s, Vodun was suppressed as 'sorcery' and 'feudalism'. After Benin's democratic transition in 1990, it was rehabilitated as national heritage.",
      },
      {
        heading: 'National Vodun Day',
        body:
          "Benin has marked Vodun with a national holiday on 10 January since the mid-1990s (the year is usually given as 1996, though some sources differ), celebrated most famously in Ouidah, where pilgrims, practitioners and the diaspora gather. Since 2024 the government has expanded the celebrations into a multi-day 'Vodun Days' festival. These are public, national occasions; the inner rites of the orders remain private.",
      },
    ],
    howPeopleComeIn:
      "Mostly through birth, family and lineage: many people inherit obligations to particular vodun. Others are called through illness, divination or dreams, and are initiated in a convent of a specific vodun, sometimes for long periods. Each order has its own rules about who can join.",
    openAndClosed:
      "Vodun is an initiatory and lineage-based religion tied to particular peoples and places. Public festivals in Benin and Togo welcome respectful visitors, including travellers and members of the diaspora reconnecting with their heritage. Initiation is a matter for a specific order and priest, in place, and is not something to seek casually or online.",
    myths: [
      {
        myth: 'Vodun, Vodou and Voodoo are all the same religion.',
        truth:
          'They are related but distinct. West African Vodun is the ancestral religion of the Fon and Ewe; Haitian Vodou and Louisiana Voodoo grew from it and other African roots in the Americas.',
      },
      {
        myth: 'Vodun is primitive or about cursing.',
        truth:
          'Vodun is a sophisticated religion with priesthoods, ethics, art and philosophy, concerned with health, justice and right relationship.',
      },
    ],
    please: [
      "Please don't photograph shrines, ceremonies or masked figures without permission.",
      "Please don't buy 'initiations' sold to tourists online or abroad without a trusted local connection.",
      "Please don't remove sacred objects from shrines or buy items that may have been taken from them.",
    ],
    learn:
      "Read Beninese, Togolese and Africanist scholarship. If you travel, go with local, community-based guides, and attend public celebrations as a guest. Support Beninese and Togolese artists, musicians and cultural institutions.",
    reading: [
      'Suzanne Preston Blier, African Vodun: Art, Psychology, and Power (1995)',
      'Dana Rush, Vodun in Coastal Bénin: Unfinished, Open-Ended, Global (2013)',
      'Judy Rosenthal, Possession, Ecstasy, and Law in Ewe Voodoo (1998)',
    ],
    related: ['haitian-vodou', 'louisiana-voodoo', 'ifa'],
  },

  // ───────────────────────────────────────────────────────────── Lucumí
  {
    id: 'lucumi',
    name: 'Lucumí (Santería, Regla de Ocha)',
    aka: ['Santería', 'Regla de Ocha', 'Lukumí', 'La Regla Lucumí', 'Ocha'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'Afro-Cuban, rooted in the Yoruba people of present-day Nigeria and Benin; now practised across Cuba, Puerto Rico, the United States, Mexico, Venezuela and beyond.',
    summary:
      'Lucumí, often called Santería, is an Afro-Cuban religion of the orishas, developed by enslaved Yoruba people and their descendants in Cuba. It is entered through godparents, a house and initiation.',
    sections: [
      {
        heading: 'What it is',
        body:
          "Lucumí honours Olodumare, the supreme being, the orishas (divine forces of nature and human life), and the ancestors (egun). It is organised in houses (ilé) led by initiated priests and priestesses, called santeros and santeras or olorishas, and relationships of godparenthood bind its members together.\n\nMany practitioners prefer the names Lucumí or Regla de Ocha. 'Santería', 'the way of the saints', was originally an outsider's term, sometimes used mockingly, reflecting the way the orishas were associated with Catholic saints. Some practitioners use it comfortably today; others avoid it.",
      },
      {
        heading: 'History',
        body:
          "Huge numbers of Yoruba people were enslaved and taken to Cuba in the late eighteenth and nineteenth centuries, especially after the collapse of the Oyo Empire. In Cuba, African 'nations' organised in cabildos, mutual-aid societies that preserved language, music and religion. Lucumí as it is known today took shape in these communities, especially in Havana and Matanzas.\n\nPractitioners were harassed by colonial and republican Cuban authorities, and Afro-Cuban religions were criminalised and stigmatised in the early twentieth century. After 1959 the revolutionary government was often hostile, though it later became more tolerant. Migration after 1959 took Lucumí to the United States.",
      },
      {
        heading: 'Religious freedom in the United States',
        body:
          "In 1993, in Church of the Lukumi Babalu Aye v. City of Hialeah, the US Supreme Court unanimously struck down city ordinances aimed at stopping a Lucumí church from practising its religion. It is one of the landmark US religious freedom cases.",
      },
    ],
    howPeopleComeIn:
      "Through a godparent (padrino or madrina) and their house. People usually begin by attending events and receiving guidance and divination, and over time may receive preliminary initiations before full priesthood (kariocha, often called making ocha or the asiento). It is a lifelong relationship with a godparent and a religious family, with real obligations.",
    openAndClosed:
      "Lucumí is initiatory: it is open to people of any background who are brought in through a legitimate house, and it has initiates of many ethnicities. What is not open is the knowledge and practice outside that structure. Serving orishas privately from books, or adopting them as personal 'deities' in an eclectic practice, is not Lucumí, and many practitioners find it disrespectful. Ritual songs, prayers and procedures are learned inside the house.",
    myths: [
      {
        myth: 'Santería is just Catholicism mixed with magic.',
        truth:
          'Lucumí is a distinct African-rooted religion with its own theology and priesthood. The association with saints grew partly as a way to survive persecution.',
      },
      {
        myth: 'Santería is devil worship.',
        truth:
          'This is an old slander. Lucumí is a religion of community, healing, divination and right relationship with the orishas and ancestors.',
      },
      {
        myth: 'You can work with orishas on your own if you read enough.',
        truth:
          'Within Lucumí, relationship with the orishas is mediated through initiated priests and godparents. Self-initiation is not recognised.',
      },
    ],
    please: [
      "Please don't use orisha names or images as décor, branding or casual 'deity work'.",
      "Please don't buy initiations online or from anyone without a long-standing house.",
      "Please don't attend ceremonies uninvited or film them.",
      "Please don't wear initiates' beads or regalia as costume.",
    ],
    learn:
      "Read practitioner and scholarly works, and visit a local botánica, ideally a community-run one, with respect: they are often the bridge to real houses. If drawn to the religion, take time to find a reputable house; good godparents don't rush you or charge you up front for promises.",
    reading: [
      'Michael Atwood Mason, Living Santería: Rituals and Experiences in an Afro-Cuban Religion (2002)',
      'David H. Brown, Santería Enthroned: Art, Ritual, and Innovation in an Afro-Cuban Religion (2003)',
      'Lydia Cabrera, El Monte (1954)',
      'Margarite Fernández Olmos & Lizabeth Paravisini-Gebert, Creole Religions of the Caribbean (2003; 2nd ed. 2011)',
    ],
    related: ['ifa', 'palo', 'espiritismo', 'candomble'],
  },

  // ───────────────────────────────────────────────────────────── Ifá
  {
    id: 'ifa',
    name: 'Ifá',
    aka: ['Ifa divination', 'Orunmila worship', 'Isese', 'Yoruba religion'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'The Yoruba people of southwestern Nigeria, Benin and Togo, and Yoruba-descended communities in Cuba, Brazil, Trinidad and the United States.',
    summary:
      'Ifá is the Yoruba system of divination and wisdom associated with Orunmila, held by initiated priests called babalawo. UNESCO recognised the Ifá divination system as a masterpiece of humanity\'s intangible heritage in 2005.',
    sections: [
      {
        heading: 'What it is',
        body:
          "Ifá is both a divination system and a vast body of sacred literature. Its knowledge is held in a vast and still-growing body of verses (ese) arranged under 256 signs (odu), which carry Yoruba history, ethics, medicine, philosophy and stories. Trained priests learn this corpus over many years, largely by memory, and use it to counsel people on their lives.\n\nIfá sits within the wider Yoruba religious world (sometimes called Isese, 'tradition'), which also honours the orishas and the ancestors.",
      },
      {
        heading: 'History and heritage',
        body:
          "Ifá is ancient in Yorubaland, with Ile-Ife as its sacred centre. Under colonial rule and missionary pressure it was dismissed as 'paganism', and many Yoruba converted to Christianity or Islam, yet Ifá priests continued, and enslaved Yoruba carried the system to Cuba, Brazil and elsewhere.\n\nIn 2005 UNESCO proclaimed the Ifá divination system a Masterpiece of the Oral and Intangible Heritage of Humanity, and in 2008 it was inscribed on the Representative List of the Intangible Cultural Heritage of Humanity, noting the threat to its transmission.",
      },
      {
        heading: 'Lineages and debates',
        body:
          "Ifá is practised in Nigerian lineages and in diaspora lineages, especially Cuban, that developed differently. They sometimes disagree, for example about the role of women as Ifá priests (iyanifa), which some Nigerian lineages recognise and most Cuban lineages do not. These are internal questions for the communities themselves.",
      },
    ],
    howPeopleComeIn:
      "Through divination and initiation by qualified priests. Many people receive a first-level initiation that connects them to Ifá; becoming a babalawo requires further initiation and long apprenticeship with a teacher. In Yorubaland, much of this happens within families and towns with long Ifá traditions.",
    openAndClosed:
      "Ifá is initiatory and open to people of many backgrounds through legitimate priests and lineages. What is not open: the priesthood's knowledge, divination tools and sacred verses as material for self-taught practice. Casting 'Ifá readings' without initiation, or selling them, is not Ifá.",
    myths: [
      {
        myth: 'Ifá is fortune-telling.',
        truth:
          'Ifá is a priestly system of knowledge, ethics and counsel that UNESCO recognises as world heritage, far deeper than predicting events.',
      },
      {
        myth: 'Anyone can learn to read Ifá from a book.',
        truth:
          'The corpus is transmitted orally through initiation and years of apprenticeship. Books describe it; they do not make anyone a priest.',
      },
    ],
    please: [
      "Please don't offer or sell 'Ifá readings' unless you are an initiated priest.",
      "Please don't buy initiations online from people without a verifiable lineage.",
      "Please don't use orisha or odu names as branding or décor.",
    ],
    learn:
      "Read Yoruba scholars and priests first, and learn about Yoruba language, history and culture. Support Nigerian and Yoruba-led cultural organisations. If you're drawn to Ifá, take time to find a priest with a verifiable lineage and an accountable community.",
    reading: [
      "Wande Abimbola, Ifá: An Exposition of Ifá Literary Corpus (1976)",
      'William Bascom, Ifa Divination: Communication between Gods and Men in West Africa (1969)',
      'Jacob K. Olupona & Terry Rey (eds.), Òrìṣà Devotion as World Religion: The Globalization of Yorùbá Religious Culture (2008)',
    ],
    related: ['lucumi', 'candomble', 'west-african-vodun'],
  },

  // ───────────────────────────────────────────────────────────── Palo
  {
    id: 'palo',
    name: 'Palo (Reglas de Congo)',
    aka: ['Palo Mayombe', 'Palo Monte', 'Reglas de Congo', 'Briyumba', 'Kimbisa'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'Afro-Cuban, rooted in the Kongo peoples of Central Africa (present-day Congo, the Democratic Republic of the Congo and Angola).',
    summary:
      'Palo is a family of Afro-Cuban religions of Kongo origin, centred on the dead, the forces of nature and sacred vessels (nganga). It is strictly initiatory and practised within houses called munansos.',
    sections: [
      {
        heading: 'What it is',
        body:
          "Palo, also known as the Reglas de Congo, is a group of related religions (Palo Mayombe, Palo Monte, Briyumba, Kimbisa and others) that grew from Kongo religion in Cuba. Its name refers to sticks or trees, reflecting the importance of the forest and of plants. Its practice centres on relationships with the dead and with powerful spirits of nature, worked through consecrated vessels.\n\nIt is often practised alongside Lucumí and Espiritismo by the same people, but it is a separate religion with its own initiations, language and ethics.",
      },
      {
        heading: 'History',
        body:
          "Kongo people were among the largest groups enslaved and taken to Cuba. Their religious ideas survived in cabildos, in maroon (escaped) communities and in families, and developed into Palo. Like other Afro-Cuban religions, it was criminalised, policed and sensationalised in the press, and it still carries particular stigma, even within Afro-Cuban religious life.",
      },
      {
        heading: 'Where it lives today',
        body:
          "Palo is practised in Cuba and throughout the Cuban diaspora, especially in Miami and New York, and has spread to Puerto Rico, Venezuela, Mexico and elsewhere. In the United States, police and the press have at times linked Palo with crime on thin evidence, repeating an old pattern of treating African-rooted religion as inherently criminal. Most practitioners are ordinary people seeking protection, healing and connection with their dead.",
      },
    ],
    howPeopleComeIn:
      "Only through initiation by an elder of a specific house and branch (rama). The initiate becomes part of a lineage with obligations to their elders. Different branches have different practices and rules.",
    openAndClosed:
      "Palo is initiatory and widely considered one of the more private Afro-Cuban traditions. People of various backgrounds are initiated, but only within houses, and its knowledge is guarded closely. Nothing about its practice is open to self-study, and practitioners strongly caution against attempting it outside a house.",
    myths: [
      {
        myth: "Palo is 'black magic' or the evil side of Santería.",
        truth:
          'Palo is its own religion with its own ethics and community. Like many religions, it deals with protection and justice; the sinister image comes largely from sensational press and films.',
      },
    ],
    please: [
      "Please don't try to make or buy sacred vessels or 'Palo kits'.",
      "Please don't buy initiations online.",
      "Please don't treat Palo as an edgy aesthetic.",
    ],
    learn:
      "Read serious ethnography and Afro-Cuban scholarship, and learn about Kongo history and culture. If drawn to Palo, seek elders through established Afro-Cuban religious communities and take time; legitimate houses are cautious about who they initiate.",
    reading: [
      'Todd Ramón Ochoa, Society of the Dead: Quita Manaquita and Palo Praise in Cuba (2010)',
      'Stephan Palmié, Wizards and Scientists: Explorations in Afro-Cuban Modernity and Tradition (2002)',
      'Lydia Cabrera, El Monte (1954)',
    ],
    related: ['lucumi', 'espiritismo'],
  },

  // ───────────────────────────────────────────────────────────── Candomblé
  {
    id: 'candomble',
    name: 'Candomblé',
    aka: ['Candomble', 'Candomblé Ketu', 'Candomblé Jeje', 'Candomblé Angola', 'Povo de santo'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'Afro-Brazilian, especially in Bahia (Salvador), Rio de Janeiro, Pernambuco and São Paulo, rooted in Yoruba, Fon/Ewe and Bantu (Kongo-Angola) peoples.',
    summary:
      'Candomblé is an Afro-Brazilian religion of the orixás (and in other nations the vodun and nkisi), led for generations largely by Black women. It is lived in terreiros and entered through initiation.',
    sections: [
      {
        heading: 'What it is',
        body:
          "Candomblé is organised in 'nations' (nações): Ketu (Nagô), of Yoruba origin, honours the orixás; Jeje, of Fon/Ewe origin, honours the vodun; Angola, of Bantu origin, honours the nkisi. Each terreiro (temple community) is led by a mãe de santo (iyalorixá) or pai de santo (babalorixá) and functions as an extended religious family.\n\nCeremonies with drumming, song and dance are communal, and much of life in a terreiro is about care, food, mutual aid and keeping African heritage alive.",
      },
      {
        heading: 'History and persecution',
        body:
          "Candomblé took shape in nineteenth-century Bahia among enslaved and freed Africans. The Casa Branca do Engenho Velho (Ilê Axé Iyá Nassô Oká) in Salvador, founded by African women, is considered one of the oldest terreiros and became the first Afro-Brazilian temple protected as national heritage in the 1980s.\n\nCandomblé was long persecuted. Police raided terreiros and seized sacred objects, and in Bahia terreiros were required to register with and get permits from the police, a rule that applied to no other religion, until 1976. Today terreiros still face attacks and 'religious racism', often from extremist groups. Brazil marks 21 January as the National Day to Combat Religious Intolerance, in memory of Mãe Gilda de Ogum, a Candomblé priestess who died on that date in 2000 after she was vilified in print and her terreiro was attacked.",
      },
      {
        heading: "Women's leadership",
        body:
          "Several of the oldest and most famous Ketu terreiros in Salvador have been led by women for generations, and great mães de santo are revered figures in Brazilian life. The anthropologist Ruth Landes called Bahia a 'city of women' in 1947. Later scholars, notably J. Lorand Matory, have argued that the picture is more complicated and that men have always held important roles too. Both the reality of women's leadership and the scholarly debate about it are worth knowing.",
      },
    ],
    howPeopleComeIn:
      "Through a terreiro and its leader. People usually begin by attending public festivities and consulting the priest, then may become an abiã (novice) and, if the path is confirmed, undergo initiation, which involves a period of seclusion and lifelong obligations to the house. Initiation follows a hierarchy of seniority within the community.",
    openAndClosed:
      "Candomblé is initiatory and open to people of all backgrounds who join a terreiro, and many terreiros welcome respectful visitors to public festas. What is not open: initiatory knowledge, ritual practice and secrets, which belong to the terreiro. Worshipping orixás outside a house, or blending them into a personal eclectic practice, is not Candomblé.",
    myths: [
      {
        myth: 'Candomblé is witchcraft or devil worship.',
        truth:
          'This slander has fuelled real attacks on terreiros. Candomblé is a religion of community, ancestry, nature and the orixás.',
      },
      {
        myth: 'Candomblé and Umbanda are the same.',
        truth:
          'Umbanda is a separate, twentieth-century Brazilian religion that draws on Candomblé, Spiritism, Catholicism and Indigenous elements.',
      },
    ],
    please: [
      "Please don't attend ceremonies uninvited or photograph them without permission.",
      "Please don't wear initiates' clothing or beads as costume.",
      "Please don't buy initiations online.",
      "Please don't use orixá names or images as décor or branding.",
    ],
    learn:
      "Read Afro-Brazilian voices and serious scholarship, learn Brazil's history of slavery and its legacy, and support terreiros' own cultural and social projects and Afro-Brazilian organisations. Visiting public festas as an invited guest, and following the house's rules, is a respectful way to learn.",
    reading: [
      'J. Lorand Matory, Black Atlantic Religion: Tradition, Transnationalism, and Matriarchy in the Afro-Brazilian Candomblé (2005)',
      'Rachel E. Harding, A Refuge in Thunder: Candomblé and Alternative Spaces of Blackness (2000)',
      'Paul Christopher Johnson, Secrets, Gossip, and Gods: The Transformation of Brazilian Candomblé (2002)',
      'Ruth Landes, The City of Women (1947)',
    ],
    related: ['umbanda', 'quimbanda', 'ifa', 'lucumi'],
  },

  // ───────────────────────────────────────────────────────────── Umbanda
  {
    id: 'umbanda',
    name: 'Umbanda',
    aka: ['Umbanda Branca', 'Umbandismo'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'Brazilian, practised across Brazil and in Brazilian communities abroad, especially in Uruguay, Argentina, Portugal and the United States.',
    summary:
      "Umbanda is a Brazilian religion of the early twentieth century that brings together African, Indigenous, Catholic and Spiritist elements. It is more open to newcomers than Candomblé, but it is still practised within communities, through mediums trained in a terreiro or centro.",
    sections: [
      {
        heading: 'What it is',
        body:
          "Umbanda centres on charity and spiritual help. In its sessions (giras), trained mediums in a terreiro receive spirit guides, among them spirits understood as elders who lived through slavery and as Indigenous ancestors, who give counsel and healing to those who come for help. It also honours the orixás, often linked with Catholic saints.\n\nUmbanda is diverse: there is no single central authority, and practice varies widely from house to house, from forms close to Spiritism to forms close to Candomblé.",
      },
      {
        heading: 'History',
        body:
          "Umbanda's founding story holds that on 15 November 1908, in Niterói, the young medium Zélio Fernandino de Moraes received a spirit guide who announced a new religion open to all. Historians note that Umbanda drew on older Afro-Brazilian practices and that its origins are more varied than one founding event. Brazil marks 15 November as National Umbanda Day, set in law in 2012.\n\nUmbanda grew in the cities in the twentieth century and was partly shaped by efforts to make African-derived religion acceptable to middle-class and white Brazilians, which some critics see as 'whitening'. It was nonetheless policed and stigmatised alongside Candomblé, and its terreiros face attacks today.",
      },
      {
        heading: 'Umbanda, Candomblé and Kardecism',
        body:
          "Umbanda is often confused with Candomblé, and with the Spiritism (Kardecismo) of Allan Kardec that is also widespread in Brazil. It draws on both, but is its own religion: it typically works with spirit guides received by mediums in open sessions, while Candomblé centres on the orixás and on a strict initiatory hierarchy, and Kardecist centres usually avoid African elements altogether. Many Brazilians move between these religions or belong to more than one.",
      },
    ],
    howPeopleComeIn:
      "Many people first come as consulentes, visitors who attend public sessions to receive counsel and help. Those who wish to go further join a terreiro as members and, under the guidance of its leader, develop as mediums over time. Some houses have formal initiations; others do not.",
    openAndClosed:
      "Umbanda is one of the more open Afro-Brazilian religions. Many terreiros welcome anyone to public sessions, and people of all backgrounds become members. But it is still a communal religion: mediumship is developed under guidance in a house, and the spirit guides are received within that structure. Taking Umbanda's guides or practices into a solitary eclectic practice is not Umbanda, and practitioners warn that mediumship without training can be harmful.",
    myths: [
      {
        myth: 'Umbanda is the same as Candomblé.',
        truth:
          'They are related but distinct. Umbanda is a twentieth-century Brazilian religion that blends Spiritism, Catholicism, African and Indigenous elements.',
      },
      {
        myth: 'Umbanda is about doing magic for money.',
        truth:
          'Charity is central to Umbanda. Many terreiros offer spiritual help without charge.',
      },
    ],
    please: [
      "Please don't try to develop mediumship or receive guides on your own from videos.",
      "Please don't film sessions or treat them as entertainment.",
      "Please don't wear ritual clothing or beads as costume.",
    ],
    learn:
      "If you're in Brazil or near a Brazilian community, ask whether a reputable terreiro holds public sessions and attend respectfully as a visitor. Read scholarship and practitioners' own writing, and support terreiros' charitable work.",
    reading: [
      'Diana DeG. Brown, Umbanda: Religion and Politics in Urban Brazil (1986; 2nd ed. 1994)',
      "Lindsay Hale, Hearing the Mermaid's Song: The Umbanda Religion in Rio de Janeiro (2009)",
    ],
    related: ['candomble', 'quimbanda', 'espiritismo'],
  },

  // ───────────────────────────────────────────────────────────── Obeah
  {
    id: 'obeah',
    name: 'Obeah',
    aka: ['Obia', 'Obi', 'Science (Caribbean usage)'],
    group: 'african-diaspora',
    openness: 'closed',
    peoples:
      'Afro-Caribbean, especially in Jamaica, Trinidad and Tobago, Barbados, Guyana, the Bahamas and the wider English-speaking Caribbean.',
    summary:
      'Obeah is a term for Afro-Caribbean spiritual practices of healing, protection and justice, rooted in West and Central African traditions. For centuries it was outlawed under colonial "Obeah Acts", some of which are still in force.',
    sections: [
      {
        heading: 'What it is',
        body:
          "Obeah is less a single religion than a name for African-derived spiritual and healing work in the Caribbean, carried out by specialists, often called obeah men or obeah women, for people seeking health, protection, love, justice or help with trouble. It is woven into Caribbean family life, folklore and literature.\n\nThe word itself has a complicated history. It was used by colonial authorities as a catch-all label for African spiritual practice they wanted to suppress, and many people in the Caribbean still treat it with a mix of respect, fear and stigma.",
      },
      {
        heading: 'Obeah and the colonial law',
        body:
          "Colonial authorities saw Obeah as a threat because spiritual leaders could unite enslaved people. After Tacky's Revolt in Jamaica in 1760, in which Obeah practitioners were said to have played a part, Jamaica passed a law making Obeah a crime punishable by death. Similar laws spread across the British Caribbean, and after emancipation 'Obeah Acts' continued to be used to criminalise African-derived religion and to police Black communities well into the twentieth century.\n\nSome territories have since decriminalised it, among them Anguilla, Barbados, Trinidad and Tobago and St Lucia, between 1980 and 2004. Others have not: Jamaica's Obeah Act of 1898 remains on the books, though a 2013 amendment removed flogging and whipping as punishments, and prosecutions are now rare. Historian Diana Paton's work traces this history in detail.",
      },
      {
        heading: 'In Caribbean life today',
        body:
          "Obeah remains part of everyday Caribbean culture, in stories, proverbs, literature and in the quiet practice of healers, even where it is still technically illegal or socially stigmatised. Caribbean writers and scholars continue to debate what the word means and whether it should be reclaimed, and there have been calls in several countries to remove the remaining colonial-era laws. These are conversations for Caribbean people to lead.",
      },
    ],
    howPeopleComeIn:
      "Through family, apprenticeship to a practitioner, or being recognised as having the gift within a Caribbean community. There is no public initiation structure, and much knowledge is held privately within families and local communities.",
    openAndClosed:
      "Obeah is rooted in specific Caribbean communities and transmitted within them, and given its history of criminalisation and stigma, it is best treated as closed to outsiders. Learning its history, the colonial laws and their legacy, and Caribbean writers' portrayals of it is open and valuable.",
    myths: [
      {
        myth: 'Obeah is simply evil sorcery.',
        truth:
          "That image was largely shaped by colonial law and missionary writing. Much Obeah is healing and protective work sought by ordinary people.",
      },
      {
        myth: 'Obeah laws are ancient history.',
        truth:
          'Some Caribbean Obeah laws remain in force today, a legacy of colonial rule that activists and scholars continue to challenge.',
      },
    ],
    please: [
      "Please don't call your practice Obeah.",
      "Please don't use 'obeah' as an exotic label for spells or products.",
      "Please do learn the history of the laws, and listen to Caribbean voices on them.",
    ],
    learn:
      "Read Caribbean historians and writers, and learn about the colonial legal history and current campaigns to repeal Obeah laws. Support Caribbean authors, artists and cultural institutions.",
    reading: [
      'Diana Paton, The Cultural Politics of Obeah: Religion, Colonialism and Modernity in the Caribbean World (2015)',
      'Diana Paton & Maarit Forde (eds.), Obeah and Other Powers: The Politics of Caribbean Religion and Healing (2012)',
      'Margarite Fernández Olmos & Lizabeth Paravisini-Gebert, Creole Religions of the Caribbean (2003; 2nd ed. 2011)',
    ],
    related: ['hoodoo', 'haitian-vodou'],
  },

  // ───────────────────────────────────────────────────────────── Espiritismo
  {
    id: 'espiritismo',
    name: 'Espiritismo',
    aka: ['Puerto Rican Espiritismo', 'Cuban Espiritismo', 'Espiritismo Cruzado', 'Espiritismo de Cordón', 'Mesa Blanca'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples:
      'Puerto Rican and Cuban, and their diasporas, especially in New York, Florida and New Jersey; with roots in French Spiritism, African and Indigenous Caribbean traditions and Catholicism.',
    summary:
      'Espiritismo is the Caribbean practice of communicating with spirits of the dead for healing and guidance, grown from the Spiritism of Allan Kardec and blended with African, Indigenous and Catholic traditions. It is comparatively open, but practised within centres and spiritual families.',
    sections: [
      {
        heading: 'What it is',
        body:
          "Espiritismo is a practice centred on the spirits of the dead and on spiritual guides, contacted through mediums in sessions, often around a table dressed in white (mesa blanca). Its focus is spiritual development, healing and charity.\n\nIt takes many forms. Some centres follow Allan Kardec's 'scientific' Spiritism closely. Others are 'crossed' (cruzado) with Lucumí and other Afro-Caribbean practice. In eastern Cuba, Espiritismo de Cordón developed its own style of collective trance and healing.",
      },
      {
        heading: 'History',
        body:
          "Allan Kardec's The Spirits' Book (1857) reached Puerto Rico and Cuba in the later nineteenth century, often among educated liberals and independence activists, and was suppressed by Spanish colonial authorities and the Church. Among working-class and rural people, especially Afro-Caribbean communities, it merged with existing healing and spirit traditions. It spread with migration to the United States, where espiritistas have long served as healers and counsellors in Puerto Rican and Cuban neighbourhoods.",
      },
      {
        heading: 'Healing and community',
        body:
          "For many families, the espiritista has been a trusted counsellor for illness, grief, family trouble and bad luck, often alongside, not instead of, doctors. From the 1970s, researchers in New York, such as the anthropologist Alan Harwood, studied how Puerto Rican espiritistas worked as community healers, and some mental-health services began learning from them. Centres usually stress charity, moral growth and helping troubled spirits as well as the living.",
      },
    ],
    howPeopleComeIn:
      "Many people first attend a session at a centro or a misa (spiritual mass), or are brought by family. Those with mediumship develop it over time under the guidance of experienced espiritistas. There is generally no formal initiation, but there is apprenticeship and community.",
    openAndClosed:
      "Espiritismo is one of the more open traditions here. Kardec's writings are public and freely available, many centres welcome visitors, and people of many backgrounds attend. The forms crossed with Afro-Caribbean religion are more bound to particular houses and lineages. In all forms, developing mediumship is done with guidance in a community, and practitioners caution against attempting it alone. We list it as initiatory in the broad sense this guide uses: there is usually no initiation rite, but serious practice is learned within a centre and under experienced mediums.",
    myths: [
      {
        myth: 'Espiritismo is the same as Santería.',
        truth:
          'They are different, though many people practise both. Espiritismo centres on the dead and spirit guides; Lucumí is an initiatory religion of the orishas.',
      },
      {
        myth: 'Espiritismo is about raising the dead or summoning evil spirits.',
        truth:
          'Its focus is healing, spiritual growth and helping the living and the dead, often with a strong emphasis on charity.',
      },
    ],
    please: [
      "Please don't try to run 'misas' or spirit sessions for others without training.",
      "Please don't treat Puerto Rican and Cuban spiritual traditions as aesthetic.",
      'Please do support community botánicas and centros.',
    ],
    learn:
      "Kardec's own books are a public starting point for understanding the philosophy. For the Caribbean forms, read Puerto Rican and Cuban scholarship, and visit a community botánica, which can often point to centros that welcome visitors.",
    reading: [
      "Allan Kardec, The Spirits' Book (1857)",
      'Raquel Romberg, Witchcraft and Welfare: Spiritual Capital and the Business of Magic in Modern Puerto Rico (2003)',
      'Alan Harwood, Rx: Spiritist as Needed: A Study of a Puerto Rican Community Mental Health Resource (1977)',
      'Andrés I. Pérez y Mena, Speaking with the Dead: Development of Afro-Latin Religion among Puerto Ricans in the United States (1991)',
      'Margarite Fernández Olmos & Lizabeth Paravisini-Gebert, Creole Religions of the Caribbean (2003; 2nd ed. 2011)',
    ],
    related: ['lucumi', 'palo', 'umbanda'],
  },

  // ───────────────────────────────────────────────────────────── Quimbanda
  {
    id: 'quimbanda',
    name: 'Quimbanda',
    aka: ['Kimbanda'],
    group: 'african-diaspora',
    openness: 'initiatory',
    peoples: 'Brazilian, with Bantu (Kongo-Angola) roots, closely related to Umbanda.',
    summary:
      'Quimbanda is a Brazilian religious tradition centred on the spirits known as Exus and Pombagiras, closely related to Umbanda. It is initiatory and practised within houses.',
    sections: [
      {
        heading: 'What it is',
        body:
          "Quimbanda works with classes of spirits called Exus and Pombagiras, understood in Brazil as powerful spirits of the crossroads, the streets and human desire. It developed alongside Umbanda in twentieth-century Brazil; some Umbanda houses describe it as a separate 'left-hand' line, while some Quimbanda houses see themselves as an independent religion.\n\nIt has long been stigmatised, including by some Umbandistas, and portrayed as sinister. Scholars such as Kelly Hayes have shown how Pombagira in particular is bound up with Brazilian ideas of gender, sexuality and the struggles of poor women.",
      },
      {
        heading: 'History',
        body:
          "The word 'quimbanda' comes from Kimbundu, a Bantu language of Angola, where it referred to a healer or ritual specialist. In twentieth-century Brazil it came to name the practices and houses devoted to Exus and Pombagiras. Because some early Umbanda leaders defined their religion as the 'white' or 'pure' line in contrast to Quimbanda, it was pushed to the margins and became a target for both police and religious rivals.",
      },
      {
        heading: 'Commercialisation abroad',
        body:
          "In the last two decades or so, Quimbanda has been marketed in English-language books and online courses, often presented as dark or 'left-hand path' magic for an international audience. Many Brazilian practitioners see this as a distortion that strips the tradition of its Brazilian community, language and lineage. If you are curious, the respectful course is to learn from Brazilian scholarship and voices rather than from courses.",
      },
    ],
    howPeopleComeIn:
      "Through a house and its leader, with initiation and lifelong obligations. Different houses have very different practices.",
    openAndClosed:
      "Quimbanda is initiatory and practised within Brazilian houses. In recent years, books and online courses have marketed versions of it to outsiders, often by people outside Brazilian lineages; many Brazilian practitioners view this as misrepresentation. Its spirits are not for casual or solitary work.",
    myths: [
      {
        myth: 'Exu is the devil.',
        truth:
          'The equation of Exu with the devil came largely from Christian polemic. In Afro-Brazilian religion, the orixá Exu and the exu spirits of Umbanda and Quimbanda are complex figures, messengers and guardians among them, not Satan. Some houses use devilish imagery themselves, a legacy of that history that practitioners interpret in their own ways.',
      },
    ],
    please: [
      "Please don't buy Quimbanda initiations or courses online.",
      "Please don't use Exu or Pombagira imagery as edgy décor.",
    ],
    learn:
      'Read careful scholarship on Afro-Brazilian religion and listen to Brazilian practitioners. Learning Portuguese opens up far more of their own writing.',
    reading: [
      'Kelly E. Hayes, Holy Harlots: Femininity, Sexuality, and Black Magic in Brazil (2011)',
      'Diana DeG. Brown, Umbanda: Religion and Politics in Urban Brazil (1986; 2nd ed. 1994)',
    ],
    related: ['umbanda', 'candomble'],
  },
];
