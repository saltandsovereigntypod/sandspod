// A short reference of common dream symbols: what people have often taken
// them to mean, offered as places to start rather than answers. Written for
// the app. Your own associations, and how the dream felt, matter most.

export type DreamSymbol = { symbol: string; also: string[]; notes: string; ask: string };

export const DREAM_SYMBOL_INTRO =
  'These are starting points, not a dictionary. A dog means something different to someone who grew up with one than to someone who was bitten. Begin with what the thing means to you and how the dream felt; reach for these only when you’re stuck.';

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    symbol: 'water',
    also: ['sea', 'river', 'flood', 'rain', 'lake'],
    notes: 'Often read as feeling: calm water for a settled heart, rough or rising water for emotion that feels bigger than you. Rivers can be time and change, crossings a threshold.',
    ask: 'Was the water clear or murky, and were you in it, on it or watching?',
  },
  {
    symbol: 'house',
    also: ['home', 'rooms', 'attic', 'cellar'],
    notes: 'Many read a house as the self. New rooms can be parts of you or your life you haven’t used yet; cellars what’s buried, attics what’s stored away or remembered.',
    ask: 'Whose house was it, and which room were you drawn to?',
  },
  {
    symbol: 'teeth',
    also: ['teeth falling out', 'losing teeth'],
    notes: 'One of the most common dreams anywhere. Often linked with worry about how you come across, losing control, or a change in life stage. It’s rarely about teeth.',
    ask: 'What in waking life feels as if it’s slipping, or on show?',
  },
  {
    symbol: 'falling',
    also: ['fall', 'dropping'],
    notes: 'Commonly tied to feeling unsupported or out of control. The jolt as you drift off (a hypnic jerk) is a body thing and needn’t mean anything at all.',
    ask: 'Did you land, wake, or start to fly?',
  },
  {
    symbol: 'flying',
    also: ['flight', 'floating'],
    notes: 'Often freedom, perspective or rising above something. Struggling to stay up can be effort that feels unsustainable. A common doorway into lucid dreaming.',
    ask: 'Was it joyful, effortful, or frightening?',
  },
  {
    symbol: 'being chased',
    also: ['chase', 'pursued', 'running'],
    notes: 'Frequently something avoided: a feeling, a task, a conversation. Some find that turning to face the pursuer in a later dream changes it.',
    ask: 'What would happen if you stopped running?',
  },
  {
    symbol: 'snake',
    also: ['serpent', 'adder'],
    notes: 'Carries opposite meanings across cultures: danger and betrayal, or healing, wisdom and renewal (the skin shed). In folk tradition, guardians of wells and thresholds.',
    ask: 'Did the snake threaten, guard, or simply watch?',
  },
  {
    symbol: 'dog',
    also: ['hound', 'puppy', 'black dog'],
    notes: 'Loyalty, protection, friendship, instinct. In British and Irish folklore a black dog can be a guardian of roads and churchyards, or an omen; to many now it names low mood.',
    ask: 'Did the dog feel like a friend, a guard or a threat?',
  },
  {
    symbol: 'cat',
    also: ['kitten'],
    notes: 'Independence, intuition, the private self; for many practitioners, a familiar. Folklore gave cats second sight and a footing in both worlds.',
    ask: 'Was the cat yours, a stranger, or leading you somewhere?',
  },
  {
    symbol: 'bird',
    also: ['crow', 'raven', 'owl', 'robin'],
    notes: 'Messages and messengers. Crows and ravens tie to prophecy and the dead in much folklore; owls to night wisdom; a robin, for many, to a loved one who has died.',
    ask: 'What kind of bird, and did it bring or take something?',
  },
  {
    symbol: 'the dead',
    also: ['dead relative', 'ancestor', 'ghost', 'grandmother', 'grandfather'],
    notes: 'Visitation dreams of the beloved dead are common in grief and often feel unlike other dreams: calm, clear, and brief. Many traditions take them as real visits; all of them hold them as precious.',
    ask: 'What did they say or give you, and how did you feel waking?',
  },
  {
    symbol: 'death',
    also: ['dying', 'funeral'],
    notes: 'Seldom a forecast. Usually an ending that makes room for something: a job, a role, a version of yourself.',
    ask: 'What in your life is ending, or needs to?',
  },
  {
    symbol: 'baby',
    also: ['birth', 'pregnancy', 'child'],
    notes: 'New beginnings, a project or part of yourself that needs care, or vulnerability. Children in dreams can also be your younger self.',
    ask: 'Whose was it, and did you feel ready to care for it?',
  },
  {
    symbol: 'moon',
    also: ['full moon', 'crescent'],
    notes: 'Cycles, intuition, the hidden and the feminine in many traditions. Note the phase you saw: a waxing moon for growth, a full one for culmination, a dark one for rest.',
    ask: 'What phase was it, and how did its light fall?',
  },
  {
    symbol: 'door',
    also: ['gate', 'threshold', 'key', 'locked door'],
    notes: 'Thresholds and choices. A locked door can be a boundary or something not yet ready; a key, access or an answer you already hold. Hedge work is threshold work, so watch these.',
    ask: 'Did you go through, and what was on the other side?',
  },
  {
    symbol: 'road',
    also: ['path', 'crossroads', 'journey', 'lost'],
    notes: 'The way your life is going. Crossroads are old places of choice and spirit meetings; being lost can be uncertainty about direction.',
    ask: 'Were you choosing the way, or being carried?',
  },
  {
    symbol: 'tree',
    also: ['forest', 'woods', 'oak', 'hawthorn'],
    notes: 'Growth, family, roots and reach. A forest can be the unknown or a place of refuge. The world tree links the realms in many traditions; a lone hawthorn was a fairy tree.',
    ask: 'Was the tree flourishing, bare, or fallen?',
  },
  {
    symbol: 'fire',
    also: ['flames', 'burning', 'candle', 'hearth'],
    notes: 'Passion, anger, transformation, purification. A hearth fire can be home and warmth; a house fire, change that feels out of hand.',
    ask: 'Were you warmed by it or running from it?',
  },
  {
    symbol: 'naked',
    also: ['nudity', 'undressed'],
    notes: 'Being exposed or seen as you are. Embarrassment points to fear of judgement; ease can mean acceptance.',
    ask: 'Did anyone else notice?',
  },
  {
    symbol: 'exam',
    also: ['test', 'unprepared', 'late'],
    notes: 'Feeling tested or judged, often long after school ends. Running late can be pressure, or a sense of missing a chance.',
    ask: 'Where in waking life do you feel measured?',
  },
  {
    symbol: 'mirror',
    also: ['reflection'],
    notes: 'Self-image and self-knowledge. A strange reflection can be a side of you not yet met. Mirrors are old scrying tools and doorways in folklore.',
    ask: 'Did the reflection match you?',
  },
  {
    symbol: 'spider',
    also: ['web'],
    notes: 'Weaving, patience, creativity and fate; or feeling caught. In many tales the spider is a storyteller and spinner of the world.',
    ask: 'Were you weaving or caught?',
  },
  {
    symbol: 'hare',
    also: ['rabbit'],
    notes: 'In British and Irish lore, the hare is a creature of the moon and of witches, said to be a witch in another shape. Also speed, fertility and spring.',
    ask: 'Did it run from you, or wait?',
  },
  {
    symbol: 'stairs',
    also: ['ladder', 'climbing', 'lift'],
    notes: 'Moving between levels: going up toward aims or clarity, going down into memory and the deeper self, a common image in journeying.',
    ask: 'Up or down, and was it easy?',
  },
];

/** The reference entry a dream symbol matches, if any (by name or one of its other words). */
export function symbolReference(symbol: string): DreamSymbol | null {
  const s = symbol.toLowerCase().trim();
  if (!s) return null;
  return (
    DREAM_SYMBOLS.find((d) => d.symbol === s || d.also.includes(s)) ??
    DREAM_SYMBOLS.find((d) => s.split(' ').some((w) => w.length > 2 && (d.symbol === w || d.also.includes(w)))) ??
    null
  );
}
