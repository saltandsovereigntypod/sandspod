// A written reading for each Petit Lenormand card, in the shape the tarot's
// readings use (readings/types.ts): which way it leans on a plain question,
// why, one practical step, and a few sentences for each part of life. The
// general reading is the card's own "as the subject" text (lenormand.ts).
// Lenormand has no reversals, so each card has one reading. The leans follow
// the long-standing split of the deck into helpful, troubling and neutral
// cards that most German and French readers share; the topic readings are
// modern, written for this app. Pure data.

import type { CardReading } from '../readings/types.ts';
import { lenormandCard } from './lenormand.ts';

type Row = Omit<CardReading, 'topics'> & { topics: Omit<CardReading['topics'], 'general'> };

const ROWS: Record<string, Row> = {
  Rider: {
    lean: 'yes',
    why: 'Something is already on its way to you, and quickly.',
    advice: 'Check your messages and the post for the next three days, and reply the same day to anything that matters.',
    topics: {
      love: 'A new admirer, a text you were hoping for, or a fresh burst of energy in a slow romance. The Rider moves fast, so feelings may too; enjoy the speed but let a second date confirm what the first suggested.',
      money: 'News about work arrives soon: a reply to an application, an enquiry from a client, a quick decision. Keep your phone charged and your CV current.',
      health: 'Things change quickly, often for the better, after a period of waiting. Get moving, literally: brisk walks and outdoor exercise suit this card.',
      home: 'Visitors, deliveries, or news about a move. Expect the doorbell.',
      spirit: 'A message from your guides tends to come through the ordinary: a song, an overheard line, a sudden thought on a walk. Note it the moment it arrives.',
    },
  },
  Clover: {
    lean: 'yes',
    why: 'A small piece of luck is here, though it will not stay long.',
    advice: 'Take the small chance offered this week without overthinking it.',
    topics: {
      love: 'Light-hearted luck in love: a flirt, a pleasant coincidence, a fun evening. Don’t load it with expectations; let it be a little gift.',
      money: 'A modest windfall, a discount, a lucky break at work. Say yes quickly, because clover wilts in a day or two.',
      health: 'A good turn after a rough patch, perhaps a short reprieve. Laughter and fresh air genuinely help here.',
      home: 'A cheerful spell at home; a small problem sorts itself out.',
      spirit: 'Play is part of practice. Simple luck charms, a four-leaf hunt, a gratitude note at the end of the day.',
    },
  },
  Ship: {
    lean: 'yes',
    why: 'The matter involves movement and distance, and it is already under sail.',
    advice: 'Plan the journey or the change in writing, with dates, before you commit money to it.',
    topics: {
      love: 'Long distance, a holiday romance, or someone from another place. Sometimes a longing for what is far away rather than what is here.',
      money: 'Trade, imports, travel for work, or business abroad. Money that comes and goes with the tide; track it carefully.',
      health: 'Travel or a change of scene does you good. If you are already restless, a trip may settle more than you expect.',
      home: 'A move, especially a distant one, or a household where someone travels often.',
      spirit: 'Pilgrimage, ancestral lands, voyages of the inner kind. Water and crossing rites suit this card.',
    },
  },
  House: {
    lean: 'yes',
    why: 'The answer rests on stable ground: home, family and what is already yours.',
    advice: 'Deal with the matter from home base: involve family, or solve it with what you already have.',
    topics: {
      love: 'A settled, homely love; moving in, family approval, a partner who feels like home. Comfort rather than sparks.',
      money: 'Property, a family business, working from home, or a secure job. Safe, steady and not glamorous.',
      health: 'Rest at home is the cure. Keep routines and eat proper meals.',
      home: 'The card speaks of itself: your house, flat, family and the safety of four walls. A good time to put down roots.',
      spirit: 'Hearth magic, house spirits, the altar at home. Tend the household gods and the ordinary rhythms of the day.',
    },
  },
  Tree: {
    lean: 'depends',
    why: 'This grows slowly; the answer depends on time and on your roots.',
    advice: 'Think in seasons, not weeks, and tend the root of the matter first.',
    topics: {
      love: 'A slow-growing, deep love, or a family connection that shapes a relationship. Patience pays.',
      money: 'Long-term growth: pensions, slow savings, a career built over years. Not quick money.',
      health: 'This is the health card of the deck. Look after your body as a whole, and see a doctor about anything that has lingered; with troubling cards nearby, don’t delay.',
      home: 'Family roots, ancestry, the house your people have lived in. Gardens and trees on the land.',
      spirit: 'The world tree, ancestors and slow spiritual growth. Tree-work, grounding and family history.',
    },
  },
  Clouds: {
    lean: 'not-yet',
    why: 'The view is unclear, and confusion makes any answer unreliable for now.',
    advice: 'Wait until you have the missing facts, and don’t decide while you feel muddled.',
    topics: {
      love: 'Mixed feelings, moods, misunderstandings. Someone is unsure, perhaps you. Clarity comes later.',
      money: 'Uncertain markets, vague offers, an unclear job situation. Don’t sign anything foggy.',
      health: 'Brain fog, low mood or symptoms that are hard to pin down. Keep a diary and ask for tests if it lasts.',
      home: 'A tense or gloomy atmosphere; something unspoken hangs in the air.',
      spirit: 'Doubt and spiritual fog. Cleansing and simple grounding help you see again.',
    },
  },
  Snake: {
    lean: 'no',
    why: 'The path is winding, and someone or something here is not straightforward.',
    advice: 'Go the long way round, and keep your plans to yourself until you know who is involved.',
    topics: {
      love: 'A rival, jealousy, or a complicated, seductive person. Desire mixed with complications.',
      money: 'Complex dealings, workplace politics, a detour on the way to a goal. Read the small print twice.',
      health: 'Something takes a winding course; follow-up is needed. Look at the gut and digestion, by tradition.',
      home: 'Complicated family dynamics, or someone who stirs trouble.',
      spirit: 'Kundalini, wisdom and old serpent lore, yes; but also manipulation dressed as spirituality. Discern carefully.',
    },
  },
  Coffin: {
    lean: 'no',
    why: 'Something is ending, and the honest answer is that this door is closing.',
    advice: 'Let the ending happen, and give yourself time to grieve or rest before you start over.',
    topics: {
      love: 'A relationship ends, or a feeling has died. Sometimes a long low patch. Let it close.',
      money: 'A job or business ends, or money is stuck. Close the account and start fresh.',
      health: 'Exhaustion and a need for real rest. Not a prediction of death; take serious symptoms to a doctor promptly.',
      home: 'Clearing out, the end of a living arrangement, a sad time at home.',
      spirit: 'Endings as transformation, the ancestors and the beloved dead. A good card for releasing rites.',
    },
  },
  Bouquet: {
    lean: 'yes',
    why: 'Something pleasing is being offered: a gift, an invitation or a kindness.',
    advice: 'Accept the invitation or compliment graciously, and give one in return this week.',
    topics: {
      love: 'Flowers, compliments, charm and happiness. Someone appreciates you; tell them so.',
      money: 'A gift, a bonus, a pleasant offer. Good for creative and beauty work.',
      health: 'Feeling better, looking well. Small pleasures heal.',
      home: 'A beautiful, welcoming home; guests and celebrations.',
      spirit: 'Offerings of flowers, devotion and thanks. Beauty is worship here.',
    },
  },
  Scythe: {
    lean: 'no',
    why: 'Something sudden cuts across the matter; there is danger in rushing.',
    advice: 'Slow down physically and in decisions this week; double-check anything sharp, fast or final.',
    topics: {
      love: 'A sudden break or a sudden attraction. Either way, quick and decisive.',
      money: 'A sharp cut: cancelled contracts, redundancies, quick decisions. Harvest what is ready before it is cut.',
      health: 'Take care with accidents, knives, operations and sudden flares. Be careful.',
      home: 'Sudden change at home; mind sharp tools and stairs.',
      spirit: 'The reaper and the harvest. Cutting cords and clearing what must go.',
    },
  },
  Whip: {
    lean: 'no',
    why: 'Conflict and repetition are in the way: the same argument, the same strain.',
    advice: 'Notice the repeating pattern, and do one thing differently the next time it starts.',
    topics: {
      love: 'Arguments, tension, sometimes strong physical passion. Check that both of you feel safe.',
      money: 'Disputes, criticism at work, or repetitive labour. Keep records.',
      health: 'Repetitive strain, sport, and the body under stress. Rest after exercise.',
      home: 'Quarrels and recurring arguments in the household.',
      spirit: 'Discipline and repetition, chant and practice. But self-punishment is not devotion.',
    },
  },
  Birds: {
    lean: 'depends',
    why: 'There is a lot of talk and some worry, and the answer turns on what’s said.',
    advice: 'Have the conversation directly, by phone or face to face, instead of fretting about it.',
    topics: {
      love: 'Chatter, flirting, nerves, a couple who talk a lot. Sometimes gossip about you.',
      money: 'Meetings, calls and negotiations. Busy and noisy, a little stressful.',
      health: 'Nerves and anxiety. Breathing practice and calm talk help.',
      home: 'Lively household, phone calls, gossip with neighbours.',
      spirit: 'Bird augury, song and chant. Listen to the morning chorus as a practice.',
    },
  },
  Child: {
    lean: 'yes',
    why: 'This is a new and small beginning, innocent and full of promise.',
    advice: 'Start small and play with it, rather than demanding results.',
    topics: {
      love: 'New love, shy and unguarded, or a fresh start with someone you already know. Sometimes an actual child is part of the picture; go gently either way.',
      money: 'A small start: a first job, a trial period, a little venture with room to grow. Treat it as an apprenticeship rather than expecting a salary’s worth from it at once.',
      health: 'Renewed energy and a fresh start, or the health of a child in your care. Small, playful habits stick better than solemn ones.',
      home: 'Children in the home, a new arrival, or a first home of your own. Make room for some mess.',
      spirit: 'Beginner’s mind and the inner child. Learn a new practice as if nobody were watching, and let it be play.',
    },
  },
  Fox: {
    lean: 'no',
    why: 'Something here is not what it says it is, and only cleverness will keep you from being caught out.',
    advice: 'Check one claim at its source before you agree to anything, and keep your own counsel until you have.',
    topics: {
      love: 'Watch for flattery that outruns the facts, or for your own small games to keep the upper hand. Judge by what is done over a month, not what is said in an evening.',
      money: 'Many German readers take the Fox as the card of a job: the paid work you do and the wits it takes to hold on to it. Next to troubling cards it turns to sharp practice, a scam or a colleague working an angle; read the contract yourself.',
      health: 'A symptom may be misleading, or a remedy oversold. Ask for a second opinion, and be wary of anything that promises a quick cure for money.',
      home: 'Someone in the household may be bending the truth, perhaps about bills or chores. Keep simple written records of what was agreed.',
      spirit: 'Trickster energy is useful when it teaches you to question. Use it on the courses, gurus and products of the spiritual marketplace.',
    },
  },
  Bear: {
    lean: 'yes',
    why: 'Strength and resources are with you, though a powerful person may have the last word.',
    advice: 'Go to the person who actually decides, with figures in hand, rather than lobbying around them.',
    topics: {
      love: 'A protective, solid partner, sometimes a possessive one. In some traditions a mother or mother-in-law whose views carry weight.',
      money: 'Savings, investments, a boss, or a bigger business. Power and money together; used generously, it rewards you, and hoarded, it makes enemies.',
      health: 'Appetite, weight and diet come into focus, along with stamina. Eat well, build strength slowly, and don’t carry more than your share.',
      home: 'A strong figure runs the household. Protection is good; check that it hasn’t turned into control.',
      spirit: 'The bear who sleeps through winter and wakes strong: rest as a source of power. Ancestral guardians and protective spirits sit with this card.',
    },
  },
  Stars: {
    lean: 'yes',
    why: 'The way ahead is clear and guided, and your hopes have real footing.',
    advice: 'Write the goal in one sentence, then set out the steps as if marking a route on a map.',
    topics: {
      love: 'Hope and clarity in love; a shared dream or a sense that you were meant to meet. Make plans that you can both see.',
      money: 'Success through networks and clear goals, often online or across many contacts at once. A good card for launching to a wide audience.',
      health: 'Clarity about what helps, and steady progress. Sleep and nights spent under an open sky are part of the cure.',
      home: 'Calm and order at home. A good time to plan the household year.',
      spirit: 'Astrology, star lore and guidance from above. Night-sky practice and a clear intention to steer by.',
    },
  },
  Stork: {
    lean: 'yes',
    why: 'Change is coming, and on the whole it improves things.',
    advice: 'Clear a little space, in the diary, a drawer or the spare room, for the change to land in.',
    topics: {
      love: 'A relationship moving to its next stage: moving in, a new rhythm, a fresh start after a rough patch. Welcome it rather than holding on to the old pattern.',
      money: 'A change of role, a promotion, a move between departments or companies. Say yes to the improvement even if it unsettles you.',
      health: 'Recovery and improvement. Some readers also read pregnancy here, especially beside the Child.',
      home: 'Moving, renovating or rearranging. The stork returns to the same nest each year, so sometimes it is a return to an old home.',
      spirit: 'Migration and return: seasonal rites, the turning of the wheel, coming back to a practice you left.',
    },
  },
  Dog: {
    lean: 'yes',
    why: 'A loyal friend stands with you, and trust is well placed here.',
    advice: 'Ask the friend you trust most for help with this, and let them give it.',
    topics: {
      love: 'A faithful partner, or a friendship with room to become more. Loyalty is the root of whatever grows.',
      money: 'A dependable colleague or a contact who vouches for you. Recommendations open doors this week.',
      health: 'Support from friends, and a doctor or practitioner you can rely on. Walks with a companion, two-legged or four, do you good.',
      home: 'Pets, good neighbours and reliable housemates. Look after them and they look after you.',
      spirit: 'Familiars, guardian spirits and the faithful dogs of Hekate and of Anubis. A guide who walks beside you rather than ahead.',
    },
  },
  Tower: {
    lean: 'depends',
    why: 'This sits with institutions and official channels, and the answer moves at their pace.',
    advice: 'Go through the proper channel in writing, keep copies, and note who you spoke to and when.',
    topics: {
      love: 'Distance, aloofness, or a relationship hedged by formalities. Sometimes someone who keeps themselves walled off; ask what they are guarding.',
      money: 'Large companies, councils, banks and government. Slow, but solid once it moves.',
      health: 'Hospitals, clinics and long-term care. By tradition also a long life.',
      home: 'Flats, tall buildings, official housing, or feeling isolated in your own home.',
      spirit: 'Solitude, retreat and long study. Established orders and the structures of a tradition.',
    },
  },
  Garden: {
    lean: 'yes',
    why: 'The matter belongs out in the open, among other people, and they will help.',
    advice: 'Take it public: go to the event, post the notice, ask the group for ideas.',
    topics: {
      love: 'Meeting someone at a party, through friends or online. A relationship you are happy to have seen.',
      money: 'Networking, the public, social media and events. Your reputation is your capital now.',
      health: 'Group exercise, public health services, time in parks and gardens.',
      home: 'Gatherings and open houses. Invite people in.',
      spirit: 'Group ritual, moots and festivals, open rites. Practice among others rather than alone.',
    },
  },
  Mountain: {
    lean: 'no',
    why: 'A real obstacle stands in the way, and it will take time to cross.',
    advice: 'Break the climb into stages and take the first one tomorrow, however small.',
    topics: {
      love: 'Coldness, distance or a block between you. Patience and a slower pace are needed, or acceptance that the wall won’t move.',
      money: 'Delays, a stalled project, a difficult boss or a bureaucracy that won’t budge. Persist, and find another route if one exists.',
      health: 'Long-standing problems and slow recovery. Keep up with treatment even when progress is invisible.',
      home: 'An obstacle at home: a stalled sale, an awkward neighbour, a repair that won’t get done.',
      spirit: 'The long climb of discipline, and a sacred mountain to walk round or up. Challenge builds strength.',
    },
  },
  Crossroads: {
    lean: 'depends',
    why: 'There is more than one road here, and the answer depends on which you take.',
    advice: 'Write each option on its own page with what it costs and gives, and choose by a set date.',
    topics: {
      love: 'A choice between people, or between staying and going. Freedom to decide, which is a gift and a weight.',
      money: 'Career options and changes of direction. Don’t let the fear of choosing wrong keep you choosing nothing.',
      health: 'Choosing between treatments or ways of living. Ask for every option and its trade-offs.',
      home: 'Deciding whether to move or stay, or where.',
      spirit: 'Hekate’s crossroads and liminal places. A good card for a working at a three-way junction.',
    },
  },
  Mice: {
    lean: 'no',
    why: 'Something is being worn away bit by bit, whether money, energy or trust.',
    advice: 'Find the small, steady leak and plug it this week, before it gnaws further.',
    topics: {
      love: 'Small doubts and irritations nibbling at affection. Address the little things before they eat the whole.',
      money: 'Losses, theft, overspending, or subscriptions you forgot. Read your statements line by line.',
      health: 'Stress and worry wearing you down. By tradition also hygiene and infection; keep things clean.',
      home: 'Clutter, pests, things going missing. A good clear-out is overdue.',
      spirit: 'Anxiety nibbling at your practice. Cleanse the space and shorten your list of worries.',
    },
  },
  Heart: {
    lean: 'yes',
    why: 'Love and goodwill sit at the centre of this, and the heart’s answer is yes.',
    advice: 'Act from affection, and tell the person plainly what they mean to you.',
    topics: {
      love: 'The clearest love card in the deck: affection, romance and warmth. With the Ring it is commitment; with the Coffin, a love that has ended.',
      money: 'Work you love, generosity, charity and goodwill. Doing what you care about counts as wealth too.',
      health: 'The heart and emotional health. Look after both.',
      home: 'A loving home and a warm welcome.',
      spirit: 'Devotion and compassion. Heart-centred practice: lovingkindness, offerings made with real feeling.',
    },
  },
  Ring: {
    lean: 'yes',
    why: 'A promise or agreement binds this, and it is meant to hold.',
    advice: 'Put the agreement into words, written or spoken aloud, so both sides know what was promised.',
    topics: {
      love: 'Commitment, engagement, marriage. Sometimes a pattern that keeps coming round; know which you are in.',
      money: 'Contracts, partnerships and recurring income. Read before you sign, then honour it.',
      health: 'Ongoing treatment or a cycle in the body. Keep to the routine.',
      home: 'Leases, mortgages and household agreements.',
      spirit: 'Vows, oaths and dedications. A ring is also the circle cast.',
    },
  },
  Book: {
    lean: 'depends',
    why: 'Something is still unknown or kept secret, and the answer is not yet visible.',
    advice: 'Do your research first: read, ask and find out what you don’t yet know.',
    topics: {
      love: 'Hidden feelings, secrets, a person not fully known. Give it time to open.',
      money: 'Study, training, research and information not yet shared. Knowledge is the asset.',
      health: 'Tests and unknown factors. Ask what hasn’t been checked.',
      home: 'Family secrets, or a room given to study.',
      spirit: 'Hidden knowledge, your own Book of Shadows, mystery traditions. Learn quietly.',
    },
  },
  Letter: {
    lean: 'yes',
    why: 'News in writing or a document settles this.',
    advice: 'Write it down: send the email, find the paperwork, put the request on paper.',
    topics: {
      love: 'Love notes, messages and written feelings. Saying it in writing may help.',
      money: 'Documents, emails, invoices and paperwork. Keep them in order.',
      health: 'Results, referrals and prescriptions arriving.',
      home: 'Post and household paperwork; the letter you’ve been waiting for.',
      spirit: 'Petitions, written spells and journalling. A letter to the dead or to a deity can be burned as an offering.',
    },
  },
  Man: {
    lean: 'depends',
    why: 'The Man is a person, either you or the man in question, and the answer lies in the cards around him.',
    advice: 'Read the cards to his left and right and in front of him; they say what is happening to him.',
    topics: {
      love: 'The man in your love life, or you if you read for yourself as a man. Look where he faces.',
      money: 'A male colleague, client or boss.',
      health: 'Your own body, or a man’s health.',
      home: 'A man in the household.',
      spirit: 'A god, or the masculine in practice. In a Grand Tableau, he is the hub.',
    },
  },
  Woman: {
    lean: 'depends',
    why: 'The Woman is a person, either you or the woman in question, and the answer lies in the cards around her.',
    advice: 'Read the cards to her left and right and in front of her; they say what is happening to her.',
    topics: {
      love: 'The woman in your love life, or you if you read for yourself as a woman. Look where she faces.',
      money: 'A female colleague, client or boss.',
      health: 'Your own body, or a woman’s health.',
      home: 'A woman in the household.',
      spirit: 'A goddess, or the feminine in practice. In a Grand Tableau, she is the hub.',
    },
  },
  Lily: {
    lean: 'yes',
    why: 'Peace, maturity and integrity favour this, though it will not hurry.',
    advice: 'Take the calm, honest route and give it time.',
    topics: {
      love: 'Mature, harmonious love, and in many readings sensuality. A relationship that improves with age.',
      money: 'Experience, seniority, retirement and ethical work.',
      health: 'Rest and ageing well. Slow down.',
      home: 'A peaceful home; older relatives.',
      spirit: 'Purity of intent and the wisdom of elders.',
    },
  },
  Sun: {
    lean: 'yes',
    why: 'Success and warmth: by most accounts the strongest yes in the deck.',
    advice: 'Go ahead with confidence, and let other people see what you’re doing.',
    topics: {
      love: 'Happy, warm love; good feeling that lights up both people. Even troubled pairs brighten beside it.',
      money: 'Success, energy and good results. Push forward while the light is on you.',
      health: 'Vitality and recovery. Daylight is part of the medicine.',
      home: 'A warm, bright household. Summer gatherings.',
      spirit: 'Solar practice, midsummer and the gods of light. Celebrate.',
    },
  },
  Moon: {
    lean: 'yes',
    why: 'Recognition and deep feeling favour this, and your efforts will be seen.',
    advice: 'Let yourself be noticed: share the work, accept the praise, trust the feeling.',
    topics: {
      love: 'Romance, longing and deep feeling. A night-time card for lovers.',
      money: 'Honour, reputation and recognition, especially for creative work.',
      health: 'Cycles, sleep and emotional health. Work with your rhythms.',
      home: 'Emotional atmosphere at home; evenings together.',
      spirit: 'Moon magic, intuition and dreams. Esbats sit here.',
    },
  },
  Key: {
    lean: 'yes',
    why: 'This is the answer, and the door it fits is right in front of you.',
    advice: 'Use the solution you already have; it was always the right one.',
    topics: {
      love: 'Certainty, a breakthrough, a problem between you resolved. Next to the Heart, the key to someone’s heart.',
      money: 'The solution, the right job, the deal that unlocks. Act on it.',
      health: 'A diagnosis that explains, or a treatment that works.',
      home: 'Keys, moving in, a home secured.',
      spirit: 'Insight, initiation and the opening of a mystery. Hekate holds the keys.',
    },
  },
  Fish: {
    lean: 'yes',
    why: 'Abundance and flow are here; money and goods move your way.',
    advice: 'Keep things circulating: invoice, sell, trade and spend wisely rather than hoarding.',
    topics: {
      love: 'Plenty of feeling, or a generous partner. With the Heart, abundant love.',
      money: 'The money card: business, trade, self-employment and income. Watch the flow in and out.',
      health: 'Fluids, kidneys and drinking enough water. Also alcohol; moderation.',
      home: 'Abundance at home, or a home near water.',
      spirit: 'Water spirits, deep currents and abundance magic. The salmon of wisdom.',
    },
  },
  Anchor: {
    lean: 'yes',
    why: 'This is stable and long-lasting; it will hold.',
    advice: 'Commit for the long term, and set down the roots that let it last.',
    topics: {
      love: 'A steady, lasting relationship. Settling down.',
      money: 'Secure work and long-term goals. A career, not just a job.',
      health: 'Stability and persistence. Keep going with what works.',
      home: 'Settling in a place, perhaps near the coast.',
      spirit: 'Grounding and steady practice. Hope that holds.',
    },
  },
  Cross: {
    lean: 'no',
    why: 'A burden or hardship is part of this, and it has to be carried for a while.',
    advice: 'Name what you are carrying, and put down whatever part of it was never yours.',
    topics: {
      love: 'A painful or burdensome relationship, or love tested by suffering. Ask whether the weight is shared.',
      money: 'Duty, hard work without reward, or debt. Seek help with the load.',
      health: 'Pain or suffering, and the need to bear it with support. Ask for care.',
      home: 'Duties at home, caring for others; weariness.',
      spirit: 'Faith, destiny and spiritual trial. Meaning found in difficulty.',
    },
  },
};

/** The written reading for a Lenormand card by name, or null. */
export function lenormandReading(name: string): CardReading | null {
  const row = ROWS[name];
  const card = lenormandCard(name);
  if (!row || !card) return null;
  return { ...row, topics: { general: card.subject, ...row.topics } };
}

export const LENORMAND_READING_NAMES = Object.keys(ROWS);
