import type { Premade } from '../types';

// Hedge witch and sea witch workings: liminal journeys, spirit and ancestor
// work, divination, and the tides, shores and waters.

export const HEDGE: Premade[] = [
  // ───────────────────────────── HEDGE ─────────────────────────────
  {
    id: 'hedge-inner-landscape-journey',
    title: 'Journey to the Inner Landscape',
    kind: 'ritual',
    summary:
      'A guided journey with timed steps. You cross a hedge in your mind’s eye, walk a landscape that belongs to you, and come back with one image to keep. It is a gentle first step into hedge-crossing.',
    intention: 'intuition',
    alsoFor: ['peace', 'study'],
    practices: ['hedge', 'solitary'],
    paths: [],
    moon: ['full', 'waxing'],
    minutes: 40,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A comfortable place to sit or lie down' },
      { name: 'A blanket' },
      { name: 'A notebook and pen' },
      { name: 'A glass of water and something small to eat afterwards' },
      { name: 'A sprig of mugwort or lavender to hold or keep nearby (not to eat)', ref: 'traditional/herb/lavender', optional: true },
      { name: 'A drum or rattle recording, slow and steady', optional: true },
    ],
    preparation:
      'Choose a time when nobody will need you for an hour, and silence your phone apart from the timer. Dim the lights. If you use a drumming track, keep the volume low. Have water and a snack waiting for when you come back: eating is the oldest way to close a journey.',
    steps: [
      {
        title: 'Settle the body',
        instructions:
          'Sit or lie down with the blanket over you. Let your hands rest open. Breathe in for four counts and out for six, and feel the floor or the bed take your weight. Notice three sounds in the room and then let them fade into the background.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Find the hedge',
        instructions:
          'In your mind’s eye, stand in a lane at dusk. In front of you is a tall, old hedge of hawthorn, holly and briar. Look along it until you find a gap, a stile or a low arch of branches. Notice what it is made of, the smell of the leaves and the feel of the ground under your feet.',
        spoken: 'Hedge of thorn and hedge of holly, let me through and let me home.',
        minutes: 4,
        timed: true,
      },
      {
        title: 'Cross over',
        instructions:
          'Step through the gap slowly. Feel the branches brush your shoulders. On the other side is a landscape that is yours alone: it may be a moor, a shore, a wood, a garden or something you have no word for. Don’t try to steer it. Just stand and look.',
        minutes: 4,
        timed: true,
      },
      {
        title: 'Walk the land',
        instructions:
          'Walk a little way and use every sense. What is the weather? What grows here? Is there water? If you meet an animal, a person or a presence, greet it politely and ask it nothing yet. If anything feels wrong, simply turn back to the hedge; you are always free to leave.',
        minutes: 8,
        timed: true,
      },
      {
        title: 'Ask for one gift',
        instructions:
          'Find a place to stop: a stone, a tree or the water’s edge. Ask quietly whether there is something for you to bring back. Accept whatever comes, even if it is only a colour, a word or a feeling. Give thanks out loud in your mind.',
        spoken: 'I came as a guest and I leave as a guest. Thank you for what you have shown me.',
        minutes: 5,
        timed: true,
      },
      {
        title: 'Return through the hedge',
        instructions:
          'Walk back the way you came, the same path and not a shortcut. Step through the gap and into the lane. Feel the blanket again, the weight of your body and the air in the room. Wiggle your fingers and toes before you open your eyes.',
        minutes: 4,
        timed: true,
      },
      {
        title: 'Ground and record',
        instructions:
          'Drink the water and eat something. Then write down everything you remember before it fades: the landscape, the weather, the gift and anything you met. Don’t interpret it yet. Read it back in a week and see what it says to you.',
        minutes: 8,
      },
    ],
    closing:
      'Press your palms flat on the floor for a moment and say your own name aloud. You are back. The landscape will be there next time, and it often grows more detailed with each visit.',
    safety:
      'Journeying is not suitable during a mental-health crisis, or if you are prone to dissociation or psychosis, without support from a professional. Open your eyes whenever you need to. Don’t journey while driving or in the bath. If you hold mugwort, don’t eat it; avoid it if you are pregnant or have a ragweed or daisy-family allergy, and keep it from pets.',
    lore:
      'The “hedge” in hedge witchery is the boundary between the village and the wild, and between this world and the other. Old Norse texts speak of túnriður, “fence-riders” or witches who rode the boundary, and Odin in the Hávamál boasts of a charm to send such riders astray. The guided inner-landscape journey is modern. It draws on mid-twentieth-century visualisation, on Rae Beth’s *Hedge Witch* (1990), and on core-shamanism workshops, rather than on any single ancient rite.',
    sources: [
      'Hávamál, st. 155, in The Poetic Edda, trans. Bellows (1923)',
      'Etymological scholarship on Old English haga, “hedge, enclosure”, and Old Norse túnriða',
      'Rae Beth, Hedge Witch (1990), on the modern use of the term',
    ],
  },
  {
    id: 'hedge-dream-pillow',
    title: 'Mugwort Dream Pillow & Dream Journal',
    kind: 'spell',
    summary:
      'Sew a small sachet of mugwort and lavender to slip inside your pillowcase, and begin a dream journal beside the bed. Mugwort is the old “dream herb”, and here it is used only for its scent.',
    intention: 'intuition',
    alsoFor: ['peace', 'study'],
    practices: ['hedge', 'green', 'solitary'],
    paths: [],
    moon: ['full', 'waxing'],
    weekday: 1,
    minutes: 45,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'Two tablespoons of dried mugwort', ref: 'traditional/herb/mugwort' },
      { name: 'Two tablespoons of dried lavender buds', ref: 'traditional/herb/lavender' },
      { name: 'A tablespoon of dried chamomile flowers', ref: 'traditional/herb/chamomile', optional: true },
      { name: 'A few dried rose petals', ref: 'traditional/herb/rose', optional: true },
      { name: 'A square of cotton or linen, about 15 cm (6 in), folded in half, or a small drawstring bag' },
      { name: 'Needle and thread' },
      { name: 'A notebook kept only for dreams' },
      { name: 'A small moonstone to rest on the journal', ref: 'traditional/crystal/moonstone', optional: true },
    ],
    preparation:
      'Work on a Monday, the moon’s day, or on the evening of the full moon. Clear a table and wash your hands. Crumble the herbs together in a bowl and breathe in the scent. Mugwort is green and bitter, lavender sweet and clean.',
    steps: [
      {
        title: 'Bless the herbs',
        instructions:
          'Hold your hands over the bowl. Name each herb as you stir it with your fingers, and say what you are asking of it: mugwort for true dreams, lavender for calm sleep, chamomile for rest, rose for kindness in what you see.',
        spoken: 'Mugwort, mother of dreams, open the night. Lavender, keep it gentle. Let me see clearly and wake well.',
        minutes: 3,
      },
      {
        title: 'Sew the sachet',
        instructions:
          'Fold the cloth and sew up two sides with small stitches. Spoon in the herbs, filling the pouch loosely. If you like, slip in a slip of paper with a question you want your dreams to answer. Sew the last side closed. With each stitch, think of a door closing softly behind you.',
        minutes: 20,
      },
      {
        title: 'Prepare the journal',
        instructions:
          'Write the date on the first page of the notebook and, below it, one line: what you hope your dreams will show you. Leave a pen in the notebook so you can write before you are fully awake. Rest the moonstone on top if you have one.',
        minutes: 5,
      },
      {
        title: 'Place the pillow',
        instructions:
          'Tuck the sachet inside your pillowcase, under the pillow or beside it, not against your face. Put the journal where your hand will find it in the dark.',
        spoken: 'Under my head, the green road. Beside my hand, the remembering.',
      },
      {
        title: 'On waking',
        instructions:
          'Before you move or check your phone, lie still and let the dream come back. Write down anything: an image, a colour, a feeling, even “nothing.” Writing every morning, including on the empty ones, is what trains dream recall. Do this for at least one moon cycle.',
        minutes: 5,
      },
    ],
    closing:
      'Squeeze the sachet gently each night to wake its scent. Refresh the herbs every month or two, and return the old ones to the earth or the compost.',
    safety:
      'Mugwort is for scent only here: never eat it, brew it or smoke it as part of this working. Avoid mugwort completely if you are pregnant, trying to conceive or breastfeeding. It can cause allergic reactions in people sensitive to ragweed, chrysanthemums or other daisy-family plants. Keep the sachet away from children and pets, especially cats and dogs who might chew it. If it gives you unsettled sleep or headaches, swap it for a lavender-and-chamomile sachet.',
    lore:
      'Mugwort (Artemisia vulgaris) is the first of the herbs in the Old English Nine Herbs Charm, where it is called the “oldest of plants.” Medieval herbals praised it as a protector of travellers. Its use as a dream herb, tucked under the pillow for vivid or prophetic dreams, is recorded in British and European folk practice and is now very widespread in modern witchcraft. Herbal dream pillows were also a popular Victorian remedy for sleeplessness.',
    sources: [
      'The Nine Herbs Charm, Lacnunga (Old English, c. 10th–11th century)',
      'Grieve, A Modern Herbal (1931), on mugwort and lavender',
    ],
  },
  {
    id: 'hedge-crossroads-choice',
    title: 'Crossroads Working for a Choice',
    kind: 'ritual',
    summary:
      'Stand where three or four ways meet, at a place that is safe and legal, and ask the crossroads for courage and clarity when you face a choice. Leave nothing behind but your thanks and a little water.',
    intention: 'courage',
    alsoFor: ['beginnings', 'intuition'],
    practices: ['hedge', 'folk', 'solitary'],
    paths: [],
    moon: ['dark', 'new'],
    holidays: ['deipnon'],
    minutes: 30,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A key, carried in your pocket', ref: 'traditional/tool/key' },
      { name: 'A small bottle of plain water for the offering' },
      { name: 'A slip of paper with your choice written as a question' },
      { name: 'A torch or headlamp' },
      { name: 'A friend who knows where you are' },
    ],
    preparation:
      'Pick your crossroads by daylight first. A footpath junction, a meeting of farm tracks or a fork in a park path is ideal. Choose public land where you are allowed to be, away from traffic, and never on private property. Write your choice as a plain question, such as “Should I take the job in the north?” Tell someone where you are going and when you’ll be back.',
    steps: [
      {
        title: 'Approach in silence',
        instructions:
          'Walk the last stretch without speaking or looking at your phone. Notice the change in sound and air as you near the place where the ways meet. Stand in the centre only if it is safe; otherwise, stand at the edge facing it.',
        minutes: 3,
      },
      {
        title: 'Greet the place',
        instructions:
          'Hold the key in your hand. Turn slowly to face each road in turn, and greet it with a nod as if it were a person.',
        spoken: 'Road that comes and road that goes, road that I have not yet walked: I greet you. I am at the meeting of the ways.',
      },
      {
        title: 'Speak the choice',
        instructions:
          'Read your question aloud, quietly. Then, for each option, face one of the roads and imagine walking down it a year from now. Notice what your body does: whether your shoulders drop or tighten, and whether your breath comes freely.',
        minutes: 8,
      },
      {
        title: 'Listen',
        instructions:
          'Stand still with your eyes half-closed. Let the crossroads answer in its own way: a sound, a gust of wind, a bird, a passing thought that surprises you. You don’t have to understand it now. Simply remember it.',
        minutes: 5,
        timed: true,
      },
      {
        title: 'Give the offering',
        instructions:
          'Pour the water onto the ground at the edge of the junction, not on a path where it will make anyone slip. Water is the cleanest offering and leaves no trace.',
        spoken: 'For the keeper of the ways, with thanks. Whatever road I take, let me take it bravely.',
      },
      {
        title: 'Leave without looking back',
        instructions:
          'Pocket the key and the paper and walk away. By old custom you don’t look back over your shoulder. At home, write down what you noticed at each road.',
      },
    ],
    closing:
      'Sleep on what you noticed. Over the next three days, watch for the road that keeps coming back to you. Keep the key on your altar until the choice is made.',
    safety:
      'Go only to places that are public, legal and well away from traffic. Avoid working after dark alone. If you go at dusk, take a light, wear something visible, and make sure someone knows where you are. Leave no candles, food or litter at the crossroads: water only.',
    lore:
      'Crossroads are liminal places in many open European folk traditions. The Greeks set suppers for Hekate at three-way junctions at the dark of the moon (the Deipnon). Across Britain and Germany, crossroads were where suicides and the executed were buried, where ghosts walked and where charms were worked. Norse sources describe útiseta, “sitting out” at night to seek knowledge. This rite is modern and draws on that general lore. It does not use the specific crossroads practices of Hoodoo or other closed traditions.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), on crossroads customs',
      'Grimm, Teutonic Mythology (trans. Stallybrass, 1880–88), on crossroads and night-sitting',
      'Scholarship on the Hekate Deipnon in classical Athens',
    ],
  },
  {
    id: 'hedge-ancestor-candle-evening',
    title: 'Ancestor Altar & Candle Evening',
    kind: 'ritual',
    summary:
      'Build a small altar to your beloved dead, light a candle for them and spend an evening in their company with food, stories and their names spoken aloud.',
    intention: null,
    alsoFor: ['healing', 'peace'],
    practices: ['hedge', 'folk', 'solitary'],
    paths: [],
    moon: ['waning', 'dark'],
    holidays: ['samhain', 'samhain_gaelic', 'all_souls', 'dziady', 'parentalia', 'vetrnaetur'],
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A white candle in a sturdy holder', ref: 'traditional/candle/white' },
      { name: 'Photographs, letters or objects that belonged to your ancestors' },
      { name: 'A small dish for an offering of food', ref: 'traditional/vessel/offering_bowl' },
      { name: 'A glass of water' },
      { name: 'A sprig of rosemary, for remembrance', ref: 'traditional/herb/rosemary' },
      { name: 'Something they loved to eat or drink: bread, a biscuit, tea, a small glass of their drink' },
      { name: 'A cloth for the altar' },
    ],
    preparation:
      'Clear a shelf or small table, wipe it clean and lay the cloth. Arrange the photographs and objects. You can honour particular people, or simply “the ones who came before me”, which is helpful if family history is painful or unknown. Prepare their food as you would for a guest.',
    steps: [
      {
        title: 'Open the evening',
        instructions:
          'Stand before the altar. Lay the rosemary across the front of it and place the water beside the candle. Take a breath and think of the long line of people, known and unknown, without whom you would not exist.',
      },
      {
        title: 'Light the candle',
        instructions:
          'Light the white candle and set it where its light falls on the photographs.',
        spoken: 'Here is a light in the window. Here is a place at the table. You who loved me and you I never met: you are welcome here tonight.',
        light: true,
      },
      {
        title: 'Speak their names',
        instructions:
          'Say aloud the names of those you remember, slowly, one at a time. After each name, pause. If you know only a surname or a place, say that. End with “and all whose names are lost.”',
        minutes: 5,
      },
      {
        title: 'Give the offering',
        instructions:
          'Place the food on the dish and pour a little of their drink. Tell them what it is and why you chose it.',
        spoken: 'Eat with me, drink with me, sit with me awhile.',
      },
      {
        title: 'Sit in their company',
        instructions:
          'Sit with the altar. Tell them, aloud or in a notebook, what has happened in the family this year, what you are proud of and what you would ask their advice on. Then be quiet and notice any memories, songs or phrases that come to mind.',
        minutes: 20,
      },
      {
        title: 'Give thanks and say goodnight',
        instructions:
          'Thank them for coming. Snuff the candle rather than blowing it out, and leave the food on the altar overnight.',
        spoken: 'Go gently home. I carry you with me. Until the next light.',
        snuff: true,
      },
    ],
    closing:
      'In the morning, put the food outside for the birds or bury it in the garden, rather than eating it or throwing it in the bin. Pour the water onto a plant. Keep a corner of the altar for them all year if you like.',
    safety:
      'Never leave the candle unattended, and keep it clear of photographs, paper and dried rosemary. Keep it away from pets and children. Grief can surface strongly: be gentle with yourself and stop whenever you need to. If you are struggling, reach out to someone you trust or a bereavement service.',
    lore:
      'Honouring the household dead is one of the oldest and most widespread human customs. Romans visited family tombs at the Parentalia in February. The Slavic Dziady (“Grandfathers”) laid food for the ancestors. In Ireland and Britain, food and a lit window were left for the dead at Samhain and All Souls’ Night, and Norse households held the Álfablót and Dísablót in autumn. The modern Pagan ancestor altar draws on all these, and is open to anyone.',
    sources: [
      'Hutton, The Stations of the Sun (1996), on Samhain and All Souls customs',
      'Ovid, Fasti, Book II, on the Parentalia',
      'Ethnographic scholarship on the Slavic Dziady',
    ],
  },
  {
    id: 'hedge-house-spirit-offering',
    title: 'Offering to the House Spirit',
    kind: 'ritual',
    summary:
      'Leave a small bowl of buttered porridge, bread or milk by the hearth or stove for the spirit who keeps your home, as householders across northern Europe once did for the brownie, the nisse and the domovoi.',
    intention: 'prosperity',
    alsoFor: ['protection', 'peace'],
    practices: ['folk', 'kitchen', 'hedge'],
    paths: [],
    moon: ['full', 'new'],
    holidays: ['yule', 'jol', 'christmas_eve', 'koliada'],
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A small bowl kept for the house spirit', ref: 'traditional/vessel/offering_bowl' },
      { name: 'A spoonful of porridge with a knob of butter, a piece of fresh bread, or a little milk or cream' },
      { name: 'A small candle or tealight', ref: 'traditional/candle/white', optional: true },
      { name: 'A besom or broom', ref: 'traditional/tool/besom', optional: true },
    ],
    preparation:
      'Tidy the kitchen and sweep the floor first: in every tradition, house spirits love a well-kept house and are offended by a slovenly one. Make the porridge or warm the milk as you would for a guest. Choose the spot: the hearth, beside the stove, or a quiet corner of the kitchen.',
    steps: [
      {
        title: 'Sweep toward the door',
        instructions:
          'With the broom, sweep the kitchen floor from the back of the house toward the door, gathering dust and the week’s grumbles with it. Put the dust outside.',
        minutes: 5,
      },
      {
        title: 'Light the hearth',
        instructions:
          'If you have a candle, light it by the stove or hearth. If not, switch on the stove light or a small lamp. The point is a warm, lit heart to the house.',
        light: true,
      },
      {
        title: 'Set down the bowl',
        instructions:
          'Fill the bowl and place the butter in the middle of the porridge so it melts. Set it down in the chosen spot with both hands.',
        spoken: 'Good neighbour of this house, keeper of the hearth and threshold: here is your portion, freely given. Thank you for the luck you keep.',
      },
      {
        title: 'Speak to the house',
        instructions:
          'Stand quietly and say what you are grateful for in this home: warmth, shelter, safe sleep. Ask for one thing for the household in the coming season: peace, good luck or plenty. Speak kindly, the way you would to an old relative.',
        minutes: 5,
      },
      {
        title: 'Leave it overnight',
        instructions:
          'Put out the candle before bed and leave the offering where it is. Don’t thank the spirit with clothes or say “you’re welcome to it”: folklore says brownies leave if given clothes, and some take offence at being paid.',
        snuff: true,
      },
    ],
    closing:
      'In the morning, put the offering outside for the birds or onto the compost, and wash the bowl. Repeat on the full or new moon, at Yule, or whenever the house feels unsettled.',
    safety:
      'Never leave a candle burning unattended or overnight. Keep offerings out of reach of pets, and don’t leave food out where it will draw mice. Dairy and porridge go off quickly, so clear the bowl in the morning.',
    lore:
      'House spirits appear across northern Europe: the brownie of Scotland and northern England, the Manx fenodyree, the Scandinavian nisse or tomte, and the Slavic domovoi. Each was fed with a little porridge, milk or bread. Norwegian families still leave a bowl of rice porridge with butter for the nisse on Christmas Eve. Scottish lore warns that a brownie who is given clothes will leave the house for good. This is living folk custom, open to anyone who keeps a home.',
    sources: [
      'Keightley, The Fairy Mythology (1828, rev. 1850), on brownies and nisser',
      'Afanasyev, Poetic Views of the Slavs on Nature (1865–69), on the domovoi',
      'Scott, Letters on Demonology and Witchcraft (1830), on the brownie',
    ],
  },
  {
    id: 'hedge-tea-leaf-reading',
    title: 'Reading the Tea Leaves',
    kind: 'ritual',
    summary:
      'Brew loose-leaf tea, drink it slowly with a question in mind, then turn the cup and read the shapes the leaves leave behind, in the old way of the Highland tea-cup readers.',
    intention: 'intuition',
    alsoFor: ['study'],
    practices: ['kitchen', 'hedge', 'folk', 'solitary'],
    paths: [],
    moon: ['full', 'waxing'],
    minutes: 30,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A teaspoon of loose-leaf black tea, preferably a broken-leaf grade such as an Assam or English Breakfast' },
      { name: 'A wide, plain, light-coloured teacup with a handle, and its saucer' },
      { name: 'A teapot, or a jug and a spoon' },
      { name: 'Freshly boiled water' },
      { name: 'Milk or sugar, if you like' },
      { name: 'A notebook' },
    ],
    preparation:
      'Use ordinary drinking tea from the kitchen, never an herbal blend you are unsure of. Choose a wide cup with a white inside, since tall mugs don’t work. Settle on one clear question, or simply ask “What do I need to know this month?”',
    steps: [
      {
        title: 'Brew without a strainer',
        instructions:
          'Put the tea in the pot or straight into the cup, pour on the water and let it steep for three or four minutes. Pour it into the cup without straining, so the leaves come too.',
        minutes: 4,
      },
      {
        title: 'Drink with the question',
        instructions:
          'Let it cool until it is comfortable to drink. Hold the cup in both hands and drink slowly, thinking of your question. Stop when about a teaspoon of liquid is left with the leaves.',
        minutes: 10,
      },
      {
        title: 'Swirl and turn',
        instructions:
          'Take the cup by the handle in your left hand. Swirl it three times anticlockwise so the leaves climb the sides. Then turn it upside down onto the saucer and leave it to drain for a minute.',
        spoken: 'Three times round, the leaves are found. Show me what is coming.',
        minutes: 1,
      },
      {
        title: 'Read the cup',
        instructions:
          'Turn the cup upright with the handle pointing toward you: the handle is you and your home. Leaves near the rim show what is near in time, those lower down show what is further off, and the bottom shows the distant future. Look for shapes: a bird, a ring, a ladder, a letter, a path. Name what you see before you look anything up.',
        minutes: 10,
      },
      {
        title: 'Write it down',
        instructions:
          'Sketch the main shapes and note where they sit. Write what each means to you first, then compare it with the traditional meanings if you like: a ring for a union or completion, a bird for news, a ladder for rising, a snake for caution.',
        minutes: 5,
      },
    ],
    closing:
      'Rinse the leaves onto the garden or a houseplant and wash the cup. Return to your notes at the next full moon to see what came true.',
    safety:
      'Use only food-safe tea, and let it cool before drinking. Take care with boiling water, especially around children. If you are sensitive to caffeine or pregnant, use a decaffeinated loose-leaf tea and keep to one cup.',
    lore:
      'Reading tea leaves (tasseography) grew out of older European cup-reading with wine lees and coffee grounds, and became popular in Britain and Ireland once tea was cheap in the eighteenth and nineteenth centuries. The handle-as-querent and rim-as-near-future method was set down in a popular 1920s guide credited to “A Highland Seer.” It is a folk custom of kitchens and parlours, with no secret lineage, and is open to everyone.',
    sources: [
      '“A Highland Seer”, Tea-Cup Reading and the Art of Fortune-Telling by Tea Leaves (c. 1920)',
    ],
  },
  {
    id: 'hedge-dark-bowl-scrying',
    title: 'Scrying in a Dark Bowl of Water',
    kind: 'ritual',
    summary:
      'Fill a dark bowl with water, set a candle behind you and soften your gaze on the surface until images, colours or impressions rise. This is one of the oldest and simplest forms of divination.',
    intention: 'intuition',
    alsoFor: ['study'],
    practices: ['hedge', 'elemental', 'solitary'],
    paths: [],
    moon: ['full', 'dark'],
    weekday: 1,
    minutes: 35,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A dark or black bowl, or a cauldron', ref: 'traditional/vessel/bowl' },
      { name: 'Water, ideally rain or spring water' },
      { name: 'A silver or white candle', ref: 'traditional/candle/silver' },
      { name: 'A pinch of mugwort or a few bay leaves to rest beside the bowl (not to burn or eat)', ref: 'traditional/herb/bay', optional: true },
      { name: 'A notebook' },
    ],
    preparation:
      'Darken the room. Place the bowl on a table in front of you and fill it nearly to the rim. Put the candle behind you or to one side, so its light doesn’t reflect directly in the water: you want a dark, glossy surface, not a bright point. Decide on a question, or simply open to what comes.',
    steps: [
      {
        title: 'Light and settle',
        instructions:
          'Light the candle and sit comfortably in front of the bowl. Breathe slowly and let your eyes relax.',
        light: true,
        minutes: 3,
      },
      {
        title: 'Charge the water',
        instructions:
          'Hold your hands just above the water, not touching it, and say your question or opening words.',
        spoken: 'Water dark and water deep, wake from your sleep. What lies beneath, rise and be seen.',
      },
      {
        title: 'Soften the gaze',
        instructions:
          'Look into the water, not at the surface but through it, as if into a deep well. Let your eyes go slightly out of focus. Blink normally. At first you’ll see only reflections. Be patient: mist, colour, movement or flickering shapes often come after several minutes.',
        minutes: 15,
        timed: true,
      },
      {
        title: 'Note what rises',
        instructions:
          'Without looking away for long, jot down what you notice: images, colours, words that come to mind, memories, feelings. Then return to the water. If nothing comes, that is common at first; the practice itself trains the eye.',
        minutes: 5,
      },
      {
        title: 'Close the water',
        instructions:
          'Pass your hand over the water once to break the surface, and look away.',
        spoken: 'Thank you. The water sleeps again.',
      },
      {
        title: 'Snuff and ground',
        instructions:
          'Snuff the candle, turn on a light and drink a glass of fresh water. Pour the scrying water onto the earth or down an outside drain, never back into a drinking glass.',
        snuff: true,
      },
    ],
    closing:
      'Read your notes the next day. Scrying images are usually symbolic, like dreams: treat them as invitations to reflect, not fixed predictions.',
    safety:
      'Keep the candle stable and away from loose hair, sleeves and paper, and never leave it unattended. Don’t drink the scrying water. If you rest mugwort beside the bowl, don’t burn or eat it; avoid it if you are pregnant and keep it away from pets. Stop if you feel dizzy or unsettled.',
    lore:
      'Bowl divination (lekanomancy) is described in the Greek Magical Papyri, where a bowl of water and oil is gazed into to receive visions. Scrying in water, mirrors and dark stones runs through European folk magic, from Nostradamus’s brass bowl of water to Dr John Dee’s obsidian mirror. Scottish and Irish girls looked into wells and pools at Halloween to see future sweethearts. The modern hedge witch’s dark bowl is a direct descendant of all these.',
    sources: [
      'The Greek Magical Papyri (PGM IV), on bowl divination',
      'Hutton, The Stations of the Sun (1996), on Halloween divination',
    ],
  },
  {
    id: 'hedge-warding-before-spirit-work',
    title: 'Warding the Self Before Spirit Work',
    kind: 'spell',
    summary:
      'A short protective rite to do before any journeying, divination or ancestor work. You ring yourself with salt and iron, take a sprig of rowan, and fix a clear boundary around your body and space.',
    intention: 'protection',
    alsoFor: ['courage', 'cleansing'],
    practices: ['hedge', 'folk', 'solitary'],
    paths: [],
    moon: ['new', 'waxing', 'full', 'waning', 'dark'],
    weekday: 6,
    minutes: 15,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A small bowl of salt' },
      { name: 'An iron key or iron nail', ref: 'traditional/tool/key' },
      { name: 'A sprig of rowan with red thread tied around it, or a few rowan berries', ref: 'traditional/herb/rowan' },
      { name: 'A bowl of water', ref: 'traditional/vessel/bowl' },
      { name: 'A small piece of black tourmaline or jet to hold', ref: 'traditional/crystal/black_tourmaline', optional: true },
    ],
    preparation:
      'Do this before the spirit work itself, in the same room. Tidy the space first, and open a window for a moment to change the air. Have everything for your main working ready, so you won’t need to leave the warded space.',
    steps: [
      {
        title: 'Salt the water',
        instructions:
          'Drop three pinches of salt into the bowl of water and stir it clockwise with your finger.',
        spoken: 'Salt of the sea and salt of the earth, keep what is mine and turn back what is not.',
      },
      {
        title: 'Mark the body',
        instructions:
          'Dip your fingers in the salt water and touch your forehead, your throat, your breastbone and the back of each hand. With each touch, picture a small door closing and locking.',
        spoken: 'Brow and throat and heart and hand: no one passes but by my leave.',
        minutes: 2,
      },
      {
        title: 'Walk the boundary',
        instructions:
          'Carry the iron key and walk once clockwise around the edge of the space where you will work, holding the key out toward the walls. Picture a ring of grey iron closing behind you.',
        minutes: 3,
      },
      {
        title: 'Take up the rowan',
        instructions:
          'Hold the rowan sprig, or put the berries in your pocket. Rowan with red thread is the old charm against anything that would harm or deceive.',
        spoken: 'Rowan tree and red thread, put the witches to their speed.',
      },
      {
        title: 'State your terms',
        instructions:
          'Stand in the centre and say clearly, in your own words, what you welcome and what you do not. For example: “Only those who mean me well may speak with me. I go and come back by my own will.”',
        minutes: 2,
      },
    ],
    closing:
      'Keep the key and rowan within reach during the work. Afterwards, pour the salt water onto the ground outside, wash your hands, and say: “The work is done. The doors are mine again.”',
    safety:
      'Rowan berries are mildly toxic raw and should not be eaten; keep them away from small children and pets. Salt water can sting broken skin. Wash your hands after handling the berries.',
    lore:
      'Salt, iron and rowan are the three great protectors of British and Irish folklore. Iron turned away fairies and spirits, salt was thrown over the shoulder and sprinkled on thresholds, and rowan twigs bound with red thread were hung over byres and doors. The rhyme “Rowan tree and red thread / put the witches to their speed” is a traditional Scottish saying recorded in the nineteenth century. Warding before spirit work is modern practice built from these old protections.',
    sources: [
      'Traditional Scottish rhyme, “Rowan tree and red thread” (recorded in nineteenth-century folklore collections)',
      'Frazer, The Golden Bough (1890–1915), on iron and salt as protectors',
      'Gregor, Notes on the Folk-Lore of the North-East of Scotland (1881)',
    ],
  },
  {
    id: 'hedge-dusk-rite',
    title: 'Rite at the Turning of the Light',
    kind: 'ritual',
    summary:
      'Go outside or to a west-facing window at dusk, the in-between hour, and mark the passing of day into night. Set down the day’s burdens and greet the dark with a single candle.',
    intention: 'peace',
    alsoFor: ['cleansing', 'intuition'],
    practices: ['hedge', 'elemental', 'solitary'],
    paths: [],
    moon: ['waning', 'new', 'waxing'],
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A grey or indigo candle in a lantern or jar', ref: 'traditional/candle/grey' },
      { name: 'A small stone picked up during the day' },
      { name: 'A warm layer to wear' },
    ],
    preparation:
      'Look up today’s sunset time and begin ten minutes before it. Go to a garden, balcony, doorstep or window where you can see the western sky. During the day, pick up a small stone and let it be the day’s weight: carry it in your pocket until dusk.',
    steps: [
      {
        title: 'Face the west',
        instructions:
          'Stand facing the setting sun. Don’t look at the sun itself; watch the colour of the sky around it and the light on nearby things. Notice birds settling and the change in the air.',
        minutes: 5,
        timed: true,
      },
      {
        title: 'Set down the day',
        instructions:
          'Take the stone from your pocket and hold it. Let it gather everything from today that you don’t want to carry into the night: worry, a sharp word, unfinished work. Then set it down on the ground or windowsill.',
        spoken: 'The day is done and I am done with it. What was heavy, I put down.',
      },
      {
        title: 'Watch the in-between',
        instructions:
          'After the sun sets, stay for the blue time: the half hour when it is neither day nor night. Colours drain away and shapes become less certain. This is the hedge hour. Stand still and listen.',
        minutes: 10,
        timed: true,
      },
      {
        title: 'Greet the dark',
        instructions:
          'When the first star or the moon appears, or when the light has gone grey, light the candle in its lantern.',
        spoken: 'Welcome, night. Welcome, quiet. Keep me as the day has kept me.',
        light: true,
      },
      {
        title: 'Go in',
        instructions:
          'Carry the lantern inside. Leave the stone where you put it down. Snuff the candle once you are settled indoors.',
        snuff: true,
      },
    ],
    closing:
      'Spend the next hour softly: low light, no screens if you can manage it. Do this rite once a week, or daily during a difficult time.',
    safety:
      'Never look directly at the sun, even at sunset. Use a candle in a lantern or jar outdoors, keep it away from dry grass and leaves, and don’t leave it unattended. Dress warmly and watch your footing as the light fades.',
    lore:
      'Twilight has long been thought of as a dangerous and powerful hour. In British and Irish folklore it was when fairies rode out and the dead walked, and in many old households the evening lighting of the lamp was blessed. Carmina Gadelica records Hebridean prayers for kindling and smooring the fire at day’s end. This rite is modern, but it sits in that long line of honouring the day’s turning.',
    sources: [
      'Carmichael, Carmina Gadelica, vol. I (1900), on evening and hearth blessings',
    ],
  },
  {
    id: 'hedge-hagstone-seeing',
    title: 'Hagstone Seeing & Hanging',
    kind: 'spell',
    summary:
      'Look through a naturally holed stone to see the world differently, as folklore says one may see the hidden folk, then hang it on a red cord by your door or bed as a guardian.',
    intention: 'protection',
    alsoFor: ['intuition'],
    practices: ['hedge', 'folk', 'sea'],
    paths: [],
    moon: ['full', 'waxing'],
    minutes: 30,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A stone with a natural hole right through it, found on a beach or riverbank' },
      { name: 'A length of red cord or wool, about 40 cm (16 in)' },
      { name: 'A bowl of salt water to cleanse it', ref: 'traditional/vessel/bowl' },
    ],
    preparation:
      'Hagstones turn up where flint and soft rock wear away on shingle beaches and in riverbeds. You can’t buy the folklore: the old belief is that a found stone is a gift and a bought one is only a pebble. Rinse it in salt water and let it dry in the sun or moonlight.',
    steps: [
      {
        title: 'Greet the stone',
        instructions:
          'Hold the stone in your palm and turn it over. Feel the edges of the hole: water, sand and time made it. Thank the place where you found it.',
        spoken: 'Stone the sea has opened, stone the river bored: be a window and a door.',
      },
      {
        title: 'Look through',
        instructions:
          'Go outside at dusk or under the full moon, close one eye and look through the hole with the other. Look at a hedge, a tree, the water or the horizon. Move slowly. Notice anything that seems brighter, stiller or different.',
        minutes: 10,
      },
      {
        title: 'Write what you saw',
        instructions:
          'Note what you saw, felt or imagined. Folklore says the stone reveals fairies and witches in their true shapes; in practice, many find it simply sharpens attention and shows them what they have overlooked.',
        minutes: 5,
      },
      {
        title: 'Thread the cord',
        instructions:
          'Thread the red cord through the hole and tie it with three knots, saying one line for each knot.',
        spoken: 'One for the door. Two for the bed. Three for the road. No harm be led.',
      },
      {
        title: 'Hang it',
        instructions:
          'Hang the stone above your front door, over your bed, or from the bedpost, as country people did to keep away nightmares (“the hag” that rode sleepers).',
      },
    ],
    closing:
      'Rinse the stone in running water at each full moon. If the cord frays, re-tie it with fresh words.',
    safety:
      'Check the tide times before beachcombing, keep well away from cliff bases, and never climb on unstable rocks. Take only one or two stones and leave fossils. Some protected beaches and nature reserves forbid taking stones at all: check local rules.',
    lore:
      'Holed stones are called hagstones, witch stones, adder stones, or glain neidr in Welsh. In Britain they were hung in byres and stables to stop witches and night-hags from riding the horses and cattle, and over beds against nightmares. The belief that one may see the fairies through the hole is recorded in English and Scottish folklore. Scottish museums hold stones that were hung in homes as charms into the early twentieth century.',
    sources: [
      'Black, Folk-Medicine (1883), on holed stones',
      'Museum collections of nineteenth- and early twentieth-century witch stones from south-west Scotland',
    ],
  },
  {
    id: 'hedge-hawthorn-blackthorn',
    title: 'Working with the Hedge: Hawthorn and Blackthorn',
    kind: 'ritual',
    summary:
      'Visit a hawthorn or blackthorn in a hedgerow, introduce yourself, and ask the hedge for a small gift: a fallen twig or a few haws. Then make a heart-and-protection charm with it.',
    intention: 'healing',
    alsoFor: ['protection', 'love'],
    practices: ['hedge', 'green', 'folk'],
    paths: [],
    moon: ['waxing', 'full'],
    holidays: ['beltane', 'bealtaine', 'samhain'],
    minutes: 50,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A hawthorn or blackthorn growing in a hedgerow you can reach on foot', ref: 'traditional/herb/hawthorn' },
      { name: 'A small bottle of water for an offering' },
      { name: 'A ribbon of natural fibre (cotton, wool or linen), in white for hawthorn or red for blackthorn' },
      { name: 'A small cloth pouch' },
      { name: 'Gardening gloves' },
    ],
    preparation:
      'Learn the two trees first. Hawthorn has lobed leaves, white “may” flowers in late spring and red haws in autumn. Blackthorn flowers white on bare black branches in early spring, before its leaves, and bears dusty-blue sloes in autumn. Both have sharp thorns. Choose a tree on public land or with the landowner’s permission.',
    steps: [
      {
        title: 'Approach and greet',
        instructions:
          'Walk slowly to the tree. Stand where you can see the whole of it and greet it out loud. Notice its shape, its bark, the birds using it and the season it is in.',
        spoken: 'Old thorn of the hedge, guard of the boundary: I come as a friend, not to cut you.',
      },
      {
        title: 'Sit beside it',
        instructions:
          'Sit near the tree for a while, out of the way of its thorns. Breathe. Listen to the hedge: the rustle of birds, insects and wind. Notice what you feel: welcome, wariness or nothing at all.',
        minutes: 10,
        timed: true,
      },
      {
        title: 'Give the offering',
        instructions:
          'Pour the water at its roots. Tie the ribbon loosely to a low branch if this is a place where that is welcome; otherwise, just give the water.',
        spoken: 'Water for your roots and thanks for your keeping.',
      },
      {
        title: 'Ask for a gift',
        instructions:
          'With gloves on, look on the ground for a fallen twig, or in autumn gently pick three to five haws or sloes. Never cut a living branch: folklore warns that harming a lone hawthorn brings bad luck, and it is also unkind to the birds who depend on the hedge.',
        minutes: 10,
      },
      {
        title: 'Make the charm',
        instructions:
          'At home, put the twig or the dried berries into the pouch. Hawthorn is the old heart tree, for steadying and healing the heart; blackthorn is the stern guardian, for protection and setting limits. Hold the pouch to your chest.',
        spoken: 'Thorn of the may, keep my heart whole. Thorn of the sloe, keep out what would harm.',
        minutes: 5,
      },
    ],
    closing:
      'Keep the pouch by your bed or in your bag. Return the twig and berries to the hedge bottom at the end of the season, and visit the tree again with water when you can.',
    safety:
      'Both trees have long, sharp thorns that can cause infections: wear gloves and clean any scratch well. Don’t eat haws or sloes from this working; their seeds and stones contain compounds that can be harmful, and raw sloes are very astringent. Hawthorn can interact with heart medicines. Take nothing from protected sites, and never cut living wood.',
    lore:
      'Hawthorn is the “may” of English May Day and the fairy thorn of Ireland, where lone bushes are still left uncut out of respect. Its name comes from Old English haguthorn, “hedge-thorn.” Bringing may blossom indoors was thought to be unlucky in many English counties. Blackthorn is the tree of the cold “blackthorn winter” and of Irish shillelaghs, and is linked in later folklore with witches’ wands and stern protection. Hawthorn has a long herbal history as a heart remedy, which is behind the healing association.',
    sources: [
      'Grieve, A Modern Herbal (1931), on hawthorn and blackthorn',
      'Wilde, Ancient Legends, Mystic Charms and Superstitions of Ireland (1887), on fairy thorns',
      'Etymological scholarship on Old English haguthorn',
    ],
  },
  {
    id: 'hedge-hearing-the-land-walk',
    title: 'Hearing the Land Walk',
    kind: 'ritual',
    summary:
      'A slow walk in silence through a local landscape. You stop to listen at boundaries such as gates, streams and old walls, and you finish with a sit spot where you simply let the land speak.',
    intention: 'peace',
    alsoFor: ['intuition', 'healing'],
    practices: ['hedge', 'folk', 'elemental', 'solitary'],
    paths: [],
    moon: ['waxing', 'full', 'waning'],
    minutes: 75,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'Comfortable shoes and weather-appropriate clothing' },
      { name: 'A small bottle of water, to drink and to offer' },
      { name: 'A notebook and pencil' },
      { name: 'A phone with a map, kept on silent' },
    ],
    preparation:
      'Choose a route you know, or a well-marked public footpath. A short loop is enough: the walk is slow. Tell someone where you are going. Decide that you won’t speak, take photos or listen to anything for the whole walk.',
    steps: [
      {
        title: 'Ask permission to enter',
        instructions:
          'At the start of the path, stop. Put your hand on a gatepost, a tree or the ground and say why you have come.',
        spoken: 'Land beneath me, spirits of this place: I walk here to listen. Let me pass kindly and kindly return.',
      },
      {
        title: 'Walk at half speed',
        instructions:
          'Walk at half your normal pace. Let your eyes widen to take in the whole view rather than fixing on one thing. Notice sounds, from the nearest to the furthest. Notice smells and what is underfoot.',
        minutes: 20,
      },
      {
        title: 'Stop at the boundaries',
        instructions:
          'Each time you reach a boundary, such as a stile, a stream, a hedge line or the edge of a wood, stop for a minute before you cross. Notice whether the feel of the place changes on the other side.',
        minutes: 15,
      },
      {
        title: 'Find a sit spot',
        instructions:
          'Choose a place to sit or stand still where you feel drawn. Sit quietly. After a few minutes, birds and animals that went silent when you arrived will begin again. This is when the land starts to speak.',
        minutes: 15,
        timed: true,
      },
      {
        title: 'Write and give thanks',
        instructions:
          'Write down what you heard, saw and felt, and any word or phrase that came to you. Pour a little water onto the ground as thanks.',
        spoken: 'I heard you. Thank you.',
        minutes: 5,
      },
      {
        title: 'Walk home',
        instructions:
          'Walk back at a natural pace. Speak your first words aloud only when you reach home or the end of the path.',
        minutes: 15,
      },
    ],
    closing:
      'Return to the same sit spot through the seasons. Over a year, you will come to know its birds, its waters, its weather and its moods, and that is how a hedge witch comes to know her land.',
    safety:
      'Keep to public rights of way, close gates behind you and give livestock a wide berth. Check the weather and daylight, carry water, and let someone know your route. Stay well back from fast or deep water and crumbling banks.',
    lore:
      'Folk traditions everywhere hold that places have their own spirits: the Roman genius loci, the Norse landvættir and the fairy forts and holy wells of Ireland and Britain. Beating the bounds, the custom of walking a parish boundary each Rogationtide, kept the memory of the land in the bodies of the people who lived there. The modern “sit spot” comes from twentieth-century nature-awareness teaching. Together they make a quietly old way of belonging to a place.',
    sources: [
      'Hutton, The Stations of the Sun (1996), on beating the bounds',
      'Grimm, Teutonic Mythology (trans. Stallybrass, 1880–88), on land spirits',
    ],
  },
  {
    id: 'hedge-letting-go-of-the-dead',
    title: 'Letting Go of the Dead: A Grief Rite',
    kind: 'ritual',
    summary:
      'A tender rite for when someone has died and you need to let them go a little further. You write to them, give the letter to fire or earth, and release them on their way with love.',
    intention: 'peace',
    alsoFor: ['healing', 'banishing'],
    practices: ['hedge', 'solitary'],
    paths: [],
    moon: ['waning', 'dark'],
    holidays: ['samhain', 'all_souls', 'lemuria'],
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A white or black candle', ref: 'traditional/candle/white' },
      { name: 'A photograph or object of the person' },
      { name: 'Paper and pen' },
      { name: 'A sprig of rosemary, for remembrance', ref: 'traditional/herb/rosemary' },
      { name: 'A willow twig or leaf, for grief that bends without breaking', ref: 'traditional/herb/willow', optional: true },
      { name: 'A fireproof bowl or cauldron with a little sand in it, or a trowel for burying', ref: 'traditional/tool/cauldron' },
      { name: 'A tissue box and a glass of water' },
    ],
    preparation:
      'Choose a time when you won’t be interrupted and can rest afterwards. You don’t need to be “ready”: letting go happens in stages, and this rite can be repeated. Set the photograph by the candle, with the rosemary and willow in front of it.',
    steps: [
      {
        title: 'Light for them',
        instructions:
          'Light the candle and sit with the photograph. Say their name aloud.',
        spoken: 'I light this for you. I have not forgotten. I will not forget.',
        light: true,
      },
      {
        title: 'Write the letter',
        instructions:
          'Write to them. Say everything: what you miss, what you’re angry about, what you wish you had said, what you forgive and what you ask forgiveness for. Don’t edit. Cry if you need to.',
        minutes: 20,
      },
      {
        title: 'Read it aloud',
        instructions:
          'Read the letter aloud to the photograph, slowly. Then fold it three times toward you, and wrap the rosemary inside it.',
        minutes: 5,
      },
      {
        title: 'Release the letter',
        instructions:
          'Either light a corner of the letter from the candle and let it burn in the sand-filled bowl, or set it aside to bury in the garden or a plant pot afterwards. As it goes, picture them turning toward a far, lit doorway, and walking on.',
        spoken: 'Go on now, go on. You are loved, and you are free. I let you walk ahead of me.',
      },
      {
        title: 'Hold the willow',
        instructions:
          'Hold the willow twig, or simply your own hands. Sit in silence. Let the grief move however it moves. When you feel a little quieter, drink the water.',
        minutes: 10,
      },
      {
        title: 'Close the rite',
        instructions:
          'Thank them. Snuff the candle. Keep the photograph wherever it lives normally.',
        spoken: 'Until we meet again.',
        snuff: true,
      },
    ],
    closing:
      'Scatter the cooled ashes under a tree, or bury the letter. Be gentle with yourself for the rest of the day: eat something warm and, if you can, talk to someone who knew them.',
    safety:
      'Burn paper only in a fireproof container on a heat-safe surface, away from curtains, with water to hand; never leave flame unattended. Grief can be overwhelming: if you are struggling to cope, or having thoughts of harming yourself, please contact a doctor, a bereavement service or a local crisis line.',
    lore:
      'Many cultures have rites to help the dead move on, from the Roman Lemuria, when the householder cast beans and sent wandering spirits away, to the Irish wake and keen, and the “month’s mind” Mass of Catholic tradition. Rosemary has been the herb of remembrance since at least Shakespeare (“There’s rosemary, that’s for remembrance”). Writing to the dead is a modern grief-therapy practice, and this rite joins it with older forms of farewell.',
    sources: [
      'Ovid, Fasti, Book V, on the Lemuria',
      'Shakespeare, Hamlet, Act IV, scene v (c. 1600)',
    ],
  },

  // ───────────────────────────── SEA ─────────────────────────────
  {
    id: 'sea-tide-draw-and-release',
    title: 'Working with the Tide: Draw In and Let Go',
    kind: 'ritual',
    summary:
      'A two-part shore working timed to the tide: at the flood you draw in what you want to grow, and at the ebb you give the sea what you want to release.',
    intention: 'beginnings',
    alsoFor: ['banishing', 'prosperity'],
    practices: ['sea', 'elemental', 'folk'],
    paths: [],
    moon: ['new', 'full'],
    minutes: 50,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A local tide table for the day' },
      { name: 'Two shells or pebbles from the beach' },
      { name: 'A stick for drawing in the sand' },
      { name: 'Warm clothes and shoes with grip' },
      { name: 'A friend, or someone who knows where you are' },
    ],
    preparation:
      'Check the tide table: high and low tide are about six hours apart. Around the new and full moons, spring tides bring the highest highs and lowest lows, which strengthens the working but also makes the water come in fast. Plan to do the drawing part as the tide is coming in and the releasing as it goes out. You can do them on the same day or on two different days. Choose a beach you know, with a clear route off it.',
    steps: [
      {
        title: 'Greet the sea',
        instructions:
          'Stand at a safe distance from the waterline. Watch for seven waves. Notice the sound, the smell of salt and weed, and the direction of the wind.',
        spoken: 'Mother of tides, you who come and go: I am here to come and go with you.',
        minutes: 3,
      },
      {
        title: 'Flood tide: draw in',
        instructions:
          'On the incoming tide, hold the first shell and name what you want to grow: work, love, health, courage. Draw a symbol of it in the wet sand just above the waterline, facing the sea.',
        spoken: 'Flowing tide, bring it home. Every wave a little closer.',
      },
      {
        title: 'Watch it come',
        instructions:
          'Step back and watch as the tide reaches the symbol and fills it. Imagine each wave carrying your wish toward you. Keep the first shell in your pocket.',
        minutes: 10,
        timed: true,
      },
      {
        title: 'Ebb tide: name what goes',
        instructions:
          'On the outgoing tide, hold the second shell or pebble and breathe into it what you want to release: a habit, a fear, an old hurt. Be specific.',
        minutes: 5,
      },
      {
        title: 'Give it to the ebb',
        instructions:
          'At the edge of a gentle wave, and only where it is safe, set the second shell down and let the retreating water take it. Or throw it into the water from where you stand.',
        spoken: 'Ebbing tide, carry it out. Out past the bar, out past the light, and not come back.',
      },
      {
        title: 'Turn for home',
        instructions:
          'Turn your back to the sea and walk up the beach. Put the first shell on your altar or windowsill until your wish has come to you.',
      },
    ],
    closing:
      'When what you drew in arrives, return the first shell to the sea with thanks.',
    safety:
      'Always check tide times and never let yourself get cut off by the incoming tide, especially in bays, around headlands and on sandbanks. Stay out of the water in rough conditions, keep away from cliff edges and bases, and never turn your back on the sea near the waterline. Rip currents and cold water can kill even strong swimmers. In an emergency, call the coastguard (999 or 112 in the UK; 911 in the US).',
    lore:
      'Coastal peoples have long believed that the tides govern life. Frazer records the belief along England’s east coast that people die on the ebb, and Dickens has Mr Barkis “go out with the tide” in David Copperfield. Pliny repeated the much older claim from Aristotle. The pairing of flood tide for increase and ebb for release is a direct application of the old sympathetic logic that also governs waxing and waning moons.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), on the tides and human life',
      'Dickens, David Copperfield (1850)',
      'Pliny the Elder, Natural History, Book II',
    ],
  },
  {
    id: 'sea-shell-protection-charm',
    title: 'Shell Protection Charm',
    kind: 'spell',
    summary:
      'Gather a few empty shells, wash them in salt water and string them together as a protective charm for a door, a window or a car. Shells are the sea’s own armour.',
    intention: 'protection',
    alsoFor: ['peace'],
    practices: ['sea', 'folk', 'solitary'],
    paths: [],
    moon: ['full', 'waxing'],
    minutes: 40,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'Three, five or seven empty shells with natural holes (limpets, periwinkles, whelks or holed cockles)' },
      { name: 'A length of natural cord or fishing twine, about 50 cm (20 in)' },
      { name: 'A bowl of seawater or salt water', ref: 'traditional/vessel/bowl' },
      { name: 'A small piece of aquamarine or a hagstone to hang at the bottom', ref: 'traditional/crystal/aquamarine', optional: true },
    ],
    preparation:
      'Collect only empty shells, never ones with a living animal inside, and only where collecting is allowed. Soak them in fresh water to remove sand, then rinse them in salt water and dry them in the sun.',
    steps: [
      {
        title: 'Bless the shells',
        instructions:
          'Lay the shells out on a cloth. Pick each one up and turn it in your fingers, noticing its curve and ridges. Each shell once kept a soft creature safe from the storm.',
        spoken: 'House of the sea, made by the sea: you kept your keeper safe. Keep mine.',
      },
      {
        title: 'Thread them',
        instructions:
          'Tie a loop at the top of the cord for hanging. Thread the first shell and tie a knot below it. Continue with the others, knotting below each so they hang a hand’s width apart.',
        spoken: 'Shell and knot, knot and shell. Guard the door and guard it well.',
        minutes: 15,
      },
      {
        title: 'Weight the charm',
        instructions:
          'Tie the aquamarine or hagstone at the bottom if you have one. Dip the whole charm in the salt water and let it drip dry.',
        minutes: 5,
      },
      {
        title: 'Hang it',
        instructions:
          'Hang it by the front door, in a window facing the sea or the road, or from a car’s mirror (where it won’t block your view). Shake it gently so the shells click.',
        spoken: 'Here the tide stops. Here the storm turns back.',
      },
    ],
    closing:
      'At each full moon, dip the charm in salt water to refresh it. If a shell breaks, return it to the shore and thank it for taking the knock.',
    safety:
      'Take only empty shells and only a few. Some beaches, reserves and countries forbid shell collecting, so check local rules. Check the tide times before you go and stay away from cliffs. Shell edges can be sharp. Make sure nothing hanging in a car blocks your view of the road.',
    lore:
      'Shells have been strung and worn as amulets since the Stone Age; shell beads are some of the oldest human ornaments ever found. The scallop was the badge of pilgrims to Santiago de Compostela and a sign of safe return. In Scotland and Ireland, shells were set in the walls of fishermen’s cottages and on graves. The strung door charm is a modern sea-witch form of those old customs.',
    sources: [
      'Archaeological scholarship on Palaeolithic shell beads',
      'Scholarship on the scallop as the pilgrim’s badge of St James',
    ],
  },
  {
    id: 'sea-seawater-cleansing',
    title: 'Sea Salt & Seawater House Cleansing',
    kind: 'spell',
    summary:
      'Gather seawater safely, or make your own with sea salt, and wash the doorsteps, windowsills and corners of your home to clear out heavy, stuck energy.',
    intention: 'cleansing',
    alsoFor: ['protection', 'beginnings'],
    practices: ['sea', 'kitchen', 'elemental'],
    paths: [],
    moon: ['waning', 'dark'],
    minutes: 45,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A clean glass bottle of seawater, or a litre of spring water with two tablespoons of sea salt', ref: 'traditional/vessel/bottle' },
      { name: 'A spray bottle', ref: 'traditional/vessel/spray_bottle' },
      { name: 'A sprig of rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'A few drops of lemon juice', optional: true },
      { name: 'A clean cloth and a bucket' },
      { name: 'A besom or broom', ref: 'traditional/tool/besom', optional: true },
    ],
    preparation:
      'If you collect seawater, do it on a calm day at a clean beach, in shallow water at the edge, at low or slack tide. Never wade out, and never collect in rough weather or near outflows, harbours or algae blooms. Strain it through a cloth. If you live inland, simply dissolve sea salt in spring water. Open the windows and sweep the floors first.',
    steps: [
      {
        title: 'Wake the water',
        instructions:
          'Pour some of the water into the bucket and the rest into the spray bottle. Bruise the rosemary between your fingers and drop it into the bucket. Stir clockwise three times with your hand.',
        spoken: 'Salt of the deep and the moving tide, wash this house from inside to outside.',
      },
      {
        title: 'Start at the back',
        instructions:
          'Begin at the room furthest from the front door. Dip the cloth and wipe the windowsills and door frames. Mist the corners, where stale energy gathers, and the space under beds.',
        minutes: 15,
      },
      {
        title: 'Move toward the door',
        instructions:
          'Work room by room toward the front door, as a tide moves toward the shore. In each room say the cleansing words once.',
        spoken: 'Out with the ebb, all that is heavy. Out with the ebb, all that is stale.',
        minutes: 15,
      },
      {
        title: 'Wash the threshold',
        instructions:
          'Finish by washing the front doorstep and the outside of the door, from the inside out. This is the old Scottish and northern English custom of “washing the step.”',
        minutes: 5,
      },
      {
        title: 'Pour it away',
        instructions:
          'Pour the leftover water out of the front door, onto the street side, away from plants (salt will harm them), or down an outside drain.',
        spoken: 'Go back to the sea.',
      },
    ],
    closing:
      'Close the windows and light a candle or make a cup of tea to fill the cleared house with something warm. Repeat at the waning moon whenever the house feels heavy.',
    safety:
      'Never collect seawater in rough seas, strong winds or a rising tide, and never wade or lean over edges, piers or rocks. Check tide times and avoid cliffs. Don’t drink seawater. Salt water can damage wood finishes, metal and electronics, so test a small area first and wipe dry. Salt harms plants and soil, so pour it away from gardens. Wear gloves if you have sensitive skin.',
    lore:
      'Salt has been used to cleanse and protect across many cultures, from the Roman mola salsa to the salt laid on a corpse’s chest in British wakes. Seawater was sprinkled on boats, nets and doors in coastal communities from Scotland to the Mediterranean. Washing and whitening the front step was a weekly ritual of pride and protection in working-class Britain well into the twentieth century.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), on salt and purification',
      'Scholarship on British domestic customs of the doorstep',
    ],
  },
  {
    id: 'sea-wind-knots',
    title: 'Wind Knots for a Fair Wind',
    kind: 'spell',
    summary:
      'Tie three knots in a cord to bind the wind’s strength into them, as the wind-sellers of Shetland, Lewis and the Isle of Man once did for sailors. Loosen one when you need a breeze behind a new venture.',
    intention: 'beginnings',
    alsoFor: ['courage', 'prosperity'],
    practices: ['sea', 'folk', 'elemental'],
    paths: [],
    moon: ['waxing', 'new'],
    weekday: 3,
    minutes: 30,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A length of natural cord, wool or a strip of linen, about 60 cm (2 ft)' },
      { name: 'A windy day, a high place, or an open window' },
      { name: 'A feather', optional: true },
    ],
    preparation:
      'Choose a day when the wind is blowing from the direction you want to go in, or simply a fresh and steady breeze. Stand on a hill, a beach, a headland or at an open window. Decide what the wind is for: a new job, a move, a creative project or a journey.',
    steps: [
      {
        title: 'Face the wind',
        instructions:
          'Stand with the wind on your face. Close your eyes and feel it on your skin and in your hair. Notice its temperature and its strength.',
        spoken: 'Wind of the north and wind of the west, wind of the sea, I bid you rest here.',
        minutes: 3,
      },
      {
        title: 'Tie the first knot: the breeze',
        instructions:
          'Hold the cord up into the wind and tie a loose knot a third of the way along, catching the moving air in it.',
        spoken: 'One for a breeze to fill the sail.',
      },
      {
        title: 'Tie the second knot: the wind',
        instructions:
          'Wait for a stronger gust and tie the second knot in the middle, firmer.',
        spoken: 'Two for a wind to speed the way.',
      },
      {
        title: 'Tie the third knot: the gale',
        instructions:
          'Tie the third knot near the end, tight. This one holds the storm, and by tradition you should never undo it.',
        spoken: 'Three for the gale. Sleep in the knot, and wake not.',
      },
      {
        title: 'Carry it home',
        instructions:
          'Wrap the cord around your wrist or put it in a pocket and walk home without untying anything. Hang it near the door or by your desk.',
      },
      {
        title: 'When you need it',
        instructions:
          'When your venture needs a push, such as sending the application, starting the move or launching the project, go to an open window and untie the first knot, letting the breath go out into the world. For a stronger push, untie the second.',
        spoken: 'Wind, go out and carry me.',
      },
    ],
    closing:
      'When the venture is complete, bury the cord with the third knot still tied, or burn it safely, and thank the wind.',
    safety:
      'Stay well back from cliff edges and stay off exposed high ground in high winds. If you burn the cord at the end, do so in a fireproof dish, away from anything flammable. Never untie the third knot near open flame or on the water.',
    lore:
      'The sale of winds tied up in knots is one of the best-recorded pieces of sea folklore in northern Europe. Frazer reports that Lapland and Finnish sorcerers sold knotted cords to sailors, and that witches in Shetland, Lewis and the Isle of Man did the same: one knot for a moderate breeze, two for a strong wind and three for a gale. He adds that Shetland seamen were still buying knotted threads from old women in his own day. A 1555 woodcut by Olaus Magnus shows a wind-seller with her ropes.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), ch. “The Magical Control of the Wind”',
      'Olaus Magnus, Historia de Gentibus Septentrionalibus (1555)',
    ],
  },
  {
    id: 'sea-message-in-sand',
    title: 'A Message in the Sand',
    kind: 'spell',
    summary:
      'Write what you want to release in large letters on the wet sand below the tideline, then watch the sea wash it away. It needs no tools and leaves no trace.',
    intention: 'banishing',
    alsoFor: ['healing', 'peace'],
    practices: ['sea', 'elemental', 'solitary'],
    paths: [],
    moon: ['waning', 'dark'],
    minutes: 40,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A stick or your finger' },
      { name: 'A sandy beach and a tide table' },
      { name: 'Warm clothes' },
    ],
    preparation:
      'Go on a falling-to-rising tide: you want to write just after low tide, so the incoming water will reach your words soon. Choose a quiet stretch of sand where you can see the whole way off the beach.',
    steps: [
      {
        title: 'Walk to the edge',
        instructions:
          'Walk barefoot or in shoes to the firm, wet sand just above the waterline. Feel the cold. Listen to the waves breaking and drawing back.',
        minutes: 5,
      },
      {
        title: 'Write it',
        instructions:
          'With the stick, write in large letters what you want to let go of: a name of a feeling, a habit, a worry, a debt, or a sentence. You can also draw it as a shape. Dig the letters deep.',
        minutes: 5,
      },
      {
        title: 'Speak it',
        instructions:
          'Stand above your writing and read it aloud to the sea.',
        spoken: 'This I give you. Take it down, take it out, take it under. Wash me clean.',
      },
      {
        title: 'Watch the tide come',
        instructions:
          'Step back up the beach to a safe place where you can still see your words. Watch each wave reach a little further until it fills the letters and smooths them away. Don’t leave until it is gone.',
        minutes: 20,
      },
      {
        title: 'Turn away',
        instructions:
          'When the sand is smooth again, turn your back and walk away without looking back.',
        spoken: 'Gone with the sea.',
      },
    ],
    closing:
      'On the way home, do something kind for yourself: a hot drink, a walk, a call to a friend. The sea has made room; fill it with something good.',
    safety:
      'Check the tide times and stay aware of the water: incoming tides can move very fast across flat sand and cut off sandbars and bays. Never stand below the tideline on a rising tide, and keep away from cliff bases and soft mud. Stay out of the water in cold or rough conditions.',
    lore:
      'Giving troubles to running water is very old, and appears in charms across Europe, including the Anglo-Saxon Lacnunga, where ailments are sent off into the water. Writing in the sand to be erased by the tide is a modern practice, but it is a natural form of that older logic, and it is gentle on the shore because it leaves nothing behind.',
    sources: [
      'Lacnunga (Old English medical and charm collection, c. 10th–11th century), on sending illness into water',
    ],
  },
  {
    id: 'sea-glass-mending-charm',
    title: 'Sea Glass Charm for Mending',
    kind: 'spell',
    summary:
      'Find a piece of sea glass, something once broken and sharp that the sea has made smooth, and make it a charm for healing an old hurt and softening its edges.',
    intention: 'healing',
    alsoFor: ['peace', 'love'],
    practices: ['sea', 'solitary'],
    paths: [],
    moon: ['waning', 'full'],
    minutes: 35,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A piece of sea glass you found yourself, frosted and smooth' },
      { name: 'A small pouch, or wire to wrap it as a pendant' },
      { name: 'A pinch of sea salt' },
      { name: 'A rose petal or lavender bud', ref: 'traditional/herb/rose', optional: true },
      { name: 'A notebook' },
    ],
    preparation:
      'Search for sea glass on a shingle or pebble beach at low tide; green, brown and white are common, and blue and red are rare treasures. Leave any glass that is still sharp-edged for the sea to finish. At home, wash it in warm water.',
    steps: [
      {
        title: 'Read the glass',
        instructions:
          'Hold the sea glass up to the light. Feel its frosted skin and rounded edges. Think about how long it tumbled: years, perhaps decades. Something sharp became something gentle.',
        minutes: 3,
      },
      {
        title: 'Name the wound',
        instructions:
          'In your notebook, write about the hurt you are carrying: what broke, and how it still cuts. Be honest, but kind to yourself.',
        minutes: 10,
      },
      {
        title: 'Give it to the glass',
        instructions:
          'Hold the glass in your closed hand over your heart. Breathe slowly. Imagine the same sea that softened the glass washing over your hurt, rolling it smooth.',
        spoken: 'Broken once and sharp once, and the sea made you kind. Make me kind to myself. Wear my edges smooth.',
        minutes: 5,
      },
      {
        title: 'Seal the charm',
        instructions:
          'Put the glass in the pouch with a pinch of sea salt and the rose petal or lavender, or wrap it in wire to wear. Close it.',
        minutes: 10,
      },
    ],
    closing:
      'Carry or wear the charm. When you notice the hurt has softened, perhaps months from now, return the glass to the shore and let the sea keep working on it for someone else.',
    safety:
      'Check tide times when beachcombing and stay away from cliffs and rocks with incoming tide. Leave any glass that is still sharp, and watch for broken bottles and other hazards. Some beaches forbid collecting, so check local rules. This charm is a companion to emotional healing, not a replacement for professional support.',
    lore:
      'Sea glass is a modern treasure: most of it comes from bottles and jars dumped at sea in the nineteenth and twentieth centuries, and it is becoming rarer as plastics replace glass. Its use as a healing charm is entirely modern sea-witch practice. It is built on the old principle of sympathetic magic, the idea that like affects like, so the sea’s slow kindness to the glass becomes a model for the mending of the heart.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), on the principle of sympathetic magic',
    ],
  },
  {
    id: 'sea-river-flower-offering',
    title: 'River Offering of Flowers',
    kind: 'ritual',
    summary:
      'Weave a small wreath or posy of garden flowers and set it on a stream or river at midsummer, as Slavic and Baltic girls did at Kupala, asking the water to carry love toward you. Use biodegradable materials only.',
    intention: 'love',
    alsoFor: ['beginnings', 'prosperity'],
    practices: ['sea', 'folk', 'green'],
    paths: [],
    moon: ['waxing', 'full'],
    holidays: ['kupala', 'litha', 'midsummer', 'st_john'],
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A handful of garden flowers and herbs, such as daisies, roses, cornflowers and St John’s wort', ref: 'traditional/herb/st_johns_wort' },
      { name: 'A few sprigs of mint or lavender', ref: 'traditional/herb/lavender', optional: true },
      { name: 'Soft willow wands or long grass to weave a base', ref: 'traditional/herb/willow', optional: true },
      { name: 'Cotton thread or plain jute string' },
      { name: 'A slow-moving stream or river with a safe, gently sloping bank' },
    ],
    preparation:
      'Pick flowers from your own garden or buy them unwrapped, and never pick wildflowers from reserves. Use only natural materials: no wire, plastic, glitter, florist’s foam or candles. Find a calm stretch of water by daylight, with a low, firm bank where you can reach the water without leaning.',
    steps: [
      {
        title: 'Weave the wreath',
        instructions:
          'Bend the willow or grass into a ring and bind it with thread. Tuck the flower stems in all around it. As you weave each flower, think about the kind of love you hope to draw in: a partner, a friendship, family closeness or love for yourself.',
        spoken: 'Flower by flower and stem by stem, I weave what I hope for.',
        minutes: 25,
      },
      {
        title: 'Go to the water',
        instructions:
          'Carry the wreath to the river at dusk or in the evening light. Stand on the bank and listen to the water before you do anything.',
        minutes: 5,
      },
      {
        title: 'Greet the river',
        instructions:
          'Touch the water with your fingertips, if you can do so safely.',
        spoken: 'River who runs to the sea, river who knows every bank: carry my wreath to the one who is waiting.',
      },
      {
        title: 'Set it on the water',
        instructions:
          'Lay the wreath gently on the surface from the bank, or drop it from a low footbridge. Watch where it goes. In the old custom, a wreath that sailed away freely promised love in the coming year; one that caught on the bank meant waiting a little longer.',
        minutes: 10,
      },
      {
        title: 'Give thanks',
        instructions:
          'Watch until it is out of sight. Thank the river and walk home.',
        spoken: 'Thank you, water. Go well.',
      },
    ],
    closing:
      'Keep one flower from the wreath, dried in a book, until the next midsummer.',
    safety:
      'Never lean out over the water, wade in or work on slippery or steep banks; rivers can be deeper, colder and faster than they look. Don’t go alone after dark, and keep children close. Use only biodegradable materials: no candles, wire, plastic or glitter on the water. St John’s wort can cause skin sensitivity in sunlight for some people; wash your hands after weaving.',
    lore:
      'At Kupala Night, around midsummer, girls across the Slavic lands floated flower wreaths on rivers, sometimes with a candle, and read their marriage luck from where the wreaths drifted; young men waded in to catch them. Similar customs are recorded in the Baltic, Poland and Germany for St John’s Eve. Offerings to rivers go back to the Bronze Age, when weapons and treasures were placed in the Thames and other European rivers. This version keeps the wreath and leaves out the candle, out of care for the water.',
    sources: [
      'Frazer, The Golden Bough (1890–1915), on midsummer customs',
      'Ethnographic scholarship on Kupala Night',
      'Archaeological scholarship on votive deposits in European rivers',
    ],
  },
  {
    id: 'sea-storm-water-bottle',
    title: 'Storm Water Bottle',
    kind: 'spell',
    summary:
      'Catch rain from a passing storm, safely and from indoors, and bottle it as a charge of raw courage for times when you need to stand your ground.',
    intention: 'courage',
    alsoFor: ['protection', 'banishing'],
    practices: ['sea', 'elemental', 'solitary'],
    paths: [],
    moon: ['full', 'waxing'],
    weekday: 2,
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A clean glass jar or bottle with a lid', ref: 'traditional/vessel/bottle' },
      { name: 'A clean bowl or wide jug to catch rain', ref: 'traditional/vessel/bowl' },
      { name: 'A label and a pen' },
      { name: 'A small piece of smoky quartz or a hagstone to drop in', ref: 'traditional/crystal/smoky_quartz', optional: true },
      { name: 'A strip of red thread to tie around the neck' },
    ],
    preparation:
      'Watch the forecast for a strong storm. Before it arrives, place the bowl outside in an open spot, away from roof run-off and trees, or on a sill you can reach from a window. Don’t go outside while there is lightning. Collect the water once the storm has passed.',
    steps: [
      {
        title: 'Listen to the storm',
        instructions:
          'While the storm is passing, sit by a window. Listen to the rain, wind and thunder. Notice where your body responds: does the noise make you tense, or excited? Breathe the storm’s energy in.',
        spoken: 'Storm on the roof and storm on the sea, lend me your voice and roar for me.',
        minutes: 10,
      },
      {
        title: 'Gather the water',
        instructions:
          'Once the storm has fully passed and there is no more thunder, bring the bowl in. Pour the water through a cloth into the jar, then drop in the smoky quartz or hagstone if you are using one.',
        minutes: 5,
      },
      {
        title: 'Seal and charge',
        instructions:
          'Close the lid and tie the red thread around the neck in a tight knot. Hold the jar in both hands.',
        spoken: 'Wild water, stand with me. When I am afraid, be my thunder.',
      },
      {
        title: 'Label it',
        instructions:
          'Write the date, the kind of storm (“autumn gale”, “summer thunder”) and the words NOT FOR DRINKING on the label.',
      },
    ],
    closing:
      'Keep the bottle somewhere dark. Before a hard conversation, an interview or any time you need to stand firm, dab a drop on your wrists or the back of your neck, or simply hold the bottle and breathe. Pour it out on the earth and catch a new storm each year.',
    safety:
      'Never go outside, stand under trees, or handle metal near open water during lightning; wait 30 minutes after the last thunder. Don’t collect water from roofs, gutters or drains, and never drink storm water: it isn’t clean. Label the bottle clearly, keep it away from children, and throw it out if it turns cloudy or smells. Don’t put soft or water-soluble stones (selenite, malachite, halite) in the water.',
    lore:
      'Storms have always been the province of sea witches in folklore. Medieval and early modern accounts accused witches of raising tempests, and the North Berwick trials of 1590 claimed that witches had raised a storm against James VI’s ship. Bottling storm water for courage and power is a modern practice found widely in contemporary witchcraft. It is an original, defensive way of borrowing the storm’s strength rather than raising it.',
    sources: [
      'Newes from Scotland (1591), on the North Berwick witch trials',
    ],
  },
  {
    id: 'sea-mermaids-purse-driftwood',
    title: 'Mermaid’s Purse & Driftwood Charm',
    kind: 'spell',
    summary:
      'Make a small hanging charm for the hearth from a found piece of driftwood and an empty mermaid’s purse (a skate or shark egg case). It calls in plenty and keeps a safe home port for those who travel.',
    intention: 'prosperity',
    alsoFor: ['protection', 'beginnings'],
    practices: ['sea', 'folk', 'kitchen'],
    paths: [],
    moon: ['new', 'waxing'],
    minutes: 45,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A piece of driftwood about the length of your hand, found on the strandline' },
      { name: 'An empty mermaid’s purse (egg case), found on the beach', optional: true },
      { name: 'A silver coin or a small round shell, such as a cockle' },
      { name: 'Natural twine' },
      { name: 'A few grains of rice or a bay leaf', ref: 'traditional/herb/bay' },
    ],
    preparation:
      'Comb the strandline (the line of weed left by the last high tide) after a storm, when driftwood and egg cases wash up. Choose an egg case that is dry and empty; a full, soft, heavy one still holds a developing animal and must go back into a rock pool or the sea. Rinse your finds in fresh water and let them dry for a few days.',
    steps: [
      {
        title: 'Hear their stories',
        instructions:
          'Lay the driftwood and the purse in front of you. The wood has travelled who knows how far and still found its way to shore. The purse once held a new life and let it go free. Think about what you want: enough, a safe return and a door that stays open to good things.',
        minutes: 5,
      },
      {
        title: 'Fill the purse',
        instructions:
          'If the egg case has an opening at one end, gently tuck in the grains of rice or a sliver of bay leaf. If not, tie the bay leaf to it with twine.',
        spoken: 'Little purse of the sea, once full, be full again.',
      },
      {
        title: 'Bind the charm',
        instructions:
          'Wrap twine around the driftwood three times and tie on the purse and the coin or shell so they hang below it. Tie a loop at the top for hanging.',
        spoken: 'Wood that came home, bring home what is mine: the ones I love, the bread I need, the luck that is due.',
        minutes: 15,
      },
      {
        title: 'Hang it by the hearth',
        instructions:
          'Hang the charm near the stove, fireplace, front door or wherever the heart of your home is. Touch the coin as you pass on your way out each day.',
      },
    ],
    closing:
      'When the purse becomes brittle and crumbles, return it to the shore and look for a new one. Keep the driftwood as long as it stays sound.',
    safety:
      'Collect only empty, dry egg cases; full ones contain living young and must be returned to the sea. Check tide times and stay below cliffs only when the tide is far out and the cliffs are stable. Don’t burn driftwood indoors: salt-soaked wood can give off harmful fumes. Some beaches forbid removing materials, so check local rules.',
    lore:
      'Mermaid’s purses, the leathery egg cases of skates, rays and some sharks, have that name in English coastal folklore, and were sometimes kept as curiosities and charms by fishing families. Driftwood was precious on treeless coasts such as Orkney, Shetland and Iceland, where it was used for building and where its arrival was treated as a gift from the sea. This charm is modern sea-witch practice. It makes something new from those old beachcombing customs and leans on the sympathetic logic of a full purse and a wanderer come home.',
    sources: [
      'Marine conservation scholarship on elasmobranch egg cases',
      'Scholarship on driftwood use in the Northern Isles and Iceland',
    ],
  },
  {
    id: 'sea-moon-tide-healing-bath',
    title: 'Moon-and-Tide Healing Bath',
    kind: 'ritual',
    summary:
      'An inland sea-witch bath: sea salt, a moonlit room and a blue candle bring the tide to your bathtub, drawing out what aches and letting it drain away.',
    intention: 'healing',
    alsoFor: ['peace', 'cleansing'],
    practices: ['sea', 'elemental', 'solitary'],
    paths: [],
    moon: ['full', 'waning'],
    weekday: 1,
    minutes: 50,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A cup of coarse sea salt' },
      { name: 'A handful of dried lavender or chamomile in a muslin bag', ref: 'traditional/herb/lavender' },
      { name: 'A blue or silver candle in a stable holder', ref: 'traditional/candle/blue' },
      { name: 'A piece of moonstone or aquamarine to rest on the edge of the bath (not in the water)', ref: 'traditional/crystal/moonstone', optional: true },
      { name: 'A recording of waves or the sea, on a device kept well away from the water', optional: true },
      { name: 'A glass of drinking water' },
      { name: 'A warm towel' },
    ],
    preparation:
      'Run the bath warm but not hot. Turn off the main light, and if the moon is visible, open the blind. Set the candle in a safe spot where it can’t be knocked over. Place the stone on the edge of the bath.',
    steps: [
      {
        title: 'Salt the water',
        instructions:
          'Pour the salt into the running water in a slow circle, then hang the herb bag under the tap so the water flows through it. Stir the bath clockwise with your hand.',
        spoken: 'Salt of the sea, come inland to me. Bring the tide. Bring the moon.',
      },
      {
        title: 'Light the moon candle',
        instructions:
          'Light the candle and switch off any remaining lights. Start the sea sounds if you are using them.',
        light: true,
      },
      {
        title: 'Flood: soak',
        instructions:
          'Lower yourself in slowly. Lie back and let the water hold you. Breathe in for four counts and out for six. Picture the tide coming in over you, warm and silver, finding every ache and every tired place.',
        minutes: 15,
        timed: true,
      },
      {
        title: 'Turn of the tide',
        instructions:
          'Put your hands on whatever hurts, in body or heart. Say what you want to heal, quietly.',
        spoken: 'High water, hold me. Turn, tide, turn, and take it with you.',
        minutes: 5,
      },
      {
        title: 'Ebb: drain',
        instructions:
          'Stand up carefully, pull the plug and stay standing in the bath for a moment as the water drains around your feet. Picture the ache going down with it, out to the river and the sea.',
        spoken: 'Out to the sea and away from me.',
        minutes: 3,
      },
      {
        title: 'Rinse and rest',
        instructions:
          'Rinse with a quick shower of fresh water, wrap yourself in the warm towel and drink the glass of water. Snuff the candle before you leave the room.',
        snuff: true,
      },
    ],
    closing:
      'Go to bed early with the window open a crack if the weather allows. Notice your dreams.',
    safety:
      'Keep the candle stable and away from towels and curtains, and never leave it burning unattended. Keep electrical devices well away from water. Salt can sting broken skin, eczema or fresh shaves. Skip the bath, or use less salt and cooler water, if you are pregnant, have heart or blood-pressure problems, or feel faint, and get out slowly. Don’t put stones in the water (some, such as selenite, dissolve). Don’t use essential oils undiluted in a bath.',
    lore:
      'Sea bathing for health became a craze in eighteenth-century Britain, after Dr Richard Russell promoted seawater in 1750, and inland spas sold salt baths to people who couldn’t travel to the coast. The moon’s pull on the tides is ancient knowledge, noted by Pliny and Bede. This bath is modern sea-witch practice. It joins the folk logic of flood and ebb with the plain comfort of a warm salt soak.',
    sources: [
      'Russell, A Dissertation on the Use of Sea Water in the Diseases of the Glands (1750, English trans. 1752)',
      'Bede, The Reckoning of Time (725), on the moon and tides',
    ],
  },
  {
    id: 'sea-safe-passage-blessing',
    title: 'Blessing for Safe Passage over Water',
    kind: 'ritual',
    summary:
      'A short blessing before a boat trip, ferry crossing, fishing day or flight over the sea, for yourself, a loved one or the vessel. It is drawn from the Hebridean and Manx sea-blessings.',
    intention: 'protection',
    alsoFor: ['courage', 'peace'],
    practices: ['sea', 'folk'],
    paths: [],
    moon: ['new', 'waxing', 'full', 'waning'],
    holidays: ['neptunalia', 'midsummer', 'st_john'],
    minutes: 15,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A small bottle of seawater or salt water', ref: 'traditional/vessel/vial' },
      { name: 'A sprig of rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'A small bundle of green rushes or grass, in honour of Manannán', optional: true },
      { name: 'Manannán mac Lir, if you honour him', ref: 'traditional/deity/manannan', optional: true },
      { name: 'A small aquamarine to carry', ref: 'traditional/crystal/aquamarine', optional: true },
    ],
    preparation:
      'Do this on the morning of the trip, at the quay or the beach if you can, or at home if not. If you are blessing someone else, you can do it with them or on their behalf. Put on the clothing and life jacket you will wear, if it is a small boat.',
    steps: [
      {
        title: 'Face the water',
        instructions:
          'Stand facing the sea, the river or the direction of the crossing. Take three slow breaths of sea air. Look at the sky and the water and notice the conditions honestly.',
        minutes: 2,
      },
      {
        title: 'Asperge with salt water',
        instructions:
          'Dip the rosemary in the salt water and flick it three times: over yourself (or the traveller), toward the boat or vessel, and toward the sea.',
        spoken: 'Salt for the sailor, salt for the keel, salt for the sea that carries us.',
      },
      {
        title: 'Speak the blessing',
        instructions:
          'Hold the aquamarine or your hands over your heart and say the blessing slowly, with the wind on your face.',
        spoken: 'Be the wave beneath us kind and the wind behind us steady. Be the fog lifted and the rock seen. Be the harbour open when we come home.',
      },
      {
        title: 'Honour the sea’s lord',
        instructions:
          'If you honour Manannán, lay the bundle of rushes at the edge of the water, or on a stone above the tideline, as the Manx did. Otherwise, pour a little of the salt water back into the sea.',
        spoken: 'Manannán, lord of the waves, this is your rent, freely paid. Spread your cloak around us.',
      },
      {
        title: 'Board',
        instructions:
          'Touch the rail or the doorframe of the vessel as you board. Carry the aquamarine in an inside pocket.',
      },
    ],
    closing:
      'When you return safely, go back to the water’s edge and say thank you, even if only under your breath. Return the rushes or the stone to the shore.',
    safety:
      'No blessing replaces seamanship. Check the marine forecast, wear a life jacket on small boats, tell someone your route and expected return time, and follow the skipper’s and crew’s instructions. Don’t lean over rails or stand on slippery quaysides to do this ritual. Leave only natural, biodegradable offerings.',
    lore:
      'Sailors and fishing families everywhere have blessed boats and crossings. Carmina Gadelica (1900) records Gaelic prayers said on launching a boat and setting out to sea, calling on God and the saints to guard the crew. On the Isle of Man, an old ballad describes how landholders paid Manannán, the sea god and first ruler of the island, a “rent” of green rushes on Midsummer Eve; the custom is remembered in the rushes strewn on the Tynwald path each July, and has been revived by people today. The Romans honoured Neptune at the Neptunalia in July.',
    sources: [
      'Carmichael, Carmina Gadelica, vol. I (1900), on Hebridean sea and boat blessings',
      'The Manx Traditionary Ballad (printed in Train, History of the Isle of Man, 1845), on rushes paid to Manannán',
    ],
  },
];
