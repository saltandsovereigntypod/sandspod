// Aspects among the slower bodies (Jupiter onwards), Chiron, the North Node
// and the angles. Aspects between two outer planets last months or years and
// are shared by everyone born then, so they are read as generational themes
// unless they also touch a personal planet or an angle.
// The Ascendant and Midheaven are never conjunct or opposite (the Midheaven
// is always somewhere in the upper half of the chart from the Ascendant), so
// only their sextile, square and trine are written.

import type { PairSeed } from './types.ts';

export const OUTER_PAIRS: Record<string, PairSeed> = {
  "Jupiter|Saturn": {
    core: "Jupiter and Saturn are the social planets, growth and limit, faith and duty. Their twenty-year cycle (the 'great conjunctions') was the backbone of historical astrology, and in a chart it shows how you balance expansion with structure.",
    magic: "Jupiter with Saturn suits workings for lasting success: prosperity that is built rather than wished for, vows, and spells for wise leadership. Thursdays and Saturdays, bay and cypress, sapphire and onyx, blue and black candles together.",
    conjunction: [
      "You are born near a great conjunction, a turning of the twenty-year social cycle. You combine vision with patience.",
      "Jupiter conjunct Saturn happens about every twenty years, and those born under it share a generation's turning point. Personally, it gives the ability to grow things slowly and solidly, and a sense that opportunity and responsibility come together.\n\nIf it touches personal planets or angles, it can mark a life of building institutions, businesses or traditions.",
    ],
    sextile: [
      "You can balance hope with realism, and grow things steadily.",
      "Jupiter sextile Saturn gives a practical optimism: you can plan for growth and stick to the plan.\n\nIt is an excellent aspect for any long project, from a garden to a career.",
    ],
    square: [
      "You may swing between expansion and caution. Learning when to push and when to wait is the work.",
      "Jupiter square Saturn brings a tension between wanting more and fearing loss, between faith and doubt.\n\nWhen you learn to plan boldly and act carefully, this aspect produces real achievement.",
    ],
    trine: [
      "Growth and structure work together easily for you.",
      "Jupiter trine Saturn gives good judgement, patience and steady success.\n\nYou know how to build on what you have.",
    ],
    opposition: [
      "You may feel pulled between freedom and duty, faith and caution.",
      "Jupiter opposite Saturn swings between optimism and pessimism, expansion and contraction, often through other people or institutions.\n\nThe growth is finding a middle path you can trust.",
    ],
  },
  "Jupiter|Uranus": {
    core: "Jupiter and Uranus show sudden luck, breakthroughs and a hunger for freedom and new horizons; it is a fourteen-year cycle shared by people born close together.",
    magic: "Jupiter with Uranus suits spells for sudden opportunity and breakthroughs. Thursdays, storm water, lapis and clear quartz.",
    conjunction: [
      "You are born for breakthroughs. Luck often comes suddenly.",
      "Jupiter conjunct Uranus gives an inventive, freedom-loving optimism.\n\nWhen it touches personal planets, it marks someone who seizes sudden chances.",
    ],
    sextile: [
      "Unexpected opportunities come your way.",
      "Jupiter sextile Uranus gives openness to the new and lucky timing.\n\nSay yes to surprises.",
    ],
    square: [
      "Restlessness can push you to take big leaps.",
      "Jupiter square Uranus brings a craving for freedom and change.\n\nLook before you leap.",
    ],
    trine: [
      "Change tends to bring you good fortune.",
      "Jupiter trine Uranus gives inventive luck.\n\nTrust new directions.",
    ],
    opposition: [
      "Sudden opportunities come through others.",
      "Jupiter opposite Uranus brings surprising offers and changes through people.\n\nStay grounded.",
    ],
  },
  "Jupiter|Neptune": {
    core: "Jupiter and Neptune show spiritual faith, idealism and compassion on a grand scale, and a thirteen-year cycle shared by people born close together.",
    magic: "Jupiter with Neptune suits devotional and spiritual magic, prayer, pilgrimage and charity as offering. Thursdays, amethyst and sea water, frankincense.",
    conjunction: [
      "You have deep faith and big dreams.",
      "Jupiter conjunct Neptune gives spiritual idealism and generosity.\n\nThe care is unrealistic hopes.",
    ],
    sextile: [
      "Your faith and imagination support each other.",
      "Jupiter sextile Neptune gives spiritual openness and kindness.\n\nIt suits devotion and art.",
    ],
    square: [
      "Your ideals may outrun reality. Grounding makes them real.",
      "Jupiter square Neptune can bring wishful thinking.\n\nCheck the details.",
    ],
    trine: [
      "You have an easy, generous spirituality.",
      "Jupiter trine Neptune gives grace and faith.\n\nShare your compassion.",
    ],
    opposition: [
      "Others may inspire or mislead you.",
      "Jupiter opposite Neptune brings idealism through others.\n\nThe growth is discernment.",
    ],
  },
  "Jupiter|Pluto": {
    core: "Jupiter and Pluto show the drive for power, wealth and transformation on a large scale, a twelve-to-thirteen-year cycle shared by people born close together.",
    magic: "Jupiter with Pluto suits prosperity and power magic with depth, and rites of regeneration. Thursdays, pyrite and obsidian.",
    conjunction: [
      "You have great ambition and power to transform.",
      "Jupiter conjunct Pluto gives a drive for influence and depth.\n\nThe care is excess and control.",
    ],
    sextile: [
      "You can grow and transform resources well.",
      "Jupiter sextile Pluto gives resourcefulness.\n\nInvest wisely.",
    ],
    square: [
      "You may push too hard for power or wealth.",
      "Jupiter square Pluto brings obsessive ambition.\n\nThe work is ethical power.",
    ],
    trine: [
      "You grow through transformation easily.",
      "Jupiter trine Pluto gives regenerative success.\n\nLead change.",
    ],
    opposition: [
      "Power struggles over growth may come through others.",
      "Jupiter opposite Pluto brings big conflicts of influence.\n\nThe growth is in sharing power.",
    ],
  },
  "Jupiter|Chiron": {
    core: "Jupiter and Chiron show a wound around faith, meaning or belonging, and the wisdom it grows into.",
    magic: "Jupiter with Chiron suits healing through teaching, faith and generosity.",
    conjunction: [
      "Your wisdom grows from your wounds.",
      "Jupiter conjunct Chiron makes a teacher of healing.\n\nShare what you learned.",
    ],
    sextile: [
      "Healing opportunities come through learning.",
      "Jupiter sextile Chiron brings help through teachers.\n\nTake it.",
    ],
    square: [
      "Faith may have been hurt. Rebuilding it brings wisdom.",
      "Jupiter square Chiron brings tension around meaning.\n\nSeek your own truth.",
    ],
    trine: [
      "You heal through faith and generosity.",
      "Jupiter trine Chiron gives wise healing.\n\nTeach.",
    ],
    opposition: [
      "Others may challenge your beliefs, and heal them.",
      "Jupiter opposite Chiron brings healing through others' wisdom.\n\nStay open.",
    ],
  },
  "Jupiter|North Node": {
    core: "Jupiter and the North Node show how faith, learning and growth relate to your path.",
    magic: "Jupiter with the nodes suits blessing magic at eclipse seasons.",
    conjunction: [
      "Growth and faith lead you forward. Your path is generous.",
      "Jupiter conjunct the North Node makes expansion part of your purpose.\n\nFollow opportunity.",
    ],
    sextile: [
      "Luck supports your growth.",
      "Jupiter sextile the North Node brings helpful chances.\n\nTake them.",
    ],
    square: [
      "Too much of a good thing may sidetrack you.",
      "Jupiter square the nodal axis asks for focus.\n\nChoose wisely.",
    ],
    trine: [
      "Your path is blessed with ease.",
      "Jupiter trine the North Node aligns growth and purpose.\n\nKeep going.",
    ],
    opposition: [
      "Old blessings come easily; growth asks new ones.",
      "Jupiter opposite the North Node sits on the South Node.\n\nShare your gifts in new ways.",
    ],
  },
  "Jupiter|Ascendant": {
    core: "Jupiter and the Ascendant show how much warmth, generosity and confidence colour the way you come across.",
    magic: "Jupiter on the Ascendant suits personal blessing and luck magic.",
    conjunction: [
      "You come across as warm, generous and confident.",
      "Jupiter conjunct the Ascendant gives a big, welcoming presence.\n\nThe care is overdoing it.",
    ],
    sextile: [
      "You are friendly and lucky in company.",
      "Jupiter sextile the Ascendant gives social ease.\n\nPeople help you.",
    ],
    square: [
      "You may overdo things. Proportion helps.",
      "Jupiter square the Ascendant brings excess in manner.\n\nBe measured.",
    ],
    trine: [
      "You radiate optimism and goodwill.",
      "Jupiter trine the Ascendant gives a blessed presence.\n\nShare it.",
    ],
    opposition: [
      "Partners bring growth and generosity.",
      "Jupiter opposite the Ascendant sits on the Descendant: fortunate partnerships.\n\nChoose well.",
    ],
  },
  "Jupiter|Midheaven": {
    core: "Jupiter and the Midheaven show how growth, luck and wisdom shape your career and reputation.",
    magic: "Jupiter on the Midheaven suits career and success magic on Thursdays.",
    conjunction: [
      "You are likely to be successful and respected in your work.",
      "Jupiter conjunct the Midheaven is a classic sign of public success.\n\nThe care is overreaching.",
    ],
    sextile: [
      "Opportunities come in your career.",
      "Jupiter sextile the Midheaven gives professional luck.\n\nTake chances.",
    ],
    square: [
      "Ambition may outrun resources.",
      "Jupiter square the Midheaven brings overcommitment.\n\nFocus.",
    ],
    trine: [
      "Success comes easily in your work.",
      "Jupiter trine the Midheaven gives a fortunate career.\n\nAim high.",
    ],
    opposition: [
      "Home and family bring blessings.",
      "Jupiter opposite the Midheaven sits at the IC: a blessed home.\n\nBuild from it.",
    ],
  },
  "Saturn|Uranus": {
    core: "Saturn and Uranus show the tension between tradition and change, order and freedom, a generational theme lasting a year or more at a time.",
    magic: "Saturn with Uranus suits workings that restructure: breaking old structures and building new ones. Saturdays, storm water and onyx.",
    conjunction: [
      "You combine discipline with originality.",
      "Saturn conjunct Uranus gives the power to build new structures.\n\nIt marks reformers.",
    ],
    sextile: [
      "You can reform things practically.",
      "Saturn sextile Uranus gives disciplined innovation.\n\nUse it.",
    ],
    square: [
      "You may feel torn between security and freedom.",
      "Saturn square Uranus brings tension between old and new.\n\nThe work is gradual change.",
    ],
    trine: [
      "Tradition and change work together for you.",
      "Saturn trine Uranus gives practical originality.\n\nBuild the new.",
    ],
    opposition: [
      "You meet the clash of old and new through others.",
      "Saturn opposite Uranus brings conflict between control and freedom.\n\nFind balance.",
    ],
  },
  "Saturn|Neptune": {
    core: "Saturn and Neptune show the meeting of reality and dream, form and spirit, a generational theme lasting a year or more.",
    magic: "Saturn with Neptune suits disciplined spiritual practice and making dreams real.",
    conjunction: [
      "You can give form to dreams.",
      "Saturn conjunct Neptune gives the ability to make ideals real.\n\nIt marks practical mystics.",
    ],
    sextile: [
      "You balance dreams and reality well.",
      "Saturn sextile Neptune gives grounded imagination.\n\nCreate.",
    ],
    square: [
      "Dreams and duty may clash.",
      "Saturn square Neptune brings disillusionment.\n\nThe work is realistic faith.",
    ],
    trine: [
      "Your dreams find form easily.",
      "Saturn trine Neptune gives practical spirituality.\n\nBuild your vision.",
    ],
    opposition: [
      "You meet the clash of dream and reality through others.",
      "Saturn opposite Neptune brings tension between fact and faith.\n\nHold both.",
    ],
  },
  "Saturn|Pluto": {
    core: "Saturn and Pluto show endurance under pressure and the power of slow, deep transformation, a generational theme lasting a year or more.",
    magic: "Saturn with Pluto suits powerful binding, protection and endurance rites.",
    conjunction: [
      "You have enormous endurance and depth.",
      "Saturn conjunct Pluto gives power through persistence.\n\nIt marks survivors.",
    ],
    sextile: [
      "You can transform structures wisely.",
      "Saturn sextile Pluto gives disciplined power.\n\nUse it.",
    ],
    square: [
      "Pressure may test you. You learn your strength.",
      "Saturn square Pluto brings hard tests.\n\nThe work is endurance.",
    ],
    trine: [
      "You have deep, steady strength.",
      "Saturn trine Pluto gives resilient power.\n\nYou endure.",
    ],
    opposition: [
      "You meet power and control through others.",
      "Saturn opposite Pluto brings struggles with authority.\n\nStand firm.",
    ],
  },
  "Saturn|Chiron": {
    core: "Saturn and Chiron show a wound around limits, authority or failure, and the mastery that comes from it.",
    magic: "Saturn with Chiron suits slow healing rites and ancestor healing.",
    conjunction: [
      "Old wounds around limits become your mastery.",
      "Saturn conjunct Chiron makes a wise elder of the wounded one.\n\nTeach.",
    ],
    sextile: [
      "You heal through discipline.",
      "Saturn sextile Chiron gives practical healing.\n\nBuild it.",
    ],
    square: [
      "Limits may hurt. Patience heals.",
      "Saturn square Chiron brings tension around failure.\n\nBe gentle.",
    ],
    trine: [
      "You heal steadily and wisely.",
      "Saturn trine Chiron gives mature healing.\n\nShare it.",
    ],
    opposition: [
      "Authorities may touch old wounds.",
      "Saturn opposite Chiron brings healing through authority.\n\nFind your own.",
    ],
  },
  "Saturn|North Node": {
    core: "Saturn and the North Node show how responsibility and discipline relate to your path.",
    magic: "Saturn with the nodes suits commitment magic at eclipse seasons.",
    conjunction: [
      "Responsibility leads you forward.",
      "Saturn conjunct the North Node makes discipline part of your purpose.\n\nCommit.",
    ],
    sextile: [
      "Structure supports your growth.",
      "Saturn sextile the North Node gives steady progress.\n\nKeep at it.",
    ],
    square: [
      "Fear may block your path.",
      "Saturn square the nodal axis asks for courage.\n\nPersist.",
    ],
    trine: [
      "Discipline aligns with purpose.",
      "Saturn trine the North Node gives steady growth.\n\nBuild.",
    ],
    opposition: [
      "Old duties come easily; growth asks new ones.",
      "Saturn opposite the North Node sits on the South Node.\n\nLet go of old weights.",
    ],
  },
  "Saturn|Ascendant": {
    core: "Saturn and the Ascendant show how much seriousness and reserve shape the way you come across.",
    magic: "Saturn on the Ascendant suits personal protection and boundary magic.",
    conjunction: [
      "You come across as serious and reserved.",
      "Saturn conjunct the Ascendant gives a mature presence.\n\nThe care is self-consciousness.",
    ],
    sextile: [
      "You are dependable and composed.",
      "Saturn sextile the Ascendant gives quiet authority.\n\nPeople trust you.",
    ],
    square: [
      "You may feel judged or self-conscious.",
      "Saturn square the Ascendant brings self-doubt.\n\nBe kinder to yourself.",
    ],
    trine: [
      "You carry yourself with steady dignity.",
      "Saturn trine the Ascendant gives composure.\n\nA reliable presence.",
    ],
    opposition: [
      "Partners may be serious or older.",
      "Saturn opposite the Ascendant sits on the Descendant: committed partnerships.\n\nChoose carefully.",
    ],
  },
  "Saturn|Midheaven": {
    core: "Saturn and the Midheaven show how discipline and ambition shape your career and reputation.",
    magic: "Saturn on the Midheaven suits career magic for lasting success.",
    conjunction: [
      "You build your career slowly and surely.",
      "Saturn conjunct the Midheaven gives ambition and authority.\n\nSuccess comes with time.",
    ],
    sextile: [
      "Steady work helps your career.",
      "Saturn sextile the Midheaven gives professional discipline.\n\nPersist.",
    ],
    square: [
      "Career may bring obstacles. Persistence wins.",
      "Saturn square the Midheaven brings professional tests.\n\nKeep going.",
    ],
    trine: [
      "You have a solid, respected career.",
      "Saturn trine the Midheaven gives steady success.\n\nBuild it.",
    ],
    opposition: [
      "Home may carry responsibility.",
      "Saturn opposite the Midheaven sits at the IC: family duty.\n\nTend roots.",
    ],
  },
  "Uranus|Neptune": {
    core: "Uranus and Neptune show a generation's ideals and spiritual awakenings; their aspects last years and are shared by everyone born then.",
    magic: "Uranus with Neptune suits collective spiritual work and visionary magic.",
    conjunction: [
      "Your generation seeks spiritual awakening and new ideals.",
      "Uranus conjunct Neptune (around 1993) marks a generation of visionary idealists.\n\nPersonal meaning comes where it touches your planets.",
    ],
    sextile: [
      "Your generation blends innovation and imagination.",
      "Uranus sextile Neptune is a long generational aspect.\n\nRead it through personal contacts.",
    ],
    square: [
      "Your generation wrestles with change and ideals.",
      "Uranus square Neptune is a generational tension.\n\nRead it through personal contacts.",
    ],
    trine: [
      "Your generation finds easy flow between change and spirit.",
      "Uranus trine Neptune is a generational harmony.\n\nRead it through personal contacts.",
    ],
    opposition: [
      "Your generation meets change and dream as opposites.",
      "Uranus opposite Neptune is a generational polarity.\n\nRead it through personal contacts.",
    ],
  },
  "Uranus|Pluto": {
    core: "Uranus and Pluto show a generation's revolutions and transformations; their aspects last years.",
    magic: "Uranus with Pluto suits collective change magic.",
    conjunction: [
      "Your generation is born for revolution.",
      "Uranus conjunct Pluto (mid-1960s) marks a generation of radical transformation.\n\nRead it through personal contacts.",
    ],
    sextile: [
      "Your generation channels change constructively.",
      "Uranus sextile Pluto is a generational aspect.\n\nRead it through personal contacts.",
    ],
    square: [
      "Your generation lives through upheaval.",
      "Uranus square Pluto is a generational tension.\n\nRead it through personal contacts.",
    ],
    trine: [
      "Your generation transforms with ease.",
      "Uranus trine Pluto is a generational harmony.\n\nRead it through personal contacts.",
    ],
    opposition: [
      "Your generation meets revolution through others.",
      "Uranus opposite Pluto is a generational polarity.\n\nRead it through personal contacts.",
    ],
  },
  "Uranus|Chiron": {
    core: "Uranus and Chiron show healing through freedom and wounds around being different.",
    magic: "Uranus with Chiron suits healing through innovation and community.",
    conjunction: [
      "Being different may have hurt; it is now your gift.",
      "Uranus conjunct Chiron makes difference a healing path.\n\nOwn it.",
    ],
    sextile: [
      "You heal through new methods.",
      "Uranus sextile Chiron gives inventive healing.\n\nExperiment.",
    ],
    square: [
      "Sudden changes may touch old wounds.",
      "Uranus square Chiron brings disruptive healing.\n\nStay grounded.",
    ],
    trine: [
      "You heal through freedom easily.",
      "Uranus trine Chiron gives liberating healing.\n\nShare it.",
    ],
    opposition: [
      "Others' freedom may touch your wounds.",
      "Uranus opposite Chiron brings healing through others.\n\nStay open.",
    ],
  },
  "Uranus|North Node": {
    core: "Uranus and the North Node show how change and freedom relate to your path.",
    magic: "Uranus with the nodes suits sudden-change magic at eclipse seasons.",
    conjunction: [
      "Change and freedom lead you forward.",
      "Uranus conjunct the North Node makes innovation part of your path.\n\nEmbrace change.",
    ],
    sextile: [
      "Change supports your growth.",
      "Uranus sextile the North Node brings helpful surprises.\n\nWelcome them.",
    ],
    square: [
      "Restlessness may disrupt your path.",
      "Uranus square the nodal axis brings sudden turns.\n\nStay focused.",
    ],
    trine: [
      "Freedom aligns with purpose.",
      "Uranus trine the North Node gives easy change.\n\nFollow it.",
    ],
    opposition: [
      "Old rebellions come easily; growth asks new ones.",
      "Uranus opposite the North Node sits on the South Node.\n\nChange differently.",
    ],
  },
  "Uranus|Ascendant": {
    core: "Uranus and the Ascendant show how much originality and unpredictability colour the way you come across.",
    magic: "Uranus on the Ascendant suits personal change and freedom magic.",
    conjunction: [
      "You come across as unusual, independent and electric.",
      "Uranus conjunct the Ascendant gives a striking, original presence.\n\nThe care is restlessness.",
    ],
    sextile: [
      "You are friendly and original.",
      "Uranus sextile the Ascendant gives quirky charm.\n\nBe yourself.",
    ],
    square: [
      "You may feel like an outsider.",
      "Uranus square the Ascendant brings tension between fitting in and standing out.\n\nStand out.",
    ],
    trine: [
      "You are easily yourself, original and free.",
      "Uranus trine the Ascendant gives easy originality.\n\nEnjoy it.",
    ],
    opposition: [
      "Partners bring surprise and need space.",
      "Uranus opposite the Ascendant sits on the Descendant: unusual partnerships.\n\nGive room.",
    ],
  },
  "Uranus|Midheaven": {
    core: "Uranus and the Midheaven show how change and originality shape your career.",
    magic: "Uranus on the Midheaven suits career-change magic.",
    conjunction: [
      "Your career may be unusual or change suddenly.",
      "Uranus conjunct the Midheaven gives an original vocation.\n\nFollow it.",
    ],
    sextile: [
      "Innovation helps your career.",
      "Uranus sextile the Midheaven gives new professional chances.\n\nTry them.",
    ],
    square: [
      "Career may be disrupted.",
      "Uranus square the Midheaven brings sudden professional changes.\n\nAdapt.",
    ],
    trine: [
      "Your career flows with change.",
      "Uranus trine the Midheaven gives inventive success.\n\nInnovate.",
    ],
    opposition: [
      "Home may be unsettled or unusual.",
      "Uranus opposite the Midheaven sits at the IC: changing roots.\n\nMake your own home.",
    ],
  },
  "Neptune|Pluto": {
    core: "Neptune and Pluto show the deepest generational currents of spirit and power; their aspects last decades.",
    magic: "Neptune with Pluto suits collective spiritual transformation.",
    conjunction: [
      "Your generation carries a deep spiritual transformation.",
      "Neptune conjunct Pluto last occurred around 1892.\n\nRead it as a long historical current.",
    ],
    sextile: [
      "You share a generation's quiet spiritual depth.",
      "Neptune sextile Pluto has lasted since the 1940s for most people alive.\n\nRead it through personal contacts.",
    ],
    square: [
      "A generational tension between spirit and power.",
      "Neptune square Pluto is a rare generational aspect.\n\nRead it through personal contacts.",
    ],
    trine: [
      "A generational harmony of spirit and power.",
      "Neptune trine Pluto is a rare generational aspect.\n\nRead it through personal contacts.",
    ],
    opposition: [
      "A generational polarity of spirit and power.",
      "Neptune opposite Pluto is a rare generational aspect.\n\nRead it through personal contacts.",
    ],
  },
  "Neptune|Chiron": {
    core: "Neptune and Chiron show spiritual wounds and spiritual healing.",
    magic: "Neptune with Chiron suits healing through prayer, music and water.",
    conjunction: [
      "Spirit is where you heal and are healed.",
      "Neptune conjunct Chiron makes spiritual healing a path.\n\nPractise it.",
    ],
    sextile: [
      "You heal through compassion and art.",
      "Neptune sextile Chiron gives gentle spiritual healing.\n\nShare it.",
    ],
    square: [
      "Spiritual confusion may touch old wounds.",
      "Neptune square Chiron brings tension around faith.\n\nGround it.",
    ],
    trine: [
      "You heal easily through spirit.",
      "Neptune trine Chiron gives grace in healing.\n\nUse it.",
    ],
    opposition: [
      "Others' ideals may touch your wounds.",
      "Neptune opposite Chiron brings healing through others' faith.\n\nDiscern.",
    ],
  },
  "Neptune|North Node": {
    core: "Neptune and the North Node show how spirit and imagination relate to your path.",
    magic: "Neptune with the nodes suits dreamwork at eclipse seasons.",
    conjunction: [
      "Spirit and imagination lead you forward.",
      "Neptune conjunct the North Node makes spirituality part of your path.\n\nFollow your dreams.",
    ],
    sextile: [
      "Imagination supports your growth.",
      "Neptune sextile the North Node gives inspired direction.\n\nTrust it.",
    ],
    square: [
      "Confusion may cloud your path.",
      "Neptune square the nodal axis asks for clarity.\n\nGround yourself.",
    ],
    trine: [
      "Spirit aligns with purpose.",
      "Neptune trine the North Node gives easy faith.\n\nKeep going.",
    ],
    opposition: [
      "Old dreams come easily; growth asks new ones.",
      "Neptune opposite the North Node sits on the South Node.\n\nDream anew.",
    ],
  },
  "Neptune|Ascendant": {
    core: "Neptune and the Ascendant show how much dreaminess and sensitivity colour the way you come across.",
    magic: "Neptune on the Ascendant suits glamour and protection magic.",
    conjunction: [
      "You come across as dreamy, gentle and hard to pin down.",
      "Neptune conjunct the Ascendant gives an elusive, sensitive presence.\n\nProtect yourself.",
    ],
    sextile: [
      "You have a gentle, intuitive manner.",
      "Neptune sextile the Ascendant gives soft charm.\n\nUse it kindly.",
    ],
    square: [
      "People may misread you.",
      "Neptune square the Ascendant brings confusion about image.\n\nBe clear.",
    ],
    trine: [
      "You are graceful and intuitive.",
      "Neptune trine the Ascendant gives a magical presence.\n\nShare it.",
    ],
    opposition: [
      "You are drawn to partners who seem enchanted, or who are hard to read.",
      "Neptune opposite the Ascendant sits on the Descendant: idealised partners.\n\nSee clearly.",
    ],
  },
  "Neptune|Midheaven": {
    core: "Neptune and the Midheaven show how spirit and imagination shape your career.",
    magic: "Neptune on the Midheaven suits career magic for artists and healers.",
    conjunction: [
      "Your calling may be artistic or spiritual.",
      "Neptune conjunct the Midheaven gives an inspired vocation.\n\nThe care is unclear goals.",
    ],
    sextile: [
      "Imagination helps your career.",
      "Neptune sextile the Midheaven gives creative chances.\n\nUse them.",
    ],
    square: [
      "Career direction may be unclear.",
      "Neptune square the Midheaven brings professional confusion.\n\nClarify.",
    ],
    trine: [
      "Your work flows from inspiration.",
      "Neptune trine the Midheaven gives an inspired career.\n\nTrust it.",
    ],
    opposition: [
      "Home is a sanctuary.",
      "Neptune opposite the Midheaven sits at the IC: a spiritual home.\n\nTend it.",
    ],
  },
  "Pluto|Chiron": {
    core: "Pluto and Chiron show deep wounds and deep healing, a generational theme for many.",
    magic: "Pluto with Chiron suits deep healing and rebirth rites.",
    conjunction: [
      "Deep healing is part of your generation's work.",
      "Pluto conjunct Chiron gives profound transformative healing.\n\nRead it through personal contacts.",
    ],
    sextile: [
      "You heal through transformation.",
      "Pluto sextile Chiron gives regenerative healing.\n\nUse it.",
    ],
    square: [
      "Deep wounds may surface.",
      "Pluto square Chiron brings intense healing crises.\n\nSeek help.",
    ],
    trine: [
      "You heal deeply and easily.",
      "Pluto trine Chiron gives powerful healing.\n\nShare it.",
    ],
    opposition: [
      "Others bring deep healing challenges.",
      "Pluto opposite Chiron brings healing through others.\n\nStay strong.",
    ],
  },
  "Pluto|North Node": {
    core: "Pluto and the North Node show how power and transformation relate to your path.",
    magic: "Pluto with the nodes suits transformation magic at eclipse seasons.",
    conjunction: [
      "Transformation leads you forward.",
      "Pluto conjunct the North Node makes deep change part of your path.\n\nEmbrace it.",
    ],
    sextile: [
      "Deep change, chosen rather than forced, supports your growth.",
      "Pluto sextile the North Node gives empowering direction.\n\nUse it.",
    ],
    square: [
      "Power struggles may test your path.",
      "Pluto square the nodal axis brings intense crossroads.\n\nChoose growth.",
    ],
    trine: [
      "Power aligns with purpose.",
      "Pluto trine the North Node gives transforming ease.\n\nKeep going.",
    ],
    opposition: [
      "Old power comes easily; growth asks new ways.",
      "Pluto opposite the North Node sits on the South Node.\n\nRelease control.",
    ],
  },
  "Pluto|Ascendant": {
    core: "Pluto and the Ascendant show how much intensity and power colour the way you come across.",
    magic: "Pluto on the Ascendant suits personal protection and transformation magic.",
    conjunction: [
      "You come across as intense, magnetic and private.",
      "Pluto conjunct the Ascendant gives a powerful presence.\n\nThe care is control.",
    ],
    sextile: [
      "You have quiet power.",
      "Pluto sextile the Ascendant gives subtle influence.\n\nUse it well.",
    ],
    square: [
      "Your intensity may provoke.",
      "Pluto square the Ascendant brings power struggles.\n\nSoften.",
    ],
    trine: [
      "You carry power gracefully.",
      "Pluto trine the Ascendant gives magnetic ease.\n\nLead.",
    ],
    opposition: [
      "Partners bring intensity.",
      "Pluto opposite the Ascendant sits on the Descendant: powerful partnerships.\n\nStay equal.",
    ],
  },
  "Pluto|Midheaven": {
    core: "Pluto and the Midheaven show how power and transformation shape your career.",
    magic: "Pluto on the Midheaven suits career magic for influence and change.",
    conjunction: [
      "Your career may involve power or transformation.",
      "Pluto conjunct the Midheaven gives powerful ambition.\n\nUse it ethically.",
    ],
    sextile: [
      "Depth helps your career.",
      "Pluto sextile the Midheaven gives professional insight.\n\nUse it.",
    ],
    square: [
      "Career may bring power struggles.",
      "Pluto square the Midheaven brings professional crises.\n\nTransform.",
    ],
    trine: [
      "Your work transforms things easily.",
      "Pluto trine the Midheaven gives influential success.\n\nLead.",
    ],
    opposition: [
      "Home is a place of transformation.",
      "Pluto opposite the Midheaven sits at the IC: deep roots.\n\nHeal family patterns.",
    ],
  },
  "Chiron|North Node": {
    core: "Chiron and the North Node show how healing relates to your path.",
    magic: "Chiron with the nodes suits healing magic at eclipse seasons.",
    conjunction: [
      "Healing is your path forward.",
      "Chiron conjunct the North Node makes healing part of your purpose.\n\nFollow it.",
    ],
    sextile: [
      "Healing supports your growth.",
      "Chiron sextile the North Node gives healing opportunities.\n\nTake them.",
    ],
    square: [
      "Old wounds may block your path.",
      "Chiron square the nodal axis asks you to heal.\n\nTend them.",
    ],
    trine: [
      "Healing aligns with purpose.",
      "Chiron trine the North Node gives easy healing growth.\n\nKeep going.",
    ],
    opposition: [
      "Old wounds feel familiar; growth asks healing.",
      "Chiron opposite the North Node sits on the South Node.\n\nHeal forward.",
    ],
  },
  "Chiron|Ascendant": {
    core: "Chiron and the Ascendant show a wound around the body or self-image, and how it becomes a healer's presence.",
    magic: "Chiron on the Ascendant suits self-healing and body blessing magic.",
    conjunction: [
      "You carry a visible wound that makes you a healer.",
      "Chiron conjunct the Ascendant gives a healer's presence.\n\nBe gentle with yourself.",
    ],
    sextile: [
      "You heal others by being yourself.",
      "Chiron sextile the Ascendant gives a healing manner.\n\nUse it.",
    ],
    square: [
      "Self-image may carry hurt.",
      "Chiron square the Ascendant brings tension around how you are seen.\n\nHeal it.",
    ],
    trine: [
      "You heal with ease and presence.",
      "Chiron trine the Ascendant gives a gentle healer's manner.\n\nShare it.",
    ],
    opposition: [
      "Partners may touch old wounds.",
      "Chiron opposite the Ascendant sits on the Descendant: healing through others.\n\nTend yourself.",
    ],
  },
  "Chiron|Midheaven": {
    core: "Chiron and the Midheaven show how healing relates to your career.",
    magic: "Chiron on the Midheaven suits career magic for healers and teachers.",
    conjunction: [
      "Your calling may involve healing or teaching.",
      "Chiron conjunct the Midheaven gives a healing vocation.\n\nFollow it.",
    ],
    sextile: [
      "Healing helps your career.",
      "Chiron sextile the Midheaven gives professional healing gifts.\n\nUse them.",
    ],
    square: [
      "Career may touch old wounds.",
      "Chiron square the Midheaven brings professional tension.\n\nHeal it.",
    ],
    trine: [
      "Healing flows into your work.",
      "Chiron trine the Midheaven gives an easy healing career.\n\nShare it.",
    ],
    opposition: [
      "Home and family carry old wounds.",
      "Chiron opposite the Midheaven sits at the IC: family healing.\n\nTend roots.",
    ],
  },
  "North Node|Ascendant": {
    core: "The North Node and the Ascendant show how your path of growth relates to how you meet the world.",
    magic: "The nodes on the Ascendant suit personal purpose magic at eclipse seasons.",
    conjunction: [
      "Growing into yourself is your path.",
      "The North Node conjunct the Ascendant makes self-development your purpose.\n\nBe yourself fully.",
    ],
    sextile: [
      "Your manner supports your growth.",
      "The North Node sextile the Ascendant gives easy progress.\n\nKeep going.",
    ],
    square: [
      "Your path may pull against your persona.",
      "The North Node square the Ascendant brings tension.\n\nGrow.",
    ],
    trine: [
      "Your path flows from who you are.",
      "The North Node trine the Ascendant gives ease.\n\nFollow it.",
    ],
    opposition: [
      "Partnership is your path.",
      "The North Node opposite the Ascendant sits on the Descendant: growth through others.\n\nCollaborate.",
    ],
  },
  "North Node|Midheaven": {
    core: "The North Node and the Midheaven show how your path relates to your career.",
    magic: "The nodes on the Midheaven suit career-purpose magic at eclipse seasons.",
    conjunction: [
      "Your career is your path.",
      "The North Node conjunct the Midheaven makes vocation your purpose.\n\nPursue it.",
    ],
    sextile: [
      "Career supports your growth.",
      "The North Node sextile the Midheaven gives professional progress.\n\nKeep going.",
    ],
    square: [
      "Career and path may clash.",
      "The North Node square the Midheaven brings tension.\n\nChoose growth.",
    ],
    trine: [
      "Your path flows into your work.",
      "The North Node trine the Midheaven gives ease.\n\nFollow it.",
    ],
    opposition: [
      "Home and roots are your path.",
      "The North Node opposite the Midheaven sits at the IC: growth through family.\n\nTend roots.",
    ],
  },
  "Ascendant|Midheaven": {
    core: "The Ascendant and the Midheaven are the two main angles: how you meet the world and where you are heading in it. The angle between them depends on your birth latitude and the rising sign.",
    magic: "The angles together suit workings that align self and calling: a personal sigil drawn from your rising sign and Midheaven sign.",
    sextile: [
      "Your personality and career fit together easily.",
      "The Ascendant sextile the Midheaven means the houses between are compressed: you move quickly from self to public life.\n\nCommon at higher latitudes with certain rising signs.",
    ],
    square: [
      "Your personality and career are distinct parts of your life.",
      "The Ascendant square the Midheaven is the equal-house norm: self and career as separate pillars.\n\nBalance them.",
    ],
    trine: [
      "Your personality and career flow together.",
      "The Ascendant trine the Midheaven means the houses between are wide: a long road from self to public life.\n\nCommon with certain rising signs at higher latitudes.",
    ],
  },
};
