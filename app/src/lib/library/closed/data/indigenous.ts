import type { ClosedTradition } from '../types';

// Indigenous traditions the app does not teach. Explanations only: no
// ceremonies, prayers, songs or instructions. Each entry should be reviewed by
// people from the nations concerned before release.

export const INDIGENOUS: ClosedTradition[] = [
  {
    id: 'native-american-first-nations',
    name: "Native American & First Nations ceremony",
    aka: [
      "Native American spirituality",
      "First Nations spirituality",
      "Indigenous North American religion",
      "Medicine wheel",
      "Sweat lodge",
      "Smudging",
    ],
    group: 'indigenous',
    openness: 'closed',
    peoples:
      "Hundreds of distinct nations across Turtle Island (North America): more than 570 federally recognised tribes in the United States, over 630 First Nations in Canada, the Métis, and many state-recognised and unrecognised nations. Each has its own language, ceremonies, history and authority.",
    summary:
      "There is no single “Native American spirituality”. There are hundreds of nations, each with its own ceremonial life, held by its people and passed on through family, community and recognised ceremonial leaders.",
    sections: [
      {
        heading: "Many nations, not one religion",
        body:
          "Lakota, Diné (Navajo), Haudenosaunee, Anishinaabe, Hopi, Tlingit, Cherokee, Kumeyaay and hundreds of other nations each have their own ways, languages and sacred histories. What is central to one nation may be absent from, or forbidden in, another. Talking about “Native spirituality” as if it were one shared system is itself one of the misunderstandings Native people most often correct.\n\nFor many nations, ceremony is not a private spiritual practice but part of kinship, land, language and law. It belongs to a people and carries obligations to them.",
      },
      {
        heading: "Banned, and survived anyway",
        body:
          "In the United States, the 1883 Code of Indian Offenses let federal agents punish ceremonies such as the Sun Dance, and in Canada amendments to the Indian Act banned the potlatch (from 1884) and other ceremonies until 1951. Children were taken to boarding and residential schools where their languages and ways were forbidden. Ceremonies survived because families and communities kept them, often in secret.\n\nIn the US, the American Indian Religious Freedom Act of 1978 finally declared it federal policy to protect Native religious practice, including access to sacred sites and the use of sacred objects. Its protections have proved limited in court, and nations are still fighting for sacred lands today.",
      },
      {
        heading: "What outsiders get wrong",
        body:
          "The sweat lodge, the sacred pipe, the Sun Dance and the vision quest are named here only to say plainly: these are closed ceremonies, led by people with the standing and training to lead them, for their own communities. They are not workshops.\n\nIn October 2009, three people died and many more were hospitalised after a self-help seminar near Sedona, Arizona ran a commercial imitation of a sweat lodge; the organiser, James Arthur Ray, was convicted of negligent homicide in 2011. Native leaders had warned for decades that imitation ceremonies are dangerous as well as disrespectful.",
      },
      {
        heading: "Native voices on exploitation",
        body:
          "In June 1993, at Lakota Summit V, representatives of Lakota, Dakota and Nakota nations from the US and Canada passed the “Declaration of War Against Exploiters of Lakota Spirituality”, condemning New Age imitations and the sale of Lakota rites, and asking their own people to stop enabling it. In 2003 Arvol Looking Horse, Keeper of the Sacred White Buffalo Calf Pipe, asked that non-Natives no longer take part in Lakota sacred rites. Not every Lakota leader agreed with the 2003 statement, which is a reminder that these are living nations with their own debates.\n\nThe term “plastic shaman” is used by Native people for those, Native or not, who sell invented or stolen ceremonies to outsiders. Casual talk of a “spirit animal” is also widely felt as trivialising: in some nations, relationships with particular animals, clans and helpers are specific, serious and not chosen by personality quiz.",
      },
    ],
    howPeopleComeIn:
      "Through being born into, adopted by or married into a nation and living in relationship with it, and through the guidance of recognised elders and ceremonial leaders. Some ceremonies are restricted by nation, gender, age or calling. Where a guest is welcomed, it is by personal invitation from the community, never by buying a place.",
    openAndClosed:
      "Closed: the ceremonies themselves, sacred songs, pipes, regalia, ceremonial names, and the right to lead or sell any of it. Open: learning history from Native authors, visiting tribal museums and cultural centres, attending public powwows as a respectful guest, supporting language revitalisation and land return, and buying art from Native artists (the US Indian Arts and Crafts Act of 1990 makes it illegal to falsely market goods as Native-made). Smoke cleansing with herbs is found in many cultures, but “smudging” with white sage is a particular practice of some nations, not all, and the plant itself is under pressure (see sourcing notes).",
    myths: [
      {
        myth: "There is one Native American religion.",
        truth: "There are hundreds of nations with distinct ceremonies, beliefs and languages.",
      },
      {
        myth: "Smudging with white sage is a universal Native practice anyone can adopt.",
        truth: "Smoke from sage, cedar, sweetgrass or tobacco is used by some nations in their own ways. White sage is native to a small region of southern California and Baja California, and wild stands are being poached for the smudge-kit trade.",
      },
      {
        myth: "A sweat lodge is a detox or self-help exercise.",
        truth: "It is a ceremony with its own leaders, protocols and safety knowledge. Commercial imitations have killed people.",
      },
      {
        myth: "If you had a Cherokee great-grandmother, you can practise Native ceremony.",
        truth: "Nations decide their own citizenship and kinship. A family story is not a relationship with a living community.",
      },
      {
        myth: "Everyone has a spirit animal.",
        truth: "That phrase is a New Age idea, not a Native teaching; where animal relationships exist, they belong to specific nations, clans and ceremonies.",
      },
    ],
    please: [
      "Please don’t buy or join sweat lodges, vision quests, pipe ceremonies or Sun Dances sold by anyone.",
      "Please don’t sell or buy “smudge kits” built on wild-picked white sage.",
      "Please don’t wear headdresses, war bonnets or other regalia as costume.",
      "Please don’t call yourself a shaman or medicine person on the strength of a course.",
      "Please don’t use “spirit animal” or “tribe” as casual slang.",
      "Please don’t attend a ceremony unless a community member personally invites you, and follow their instructions if they do.",
    ],
    learn:
      "Learn the names of the nations whose land you live on and look for their own cultural centres, museums and language programmes. Read Native authors first. Support Indigenous-led land trusts, language work and artists, and give to tribal cultural organisations rather than to non-Native “teachers”. If a nation offers public events, go as a guest, listen, and buy from Native vendors.",
    reading: [
      "Vine Deloria Jr., God Is Red: A Native View of Religion (1973)",
      "Robin Wall Kimmerer, Braiding Sweetgrass (2013)",
      "Luther Standing Bear, Land of the Spotted Eagle (1933)",
      "Philip J. Deloria, Playing Indian (1998)",
      "Lisa Aldred, “Plastic Shamans and Astroturf Sun Dances”, American Indian Quarterly (2000)",
      "Suzanne Owen, The Appropriation of Native American Spirituality (2008)",
    ],
    community: [
      "The cultural and historic preservation offices of individual tribal nations",
      "National Museum of the American Indian (Smithsonian), Washington DC and New York",
      "National Congress of American Indians",
      "Assembly of First Nations (Canada)",
    ],
    related: ['inuit-arctic', 'mexican-andean', 'shamanism'],
  },
  {
    id: 'aboriginal-torres-strait',
    name: "Aboriginal and Torres Strait Islander spirituality",
    aka: [
      "The Dreaming",
      "Dreamtime",
      "Tjukurpa",
      "Altyerre",
      "Ailan Kastom",
      "Aboriginal spirituality",
    ],
    group: 'indigenous',
    openness: 'closed',
    peoples:
      "Hundreds of Aboriginal nations across Australia, with around 250 languages at the time of colonisation, and the Torres Strait Islander peoples of the islands between Cape York and Papua New Guinea, who are distinct peoples with their own cultures.",
    summary:
      "The oldest continuous living cultures on Earth, in which law, land, kinship and story are one. Much knowledge is secret and sacred, held by people with the right to it.",
    sections: [
      {
        heading: "“The Dreaming” is an English approximation",
        body:
          "“Dreaming” and “Dreamtime” are English words. They come from the 1890s, when Francis Gillen and Baldwin Spencer used them to translate the Arrernte word altyerre, and the translation was disputed almost at once. Each nation has its own word and its own understanding: for Anangu at Uluru it is Tjukurpa. The anthropologist W. E. H. Stanner called it the “everywhen”: not a distant past but a reality that is still present.\n\nSome Aboriginal people dislike “Dreaming” because it suggests something unreal. Many describe it instead as Law: the foundation of how to live, who is related to whom, and how to care for Country.",
      },
      {
        heading: "Law and Country",
        body:
          "“Country” in Aboriginal English means far more than land. It is a living relationship with a particular place, its waters, plants, animals, ancestors and stories, and the responsibility to care for it. Stories, songlines, ceremonies and art carry that Law, and they belong to particular families, clans and nations with the right to tell them.\n\nKnowledge is held in layers. Some is public, some is shared only after initiation, and some is men’s business or women’s business, restricted by gender. Outsiders are not owed the restricted layers, and sharing them wrongly can do real harm within a community.",
      },
      {
        heading: "Uluru",
        body:
          "Uluru is a sacred place for its Anangu traditional owners. The title was handed back to Anangu on 26 October 1985, and the park is jointly managed. Anangu had long asked visitors not to climb, and the climb was permanently closed on 26 October 2019. Parts of the rock are sensitive sites, and visitors are asked not to photograph them.",
      },
      {
        heading: "Torres Strait Islanders",
        body:
          "Torres Strait Islander peoples have their own languages and traditions, often called Ailan Kastom (island custom), with strong ties to the sea and to Melanesia. Christianity is central for many Islanders, and the arrival of the London Missionary Society in 1871 is marked each year as the “Coming of the Light”. Their ways should never be folded into “Aboriginal” as if they were the same.",
      },
    ],
    howPeopleComeIn:
      "Through birth and kinship, and through learning from elders over a lifetime, including initiation in many nations. Restricted knowledge passes only to people with the right to receive it, by family, gender, age and standing.",
    openAndClosed:
      "Closed: sacred stories, songs, ceremonies, restricted designs and anything shared as men’s or women’s business. Open: public stories that communities choose to share, cultural tours run by traditional owners, Aboriginal-owned art centres, language learning offered by communities, and listening to Aboriginal and Torres Strait Islander writers and artists. Many communities ask that the names and images of people who have died are used with care; follow any cultural warning you see.",
    myths: [
      {
        myth: "The Dreamtime is a set of myths about the distant past.",
        truth: "It is a living Law that shapes present life, kinship and care for Country, and every nation has its own name for it.",
      },
      {
        myth: "There is one Aboriginal culture and language.",
        truth: "There are hundreds of nations and around 250 languages were spoken at colonisation, plus the distinct Torres Strait Islander cultures.",
      },
      {
        myth: "Dot paintings are a style anyone can use.",
        truth: "Designs can carry stories and rights that belong to particular artists and families. Buy from Aboriginal-owned art centres instead of imitating them.",
      },
      {
        myth: "Uluru was just a tourist climb.",
        truth: "Anangu asked visitors not to climb for decades because of its sacred significance; the climb closed in 2019.",
      },
    ],
    please: [
      "Please don’t retell or adapt sacred stories as material for your own rituals.",
      "Please don’t copy Aboriginal art styles or designs onto products or altars.",
      "Please don’t buy “Aboriginal-style” didgeridoos, art or souvenirs without checking they are Aboriginal-made.",
      "Please don’t photograph sites traditional owners ask you not to.",
      "Please don’t use “Dreamtime” as a brand name for your practice.",
    ],
    learn:
      "Learn whose Country you live on or visit, and look for that nation’s own cultural programmes. Read Aboriginal and Torres Strait Islander authors, buy from Indigenous-owned art centres, and support language centres and land councils. Join a cultural tour led by traditional owners and let them decide what to share.",
    reading: [
      "Tyson Yunkaporta, Sand Talk: How Indigenous Thinking Can Save the World (2019)",
      "W. E. H. Stanner, “The Dreaming” (essay, 1953)",
      "Deborah Bird Rose, Nourishing Terrains: Australian Aboriginal Views of Landscape and Wilderness (1996)",
      "Anita Heiss (ed.), Growing Up Aboriginal in Australia (2018)",
    ],
    community: [
      "Australian Institute of Aboriginal and Torres Strait Islander Studies (AIATSIS)",
      "Uluru-Kata Tjuta National Park, jointly managed by Anangu and Parks Australia",
      "Regional land councils, such as the Central Land Council",
    ],
    related: ['maori', 'native-hawaiian'],
  },
  {
    id: 'maori',
    name: "Māori tradition",
    aka: ["Te ao Māori", "Tikanga Māori", "Māori spirituality", "Haka", "Tā moko"],
    group: 'indigenous',
    openness: 'closed',
    peoples:
      "Māori, the tangata whenua (Indigenous people) of Aotearoa New Zealand, organised by iwi (tribes) and hapū (sub-tribes), each with its own history and authority.",
    summary:
      "A living world view in which people, ancestors, land and the spiritual are bound together through tikanga (right ways of doing things), tapu and mana. Māori culture is shared generously in public life, but its sacred knowledge and taonga belong to Māori.",
    sections: [
      {
        heading: "Tikanga, tapu and mana",
        body:
          "Tikanga are the customs and right ways of doing things, and they differ between iwi and hapū. Tapu is often translated as “sacred” or “restricted”: people, places and objects can be tapu, and tikanga set out how that is respected and lifted. Mana is authority, standing and spiritual power, carried by people and groups. Karakia are prayers and incantations used to begin and end gatherings, meals and work, and to address the spiritual world.\n\nThese ideas are part of everyday life on the marae (tribal meeting grounds) and beyond, and they are understood through whakapapa: genealogy linking people to ancestors, land and the natural world.",
      },
      {
        heading: "Suppression and revival",
        body:
          "Colonisation took most Māori land, and schools punished children for speaking te reo Māori. The Tohunga Suppression Act 1907 targeted tohunga (experts in sacred knowledge and healing); it was repealed in 1962. From the 1970s a strong revival brought back the language through kōhanga reo (language nests) and kura kaupapa (Māori-medium schools), and te reo is now an official language.",
      },
      {
        heading: "Haka, moko and taonga",
        body:
          "Haka are posture dances with many purposes: welcome, challenge, mourning and celebration. Many New Zealanders, Māori and not, learn haka at school and in sport under Māori guidance. The haka Ka Mate, composed by the chief Te Rauparaha, is recognised in law: the Haka Ka Mate Attribution Act 2014 gives Ngāti Toa Rangatira a right to be credited when it is used commercially.\n\nTā moko, traditional tattoo, carries whakapapa and identity and is for Māori. Many Māori artists offer kirituhi, Māori-inspired designs created for non-Māori, as a respectful alternative. Both haka and moko are taonga: treasures of the people.",
      },
      {
        heading: "The Wai 262 claim",
        body:
          "In 1991 claimants brought the Wai 262 claim to the Waitangi Tribunal over the protection of Māori culture, identity, native plants and traditional knowledge. The Tribunal’s report, Ko Aotearoa Tēnei, released in 2011, found that law and policy failed to protect taonga and Māori control over them, and recommended wide reform. It remains a landmark statement about who has the right to care for Māori cultural treasures.",
      },
    ],
    howPeopleComeIn:
      "Through whakapapa, belonging to whānau, hapū and iwi, and learning on the marae from elders and tohunga. Guests are welcomed onto a marae through the pōwhiri (welcome ceremony), which is how outsiders enter as visitors, not as practitioners.",
    openAndClosed:
      "Closed: tā moko, the sacred knowledge of tohunga, iwi-specific karakia and whakapapa, and the right to perform or sell taonga as your own. Open: learning te reo Māori through community and public courses, learning the basics of tikanga as a guest, attending public events and pōwhiri when invited, kirituhi made by Māori artists, and supporting Māori-led culture and land work.",
    myths: [
      {
        myth: "Māori religion is a set of gods you can add to a pantheon.",
        truth: "Atua (ancestral deities) live within whakapapa and iwi traditions; they are relatives within a people’s genealogy, not deities for outsiders to adopt.",
      },
      {
        myth: "Any Polynesian-looking tattoo is a moko.",
        truth: "Tā moko is specific to Māori and carries a person’s identity. Generic “tribal” designs copying it are widely seen as offensive.",
      },
      {
        myth: "The haka is a war dance anyone can perform for fun.",
        truth: "Haka have many purposes and are taught with tikanga. Using them as a party trick or advertising gimmick is disrespectful.",
      },
    ],
    please: [
      "Please don’t get a moko-style face or body tattoo unless it is kirituhi designed by a Māori artist for you.",
      "Please don’t perform haka as a joke, a costume or a marketing stunt.",
      "Please don’t borrow karakia or Māori sacred words for your own rituals.",
      "Please don’t sell pounamu, carvings or designs as Māori unless they are made by Māori.",
    ],
    learn:
      "Start with te reo Māori; free and low-cost courses are widely available, many of them Māori-led. Read Māori authors, visit iwi-run cultural centres and Te Papa Tongarewa, and if you visit a marae, learn the basics of the pōwhiri beforehand and follow your hosts.",
    reading: [
      "Hirini Moko Mead, Tikanga Māori: Living by Māori Values (2003)",
      "Ranginui Walker, Ka Whawhai Tonu Matou: Struggle Without End (1990)",
      "Ngahuia Te Awekotuku, Mau Moko: The World of Māori Tattoo (2007)",
      "Waitangi Tribunal, Ko Aotearoa Tēnei: Report on the Wai 262 Claim (2011)",
    ],
    community: [
      "Te Taura Whiri i te Reo Māori (Māori Language Commission)",
      "Te Papa Tongarewa, Museum of New Zealand",
      "Iwi authorities and runanga for each region",
    ],
    related: ['native-hawaiian', 'aboriginal-torres-strait'],
  },
  {
    id: 'native-hawaiian',
    name: "Native Hawaiian religion",
    aka: ["Hawaiian religion", "Kapu", "ʻAumakua", "Pele", "Huna", "Hoʻoponopono"],
    group: 'indigenous',
    openness: 'closed',
    peoples:
      "Kānaka Maoli (Native Hawaiians), the Indigenous people of the Hawaiian Islands, in Hawaiʻi and the diaspora.",
    summary:
      "A religion of akua (gods), ancestral guardians and sacred land, carried through genealogy, chant, hula and care for the ʻāina (land). Hawaiian language and hula are taught widely; sacred and family knowledge is not for outsiders to take.",
    sections: [
      {
        heading: "Kapu, akua and ʻaumakua",
        body:
          "Before 1819, the kapu system organised life through sacred restrictions, governing what could be eaten, touched or done, by whom and when. In 1819 Liholiho (Kamehameha II), with Kaʻahumanu and Keōpūolani, broke the kapu publicly, and the state temple system fell. Christian missionaries arrived the next year.\n\nBut Hawaiian religion did not end. Families kept their ʻaumakua, ancestral guardians who may appear as a shark, owl or other form. An ʻaumakua belongs to a particular family line; it is not something anyone else can claim. Akua such as Pele, the volcano goddess of Kīlauea, are honoured through chant, hula and family tradition.",
      },
      {
        heading: "Suppression and renaissance",
        body:
          "Missionary pressure pushed hula and chant out of public life until King Kalākaua championed them in the 1880s. After the overthrow of the Hawaiian Kingdom in 1893, an 1896 law made English the language of schooling, and Hawaiian nearly disappeared. The Hawaiian Renaissance of the 1970s brought back voyaging, hula, language immersion schools and land protection, and that work continues.",
      },
      {
        heading: "Mauna Kea and sacred land",
        body:
          "Mauna Kea (Maunakea) on Hawaiʻi Island is a sacred mountain, seen as a realm of the gods and an ancestor of the Hawaiian people. In 2019 thousands of kiaʻi (protectors) gathered to oppose building the Thirty Meter Telescope there, and the long dispute led the state to create a new authority in 2022 that includes Native Hawaiian voices in managing the summit. For many Hawaiians, the land itself is sacred, and caring for it is religious practice.",
      },
    ],
    howPeopleComeIn:
      "Through family and genealogy, and through study with a kumu (teacher) in a hālau or other recognised lineage. Many hālau hula accept students who are not Hawaiian, and the teacher sets the protocols; sacred chant and family knowledge stay with those entitled to it.",
    openAndClosed:
      "Closed: family ʻaumakua, sacred chants and prayers, ceremonies at heiau (temples), and the title kahuna, which means a recognised expert and cannot be bought. Open: learning ʻōlelo Hawaiʻi (the Hawaiian language), studying hula with a reputable kumu, reading Hawaiian scholars, volunteering with Hawaiian-led land and fishpond restoration, and visiting sacred places as a respectful guest.",
    myths: [
      {
        myth: "Huna is the secret ancient religion of Hawaiʻi.",
        truth: "Huna was created in the 1930s by Max Freedom Long, a white American writer, mixing New Thought and Theosophy. Hawaiian scholars do not recognise it as a Hawaiian tradition.",
      },
      {
        myth: "Hoʻoponopono is a four-line mantra anyone can use.",
        truth: "Traditional hoʻoponopono is a family reconciliation process guided by an elder. The popular self-help version descends from a 20th-century adaptation and was then repackaged by others; many Hawaiians see the self-help marketing as a distortion.",
      },
      {
        myth: "Anyone can have an ʻaumakua.",
        truth: "ʻAumakua are ancestral guardians of particular families, inherited, not chosen.",
      },
    ],
    please: [
      "Please don’t buy “Huna” or “kahuna” trainings.",
      "Please don’t take lava rocks, sand or offerings from sacred places.",
      "Please don’t adopt an ʻaumakua or invoke Pele in your own rituals.",
      "Please don’t treat hula as a costume dance; if you want to learn, find a kumu.",
    ],
    learn:
      "Learn ʻōlelo Hawaiʻi, read Hawaiian authors and historians, and support Hawaiian-led organisations caring for land, water and culture. If you visit, follow the guidance of local communities and the park services at sacred places.",
    reading: [
      "Mary Kawena Pukui, E. W. Haertig and Catherine A. Lee, Nānā i ke Kumu (Look to the Source) (1972)",
      "Lilikalā Kameʻeleihiwa, Native Land and Foreign Desires (1992)",
      "Haunani-Kay Trask, From a Native Daughter (1993)",
      "Samuel Mānaiakalani Kamakau, Ruling Chiefs of Hawaii (English edition 1961)",
    ],
    community: [
      "Office of Hawaiian Affairs",
      "Edith Kanakaʻole Foundation",
      "Bishop Museum, Honolulu",
    ],
    related: ['maori', 'aboriginal-torres-strait'],
  },
  {
    id: 'sami',
    name: "Sámi traditional religion",
    aka: ["Saami religion", "Noaidi", "Sámi drum", "Goavddis", "Joik", "Lapp shamanism"],
    group: 'indigenous',
    openness: 'closed',
    peoples:
      "The Sámi, the Indigenous people of Sápmi, across northern Norway, Sweden, Finland and the Kola Peninsula of Russia, with several distinct Sámi languages.",
    summary:
      "The pre-Christian religion of the Sámi, with its noaidi (ritual specialists) and sacred drums, was violently suppressed. It lives on today in memory, language, joik and Sámi-led cultural revival, and it belongs to the Sámi.",
    sections: [
      {
        heading: "Noaidi, drums and sacred places",
        body:
          "Traditional Sámi religion was bound to land, reindeer, animals and the dead. Sacred sites (sieidi), often unusual stones or places in the landscape, received offerings. The noaidi was a ritual specialist who could travel between worlds on behalf of the community, often with a painted drum. Joik, the Sámi vocal tradition, expresses a person, animal or place, and is now mostly a cultural and artistic form.\n\nPractices varied a great deal between regions and Sámi groups, and much of what was written about them comes from missionaries and court records, so scholars treat the sources with care.",
      },
      {
        heading: "Seized, burned and returned",
        body:
          "From the 17th and 18th centuries, Lutheran church and state authorities campaigned to convert the Sámi. Drums were confiscated and many were burned; noaidi were persecuted, and some were tried and executed for sorcery. Only around 70 old drums survive, most in museums.\n\nIn recent years Sámi museums have been bringing drums home. In 2022 Denmark transferred ownership of the drum confiscated from Anders Poulsen in 1691 to the Sámi museum in Karasjok, and South Sámi institutions have negotiated the return of other drums from museums abroad.",
      },
      {
        heading: "Sámi views today",
        body:
          "The Sámi have their own parliaments in Norway, Sweden and Finland. In 2018 the Sámi Parliament in Finland adopted ethical guidelines for tourism, asking businesses not to stage fake Sámi culture, imitate gákti (traditional dress) or sell distorted images of Sámi spirituality. Sámi groups have also objected strongly to non-Sámi people dressing up as Sámi.\n\nSámi people hold a range of views. Most are Christian, often Laestadian Lutheran; some are reviving older ways in their own communities, and some Sámi lead festivals and workshops of their own. What matters is that Sámi people decide how their heritage is used.",
      },
    ],
    howPeopleComeIn:
      "Through being Sámi: family, language, community and connection to Sápmi. Sámi who are reconnecting with older practices do so within their own communities and families.",
    openAndClosed:
      "Closed: the drum and its symbols as ritual tools, noaidi practice, sacred sites as places for outsiders’ rituals, joik used as your own, and gákti worn by non-Sámi. Open: visiting Sámi museums and Sámi-run tourism, reading Sámi writers, listening to Sámi musicians, learning about Sámi history and rights, and supporting Sámi language work.",
    myths: [
      {
        myth: "Norse paganism and Sámi religion are the same thing.",
        truth: "They are different religions of different peoples, though the two met and influenced each other for centuries.",
      },
      {
        myth: "A “Sámi shaman drum” sold online is a Sámi drum.",
        truth: "Mass-produced frame drums printed with Sámi-style figures are imitations, and Sámi organisations object to them.",
      },
      {
        myth: "Sámi religion died out centuries ago.",
        truth: "It was suppressed, but memory, sacred places, joik and family knowledge survived, and Sámi people are reclaiming their heritage on their own terms.",
      },
    ],
    please: [
      "Please don’t buy or paint “Sámi” drums for your own practice.",
      "Please don’t call yourself a noaidi.",
      "Please don’t wear gákti or Sámi-style costume.",
      "Please don’t hold rituals at Sámi sacred sites.",
    ],
    learn:
      "Visit Sámi museums such as RiddoDuottarMuseat in Karasjok, Ájtte in Jokkmokk or Siida in Inari, choose Sámi-owned tourism, read Sámi authors and listen to joik artists who share their own work.",
    reading: [
      "Håkan Rydving, The End of Drum-Time: Religious Change among the Lule Saami, 1670s–1740s (1993)",
      "Nils-Aslak Valkeapää, The Sun, My Father (English edition 1997)",
      "Harald Gaski (ed.), In the Shadow of the Midnight Sun: Contemporary Sami Prose and Poetry (1996)",
    ],
    community: [
      "The Sámi Parliaments of Norway, Sweden and Finland",
      "Saami Council",
      "RiddoDuottarMuseat (Sámi museums), Karasjok",
      "Ájtte, Swedish Mountain and Sámi Museum, Jokkmokk",
      "Siida, the Sámi Museum, Inari",
    ],
    related: ['inuit-arctic', 'shamanism'],
  },
  {
    id: 'inuit-arctic',
    name: "Inuit and Arctic traditions",
    aka: ["Inuit spirituality", "Angakkuq", "Sedna", "Throat singing", "Katajjaq"],
    group: 'indigenous',
    openness: 'closed',
    peoples:
      "Inuit across Inuit Nunangat in Canada, Kalaallit in Greenland, and the Iñupiat and Yupik peoples of Alaska and Chukotka, among other Arctic peoples.",
    summary:
      "Arctic peoples’ traditions of respect for animals, the sea and the land, once guided by the angakkuq (ritual specialist). Much was suppressed by missions; what survives belongs to Inuit and their neighbours.",
    sections: [
      {
        heading: "Respect, animals and the sea",
        body:
          "Inuit traditions centre on right relationships with animals, the weather and the sea, kept through rules of respect. Stories of the sea woman (known by names such as Nuliajuk or Sanna, and widely in English as Sedna) vary by region and are told within families and communities. The angakkuq could mediate with the spirit world for the group.\n\nChristian missions in the 19th and 20th centuries discouraged drum dancing and the angakkuq’s work, and most Inuit today are Christian. Drum dancing and throat singing have since been revived as treasured parts of Inuit culture.",
      },
      {
        heading: "Inuit knowledge today",
        body:
          "Inuit Qaujimajatuqangit, “what Inuit have always known to be true”, is used in Nunavut as a guide to values and governance. Throat singing (katajjaq) is an Inuit women’s tradition, and Inuit performers have asked non-Inuit not to perform or sell it as their own.",
      },
    ],
    howPeopleComeIn:
      "Through family and community, with elders as the keepers of knowledge.",
    openAndClosed:
      "Closed: spiritual practice, the angakkuq’s role, and throat singing or sacred stories presented as your own. Open: Inuit art, music, film and literature, and Inuit-run tourism and cultural centres.",
    myths: [
      {
        myth: "Sedna is an Inuit goddess for anyone’s altar.",
        truth: "The sea woman appears in regional stories, which belong to the people who tell them; she is not a pan-Inuit deity to adopt.",
      },
      {
        myth: "“Eskimo” is the correct name.",
        truth: "In Canada and Greenland it is considered outdated and offensive. Use Inuit, or the specific people’s name.",
      },
    ],
    please: [
      "Please don’t use Inuit stories or figures in your own rituals.",
      "Please don’t perform throat singing as entertainment unless Inuit have taught and invited you.",
      "Please don’t buy “Inuit-style” art without checking it is made by Inuit artists.",
    ],
    learn:
      "Enjoy and buy Inuit art through Inuit cooperatives, read Inuit authors, and follow Inuit-led organisations on Arctic rights and climate.",
    reading: [
      "Joe Karetak, Frank Tester and Shirley Tagalik (eds), Inuit Qaujimajatuqangit: What Inuit Have Always Known to Be True (2017)",
      "Tanya Tagaq, Split Tooth (2018)",
      "Knud Rasmussen, Intellectual Culture of the Iglulik Eskimos (1929)",
    ],
    community: ["Inuit Tapiriit Kanatami", "Inuit Circumpolar Council"],
    related: ['sami', 'native-american-first-nations', 'shamanism'],
  },
  {
    id: 'mexican-andean',
    name: "Indigenous Mexican and Andean traditions",
    aka: [
      "Curanderismo",
      "Temazcal",
      "Ayahuasca",
      "Pachamama",
      "Despacho",
      "Mesoamerican spirituality",
    ],
    group: 'indigenous',
    openness: 'debated',
    peoples:
      "Indigenous peoples of Mexico and Central America (Nahua, Maya, Zapotec, Mixtec, Wixárika and many more), Andean peoples (Quechua and Aymara), and Amazonian peoples such as the Shipibo-Konibo, alongside the mestizo communities whose folk healing grew from these roots.",
    summary:
      "Living Indigenous traditions and mestizo folk healing that are often lifted out of context for tourism and wellness. Some parts, such as curanderismo’s folk herbalism, are partly open; Indigenous ceremonies are not.",
    sections: [
      {
        heading: "Curanderismo: shared, but with roots",
        body:
          "Curanderismo is the folk healing of Mexico and the Mexican American Southwest. It is mestizo: a blend of Indigenous Mesoamerican medicine, Spanish Catholic tradition, and African and other influences. Curanderos and curanderas may work with herbs, prayer, massage and spiritual cleansings (limpias), often within Catholic faith.\n\nBecause it is a folk tradition of a whole people, parts of it are more open than Indigenous ceremony. Some curanderos teach outsiders, and the University of New Mexico has long run a course on curanderismo with practising healers. Even so, it belongs to Mexican and Chicano communities, and it is learned from them, with respect for its Catholic and Indigenous roots.",
      },
      {
        heading: "Temazcal and ayahuasca",
        body:
          "The temazcal is the Mesoamerican sweat bath, used for thousands of years for healing, purification and care after childbirth, and still part of family and community life. Resort versions sell it as an exotic spa, often without the knowledge or care that traditional temazcaleras bring.\n\nAyahuasca is a sacred plant medicine of some, not all, Amazonian peoples; Peru declared the traditional knowledge and use of ayahuasca by native Amazonian communities part of its national cultural heritage in 2008. A tourism boom has brought deaths, sexual abuse by fake healers, dangerous drug interactions and overharvesting near tourist hubs. In 2018 Olivia Arévalo, an 81-year-old Shipibo-Konibo healer and rights defender, was shot dead; a Canadian tourist suspected of killing her was then lynched. Who killed her was never clearly established, but the case drew attention to the strain ayahuasca tourism places on Indigenous communities.",
      },
      {
        heading: "Pachamama and the Andes",
        body:
          "In Quechua and Aymara thought, Pachamama is Mother Earth, and also the world in its time and space. She is honoured through offerings and community obligations that are part of Andean agricultural life and Catholic festivals alike. Tour companies now sell “Andean shaman” ceremonies to visitors, often using the names of particular peoples such as the Q’ero. Andean people hold a range of views on sharing, but buying a ceremony from a tour package is not the same as being part of the community that keeps it.",
      },
    ],
    howPeopleComeIn:
      "Into Indigenous ceremony: through belonging to the community and learning from its elders. Into curanderismo: often through family, apprenticeship to a curandero or curandera, and sometimes through courses taught by practising healers from the tradition.",
    openAndClosed:
      "Partly open: general folk herbal knowledge, Mexican Catholic devotions and learning from curanderos who choose to teach. Closed: Indigenous ceremonies, sacred songs and medicines, and the right to call yourself a curandero, chamán, paqo or ayahuasquero after a retreat. Mexican, Chicano and Indigenous people disagree among themselves about how much should be shared with outsiders, and both views deserve respect.",
    myths: [
      {
        myth: "Ayahuasca is an ancient medicine of all Amazonian peoples.",
        truth: "It is central to some Amazonian traditions and absent from others, and the modern tourist ceremony is a recent creation.",
      },
      {
        myth: "A temazcal is just a sauna.",
        truth: "It is a living Mesoamerican practice with its own knowledge and meaning, and serious heat risks without it.",
      },
      {
        myth: "Curanderismo is ancient Aztec magic.",
        truth: "It is a mestizo folk tradition with Indigenous, Spanish Catholic and African roots, often practised within Catholic faith.",
      },
    ],
    please: [
      "Please don’t book ayahuasca or “plant medicine” retreats without understanding the risks and who benefits; many Indigenous groups ask visitors not to come at all.",
      "Please don’t call yourself a curandera, chamán or paqo after a weekend course.",
      "Please don’t run your own temazcal or despacho ceremonies.",
      "Please don’t use Pachamama as a generic “Earth goddess” for your altar.",
    ],
    learn:
      "Learn from Mexican, Chicano and Indigenous authors and healers, support community botánicas and Indigenous-run cooperatives, and give to Indigenous-led organisations defending Amazonian and Andean lands and rights.",
    reading: [
      "Eliseo “Cheo” Torres, Curandero: A Life in Mexican Folk Healing (2005)",
      "Elena Avila, Woman Who Glows in the Dark: A Curandera Reveals Traditional Aztec Secrets of Physical and Spiritual Health (1999)",
      "Catherine J. Allen, The Hold Life Has: Coca and Cultural Identity in an Andean Community (1988)",
      "Beatriz Caiuby Labate and Clancy Cavnar (eds), Ayahuasca Shamanism in the Amazon and Beyond (2014)",
    ],
    related: ['native-american-first-nations', 'shamanism'],
  },
];
