/* Built by scripts/build-core.mjs from app/src/lib (scripts/core/astro-course.ts). Do not edit. */ window.SaltCore = window.SaltCore || {};
var SaltCore=SaltCore||{};SaltCore["astro-course"]=(()=>{var R=Object.defineProperty;var we=Object.getOwnPropertyDescriptor;var be=Object.getOwnPropertyNames;var ve=Object.prototype.hasOwnProperty;var T=(e,t)=>{for(var s in t)R(e,s,{get:t[s],enumerable:!0})},ke=(e,t,s,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of be(t))!ve.call(e,r)&&r!==s&&R(e,r,{get:()=>t[r],enumerable:!(n=we(t,r))||n.enumerable});return e};var Te=e=>ke(R({},"__esModule",{value:!0}),e);var vt={};T(vt,{course:()=>q,lesson:()=>E,progress:()=>I,quiz:()=>z});var q={};T(q,{ALL_LESSONS:()=>f,CHAPTERS:()=>m,COURSE_HREF:()=>Ie,COURSE_ID:()=>S,COURSE_TITLE:()=>Ae,PLANET_GUIDES:()=>le,astroLinkAppHref:()=>Le,astroLinkLabel:()=>Pe,astroLinkSiteHref:()=>ze,astroPage:()=>C,chapterById:()=>xe,chapterOfLesson:()=>he,lessonAppHref:()=>We,lessonById:()=>Me,lessonPlace:()=>qe,lessonSiteHref:()=>Re,nextLesson:()=>Ce,quizAppHref:()=>Ee,quizSiteHref:()=>Ne});var M={calendar:{label:"Calendars and holy days",app:"/today/calendar",site:"/today/calendar/"},moon:{label:"The moon tonight",app:"/today/sky",site:"/today/sky/"},grimoire:{label:"Your Grimoire",app:"/grimoire",site:"/grimoire/"},library:{label:"The Living Library",app:"/more/library",site:"/library/"},"closed-guide":{label:"Closed & living traditions",app:"/more/library/closed",site:"/library/closed/"},premade:{label:"Ready-made rituals and spells",app:"/rituals/premade",site:"/rituals/premade/"},planner:{label:"The ritual planner",app:"/rituals/planner",site:"/rituals/planner/"},spell:{label:"Write a spell",app:"/rituals/spell",site:"/rituals/spell/"},journal:{label:"Your ritual journal",app:"/rituals/journal",site:"/rituals/journal/"},journeys:{label:"Dedication journeys",app:"/rituals/journeys",site:"/rituals/journeys/"},divination:{label:"Divination",app:"/rituals/divination",site:"/divination/"},runes:{label:"Rune meanings",app:"/rituals/divination/meanings?kind=runes",site:"/divination/runes/"},"community-rituals":{label:"Community Rituals",app:"/rituals/community",site:"/rituals/community/"},cycle:{label:"Cycle & Moon",app:"/rituals/cycle",site:"/rituals/cycle/"},patron:{label:"Your deities (patron settings)",app:"/more/settings/deities",site:"/more/settings/deities/"},altar:{label:"Your altar",app:"/altar",site:"/altar/"},practice:{label:"Craft: cycle, astrology, divination and tools for every path",app:"/rituals/craft",site:"/practice/"},"green-season":{label:"The green witch\u2019s season",app:"/rituals/craft/green/season",site:"/practice/green/season/"},"folk-calendar":{label:"The folk calendar",app:"/rituals/craft/folk/calendar",site:"/practice/folk/calendar/"},ancestors:{label:"Your ancestors",app:"/rituals/craft/hedge/ancestors",site:"/practice/hedge/ancestors/"}},O={rituals:{label:"The coven\u2019s rituals and ritual builder",app:"rituals",tab:"rituals"},"ritual-builder":{label:"Plan a coven ritual (the ritual builder)",app:"ritual/plan",tab:"rituals"},book:{label:"The coven\u2019s Book of Shadows",app:"book",tab:"book"},altar:{label:"The coven\u2019s altars",app:"altar",tab:"altar"},gathering:{label:"The coven\u2019s messages",app:"gathering",tab:"gathering"},petitions:{label:"The coven\u2019s petitions",app:"petitions",tab:"petitions"},standing:{label:"Your standing and the coven\u2019s agreements",app:"standing",tab:"path"},members:{label:"The coven\u2019s members",app:"members",tab:"members"},programs:{label:"Initiation & training",app:"programs",tab:"programs"},record:{label:"The members\u2019 record",app:"record",tab:"record"},manage:{label:"Manage the coven",app:"manage",tab:"manage"},lineage:{label:"Daughter covens",app:"lineage",tab:"lineage"}},Se={holy:"Holy day",library:"Library",closed:"Closed & living traditions",premade:"Ritual",journey:"Journey",spread:"Spread",seasonal:"Seasonal drawer",page:"",coven:""},N=e=>e.replace(/[_-]+/g," ").replace(/\s+/g," ").trim(),$=e=>e&&e[0].toUpperCase()+e.slice(1);function j(e){let t=e.includes("/")?e.replace("/","-"):e;return t.startsWith("wheel_south-")?`wheel-${t.slice(12)}`:t}function F(e){var s,n,r,o,i,h;if((s=e.label)!=null&&s.trim())return e.label.trim();if(e.kind==="page")return(r=(n=M[e.id])==null?void 0:n.label)!=null?r:$(N(e.id));if(e.kind==="coven")return(i=(o=O[e.id])==null?void 0:o.label)!=null?i:$(N(e.id));if(e.kind==="closed"&&!e.id)return M["closed-guide"].label;let t=e.kind==="library"?(h=e.id.split(":").pop())!=null?h:e.id:e.kind==="holy"?j(e.id).replace(/^[a-z_]+-/,""):e.id;return`${Se[e.kind]}: ${$(N(t))}`}var p=encodeURIComponent;function B(e,t){var n,r;let s=e.id;switch(e.kind){case"holy":return`/today/holy/${p(j(s))}`;case"library":return`/more/library/${p(s)}`;case"closed":return s?`/more/library/closed/${p(s)}`:"/more/library/closed";case"premade":return`/rituals/premade/${p(s)}`;case"journey":return`/rituals/journeys/${p(s)}`;case"spread":return`/rituals/divination/draw?spread=${p(s)}`;case"seasonal":return"/altar";case"page":return(r=(n=M[s])==null?void 0:n.app)!=null?r:null;case"coven":{let o=O[s];return o&&t?`/coven/c/${p(t)}/${o.app}`:null}}return null}function G(e,t){var n,r;let s=e.id;switch(e.kind){case"holy":return`/today/holy/?ref=${p(j(s))}`;case"library":{let[o,i,h]=s.split(":");return o==="traditional"&&i&&h?`/library/entry/?entity=${p(`traditional/${i}/${h.split(".")[0]}`)}`:"/library/"}case"closed":return s?`/library/closed/?id=${p(s)}`:"/library/closed/";case"premade":return`/rituals/premade/?id=${p(s)}`;case"journey":return`/rituals/journeys/?id=${p(s)}`;case"spread":return`/divination/draw/?spread=${p(s)}`;case"seasonal":return"/altar/";case"page":return(r=(n=M[s])==null?void 0:n.site)!=null?r:null;case"coven":{let o=O[s];return o&&t?t(o.tab):null}}return null}var a=(e,t)=>({kind:"astro",id:e,...t?{label:t}:{}}),d=(e,t)=>({kind:"library",id:`traditional:${e}:${t}`}),c=e=>({kind:"premade",id:e}),H=e=>({kind:"holy",id:e}),y=e=>({kind:"page",id:e});var J={id:"basics",title:"What astrology is",summary:"What astrology is and is not, where it came from, and how to learn it with this course.",lessons:[{id:"astro-basics-what-it-is",title:"The sky as a language",summary:"Astrology reads the positions of the Sun, Moon and planets as a symbolic language for life on earth.",minutes:6,terms:["natal-chart","zodiac","sun","moon"],links:[a("learn"),a("charts")],body:`## A language, not a sentence

Astrology is the practice of reading the sky as a set of symbols. The Sun, the Moon and the planets move through the same band of sky, and for thousands of years people have watched where they are and asked what they mean. "As above, so below" is the old phrase: the sky and life on earth are read as reflections of each other.

The most familiar tool is the **birth chart** (or natal chart): a map of the sky at the moment and place you were born. It shows where each planet was, against which sign of the zodiac, and in which part of the sky, the houses.

## What it does well

Used well, astrology is a language for reflection. It gives you words for parts of yourself (your drive, your need for comfort, how you love) and a sense of timing: seasons in a life, as there are in a year.

- It is a **mirror**: a way of noticing yourself.
- It is a **calendar**: a way of choosing good times, which is how witches have used it for centuries.
- It is a **story**: a shared vocabulary of myth that makes life feel meaningful.

## What it is not

It is not destiny. Nothing in a chart forces anything to happen, and no honest astrologer can tell you the day you will meet your partner. Throughout this course and the whole app, readings say "traditionally", "many astrologers read" and "tends to", because that is what they are: traditional meanings, offered for you to test against your life.

> **Note:** If a reading ever frightens you, set it down. Astrology is a tool for knowing yourself, never a reason to fear the future.

## How the course works

There are twelve chapters. Each has a few short lessons and a quiz at the end. Every underlined word in the app opens its glossary entry, and every reading has a Simple version (a sentence or two) and a Detailed one. If you have saved your own birth chart, many lessons will show you the lesson's subject in your chart.`},{id:"astro-basics-history",title:"An honest history",summary:"From Babylonian omens to Hellenistic horoscopes, medieval scholars, the scientific revolution and the modern revival.",minutes:8,terms:["tropical","precession","house-systems","lots"],links:[a("learn")],body:`## Omens in Mesopotamia

The oldest astrology we know is Babylonian. From around 1800 BCE scribes recorded omens: if Venus appears in such a month, the harvest will be good. The tablets called *En\u016Bma Anu Enlil* collect thousands of them. This was astrology for kings and kingdoms, not individuals. By the fifth century BCE Babylonian astronomers had divided the Sun's path into twelve equal signs, and the first birth charts for private people appear soon after.

## The Hellenistic horoscope

After Alexander's conquests, Babylonian astronomy met Greek philosophy and Egyptian temple lore, mostly in Alexandria. Between about the second century BCE and the second century CE, the system most astrology still uses took shape: the twelve signs, the seven planets as rulers, the houses counted from the rising sign (the *h\u014Droskopos*, "hour-marker", which gives us the word horoscope), aspects, and lots such as the Part of Fortune. Writers such as Dorotheus, Ptolemy (*Tetrabiblos*) and Vettius Valens left manuals that are still read.

## Persia, the Islamic world and Europe

Astrology travelled east to India, where it grew into Jyoti\u1E63a, and through Persian and Arabic scholars such as M\u0101sh\u0101'all\u0101h, Ab\u016B Ma'shar and al-B\u012Br\u016Bn\u012B, who refined it alongside real astronomy. Their books reached medieval Europe in Latin translation. For centuries astrology was taught in universities beside medicine, and doctors timed treatments by the Moon.

## Decline and revival

After the seventeenth century, as Copernicus, Kepler and Newton changed astronomy, educated Europe dropped astrology. It survived in almanacs and folk practice, then revived in the late nineteenth century with Theosophy and writers such as Alan Leo, who made it about character. In the twentieth century, psychological astrology (Dane Rudhyar, Liz Greene) and Sun-sign columns made it popular again; from the 1990s, translators recovered the older Hellenistic and medieval methods.

## The honest question

Does it work? Controlled studies have not found that astrology predicts personality or events better than chance. Many astrologers today see it not as a physical influence of planets but as a symbolic system, a language of meaning, much as tarot is. You can practise it fully in that spirit. This course teaches the tradition as it is, says where schools differ, and leaves the belief to you.`},{id:"astro-basics-how-to-learn",title:"How to learn it",summary:"A simple path through the course, the glossary and your own chart, with a journal to keep as you go.",minutes:5,terms:["big-three","natal-chart"],links:[a("charts","Add or open your birth chart"),a("learn","The glossary"),{kind:"page",id:"grimoire"}],yourChart:"big-three",body:`## The path

Astrology is a language, and languages are learned in layers. This course goes in the order most teachers use:

1. **The sky**: what is actually up there, and how the zodiac is measured.
2. **The planets**: the actors, what each one wants.
3. **The signs**: the costumes and moods they wear.
4. **The houses**: the stages, the areas of life.
5. **The aspects**: the conversations between planets.
6. **Reading a chart**: putting it together, step by step.
7. **Deeper tools**: dignities, transits, progressions and returns.
8. **The Moon and magic**: timing your craft by the sky.

## Your own chart

Nothing teaches astrology like your own chart. If you have your birth date, time and place, add your chart under Charts; the course will then show you, lesson by lesson, what the lesson means for you. Without a time, you can still learn the planets and signs; the houses and the rising sign need the time.

> **Try this:** Start an astrology section in your Grimoire or journal. After each lesson, write one sentence about how it shows in your life, or doesn't. Your own observations are the heart of learning astrology.

## A word on "Simple" and "Detailed"

Every reading in the app has two depths. Simple is for a glance. Detailed adds the history, the traditions and the craft. You can switch everywhere at once in the glossary, or flip any one card.`}],quiz:{id:"quiz-astro-basics",title:"What astrology is",intro:"Six questions on what astrology is, its history and how this course approaches it.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"What is a birth chart?",options:["A forecast of your life","A map of the sky at the moment and place you were born","A list of your personality traits","A calendar of lucky days"],correct:[1],points:1,explanation:"A birth (natal) chart is a map of where the Sun, Moon and planets were, by sign and house, at your birth."},{id:"q2",type:"single",prompt:'Where does the word "horoscope" come from?',options:['The Greek h\u014Droskopos, "hour-marker", the rising sign','The Latin horror, "fear"',"An Egyptian god","A medieval calendar"],correct:[0],points:1,explanation:"Hellenistic astrologers called the rising degree the h\u014Droskopos, the marker of the hour."},{id:"q3",type:"truefalse",prompt:"In this course, a reading tells you what will definitely happen.",options:["True","False"],correct:[1],points:1,explanation:"Readings are traditional meanings for reflection, never destiny."},{id:"q4",type:"single",prompt:"Who first divided the Sun's path into twelve equal signs?",options:["Medieval European monks","Babylonian astronomers","Victorian Theosophists","Isaac Newton"],correct:[1],points:1,explanation:"By around the fifth century BCE Babylonian astronomers used twelve equal signs of 30\xB0."},{id:"q5",type:"multi",prompt:"Which are good uses of astrology as this course teaches it? Choose all that fit.",options:["A mirror for self-reflection","Choosing times for magic","Deciding someone is a bad person because of their sign","A shared language of myth and meaning"],correct:[0,1,3],points:1,explanation:"Astrology works as a mirror, a calendar and a story. Judging people by their sign is not a use the tradition supports."},{id:"q6",type:"single",prompt:"What have controlled scientific studies generally found?",options:["That planets physically shape personality","That astrology predicts events reliably","No evidence that astrology predicts better than chance","That only the Moon matters"],correct:[2],points:1,explanation:"Honestly said: studies have not found predictive power. Many astrologers practise it as a symbolic language instead."}]}},U={id:"sky",title:"The sky and the ecliptic",summary:"What is really up there: the ecliptic, the zodiac, the two zodiacs, and how a chart maps the sky around you.",lessons:[{id:"astro-sky-ecliptic",title:"The ecliptic and the zodiac",summary:"The Sun's yearly path, the band of sky the planets travel, and the twelve signs that measure it.",minutes:6,terms:["ecliptic","zodiac","degree","solstice-equinox"],links:[a("sky","The sky today")],body:`## The Sun's road

As the Earth goes round the Sun, the Sun seems to move against the background stars, a little under a degree a day, all the way round in a year. Its path is called the **ecliptic** (because eclipses happen on it). The Moon and the planets all travel close to the same path, within a few degrees, because the solar system is roughly flat.

## Twelve signs

The band of sky either side of the ecliptic is the **zodiac**. Astrologers divide it into twelve equal parts of 30\xB0, the signs, starting from the point where the Sun crosses the celestial equator in spring (the March equinox in the north): 0\xB0 Aries.

- Aries, Taurus, Gemini: spring (in the northern hemisphere)
- Cancer, Leo, Virgo: summer
- Libra, Scorpio, Sagittarius: autumn
- Capricorn, Aquarius, Pisces: winter

The solstices and equinoxes fall at 0\xB0 of Aries, Cancer, Libra and Capricorn, the four cardinal signs.

## Degrees

Each sign has 30 degrees (0\xB0 to 29\xB0), each degree 60 minutes. "Venus at 14\xB0 Scorpio" means Venus is 14 degrees into the sign of Scorpio: 224\xB0 round from 0\xB0 Aries.

> **Try this:** Open The sky today and find which sign the Sun is in now. Then work out roughly when it will move into the next sign: a month for each sign.`},{id:"astro-sky-two-zodiacs",title:"Two zodiacs: tropical and sidereal",summary:"Why the signs no longer match the constellations, and what astrologers do about it.",minutes:6,terms:["tropical","sidereal","precession","ayanamsa","lahiri"],links:[a("learn")],body:`## The wobble

The Earth's axis wobbles slowly, like a spinning top, once every 25,800 years or so. Because of this **precession**, the point of the spring equinox drifts backwards against the stars about one degree every 72 years.

When the Hellenistic astrologers fixed the zodiac, the signs and the constellations of the same names roughly lined up. Today they are about 24\xB0 apart: the Sun is "in Aries" by season while it stands in front of the stars of Pisces.

## Two answers

- The **tropical zodiac** ties the signs to the seasons: 0\xB0 Aries is always the spring equinox. Most Western astrology uses it, and so does this app by default. Its signs are about the year's light and season, not the stars behind.
- The **sidereal zodiac** ties the signs to the stars. Indian Jyoti\u1E63a and some Western astrologers use it, subtracting the gap, the **ayanamsa**. The most common value is Lahiri's.

Neither is wrong; they measure different things. If your Sun is in the last few weeks of a sign, it may be in the sign before it sidereally.

> **Note:** The thirteenth constellation, Ophiuchus, sometimes makes the news. The signs are equal divisions of the ecliptic, not the constellations, so it is not part of either zodiac.

You can switch your charts to sidereal in their settings, if you want to compare.`},{id:"astro-sky-chart-map",title:"The chart as a map of your sky",summary:"The horizon and the meridian, the four angles, and how to read the wheel.",minutes:7,terms:["ascendant","descendant","midheaven","imum-coeli","houses"],links:[a("chart","Open your chart wheel")],yourChart:"big-three",body:`## Standing at your birthplace

Imagine standing where you were born, at the moment you were born. The sky turns around you once a day. A chart freezes that moment and draws it as a wheel.

- The **horizon** runs left to right across the middle. The left end is east: the degree of the zodiac rising there is the **Ascendant**. The right end is west: the **Descendant**, setting.
- The **meridian** runs up and down. The top is the **Midheaven** (MC, *medium coeli*), the point of the zodiac highest in the sky; the bottom is the **IC** (*imum coeli*), directly beneath you.

These four points are the **angles**. They move fast (the whole zodiac rises in a day, a new sign about every two hours), which is why the birth time matters.

## Reading the wheel

The wheel is drawn as if you were facing south (in the northern hemisphere): east on the left, the Sun rising there and climbing over the top to set on the right. So:

- A planet near the left edge was rising when you were born.
- A planet near the top was overhead.
- Planets in the lower half were below the horizon, out of sight.

The circle is cut into twelve **houses**, starting at the Ascendant and going anticlockwise beneath the horizon: houses 1 to 6 below, 7 to 12 above.

> **Try this:** Open your chart wheel and find your Ascendant on the left. Which planets were above the horizon when you were born?`}],quiz:{id:"quiz-astro-sky",title:"The sky and the ecliptic",intro:"Six questions on the ecliptic, the zodiacs and the angles.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"What is the ecliptic?",options:["The Moon's orbit","The Sun's apparent yearly path across the stars","The horizon","A kind of eclipse"],correct:[1],points:1,explanation:"The ecliptic is the Sun's path, and the planets move close to it."},{id:"q2",type:"single",prompt:"How many degrees does each sign contain?",options:["12","24","30","45"],correct:[2],points:1,explanation:"Twelve signs of 30\xB0 make the 360\xB0 circle."},{id:"q3",type:"single",prompt:"The tropical zodiac begins at\u2026",options:["The star Aldebaran","The March (spring) equinox","The winter solstice","Your birthday"],correct:[1],points:1,explanation:"Tropical 0\xB0 Aries is the Sun's position at the March equinox."},{id:"q4",type:"truefalse",prompt:"The tropical signs and the constellations of the same names line up today.",options:["True","False"],correct:[1],points:1,explanation:"Precession has moved them about 24\xB0 apart."},{id:"q5",type:"single",prompt:"Which point is rising on the eastern horizon at birth?",options:["The Midheaven","The IC","The Ascendant","The Descendant"],correct:[2],points:1,explanation:"The Ascendant is the degree rising in the east; the Descendant sets in the west."},{id:"q6",type:"single",prompt:"Why does the birth time matter so much?",options:["The planets move very fast","The angles and houses turn through the whole zodiac in a day","The Sun changes sign every hour","It doesn't matter"],correct:[1],points:1,explanation:"A new sign rises about every two hours, so the Ascendant and houses depend on the time."}]}},K={id:"planets",title:"The planets",summary:"The ten planets and the main points: what each one wants, how fast it moves, and what retrograde means.",lessons:[{id:"astro-planets-lights",title:"The lights: Sun and Moon",summary:"The two great lights of astrology: the self you are becoming, and the needs that keep you safe.",minutes:6,terms:["sun","moon","big-three","sect"],links:[a("planet:Sun","The Sun's guide"),a("planet:Moon","The Moon's guide"),d("crystal","citrine"),d("crystal","moonstone")],yourChart:"big-three",body:`## The Sun

The Sun is the centre of the solar system and, in most modern astrology, of the chart. It stands for **vitality, will and purpose**: the self you are growing into, what makes you feel alive. Its sign is your "star sign". It moves about a degree a day and takes a year to go round the zodiac.

Traditionally it rules Leo, is exalted in Aries, and is the light of the day: in a chart born by day, it leads.

## The Moon

The Moon moves fastest, about 13\xB0 a day, through every sign in under a month. It stands for **feelings, needs, instinct, the body and home**: what you need to feel safe, how you react before you think, how you care and want to be cared for. Many people recognise themselves more in their Moon sign than their Sun sign, especially at home.

It rules Cancer, is exalted in Taurus, and is the light of the night.

## Together

Sun and Moon are a pair in nearly every tradition: day and night, gold and silver, will and need. The relationship between them (their signs, and the phase of the Moon you were born under) is one of the first things an astrologer looks at.

> **Try this:** Read your Sun and Moon signs in the reading. Which one feels more like you on an ordinary Tuesday evening? Which one when you are doing something you love?`},{id:"astro-planets-personal",title:"Mercury, Venus and Mars",summary:"The personal planets: how you think, what you love, and how you go after what you want.",minutes:7,terms:["mercury","venus","mars","retrograde"],links:[a("planet:Mercury"),a("planet:Venus"),a("planet:Mars"),d("herb","lavender"),d("herb","rose"),d("herb","nettle")],yourChart:"planets",body:`## Mercury: the mind

Mercury is the messenger: **thinking, speech, learning, trade, travel and the hands**. Its sign shows how your mind works (fast or slow, broad or precise) and its house where you most use it. It is never more than 28\xB0 from the Sun, so it is always in your Sun sign or a neighbouring one. It rules Gemini and Virgo.

## Venus: what you love

Venus is **love, beauty, pleasure, harmony and value**, including money. Its sign shows what you find beautiful, how you show affection and what makes you feel valued. It stays within 47\xB0 of the Sun. It rules Taurus and Libra, and is exalted in Pisces. Traditionally it is the "lesser benefic", a planet of good fortune.

## Mars: how you act

Mars is **drive, courage, desire, anger and the body's energy**: how you go after what you want and how you defend yourself. Its sign shows your style of action and conflict. It takes about two years to go round the zodiac. It rules Aries and (traditionally) Scorpio, is exalted in Capricorn, and is the "lesser malefic": not evil, but sharp.

## The personal planets

With the Sun and Moon these are the **personal planets**: they move fast enough that their signs differ between people born weeks apart, so they describe you rather than your generation.

> **Try this:** Find your Mercury, Venus and Mars signs. Write one sentence for each: "I think\u2026", "I love\u2026", "I fight\u2026".`},{id:"astro-planets-social-outer",title:"Jupiter, Saturn and the outer planets",summary:"The social planets of growth and limit, and the three modern planets of change, dream and depth.",minutes:8,terms:["jupiter","saturn","uranus","neptune","pluto"],links:[a("planet:Jupiter"),a("planet:Saturn"),a("chart:placements","Your placements")],yourChart:"planets",body:`## Jupiter and Saturn: the social planets

**Jupiter** is growth, faith, generosity, wisdom and luck: the "greater benefic". It takes about twelve years to go round, a year in each sign, so its sign is shared with your school year. Its house shows where life tends to be generous to you. It rules Sagittarius and Pisces.

**Saturn** is structure, time, discipline, limits and maturity: the "greater malefic", though modern astrologers call it the teacher. It takes about 29 years to go round, two and a half years in each sign. Where Saturn is, you work hard, feel tested, and in the end become an authority. It rules Capricorn and Aquarius.

These two were the outermost planets the ancients could see, and between them they frame social life: expansion and contraction, hope and duty.

## The outer planets

Discovered with telescopes, the three outer planets move so slowly that whole generations share their signs. Their **house** and their **aspects** to your personal planets are what make them personal.

- **Uranus** (1781): change, freedom, invention and sudden awakenings. 84 years round. Modern ruler of Aquarius.
- **Neptune** (1846): dreams, spirit, compassion, art and illusion. About 165 years round. Modern ruler of Pisces.
- **Pluto** (1930): power, depth, death and rebirth. About 248 years round. Modern ruler of Scorpio. Astronomers reclassified it as a dwarf planet in 2006; astrologers still use it.

Traditional astrologers read only the seven visible planets; modern astrologers use all ten. This app shows both rulers wherever they differ.`},{id:"astro-planets-points-motion",title:"The points, and how planets move",summary:"The lunar nodes, Chiron, Lilith and the Part of Fortune; and retrograde motion, stations and shadows.",minutes:8,terms:["north-node","south-node","chiron","lilith","part-of-fortune","retrograde","station","shadow-period"],links:[a("chart:placements","Your placements"),a("sky","Retrogrades now"),{kind:"premade",id:"cosmic-mercury-retrograde-steadying"}],body:`## The points

Not everything in a chart is a planet.

- The **lunar nodes** are where the Moon's path crosses the ecliptic. Eclipses happen near them. The **North Node** is read as the direction of growth in this life; the **South Node**, always exactly opposite, as what comes easily and what to grow beyond. They move backwards through the zodiac in about 18.6 years.
- **Chiron** is a small body orbiting between Saturn and Uranus, discovered in 1977 and named for the wounded healer of Greek myth. It shows where you were hurt and how that becomes wisdom.
- **Lilith** (Black Moon Lilith) is the far point of the Moon's orbit: the wild, refused or exiled self.
- The **Part of Fortune** is the oldest of the Hellenistic lots, calculated from the Sun, Moon and Ascendant: the body, wellbeing and luck.

## Retrograde

Sometimes a planet seems to stop and move backwards against the stars for a few weeks or months. It isn't really reversing: the Earth is overtaking it (or it is overtaking us), as a car you pass on a motorway seems to drift backwards. This is **retrograde** motion.

- Before and after, the planet seems to stand still: a **station**.
- The stretch of zodiac it will retrace is the **shadow**: entered before the retrograde (pre-shadow) and left after (post-shadow).

Astrologers read a retrograde as a time to review, revisit and redo rather than begin. Mercury goes retrograde three or four times a year, which is why you hear about it most. A planet retrograde in a birth chart is often read as working inwardly, or in its own way.

> **Note:** A retrograde is not a curse. It is a season for the "re-" words: review, repair, return, rest.`}],quiz:{id:"quiz-astro-planets",title:"The planets",intro:"Seven questions on the planets, the points and retrograde motion.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"Which planet stands for feelings, needs and home?",options:["The Sun","The Moon","Mars","Saturn"],correct:[1],points:1,explanation:"The Moon is the body, needs, instincts and home."},{id:"q2",type:"single",prompt:'Which planet is traditionally called the "greater benefic"?',options:["Venus","Jupiter","Saturn","Mercury"],correct:[1],points:1,explanation:"Jupiter is the greater benefic; Venus the lesser."},{id:"q3",type:"single",prompt:"About how long does Saturn take to go round the zodiac?",options:["One year","Twelve years","29 years","84 years"],correct:[2],points:1,explanation:"About 29\xBD years, which is why the Saturn return comes in the late twenties."},{id:"q4",type:"multi",prompt:"Which are personal planets? Choose all.",options:["Mercury","Venus","Mars","Neptune"],correct:[0,1,2],points:1,explanation:"With the Sun and Moon, Mercury, Venus and Mars move fast enough to describe the individual. Neptune is generational."},{id:"q5",type:"single",prompt:"What causes retrograde motion?",options:["The planet reverses its orbit","The Earth and the planet overtaking one another","An eclipse","The Moon's nodes"],correct:[1],points:1,explanation:"It is an effect of viewpoint: one planet passing another."},{id:"q6",type:"single",prompt:"The North Node is read as\u2026",options:["Your past","The direction of growth in this life","Your career","Your wounds"],correct:[1],points:1,explanation:"The North Node points to growth; the South Node to what comes easily."},{id:"q7",type:"truefalse",prompt:"Traditional astrology uses Uranus, Neptune and Pluto as sign rulers.",options:["True","False"],correct:[1],points:1,explanation:"Traditional astrology uses the seven visible planets; the outer planets are modern additions."}]}};var Z={id:"signs",title:"Signs, elements and modalities",summary:"The twelve signs, built from four elements, three modalities and two polarities, and how a sign colours a planet.",lessons:[{id:"astro-signs-elements",title:"The four elements",summary:"Fire, earth, air and water: the oldest way of sorting the signs, and the one witches know best.",minutes:6,terms:["elements","fire","earth","air","water"],links:[a("chart:balance","Your balance of elements"),d("candle","red"),d("candle","green"),d("candle","yellow"),d("candle","blue")],yourChart:"elements",body:`## Four elements, three signs each

The signs go round the zodiac in the order fire, earth, air, water, three times:

- **Fire**: Aries, Leo, Sagittarius. Spirit, will, enthusiasm, inspiration.
- **Earth**: Taurus, Virgo, Capricorn. Body, matter, practicality, patience.
- **Air**: Gemini, Libra, Aquarius. Mind, speech, ideas, connection.
- **Water**: Cancer, Scorpio, Pisces. Feeling, memory, intuition, depth.

Signs of the same element are 120\xB0 apart (a trine), so they get on easily.

## The elements in a chart

Counting which elements your planets fall in gives a quick picture of temperament. Someone heavy in fire acts on enthusiasm; heavy in earth trusts what they can touch. An element with no planets at all is often noticed too: people tend to feel its lack, admire it in others, or work hard to build it.

This idea is very old: the four elements come from Empedocles, and Hellenistic astrologers paired them with the four humours of medicine (choleric fire, melancholic earth, sanguine air, phlegmatic water).

## In the craft

You already work with the elements when you call the quarters or choose a candle colour. A chart tells you which element is your home ground and which one to build deliberately.

> **Try this:** Open your chart's balance. Which element is strongest, and which is weakest? Choose one small practice this week for the weakest one: a bath for water, a walk for earth, a candle for fire, a journal page for air.`},{id:"astro-signs-modalities",title:"Modalities and polarity",summary:"Cardinal, fixed and mutable: how a sign moves. Yang and yin: whether it reaches out or draws in.",minutes:5,terms:["modalities","cardinal","fixed","mutable","polarity"],links:[a("chart:balance")],yourChart:"elements",body:`## Three ways of moving

Each element has one sign of each **modality** (also called quality or mode):

- **Cardinal** signs begin the seasons: Aries, Cancer, Libra, Capricorn. They start things, lead and act.
- **Fixed** signs hold the middle of each season: Taurus, Leo, Scorpio, Aquarius. They sustain, protect and persist.
- **Mutable** signs end the seasons and prepare the next: Gemini, Virgo, Sagittarius, Pisces. They adapt, learn and change.

Signs of the same modality are 90\xB0 or 180\xB0 apart, so they tend to clash: they want the same kind of thing in different elements.

## Two polarities

The signs alternate between two **polarities**:

- **Yang** (also called masculine, positive or active): the fire and air signs, which reach outward.
- **Yin** (also called feminine, negative or receptive): the earth and water signs, which draw inward.

These are traditional labels for energies, not genders: everyone has both.

## Building a sign

Every sign is a unique mix: Aries is cardinal fire and yang (the spark that begins); Taurus is fixed earth and yin (the field that holds); and so on. Once you know the elements and modalities, you can work out any sign's character from first principles.

> **Try this:** Work out Scorpio from its parts: fixed, water, yin. What would a sign like that be like? Then read its glossary entry.`},{id:"astro-signs-twelve",title:"The twelve signs, and a planet in a sign",summary:"A tour of the twelve, and the simple key to reading any placement: the planet is the verb, the sign the adverb.",minutes:9,terms:["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"],links:[a("chart:placements","Your placements"),a("chart:reading","Your reading")],yourChart:"planets",body:`## The twelve in brief

- **Aries** (cardinal fire, ruled by Mars): courage, beginnings, directness.
- **Taurus** (fixed earth, Venus): patience, the senses, steadiness.
- **Gemini** (mutable air, Mercury): curiosity, talk, versatility.
- **Cancer** (cardinal water, Moon): care, home, memory.
- **Leo** (fixed fire, Sun): warmth, creativity, pride.
- **Virgo** (mutable earth, Mercury): skill, service, discernment.
- **Libra** (cardinal air, Venus): balance, relationship, beauty.
- **Scorpio** (fixed water, Mars and modern Pluto): depth, intensity, transformation.
- **Sagittarius** (mutable fire, Jupiter): faith, adventure, meaning.
- **Capricorn** (cardinal earth, Saturn): ambition, structure, endurance.
- **Aquarius** (fixed air, Saturn and modern Uranus): ideals, community, independence.
- **Pisces** (mutable water, Jupiter and modern Neptune): compassion, imagination, surrender.

## Reading a planet in a sign

The simplest key in astrology:

- The **planet** is *what*: the part of you, the verb. Mars acts. Venus loves. Mercury thinks.
- The **sign** is *how*: the style, the adverb. Boldly in Aries, slowly in Taurus, curiously in Gemini.

So Mars in Taurus acts slowly and steadily, and is very hard to stop once moving. Venus in Gemini loves with curiosity and conversation. Mercury in Scorpio thinks deeply and keeps secrets.

Later chapters add the third part, the house: *where* in life it happens.

> **Try this:** For each planet in your chart, write a sentence with the planet as verb and the sign as adverb: "My Mars acts ___ ." Then check your reading to see how close you came.`}],quiz:{id:"quiz-astro-signs",title:"Signs, elements and modalities",intro:"Seven questions on the elements, modalities, polarities and signs.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"Which are the water signs?",options:["Aries, Leo, Sagittarius","Cancer, Scorpio, Pisces","Gemini, Libra, Aquarius","Taurus, Virgo, Capricorn"],correct:[1],points:1,explanation:"Cancer, Scorpio and Pisces are the water signs."},{id:"q2",type:"single",prompt:"Cardinal signs\u2026",options:["End the seasons","Begin the seasons","Hold the middle of the seasons","Have no season"],correct:[1],points:1,explanation:"Aries, Cancer, Libra and Capricorn begin the seasons at the equinoxes and solstices."},{id:"q3",type:"single",prompt:"Which sign is fixed fire?",options:["Aries","Leo","Sagittarius","Taurus"],correct:[1],points:1,explanation:"Leo is the fixed fire sign, ruled by the Sun."},{id:"q4",type:"single",prompt:'In "Mars in Taurus", what does Taurus tell you?',options:["Where in life Mars acts","How Mars acts: its style","When Mars was discovered","Which planet rules Mars"],correct:[1],points:1,explanation:'The sign is the style, the "how". The house is the "where".'},{id:"q5",type:"truefalse",prompt:"Yin and yang polarities in astrology describe a person's gender.",options:["True","False"],correct:[1],points:1,explanation:"They describe energies (outward or inward), and everyone has both."},{id:"q6",type:"single",prompt:"Which planet traditionally rules Capricorn?",options:["Jupiter","Mars","Saturn","Uranus"],correct:[2],points:1,explanation:"Saturn rules Capricorn (and, traditionally, Aquarius)."},{id:"q7",type:"single",prompt:"Signs of the same element are how far apart?",options:["30\xB0","60\xB0","90\xB0","120\xB0"],correct:[3],points:1,explanation:"Same-element signs are 120\xB0 apart: a trine."}]}},X={id:"houses",title:"The houses",summary:"The twelve areas of life, the angles that anchor them, and the house systems astrologers argue about.",lessons:[{id:"astro-houses-what",title:"What the houses are",summary:"The houses divide the sky around your birthplace into twelve stages of life.",minutes:6,terms:["houses","cusp","ascendant","midheaven"],links:[a("chart","Your chart wheel")],yourChart:"houses",body:`## Signs are the sky, houses are the earth

The signs divide the zodiac, which turns with the stars. The houses divide the sky around one place on earth at one moment, counting from the eastern horizon. A planet's sign tells you *how* it works; its house tells you *where* in life.

## Twelve stages

Starting at the Ascendant and going anticlockwise:

- Houses **1 to 3**: self, resources, the near world.
- Houses **4 to 6**: home, creativity, daily work and health.
- Houses **7 to 9**: partners, shared things, the wider world.
- Houses **10 to 12**: career, community, the hidden and the spiritual.

Each house starts at its **cusp**. The sign on the cusp colours the house, and that sign's ruler, wherever it sits, says more about it.

## Angular, succedent, cadent

- **Angular** houses (1, 4, 7, 10) begin at the four angles. Planets here are strong and visible.
- **Succedent** houses (2, 5, 8, 11) follow them: steady, accumulating.
- **Cadent** houses (3, 6, 9, 12) fall away towards the next angle: learning, adjusting, preparing.

An empty house is not an empty part of life: everyone has relationships, even with nothing in the seventh. Read it through its cusp sign and ruler.

> **Try this:** Find the house with the most planets in your chart. Does that area of life take up a lot of your attention?`},{id:"astro-houses-twelve",title:"The twelve houses",summary:"What each house governs, with its old names and natural signs.",minutes:8,terms:["house-1","house-2","house-3","house-4","house-5","house-6","house-7","house-8","house-9","house-10","house-11","house-12"],links:[a("chart:reading","Your houses, read")],yourChart:"houses",body:`## Round the wheel

1. **The first house**: you. Body, appearance, temperament, how you begin. Starts at the Ascendant.
2. **The second**: resources. Money, possessions, skills you earn by, self-worth.
3. **The third**: the near world. Siblings, neighbours, short journeys, early learning, speech.
4. **The fourth**: home and roots. Family, ancestors, land, the private self. Starts at the IC.
5. **The fifth**: joy. Creativity, romance, pleasure, children, play.
6. **The sixth**: work and health. Daily routine, service, illness and healing, animals.
7. **The seventh**: others. Partners, marriage, open enemies, contracts. Starts at the Descendant.
8. **The eighth**: depth. Shared money, inheritance, intimacy, death and rebirth.
9. **The ninth**: horizons. Travel, higher learning, faith, philosophy, publishing.
10. **The tenth**: public life. Career, reputation, achievement. Starts at the Midheaven.
11. **The eleventh**: friends. Groups, community, patrons, hopes.
12. **The twelfth**: the hidden. Solitude, retreat, the unconscious, hospitals and prisons, hidden enemies, spiritual practice.

Each house echoes the sign in the same place in the zodiac (the first and Aries, the second and Taurus\u2026), but they are not the same thing: a house is an area of life, a sign a style.

## Old names

Hellenistic astrologers gave some houses names: the tenth was the *Midheaven*, the eleventh the *Good Spirit*, the twelfth the *Bad Spirit*, the fifth *Good Fortune*, the third the *Goddess*, the ninth the *God*. Planets were said to rejoice in certain houses: Mercury in the first, the Moon in the third, Venus in the fifth, Mars in the sixth, the Sun in the ninth, Jupiter in the eleventh, Saturn in the twelfth.`},{id:"astro-houses-systems",title:"House systems",summary:"Why there are several ways to divide the houses, and which one to choose.",minutes:6,terms:["house-systems","placidus","whole-sign","equal-house","porphyry"],links:[a("chart","Change your chart's house system")],body:`## The problem

Dividing the zodiac into signs is simple: 30\xB0 each. Dividing the sky around a place into houses is not, because the ecliptic sits at a slant to the horizon, and the slant changes with latitude and time. Astrologers have tried many solutions.

## The main systems

- **Whole sign**: the oldest. The whole rising sign is the first house, the next sign the second, and so on. Simple, and used by Hellenistic and Indian astrologers. Recovered by many modern traditional astrologers.
- **Equal house**: twelve houses of 30\xB0 from the Ascendant's exact degree.
- **Porphyry**: each quadrant between the angles divided in three. Ancient and simple.
- **Placidus**: divides by time (how long each degree takes to rise). The most common system in twentieth-century books, and this app's default. It fails near the poles, where some degrees never rise; the app then uses Porphyry.

In Placidus and Porphyry, the Midheaven is always the tenth-house cusp; in whole sign and equal house it can fall in the ninth, tenth or eleventh.

## Which to use?

There is no proven answer. Try whole sign and Placidus on your own chart and see which describes your life better. Many astrologers use whole sign for the topics of life and keep the quadrant angles as sensitive points.

> **Note:** If a planet changes house when you change system, read it as sitting between the two: both houses' matters will show.`}],quiz:{id:"quiz-astro-houses",title:"The houses",intro:"Seven questions on the houses and house systems.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"The sign of a planet tells you how it works. The house tells you\u2026",options:["When it works","Where in life it works","Whether it is retrograde","Its element"],correct:[1],points:1,explanation:'Houses are areas of life: the "where".'},{id:"q2",type:"single",prompt:"Which house begins at the Midheaven?",options:["First","Fourth","Seventh","Tenth"],correct:[3],points:1,explanation:"In quadrant systems the Midheaven is the tenth-house cusp."},{id:"q3",type:"single",prompt:"Partnership and marriage belong to which house?",options:["Fifth","Seventh","Eighth","Eleventh"],correct:[1],points:1,explanation:"The seventh, beginning at the Descendant, is partners and open others."},{id:"q4",type:"multi",prompt:"Which are angular houses? Choose all.",options:["1","4","7","10","11"],correct:[0,1,2,3],points:1,explanation:"Angular houses begin at the four angles: 1, 4, 7 and 10."},{id:"q5",type:"truefalse",prompt:"An empty house means that area of life is missing from your life.",options:["True","False"],correct:[1],points:1,explanation:"Read an empty house through its cusp sign and ruler; the area of life is still there."},{id:"q6",type:"single",prompt:"Which is the oldest house system?",options:["Placidus","Whole sign","Koch","Equal house"],correct:[1],points:1,explanation:"Whole sign houses were used by the Hellenistic astrologers."},{id:"q7",type:"single",prompt:"Spirituality, solitude and the hidden belong to the\u2026",options:["Third house","Sixth house","Ninth house","Twelfth house"],correct:[3],points:1,explanation:"The twelfth house: retreat, the unconscious and spiritual practice."}]}},ee={id:"aspects",title:"Aspects",summary:"The angles planets make to each other: the conversations in a chart, their orbs, and the shapes they form.",lessons:[{id:"astro-aspects-major",title:"The five major aspects",summary:"Conjunction, sextile, square, trine and opposition: what each angle means.",minutes:7,terms:["aspects","conjunction","sextile","square","trine","opposition"],links:[a("chart:aspects","Your aspects")],yourChart:"aspects",body:`## Planets in conversation

An **aspect** is a meaningful angle between two planets, measured round the zodiac. If planets are the actors, aspects are their conversations: some easy, some tense.

## The five Ptolemaic aspects

These come from dividing the circle by 1, 2, 3, 4 and 6:

- **Conjunction** (0\xB0): together. The two blend and act as one; whether that is easy depends on the planets.
- **Sextile** (60\xB0): an opening. Signs of friendly elements (fire with air, earth with water). Helpful, but it needs you to act.
- **Square** (90\xB0): friction. Signs of the same modality but clashing elements. Tension that pushes you to grow; often where people build their greatest strengths.
- **Trine** (120\xB0): flow. Signs of the same element. Easy talent, sometimes taken for granted.
- **Opposition** (180\xB0): a see-saw. Opposite signs. Awareness through contrast, often played out with other people; the work is balance.

## Hard and soft

Squares and oppositions are traditionally "hard", trines and sextiles "soft". Modern astrologers are careful with these words: hard aspects drive achievement, and soft ones can make for comfort without growth. A chart with no hard aspects can be as challenging as one full of them.

> **Try this:** Open your aspects and find your tightest one (the smallest orb). Read it. How do those two planets talk in your life?`},{id:"astro-aspects-orbs",title:"Orbs, applying and separating",summary:"How close is close enough, and why a forming aspect differs from a fading one.",minutes:5,terms:["orb","applying-separating"],links:[a("chart:aspects")],yourChart:"aspects",body:`## Orbs

Planets are rarely at an exact angle. The **orb** is how far from exact an aspect can be and still count. This app uses middle-of-the-road modern orbs: about 8\xB0 for conjunctions and oppositions, 7\xB0 for squares and trines, 5\xB0 for sextiles, with two degrees more when the Sun or Moon is involved, and tighter orbs for the points and the minor aspects. You can change them in your chart's settings.

The tighter the orb, the stronger the aspect. An aspect within 1\xB0 is felt loudly; one at the edge of its orb is a whisper.

## Applying and separating

If the faster planet is moving towards the exact angle, the aspect is **applying**: building, a matter still unfolding. If it has passed exact, it is **separating**: fading, a matter already lived. Traditional astrologers took this very seriously, especially in questions and elections.

## Out-of-sign aspects

Sometimes two planets are at the right distance but in signs that don't match (a "trine" between a late Leo and an early Capricorn planet, say). Many astrologers count these but read them as weaker or more complicated.`},{id:"astro-aspects-minor-patterns",title:"Minor aspects and patterns",summary:"The quincunx and other minor angles, and the larger shapes several aspects make together.",minutes:8,terms:["quincunx","semisextile","semisquare","sesquiquadrate","quintile","aspect-patterns","grand-trine","t-square","grand-cross","yod","kite","stellium"],links:[a("chart:aspects"),a("chart:reading","Your patterns, read")],yourChart:"patterns",body:`## Minor aspects

Kepler and later astrologers added more angles. They use small orbs (1\u20133\xB0) and say more when they are tight:

- **Quincunx** (150\xB0): two signs with nothing in common. Constant adjustment.
- **Semisextile** (30\xB0): neighbouring signs. A slight, slow link.
- **Semisquare** (45\xB0) and **sesquiquadrate** (135\xB0): smaller frictions.
- **Quintile** (72\xB0) and **biquintile** (144\xB0): talent and style.

You can turn minor aspects off in your chart settings if you prefer to start with the five majors.

## Patterns

Several aspects can link up into shapes that act as a whole:

- **Grand trine**: three planets in one element, each trine the others. A circle of ease and talent.
- **T-square**: two planets in opposition, both square a third (the apex). Driving tension released through the apex.
- **Grand cross**: four planets in two oppositions, all squaring. Great strength under constant pressure.
- **Yod**: two planets sextile, both quincunx a third. A pointed sense of purpose at the apex.
- **Kite**: a grand trine plus a planet opposite one corner. Talent with a direction.
- **Stellium**: three or more planets in one sign or house. A concentration of energy.

Patterns are often the first thing a chart's wheel shows you, because the lines draw them. They are worth reading before the single aspects inside them.`}],quiz:{id:"quiz-astro-aspects",title:"Aspects",intro:"Seven questions on aspects, orbs and patterns.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"How many degrees is a square?",options:["60\xB0","90\xB0","120\xB0","180\xB0"],correct:[1],points:1,explanation:"A square divides the circle by four: 90\xB0."},{id:"q2",type:"single",prompt:"Which aspect joins signs of the same element?",options:["Sextile","Square","Trine","Opposition"],correct:[2],points:1,explanation:"Trines (120\xB0) join signs of the same element."},{id:"q3",type:"single",prompt:"What is an orb?",options:["A planet's glow","How far from exact an aspect can be and still count","A kind of pattern","The Moon's path"],correct:[1],points:1,explanation:"The orb is the allowed distance from exactness."},{id:"q4",type:"single",prompt:"An applying aspect is\u2026",options:["Fading","Building towards exact","Always hard","Out of sign"],correct:[1],points:1,explanation:"Applying means the faster planet is moving towards the exact angle."},{id:"q5",type:"single",prompt:"Two planets in opposition, both square a third, make a\u2026",options:["Grand trine","Yod","T-square","Kite"],correct:[2],points:1,explanation:"That is a T-square, with the third planet as the apex."},{id:"q6",type:"truefalse",prompt:"A chart full of trines is always easier to live with than one with squares.",options:["True","False"],correct:[1],points:1,explanation:"Squares drive growth; trines can make for comfort without challenge. Neither is simply better."},{id:"q7",type:"single",prompt:"Which minor aspect joins two signs with nothing in common?",options:["Semisextile","Quincunx","Quintile","Semisquare"],correct:[1],points:1,explanation:"The quincunx (150\xB0) joins signs that share no element, modality or polarity."}]}};var te={id:"reading",title:"Reading a chart, step by step",summary:"A method for reading any chart, worked through on your own: the big three, the ruler, the planets, the aspects, and putting it together.",lessons:[{id:"astro-reading-big-three",title:"Step one: Sun, Moon and rising",summary:"Start with the three most personal placements and how they fit together.",minutes:7,terms:["big-three","sun","moon","ascendant"],links:[a("chart:reading","Your reading in full"),a("chart","Your chart wheel")],yourChart:"big-three",body:`## Why start here

The Sun, Moon and Ascendant are the "big three". Between them they describe the self you are becoming (Sun), the needs and instincts underneath (Moon), and the way you meet the world and begin things (Ascendant). Almost every astrologer starts here.

## How to read them together

1. **Name each one** in a few words. "Sun in Capricorn: ambitious, responsible. Moon in Leo: needs warmth and to be seen. Libra rising: gracious, diplomatic."
2. **Look at their elements.** Do they share one, or pull in different directions? Earth Sun, fire Moon and air rising: a practical core with a warm heart and a sociable manner.
3. **Notice tensions.** A Capricorn Sun and a Leo Moon may disagree: one says "work first", the other "play first". That disagreement is not a flaw; it is a person.
4. **Add the houses.** The Sun's house shows where you shine; the Moon's where you need to feel at home.

## Without a birth time

You still have the Sun and the Moon's sign (though the Moon may be near a sign change; the app says so). Read them, and leave the rising sign as an open question.

> **Try this:** Write three lines about your own big three, then one sentence that joins them: "I am someone who\u2026".`},{id:"astro-reading-ruler-planets",title:"Step two: the chart ruler and the planets",summary:"Find the planet that steers the chart, then walk through each planet by sign and house.",minutes:8,terms:["chart-ruler","rulership","cusp"],links:[a("chart:reading","Your chart ruler, read"),a("chart:placements")],yourChart:"ruler",body:`## The chart ruler

The planet that rules your rising sign is your **chart ruler**. Hellenistic astrologers called it the lord of the Hour and read its condition as the condition of the whole life. Where it sits (its sign and house) is where the chart's energy is "sent".

- Aries rising: Mars. Taurus or Libra: Venus. Gemini or Virgo: Mercury. Cancer: the Moon. Leo: the Sun. Sagittarius or Pisces: Jupiter. Capricorn or Aquarius: Saturn.
- Modern astrologers add Pluto for Scorpio, Uranus for Aquarius and Neptune for Pisces as co-rulers.

## Walking through the planets

For each planet, write one sentence with three parts:

**Planet** (what) + **sign** (how) + **house** (where).

"My Venus (love) in Virgo (carefully, practically) in the sixth house (daily work and service): I show love by doing useful things for people every day."

Go in order of speed: Mercury, Venus, Mars, then Jupiter and Saturn, then the outer planets (which matter most by house and by aspect to your personal planets).

## Weighting

Not everything is equally loud. Give more weight to planets that are:

- on an angle (near the Ascendant, Midheaven, Descendant or IC);
- the chart ruler, or the ruler of the Sun or Moon's sign;
- in a stellium, or the apex of a pattern;
- in tight aspect to the Sun, Moon or Ascendant.`},{id:"astro-reading-aspects-balance",title:"Step three: aspects, patterns and balance",summary:"Add the conversations between planets and the chart's overall shape.",minutes:7,terms:["aspects","aspect-patterns","elements","modalities","houses"],links:[a("chart:aspects"),a("chart:balance")],yourChart:"aspects",body:`## The tightest aspects first

Read the aspects from the tightest orb outwards, and stop after about a dozen. An aspect within 2\xB0 to the Sun, Moon or chart ruler is usually a major theme.

For each, ask: what do these two planets want, and does the angle let them cooperate (trine, sextile), clash (square), mirror each other (opposition) or fuse (conjunction)?

## Patterns

If there is a T-square, grand trine, yod or stellium, read it as one unit. A T-square's apex or a stellium's sign often becomes the centre of the whole reading.

## Balance and shape

Step back and look at the whole:

- **Elements and modalities**: which dominate, which are missing?
- **Hemispheres**: are most planets above the horizon (outward, public) or below (inward, private)? East (self-directed) or west (shaped through others)?
- **Sect**: was the Sun above the horizon (a day chart) or below (a night chart)?

These give the chart's temperament before the details.

## An example

Say a chart is mostly earth and water, with no air, most planets below the horizon, and a tight Moon square Saturn. Before reading a single planet you already know a lot: a practical, feeling, private person, who may find it hard to step back and talk things through, and who learned early to hold their needs carefully. Every later detail is read in that light.

> **Try this:** Open your balance and your aspects. Write three words for your chart's overall temperament, then name your single tightest aspect and what it might mean.`},{id:"astro-reading-synthesis",title:"Step four: putting it together",summary:"Finding the themes that repeat, and writing your chart's story in a few sentences.",minutes:7,terms:["natal-chart","big-three","chart-ruler"],links:[a("chart:reading","Your reading in full"),y("grimoire"),y("journal")],yourChart:"big-three",body:`## Look for repetition

A good reading does not list every placement; it finds what the chart says more than once. If your Sun is in Scorpio, Pluto is on your Ascendant and you have a stellium in the eighth house, depth and transformation is not one theme among many: it is *the* theme. Astrologers call this the rule of three: anything said three ways is central.

## Hold contradictions

Charts contradict themselves because people do. A fire Sun and a water Moon, a free Uranus and a careful Saturn: both are true. Say "part of you\u2026 and part of you\u2026".

## Write the story

1. One sentence for the big three.
2. One for the chart ruler and where it sends you.
3. One for the strongest pattern or theme.
4. One for the main tension and what it teaches.
5. One for the gift: the easiest, most natural strength.

## Ethics

When you read for other people, the same care applies as in any divination: speak of tendencies, not fate; never predict death, illness or disaster; leave people feeling more able, not less.

> **Try this:** Write your five sentences in your Grimoire. Come back to them in a year; you will read your chart differently.`}],quiz:{id:"quiz-astro-reading",title:"Reading a chart",intro:"Six questions on the step-by-step method.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"With Sagittarius rising, what is the traditional chart ruler?",options:["Mars","Jupiter","Saturn","Neptune"],correct:[1],points:1,explanation:"Jupiter rules Sagittarius, so it rules a Sagittarius-rising chart."},{id:"q2",type:"single",prompt:'In "Venus in Virgo in the sixth house", what does the sixth house add?',options:["How Venus acts","Where in life Venus acts: daily work and service","Whether Venus is strong","Nothing"],correct:[1],points:1,explanation:"Planet = what, sign = how, house = where."},{id:"q3",type:"multi",prompt:"Which make a planet louder in a chart? Choose all.",options:["Being on an angle","Being the chart ruler","Tight aspect to the Sun or Moon","Being in the twelfth house by default"],correct:[0,1,2],points:1,explanation:"Angularity, rulership and tight aspects to the lights all add weight."},{id:"q4",type:"single",prompt:'What is the "rule of three" in synthesis?',options:["Read only three planets","A theme said three ways in a chart is central","Three houses matter most","Read for three people"],correct:[1],points:1,explanation:"Repetition across planets, signs and houses shows the main themes."},{id:"q5",type:"truefalse",prompt:"When a chart contradicts itself, one placement must be wrong.",options:["True","False"],correct:[1],points:1,explanation:"People contain contradictions; a good reading holds both sides."},{id:"q6",type:"single",prompt:"Which aspects should you read first?",options:["The widest","The minor ones","The tightest, especially to the lights and ruler","Only the trines"],correct:[2],points:1,explanation:"Tight aspects to the Sun, Moon and chart ruler carry the most weight."}]}},se={id:"dignities",title:"Dignities and rulerships",summary:"Which planets are at home where, how traditional astrologers judged a planet's strength, and sect.",lessons:[{id:"astro-dignities-rulership",title:"Rulership: planets at home",summary:"Each sign has a ruling planet, and following the rulers links a whole chart together.",minutes:6,terms:["rulership","domicile","detriment"],links:[a("chart:placements","Your placements and dignities")],yourChart:"dignities",body:`## The scheme

The traditional rulerships follow a beautiful pattern. The Sun and Moon rule the two summer signs, Leo and Cancer. Then, moving outward in both directions in order of the planets' speed:

- Mercury rules Gemini and Virgo,
- Venus rules Taurus and Libra,
- Mars rules Aries and Scorpio,
- Jupiter rules Sagittarius and Pisces,
- Saturn rules Capricorn and Aquarius, the winter signs opposite the lights.

A planet in a sign it rules is in its **domicile**: at home, able to act freely. A planet in the sign opposite its home is in **detriment**: a guest in a house run by different rules, working harder or in an unusual way.

## Following the rulers

Every sign in your chart has a ruler somewhere else in it. "My seventh house is Aries, ruled by Mars, and Mars is in my tenth": partners and career are linked. Following these chains (dispositors) shows how the parts of a chart talk to each other. Sometimes one planet ends every chain: a **final dispositor**, very strong in the chart.

## Modern rulers

Modern astrology gives Scorpio to Pluto, Aquarius to Uranus and Pisces to Neptune. Many astrologers use both, the traditional ruler for practical matters and the modern one for psychological colour.`},{id:"astro-dignities-exaltation",title:"Exaltation, fall and peregrine planets",summary:"The honoured signs, their opposites, and planets with no dignity at all.",minutes:6,terms:["dignity","exaltation","fall"],links:[a("chart:placements")],yourChart:"dignities",body:`## Exaltation

Each of the seven traditional planets has a sign where it is **exalted**: an honoured guest, at its best and most celebrated. Ptolemy lists them in the *Tetrabiblos*:

- Sun in Aries, Moon in Taurus, Mercury in Virgo, Venus in Pisces, Mars in Capricorn, Jupiter in Cancer, Saturn in Libra.

Opposite its exaltation, a planet is in **fall**: overlooked, struggling to be seen.

## Peregrine

A planet in none of these four conditions is **peregrine**, a wanderer. That is most placements, and it is fine: the planet relies on its aspects and its ruler's condition.

## Reading dignity gently

Dignity describes how easily a planet can do its work, not whether you are good or bad. A Venus in detriment in Scorpio loves intensely and privately rather than lightly; a Mars in fall in Cancer fights for family rather than for itself. Many people with "debilitated" planets develop real mastery precisely because those planets made them work.

> **Note:** There are also smaller dignities (triplicity, term and face, or decan). The app shows each planet's decan; the full scheme belongs to a deeper study of traditional astrology.`},{id:"astro-dignities-sect",title:"Sect and a planet's condition",summary:"Day and night charts, and other ways traditional astrologers judged a planet's strength.",minutes:6,terms:["sect","retrograde","decans"],links:[a("chart:balance","Your chart's sect")],yourChart:"dignities",body:`## Day and night

**Sect** divides charts into day charts (Sun above the horizon) and night charts (Sun below). The planets divide too:

- The **day sect**: the Sun, Jupiter and Saturn.
- The **night sect**: the Moon, Venus and Mars.
- Mercury joins whichever sect it is nearer to, rising before or after the Sun.

In a day chart, Jupiter is the most helpful planet and Saturn's difficulties are softened; Mars is the hardest. In a night chart, Venus is the most helpful, Mars is gentled, and Saturn is the hardest. This ancient rule explains a great deal about why the "malefics" are harsher in some charts than others.

## Other conditions

Traditional astrologers also asked:

- Is the planet **angular** (strong, visible) or **cadent** (weaker, behind the scenes)?
- Is it **retrograde** (inward, delayed) or fast and direct?
- Is it under the Sun's beams (hidden) or **combust** (within about 8\xB0 of the Sun: overpowered), or **cazimi** (within a degree: in the heart of the Sun, greatly strengthened)?
- Is it received by its ruler (does the ruler aspect it)?

You don't need all of this to read a chart. It is a deeper layer, and worth knowing exists.`}],quiz:{id:"quiz-astro-dignities",title:"Dignities and rulerships",intro:"Six questions on rulership, exaltation and sect.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"Venus traditionally rules\u2026",options:["Aries and Scorpio","Taurus and Libra","Gemini and Virgo","Cancer and Leo"],correct:[1],points:1,explanation:"Venus rules Taurus and Libra."},{id:"q2",type:"single",prompt:"A planet in the sign opposite its home is in\u2026",options:["Exaltation","Detriment","Domicile","Cazimi"],correct:[1],points:1,explanation:"Detriment is the sign opposite a planet's domicile."},{id:"q3",type:"single",prompt:"Where is the Moon exalted?",options:["Cancer","Taurus","Pisces","Scorpio"],correct:[1],points:1,explanation:"Ptolemy gives the Moon's exaltation as Taurus."},{id:"q4",type:"single",prompt:"A peregrine planet is\u2026",options:["Retrograde","In none of its dignities or debilities","Very strong","Near the Sun"],correct:[1],points:1,explanation:"Peregrine means a wanderer: no essential dignity or debility."},{id:"q5",type:"single",prompt:"In a night chart, which planet is the most helpful?",options:["Jupiter","Saturn","Venus","Mars"],correct:[2],points:1,explanation:"Venus is the benefic of the night sect."},{id:"q6",type:"truefalse",prompt:"A planet in fall means the person is bad at what that planet rules.",options:["True","False"],correct:[1],points:1,explanation:"Dignity describes ease, not worth; debilitated planets often become places of mastery."}]}},ne={id:"transits",title:"Transits",summary:"How the moving sky touches your chart: what transits are, the great life cycles, and working with them.",lessons:[{id:"astro-transits-what",title:"What transits are",summary:"The planets today, aspecting the planets at your birth.",minutes:6,terms:["transit","orb","applying-separating","station"],links:[a("chart:transits","Your transits now")],yourChart:"transits",body:`## The sky keeps moving

Your birth chart is fixed; the sky is not. A **transit** is a planet in today's sky making an aspect to a point in your birth chart: transiting Saturn square your natal Sun, say. Transits are the main way astrologers think about timing.

## Fast and slow

- The **Moon** transits every point in your chart each month: moods for a few hours.
- The **Sun, Mercury, Venus and Mars** bring days or weeks of focus.
- **Jupiter and Saturn** bring chapters of months.
- **Uranus, Neptune and Pluto** bring eras of a year or more, and often pass a point three times because of retrograde motion.

The slower the planet, the more it matters. Most astrologers watch the outer planets and Saturn and Jupiter crossing the Sun, Moon, angles and chart ruler.

## Houses too

As a planet moves through your houses, it lights up that area of life: Jupiter takes a year in each house, Saturn two and a half. Knowing which house Saturn is crossing tells you where life is asking for effort.

> **Try this:** Open your transits. Find the slowest planet touching your chart now, and read it. Does it match what this year has asked of you?`},{id:"astro-transits-cycles",title:"The great cycles of a life",summary:"Jupiter and Saturn returns, the midlife transits, the Chiron return and the nodal cycle.",minutes:8,terms:["transit","saturn","jupiter","uranus","chiron","north-node"],links:[a("chart:transits"),a("planet:Saturn","Saturn's guide")],body:`## Cycles everyone shares

Some transits happen to everyone at about the same age, because they are a planet returning to, or opposing, its own place in your chart.

- **Jupiter returns** every twelve years (about 12, 24, 36, 48, 60, 72, 84): new cycles of growth and faith.
- **Saturn squares** its place around 7, 21\u201322, 36 and 51, **opposes** it around 14\u201315 and 44, and **returns** around 29 and 58. The first Saturn return is astrology's famous coming of age: what is not truly yours falls away, and what is, gets built.
- **The midlife transits** cluster around 38\u201344: Uranus opposite Uranus (awakening), Neptune square Neptune (old dreams dissolve), and, for many people born in the twentieth century, Pluto square Pluto (power and depth).
- **Chiron returns** around 50: the old wound comes round to become wisdom.
- **The nodes return** every 18.6 years (about 18\u201319, 37, 56, 74), often around turning points of direction, with the reversal (North Node over South) about nine years after each.

## Using them

Knowing these cycles takes the fear out of them. A hard Saturn transit is a season, not a sentence: it has a beginning and an end, and what you build in it lasts.

> **Note:** Ages are approximate; the app shows your own exact dates as the transits come.`},{id:"astro-transits-working",title:"Working with transits",summary:"Tracking transits, reading them alongside the natal chart, and timing your practice by them.",minutes:6,terms:["transit","retrograde","shadow-period"],links:[a("chart:transits"),a("chart:craft","Where your chart meets the craft"),y("planner"),c("cosmic-saturday-saturn-boundaries"),c("cosmic-thursday-jupiter-prosperity")],yourChart:"transits",body:`## Read the natal promise first

A transit can only wake what is in the chart. Saturn crossing a natal Venus that is already strong and well aspected brings a sobering of love; crossing a Venus that is already under pressure, it may bring a real test. Always ask: what does the natal planet mean for this person, and what is the transiting planet asking of it?

## Keep a record

The best way to learn transits is to notice them. When a slow transit begins, write down what you expect; when it ends, write what happened. After a few years you will know how Saturn and Jupiter work for you.

## Working with them in the craft

- **Jupiter** transits: cast for growth and blessing; begin things.
- **Saturn** transits: bind, protect, commit; do long workings with patience.
- **Uranus**: spells for freedom and change; expect the unexpected.
- **Neptune**: dreamwork, devotion, art; ground often.
- **Pluto**: shadow work, release and rebirth.

Many witches time a working to the day a transit is exact, and renew it at each pass.

> **Try this:** Use the ritual planner to set a working for the next exact date of a transit you are living through.`}],quiz:{id:"quiz-astro-transits",title:"Transits",intro:"Six questions on transits and the cycles of a life.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"What is a transit?",options:["A planet in your birth chart","A planet in today's sky aspecting a point in your birth chart","A house system","A kind of eclipse"],correct:[1],points:1,explanation:"Transits are the moving sky against the fixed natal chart."},{id:"q2",type:"single",prompt:"Around what age is the first Saturn return?",options:["12","21","29","42"],correct:[2],points:1,explanation:"Saturn takes about 29\xBD years to return to its natal place."},{id:"q3",type:"single",prompt:"Which transit is at the heart of the midlife awakening around 40\u201342?",options:["Jupiter return","Uranus opposite Uranus","Mars return","The Moon's return"],correct:[1],points:1,explanation:"The Uranus opposition comes around 40\u201342."},{id:"q4",type:"single",prompt:"Why can an outer planet pass the same point three times?",options:["It speeds up","Retrograde motion takes it back over the point","Houses change","It doesn't"],correct:[1],points:1,explanation:"Direct, retrograde and direct again: three passes."},{id:"q5",type:"truefalse",prompt:"A transit can bring something the natal chart has no sign of at all.",options:["True","False"],correct:[1],points:1,explanation:"Transits wake what the natal chart promises; always read the natal planet first."},{id:"q6",type:"single",prompt:"Which transiting planet suits binding, protection and long patient workings?",options:["Jupiter","Saturn","Neptune","Uranus"],correct:[1],points:1,explanation:"Saturn is structure, limits and endurance."}]}};var re={id:"progressions",title:"Progressions and returns",summary:"Two more ways of timing: the slow unfolding of the chart itself, and the yearly and monthly return charts.",lessons:[{id:"astro-progressions-secondary",title:"Secondary progressions",summary:"A day for a year: how the chart unfolds as you grow.",minutes:6,terms:["progressions"],links:[a("chart:progressions","Your progressions")],yourChart:"progressions",body:`## A day for a year

**Secondary progressions** use a symbolic key: each day after your birth stands for a year of your life. To see age 30, astrologers look at the sky 30 days after you were born. The method goes back to Persian and medieval astrologers and was popularised in modern times by Alan Leo.

Because a day is a short time, most planets barely move: the progressed Sun moves about a degree a year, so it changes sign roughly once every thirty years. Those changes feel like shifts in identity and style. Mercury, Venus and Mars move more, and may change sign or turn retrograde by progression, which often marks a change in how you think, love or act.

## The progressed angles

With an exact birth time, the Ascendant and Midheaven progress too. This app moves them by **solar arc** (the same distance the progressed Sun has moved), a common method. When a progressed angle reaches a natal planet, that planet comes to the fore.

## How to read them

Progressions describe inner development: the slow ripening of the person. Transits describe outer weather. Read them together: a transit hits harder when it echoes a progression.`},{id:"astro-progressions-moon",title:"The progressed Moon",summary:"A twenty-seven-year cycle of emotional chapters, and the progressed lunar phases.",minutes:6,terms:["progressions","moon","moon-phases"],links:[a("chart:progressions","Your progressed Moon")],yourChart:"progressions",body:`## The fastest progression

The progressed Moon moves about a degree a month, so it spends around two and a half years in each sign and goes all the way round the zodiac in about 27 years. It is the clearest clock in progressed astrology.

- Its **sign** colours an emotional chapter: in Taurus you want to settle, in Gemini to learn and talk, in Scorpio to go deep.
- Its **house** in your natal chart shows where your feelings gather: the fourth house brings home and family, the tenth brings career to the fore.
- When it changes sign or crosses an angle, people often describe a new chapter starting.

At about 27 and 54 it returns to its natal place: the **progressed lunar return**, often a time of emotional renewal.

## The progressed phases

The progressed Sun and Moon also make a cycle of phases, like the Moon's monthly one but about thirty years long. Dane Rudhyar described each phase (new, crescent, first quarter, gibbous, full, disseminating, last quarter, balsamic) as a season of a life: beginning, struggling, building, refining, fulfilling, sharing, letting go and resting.

> **Try this:** Look up when your progressed Moon last changed sign. What changed in your emotional life around then?`},{id:"astro-progressions-returns",title:"Solar and lunar returns",summary:"A chart for each birthday, and one for each month.",minutes:7,terms:["returns","solar-return","lunar-return"],links:[a("chart:returns","Your returns"),c("cosmic-solar-return-reading")],yourChart:"progressions",body:`## The solar return

Once a year, around your birthday, the Sun comes back to the exact degree and minute it held at your birth. A chart for that moment is your **solar return**, read for the year ahead. It is an old technique: Persian astrologers called it the revolution of the years of the nativity.

How to read it:

1. The **house the Sun falls in**: the year's main stage.
2. The **rising sign** and its ruler: the year's tone.
3. **Planets on the angles**: the loudest themes.
4. The **Moon**: where feelings gather.
5. How the return chart lies on your birth chart.

Astrologers disagree about where to cast it: for your birthplace, or for wherever you are on your birthday. Try both.

## The lunar return

Every 27 days or so the Moon returns to its natal place. The **lunar return** is read the same way for the month ahead, and works best as a habit: a few lines in a journal each month show your rhythms over a year.

> **Try this:** Keep your next solar return chart in your Grimoire, with three intentions for the year. On your next birthday, read them again.`}],quiz:{id:"quiz-astro-progressions",title:"Progressions and returns",intro:"Six questions on progressions and returns.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"In secondary progressions, one day after birth stands for\u2026",options:["One hour","One month","One year","Seven years"],correct:[2],points:1,explanation:"A day for a year is the key of secondary progressions."},{id:"q2",type:"single",prompt:"About how long does the progressed Moon stay in each sign?",options:["A month","Two and a half years","Twelve years","Thirty years"],correct:[1],points:1,explanation:"Around two and a half years, going round in about 27."},{id:"q3",type:"single",prompt:"A solar return is cast for\u2026",options:["New Year's Day","The moment the Sun returns to its exact natal degree","The next eclipse","Midnight on your birthday"],correct:[1],points:1,explanation:"It is the exact moment of the Sun's return, near your birthday."},{id:"q4",type:"single",prompt:"In a solar return, the house the Sun falls in shows\u2026",options:["Your rising sign","The year's main stage","Your career forever","Nothing"],correct:[1],points:1,explanation:"The return Sun's house is the focus of the year."},{id:"q5",type:"truefalse",prompt:"Progressions describe inner development; transits describe outer weather.",options:["True","False"],correct:[0],points:1,explanation:"A useful rule of thumb: read them together."},{id:"q6",type:"single",prompt:"How often does a lunar return come?",options:["About every 27 days","Every year","Every 18.6 years","Every full moon"],correct:[0],points:1,explanation:"The Moon returns to its natal place about every 27 days."}]}},oe={id:"moon",title:"The Moon, eclipses and void of course",summary:"The witch's clock: the lunar phases and signs, eclipses and the nodes, and the void-of-course Moon.",lessons:[{id:"astro-moon-phases-signs",title:"Phases and signs",summary:"The lunation cycle, the Moon through the signs, and the phase you were born under.",minutes:7,terms:["lunation","moon-phases","new-moon","full-moon","quarter-moons"],links:[a("sky","The moon tonight"),H("moon-new"),H("moon-full"),c("cosmic-new-moon-intentions"),c("cosmic-full-moon-charging-moon-water")],yourChart:"moon",body:`## The lunation

The Moon's phases come from its angle to the Sun. At the **new moon** they are conjunct: the Moon is dark, between us and the Sun. As it pulls away it waxes through the crescent and **first quarter** (a square), to the **full moon** (opposite the Sun, fully lit), then wanes through the **last quarter** back to dark. The whole cycle, a **lunation**, takes about 29\xBD days.

In the craft, the waxing Moon is for drawing in and growing, the full for power and charging, the waning for releasing and banishing, and the dark for rest.

## The Moon through the signs

The Moon changes sign every two to two and a half days, and its sign colours the mood of those days: practical in Taurus, chatty in Gemini, tender in Cancer. Witches choose both: a waxing Moon in Taurus for money, a waning Moon in Scorpio for banishing.

## Your birth phase

The phase you were born under says something too. New-moon people tend to begin things on instinct; full-moon people are aware of others and of themselves; balsamic (just before the new moon) people often feel like the end of an old cycle and the seed of a new one.

> **Try this:** Note the Moon's sign and phase each day for a month, with a word about your mood. You will find your own rhythm.`},{id:"astro-moon-eclipses",title:"Eclipses and the nodes",summary:"What eclipses are, why they come in seasons, and how witches work with them.",minutes:6,terms:["eclipse","solar-eclipse","lunar-eclipse","saros","north-node","south-node"],links:[a("sky","Eclipses this year"),c("cosmic-solar-eclipse-threshold"),c("cosmic-lunar-eclipse-vigil")],body:`## Why eclipses happen

The Moon's orbit is tilted about 5\xB0 to the ecliptic, crossing it at two points, the **nodes**. An eclipse happens only when a new or full moon falls close to a node.

- A **solar eclipse** is a new moon near a node: the Moon passes in front of the Sun.
- A **lunar eclipse** is a full moon near a node: the Moon passes through the Earth's shadow and often turns red.

Because the Sun reaches each node about every six months, eclipses come in **seasons**, usually two or three within a few weeks, twice a year. Similar eclipses repeat every 18 years 11 days: the **saros** cycle known to Babylonian astronomers.

## Reading them

Eclipses have always been read as turning points, once for kings and now for individuals. An eclipse that falls on a planet or angle in your chart (within a few degrees) is taken to mark a chapter opening (solar) or closing (lunar) in that area of life, often unfolding over the following months.

## Working with them

Many witches rest and observe during the eclipse itself, rather than casting, and work with the new direction afterwards: intentions after a solar eclipse, release after a lunar one. Others treat eclipses as doorways for powerful threshold rites. Both are traditional; choose what feels right, and never look at a solar eclipse without proper eye protection.

> **Safety:** Never look directly at the Sun during a solar eclipse without certified eclipse glasses.`},{id:"astro-moon-void",title:"The void-of-course Moon",summary:"The quiet hours between the Moon's last aspect in a sign and its move to the next.",minutes:5,terms:["void-of-course","ingress"],links:[a("sky","Is the Moon void now?"),y("planner")],body:`## What it is

After the Moon makes its last major aspect to a planet in a sign, and before it moves into the next sign, it is **void of course**. This can last minutes or more than a day.

The idea is medieval, from horary astrology (answering questions by the chart of the moment). Then, and for many astrologers now, a void Moon means "nothing will come of it": plans made now tend to fizzle or change.

## Using it

- **Avoid** starting new workings, signing contracts or launching things while the Moon is void, if you can.
- **Do** rest, meditate, clean, tidy the altar, finish what is already in motion, and do divination about the past.

Some modern astrologers find void Moons excellent for spiritual practice and inner work, precisely because nothing outer is "caught".

## How long, and how often

The Moon goes void every two to two and a half days, each time it nears the end of a sign. Most void periods last a few hours; some last a day or more, when the Moon makes no aspects for a long stretch of a sign. The sky page shows the next void period and when it ends.

## Which aspects count

Astrologers differ here. Most count only the five major aspects to the seven traditional planets; some add the outer planets, which makes void periods shorter. This app follows the common modern practice of counting the major aspects to the Sun through Pluto. Older texts also note exceptions: William Lilly said the Moon works even when void in Taurus, Cancer, Sagittarius and Pisces.

> **Note:** The void Moon is a gentle guide, not a rule to be anxious about. If a working has to happen now, it can.`}],quiz:{id:"quiz-astro-moon",title:"The Moon, eclipses and void of course",intro:"Six questions on the Moon's phases, eclipses and void Moons.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"At the full moon, the Moon is\u2026",options:["Conjunct the Sun","Square the Sun","Opposite the Sun","Trine the Sun"],correct:[2],points:1,explanation:"Full moons are oppositions of the Moon and Sun."},{id:"q2",type:"single",prompt:"The waning Moon traditionally suits\u2026",options:["Drawing in and growing","Releasing and banishing","Charging","Nothing"],correct:[1],points:1,explanation:"Waning is for letting go, clearing and banishing."},{id:"q3",type:"single",prompt:"A solar eclipse is\u2026",options:["A full moon near a node","A new moon near a node","Any new moon","A planet passing the Sun"],correct:[1],points:1,explanation:"Solar eclipses are new moons close to the lunar nodes."},{id:"q4",type:"single",prompt:"Why do eclipses come in seasons about six months apart?",options:["The Moon speeds up","The Sun reaches each lunar node about every six months","The calendar says so","Random chance"],correct:[1],points:1,explanation:"Eclipses need the Sun near a node, which happens twice a year."},{id:"q5",type:"single",prompt:"When is the Moon void of course?",options:["During an eclipse","Between its last major aspect in a sign and entering the next sign","At every new moon","When retrograde"],correct:[1],points:1,explanation:"That gap is the void-of-course period."},{id:"q6",type:"multi",prompt:"Which suit a void-of-course Moon? Choose all.",options:["Rest and meditation","Tidying the altar","Launching a new venture","Finishing what is already in motion"],correct:[0,1,3],points:1,explanation:"Void Moons suit rest and finishing, not new starts."}]}},ae={id:"magic",title:"Astrology in magic",summary:"Timing your craft by the sky, the planetary days and hours, planetary correspondences, and a working built from your own chart.",lessons:[{id:"astro-magic-timing",title:"Choosing a time",summary:"Electional astrology made simple: the Moon, the day, the hour and the planet.",minutes:7,terms:["moon-phases","void-of-course","planetary-days","planetary-hours"],links:[a("timing","Find a good time for a working"),a("hours","Planetary days and hours"),y("planner"),y("moon")],body:`## Electional astrology

Choosing a good moment to begin something is called **electional astrology**: electing a time. It is how most witches use astrology day to day. A full election can be elaborate; a good one can be simple.

## A simple method

1. **The Moon's phase.** Waxing to draw in, full to charge, waning to release, dark to rest.
2. **The Moon's sign.** Matching the aim: Taurus for money and the body, Cancer for home, Libra for love and harmony, Scorpio for banishing and depth, Capricorn for career and binding.
3. **Not void of course**, if you can help it.
4. **The day** ruled by the planet of your aim.
5. **The hour** ruled by that planet too.

Add, if you like: the planet of your aim not retrograde, and not in a hard aspect to Saturn or Mars at that moment.

## Good enough

You will rarely find a perfect time. Traditional astrologers chose the best time available, not a flawless one. A working done with care at a decent time is better than one never done while waiting for perfection.

> **Try this:** Choose an aim. Open **Find a good time** (the spell timing advisor), which weighs all five of these for you and shows why, or use the planetary hours page and the moon page to find the next day and hour that fit yourself, and put it in the ritual planner.`},{id:"astro-magic-days-hours",title:"Planetary days and hours",summary:"The Chaldean order, the seven days of the week, and the hours of the day and night.",minutes:7,terms:["planetary-days","planetary-hours","chaldean-order"],links:[a("hours","This hour, and the hours today"),c("cosmic-sunday-sun-success"),c("cosmic-monday-moon-intuition"),c("cosmic-tuesday-mars-courage"),c("cosmic-wednesday-mercury-study"),c("cosmic-thursday-jupiter-prosperity"),c("cosmic-friday-venus-love"),c("cosmic-saturday-saturn-boundaries")],body:`## The Chaldean order

Ancient astronomers ranked the seven visible planets by speed, slowest first: **Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon**. This is the Chaldean order, and it governs the hours.

## The hours

The day from sunrise to sunset is divided into twelve "hours", and the night from sunset to sunrise into twelve more. They are only sixty minutes long at the equinoxes; in summer the day hours are long and the night hours short. Each hour is ruled by a planet, in the Chaldean order, starting at sunrise with the ruler of the day.

## The days

Because twenty-four hours later the sequence has moved on three places, the first hour of each day falls to a different planet. That is where our weekdays come from:

- Sunday: the Sun. Success, health, vitality.
- Monday: the Moon. Intuition, home, dreams.
- Tuesday (Tiw, the Norse Mars): Mars. Courage, protection.
- Wednesday (Woden, matched with Mercury): Mercury. Study, travel, words.
- Thursday (Thor, matched with Jupiter): Jupiter. Prosperity, growth.
- Friday (Frigg, matched with Venus): Venus. Love, beauty, friendship.
- Saturday: Saturn. Boundaries, binding, endings.

## Using them

For a working, pick the day of the planet that rules your aim, and within it an hour of the same planet. When you can't choose the day, the hour alone still helps: there is a Venus hour every day.`},{id:"astro-magic-correspondences",title:"Planetary correspondences",summary:"Herbs, stones, metals, colours and deities for each of the seven planets.",minutes:8,terms:["sun","moon","mercury","venus","mars","jupiter","saturn"],links:[a("planet:Sun"),d("herb","calendula"),d("crystal","citrine"),d("crystal","moonstone"),d("herb","mugwort"),d("herb","lavender"),d("herb","rose"),d("crystal","rose_quartz"),d("herb","nettle"),d("crystal","carnelian"),d("herb","sage"),d("crystal","lapis_lazuli"),d("herb","cypress"),d("crystal","onyx")],body:`## The seven

Correspondences are the web of likeness that magic works through: things that share a planet's nature can call on it. These are common ones in modern Western practice, drawn from Agrippa, the herbals and living tradition:

- **Sun**: gold; yellow and gold; calendula, sunflower, bay, frankincense; citrine, sunstone. Success, health, confidence.
- **Moon**: silver; white and silver; mugwort, jasmine, willow; moonstone, pearl, selenite. Intuition, dreams, home, cycles.
- **Mercury**: quicksilver (use the symbol, never the metal); orange and yellow; lavender, dill, mint; agate, citrine. Study, speech, travel, trade.
- **Venus**: copper; green and pink; rose, myrtle, apple; rose quartz, emerald. Love, beauty, friendship, pleasure.
- **Mars**: iron; red; nettle, basil, pepper, dragon's blood; carnelian, bloodstone, garnet. Courage, protection, strength.
- **Jupiter**: tin; blue and purple; sage, oak, cinnamon; lapis lazuli, sapphire. Growth, prosperity, wisdom, justice.
- **Saturn**: lead (use the symbol, never the metal); black and indigo; cypress, comfrey, myrrh; onyx, jet, obsidian. Boundaries, binding, endings, the ancestors.

## Planets and deities

Many deities have been linked with planets, mostly through the Roman names: Sol and Helios, Selene and Diana, Hermes and Thoth, Aphrodite and Freyja, Ares, Zeus and Thor, Kronos. Work with these links as bridges, not equations, and respect the traditions they come from.

> **Safety:** Some traditional planetary plants (belladonna, henbane, hemlock for Saturn) are deadly. Use them as symbols or not at all. Mercury and lead are poisons; never handle them.`},{id:"astro-magic-your-chart",title:"A working from your own chart",summary:"Using your chart's strong planets, your chart ruler and current transits to shape your practice.",minutes:7,terms:["chart-ruler","transit","natal-chart"],links:[a("chart:craft","Your chart and the craft"),a("chart:transits"),y("spell"),y("grimoire")],yourChart:"magic",body:`## Your personal planets

Your chart suggests where your magic comes most naturally:

- Your **chart ruler** is your personal planet: its day, hour, colours and stones are always yours to call on.
- Your **Sun and Moon signs**' elements suggest your home element.
- A planet on an angle or in a stellium is a power you can lean on.
- A weak or missing element is one to build deliberately, with its correspondences.

## A natal talisman

A classic working: make a charm for your chart ruler. On its day and in its hour, with the Moon waxing and not void, gather a stone, a herb and a colour of the planet, and charge them together with words of your own about what that planet means in your chart. Carry it, or keep it on your altar.

## Working with transits

When a slow planet is crossing an important point in your chart, work *with* it: blessing under Jupiter, commitment under Saturn, release under Pluto. The Craft tab of your chart suggests correspondences for what is happening now.

## Keep a record

Write each astrological working in your Grimoire with the sky at the time: the Moon's phase and sign, the day and hour, any transits. Over time you will learn which times work best for you, which is the real knowledge astrology offers a witch.

> **Try this:** Plan a natal talisman for your chart ruler, using the Craft tab and the planetary hours.`}],quiz:{id:"quiz-astro-magic",title:"Astrology in magic",intro:"Seven questions on timing and planetary correspondences.",passPercent:80,questions:[{id:"q1",type:"single",prompt:"What is the Chaldean order, slowest first?",options:["Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn","Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon","Moon, Mercury, Venus, Sun, Mars, Jupiter, Saturn","Mars, Sun, Venus, Moon, Saturn, Jupiter, Mercury"],correct:[1],points:1,explanation:"Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon."},{id:"q2",type:"single",prompt:"Which planet rules Friday?",options:["Mars","Jupiter","Venus","Saturn"],correct:[2],points:1,explanation:"Friday is Venus's day (Frigg's day in English)."},{id:"q3",type:"single",prompt:"When does the first planetary hour of the day begin?",options:["At midnight","At sunrise","At noon","At 6 a.m."],correct:[1],points:1,explanation:"Planetary hours count from sunrise and sunset."},{id:"q4",type:"truefalse",prompt:"Planetary hours are always exactly sixty minutes long.",options:["True","False"],correct:[1],points:1,explanation:"They divide daylight and darkness into twelve each, so they change through the year."},{id:"q5",type:"single",prompt:"For a prosperity working, which day and hour fit best?",options:["Saturday, Saturn hour","Thursday, Jupiter hour","Tuesday, Mars hour","Monday, Moon hour"],correct:[1],points:1,explanation:"Jupiter rules growth and prosperity."},{id:"q6",type:"single",prompt:"Which stone traditionally corresponds to Mars?",options:["Moonstone","Carnelian","Rose quartz","Lapis lazuli"],correct:[1],points:1,explanation:"Carnelian, bloodstone and garnet are Mars stones."},{id:"q7",type:"multi",prompt:"A simple election for a working considers\u2026 Choose all.",options:["The Moon's phase","The Moon's sign","The planetary day and hour","The weather forecast"],correct:[0,1,2],points:1,explanation:"Phase, sign, void of course, day and hour make a simple election."}]}};var S="learn-astrology",Ae="Learn astrology",m=[J,U,K,Z,X,ee,te,se,ne,re,oe,ae],f=m.flatMap(e=>e.lessons),xe=e=>{var t;return(t=m.find(s=>s.id===e))!=null?t:null},Me=e=>{var t;return(t=f.find(s=>s.id===e))!=null?t:null},he=e=>{var t;return(t=m.find(s=>s.lessons.some(n=>n.id===e)))!=null?t:null};function Ce(e){var s;let t=f.findIndex(n=>n.id===e);return t>=0&&(s=f[t+1])!=null?s:null}function qe(e){let t=he(e);return t?`Chapter ${m.indexOf(t)+1} \xB7 Lesson ${t.lessons.findIndex(n=>n.id===e)+1} of ${t.lessons.length}`:""}var ie={placements:"Your placements",aspects:"Your aspects",balance:"Your balance",reading:"Your reading in full",transits:"Your transits",returns:"Your returns",progressions:"Your progressions",craft:"Your chart and the craft"};function C(e){var s;if(e==="chart")return{label:"Your chart",app:"/rituals/craft/cosmic/chart",site:"/practice/cosmic/chart/"};if(e.startsWith("chart:")){let n=e.slice(6);return ie[n]?{label:ie[n],app:`/rituals/craft/cosmic/chart?tab=${n}`,site:`/practice/cosmic/chart/?tab=${n}`}:null}if(e.startsWith("planet:")){let n=e.slice(7);return le.includes(n)?{label:`${n}: the planet's guide`,app:`/rituals/craft/cosmic/planet?planet=${encodeURIComponent(n)}`,site:`/practice/cosmic/planet/?planet=${encodeURIComponent(n)}`}:null}return(s={charts:{label:"Your charts",app:"/rituals/craft/cosmic/charts",site:"/practice/cosmic/charts/"},hours:{label:"Planetary days and hours",app:"/rituals/craft/cosmic/hours",site:"/practice/cosmic/hours/"},timing:{label:"Find a good time",app:"/rituals/craft/cosmic/timing",site:"/practice/cosmic/timing/"},learn:{label:"The astrology glossary",app:"/rituals/craft/cosmic/learn",site:"/practice/cosmic/learn/"},sky:{label:"The sky today",app:"/today/sky",site:"/today/sky/"}}[e])!=null?s:null}var le=["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"];function Pe(e,t){var s,n,r,o;return(s=e.label)!=null&&s.trim()?e.label.trim():e.kind==="term"?(n=t==null?void 0:t(e.id))!=null?n:e.id:e.kind==="astro"?(o=(r=C(e.id))==null?void 0:r.label)!=null?o:e.id:F(e)}function Le(e){var t,s;return e.kind==="term"?null:e.kind==="astro"?(s=(t=C(e.id))==null?void 0:t.app)!=null?s:null:B(e)}function ze(e){var t,s;return e.kind==="term"?null:e.kind==="astro"?(s=(t=C(e.id))==null?void 0:t.site)!=null?s:null:G(e)}var Ie={app:"/rituals/craft/cosmic/course",site:"/practice/cosmic/course/"},We=e=>`/rituals/craft/cosmic/lesson?l=${encodeURIComponent(e)}`,Ee=e=>`/rituals/craft/cosmic/quiz?c=${encodeURIComponent(e)}`,Re=e=>`/practice/cosmic/course/?l=${encodeURIComponent(e)}`,Ne=e=>`/practice/cosmic/course/?quiz=${encodeURIComponent(e)}`;var I={};T(I,{COURSE_COLLECTION:()=>st,chapterState:()=>pe,courseSummary:()=>ht,markLesson:()=>ot,newCourseProgress:()=>nt,nextStep:()=>lt,normalizeCourseProgress:()=>rt,pickProgress:()=>ut,recordQuiz:()=>it,scoreQuiz:()=>at});var z={};T(z,{ATTEMPT_STATUS:()=>Oe,QUESTION_TYPES:()=>$e,answerWords:()=>Fe,attemptLines:()=>Qe,attemptsToScore:()=>Ge,autoScore:()=>D,choose:()=>De,draftKey:()=>et,emptyQuestion:()=>ce,hasKey:()=>ue,isChoice:()=>Y,isRight:()=>A,isWritten:()=>b,keyLine:()=>He,maxPoints:()=>_,nextQuestionId:()=>Ue,passes:()=>V,percentOf:()=>L,quizImport:()=>Xe,readDraft:()=>tt,retype:()=>Ke,rightWords:()=>Be,scoreLine:()=>Ye,scoresPayload:()=>Je,standingLine:()=>Ve,unanswered:()=>_e,validateQuiz:()=>Ze,whenLine:()=>de});var $e=[{value:"single",label:"One answer",detail:"Choose the one right answer. Scored at once."},{value:"multi",label:"Several answers",detail:"Choose every right answer and no wrong ones. Scored at once."},{value:"truefalse",label:"True or false",detail:"Scored at once."},{value:"short",label:"A short answer",detail:"A few sentences, scored by a person against the guide."},{value:"long",label:"A longer answer",detail:"Scored by a person against the guide."}],b=e=>e.type==="short"||e.type==="long",Y=e=>!b(e),Oe={submitted:"Waiting to be scored",scored:"Being scored",passed:"Passed",failed:"Not passed yet"},_=e=>e.reduce((t,s)=>t+(Number(s.points)||0),0),je=(e,t)=>{let s=[...new Set(e)].sort((r,o)=>r-o),n=[...new Set(t)].sort((r,o)=>r-o);return s.length===n.length&&s.every((r,o)=>r===n[o])},ue=e=>e.questions.some(t=>Y(t)?Array.isArray(t.correct):t.rubric!==void 0||t.explanation!==void 0);function He(e,t){return ue(e)?"":t?e.status==="passed"?"":"The right answers and their explanations show here once you\u2019ve passed this test. Until then you can see which questions you got right, and your mentor\u2019s comments.":"You\u2019re taking this test yourself, so its answers stay hidden from you until you\u2019ve passed it. You can still score the written answers."}function A(e,t){return b(e)||!e.correct?null:Array.isArray(t)&&je(t.filter(s=>typeof s=="number"),e.correct)}function D(e,t){return e.reduce((s,n)=>s+(A(n,t[n.id])&&Number(n.points)||0),0)}var V=(e,t,s)=>t===0||e*100>=s*t,L=(e,t)=>e===null?null:t?Math.round(e/t*100):100;function Ye(e){return e.total===null||e.status==="submitted"||e.status==="scored"?`${P(e.auto_score)} of ${P(e.max)} so far, written answers to be scored`:`${P(e.total)} of ${P(e.max)} (${L(e.total,e.max)}%)`}var P=e=>Number.isInteger(e)?String(e):e.toFixed(1);function _e(e,t){return e.map((s,n)=>{let r=t[s.id];return(b(s)?typeof r=="string"&&!!r.trim():Array.isArray(r)&&r.length>0)?0:n+1}).filter(Boolean)}function De(e,t,s){let n=Array.isArray(t)?t:[];return e.type!=="multi"?[s]:n.includes(s)?n.filter(r=>r!==s):[...n,s].sort((r,o)=>r-o)}function Ve(e,t=Date.now()){if(!e)return{canTake:!1,line:""};if(e.passed)return{canTake:!1,line:"Passed."};if(e.waiting)return{canTake:!1,line:"Your answers are with your mentor to be scored."};let s=e.allowed-e.used;return s<=0?{canTake:!1,line:"Every attempt is used. Ask your mentor or the coven\u2019s head about another."}:e.next_at&&new Date(e.next_at).getTime()>t?{canTake:!1,line:`You can take it again ${de(new Date(e.next_at),t)}.`}:{canTake:!0,line:`${e.used===0?`${s} attempt${s===1?"":"s"}`:`${s} more attempt${s===1?"":"s"}`} allowed.`}}function de(e,t=Date.now()){let s=(e.getTime()-t)/36e5;return s<=1?"within the hour":s<12?`in ${Math.ceil(s)} hours`:`after ${e.toLocaleString(void 0,{weekday:"long",day:"numeric",month:"long",hour:"numeric",minute:"2-digit"})}`}function Qe(e){let t=e.status==="passed"||e.status==="failed";return e.questions.map((s,n)=>{var h,u;let r=e.answers[s.id];if(b(s)){let l=e.manual_scores[s.id];return{question:s,number:n+1,answer:r,right:null,points:t&&l?l.points:null,comment:t&&l?l.comment:null}}let o=(h=e.marks)==null?void 0:h[s.id],i=(u=A(s,r))!=null?u:typeof o=="boolean"?o:null;return{question:s,number:n+1,answer:r,right:i,points:i===null?null:i?s.points:0,comment:null}})}var Fe=(e,t)=>Array.isArray(t)?t.map(s=>{var n,r;return(r=(n=e.options)==null?void 0:n[s])!=null?r:""}).filter(Boolean).join("; ")||"No answer":(t!=null?t:"").trim()||"No answer",Be=e=>{var t;return((t=e.correct)!=null?t:[]).map(s=>{var n,r;return(r=(n=e.options)==null?void 0:n[s])!=null?r:""}).filter(Boolean).join("; ")};function Ge(e,t){return e.filter(s=>(s.status==="submitted"||s.status==="scored")&&(t.head||s.user_id!==t.userId&&(t.programs||t.mentees.includes(s.user_id)))).sort((s,n)=>s.submitted_at.localeCompare(n.submitted_at))}function Je(e,t,s){let n={},r=[];return e.forEach((o,i)=>{var g,w;if(!b(o))return;let h=t[o.id],u=((g=h==null?void 0:h.points)!=null?g:"").trim();if(!u){s&&r.push(`Question ${i+1} needs its points.`);return}let l=Number(u);if(!Number.isFinite(l)||l<0||l>o.points){r.push(`Question ${i+1}: from 0 to ${o.points} points.`);return}n[o.id]={points:l,comment:((w=h==null?void 0:h.comment)!=null?w:"").trim()}}),{scores:n,errors:r}}var ce=(e,t="single")=>({id:`q${e}`,type:t,prompt:"",options:t==="truefalse"?["True","False"]:t==="short"||t==="long"?void 0:["",""],correct:t==="short"||t==="long"?void 0:[0],points:t==="short"?2:t==="long"?4:1,explanation:"",rubric:t==="short"||t==="long"?"":void 0});function Ue(e){let t=new Set(e.map(n=>n.id)),s=e.length+1;for(;t.has(`q${s}`);)s+=1;return`q${s}`}function Ke(e,t){var r,o,i,h;let s=ce(1,t),n=t!=="short"&&t!=="long";return{...e,type:t,options:t==="truefalse"?["True","False"]:n?e.options&&e.options.length>=2&&e.type!=="truefalse"?e.options:s.options:void 0,correct:n?t==="multi"?(r=e.correct)!=null?r:[0]:[(i=(o=e.correct)==null?void 0:o[0])!=null?i:0]:void 0,rubric:n?void 0:(h=e.rubric)!=null?h:""}}function Ze(e){let t=[];e.title.trim()||t.push("Give the test a title."),e.pass_percent>=1&&e.pass_percent<=100||t.push("The pass mark is from 1 to 100 percent."),e.retakes>=0&&e.retakes<=20||t.push("Retakes from 0 to 20."),e.wait_hours>=0&&e.wait_hours<=720||t.push("The wait between attempts is 0 to 720 hours."),e.questions.length>60&&t.push("A test can have up to 60 questions.");let s=new Set;return e.questions.forEach((n,r)=>{var i,h;let o=r+1;if((!n.id||s.has(n.id))&&t.push(`Question ${o} needs its own id.`),s.add(n.id),n.prompt.trim()||t.push(`Question ${o} needs its question.`),n.points>=0&&n.points<=100||t.push(`Question ${o}: points from 0 to 100.`),Y(n)){let u=(i=n.options)!=null?i:[];(u.length<2||u.length>12)&&t.push(`Question ${o}: two to twelve answers to choose from.`),u.some(g=>!g.trim())&&t.push(`Question ${o}: fill in every answer, or remove the empty ones.`);let l=(h=n.correct)!=null?h:[];l.length?n.type!=="multi"&&l.length!==1&&t.push(`Question ${o}: mark exactly one right answer.`):t.push(`Question ${o}: mark the right answer.`),l.some(g=>g<0||g>=u.length)&&t.push(`Question ${o}: a right answer isn\u2019t one of its answers.`)}}),t}var Xe=e=>({source_id:e.id,title:e.title,intro:e.intro,pass_percent:e.passPercent,questions:e.questions}),et=(e,t)=>`coven.quizDraft.${e}.${t}`;function tt(e){if(!e)return null;try{let t=JSON.parse(e);if(!t||typeof t!="object"||!t.answers||typeof t.answers!="object")return null;let s={};for(let[n,r]of Object.entries(t.answers))typeof r=="string"?s[n]=r.slice(0,8e3):Array.isArray(r)&&(s[n]=r.filter(o=>Number.isInteger(o)).slice(0,12));return{answers:s,at:Number(t.at)||0,index:Number.isInteger(t.index)?Number(t.index):0}}catch{return null}}var st="astro.course",nt=e=>({course:S,read:{},quizzes:{},startedAt:e.toISOString()});function rt(e){let t=e&&typeof e=="object"?e:{},s={};if(t.read&&typeof t.read=="object")for(let[r,o]of Object.entries(t.read))typeof o=="string"&&(s[r]=o);let n={};if(t.quizzes&&typeof t.quizzes=="object")for(let[r,o]of Object.entries(t.quizzes)){let i=o&&typeof o=="object"?o:{},h=Number(i.best);Number.isFinite(h)&&(n[r]={best:Math.max(0,Math.min(100,h)),passed:i.passed===!0,attempts:Math.max(1,Number(i.attempts)||1),lastAt:typeof i.lastAt=="string"?i.lastAt:"",last:Number.isFinite(Number(i.last))?Number(i.last):h})}return{course:S,read:s,quizzes:n,startedAt:typeof t.startedAt=="string"?t.startedAt:new Date(0).toISOString()}}function ot(e,t,s,n){var o;let r={...e.read};return s?r[t]=(o=r[t])!=null?o:n.toISOString():delete r[t],{...e,read:r}}function at(e,t){var o;let s=D(e.questions,t),n=_(e.questions),r=Object.fromEntries(e.questions.map(i=>[i.id,A(i,t[i.id])===!0]));return{total:s,max:n,percent:(o=L(s,n))!=null?o:0,passed:V(s,n,e.passPercent),right:r}}function it(e,t,s,n){var o,i;let r=e.quizzes[t];return{...e,quizzes:{...e.quizzes,[t]:{best:Math.max((o=r==null?void 0:r.best)!=null?o:0,s.percent),passed:!!(r!=null&&r.passed)||s.passed,attempts:((i=r==null?void 0:r.attempts)!=null?i:0)+1,lastAt:n.toISOString(),last:s.percent}}}}function pe(e,t){var r;let s=t.lessons.filter(o=>!!(e!=null&&e.read[o.id])).length,n=(r=e==null?void 0:e.quizzes[t.quiz.id])!=null?r:null;return{read:s,lessons:t.lessons.length,quiz:n,done:s===t.lessons.length&&!!(n!=null&&n.passed)}}function ht(e){let t=f.filter(r=>!!(e!=null&&e.read[r.id])).length,s=m.filter(r=>{var o;return(o=e==null?void 0:e.quizzes[r.quiz.id])==null?void 0:o.passed}).length,n=f.length+m.length;return{lessonsRead:t,lessons:f.length,quizzesPassed:s,quizzes:m.length,chaptersDone:m.filter(r=>pe(e,r).done).length,percent:Math.round((t+s)/n*100)}}function lt(e){var t;for(let s of m){let n=s.lessons.find(r=>!(e!=null&&e.read[r.id]));if(n)return{kind:"lesson",lesson:n,chapter:s};if(!((t=e==null?void 0:e.quizzes[s.quiz.id])!=null&&t.passed))return{kind:"quiz",chapter:s}}return null}function ut(e){var s;return(s=e.filter(n=>n.data&&typeof n.data=="object"&&n.data.course===S).sort((n,r)=>r.updatedAt.localeCompare(n.updatedAt))[0])!=null?s:null}var E={};T(E,{lessonHtml:()=>wt,parseInline:()=>x,parseLesson:()=>ge,readingTime:()=>ft,toHtml:()=>Q,unsupported:()=>bt,wordCount:()=>ye});var dt={safety:"safety","try this":"try",note:"note","your coven":"coven"};function x(e){let t=[],s=(i,h=!1,u=!1)=>{if(!i)return;let l=t[t.length-1];l&&!!l.bold===h&&!!l.italic===u?l.text+=i:t.push({text:i,...h?{bold:h}:{},...u?{italic:u}:{}})},n=/\*\*\*([^*]+?)\*\*\*|\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*/g,r=0,o;for(;o=n.exec(e);){if(s(e.slice(r,o.index)),o[1]!==void 0)s(o[1],!0,!0);else if(o[2]!==void 0)for(let i of x(o[2]))s(i.text,!0,!!i.italic);else s(o[3],!1,!0);r=o.index+o[0].length}return s(e.slice(r)),t}var ct=/^\s*[-*+]\s+(.*)$/,pt=/^\s*(\d{1,3})[.)]\s+(.*)$/,gt=/^(#{1,6})\s+(.*?)\s*#*\s*$/,mt=/^\s*(-{3,}|\*{3,}|_{3,})\s*$/;function ge(e){let t=String(e!=null?e:"").replace(/\r\n?/g,`
`).split(`
`);return me(t,!0)}function me(e,t){let s=[],n=[],r=null,o=()=>{n.length&&s.push({type:"paragraph",spans:x(n.join(" ").replace(/\s+/g," ").trim())}),n=[]},i=()=>{r&&s.push({type:"list",ordered:r.ordered,start:r.start,items:r.items.map(u=>x(u.trim()))}),r=null},h=()=>{o(),i()};for(let u=0;u<e.length;u+=1){let l=e[u];if(!l.trim()){h();continue}if(t&&/^\s*>/.test(l)){h();let k=[];for(;u<e.length&&/^\s*>/.test(e[u]);)k.push(e[u].replace(/^\s*>\s?/,"")),u+=1;u-=1,s.push(yt(k));continue}if(mt.test(l)){h(),s.push({type:"divider"});continue}let g=gt.exec(l);if(g){h(),s.push({type:"heading",level:Math.min(3,g[1].length),spans:x(g[2])});continue}let w=ct.exec(l),v=pt.exec(l);if(w||v){o();let k=!!v;(!r||r.ordered!==k)&&(i(),r={ordered:k,start:v?Number(v[1]):1,items:[]}),r.items.push(w?w[1]:v[2]);continue}if(r&&/^\s{2,}\S/.test(l)){r.items[r.items.length-1]+=` ${l.trim()}`;continue}i(),n.push(l.trim())}return h(),s}function yt(e){var r;let t=e.findIndex(o=>o.trim()),s=null,n="plain";if(t>=0){let o=/^\s*\*\*([^*]{1,40}?):\*\*\s*/.exec(e[t])||/^\s*\*\*([^*]{1,40}?)\*\*:\s*/.exec(e[t]);o&&(s=o[1].trim(),n=(r=dt[s.toLowerCase()])!=null?r:"plain",e=[...e],e[t]=e[t].slice(o[0].length))}return{type:"callout",kind:n,label:s,blocks:me(e,!1)}}function ye(e){return(String(e!=null?e:"").match(/[A-Za-z0-9À-ɏ'’]+/g)||[]).length}function ft(e){let t=e.minutes&&e.minutes>0?e.minutes:Math.max(1,Math.round(ye(e.body)/200));return`About ${t} minute${t===1?"":"s"}`}var fe=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");function W(e){return e.map(t=>{let s=fe(t.text);return t.italic&&(s=`<em>${s}</em>`),t.bold&&(s=`<strong>${s}</strong>`),s}).join("")}function Q(e){return e.map(t=>{switch(t.type){case"heading":return`<h${t.level+2} class="ls-h ls-h${t.level}">${W(t.spans)}</h${t.level+2}>`;case"paragraph":return`<p>${W(t.spans)}</p>`;case"list":return t.ordered?`<ol class="ls-list"${t.start!==1?` start="${t.start}"`:""}>${t.items.map(s=>`<li>${W(s)}</li>`).join("")}</ol>`:`<ul class="ls-list">${t.items.map(s=>`<li>${W(s)}</li>`).join("")}</ul>`;case"callout":return`<aside class="ls-callout ls-callout--${t.kind}">${t.label?`<p class="ls-callout__label">${fe(t.label)}</p>`:""}${Q(t.blocks)}</aside>`;case"divider":return'<hr class="ls-divider" />'}}).join("")}var wt=e=>Q(ge(e));function bt(e){let t=[];return/^\s*\|.*\|\s*$/m.test(e)&&t.push("a table"),/!\[[^\]]*\]\(/.test(e)&&t.push("an image"),/\[[^\]]+\]\([^)]+\)/.test(e)&&t.push("a link"),/<\/?[a-z][^>]*>/i.test(e)&&t.push("HTML"),/^ {2,}([-+]|\d+\.)\s/m.test(e)&&t.push("a nested list"),t}return Te(vt);})();
