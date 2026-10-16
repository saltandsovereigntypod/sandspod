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
  {
    id: 'kitchen-hearth-blessing',
    title: 'Blessing the Hearth',
    kind: 'ritual',
    summary:
      'Set up and bless a small kitchen altar by the stove, the modern hearth, and honour the fire that feeds the house with an old Gaelic hearth blessing.',
    intention: 'protection',
    alsoFor: ['peace', 'prosperity'],
    practices: ['kitchen', 'folk'],
    paths: [],
    moon: ['new', 'full'],
    holidays: ['imbolc', 'la_fheile_bride', 'vestalia'],
    minutes: 40,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A small shelf, tray or windowsill near the stove', ref: 'traditional/tool/altar' },
      { name: 'A white or orange candle in a sturdy holder', ref: 'traditional/candle/white' },
      { name: 'A small dish of salt', ref: 'traditional/vessel/dish' },
      { name: 'A small dish of grain, rice or a crust of bread', ref: 'traditional/vessel/offering_bowl' },
      { name: 'A sprig of a kitchen herb you cook with: rosemary, thyme or bay', ref: 'traditional/herb/rosemary' },
      { name: 'A wooden spoon or a favourite kitchen tool' },
      { name: 'An image or figure of a hearth goddess, if you honour one', ref: 'traditional/deity/hestia', optional: true },
      { name: 'Brigid, if you honour her', ref: 'traditional/deity/brigid', optional: true },
      { name: 'Vesta, if you honour her', ref: 'traditional/deity/vesta', optional: true },
    ],
    preparation:
      'Clean the stove and the worktop around it thoroughly; this is the most important part. Choose a spot for the altar that is away from the direct heat of the hob and out of the way of splashes and tea towels. It can be tiny. Many kitchen witches honour Hestia, Vesta or Brigid here; others honour the spirits of the house or simply the fire itself.',
    steps: [
      {
        title: 'Clear and wash',
        instructions:
          'Wipe the chosen shelf with warm water and a little salt. Wipe the stove knobs and the oven door. As you clean, think of the meals this kitchen has made and will make.',
      },
      {
        title: 'Lay the altar',
        instructions:
          'Place the salt on the left, the grain on the right, and the candle in the middle at the back. Lay the herb sprig and the wooden spoon in front. Add the image of your hearth deity if you have one. Keep it simple; a hearth altar should be easy to keep clean.',
      },
      {
        title: 'Kindle the flame',
        light: true,
        instructions:
          'Light the candle, and if you have a gas hob, light one ring briefly too, then turn it off. Watch the flame settle. Rest your hands on the worktop either side of it.',
        spoken:
          'Fire of the hearth, heart of the house, you warm us and you feed us. Be welcome here, and be honoured.',
      },
      {
        title: 'The smooring blessing',
        instructions:
          'In the Hebrides, the woman of the house “smoored” the peat fire each night, banking it so it would last till morning, and said a blessing over it. Say these words from Carmina Gadelica, or adapt them to your own powers.',
        spoken:
          'The sacred Three to save, to shield, to surround the hearth, the house, the household, this eve, this night, and every night, each single night.',
      },
      {
        title: 'Offer and ask',
        instructions:
          'Take a pinch of the grain and place it in front of the candle as an offering. Ask for what a hearth gives: warmth, nourishment, safety, a table that draws people together.',
        minutes: 3,
      },
      {
        title: 'Sit with the fire',
        instructions:
          'Sit or stand quietly and watch the candle for a few minutes. Listen to the kitchen: the fridge hum, the clock, the house settling. This is the sound of the hearth at rest.',
        minutes: 5,
        timed: true,
      },
      {
        title: 'Bank the fire',
        snuff: true,
        instructions:
          'Snuff the candle (rather than blowing it out) as a little act of smooring: the fire is not ended, only resting.',
        spoken: 'Rest now, and rise again tomorrow.',
      },
    ],
    closing:
      'Each time you cook, touch the altar or say a word to it. Change the grain offering weekly, giving the old to the birds. Relight the candle on Fridays, festival days or whenever the household needs warmth.',
    safety:
      'Keep the candle well away from the hob, curtains, tea towels and kitchen roll, and never leave it burning unattended. Do not leave gas rings lit. Keep salt and grain dishes out of reach of pets.',
    lore:
      'The hearth was the sacred centre of the home in many old cultures: the Greeks gave Hestia the first offering of every sacrifice, Rome kept Vesta’s eternal flame tended by the Vestal Virgins, and Irish tradition linked Brigid to the hearth fire, with her flame kept burning at Kildare. The smooring blessing is quoted from Alexander Carmichael’s Carmina Gadelica (1900), which records nightly prayers said over the banked peat fire in the Scottish Highlands and Islands. The kitchen altar is a modern kitchen-witch practice that carries this forward to the stove.',
    sources: [
      'Carmichael, Carmina Gadelica, vol. 1 (1900), “Smooring the Fire”',
      'Homeric Hymn 29, To Hestia',
      'Gerald of Wales, Topographia Hibernica (c. 1188), on Brigid’s fire at Kildare',
    ],
  },
  {
    id: 'kitchen-sweeping-out-the-old',
    title: 'Sweeping Out the Old',
    kind: 'spell',
    summary:
      'A whole-house sweep with a broom, moving from the back of the home to the front door, to clear out stagnant energy at the turn of a season or after a hard chapter.',
    intention: 'banishing',
    alsoFor: ['cleansing', 'beginnings'],
    practices: ['kitchen', 'folk'],
    paths: [],
    moon: ['waning', 'dark'],
    holidays: ['imbolc', 'ostara', 'samhain'],
    minutes: 45,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A broom or besom', ref: 'traditional/tool/besom' },
      { name: 'A dustpan' },
      { name: 'A handful of dried rosemary, lavender or garden sage to scatter', ref: 'traditional/herb/lavender', optional: true },
      { name: 'A pinch of salt' },
    ],
    preparation:
      'Declutter a little first: one bag of things to give away or throw out. Open the front door and a back window. Waning and dark moons are traditional for clearing. In folklore you never sweep on New Year’s Day, lest you sweep the luck out, so do this before, not on, a fresh start.',
    steps: [
      {
        title: 'Name what goes',
        instructions:
          'Stand at the furthest point from the front door with the broom upright. Say aloud what you are sweeping out: “the winter’s gloom,” “the grief of this year,” “the arguing,” “the illness.”',
        spoken: 'Old and done, old and done, out the door and into the sun.',
      },
      {
        title: 'Scatter the herbs',
        instructions:
          'If using, scatter a light sprinkle of dried herbs and a pinch of salt across the floor of the far room. They give the broom something to gather and fill the air with scent as you work.',
      },
      {
        title: 'Sweep toward the door',
        instructions:
          'Sweep each room from the far corners toward its doorway, then along corridors toward the front door. Use long, deliberate strokes. Notice the sound of the bristles; let it become a rhythm. Pay attention to corners, behind doors and under beds, where stillness collects.',
        minutes: 25,
      },
      {
        title: 'Out of the door',
        instructions:
          'Sweep everything gathered right out of the front door and off the step. Scoop it up and put it in an outside bin, or scatter organic matter in the garden away from the house.',
        spoken: 'Go, and do not come back.',
      },
      {
        title: 'Turn and welcome',
        instructions:
          'Turn the broom bristles-up and stand it by the door (a folk sign that the work is done and guards the entry). Step back inside, facing the house, and name what you welcome in instead.',
        spoken: 'Fresh and new, fresh and new, come in, come in, the door is through.',
      },
    ],
    closing:
      'Close the door and windows. Do something that fills the cleared space: open a new jar of something, cook, play music. Clean the broom bristles outdoors with a shake.',
    safety:
      'Salt and scattered herbs should be fully swept up where pets roam. Dust can trigger asthma and allergies; open windows and consider a dust mask.',
    lore:
      'Brooms are full of folklore in Britain and Europe: sweeping dust out of the door at the old year’s end, never sweeping on New Year’s Day or after dark, and laying a broom across a threshold against unwanted visitors. Spring cleaning itself has roots in seasonal renewal customs, including Iranian khaneh tekani before Nowruz and the Jewish clearing of leaven before Passover. The besom as a witch’s tool appears in early modern witch-trial imagery, and the ritual sweep is a modern witchcraft practice built on those household habits.',
    sources: [
      'Opie and Tatem, A Dictionary of Superstitions (on brooms and sweeping)',
      'Hutton, The Triumph of the Moon (on the besom in modern witchcraft)',
    ],
  },
  {
    id: 'kitchen-family-meal-blessing',
    title: 'Blessing the Family Meal',
    kind: 'ritual',
    summary:
      'A short, warm ritual for the start of a shared meal: a lit candle, a word of thanks, a portion set aside, and each person naming one good thing.',
    intention: 'love',
    alsoFor: ['peace', 'prosperity'],
    practices: ['kitchen', 'folk'],
    paths: [],
    minutes: 10,
    level: 'beginner',
    solo: false,
    ingredients: [
      { name: 'A candle for the table', ref: 'traditional/candle/white' },
      { name: 'A small spare plate or dish for the first portion', ref: 'traditional/vessel/offering_bowl' },
      { name: 'The meal itself, and the people sharing it' },
    ],
    preparation:
      'Set the table properly, even for a simple supper: everyone seated, screens away. Decide who will lead; it can rotate each week. Children love to be the one who lights (with help) or snuffs the candle.',
    steps: [
      {
        title: 'Light the table',
        light: true,
        instructions:
          'Once everyone is seated and the food is on the table, light the candle. Pause for three breaths, together, before anyone reaches for anything.',
      },
      {
        title: 'Give thanks',
        instructions:
          'The leader gives thanks for the food and the hands that made it, from field to kitchen. Use these words, from Proverbs, or your own.',
        spoken:
          'Better is a dinner of herbs where love is, than a stalled ox and hatred therewith. For the food, for the hands, for each other: thank you.',
      },
      {
        title: 'Set aside the first portion',
        instructions:
          'Put a small spoonful of the meal on the spare dish: for the house spirits, the ancestors, the gods you honour, or simply for those who are hungry tonight. Families who prefer can instead commit to a donation to a food bank.',
      },
      {
        title: 'One good thing',
        instructions:
          'Go round the table. Each person names one good thing from their day, however small. No commenting or fixing; just listening.',
        minutes: 5,
      },
      {
        title: 'Eat',
        instructions:
          'Begin the meal. The candle stays lit while you eat together.',
        spoken: 'Eat well, all of you.',
      },
      {
        title: 'Close the meal',
        snuff: true,
        instructions:
          'When the meal ends, the person who lit the candle snuffs it, and everyone says a word of thanks to the cook.',
      },
    ],
    closing:
      'After the meal, put the set-aside portion outside for the birds or wildlife (if it is safe for them), or compost it with thanks.',
    safety:
      'Keep the candle away from napkins, children’s sleeves and serving reach, and never leave it burning after the table is cleared. Don’t put food containing onion, garlic, chocolate or grapes outdoors where pets or wildlife could eat it.',
    lore:
      'Grace before meals is found in almost every culture, and the custom of setting aside a first portion is ancient: Greeks offered the first of the meal to Hestia, Romans dropped a morsel into the hearth fire for the Lares, and Scottish and Irish households left milk and bread for the brownie or the “good people.” The Proverbs line is from the King James Bible (1611). The round of “one good thing” is a modern family practice.',
    sources: [
      'Proverbs 15:17, King James Version (1611)',
      'Ovid, Fasti (on offerings to the Lares at meals)',
    ],
  },
  {
    id: 'kitchen-housewarming-blessing',
    title: 'Bread and Salt Housewarming',
    kind: 'ritual',
    summary:
      'Bless a new home before or as you move in: bread so you never go hungry, salt so life has flavour, a candle carried through every room, and a first meal cooked on the new stove.',
    intention: 'beginnings',
    alsoFor: ['protection', 'prosperity', 'cleansing'],
    practices: ['kitchen', 'folk'],
    paths: [],
    moon: ['new', 'waxing'],
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A loaf of bread (homemade or bought)' },
      { name: 'A small jar or dish of salt' },
      { name: 'A little honey or sugar, for sweetness', optional: true },
      { name: 'A white candle in a holder with a drip guard', ref: 'traditional/candle/white' },
      { name: 'A broom', ref: 'traditional/tool/besom' },
      { name: 'A bowl of water with a pinch of salt and a sprig of rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'A small coin' },
    ],
    preparation:
      'If you can, do this before the furniture arrives, when the rooms are empty. Bring the bread and salt into the house first, before anything else: that is the old custom. Sweep the house through once to clear the previous occupants’ energy, with thanks to them.',
    steps: [
      {
        title: 'Carry in bread and salt',
        instructions:
          'Step over the threshold carrying the bread and salt together. Set them down in the kitchen, the new heart of the house.',
        spoken: 'Bread, that this house may never know hunger. Salt, that life here may always have flavour.',
      },
      {
        title: 'Sweep and sprinkle',
        instructions:
          'Sweep each room toward the front door. Then dip the rosemary sprig in the salted water and sprinkle a few drops in each corner of each room, moving clockwise through the house.',
        minutes: 20,
      },
      {
        title: 'Carry the light',
        light: true,
        instructions:
          'Light the candle in the kitchen. Carry it, carefully, through every room, pausing in each to say what that room is for: rest, play, work, love, cooking. In each doorway, hold the candle up to the lintel for a moment.',
        spoken: 'Light in this room, and life in this room.',
      },
      {
        title: 'The coin under the step',
        instructions:
          'Place the small coin somewhere hidden near the front door, such as under the doormat or on the top of the door frame, as a seed of plenty.',
      },
      {
        title: 'Cook the first meal',
        instructions:
          'Make something simple on the new stove, even just toast from the blessed bread or a pan of soup. Eat it in the kitchen, sprinkling a pinch of the blessed salt on it.',
        minutes: 20,
      },
      {
        title: 'Welcome yourself home',
        snuff: true,
        instructions:
          'Stand in the middle of the home. Say your name, and the names of everyone who will live there, people and pets. Snuff the candle.',
        spoken: 'This is our home now. We are welcome here, and we will be good to it.',
      },
    ],
    closing:
      'Keep a little of the blessed salt in the kitchen for cooking. Give the end of the loaf to the birds. Traditionally, the first guests are offered bread and salt too, so keep some on hand for your housewarming visitors.',
    safety:
      'Never leave the candle unattended and take care carrying it through rooms with boxes and packing material. Use a drip guard. Keep salt away from pets.',
    lore:
      'Bread and salt as a welcome is especially strong in Slavic tradition (khleb-sol), where a loaf with salt set on top greets guests and newlyweds, and it was carried into Jewish households of Eastern Europe, sometimes with sugar for sweetness. In Britain and Ireland, the first things carried into a new house were often bread, salt and coal, echoed in the Scottish first-footing gifts at New Year. Carrying fire into a new home goes back to the Greek custom of bringing a flame from the mother’s hearth to light the hearth of a new household.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), on house-entry customs',
      'Banks, British Calendar Customs: Scotland (1937–41), on first-footing gifts',
    ],
  },
  {
    id: 'kitchen-wooden-spoon-charm',
    title: 'The Wooden Spoon Charm',
    kind: 'spell',
    summary:
      'Turn an ordinary wooden spoon into your kitchen wand: oil it, mark it with symbols of your own, and bless it so that every stir carries intention.',
    intention: 'protection',
    alsoFor: ['prosperity', 'love', 'beginnings'],
    practices: ['kitchen', 'folk'],
    paths: [],
    moon: ['new', 'waxing'],
    weekday: 0,
    minutes: 45,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A plain, unfinished wooden spoon (beech, cherry or olive wood)' },
      { name: 'Food-safe oil or board butter: mineral oil, beeswax and mineral oil blend, or fractionated coconut oil' },
      { name: 'A fine-tipped pyrography pen, or a craft knife for shallow carving, or a food-safe marker', optional: true },
      { name: 'Fine sandpaper (240 grit)' },
      { name: 'A soft cloth' },
      { name: 'A sprig of rosemary or bay to lay with it overnight', ref: 'traditional/herb/bay' },
    ],
    preparation:
      'Choose your symbols: a sun for plenty, a spiral for growth, a heart, an eye for protection, runes or initials, your household’s mark. Sketch them on paper first. Keep any carving on the handle, away from the bowl that touches food. Do not use culinary vegetable oils like olive or sunflower, which can go rancid in wood.',
    steps: [
      {
        title: 'Sand it smooth',
        instructions:
          'Lightly sand the whole spoon, following the grain, until it feels silky. Wipe off the dust. This is the spoon’s first cleansing, and your first getting-to-know it.',
        minutes: 5,
      },
      {
        title: 'Mark the handle',
        instructions:
          'Burn, carve or draw your chosen symbols into the handle. Go slowly. As you make each mark, say what it stands for.',
        minutes: 20,
      },
      {
        title: 'Oil and name it',
        instructions:
          'Rub a little food-safe oil into the whole spoon with the cloth, working it into the grain until the wood darkens and glows. As you oil it, speak its purpose.',
        spoken: 'Spoon of the hearth, wood of the tree, stir what I wish and bring it to me. Sunwise for plenty, widdershins to free.',
      },
      {
        title: 'Teach it the two directions',
        instructions:
          'Holding the spoon over an empty bowl, stir the air three times clockwise, saying “I draw in,” then three times counter-clockwise, saying “I let go.” This is how you will use it from now on.',
      },
      {
        title: 'Rest it overnight',
        instructions:
          'Lay the spoon on a clean cloth beside the stove or your hearth altar with the bay or rosemary sprig on top. Leave it overnight for the oil to soak in and the blessing to settle.',
      },
    ],
    closing:
      'Use the spoon for your spell-cooking: sunwise to draw in, widdershins to release. Wash by hand, never in the dishwasher, and re-oil every month or so, renewing its blessing as you do.',
    safety:
      'Use only food-safe oil finishes and markers labelled food-safe. Pyrography pens and craft knives are sharp and hot; work on a heatproof surface and cut away from yourself. Keep burning and carving off the bowl of the spoon. Some people are allergic to certain woods or to nut-based oils; avoid walnut oil if anyone has nut allergies.',
    lore:
      'Spoons and ladles have their own folklore: in Wales, carved lovespoons were given as tokens of courtship from the seventeenth century, and stirring sunwise for luck is recorded in Scotland and Ireland. In the kitchen-witch revival, the wooden spoon came to be treated as the hearth witch’s wand, a modern idea that fits the older belief that everyday tools gather power with use.',
    sources: [
      'Owen, Welsh Folk Customs (on lovespoons)',
      'Carmichael, Carmina Gadelica (1900), on the sunwise turn',
    ],
  },
  {
    id: 'kitchen-blessed-salt-and-sugar',
    title: 'Blessed Salt and Sweetening Sugar Jars',
    kind: 'spell',
    summary:
      'Bless the everyday salt and sugar on your kitchen shelf, one for protection and purity, the other for sweetness and kindness, so they work quietly in every meal.',
    intention: 'cleansing',
    alsoFor: ['protection', 'love', 'peace'],
    practices: ['kitchen', 'folk'],
    paths: [],
    moon: ['full'],
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A clean glass jar of salt (sea salt or kitchen salt)', ref: 'traditional/vessel/spell_jar' },
      { name: 'A clean glass jar of sugar (white, brown or both)' },
      { name: 'A dried bay leaf for the salt jar', ref: 'traditional/herb/bay', optional: true },
      { name: 'A vanilla pod or a cinnamon stick for the sugar jar', ref: 'traditional/herb/vanilla', optional: true },
      { name: 'Labels and a pen' },
      { name: 'A wooden spoon' },
    ],
    preparation:
      'Wash and fully dry the jars; any moisture will make the salt and sugar clump. A full moon is traditional for blessing and charging. Do this where moonlight reaches, a windowsill if possible.',
    steps: [
      {
        title: 'Fill the salt jar',
        instructions:
          'Pour the salt in slowly, watching the crystals. Tuck in the bay leaf. Stir three times clockwise with the wooden spoon.',
        spoken: 'Salt of the earth and salt of the sea, keep this house and keep it free.',
      },
      {
        title: 'Fill the sugar jar',
        instructions:
          'Pour the sugar in, and bury the vanilla pod or cinnamon stick in the middle; over a few weeks it will scent the sugar beautifully. Stir three times clockwise.',
        spoken: 'Sugar and spice, sweet as can be, kindness for all who eat with me.',
      },
      {
        title: 'Label them',
        instructions:
          'Label the jars with their purpose as well as what they are: “Salt: to keep and to cleanse,” “Sugar: to sweeten.” Draw a small symbol on each if you like.',
      },
      {
        title: 'Moon them',
        instructions:
          'Set both jars, lids on, on the windowsill under the full moon overnight. Rest your hands on the lids before you go to bed.',
        minutes: 2,
      },
      {
        title: 'Put them to work',
        instructions:
          'In the morning, put the jars in their place by the stove. Use the salt when cooking, for threshold work and in cleansing water; use the sugar in tea and baking when you want to sweeten the day.',
      },
    ],
    closing:
      'When a jar runs low, top it up and stir in a fresh blessing. Remove the bay leaf after a few months and replace it.',
    safety:
      'These are ordinary food ingredients; keep the bay leaf whole and remove it before using the salt in a dish if it has broken. Salt is harmful to pets in quantity. Keep the jars sealed against damp and insects.',
    lore:
      'Salt has been used as a purifier in ritual since antiquity: Greek and Roman offerings were sprinkled with salted grain (mola salsa), and salt features in protective folk charms across Europe, from spilling-salt superstitions to salt placed on the chests of the dead. Sweetening with sugar or honey to soften a situation is a widely shared folk idea. Blessing pantry staples so they work in every meal is a modern kitchen-witch practice.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), on salt in custom',
      'Pliny the Elder, Natural History 31 (on salt)',
    ],
  },
  {
    id: 'kitchen-four-thieves-vinegar',
    title: 'Four Thieves Herbal Vinegar',
    kind: 'spell',
    summary:
      'A food-safe herbal vinegar inspired by the old plague legend: garlic, rosemary, sage, thyme and mint steeped in cider vinegar for salad dressings, kitchen tonics and protective household washes.',
    intention: 'protection',
    alsoFor: ['healing', 'cleansing', 'banishing'],
    practices: ['kitchen', 'folk', 'green'],
    paths: [],
    moon: ['new', 'waxing'],
    weekday: 6,
    minutes: 30,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: '500 ml raw apple cider vinegar (at least 5% acidity)' },
      { name: '1 head of garlic, cloves peeled and lightly crushed', ref: 'traditional/herb/garlic' },
      { name: '2 sprigs fresh rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'A small handful fresh garden sage', ref: 'traditional/herb/sage' },
      { name: '4 sprigs fresh thyme', ref: 'traditional/herb/thyme' },
      { name: 'A small handful fresh mint', ref: 'traditional/herb/mint' },
      { name: '1 tsp dried lavender buds', ref: 'traditional/herb/lavender', optional: true },
      { name: '1 tsp black peppercorns', ref: 'traditional/herb/black_pepper' },
      { name: '6 whole cloves', ref: 'traditional/herb/clove' },
      { name: 'A clean glass jar with a non-metal lid (or a sheet of baking paper under a metal lid)', ref: 'traditional/vessel/spell_jar' },
    ],
    preparation:
      'Sterilise the jar: wash in hot soapy water and dry in a low oven (120 °C) for 15 minutes, then let it cool. Wash the fresh herbs and pat them completely dry. The historical versions contain wormwood, rue and camphor, which are not food-safe; this kitchen version keeps only culinary herbs.',
    steps: [
      {
        title: 'Tell the story',
        instructions:
          'As you set out the herbs, tell the legend aloud or to yourself: four thieves robbed plague houses and never fell ill, and when caught they traded their secret for their lives. Whatever its truth, it is a story about walking through danger unharmed.',
      },
      {
        title: 'Bruise and layer',
        instructions:
          'Lightly bruise each herb between your fingers to release its oils, smelling each. Layer them in the jar with the garlic, peppercorns and cloves, naming the four guardians as you go.',
        spoken: 'Garlic the first, rosemary the second, sage the third, thyme the fourth: four thieves to stand at the four corners and let no sickness through.',
      },
      {
        title: 'Pour the vinegar',
        instructions:
          'Pour the vinegar over until every leaf is submerged by at least 2 cm. Poke out air bubbles with a clean chopstick. Herbs above the surface can go mouldy.',
      },
      {
        title: 'Seal and mark the date',
        instructions:
          'Seal the jar and label it with the name and date. Shake it gently, then set it in a cool, dark cupboard.',
        spoken: 'Steep and strengthen, dark and deep.',
      },
      {
        title: 'Tend it',
        instructions:
          'Shake the jar every day or two for 2 to 3 weeks, each time saying a word of protection over it. Keep the herbs submerged.',
      },
      {
        title: 'Strain and bottle',
        instructions:
          'Strain through a fine sieve or muslin into a clean bottle, pressing the herbs gently. Compost the spent herbs. Store the vinegar in the fridge.',
      },
    ],
    closing:
      'Use a spoonful in salad dressings or a marinade, add a splash to a mug of warm water and honey as a winter tonic, or dilute 1 part to 4 of water in a spray bottle for wiping doorknobs and worktops as a protective cleanse.',
    safety:
      'Use only food-safe culinary herbs; never add wormwood, rue, camphor or essential oils to anything you will ingest. Keep the herbs fully submerged and refrigerate the strained vinegar, using it within 3 to 4 months; discard if mould appears. Garlic is toxic to pets. Vinegar is acidic: dilute it before drinking, rinse your mouth afterwards to protect tooth enamel, and avoid it as a tonic if you have reflux or stomach ulcers. Do not use on marble or natural stone.',
    lore:
      'The Four Thieves legend is told of plague-time Marseille or Toulouse: thieves who robbed the sick and dead were protected by an herbal vinegar and traded the recipe for leniency. References are scant before the 1800s, and the best-known “original” recipe, said to have been posted in Marseille, was published by René-Maurice Gattefossé in 1937. Herbal vinegars (vinaigre des quatre voleurs) were sold by eighteenth- and nineteenth-century apothecaries as preservatives against infection. Some historians note the herbs may have repelled fleas, the real carriers of plague.',
    sources: [
      'Gattefossé, Aromathérapie (1937), the posted Marseille recipe',
      'Historical pharmacopoeias of the 18th–19th centuries (vinaigre des quatre voleurs)',
    ],
  },
  {
    id: 'kitchen-moon-phase-meal-planning',
    title: 'Moon-Phase Meal Planning',
    kind: 'ritual',
    summary:
      'A monthly planning session at the new moon: look at the coming lunar month, match meals to the phases, write a menu with intention, and shop once with care.',
    intention: 'beginnings',
    alsoFor: ['prosperity', 'healing', 'study'],
    practices: ['kitchen', 'cosmic'],
    paths: [],
    moon: ['new'],
    minutes: 45,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A calendar or the app’s moon calendar for the coming month' },
      { name: 'A notebook or your book of shadows', ref: 'traditional/tool/book_of_shadows' },
      { name: 'Your favourite recipe books or saved recipes' },
      { name: 'A cup of tea', ref: 'traditional/herb/mint', optional: true },
      { name: 'A silver or white candle', ref: 'traditional/candle/silver', optional: true },
    ],
    preparation:
      'Check what is already in your fridge, freezer and cupboards and jot it down; waste is the enemy of plenty. Note any busy days, celebrations or travel in the coming month. Make your tea.',
    steps: [
      {
        title: 'Open the month',
        light: true,
        instructions:
          'Light the candle if using. Open your calendar to the coming lunar month and mark the four phases: new, first quarter, full, last quarter.',
        spoken: 'New moon, new month, new table. Let what I cook this month feed what I am growing.',
      },
      {
        title: 'Set a month’s intention',
        instructions:
          'Write one intention for the month at the top of the page: more energy, eating together more, saving money, comfort during grief. Every meal plan will lean toward it.',
        minutes: 5,
      },
      {
        title: 'Match meals to phases',
        instructions:
          'Use the phases as a loose guide. New moon (days 1–7): seeds, sprouts, eggs, fresh starts and new recipes. Waxing (8–14): growing, abundant foods such as breads, grains, slow-rising doughs. Full moon (around day 15): a celebratory or shared meal, round foods, something golden. Waning (16–28): simple, cleansing, comforting food; soups, use-up-the-fridge dishes, bitter greens.',
        minutes: 15,
      },
      {
        title: 'Write the menu',
        instructions:
          'Fill in your meals for at least the first week, and sketch the rest. Mark one spell-meal per phase, a dish you will cook as a deliberate working (for example, Prosperity Bread at the waxing moon, the Healing Broth at the waning).',
        minutes: 15,
      },
      {
        title: 'Write the list and bless it',
        snuff: true,
        instructions:
          'Write the shopping list from the menu. Hold it, wish the budget well and the food good, and snuff the candle.',
        spoken: 'Enough for us, and some to share.',
      },
    ],
    closing:
      'Keep the plan on the fridge. At the next new moon, look back before planning again: which meals nourished you, which went uneaten, and how the month’s intention fared.',
    safety:
      'Plan around everyone’s allergies and dietary needs first. Phase-based eating is a symbolic framework, not medical or nutritional advice. Do not leave the candle unattended.',
    lore:
      'Timing household work by the moon is old folk practice: farmers planted, cut timber, slaughtered and brewed by its phases, as recorded in almanacs from Hesiod’s Works and Days to the English farmers’ almanacs of the seventeenth century onward. The idea of matching meals to the phases (growing foods at the waxing moon, cleansing foods at the waning) is a modern kitchen-witch adaptation of that lunar-almanac thinking.',
    sources: [
      'Hesiod, Works and Days (on lucky and unlucky days of the month)',
      'Tusser, Five Hundred Points of Good Husbandry (1573), on moon-timed work',
    ],
  },

  // ───────────────────────────── SOLITARY ─────────────────────────────
  {
    id: 'kitchen-solitary-self-dedication',
    title: 'Self-Dedication to Your Path',
    kind: 'ritual',
    summary:
      'A simple, heartfelt rite to commit yourself to your own spiritual path. It is a promise made to yourself and whatever you hold sacred, not an initiation into any tradition.',
    intention: 'beginnings',
    alsoFor: ['courage', 'study'],
    practices: ['solitary', 'eclectic'],
    paths: [],
    moon: ['new', 'waxing'],
    holidays: ['imbolc', 'samhain'],
    minutes: 45,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A white candle', ref: 'traditional/candle/white' },
      { name: 'A small bowl of water', ref: 'traditional/vessel/bowl' },
      { name: 'A small dish of salt or soil', ref: 'traditional/vessel/dish' },
      { name: 'A sprig of rosemary or a stick of incense for air', ref: 'traditional/herb/rosemary' },
      { name: 'A few drops of olive oil in a dish, for anointing' },
      { name: 'Paper and pen, or your book of shadows', ref: 'traditional/tool/book_of_shadows' },
      { name: 'A personal token to keep: a ring, a stone, a cord', ref: 'traditional/crystal/clear_quartz', optional: true },
    ],
    preparation:
      'Spend a few days beforehand writing your dedication: what you are committing to (learning, practice, honouring nature, honouring a deity), for how long, and why. Many modern witches choose “a year and a day,” a span borrowed from old legal custom. Bathe or wash before the rite and wear something that feels like you.',
    steps: [
      {
        title: 'Arrange the four elements',
        instructions:
          'Set the candle in the centre, water to the west, salt or soil to the north, rosemary or incense to the east, and keep the south for the flame. Sit facing them. Take a few slow breaths and let the room grow quiet.',
        minutes: 3,
      },
      {
        title: 'Light the flame',
        light: true,
        instructions:
          'Light the candle and the incense if you are using it.',
        spoken: 'I come to this path of my own will, with an open heart and open eyes.',
      },
      {
        title: 'Touch each element',
        instructions:
          'Touch the soil or salt, pass your hand through the scent of the rosemary or smoke, hold your palm near (not over) the warmth of the flame, and dip your fingertips in the water. With each, say what it means to you.',
        spoken: 'Earth to steady me, air to teach me, fire to fuel me, water to heal me.',
      },
      {
        title: 'Read your dedication',
        instructions:
          'Read aloud the dedication you wrote. Speak slowly. If your voice shakes, let it; that is how you know it matters.',
        minutes: 5,
      },
      {
        title: 'Anoint yourself',
        instructions:
          'Dip a finger in the olive oil and touch it to your forehead, your heart and your palms.',
        spoken: 'Mind to know, heart to feel, hands to work. I am dedicated.',
      },
      {
        title: 'Bless the token',
        instructions:
          'Pass the token you chose over each element, then hold it to your heart. It is now a reminder of this promise.',
      },
      {
        title: 'Sit in the silence',
        instructions:
          'Sit with the candle for a while. Notice whatever comes: images, feelings, a sense of presence, or simply quiet.',
        minutes: 10,
        timed: true,
      },
      {
        title: 'Close',
        snuff: true,
        instructions:
          'Thank whatever you honour, and yourself. Snuff the candle.',
        spoken: 'It is begun.',
      },
    ],
    closing:
      'Write down the date and anything you felt in your book. Pour the water onto the earth. Wear or carry the token. At the end of your chosen span, renew, revise or complete your dedication.',
    safety:
      'Do not hold your hand over the flame, and keep the candle away from loose sleeves and paper. Olive oil is fine on skin for most people; patch-test if you have sensitive skin and avoid using essential oils undiluted.',
    lore:
      'Self-dedication is a modern practice that grew in the 1980s and 1990s alongside solitary witchcraft, popularised in books for practitioners without a coven. It is deliberately distinct from initiation, which is conferred by a coven within a lineage. The “year and a day” comes from medieval law and folk custom, where it marked a full term (for example in tenancies and handfasting). The four-element structure follows the general shape of modern Pagan ritual.',
    sources: [
      'Hutton, The Triumph of the Moon (on the rise of solitary practice)',
      'Folk and legal use of “a year and a day” in medieval English and Scots law',
    ],
  },
  {
    id: 'kitchen-solitary-morning-practice',
    title: 'Five-Minute Morning Practice',
    kind: 'ritual',
    summary:
      'A short daily rite to begin the day grounded: three breaths, a greeting to the day, one card or a moment of stillness, and a single intention.',
    intention: 'peace',
    alsoFor: ['courage', 'intuition', 'beginnings'],
    practices: ['solitary', 'elemental'],
    paths: [],
    minutes: 8,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A glass of water' },
      { name: 'A window or doorway with daylight' },
      { name: 'A tarot or oracle deck', ref: 'traditional/tool/tarot_deck', optional: true },
      { name: 'A notebook', optional: true },
    ],
    preparation:
      'Do this before you look at your phone. Keep the deck and notebook in the same spot each night so the morning needs no thought. Consistency matters more than length.',
    steps: [
      {
        title: 'Three breaths at the window',
        instructions:
          'Stand at a window or open door. Take three slow breaths, longer out than in. Look at the sky and notice one thing: the colour, the clouds, the weather.',
        minutes: 1,
        timed: true,
      },
      {
        title: 'Greet the day',
        instructions:
          'Say good morning to the day, the sun, or whatever you honour, out loud or under your breath.',
        spoken: 'Good morning, new day. I am here, and I am ready to meet you.',
      },
      {
        title: 'Drink with intention',
        instructions:
          'Hold the glass of water and think of one quality you want today: patience, focus, gentleness, nerve. Drink it slowly, picturing the quality filling you.',
        minutes: 1,
      },
      {
        title: 'One card or one minute',
        instructions:
          'Draw one card and read it as advice for today, or simply sit for one minute with your eyes closed and notice what you feel in your body.',
        minutes: 2,
      },
      {
        title: 'Name the intention',
        instructions:
          'Say or write one sentence: “Today I will…” Keep it small and doable.',
        spoken: 'Today I will…',
      },
    ],
    closing:
      'Go into your day. If you wrote something down, glance at it once at lunchtime. Try the practice daily for a full moon cycle before deciding whether it suits you.',
    lore:
      'Greeting the sun is among the oldest devotional habits: the Gayatri mantra of the Rig Veda is recited at sunrise, and Carmina Gadelica records Hebridean women and men saluting the sun each morning. A short, repeatable daily practice is now the backbone of most modern solitary witchcraft, which lacks a coven’s regular meetings.',
    sources: [
      'Rig Veda 3.62.10 (Griffith, 1896), the Gayatri at dawn',
      'Carmichael, Carmina Gadelica (1900), “Hail to the Sun”',
    ],
  },
  {
    id: 'kitchen-solitary-evening-reflection',
    title: 'Evening Reflection by Candlelight',
    kind: 'ritual',
    summary:
      'A gentle ten-minute rite at day’s end: light a candle, ask three questions, release what you don’t need to carry into sleep, and give thanks.',
    intention: 'peace',
    alsoFor: ['healing', 'banishing', 'study'],
    practices: ['solitary'],
    paths: [],
    moon: ['waning', 'dark'],
    minutes: 15,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A tea light or small candle in a holder', ref: 'traditional/candle/white' },
      { name: 'A journal and pen', ref: 'traditional/tool/book_of_shadows' },
      { name: 'A cup of chamomile or other caffeine-free tea', ref: 'traditional/herb/chamomile', optional: true },
      { name: 'An amethyst or other calming stone to hold', ref: 'traditional/crystal/amethyst', optional: true },
    ],
    preparation:
      'Choose a time an hour or so before sleep. Dim the lights and silence your phone. Make your tea if using.',
    steps: [
      {
        title: 'Light the candle',
        light: true,
        instructions:
          'Light the candle and watch the flame for a moment. Let it mark the line between the day and the night.',
        spoken: 'The day is done. I come home to myself.',
      },
      {
        title: 'Three questions',
        instructions:
          'Write brief answers to three questions: What went well today? What was hard? What did I learn, about the world or about me? A line or two for each is enough.',
        minutes: 6,
      },
      {
        title: 'Set it down',
        instructions:
          'Look at the hard thing. Hold the stone, or simply your open palms, and picture placing that hardness into it, or into the flame, to be held overnight so you don’t have to.',
        spoken: 'I set this down. It will keep until morning, or it will go.',
        minutes: 2,
      },
      {
        title: 'Give thanks',
        instructions:
          'Name three things you are grateful for, aloud. Small is fine: a warm meal, a kind word, a cat on your lap.',
      },
      {
        title: 'Quiet',
        instructions:
          'Sit and watch the flame for a few minutes, breathing slowly.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Snuff and rest',
        snuff: true,
        instructions:
          'Snuff the candle.',
        spoken: 'Goodnight.',
      },
    ],
    closing:
      'Go to bed without picking your phone back up. Once a month, perhaps at the dark moon, read back over your reflections to see the patterns.',
    safety:
      'Snuff the candle before you go to bed and never leave it burning unattended or near bedding. Chamomile can affect people with ragweed allergies.',
    lore:
      'The nightly review of the day has deep roots: Pythagoras was said to have taught his students to ask each evening “What have I done amiss? What good have I done? What have I left undone?”, and the Stoic Seneca describes the same practice. Carmina Gadelica records many night blessings said over the fire and the bed. This rite combines the ancient examination with modern gratitude journalling.',
    sources: [
      'The Golden Verses of Pythagoras (on the evening review)',
      'Seneca, On Anger 3.36',
      'Carmichael, Carmina Gadelica (1900), night blessings',
    ],
  },
  {
    id: 'kitchen-solitary-book-of-shadows-blessing',
    title: 'Making and Blessing a Book of Shadows',
    kind: 'ritual',
    summary:
      'Choose a blank book, prepare its first pages, and bless it with the four elements so it becomes your own grimoire, a living record of your practice.',
    intention: 'study',
    alsoFor: ['beginnings', 'intuition', 'protection'],
    practices: ['solitary', 'elemental'],
    paths: [],
    moon: ['new', 'waxing'],
    weekday: 3,
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A blank notebook, journal or ring binder', ref: 'traditional/tool/book_of_shadows' },
      { name: 'A good pen you love writing with' },
      { name: 'A candle, yellow for Mercury and learning, or white', ref: 'traditional/candle/yellow' },
      { name: 'A small dish of salt', ref: 'traditional/vessel/dish' },
      { name: 'A small bowl of water', ref: 'traditional/vessel/bowl' },
      { name: 'A sprig of rosemary, the herb of memory', ref: 'traditional/herb/rosemary' },
      { name: 'A pressed leaf or flower to keep in the book', optional: true },
    ],
    preparation:
      'Choose your book with care: some prefer a beautiful bound journal, others a binder so pages can be added and reordered. Decide how you will organise it (for example: correspondences, spells, rituals, dreams, divination, journal). Wednesday, Mercury’s day, favours books and learning.',
    steps: [
      {
        title: 'Lay out the elements',
        light: true,
        instructions:
          'Arrange the salt, rosemary, candle and water around the closed book, and light the candle.',
      },
      {
        title: 'Bless with earth',
        instructions:
          'Sprinkle a pinch of salt around the book (not on the pages).',
        spoken: 'By earth, be steady and keep what I learn.',
      },
      {
        title: 'Bless with air',
        instructions:
          'Brush the rosemary sprig over the cover and pages, letting its scent rise.',
        spoken: 'By air, hold my thoughts and make them clear.',
      },
      {
        title: 'Bless with fire',
        instructions:
          'Pass the book carefully above the candle at a safe height, or simply hold it in the candle’s light.',
        spoken: 'By fire, kindle my will to keep writing.',
      },
      {
        title: 'Bless with water',
        instructions:
          'Dip a fingertip in the water and touch the four corners of the inside cover, very lightly.',
        spoken: 'By water, let my intuition flow onto these pages.',
      },
      {
        title: 'Write the first page',
        instructions:
          'Write your name (or a craft name), the date and moon phase, and a few lines about why you are keeping this book. Tuck in the pressed leaf or a rosemary needle. Add a simple contents page for the sections you chose.',
        minutes: 20,
      },
      {
        title: 'Seal it',
        snuff: true,
        instructions:
          'Close the book and rest both hands on it. Snuff the candle.',
        spoken: 'Book of my craft, keeper of my way, grow with me day by day.',
      },
    ],
    closing:
      'Keep the book somewhere safe and personal. Write in it often, and don’t worry about perfect handwriting; it is a working book. Re-bless it at each new year of your practice.',
    safety:
      'Keep the book and paper well away from the candle flame; never pass pages through the flame itself. Do not leave the candle burning unattended.',
    lore:
      'The term “Book of Shadows” comes from Gerald Gardner’s Wicca in the 1950s, where it named an oathbound coven text; this rite does not use or reproduce that material. Solitary witches since the 1980s have used the name for their own personal grimoire. The older idea of a practitioner’s handwritten book of charms, recipes and remedies is ancient: medieval leechbooks, cunning-folk notebooks and household receipt books are all ancestors.',
    sources: [
      'Hutton, The Triumph of the Moon (on the Book of Shadows)',
      'Davies, Grimoires: A History of Magic Books (on cunning-folk books)',
      'Bald’s Leechbook (10th century)',
    ],
  },
  {
    id: 'kitchen-solitary-self-love-mirror',
    title: 'Self-Love Mirror Ritual',
    kind: 'ritual',
    summary:
      'Sit before a mirror by candlelight with rose and rose quartz, and practise seeing yourself with the warmth you would give a dear friend.',
    intention: 'love',
    alsoFor: ['healing', 'courage', 'peace'],
    practices: ['solitary', 'crystal'],
    paths: [],
    moon: ['waxing', 'full'],
    weekday: 5,
    minutes: 30,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A mirror you can sit in front of' },
      { name: 'A pink candle', ref: 'traditional/candle/pink' },
      { name: 'A rose quartz', ref: 'traditional/crystal/rose_quartz' },
      { name: 'A handful of rose petals (fresh or dried)', ref: 'traditional/herb/rose' },
      { name: 'A small dish', ref: 'traditional/vessel/dish' },
      { name: 'A body oil or plain almond or olive oil', optional: true },
    ],
    preparation:
      'Clean the mirror. Take a bath or shower beforehand if you can and put on something comfortable. Write down three things you like about yourself in advance; it is often hard to think of them on the spot. Friday, Venus’s day, is traditional.',
    steps: [
      {
        title: 'Set the scene',
        light: true,
        instructions:
          'Put the candle beside the mirror, not in front of it, so the light falls on your face. Scatter the rose petals in the dish. Light the candle.',
      },
      {
        title: 'Look softly',
        instructions:
          'Sit and look at your reflection. Don’t inspect; just look, the way you would look at someone you love who has had a long day. Notice the urge to criticise and let it pass.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Hold the stone',
        instructions:
          'Hold the rose quartz to your heart. Breathe into the place under your hands.',
        spoken: 'I see you. You are doing your best. You are worth tenderness.',
      },
      {
        title: 'Speak three truths',
        instructions:
          'Meet your own eyes and say the three things you wrote down, beginning each with your name. It may feel strange; that is fine.',
        minutes: 3,
      },
      {
        title: 'Anoint with care',
        instructions:
          'If using oil, warm a little in your palms and smooth it onto your hands, wrists and collarbones, slowly, as an act of care.',
      },
      {
        title: 'The promise',
        instructions:
          'Make one small, specific promise to yourself for the coming week: rest, a walk, saying no to something.',
        spoken: 'I promise to be on my own side.',
      },
      {
        title: 'Close',
        snuff: true,
        instructions:
          'Smile at your reflection, even a little. Snuff the candle.',
      },
    ],
    closing:
      'Keep the rose quartz somewhere you will see it daily, and dry the petals to add to a bath later. Repeat on a Friday whenever you need it.',
    safety:
      'Keep the candle away from hair, clothing and the mirror frame. Patch-test any oil and avoid nut oils if you have a nut allergy; do not use undiluted essential oils on skin. If this brings up overwhelming feelings, stop gently and consider reaching out to someone you trust or a professional.',
    lore:
      'Mirrors have long been tools of divination and folklore, from the scrying mirrors of the Renaissance to Halloween mirror-gazing customs. Rose and rose quartz as stones and flowers of love belong to modern correspondence lists (rose to Aphrodite and Venus is ancient). Self-love mirror work itself is a modern practice that came out of the 1980s self-help movement and was taken into contemporary witchcraft.',
    sources: [
      'Bion of Smyrna, Lament for Adonis (on the rose and Aphrodite)',
      'Opie and Tatem, A Dictionary of Superstitions (on mirrors)',
    ],
  },
  {
    id: 'kitchen-solitary-birthday-new-year',
    title: 'Birthday Rite: Your Personal New Year',
    kind: 'ritual',
    summary:
      'On or near your birthday, the sun’s return to where it stood when you were born, look back at the year you are closing and set the tone for the one opening.',
    intention: 'beginnings',
    alsoFor: ['prosperity', 'intuition', 'courage'],
    practices: ['solitary', 'cosmic'],
    paths: [],
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A gold or yellow candle', ref: 'traditional/candle/gold' },
      { name: 'Your journal', ref: 'traditional/tool/book_of_shadows' },
      { name: 'A small cake or sweet treat' },
      { name: 'A tarot or oracle deck', ref: 'traditional/tool/tarot_deck', optional: true },
      { name: 'An envelope, paper and pen' },
      { name: 'A sunstone or citrine', ref: 'traditional/crystal/sunstone', optional: true },
    ],
    preparation:
      'If you like astrology, look up the exact time of your solar return (when the sun reaches its birth position again; it can fall a day either side of your birthday). Otherwise use your birthday evening. Find last year’s letter to yourself if you wrote one.',
    steps: [
      {
        title: 'Light your sun',
        light: true,
        instructions:
          'Light the gold candle. It stands for your own sun, returned to its place.',
        spoken: 'Once more around the sun. I am here, and I am still becoming.',
      },
      {
        title: 'Look back',
        instructions:
          'Write about the year that is ending: what you are proud of, what hurt, what surprised you, who mattered. If you have last year’s letter, open and read it now.',
        minutes: 15,
      },
      {
        title: 'Release the old year',
        instructions:
          'Name aloud one thing from the past year you are leaving behind.',
        spoken: 'I thank you, old year, and I let you go.',
      },
      {
        title: 'Read the year ahead',
        instructions:
          'If using a deck, draw three cards: the gift of the year ahead, the challenge, and the advice. Or sit quietly and ask what the coming year wants from you. Write what comes.',
        minutes: 10,
      },
      {
        title: 'Write to your future self',
        instructions:
          'Write a letter to yourself to open next birthday: your hopes, a few intentions, what you want to remember. Seal it in the envelope and write next year’s date on it.',
        minutes: 15,
      },
      {
        title: 'Eat the cake',
        instructions:
          'Make one wish over the cake, then eat it slowly by the candle. Sweetness at a beginning is an old charm.',
      },
      {
        title: 'Close',
        snuff: true,
        instructions:
          'Snuff the candle rather than blowing it out, so the wish stays.',
        spoken: 'Welcome, new year of my life.',
      },
    ],
    closing:
      'Put the letter somewhere safe where you will find it next year. Carry the sunstone or citrine through your first month.',
    safety:
      'Never leave the candle unattended. Mind any allergies in your treat (gluten, dairy, eggs, nuts).',
    lore:
      'Birthday celebrations with cake and candles have roots in Greek offerings of round cakes with candles to Artemis and in German Kinderfeste of the late 1700s. The solar return chart, cast for the sun’s return to its natal degree, is a technique of Hellenistic and medieval Arabic astrology. Treating the birthday as a personal new year with reflection and letter-writing is a modern practice.',
    sources: [
      'Abu Ma’shar, On the Revolutions of the Years of Nativities (9th century)',
      'Philochorus, fragment on cakes offered to Artemis (via Athenaeus)',
    ],
  },
  {
    id: 'kitchen-solitary-grounding-centering',
    title: 'Grounding and Centering Basics',
    kind: 'ritual',
    summary:
      'The foundation of every working: root down like a tree, draw up steady earth energy, find your still centre, and release what is excess. Ten minutes, anywhere.',
    intention: 'peace',
    alsoFor: ['protection', 'healing', 'courage'],
    practices: ['solitary', 'elemental', 'green'],
    paths: [],
    minutes: 12,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A place to sit or stand, ideally barefoot on earth or grass' },
      { name: 'A grounding stone to hold', ref: 'traditional/crystal/hematite', optional: true },
      { name: 'A glass of water and a small snack for afterwards' },
    ],
    preparation:
      'Find somewhere you won’t be disturbed. Outdoors on the earth is lovely, but a chair with your feet flat on the floor works just as well. Do this before any ritual or spell, after an upsetting day, or whenever you feel scattered.',
    steps: [
      {
        title: 'Settle',
        instructions:
          'Sit or stand with your spine tall and feet flat. Close your eyes or soften your gaze. Breathe in for four counts, out for six, five times.',
        minutes: 1,
        timed: true,
      },
      {
        title: 'Send down roots',
        instructions:
          'Picture roots growing from the soles of your feet (and the base of your spine if sitting), down through the floor, the foundations, the soil, the rock, deep into the earth. Feel their weight anchoring you.',
        minutes: 2,
        timed: true,
      },
      {
        title: 'Draw up the earth',
        instructions:
          'With each in-breath, imagine drawing steady, cool earth energy up through the roots into your body, like a tree drawing water. Let it fill your legs, belly, chest, arms and head.',
        minutes: 2,
        timed: true,
      },
      {
        title: 'Reach to the sky',
        instructions:
          'Now imagine branches reaching up from the crown of your head toward the sun or the stars, and bright, warm light falling down into you, meeting the earth energy in your heart.',
        minutes: 2,
        timed: true,
      },
      {
        title: 'Find the centre',
        instructions:
          'Bring your attention to a point just below your navel or in your heart, wherever feels steady. Sense all of you gathered there, calm and upright like a candle flame in still air.',
        spoken: 'Rooted below, open above, steady in the middle.',
        minutes: 2,
      },
      {
        title: 'Release the excess',
        instructions:
          'Place your palms flat on the floor or ground and let any extra buzzing, anxious energy drain out through your hands into the earth, which can always take it.',
        minutes: 1,
      },
      {
        title: 'Return',
        instructions:
          'Wiggle your fingers and toes, open your eyes, and drink the water. Eat something small if you feel light-headed.',
      },
    ],
    closing:
      'Notice how you feel compared to when you began. The more often you practise, the faster it works; eventually a single breath and the thought of roots will be enough.',
    safety:
      'If you feel dizzy, open your eyes and breathe normally. Check outdoor ground for glass, stings or sharp stones before going barefoot.',
    lore:
      'Grounding and centering as named techniques come from twentieth-century Western esotericism and were popularised in modern Paganism in the 1970s and 1980s, especially through the “Tree of Life” meditation familiar from modern witchcraft teaching. The image of the human as a tree between earth and sky is much older, echoed in the world-tree Yggdrasil of the Poetic Edda.',
    sources: [
      'The Poetic Edda, Völuspá (Bellows, 1923), on Yggdrasil',
      'Hutton, The Triumph of the Moon (on modern Pagan meditation)',
    ],
  },
  {
    id: 'kitchen-solitary-rite-of-passage',
    title: 'Rite of Passage: Crossing a Threshold',
    kind: 'ritual',
    summary:
      'A solitary rite for an ending or transition: a breakup, a move, a new job, a diagnosis, menopause, retirement, an anniversary. Set down a stone for what you leave, cross a threshold, and take up a new one.',
    intention: 'healing',
    alsoFor: ['beginnings', 'courage', 'banishing'],
    practices: ['solitary', 'folk', 'hedge'],
    paths: [],
    moon: ['waning', 'dark', 'new'],
    minutes: 60,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A black or grey candle for the ending', ref: 'traditional/candle/black' },
      { name: 'A white candle for the beginning', ref: 'traditional/candle/white' },
      { name: 'A dark stone for what you are leaving', ref: 'traditional/crystal/smoky_quartz' },
      { name: 'A clear or light stone for what you are entering', ref: 'traditional/crystal/clear_quartz' },
      { name: 'A doorway, gate, or a line laid on the floor with a cord or scarf' },
      { name: 'A bowl of water with a pinch of salt', ref: 'traditional/vessel/bowl' },
      { name: 'Journal and pen', ref: 'traditional/tool/book_of_shadows' },
    ],
    preparation:
      'Write beforehand: what you are leaving (people, roles, a body, a home, a self), what you are grateful for in it, what you grieve, and what you hope for on the other side. Place the black candle and dark stone on one side of the doorway or line, and the white candle and clear stone on the other.',
    steps: [
      {
        title: 'Stand in what was',
        light: true,
        instructions:
          'Stand on the “before” side and light the black candle. Read what you wrote about what you are leaving. Let feelings come; this is the part most of us skip.',
        minutes: 8,
      },
      {
        title: 'Honour it',
        instructions:
          'Hold the dark stone. Thank this chapter for what it gave you, even if it was hard.',
        spoken: 'You were part of my life. I honour you, and I am ready to let you go.',
      },
      {
        title: 'Set it down',
        instructions:
          'Lay the dark stone on the floor at the threshold. Wash your hands in the salt water and dry them.',
      },
      {
        title: 'Stand in between',
        instructions:
          'Step onto the threshold itself, the place that is neither here nor there, and stay a while. In-between times are uncomfortable and sacred. Notice how it feels not to know yet.',
        minutes: 5,
        timed: true,
      },
      {
        title: 'Cross',
        instructions:
          'When you are ready, step over firmly onto the “after” side. Light the white candle from the black one before you turn away.',
        spoken: 'I cross. I carry what is mine, and leave what is not.',
      },
      {
        title: 'Take up the new',
        instructions:
          'Pick up the clear stone and hold it to your heart. Read what you hope for. Say your name, as you are now.',
        minutes: 5,
      },
      {
        title: 'Close',
        snuff: true,
        instructions:
          'Snuff the black candle first, then the white. Sit for a moment on the new side.',
        spoken: 'It is done, and it is begun.',
      },
    ],
    closing:
      'Bury the dark stone, drop it into running water from a safe bank, or give it back to the earth somewhere meaningful. Keep the clear stone with you through the first months of the new chapter. Burn the white candle again on milestones.',
    safety:
      'Never leave candles unattended and keep them clear of the cord or scarf. If returning a stone to a river, stay on safe ground well away from fast or deep water. Some transitions bring up grief that is too much to hold alone; reach out to people you trust or a professional.',
    lore:
      'The anthropologist Arnold van Gennep described rites of passage in 1909 as three stages: separation, a liminal threshold, and incorporation; this rite follows that shape. Thresholds as sacred, dangerous in-between places run through European folklore, from Roman Janus to the custom of carrying a bride over the doorstep. Self-made solitary rites for personal transitions are a modern practice, filling a gap where many people no longer have communal ceremonies for such moments.',
    sources: [
      'Van Gennep, Les rites de passage (1909)',
      'Ovid, Fasti 1 (on Janus and doorways)',
    ],
  },
];
