import type { Premade } from '../types';

// Wicca and the Wheel of the Year: solitary sabbat rites, full moon esbats
// and the everyday foundations of open, public Wiccan practice. All wording
// is original or public domain; nothing here comes from oathbound material.

const CANDLE_SAFETY =
  "Never leave a lit candle unattended. Set it in a sturdy holder on a heatproof surface, away from curtains, hair, loose sleeves, pets and children, and snuff it rather than blowing it out if wax may spatter.";

const INCENSE_SAFETY =
  "Burn incense in a heatproof dish with a little sand or salt beneath it, in a ventilated room. Skip the smoke if you have asthma or are sensitive to it, and keep it away from birds and other small pets.";

const MOON_LORE =
  "The popular names of the full moons came into wide circulation through American almanacs: the Maine Farmers' Almanac printed a list from the 1930s, and the Old Farmer's Almanac helped fix the familiar twelve later in the century. The names are a mix of colonial American, English and loosely attributed Native American sources, and the attributions are often uncertain, so they are best treated as seasonal folklore rather than any one people's calendar. They follow the seasons of the northern temperate zone; in the southern hemisphere many practitioners shift them by six months. Holding a rite at every full moon, the esbat, is a modern Wiccan custom; the word itself was popularised by Margaret Murray in 1921.";

export const WICCA: Premade[] = [
  // ───────────────────────── Foundations ─────────────────────────
  {
    id: "wicca-casting-the-circle",
    title: "Casting and Closing the Circle",
    kind: "ritual",
    summary:
      "A reusable opening and closing for any rite: sweep the space, cast the circle, call the four quarters, and at the end release them in reverse. Use it as the frame for esbats, sabbats and spellwork.",
    intention: "protection",
    alsoFor: ["cleansing"],
    practices: ["solitary", "elemental", "eclectic"],
    paths: ["wicca"],
    minutes: 20,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A besom or small hand broom", ref: "traditional/tool/besom" },
      { name: "An athame, wand, or simply your pointing finger", ref: "traditional/tool/athame", optional: true },
      { name: "Four small candles or tea lights for the quarters (yellow, red, blue, green, or all white)", ref: "traditional/candle/white" },
      { name: "A small bowl of salt", ref: "traditional/vessel/bowl" },
      { name: "A small bowl of water" },
      { name: "Incense, such as frankincense", ref: "traditional/herb/frankincense", optional: true },
      { name: "A compass, or a good sense of which way is north", optional: true },
    ],
    preparation:
      "Find north and set one candle at each quarter of the space you will use, or all four on the altar in their directions. Clear the floor so you can walk the edge of the circle without tripping. Bathe or wash your hands and face, and leave your phone out of reach.",
    steps: [
      {
        title: "Sweep the space",
        instructions:
          "Starting in the east, walk the edge of your space sunwise (clockwise) with the besom, sweeping just above the floor. You are not cleaning dust; you are brushing out the day. Sweep toward the door or a window as you finish.",
        spoken: "Out with the clutter, out with the noise. Clear is the ground, and the ground is ready.",
        minutes: 2,
      },
      {
        title: "Bless salt and water",
        instructions:
          "Hold your hand over the salt and feel it as earth, steady and clean. Hold your hand over the water and feel it as flowing and clear. Drop three pinches of salt into the water and stir it sunwise with your finger or athame.",
        spoken: "Salt of the earth, water of the well, together you cleanse and together you guard.",
      },
      {
        title: "Cast the circle",
        instructions:
          "Stand in the east and point your athame, wand or finger at the floor at the circle's edge. Walk sunwise once around, slowly, seeing a line of pale light pour from your hand and rise into a wall, then a sphere above and below you. Come back to the east and close the line where it began.",
        spoken:
          "Round I walk and round I bind, a circle drawn by hand and mind. Between the worlds, outside of time, this ground is set apart and mine.",
        minutes: 3,
      },
      {
        title: "Seal with the elements",
        instructions:
          "Walk the circle a second time, flicking drops of salt water along the edge. If you use incense, light it and walk a third time, letting the smoke trace the boundary. Return to the centre.",
        light: true,
      },
      {
        title: "Call the quarters",
        instructions:
          "Face each direction in turn, starting in the east and turning sunwise. Light that quarter's candle (if it is not already lit), raise your hand, and speak. Pause at each until you feel something answer: a breeze, warmth, a coolness, a weight.",
        spoken:
          "East, the air: breath and the first light, be here. South, the fire: warmth and will, be here. West, the water: tide and feeling, be here. North, the earth: stone and root, be here.",
        minutes: 4,
      },
      {
        title: "Welcome the Goddess and God",
        instructions:
          "Stand at the centre, arms open. Invite the Lady and the Lord, or whatever names you give the divine, in your own words or these. Then do the work of the rite: esbat, sabbat, spell or quiet meditation.",
        spoken: "Lady of the moon, Lord of the green and the sun, you are welcome in this circle.",
      },
      {
        title: "Thank and release the quarters",
        instructions:
          "When the work is done, face north and turn widdershins (anticlockwise): north, west, south, east. Thank each element and snuff its candle. Thank the Goddess and God last.",
        spoken:
          "Earth, water, fire and air, thank you for your guarding. Go if you must, stay if you will. Lady and Lord, my thanks.",
        snuff: true,
      },
      {
        title: "Open the circle",
        instructions:
          "Stand in the east and walk the edge once widdershins, drawing the light back into your hand or letting it sink into the floor. Touch the ground with both palms to settle any leftover energy.",
        spoken: "The circle is open but never broken. What was made here goes with me.",
      },
    ],
    closing:
      "Eat something small and drink some water. Pour the leftover salt water onto the earth or down an outside drain, not onto plants you love, since salt harms soil.",
    safety: `${CANDLE_SAFETY} ${INCENSE_SAFETY} Keep a clear path inside the circle so you are not stepping over candles.`,
    lore:
      "Casting a circle and calling the four quarters is the backbone of modern public Wicca. The shape draws on older ceremonial magic, in which the magician drew a protective circle and invoked the four directions, and on the four classical elements of Greek natural philosophy. The pairing of east with air, south with fire, west with water and north with earth is the common modern correspondence in the northern hemisphere; some southern practitioners swap north and south. These words are written fresh for the app and are not drawn from any coven's Book of Shadows.",
    sources: [
      "Hutton, The Triumph of the Moon (on the ceremonial roots of the Wiccan circle)",
      "Empedocles and Aristotle on the four elements (via standard histories of philosophy)",
    ],
  },
  {
    id: "wicca-cakes-and-ale",
    title: "Cakes and Ale",
    kind: "ritual",
    summary:
      "The small shared meal that ends most Wiccan rites: bless a drink and a cake, offer the first portion to the gods, and eat the rest to come back to earth.",
    intention: null,
    alsoFor: ["prosperity", "peace"],
    practices: ["solitary", "kitchen", "eclectic"],
    paths: ["wicca"],
    minutes: 10,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A chalice or a favourite cup", ref: "traditional/tool/chalice" },
      { name: "Ale, cider, wine, juice or milk" },
      { name: "A small cake, biscuit, oatcake or piece of bread" },
      { name: "A plate", ref: "traditional/vessel/dish" },
      { name: "An offering bowl", ref: "traditional/vessel/offering_bowl" },
      { name: "An athame, for the blessing", ref: "traditional/tool/athame", optional: true },
    ],
    preparation:
      "Pour the drink into the chalice and set the cake on its plate on the altar before you begin the rite. If you work outdoors, the offering can go straight onto the ground; indoors, use the offering bowl and carry it out afterwards.",
    steps: [
      {
        title: "Bless the drink",
        instructions:
          "Lift the chalice in both hands. If you use an athame, lower its tip gently into the cup and hold it there a moment: blade and cup together, the God and the Goddess, the spark and the vessel. Otherwise, simply hold your palm over the cup.",
        spoken: "From the grain and the vine, from the rain and the sun: blessed be this drink.",
      },
      {
        title: "Bless the cake",
        instructions:
          "Hold your hand over the cake, or touch it with the athame's tip. Think of the field it came from, the hands that milled and baked it, and the oven's heat.",
        spoken: "From the field to the fire, from the fire to the hand: blessed be this bread.",
      },
      {
        title: "Offer the first portion",
        instructions:
          "Break off the first piece of cake and pour the first sip of drink into the offering bowl. The first share always goes to the gods, the land and the ancestors.",
        spoken: "The first for you, who give us all.",
      },
      {
        title: "Eat and drink",
        instructions:
          "Eat and drink slowly, sitting down. Notice taste and texture. This is the moment the rite turns from high to homely: talk to the gods as you would to good company, or simply enjoy the quiet.",
        minutes: 5,
      },
    ],
    closing:
      "Leave a crumb on the plate until you close the circle. Afterwards carry the offering outside to the foot of a tree or a patch of earth, or compost it.",
    safety:
      "Alcohol is optional: juice, milk or water work just as well. Check ingredients for allergies, and don't leave offerings containing chocolate, grapes, raisins or alcohol where dogs or wildlife might eat them.",
    lore:
      "A shared blessed meal at the close of a rite appears in Gardner's published accounts of Wicca from the 1950s and is now near-universal in public Wicca. It echoes older customs: the libation, in which the first pour of a drink went to the gods in Greek and Roman worship, and the harvest and wake feasts of European folk custom. The idea of blade-in-cup as a union of male and female is modern Wiccan symbolism. The words here are original.",
    sources: [
      "Hutton, The Triumph of the Moon (on Gardner's published rites)",
      "Burkert, Greek Religion (on libation and first offerings)",
    ],
  },
  {
    id: "wicca-consecrating-a-tool",
    title: "Consecrating a New Tool",
    kind: "ritual",
    summary:
      "Cleanse and dedicate a new athame, wand, chalice or pentacle by passing it through all four elements and naming its purpose.",
    intention: "beginnings",
    alsoFor: ["cleansing", "protection"],
    practices: ["solitary", "elemental"],
    paths: ["wicca"],
    moon: ["full", "waxing"],
    minutes: 25,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "The new tool: athame, wand, chalice or pentacle", ref: "traditional/tool/athame" },
      { name: "A small dish of salt", ref: "traditional/vessel/dish" },
      { name: "A small bowl of water", ref: "traditional/vessel/bowl" },
      { name: "Incense, such as frankincense or rosemary", ref: "traditional/herb/frankincense" },
      { name: "A white candle", ref: "traditional/candle/white" },
      { name: "A soft cloth to wrap the tool in afterwards" },
      { name: "A pinch of dried rosemary", ref: "traditional/herb/rosemary", optional: true },
    ],
    preparation:
      "Wash and dry the tool by ordinary means first: wipe a blade, rinse a cup, brush a wand. Decide in a sentence what it is for (“to direct my will,” “to hold what is offered”). Cast your circle if you use one.",
    steps: [
      {
        title: "Light and settle",
        instructions:
          "Light the candle and the incense. Hold the tool in your lap and get to know it: its weight, its grain or shine, any marks of the maker. Breathe with it until it feels less like a purchase and more like a companion.",
        light: true,
        minutes: 3,
      },
      {
        title: "Earth",
        instructions:
          "Touch the tool to the salt, or sprinkle a few grains over it (wipe salt off a metal blade straight away to prevent rust).",
        spoken: "By earth I steady you.",
      },
      {
        title: "Air",
        instructions: "Pass the tool slowly through the incense smoke, turning it so the smoke reaches every side.",
        spoken: "By air I wake you.",
      },
      {
        title: "Fire",
        instructions:
          "Pass the tool quickly above the candle flame, high enough that it only feels the warmth. Do not hold wood, cloth or resin in the flame.",
        spoken: "By fire I quicken you.",
      },
      {
        title: "Water",
        instructions: "Touch a drop of water to the tool, or for a chalice pour a little in and swirl it.",
        spoken: "By water I make you whole.",
      },
      {
        title: "Name its work",
        instructions:
          "Hold the tool up before the altar and tell it, and the gods, what it is for. If you like, draw or carve a small personal sign on it, or tie on a thread.",
        spoken: "From this night you are no common thing. You serve the circle and the work, and you serve it well.",
      },
      {
        title: "Charge it with breath",
        instructions:
          "Breathe once onto the tool, slow and warm, and then press it to your heart. Sit with it for a few minutes and let it settle into you.",
        minutes: 3,
        timed: true,
      },
    ],
    closing:
      "Wrap the tool in its cloth and let it sleep on the altar overnight. Use it for the first time at your next rite. Snuff the candle when you finish.",
    safety: `${CANDLE_SAFETY} ${INCENSE_SAFETY} Handle a blade with care, keep it away from children, and check local laws on carrying knives; many practitioners use a blunt athame for this reason.`,
    lore:
      "Consecrating ritual instruments by the four elements comes from the grimoire and ceremonial magic tradition, which Wicca inherited in the mid-twentieth century. In public Wicca the athame (a ritual knife used to direct energy, not to cut), the wand, the chalice and the pentacle are commonly matched with the four elements, though which tool goes with which element varies between groups. This rite is a simple open form.",
    sources: [
      "Hutton, The Triumph of the Moon (on Wicca's debt to ceremonial magic)",
      "The Key of Solomon, Mathers translation (1888), on the consecration of instruments",
    ],
  },
  {
    id: "wicca-self-dedication",
    title: "Solitary Self-Dedication",
    kind: "ritual",
    summary:
      "A simple rite for someone choosing to walk the Wiccan or Pagan path on their own: declare your intention to the Goddess and God, take a craft name if you wish, and mark the beginning.",
    intention: "beginnings",
    alsoFor: ["courage"],
    practices: ["solitary", "eclectic"],
    paths: ["wicca"],
    moon: ["new", "full"],
    minutes: 40,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A white candle", ref: "traditional/candle/white" },
      { name: "A silver candle for the Goddess", ref: "traditional/candle/silver", optional: true },
      { name: "A gold candle for the God", ref: "traditional/candle/gold", optional: true },
      { name: "A small bowl of water", ref: "traditional/vessel/bowl" },
      { name: "A pinch of salt" },
      { name: "A few drops of a gentle oil, such as diluted lavender, or plain olive oil", ref: "traditional/herb/lavender", optional: true },
      { name: "Your book of shadows or a fresh notebook", ref: "traditional/tool/book_of_shadows" },
      { name: "A pen" },
    ],
    preparation:
      "Give yourself a week or more to think it over: what draws you, what you hope for, what you promise yourself. Write a few honest lines of dedication in your own words. Take a slow bath or shower before the rite, and dress in something clean and simple.",
    steps: [
      {
        title: "Open the space",
        instructions:
          "Cast a circle in your usual way, or simply sit in quiet and light the candles. Say why you are here, to yourself first.",
        light: true,
      },
      {
        title: "Cleanse with salt water",
        instructions:
          "Stir the salt into the water. Dip your fingers and touch your forehead, your lips, your heart, your hands and your feet.",
        spoken:
          "Mind to know, lips to speak true, heart to love, hands to work, feet to walk the old green road.",
      },
      {
        title: "Speak your dedication",
        instructions:
          "Stand facing the altar and read the lines you wrote. Speak plainly; this is a promise to yourself in the presence of the divine, not an exam.",
        spoken: "I come of my own free will. I choose this path, and I will walk it with an open heart.",
      },
      {
        title: "Anoint",
        instructions:
          "Touch a drop of oil (or water) to your brow. If you have chosen a craft name, say it aloud now for the first time.",
        spoken: "By this name I am known in the circle.",
      },
      {
        title: "Listen",
        instructions:
          "Sit and listen. You might feel warmth, see an image, hear a word, or notice nothing at all; all are fine. Stay a while.",
        minutes: 10,
        timed: true,
      },
      {
        title: "Write it down",
        instructions:
          "On the first page of your book of shadows, write the date, the moon, your dedication and anything you noticed. This is the first entry of your practice.",
        minutes: 5,
      },
      {
        title: "Give thanks and close",
        instructions: "Thank the Goddess and God, close your circle, and snuff the candles.",
        spoken: "I began tonight. Let me keep beginning.",
        snuff: true,
      },
    ],
    closing:
      "Eat and drink something. Many people renew their dedication each year on the same date, or at the sabbat closest to it.",
    safety: `${CANDLE_SAFETY} If you use an essential oil, dilute it well in a carrier oil (about 1 drop per teaspoon), patch test first, keep it away from your eyes, and avoid it in pregnancy unless your midwife says it's fine.`,
    lore:
      "This is a self-dedication, not an initiation. Initiation into a coven lineage such as Gardnerian or Alexandrian Wicca is given by an initiated priest or priestess, and its rites are oathbound. Self-dedication became widespread in the 1980s as solitary Wicca grew through published guides, and it is now the usual way a solitary practitioner marks their start. Many traditions suggest studying for a year and a day before dedicating; that span appears in older British folklore as a legal and fairy-tale term.",
    sources: ["Hutton, The Triumph of the Moon (on the growth of solitary Wicca)"],
  },
  {
    id: "wicca-daily-devotion",
    title: "Daily Devotion to the Lady and Lord",
    kind: "ritual",
    summary:
      "A five-minute morning or evening devotion: light a candle, greet the Goddess and God, make a small offering and hold a moment of stillness.",
    intention: "peace",
    practices: ["solitary"],
    paths: ["wicca"],
    minutes: 5,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A white candle or tea light", ref: "traditional/candle/white" },
      { name: "A small offering: a sip of water, a flower, a pinch of herbs or a crumb of bread" },
      { name: "An offering bowl", ref: "traditional/vessel/offering_bowl" },
      { name: "An image, stone or symbol of the Goddess and God of your understanding", optional: true },
    ],
    preparation:
      "Choose a fixed time, such as after you wash in the morning or before bed. The power of a daily devotion is in returning to it, not in its length.",
    steps: [
      {
        title: "Light",
        instructions: "Light the candle and take three slow breaths, letting the day fall away.",
        light: true,
      },
      {
        title: "Greet",
        instructions: "Speak to the Goddess and God by whatever names you use for them.",
        spoken:
          "Morning (or evening) to you, Lady of the turning moon. Morning to you, Lord of the greening wood. I am here, and I remember you.",
      },
      {
        title: "Offer",
        instructions: "Place your small offering in the bowl and say one thing you are thankful for today.",
      },
      {
        title: "Be still",
        instructions: "Sit quietly with the flame. If a thought arrives, let it pass like a cloud.",
        minutes: 2,
        timed: true,
      },
      {
        title: "Close",
        instructions: "Ask for one blessing for the day or night ahead, then snuff the candle.",
        spoken: "Walk with me. Blessed be.",
        snuff: true,
      },
    ],
    closing: "Empty the offering bowl outdoors or into the compost every day or two.",
    safety: CANDLE_SAFETY,
    lore:
      "Honouring a Goddess and a God as a divine pair is characteristic of modern Wicca and was shaped in the mid-twentieth century from Romantic-era images of a Moon goddess and a horned or green god. A small daily rite at a household shrine has deep roots across many old religions, from the Roman lararium to the hearth fire. This wording is original.",
    sources: [
      "Hutton, The Triumph of the Moon (on the Goddess and Horned God in modern Paganism)",
      "Orr, Roman Domestic Religion (on the lararium)",
    ],
  },
  {
    id: "wicca-full-moon-esbat",
    title: "Full Moon Esbat",
    kind: "ritual",
    summary:
      "A general full moon rite for any month: cast the circle, greet the Goddess as the full moon, raise and send energy toward a purpose, and share cakes and ale.",
    intention: "intuition",
    alsoFor: ["healing", "prosperity"],
    practices: ["solitary", "cosmic", "eclectic"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 45,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A silver or white candle", ref: "traditional/candle/silver" },
      { name: "A chalice of water", ref: "traditional/tool/chalice" },
      { name: "A moonstone or clear quartz", ref: "traditional/crystal/moonstone", optional: true },
      { name: "Jasmine or frankincense incense", ref: "traditional/herb/jasmine", optional: true },
      { name: "Cakes and ale (see the Cakes and Ale rite)" },
      { name: "Your book of shadows", ref: "traditional/tool/book_of_shadows" },
    ],
    preparation:
      "Check the time of the full moon. Any night from the one before to the one after works. Choose one purpose for the rite: a healing for someone who asked, an answer you need, a quality you want to grow. Set the chalice where moonlight can reach it if possible.",
    steps: [
      {
        title: "Cast the circle",
        instructions: "Open with the Casting the Circle rite, or your own form, and light the moon candle.",
        light: true,
      },
      {
        title: "Greet the full moon",
        instructions:
          "Stand where you can see the moon, or face her candle. Raise your arms in a wide V, palms up, and feel her light pour down into you.",
        spoken:
          "Bright Lady, round and white, lantern of the long night, I stand in your light and I am glad.",
        minutes: 3,
      },
      {
        title: "Moon in the water",
        instructions:
          "Hold the chalice so the moon or the candle shines in it. Gaze softly at the reflection and let images, words or feelings rise. Don't strain.",
        minutes: 7,
        timed: true,
      },
      {
        title: "Raise the power",
        instructions:
          "Name your purpose aloud. Then raise energy: hum a single low note and let it climb, sway, clap, or walk the circle faster and faster. When it peaks, throw your arms up and release it toward your purpose, then drop to the floor and ground.",
        spoken: "Full moon, full power, full and freely given: go now and do good.",
        minutes: 5,
      },
      {
        title: "Cakes and ale",
        instructions: "Bless and share cakes and ale, giving the first portion to the Goddess.",
        minutes: 5,
      },
      {
        title: "Record",
        instructions: "Write what you saw in the water and what you sent out, so you can look back next month.",
        minutes: 5,
      },
      {
        title: "Close",
        instructions: "Thank the Goddess, release the quarters and open the circle. Snuff the candle.",
        snuff: true,
      },
    ],
    closing:
      "Drink the moon water (if it is plain drinking water in a clean cup) or pour it on a houseplant. Place the stone back on the windowsill to bathe in moonlight overnight.",
    safety: `${CANDLE_SAFETY} ${INCENSE_SAFETY} Ground well after raising energy: eat something and put your palms on the floor if you feel light-headed.`,
    lore: MOON_LORE,
    sources: [
      "Murray, The Witch-Cult in Western Europe (1921), for the term esbat",
      "Hutton, The Triumph of the Moon (on the Wiccan esbat)",
    ],
  },

  // ───────────────────────── Sabbats ─────────────────────────
  {
    id: "wicca-samhain-dumb-supper",
    title: "Samhain Silent Supper for the Ancestors",
    kind: "ritual",
    summary:
      "A solitary Samhain rite: set a place for the beloved dead, light an ancestor candle, and share a meal in silence before writing a letter to those who have gone before.",
    intention: null,
    alsoFor: ["peace", "intuition"],
    practices: ["solitary", "hedge", "kitchen", "eclectic"],
    paths: ["wicca", "wheel"],
    holidays: ["samhain"],
    moon: ["dark", "waning"],
    minutes: 75,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A white candle for the ancestors", ref: "traditional/candle/white" },
      { name: "A black candle for the turning of the year", ref: "traditional/candle/black", optional: true },
      { name: "Photos or keepsakes of your beloved dead" },
      { name: "A simple meal: soup, bread, apples, root vegetables, or a dish a loved one cooked" },
      { name: "An extra plate and cup for the ancestors" },
      { name: "A sprig of rosemary, for remembrance", ref: "traditional/herb/rosemary" },
      { name: "Paper and pen" },
      { name: "A cauldron or fireproof bowl", ref: "traditional/tool/cauldron", optional: true },
    ],
    preparation:
      "Cook the meal in the late afternoon, thinking of the people you will honour; if you have a family recipe, use it. Set the table with your place and one for the ancestors at its head, with the photos and rosemary beside it. Turn off screens. Decide that you will remember only those who wish you well; if a relationship was harmful, you can honour the line further back instead.",
    steps: [
      {
        title: "Open the door",
        instructions:
          "At dusk, open your front door or a window for a moment and invite your well-wishing dead in. Then close it.",
        spoken: "You who loved me, you who came before: the door is open and the table laid. Come in, and be welcome.",
      },
      {
        title: "Light the ancestor candle",
        instructions:
          "Light the white candle at the ancestors' place. Say aloud the names you know, slowly, and for the ones you don't, say simply “and all whose names are lost.”",
        light: true,
        minutes: 3,
      },
      {
        title: "Serve the dead first",
        instructions:
          "Serve the ancestors' plate first, a small portion of everything, and pour their cup. Then serve yourself.",
      },
      {
        title: "Eat in silence",
        instructions:
          "From here until the meal ends, do not speak. Eat slowly. Let memories come: a voice, a smell, a phrase someone used. If tears come, let them.",
        minutes: 25,
      },
      {
        title: "Write to them",
        instructions:
          "When you have finished eating, write a letter to one or more of your dead: what you want them to know, what you are grateful for, what you are still carrying.",
        minutes: 10,
      },
      {
        title: "Release the letter",
        instructions:
          "Read the letter quietly to the candle. Then either burn it safely in the cauldron or fold it and keep it with the photos.",
        spoken: "What I could not say, I say now. Carry it with you.",
      },
      {
        title: "Close the supper",
        instructions:
          "Thank your ancestors, open the door once more to let them go on their way, and snuff the candle.",
        spoken: "Go well, go gently, go home. You are remembered.",
        snuff: true,
      },
    ],
    closing:
      "Leave the ancestors' plate outside overnight at the foot of a tree or on the step, then compost it in the morning. Wash their cup last and put it away carefully.",
    safety: `${CANDLE_SAFETY} If you burn paper, do it in a fireproof vessel on a heatproof surface with water nearby, a small piece at a time. Grief can be heavy: if this rite stirs up more than you can hold, stop and reach out to someone you trust.`,
    lore:
      "Samhain was a major Gaelic seasonal festival at the start of winter, attested in medieval Irish literature as a time of assemblies and of contact with the otherworld. The silent or “dumb” supper comes from later folk custom in Britain, Ireland and Appalachia, where it was mostly a divination to glimpse a future spouse; modern Pagans have reshaped it into a supper for the ancestors. Setting a place for the dead also appears in many European All Souls customs. Samhain as one of eight Wiccan sabbats dates from the 1950s.",
    sources: [
      "Hutton, The Stations of the Sun (on Samhain and Hallowe'en customs)",
      "Danaher, The Year in Ireland (on Hallowe'en customs)",
    ],
  },
  {
    id: "wicca-yule-log-sun-vigil",
    title: "Yule Log and Sun Vigil",
    kind: "ritual",
    summary:
      "A longest-night rite: dress a small Yule log with greenery and candles, keep a vigil through the dark, and greet the returning sun at dawn.",
    intention: "beginnings",
    alsoFor: ["prosperity", "peace"],
    practices: ["solitary", "folk", "green", "eclectic"],
    paths: ["wicca", "wheel"],
    holidays: ["yule"],
    minutes: 60,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A small log, ideally oak or birch, with one flat side", ref: "traditional/herb/oak" },
      { name: "Three candles: red, green and white (or gold)", ref: "traditional/candle/red" },
      { name: "A gold candle for the sun", ref: "traditional/candle/gold" },
      { name: "Sprigs of holly, ivy and evergreen", ref: "traditional/herb/holly" },
      { name: "A sprig of mistletoe, for decoration only", ref: "traditional/herb/mistletoe", optional: true },
      { name: "Cinnamon sticks and dried orange slices", ref: "traditional/herb/cinnamon" },
      { name: "Twine or ribbon" },
      { name: "A warm spiced drink, such as cider with cinnamon and clove", ref: "traditional/herb/clove" },
      { name: "A piece of last year's log or greenery, if you kept it", optional: true },
    ],
    preparation:
      "Gather or buy the log a few days before and let it dry indoors. Tie the greenery, cinnamon and orange to it with twine. Make it stable: drill shallow holes for the candles or set it on a tray with the candles in holders beside it. Note the time of sunrise for the next morning.",
    steps: [
      {
        title: "Darken the house",
        instructions:
          "At sunset, turn off every light you can. Sit in the dark for a few minutes and feel the longest night: the cold at the window, the hush.",
        minutes: 5,
        timed: true,
      },
      {
        title: "Light the Yule log",
        instructions:
          "Light the candles on or beside the log one at a time. If you kept a piece of last year's log or greenery, touch it to the first flame (outdoors, or just hold it near).",
        spoken:
          "Out of the dark the light is born. Burn, little log, for the sun's return, and keep this house warm through the winter.",
        light: true,
      },
      {
        title: "Tell the year",
        instructions:
          "Holding the warm drink, speak the year you are leaving: one thing for each season, what grew, what was harvested, what died back.",
        minutes: 10,
      },
      {
        title: "A wish for the light",
        instructions:
          "Hang a small slip of paper with one wish for the coming year on the log's twine. Choose something that will need the long, slow strength of the lengthening days.",
      },
      {
        title: "Keep vigil",
        instructions:
          "Sit with the flames for as long as you like, reading, singing, or simply watching. If you can, keep a candle burning (attended) late into the night, or set an alarm to rise before dawn.",
        minutes: 20,
      },
      {
        title: "Greet the sun",
        instructions:
          "At sunrise, go to an east-facing window or step outside. Light the gold candle, raise your hands to the new light, and welcome it.",
        spoken: "Welcome, sun! The wheel has turned. The light is young again, and so am I.",
      },
      {
        title: "Close the vigil",
        instructions: "Snuff all the candles. Keep a piece of the log or a sprig of its greenery to start next year's fire.",
        snuff: true,
      },
    ],
    closing:
      "Leave the log on the hearth or windowsill through the twelve days of Yule. Afterwards burn it safely in a fireplace or fire pit, keeping a fragment, or return the greenery to the earth.",
    safety: `${CANDLE_SAFETY} Dried greenery, cinnamon and orange catch fire easily: keep them well clear of the flames and never leave the log lit while you sleep. Holly berries and mistletoe are poisonous to people and pets, so keep them out of reach and don't use them in food or drink. Use clove and cinnamon only at normal cooking amounts.`,
    lore:
      "Midwinter festivals were widespread in pre-Christian Europe; the Old Norse jól and the Anglo-Saxon month name Geola are attested by Bede (725). The Yule log is documented as a household custom in England from the seventeenth century: Robert Herrick wrote of bringing in the Christmas log and lighting it with last year's brand. Keeping a vigil for the returning sun is a modern Pagan practice, part of the Wheel of the Year assembled in the 1950s.",
    sources: [
      "Bede, De temporum ratione (725), on Geola",
      "Herrick, Hesperides (1648), “Ceremonies for Christmas”",
      "Hutton, The Stations of the Sun (on the Yule log)",
    ],
  },
  {
    id: "wicca-imbolc-brigids-bed",
    title: "Imbolc: Brigid's Bed and the Blessing of Candles",
    kind: "ritual",
    summary:
      "Make a little bed for Brigid by the hearth, welcome her at the door, and bless all the candles you will burn this year.",
    intention: "beginnings",
    alsoFor: ["healing", "cleansing"],
    practices: ["solitary", "folk", "kitchen", "eclectic"],
    paths: ["wicca", "wheel"],
    holidays: ["imbolc"],
    minutes: 50,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "Brigid, to honour", ref: "traditional/deity/brigid" },
      { name: "A small basket or box" },
      { name: "A corn dolly, a bundle of straw, or a little cloth doll for Brigid (the brideóg)" },
      { name: "A white cloth or scrap of linen" },
      { name: "A small wand or straight twig of birch or willow", ref: "traditional/herb/birch" },
      { name: "All the new candles for the year ahead", ref: "traditional/candle/white" },
      { name: "A bowl of milk", ref: "traditional/vessel/bowl" },
      { name: "A ribbon or strip of cloth (the brat Bríde)" },
      { name: "Fresh bread or oatcakes and butter" },
    ],
    preparation:
      "Make the bed by lining the basket with the white cloth. Make or dress the doll with a scrap of white fabric and a few early flowers or greenery. Clean the hearth or the area around your altar, and tidy the house: this is a festival of fresh starts.",
    steps: [
      {
        title: "Welcome Brigid at the door",
        instructions:
          "Carry the doll to the front door. Knock three times from the inside, open the door, and invite her in, then carry her to the bed by the hearth or altar.",
        spoken:
          "Bríd, Bríd, come in; thy bed is ready. (Brigid, Brigid, come in, your bed is made.)",
      },
      {
        title: "Lay her down",
        instructions:
          "Lay the doll in the bed with the birch or willow wand beside her. Set the bowl of milk and a piece of bread nearby.",
      },
      {
        title: "Light the first candle",
        instructions: "Choose one candle from your stack and light it beside the bed. This is the first flame of the light half of the year.",
        light: true,
      },
      {
        title: "Bless the year's candles",
        instructions:
          "One by one, hold each new candle above the lit one (not in the flame) and turn it. Say the blessing once for the whole stack, then set them in a circle around the bed.",
        spoken:
          "Brigid of the bright flame, of the forge, the well and the healing hand: bless these lights, and every room where they will burn.",
        minutes: 8,
      },
      {
        title: "Lay out the brat Bríde",
        instructions:
          "Hang the ribbon or strip of cloth outside on a door handle or branch overnight, so Brigid may bless it as she passes. Afterwards it is kept for comfort and healing through the year.",
      },
      {
        title: "Share bread and milk",
        instructions: "Eat some of the bread and butter, leaving the first piece and a little milk for Brigid.",
        minutes: 5,
      },
      {
        title: "Look for her sign",
        instructions:
          "Before bed, smooth the ashes in the hearth or sprinkle a thin layer of flour on a plate by the bed. In the morning, look for any mark as a sign she visited.",
        snuff: true,
      },
    ],
    closing:
      "In the morning, check the flour or ashes, bring in the brat Bríde, and pour the milk on the earth. Keep the doll safely until next Imbolc, or burn it at Beltane.",
    safety: `${CANDLE_SAFETY} Keep straw dolls, cloth and dried greenery well away from the flame.`,
    lore:
      "Imbolc (Lá Fhéile Bríde) is an old Gaelic festival on 1 February, linked to St Brigid and before her, many think, to a goddess of the same name. The customs here are documented folk practice. Martin Martin described Brigid's bed in the Hebrides in 1703, and Alexander Carmichael recorded it in Carmina Gadelica (1900): women dressed a sheaf as Brigid, laid it in a basket with a wand, and called out “Bride is come, Bride is welcome,” then looked in the ashes for her footprint in the morning. The Irish brat Bríde, a cloth left out for her blessing, is recorded in twentieth-century folklore collections. The spoken welcome is adapted from the Gaelic call recorded by Carmichael. Blessing candles echoes Candlemas, on 2 February.",
    sources: [
      "Carmichael, Carmina Gadelica, vol. 1 (1900), on Bride's bed",
      "Martin, A Description of the Western Islands of Scotland (1703)",
      "Danaher, The Year in Ireland (on the brat Bríde)",
    ],
  },
  {
    id: "wicca-ostara-seed-and-egg",
    title: "Ostara Seed and Egg Rite",
    kind: "ritual",
    summary:
      "A spring equinox working of balance and new life: dye or decorate an egg with your hopes, plant seeds for them, and stand in the equal light of day and night.",
    intention: "beginnings",
    alsoFor: ["prosperity", "healing"],
    practices: ["solitary", "green", "kitchen", "eclectic"],
    paths: ["wicca", "wheel"],
    holidays: ["ostara"],
    minutes: 45,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A hard-boiled or blown egg" },
      { name: "Natural dyes: onion skins, beetroot, turmeric or red cabbage, or coloured pencils" },
      { name: "A pot of soil and a packet of seeds, such as basil, calendula or sweet peas", ref: "traditional/herb/calendula" },
      { name: "A small dish of water", ref: "traditional/vessel/dish" },
      { name: "A yellow or green candle", ref: "traditional/candle/yellow" },
      { name: "A few spring flowers or a sprig of birch", ref: "traditional/herb/birch", optional: true },
      { name: "A green aventurine or moss agate", ref: "traditional/crystal/moss_agate", optional: true },
    ],
    preparation:
      "Boil the egg (or blow it) and prepare your dye a few hours before. Choose a spot near a sunny window. Think of three things you want to grow this spring: one for your body, one for your work, one for your heart.",
    steps: [
      {
        title: "Light for the balance",
        instructions:
          "Light the candle. Stand with your weight evenly on both feet, arms out to your sides like a scale. Feel day and night held level, just for today.",
        spoken: "Day and night in equal measure; dark and light, a perfect pair. From this hinge the year swings open.",
        light: true,
        minutes: 2,
      },
      {
        title: "Mark the egg",
        instructions:
          "Draw or scratch three small symbols for your three hopes onto the egg, then dye it or colour it. Onion skins give gold, beetroot pink, turmeric yellow, red cabbage blue.",
        minutes: 15,
      },
      {
        title: "Bless the seeds",
        instructions:
          "Pour the seeds into your palm and breathe on them. Name each hope over them, one by one.",
        spoken: "Small as you are, you hold the whole summer.",
      },
      {
        title: "Plant",
        instructions:
          "Press the seeds into the soil at the depth the packet suggests. Water them gently with the dish of water. Set the stone, if you use one, on the soil's surface.",
        minutes: 5,
      },
      {
        title: "Set the egg beside the pot",
        instructions:
          "Place the decorated egg next to the pot as a promise. Sit for a few minutes in the sunlight, eyes closed, and feel your hopes as seeds just starting to crack.",
        minutes: 5,
        timed: true,
      },
      {
        title: "Close",
        instructions: "Thank the returning spring and snuff the candle.",
        spoken: "Grow as I grow. Rise as I rise.",
        snuff: true,
      },
    ],
    closing:
      "Water the seeds as they need, and each time, think of your hopes. After three days, eat a hard-boiled egg (if it was kept in the fridge) or bury a blown or older egg in the garden as an offering.",
    safety: `${CANDLE_SAFETY} Don't eat an egg that has been dyed with non-food colours or left out of the fridge for more than two hours.`,
    lore:
      "The only early mention of a goddess Eostre is a single line in Bede's De temporum ratione (725), naming an Anglo-Saxon month after her; Jacob Grimm built a larger figure, Ostara, on that line in 1835. Decorated eggs at Easter and spring are attested across Europe from the medieval period, and the Easter hare from seventeenth-century Germany. Ostara as a name for the Pagan spring equinox sabbat dates from Aidan Kelly's naming of the solstices and equinoxes in the 1970s Wheel of the Year.",
    sources: [
      "Bede, De temporum ratione (725)",
      "Grimm, Deutsche Mythologie (1835)",
      "Hutton, The Stations of the Sun (on Easter eggs and hares)",
    ],
  },
  {
    id: "wicca-beltane-flower-crown",
    title: "Beltane Flower Crown and Fire Leap",
    kind: "ritual",
    summary:
      "Weave a crown of May flowers, wash your face in the dew, and leap a safe little fire of tea lights to carry Beltane's luck and vitality into summer.",
    intention: "love",
    alsoFor: ["courage", "prosperity", "protection"],
    practices: ["solitary", "green", "folk", "eclectic"],
    paths: ["wicca", "wheel"],
    holidays: ["beltane"],
    minutes: 60,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "Fresh flowers and greenery for a crown: daisies, hawthorn blossom, cowslips, ivy, rosemary", ref: "traditional/herb/hawthorn" },
      { name: "Florist's wire or a thin willow wand bent into a ring", ref: "traditional/herb/willow" },
      { name: "Ribbons in spring colours" },
      { name: "Several tea lights in glass holders, or a small fire pit outdoors" },
      { name: "A red candle", ref: "traditional/candle/red" },
      { name: "A bowl for gathering dew or fresh water", ref: "traditional/vessel/bowl" },
      { name: "A sprig of rowan, tied with red thread", ref: "traditional/herb/rowan", optional: true },
    ],
    preparation:
      "The evening before or at dawn on May Day, gather flowers (from your garden, or bought, never pulled from protected wild places). Bend the willow or wire into a ring that fits your head. Set the tea lights in a short, low line on a flat, non-flammable surface outdoors (paving, gravel) or on a large tray on the floor, with nothing near them.",
    steps: [
      {
        title: "Wash in the May dew",
        instructions:
          "At sunrise, step outside and wash your face with dew from the grass, or with a bowl of fresh water left out overnight. Feel the cold and the morning on your skin.",
        spoken: "May dew, May morning, make me bright and make me new.",
      },
      {
        title: "Weave the crown",
        instructions:
          "Weave the flowers and greenery into the ring, binding stems with ribbon or wire. Work slowly. With each flower, name something you love about being alive.",
        minutes: 15,
      },
      {
        title: "Crown yourself",
        instructions: "Place the crown on your head and stand tall. You are the May Queen or May King of your own life today.",
        spoken: "Crowned with blossom, I take my place: green in the world and glad in my body.",
      },
      {
        title: "Light the Bel fire",
        instructions:
          "Light the red candle and from it the line of tea lights in their glass holders. Watch them catch in the dusk or morning light.",
        light: true,
      },
      {
        title: "Leap the fire",
        instructions:
          "Remove the crown and any loose scarf, and tie back long hair and sleeves. Take a step back, and step or hop over the low line of tea lights in one clean stride, as people once leapt the Beltane fires. Make a wish as you cross. Leap three times if it feels good, and only if your footing is sure; otherwise walk between two candles.",
        spoken: "Over the fire, the old year's cares fall away; on the far side, summer.",
      },
      {
        title: "Tie the rowan",
        instructions:
          "Hang the sprig of rowan tied with red thread above your door or bed to keep summer's blessings and turn away harm.",
      },
      {
        title: "Close",
        instructions: "Snuff the tea lights and the red candle. Put your crown back on and wear it for as long as the day allows.",
        snuff: true,
      },
    ],
    closing:
      "Hang the crown to dry on your altar. Return it to the earth, or burn it at the next Beltane or at Lammas.",
    safety: `${CANDLE_SAFETY} Use only tea lights inside glass holders set in a short, low line on a non-flammable surface, never an open bonfire you have to jump over. Remove the crown, scarves and loose clothing and tie back hair before stepping over. Don't do the leap on a wet or uneven surface, after drinking, or if your balance is unsure; walking between two candles carries the same meaning. Keep children and pets well away. Hawthorn and some garden flowers can irritate skin, so wash your hands after weaving.`,
    lore:
      "Bealtaine was a Gaelic festival at the start of summer, recorded in medieval Irish glossaries as a time when cattle were driven between two fires for protection. Lighting Beltane fires and leaping or walking between them survived into the eighteenth and nineteenth centuries in Scotland and Ireland. Washing in May dew for beauty, May garlands, May Queens and rowan crosses above the door are all well documented in British and Irish folk custom. Beltane as a Wiccan sabbat is part of the 1950s Wheel of the Year.",
    sources: [
      "Frazer, The Golden Bough (1890; abridged 1922), on Beltane fires",
      "Carmichael, Carmina Gadelica (1900), on Beltane customs",
      "Hutton, The Stations of the Sun (on May Day)",
    ],
  },
  {
    id: "wicca-litha-noon-herb-gathering",
    title: "Litha: Gathering Herbs at High Noon",
    kind: "ritual",
    summary:
      "On midsummer day, at the sun's highest point, gather and bless the herbs of the season, bundle them to dry, and honour the sun at the height of his strength.",
    intention: "protection",
    alsoFor: ["healing", "courage"],
    practices: ["solitary", "green", "folk", "eclectic"],
    paths: ["wicca", "wheel"],
    holidays: ["litha"],
    weekday: 0,
    minutes: 50,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "St John's wort, if it grows near you", ref: "traditional/herb/st_johns_wort" },
      { name: "Yarrow", ref: "traditional/herb/yarrow" },
      { name: "Vervain", ref: "traditional/herb/vervain", optional: true },
      { name: "Lavender, rosemary or chamomile from the garden", ref: "traditional/herb/lavender" },
      { name: "Elderflower heads", ref: "traditional/herb/elder", optional: true },
      { name: "A boline or clean scissors", ref: "traditional/tool/boline" },
      { name: "A basket" },
      { name: "Natural twine" },
      { name: "A sunstone, citrine or piece of amber", ref: "traditional/crystal/sunstone", optional: true },
    ],
    preparation:
      "Find out when local solar noon falls on the solstice (it is rarely exactly 12:00). Identify the plants you will gather beforehand with a good field guide, and gather only from your garden or places where you have permission and the plant is plentiful. Work in dry weather, after the dew has gone.",
    steps: [
      {
        title: "Greet the sun",
        instructions:
          "A few minutes before solar noon, stand outside with the basket. Face south (north in the southern hemisphere), close your eyes, and feel the sun on your face and hands. Do not look directly at it.",
        spoken: "Sun at your summit, gold on the green: I greet you at the height of your reign.",
        minutes: 3,
      },
      {
        title: "Ask before you cut",
        instructions:
          "Kneel by each plant. Touch it, tell it what you will use it for, and ask. Wait a moment. If it feels wrong, move on.",
        spoken: "Green one, I ask a little of your strength. Grow back stronger.",
      },
      {
        title: "Gather",
        instructions:
          "Cut cleanly with the boline, taking no more than a third of any plant, and leave flowers for the bees. Lay the stems in the basket all facing the same way.",
        minutes: 15,
      },
      {
        title: "Leave a gift",
        instructions:
          "Leave something in return: water poured at the roots, a strand of your hair, a pinch of compost, or simply your thanks.",
      },
      {
        title: "Bless in the noon light",
        instructions:
          "Hold the basket up to the sun, and if you have a sunstone, lay it among the herbs for a few minutes.",
        spoken: "Herbs of midsummer, gathered at noon: hold this sun for me through the long dark.",
        minutes: 5,
        timed: true,
      },
      {
        title: "Bundle and hang",
        instructions:
          "Bind small bundles of each herb with twine, tight at the stems, and hang them upside down in a dry, airy, shady place. Label them as you go.",
        minutes: 10,
      },
    ],
    closing:
      "When dry (in one to three weeks), crumble the herbs into labelled jars. Keep a bundle of St John's wort and yarrow over the door for protection until next midsummer, then burn or compost it and hang a fresh one.",
    safety:
      "Identify every plant with certainty; some toxic plants look like edible ones. St John's wort can make skin more sensitive to sunlight and interacts with many medicines, including the contraceptive pill and antidepressants, so do not take it internally without medical advice. Vervain and yarrow should be avoided in pregnancy. Wear gloves if your skin is sensitive, and wear a hat and sun cream at midday.",
    lore:
      "Midsummer was one of the great festivals of folk Europe, celebrated with bonfires on St John's Eve (23 June). Gathering herbs on midsummer eve or day, especially St John's wort, vervain and yarrow, was believed to give them special power and protect the house; Frazer collected many examples. The name Litha comes from Bede's list of Anglo-Saxon months and was given to the Pagan summer solstice in the 1970s.",
    sources: [
      "Frazer, The Golden Bough (1922), on midsummer herbs and fires",
      "Bede, De temporum ratione (725), on the months Litha",
      "Hutton, The Stations of the Sun (on midsummer)",
    ],
  },
  {
    id: "wicca-lammas-bread-offering",
    title: "Lammas Bread Offering",
    kind: "ritual",
    summary:
      "Bake a loaf from the first grain of the harvest, shape it into a figure or sheaf, bless it, and give the first slice back to the land in thanks.",
    intention: "prosperity",
    alsoFor: ["protection"],
    practices: ["solitary", "kitchen", "folk", "eclectic"],
    paths: ["wicca", "wheel"],
    holidays: ["lammas"],
    minutes: 180,
    level: "intermediate",
    solo: true,
    ingredients: [
      { name: "500 g strong bread flour" },
      { name: "7 g fast-action yeast" },
      { name: "10 g salt" },
      { name: "320 ml warm water" },
      { name: "1 tbsp honey" },
      { name: "1 egg, beaten, for glazing (optional)" },
      { name: "A handful of seeds or oats for the top" },
      { name: "A yellow or gold candle", ref: "traditional/candle/gold" },
      { name: "A sprig of rosemary or thyme", ref: "traditional/herb/thyme", optional: true },
      { name: "A few ears of wheat or other grain, for the altar", optional: true },
    ],
    preparation:
      "Clean the kitchen and make some room on the counter. Light the candle by the stove or on a nearby shelf where it is safe. If you can, use flour from a local mill.",
    steps: [
      {
        title: "Mix with gratitude",
        instructions:
          "Mix the flour, yeast and salt in a large bowl. Stir the honey into the warm water and pour it in. Bring it together with your hand, naming the people and places that made this flour: the farmer, the field, the rain, the sun.",
        light: true,
        spoken: "Hail to you, earth, mother of all; grow full with the gift of grain.",
      },
      {
        title: "Knead",
        instructions:
          "Knead on a lightly floured surface for 10 minutes until smooth and springy. Push into it whatever you want to harvest in your own life this year.",
        minutes: 10,
      },
      {
        title: "First rise",
        instructions: "Cover the bowl and leave the dough somewhere warm until doubled. Use this time to write down what you have reaped since spring.",
        minutes: 60,
      },
      {
        title: "Shape the loaf",
        instructions:
          "Knock the dough back and shape it: a simple round, a plait, a wheat sheaf (a long stem with snipped ears at the top) or a small figure for the harvest lord. Place on a lined tray, cover and leave for 30 more minutes. Heat the oven to 220 °C (200 °C fan).",
        minutes: 30,
      },
      {
        title: "Bake",
        instructions:
          "Brush with egg if you like, scatter seeds, and bake for 25 to 30 minutes until it sounds hollow underneath. Let it cool a little on a rack.",
        minutes: 30,
      },
      {
        title: "Bless the loaf",
        instructions:
          "Hold the warm loaf over the candle (well above the flame) or simply in both hands.",
        spoken:
          "First of the harvest, first of the bread: I give the first to the land that fed me, and I eat the rest in thanks.",
      },
      {
        title: "Give the first slice",
        instructions:
          "Break or cut the first piece and carry it outside. Crumble it at the corners of your home or garden, or at the foot of a tree, for the birds and the land spirits.",
      },
      {
        title: "Eat",
        instructions: "Eat a slice of the bread with butter or honey, slowly, and snuff the candle when you finish.",
        snuff: true,
      },
    ],
    closing:
      "Share the rest of the loaf with friends or neighbours. Older custom kept a piece of the Lammas loaf to protect the grain store; you might keep a dry crust on the altar until Mabon.",
    safety: `${CANDLE_SAFETY} Use oven gloves. Check for gluten, egg and seed allergies before you share the bread.`,
    lore:
      "Lammas comes from the Old English hlafmæsse, “loaf mass,” when bread from the first wheat was brought to church on 1 August. An Anglo-Saxon charm in an eleventh-century manuscript says that bread from the Lammas loaf, crumbled at the four corners of the barn, would protect the grain. The Gaelic festival at the same time was Lughnasadh, honouring the god Lugh. The spoken blessing here adapts a line from the Anglo-Saxon field-blessing charm, the Æcerbot (“Hal wes þu, folde, fira modor”). Lammas is part of the 1950s Wheel of the Year.",
    sources: [
      "Æcerbot, the Anglo-Saxon field remedy (eleventh century, public domain)",
      "Anglo-Saxon charms collected by Grattan and Singer (on the Lammas loaf charm)",
      "Hutton, The Stations of the Sun (on Lammas and Lughnasadh)",
    ],
  },
  {
    id: "wicca-mabon-thanks-and-balance",
    title: "Mabon: A Rite of Thanks and Balance",
    kind: "ritual",
    summary:
      "An autumn equinox rite to count your harvest, weigh what to keep and what to let go, and give thanks with an offering of apples and seasonal fruit.",
    intention: "peace",
    alsoFor: ["prosperity", "banishing"],
    practices: ["solitary", "green", "kitchen", "eclectic"],
    paths: ["wicca", "wheel"],
    holidays: ["mabon"],
    minutes: 45,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "Two candles, one dark (brown or black) and one light (orange or gold)", ref: "traditional/candle/orange" },
      { name: "Apples, grapes, nuts, squash or other seasonal produce" },
      { name: "A cut apple, to show the star inside" },
      { name: "Fallen leaves" },
      { name: "Two small bowls", ref: "traditional/vessel/bowl" },
      { name: "A handful of dried beans, nuts or acorns" },
      { name: "A cup of cider or apple juice", ref: "traditional/tool/chalice" },
      { name: "A pen and two slips of paper" },
    ],
    preparation:
      "Gather fallen leaves and some seasonal produce on a walk or at a market. Dress your altar with them, with the two candles side by side and a bowl in front of each. Cut the apple crosswise to reveal the five-pointed star of seeds.",
    steps: [
      {
        title: "Light the two candles",
        instructions:
          "Light the light candle and then the dark one. Day and night are equal again, but now the dark is gaining.",
        spoken: "Light and dark in balance stand; the year bows down to the turning land.",
        light: true,
      },
      {
        title: "Count the harvest",
        instructions:
          "Taking a bean, nut or acorn for each, name aloud the things you have harvested this year: lessons, achievements, friendships, comforts. Drop each one into the bowl before the light candle.",
        minutes: 10,
      },
      {
        title: "Weigh what to release",
        instructions:
          "On one slip of paper write what you are ready to let go of as the dark half begins: a habit, a worry, a role you have outgrown. On the other write what you will carry into winter. Place them in the bowls: release before the dark candle, keep before the light.",
        minutes: 8,
      },
      {
        title: "The star in the apple",
        instructions:
          "Hold up the halved apple and look at the star within. Eat one half slowly, thinking of the gifts the year has given you. The other half is for the offering.",
        minutes: 5,
      },
      {
        title: "Give thanks",
        instructions: "Raise the cup and give thanks to the earth, the Goddess and God, and everyone who has fed you this year. Pour a little into the offering bowl.",
        spoken: "For all that grew and all that fell, for bread and for apples, for kindness and for rain: thank you.",
      },
      {
        title: "Let go",
        instructions:
          "Tear up the release slip and add it to the fallen leaves. Fold the keep slip and place it in your book of shadows. Snuff the candles, dark first.",
        snuff: true,
      },
    ],
    closing:
      "Take the leaves, the torn slip and the apple half outside and leave them under a tree to rot back into the earth. Cook something with the rest of the produce this week and share it, if you can.",
    safety: `${CANDLE_SAFETY} Keep dry leaves well away from the flames.`,
    lore:
      "Harvest thanksgiving and harvest-home suppers are long-standing customs in the British countryside, and Michaelmas (29 September) closed the farming year. The name Mabon for the autumn equinox was given by Aidan Kelly in the 1970s, after the Welsh figure Mabon ap Modron of the medieval tales; it has no ancient link to the equinox, and some Pagans prefer to call it the Autumn Equinox or Harvest Home. The five-pointed star inside an apple is a favourite modern Pagan symbol.",
    sources: [
      "Hutton, The Stations of the Sun (on harvest customs)",
      "The Mabinogion, Lady Charlotte Guest translation (1849), for Mabon son of Modron",
    ],
  },

  // ───────────────────────── Full moons ─────────────────────────
  {
    id: "wicca-wolf-moon",
    title: "Wolf Moon: Calling the Pack Home",
    kind: "ritual",
    summary:
      "January's full moon is for kin and loyalty. Name the people you count as your pack and draw a protective circle of thread around their names.",
    intention: "protection",
    alsoFor: ["love"],
    practices: ["solitary", "folk"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 25,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A white or silver candle", ref: "traditional/candle/silver" },
      { name: "A sheet of paper and pen" },
      { name: "A length of red or white thread" },
      { name: "A pinch of salt" },
      { name: "A piece of black tourmaline or smoky quartz", ref: "traditional/crystal/smoky_quartz", optional: true },
    ],
    preparation:
      "Set the candle in a window that faces the moon, if you can. Think about who you would want beside you on the coldest night of the year.",
    steps: [
      {
        title: "Light under the Wolf Moon",
        instructions: "Light the candle and look out at the cold moon. Listen to the winter quiet.",
        light: true,
        spoken: "Wolf Moon, white on the snow, gather my people and keep them close.",
      },
      {
        title: "Name the pack",
        instructions:
          "Write the names of your pack in a cluster in the middle of the paper: family, friends, chosen kin, animals. Say each name aloud as you write it, with your own name among them.",
        minutes: 5,
      },
      {
        title: "Circle them",
        instructions:
          "Lay the thread in a closed ring around the names and sprinkle the salt just outside it. Set the stone in the middle if you have one.",
        spoken: "None outside who should be in; none left out in the cold.",
      },
      {
        title: "Howl",
        instructions:
          "Let out a long, low note or a soft howl, all the breath you have. It is silly and it is freeing: let it carry your love to each of them.",
      },
      {
        title: "Close",
        instructions: "Sit with the names a few minutes, then snuff the candle. Message one person on the list tomorrow.",
        minutes: 5,
        snuff: true,
      },
    ],
    closing: "Leave the paper and thread on your altar until the next full moon, then fold the thread into the paper and keep it.",
    safety: CANDLE_SAFETY,
    lore: `${MOON_LORE} The Wolf Moon name is usually traced to English and European settler folklore rather than a Native American source.`,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-snow-moon",
    title: "Snow Moon Cleansing",
    kind: "spell",
    summary:
      "February's full moon falls in deep winter. Use melted snow or cold water and moonlight to wash away what clings and make a clean, quiet space inside.",
    intention: "cleansing",
    alsoFor: ["peace"],
    practices: ["solitary", "elemental"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 20,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A bowl of clean snow, or cold water with a few ice cubes", ref: "traditional/vessel/bowl" },
      { name: "A white candle", ref: "traditional/candle/white" },
      { name: "A selenite wand or clear quartz", ref: "traditional/crystal/selenite", optional: true },
      { name: "A soft white cloth" },
    ],
    preparation:
      "Gather fresh, clean snow away from roads and let it melt in the bowl, or fill it with cold water and ice. Set it in moonlight while you prepare.",
    steps: [
      {
        title: "Light and look",
        instructions: "Light the candle beside the bowl. Watch the moon or its light on the water.",
        light: true,
        minutes: 2,
      },
      {
        title: "Name what clings",
        instructions:
          "Hold your hands over the bowl and name, quietly, what you want washed off: tiredness, a sour mood, a sticky conversation, the dull grey of winter.",
      },
      {
        title: "Wash",
        instructions:
          "Dip the cloth and wipe your hands, wrists, the back of your neck and your forehead. Feel the cold sharpen you.",
        spoken: "Snow on the hill, snow on the sill, wash me white and wash me still.",
      },
      {
        title: "Rest in the white",
        instructions:
          "Sit with your eyes closed and picture a field of new snow with no footprints on it. That is you, now. Rest there.",
        minutes: 7,
        timed: true,
      },
      {
        title: "Close",
        instructions: "Pour the water onto the earth outside. Snuff the candle.",
        snuff: true,
      },
    ],
    closing: "Drink a warm drink afterwards and wrap up.",
    safety: `${CANDLE_SAFETY} Don't drink melted snow. Keep the cold water on your skin brief if you have circulation problems or Raynaud's. Selenite dissolves in water, so keep it dry beside the bowl, not in it.`,
    lore: MOON_LORE,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-worm-moon",
    title: "Worm Moon Soil Blessing",
    kind: "spell",
    summary:
      "March's full moon marks the thaw, when earthworms stir. Bless a pot or patch of soil, bury a written intention, and feed the ground for the growing year.",
    intention: "beginnings",
    alsoFor: ["prosperity"],
    practices: ["solitary", "green"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 25,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A patch of garden or a large pot of soil" },
      { name: "A handful of compost or worm castings" },
      { name: "A small slip of unbleached paper and a pencil" },
      { name: "A watering can of rainwater or tap water left to stand" },
      { name: "A moss agate", ref: "traditional/crystal/moss_agate", optional: true },
    ],
    preparation: "Go out in the evening light or under the full moon. Wear gloves if you like, though bare hands in soil is the point.",
    steps: [
      {
        title: "Wake the ground",
        instructions:
          "Kneel and press both palms into the soil. Feel its temperature, its damp, any small life moving in it.",
        spoken: "Wake now, ground. The cold is cracking. The worms are rising.",
        minutes: 3,
      },
      {
        title: "Write the seed",
        instructions:
          "On the paper, in pencil, write one thing you want to start growing this year. Keep it to a few words.",
      },
      {
        title: "Bury it",
        instructions:
          "Dig a small hole with your fingers, place the folded paper (and stone) inside, and cover it with a handful of compost and then soil.",
        spoken: "Under the moon and into the dark: grow, as all good things grow, from below.",
      },
      {
        title: "Water and feed",
        instructions: "Water the spot gently and scatter the rest of the compost over the surface for the worms.",
      },
    ],
    closing:
      "Plant something there when the weather allows. The paper will rot in a few weeks and feed the soil, carrying your intention into it.",
    safety: "Wash your hands after handling soil and compost, and cover any cuts; soil can carry tetanus and other bacteria.",
    lore: MOON_LORE,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-pink-moon",
    title: "Pink Moon Self-Love Bath",
    kind: "spell",
    summary:
      "April's moon is named for the early pink phlox of spring. Bless a petal bath or footbath and spend the evening tending yourself like a new bloom.",
    intention: "love",
    alsoFor: ["healing", "peace"],
    practices: ["solitary", "green", "crystal"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 40,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A handful of pink rose petals or other pink edible flowers", ref: "traditional/herb/rose" },
      { name: "A small handful of dried chamomile or lavender", ref: "traditional/herb/chamomile" },
      { name: "A rose quartz", ref: "traditional/crystal/rose_quartz" },
      { name: "A pink candle", ref: "traditional/candle/pink" },
      { name: "A muslin bag or old sock to hold the herbs" },
      { name: "A bath, or a large bowl for a footbath" },
    ],
    preparation:
      "Tie the petals and herbs in the muslin bag so they don't clog the drain. Run the bath or fill the bowl with warm water and drop the bag in to steep for ten minutes.",
    steps: [
      {
        title: "Light the pink candle",
        instructions: "Light the candle somewhere safe in the bathroom, away from towels.",
        light: true,
      },
      {
        title: "Bless the water",
        instructions:
          "Hold the rose quartz over the water and speak the blessing. Set the stone on the edge of the bath, not in the water.",
        spoken: "Pink of the blossom, soft of the moon, bring me back to myself and bloom.",
      },
      {
        title: "Soak",
        instructions:
          "Get in, or rest your feet in the bowl. Each time you breathe out, say silently one thing you like about yourself. Repeat any that feel hard.",
        minutes: 20,
        timed: true,
      },
      {
        title: "Rise and dress",
        instructions:
          "Step out slowly, pat yourself dry, and put on something soft. Snuff the candle.",
        snuff: true,
      },
    ],
    closing: "Pour the herb bag's contents into the compost. Keep the rose quartz by your bed until the next full moon.",
    safety: `${CANDLE_SAFETY} Check the water temperature before getting in. Patch test herbs if your skin is sensitive, and skip lavender and chamomile if you are allergic to the daisy family. Take care stepping out of a bath, as petals and herbs can make it slippery.`,
    lore: `${MOON_LORE} The Pink Moon refers to moss phlox, one of the first wildflowers of the North American spring.`,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-flower-moon",
    title: "Flower Moon Offering",
    kind: "ritual",
    summary:
      "May's full moon, at the peak of spring's blooming. Make a moonlit flower offering to the Goddess and ask for abundance to flower in your life.",
    intention: "prosperity",
    alsoFor: ["love", "beginnings"],
    practices: ["solitary", "green"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 25,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A wide bowl of water", ref: "traditional/vessel/offering_bowl" },
      { name: "Fresh flowers from your garden or a market, ideally three kinds" },
      { name: "A floating candle or tea light", ref: "traditional/candle/white" },
      { name: "A green aventurine", ref: "traditional/crystal/green_aventurine", optional: true },
    ],
    preparation: "Set the bowl outdoors or on a moonlit sill. Pick the flowers just before the rite so they're fresh.",
    steps: [
      {
        title: "Float the light",
        instructions: "Float the candle in the centre of the bowl and light it.",
        light: true,
      },
      {
        title: "Lay the flowers",
        instructions:
          "Float the flower heads one at a time around the candle. With each, name something you hope will bloom in the coming months.",
        spoken: "Flower by flower, petal by petal, Lady, let my life come into bloom.",
        minutes: 5,
      },
      {
        title: "Gaze",
        instructions: "Sit and watch the moon, the flame and the petals together. Breathe in the scent.",
        minutes: 8,
        timed: true,
      },
      {
        title: "Close",
        instructions: "Thank the Goddess, snuff the candle, and leave the flowers in the bowl overnight under the moon.",
        snuff: true,
      },
    ],
    closing: "In the morning, pour the water and flowers at the roots of a tree or shrub.",
    safety: `${CANDLE_SAFETY} A floating candle is still a naked flame: keep it away from overhanging plants and leaves.`,
    lore: MOON_LORE,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-strawberry-moon",
    title: "Strawberry Moon Sweetening",
    kind: "spell",
    summary:
      "June's moon, at strawberry time. Share sweet fruit with someone you love (or with yourself) to sweeten a willing bond and savour the season's ripeness.",
    intention: "love",
    alsoFor: ["peace"],
    practices: ["solitary", "kitchen"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 20,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A bowl of fresh strawberries" },
      { name: "A spoonful of honey" },
      { name: "A sprig of fresh mint", ref: "traditional/herb/mint" },
      { name: "A pink or red candle", ref: "traditional/candle/pink" },
    ],
    preparation:
      "Wash and hull the strawberries, drizzle with honey and tear the mint over them. If you share this with a partner, friend or family member, make sure they want to join in.",
    steps: [
      {
        title: "Light",
        instructions: "Light the candle beside the bowl, under the moon if it's warm enough to sit out.",
        light: true,
      },
      {
        title: "Bless the fruit",
        instructions: "Hold your hands over the bowl. Strawberries have been a symbol of love in European folklore for centuries; their seeds are on the outside, given freely.",
        spoken: "Red heart, sweet heart, ripened in June: sweeten what's between us under the strawberry moon.",
      },
      {
        title: "Share",
        instructions:
          "Eat the strawberries slowly. If you share them, offer one to the other person and say one thing you love about them. If you're alone, say it to yourself.",
        minutes: 10,
      },
      {
        title: "Offer and close",
        instructions: "Leave one strawberry outside for the Goddess. Snuff the candle.",
        snuff: true,
      },
    ],
    closing: "Plant the leftover tops in a pot of soil; sometimes they root.",
    safety: `${CANDLE_SAFETY} Check for fruit allergies before sharing. Don't give honey to babies under one year old.`,
    lore: `${MOON_LORE} This spell is for deepening a bond that both people want, never for influencing someone who hasn't chosen it.`,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-buck-moon",
    title: "Buck Moon Strength",
    kind: "ritual",
    summary:
      "July's moon is named for the time when a buck's new antlers are growing. Stand in your own strength and call up the courage to grow into something bigger.",
    intention: "courage",
    alsoFor: ["protection"],
    practices: ["solitary", "elemental"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 25,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A red or orange candle", ref: "traditional/candle/red" },
      { name: "Two forked twigs, like small antlers", ref: "traditional/herb/oak" },
      { name: "A carnelian or tiger eye", ref: "traditional/crystal/tiger_eye", optional: true },
      { name: "Cernunnos or the Horned God of your understanding", ref: "traditional/deity/cernunnos", optional: true },
    ],
    preparation:
      "Collect two forked twigs from the ground (don't cut live branches). Find a place outdoors, or near an open window, where you can stand barefoot.",
    steps: [
      {
        title: "Light for the Horned One",
        instructions: "Light the candle and set the twigs on either side of it like antlers.",
        light: true,
        spoken: "Lord of the wild wood, antlered and bright, lend me your strength under the summer moon.",
      },
      {
        title: "Stand like the stag",
        instructions:
          "Stand barefoot with your feet hip-width apart, knees soft, and lift your chin. Feel the weight through your heels and the crown of your head lifting. Imagine new antlers growing, tender and strong.",
        minutes: 5,
        timed: true,
      },
      {
        title: "Name the growth",
        instructions:
          "Say aloud the challenge you are growing into: a role, a decision, a boundary. Say it as if it is already part of you.",
        spoken: "I have grown into this. I carry it well.",
      },
      {
        title: "Claim it",
        instructions: "Hold the stone, if you have one, against your chest. Sit, breathe, and let the feeling settle into your body.",
        minutes: 5,
      },
      {
        title: "Close",
        instructions: "Thank the God and snuff the candle. Carry one twig or the stone with you until the next moon.",
        snuff: true,
      },
    ],
    closing: "Return the twigs to the woods or hedge where you found them at the next full moon.",
    safety: CANDLE_SAFETY,
    lore: `${MOON_LORE} The antlered god figure in modern Wicca is often linked to the Gaulish Cernunnos, known from a handful of Romano-Celtic carvings, including the Gundestrup cauldron.`,
    sources: [
      "Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)",
      "Green, Dictionary of Celtic Myth and Legend (on Cernunnos)",
    ],
  },
  {
    id: "wicca-sturgeon-moon",
    title: "Sturgeon Moon Water Scrying",
    kind: "ritual",
    summary:
      "August's moon, named for the ancient fish of the great lakes. Gaze into dark water to reach for deep, slow wisdom from below the surface.",
    intention: "intuition",
    alsoFor: ["peace"],
    practices: ["solitary", "sea", "hedge"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 30,
    level: "intermediate",
    solo: true,
    ingredients: [
      { name: "A dark bowl, or a bowl with a black cloth beneath it", ref: "traditional/vessel/bowl" },
      { name: "Water, ideally collected from a river or lake (not for drinking)" },
      { name: "A pinch of dried mugwort, kept outside the bowl", ref: "traditional/herb/mugwort", optional: true },
      { name: "A silver or blue candle", ref: "traditional/candle/blue" },
      { name: "A labradorite", ref: "traditional/crystal/labradorite", optional: true },
      { name: "Your book of shadows", ref: "traditional/tool/book_of_shadows" },
    ],
    preparation:
      "Darken the room. Fill the bowl and place the candle behind you or to one side, so its light glimmers on the water but its reflection doesn't stare back at you. Lay the mugwort and stone next to the bowl.",
    steps: [
      {
        title: "Light and settle",
        instructions: "Light the candle. Breathe slowly until your body feels heavy and calm, like a fish resting in deep water.",
        light: true,
        minutes: 3,
      },
      {
        title: "Ask the question",
        instructions: "Ask one question aloud, simply, then let it go.",
        spoken: "Old one of the deep water, slow and wise, show me what lies beneath.",
      },
      {
        title: "Gaze",
        instructions:
          "Look into the water with soft, unfocused eyes. Don't search for images; let them surface on their own: shapes, colours, words in your mind, memories, feelings.",
        minutes: 10,
        timed: true,
      },
      {
        title: "Record",
        instructions: "Write down everything you noticed without judging it. Meaning often comes days later.",
        minutes: 5,
      },
      {
        title: "Close",
        instructions: "Thank the water and snuff the candle.",
        snuff: true,
      },
    ],
    closing: "Return the water to the earth or a river. Eat something to come back to yourself.",
    safety: `${CANDLE_SAFETY} If you collect water from a river or lake, stay on firm ground well back from the edge, avoid fast-flowing or flooded water, never go alone at night, and wash your hands afterwards. Mugwort is for setting by the bowl only: never eat or drink it, and avoid handling it if you are pregnant, breastfeeding or allergic to the daisy family. Keep it away from pets.`,
    lore: `${MOON_LORE} Scrying in water is one of the oldest forms of divination, described in the Greek Magical Papyri and many later folk traditions.`,
    sources: [
      "Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)",
      "The Greek Magical Papyri (on bowl divination; Betz, ed., for an overview)",
    ],
  },
  {
    id: "wicca-harvest-moon",
    title: "Harvest (Corn) Moon Gratitude",
    kind: "ritual",
    summary:
      "The full moon nearest the autumn equinox rises early and bright for several nights, once giving farmers extra light to harvest by. Count your gains and give thanks.",
    intention: "prosperity",
    alsoFor: ["peace"],
    practices: ["solitary", "kitchen", "folk"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 25,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "An ear of corn, a sheaf of wheat, or a bowl of grains" },
      { name: "A gold or orange candle", ref: "traditional/candle/gold" },
      { name: "A citrine or pyrite", ref: "traditional/crystal/citrine", optional: true },
      { name: "A small jar with a lid", ref: "traditional/vessel/spell_jar" },
      { name: "Paper and pen" },
    ],
    preparation: "Set the grain and the candle on the altar, or outdoors in the early moonrise if you can.",
    steps: [
      {
        title: "Light for the harvest",
        instructions: "Light the candle as the moon rises, big and golden on the horizon.",
        light: true,
        spoken: "Harvest Moon, lantern of the fields, light me as I gather in.",
      },
      {
        title: "Count the gains",
        instructions:
          "Write a list of everything you have gained this year: money, skills, friendships, small comforts. Read it aloud.",
        minutes: 8,
      },
      {
        title: "Store it up",
        instructions:
          "Fold the list into the jar with a few grains of corn or wheat and the stone. Close the lid.",
        spoken: "What I have gathered, I keep. What I have stored will feed me through the dark.",
      },
      {
        title: "Give thanks",
        instructions: "Scatter a handful of grain outdoors for the birds as thanks to the earth. Snuff the candle.",
        snuff: true,
      },
    ],
    closing: "Keep the jar on your altar or in your kitchen until spring, and open and reread the list on a hard day.",
    safety: CANDLE_SAFETY,
    lore: `${MOON_LORE} Which moon is the Harvest Moon depends on the year: it is the full moon closest to the autumn equinox, so it may fall in September or early October. When the Harvest Moon falls in October, September's full moon is often called the Corn Moon.`,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-hunters-moon",
    title: "Hunter's Moon Aim",
    kind: "spell",
    summary:
      "The full moon after the Harvest Moon, when hunters once prepared for winter. Choose one clear target and sharpen your focus toward it.",
    intention: "courage",
    alsoFor: ["study", "protection"],
    practices: ["solitary", "elemental"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 20,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A red candle", ref: "traditional/candle/red" },
      { name: "A straight stick or a pencil, as an arrow" },
      { name: "A small knife or sharpener" },
      { name: "A slip of paper" },
      { name: "A hematite or obsidian", ref: "traditional/crystal/hematite", optional: true },
      { name: "Artemis or Diana, the huntress of the moon", ref: "traditional/deity/artemis", optional: true },
    ],
    preparation: "Decide on one goal for the winter months. Keep it small and specific.",
    steps: [
      {
        title: "Light",
        instructions: "Light the red candle and look into its steady point of flame.",
        light: true,
        spoken: "Huntress of the silver bow, steady my hand and true my aim.",
      },
      {
        title: "Write the target",
        instructions: "Write your goal on the paper as one short sentence. Place it on the far side of the altar.",
      },
      {
        title: "Sharpen the arrow",
        instructions:
          "Sharpen the pencil or whittle the end of the stick to a point, slowly, away from your body. With each stroke, cut away a distraction: name it as it falls.",
        minutes: 5,
      },
      {
        title: "Aim",
        instructions:
          "Point the arrow at the target. Hold it steady and breathe out. Then lay it on the paper, pointing to your goal.",
        spoken: "Seen, sighted, sure. I go straight to it.",
      },
      {
        title: "Close",
        instructions: "Snuff the candle. Use the pencil for your next step toward the goal.",
        snuff: true,
      },
    ],
    closing: "Keep the paper and arrow together on the altar until the goal is met.",
    safety: `${CANDLE_SAFETY} Carve away from your body and keep blades away from children.`,
    lore: `${MOON_LORE} Artemis and Diana, hunter goddesses linked with the moon in Greek and Roman religion, are often honoured at this moon in modern practice.`,
    sources: [
      "Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)",
      "Homeric Hymn 27, To Artemis (public domain)",
    ],
  },
  {
    id: "wicca-beaver-moon",
    title: "Beaver Moon Home Ward",
    kind: "spell",
    summary:
      "November's moon, when beavers finish their lodges for winter. Build a small ward from twigs and herbs to protect your home through the cold months.",
    intention: "protection",
    alsoFor: ["prosperity", "peace"],
    practices: ["solitary", "green", "folk"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 30,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "Six twigs of about the same length, from birch, rowan or oak", ref: "traditional/herb/rowan" },
      { name: "Red thread or natural twine" },
      { name: "A sprig of dried rosemary", ref: "traditional/herb/rosemary" },
      { name: "A bay leaf", ref: "traditional/herb/bay" },
      { name: "A brown candle", ref: "traditional/candle/brown" },
    ],
    preparation: "Gather fallen twigs and let them dry indoors for a few days.",
    steps: [
      {
        title: "Light the hearth",
        instructions: "Light the brown candle, the colour of earth, wood and home.",
        light: true,
      },
      {
        title: "Build the lodge",
        instructions:
          "Lay the twigs in a hash shape or a small six-sided frame, binding each crossing with thread. Work patiently, like a beaver at a dam. With every knot, name a part of your home: the door, the windows, the beds, the kitchen.",
        spoken: "Stick by stick and knot by knot, I build a lodge the cold cannot.",
        minutes: 12,
      },
      {
        title: "Weave in the herbs",
        instructions: "Tuck the rosemary and bay leaf into the frame for protection and plenty.",
      },
      {
        title: "Charge it",
        instructions: "Hold the ward up to the moon or the candle and breathe on it three times.",
        spoken: "Warm within and safe without, till the spring comes round about.",
      },
      {
        title: "Close",
        instructions: "Snuff the candle and hang the ward by your front door.",
        snuff: true,
      },
    ],
    closing: "Leave it up until the spring equinox, then burn it safely or return it to the earth with thanks.",
    safety: `${CANDLE_SAFETY} Keep the dried twigs and herbs well away from the flame.`,
    lore: MOON_LORE,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-cold-moon",
    title: "Cold Moon Stillness",
    kind: "ritual",
    summary:
      "December's moon, near the longest nights. Wrap up, warm your hands on a cup, and let the old year settle into quiet before the solstice.",
    intention: "peace",
    alsoFor: ["healing"],
    practices: ["solitary", "kitchen"],
    paths: ["wicca"],
    moon: ["full"],
    minutes: 25,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A white or silver candle", ref: "traditional/candle/white" },
      { name: "A mug of warm milk or herbal tea, such as chamomile with a pinch of cinnamon", ref: "traditional/herb/chamomile" },
      { name: "A warm blanket" },
      { name: "An amethyst or howlite", ref: "traditional/crystal/amethyst", optional: true },
    ],
    preparation: "Make the drink and settle near a window where you can see the moon, wrapped in the blanket.",
    steps: [
      {
        title: "Light",
        instructions: "Light the candle and look at the moon in the cold sky.",
        light: true,
        spoken: "Cold Moon, high and clear, still the year and still me here.",
      },
      {
        title: "Warm your hands",
        instructions: "Hold the mug in both hands and feel the warmth soak into your palms. Sip slowly.",
        minutes: 5,
      },
      {
        title: "Lay the year down",
        instructions:
          "Think through the year, month by month, and for each one say one word. Don't judge any of them. Just lay them down, like snow settling.",
        minutes: 7,
      },
      {
        title: "Rest",
        instructions: "Sit in silence with the stone in your hand, and do nothing at all.",
        minutes: 5,
        timed: true,
      },
      {
        title: "Close",
        instructions: "Snuff the candle and go to bed early.",
        snuff: true,
      },
    ],
    closing: "Let this be your permission to rest until Yule.",
    safety: `${CANDLE_SAFETY} Keep the blanket well away from the candle. Avoid chamomile if you are allergic to the daisy family.`,
    lore: MOON_LORE,
    sources: ["Old Farmer's Almanac and Maine Farmers' Almanac (on the popular moon names)"],
  },
  {
    id: "wicca-blue-moon-long-wish",
    title: "Blue Moon Long Wish",
    kind: "spell",
    summary:
      "A rare extra full moon. Write a wish too big for one season, seal it, and leave it unopened until the next blue moon, two or three years away.",
    intention: "beginnings",
    alsoFor: ["prosperity", "courage"],
    practices: ["solitary", "cosmic"],
    paths: ["wicca"],
    moon: ["blue"],
    minutes: 30,
    level: "beginner",
    solo: true,
    ingredients: [
      { name: "A blue candle", ref: "traditional/candle/blue" },
      { name: "Good paper and an envelope" },
      { name: "Sealing wax or a ribbon" },
      { name: "A sprig of lavender", ref: "traditional/herb/lavender" },
      { name: "A lapis lazuli or sodalite", ref: "traditional/crystal/lapis_lazuli", optional: true },
    ],
    preparation:
      "Check the date of the next blue moon and note it in your diary or book of shadows. Think about where you want to be by then.",
    steps: [
      {
        title: "Light the blue candle",
        instructions: "Light the candle and look out at this rare moon.",
        light: true,
        spoken: "Once in a blue moon the door stands wide. Once in a blue moon, I step inside.",
      },
      {
        title: "Write the long wish",
        instructions:
          "Write a letter to your future self, dated for the next blue moon. Describe the life you hope you are living, in the present tense, as if it has already come true.",
        minutes: 15,
      },
      {
        title: "Seal it",
        instructions:
          "Fold the letter around the lavender sprig, slip it in the envelope, and seal it with wax or a ribbon. Write the date of the next blue moon on the front.",
      },
      {
        title: "Ask the moon to hold it",
        instructions: "Hold the envelope up to the moon, with the stone resting on top.",
        spoken: "Keep it for me, moon. I'll come back for it.",
      },
      {
        title: "Close",
        instructions: "Snuff the candle and put the envelope away somewhere safe.",
        snuff: true,
      },
    ],
    closing: "On the next blue moon, open the letter and read it under the moon, then write the next one.",
    safety: `${CANDLE_SAFETY} Take care with sealing wax; it is hot enough to burn skin.`,
    lore:
      "“Blue moon” has two meanings. The older, used in the Maine Farmers' Almanac, is the third full moon in a season of four. The newer, and now popular, is the second full moon in a calendar month; it comes from a 1946 misreading in Sky & Telescope magazine. Either way it happens every two or three years, which gave English the phrase “once in a blue moon” for something rare. Marking it with a special rite is modern Pagan practice.",
    sources: ["Maine Farmers' Almanac (on the seasonal blue moon)", "Sky & Telescope (1946, and its 1999 correction)"],
  },
];
