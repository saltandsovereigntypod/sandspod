// The Grimoire's longer pages on the suit of Pentacles: earth, the body,
// money, work and the home. After Waite's Pictorial Key (1910) and the
// Golden Dawn's Book T for the decans and titles. Keyed by the card ids in
// tarot.ts. Pure data.

import type { TarotDeep } from './types.ts';

const COURT_NOTE = 'Some readers swap the Knight and the King, since the Golden Dawn’s court had a mounted Knight at the top and a Prince in a chariot below.';

export const PENTACLES_DEEP: Record<string, TarotDeep> = {
  'pentacles-01': {
    words: ['prosperity', 'opportunity', 'grounding'],
    image:
      'A hand comes out of a cloud holding up a large golden pentacle, a five-pointed star in a circle. Below is a garden full of white lilies, and a path that runs through an arch in a hedge of roses towards distant mountains. It is a gift offered from above into a well-tended earthly garden.',
    upright:
      'The Ace of Pentacles is a seed of material good: a new opportunity in money, work, health or home, something real you can hold and build on. Waite gives perfect contentment, happiness and ecstasy, speedy intelligence, and gold. Upright, it says the opportunity is solid. Take it, plant it, and tend it patiently; earth grows slowly but it keeps what it grows.',
    reversed:
      'Reversed, the gift is missed, mishandled or soured. It can mean a lost opportunity, poor planning with money, or wealth that doesn’t bring contentment. Waite gives the evil side of wealth and bad intelligence, and also great riches; whether riches are good for you depends on how the card falls. Ask what you would do with abundance, and start with what you have.',
    correspondences:
      'Ace, number 1: the root of the powers of earth, and Kether, the crown. The Golden Dawn gave the aces no decan; they stand above the zodiac as the pure source of their element. The pentacle itself is the magician’s disc of earth, the five points for the four elements crowned by spirit.',
    love:
      'A stable, grounded beginning: a relationship with real foundations, or a practical step such as moving in. Reversed, letting money or security get in the way of love, or a relationship that never quite takes root.',
    work:
      'A new job, an offer, an investment, a business idea with real prospects. A good card for money matters. Reversed, a missed chance or a plan that looks better on paper than it is.',
    spirit:
      'Earth magic: the body, the garden, the hearth, the land you live on. Money spells done with honest work behind them. A pentacle on the altar, salt on the threshold. The sacred in ordinary things.',
    question: 'What seed of good have you been given, and where will you plant it?',
  },
  'pentacles-02': {
    words: ['balance', 'adaptability', 'juggling'],
    image:
      'A young man in a tall hat dances lightly, juggling two pentacles joined by a green band twisted into a figure of eight, the sign of infinity on its side. Behind him, two ships ride high, rolling waves. Waite describes the band as that endless cord which is like the number eight on its side.',
    upright:
      'The Two of Pentacles is keeping things in the air: balancing priorities, money and time, adapting as circumstances rise and fall like the waves behind. It can be light-hearted, a dance; or it can be the juggling act of too many demands. Waite gives gaiety and recreation, and also news and messages in writing, obstacles, agitation and trouble. Upright, stay flexible and keep a light touch.',
    reversed:
      'Reversed, something drops. It can mean overcommitment, financial strain, or being so busy juggling that nothing gets done properly. Waite gives enforced gaiety, simulated enjoyment, handwriting, composition and letters of exchange. Put one pentacle down and look at what you really have to carry.',
    correspondences:
      'Two, Chokmah, wisdom. Golden Dawn title: the Lord of Harmonious Change. Jupiter in Capricorn, the first decan of Capricorn (0–10°): cardinal earth opened up by the planet of growth.',
    love:
      'Balancing a relationship with work and everything else; going with the flow. Reversed, not enough time for each other, or one partner left juggling.',
    work:
      'Multitasking, managing cash flow, adapting to change. You can keep it going with care. Reversed, too many projects, missed deadlines, or money stretched thin.',
    spirit:
      'Balance in practice: the ebb and flow of seasons and moods. Moving meditation and dance as ritual. The figure of eight as the endless exchange between spirit and matter.',
    question: 'What are you juggling, and which of these can you put down for now?',
  },
  'pentacles-03': {
    words: ['teamwork', 'craftsmanship', 'skill'],
    image:
      'Inside a church, a stonemason stands on a bench at work on a carved arch, where three pentacles are worked into the stone. Below him stand a monk and a figure in a patterned cloak holding up a plan of the building. They are consulting together. Waite calls him a sculptor at his work in a monastery.',
    upright:
      'The Three of Pentacles is good work done together: skill, collaboration, and the respect earned by doing a job well. The mason has the craft, the others the plan and the purpose, and the building needs all three. Waite gives a trade, skilled labour, and also nobility, renown and glory. Upright, bring your skill to a shared project, and listen to the people whose skills differ from yours.',
    reversed:
      'Reversed, the team doesn’t pull together, or the work is rushed. It can mean poor quality, lack of recognition, or clashing ideas. Waite gives mediocrity, in work and otherwise, puerility, pettiness and weakness. Agree on the plan, and take pride in your part of it.',
    correspondences:
      'Three, Binah, understanding. Golden Dawn title: the Lord of Material Works. Mars in Capricorn, the second decan of Capricorn (10–20°): energy put into building.',
    love:
      'Building a relationship together; working as a team; a partner who makes an effort. Reversed, not pulling your weight, or different ideas about the future.',
    work:
      'Collaboration, apprenticeship, quality craftsmanship, recognition from those who know. Reversed, poor teamwork, or work not valued.',
    spirit:
      'Learning a craft properly; working with a group or teacher; building a shrine or temple with your hands. Magic as skilled work, and the patience of the mason.',
    question: 'What are you building, and who are you building it with?',
  },
  'pentacles-04': {
    words: ['security', 'control', 'holding'],
    image:
      'A crowned man sits on a stone block with a city behind him. He holds one pentacle tightly to his chest with both arms, balances another on top of his crown, and plants his feet firmly on two more. Waite says simply: he holds to that which he has.',
    upright:
      'The Four of Pentacles is holding on: to money, to security, to what you have. It can be sensible saving and stability, or it can be fear, possessiveness and a grip so tight nothing new can come in. Waite gives the surety of possessions, cleaving to what one has, gift, legacy and inheritance. Upright, ask whether you are keeping safe or keeping closed.',
    reversed:
      'Reversed, the grip loosens or tightens further. It can mean letting go, generosity, spending freely, or losing control of money; it can also mean greed. Waite gives suspense, delay and opposition. Find the balance between holding and giving.',
    correspondences:
      'Four, Chesed, mercy. Golden Dawn title: the Lord of Earthly Power. The Sun in Capricorn, the third decan of Capricorn (20–30°): the light of the sun concentrated in cardinal earth.',
    love:
      'Possessiveness, holding back, or security valued above feeling. Sometimes a stable, steady love. Reversed, opening up, or holding on too tightly to someone.',
    work:
      'Saving, budgeting, protecting your position. Financial security. Reversed, overspending, or fear of losing what you have keeping you from growth.',
    spirit:
      'Grounding and protection; prosperity work. But also the spiritual lesson of letting go. What do you hold on to that holds you back?',
    question: 'What are you holding so tightly that there is no room for anything new?',
  },
  'pentacles-05': {
    words: ['hardship', 'poverty', 'exclusion'],
    image:
      'Two ragged figures struggle through the snow at night, past a lit church window with five pentacles in its stained glass. One limps on crutches with a bandage round his head; the other, a woman, clutches a thin shawl round herself. They don’t look up at the window. Waite calls them two mendicants in a snowstorm passing a lighted casement.',
    upright:
      'The Five of Pentacles is hard times: material trouble, poverty, illness, or feeling left out in the cold. The help may be close by, the lit window right there, but not seen or not offered. Waite gives material trouble above all, whether destitution or otherwise; some read it as a card of love and lovers, of companionship in hardship. Upright, it says this is hard. Look for the help that is near, and accept it.',
    reversed:
      'Reversed, the hardship eases, or deepens into chaos. It can mean recovery, finding help, or a spiritual poverty that money can’t fix. Waite gives disorder, chaos, ruin, discord and profligacy. Turn towards the light.',
    correspondences:
      'Five, Geburah, severity. Golden Dawn title: the Lord of Material Trouble. Mercury in Taurus, the first decan of Taurus (0–10°).',
    love:
      'Feeling unloved or left out; going through hard times together. Waite’s note that some read it as lovers in hardship is worth remembering. Reversed, things improving, or reaching for help.',
    work:
      'Job loss, money worries, feeling excluded. Ask for help. Reversed, recovery, new work after hardship.',
    spirit:
      'Charity and mutual aid as practice. Healing work. Remember the window: spiritual help is often closer than it seems.',
    question: 'Where is the lit window near you, and what stops you looking up?',
  },
  'pentacles-06': {
    words: ['generosity', 'giving', 'fairness'],
    image:
      'A well-dressed merchant holds a pair of scales in one hand and drops coins into the outstretched hand of a kneeling beggar with the other. A second beggar kneels beside the first, waiting. Six pentacles float above them. Waite calls him a person in the guise of a merchant who weighs money in scales and distributes it to the needy.',
    upright:
      'The Six of Pentacles is giving and receiving: generosity, charity, fairness and the flow of resources. It asks which side you are on today, giver or receiver, and whether the exchange is just. Waite gives presents, gifts and gratification; also attention, vigilance, and present prosperity: now is the accepted time. Upright, give fairly, and receive with grace.',
    reversed:
      'Reversed, the scales tip. It can mean strings attached to a gift, debts, inequality, or charity that humiliates. Waite gives desire, cupidity, envy, jealousy and illusion. Look at the power in the exchange.',
    correspondences:
      'Six, Tiphareth, beauty. Golden Dawn title: the Lord of Material Success. The Moon in Taurus, the second decan of Taurus (10–20°): the moon exalted in the sign of fertile earth.',
    love:
      'A generous partner; give and take in balance. Reversed, one partner giving everything, or love with strings attached.',
    work:
      'Grants, loans, a raise, charity work, mentoring. Fair pay. Reversed, unfair pay, debt, or being taken advantage of.',
    spirit:
      'Offerings and reciprocity: giving back to the land, the gods, your community. A gift for a gift, as the old saying goes. Give what you can spare freely, and let yourself be helped when it is your turn to kneel.',
    question: 'Where are you giving, where are you receiving, and is it fair?',
  },
  'pentacles-07': {
    words: ['patience', 'assessment', 'investment'],
    image:
      'A young farmer leans on his hoe and looks at seven pentacles growing on a green bush beside him. Waite says one would think these were his treasures and his heart was there. He has done the work; now he must wait for the harvest.',
    upright:
      'The Seven of Pentacles is the pause in the middle of growing: patience, assessment, and a long-term investment of effort. You have worked hard; now look at what is coming up, and decide whether to keep going. Waite calls its readings exceedingly contradictory: in the main money, business and barter, but also quarrels, and also innocence and ingenuity. Upright, be patient; growth is slow.',
    reversed:
      'Reversed, the wait feels wasted. It can mean impatience, poor returns, or effort put in the wrong place. Waite gives anxiety about money that it may be proposed to lend. Look honestly at whether this crop is worth tending.',
    correspondences:
      'Seven, Netzach, victory. Golden Dawn title: the Lord of Success Unfulfilled. Saturn in Taurus, the third decan of Taurus (20–30°): the slow planet in the slow sign.',
    love:
      'A relationship that needs patience; reviewing where it is going. Reversed, frustration, or investing in someone who doesn’t invest back.',
    work:
      'Long-term projects, investments, reviewing progress. Keep going. Reversed, poor returns, or a need to change your approach.',
    spirit:
      'Garden magic; patience in practice. Spells take time, like seeds. Review your workings at the turn of each season and see what has grown, what needs feeding, and what to dig up and compost.',
    question: 'What have you planted, and are you willing to wait for it?',
  },
  'pentacles-08': {
    words: ['diligence', 'mastery', 'craft'],
    image:
      'A craftsman in a leather apron sits at a bench, carving a pentacle into a disc with hammer and chisel. Six finished pentacles hang on a post beside him, and one lies on the ground at his feet. A town stands in the distance down a road. Waite calls him an artist in stone at his work, which he exhibits in the form of trophies.',
    upright:
      'The Eight of Pentacles is the apprentice becoming the master: diligent, focused work, practising a skill until it is yours. Waite gives work, employment, commission, craftsmanship, skill in craft and business, perhaps in the preparatory stage. Upright, put in the hours. The work itself is the reward, and the skill will last.',
    reversed:
      'Reversed, the work becomes drudgery or shortcut. It can mean perfectionism, lack of focus, or skill turned to cunning. Waite gives voided ambition, vanity, cupidity, exaction and usury; also the ingenious mind turned to intrigue. Ask why you are doing this work.',
    correspondences:
      'Eight, Hod, splendour. Golden Dawn title: the Lord of Prudence. The Sun in Virgo, the first decan of Virgo (0–10°): the light of the sun in the sign of careful work.',
    love:
      'Working at a relationship; showing love through steady effort. Reversed, too busy for love, or going through the motions.',
    work:
      'Training, apprenticeship, honing your craft, diligent work that builds a reputation. Reversed, cutting corners, or burnout from perfectionism.',
    spirit:
      'Practice as craft: repetition, study, mastery. Make your own tools, carve your own candles, learn one herb thoroughly before the next. Daily devotion, done well, adds up to something no shortcut can.',
    question: 'What skill are you building, one careful stroke at a time?',
  },
  'pentacles-09': {
    words: ['independence', 'abundance', 'refinement'],
    image:
      'A woman in a robe patterned with flowers stands at ease in a vineyard heavy with grapes, with a manor house in the distance. A hooded bird of prey rests on her gloved left hand. Nine pentacles grow among the vines, and a small snail crosses the ground in front of her. Waite calls it a wide domain, suggesting plenty in all things.',
    upright:
      'The Nine of Pentacles is self-made abundance: independence, comfort and the pleasure of a life you have built. The falcon is trained and hooded: discipline has given her freedom. Waite gives prudence, safety, success, accomplishment, certitude and discernment. Upright, enjoy what you have earned, and the freedom it gives you.',
    reversed:
      'Reversed, the garden is less secure than it looks. It can mean overspending, dependence, or comfort that has become isolation. Waite gives roguery, deception, a voided project and bad faith. Check your foundations.',
    correspondences:
      'Nine, Yesod, foundation. Golden Dawn title: the Lord of Material Gain. Venus in Virgo, the second decan of Virgo (10–20°): beauty and pleasure in the sign of the harvest.',
    love:
      'Independence in love; being content alone or in a partnership of equals. Reversed, depending on someone for security, or loneliness.',
    work:
      'Financial independence, self-employment, success that lets you enjoy life. Reversed, overwork, or living beyond your means.',
    spirit:
      'Garden and plant magic. Self-care as practice. Discipline that leads to freedom; the trained falcon as ally. Grapes and wine for Venus, and a quiet afternoon in a garden as an offering to yourself.',
    question: 'What have you built that lets you stand on your own?',
  },
  'pentacles-10': {
    words: ['legacy', 'family', 'wealth'],
    image:
      'Beneath an archway into a house and its lands, a man and woman stand together with a child. In the foreground sits an old man in a robe patterned with grapes and symbols, two white dogs beside him, and the child’s hand rests on one. The ten pentacles are laid over the scene in the pattern of the Tree of Life. Waite describes it as the abode of a family.',
    upright:
      'The Ten of Pentacles is lasting wealth: family, inheritance, tradition and the security that passes from one generation to the next. Waite gives gain, riches, family matters, archives, extraction, and the abode of a family. Upright, it is the long view of prosperity: what you inherit, what you build, and what you leave behind.',
    reversed:
      'Reversed, the legacy is troubled. It can mean family disputes about money, inheritance lost, or a break with tradition. Waite gives chance, fatality, loss, robbery and games of hazard, and sometimes gift, dowry or pension. Look after what you will pass on.',
    correspondences:
      'Ten, Malkuth, the kingdom. Golden Dawn title: the Lord of Wealth. Mercury in Virgo, the third decan of Virgo (20–30°).',
    love:
      'Long-term commitment, family, marriage, a home that will last. Reversed, family pressure, or money troubles in a long relationship.',
    work:
      'Family business, inheritance, long-term financial security, a stable institution. Reversed, financial loss, or a family business in trouble.',
    spirit:
      'Ancestor veneration; family traditions; land and lineage. Keep the family recipes, the stories and the old photographs. What will you leave to those who come after?',
    question: 'What have you inherited, and what will you leave behind?',
  },
  'pentacles-11': {
    words: ['study', 'ambition', 'diligence'],
    image:
      'A young man stands in a green field with flowers at his feet, a ploughed field and trees beyond. He holds a pentacle up in both hands and gazes at it intently. Waite says he moves slowly, insensible of that which is about him.',
    upright:
      'The Page of Pentacles is the dedicated student: practical, curious and ready to learn by doing. He is the start of a new skill, a new venture or a new plan for money or health. Waite gives application, study, scholarship and reflection; also news and messages, and management. Upright, study well, make a plan, and take the first practical step.',
    reversed:
      'Reversed, study stalls or plans don’t get past the dream stage. It can mean laziness, distraction, or bad news about money. Waite gives prodigality, dissipation, liberality and luxury, and unfavourable news. Bring the dream down to earth.',
    correspondences:
      'Page: earth of earth, the Golden Dawn’s Princess of the Echoing Hills. The densest point of the whole deck: solid, practical, rooted.',
    love:
      'A steady, practical beginning; someone loyal and reliable who shows love by turning up. Reversed, a relationship that doesn’t progress.',
    work:
      'Studying, training, a new job or business plan. Good news about money or a course. Put the plan on paper. Reversed, procrastination, or not following through.',
    spirit:
      'Earth magic for beginners; studying herbs, stones and plants. Learn by doing: grow one herb from seed, keep a nature notebook, walk the same path through the seasons and note what changes. Knowledge you have held in your hands stays with you.',
    question: 'What practical step could you take today towards something you want?',
  },
  'pentacles-12': {
    words: ['reliability', 'routine', 'perseverance'],
    image:
      'A knight in dark armour sits on a heavy black horse that stands perfectly still in front of a ploughed field. He holds a pentacle in his hand and looks at it, and sprigs of leaves decorate his helmet and the horse’s head. Waite says he rides a slow, enduring, heavy horse, to which his own aspect corresponds.',
    upright:
      'The Knight of Pentacles is steady work: patient, reliable, methodical and dependable. He won’t be hurried, and he finishes what he starts. Waite gives utility, serviceableness, interest, responsibility and rectitude, all on the normal and external plane. Upright, keep going step by step. Slow and steady gets there.',
    reversed:
      'Reversed, steadiness turns to stagnation. It can mean boredom, laziness, or being stuck in a rut. Waite gives inertia, idleness, stagnation, placidity, discouragement and carelessness. Get the horse moving.',
    correspondences:
      'Knight: fire of earth, in the mapping most readers use: the slow fire that warms the soil. ' + COURT_NOTE,
    love:
      'A loyal, dependable partner; commitment proven by actions. Reversed, a relationship in a rut, or a partner who won’t make a move.',
    work:
      'Hard work, routine, finishing what you start, reliable progress. Reversed, boredom or perfectionism slowing you down.',
    spirit:
      'Daily practice, done reliably. Earth and garden work. Devotion is a habit, and the plain repetition of lighting a candle every morning builds something that a single grand rite cannot.',
    question: 'What would you finish if you simply kept going?',
  },
  'pentacles-13': {
    words: ['nurturing', 'practicality', 'comfort'],
    image:
      'A queen sits on a throne carved with goats’ heads, fruit and winged children, in a garden under a bower of roses. She holds a pentacle in her lap and gazes at it tenderly. In the corner, a rabbit sits on the grass. Waite says she contemplates her symbol and may see worlds therein; her quality is greatness of soul.',
    upright:
      'The Queen of Pentacles is practical care: nurturing, generous, down-to-earth and good at making a home and a life comfortable. She looks after people with food, warmth and good sense. Waite gives opulence, generosity, magnificence, security and liberty. Upright, care for the body, the home and the people in it.',
    reversed:
      'Reversed, care turns to smothering or neglect. It can mean overwork, financial worry, or neglecting yourself while looking after others. Waite gives evil, suspicion, suspense, fear and mistrust. Tend your own garden too.',
    correspondences:
      'Queen: water of earth, the Golden Dawn’s Queen of the Thrones of Earth. Earth softened by feeling: the fertile, watered garden.',
    love:
      'A nurturing, generous partner; a cosy home; practical love. Reversed, smothering, or neglecting the relationship for work.',
    work:
      'Running a home business, caring work, managing money well. Practical solutions and a steady hand. People trust you to sort things out. Reversed, work-life imbalance.',
    spirit:
      'Hearth and kitchen witchcraft; herbalism; caring for the earth. The body as sacred. Cook something with intention, tend your houseplants, feed the birds. Her rabbit is fertility and the quick life of the garden; welcome it.',
    question: 'How do you care for others, and who cares for you?',
  },
  'pentacles-14': {
    words: ['abundance', 'security', 'success'],
    image:
      'A king sits on a throne carved with bulls’ heads, in a garden full of vines, with a castle behind him. His robe is embroidered with grapes and vine leaves. He holds a sceptre in one hand and a pentacle in the other. Waite notes the bull’s head as a recurrent symbol on the throne.',
    upright:
      'The King of Pentacles is material mastery: wealth, security, business sense and the generosity that comes with them. Waite gives valour, realising intelligence, business and normal intellectual aptitude, sometimes mathematical gifts, and success in these paths. Upright, use your resources well, and share them.',
    reversed:
      'Reversed, wealth becomes greed or stubbornness. It can mean materialism, corruption, or financial mismanagement. Waite gives vice, weakness, ugliness, perversity, corruption and peril. Remember what wealth is for.',
    correspondences:
      'King: air of earth, in the mapping most readers use: the mind that plans and manages the material world. ' + COURT_NOTE,
    love:
      'A secure, generous, reliable partner, who shows love by providing and protecting. Reversed, someone who values money over people.',
    work:
      'Business success, financial security, leadership in practical matters. Sound investments, a good head for numbers, and patience. Reversed, greed, or poor financial decisions.',
    spirit:
      'Prosperity magic; honouring the earth; stewardship. Gratitude for abundance, and sharing it. Work with the land spirits of the place you live, and give back some of what it gives you.',
    question: 'What does wealth mean to you, and what is it for?',
  },
};
