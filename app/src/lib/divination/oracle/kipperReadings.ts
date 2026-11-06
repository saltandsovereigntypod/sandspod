// A written reading for each Kipper card, in the tarot readings' shape
// (readings/types.ts): its lean on a plain question, why, one step to take,
// and a reading for each part of life. General, love and money come from the
// card's own texts in kipper.ts (`card`, `love`, `work`); health, home and
// spirit are written here. Kipper has no reversals. The leans follow the
// deck's traditional good and bad cards as German readers sort them; the
// health, home and spirit readings are modern. Kipper is a fortune-teller's
// deck about people and events, not a spiritual one, so its spirit readings
// stay practical. Pure data.

import type { CardReading, Lean } from '../readings/types.ts';
import { kipperCard } from './kipper.ts';

type Row = { lean: Lean; why: string; advice: string; health: string; home: string; spirit: string };

const ROWS: Record<string, Row> = {
  'Main Person (Man)': {
    lean: 'depends',
    why: 'He is the centre the reading turns on; the cards nearest him decide the answer.',
    advice: 'Count the cards around him and read the closest first; they act soonest.',
    health: 'His own wellbeing. Read the cards touching him: Short Illness near him is a warning to rest, Great Fortune a sign of strength.',
    home: 'His place in the household, and how much of the home is his to shape.',
    spirit: 'Where you stand in your own life. Ask which way he faces, towards the future or the past.',
  },
  'Main Person (Woman)': {
    lean: 'depends',
    why: 'She is the centre the reading turns on; the cards nearest her decide the answer.',
    advice: 'Count the cards around her and read the closest first; they act soonest.',
    health: 'Her own wellbeing. Cards touching her speak of the body now, cards far off of what is less pressing.',
    home: 'Her place in the household, and how much of it she carries.',
    spirit: 'Where you stand in your own life. Note who is close to her and who is kept at a distance.',
  },
  Marriage: {
    lean: 'yes',
    why: 'A bond is made or held; two parties are joined in this.',
    advice: 'Put the commitment into a shared plan, with both names on it.',
    health: 'Support from a partner makes the difference. Let them come to the appointment.',
    home: 'Living together, combining households, a home held in two names.',
    spirit: 'Handfastings, vows and partnership in practice. A working done together is stronger than two done apart.',
  },
  Meeting: {
    lean: 'yes',
    why: 'An encounter or appointment moves this forward.',
    advice: 'Put the meeting in the diary this week, rather than waiting for a chance one.',
    health: 'An appointment that matters: keep it, and write your questions down beforehand.',
    home: 'Guests, visits and gatherings at home. The kettle will be on a lot.',
    spirit: 'Meeting with others who practise: a moot, a class, a circle. Company sharpens the craft.',
  },
  'Good Gentleman': {
    lean: 'yes',
    why: 'A kind, capable man is ready to help.',
    advice: 'Ask the older or more experienced man you trust for advice, and take it seriously.',
    health: 'A good doctor or practitioner, often a man, whose advice is sound.',
    home: 'A helpful man about the house: a father, a neighbour, a reliable tradesman.',
    spirit: 'A mentor or elder. Learn from someone who has walked the path longer.',
  },
  'Good Lady': {
    lean: 'yes',
    why: 'A kind, capable woman is ready to help.',
    advice: 'Turn to the woman whose judgement you trust, and tell her the whole story.',
    health: 'Care and kindness, often from a woman: a nurse, a mother, a friend who checks in.',
    home: 'A warm hand in the household: a grandmother, an aunt, a friend who stays.',
    spirit: 'A wise woman or teacher. Some read her as a motherly guiding spirit.',
  },
  'Pleasant Letter': {
    lean: 'yes',
    why: 'Good news in writing is on its way.',
    advice: 'Look out for the message and answer it promptly and warmly.',
    health: 'Good results, a clear letter from the clinic, reassurance in writing.',
    home: 'Welcome post: an acceptance, a deposit returned, a letter from family.',
    spirit: 'Write down your intentions; a written petition carries here.',
  },
  Falseness: {
    lean: 'no',
    why: 'Someone is not being honest, and the matter rests on a false footing.',
    advice: 'Check who benefits if you believe what you are told, and verify before you trust.',
    health: 'A wrong impression, a misread symptom or a remedy that promises too much. Ask for a second opinion.',
    home: 'A two-faced neighbour or housemate, or gossip at the door. Keep private matters private.',
    spirit: 'False teachers and flattering voices. Trust the practice that holds up in plain daylight.',
  },
  'A Change': {
    lean: 'yes',
    why: 'Things are moving into a new stage; the old arrangement won’t last.',
    advice: 'Decide which change you want, rather than waiting for one to happen to you.',
    health: 'A change in treatment or routine, usually for the better if you stick with it.',
    home: 'Rearranging, redecorating, or a new arrangement in who lives where.',
    spirit: 'Seasonal change and turning points. Mark the shift with a small rite.',
  },
  'A Journey': {
    lean: 'yes',
    why: 'Movement is the answer: going somewhere, or moving on.',
    advice: 'Book the trip or plan the move with a date, not a someday.',
    health: 'A change of air, a convalescent break, or travel for treatment.',
    home: 'Moving house, or long stays away from home.',
    spirit: 'Pilgrimage and journeys to sacred places, inner or outer.',
  },
  'Great Gain': {
    lean: 'yes',
    why: 'Real gain is coming, in money or in what money buys.',
    advice: 'Plan what the gain is for before it arrives, so it doesn’t simply drain away.',
    health: 'Strength regained. Invest in what keeps you well.',
    home: 'A home improved or bought; comfort increasing.',
    spirit: 'Abundance and gratitude. Give a share of what comes in back as an offering or a gift.',
  },
  'Rich Girl': {
    lean: 'yes',
    why: 'Fortune and freedom favour this, often through a young woman.',
    advice: 'Act with the freedom you have now; it won’t always be this easy.',
    health: 'Youthful energy and resilience. Enjoy it, but don’t squander it.',
    home: 'A comfortable, light-hearted household, or a young woman’s first place of her own.',
    spirit: 'Joy as practice; freedom to explore without obligation.',
  },
  'Rich Man': {
    lean: 'yes',
    why: 'Security and generosity are on hand, often through a well-off man.',
    advice: 'Ask for the support that is available; it may be given more readily than you expect.',
    health: 'Good resources for care: the means to get the treatment you need.',
    home: 'A secure, well-provided household.',
    spirit: 'Generosity and stewardship. Use what you have to support others.',
  },
  'Sad News': {
    lean: 'no',
    why: 'A disappointment or unwelcome news is part of this.',
    advice: 'Brace for the message, and plan one kind thing for yourself the day it comes.',
    health: 'An unwelcome result or setback. Ask what can be done next, and take someone with you.',
    home: 'Bad news reaching the household; a letter you would rather not open.',
    spirit: 'Grief work and honest mourning. Light a candle for what has been lost.',
  },
  'Success in Love': {
    lean: 'yes',
    why: 'Love is fulfilled; what you hope for in the heart comes good.',
    advice: 'Tell the person how you feel; the moment is with you.',
    health: 'Contentment does real good to the body. Let happiness be part of the cure.',
    home: 'A loving household; harmony between the people under one roof.',
    spirit: 'Love as devotion. Practise with warmth rather than duty.',
  },
  'His Thoughts': {
    lean: 'depends',
    why: 'This is about what is on someone’s mind, and the cards beside it say what.',
    advice: 'Look at the card next to His Thoughts; that is what he is thinking about.',
    health: 'Worry about health, or a mind turning a symptom over and over.',
    home: 'Plans for the home still in the head, not yet spoken.',
    spirit: 'Intentions and inner work. Meditation and journalling bring thoughts into the light.',
  },
  'A Gift': {
    lean: 'yes',
    why: 'Something is freely given; a favour or present eases the way.',
    advice: 'Accept the help on offer, and give something back when you can.',
    health: 'Help offered with care; a remedy or support that comes as a gift.',
    home: 'Gifts for the home, hospitality, a favour from a neighbour.',
    spirit: 'Offerings and blessings, both given and received.',
  },
  'Small Child': {
    lean: 'yes',
    why: 'A new start, small and trusting, is beginning.',
    advice: 'Begin modestly and keep your trust open; it will grow.',
    health: 'Children’s health, or a fresh start in your own care.',
    home: 'Children in the house, or a first home.',
    spirit: 'Beginner’s mind and the trust of a child.',
  },
  'A Funeral': {
    lean: 'no',
    why: 'Something ends here, and there will be grief before relief.',
    advice: 'Let the ending be marked properly; don’t rush past the sorrow.',
    health: 'Exhaustion and grief in the body. Rest, and seek help with low mood. It does not foretell a death.',
    home: 'A household changing after a loss or a departure.',
    spirit: 'Ancestor work and honouring the dead; endings as part of the cycle.',
  },
  'The House': {
    lean: 'yes',
    why: 'Home, property and safety hold this together.',
    advice: 'Secure your base first: the home, the lease, the people under your roof.',
    health: 'Rest at home and steady routines.',
    home: 'Your house itself: buying, owning, mending, keeping it safe.',
    spirit: 'Hearth and household spirits. Bless the threshold.',
  },
  'Living Room': {
    lean: 'depends',
    why: 'This is private, inner-circle business, not yet out in the open.',
    advice: 'Keep it within your trusted circle for now.',
    health: 'Private matters of the body; talk them through with someone close.',
    home: 'The private life of the household; what happens behind closed doors.',
    spirit: 'Private practice and the inner sanctum. Not everything needs sharing.',
  },
  'Military Person': {
    lean: 'depends',
    why: 'Order, discipline or an official has a say in this.',
    advice: 'Follow the rules to the letter, and keep records of what you were told.',
    health: 'A disciplined regime, or an official medical process. Stick to the plan.',
    home: 'Rules, inspections, or someone strict in the household.',
    spirit: 'Discipline in practice: the same time, the same rite, every day.',
  },
  Court: {
    lean: 'depends',
    why: 'A decision is to be made by someone in authority.',
    advice: 'Prepare your case in full before the decision, not after.',
    health: 'An assessment or review that decides your next step.',
    home: 'Disputes about property or tenancy that need a formal decision.',
    spirit: 'Judgement and karma; weigh your own actions honestly.',
  },
  Theft: {
    lean: 'no',
    why: 'Something is being taken from you, whether time, money, credit or trust.',
    advice: 'Change one password, check one statement and put your name on your own work this week.',
    health: 'Something is draining your energy without your noticing: late nights, a habit, a person. Track a week of tiredness and the cause usually shows itself.',
    home: 'By tradition a burglary or losses at home, more often things borrowed and not returned. Check the locks and the insurance, and ask for what is yours.',
    spirit: 'Energy taken by others, or credit for your work claimed by someone else in your circle. Protective work helps, and so does a plain conversation about boundaries.',
  },
  'High Honours': {
    lean: 'yes',
    why: 'Recognition and success are coming, and they are earned.',
    advice: 'Put your work where the right people can see it, and don’t undersell it when they do.',
    health: 'Progress worth being proud of. Tell the people who helped you how far you have come.',
    home: 'A home you are proud to show, or a family celebration of someone’s success.',
    spirit: 'An initiation, a degree in a tradition, or quiet recognition from those who taught you. Wear it lightly.',
  },
  'Great Fortune': {
    lean: 'yes',
    why: 'Luck and happiness surround the matter; this is one of the kindest cards in the deck.',
    advice: 'Say yes to what is offered, and share some of the good fortune with someone who needs it.',
    health: 'Strength and good spirits. Spend some of the energy on things that keep you well later.',
    home: 'Contentment under your roof, and a run of things going right in the household.',
    spirit: 'Blessing and grace. Give thanks out loud, at the altar or simply at the table.',
  },
  'Unexpected Money': {
    lean: 'yes',
    why: 'Money comes from a quarter you weren’t watching.',
    advice: 'Put a fixed share of any windfall aside before you spend a penny of it.',
    health: 'The means for care arrive when needed, or an improvement surprises you. Use either well.',
    home: 'A bill smaller than feared, a refund, a repair paid for by someone else.',
    spirit: 'Abundance often arrives sideways. Leave room in your workings for answers you didn’t script.',
  },
  Expectation: {
    lean: 'not-yet',
    why: 'This is still in the waiting stage; the hope is reasonable but the thing hasn’t arrived.',
    advice: 'Pick a date to check again, and fill the wait with one useful task.',
    health: 'Waiting for results or an appointment. Keep up the gentle care in the meantime rather than putting life on hold.',
    home: 'Waiting on a sale, a move or a landlord’s answer. Prepare as though it will be yes.',
    spirit: 'Patience is part of the craft. Tend a working that hasn’t borne fruit yet without doubling it up.',
  },
  Prison: {
    lean: 'no',
    why: 'Something restricts you, and for now the main door is shut.',
    advice: 'Find the one small freedom inside the walls, and use it every day.',
    health: 'Being confined by illness, injury or a hospital stay. Ask for visitors and small comforts; isolation makes everything heavier.',
    home: 'Feeling trapped in a home or arrangement. Name what would have to change for you to feel free, even if it can’t change yet.',
    spirit: 'Enforced stillness can become a retreat. Use the walls to turn inward, but don’t mistake a cage for a cell.',
  },
  'Legal Matters': {
    lean: 'depends',
    why: 'Paperwork, lawyers or officials decide this, and the outcome rests on the details.',
    advice: 'Get advice from a qualified person, in writing, before you sign or reply.',
    health: 'Claims, forms and the paperwork of care. Keep copies of everything and note who you spoke to.',
    home: 'Leases, deeds, deposits and planning rules. Read the clauses you would rather skip.',
    spirit: 'Oaths and agreements, with people or with spirits. Know exactly what you have promised before you promise more.',
  },
  'Short Illness': {
    lean: 'not-yet',
    why: 'A short setback or passing crisis, and the word that matters is short.',
    advice: 'Rest properly now, so that it stays brief.',
    health: 'A passing illness or a few rough days. Take it seriously enough to rest, and see a doctor if it lingers or worsens.',
    home: 'A brief spell of trouble in the household: a leak, a row, a bad week. It passes.',
    spirit: 'A dry or troubled patch in practice. Don’t force it; it lifts.',
  },
  'Grief and Adversity': {
    lean: 'no',
    why: 'Hard times weigh on this, and it won’t be solved in a day.',
    advice: 'Tell one person how heavy it is, and let them carry part of it.',
    health: 'Sorrow and strain showing in the body: sleep, appetite, aches. Ask for support, medical and human.',
    home: 'A household under strain, perhaps through loss or money worries. Keep the small routines going; they hold things together.',
    spirit: 'Endurance, and the slow finding of meaning in hardship. Simple rites of remembrance help more than ambitious ones.',
  },
  'Gloomy Thoughts': {
    lean: 'not-yet',
    why: 'Low spirits are colouring the matter more than the facts are.',
    advice: 'Write the worry down, then beside it write only what you actually know.',
    health: 'Low mood and rumination. If it lasts beyond a couple of weeks, please talk to a doctor or counsellor.',
    home: 'A heavy atmosphere at home. Open the curtains, air the rooms, and put on some music.',
    spirit: 'The dark night of the soul, or just a grey week. Ground, keep practice simple, and wait for the light.',
  },
  Work: {
    lean: 'yes',
    why: 'Effort and employment carry this; steady work is the answer.',
    advice: 'Put in regular hours on it, at the same time each day, and keep going.',
    health: 'Work stress, or work as a healthy structure for the day. Watch where one tips into the other.',
    home: 'Jobs around the house, or working from home. Separate the desk from the bed.',
    spirit: 'Practice as craft: regular work at the altar, done well, without waiting for inspiration.',
  },
  'A Long Road': {
    lean: 'not-yet',
    why: 'This lies a long way off, in distance or in time.',
    advice: 'Plan for the long haul, and pace yourself as for a walk rather than a race.',
    health: 'Long-term care and a slow recovery. Measure progress in months, not days.',
    home: 'A distant home, family far away, or a long-range plan to settle somewhere.',
    spirit: 'The long path of a lifetime’s practice. Small steps, kept up, cover the distance.',
  },
  'Hope, Great Water': {
    lean: 'yes',
    why: 'Hope is well founded, though the far shore is still some way off.',
    advice: 'Keep the hope in view and take one practical step towards it this week.',
    health: 'Hope for recovery; time by water, or simply more of it to drink, does good.',
    home: 'A home by the sea or a river, or the dream home you are working towards.',
    spirit: 'The deep waters of the soul, faith, and journeys over water. Offerings to the sea or a river suit it.',
  },
};

/** The written reading for a Kipper card by name, or null. */
export function kipperReading(name: string): CardReading | null {
  const row = ROWS[name];
  const card = kipperCard(name);
  if (!row || !card) return null;
  const { lean, why, advice, health, home, spirit } = row;
  return { lean, why, advice, topics: { general: card.card, love: card.love, money: card.work, health, home, spirit } };
}

export const KIPPER_READING_NAMES = Object.keys(ROWS);
