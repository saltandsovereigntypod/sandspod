import type { Premade } from '../types';

// Kitchen (hearth) witchcraft and solitary practice.
// Recipes use food-safe ingredients at ordinary culinary amounts.

export const KITCHEN: Premade[] = [
  // ───────────────────────────── KITCHEN ─────────────────────────────
  {
    id: 'kitchen-prosperity-bread',
    title: 'Prosperity Bread',
    kind: 'spell',
    summary:
      'A plain, golden loaf kneaded with intention and stirred sunwise, so the house never wants for bread. Share the first slice and the luck goes round.',
    intention: 'prosperity',
    alsoFor: ['beginnings'],
    practices: ['kitchen', 'folk'],
    paths: [],
    moon: ['waxing', 'full'],
    holidays: ['lammas', 'lughnasadh'],
    weekday: 4,
    minutes: 210,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: '500 g strong white bread flour (plus a little for dusting)' },
      { name: '7 g (one sachet) instant dried yeast' },
      { name: '10 g (2 level tsp) fine salt' },
      { name: '1 tbsp honey' },
      { name: '2 tbsp olive oil' },
      { name: '320 ml lukewarm water' },
      { name: '1 tsp finely chopped fresh rosemary', ref: 'traditional/herb/rosemary', optional: true },
      { name: 'A handful of sesame or poppy seeds for the crust', optional: true },
      { name: 'A large mixing bowl', ref: 'traditional/vessel/bowl' },
      { name: 'A wooden spoon' },
    ],
    preparation:
      'Clear and wipe your worktop as if you were laying an altar, because today it is one. Wash your hands slowly. Weigh everything out before you begin, so you can give the dough your full attention. Thursday, the day of Jupiter, and a waxing moon are the old favourites for increase, but any day you have three unhurried hours will do.',
    steps: [
      {
        title: 'Bless the flour',
        instructions:
          'Put the flour in the bowl. Rest both palms flat on it for a moment and feel how cool and soft it is. Think of what “enough” looks like for your household: rent paid, a full larder, room to be generous. Add the yeast to one side of the bowl and the salt to the other (salt touching yeast directly can slow it).',
        spoken: 'Grain of the field, gift of the sun, be bread for this house and plenty for everyone.',
      },
      {
        title: 'Stir sunwise',
        instructions:
          'Add the honey, oil and most of the water. Stir with the wooden spoon clockwise (sunwise, the direction of drawing in) until a shaggy dough forms, adding the last of the water if dry flour remains. Count nine turns aloud if you like.',
        spoken: 'Round with the sun, the good things come; round with the sun, the good things come.',
      },
      {
        title: 'Knead with intention',
        instructions:
          'Tip the dough onto a lightly floured surface and knead for 10 minutes: push away with the heel of your hand, fold back, turn a quarter, repeat. Work in the rosemary now if using. Notice the change as it goes from sticky to smooth and springy; let that change stand for things coming together. It is ready when a gently poked dent springs slowly back.',
        minutes: 10,
      },
      {
        title: 'First rise',
        instructions:
          'Return the dough to the oiled bowl, cover with a clean cloth and leave somewhere warm until doubled, about 1 to 1½ hours. With your fingertip, trace a small equal-armed cross or a sun sign on the cloth: an old baker’s mark for blessing the rise. Use the waiting time to tidy, or to sit with a cup of tea and picture your cupboards full.',
        minutes: 75,
      },
      {
        title: 'Shape and mark',
        instructions:
          'Knock the air out, shape into a round, and set it on a floured baking tray. With a sharp knife, score a cross or three parallel lines across the top, one each for health, plenty and peace. Brush with water and scatter seeds if using. Cover and leave to prove for 45 minutes. Heat the oven to 220 °C (200 °C fan, 425 °F, gas 7).',
        minutes: 45,
      },
      {
        title: 'Bake',
        instructions:
          'Bake for 30 to 35 minutes, until deep golden and hollow-sounding when tapped underneath. Cool on a rack for at least 30 minutes before cutting. The smell filling the house is part of the working: let it reach every room.',
        minutes: 35,
      },
      {
        title: 'Share the first slice',
        instructions:
          'Cut the first slice and give it away: to someone at your table, a neighbour, or as a crumb offering left outdoors for the birds. Prosperity in folk thinking is a circulation, not a hoard.',
        spoken: 'The first for the giving, the rest for the living. May this house never lack bread.',
      },
    ],
    closing:
      'Wipe the board, put away the flour, and keep a heel of the loaf on the windowsill or bread bin until the next baking, so bread is never wholly gone from the house.',
    safety:
      'Contains gluten (wheat) and honey; use a gluten-free bread flour blend and its own recipe if needed, and replace honey with sugar for anyone avoiding it. Use oven gloves. Seeds can be an allergen (sesame especially); leave them off when baking for others.',
    lore:
      'Bread is the oldest household offering in Europe. Lammas (“loaf-mass”) on 1 August took its name from the custom of blessing loaves from the first harvest, recorded in the Anglo-Saxon Chronicle. Scoring a cross on loaves was long explained as letting the devil out or blessing the rise, and keeping a little bread in the house so it is never empty is common folk practice across Britain and Eastern Europe. Stirring sunwise (deiseal in Gaelic) for good luck is a well-attested Scottish and Irish custom. Baking as a deliberate spell, with spoken intention, is modern kitchen witchcraft built on those habits.',
    sources: [
      'The Anglo-Saxon Chronicle (on hlafmæsse, the loaf-mass)',
      'Carmichael, Carmina Gadelica (1900), on the sunwise turn',
      'Hutton, The Stations of the Sun (on Lammas customs)',
    ],
  },
  {
    id: 'kitchen-protection-soup',
    title: 'Garlic and Onion Protection Soup',
    kind: 'spell',
    summary:
      'A thick white-bean and leek soup built on the old warding trio of onion, garlic and bay. Cook it when the household feels run down or besieged, and eat it together.',
    intention: 'protection',
    alsoFor: ['healing', 'courage'],
    practices: ['kitchen', 'folk', 'green'],
    paths: [],
    moon: ['waning', 'full'],
    weekday: 2,
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: '2 tbsp olive oil' },
      { name: '2 medium onions, diced' },
      { name: '6 cloves garlic, sliced', ref: 'traditional/herb/garlic' },
      { name: '2 leeks, washed and sliced' },
      { name: '2 carrots, diced' },
      { name: '2 bay leaves', ref: 'traditional/herb/bay' },
      { name: '1 sprig fresh rosemary', ref: 'traditional/herb/rosemary' },
      { name: '3 sprigs fresh thyme (or 1 tsp dried)', ref: 'traditional/herb/thyme' },
      { name: '1.5 litres vegetable or chicken stock' },
      { name: '2 × 400 g tins white beans (cannellini or butter beans), drained' },
      { name: 'Salt and black pepper to taste', ref: 'traditional/herb/black_pepper' },
      { name: 'A squeeze of lemon and chopped parsley to finish', optional: true },
      { name: 'A heavy pot', ref: 'traditional/tool/cauldron' },
    ],
    preparation:
      'Peel and chop everything before you light the hob. As you peel the onions, let any tears come: in folk belief onions draw out what ails. Tuesday, the day of Mars, suits protective work, as does a waning moon for pushing harm away.',
    steps: [
      {
        title: 'Name what you are guarding',
        instructions:
          'Stand at the stove with the pot cold in front of you. Say plainly, aloud or silently, who and what this soup protects: the people who will eat it, the home, a particular hard season you are all moving through.',
        spoken: 'Onion and garlic, root of the guard, keep this house and keep it hard; bay at the door and salt at the sill, nothing comes in against our will.',
      },
      {
        title: 'Soften the base',
        instructions:
          'Warm the oil in the pot over a medium-low heat. Add the onions with a pinch of salt and cook gently for 8 minutes until translucent. Add the garlic, leeks and carrots and cook another 7 minutes, stirring clockwise to draw safety in. Don’t let the garlic brown; you want sweetness, not bitterness.',
        minutes: 15,
      },
      {
        title: 'Add the herbs',
        instructions:
          'Tie the rosemary, thyme and bay leaves together with a bit of kitchen string (a small knot binding them is a little charm in itself) and lay the bundle in the pot. Pour in the stock and bring to a simmer.',
      },
      {
        title: 'Simmer and ward',
        instructions:
          'Add the beans. Simmer, partly covered, for 20 minutes. While it bubbles, walk once round the kitchen, touching the door frame and window latches, and picture the steam carrying the savoury warmth into every corner.',
        minutes: 20,
      },
      {
        title: 'Finish and taste',
        instructions:
          'Fish out the herb bundle. Mash a third of the beans against the side of the pot to thicken it, or blend briefly. Season with salt and plenty of black pepper, add the lemon and parsley, and taste. Adjust until it tastes like comfort.',
      },
      {
        title: 'Serve with a word',
        instructions:
          'Ladle into bowls. As you set each one down, say the eater’s name and “kept”. Eat together if you can. If you live alone, eat at the table, not in front of a screen.',
        spoken: 'Eat and be kept.',
      },
    ],
    closing:
      'Bury the spent herb bundle in the garden or a pot plant, or compost it, saying thanks. Leftovers freeze well for when someone needs a bowl of protection on short notice.',
    safety:
      'Onion, garlic and leek are toxic to dogs and cats: keep scraps and leftovers well away from pets. Check stock cubes for gluten, celery and dairy if cooking for anyone with allergies. Remove bay leaves before serving; they are a choking hazard.',
    lore:
      'Garlic and onions as protection against illness, evil spirits and the evil eye are among the most widespread charms in European folklore, from hanging strings of garlic in Mediterranean kitchens to the British belief that a cut onion in a sickroom drew out infection. Bay was sacred to Apollo, and Pliny reports it was thought to protect against lightning. Calling a soup a protection spell is modern kitchen witchcraft; feeding the household strong, simple food when times are hard is as old as the hearth.',
    sources: [
      'Pliny the Elder, Natural History (on bay and lightning)',
      'Frazer, The Golden Bough (1890–1915), on household charms against evil',
    ],
  },
  {
    id: 'kitchen-honey-sweetening-cake',
    title: 'Honey Sweetening Cake',
    kind: 'spell',
    summary:
      'A dense, fragrant honey cake baked to sweeten the feeling in a household, mend a willing friendship, or welcome more tenderness into your life. Made to be shared, never to sway anyone.',
    intention: 'love',
    alsoFor: ['peace', 'healing'],
    practices: ['kitchen', 'folk'],
    paths: [],
    moon: ['waxing', 'full'],
    weekday: 5,
    minutes: 90,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: '200 g runny honey (plus 1 tbsp to glaze)' },
      { name: '100 g unsalted butter, plus extra for the tin' },
      { name: '75 g light brown sugar' },
      { name: '2 large eggs, beaten' },
      { name: '225 g self-raising flour (or plain flour with 2 tsp baking powder)' },
      { name: '1 tsp ground cinnamon', ref: 'traditional/herb/cinnamon' },
      { name: '½ tsp ground ginger', ref: 'traditional/herb/ginger', optional: true },
      { name: 'A pinch of salt' },
      { name: '2 tbsp milk' },
      { name: 'Seeds of ½ vanilla pod or 1 tsp vanilla extract', ref: 'traditional/herb/vanilla', optional: true },
      { name: 'A few unsprayed rose petals to decorate', ref: 'traditional/herb/rose', optional: true },
      { name: 'A pink candle for the table', ref: 'traditional/candle/pink', optional: true },
    ],
    preparation:
      'Heat the oven to 170 °C (150 °C fan, 340 °F, gas 3½). Butter and line a 20 cm round or 900 g loaf tin. Friday, Venus’s day, is traditional for love work. Before you begin, decide what you want sweetened: the mood between housemates, a willing reconciliation, your own heart. Keep it about warmth offered, not a person’s will.',
    steps: [
      {
        title: 'Melt the sweetness',
        instructions:
          'Put the honey, butter and sugar in a saucepan over a low heat and stir until melted and glossy. Don’t let it boil. Watch the honey loosen and run, and let your shoulders loosen with it. Cool for 10 minutes so it won’t scramble the eggs.',
        minutes: 10,
      },
      {
        title: 'Speak into the bowl',
        instructions:
          'Sift the flour, cinnamon, ginger and salt into a mixing bowl. Hold your hands over it and speak your wish plainly. If it concerns another person, frame it as an offering: “may there be sweetness between us, if it is good for us both.”',
        spoken: 'Honey on the tongue and honey in the heart; what was sharp grows soft, what was cold grows warm.',
      },
      {
        title: 'Stir it together',
        instructions:
          'Beat the eggs, milk and vanilla into the cooled honey mixture, then pour it into the flour. Stir clockwise with a wooden spoon just until no dry streaks remain. Overmixing makes it tough, as it does with people.',
      },
      {
        title: 'Bake',
        instructions:
          'Scrape into the tin and bake for 40 to 45 minutes, until risen and a skewer comes out clean. Cover loosely with foil after 30 minutes if it browns too fast; honey cakes colour quickly.',
        minutes: 45,
      },
      {
        title: 'Glaze while warm',
        instructions:
          'Warm the extra tablespoon of honey and brush it over the top while the cake is still warm in the tin. Draw a small heart or spiral in the glaze with the tip of the brush. Scatter rose petals once cool.',
      },
      {
        title: 'Share it',
        light: true,
        instructions:
          'Light the pink candle on the table if using. Serve the cake with tea, offering the first piece to the person you most want ease with, or keep it for yourself as a kindness. Say something sincerely warm as you hand it over; the spell is finished in the giving.',
        spoken: 'Something sweet, for you.',
      },
    ],
    closing:
      'Snuff the candle when the cake is eaten. Wrapped well, honey cake keeps and improves for 3 to 4 days, which folk wisdom would call a sign that good feeling deepens with time.',
    safety:
      'Contains gluten, eggs and dairy; vegan and gluten-free versions are possible but need their own tested recipe. Never give honey to babies under 12 months. Use only unsprayed, food-grade rose petals. Do not leave a lit candle unattended.',
    lore:
      'Honey cakes are among the oldest sacred foods: the Greeks offered melitoutta (honey cakes) to the gods and to the dead, and Herodotus describes one left for the guardian serpent of the Athenian Acropolis. Lebkuchen and medovik continue the line in German and Slavic kitchens, and honey cake is eaten at Rosh Hashanah for a sweet year. The modern kitchen-witch idea of a “sweetening” bake, to soften a relationship rather than bend anyone, grows from that wide habit of offering something sweet to make peace.',
    sources: [
      'Herodotus, Histories 8.41 (the honey cake for the Acropolis serpent)',
      'Aristophanes, Clouds (on honey cakes as offerings)',
    ],
  },
  {
    id: 'kitchen-healing-broth',
    title: 'Hearth Healing Broth',
    kind: 'spell',
    summary:
      'A long, gentle bone or vegetable broth simmered for someone who is unwell, tired or grieving, with each ingredient added as a wish for mending.',
    intention: 'healing',
    alsoFor: ['peace', 'protection'],
    practices: ['kitchen', 'green'],
    paths: [],
    moon: ['waxing', 'full'],
    weekday: 0,
    minutes: 210,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: '1 roast chicken carcass or 1 kg chicken wings (or, for vegetable broth, 250 g mushrooms and a 10 cm strip of kombu)' },
      { name: '2.5 litres cold water' },
      { name: '1 onion, halved, skin on' },
      { name: '2 carrots, roughly chopped' },
      { name: '2 celery sticks, roughly chopped' },
      { name: '4 cloves garlic, crushed', ref: 'traditional/herb/garlic' },
      { name: 'A thumb of fresh ginger, sliced', ref: 'traditional/herb/ginger' },
      { name: '2 bay leaves', ref: 'traditional/herb/bay' },
      { name: '3 sprigs thyme', ref: 'traditional/herb/thyme' },
      { name: 'A handful of parsley stalks' },
      { name: '1 tsp black peppercorns', ref: 'traditional/herb/black_pepper' },
      { name: '1 tbsp apple cider vinegar (helps draw goodness from bones)' },
      { name: 'Salt, to season at the end' },
      { name: 'A large stockpot', ref: 'traditional/tool/cauldron' },
    ],
    preparation:
      'Write the name of the person the broth is for, or simply “me”, on a slip of paper and tuck it under the stockpot’s spot on the hob or beside it (not under the flame). Sunday, the sun’s day, is kind for health and vitality. Allow a quiet afternoon; broth cannot be hurried.',
    steps: [
      {
        title: 'Lay the foundation',
        instructions:
          'Put the carcass or wings (or mushrooms and kombu) in the pot with the cold water and vinegar. Leave it 15 minutes before heating if using bones. Rest your hand on the side of the pot and think of the body as a house being gently repaired, room by room.',
        spoken: 'Bone of strength and water of life, mend what is worn and ease what is strife.',
      },
      {
        title: 'Add the vegetables with a wish each',
        instructions:
          'Add each vegetable and herb one at a time, naming a small wish as it goes in: onion for drawing out what ails, garlic for defence, ginger for warmth, carrot for clear sight, celery for rest, bay for victory over illness, thyme for courage, parsley for renewal.',
      },
      {
        title: 'Bring it up gently',
        instructions:
          'Heat slowly until barely simmering, with only an occasional bubble breaking the surface. Skim off any grey foam with a spoon. A furious boil makes cloudy broth; a gentle one makes clear, golden broth, and gentleness is the point.',
        minutes: 20,
      },
      {
        title: 'The long simmer',
        instructions:
          'Partly cover and simmer for 2½ to 3 hours (vegetable broth: 1 hour). Check every half hour, topping up with hot water if it drops below the bones. Each time you pass, stir once clockwise and say the person’s name.',
        minutes: 150,
      },
      {
        title: 'Strain and season',
        instructions:
          'Strain through a fine sieve into a clean bowl and discard the solids (no cooked bones for dogs). Season with salt only now, a little at a time. Taste: it should feel like warmth spreading down your chest.',
      },
      {
        title: 'Carry it with care',
        instructions:
          'Pour into a jar or flask. If you are taking it to someone, carry it with both hands and hand it over without needing them to make a fuss. Healing work from the hearth asks nothing back.',
        spoken: 'From my hearth to yours: be well, be warm, be mended.',
      },
    ],
    closing:
      'Burn or compost the name slip with thanks. Keep broth refrigerated for up to 4 days or frozen for 3 months.',
    safety:
      'This supports comfort and nourishment and is not a substitute for medical care. Cool broth quickly and refrigerate within 2 hours. Cooked bones splinter: never give them to pets, and onion and garlic are toxic to dogs and cats. Celery is a common allergen in Europe; leave it out if needed. Kombu is high in iodine, so use it sparingly for anyone with thyroid conditions.',
    lore:
      'Broth for the sick is near-universal folk medicine: the twelfth-century physician Maimonides recommended chicken soup for respiratory illness, and medieval European herbals prescribe broths with herbs for convalescents. Naming each ingredient for a virtue follows the long-standing herbal correspondences (bay for victory, thyme for courage), while carrying soup to a sick neighbour is simply what households have always done. Framing it as a healing spell is modern kitchen witchcraft.',
    sources: [
      'Maimonides, On Asthma (12th century), on chicken soup',
      'Culpeper, The English Physitian (1652), on the herbs',
    ],
  },
  {
    id: 'kitchen-peace-tea',
    title: 'Chamomile and Lavender Peace Tea',
    kind: 'spell',
    summary:
      'A soft evening tea of chamomile, lemon balm and a whisper of lavender, brewed slowly as a small ritual for calm before sleep or after a hard day.',
    intention: 'peace',
    alsoFor: ['healing', 'cleansing'],
    practices: ['kitchen', 'green'],
    paths: [],
    moon: ['waning', 'dark'],
    weekday: 1,
    minutes: 20,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: '1 tsp dried chamomile flowers (or 1 chamomile tea bag)', ref: 'traditional/herb/chamomile' },
      { name: '1 tsp dried lemon balm leaves', ref: 'traditional/herb/lemon_balm' },
      { name: '¼ to ½ tsp dried culinary lavender buds', ref: 'traditional/herb/lavender' },
      { name: '250 ml water, just off the boil' },
      { name: '1 tsp honey', optional: true },
      { name: 'A teapot or mug with a strainer, and a saucer to cover it' },
    ],
    preparation:
      'Use culinary-grade lavender only: too much tastes of soap, so start with a quarter teaspoon. Dim the kitchen lights. Put your phone in another room for the next twenty minutes.',
    steps: [
      {
        title: 'Set the water to heat',
        instructions:
          'Fill the kettle with fresh water and switch it on. While it heats, stand still and listen to it: the tick, the rising hum. Let the sound be the only thing you attend to.',
      },
      {
        title: 'Measure the herbs into your palm',
        instructions:
          'Tip each herb into your palm before it goes in the pot. Breathe in its scent: apple-sweet chamomile, lemony balm, sharp clean lavender. Name a worry and let it go with each one as you tip it in.',
        spoken: 'Flower of the meadow, leaf of the bee, bud of the lavender, quiet in me.',
      },
      {
        title: 'Pour and cover',
        instructions:
          'Let the boiled water rest 30 seconds, then pour it over the herbs. Cover the cup with a saucer so the fragrant steam stays in. Steep 5 to 7 minutes.',
        minutes: 6,
        timed: true,
      },
      {
        title: 'Breathe with the steam',
        instructions:
          'Strain into your cup and stir in honey, counter-clockwise if you are letting go of a day, clockwise if you are drawing in rest. Hold the cup in both hands under your chin and take five slow breaths of the steam before your first sip.',
        minutes: 2,
      },
      {
        title: 'Drink slowly',
        instructions:
          'Sip without doing anything else. Notice the warmth travelling down. If thoughts come, let them float past like steam off the cup.',
        minutes: 8,
        timed: true,
      },
    ],
    closing:
      'Tip the spent herbs onto the soil of a house plant or the compost, with thanks. Rinse your cup and go straight to whatever rest comes next.',
    safety:
      'Chamomile is in the daisy family; avoid it if you are allergic to ragweed, chrysanthemums or marigolds. Avoid medicinal amounts in pregnancy and check with a doctor if you take sedatives, blood thinners or thyroid medication (lemon balm may interact). These are ordinary culinary amounts for one cup. Never give honey to babies under 12 months.',
    lore:
      'Chamomile was one of the herbs of the Anglo-Saxon Nine Herbs Charm (as “maythe”), and has been a household calming tea across Europe for centuries; Beatrix Potter’s Mrs Rabbit doses Peter with it. Lemon balm was praised by the medieval Arab physician Avicenna and by Culpeper for “driving away all troublesome cares.” Lavender has a long place in European linen cupboards and sleep pillows. Brewing the cup as a slow ritual is modern practice drawn from these old comforts.',
    sources: [
      'The Nine Herbs Charm, Lacnunga (10th–11th century)',
      'Culpeper, The English Physitian (1652), on balm and chamomile',
      'Gerard, Herball (1597), on lavender',
    ],
  },
  {
    id: 'kitchen-courage-brew',
    title: 'Cinnamon-Ginger Courage Brew',
    kind: 'spell',
    summary:
      'A fiery, warming brew of fresh ginger, cinnamon and clove to drink before something that takes nerve: an interview, a hard conversation, a first step.',
    intention: 'courage',
    alsoFor: ['protection', 'healing'],
    practices: ['kitchen', 'green', 'elemental'],
    paths: [],
    moon: ['waxing', 'full'],
    weekday: 2,
    minutes: 20,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: '500 ml water (makes two cups)' },
      { name: 'A 3 cm piece of fresh ginger, thinly sliced', ref: 'traditional/herb/ginger' },
      { name: '1 cinnamon stick', ref: 'traditional/herb/cinnamon' },
      { name: '3 whole cloves', ref: 'traditional/herb/clove' },
      { name: 'A strip of orange or lemon peel' },
      { name: '1–2 tsp honey, to taste' },
      { name: 'A squeeze of lemon juice' },
      { name: 'A pinch of black pepper', ref: 'traditional/herb/black_pepper', optional: true },
    ],
    preparation:
      'Make this the morning of the thing you dread, or the evening before. Tuesday, ruled by Mars, is the traditional day for courage. Know in one sentence what you need courage for.',
    steps: [
      {
        title: 'Wake the fire',
        instructions:
          'Put the water in a small pan. Add the ginger, cinnamon stick, cloves and peel. Before switching on the heat, hold your hand over the pan and say your one sentence aloud.',
        spoken: 'Root of fire, bark of sun, I will do the thing I must be done.',
      },
      {
        title: 'Simmer',
        instructions:
          'Bring to the boil, then simmer gently for 10 minutes. Breathe in the spicy steam: it should prickle a little. Stand tall while you wait, feet planted, shoulders back. Let your body practise the posture of someone brave.',
        minutes: 10,
      },
      {
        title: 'Sweeten and sharpen',
        instructions:
          'Strain into a mug. Stir in the honey clockwise and add the lemon and pepper. Taste: it should be hot and bright enough to make you blink.',
      },
      {
        title: 'Drink it down',
        instructions:
          'Drink it while warm, feeling the heat spread from your belly outward. With each sip, picture the warmth gathering behind your breastbone like a coal you will carry into the room with you.',
        minutes: 5,
      },
      {
        title: 'Carry the coal',
        instructions:
          'Put the spent cinnamon stick in your pocket or bag as a token. When your nerve wavers later, touch it and remember the heat.',
        spoken: 'The fire is in me.',
      },
    ],
    closing:
      'Afterwards, whatever happened, bury or compost the cinnamon stick and thank it. Courage spent is still courage kept.',
    safety:
      'Ginger in large amounts may interact with blood thinners and diabetes medication; this is a normal culinary amount. Avoid regular large doses of cassia cinnamon if you have liver conditions. Take care with boiling liquid. Never give honey to babies under 12 months.',
    lore:
      'Ginger and cinnamon were prized “hot” spices in medieval humoral medicine, given to warm the blood and stir the spirits, and spiced warm drinks such as posset and wassail were served to fortify travellers and workers through winter. Associating fiery spices with Mars and with courage is a correspondence from Renaissance astrological herbals. The brew-as-courage-spell is a modern kitchen working.',
    sources: [
      'Culpeper, The English Physitian (1652), on ginger and the planets',
      'Agrippa, Three Books of Occult Philosophy (1533), on Martial plants',
    ],
  },
  {
    id: 'kitchen-seasonal-simmer-pot',
    title: 'Simmer Pot of the Turning Year',
    kind: 'spell',
    summary:
      'A pan of fruit peel, spices and herbs kept gently simmering on the stove to scent and bless the home, with a blend for each of the four seasons.',
    intention: 'peace',
    alsoFor: ['cleansing', 'love', 'prosperity'],
    practices: ['kitchen', 'green', 'elemental'],
    paths: [],
    holidays: ['mabon', 'yule', 'ostara', 'litha'],
    minutes: 120,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A medium saucepan and water to fill it two-thirds' },
      { name: 'AUTUMN: peel and core of 2 apples, 2 cinnamon sticks, 6 cloves, a strip of orange peel', ref: 'traditional/herb/cinnamon' },
      { name: 'WINTER: 1 sliced orange, a handful of cranberries, 2 star anise, a small sprig of rosemary or bay', ref: 'traditional/herb/star_anise' },
      { name: 'SPRING: 1 sliced lemon, 2 sprigs rosemary, a handful of fresh mint', ref: 'traditional/herb/rosemary' },
      { name: 'SUMMER: 1 sliced lime, a handful of basil, 1 tsp dried lavender buds', ref: 'traditional/herb/basil' },
      { name: 'A splash of vanilla extract', ref: 'traditional/herb/vanilla', optional: true },
      { name: 'Cloves for the autumn blend', ref: 'traditional/herb/clove' },
      { name: 'Lavender for the summer blend', ref: 'traditional/herb/lavender' },
    ],
    preparation:
      'Choose the blend for the season you are in, or the feeling you want: autumn for gratitude and abundance, winter for warmth and endurance, spring for fresh starts and cleansing, summer for joy and love. Save peels through the week in a tub in the fridge so nothing is wasted. Make sure you will be home and awake the whole time it simmers.',
    steps: [
      {
        title: 'Open the house',
        instructions:
          'Open a window for a minute to let stale air out. Stand in the middle of the kitchen and say what you want the house to feel like this season.',
        spoken: 'Wheel turn, season come, sweet the air in every room.',
      },
      {
        title: 'Fill the pot by hand',
        instructions:
          'Put the water in the pan and add the fruit, spices and herbs one handful at a time, naming each: “apple for harvest, cinnamon for warmth, clove for keeping”; “lemon for clearing, mint for waking”; and so on in your own words.',
      },
      {
        title: 'Bring it to life',
        instructions:
          'Bring to a boil, then turn to the lowest heat so it barely steams. Stir three times clockwise. Close the window again.',
      },
      {
        title: 'Walk the scent through',
        instructions:
          'Once the fragrance builds (about 15 minutes), walk slowly through each room, opening interior doors so the scent can follow you. In each doorway pause and breathe it in.',
        minutes: 15,
      },
      {
        title: 'Tend it',
        instructions:
          'Let it simmer for up to 2 hours, checking every 20 to 30 minutes and topping up with hot water so it never boils dry. Each top-up is a small renewal of the blessing.',
        minutes: 90,
      },
      {
        title: 'Return to the earth',
        instructions:
          'Turn off the heat and let it cool. Strain the solids onto the compost or bury them in the garden with thanks. The liquid can be kept in the fridge and reheated once the next day.',
        spoken: 'From the earth, to the earth, with thanks.',
      },
    ],
    closing:
      'Wipe the hob and say goodnight to the house. Note in your book which blend you used and how the home felt; over a year you will have your own seasonal calendar of scent.',
    safety:
      'Never leave a simmer pot unattended or let it boil dry; set a timer to remind you to top it up. Keep pets and small children away from the hot pan. Do not add essential oils, which are especially harmful to cats and birds when diffused. Do not eat or drink the simmered liquid after it has stood out.',
    lore:
      'Scenting the house with spice and fruit is old: pomanders of orange and clove were carried and hung in Tudor households, and wassail bowls of spiced apple warmed winter homes. The stove-top “simmer pot” itself is a twentieth-century American household habit (sometimes called potpourri on the stove) taken up by modern kitchen witches as a seasonal blessing. The wheel of four seasonal blends follows the modern Wheel of the Year.',
    sources: [
      'Hutton, The Stations of the Sun (on wassail and seasonal customs)',
      'Gerard, Herball (1597), on sweet-smelling herbs for the house',
    ],
  },
  {
    id: 'kitchen-cleansing-floor-wash',
    title: 'Rosemary and Lemon Floor Wash',
    kind: 'spell',
    summary:
      'A simple herbal floor wash of rosemary tea, lemon and vinegar, mopped from the back of the house to the front door to wash out heaviness and old arguments.',
    intention: 'cleansing',
    alsoFor: ['banishing', 'protection', 'peace'],
    practices: ['kitchen', 'folk', 'green'],
    paths: [],
    moon: ['waning', 'dark'],
    weekday: 6,
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: '2 large handfuls fresh rosemary (or 3 tbsp dried)', ref: 'traditional/herb/rosemary' },
      { name: 'Peel of 2 lemons' },
      { name: 'A small handful of garden sage or thyme', ref: 'traditional/herb/sage', optional: true },
      { name: '1 litre boiling water, for the herbal tea' },
      { name: '4 litres warm water in a bucket' },
      { name: '250 ml white vinegar' },
      { name: '1 tbsp salt' },
      { name: 'A mop or floor cloth, and a bucket' },
      { name: 'A fine sieve' },
    ],
    preparation:
      'Sweep or vacuum first; the wash is for what you can’t see. Check your flooring: vinegar is not safe on marble, limestone, travertine or waxed or oiled wood (use the herbal tea in plain water there). Put pets in another room until the floors are dry. A waning or dark moon, or Saturday, suits clearing work.',
    steps: [
      {
        title: 'Brew the wash',
        instructions:
          'Put the rosemary, lemon peel and sage in a heatproof jug and pour over the boiling water. Cover and steep 20 minutes. The kitchen will smell green and sharp. Speak over it as it steeps.',
        spoken: 'Rosemary for remembrance, lemon for light, what is heavy here goes out tonight.',
        minutes: 20,
      },
      {
        title: 'Mix the bucket',
        instructions:
          'Strain the herb tea into the bucket of warm water. Add the vinegar and the salt and stir with your hand or the mop handle, counter-clockwise (widdershins), the direction of undoing.',
      },
      {
        title: 'Open the front door',
        instructions:
          'Open the front door (or the main door) wide, and a window at the back of the home if you can. This gives what you are clearing a way out.',
      },
      {
        title: 'Work from back to front',
        instructions:
          'Start at the room furthest from the front door, in the far corner. Mop in steady strokes toward the door of each room, then along hallways toward the front door. Wring out often. As you go, name aloud what you are washing out: tension, illness, a bad week, a guest who left a sour feeling.',
        minutes: 30,
      },
      {
        title: 'Wash the threshold last',
        instructions:
          'Finish by washing the front step or threshold outward, away from the house. Pour the last of the bucket out of the front door onto the ground or down an outside drain.',
        spoken: 'Out and away, and do not stay.',
      },
      {
        title: 'Seal with something sweet',
        instructions:
          'Close the door. Light the stove for a kettle or open the windows to the fresh air for ten minutes. Cleansing leaves space; fill it with something good, like music, a cup of tea, or laughter.',
      },
    ],
    closing:
      'Rinse the mop and bucket outdoors if you can. Compost the herbs. Repeat at each change of season, or after illness or upset in the house.',
    safety:
      'Keep pets and children off the floor until it is completely dry, and store the wash out of their reach. Do not add essential oils: they are toxic to cats and dogs on floors they walk and lick. Vinegar damages natural stone and some wood finishes; test a corner. Never mix vinegar with bleach or other cleaners. Wet floors are slippery.',
    lore:
      'Washing doorsteps and floors to keep a house lucky has long folk roots: in northern England and Scotland the doorstep was scoured and sometimes chalked with protective patterns, and salt and running water appear across European folk custom as purifiers. Rosemary was strewn and burned in sickrooms and churches in medieval and Tudor England. Herbal floor washes with spoken intent, mopped toward the door, are a staple of modern folk and kitchen witchcraft, adapted here without any borrowed closed-practice formulas.',
    sources: [
      'Gerard, Herball (1597), on rosemary',
      'Opie and Tatem, A Dictionary of Superstitions (on doorstep customs)',
    ],
  },
  {
    id: 'kitchen-threshold-salt-blessing',
    title: 'Threshold and Doorway Blessing',
    kind: 'spell',
    summary:
      'Clean, salt and bless the doorways of your home so only welcome things cross. A short working of sweeping, salt, bay and spoken words at each door.',
    intention: 'protection',
    alsoFor: ['cleansing', 'peace'],
    practices: ['kitchen', 'folk'],
    paths: [],
    moon: ['new', 'waxing', 'full'],
    holidays: ['samhain', 'imbolc'],
    weekday: 6,
    minutes: 30,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A small bowl of coarse salt', ref: 'traditional/vessel/bowl' },
      { name: 'A broom or hand brush', ref: 'traditional/tool/besom' },
      { name: 'A damp cloth' },
      { name: 'A few dried bay leaves', ref: 'traditional/herb/bay' },
      { name: 'A sprig of rosemary or rowan', ref: 'traditional/herb/rowan', optional: true },
      { name: 'A drawing pin or a bit of tape' },
    ],
    preparation:
      'Bless the salt first: hold the bowl in both hands and breathe on it three times, asking it to guard. List your doorways: front, back, balcony, and, if you like, the windows. Samhain and Imbolc, the old quarter-days when households were renewed, are especially fitting, but do this any time you move in or feel the home needs guarding.',
    steps: [
      {
        title: 'Sweep the threshold out',
        instructions:
          'At the main door, sweep the step and the floor just inside it, always outward, away from the house. Then wipe down the door frame, handle and threshold strip with the damp cloth.',
      },
      {
        title: 'Lay the salt',
        instructions:
          'Take a pinch of salt and sprinkle a thin line or three small dots across the threshold, just inside the door, from left to right. If a line isn’t practical, tuck a pinch into each lower corner of the frame.',
        spoken: 'Salt of the sea and salt of the stone, let none cross here who mean harm to this home.',
      },
      {
        title: 'Mark the lintel',
        instructions:
          'Pin or tape a bay leaf (and a sprig of rowan or rosemary if you have it) above the inside of the door frame, on the lintel. Touch the four corners of the doorway with your fingertips, top left, top right, bottom right, bottom left.',
      },
      {
        title: 'Speak the welcome',
        instructions:
          'Protection is also a matter of welcome. Stand in the doorway facing out and say who and what is welcome here. Make it specific: friends, rest, good news, the post that brings cheques not bills.',
        spoken: 'Friend and kin and good news, come in. All else, pass by.',
      },
      {
        title: 'Repeat at each door',
        instructions:
          'Go to each remaining door, moving through the house clockwise, and repeat the sweeping, salt and lintel leaf. For windows, a pinch of salt on each sill is enough.',
        minutes: 15,
      },
      {
        title: 'Close the round',
        instructions:
          'Return to the front door. Lay your palm flat on it and feel the house as a whole, held and complete.',
        spoken: 'Door and sill and lintel, kept.',
      },
    ],
    closing:
      'After a day or a week, sweep the salt up and out of the door and replace it as needed. Replace the bay leaf each year at the same season.',
    safety:
      'Salt is harmful to dogs and cats if they eat a lot of it, and can irritate paws; use the tucked-in-the-corners method if you have pets, and sweep it up after a day. Rowan berries should not be eaten raw. Salt can mark some wooden floors.',
    lore:
      'Thresholds are protected in folk custom across Europe: Hungarian households sprinkled salt on a new home’s threshold, Russians drew crosses on it, and in Britain and Scandinavia rowan sprigs were fixed over doors against witchcraft and ill-luck, especially on May Eve and Samhain. Horseshoes, iron and witch bottles were buried beneath doorsteps in early modern England. Salt as a purifier is ancient, appearing in Greek and Roman ritual. The combined working here is a modern arrangement of these older, widely shared customs.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), on threshold rites',
      'Gregor, Notes on the Folk-Lore of the North-East of Scotland (1881), on rowan over doors',
      'Merrifield, The Archaeology of Ritual and Magic (on concealed doorway charms)',
    ],
  },
