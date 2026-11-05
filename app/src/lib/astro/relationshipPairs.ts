// "How your charts meet": a reading for every pair of planets and every major
// aspect between two charts. Pure data. Keys put the two planets in SYN8 order
// (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Ascendant).
//
// {Sun}, {Moon} and so on stand for the name of the person whose planet it is,
// so "{Saturn} tends to …" reads as a real name on the page. The aspects are
// read differently on purpose: a sextile is an opening that needs taking up, a
// trine is ease that can be taken for granted, a square is friction that forces
// action, an opposition is attraction and projection (seeing yourself in the
// other), and a conjunction is fusion and intensity.

import type { Planet8, RelType } from './relationshipText.ts';

export type MajorAspect = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export const MAJOR_ASPECTS: MajorAspect[] = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];

/** A reading, or one per kind of bond with a base for the rest. */
export type PairText = string | ({ base: string } & Partial<Record<RelType, string>>);

export type PairEntry = {
  /** A noun phrase for what the pair is about, used in the summary. */
  theme: string;
  /** When it matters whose planet is whose. */
  whose?: string;
  text: Record<MajorAspect, PairText>;
};

export const PAIRS: Record<string, PairEntry> = {
  // ── Sun ────────────────────────────────────────────────────────────────
  'Sun|Sun': {
    theme: 'two senses of purpose',
    text: {
      conjunction: 'You were born under much the same Sun, so you recognise each other’s motives without explanation. It feels like meeting someone who runs on the same fuel, which is lovely and can turn into wanting the same spotlight. Take turns leading, and say out loud when it is the other’s turn.',
      sextile: 'Your aims differ enough to be interesting and sit close enough to be useful to each other. Cooperation comes easily once a plan exists, but the spark only catches when someone suggests the plan. Make the first move on shared projects rather than waiting for one to appear.',
      trine: 'You share a basic temperament, so being together rarely costs either of you energy. Each of you tends to approve of how the other lives, which is restful and can go quietly flat. Bring in something new now and then so the ease does not turn into autopilot.',
      square: 'You want different things in ways that keep bumping: how to spend the weekend, what matters this year, whose plan wins. The friction stops either of you drifting, and wears you out when it becomes a contest of wills. Settle disagreements by asking what each of you needs from the choice, not who is right.',
      opposition: 'You are opposites at the core, and that is much of the pull: each has what the other has not quite grown. You may admire in each other exactly what you would criticise in yourselves. Treat the other as a teacher rather than a rival, and notice when you are handing them a side of yourself you have not lived.',
    },
  },
  'Sun|Moon': {
    theme: 'purpose meeting need, the classic bond of belonging',
    whose: '{Sun} tends to set the direction and to feel appreciated; {Moon} tends to notice the mood and to feel seen or, on harder days, overlooked.',
    text: {
      conjunction: 'One of you shines exactly where the other feels, so there is often an immediate sense of having come home. {Sun} lights up what {Moon} needs, and {Moon} instinctively supports what {Sun} is trying to become. The risk is that {Moon}’s needs get folded into {Sun}’s plans, so ask how {Moon} is, not only how things are going.',
      sextile: 'Purpose and feeling cooperate here: {Sun}’s plans tend to suit {Moon}’s comforts, given a little arranging. It is a friendly, workable link rather than a dramatic one, and it grows with use. Build small rituals into the week, a meal or a walk, and the bond quietly deepens.',
      trine: 'One of the most settling contacts two people can share: {Sun}’s way of living and {Moon}’s emotional needs simply agree. Daily life tends to run smoothly, with few misunderstandings about what matters. Its pitfall is complacency, so keep saying the appreciation that would otherwise go unsaid.',
      square: 'What {Sun} wants to do and what {Moon} needs in order to feel safe pull in different directions, often over timing and priorities. This friction makes you renegotiate how you live, and it can leave {Moon} feeling managed or {Sun} feeling held back. When it flares, separate the feeling from the plan: agree the feeling is real first, then talk about the plan.',
      opposition: 'A strong mutual pull, like two halves of one picture: {Sun} has the confidence {Moon} admires and {Moon} has the feeling {Sun} lacks words for. You see yourselves in each other, and it is easy to blame the other for what you dislike in yourself. Alternate whose rhythm the week follows, so neither becomes the background to the other.',
    },
  },
  'Sun|Mercury': {
    theme: 'being understood',
    whose: '{Mercury} tends to put {Sun}’s aims into words; {Sun} tends to feel understood or, on bad days, explained.',
    text: {
      conjunction: '{Mercury} grasps what {Sun} is about almost at once, and can often describe it better than {Sun} can. Conversation is lively and practical, and planning together comes naturally. Watch that {Mercury} does not start narrating {Sun}’s life; ask before summing someone up.',
      sextile: '{Mercury} has useful ideas about what {Sun} is trying to do, and {Sun} gives {Mercury} things worth thinking about. It works best when there is a reason to talk, a project or a problem to solve. Give the link a job and it pays off.',
      trine: '{Mercury} gets {Sun} with little effort, and {Sun} enjoys how {Mercury} thinks. Talking feels easy and affirming, and advice is usually well received. Keep it honest; easy agreement can skip the disagreement you actually needed.',
      square: '{Mercury}’s remarks can land on {Sun} as criticism even when they are meant as help, and {Sun} can seem not to listen. Debates are sharp and sometimes genuinely productive. Ask whether advice is wanted before giving it.',
      opposition: '{Mercury} sees {Sun} from the outside and says so, which is illuminating and sometimes unwelcome. Each learns a lot from the other’s point of view. Let each of you have the last word on your own life.',
    },
  },
  'Sun|Venus': {
    theme: 'warmth and admiration',
    whose: '{Venus} tends to admire and soften {Sun}; {Sun} tends to feel liked, and to bring warmth to whatever {Venus} values.',
    text: {
      conjunction: 'Plain fondness: {Venus} enjoys who {Sun} is, and {Sun} feels liked without having to earn it. Time together tends to be pleasant, even indulgent. The pitfall is dodging anything awkward to keep the peace, so practise small honest disagreements while things are calm.',
      sextile: 'A gentle, appreciative link: you find each other good company and easy to please. It grows through shared pleasures, a favourite café, a hobby, a film night. Make room for those treats on purpose rather than when there is time.',
      trine: 'Affection flows without much effort; {Venus} brings out {Sun}’s gentler side and {Sun} lights up {Venus}’s taste. It is one of the kindest contacts, and it can make you a little lazy about effort. Keep courting each other in small ways.',
      square: 'You like each other, but what {Venus} values and what {Sun} is chasing do not always line up: money, time or taste is the usual sticking point. The friction pushes each of you to say what you actually want. Make the trade explicit: this time your way, next time mine.',
      opposition: 'An attraction of opposites: {Venus} finds in {Sun} a confidence to admire, and {Sun} finds in {Venus} a grace to want close. It can tip into flattering each other instead of seeing each other. Compliment what is real, and say the less flattering thing kindly.',
    },
  },
  'Sun|Mars': {
    theme: 'will and drive',
    whose: '{Mars} tends to push and energise; {Sun} tends to feel spurred on or, on harder days, challenged.',
    text: {
      conjunction: 'Energy rises when you are together: {Mars} fires up {Sun}, and {Sun} gives {Mars} something to aim at. It is good for projects, sport or anything that needs momentum. Tempers rise as quickly, so agree how you will cool down before you need to.',
      sextile: '{Mars} backs {Sun}’s plans with practical effort, and {Sun} gives {Mars}’s energy a direction. You work well side by side once there is a task. Choose shared goals and let {Mars} make the first push.',
      trine: 'An easy, confident partnership of wills: {Mars} supports {Sun} without competing. You get things done and enjoy the doing. Do not let {Mars} carry all the effort just because they make it look easy.',
      square: 'Two engines facing different ways: {Mars} can feel like a challenge to {Sun}’s authority, and {Sun} can seem bossy to {Mars}. The friction gets things moving and makes you both braver, but rows flare fast. Put it into something physical or competitive that is clearly a game.',
      opposition: 'You provoke and excite each other in equal measure; the other’s drive is a mirror of your own. Rivalry and attraction are hard to tell apart here. Agree when you are a team and when you are opponents, so neither comes as a surprise.',
    },
  },
  'Sun|Jupiter': {
    theme: 'encouragement and growth',
    whose: '{Jupiter} tends to be the encourager and the generous one; {Sun} tends to feel bigger and more hopeful around them.',
    text: {
      conjunction: '{Jupiter} believes in {Sun}, sometimes more than {Sun} does. Plans grow bigger and brighter when you talk them over, and setbacks feel smaller. The pitfall is overreach, so let one of you be the one who checks the budget.',
      sextile: '{Jupiter} opens doors for {Sun}: introductions, ideas, good timing. The luck arrives when you act on it rather than admire it. Say yes to the invitations this link brings.',
      trine: 'Generous and good-humoured: {Jupiter} brings optimism to {Sun}’s aims, and {Sun} gives {Jupiter} something worth championing. Time together feels expansive. Watch only for encouraging each other into too much at once.',
      square: '{Jupiter}’s enthusiasm can feel like pressure to {Sun}, or {Sun}’s plans can seem too small to {Jupiter}. You stretch each other, sometimes past what is realistic. Agree the scale of anything big before you start it.',
      opposition: '{Jupiter} sees {Sun}’s potential vividly, and {Sun} sees in {Jupiter} a faith they want for themselves. Promises can outrun follow-through on both sides. Make fewer, firmer commitments.',
    },
  },
  'Sun|Saturn': {
    theme: 'authority and steadiness',
    whose: '{Saturn} tends to feel responsible for {Sun} and can slip into the critic; {Sun} tends to feel steadied or, on hard days, judged.',
    text: {
      conjunction: '{Saturn} takes {Sun} seriously, and the bond carries a sense of weight and duty from early on. {Sun} often grows more disciplined and {Saturn} more confident. The pitfall is {Saturn} becoming the voice of “not yet”, so match every caution with a word of faith.',
      sextile: '{Saturn} offers {Sun} sound structure and good advice when asked, and {Sun} gives {Saturn} a reason to hope. Over time this builds real reliability. Use it for the long things: savings, study, a shared practice.',
      trine: 'A loyal, durable link: {Saturn} steadies {Sun}, and {Sun} brings warmth to {Saturn}’s reserve. Bonds like this often outlast more exciting ones. Remember to play as well as plan.',
      square: '{Sun} can feel blocked or judged by {Saturn}, while {Saturn} feels it is their job to rein {Sun} in. It is hard work, and it builds character on both sides. Name the rules each of you lives by, then decide together which ones apply to the two of you.',
      opposition: '{Saturn} can look like a parent or gatekeeper to {Sun}, and {Sun} can look reckless to {Saturn}. Each shows the other a side they keep down: {Sun} the joy, {Saturn} the caution. Notice when an old authority figure is being cast onto the person in front of you.',
    },
  },
  'Sun|Ascendant': {
    theme: 'being seen as you are',
    whose: '{Sun} tends to light up {Ascendant}’s manner; {Ascendant} tends to feel noticed straight away.',
    text: {
      conjunction: '{Sun}’s Sun sits on {Ascendant}’s rising degree, so {Ascendant} often felt seen from the first meeting. You may look, or act, like a natural pair. It can overwhelm {Ascendant}, so make sure they have presence of their own in company.',
      sextile: 'Friendly recognition: {Sun} likes {Ascendant}’s style, and {Ascendant} brings out {Sun}’s easy side. You work a room well together. Use that in social settings, where you lift each other.',
      trine: 'You come across well together, and {Sun} quietly boosts {Ascendant}’s confidence. Others tend to notice the ease. Check now and then that it goes deeper than surface warmth.',
      square: '{Sun}’s aims and {Ascendant}’s manner clashed at first, so early impressions may have been mixed. This kind of friction usually softens with familiarity. Give first impressions a second chance.',
      opposition: '{Sun}’s Sun falls on {Ascendant}’s partnership angle, a classic sign of someone who feels like an equal across the table. The pull is strong, and so is the mirroring. Keep a sense of who each of you is on your own.',
    },
  },

  // ── Moon ───────────────────────────────────────────────────────────────
  'Moon|Moon': {
    theme: 'your emotional rhythms',
    text: {
      conjunction: 'Your feelings run on the same tide, so you read each other’s moods easily and feel at home together. It is deep comfort, and it amplifies both good and bad days because neither of you is the steady one. Agree a simple signal that means “I need looking after today”.',
      sextile: 'Your comfort habits differ but fit, so you can soothe each other once you have learned how. Care works best offered rather than guessed. Ask what helps, then remember the answer.',
      trine: 'You feel instinctively safe with each other, and home life falls into place: meals, rhythms, a shared idea of what home is. It is one of the easiest contacts to live with. Do not let the ease stop you saying how you feel.',
      square: 'What soothes one of you can irritate the other: one wants company and the other quiet, one wants to talk it out and the other to sleep on it. The friction pushes you to state needs plainly instead of hoping they are guessed. Take turns being the one who is looked after.',
      opposition: 'Your emotional needs mirror each other, so you can feel deeply understood and deeply frustrated in the same week. Each shows the other a way of feeling they have not quite allowed themselves. Name it when the pattern flips: “I am needing what you usually need.”',
    },
  },
  'Moon|Mercury': {
    theme: 'feelings finding words',
    whose: '{Mercury} tends to name and explain; {Moon} tends to feel understood or, on hard days, analysed.',
    text: {
      conjunction: '{Mercury} can put {Moon}’s feelings into words, which is a relief when it lands. Talk slides into intimacy easily, and you can chat for hours. Make sure {Mercury} listens as much as explains.',
      sextile: 'Good everyday conversation: {Mercury} cheers {Moon} up, and {Moon} softens how {Mercury} speaks. It is at its best over a cup of tea. Keep time for unhurried chats, not just logistics.',
      trine: '{Mercury} reads {Moon}’s moods and usually knows what to say, and {Moon} feels safe telling {Mercury} anything. Comfortable talk and private jokes come naturally. Leave room for silences too.',
      square: '{Mercury} may answer {Moon}’s feelings with logic, and {Moon} hears criticism where none was meant. Tone matters far more than content between you. Ask “do you want help or a listener?” before replying.',
      opposition: 'You come at things from opposite ends, one thinking and one feeling, and each mirrors the other’s blind spot. Misunderstandings happen, and they teach a great deal. Repeat back what you heard before answering it.',
    },
  },
  'Moon|Venus': {
    theme: 'tenderness and comfort',
    whose: '{Venus} tends to offer affection and pleasure; {Moon} tends to feel cherished and at ease.',
    text: {
      conjunction: 'A soft, affectionate bond: {Venus} knows how to comfort {Moon}, and {Moon} brings out {Venus}’s tenderness. It is one of the sweetest contacts in any close relationship. Its only danger is a sweetness that never says the hard thing, so be kind and honest at once.',
      sextile: 'Gentle and pleasant: you enjoy simple comforts together, good food, music, a tidy room. It grows through small shared pleasures more than big occasions. Plan cosy evenings rather than events.',
      trine: 'Natural tenderness: the way {Venus} shows care is exactly what {Moon} needs. Home together tends to be lovely without much effort. Keep thanking each other, because ease can hide the work behind it.',
      square: 'You both want closeness, in different forms: {Venus} through treats and charm, {Moon} through reassurance and routine. Small slights sting more than they should. Ask how the other likes to be comforted, and do it their way.',
      opposition: 'A strong wish to look after each other, with a tendency to give what you would want rather than what they need. Each sees their own longing in the other. Check now and then what actually feels like care to them.',
    },
  },
  'Moon|Mars': {
    theme: 'feeling and heat',
    whose: '{Mars} tends to act, push or protect; {Moon} tends to feel stirred, safe or, on hard days, rushed.',
    text: {
      conjunction: '{Mars} stirs {Moon}’s feelings quickly, with excitement, protectiveness and sometimes irritation. Strong, lively and rarely dull. Agree that {Moon} can say “slow down” without it counting as rejection.',
      sextile: '{Mars} acts on {Moon}’s needs: fixing, helping, getting on with it. You make a good practical team at home. Let {Moon} say what is needed, then let {Mars} do it without supervision.',
      trine: 'Warm and protective: {Mars} defends {Moon}, and {Moon} softens {Mars}’s edges. Energy and feeling work together rather than against each other. Keep making time for small adventures.',
      square: '{Mars} can seem blunt or impatient to {Moon}, and {Moon} touchy to {Mars}. Rows come out of nothing, often when either of you is tired or hungry. Take a breath before replying, and deal with the practical need first.',
      opposition: 'Strong chemistry and strong reactions: what {Mars} does stirs what {Moon} feels, and each may see the other as the cause. Protectiveness and passion come easily, and so do flare-ups. Own your reaction before naming their action.',
    },
  },
  'Moon|Jupiter': {
    theme: 'cheer and generosity',
    whose: '{Jupiter} tends to reassure and lift; {Moon} tends to feel safe enough to hope.',
    text: {
      conjunction: '{Jupiter} makes {Moon} feel safe to hope, and being together lifts both your spirits. The bond is generous, warm and forgiving. Mind indulgence: too much of a good thing, together.',
      sextile: 'Encouraging and cheerful: {Jupiter} has a knack for comforting {Moon}, often with a better perspective. Outings and learning together go well. Plan small adventures you can look forward to.',
      trine: 'Big-hearted ease: you bring out each other’s trust and good humour, and home feels generous. Forgiveness comes quickly. Use that warmth to welcome other people in.',
      square: '{Jupiter}’s cheer can feel dismissive when {Moon} just needs comfort, and {Moon}’s worries can seem overblown to {Jupiter}. Too much optimism skips the real feeling. Comfort first, perspective later.',
      opposition: '{Jupiter} offers {Moon} a bigger view, and {Moon} offers {Jupiter} a home to come back to. You can overpromise each other out of sheer goodwill. Keep promises small and keep them.',
    },
  },
  'Moon|Saturn': {
    theme: 'commitment and emotional steadiness',
    whose: '{Saturn} tends to feel responsible for {Moon}’s wellbeing and can come across as cool; {Moon} tends to feel steadied or, on hard days, held at arm’s length.',
    text: {
      conjunction: '{Saturn} takes {Moon}’s feelings seriously, and this often reads as real commitment from early on. {Moon} feels steadied, and on tired days held back or judged. Warmth has to be shown on purpose here, so {Saturn}, say the kind thing out loud.',
      sextile: '{Saturn} gives {Moon} practical support that builds trust over time. It is reliable rather than romantic, and it adds up. Keep promises small and keep every one.',
      trine: 'A quietly dependable bond: {Saturn} steadies {Moon}, and {Moon} softens {Saturn}’s reserve. Contacts like this tend to last. Add play so it does not become all duty.',
      square: '{Moon} may feel unheard or rationed, while {Saturn} feels weighed down by {Moon}’s needs. Old family patterns about care tend to surface here. Name the old pattern out loud; it loses force once it is seen.',
      opposition: '{Saturn} can feel like a parent to {Moon}, and {Moon} like a dependant to {Saturn}. Each sees in the other something they are afraid to need. Swap roles on purpose sometimes, and let {Saturn} be looked after.',
    },
  },
  'Moon|Ascendant': {
    theme: 'instinctive ease',
    whose: '{Moon} tends to feel at home with {Ascendant}; {Ascendant} tends to feel looked after, in manner and in mood.',
    text: {
      conjunction: '{Moon}’s Moon sits on {Ascendant}’s rising degree, so {Moon} relaxes around {Ascendant} and {Ascendant} feels instinctively cared for. There is often a sense of familiarity, even at a first meeting. {Ascendant} may start to wear {Moon}’s moods, so keep your own weather.',
      sextile: 'A comfortable rapport: you are easy company and quick to relax with each other. It suits everyday life more than grand occasions. Use it to make each other’s ordinary days gentler.',
      trine: '{Moon} feels at home with {Ascendant}’s manner, and the warmth shows. Others may comment on how natural you seem together. Keep the inside of the bond matching the outside.',
      square: '{Ascendant}’s way of being can unsettle {Moon}, and {Moon}’s moods can seem to come out of nowhere to {Ascendant}. Familiarity usually eases it. Explain what you meant whenever tone could mislead.',
      opposition: '{Moon}’s Moon falls on {Ascendant}’s partnership angle, often felt as an emotional pull towards partnership. {Ascendant} sees in {Moon} a softness they want near. Keep a life of your own alongside the shared one.',
    },
  },

  // ── Mercury ────────────────────────────────────────────────────────────
  'Mercury|Mercury': {
    theme: 'how your minds work',
    text: {
      conjunction: 'You think alike, so talk is quick, shorthand develops fast and you finish each other’s sentences. It is a joy for planning and gossip, and an echo chamber for worries. Invite an outside view before big decisions.',
      sextile: 'Your minds work differently enough to spark ideas and alike enough to understand each other. Conversation is useful as well as pleasant. Give it material: books, plans, puzzles.',
      trine: 'Talk flows and you rarely misunderstand each other, because you share a sense of humour and a way of reasoning. You can talk your way through most problems. Use this ease for the conversations that are hard to start.',
      square: 'You approach ideas from different angles and can talk past each other, especially when tired. Debate sharpens both of you, and can slide into point-scoring. Agree that understanding beats winning, and ask a question before making an argument.',
      opposition: 'Opposite points of view that fascinate each other: each of you hears what the other misses. Arguments can go round in circles. Sum up the other’s view to their satisfaction before giving yours.',
    },
  },
  'Mercury|Venus': {
    theme: 'kind words and shared taste',
    whose: '{Mercury} tends to bring the words and ideas; {Venus} tends to make them gracious, and enjoys being talked to.',
    text: {
      conjunction: 'Easy compliments and sweet talk: {Venus} likes how {Mercury} thinks, and {Mercury} finds {Venus} easy to talk to. It is lovely for letters, messages and shared creative work. Do not let charm smooth over a disagreement that needs saying.',
      sextile: 'Warm conversation and overlapping taste in books, music or art. Planning a nice day together is simple. Swap recommendations and actually follow them.',
      trine: 'Talking is a pleasure: kind words come easily and diplomacy is natural, so tension resolves gracefully. You rarely say things you regret. Use this gentle register for the hard subjects too.',
      square: '{Mercury}’s frankness can feel tactless to {Venus}, and {Venus}’s tact can seem evasive to {Mercury}. Disagreements about taste sting more than they should. Agree it is fine to like different things.',
      opposition: 'You are drawn to each other’s way of seeing, and can talk for hours about what you love. Flattery may hide real disagreement. Ask for the honest opinion and accept it gracefully.',
    },
  },
  'Mercury|Mars': {
    theme: 'quick words and quick action',
    whose: '{Mars} tends to push {Mercury}’s ideas into action, or into an argument; {Mercury} tends to feel energised or provoked.',
    text: {
      conjunction: 'Quick, lively talk that can turn into debate in a moment: {Mars} challenges {Mercury}’s thinking and {Mercury} sharpens {Mars}’s aim. Excellent for brainstorming and getting things done. Lower your voices when it turns personal.',
      sextile: '{Mars} acts on {Mercury}’s ideas promptly, so plans become action. You are a productive team. Write the list together, then do it together.',
      trine: 'Talk turns into action without fuss, and witty sparring is part of the fun. You make decisions well as a pair. Stop before teasing goes a step too far.',
      square: 'Sharp words and fast tempers: {Mars} can feel attacked by {Mercury}’s comments, and {Mercury} bulldozed by {Mars}. Arguments escalate quickly. Pause before replying, and put it in writing if speaking keeps going wrong.',
      opposition: 'Debates that are stimulating and exhausting by turns, with each of you seeing the other as the one who started it. You sharpen each other’s minds. Take turns speaking without interruption.',
    },
  },
  'Mercury|Jupiter': {
    theme: 'big ideas',
    whose: '{Jupiter} tends to widen {Mercury}’s thinking; {Mercury} tends to give {Jupiter}’s visions their details.',
    text: {
      conjunction: '{Jupiter} expands {Mercury}’s ideas, and talk ranges widely across belief, travel and plans. It is inspiring and generous. Watch for big talk that never reaches a diary.',
      sextile: 'Learning together comes easily: courses, books, journeys. You are good at teaching each other. Pick a subject and study it together.',
      trine: 'Optimistic, broad-minded conversation in which each encourages the other’s ideas. Lovely for shared study or travel. Write plans down so they happen.',
      square: '{Jupiter} may overstate or preach, and {Mercury} may pick at the details. Talk veers between the grand and the petty. Agree on the facts first, then dream.',
      opposition: 'Detail meets big picture, and each offers the other the view they lack. Discussions can be enlightening or circular. Respect both scales of thinking.',
    },
  },
  'Mercury|Saturn': {
    theme: 'serious talk',
    whose: '{Saturn} tends to test and correct {Mercury}’s ideas; {Mercury} tends to feel focused or, on bad days, doubted.',
    text: {
      conjunction: '{Saturn} takes {Mercury}’s ideas seriously, sometimes too seriously, and talk turns practical. It is good for planning and study. {Saturn}, praise before you correct.',
      sextile: 'Sensible, constructive conversation: plans gain structure and deadlines. It suits budgets and long projects. Meet regularly to review shared plans.',
      trine: 'You rely on each other’s word, and conversations are grounded and trustworthy. Shared commitments hold. Leave some room for silly talk.',
      square: '{Mercury} may feel dismissed or doubted by {Saturn}, and {Saturn} may think {Mercury} careless. Talking can feel like an exam. Say what you appreciate before what concerns you.',
      opposition: 'One thinks loosely and the other carefully, and each reflects what the other lacks. It can feel like teacher and pupil. Swap those roles when you can.',
    },
  },
  'Mercury|Ascendant': {
    theme: 'easy first conversations',
    whose: '{Mercury} tends to read and describe {Ascendant}; {Ascendant} tends to feel easily understood.',
    text: {
      conjunction: '{Mercury} reads {Ascendant} quickly and talk starts at once, often from the first meeting. You rarely run out of things to say. Keep the conversation going past first impressions.',
      sextile: 'Easy, friendly chat; you are good at small talk and introductions as a pair. You make good companions in company. Use it to make others feel welcome.',
      trine: '{Mercury} understands {Ascendant}’s manner, and {Ascendant} enjoys {Mercury}’s mind. The rapport is natural. Try deeper subjects than the ones that come easily.',
      square: '{Mercury}’s comments on {Ascendant}’s manner or looks may grate. Teasing about style lands harder than intended. Keep personal remarks kind.',
      opposition: '{Mercury}’s Mercury falls on {Ascendant}’s partnership angle, so talk sits at the centre of the bond. You enjoy discussion and debate with each other. Listen as well as reply.',
    },
  },

  // ── Venus ──────────────────────────────────────────────────────────────
  'Venus|Venus': {
    theme: 'taste and affection',
    text: {
      conjunction: 'You love the same things, from food to music to how a room should look, so liking each other is simple. Shared pleasures need no negotiation. The pitfall is indulging together; balance treats with something that stretches you.',
      sextile: 'Your tastes are compatible, with enough difference to introduce each other to new pleasures. Affection is friendly and easy. Take turns choosing the outing.',
      trine: 'You show and receive care in similar ways, so affection lands without translation. Time together feels like a treat. Do not let comfort turn into complacency.',
      square: 'You show care in different languages and value different things, whether money, beauty or time. Either of you can feel unappreciated when appreciation is in fact there. Learn the other’s language and use it.',
      opposition: 'Opposite tastes that fascinate: each admires what the other finds beautiful. Part of the attraction is the difference itself. Make room for both styles at home.',
    },
  },
  'Venus|Mars': {
    theme: 'affection meeting desire',
    whose: '{Mars} tends to pursue and act; {Venus} tends to attract, receive and set the tone.',
    text: {
      conjunction: {
        base: 'Warmth and energy meet: {Mars} acts on what {Venus} enjoys, so plans for fun actually happen. There is a lively, affectionate charge between you. Keep the energy generous rather than competitive.',
        romantic: 'A strong, immediate pull: {Mars} wants what {Venus} has, and {Venus} enjoys being wanted. Affection and desire sit in the same place, so chemistry is rarely in doubt. Pair the heat with ordinary kindness so it outlasts the spark.',
      },
      sextile: {
        base: '{Mars} is happy to do things for {Venus}, and {Venus} makes {Mars}’s efforts feel appreciated. Shared activity is the easiest way to be close. Plan days out with something to do in them.',
        romantic: 'Flirtation and friendly attraction that grow when you act on them. Desire is playful rather than overwhelming. Make dates instead of waiting for them.',
      },
      trine: {
        base: '{Mars}’s energy suits {Venus}’s pleasures, so doing things together is fun and relaxed. It is a warm, uncomplicated companionship. Keep doing things side by side, not only talking.',
        romantic: 'Affection and desire move together easily: you want each other and you like each other. Physical and tender closeness tend to agree. Keep courting, because easy chemistry is easy to take for granted.',
      },
      square: {
        base: '{Mars} can be too pushy for {Venus}’s taste, and {Venus} too particular for {Mars}’s pace. Squabbles come over plans, money or what counts as fun. Alternate who sets the agenda.',
        romantic: 'A lively, sometimes prickly attraction: want and tenderness take turns leading, and timing is often off. The tension can be exciting and can also start rows about who wants what, and when. Talk openly about desire and pace.',
      },
      opposition: {
        base: 'You are drawn to each other’s energy, {Venus} to the drive and {Mars} to the charm. Plans tend to become a push and pull. Share the planning so neither is always the one being moved.',
        romantic: 'Magnetic attraction between opposite energies, each seeing in the other what they desire. Pursuit and retreat can turn into a game. Meet in the middle rather than chasing.',
      },
    },
  },
  'Venus|Jupiter': {
    theme: 'generosity and fondness',
    whose: '{Jupiter} tends to give generously and praise; {Venus} tends to feel appreciated, even spoilt.',
    text: {
      conjunction: 'Generous fondness: {Jupiter} spoils {Venus}, and {Venus} brings out {Jupiter}’s warmth. Celebrations and treats come easily. Watch the spending when you are together.',
      sextile: 'Good-humoured affection and a shared enjoyment of nice things. You are good at hospitality and gifts. Host something together.',
      trine: 'One of the happiest contacts: kindness, gifts and goodwill run both ways, and forgiveness is quick. Being together simply feels good. Keep it from sliding into excess.',
      square: 'Too much of a good thing: indulgence, overspending or promises larger than you can keep. It is lovely and extravagant in equal parts. Set a budget for fun and enjoy staying inside it.',
      opposition: 'You admire and flatter each other, and generosity can become a quiet competition. Each sees their own pleasures mirrored. Enjoy without keeping score.',
    },
  },
  'Venus|Saturn': {
    theme: 'loyalty and limits',
    whose: '{Saturn} tends to feel responsible for the bond and can turn critical; {Venus} tends to feel steadied on good days and limited on hard ones.',
    text: {
      conjunction: 'This contact asks for commitment: {Saturn} takes {Venus}’s affection seriously, and {Venus} brings warmth to {Saturn}’s reserve. Fondness often deepens slowly over years. {Saturn}, show affection freely; {Venus}, do not read caution as coldness.',
      sextile: 'Affection builds steadily into loyalty, and practical care is the language of love here. It suits long commitments. Mark anniversaries, even small ones.',
      trine: 'Lasting, loyal fondness: you are faithful and dependable with each other, and the bond improves with time. Few contacts age as well. Remember to be light-hearted too.',
      square: '{Venus} may feel criticised, rationed or not quite good enough; {Saturn} may feel {Venus} is careless with money or time. Slow trust-building pays back. Swap criticism for requests: “could you”, not “you never”.',
      opposition: '{Saturn} can seem like the brake on {Venus}’s pleasure, and {Venus} like a temptation to {Saturn}. Each shows the other a way of loving they keep at a distance. Name the fear behind the rule.',
    },
  },
  'Venus|Ascendant': {
    theme: 'charm and liking',
    whose: '{Venus} tends to find {Ascendant} attractive or simply likeable; {Ascendant} tends to feel admired.',
    text: {
      conjunction: '{Venus} found {Ascendant} appealing at first sight, and {Ascendant} feels admired and relaxed. The rapport is charming and easy. Let it go deeper than charm.',
      sextile: 'Pleasant first impressions and easy company; you make good hosts together. Socialising as a pair suits you. Invite people round.',
      trine: '{Venus} likes {Ascendant}’s style, and {Ascendant} brings out {Venus}’s grace. Others can see the warmth between you. Keep the courtesy at home as well as out.',
      square: 'Taste clashes: {Venus} may not care for {Ascendant}’s style, and {Ascendant} may find {Venus} fussy. It usually softens with time. Compliment what you do like.',
      opposition: '{Venus}’s Venus falls on {Ascendant}’s partnership angle, a traditional mark of attraction and partnership. Fondness runs both ways. Keep the give and take balanced.',
    },
  },

  // ── Mars ───────────────────────────────────────────────────────────────
  'Mars|Mars': {
    theme: 'drive and pace',
    text: {
      conjunction: 'Your drive and timing match: a strong team when aimed outward and fierce rivals when aimed at each other. Energy doubles in the same room. Pick shared challenges so it points the right way.',
      sextile: 'Your energies complement each other, one starting and the other finishing. It suits sport, work and DIY. Do things side by side.',
      trine: 'Your pace suits each other, so working or playing together is easy. You are a confident pair. Watch only for taking on too much.',
      square: {
        base: 'Tempers and tempo clash: you want to do things differently and at different speeds. Rows are quick and can clear the air. Physical activity or a shared project helps let it out.',
        family: 'Two sets of elbows: you push each other hard, at different speeds, and old scraps come back easily. Rows are loud and quickly over. Give each of you a patch to be in charge of.',
      },
      opposition: 'Competitive and stimulating: each sees their own drive reflected in the other. Rivalry can be fun or bruising. Compete against a goal, not against each other.',
    },
  },
  'Mars|Jupiter': {
    theme: 'boldness',
    whose: '{Jupiter} tends to cheer on and enlarge {Mars}’s efforts; {Mars} tends to feel bold enough to try.',
    text: {
      conjunction: 'Bold, enthusiastic energy: {Jupiter} cheers {Mars} on, and {Mars} gives {Jupiter}’s plans legs. Adventures happen. Check the risks before you leap.',
      sextile: 'Good teamwork with a sense of luck behind it; projects tend to succeed. You make each other braver. Start something ambitious together.',
      trine: 'Confident action and generous support: you make each other brave and cheerful. Wonderful for travel and sport. Set limits so you rest as well.',
      square: 'Overreach and impatience: you push each other too far, too fast. Excitement turns into burnout. Pace yourselves deliberately.',
      opposition: 'Big energy and big opinions; you egg each other on. Rows tend to be about beliefs. Agree to differ.',
    },
  },
  'Mars|Saturn': {
    theme: 'drive meeting brakes',
    whose: '{Saturn} tends to slow, test or discipline {Mars}; {Mars} tends to feel either focused or frustrated.',
    text: {
      conjunction: '{Saturn} channels {Mars}’s energy into discipline, or blocks it outright. It can be very productive or very frustrating. Agree goals where {Saturn}’s structure serves {Mars}’s drive.',
      sextile: 'Disciplined effort: {Saturn} gives {Mars} method and {Mars} gives {Saturn} momentum. Good for long projects. Set milestones together.',
      trine: 'Steady, effective teamwork with real endurance; you build things that last. Patience and push are in balance. Celebrate each stage of progress.',
      square: 'One of the harder contacts: {Mars} feels thwarted by {Saturn}, and {Saturn} feels {Mars} is reckless. Frustration can turn cold or harsh. Avoid tests of control, and agree ground rules in calm moments.',
      opposition: 'Accelerator and brake: each provokes the other’s opposite. Power struggles are possible. Take turns deciding the pace.',
    },
  },
  'Mars|Ascendant': {
    theme: 'a stirring presence',
    whose: '{Mars} tends to energise or provoke {Ascendant}; {Ascendant} tends to feel stirred, attracted or crowded.',
    text: {
      conjunction: {
        base: '{Mars}’s Mars sits on {Ascendant}’s rising degree, so {Ascendant} feels energised or provoked by {Mars}’s presence. The reaction is instant. Give {Ascendant} room to respond in their own time.',
        romantic: '{Mars}’s Mars sits on {Ascendant}’s rising degree: a physical, immediate attraction, felt in the body. It can also be felt as pressure. Let {Ascendant} set the pace.',
      },
      sextile: '{Mars} motivates {Ascendant}, and you get going together. You make good activity partners. Plan outings that involve moving.',
      trine: 'Lively and encouraging: {Mars} boosts {Ascendant}’s confidence. There is a physical ease between you. Do things together.',
      square: '{Mars} can seem pushy to {Ascendant}, and irritation comes quickly, especially in public. Mind your tone around others.',
      opposition: '{Mars}’s Mars falls on {Ascendant}’s partnership angle: strong attraction or strong rivalry. There is heat in the meeting. Turn it into something shared.',
    },
  },

  // ── Jupiter, Saturn, Ascendant ─────────────────────────────────────────
  'Jupiter|Jupiter': {
    theme: 'a shared outlook',
    text: {
      conjunction: 'You share a basic faith and outlook, often because you were born about the same time or twelve years apart. You agree easily on what is worth hoping for. Use it to dream together.',
      sextile: 'Compatible beliefs and a shared sense of opportunity. You encourage each other’s growth. Learn something together.',
      trine: 'Similar values about growth, faith and generosity give you a comfortable common ground. Your hopes point the same way. Plan a pilgrimage or a long trip.',
      square: 'Different ideas about what is right or worthwhile, in belief, politics or money. Debates can get heated. Respect the difference rather than converting each other.',
      opposition: 'Opposite philosophies that broaden each other: each teaches the other something. It works when it stays curious. Ask questions rather than preaching.',
    },
  },
  'Jupiter|Saturn': {
    theme: 'vision and structure',
    whose: '{Saturn} tends to test and ground {Jupiter}’s plans; {Jupiter} tends to feel supported or reined in.',
    text: {
      conjunction: 'Vision meets structure: {Jupiter} brings the hope and {Saturn} the plan. A strong pairing for building something that lasts. Balance optimism with realism, and the other way round.',
      sextile: 'Practical growth: you make plans realistic and keep them moving. Good for business and long-term projects. Set a timeline and stick to it.',
      trine: 'A steady, wise partnership in which patience and faith balance. Achievements tend to last. Remember to celebrate them.',
      square: '{Jupiter} finds {Saturn} a wet blanket, and {Saturn} thinks {Jupiter} reckless. The tension is between growth and caution. Agree the budget and the dream separately.',
      opposition: 'Expansion against restraint: each mirrors the other’s missing half. It is productive when both listen. Swap roles occasionally.',
    },
  },
  'Jupiter|Ascendant': {
    theme: 'a warm welcome',
    whose: '{Jupiter} tends to encourage and bring luck to {Ascendant}; {Ascendant} tends to feel welcomed.',
    text: {
      conjunction: '{Jupiter}’s Jupiter sits on {Ascendant}’s rising degree, so {Ascendant} feels welcomed, encouraged and a little luckier around {Jupiter}. The first impression was warm. Enjoy the generosity and return it.',
      sextile: 'Friendly encouragement and good social energy; opportunities come through each other. You widen each other’s circles. Introduce each other to friends.',
      trine: 'Goodwill and generosity were obvious from the start. Friendship comes easily. Share your luck.',
      square: '{Jupiter} may seem overbearing or preachy to {Ascendant}, and generosity can misjudge what is wanted. Ask before advising.',
      opposition: '{Jupiter}’s Jupiter falls on {Ascendant}’s partnership angle: a generous, beneficial partner. Both of you gain from the bond. Keep the benefits flowing both ways.',
    },
  },
  'Saturn|Saturn': {
    theme: 'a sense of duty',
    text: {
      conjunction: 'You share a sense of duty and many of the same lessons, often because you are close in age. You understand each other’s fears and ambitions. Support each other through the same hard years.',
      sextile: 'Compatible attitudes to work and responsibility make cooperation reliable. You respect each other’s effort. Build something lasting.',
      trine: 'Similar ideas of commitment and structure make you dependable together. Long-term plans feel safe. Stay flexible inside them.',
      square: 'Different ideas about rules, duty and what counts as responsible. It can feel like a clash of standards. Spell out expectations instead of assuming them.',
      opposition: 'You carry opposite pressures, and each sees in the other the duty they resist. Respect and tension sit side by side. Share the load.',
    },
  },
  'Saturn|Ascendant': {
    theme: 'gravity and respect',
    whose: '{Saturn} tends to feel responsible for, or critical of, {Ascendant}; {Ascendant} tends to feel steadied or watched.',
    text: {
      conjunction: '{Saturn}’s Saturn sits on {Ascendant}’s rising degree, so {Ascendant} may feel watched or judged at first and steadied later. The connection is serious and lasting. {Saturn}, soften your first impressions.',
      sextile: 'Respect and reliability: {Saturn} gives {Ascendant} sound advice. The support is practical. Ask for it when you need it.',
      trine: 'Steady and respectful: you trust each other and the bond lasts. Neither needs to perform. Lighten up together.',
      square: '{Saturn} can seem disapproving of {Ascendant}’s manner, and {Ascendant} can feel criticised. Restraint creeps in. Be kind about style and appearance.',
      opposition: '{Saturn}’s Saturn falls on {Ascendant}’s partnership angle: committed and serious, sometimes heavy. Duty and loyalty run deep. Keep warmth in the commitment.',
    },
  },
  'Ascendant|Ascendant': {
    theme: 'your styles',
    text: {
      conjunction: 'Similar manner and style; you may be taken for siblings. Familiarity is instant. Keep your individuality.',
      sextile: 'Compatible ways of meeting the world make you easy companions. You enjoy going out together. Try new places as a pair.',
      trine: 'Similar temperament in how you come across, so you are easy together in public. You rarely embarrass each other. Enjoy the shared ease.',
      square: 'Different styles that grated at first and take time to warm to. Patience helps. Allow each other’s ways.',
      opposition: 'Your rising signs are opposite, so each meets the world the way the other partners: a classic mirror. Partnership potential is strong. Value the difference.',
    },
  },
};

const ORDER: Planet8[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant'];

/** The PAIRS key for two planets, in either order. */
export const pairKey = (p: Planet8, q: Planet8): string => (ORDER.indexOf(p) <= ORDER.indexOf(q) ? `${p}|${q}` : `${q}|${p}`);

/** Replace {Planet} tokens with the name of whose planet it is (or "the X person"). */
export function fillNames(text: string, names: Partial<Record<Planet8, string>>): string {
  return text.replace(/\{(\w+)\}/g, (_, p: Planet8) => names[p] ?? `the ${p} person`);
}

export function pairReading(p: Planet8, q: Planet8, aspect: MajorAspect, type: RelType): string | null {
  const t = PAIRS[pairKey(p, q)]?.text[aspect];
  if (!t) return null;
  return typeof t === 'string' ? t : t[type] ?? t.base;
}
