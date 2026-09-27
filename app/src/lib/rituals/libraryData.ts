// Generated from the website's Living Library (js/traditional-library.js):
// herbs, crystals and candle colors with their planet, element, uses and tags.
// References use the website's "traditional/<type>/<key>" form, which the
// Living Library resolves to the same entry on the website.

export type LibraryItemType = 'herb' | 'crystal' | 'candle';

export type LibraryItem = {
  ref: string;
  type: LibraryItemType;
  name: string;
  element: string | null;
  planet: string | null;
  uses: string;
  tags: string[];
  tip: string;
  caution: string;
};

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    "ref": "traditional/herb/basil",
    "type": "herb",
    "name": "Basil",
    "element": "Fire",
    "planet": "Mars",
    "uses": "Protection, prosperity, love, courage, cleansing",
    "tags": [
      "protection",
      "prosperity",
      "love",
      "courage",
      "cleansing",
      "fire"
    ],
    "tip": "Basil is a wonderful beginner herb because it is easy to find and works well in many types of spells. A simple money bowl with basil, cinnamon, bay, and coins is a strong starting point.",
    "caution": "Generally considered gentle in folk practice, though essential oils and concentrated preparations should be used with care."
  },
  {
    "ref": "traditional/herb/bay",
    "type": "herb",
    "name": "Bay",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Wishes, protection, victory, divination, success",
    "tags": [
      "wishes",
      "protection",
      "success",
      "victory",
      "divination",
      "solar"
    ],
    "tip": "Write one clear sentence on a bay leaf instead of trying to fit a whole paragraph. Simple intentions tend to work better than crowded ones.",
    "caution": "Bay leaves are often burned for wishes, but they should only be burned in a fire-safe container with ventilation."
  },
  {
    "ref": "traditional/herb/cedar",
    "type": "herb",
    "name": "Cedar",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Protection, purification, blessing, grounding, ancestral work",
    "tags": [
      "protection",
      "purification",
      "blessing",
      "grounding",
      "ancestors",
      "solar"
    ],
    "tip": "Cedar is excellent for making a simple home protection bowl. Combine cedar, rosemary, salt, and a small piece of smoky quartz near the entryway.",
    "caution": "Smoke cleansing should be done with ventilation and care around pets, asthma, or sensitive lungs."
  },
  {
    "ref": "traditional/herb/chamomile",
    "type": "herb",
    "name": "Chamomile",
    "element": "Water",
    "planet": "Sun",
    "uses": "Calm, sleep, luck, money, purification, gentle healing",
    "tags": [
      "calm",
      "sleep",
      "luck",
      "money",
      "healing",
      "purification"
    ],
    "tip": "For an easy sleep charm, combine chamomile, lavender, and amethyst in a small sachet and keep it near your bed.",
    "caution": "May cause reactions for people sensitive to ragweed or related plants."
  },
  {
    "ref": "traditional/herb/cinnamon",
    "type": "herb",
    "name": "Cinnamon",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Prosperity, passion, speed, success, protection",
    "tags": [
      "prosperity",
      "passion",
      "speed",
      "success",
      "protection",
      "fire"
    ],
    "tip": "Use cinnamon sparingly. A small pinch in a money bowl or spell jar is usually enough to add heat and momentum.",
    "caution": "Can irritate skin in concentrated forms and should be used carefully in oils, powders, and bath blends."
  },
  {
    "ref": "traditional/herb/clove",
    "type": "herb",
    "name": "Clove",
    "element": "Fire",
    "planet": "Jupiter",
    "uses": "Protection, prosperity, friendship, banishing negativity",
    "tags": [
      "protection",
      "prosperity",
      "friendship",
      "banishing",
      "luck",
      "fire"
    ],
    "tip": "For a simple protection charm, place three whole cloves with rosemary and black salt in a small pouch near your door.",
    "caution": "Clove oil is very strong and can irritate skin or mucous membranes if not diluted properly."
  },
  {
    "ref": "traditional/herb/frankincense",
    "type": "herb",
    "name": "Frankincense",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Purification, consecration, spiritual connection, protection",
    "tags": [
      "purification",
      "consecration",
      "protection",
      "spirituality",
      "solar",
      "fire"
    ],
    "tip": "If charcoal feels intimidating, start with frankincense incense sticks or cones before working with loose resin.",
    "caution": "Burn resins only on heat-safe surfaces with proper ventilation."
  },
  {
    "ref": "traditional/herb/jasmine",
    "type": "herb",
    "name": "Jasmine",
    "element": "Water",
    "planet": "Moon",
    "uses": "Love, dreams, intuition, sensuality, lunar magic",
    "tags": [
      "love",
      "dreams",
      "intuition",
      "sensuality",
      "lunar",
      "water"
    ],
    "tip": "For dream work, place a small amount of jasmine with lavender and amethyst near your bed, then write down whatever you remember when you wake.",
    "caution": "Jasmine fragrance and essential oil can be intense, so use lightly around sensitive people or pets."
  },
  {
    "ref": "traditional/herb/lavender",
    "type": "herb",
    "name": "Lavender",
    "element": "Air",
    "planet": "Mercury",
    "uses": "Peace, sleep, love, healing, purification, gentle protection",
    "tags": [
      "peace",
      "sleep",
      "love",
      "healing",
      "purification",
      "air"
    ],
    "tip": "Lavender is one of the easiest herbs to start with. A tiny sachet of lavender, chamomile, and amethyst makes a simple peace and sleep charm.",
    "caution": "Usually considered gentle, though concentrated oils can irritate skin and should be diluted."
  },
  {
    "ref": "traditional/herb/lemon_balm",
    "type": "herb",
    "name": "Lemon Balm",
    "element": "Water",
    "planet": "Moon",
    "uses": "Calm, emotional healing, love, happiness, gentle protection",
    "tags": [
      "calm",
      "healing",
      "love",
      "happiness",
      "protection",
      "water"
    ],
    "tip": "Use lemon balm when a spell feels like it needs kindness instead of force. It is excellent for softening the emotional tone of a working.",
    "caution": "Generally gentle in folk practice, though medicinal use may not be appropriate for everyone."
  },
  {
    "ref": "traditional/herb/mint",
    "type": "herb",
    "name": "Mint",
    "element": "Air",
    "planet": "Mercury",
    "uses": "Prosperity, clarity, healing, energy, communication",
    "tags": [
      "prosperity",
      "clarity",
      "healing",
      "energy",
      "communication",
      "air"
    ],
    "tip": "For a simple prosperity charm, place mint, basil, cinnamon, and a coin in a small jar or pouch.",
    "caution": "Strong mint oils can irritate skin and may be overwhelming for pets or sensitive people."
  },
  {
    "ref": "traditional/herb/mugwort",
    "type": "herb",
    "name": "Mugwort",
    "element": "Earth",
    "planet": "Moon",
    "uses": "Dream work, divination, intuition, thresholds, psychic awareness",
    "tags": [
      "dream work",
      "divination",
      "intuition",
      "thresholds",
      "psychic",
      "lunar"
    ],
    "tip": "Start with a small amount of mugwort. Pair it with lavender or chamomile if you want dream work to feel gentler and more restful.",
    "caution": "Traditionally avoided during pregnancy and used with care by people sensitive to ragweed-family plants."
  },
  {
    "ref": "traditional/herb/myrrh",
    "type": "herb",
    "name": "Myrrh",
    "element": "Water",
    "planet": "Moon",
    "uses": "Protection, purification, healing, spirit work, sacred rites",
    "tags": [
      "protection",
      "purification",
      "healing",
      "spirit work",
      "sacred",
      "water"
    ],
    "tip": "Use myrrh when a ritual needs depth, reverence, or ancestral gravity. Pair it with frankincense for a classic sacred incense blend.",
    "caution": "Burn resin with ventilation and avoid using concentrated preparations during pregnancy unless guided by a qualified professional."
  },
  {
    "ref": "traditional/herb/nettle",
    "type": "herb",
    "name": "Nettle",
    "element": "Fire",
    "planet": "Mars",
    "uses": "Protection, boundaries, courage, uncrossing, strength",
    "tags": [
      "protection",
      "boundaries",
      "courage",
      "uncrossing",
      "strength",
      "mars"
    ],
    "tip": "Nettle is best for firm boundaries. Use it when the intention is, 'No, this does not get to enter my space.'",
    "caution": "Fresh nettle can sting skin. Use gloves when handling unprocessed plant material."
  },
  {
    "ref": "traditional/herb/patchouli",
    "type": "herb",
    "name": "Patchouli",
    "element": "Earth",
    "planet": "Saturn",
    "uses": "Prosperity, grounding, attraction, sensuality, stability",
    "tags": [
      "prosperity",
      "grounding",
      "attraction",
      "sensuality",
      "stability",
      "earth"
    ],
    "tip": "Patchouli is excellent in money bowls, but start small. Too much patchouli can overpower the whole blend.",
    "caution": "Patchouli has a strong scent and may overwhelm sensitive people in oils, incense, or enclosed spaces."
  },
  {
    "ref": "traditional/herb/rose",
    "type": "herb",
    "name": "Rose",
    "element": "Water",
    "planet": "Venus",
    "uses": "Love, compassion, beauty, healing, grief support",
    "tags": [
      "love",
      "compassion",
      "beauty",
      "healing",
      "grief",
      "venus"
    ],
    "tip": "Rose is not just for romance. Use it for self-kindness, grief support, and softening the heart after difficult experiences.",
    "caution": "Commercial roses may be treated with pesticides, so use food-grade or ritual-safe petals when possible."
  },
  {
    "ref": "traditional/herb/rosemary",
    "type": "herb",
    "name": "Rosemary",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Protection, purification, remembrance, healing, clarity",
    "tags": [
      "protection",
      "purification",
      "remembrance",
      "healing",
      "clarity",
      "solar"
    ],
    "tip": "When in doubt, rosemary is often the safest magical starting point. It is especially helpful when you need protection, cleansing, or a substitute for another herb.",
    "caution": "Rosemary is commonly used in cleansing, but smoke and essential oils should be used with care around pets and sensitive lungs."
  },
  {
    "ref": "traditional/herb/sage",
    "type": "herb",
    "name": "Sage",
    "element": "Air",
    "planet": "Jupiter",
    "uses": "Cleansing, wisdom, protection, purification, blessing",
    "tags": [
      "cleansing",
      "wisdom",
      "protection",
      "purification",
      "blessing",
      "air"
    ],
    "tip": "You do not need white sage to cleanse. Rosemary, sound, salt, water, or visualization can all be effective depending on your practice.",
    "caution": "Different sages have different cultural contexts. White sage in particular should be approached with respect for Indigenous traditions and sustainability concerns."
  },
  {
    "ref": "traditional/herb/thyme",
    "type": "herb",
    "name": "Thyme",
    "element": "Water",
    "planet": "Venus",
    "uses": "Courage, healing, purification, sleep, psychic strength",
    "tags": [
      "courage",
      "healing",
      "purification",
      "sleep",
      "psychic",
      "water"
    ],
    "tip": "Use thyme when you need gentle courage, the kind that helps you keep going without forcing yourself into intensity.",
    "caution": "Concentrated thyme oil can be irritating and should be diluted before topical use."
  },
  {
    "ref": "traditional/herb/yarrow",
    "type": "herb",
    "name": "Yarrow",
    "element": "Water",
    "planet": "Venus",
    "uses": "Protection, love, boundaries, divination, emotional healing",
    "tags": [
      "protection",
      "love",
      "boundaries",
      "divination",
      "healing",
      "venus"
    ],
    "tip": "Yarrow is a beautiful choice for boundary work that still wants to keep the heart soft. Use it when the spell is about protection without shutting down.",
    "caution": "May cause reactions in people sensitive to ragweed-family plants and is traditionally avoided during pregnancy."
  },
  {
    "ref": "traditional/crystal/amethyst",
    "type": "crystal",
    "name": "Amethyst",
    "element": "Air",
    "planet": "Jupiter",
    "uses": "Intuition, dreams, meditation, spiritual protection, inner peace",
    "tags": [
      "intuition",
      "dreams",
      "meditation",
      "protection",
      "peace",
      "third eye"
    ],
    "tip": "Amethyst is a great first crystal for intuition and calm. Keep one with your tarot deck or dream journal to build a simple association over time.",
    "caution": "Traditionally associated with deep spiritual and dream work. Avoid prolonged sunlight, which may fade its color."
  },
  {
    "ref": "traditional/crystal/black_tourmaline",
    "type": "crystal",
    "name": "Black Tourmaline",
    "element": "Earth",
    "planet": "Saturn",
    "uses": "Protection, grounding, energetic shielding, warding",
    "tags": [
      "protection",
      "grounding",
      "shielding",
      "warding",
      "root",
      "saturn"
    ],
    "tip": "Place black tourmaline near your front door or on your desk when you want a simple, steady protection anchor.",
    "caution": "Often cleansed regularly in magical traditions because it is believed to absorb unwanted energy."
  },
  {
    "ref": "traditional/crystal/carnelian",
    "type": "crystal",
    "name": "Carnelian",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Creativity, courage, vitality, motivation, confidence",
    "tags": [
      "creativity",
      "courage",
      "vitality",
      "confidence",
      "motivation",
      "fire"
    ],
    "tip": "Use carnelian when you need to actually do the thing, not just think about doing the thing.",
    "caution": "Traditionally associated with action and motivation. Some practitioners avoid it before sleep because of its energizing symbolism."
  },
  {
    "ref": "traditional/crystal/citrine",
    "type": "crystal",
    "name": "Citrine",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Prosperity, abundance, joy, confidence, success",
    "tags": [
      "prosperity",
      "abundance",
      "success",
      "joy",
      "confidence",
      "solar"
    ],
    "tip": "Citrine is great for money bowls, but pair it with practical action. Prosperity magic works best when it has somewhere to land.",
    "caution": "Much commercially available citrine is heat-treated amethyst. Both are commonly used in modern practice."
  },
  {
    "ref": "traditional/crystal/clear_quartz",
    "type": "crystal",
    "name": "Clear Quartz",
    "element": "Spirit",
    "planet": "Sun",
    "uses": "Amplification, clarity, healing, cleansing, intention",
    "tags": [
      "amplification",
      "clarity",
      "healing",
      "cleansing",
      "all purpose",
      "spirit"
    ],
    "tip": "If you only have one crystal, clear quartz is one of the best choices. It can amplify almost any intention.",
    "caution": "Often considered a universal substitute in crystal work, though traditions differ."
  },
  {
    "ref": "traditional/crystal/fluorite",
    "type": "crystal",
    "name": "Fluorite",
    "element": "Air",
    "planet": "Mercury",
    "uses": "Focus, discernment, learning, organization, mental clarity",
    "tags": [
      "focus",
      "clarity",
      "study",
      "organization",
      "learning",
      "mercury"
    ],
    "tip": "Keep fluorite near your workspace when you need help focusing, organizing, or making sense of too many thoughts.",
    "caution": "Fluorite is relatively soft and can scratch or chip more easily than harder stones."
  },
  {
    "ref": "traditional/crystal/garnet",
    "type": "crystal",
    "name": "Garnet",
    "element": "Fire",
    "planet": "Mars",
    "uses": "Strength, devotion, passion, grounding, courage",
    "tags": [
      "strength",
      "passion",
      "devotion",
      "grounding",
      "courage",
      "mars"
    ],
    "tip": "Use garnet when you want steady fire, not a quick spark. It is excellent for commitment, courage, and devotion.",
    "caution": "Traditionally associated with commitment and determination rather than quick or impulsive action."
  },
  {
    "ref": "traditional/crystal/green_aventurine",
    "type": "crystal",
    "name": "Green Aventurine",
    "element": "Earth",
    "planet": "Venus",
    "uses": "Luck, prosperity, growth, opportunity, optimism",
    "tags": [
      "luck",
      "prosperity",
      "growth",
      "opportunity",
      "heart",
      "venus"
    ],
    "tip": "Green aventurine is a lovely money bowl crystal because it feels less intense than pyrite or citrine and brings a softer kind of abundance.",
    "caution": "Often called the Stone of Opportunity in modern crystal traditions, though historical sources vary."
  },
  {
    "ref": "traditional/crystal/hematite",
    "type": "crystal",
    "name": "Hematite",
    "element": "Earth",
    "planet": "Mars",
    "uses": "Grounding, stability, protection, focus, resilience",
    "tags": [
      "grounding",
      "stability",
      "protection",
      "focus",
      "root",
      "mars"
    ],
    "tip": "Hematite is perfect after divination, ritual, or emotional processing when you need to come back to earth.",
    "caution": "Avoid prolonged soaking in water, as some hematite pieces may rust."
  },
  {
    "ref": "traditional/crystal/labradorite",
    "type": "crystal",
    "name": "Labradorite",
    "element": "Water",
    "planet": "Moon",
    "uses": "Transformation, intuition, protection, liminal work, magic",
    "tags": [
      "transformation",
      "intuition",
      "magic",
      "protection",
      "liminal",
      "moon"
    ],
    "tip": "Use labradorite when you are in a transition and need help trusting the hidden process.",
    "caution": "Frequently associated with periods of change and deep spiritual exploration."
  },
  {
    "ref": "traditional/crystal/lapis_lazuli",
    "type": "crystal",
    "name": "Lapis Lazuli",
    "element": "Air",
    "planet": "Jupiter",
    "uses": "Truth, wisdom, communication, insight, learning",
    "tags": [
      "truth",
      "wisdom",
      "communication",
      "insight",
      "learning",
      "jupiter"
    ],
    "tip": "Use lapis lazuli when you need to say the true thing clearly, not just loudly.",
    "caution": "Avoid prolonged soaking because pyrite and calcite inclusions can be affected."
  },
  {
    "ref": "traditional/crystal/malachite",
    "type": "crystal",
    "name": "Malachite",
    "element": "Earth",
    "planet": "Venus",
    "uses": "Transformation, protection, emotional healing, growth",
    "tags": [
      "transformation",
      "healing",
      "growth",
      "heart",
      "protection",
      "venus"
    ],
    "tip": "Malachite is not the crystal I’d use for casual emotional comfort. Use rose quartz or lepidolite for softness, and malachite when you are ready for deeper change.",
    "caution": "Raw malachite should not be used in crystal elixirs or allowed prolonged contact with acidic liquids because it contains copper."
  },
  {
    "ref": "traditional/crystal/moonstone",
    "type": "crystal",
    "name": "Moonstone",
    "element": "Water",
    "planet": "Moon",
    "uses": "Intuition, dreams, cycles, emotional balance, lunar magic",
    "tags": [
      "moon",
      "dreams",
      "intuition",
      "cycles",
      "balance",
      "water"
    ],
    "tip": "Moonstone is beautiful for tracking patterns. Use it with journaling around dreams, moods, cycles, or moon phases.",
    "caution": "Traditionally associated with lunar cycles and emotional reflection."
  },
  {
    "ref": "traditional/crystal/moss_agate",
    "type": "crystal",
    "name": "Moss Agate",
    "element": "Earth",
    "planet": "Venus",
    "uses": "Nature, abundance, gardening, grounding, new beginnings",
    "tags": [
      "nature",
      "abundance",
      "growth",
      "grounding",
      "garden",
      "earth"
    ],
    "tip": "Use moss agate when you need a reminder that growth can be slow and still be real.",
    "caution": "Despite its name, moss agate does not actually contain moss."
  },
  {
    "ref": "traditional/crystal/obsidian",
    "type": "crystal",
    "name": "Obsidian",
    "element": "Fire",
    "planet": "Saturn",
    "uses": "Protection, banishing, grounding, shadow work, truth",
    "tags": [
      "protection",
      "shadow work",
      "grounding",
      "banishing",
      "truth",
      "saturn"
    ],
    "tip": "Use obsidian when you are ready for honesty. For gentler protection, start with black tourmaline or smoky quartz.",
    "caution": "Traditionally associated with intense shadow work and emotional processing."
  },
  {
    "ref": "traditional/crystal/pyrite",
    "type": "crystal",
    "name": "Pyrite",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Prosperity, confidence, abundance, determination, success",
    "tags": [
      "prosperity",
      "success",
      "confidence",
      "abundance",
      "solar",
      "wealth"
    ],
    "tip": "Pyrite is a strong money bowl stone. Pair it with a clear goal, not just a vague wish for more.",
    "caution": "Avoid prolonged contact with water, which can contribute to oxidation over time."
  },
  {
    "ref": "traditional/crystal/rose_quartz",
    "type": "crystal",
    "name": "Rose Quartz",
    "element": "Water",
    "planet": "Venus",
    "uses": "Love, compassion, self-love, healing, forgiveness",
    "tags": [
      "love",
      "self-love",
      "healing",
      "compassion",
      "heart",
      "venus"
    ],
    "tip": "Rose quartz is not only for romantic love. It is one of the best stones for self-compassion.",
    "caution": "Often associated with gentle emotional work rather than intense transformational practices."
  },
  {
    "ref": "traditional/crystal/selenite",
    "type": "crystal",
    "name": "Selenite",
    "element": "Spirit",
    "planet": "Moon",
    "uses": "Cleansing, charging, peace, clarity, spiritual connection",
    "tags": [
      "cleansing",
      "charging",
      "clarity",
      "peace",
      "spiritual",
      "crown"
    ],
    "tip": "A selenite slab or wand is a useful beginner tool for cleansing small crystals or altar objects.",
    "caution": "Avoid prolonged exposure to water because selenite is water-soluble and relatively soft."
  },
  {
    "ref": "traditional/crystal/smoky_quartz",
    "type": "crystal",
    "name": "Smoky Quartz",
    "element": "Earth",
    "planet": "Saturn",
    "uses": "Grounding, stability, protection, stress relief, transmutation",
    "tags": [
      "grounding",
      "stability",
      "protection",
      "stress relief",
      "earth",
      "saturn"
    ],
    "tip": "Keep smoky quartz near your altar for grounding after intense rituals, divination, or emotional work.",
    "caution": "Traditionally associated with releasing unwanted energy and grounding after intense ritual work."
  },
  {
    "ref": "traditional/crystal/tiger_eye",
    "type": "crystal",
    "name": "Tiger Eye",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Confidence, courage, focus, determination, protection",
    "tags": [
      "confidence",
      "courage",
      "focus",
      "determination",
      "protection",
      "solar"
    ],
    "tip": "Tiger eye is a great stone for doing scary practical things, interviews, phone calls, appointments, applications, and boundaries.",
    "caution": "Traditionally linked to confidence and practical action rather than impulsive risk-taking."
  },
  {
    "ref": "traditional/candle/black",
    "type": "candle",
    "name": "Black Candle",
    "element": "Fire",
    "planet": "Saturn",
    "uses": "Protection, banishing, uncrossing, shadow work, absorbing negativity",
    "tags": [
      "protection",
      "banishing",
      "shadow work",
      "ancestor work",
      "boundaries",
      "saturn"
    ],
    "tip": "Use black candles for boundaries. A simple black candle with rosemary and clear words like 'what harms me does not enter' is a strong beginner protection spell.",
    "caution": "Black candles are not negative by default. They are commonly used for protection, absorption, boundaries, banishing, and deep spiritual work."
  },
  {
    "ref": "traditional/candle/blue",
    "type": "candle",
    "name": "Blue Candle",
    "element": "Water",
    "planet": "Jupiter",
    "uses": "Healing, wisdom, communication, peace, truth",
    "tags": [
      "healing",
      "peace",
      "communication",
      "wisdom",
      "truth",
      "water"
    ],
    "tip": "Use blue candles for calming communication, especially when you need truth without aggression.",
    "caution": "Blue candle meanings vary by shade. Light blue is often used for peace and healing, while dark blue may lean toward wisdom, truth, and spiritual authority."
  },
  {
    "ref": "traditional/candle/brown",
    "type": "candle",
    "name": "Brown Candle",
    "element": "Earth",
    "planet": "Saturn",
    "uses": "Grounding, stability, animals, home, practical matters",
    "tags": [
      "grounding",
      "stability",
      "home",
      "animals",
      "earth",
      "saturn"
    ],
    "tip": "Brown candles are perfect for 'let my life feel stable and manageable' spells.",
    "caution": "Brown candles are often overlooked, but they are excellent for practical, earthy, home-based magic."
  },
  {
    "ref": "traditional/candle/gold",
    "type": "candle",
    "name": "Gold Candle",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Success, abundance, divine blessings, confidence, honor",
    "tags": [
      "success",
      "prosperity",
      "abundance",
      "solar",
      "confidence",
      "wealth"
    ],
    "tip": "Use gold candles for success magic when you want to be seen, recognized, supported, or celebrated.",
    "caution": "Gold is often associated with solar power, success, and blessing, but prosperity magic still benefits from practical action."
  },
  {
    "ref": "traditional/candle/green",
    "type": "candle",
    "name": "Green Candle",
    "element": "Earth",
    "planet": "Venus",
    "uses": "Prosperity, abundance, fertility, growth, luck",
    "tags": [
      "prosperity",
      "money",
      "growth",
      "luck",
      "fertility",
      "earth"
    ],
    "tip": "Green is the classic money candle, but write a specific goal. 'Bring me aligned income opportunities' is stronger than just 'money.'",
    "caution": "Green candles are often used for money, but they also represent growth, fertility, healing, and the living world."
  },
  {
    "ref": "traditional/candle/orange",
    "type": "candle",
    "name": "Orange Candle",
    "element": "Fire",
    "planet": "Sun",
    "uses": "Creativity, opportunity, confidence, motivation, joy",
    "tags": [
      "creativity",
      "motivation",
      "confidence",
      "opportunity",
      "joy",
      "fire"
    ],
    "tip": "Use orange candles for creative blocks. They are excellent for 'get the energy moving again' spells.",
    "caution": "Orange candles are energizing, so they may not be ideal for rituals meant to calm, settle, or slow energy down."
  },
  {
    "ref": "traditional/candle/pink",
    "type": "candle",
    "name": "Pink Candle",
    "element": "Water",
    "planet": "Venus",
    "uses": "Friendship, self-love, compassion, affection, emotional healing",
    "tags": [
      "love",
      "friendship",
      "self-love",
      "compassion",
      "healing",
      "venus"
    ],
    "tip": "Use pink candles for self-love before using them for romance. A strong relationship with yourself changes the whole spell.",
    "caution": "Pink is often better than red for gentle love, friendship, healing, and self-compassion work."
  },
  {
    "ref": "traditional/candle/purple",
    "type": "candle",
    "name": "Purple Candle",
    "element": "Spirit",
    "planet": "Jupiter",
    "uses": "Psychic awareness, intuition, spiritual wisdom, divination",
    "tags": [
      "intuition",
      "psychic",
      "divination",
      "wisdom",
      "spirituality",
      "jupiter"
    ],
    "tip": "Light a purple candle before tarot or journaling when you want insight, not just answers.",
    "caution": "Purple candles are often used for spiritual power and psychic work, so grounding afterward can be helpful."
  },
  {
    "ref": "traditional/candle/red",
    "type": "candle",
    "name": "Red Candle",
    "element": "Fire",
    "planet": "Mars",
    "uses": "Passion, courage, vitality, protection, strength",
    "tags": [
      "passion",
      "love",
      "courage",
      "strength",
      "energy",
      "mars"
    ],
    "tip": "Use red when you need courage or energy. Use pink when you need tenderness.",
    "caution": "Red is intense and active. For gentle love or emotional healing, pink may be more appropriate."
  },
  {
    "ref": "traditional/candle/silver",
    "type": "candle",
    "name": "Silver Candle",
    "element": "Water",
    "planet": "Moon",
    "uses": "Intuition, lunar magic, dreams, feminine mysteries, reflection",
    "tags": [
      "moon",
      "intuition",
      "dreams",
      "psychic",
      "reflection",
      "lunar"
    ],
    "tip": "Use silver candles when you want to receive, reflect, dream, or listen inward.",
    "caution": "Silver candles are strongly lunar and reflective, making them better for receptivity than forceful action."
  },
  {
    "ref": "traditional/candle/white",
    "type": "candle",
    "name": "White Candle",
    "element": "Spirit",
    "planet": "Moon",
    "uses": "Purification, blessing, healing, peace, universal substitute",
    "tags": [
      "purification",
      "healing",
      "peace",
      "blessing",
      "substitute",
      "spirit"
    ],
    "tip": "When you do not know which color to use, choose white and state your intention clearly.",
    "caution": "White candles are often treated as universal substitutes, but some traditions still prefer specific colors for specific workings."
  },
  {
    "ref": "traditional/candle/yellow",
    "type": "candle",
    "name": "Yellow Candle",
    "element": "Air",
    "planet": "Mercury",
    "uses": "Learning, communication, focus, confidence, inspiration",
    "tags": [
      "communication",
      "learning",
      "focus",
      "clarity",
      "inspiration",
      "mercury"
    ],
    "tip": "Light a yellow candle before writing, studying, or planning when you need your thoughts to line up and behave themselves.",
    "caution": "Yellow is mentally active and may feel too stimulating for workings focused on deep rest or emotional quiet."
  }
];
