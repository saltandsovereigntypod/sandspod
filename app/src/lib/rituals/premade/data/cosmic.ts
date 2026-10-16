import type { Premade } from '../types';

// Cosmic (celestial) and crystal workings: lunar phases, eclipses, planetary
// days, the solar return, star devotion, and stone work done safely.

const CANDLE_SAFETY =
  'Never leave a lit candle unattended. Set it in a stable, heat-proof holder away from curtains, paper, hair and loose sleeves, and out of reach of children and pets. Snuff rather than blow out if you prefer, and make sure the wick is fully out before you leave the room.';

const NIGHT_OUTDOORS =
  'If you go outside after dark, tell someone where you are, take a torch (a red light keeps your night vision), dress for the cold and watch your footing. Stay on ground you know.';

export const COSMIC: Premade[] = [
  // ───────────────────────── Lunar phases ─────────────────────────
  {
    id: 'cosmic-new-moon-intentions',
    title: 'New Moon Seed Intentions',
    kind: 'ritual',
    summary:
      'A quiet sitting at the start of the lunar month to name what you mean to grow, written as seeds and planted in a pot of soil that you tend until the full moon.',
    intention: 'beginnings',
    alsoFor: ['prosperity', 'study'],
    practices: ['cosmic', 'green', 'solitary'],
    paths: [],
    moon: ['new'],
    minutes: 30,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A white or silver candle', ref: 'traditional/candle/silver' },
      { name: 'A clear quartz point', ref: 'traditional/crystal/clear_quartz' },
      { name: 'A moonstone', ref: 'traditional/crystal/moonstone', optional: true },
      { name: 'A small pot of potting soil' },
      { name: 'A few quick seeds: basil, cress or calendula', ref: 'traditional/herb/basil' },
      { name: 'Small slips of paper and a pencil' },
      { name: 'Your journal or book of shadows', ref: 'traditional/tool/book_of_shadows', optional: true },
    ],
    preparation:
      'Look up the exact time of the new moon for your location; the hours from then until the first thin crescent shows at dusk are the traditional window. Clear a small space by a window, set the pot of soil in the middle, and have your seeds and slips of paper ready.',
    steps: [
      {
        title: 'Arrive in the dark',
        instructions:
          'Sit with the lights low. The moon is between you and the sun now, unseen. Rest your hands on your knees and let your breath slow until you can hear it. Notice what you have been wanting without saying it out loud.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Light the first light',
        instructions:
          'Light the candle. Hold the quartz point in your writing hand and turn it slowly in the flame-light, letting it catch the glow. This is the first small light of the month.',
        spoken: 'Dark moon turning, new moon born,\nfirst light, first breath, first thread of morn.',
        light: true,
      },
      {
        title: 'Write your seeds',
        instructions:
          'Write one to three intentions, each on its own slip, in the present tense and small enough to tend in a month ("I practise Spanish ten minutes a day", not "I am fluent"). Fold each slip around a single seed.',
        minutes: 8,
      },
      {
        title: 'Plant them',
        instructions:
          'Press each folded slip into the soil with your fingertip, about two knuckles deep, and sprinkle the rest of the seeds on top. Cover lightly. Feel the coolness of the soil under your nails.',
        spoken: 'Into the dark I set you down;\nrise with the moon, break through the ground.',
      },
      {
        title: 'Set the stone to watch',
        instructions:
          'Lay the quartz point on the soil with its tip facing up, and the moonstone beside it if you have one. Water gently until the soil is just damp.',
      },
      {
        title: 'Sit with the beginning',
        instructions:
          'Watch the candle and picture the first green hook of a sprout pushing up. Let the picture be patient. When the timer ends, write the date and your intentions in your journal.',
        minutes: 5,
        timed: true,
        snuff: true,
      },
    ],
    closing:
      'Keep the pot on a sunny sill and water it as the moon fills. Each time you water, take one small action toward a seed. At the full moon, look at what has come up and what has not, and be curious rather than harsh about both.',
    safety: CANDLE_SAFETY,
    lore:
      'Greeting the new moon is old and widespread: Carmichael recorded islanders in Barra bowing to the first sight of the new moon in the nineteenth century, and English folklore had people turn the silver in their pockets for luck. Writing formal intentions at the new moon is a modern practice that grew from 1970s and 1980s lunar astrology and goddess spirituality. Planting with the waxing moon echoes very old farm lore about sowing as the moon grows.',
    sources: [
      'Carmichael, Carmina Gadelica (1900), notes on the new moon prayer of Barra',
      'Pliny the Elder, Natural History, Book 18 (on lunar timing in farming)',
      'Folklore scholarship on English new moon customs',
    ],
  },
  {
    id: 'cosmic-waxing-moon-growth-jar',
    title: 'Waxing Moon Growing Jar',
    kind: 'spell',
    summary:
      'A jar you add to on each night of the waxing moon, one coin, leaf or stone at a time, so a goal grows visibly alongside the light.',
    intention: 'prosperity',
    alsoFor: ['courage', 'beginnings'],
    practices: ['cosmic', 'crystal', 'kitchen'],
    paths: [],
    moon: ['waxing'],
    minutes: 15,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A clean jar with a lid', ref: 'traditional/vessel/spell_jar' },
      { name: 'A green candle', ref: 'traditional/candle/green' },
      { name: 'Green aventurine', ref: 'traditional/crystal/green_aventurine' },
      { name: 'Citrine', ref: 'traditional/crystal/citrine', optional: true },
      { name: 'Dried basil', ref: 'traditional/herb/basil' },
      { name: 'A cinnamon stick', ref: 'traditional/herb/cinnamon' },
      { name: 'A handful of small coins' },
      { name: 'A bay leaf and a pen', ref: 'traditional/herb/bay' },
    ],
    preparation:
      'Begin on the first evening you can see the crescent in the west after sunset. Write your growing goal on the bay leaf. Place the jar, coins and herbs where you will pass them each evening.',
    steps: [
      {
        title: 'Find the crescent',
        instructions:
          'If you can, step outside or to a west-facing window just after sunset and find the thin moon. If cloud hides it, picture it. Notice its horns point away from where the sun went down.',
        minutes: 2,
      },
      {
        title: 'Light and lay the foundation',
        instructions:
          'Light the green candle. Lay the bay leaf flat in the bottom of the jar, then the cinnamon stick and a pinch of basil. Drop in the aventurine.',
        spoken: 'Moon on the rise, grow what I sow;\nleaf over leaf, let it grow.',
        light: true,
      },
      {
        title: 'The first coin',
        instructions:
          'Hold one coin between your palms until it warms. Name one concrete step you will take tomorrow toward your goal, then drop the coin in and listen to it ring.',
      },
      {
        title: 'Close for the night',
        instructions:
          'Put the lid on, give the jar a gentle clockwise turn on the table, and snuff the candle. Leave the jar where moonlight or window light reaches it.',
        snuff: true,
      },
      {
        title: 'Each night until full',
        instructions:
          'Every evening of the waxing moon, relight the candle for a few minutes, add one more coin (or a pinch of basil, or the citrine on the night of the first quarter), and name the next step. The jar fills as the moon fills.',
        spoken: 'A little more light, a little more gold.',
      },
    ],
    closing:
      'On the full moon, hold the full jar and thank it. Keep it sealed on a shelf in your kitchen or workspace. When the goal is met, spend or give away the coins and return the herbs to the earth.',
    safety: CANDLE_SAFETY + ' Keep the dried herbs well away from the flame.',
    lore:
      'The idea that things begun on a growing moon will grow is ancient farm and household lore, recorded from Roman agricultural writers through to Victorian almanacs. Basil, cinnamon and bay as money herbs come from modern Western correspondences; aventurine as a "luck stone" is a twentieth-century attribution. Adding to a working night by night is a modern adaptation.',
    sources: [
      'Pliny the Elder, Natural History, Book 18',
      'Frazer, The Golden Bough (3rd ed., 1906–15), on sympathetic magic and the moon’s influence on growth',
    ],
  },
  {
    id: 'cosmic-full-moon-charging-moon-water',
    title: 'Full Moon Charging and Moon Water',
    kind: 'ritual',
    summary:
      'Set out your stones and tools under the full moon and make a jar of moon water for washing, plants and sprinkling, with clear guidance on keeping it clean and safe.',
    intention: 'cleansing',
    alsoFor: ['intuition', 'healing'],
    practices: ['cosmic', 'crystal', 'sea', 'elemental'],
    paths: [],
    moon: ['full'],
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A clean glass jar or bottle with a lid', ref: 'traditional/vessel/bottle' },
      { name: 'Fresh tap or filtered water' },
      { name: 'A silver or white candle', ref: 'traditional/candle/white' },
      { name: 'Clear quartz (water-safe)', ref: 'traditional/crystal/clear_quartz' },
      { name: 'Moonstone', ref: 'traditional/crystal/moonstone' },
      { name: 'A selenite wand, kept dry beside the jar', ref: 'traditional/crystal/selenite', optional: true },
      { name: 'A bowl or tray for your stones', ref: 'traditional/vessel/bowl' },
      { name: 'A label and pen' },
    ],
    preparation:
      'Wash the jar in hot soapy water and rinse it well. Choose a spot on a sill, balcony or garden table where the moon will cross. Gather the stones and tools you want to charge, and check which ones are safe in water before anything touches it.',
    steps: [
      {
        title: 'Greet the moon',
        instructions:
          'Go where you can see her rise, or where her light falls. Stand with your palms open at your sides and let your shoulders drop. Notice the colour of the light on your hands.',
        spoken: 'Lady of the full round night,\nlend this water your silver light.',
        minutes: 3,
      },
      {
        title: 'Fill the jar',
        instructions:
          'Fill the jar with fresh water. Put the lid on loosely, or cover the mouth with a clean cloth, so nothing falls in overnight. Only water-safe, hard stones such as clear quartz or moonstone may go inside, and only when the water is not for drinking.',
      },
      {
        title: 'Lay out your stones',
        instructions:
          'Arrange your stones on the tray around the jar. Soft or water-soluble stones (selenite, malachite, pyrite, lepidolite, kyanite, turquoise) stay dry on the tray. Sun-fading stones such as amethyst, rose quartz and citrine are fine here: moonlight will not fade them, but bring them in before morning sun reaches them.',
      },
      {
        title: 'Light and set the charge',
        instructions:
          'Light the candle beside the tray, safely out of the wind. Hold your hands over the jar and stones and say what you want the water to carry: clarity, rest, a fresh start.',
        spoken: 'Fill and brighten, cleanse and clear;\nall that is held in light is here.',
        light: true,
      },
      {
        title: 'Moon-gaze',
        instructions:
          'Sit and look at the moon or its light on the water. Let thoughts pass like clouds. When the timer ends, snuff the candle and leave the jar and stones out overnight if the spot is safe and dry.',
        minutes: 8,
        timed: true,
        snuff: true,
      },
      {
        title: 'Bring it in and label it',
        instructions:
          'Before sunrise, or first thing, bring everything indoors. Label the jar with the date, the moon and the purpose. Put the stones back in their places.',
      },
    ],
    closing:
      'Use the moon water within a week: in a ritual bath, to wipe your altar, to water houseplants, in a spray bottle for a room, or to anoint doorways. Keep it in the fridge if you want it to last the whole week, and pour it onto the garden when it is done.',
    safety:
      CANDLE_SAFETY +
      ' Moon water left outdoors is not drinking water: dust, insects and bacteria get in. Do not drink it unless you made it in a sealed, clean bottle from drinking water with no stones inside, and even then drink it the same day. Never put soft, porous or metal-bearing stones in any water. Discard water that turns cloudy or smells.',
    lore:
      'Leaving water out under the moon appears in older folk practice (dew and moon-washed water for the complexion, for example) but "moon water" as a named, everyday tool is a modern Pagan and witchcraft practice that spread widely from the 1990s. Charging stones in moonlight is likewise modern. Moonstone has been linked with the moon since at least the Renaissance lapidaries.',
    sources: [
      'Marbodus of Rennes, De Lapidibus (11th c.), on moon-linked stones',
      'Folklore collections on dew and moonlight washing',
    ],
  },
  {
    id: 'cosmic-waning-moon-release',
    title: 'Waning Moon Unknotting',
    kind: 'spell',
    summary:
      'A knot working for the shrinking moon: tie what you are ready to let go into a cord, and untie or cut one knot each night until the dark moon.',
    intention: 'banishing',
    alsoFor: ['cleansing', 'healing'],
    practices: ['cosmic', 'folk', 'crystal'],
    paths: [],
    moon: ['waning'],
    minutes: 20,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A length of black or grey cotton cord, about an arm long' },
      { name: 'A black or grey candle', ref: 'traditional/candle/grey' },
      { name: 'Smoky quartz', ref: 'traditional/crystal/smoky_quartz' },
      { name: 'Apache tear', ref: 'traditional/crystal/apache_tear', optional: true },
      { name: 'A dish of salt', ref: 'traditional/vessel/dish' },
      { name: 'Small scissors' },
    ],
    preparation:
      'Begin the night after the full moon, or any night of the waning moon, counting the nights left until the dark moon so you know how many knots to tie (up to seven). Have the cord, salt and stone ready.',
    steps: [
      {
        title: 'Name the load',
        instructions:
          'Sit with the cord across your lap and the smoky quartz in your left hand. Think of one habit, worry or tie you are ready to set down. Be specific and keep it about you or the situation, not about another person.',
        minutes: 4,
      },
      {
        title: 'Light the waning light',
        instructions: 'Light the candle and look at it until it steadies.',
        spoken: 'As the moon wears thin, so you wear thin;\nwhat I bind tonight, I will not take in.',
        light: true,
      },
      {
        title: 'Tie the knots',
        instructions:
          'Tie a loose knot for each night left until the dark moon, spacing them along the cord. With each knot, breathe out into it and name a piece of the thing you are releasing.',
      },
      {
        title: 'Rest it in salt',
        instructions:
          'Coil the knotted cord in the dish of salt with the smoky quartz on top. Snuff the candle.',
        snuff: true,
      },
      {
        title: 'Each night: one knot',
        instructions:
          'Each night of the waning moon, briefly relight the candle, take the cord out, and untie (or snip) one knot. Feel your shoulders loosen as you do. Return the cord to the salt.',
        spoken: 'One more undone. Lighter I run.',
      },
      {
        title: 'The last knot',
        instructions:
          'On the dark moon, undo the last knot. Bin the salt (it harms soil and plants) and bury or bin the cord away from your home, then rinse the smoky quartz under running water.',
      },
    ],
    closing:
      'Wash your hands in cool water and do something plainly kind for yourself. Notice over the next month how much less room the thing takes.',
    safety: CANDLE_SAFETY,
    lore:
      'Knot magic is very old: tying and untying knots to bind or release appears in Greek and Roman sources and in British and Scandinavian folklore (sailors buying winds tied in knots, for example). Working banishing on the waning moon follows long-standing farm and folk timing that the moon takes away as it shrinks. The night-by-night form is a modern arrangement.',
    sources: [
      'Frazer, The Golden Bough (1890), on knots and loosening',
      'Pliny the Elder, Natural History, Book 28, on knots',
    ],
  },
  {
    id: 'cosmic-dark-moon-rest-shadow',
    title: 'Dark Moon Rest and Shadow Pages',
    kind: 'ritual',
    summary:
      'A gentle, unhurried dark moon night of rest and honest journaling: meeting the parts of yourself you usually hurry past, with a stone to hold you steady.',
    intention: 'peace',
    alsoFor: ['healing', 'intuition'],
    practices: ['cosmic', 'hedge', 'crystal', 'solitary'],
    paths: [],
    moon: ['dark'],
    minutes: 45,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'An indigo or black candle', ref: 'traditional/candle/indigo' },
      { name: 'Obsidian or a black onyx', ref: 'traditional/crystal/obsidian' },
      { name: 'Labradorite', ref: 'traditional/crystal/labradorite', optional: true },
      { name: 'A cup of chamomile tea', ref: 'traditional/herb/chamomile' },
      { name: 'Your journal and pen', ref: 'traditional/tool/book_of_shadows' },
      { name: 'A blanket' },
    ],
    preparation:
      'Choose the night before the new moon, when no moon is seen. Clear your evening of plans. Make the tea, wrap yourself in the blanket, and set the candle and stone within reach. Decide beforehand that nothing you write tonight has to be shared or fixed.',
    steps: [
      {
        title: 'Permission to stop',
        instructions:
          'Sit or lie down in the dark. Put both hands on your belly and breathe into them. Let the day fall off you; the moon has gone quiet too.',
        minutes: 5,
        timed: true,
      },
      {
        title: 'A small light',
        instructions:
          'Light the candle and hold the obsidian in both hands. Notice its weight and coolness, then how it warms.',
        spoken: 'No moon above, no mask below;\nI sit in the dark and let it show.',
        light: true,
      },
      {
        title: 'The first page',
        instructions:
          'Write freely for ten minutes in answer to: "What did I feel this month that I didn\'t let myself feel?" Do not tidy the handwriting or the thoughts.',
        minutes: 10,
      },
      {
        title: 'Meet it kindly',
        instructions:
          'Read back what you wrote. Choose one line that stings. Ask it, in writing, "What were you trying to protect?" Write its answer as if it could speak.',
        minutes: 10,
      },
      {
        title: 'Gaze into the dark stone',
        instructions:
          'Hold the obsidian (or labradorite, turning it until the flash shows) in the candlelight and look softly at its surface. Let any image or word rise, without chasing it. Note it down.',
        minutes: 5,
        timed: true,
      },
      {
        title: 'Close the book',
        instructions:
          'Write one sentence of thanks to yourself for looking. Close the journal, snuff the candle and finish your tea in the dark.',
        spoken: 'Seen and held. Enough for tonight.',
        snuff: true,
      },
    ],
    closing:
      'Go to bed early. Leave the pages closed until the new moon, when you can read them again with fresh eyes and decide whether any seed belongs in next month\'s intentions.',
    safety:
      CANDLE_SAFETY +
      ' Shadow work can stir up strong feelings. If it brings up trauma or thoughts of self-harm, stop, ground yourself with food and warmth, and reach out to someone you trust or a crisis line. This practice is no substitute for therapy. Chamomile is related to ragweed; skip it if you have that allergy.',
    lore:
      'Many traditions kept the moonless nights for rest or for honouring the underworld: the Athenian Hekate\'s Deipnon fell on the last day of the lunar month. "Shadow work" as a term comes from Carl Jung\'s psychology of the shadow (mid-twentieth century) and was taken into modern witchcraft from the 1990s. Black mirror and dark-stone gazing has a long history in European scrying, including John Dee\'s obsidian mirror.',
    sources: [
      'Jung, on the shadow (as summarised in psychological scholarship)',
      'Scholarship on the Athenian Deipnon and Hekate',
      'British Museum records on John Dee\'s obsidian mirror',
    ],
  },

  // ───────────────────────── Eclipses ─────────────────────────
  {
    id: 'cosmic-solar-eclipse-threshold',
    title: 'Solar Eclipse Threshold',
    kind: 'ritual',
    summary:
      'Watch the sun\'s light dim and return safely, through eclipse glasses or a pinhole projector, and mark the moment as a doorway between one chapter and the next.',
    intention: 'beginnings',
    alsoFor: ['courage', 'banishing'],
    practices: ['cosmic', 'elemental'],
    paths: [],
    moon: ['eclipse', 'new'],
    minutes: 40,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'Certified eclipse glasses (ISO 12312-2) or a pinhole projector' },
      { name: 'A sheet of white card and a second card with a pinhole' },
      { name: 'Sunstone', ref: 'traditional/crystal/sunstone' },
      { name: 'Obsidian or jet', ref: 'traditional/crystal/obsidian' },
      { name: 'A slip of paper and pencil' },
      { name: 'A gold candle for afterwards', ref: 'traditional/candle/gold', optional: true },
    ],
    preparation:
      'Check the eclipse times for your exact location: start, maximum and end. Test your glasses (they should show nothing but the sun itself, and should be unscratched) or make a pinhole viewer by poking a neat hole in one card and letting the sun shine through it onto the other. Before the eclipse, write on the paper one thing you are leaving behind on one side, and one thing you are stepping toward on the other.',
    steps: [
      {
        title: 'Set your eyes safe first',
        instructions:
          'Put your glasses on before you look up, and take them off only after you have looked away. If using the pinhole, stand with your back to the sun and watch the little image on the white card. Never look at the sun directly, through sunglasses, or through a camera, phone, binoculars or telescope.',
      },
      {
        title: 'The bite',
        instructions:
          'As first contact begins, hold the sunstone in your right hand and the obsidian in your left. Watch the first dark curve appear on the disc. Notice what the birds, the temperature and the shadows are doing.',
        spoken: 'Day holds its breath; the door swings wide.',
        minutes: 5,
      },
      {
        title: 'Leaf shadows',
        instructions:
          'If there are trees, look at the ground beneath them: the gaps between leaves become pinholes and scatter hundreds of little crescent suns. Let this small wonder land.',
        minutes: 3,
      },
      {
        title: 'At the maximum',
        instructions:
          'At the deepest point, hold the paper with the "leaving behind" side facing the dark stone. Breathe out slowly three times. If you are in the path of totality, and only while the sun is completely covered, you may take your glasses off to see the corona; put them back on the instant any bright edge returns.',
        spoken: 'In the space between the light and light,\nI set it down. I let it go.',
        minutes: 3,
      },
      {
        title: 'The light returns',
        instructions:
          'As the sun regrows, turn the paper over to the "stepping toward" side and hold it beside the sunstone. Feel the warmth return to your skin.',
        spoken: 'Light comes back, and I come with it.',
        minutes: 5,
      },
      {
        title: 'Seal at home',
        instructions:
          'Indoors, light the gold candle if you like and read your stepping-toward line aloud. Fold the paper toward you and keep it with the sunstone until the next new moon.',
        light: true,
        snuff: true,
      },
    ],
    closing:
      'Take the first small step you named within three days. Write in your journal what the eclipse felt like, the birdsong, the cool, the strange light, while it is fresh.',
    safety:
      'Eye safety comes first: looking at the sun, even mostly covered, can permanently damage your eyes with no pain to warn you. Use only eclipse glasses or viewers that meet ISO 12312-2, or indirect projection. Ordinary sunglasses, smoked glass and unfiltered camera, binocular or telescope views are not safe. Supervise children closely. Only during totality, when the sun is fully covered, is it safe to look without protection. ' +
      CANDLE_SAFETY,
    lore:
      'Eclipses frightened and fascinated people everywhere: Babylonian astronomers predicted them and kept omen records, and Herodotus tells of a battle halted by one. Many cultures made noise to drive off whatever was "eating" the sun. Treating an eclipse as a threshold for personal change comes from modern astrology, which reads solar eclipses as powerful new moons.',
    sources: [
      'Herodotus, Histories 1.74 (the eclipse of Thales)',
      'Scholarship on Babylonian astronomical diaries and eclipse omens',
      'NASA and American Astronomical Society eclipse safety guidance',
    ],
  },
  {
    id: 'cosmic-lunar-eclipse-vigil',
    title: 'Blood Moon Vigil',
    kind: 'ritual',
    summary:
      'Sit with a total or partial lunar eclipse as the earth\'s shadow turns the moon copper-red, for a vigil of release and inner seeing.',
    intention: 'intuition',
    alsoFor: ['banishing', 'healing'],
    practices: ['cosmic', 'hedge', 'crystal'],
    paths: [],
    moon: ['eclipse', 'full'],
    minutes: 60,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A red candle', ref: 'traditional/candle/red' },
      { name: 'Garnet or red jasper', ref: 'traditional/crystal/garnet' },
      { name: 'Moonstone', ref: 'traditional/crystal/moonstone' },
      { name: 'A bowl of water to catch the moon\'s reflection', ref: 'traditional/vessel/bowl' },
      { name: 'Mugwort for a dream pillow afterwards (not to eat)', ref: 'traditional/herb/mugwort', optional: true },
      { name: 'A warm coat and something to sit on' },
      { name: 'Your journal', ref: 'traditional/tool/book_of_shadows' },
    ],
    preparation:
      'Check the times for the partial phase, totality and end where you live. Lunar eclipses are safe to watch with your bare eyes, binoculars or a telescope. Set up your seat, bowl and stones outdoors or at a window facing the moon.',
    steps: [
      {
        title: 'Full and bright',
        instructions:
          'Before the shadow arrives, look at the full moon and set the bowl of water so her reflection floats in it. Hold the moonstone and notice how bright the night is.',
        minutes: 5,
      },
      {
        title: 'The shadow touches',
        instructions:
          'As the earth\'s shadow begins to take a curved bite from the moon, light the red candle (sheltered from wind). Say what is ending in your life, out loud and plainly.',
        spoken: 'Earth\'s own shadow crosses you;\nwhat is finished, let it through.',
        light: true,
      },
      {
        title: 'Watch it redden',
        instructions:
          'Switch to the garnet. As totality comes, watch the colour change: rust, copper, sometimes deep brick. That red is every sunrise and sunset on earth, bent onto the moon. Breathe with it.',
        minutes: 10,
        timed: true,
      },
      {
        title: 'Scry the bowl',
        instructions:
          'During totality, gaze softly at the dim red moon in the bowl. Let images, words or memories come. Write them down without judging them.',
        minutes: 10,
      },
      {
        title: 'The light comes back',
        instructions:
          'As the first silver edge returns, hold the moonstone again and name one thing you will carry forward from what you saw.',
        spoken: 'Silver returns, and I return.',
      },
      {
        title: 'Close the vigil',
        instructions:
          'Pour the bowl water onto the earth or a plant. Snuff the candle. If you like, tuck a little mugwort into a cloth pouch for your pillow, for dreams.',
        snuff: true,
      },
    ],
    closing:
      'Sleep with your journal by the bed and write down any dreams before you speak to anyone in the morning. Read your eclipse notes again at the next full moon.',
    safety:
      CANDLE_SAFETY +
      ' ' +
      NIGHT_OUTDOORS +
      ' Mugwort is for the pillow only: do not eat or drink it, and avoid it entirely if pregnant or trying to conceive, or if you are allergic to ragweed or daisies. Keep it away from pets.',
    lore:
      'Lunar eclipses were read as omens in Babylon, China and Rome, and many peoples made noise to rescue the moon. The term "blood moon" for a totally eclipsed moon is a recent popular coinage, spread from about 2013. Bowl scrying is an old divinatory method; using an eclipse for release and vision is modern astrological practice.',
    sources: [
      'Plutarch, Life of Nicias 23 (the eclipse of 413 BCE)',
      'Scholarship on Babylonian eclipse omens',
    ],
  },

  // ───────────────────────── Planetary days ─────────────────────────
  {
    id: 'cosmic-sunday-sun-success',
    title: 'Sunday Sun Crown',
    kind: 'spell',
    summary:
      'A morning working on the Sun\'s day for success, recognition and vitality: a gold candle, a crown of bay, and a sentence of your own worth said aloud in the sunlight.',
    intention: 'prosperity',
    alsoFor: ['courage', 'healing'],
    practices: ['cosmic', 'crystal', 'green'],
    paths: [],
    weekday: 0,
    moon: ['waxing', 'full'],
    minutes: 20,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A gold or yellow candle', ref: 'traditional/candle/gold' },
      { name: 'Sunstone', ref: 'traditional/crystal/sunstone' },
      { name: 'Citrine or tiger eye', ref: 'traditional/crystal/citrine' },
      { name: 'Three bay leaves', ref: 'traditional/herb/bay' },
      { name: 'A pinch of frankincense resin', ref: 'traditional/herb/frankincense', optional: true },
      { name: 'A charcoal disc and a proper incense burner, for the resin', ref: 'traditional/tool/incense_burner', optional: true },
      { name: 'Calendula petals', ref: 'traditional/herb/calendula' },
      { name: 'A heat-proof dish', ref: 'traditional/vessel/dish' },
    ],
    preparation:
      'Do this on a Sunday, ideally in the first hour after sunrise (the traditional hour of the Sun on its own day) or at noon. Sit where the sun reaches you. Write on each bay leaf one thing you have done well.',
    steps: [
      {
        title: 'Face the sun',
        instructions:
          'Turn your face toward the sun with your eyes closed, and feel the warmth on your eyelids. Never look straight at it. Breathe in through your nose for four counts and out for six.',
        minutes: 2,
      },
      {
        title: 'Light the gold',
        instructions:
          'Light the gold candle. Ring it with the calendula petals and set the sunstone and citrine in front of it so they catch the light.',
        spoken: 'Sun on the hill and gold in the flame,\nlet them know my work, my face, my name.',
        light: true,
      },
      {
        title: 'Read your bay',
        instructions:
          'Hold each bay leaf in turn, read aloud what you did well, and lay it in a circle around the candle like a small crown. Do not shrink the words.',
      },
      {
        title: 'Name the success',
        instructions:
          'Hold the citrine and say, in one sentence, the success you are working toward this season, as if it is already true. If you have frankincense, drop a grain onto a lit charcoal disc in the dish, or simply smell the resin.',
        spoken: 'As the Sun returns each day, so returns my strength.',
      },
      {
        title: 'Bask',
        instructions:
          'Sit back and let the candle and the sun do the rest. Picture yourself being thanked, chosen or praised for real work. Let it feel ordinary.',
        minutes: 6,
        timed: true,
        snuff: true,
      },
    ],
    closing:
      'Carry the sunstone today. Put one bay leaf in your wallet or work bag and return the others to the garden. Do one visible thing this week that lets people see what you can do.',
    safety:
      CANDLE_SAFETY +
      ' Do not look directly at the sun. If you burn resin on charcoal, use a proper burner on a heat-proof surface with the window open, keep charcoal away from children and pets, and skip the smoke if you or anyone in the house has asthma; smelling the resin unburned works too.',
    lore:
      'The seven-day planetary week, each day ruled by one of the seven classical "planets" in the Chaldean order, was in common use in the Roman world by the first century CE (Cassius Dio explains it). Sunday is the Sun\'s day in most European languages. Gold, bay, frankincense and marigold as solar materials appear in Renaissance tables of correspondences such as Agrippa\'s; sunstone is a later, modern attribution.',
    sources: [
      'Cassius Dio, Roman History 37.18–19 (on the planetary week)',
      'Agrippa, Three Books of Occult Philosophy (1533; English 1651), Book I, on solar things',
      'Homeric Hymn 31, To Helios (Evelyn-White, 1914)',
    ],
  },
  {
    id: 'cosmic-monday-moon-intuition',
    title: 'Monday Moon Bowl',
    kind: 'ritual',
    summary:
      'An evening water-scrying and dream working for the Moon\'s day, to open your intuition with silver, moonstone and jasmine.',
    intention: 'intuition',
    alsoFor: ['peace', 'healing'],
    practices: ['cosmic', 'crystal', 'hedge', 'sea'],
    paths: [],
    weekday: 1,
    moon: ['full', 'waxing'],
    minutes: 30,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A silver or white candle', ref: 'traditional/candle/silver' },
      { name: 'Moonstone', ref: 'traditional/crystal/moonstone' },
      { name: 'Selenite, kept dry', ref: 'traditional/crystal/selenite', optional: true },
      { name: 'A dark bowl of water', ref: 'traditional/vessel/bowl' },
      { name: 'A few jasmine flowers or a jasmine tea bag', ref: 'traditional/herb/jasmine' },
      { name: 'A little dried mugwort for the pillow (not to eat)', ref: 'traditional/herb/mugwort', optional: true },
      { name: 'A small cloth pouch' },
    ],
    preparation:
      'On Monday evening, dim the room. Fill the dark bowl with water and float the jasmine on it. Place the candle so its reflection, not its flame, shows on the water.',
    steps: [
      {
        title: 'Silver hour',
        instructions:
          'Sit before the bowl with the moonstone in your left (receiving) hand. Breathe slowly. Notice the jasmine scent and how the water trembles with your breath.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Light the moon-candle',
        instructions: 'Light the silver candle and watch its reflection settle on the water.',
        spoken: 'Moon of the tides and the sleeping sea,\nwhat I need to know, show to me.',
        light: true,
      },
      {
        title: 'Ask one question',
        instructions:
          'Ask one open question aloud (begin with "What" or "How", not "Will"). Then let your eyes soften on the water, looking past the surface rather than at it.',
      },
      {
        title: 'Scry',
        instructions:
          'Keep your gaze soft. Shapes, colours, a word or a feeling may come. Do not grab at them. If your eyes tire, blink and return.',
        minutes: 10,
        timed: true,
      },
      {
        title: 'Write what came',
        instructions:
          'Write everything, however odd. A single image counts. Then write what your body felt during the gazing.',
        minutes: 5,
      },
      {
        title: 'Dream pouch',
        instructions:
          'Put the moonstone and a pinch of mugwort (or a few jasmine flowers) into the cloth pouch and tie it. Snuff the candle and pour the water onto a plant.',
        spoken: 'Speak to me sleeping.',
        snuff: true,
      },
    ],
    closing:
      'Tuck the pouch inside your pillowcase. In the morning, write down your dreams before you look at your phone, and compare them with what you saw in the bowl.',
    safety:
      CANDLE_SAFETY +
      ' Mugwort must not be eaten or drunk here; avoid it entirely if pregnant or trying to conceive, if you have a ragweed or daisy allergy, and keep it away from pets. Leave it out if it gives you restless nights. Use true jasmine (Jasminum) or a jasmine tea bag: "Carolina" or "yellow" jasmine (Gelsemium) is a different, highly poisonous plant.',
    lore:
      'Monday is the Moon\'s day across Europe (Lunae dies, Montag, lundi). In Agrippa\'s Renaissance tables silver, white and green stones, the moon-stone he calls selenites, and water and all moist things belong to the Moon. Lecanomancy, divination with a bowl of water, is ancient and appears in the Greek Magical Papyri. Dream pillows of mugwort are folk and modern herbal practice.',
    sources: [
      'Agrippa, Three Books of Occult Philosophy (1533; English 1651), Book I, on lunar things',
      'Greek Magical Papyri (on bowl divination), in Betz\'s translated edition and older translations',
    ],
  },
  {
    id: 'cosmic-tuesday-mars-courage',
    title: 'Tuesday Mars Spark',
    kind: 'spell',
    summary:
      'A short, fiery Tuesday working to call up courage before a hard conversation, a test of nerve, or a step you\'ve been putting off.',
    intention: 'courage',
    alsoFor: ['protection', 'banishing'],
    practices: ['cosmic', 'crystal', 'elemental', 'kitchen'],
    paths: [],
    weekday: 2,
    moon: ['waxing'],
    minutes: 15,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A red candle', ref: 'traditional/candle/red' },
      { name: 'Carnelian', ref: 'traditional/crystal/carnelian' },
      { name: 'Red jasper or bloodstone', ref: 'traditional/crystal/red_jasper' },
      { name: 'A slice of fresh ginger', ref: 'traditional/herb/ginger' },
      { name: 'A pinch of black pepper', ref: 'traditional/herb/black_pepper' },
      { name: 'A mug of hot water with honey' },
    ],
    preparation:
      'On a Tuesday, ideally before the brave thing itself. Slice the ginger and set the kettle on. Stand rather than sit for this one.',
    steps: [
      {
        title: 'Plant your feet',
        instructions:
          'Stand with feet hip-width apart, knees soft. Press down through your heels until you feel the floor push back. Roll your shoulders down and back.',
        minutes: 1,
      },
      {
        title: 'Strike the spark',
        instructions:
          'Light the red candle. Sprinkle a few grains of black pepper on the table around it (not into the flame) in a ring.',
        spoken: 'Red star rising, iron in the blood,\nI stand my ground the way that iron should.',
        light: true,
      },
      {
        title: 'Charge the carnelian',
        instructions:
          'Hold the carnelian in your fist over your solar plexus. Say plainly what you are afraid of, then what you will do anyway.',
        spoken: 'Afraid, and going. Shaking, and going.',
      },
      {
        title: 'The ginger cup',
        instructions:
          'Drop the ginger slice into the hot honey water. Stir clockwise seven times. Sip it while it is warm, feeling the heat spread down your chest.',
        minutes: 4,
      },
      {
        title: 'Snuff and go',
        instructions:
          'Snuff the candle. Brush the pepper into your hand and scatter it outside your front door, away from where pets walk.',
        snuff: true,
      },
    ],
    closing:
      'Put the carnelian and red jasper in your pocket and go do the thing today. Afterwards, touch the stones and thank yourself out loud.',
    safety:
      CANDLE_SAFETY +
      ' Use only culinary amounts of ginger. Ginger can interact with blood thinners; check with your doctor if that applies. Keep pepper away from eyes and pets.',
    lore:
      'Tuesday belongs to Mars in Latin (Martis dies, mardi) and to the war-god Tyr in English (Tiw\'s day). In Agrippa\'s Renaissance tables red and fiery colours, iron, the bloodstone and sharp, burning plants such as mustard and garlic are Martial; pepper and ginger as Mars herbs, and carnelian for courage, are later and modern correspondences. The ginger cup is a modern kitchen addition.',
    sources: [
      'Agrippa, Three Books of Occult Philosophy (1533; English 1651), Book I, ch. 27, on Martial things',
    ],
  },
  {
    id: 'cosmic-wednesday-mercury-study',
    title: 'Wednesday Mercury Desk Blessing',
    kind: 'spell',
    summary:
      'Bless your desk, books or tools on Mercury\'s day for clear thinking, good memory and quick, accurate words before study, exams or writing.',
    intention: 'study',
    alsoFor: ['beginnings', 'courage'],
    practices: ['cosmic', 'crystal', 'green'],
    paths: [],
    weekday: 3,
    minutes: 20,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A yellow or orange candle', ref: 'traditional/candle/yellow' },
      { name: 'Fluorite', ref: 'traditional/crystal/fluorite' },
      { name: 'Sodalite or blue lace agate', ref: 'traditional/crystal/sodalite' },
      { name: 'A sprig of rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'Fresh mint or peppermint', ref: 'traditional/herb/peppermint' },
      { name: 'Lavender', ref: 'traditional/herb/lavender', optional: true },
      { name: 'Your study materials, pen and notebook' },
    ],
    preparation:
      'On a Wednesday, clear your desk completely, wipe it down, and put back only what you need. Rub the mint between your fingers to release its scent.',
    steps: [
      {
        title: 'Clear the air',
        instructions:
          'Open a window for a minute of fresh air. Breathe in the mint and notice how sharp it is. Sit up straight with both feet on the floor.',
        minutes: 2,
      },
      {
        title: 'Light the quick flame',
        instructions:
          'Light the yellow candle at the top corner of your desk, away from papers.',
        spoken: 'Swift one, quick one, messenger bright,\nset my thoughts in order, set my words right.',
        light: true,
      },
      {
        title: 'Bless the tools',
        instructions:
          'Touch the rosemary sprig to your pen, your notebook and your books (or keyboard), one by one. Rosemary is the old herb of remembrance.',
        spoken: 'Rosemary for remembering.',
      },
      {
        title: 'Set the stones',
        instructions:
          'Place the fluorite at the top of your work and the sodalite by your writing hand. Hold the fluorite for a moment first, and notice its layered bands: order out of many colours.',
      },
      {
        title: 'One focused round',
        instructions:
          'Work for one focused stretch with the candle burning: read, revise or write without your phone. Stop when the timer sounds.',
        minutes: 12,
        timed: true,
        snuff: true,
      },
    ],
    closing:
      'Leave the stones on the desk, and take the fluorite into the exam room or meeting if you can. Tuck the rosemary into the book you are studying from as a bookmark.',
    safety:
      CANDLE_SAFETY +
      ' Keep the flame well clear of paper. Peppermint scent can be too strong for small children and cats; use garden mint if so.',
    lore:
      'Wednesday is Mercury\'s day in Romance languages (mercredi, miércoles) and Woden\'s in English; Roman writers matched Mercury with Odin. Renaissance tables give Mercury mixed colours, quicksilver and fine-leaved, aromatic herbs. "There\'s rosemary, that\'s for remembrance" (Hamlet, c. 1600) records an old belief; fluorite and sodalite for study are modern crystal lore.',
    sources: [
      'Agrippa, Three Books of Occult Philosophy (1533; English 1651), Book I, on Mercurial things',
      'Shakespeare, Hamlet IV.v (on rosemary)',
      'Tacitus, Germania 9 (Mercury identified with the Germanic god)',
    ],
  },
  {
    id: 'cosmic-thursday-jupiter-prosperity',
    title: 'Thursday Jupiter Open Hand',
    kind: 'ritual',
    summary:
      'A generous Thursday rite for abundance and good fortune that works on the old principle of Jupiter: blessings flow to an open hand, so you give before you ask.',
    intention: 'prosperity',
    alsoFor: ['beginnings', 'protection'],
    practices: ['cosmic', 'crystal', 'green'],
    paths: [],
    weekday: 4,
    moon: ['waxing', 'full'],
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A royal blue or purple candle', ref: 'traditional/candle/blue' },
      { name: 'Lapis lazuli', ref: 'traditional/crystal/lapis_lazuli' },
      { name: 'Amethyst or sapphire', ref: 'traditional/crystal/amethyst', optional: true },
      { name: 'A sprig of garden sage', ref: 'traditional/herb/sage' },
      { name: 'Three cloves', ref: 'traditional/herb/clove' },
      { name: 'An acorn or oak leaf', ref: 'traditional/herb/oak' },
      { name: 'A coin to give away, or a small donation set aside' },
    ],
    preparation:
      'On a Thursday, ideally while the moon is waxing. Decide on a real act of generosity to make today: a coin in a busker\'s case, a donation, paying for someone\'s coffee, a gift of time.',
    steps: [
      {
        title: 'Open the hands',
        instructions:
          'Sit tall, rest your hands palm up on your knees, and breathe. Notice where you clench around money or opportunity, and let your fingers uncurl.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Light the royal flame',
        instructions:
          'Light the blue candle. Set the lapis before it and the oak leaf or acorn beside it.',
        spoken: 'Great one of the oak and the wide blue sky,\nlet blessing come by, let blessing come by.',
        light: true,
      },
      {
        title: 'Give first',
        instructions:
          'Hold the coin you will give away (or write down the donation). Say what you are giving, and to whom, with no strings attached.',
        spoken: 'Freely given, freely flows.',
      },
      {
        title: 'Stud the sage',
        instructions:
          'Press the three cloves gently into the sage sprig or lay them on it: one for what you have, one for what is coming, one for what you will share.',
      },
      {
        title: 'Ask large',
        instructions:
          'Hold the lapis and ask, generously and without apology, for the abundance you need: work, a home, a lucky break. Jupiter is the planet of expansion; let the request be roomy.',
        minutes: 5,
      },
      {
        title: 'Close',
        instructions:
          'Snuff the candle. Wrap the sage, cloves and acorn in a twist of blue cloth or paper and put it in your wallet or cash box.',
        snuff: true,
      },
    ],
    closing:
      'Make your act of generosity today. Keep the bundle until the next Thursday of a waxing moon, then return the herbs to the earth and refresh it.',
    safety: CANDLE_SAFETY,
    lore:
      'Thursday is Jupiter\'s day in Latin (Iovis dies, jeudi) and Thor\'s in English. Jupiter was the "greater fortune" in Hellenistic and medieval astrology. Agrippa gives him tin, sweet tastes, the sapphire and "airy" colours, and the oak among his lucky trees; clove and sage as Jupiter herbs come from later tables, and lapis lazuli for Jupiter is a modern attribution. Giving to receive is a modern framing of an old idea of reciprocity.',
    sources: [
      'Agrippa, Three Books of Occult Philosophy (1533; English 1651), Book I, on Jovial things',
      'Ptolemy, Tetrabiblos (on the benefic planets)',
    ],
  },
  {
    id: 'cosmic-friday-venus-love',
    title: 'Friday Venus Rose Bath',
    kind: 'ritual',
    summary:
      'A Friday evening bath or basin ritual to draw love toward you and soften you to it, with rose, rose quartz and a green candle for the planet of beauty.',
    intention: 'love',
    alsoFor: ['healing', 'peace'],
    practices: ['cosmic', 'crystal', 'green', 'kitchen'],
    paths: [],
    weekday: 5,
    moon: ['waxing', 'full'],
    minutes: 40,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A green or pink candle', ref: 'traditional/candle/green' },
      { name: 'Rose quartz (water-safe for a short soak)', ref: 'traditional/crystal/rose_quartz' },
      { name: 'Emerald or green aventurine', ref: 'traditional/crystal/green_aventurine', optional: true },
      { name: 'A handful of rose petals (unsprayed)', ref: 'traditional/herb/rose' },
      { name: 'A vanilla pod or a splash of vanilla extract', ref: 'traditional/herb/vanilla' },
      { name: 'A cup of milk or a spoon of honey' },
      { name: 'A muslin bag or tea strainer' },
    ],
    preparation:
      'On a Friday evening, clean the bath (or a large basin for your feet). Put the rose petals and a split vanilla pod in the muslin bag. Warm the milk or dissolve the honey in a cup of hot water.',
    steps: [
      {
        title: 'Make the room beautiful',
        instructions:
          'Dim the lights, put on music you love, and put a towel to warm. Venus is pleased by beauty; take an extra minute to make the space lovely.',
      },
      {
        title: 'Light for Venus',
        instructions:
          'Light the green candle well away from towels and curtains.',
        spoken: 'Evening star, the first to shine,\nlet love find the door, and find it mine.',
        light: true,
      },
      {
        title: 'Steep the waters',
        instructions:
          'Run the water warm. Hang the muslin bag under the tap so the water runs through it, then pour in the milk or honey water. Place the rose quartz in the bath.',
      },
      {
        title: 'Soak and soften',
        instructions:
          'Get in slowly. With each scoop of water over your shoulders, name something lovable about yourself. Then imagine the kind of love you want, its warmth and how it treats you, without giving it any particular person\'s face.',
        spoken: 'Open as the rose, sweet as the vanilla,\nI am ready to be loved well.',
        minutes: 15,
        timed: true,
      },
      {
        title: 'Rise and seal',
        instructions:
          'When you get out, pat dry rather than rub. Take the rose quartz out and hold it over your heart for three breaths. Snuff the candle.',
        snuff: true,
      },
    ],
    closing:
      'Keep the rose quartz by your bed. Empty the petals onto the garden or compost rather than the drain. Say yes to one small invitation this week.',
    safety:
      CANDLE_SAFETY +
      ' Use only unsprayed petals. Test vanilla and milk on a patch of skin first if you have sensitive skin. Do not add essential oils neat to the bath. Keep the water comfortably warm, not hot, if you are pregnant or have heart or blood-pressure concerns. Take the rose quartz out after the bath; it can fade if left in sunny windows.',
    lore:
      'Friday is Venus\'s day in Latin (Veneris dies, vendredi) and Frigg\'s or Freyja\'s in English. Venus as the evening and morning star was Inanna and Ishtar in Mesopotamia. Agrippa gives Venus green and fair-coloured stones, brass, the rose and all sweet perfumes. Rose quartz as the love stone is a modern twentieth-century attribution; love baths are found in many folk and modern traditions.',
    sources: [
      'Agrippa, Three Books of Occult Philosophy (1533; English 1651), Book I, on Venereal things',
      'Scholarship on Inanna-Ishtar and the planet Venus',
    ],
  },
  {
    id: 'cosmic-saturday-saturn-boundaries',
    title: 'Saturday Saturn Boundary Stones',
    kind: 'spell',
    summary:
      'A firm, grounded Saturday working for protection and boundaries: name your limits, set them in black salt and stone at your threshold, and let Saturn keep the line.',
    intention: 'protection',
    alsoFor: ['banishing', 'peace'],
    practices: ['cosmic', 'crystal', 'folk'],
    paths: [],
    weekday: 6,
    moon: ['waning', 'dark'],
    minutes: 25,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A black candle', ref: 'traditional/candle/black' },
      { name: 'Jet, onyx or obsidian', ref: 'traditional/crystal/onyx' },
      { name: 'Four small black stones or pieces of hematite', ref: 'traditional/crystal/hematite' },
      { name: 'Black salt', ref: 'traditional/tool/black_salt' },
      { name: 'A sprig of cypress or a few juniper berries', ref: 'traditional/herb/cypress' },
      { name: 'Paper and a dark pen' },
    ],
    preparation:
      'On a Saturday, ideally as the moon wanes. Write a short list of your boundaries in plain language: "I don\'t answer work messages after 7", "I leave when I am shouted at". Sweep your front step or threshold first.',
    steps: [
      {
        title: 'Find your bones',
        instructions:
          'Sit on a firm chair. Feel your spine, your sitting bones, your feet. Saturn rules structure; notice the structure holding you up right now.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Light the boundary flame',
        instructions:
          'Light the black candle. Lay the cypress sprig before it and the onyx on top of your boundary list.',
        spoken: 'Old one of the ring and the long, slow year,\nset my edges firm; let nothing cross here\nthat would do me harm.',
        light: true,
      },
      {
        title: 'Speak each limit',
        instructions:
          'Read each boundary aloud, slowly. After each one, tap the table firmly once with the onyx, like a judge\'s gavel.',
      },
      {
        title: 'Charge the four stones',
        instructions:
          'Hold the four hematite stones in your cupped hands over the candle (well above the heat) and pour into them the feeling of a closed, locked gate.',
        minutes: 3,
      },
      {
        title: 'Set the line',
        instructions:
          'Snuff the candle. Take the stones and black salt to your threshold. Lay a thin line of black salt across the outside of the doorway and set a stone at each corner of the step, or the four corners of your room if you rent and can\'t use the door.',
        spoken: 'Here is the line. It holds.',
        snuff: true,
      },
    ],
    closing:
      'Fold the list and keep it under the onyx on your altar or desk. Hold your boundaries out loud at least once this week. Sweep up and replace the salt line each Saturday as needed.',
    safety:
      CANDLE_SAFETY +
      ' Keep the cypress or juniper away from the flame; it is not burned here, and juniper berries are not to be eaten (avoid them entirely in pregnancy). Keep salt lines away from where pets lick and from plants. Jet is soft and can burn; never place it in the flame.',
    lore:
      'Saturday is Saturn\'s day in English (and Saturni dies in Latin). Saturn was the slowest and outermost visible planet, ruler of limits, time and old age in Hellenistic astrology. Agrippa gives him black, lead, the cypress and bitter, dark resins such as myrrh. Laying salt or stones across a threshold is widespread European folk protection; black salt is a modern witchcraft preparation.',
    sources: [
      'Agrippa, Three Books of Occult Philosophy (1533; English 1651), Book I, on Saturnine things',
      'Vettius Valens, Anthology (on Saturn)',
    ],
  },

  // ───────────────────────── Other celestial ─────────────────────────
  {
    id: 'cosmic-mercury-retrograde-steadying',
    title: 'Mercury Retrograde Steadying',
    kind: 'ritual',
    summary:
      'A calm, practical rite for the start of a Mercury retrograde: back up, slow down, and set a stone at the centre of your communications so the weeks feel less slippery.',
    intention: 'peace',
    alsoFor: ['study', 'protection'],
    practices: ['cosmic', 'crystal', 'solitary'],
    paths: [],
    minutes: 30,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A grey or yellow candle', ref: 'traditional/candle/grey' },
      { name: 'Hematite', ref: 'traditional/crystal/hematite' },
      { name: 'Fluorite or blue lace agate', ref: 'traditional/crystal/blue_lace_agate' },
      { name: 'Lavender', ref: 'traditional/herb/lavender' },
      { name: 'A sticky note and pen' },
      { name: 'Your phone and computer' },
    ],
    preparation:
      'Look up the dates of the retrograde, including the "shadow" days either side. Plan this for the day it begins, or the Wednesday nearest. You will need about half an hour at your devices.',
    steps: [
      {
        title: 'Earth first',
        instructions:
          'Hold the hematite in both hands. It is heavy for its size; feel it pull your hands down and your breath with them.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Light the slow flame',
        instructions:
          'Light the candle and lay a sprig of lavender beside it.',
        spoken: 'Quick one, walking backward now,\nI walk slow with you, and I know how.',
        light: true,
      },
      {
        title: 'The practical charm',
        instructions:
          'Back up your phone and computer. Check the dates in your calendar for the next three weeks. Re-read any contract or important message you have pending. These are the spell: do them carefully and in order.',
        minutes: 15,
      },
      {
        title: 'What wants revisiting?',
        instructions:
          'The "re-" words belong to this time: review, revise, repair, reconnect. On the sticky note, write one old project or old friendship you\'d like to return to.',
      },
      {
        title: 'Set the centre',
        instructions:
          'Snuff the candle. Stick the note to your desk or phone case and put the fluorite or blue lace agate on top of your phone or beside your keyboard.',
        spoken: 'Steady words, steady hands, steady me.',
        snuff: true,
      },
    ],
    closing:
      'Carry the hematite through the retrograde. When you feel rushed, hold it and read your message once more before you send it. When Mercury goes direct, give thanks and return the lavender to the earth.',
    safety: CANDLE_SAFETY,
    lore:
      'Mercury\'s apparent backward motion, caused by Earth overtaking it in orbit, was observed by Babylonian and Greek astronomers and explained with epicycles by Ptolemy. Hellenistic astrologers judged retrograde planets weakened. The popular idea of Mercury retrograde as a season of tech failures and miscommunication is largely a later twentieth-century development that spread widely online after 2000.',
    sources: [
      'Ptolemy, Almagest (on planetary retrogradation)',
      'History-of-astrology scholarship on retrogradation',
    ],
  },
  {
    id: 'cosmic-solar-return-reading',
    title: 'Solar Return Year Reading',
    kind: 'ritual',
    summary:
      'On or near your birthday, when the sun returns to where it stood when you were born, lay out a twelve-card spread (one for each month) and read the shape of your coming year.',
    intention: 'beginnings',
    alsoFor: ['intuition', 'study'],
    practices: ['cosmic', 'crystal', 'solitary'],
    paths: [],
    minutes: 60,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A gold candle', ref: 'traditional/candle/gold' },
      { name: 'Your birthstone, or clear quartz', ref: 'traditional/crystal/clear_quartz' },
      { name: 'Sunstone', ref: 'traditional/crystal/sunstone', optional: true },
      { name: 'A tarot or oracle deck', ref: 'traditional/tool/tarot_deck' },
      { name: 'Your journal', ref: 'traditional/tool/book_of_shadows' },
      { name: 'A slice of cake or a pastry' },
    ],
    preparation:
      'Find your solar return moment, the exact time the sun reaches its birth position, using a free astrology calculator with your birth time and place; it can fall the day before or after your birthday. Work as close to that moment as you can. Shuffle the deck while thinking of the year ahead.',
    steps: [
      {
        title: 'Remember the year that was',
        instructions:
          'With the candle unlit, write three lines: what this past year gave you, what it took, and what it taught. Read them back once.',
        minutes: 8,
      },
      {
        title: 'Light the new year of you',
        instructions:
          'At or near the moment of your return, light the gold candle. Hold your birthstone and say your full name and age aloud.',
        spoken: 'Round the sun once more I have come;\nlight of my birth, light of my sum.',
        light: true,
      },
      {
        title: 'Draw the theme card',
        instructions:
          'Draw one card and place it in the centre: the theme of the whole year. Set the birthstone on top of it.',
      },
      {
        title: 'Lay the wheel',
        instructions:
          'Draw twelve more cards and lay them in a circle around the centre like a clock, starting at the top with the month that begins today. Turn them over one at a time.',
      },
      {
        title: 'Read the year',
        instructions:
          'For each card, write the month and a few words: the feeling, the image, a question it raises. Notice suits or numbers that repeat and where the hard cards gather. A difficult month is a place to prepare, not a sentence.',
        minutes: 25,
      },
      {
        title: 'Choose your guiding word',
        instructions:
          'Look at the whole wheel and the theme card together. Choose one word to carry for the year and write it in large letters.',
        spoken: 'This is my word for the turning year.',
      },
      {
        title: 'Feast',
        instructions:
          'Eat the cake slowly, in candlelight, with a little toast to yourself. Snuff the candle when you\'re done.',
        snuff: true,
      },
    ],
    closing:
      'Photograph or sketch the spread and keep it in your journal. At the start of each month, glance at that month\'s card again. Next birthday, read this page before you lay a new wheel.',
    safety: CANDLE_SAFETY,
    lore:
      'Casting a chart for the moment the sun returns to its natal place, the "revolution of the years of a nativity", is a real technique of Persian and Arabic astrology, set out by Abu Ma\'shar in the ninth century and used through the Renaissance. The twelve-month tarot wheel is a modern spread that borrows the idea; tarot was a card game before it was used for divination in the late eighteenth century.',
    sources: [
      'Abu Ma\'shar, On the Revolutions of the Years of Nativities (9th c.), as described in history-of-astrology scholarship',
      'Dummett, The Game of Tarot (scholarship on tarot\'s history)',
    ],
  },
  {
    id: 'cosmic-stargazing-name-your-star',
    title: 'Stargazing Devotion: Naming Your Star',
    kind: 'ritual',
    summary:
      'A night walk out under the stars to learn a few by name, choose one to be your companion star, and make a small devotion to the sky that has watched over every human life.',
    intention: null,
    alsoFor: ['peace', 'intuition'],
    practices: ['cosmic', 'solitary', 'hedge'],
    paths: [],
    moon: ['new', 'dark', 'waning'],
    minutes: 60,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A star chart, planisphere or stargazing app set to night mode' },
      { name: 'A red-light torch' },
      { name: 'Celestite or labradorite to hold', ref: 'traditional/crystal/celestite' },
      { name: 'A blanket or folding chair' },
      { name: 'A flask of something warm' },
      { name: 'Your journal and a pencil', ref: 'traditional/tool/book_of_shadows' },
      { name: 'A small offering: a sip from your flask or a pinch of grain' },
    ],
    preparation:
      'Pick a clear night near the new moon, when the sky is darkest, and a place away from streetlights that you know is safe. Before you go, use your chart to find two or three bright stars and constellations up tonight. Let your eyes adapt for twenty minutes outside without looking at a white screen.',
    steps: [
      {
        title: 'Let the dark come in',
        instructions:
          'Lie back or sit and simply look up. Your eyes will keep adjusting for twenty minutes or more; more stars will appear as you wait. Notice the cold on your face and the sounds of the night.',
        minutes: 10,
        timed: true,
      },
      {
        title: 'Find your way-markers',
        instructions:
          'Using the red torch and the chart, find one constellation you can recognise again, such as the Plough or Orion or the Southern Cross. Trace it with your finger in the air.',
        minutes: 10,
      },
      {
        title: 'Speak an old hymn',
        instructions:
          'Hold the celestite in both hands and say these old words to the sky.',
        spoken:
          'With holy voice I call the stars on high,\npure sacred lights and genii of the sky.\n\nWhen I consider thy heavens, the work of thy fingers,\nthe moon and the stars, which thou hast ordained…',
      },
      {
        title: 'Choose your star',
        instructions:
          'Let your eye wander until one star keeps drawing it back. It may be bright or faint. Find it on your chart and learn its real name and how far its light has travelled. Then give it a private name of your own as well.',
        minutes: 10,
      },
      {
        title: 'Make your offering',
        instructions:
          'Pour a little of your drink on the ground or scatter the grain, and tell your star something you have never said aloud.',
        spoken: 'Old light, far light, faithful light,\nI will look for you on clear nights.',
      },
      {
        title: 'Write it down',
        instructions:
          'Under the red torch, note the date, time, where in the sky your star was (which direction, how high), and both its names.',
        minutes: 5,
      },
    ],
    closing:
      'Look for your star again in a week, a month, and a season. It will rise about four minutes earlier each night, and in time it will set with the sun and return. Greet it every time you find it.',
    safety:
      NIGHT_OUTDOORS +
      ' Only pour plain drinks or grain as offerings in nature, never anything with plastic or packaging.',
    lore:
      'Every ancient people named the stars and read stories into them; most of the bright star names we use today are Arabic, passed through medieval Latin astronomy. Personal devotion to a guiding star is an old human impulse, but "naming your star" here is a private, modern practice, not an official naming (no one can register a star name for sale). The hymn opening is from Thomas Taylor\'s 1792 translation of the Orphic Hymn to the Stars, and the second verse is Psalm 8:3.',
    sources: [
      'Taylor, The Hymns of Orpheus (1792), Hymn to the Stars',
      'Psalm 8:3, King James Version (1611)',
      'Kunitzsch and Smart, A Dictionary of Modern Star Names (2006), on their Arabic origins',
    ],
  },

  // ───────────────────────── Crystal ─────────────────────────
  {
    id: 'crystal-cleanse-and-charge',
    title: 'Cleansing and Charging Your Stones',
    kind: 'ritual',
    summary:
      'A complete cleansing and recharging session for your collection, choosing the right method for each stone so nothing dissolves, rusts, cracks or fades.',
    intention: 'cleansing',
    alsoFor: ['healing', 'protection'],
    practices: ['crystal', 'elemental', 'green'],
    paths: [],
    moon: ['full', 'waning'],
    minutes: 45,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'Your crystal collection' },
      { name: 'A selenite slab or wand', ref: 'traditional/crystal/selenite' },
      { name: 'A clear quartz cluster', ref: 'traditional/crystal/clear_quartz' },
      { name: 'A bowl of dry rice or dry sea salt (not for wet use)', ref: 'traditional/vessel/bowl' },
      { name: 'A bundle of rosemary or garden sage for smoke cleansing', ref: 'traditional/herb/rosemary' },
      { name: 'A heat-proof dish', ref: 'traditional/vessel/incense_bowl', optional: true },
      { name: 'A bell or singing bowl', ref: 'traditional/tool/bell' },
      { name: 'A soft cloth' },
    ],
    preparation:
      'Lay all your stones on a clean towel and sort them into three groups. Water-safe (hard quartzes such as clear, smoky, rose and amethyst; agates; jasper; obsidian). Keep-dry (selenite, malachite, pyrite, hematite, lepidolite, kyanite, turquoise, opal, chrysocolla, celestite, lapis, any tumbled stone with metal content, and anything you are unsure of). Sun-shy (amethyst, rose quartz, citrine, fluorite, smoky quartz, celestite, aquamarine, kyanite and most coloured stones), which fade in strong sunlight.',
    steps: [
      {
        title: 'Clear yourself first',
        instructions:
          'Wash your hands in cool water and shake them dry. Ring the bell once and listen until the sound fully fades.',
        minutes: 2,
      },
      {
        title: 'Rinse the water-safe stones',
        instructions:
          'Hold the water-safe group under cool running water for a few seconds each, rubbing gently with your thumb. Dry them straight away with the soft cloth. Never use hot water on crystals, which can crack them.',
        spoken: 'Run clear, wash clean, be as you have been.',
      },
      {
        title: 'Smoke for the rest',
        instructions:
          'Light the rosemary bundle, let it catch, then blow it out so it smoulders over the heat-proof dish. Pass each keep-dry stone slowly through the smoke three times. Smoke works for every stone, but keep it brief and ventilated. Press the bundle out in the dish when you finish.',
      },
      {
        title: 'Sound for everything',
        instructions:
          'Gather all the stones on the towel. Ring the bell or bowl over them seven times, slowly, moving it in a circle. Sound is the gentlest method and suits every stone.',
        minutes: 3,
      },
      {
        title: 'Rest on selenite or quartz',
        instructions:
          'Set small stones on the selenite slab or around the quartz cluster, or bury hardy ones in the bowl of dry rice. Keep soft, porous or polished stones (opal, turquoise, malachite, pearl, amber) out of salt, which can scratch them or draw in moisture. Leave them for at least an hour, or overnight.',
      },
      {
        title: 'Charge',
        instructions:
          'Choose the light for each: moonlight for any stone; soft morning sun for an hour, at most, for clear quartz, carnelian, citrine (briefly), tiger eye and red jasper; no sun at all for the sun-shy group. Hold each stone briefly and say what you will ask of it next.',
        spoken: 'Clean and bright, woken and right.',
      },
    ],
    closing:
      'Return the stones to their homes. Cleanse working stones after hard use, after others have handled them, and at least once a month at the full or waning moon. Throw the rice away rather than eating it.',
    safety:
      'Smoke cleansing involves flame and smoke: work by an open window, keep the bundle over a heat-proof dish, keep it away from fabric and hair, and make sure it is fully out. Avoid smoke if you have asthma; use sound instead. Keep pets out of the room. Never put selenite, malachite, pyrite or other soft or metal-bearing stones in water, and wash your hands after handling malachite or any stone that sheds dust.',
    lore:
      'Purifying sacred objects with water, smoke and sound is ancient and widespread. Cleansing and "charging" crystals as personal energy tools is a modern practice of the New Age crystal movement of the 1970s and 1980s. The stone-safety guidance here comes from mineralogy: hardness on the Mohs scale, water solubility, and the known light-sensitivity of stones coloured by trace iron or radiation.',
    sources: [
      'Mineralogy references on the Mohs scale, solubility and colour stability',
      'Scholarship on the 1970s–80s New Age crystal movement',
    ],
  },
  {
    id: 'crystal-programming-intention',
    title: 'Programming a Crystal',
    kind: 'spell',
    summary:
      'Give a clear quartz (or any stone) one specific job through breath, words and steady focus, so it becomes a pocket reminder of your intention.',
    intention: 'beginnings',
    alsoFor: ['study', 'courage'],
    practices: ['crystal', 'solitary'],
    paths: [],
    moon: ['new', 'waxing'],
    minutes: 20,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A cleansed clear quartz point or tumbled stone', ref: 'traditional/crystal/clear_quartz' },
      { name: 'A white candle', ref: 'traditional/candle/white' },
      { name: 'Paper and pen' },
      { name: 'A small pouch or box' },
    ],
    preparation:
      'Cleanse the stone first (see Cleansing and Charging Your Stones). Write your intention as one short, positive sentence, for example "I speak up calmly in meetings". One stone, one job.',
    steps: [
      {
        title: 'Meet the stone',
        instructions:
          'Hold the quartz in your palm and look at it closely: its clarity, the inclusions, any rainbows or veils inside. Turn it until a face feels like the "front".',
        minutes: 3,
      },
      {
        title: 'Light the work',
        instructions: 'Light the white candle and set your written intention beneath it.',
        light: true,
      },
      {
        title: 'Clear the slate',
        instructions:
          'Hold the stone to your lips and breathe out across it three times, picturing it emptying like a clean glass.',
        spoken: 'Clear as water, clear as air;\nnothing old is waiting there.',
      },
      {
        title: 'Speak the program',
        instructions:
          'Hold the stone over your heart, or point it toward your third eye, and say your sentence three times, slowly, seeing the moment you want as vividly as you can: what you see, hear and feel.',
        spoken: 'This is your work: [your sentence]. Hold it for me.',
        minutes: 5,
      },
      {
        title: 'Seal and lock',
        instructions:
          'Close your hand tightly around the stone and press it once. Then wrap the paper around it and leave it under the candle\'s light for a few minutes before snuffing.',
        minutes: 5,
        timed: true,
        snuff: true,
      },
    ],
    closing:
      'Carry the stone or keep it where you\'ll see it in the moment you need it. Each time you touch it, remember the sentence. When the job is done, thank the stone, cleanse it, and it is ready for new work.',
    safety: CANDLE_SAFETY,
    lore:
      'Programming crystals is a modern practice from the 1970s and 1980s New Age movement, influenced by the idea of quartz in radios and watches. Talking to and charging a stone for a purpose echoes much older amulet traditions, such as the engraved and consecrated gems of medieval lapidaries.',
    sources: [
      'Scholarship on the New Age crystal movement',
      'Marbodus of Rennes, De Lapidibus (11th c.), on consecrating stones',
    ],
  },
  {
    id: 'crystal-home-protection-grid',
    title: 'Home Protection Grid',
    kind: 'ritual',
    summary:
      'Ward your whole home with a grid of black tourmaline in the corners, a guardian stone at the door, and a clear quartz anchor at the heart of the house.',
    intention: 'protection',
    alsoFor: ['peace', 'banishing'],
    practices: ['crystal', 'kitchen', 'folk'],
    paths: [],
    moon: ['full', 'waning'],
    minutes: 45,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'Four pieces of black tourmaline', ref: 'traditional/crystal/black_tourmaline' },
      { name: 'A larger clear quartz point or cluster', ref: 'traditional/crystal/clear_quartz' },
      { name: 'Smoky quartz or obsidian for the front door', ref: 'traditional/crystal/smoky_quartz' },
      { name: 'A selenite wand for drawing the lines', ref: 'traditional/crystal/selenite', optional: true },
      { name: 'Salt water in a spray bottle', ref: 'traditional/vessel/spray_bottle' },
      { name: 'A sprig of rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'A rough floor plan sketched on paper' },
    ],
    preparation:
      'Clean and tidy the home first: protection works best in a cared-for space. Cleanse the stones. Sketch your home and mark the four outermost corners, the front door and the centre. Decide where each stone can sit undisturbed (on a shelf, behind a plant, on a windowsill) and away from children\'s and pets\' reach.',
    steps: [
      {
        title: 'Sweep the old out',
        instructions:
          'Open the front door. Mist each room lightly with the salt water, starting from the back of the home and moving toward the door, brushing the air out with the rosemary sprig.',
        spoken: 'Out what is not mine; out what does harm.',
        minutes: 10,
      },
      {
        title: 'The heart stone',
        instructions:
          'Close the door. Place the clear quartz at the centre of the home. Hold your hands over it and picture a calm light filling the house from here.',
        spoken: 'Heart of the house, hold steady and bright.',
      },
      {
        title: 'The four corners',
        instructions:
          'Walk clockwise to each corner in turn and place a black tourmaline there. At each, press it down and say the line.',
        spoken: 'Stone in the corner, set and strong,\nnothing that harms comes along.',
      },
      {
        title: 'The guardian at the door',
        instructions:
          'Place the smoky quartz or obsidian by the inside of the front door, perhaps on a shelf or in a pot by the threshold.',
        spoken: 'Friends come in. Harm stays out.',
      },
      {
        title: 'Draw the lines',
        instructions:
          'Return to the centre. Point the selenite wand (or your finger) at the quartz, then trace in the air a line from it to each corner stone in turn, and then a ring connecting the corners. Picture the lines glowing and holding.',
        minutes: 5,
      },
      {
        title: 'Settle',
        instructions:
          'Sit at the centre of the house with your eyes closed. Listen to the house. Notice how it feels now.',
        minutes: 5,
        timed: true,
      },
    ],
    closing:
      'Leave the grid in place. Cleanse the stones once a month and walk the lines again. If the stones are moved, simply replace them and retrace the lines.',
    safety:
      'Keep small stones out of reach of young children and pets, who may swallow them. Salt water can mark wood and harm plants; mist into the air, not onto furniture. Black tourmaline can be brittle; handle it gently.',
    lore:
      'Protecting the corners, thresholds and hearth of a home is old European folk practice: things were buried under thresholds and placed in walls and chimneys. Black tourmaline as a protection stone and crystal grids as a technique are modern, from the late twentieth-century crystal movement.',
    sources: [
      'Merrifield, The Archaeology of Ritual and Magic (1987), on concealed house protection',
      'Scholarship on the New Age crystal movement',
    ],
  },
  {
    id: 'crystal-abundance-grid',
    title: 'Abundance Grid',
    kind: 'spell',
    summary:
      'Lay a radiating grid of citrine, pyrite and aventurine around a written goal and activate it each day of the waxing moon to draw opportunity and prosperity.',
    intention: 'prosperity',
    alsoFor: ['beginnings', 'courage'],
    practices: ['crystal', 'cosmic'],
    paths: [],
    moon: ['waxing'],
    weekday: 4,
    minutes: 30,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A clear quartz point for the centre', ref: 'traditional/crystal/clear_quartz' },
      { name: 'Six citrine stones', ref: 'traditional/crystal/citrine' },
      { name: 'Six green aventurine stones', ref: 'traditional/crystal/green_aventurine' },
      { name: 'A piece of pyrite (kept dry)', ref: 'traditional/crystal/pyrite' },
      { name: 'A green or gold candle', ref: 'traditional/candle/green' },
      { name: 'A sheet of paper with a drawn circle or flower-of-life pattern' },
      { name: 'Cinnamon and basil', ref: 'traditional/herb/cinnamon' },
      { name: 'A clear quartz wand or point to activate', ref: 'traditional/tool/wand', optional: true },
    ],
    preparation:
      'Begin on a Thursday or any day of the waxing moon. Write your abundance goal small in the centre of the paper. Cleanse the stones. Choose a flat surface where the grid can stay undisturbed for two weeks.',
    steps: [
      {
        title: 'Set the centre',
        instructions:
          'Place the clear quartz point on your written goal, tip upward. Place the pyrite directly beneath the paper as a foundation stone.',
        spoken: 'Here is the seed, and here the ground.',
      },
      {
        title: 'Light',
        instructions: 'Light the candle beside the grid.',
        light: true,
      },
      {
        title: 'The inner ring',
        instructions:
          'Lay the six citrines in a ring around the centre, starting at the top and moving clockwise, each a hand-width from the quartz.',
        spoken: 'Gold to gold, round and round.',
      },
      {
        title: 'The outer ring',
        instructions:
          'Lay the six aventurines in a larger ring, each one between two citrines, so the grid fans outward like a flower. Sprinkle a little cinnamon and basil in the spaces.',
      },
      {
        title: 'Activate',
        instructions:
          'With the wand or your index finger, touch the centre, then draw a line out to each stone and back, clockwise, joining them all. Picture threads of light running between them.',
        spoken: 'Wide and widening, near and far,\nopen the way to where you are.',
        minutes: 3,
      },
      {
        title: 'See it arrive',
        instructions:
          'Sit with your hands either side of the grid. Imagine your goal arriving in practical detail: the email, the payment, the handshake.',
        minutes: 5,
        timed: true,
        snuff: true,
      },
    ],
    closing:
      'Each day of the waxing moon, re-trace the lines for a minute and take one practical step. At the full moon, dismantle the grid in reverse, thank the stones, cleanse them, and keep the paper in your wallet.',
    safety:
      CANDLE_SAFETY +
      ' Citrine fades in strong sunlight, so set the grid out of direct sun. Pyrite should stay dry and should not be handled by small children; wash your hands after touching it.',
    lore:
      'Crystal grids, often laid on sacred geometry patterns, are a late twentieth-century New Age practice. Citrine as a "merchant\'s stone" and aventurine for luck are modern associations; pyrite\'s link with money comes from its gold colour, the "fool\'s gold" of miners. Thursday and the waxing moon follow older planetary and lunar timing.',
    sources: ['Scholarship on the New Age crystal movement', 'Agrippa, Three Books of Occult Philosophy (1533), on Jovial things'],
  },
  {
    id: 'crystal-rose-quartz-self-love',
    title: 'Rose Quartz Mirror of Self-Love',
    kind: 'ritual',
    summary:
      'A tender mirror ritual with rose quartz and rhodonite for learning to look at yourself with warmth, especially after heartbreak or a hard season.',
    intention: 'love',
    alsoFor: ['healing', 'peace'],
    practices: ['crystal', 'solitary'],
    paths: [],
    moon: ['waxing', 'full'],
    minutes: 30,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'Rose quartz', ref: 'traditional/crystal/rose_quartz' },
      { name: 'Rhodonite or rhodochrosite', ref: 'traditional/crystal/rhodonite' },
      { name: 'A pink candle', ref: 'traditional/candle/pink' },
      { name: 'A mirror you can sit in front of' },
      { name: 'A few rose petals or a rose', ref: 'traditional/herb/rose', optional: true },
      { name: 'A cup of rose or chamomile tea', ref: 'traditional/herb/chamomile', optional: true },
    ],
    preparation:
      'Choose a time when you won\'t be interrupted. Clean the mirror. Set the candle beside it so it lights your face softly. Brew the tea.',
    steps: [
      {
        title: 'Warm the stone',
        instructions:
          'Hold the rose quartz in both hands at your heart. Breathe slowly and feel it take your warmth.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Light pink',
        instructions: 'Light the pink candle and scatter the petals around the base of the mirror.',
        spoken: 'Soft light, kind light, shine on me.',
        light: true,
      },
      {
        title: 'Look',
        instructions:
          'Look into your own eyes in the mirror. This can feel awkward or sad. That\'s alright. Keep looking, breathing gently, until something softens.',
        minutes: 3,
      },
      {
        title: 'Say it to your face',
        instructions:
          'Hold the rose quartz at your heart and say each line to your reflection, using your name. Pause after each one and notice what your face does.',
        spoken: '[Name], I see you.\n[Name], you have done your best.\n[Name], you are worth loving.\n[Name], I am staying.',
      },
      {
        title: 'Where it hurts',
        instructions:
          'Now hold the rhodonite, the stone of hurts that are healing. Say aloud one thing you are sorry you put yourself through, and then forgive yourself in one sentence.',
        minutes: 4,
      },
      {
        title: 'Close kindly',
        instructions:
          'Kiss the rose quartz or press it to your cheek. Snuff the candle and drink your tea.',
        snuff: true,
      },
    ],
    closing:
      'Repeat the mirror lines each morning for a moon cycle, even if only for one breath. Carry the rose quartz on days you need softness and keep it out of sunny windows, where it fades.',
    safety:
      CANDLE_SAFETY +
      ' If mirror work brings up very painful feelings, it\'s fine to stop and simply hold the stone. Skip chamomile if you have a ragweed allergy.',
    lore:
      'Rose quartz as a stone of love and self-love is a modern, twentieth-century attribution; older lapidaries say little about it. Mirror affirmations come from modern self-help practice. Rhodonite\'s name comes from the Greek rhodon, rose.',
    sources: ['Mineralogical etymology of rhodonite', 'Scholarship on the New Age crystal movement'],
  },
  {
    id: 'crystal-amethyst-sleep-sachet',
    title: 'Amethyst and Lavender Sleep Sachet',
    kind: 'spell',
    summary:
      'Make a soft bedside sachet of amethyst, lepidolite, lavender and chamomile, and a short wind-down ritual to go with it, for calmer nights and kinder dreams.',
    intention: 'peace',
    alsoFor: ['healing', 'protection'],
    practices: ['crystal', 'green'],
    paths: [],
    moon: ['waning', 'full'],
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A tumbled amethyst', ref: 'traditional/crystal/amethyst' },
      { name: 'Lepidolite or howlite', ref: 'traditional/crystal/lepidolite' },
      { name: 'Dried lavender', ref: 'traditional/herb/lavender' },
      { name: 'Dried chamomile flowers', ref: 'traditional/herb/chamomile' },
      { name: 'A pinch of lemon balm', ref: 'traditional/herb/lemon_balm', optional: true },
      { name: 'A small cotton or linen pouch with a drawstring' },
      { name: 'A purple candle', ref: 'traditional/candle/purple' },
    ],
    preparation:
      'An hour before bed, dim the lights and put your phone away. Lay the herbs and stones on a tray beside the bed.',
    steps: [
      {
        title: 'Light the lullaby',
        instructions: 'Light the purple candle on a safe surface away from the bedding.',
        spoken: 'Day is done and the night is deep;\ncome, gentle, come, sweet sleep.',
        light: true,
      },
      {
        title: 'Fill the pouch',
        instructions:
          'Rub the lavender between your fingers over the pouch so its scent rises, then add it, a spoon of chamomile and the lemon balm. Notice how the smell softens your breath.',
      },
      {
        title: 'Add the stones',
        instructions:
          'Hold the amethyst and say one worry aloud, then put the stone in the pouch and let the worry go in with it. Do the same with the lepidolite and a second worry.',
        spoken: 'Hold this for me until morning.',
      },
      {
        title: 'Tie it closed',
        instructions:
          'Pull the drawstring and tie three knots: one for the body, one for the mind, one for the heart. Then snuff the candle.',
        snuff: true,
      },
      {
        title: 'Breathe down',
        instructions:
          'With the candle out, lie down with the sachet on your chest and breathe in for four, hold for seven, out for eight. Repeat as the timer runs, then tuck the sachet under your pillow or on the nightstand.',
        minutes: 5,
        timed: true,
      },
    ],
    closing:
      'Squeeze the sachet each night before sleep to release the scent. Refresh the herbs each new moon. Keep the amethyst out of sunlight, which fades it.',
    safety:
      CANDLE_SAFETY +
      ' Blow out the candle before you lie down; never fall asleep with it lit. Keep the sachet away from pets and small children, who may chew it or swallow stones. Skip chamomile with a ragweed allergy. Lepidolite contains lithium and aluminium; keep it dry and wash your hands after handling it.',
    lore:
      'Amethyst\'s Greek name, amethystos, means "not drunk", and the ancient Greeks believed it guarded against drunkenness; medieval lapidaries extended it to calm and good sleep. Lavender and chamomile have been used in European folk herbalism for rest for centuries. Lepidolite as a calming stone is a modern attribution.',
    sources: [
      'Pliny the Elder, Natural History, Book 37 (on amethyst)',
      'Marbodus of Rennes, De Lapidibus (11th c.)',
      'Culpeper, The Complete Herbal (1653), on lavender and chamomile',
    ],
  },
  {
    id: 'crystal-tourmaline-obsidian-shield',
    title: 'Black Tourmaline and Obsidian Shield',
    kind: 'spell',
    summary:
      'A short shielding working to put on before a draining place or encounter: ground into black tourmaline, mirror off with obsidian, and walk out wrapped in protection.',
    intention: 'protection',
    alsoFor: ['banishing', 'courage'],
    practices: ['crystal', 'elemental'],
    paths: [],
    moon: ['waning', 'dark'],
    minutes: 15,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'Black tourmaline', ref: 'traditional/crystal/black_tourmaline' },
      { name: 'Tumbled obsidian or an Apache tear', ref: 'traditional/crystal/obsidian' },
      { name: 'Shungite or hematite', ref: 'traditional/crystal/shungite', optional: true },
      { name: 'A pinch of salt' },
      { name: 'A pouch or pocket' },
    ],
    preparation:
      'Do this before you leave for the place or meeting that drains you. Cleanse the stones. You need only a few quiet minutes and a place to stand.',
    steps: [
      {
        title: 'Root',
        instructions:
          'Stand with the black tourmaline in your left hand, held low near your hip. Imagine roots growing from your feet deep into the earth. Feel heaviness and steadiness come up through your legs.',
        spoken: 'Rooted and still, I am held by the ground.',
        minutes: 3,
        timed: true,
      },
      {
        title: 'Mirror',
        instructions:
          'Take the obsidian in your right hand. Look at its glassy surface catching the light. Imagine that surface growing around you as a shining dark egg that reflects outward, letting nothing harmful stick.',
        spoken: 'Black glass, bright glass, turn it away;\nwhat\'s not mine cannot stay.',
        minutes: 3,
      },
      {
        title: 'Seal the edges',
        instructions:
          'Rub a pinch of salt between your palms and brush it off over your shoulders and down your arms and legs, as if sealing the shield\'s seams.',
      },
      {
        title: 'Carry it',
        instructions:
          'Put both stones in your pocket or pouch (and the shungite, if you have it). Touch them whenever you feel something heavy pressing in.',
        spoken: 'Shielded. Steady. Mine.',
      },
      {
        title: 'Take it off',
        instructions:
          'When you are safely home, shake out your hands, wash them in cool water, and rinse the obsidian (the tourmaline you can rest on salt or selenite). Picture the shield melting into the ground.',
      },
    ],
    closing:
      'Cleanse these stones often, they work hard. If you notice you need this shield every day for the same place or person, take that as useful information, not a failing.',
    safety:
      'Obsidian is volcanic glass and its broken edges are razor sharp; use smooth tumbled pieces and discard chipped ones. Black tourmaline can splinter; don\'t rub it on skin. Keep small stones away from children and pets. Shungite sheds black dust; wash your hands.',
    lore:
      'Obsidian has been used for mirrors since ancient Mesoamerica and Anatolia, and John Dee\'s famous scrying mirror was Aztec obsidian. Black stones such as jet were carried against evil in medieval Europe. Black tourmaline as a shield, and the visualised "energy shield", are modern practices from the late twentieth century.',
    sources: [
      'British Museum records on John Dee\'s obsidian mirror',
      'Pliny the Elder, Natural History, Book 36 (on obsidian)',
    ],
  },
  {
    id: 'crystal-pocket-charm-bag',
    title: 'Carrying-Stone Charm Bag',
    kind: 'spell',
    summary:
      'Build a small pocket charm bag of three chosen stones and a few herbs for healing and resilience, tuned to what you need to carry through a hard week.',
    intention: 'healing',
    alsoFor: ['courage', 'protection'],
    practices: ['crystal', 'green', 'folk'],
    paths: [],
    moon: ['waxing', 'full'],
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A small cloth bag, ideally green or blue' },
      { name: 'Bloodstone, for strength through illness or strain', ref: 'traditional/crystal/bloodstone' },
      { name: 'Green aventurine or jade, for renewal', ref: 'traditional/crystal/jade' },
      { name: 'Clear quartz, to amplify', ref: 'traditional/crystal/clear_quartz' },
      { name: 'A pinch of calendula', ref: 'traditional/herb/calendula' },
      { name: 'A pinch of rosemary', ref: 'traditional/herb/rosemary' },
      { name: 'A bay leaf with one word written on it', ref: 'traditional/herb/bay' },
      { name: 'A blue candle', ref: 'traditional/candle/blue' },
      { name: 'Thread to tie the bag' },
    ],
    preparation:
      'Cleanse the stones. Decide on one word for what you need, for example "mend", "endure" or "rest", and write it on the bay leaf. If another stone calls to you for this, swap it in.',
    steps: [
      {
        title: 'Light for healing',
        instructions: 'Light the blue candle and sit with the empty bag open in your lap.',
        spoken: 'Body and breath, bone and blood,\nmend me gently, slow as a bud.',
        light: true,
      },
      {
        title: 'Three stones, one at a time',
        instructions:
          'Hold each stone, say aloud what you are asking of it, and drop it into the bag: bloodstone for strength, aventurine or jade for renewal, quartz to make it all louder.',
      },
      {
        title: 'Herbs and word',
        instructions:
          'Add the calendula and rosemary, then fold the bay leaf around itself and push it into the middle of the stones.',
      },
      {
        title: 'Breathe into it',
        instructions:
          'Hold the open bag to your lips and breathe into it three times, giving it your breath and your life.',
        spoken: 'Breath of mine, live in this.',
      },
      {
        title: 'Tie it',
        instructions:
          'Close the bag and wind the thread around its neck, tying three knots. Hold it in your fist until it feels warm, then snuff the candle.',
        minutes: 3,
        snuff: true,
      },
    ],
    closing:
      'Carry the bag in a pocket or bra, or keep it by your bed. Hold it when you need steadying. Every new moon, open it, cleanse the stones and refresh the herbs. This supports you; it does not replace medical care.',
    safety:
      CANDLE_SAFETY +
      ' The herbs are for carrying only. Keep the bag away from small children and pets. Charm work is no substitute for medical treatment; keep taking prescribed care.',
    lore:
      'Carrying amulets of stone and herb in small bags is found in folk practice across Europe and the wider world. Bloodstone (heliotrope) was prized in medieval lapidaries to stop bleeding and give strength, and jade\'s Spanish name, piedra de ijada, "stone of the loin", records a belief that it healed the kidneys. Bundling three chosen stones is a modern arrangement.',
    sources: [
      'Marbodus of Rennes, De Lapidibus (11th c.), on heliotrope',
      'Pliny the Elder, Natural History, Book 37',
    ],
  },
  {
    id: 'crystal-indirect-gem-elixir',
    title: 'Gem Elixir by the Indirect Method',
    kind: 'spell',
    summary:
      'Make a gem-infused water safely, with the stone sealed in its own glass inside a larger vessel so it never touches what you drink, to sip as a mindful daily ritual.',
    intention: 'healing',
    alsoFor: ['peace', 'cleansing'],
    practices: ['crystal', 'kitchen', 'cosmic'],
    paths: [],
    moon: ['full'],
    minutes: 20,
    level: 'intermediate',
    solo: true,
    ingredients: [
      { name: 'A large clean glass jug or bowl', ref: 'traditional/vessel/bowl' },
      { name: 'A small glass jar or vial with a tight lid', ref: 'traditional/vessel/vial' },
      { name: 'A cleansed, stable quartz-family stone: clear quartz, rose quartz or amethyst', ref: 'traditional/crystal/rose_quartz' },
      { name: 'Fresh drinking water' },
      { name: 'A sprig of mint or a slice of lemon', ref: 'traditional/herb/mint', optional: true },
      { name: 'A clean glass to drink from' },
    ],
    preparation:
      'Choose only a hard, non-toxic quartz-family stone that you know is genuine and undyed (clear quartz, rose quartz, amethyst, smoky quartz). Do not use any stone that is soft, porous, metallic or of unknown composition, even indirectly. Wash the stone, the jar and the jug in hot soapy water and rinse well.',
    steps: [
      {
        title: 'Seal the stone',
        instructions:
          'Place the stone in the small jar and close the lid tightly. Check it doesn\'t leak by turning it upside down over the sink.',
        spoken: 'Stone in its own glass, safe and whole.',
      },
      {
        title: 'Set the outer vessel',
        instructions:
          'Stand the sealed jar in the middle of the large jug and pour fresh drinking water around it, not into it. The water must never touch the stone.',
      },
      {
        title: 'Charge it',
        instructions:
          'Hold your hands around the jug and say what the water is for. Leave it covered for a few hours in moonlight or shade (never in hot sun, which warms water and fades amethyst and rose quartz). Refrigerate if leaving it longer than two hours.',
        spoken: 'Water, carry the stone\'s quiet song,\nclear and gentle, all day long.',
        minutes: 5,
      },
      {
        title: 'Lift the stone out',
        instructions:
          'Remove the sealed jar with clean hands and set it aside. Add mint or lemon if you like.',
      },
      {
        title: 'Drink mindfully',
        instructions:
          'Pour a glass. Before each sip, pause and breathe. Notice the coolness, the taste, the feeling in your throat. The ritual is in the attention.',
        minutes: 5,
        timed: true,
      },
    ],
    closing:
      'Drink the water the same day and pour any leftover onto a plant. Cleanse and dry the stone and return it to its place. Make a fresh batch each time.',
    safety:
      'This is drinking water, so treat it as food: clean vessels, fresh water, refrigerated, used the same day. Use the indirect method only, and only with stable, non-toxic quartz-family stones. Never use malachite, azurite, chrysocolla, turquoise, pyrite, galena, cinnabar, realgar, lapis, selenite, opal, lepidolite, dyed or treated stones, or any stone you can\'t identify: some are toxic and the risk is not worth it. Never add essential oils. A gem elixir does not treat illness.',
    lore:
      'Drinking water in which stones or gems had been steeped appears in medieval and early-modern European and Islamic medical texts, often with dangerous results. Modern gem elixirs come from the twentieth-century flower-essence movement and New Age crystal healing. The indirect method was developed by modern practitioners precisely because many minerals are toxic.',
    sources: [
      'Scholarship on medieval lapidary medicine',
      'Mineralogy and toxicology references on hazardous minerals',
    ],
  },
  {
    id: 'crystal-pendulum-stone-choosing',
    title: 'Choosing a Stone by Pendulum',
    kind: 'ritual',
    summary:
      'Calibrate a pendulum to your own yes and no, then dowse over your collection or a chart to find the stone you most need right now.',
    intention: 'intuition',
    alsoFor: ['study', 'healing'],
    practices: ['crystal', 'hedge'],
    paths: [],
    minutes: 25,
    level: 'beginner',
    solo: true,
    ingredients: [
      { name: 'A pendulum, crystal or metal, on a chain or thread', ref: 'traditional/tool/pendulum' },
      { name: 'Several stones laid out in a row', ref: 'traditional/crystal/clear_quartz' },
      { name: 'Amethyst to clear your head first', ref: 'traditional/crystal/amethyst', optional: true },
      { name: 'Paper and pen to write stone names on' },
    ],
    preparation:
      'Lay out five to twelve stones in a row or arc on a clean cloth, each with its name written on a slip beneath it. Sit at a table with your elbow resting on it so your arm is steady.',
    steps: [
      {
        title: 'Settle the hand',
        instructions:
          'Hold the amethyst for a few breaths with your eyes closed. Let your mind quieten, and let go of any preference for a particular stone.',
        minutes: 2,
        timed: true,
      },
      {
        title: 'Find your yes and no',
        instructions:
          'Hold the pendulum chain between your thumb and forefinger, with about a hand-width of chain, and let it go still. Ask aloud, "Show me yes." Wait for it to swing or circle. Then, "Show me no." Then, "Show me don\'t know." Note each movement; everyone\'s is different.',
        minutes: 5,
      },
      {
        title: 'Test it',
        instructions:
          'Ask two questions you know the answers to ("Is my name ___?", "Am I sitting down?") and check the pendulum agrees. If not, rest and recalibrate.',
      },
      {
        title: 'Ask the question',
        instructions:
          'Say clearly what you want help with, for example: "Which stone will best support me this week?"',
        spoken: 'Swing true, show me clear,\nthe stone I need is here.',
      },
      {
        title: 'Dowse the row',
        instructions:
          'Hold the pendulum over each stone in turn for a few breaths, still asking, "Is it this one?" Note any yes. If more than one says yes, dowse again over just those.',
        minutes: 8,
      },
      {
        title: 'Receive the stone',
        instructions:
          'Pick up the chosen stone and hold it. Ask the pendulum one last check: "Is this the one?" Then thank it and wrap the chain around your fingers.',
      },
    ],
    closing:
      'Carry or sleep with the chosen stone for the coming week and notice what it brings. Look it up in the Living Library to learn its lore, and see whether the meaning fits what you needed.',
    lore:
      'Dowsing with rods for water and ore is documented in Germany from the sixteenth century (Agricola described it in 1556). Pendulum dowsing became popular in France in the late nineteenth and early twentieth centuries. The pendulum\'s movement is generally explained as small unconscious muscle movements (the ideomotor effect), which is why a quiet, open mind matters.',
    sources: [
      'Agricola, De Re Metallica (1556), on dowsing',
      'Scholarship on the ideomotor effect',
    ],
  },
];
