import type { ClosedTradition } from '../types';

// Initiatory and people-held traditions outside the Indigenous and African
// diaspora groups. Explanations only: no mantras, rites, names of power or
// oathbound material.

export const OTHER: ClosedTradition[] = [
  {
    id: 'hindu-tantra',
    name: "Hindu tantra and initiatory mantra",
    aka: ["Tantra", "Tantrism", "Dīkṣā", "Diksha", "Śrī Vidyā", "Kashmir Śaivism", "Kundalini"],
    group: 'other',
    openness: 'initiatory',
    peoples:
      "Hindu tantric lineages in India, Nepal and the diaspora, especially Śaiva, Śākta and Vaiṣṇava traditions. Buddhist and Jain tantra are related but distinct traditions with their own lineages.",
    summary:
      "A vast family of Hindu ritual and meditative traditions passed from guru to disciple through initiation (dīkṣā). It is not a sex technique, and its mantras are given, not taken.",
    sections: [
      {
        heading: "What tantra is",
        body:
          "From around the middle of the first millennium CE, texts called Tantras and Āgamas set out new forms of worship, yoga and ritual addressed to Śiva, the Goddess (Śakti) or Viṣṇu. Much of ordinary Hindu temple worship today grew from these traditions. Famous lineages include Kashmir Śaivism, whose great teacher Abhinavagupta wrote in the 10th and 11th centuries, and Śrī Vidyā, devoted to the Goddess.\n\nTantric practice combines devotion, visualisation, mantra, yoga and ritual, and it often aims at liberation as well as worldly power. Some lineages used transgressive rites; most practice was, and is, quiet, disciplined and devotional.",
      },
      {
        heading: "Dīkṣā and the guru",
        body:
          "Entry is through dīkṣā, initiation by a qualified guru in an unbroken lineage, often after a period of service and study. In many lineages, a mantra received in initiation carries the power of the lineage itself; repeating the same syllables read from a book is not considered the same practice. Teachings are often kept secret, not to exclude, but because they are meant to unfold in relationship with a teacher.\n\nGuru traditions have also seen abuses of power, and Hindu teachers themselves urge students to test a teacher and their lineage carefully.",
      },
      {
        heading: "Neo-tantra is something else",
        body:
          "In the West, “tantra” mostly means sex workshops. That use goes back to figures such as Pierre Bernard in early 20th-century America and Osho (Rajneesh) in the 1970s, and today’s “tantric sex” industry. Sexual rites were a small, specialised and often symbolic part of some lineages. Neo-tantra is a modern Western creation, and Hindu practitioners have long objected to it being sold under the name of their tradition.",
      },
    ],
    howPeopleComeIn:
      "Through a guru in a recognised lineage, often through a temple, a matha (monastic centre) or a community, by initiation (dīkṣā). Many Hindu traditions accept sincere non-Hindu students; the guru decides.",
    openAndClosed:
      "Initiatory: lineage mantras, initiatory practices and secret teachings are given through dīkṣā. Open: scholarship, public talks, devotional singing and temple visits as a respectful guest, and many devotional mantras that are chanted publicly by millions and freely shared. The line between public and initiatory mantra varies by lineage, so ask a teacher rather than assume.",
    myths: [
      {
        myth: "Tantra is about sex.",
        truth: "Tantra is a broad family of ritual, yoga and devotional traditions. Sexual rites were a minor element of some lineages; “tantric sex” is a modern Western product.",
      },
      {
        myth: "Any mantra from a book works the same as one given by a guru.",
        truth: "In tantric lineages, initiatory mantras are transmitted in dīkṣā, and teachers hold that the transmission matters.",
      },
      {
        myth: "Kundalini awakening is a weekend course.",
        truth: "In the traditions it comes from, it is the fruit of long practice under guidance, and teachers warn against forcing it.",
      },
    ],
    please: [
      "Please don’t buy “tantra initiations” or diksha online.",
      "Please don’t use initiatory mantras or yantras copied from books or websites as spells.",
      "Please don’t call a sex or intimacy workshop “tantra”.",
      "Please don’t use images of Hindu deities as décor or on products casually.",
    ],
    learn:
      "Read scholars and practitioners of the traditions, visit Hindu temples as a respectful guest, and if you feel called, seek a teacher in an established lineage and take time to know them.",
    reading: [
      "Swami Lakshmanjoo, Kashmir Shaivism: The Secret Supreme (1988)",
      "André Padoux, The Hindu Tantric World: An Overview (2017)",
      "Christopher D. Wallis, Tantra Illuminated (2012; 2nd ed. 2013)",
      "Gavin Flood, The Tantric Body (2006)",
      "Hugh B. Urban, Tantra: Sex, Secrecy, Politics, and Power in the Study of Religion (2003)",
      "David Gordon White (ed.), Tantra in Practice (2000)",
    ],
  },
  {
    id: 'jewish-kabbalah',
    name: "Jewish Kabbalah",
    aka: ["Kabbalah", "Cabala", "Zohar", "Lurianic Kabbalah", "Hermetic Qabalah"],
    group: 'other',
    openness: 'debated',
    peoples:
      "Jewish communities worldwide. Kabbalah is the mystical tradition within Judaism; Christian Cabala and Hermetic Qabalah are later, separate Western esoteric developments that borrowed from it.",
    summary:
      "Jewish Kabbalah is a mystical tradition inside Judaism, rooted in Torah, Hebrew, prayer and commandment. Hermetic Qabalah is a separate Western esoteric system. Jewish teachers disagree about whether, and how, non-Jews should study Kabbalah.",
    sections: [
      {
        heading: "Kabbalah within Judaism",
        body:
          "Kabbalah (“receiving” or “tradition”) emerged in 12th- and 13th-century Provence and Spain, drawing on older Jewish mystical texts. The Zohar, the central work, appeared in late 13th-century Castile. In 16th-century Safed, Isaac Luria’s teachings reshaped Jewish thought, and Kabbalah later fed into Hasidism.\n\nIt is not a separate religion. It speaks about God, the sefirot (aspects of the divine), exile and repair, and it lives inside Jewish prayer, study, Sabbath, festivals and commandments, written in Hebrew and Aramaic.",
      },
      {
        heading: "Who may study it",
        body:
          "Traditionally, deep Kabbalah study was limited to learned, observant Jewish men, and a later custom, recorded by 17th-century rabbis and reinforced by rabbinic bans after the Sabbatean and Frankist upheavals, held that students should be at least forty, married and well grounded in Talmud. It was never universally observed. Today many Jewish teachers, including Hasidic and Jewish Renewal teachers, teach it more widely.\n\nThere is real disagreement. Many Jews hold that Kabbalah is part of Torah and belongs within Jewish life; some welcome sincere non-Jewish learners to study respectfully; many object to it being sold as a self-help brand cut off from Judaism, as with commercial “Kabbalah centres” and red-string bracelets.",
      },
      {
        heading: "Hermetic Qabalah is a separate thing",
        body:
          "From the late 15th century, Christian scholars such as Giovanni Pico della Mirandola and Johannes Reuchlin adapted Kabbalah for Christian purposes. Western occultists later joined it to astrology, alchemy and tarot, most influentially in the Hermetic Order of the Golden Dawn, founded in 1888. That system, usually spelled Qabalah, is a Western esoteric tradition in its own right.\n\nPut plainly, Hermetic Qabalah is not Jewish Kabbalah. Jewish scholars note that it often misreads Jewish sources and uses Hebrew divine names out of context. Practitioners of the Western system should name it accurately and not present it as Jewish tradition.",
      },
    ],
    howPeopleComeIn:
      "Jewish Kabbalah is studied within Jewish life, usually with a rabbi or teacher and a grounding in Torah, Hebrew and practice. People who wish to join Judaism do so through conversion with a rabbi and community.",
    openAndClosed:
      "Debated: Jewish teachers disagree about non-Jewish study. Widely acceptable: reading scholarship on Kabbalah and its history, and learning about Judaism from Jewish sources. Widely objected to: commercial Kabbalah branded as Jewish wisdom without Judaism, and using Hebrew divine names or Jewish ritual objects as magical décor. Hermetic Qabalah is an open Western esoteric system, best kept clearly separate in name and claim.",
    myths: [
      {
        myth: "Kabbalah is a universal mystical system that has nothing to do with Judaism.",
        truth: "Jewish Kabbalah is inseparable from Jewish texts, language and practice.",
      },
      {
        myth: "Hermetic Qabalah and Kabbalah are the same.",
        truth: "Hermetic Qabalah grew out of Renaissance Christian Cabala and Victorian occultism; it borrows from Kabbalah but is a different tradition.",
      },
      {
        myth: "A red string bracelet is Kabbalah.",
        truth: "It is a folk custom that commercial groups turned into a brand; many rabbis criticise how it is sold.",
      },
    ],
    please: [
      "Please don’t call Hermetic or occult Qabalah “Jewish”.",
      "Please don’t use Hebrew names of God, tefillin, mezuzot or tallitot as magical props.",
      "Please don’t buy “Kabbalah” products sold as luck charms.",
      "Please don’t present yourself as teaching Kabbalah without grounding in Judaism.",
    ],
    learn:
      "Read Jewish scholars of Kabbalah and learn about Judaism itself first. If you are drawn to Jewish mysticism, a local synagogue or Jewish learning centre can tell you what it offers newcomers. If your interest is Hermetic Qabalah, study it as the Western esoteric system it is.",
    reading: [
      "Gershom Scholem, Major Trends in Jewish Mysticism (1941)",
      "Moshe Idel, Kabbalah: New Perspectives (1988)",
      "Arthur Green, A Guide to the Zohar (2004)",
      "Daniel C. Matt, The Essential Kabbalah (1995)",
      "Joseph Dan, Kabbalah: A Very Short Introduction (2006)",
    ],
  },
  {
    id: 'initiatory-wicca',
    name: "Initiatory Wicca",
    aka: [
      "British Traditional Wicca",
      "BTW",
      "Gardnerian Wicca",
      "Alexandrian Wicca",
      "Traditional Wicca",
      "Oathbound Book of Shadows",
    ],
    group: 'other',
    openness: 'initiatory',
    peoples:
      "Covens in lineages descending from Gerald Gardner (Gardnerian, from the 1950s) and Alex and Maxine Sanders (Alexandrian, from the 1960s), now in Britain, North America, Europe, Australia and elsewhere.",
    summary:
      "The original Wicca is a mystery religion entered by initiation into a coven, with an oathbound Book of Shadows copied by hand down the lineage. Its inner material is not published or taught here.",
    sections: [
      {
        heading: "Origins",
        body:
          "Gerald Gardner brought Wicca to public notice in England with Witchcraft Today (1954), presenting it as a surviving witch religion. Historians such as Ronald Hutton have shown it to be a modern religion built in the 1940s and 1950s from older sources: ceremonial magic, folklore, Freemasonry-influenced ritual structure and the work of writers such as Doreen Valiente, who rewrote much of the liturgy. Alex and Maxine Sanders founded the Alexandrian line in the 1960s.\n\nBeing modern takes nothing from its depth. It is a religion of the God and Goddess, the turning year and the mysteries, kept in small groups.",
      },
      {
        heading: "Lineage, degrees and oaths",
        body:
          "Initiatory Wicca is passed person to person: “only a witch can make a witch”. A seeker is initiated by a priestess or priest who was themselves initiated, so each Wiccan can trace a line back. There are usually three degrees, and the second or third allows a person to lead a coven.\n\nAt initiation, a Wiccan swears to keep the tradition’s secrets and copies the coven’s Book of Shadows by hand. Its contents are oathbound: some early material was published (by Gardner’s critics and later, with Doreen Valiente’s support, by Janet and Stewart Farrar), but reading text is not the same as being initiated. Traditional covens do not charge for training.",
      },
      {
        heading: "Our stance",
        body:
          "This app teaches open, eclectic witchcraft and the Wheel of the Year, which grew up alongside Wicca and borrowed widely from it. It does not reproduce or teach oathbound initiatory material, and it never claims to make anyone a Wiccan. When the app speaks of a “book of shadows”, it means your own personal journal, as most modern witches do.",
      },
    ],
    howPeopleComeIn:
      "By finding a coven in a recognised lineage, usually through outer-court or study groups and public pagan gatherings, then training with the coven, often for a year and a day, before initiation if both sides agree.",
    openAndClosed:
      "Initiatory: the oathbound Book of Shadows, coven rites and the inner mysteries. Open: published history and scholarship, public pagan events, the Wheel of the Year, and the large world of eclectic and solitary witchcraft that is not Wicca in the initiatory sense. Initiatory Wiccans hold a range of views on whether solitary practitioners should call themselves Wiccan; many prefer “witch” or “eclectic Wiccan” for non-initiates.",
    myths: [
      {
        myth: "Wicca is an unbroken religion from the Stone Age.",
        truth: "Wicca is a 20th-century religion drawing on older sources; historians and many Wiccans themselves now say so openly.",
      },
      {
        myth: "You can be initiated into Gardnerian Wicca online or by yourself.",
        truth: "Initiation is in person, by an initiated priest or priestess within the lineage.",
      },
      {
        myth: "The Book of Shadows sold in shops is the real thing.",
        truth: "Commercial “Books of Shadows” are blank journals or someone’s own writing; the lineage book is copied by hand from one’s initiator.",
      },
    ],
    please: [
      "Please don’t pay for Wiccan initiations or degrees.",
      "Please don’t claim a Gardnerian or Alexandrian lineage you don’t have.",
      "Please don’t share or sell copies of an oathbound Book of Shadows.",
      "Please be wary of any coven leader who asks for money, sex or secrecy from your family as a condition of training.",
    ],
    learn:
      "Read the history first, then attend public pagan events and moots and ask about outer-court groups. Take your time: a good coven will take time over you too.",
    reading: [
      "Ronald Hutton, The Triumph of the Moon: A History of Modern Pagan Witchcraft (1999)",
      "Doreen Valiente, The Rebirth of Witchcraft (1989)",
      "Philip Heselton, Witchfather: A Life of Gerald Gardner (2012)",
      "Vivianne Crowley, Wicca: The Old Religion in the New Age (1989)",
      "Thorn Mooney, Traditional Wicca: A Seeker’s Guide (2018)",
    ],
    community: ["The Pagan Federation (UK)", "The Doreen Valiente Foundation"],
  },
  {
    id: 'romani',
    name: "Romani traditions",
    aka: ["Roma", "Romani people", "Sinti", "Romanichal", "Kale", "“Gypsy” fortune telling"],
    group: 'other',
    openness: 'closed',
    peoples:
      "The Romani people, whose ancestors left northern India about a thousand years ago: Roma, Sinti, Kale, Manouche, Romanichal and many other groups across Europe, the Americas and beyond. Irish Travellers are a separate people with their own heritage.",
    summary:
      "Romani people have suffered centuries of persecution and are still sold as a costume: the mystical “gypsy fortune teller”. Romani culture, faith and customs belong to Romani people.",
    sections: [
      {
        heading: "A people, not a style",
        body:
          "Romani people arrived in Europe by the 14th century, and the Romani language descends from languages of northern India. Europeans thought they came from Egypt, which gave the exonym “Gypsy”. Many Romani people regard that word as a slur, though some reclaim it, especially some British Romanichal and Gypsy Traveller communities; when in doubt, say Roma or Romani.\n\nThe word lives on in insults, such as “gypped” for cheated, and in products like “gypsy tarot” and “gypsy witch” branding that turn a people into an aesthetic.",
      },
      {
        heading: "Persecution",
        body:
          "Roma were enslaved in the principalities of Wallachia and Moldavia, in present-day Romania, for around five centuries until abolition in 1855–56. Across Europe, laws expelled, branded and executed them. Under Nazi rule, Romani people were targeted for genocide; Romani people call it the Porajmos or Samudaripen, and estimates of the dead range from about 200,000 to half a million or more. Discrimination, forced evictions and violence continue today.",
      },
      {
        heading: "Faith and custom",
        body:
          "Most Romani people are Christian, Orthodox, Catholic or, increasingly, Pentecostal, and some are Muslim. Many keep their own customs of family, respect, purity and mourning, which vary between groups and are private. Pilgrimages such as the gathering at Saintes-Maries-de-la-Mer in France each May, honouring Saint Sara, are cherished Romani occasions.\n\nFortune telling was a trade some Romani women practised for non-Romani customers, often from poverty and exclusion. It is not a secret Romani magical system, and the “gypsy fortune teller” figure was largely built by outsiders.",
      },
    ],
    howPeopleComeIn:
      "Through being born into Romani families and communities. Marriage brings some people in, on the community’s terms.",
    openAndClosed:
      "Closed: Romani family customs, language within the community, and Romani identity itself. Open: Romani music, art and literature made and shared by Romani people, Romani history, and supporting Romani rights. Tarot, palmistry and other divination are open practices in their own right; they do not need to borrow a Romani costume.",
    myths: [
      {
        myth: "“Gypsy” fortune telling is an ancient Romani magical tradition.",
        truth: "Fortune telling was a livelihood for some Romani women serving outsiders, not a Romani religion; the mystical stereotype was created by non-Roma.",
      },
      {
        myth: "“Gypsy” just means a free spirit.",
        truth: "It is the name of a real, persecuted people, and many of them consider it a slur.",
      },
      {
        myth: "Romani people have no religion of their own.",
        truth: "Most practise Christianity or Islam with their own customs and pilgrimages, which are theirs to keep.",
      },
    ],
    please: [
      "Please don’t use “gypsy” in your practice’s name, products or social media.",
      "Please don’t dress up as a “gypsy fortune teller”.",
      "Please don’t sell “Romani spells” or “gypsy curses”.",
      "Please don’t say “gypped”.",
    ],
    learn:
      "Read Romani authors and scholars, follow Romani-led cultural and rights organisations, and mark International Romani Day on 8 April, which honours the first World Romani Congress in 1971.",
    reading: [
      "Ian Hancock, We Are the Romani People (2002)",
      "Ian Hancock, The Pariah Syndrome: An Account of Gypsy Slavery and Persecution (1987)",
      "Ronald Lee, Goddam Gypsy: An Autobiographical Novel (1971)",
      "Yaron Matras, I Met Lucky People: The Story of the Romani Gypsies (2014)",
    ],
    community: [
      "European Roma Institute for Arts and Culture (ERIAC)",
      "European Roma Rights Centre",
      "Romani Archives and Documentation Center (University of Texas at Austin)",
    ],
  },
  {
    id: 'shamanism',
    name: "Shamanism as a word",
    aka: ["Shaman", "Core shamanism", "Neo-shamanism", "Siberian shamanism", "Shamanic journeying"],
    group: 'other',
    openness: 'debated',
    peoples:
      "The word comes from the Evenki (Tungusic) people of Siberia. Siberian peoples such as the Evenki, Buryat, Tuvan, Sakha and Khanty have their own living traditions; Western “core shamanism” and neo-shamanism are modern practices.",
    summary:
      "“Shaman” is a Siberian word that Western scholars stretched to cover ritual specialists worldwide. Modern “core shamanism” is a Western creation, and Indigenous peoples have criticised it for flattening their traditions into one product.",
    sections: [
      {
        heading: "From Siberia to everywhere",
        body:
          "The word šaman comes from the Evenki language and reached Europe through Russian accounts in the 17th century. Scholars began using it for ritual specialists all over the world, and Mircea Eliade’s Shamanism: Archaic Techniques of Ecstasy (1951) made it a universal category. Many anthropologists now think the label hides more than it reveals: a Korean mudang, a Lakota medicine man and an Amazonian healer are not doing the same thing.\n\nIn Siberia itself, shamans were persecuted under Soviet rule. Since the 1990s there has been a revival, led by Siberian peoples and their own organisations.",
      },
      {
        heading: "Core shamanism and neo-shamanism",
        body:
          "In The Way of the Shaman (1980), the anthropologist Michael Harner presented “core shamanism”: practices he said were common to many cultures, stripped of their specific context and taught through workshops. It is open to anyone, and it is modern.\n\nCritics, including Native American writers who coined the term “whiteshamanism”, argue that core shamanism and wider neo-shamanism treat Indigenous peoples as raw material, separate practices from the communities that hold them, and let outsiders claim titles that, in their own cultures, are given by a people. Supporters see it as a respectful, generic method. Both views exist, and the debate is ongoing.",
      },
    ],
    howPeopleComeIn:
      "In Siberian and other Indigenous traditions, a shaman is usually recognised by their community, often after a calling, illness or inheritance, and trained by elders. Core shamanism is learned in open workshops.",
    openAndClosed:
      "Closed: the specific traditions of Siberian and other Indigenous peoples, and the title “shaman” as those communities use it. Open but debated: Western core shamanism and neo-shamanism, which are modern practices. If you practise them, it is more honest to name them as modern and not to claim any particular people’s tradition.",
    myths: [
      {
        myth: "Shamanism is the world’s single original religion.",
        truth: "It is a scholarly label applied to many different traditions; there was no single ancient world religion called shamanism.",
      },
      {
        myth: "A workshop certificate makes you a shaman.",
        truth: "In the traditions the word comes from, a shaman is recognised by their people, not certified by a course.",
      },
      {
        myth: "Core shamanism is an ancient tradition.",
        truth: "It was developed by Michael Harner in the late 20th century.",
      },
    ],
    please: [
      "Please don’t call yourself a shaman because of a course or a retreat.",
      "Please don’t present core shamanism as the tradition of a particular Indigenous people.",
      "Please don’t buy “shamanic” drums, rattles or regalia sold as Siberian, Sámi or Native without knowing who made them.",
    ],
    learn:
      "Read Siberian and other Indigenous scholars on their own traditions, and the historians and anthropologists who have traced how the word travelled. If you do journey work, describe it accurately as a modern practice.",
    reading: [
      "Mongush B. Kenin-Lopsan, Shamanic Songs and Myths of Tuva (1997)",
      "Piers Vitebsky, The Shaman (1995)",
      "Ronald Hutton, Shamans: Siberian Spirituality and the Western Imagination (2001)",
      "Alice Beck Kehoe, Shamans and Religion: An Anthropological Exploration in Critical Thinking (2000)",
      "Mircea Eliade, Shamanism: Archaic Techniques of Ecstasy (1951; English 1964)",
    ],
    related: ['native-american-first-nations', 'sami', 'mexican-andean'],
  },
];
