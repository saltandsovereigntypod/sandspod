// The shapes read in tea leaves and coffee grounds (tasseography). The
// meanings are the ones handed down in Western folk and parlour tradition,
// recorded in Victorian and Edwardian guides to the cup; there is no ancient
// authority behind them, and readers have always differed. Each has a short
// `theme` the reading uses when it places the shape in the cup, a `tone`
// (how readers usually take it), and a question to sit with. Also used for
// poured wax, which is read the same way. Pure data.

export type Tone = 'good' | 'hard' | 'mixed';
export type TeaCategory = 'creature' | 'object' | 'nature' | 'mark' | 'form' | 'person';

export type TeaSymbol = {
  id: string;
  name: string;
  /** Other words people use for it, so a search finds it. */
  words: string[];
  category: TeaCategory;
  tone: Tone;
  /** What it stands for in a few words, to place in a sentence. */
  theme: string;
  meaning: string;
  question: string;
};

// id | name | other words | category | tone | theme | meaning | question
const ROWS = `
anchor|Anchor|harbour,ship,mooring|object|good|steadiness and a safe harbour|The anchor is one of the kindest shapes in the cup: stability, a place that holds you, and the end of drifting. Some readers add that it can mean travel ending well.|Where in your life do you most need something to hold?
bird|Bird|wing,swan,dove,flying|creature|good|news on the wing|A bird brings news, often good, and often from a distance. A bird in flight is a message on its way; one at rest, a message already here.|Who might be about to write or call?
snake|Snake|serpent,adder|creature|hard|someone not quite straight with you|The snake is the old sign of an enemy or a false friend, or of a temptation. Some readers also give it wisdom and healing, so look at how it lies: a clean curve is kinder than a knotted coil.|Is there someone whose words and actions do not quite match?
ring|Ring|circle band,wedding,hoop|object|good|a promise or a circle completing|A ring is a commitment: marriage or partnership, a promise made, or a matter coming full circle. If it is broken or open, a promise is wavering.|What are you ready to commit to, or to be released from?
heart|Heart|love,valentine|form|good|love and the feelings|A heart speaks of love, plainly: a romance, or a deep affection. Dots around it are readers' old sign for gifts or kindness coming.|What does your heart already know here?
key|Key|lock,latch|object|good|an opening and an answer|A key means a door will open: an answer, a chance, access to something closed. Readers often say that you already hold what you need.|What door have you been standing at?
ladder|Ladder|steps,climb,rungs|object|mixed|a step up, with effort|A ladder is promotion and ascent, but earned rung by rung. A rung missing is a warning to check your footing before you climb.|Which rung is next, and what is it asking of you?
cross|Cross|crucifix,plus,x|mark|hard|a burden or a trial to bear|The cross is usually read as a trial, sacrifice or sorrow, though it can also mean protection. Read how it sits: a clear cross at the bottom is lighter than one near the rim.|What are you carrying that is not yours?
moon|Moon|crescent,full moon|nature|mixed|intuition and a change coming|A full moon is success and fulfilment; a crescent is a beginning, or a hidden matter rising to light. Either way the moon asks you to trust your instincts.|What does your intuition keep telling you?
star|Star|stars,sparkle|nature|good|hope and good fortune|The star is hope, and a wish with a chance of coming true. Several stars together mean good luck, and a very small one, a modest hope.|What do you hope for that you haven't said aloud?
tree|Tree|oak,branches,forest|nature|good|growth and a settled life|A tree stands for growth, health and rootedness: your family, your place, your plans taking hold. Several trees are friends or a favourable move.|What have you planted that is still growing?
dog|Dog|hound,puppy|creature|good|a loyal friend|A dog is a faithful friend, someone steady who is on your side. A dog that appears to be running is a friend coming to you, or you to them.|Who has been quietly loyal to you?
cat|Cat|kitten|creature|mixed|a cunning or independent presence|A cat is cleverness and independence, and sometimes a guarded person nearby who will not say all they think. Readers have also seen it as a sign of luck at home.|Who keeps their own counsel around you?
fish|Fish|trout,salmon|creature|good|abundance and good news from afar|A fish means good fortune, a gain of money or food, and news coming from far off, perhaps over water. Several fish are a lively social round.|Where is something plentiful, if you look?
boat|Boat|ship,vessel,sail|object|good|a journey or a visit|A boat is a journey, or a visitor arriving. Calm water around it is a kind passage; leaves clustered thickly around it are rougher seas.|Where would you go if the way were clear?
house|House|home,building,roof|object|good|home and what is settled|A house is home and security: a move, a purchase, or a change in who lives there. A shaky or broken outline asks you to look at the foundations.|What does home need from you?
letter|Letter|a letter,initial,alphabet|mark|good|a person or name that matters|A letter of the alphabet stands for a name: someone whose initial it is, or a place. Its position tells you whether they are close or far.|Whose name starts with it?
number|Number|numbers,digit,figure|mark|mixed|time, or a count of something|A number is a quantity or a time: days, weeks, people, pounds. Read it with the nearest shape and see what it counts.|What in your life do you keep counting?
dots|Dots|spots,specks,dust|mark|mixed|small things adding up|Dots are money, small gains or small events piling up; scattered dots with a line through them are a journey made in stages.|What small thing is quietly accumulating?
line|Line|lines,stripe,straight line|mark|mixed|a path, a journey or a boundary|A straight, clear line is a smooth path or a journey; a wavy one, uncertainty or a changeable road. Several lines may be a plan with options.|Is your road straight, or are you bending it?
cloud|Cloud|clouds,fog,mist,haze|nature|hard|doubt and confusion|Clouds are trouble or confusion, hiding the matter. Read the shapes beside them: clouds around a good symbol say it is not yet clear, and clouds that break up say it will be.|What are you not seeing clearly yet?
triangle|Triangle|three corners,pyramid|form|good|a lucky turn, or three people|A triangle is good luck and the unexpected in your favour, though readers also take it to mean a triangle of people, which asks for care.|Is there a third person in this story?
circle|Circle|round,ring shape,disc|form|good|completion and success|A circle means completion, a cycle finished, or success. A closed one is more certain; one with a gap is not yet done.|What is nearly complete?
square|Square|box,cube|form|good|stability, and sometimes confinement|A square is stability and protection, though it can also be a limit: a boxed-in feeling. Which it is depends on how you feel looking at it.|Does this feel like shelter or a cage?
crown|Crown|king,queen,tiara|object|good|honour, success and authority|A crown is honour and public recognition, sometimes an inheritance. A crown with a cross beside it is a hard-won success.|What recognition do you actually want?
sword|Sword|knife,dagger,blade|object|hard|conflict and cutting through|A sword is conflict, quarrels or a decisive cut. Some readers also see courage: it depends whether the point is toward you or away.|What needs cutting away, and what does not?
spade|Spade|shovel,digging|object|mixed|hard work with a return|A spade is work and what comes of it: digging in, a project that needs labour, and sometimes a reward buried beneath.|What are you willing to dig for?
bell|Bell|chime|object|good|news and celebration|A bell is news, often a wedding or birth, or an alert. One bell announces; several suggest a celebration.|What good news are you waiting to hear?
bridge|Bridge|crossing|object|good|crossing over a difficulty|A bridge is a way across: a gap in your affairs that can be closed, or an opportunity to cross to something new.|What gap could you bridge, and with whom?
candle|Candle|lamp,light,flame|object|good|guidance and help|A candle is help, or a guiding light: someone who will show you the way, or spiritual comfort. A guttering one is help that is thin.|Who or what lights your way?
cup|Cup|chalice,goblet,glass|object|good|a celebration or a gift received|A cup is a gift and plenty: joy shared, a party, emotional fullness. A cup tipped over is something wasted or spilled.|What would it mean to drink from your own cup?
hand|Hand|fist,palm|person|mixed|friendship or a bargain|An open hand is friendship and help offered; a closed one is a quarrel or a grip held too hard. Two hands together make an agreement.|Who is offering, and what are you holding on to?
eye|Eye|watchful,gaze|person|mixed|being watched or noticed|An eye is caution: someone watching, or the need to look more closely at a matter. Some readers see it as protection.|What have you not looked at closely enough?
face|Face|head,profile|person|mixed|a person who matters|A face is a person entering your life or already central to it. Its expression, smiling or stern, is how they will be toward you.|Who is the face that came to mind first?
child|Child|baby,infant|person|good|a new beginning|A child is a new project or a literal birth, or your own inner child. It is nearly always a seed, and a hopeful one.|What new thing needs gentle handling?
man|Man|figure,gentleman|person|mixed|a man in your story|A human figure is a person coming into the story: the more distinct, the nearer they are to you. Its position tells you how soon.|Who is walking toward you in your life?
woman|Woman|lady,girl|person|mixed|a woman in your story|A woman is a person, a friend, a mother or a rival, depending on where she lies. A woman with her arms raised is welcoming.|Who do you hope to hear from?
horse|Horse|rider,pony|creature|good|strength and swift movement|A horse is energy, travel and a strong ally; a galloping horse means news at speed. A horse with a rider is help arriving.|Where do you need more strength, and where less hurry?
cow|Cow|bull,ox|creature|good|comfort and plenty|A cow is comfort, patience and slow prosperity; a bull is a stubborn force, in yourself or someone else.|What is slow but sure in your life?
rabbit|Rabbit|hare,bunny|creature|mixed|timidity, or fertility|A rabbit is a nervous nature, or its opposite: fertility and abundance. Readers also take it as a sign to avoid hasty decisions.|Where might fear be taking the lead?
mouse|Mouse|rat,rodent|creature|hard|small thefts and worries|A mouse is a small loss, a nibbling worry or a petty thief. Look at where it sits: it is cause for tidying, not for fear.|What small drain should you stop?
spider|Spider|web,cobweb|creature|good|patient industry, or entanglement|A spider is patient work that pays and money coming in; a web is a tangle you have helped to spin.|What are you building slowly?
butterfly|Butterfly|moth|creature|good|change and lightness|A butterfly is a change of form and a lightness returning; it can also be a caution against too much frivolity.|What is changing, and can you let it?
lion|Lion|lioness|creature|good|courage and powerful friends|A lion is courage and influence, and sometimes a strong protector. A very big one asks whether you are being brave or merely proud.|Where does courage ask to be used?
owl|Owl|night bird|creature|hard|wisdom, and a warning|An owl is wisdom and night-time knowing; in older parlour tradition it was also a warning of bad news or illness. Both readings ask for attention.|What has been waiting for you in the quiet?
duck|Duck|goose,swan shape|creature|good|small profit and comfort|A duck is a modest gain and a comfortable life. Ducks together are a gathering of friends.|What small profit have you overlooked?
tortoise|Tortoise|turtle,snail|creature|mixed|slow progress and protection|A tortoise is slow but sure progress, and a shell: protecting yourself well. It reminds you that the finish need not be fast.|What would patience do for you now?
fan|Fan|flirt,feather|object|mixed|flirtation or a secret|A fan is flirtation, or a secret kept behind it. It asks whether things are as open as they look.|What is being half-hidden?
flower|Flower|rose,blossom,petals|nature|good|joy, and a gift of beauty|A flower is happiness and a gift, a courtship or a time of flourishing. A wilted one is a fading affection.|What deserves watering?
leaf|Leaf|leaves,foliage|nature|good|renewal and small luck|A leaf is a small, fresh gain, a new start in a minor way. A bunch of leaves is plenty.|What small beginning has appeared?
mountain|Mountain|hill,peak|nature|hard|an obstacle to climb|A mountain is a large obstacle, or a great ambition. Several mountains are many difficulties; a clear route up is a way through.|What is the size of the climb, honestly?
river|River|stream,water,wave|nature|mixed|flow, and changes of circumstance|A wavy line may be water: a journey over it, or the flow of change. Calm water is peace; rough, upheaval.|What would it mean to go with the current?
sun|Sun|sunburst,rays|nature|good|success and joy|The sun is among the best signs in the cup: success, happiness, warmth and health. It is plain good luck.|What deserves to be celebrated now?
rain|Rain|drops,shower|nature|mixed|tears, and a cleansing|Rain is sorrow or tears, and also the washing that follows. Several drops are a short shower and not a season.|What needs to be washed away?
lightning|Lightning|bolt,zigzag|nature|hard|a sudden shock|A zigzag is a sudden event, a shock or a quick turn: a surprise, kind or unkind. It passes quickly.|What would you do if it came out of the blue?
fire|Fire|flames,blaze|nature|mixed|passion or anger|Fire is passion, energy and anger. Warm fire is vitality, and wild fire, a temper that needs a guard.|What is burning in you that wants to be used?
bridge-arch|Arch|doorway,gate,archway|object|good|a gateway into something new|An arch or gate is a threshold: a new stage, and an invitation to pass through when you are ready.|What threshold are you at?
wheel|Wheel|cartwheel,cycle|object|mixed|a turning of fortune|A wheel is fortune turning and things coming round again; it can mean travel, or work that goes on in cycles.|What cycle is turning once more?
umbrella|Umbrella|parasol,shelter|object|mixed|protection against a storm|An umbrella is shelter from trouble, or help arriving, but also a sign that some rain is coming.|What do you need shelter from?
scissors|Scissors|shears,cut|object|hard|a quarrel, or a parting|Scissors are a separation: a quarrel, a cutting of ties, or the trimming away of what is no longer needed.|What tie is ready for trimming?
chair|Chair|seat,stool|object|mixed|rest, or a visitor|A chair is rest, or someone to come and sit with you; an empty chair is an absence being felt.|Who is the chair kept for?
table|Table|desk,bench|object|good|meetings and agreements|A table is a meeting or a meal shared: business, family, or an agreement being made. A laden table is plenty.|Who should be at your table?
book|Book|page,scroll|object|good|learning and a story|A book is study, or a story that is being written. A closed book is a secret and an open one a truth coming to light.|What are you ready to learn?
mask|Mask|disguise,hidden face|object|hard|something hidden|A mask is a person or a situation not as it seems; sometimes it is your own, put on for others.|What face are you wearing?
cage|Cage|bars,prison|object|hard|feeling confined|A cage is limitation: a job, a bond or a mood that holds you. Look at the gap in it, for most cages have one.|What holds you, and is the door actually shut?
chain|Chain|links,knot|object|mixed|ties and obligations|A chain is a bond, kind or heavy: a marriage, a duty, or a habit. Closed links are firm and broken ones freeing.|What bonds do you choose, and which not?
coin|Coin|money,penny,pound|object|good|money and its worth|A coin is money, and some readers say a round one is a payment coming. Several coins are a good run of fortune.|What does enough look like?
crescent|Crescent|new moon|nature|good|a new beginning|A crescent is a start: the first of something, with growth ahead, though it is still small.|What has only just begun?
feather|Feather|plume|nature|good|a light touch, or a visit|A feather is lightness and a gentle sign; some readers take it as a visit from a loved one who has died.|What feels lighter than you expected?
shell|Shell|conch,seashell|nature|good|a retreat, or a voice from afar|A shell is a safe retreat and good news from the sea; it asks you to listen as well as to speak.|What do you hear, when you listen?
tower|Tower|castle,turret|object|hard|a sudden upheaval, or ambition|A tower is a great ambition or one that can fall; readers also take it as a sign of a change coming quickly to a fixed matter.|What on your list is built on shaky ground?
egg|Egg|oval,ovoid|form|good|a new beginning, a gift of potential|An egg is a beginning, a potential not yet shown: a project, or a pregnancy. It is a sign to protect something small.|What is waiting to hatch?
arrow|Arrow|dart,spear|object|mixed|a message or a hurt|An arrow is a message coming fast or a barbed word; its direction matters, and one pointing to the handle is meant for you.|What is aimed at you, and what are you aiming at?
bowl|Bowl|dish,pot|object|good|nourishment and giving|A bowl is nourishment and plenty, or a request: a hand held out. A full bowl is satisfied, and an empty one hopeful.|What fills you up?
hat|Hat|cap,bonnet|object|mixed|a change of role, or a new occasion|A hat is a role taken up or put down: a new position, a public occasion, or an invitation. A hat at a tilt is a lighter-hearted turn.|Which role are you wearing that you could change?
basket|Basket|hamper|object|good|gifts and plenty carried|A basket is a gift received, or a harvest gathered in. A full basket is plenty; an empty one is a request to be filled.|What are you gathering?
hourglass|Hourglass|sand timer,egg timer|object|mixed|time running, and a deadline|An hourglass is a deadline or time passing: a matter that will not wait forever, and a reminder to use the time well.|What has a date on it?
lantern|Lantern|torch,lamp post|object|good|guidance through a dark stretch|A lantern is a light carried on a dark road: guidance, a helper, or a quiet inner knowing.|Who or what has been lighting the way?
necklace|Necklace|beads,chain of beads,pearls|object|good|a gift, and a bond of affection|A necklace or string of beads is a gift or a binding affection, or a run of small happy events one after another.|Which small joys are strung together?
bottle|Bottle|flask,jar|object|mixed|something held in, or a message|A bottle is feeling kept corked, or a message sent out. A stoppered one is a secret and an open one a release.|What have you been bottling up?
gun|Gun|pistol,rifle|object|hard|a sudden quarrel or danger|A gun is a sudden conflict, or a warning against a hot-headed act. It is rare in a cup and not often a literal one.|Where are tempers close to the surface?
pig|Pig|hog,boar|creature|mixed|greed, or good fortune in the home|A pig is comfort and plenty at home, with a note against greed or being greedy for the thing you want.|What would be enough?
harp|Harp|lyre,instrument|object|good|harmony and music|A harp is harmony, a time of agreement and joy in company, and sometimes a gift for music or poetry.|What would harmony take?
`;

export const TEA_SYMBOLS: TeaSymbol[] = ROWS.trim()
  .split('\n')
  .map((row) => {
    const [id, name, words, category, tone, theme, meaning, question] = row.split('|');
    return { id, name, words: words.split(',').map((w) => w.trim()), category, tone, theme, meaning, question } as TeaSymbol;
  });

export const teaSymbolById = (id: string) => TEA_SYMBOLS.find((s) => s.id === id);
