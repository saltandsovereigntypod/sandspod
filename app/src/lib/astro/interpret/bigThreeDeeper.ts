// Further Detailed text for the Sun, Moon, Ascendant and Midheaven in each
// sign (the big three and the top of the chart), added after owner feedback
// that these cards were too short at the Detailed level. Each reading gains
// two paragraphs: the sign as the traditional astrologers set it out (element,
// mode, rulers, dignity, and for the Ascendant the part of the body) and what
// the placement tends to look like in a life; and a fuller craft text (days,
// hours, seasons and the element's work). The registry joins them on; the
// Simple text is unchanged.
//
// Sources for the traditional scheme: Ptolemy, Tetrabiblos I; Vettius Valens,
// Anthology I; William Lilly, Christian Astrology (1647). Season dates are the
// usual tropical ones and shift by a day from year to year.

import { TRADITIONAL_RULER, type Classical, type ZodiacSign } from '../signs.ts';
import type { Interpretation } from './types.ts';

type Fact = { element: 'fire' | 'earth' | 'air' | 'water'; mode: 'cardinal' | 'fixed' | 'mutable'; body: string; season: string };

const FACTS: Record<ZodiacSign, Fact> = {
  Aries: { element: 'fire', mode: 'cardinal', body: 'head and face', season: 'about 21 March to 19 April' },
  Taurus: { element: 'earth', mode: 'fixed', body: 'throat and neck', season: 'about 20 April to 20 May' },
  Gemini: { element: 'air', mode: 'mutable', body: 'shoulders, arms, hands and lungs', season: 'about 21 May to 20 June' },
  Cancer: { element: 'water', mode: 'cardinal', body: 'breast and stomach', season: 'about 21 June to 22 July' },
  Leo: { element: 'fire', mode: 'fixed', body: 'heart, spine and back', season: 'about 23 July to 22 August' },
  Virgo: { element: 'earth', mode: 'mutable', body: 'belly and digestion', season: 'about 23 August to 22 September' },
  Libra: { element: 'air', mode: 'cardinal', body: 'kidneys and lower back', season: 'about 23 September to 22 October' },
  Scorpio: { element: 'water', mode: 'fixed', body: 'genitals and the organs of elimination', season: 'about 23 October to 21 November' },
  Sagittarius: { element: 'fire', mode: 'mutable', body: 'hips and thighs', season: 'about 22 November to 21 December' },
  Capricorn: { element: 'earth', mode: 'cardinal', body: 'knees, bones and skin', season: 'about 22 December to 19 January' },
  Aquarius: { element: 'air', mode: 'fixed', body: 'calves, ankles and circulation', season: 'about 20 January to 18 February' },
  Pisces: { element: 'water', mode: 'mutable', body: 'feet', season: 'about 19 February to 20 March' },
};

const QUALITIES: Record<Fact['element'], string> = {
  fire: 'hot and dry in the old physics of the four elements, and counted masculine and diurnal (of the day)',
  earth: 'cold and dry in the old physics of the four elements, and counted feminine and nocturnal (of the night)',
  air: 'hot and moist in the old physics of the four elements, and counted masculine and diurnal (of the day)',
  water: 'cold and moist in the old physics of the four elements, and counted feminine and nocturnal (of the night)',
};

const MODE: Record<Fact['mode'], string> = {
  cardinal: 'As a cardinal sign it begins a season, and its way is to start things',
  fixed: 'As a fixed sign it holds a season at its height, and its way is to keep and sustain',
  mutable: 'As a mutable sign it ends a season and bridges into the next, and its way is to adapt',
};

const ELEMENT_WORK: Record<Fact['element'], string> = {
  fire: 'Your element is fire: candles, hearth and bonfire, sunlight and courage work suit you, and you can call fire first when you cast a circle.',
  earth: 'Your element is earth: herbs, stones, salt, soil, gardens and slow, physical workings suit you, and you can call earth first when you cast a circle.',
  air: 'Your element is air: incense, breath, words, song, sigils and divination suit you, and you can call air first when you cast a circle.',
  water: 'Your element is water: moon water, bathing, scrying, tears and tides suit you, and you can call water first when you cast a circle.',
};

const DAY: Record<Classical, string> = { Sun: 'Sunday', Moon: 'Monday', Mercury: 'Wednesday', Venus: 'Friday', Mars: 'Tuesday', Jupiter: 'Thursday', Saturn: 'Saturday' };

/** A planet's dignity by sign, for the Sun and the Moon. */
const DIGNITY: Partial<Record<'Sun' | 'Moon', Partial<Record<ZodiacSign, string>>>> = {
  Sun: {
    Leo: 'The Sun rules Leo, so here it is in its own sign (domicile): at home, strong and free to act as itself.',
    Aries: 'The Sun is exalted in Aries, the sign of the spring equinox, where the light returns: honoured and lifted up, if sometimes a little too bright.',
    Aquarius: 'Aquarius is opposite Leo, so the Sun is in its detriment here: not weak, but working in a sign that values the group over the single shining self.',
    Libra: 'The Sun is in its fall in Libra, the sign of the autumn equinox where the days shorten: the self is found through others and has to learn to stand on its own.',
  },
  Moon: {
    Cancer: 'The Moon rules Cancer, so here it is in its own sign (domicile): at home, comfortable and deeply responsive.',
    Taurus: 'The Moon is exalted in Taurus, where she is honoured: feelings are steady, sensual and slow to be shaken.',
    Capricorn: 'Capricorn is opposite Cancer, so the Moon is in its detriment here: feelings are real but kept under control and expressed through duty.',
    Scorpio: 'The Moon is in its fall in Scorpio: feelings run deep and intense, and safety is hard won.',
  },
};

/** What each placement tends to look like in a life: one handwritten paragraph per sign. */
const LIFE: Record<'Sun' | 'Moon' | 'Ascendant' | 'Midheaven', Record<ZodiacSign, string>> = {
  Sun: {
    Aries: 'In a life, an Aries Sun often shows as the person who volunteers first, starts the business, takes up the new sport or moves to the new city. Work goes best with clear challenges, competition or independence, and boredom is the real enemy. In love you are frank and ardent, and you need a partner who can match your pace without trying to rein you in. Under stress you push harder; rest, and the slow middle of projects, are the skills to learn.',
    Taurus: 'In a life, a Taurus Sun often shows as someone who builds a home, a garden, a savings pot or a body of craft slowly and well. Work goes best with tangible results and fair, steady pay, and you are often skilled with your hands, voice or senses. In love you are loyal, physical and patient, and you show care through food, comfort and constancy. Under stress you dig in; the skill to learn is letting change in before it is forced on you.',
    Gemini: 'In a life, a Gemini Sun often shows as someone with several jobs, interests or friendship groups at once, who knows a little about everything and someone who knows the rest. Work goes best with variety, conversation, writing, teaching or trade. In love you need mental connection and play above all. Under stress you think faster and talk more; the skill to learn is staying with one thing, and one feeling, long enough to go deep.',
    Cancer: 'In a life, a Cancer Sun often shows as the person who looks after others, keeps the family together, remembers birthdays and makes any room a home. Work goes best where you can care, protect or nourish, and you are often more ambitious than you look. In love you are devoted and protective and need emotional safety in return. Under stress you withdraw into your shell; the skill to learn is asking for care as freely as you give it.',
    Leo: 'In a life, a Leo Sun often shows as someone who is generous, warm and visible, who leads, performs, creates or simply lights up a room. Work goes best where your heart and your name are in it and your effort is seen. In love you are loyal, romantic and wholehearted, and you need to be appreciated. Under stress you can become proud or dramatic; the skill to learn is shining without needing the audience.',
    Virgo: 'In a life, a Virgo Sun often shows as the person who notices what is wrong and quietly fixes it: the skilled worker, the editor, the healer, the one who makes systems run. Work goes best when you can be useful and improve things. In love you show care through practical help and attention to detail. Under stress you worry and criticise, yourself first; the skill to learn is accepting good enough, and resting.',
    Libra: 'In a life, a Libra Sun often shows as someone who brings people together, smooths conflict and has a strong eye for beauty and fairness. Work goes best in partnership and in fields of art, law, design, diplomacy or care for relationships. In love you are gracious and devoted to harmony. Under stress you may avoid choosing or please everyone; the skill to learn is knowing your own mind, and saying it.',
    Scorpio: 'In a life, a Scorpio Sun often shows as someone of real depth and intensity, drawn to what is hidden, difficult or true, and loyal to the bone. Work goes best in research, healing, crisis, finance, psychology or anything that needs nerve and discretion. In love you want total trust and give it in return. Under stress you can turn secretive or controlling; the skill to learn is letting go, and letting others in.',
    Sagittarius: 'In a life, a Sagittarius Sun often shows as the traveller, the student, the teacher or the believer, someone who needs a horizon to aim at. Work goes best with freedom, meaning and room to grow: teaching, publishing, law, travel, faith or the outdoors. In love you want a companion for the adventure. Under stress you may overpromise or run; the skill to learn is following through, and listening as much as preaching.',
    Capricorn: 'In a life, a Capricorn Sun often shows as someone who takes responsibility early, works steadily and gets better with age, often with a dry sense of humour. Work goes best with clear structure, long-term goals and real authority earned over time. In love you are serious, loyal and committed, and you show care through reliability. Under stress you work harder and feel more alone; the skill to learn is rest, play and asking for help.',
    Aquarius: 'In a life, an Aquarius Sun often shows as the independent thinker, the reformer or the friend to many, someone who belongs to groups and causes and still keeps their own counsel. Work goes best with ideas, technology, science, community or change. In love you need friendship and freedom inside the bond. Under stress you detach; the skill to learn is letting your heart be as involved as your principles.',
    Pisces: 'In a life, a Pisces Sun often shows as someone deeply imaginative, compassionate and sensitive to atmosphere, often drawn to art, music, healing or the spiritual life. Work goes best where you can serve, create or care, with room to dream. In love you are tender and devoted, sometimes to the point of losing yourself. Under stress you escape or drift; the skill to learn is boundaries, and the faith that your sensitivity is a strength.',
  },
  Moon: {
    Aries: 'In daily life, an Aries Moon needs action, independence and honesty to feel safe. You often had to stand up for yourself early. As a carer, parent or partner you are protective and energising rather than soft. Your body tends to show feelings as heat, restlessness or headaches, and exercise is the best medicine for your moods. You do well with homes and routines that leave room for spontaneity.',
    Taurus: 'In daily life, a Taurus Moon needs comfort, routine, good food and physical touch to feel safe, and dislikes sudden change. As a carer you are calm, steady and generous with practical comforts. Your body is closely tied to your moods: stress may show in the throat, appetite or a need to stay put. You do well with a settled home, a garden or a craft, and time in nature.',
    Gemini: 'In daily life, a Gemini Moon needs conversation, variety and information to feel safe, and calms down by talking or writing things through. As a carer you are lively, funny and quick to explain. Your nerves are close to the surface, so overstimulation can show as restlessness or poor sleep. You do well with a home full of books and visitors, and a journal to think in.',
    Cancer: 'In daily life, a Cancer Moon needs belonging, a safe home and people to care for, and remembers every kindness and every hurt. As a carer you are naturally nurturing and protective. Your moods follow the Moon and the tides more than most, and your stomach often shows how you feel. You do well with a real home base, family or chosen family, and time near water.',
    Leo: 'In daily life, a Leo Moon needs warmth, appreciation and room to be generous, and feels safest when loved openly. As a carer you are affectionate, playful and proud of the people you look after. Hurt pride runs deep, and you may need to be told you matter. You do well with creative outlets, play, praise given and received, and a home you can be proud of.',
    Virgo: 'In daily life, a Virgo Moon needs order, usefulness and good routines to feel safe, and calms down by sorting, cleaning or helping. As a carer you show love through practical help and close attention. Worry tends to show in the gut and in sleep. You do well with healthy habits, clear lists, useful work and someone who notices what you do.',
    Libra: 'In daily life, a Libra Moon needs harmony, beauty and good company to feel safe, and is unsettled by conflict and ugliness. As a carer you are gentle, tactful and fair. You may put others\' moods before your own until you are not sure what you feel. You do well with a beautiful home, a close partner, and time alone to check in with yourself.',
    Scorpio: 'In daily life, a Scorpio Moon needs trust, privacy and depth to feel safe, and feels everything strongly while showing little. As a carer you are fiercely loyal and protective. Old hurts can be held for a long time, and you may test people before you let them in. You do well with honest, intense bonds, privacy, and ways to let feelings out such as journalling, therapy or ritual.',
    Sagittarius: 'In daily life, a Sagittarius Moon needs freedom, meaning and something to look forward to, and calms down by moving, travelling or finding the bigger picture. As a carer you are encouraging, funny and generous. You may hurry past hard feelings with optimism. You do well with open space, adventure, a faith or philosophy that holds you, and people who give you room.',
    Capricorn: 'In daily life, a Capricorn Moon needs structure, competence and a sense of control to feel safe, and often grew up quickly. As a carer you are dependable and protective, showing love by providing. Feelings are kept in check and may come out as tiredness or stiffness. You do well with clear goals, respect, time-honoured routines and permission to rest and be looked after.',
    Aquarius: 'In daily life, an Aquarius Moon needs space, friendship and freedom to be different to feel safe, and calms down by thinking a feeling through. As a carer you are kind, fair and unconventional, treating children and partners as equals. You may seem cool while feeling a great deal. You do well with good friends, groups and causes, and a home that lets you be yourself.',
    Pisces: 'In daily life, a Pisces Moon needs quiet, gentleness, imagination and spiritual nourishment to feel safe, and absorbs the moods around you like a sponge. As a carer you are tender, intuitive and endlessly patient. You may need more sleep and solitude than others, and you feel the weather of a room at once. You do well with music, art, water, prayer or meditation, and firm, kind boundaries.',
  },
  Ascendant: {
    Aries: 'In a life, Aries rising often shows as someone who seems younger and more energetic than their years, quick to stand up, speak out and start. People read you as confident, sometimes as combative. Your path often involves learning to lead well and to finish what you begin. The body tends to run warm and fast, and old texts linked Aries rising with marks or knocks to the head and face.',
    Taurus: 'In a life, Taurus rising often shows as a calm, pleasing presence, a good voice or a strong, sturdy build, and an unhurried way of moving. People read you as reliable and kind, sometimes as stubborn. Your path often involves building security and learning when to change. Old texts linked Taurus rising with the throat and neck, and many with this rising sing or speak well.',
    Gemini: 'In a life, Gemini rising often shows as a quick, lively, youthful manner, expressive hands and a ready flow of words. People read you as clever and friendly, sometimes as restless. Your path often involves learning, writing, travel and many connections. Old texts linked Gemini rising with the arms, hands and lungs, and many with it gesture as they talk.',
    Cancer: 'In a life, Cancer rising often shows as a soft, protective manner, an expressive or round face and a strong attachment to home and family. People read you as caring and approachable, sometimes as moody. Your path often involves building a home and learning to protect without shutting out. Old texts linked Cancer rising with the breast and stomach.',
    Leo: 'In a life, Leo rising often shows as a warm, dignified presence, a good head of hair or a striking bearing, and a natural sense of performance. People read you as confident and generous, sometimes as proud. Your path often involves leadership, creativity and learning to be seen for who you really are. Old texts linked Leo rising with the heart and back.',
    Virgo: 'In a life, Virgo rising often shows as a neat, modest, observant manner and a youthful look that lasts. People read you as capable and helpful, sometimes as reserved or critical. Your path often involves skill, service and finding the work that uses your eye for detail. Old texts linked Virgo rising with the belly and digestion, and many with it are thoughtful about food and health.',
    Libra: 'In a life, Libra rising often shows as a graceful, pleasant, well-balanced manner and a good sense of style. People read you as charming and fair, sometimes as indecisive. Your path often involves partnership, beauty and learning to choose for yourself. Old texts linked Libra rising with the kidneys and lower back.',
    Scorpio: 'In a life, Scorpio rising often shows as an intense, watchful presence and a magnetic gaze, with much kept private. People read you as powerful or mysterious, sometimes as guarded. Your path often involves transformation, depth and learning whom to trust. Old texts linked Scorpio rising with the reproductive and eliminating organs.',
    Sagittarius: 'In a life, Sagittarius rising often shows as an open, friendly, adventurous manner, often a tall or athletic build and a ready laugh. People read you as optimistic and honest, sometimes as blunt. Your path often involves travel, study, faith and learning to commit. Old texts linked Sagittarius rising with the hips and thighs.',
    Capricorn: 'In a life, Capricorn rising often shows as a composed, serious, competent manner, a good bone structure and a dry wit, and many with it look older when young and younger when old. People read you as responsible and capable, sometimes as cold. Your path often involves building something lasting and learning to lighten up. Old texts linked Capricorn rising with the knees, bones and skin.',
    Aquarius: 'In a life, Aquarius rising often shows as a friendly but slightly detached manner, an original style and a clear, distinctive look. People read you as unusual, independent and fair, sometimes as aloof. Your path often involves community, ideas and the freedom to be yourself. Old texts linked Aquarius rising with the calves, ankles and circulation.',
    Pisces: 'In a life, Pisces rising often shows as a gentle, dreamy, impressionable manner and soft, expressive eyes. People read you as kind and sensitive, sometimes as elusive. Your path often involves imagination, compassion, spirit and learning to protect your energy. Old texts linked Pisces rising with the feet, and many with it feel the ground through their soles.',
  },
  Midheaven: {
    Aries: 'In a life, an Aries Midheaven often shows as a career with independence and challenge: starting things, leading teams, physical, competitive or protective work, or being self-employed. You may change direction boldly, and you are known for initiative. The test is staying long enough to build a reputation as well as a spark.',
    Taurus: 'In a life, a Taurus Midheaven often shows as a career that builds slowly and lasts: finance, land, food, gardening, building, music, beauty or the crafts. You are known as dependable and good with resources. The test is not staying too long in a role that has stopped growing.',
    Gemini: 'In a life, a Gemini Midheaven often shows as a varied career with words at its heart: writing, teaching, media, sales, travel, translating or running two jobs at once. You are known as bright and versatile. The test is gathering the many threads into something people can recognise you by.',
    Cancer: 'In a life, a Cancer Midheaven often shows as a career in care, food, homes, property, history, family business or work with children. You may be known for looking after people, and your public life often follows the needs of your private one. The test is protecting your own home life from the demands of work.',
    Leo: 'In a life, a Leo Midheaven often shows as a career where you are seen: leadership, the arts and performance, teaching or work with children, or running your own show. You are known for warmth and flair. The test is leading from the heart rather than for the applause.',
    Virgo: 'In a life, a Virgo Midheaven often shows as a career built on skill and usefulness: health and healing, editing, analysis, crafts, administration or service. You are known as competent and careful. The test is letting yourself be seen for your work rather than hiding behind it.',
    Libra: 'In a life, a Libra Midheaven often shows as a career in partnership or with people and beauty: law, mediation, design, art, counselling, fashion or diplomacy. You are known as fair and gracious. The test is making firm decisions in public when not everyone will be pleased.',
    Scorpio: 'In a life, a Scorpio Midheaven often shows as a career in depth and transformation: research, investigation, psychology, medicine, crisis work, finance or the occult. You are known for intensity and discretion. The test is using power openly and well.',
    Sagittarius: 'In a life, a Sagittarius Midheaven often shows as a career with meaning and reach: teaching, publishing, law, travel, the outdoors, faith or work abroad. You are known for vision and honesty. The test is backing big ideals with steady, practical effort.',
    Capricorn: 'In a life, a Capricorn Midheaven often shows as a long career with real authority: management, institutions, government, building, or mastery of a demanding field. You are known as responsible and accomplished, often more so with age. The test is making sure ambition serves your life, not the other way round.',
    Aquarius: 'In a life, an Aquarius Midheaven often shows as an unusual or changing career in technology, science, community work, activism or innovation. You are known as original and principled. The test is staying with a calling long enough to change the system from within.',
    Pisces: 'In a life, a Pisces Midheaven often shows as a calling more than a career: the arts, music, healing, spiritual work, charity or caring for the vulnerable. You may be known for compassion or inspiration, and your path may take some time to name. The test is protecting your energy and giving your gifts a practical form.',
  },
};

type Body = keyof typeof LIFE;

/** The traditional paragraph for a body in a sign. */
function traditional(body: Body, sign: ZodiacSign): string {
  const f = FACTS[sign];
  const ruler = TRADITIONAL_RULER[sign];
  const base = `Traditionally ${sign} is a ${f.mode} ${f.element} sign, ${QUALITIES[f.element]}, ruled by ${ruler}. ${MODE[f.mode]}.`;
  if (body === 'Sun' || body === 'Moon') {
    const dignity = DIGNITY[body]?.[sign] ?? `The ${body} has no special dignity or debility in ${sign}, so the sign's ruler, ${ruler}, matters all the more: its sign, house and aspects show how well supported your ${body === 'Sun' ? 'sense of self' : 'emotional life'} is.`;
    return `${base} ${dignity} ${body === 'Sun' ? 'Traditional astrologers also asked whether you were born by day or by night: in a day chart the Sun is the light in charge (of the sect, as they said), and its sign speaks louder still.' : 'In a night chart the Moon is the light in charge (of the sect, as the old astrologers said), and her sign speaks louder still.'}`;
  }
  if (body === 'Ascendant') {
    return `${base} Traditional astrologers gave each sign a part of the body, and the rising sign was read for the body itself: ${sign} has the ${f.body}. ${ruler} is your chart ruler, and its condition matters as much as the sign: in its own sign or exaltation, in an angular house, or helped by Venus or Jupiter, it gives an easy path; in its detriment or fall, or pressed by hard aspects from Mars or Saturn, it gives a path that asks more effort and builds more strength.`;
  }
  return `${base} The Midheaven's ruler, ${ruler}, shows by sign and house where your calling finds its work, and planets near the Midheaven describe your public life most directly. In whole sign houses the Midheaven can fall in the ninth or eleventh house; it still describes vocation and reputation.`;
}

/** The fuller craft text for a body in a sign. */
function craft(body: Body, sign: ZodiacSign): string {
  const f = FACTS[sign];
  const ruler = TRADITIONAL_RULER[sign];
  const who = body === 'Sun' ? 'your core self' : body === 'Moon' ? 'your feelings and your body\'s rhythms' : body === 'Ascendant' ? 'your body and your path' : 'your calling and public life';
  const when =
    body === 'Moon'
      ? `Each month the Moon passes through ${sign} for about two and a half days, around your lunar return: a good time to check in with how you feel and to renew your home and body.`
      : body === 'Sun'
        ? `${sign} season (${f.season}) holds your birthday and solar return, your strongest time of year for self-blessing and new intentions.`
        : body === 'Ascendant'
          ? `The days each month when the Moon crosses ${sign} light up your Ascendant: small acts of self-care and protection land well then.`
          : `Noon, when the Sun stands at its own midheaven, is the hour of the tenth house; work for your career then, or when the Moon is in ${sign}.`;
  return `For ${who}, ${ruler}'s day (${DAY[ruler]}) and ${ruler}'s planetary hours are natural times to work. ${when} ${ELEMENT_WORK[f.element]}`;
}

/** Join the further paragraphs and the fuller craft text onto a written reading. */
export function deepenBig(r: Interpretation, body: Body, sign: ZodiacSign): Interpretation {
  return {
    ...r,
    detailed: `${r.detailed}\n\n${traditional(body, sign)}\n\n${LIFE[body][sign]}`,
    magicDetailed: `${r.magicDetailed ?? r.magic} ${craft(body, sign)}`,
  };
}
