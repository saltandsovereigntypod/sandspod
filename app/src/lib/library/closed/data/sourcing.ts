import type { SourcingNote } from '../types';

// Plants, resins and stones whose sourcing raises real concerns, with what to
// do instead. Refs point to Living Library entries where the app has one.

export const SOURCING: SourcingNote[] = [
  {
    name: "White sage (Salvia apiana)",
    concern:
      "White sage grows wild only in southern California and northern Baja California, on the lands of the Kumeyaay, Cahuilla, Chumash, Tongva, Luiseño and other nations, for whom it is sacred. The smudge-stick boom has led to widespread poaching from public and private land, often by the truckload, and Native people have asked outsiders to stop buying wild-picked white sage.",
    instead:
      "Use herbs that grow where you live: garden sage, rosemary, juniper, bay, lavender or mugwort all have their own long histories of cleansing smoke and washes. If you feel you must have white sage, buy only from Native growers, or grow it yourself from responsibly sourced seed.",
    tradition: 'native-american-first-nations',
  },
  {
    ref: 'traditional/herb/sage',
    name: "Garden sage as an alternative",
    concern:
      "Garden sage (Salvia officinalis) is a different plant from white sage, and is easy to grow almost anywhere. The only concern is calling it “smudging”, which names a particular Indigenous practice.",
    instead:
      "Grow your own and call what you do smoke cleansing or saining, which describes many cultures’ customs, including European ones.",
  },
  {
    name: "Palo santo (Bursera graveolens)",
    concern:
      "Palo santo is a tree of the dry forests of Ecuador and Peru, and is part of Andean and coastal folk healing. Good-quality palo santo should come only from wood that has died and lain on the ground for years, and Peru requires permits showing legal origin. Forest authorities regularly seize illegally cut wood, and a lot of sticks sold abroad are of unknown origin, freshly cut or not palo santo at all. Its IUCN status is old (2010), so nobody can say for certain how wild stands are doing.",
    instead:
      "Buy only from sellers who can name the community or cooperative, show the legal paperwork and confirm the wood was collected from fallen trees, ideally with profits going to local reforestation. Or use local woods and resins instead.",
    tradition: 'mexican-andean',
  },
  {
    name: "Sweetgrass",
    concern:
      "Sweetgrass (Hierochloe odorata, also called Anthoxanthum nitens) is sacred to many Nations, including Anishinaabe and Haudenosaunee peoples, and its braids carry ceremonial meaning. Robin Wall Kimmerer, a Potawatomi botanist, has written about how careful Indigenous harvesting helps sweetgrass thrive, in a relationship of reciprocity.",
    instead:
      "Buy sweetgrass only from Indigenous growers and braiders, or not at all. Supporting Indigenous harvesters supports the relationship itself.",
    tradition: 'native-american-first-nations',
  },
  {
    ref: 'traditional/herb/sandalwood',
    name: "Sandalwood",
    concern:
      "Indian sandalwood (Santalum album) is listed as Vulnerable on the IUCN Red List after centuries of overharvesting and smuggling. Hawaiian sandalwood (ʻiliahi) was stripped from the islands in the early 1800s for the China trade. Cheap “sandalwood” incense is often synthetic fragrance on another wood.",
    instead:
      "Choose plantation-grown sandalwood from a supplier who can show its origin. Australian sandalwood (Santalum spicatum) is sold as an alternative, harvested under licence in Western Australia, but wild stands there are also under pressure, so look for plantation sources. A little goes a long way; use it sparingly.",
  },
  {
    ref: 'traditional/herb/frankincense',
    name: "Frankincense",
    concern:
      "Frankincense comes from Boswellia trees in the Horn of Africa, Arabia and India. A 2019 study in Nature Sustainability found that most populations of Boswellia papyrifera, the main source in Ethiopia, Eritrea and Sudan, have almost no young trees, and projected that production could halve within 20 years. Over-tapping, grazing and fire are the main causes. Tappers are often poorly paid.",
    instead:
      "Buy from suppliers who name the species and origin. Boswellia sacra (also sold as B. carteri) from Oman and Somaliland, and B. frereana from Somaliland, are traded through some fair-trade and community-based sources; look for traceability and fair pay rather than the lowest price. Use small amounts.",
  },
  {
    ref: 'traditional/herb/myrrh',
    name: "Myrrh",
    concern:
      "Myrrh is resin from Commiphora trees, mostly gathered in Somalia, Ethiopia, Kenya and Yemen, often by pastoralist families in fragile drylands. Supply chains are opaque, and myrrh is often mixed with cheaper Commiphora resins such as opopanax.",
    instead:
      "Buy from sellers who name the species and region and pay harvesters fairly. Smaller, traceable suppliers are often better than bulk resin of unknown origin.",
  },
  {
    name: "Frankincense and myrrh fraud",
    concern:
      "Because demand is high, resins and especially essential oils are widely adulterated or mislabelled: cheaper species sold as premium ones, oils cut with solvents or synthetic fragrance, and “frankincense” incense that contains little real resin.",
    instead:
      "Prefer whole resin tears to powders or oils. Look for the botanical name, origin and harvest year, and for essential oils, suppliers who publish batch test results (GC/MS). Very cheap is a warning sign.",
  },
  {
    ref: 'traditional/herb/copal',
    name: "Copal",
    concern:
      "Copal is the sacred resin of Mesoamerica, burned by Maya, Nahua and other peoples for millennia and still central to their ceremonies and to Día de Muertos. Most comes from Bursera and Protium trees tapped by rural and Indigenous harvesters, who often earn very little.",
    instead:
      "Buy fair-trade copal from Mexican or Guatemalan cooperatives or Indigenous-owned suppliers, and treat it with the respect it holds where it comes from.",
    tradition: 'mexican-andean',
  },
  {
    ref: 'traditional/herb/dragons_blood',
    name: "Dragon’s blood",
    concern:
      "“Dragon’s blood” is a name for several unrelated red resins. Most sold today comes from Daemonorops rattan palms in Southeast Asia. Dracaena cinnabari, the dragon’s blood tree of Socotra in Yemen, is listed as Vulnerable by the IUCN and found nowhere else. Croton resins from South America are also sold under the name, and much “dragon’s blood” incense is dyed and perfumed filler.",
    instead:
      "Check the botanical name. Daemonorops resin from a named supplier is the usual choice; avoid Socotran Dracaena resin unless it is clearly sustainably and legally sourced.",
  },
  {
    name: "Agarwood (oud)",
    concern:
      "Agarwood forms in Aquilaria and Gyrinops trees when they are infected, and wild agarwood is rare. Overharvesting has driven several species close to extinction; Aquilaria malaccensis is Critically Endangered. All Aquilaria and Gyrinops species have been on CITES Appendix II since 2004, so international trade needs permits.",
    instead:
      "Choose plantation-cultivated agarwood or oud from suppliers who can show CITES documentation, or use a synthetic oud accord. Avoid anything sold as “wild”.",
  },
  {
    name: "Rosewood",
    concern:
      "“Rosewood” covers several threatened trees. All Dalbergia rosewoods are listed on CITES (Brazilian rosewood on Appendix I), and illegal rosewood logging has devastated forests in Madagascar and Southeast Asia. Rosewood essential oil comes from Aniba rosaeodora of the Amazon, which is Endangered and CITES-listed.",
    instead:
      "Avoid rosewood wands, beads and oil unless the seller shows legal, certified origin. For a similar scent, try ho wood (a linalool-rich camphor tree oil); for wood, choose local fallen wood.",
  },
  {
    name: "Crystals: mining and child labour",
    concern:
      "Most crystals are mined by hand in small, unregulated mines, often by families paid very little. In Madagascar, a major source of rose quartz, labradorite and celestite, the US Department of Labor reports children working in quartz, mica and gemstone mining. Investigations by SOMO and Terre des Hommes found child labour in mica mining in India and Madagascar, and cobalt and copper mining in the Democratic Republic of the Congo, where much malachite comes from, is linked to child labour and dangerous conditions.",
    instead:
      "Buy fewer, better stones. Ask sellers which country and mine a stone came from, and favour those who can name it, buy direct from mines they visit, or work with small mining cooperatives. Second-hand stones, local stones and stones you find yourself are good choices too.",
  },
  {
    ref: 'traditional/crystal/malachite',
    name: "Malachite",
    concern:
      "Most malachite comes from the copper belt of the Democratic Republic of the Congo, where artisanal mining often involves child labour and unsafe conditions. Malachite dust is also toxic to work and polish.",
    instead:
      "Ask for origin and buy from sellers with traceable supply chains, or choose another green stone with a clearer source.",
  },
  {
    ref: 'traditional/crystal/citrine',
    name: "Citrine (and other treated stones)",
    concern:
      "Most citrine on the market is heat-treated amethyst or smoky quartz, often sold as natural. Many stones are also dyed (agates in bright pinks and blues), coated (“aura” quartz) or simply glass (opalite, “cherry quartz”, goldstone).",
    instead:
      "Treated and man-made stones are fine if you know what they are. Buy from sellers who disclose treatments, and be wary of colours that look too bright to be true.",
  },
  {
    ref: 'traditional/crystal/turquoise',
    name: "Turquoise (and dyed howlite)",
    concern:
      "Much “turquoise” is dyed howlite or magnesite, or stabilised and reconstituted turquoise powder. Real turquoise is also important to many Southwestern Native nations, and imitation “Native-style” jewellery is common.",
    instead:
      "Buy from reputable dealers who disclose treatment, and buy Native-made turquoise jewellery directly from Native artists. In the US, the Indian Arts and Crafts Act makes it illegal to falsely sell goods as Native-made.",
    tradition: 'native-american-first-nations',
  },
  {
    name: "Moldavite",
    concern:
      "Moldavite is a green glass formed by a meteorite impact about 15 million years ago and found mainly in the Czech Republic. Because demand and prices have risen, glass fakes are everywhere, especially online, and there are reports of illegal digging in Czech forests.",
    instead:
      "Expect real moldavite to be costly and small. Buy from established dealers who state the locality and offer returns; real faceted moldavite shows tiny wormlike inclusions under a loupe. If a large, vivid piece costs a few pounds or dollars, it is glass.",
  },
  {
    name: "“Ethically sourced” claims",
    concern:
      "“Ethically sourced” has no legal meaning for crystals or herbs. Many sellers use it without knowing which mine or harvest their stock came from, and supply chains often pass through several wholesalers.",
    instead:
      "Ask specific questions: which country, which mine or community, who harvested it, how they were paid, and how the seller knows. Good sellers welcome questions and can answer some of them; a seller who can answer none is not ethically sourcing.",
  },
];
