// Aspects of the Sun and the Moon (the lights) to everything after them in
// BODY_ORDER. The Sun and Mercury, and the Sun and Venus, can only meet by
// conjunction (Mercury is never more than 28° from the Sun, Venus never more
// than 47°), so their other aspects are not written.

import type { PairSeed } from './types.ts';

export const LIGHT_PAIRS: Record<string, PairSeed> = {
  "Sun|Moon": {
    core: "The Sun is what you are becoming and the Moon is what you need to feel safe; their aspect shows how well your will and your feelings get on.",
    magic: "Sun and Moon together are the oldest pair in the craft: gold and silver, day and night, the god and goddess of many traditions. Work them with a gold and a silver candle, solar herbs such as calendula beside lunar ones such as mugwort, and time workings by the lunation you were born under.",
    conjunction: [
      "You were born at or near a new moon. What you want and what you need point the same way, which gives you focus and a single-minded quality.",
      "With the Sun and Moon conjunct you were born at a new moon, the start of a lunar cycle. Will and feeling are fused: you rarely feel torn between what you want and what you need, and you can pour yourself wholly into a thing. Many astrologers read new-moon births as people who begin things and act on instinct.\n\nThe gift is wholeness; the care is perspective. With both lights in one sign, it can be hard to step outside yourself and see how you come across, so friends who think differently are worth their weight in gold.",
    ],
    sextile: [
      "Your head and your heart cooperate. You can usually find a way to give yourself what you need while still going after what you want.",
      "A sextile between the lights is one of the kindest placements for inner peace. The Sun and Moon sit in signs of friendly elements, fire with air or earth with water, so your conscious aims and your emotional habits support each other.\n\nThis tends to show as good sense in daily life, ease with family and a knack for making a home that suits who you are becoming. Like every sextile, it rewards use: it grows when you deliberately check in with both your goals and your feelings.",
    ],
    square: [
      "Part of you wants to push ahead while another part needs to stay safe. Learning to hear both is the work, and it makes you resilient.",
      "Born near a quarter moon, you carry a built-in tension between the Sun's will and the Moon's needs. You may feel restless with your own habits, or find that what comforts you holds you back. Some people with this aspect remember parents who wanted different things.\n\nSquares are the aspect of effort, and this one gives drive: the friction makes you act, change and build. The growth is in noticing which voice is speaking, and making room for both rather than overriding one.",
    ],
    trine: [
      "Your will and feelings flow together easily. You tend to feel at home in yourself, and others find you comfortable to be around.",
      "With the lights trine, the Sun and Moon share an element, so what you aim for and what soothes you speak the same language. Traditionally this is a sign of good health, a settled temperament and easy relationships, because you are not fighting yourself.\n\nThe only risk of an easy trine is that comfort can become complacency. When life feels smooth, choose a challenge on purpose; your steadiness makes you good at carrying others through theirs.",
    ],
    opposition: [
      "You were born at or near a full moon. You see both sides of things clearly and find yourself through relationships, though you can feel pulled in two.",
      "Full-moon births are born with the lights facing each other across the sky: the Moon fully lit, everything shown. You are aware of yourself in a way that can feel like an inner conversation between what you want and what you need, and relationships act as a mirror where that conversation plays out.\n\nThe gift is awareness and a talent for seeing other people's points of view; the work is to stop swinging between extremes and to find the middle you can live in. Many full-moon people feel most alive at the full moon itself.",
    ],
  },
  "Sun|Mercury": {
    core: "The Sun and Mercury show how closely your thinking is tied to your sense of who you are.",
    magic: "Mercury beside the Sun makes the spoken word part of your personal power: spoken charms, written petitions, and spells signed with your name. Wednesdays and Sundays both suit you, and so do citrine and calendula.",
    conjunction: [
      "Your mind and your identity are bound together. You think about who you are, speak with conviction, and your ideas feel very much your own.",
      "Mercury is never far from the Sun, so the conjunction is common; it still matters. Your thoughts are coloured strongly by your Sun sign, and you tend to identify with what you think. This makes for a clear, confident voice and a mind that serves your purpose.\n\nWhen Mercury is very close (within about 8°, called combust in traditional astrology, or within a degree, called cazimi, \"in the heart of the Sun\"), traditions differ: combustion was said to hide the mind's work, while cazimi was read as a great strength. Either way, the care is listening: it can be hard to separate a criticism of your idea from a criticism of you.",
    ],
  },
  "Sun|Venus": {
    core: "The Sun and Venus show how much love, beauty and pleasure are part of who you are.",
    magic: "Venus with your Sun makes love and beauty magic part of your nature: glamour, self-love rites, rose and copper, offerings of flowers and sweetness. Fridays and Sundays are both your days.",
    conjunction: [
      "Charm and warmth come naturally to you. You care about beauty, pleasure and getting on with people, and you are often liked on sight.",
      "Venus never strays more than about 47° from the Sun, so the conjunction is the only major aspect the two can make. With it, Venus's grace is part of your core: you are drawn to art, harmony and pleasant company, and you tend to soften rooms you walk into.\n\nTraditional astrology reads a very close conjunction as Venus hidden by the Sun's beams, and the cazimi (within a degree) as Venus at full strength. Either way, the care is in not trading your own wants for being liked.",
    ],
  },
  "Sun|Mars": {
    core: "The Sun and Mars show how your will turns into action: how you assert yourself, compete and fight for what matters.",
    magic: "Mars beside the Sun is warrior fire: protection, courage, cord cutting and defensive magic. Tuesdays and Sundays, red and gold candles, dragon's blood, carnelian and bloodstone are allies, and a lit flame can be a working of its own.",
    conjunction: [
      "You have strong drive, physical energy and courage. You act on your will directly, and you are happiest with something to fight for.",
      "Mars conjunct the Sun puts a warrior at the centre of the self. You are energetic, competitive and direct; you would rather act than wait, and you tend to go at life with your whole body.\n\nThis is a gift for any work that needs nerve. The care is anger and haste: the same fire that makes you brave can make you quick to fight. Physical outlets help enormously, and so does picking battles that are worth you.",
    ],
    sextile: [
      "You can act on your aims without fuss. Opportunities to prove yourself come, and you have the energy to take them.",
      "A sextile from Mars gives the Sun a steady supply of initiative. You can assert yourself without starting wars, and you are good at turning plans into effort.\n\nLike all sextiles, this one rewards the person who uses it: sport, physical craft, a cause or a project you push forward. It is the aspect of someone who finishes the race they entered.",
    ],
    square: [
      "You have a lot of fire and sometimes it gets ahead of you. Learning when to push and when to wait turns this into real strength.",
      "Mars square the Sun gives a restless, fighting energy: you may feel you have to prove yourself, or clash with authority, or find that your temper outruns your intentions. Many athletes, campaigners and makers have it, because the friction wants somewhere to go.\n\nThe work is channelling: give the drive a target worthy of it, and learn the pause before the reaction. Handled well, this is the aspect of courage under pressure.",
    ],
    trine: [
      "Your drive and your sense of self work in harmony. You act confidently, with stamina, and people trust your energy.",
      "With Mars trine the Sun, your will flows into action easily. You tend to be physically robust, decisive and good at leading by example, and you rarely doubt your right to go after what you want.\n\nThe ease can make you underestimate how hard things are for others, so use the gift generously: protect, coach and stand up for those with less fire than you.",
    ],
    opposition: [
      "Conflict tends to come to you through other people. You learn about your own strength by meeting rivals, partners and challengers.",
      "Mars opposite the Sun puts your drive across the sky from your sense of self, so it often seems to arrive from outside: competitive partners, rivals, people who push your buttons. You may find yourself either fighting or giving way, swinging between the two.\n\nThe growth is to own your Mars: to admit your anger and ambition so you are not meeting them only in others. Many people with this aspect become fine negotiators and advocates.",
    ],
  },
  "Sun|Jupiter": {
    core: "The Sun and Jupiter show how far faith, generosity and optimism are part of your character, and how big you let yourself be.",
    magic: "Jupiter with the Sun is the magic of blessing and increase: luck and prosperity spells, gratitude rites, bay leaves, cinnamon, oak and blue or purple candles on Thursdays and Sundays. Your blessings carry well, so give them.",
    conjunction: [
      "You have a big heart and a big outlook. Optimism, generosity and faith in life are central to who you are.",
      "Jupiter conjunct the Sun enlarges everything about the self: warmth, confidence, humour, appetite. Traditionally this is a fortunate placement, a sign of protection and good will from others, and many people with it are natural teachers or hosts.\n\nThe care is excess: promising more than you can do, or assuming things will always work out. Jupiter gives most when its abundance is shared.",
    ],
    sextile: [
      "Good luck comes when you reach for it. You are hopeful and open-minded, and doors tend to open when you knock.",
      "The sextile gives the Sun a friendly link with Jupiter: opportunities, teachers and helpful people turn up, especially when you are learning, travelling or teaching.\n\nYou may not feel especially lucky, because the sextile needs action to work; what you have is a knack for meeting chances halfway. Say yes to the invitation.",
    ],
    square: [
      "You aim high and sometimes overreach. Your hunger for more is a gift once you learn where enough is.",
      "Jupiter square the Sun gives big appetites and big plans. You may overcommit, overspend or overpromise, or wrestle with questions of belief and meaning. There is real generosity here, and a sense that life should be larger than it is.\n\nSquares ask for effort: here the effort is scale. Choose fewer things and do them fully, and your vision becomes achievement rather than restlessness.",
    ],
    trine: [
      "Life tends to be kind to you, and you are kind back. You have an easy confidence and a natural sense of meaning.",
      "Jupiter trine the Sun is one of the classic signs of good fortune: a buoyant temperament, help when you need it, and faith that carries you through hard times. People are drawn to your warmth.\n\nBecause it comes so easily, the gift can go unused. Put it to work: teach, travel, write, mentor. Jupiter grows when it is given away.",
    ],
    opposition: [
      "You meet growth and opportunity through other people. You learn to balance your own aims with what generous offers ask of you.",
      "With Jupiter opposite the Sun, expansion tends to arrive through partners, teachers and patrons. You may be generous to a fault, or attract people who promise much, and you are learning where your path ends and theirs begins.\n\nThe gift is breadth of view and a talent for bringing people together. The care is in not giving away your judgement to whoever seems biggest.",
    ],
  },
  "Sun|Saturn": {
    core: "The Sun and Saturn show how discipline, duty and time shape your sense of self: where you have to earn your confidence, and how solid it becomes.",
    magic: "Saturn with the Sun is the magic of foundations and boundaries: binding, protection, long workings over many nights, and spells for patience and success that lasts. Saturdays, black or indigo candles, onyx, jet, comfrey and cypress are allies, and so is honouring ancestors and elders.",
    conjunction: [
      "You are serious, responsible and determined. Confidence came slowly, but what you build lasts.",
      "Saturn conjunct the Sun puts weight at the centre of the self. Many people with it felt old young, carried responsibility early, or had a parent who was strict or absent. Life may feel like a long climb.\n\nThe reward is real authority: self-respect built brick by brick, and a gift for endurance that others lean on. The growth is in gentleness with yourself, and in letting joy in without having earned it first.",
    ],
    sextile: [
      "You have good sense and staying power. You can plan, work steadily and turn your aims into something real.",
      "The sextile lends the Sun Saturn's best qualities without its weight: patience, structure and a practical mind. You tend to be respected for reliability and to do well over time.\n\nUse it deliberately: set the long goal, keep the routine, take the responsibility. This aspect turns effort into results.",
    ],
    square: [
      "You may have felt held back or judged, and you push hard to prove yourself. Your strength is earned, and it is real.",
      "Saturn square the Sun often feels like resistance: obstacles, self-doubt, demanding authorities, or a feeling that nothing comes easily. Many people with it were hard on themselves early.\n\nThis is the aspect of the late bloomer and the self-made person. The work is to stop waiting for permission, to build your own structure, and to be kinder to yourself than your critics were. Success comes, often in the second half of life.",
    ],
    trine: [
      "You are steady, capable and trustworthy. Discipline comes naturally and your achievements grow quietly over time.",
      "Saturn trine the Sun gives a calm, organised strength. You know how to wait, how to work and how to keep your word, and others trust you with responsibility.\n\nThe ease can make you cautious; you may stay safe where a risk would serve you. Let Saturn's patience be the base you leap from, not the wall you stay behind.",
    ],
    opposition: [
      "Limits and responsibilities often come through other people. You learn about your own authority by meeting others' rules and demands.",
      "With Saturn opposite the Sun, the world can seem full of people who judge, restrict or ask too much of you: bosses, partners, parents. You may swing between giving way and resisting.\n\nThe growth is to find your own Saturn inside: the boundaries you choose, the commitments you keep because you mean them. Relationships with this aspect often become solid and long-lasting once that is done.",
    ],
  },
  "Sun|Uranus": {
    core: "The Sun and Uranus show how far your sense of self needs freedom, originality and room to be different.",
    magic: "Uranus with the Sun brings lightning to your magic: sudden inspiration, spells for change and breaking free, technology as a tool, and workings with a group or cause. Storm water, electric blue candles, amber and clear quartz suit you, and so does the unexpected moment rather than the planned one.",
    conjunction: [
      "You are an original. You need freedom to be yourself and you tend to stand apart from the crowd, often ahead of it.",
      "Uranus conjunct the Sun puts the rebel and inventor at your core. You may have felt different from early on, resist being told who to be, and change direction suddenly when life gets too small.\n\nThe gift is genuine originality and the courage to live it. The care is restlessness, and rebelling for its own sake; freedom is richest when it is for something.",
    ],
    sextile: [
      "You welcome change and have fresh ideas. You can be yourself without needing to fight anyone about it.",
      "A sextile from Uranus lets the Sun take on new ideas easily: you are open-minded, inventive and good with change, technology and unusual people.\n\nIt works best when you act on your sparks of insight rather than just enjoying them. Small experiments suit you.",
    ],
    square: [
      "You need freedom and can be restless with any routine. Sudden changes shape your life, and they make you adaptable.",
      "Uranus square the Sun gives an electric, impatient energy. You may chafe against rules, change plans abruptly, or find life interrupted by surprises you did not choose.\n\nThe work is to build a life with room in it, so that freedom does not have to break things to get out. Handled well, this is the aspect of the reformer.",
    ],
    trine: [
      "You are inventive and independent without much drama. Change tends to work in your favour.",
      "Uranus trine the Sun gives an easy relationship with the new: you adapt quickly, have original ideas, and people accept your differences readily.\n\nUse it boldly. Your intuitions about where things are heading are often right; trust them enough to act.",
    ],
    opposition: [
      "Change and surprise often come through other people. You may be drawn to unusual partners, or to relationships that need lots of space.",
      "Uranus opposite the Sun projects your need for freedom onto others: unpredictable partners, sudden arrivals and departures, people who shake up your life.\n\nThe growth is to own your own Uranus, to give yourself the freedom you keep meeting in others, and to build relationships with both closeness and room.",
    ],
  },
  "Sun|Neptune": {
    core: "The Sun and Neptune show how much imagination, compassion and spiritual longing shape your sense of self, and how firm its edges are.",
    magic: "Neptune with the Sun opens you to visionary magic: dreamwork, scrying, trance, music, sea and water rites, and devotion. Moon water, sea salt, amethyst, lotus and mugwort suit you. Ground before and after, and close the circle firmly.",
    conjunction: [
      "You are imaginative, sensitive and spiritual. You feel the world deeply and may sometimes lose yourself in it.",
      "Neptune conjunct the Sun softens the self's edges. You are compassionate, artistic and attuned to atmosphere and the unseen, and many people with it are drawn to music, art, healing or mysticism.\n\nThe care is clarity: knowing your own wants, keeping boundaries, and checking ideals against facts. Your gift is real; it needs a vessel.",
    ],
    sextile: [
      "Imagination supports your purpose. You have intuition and artistic sense you can put to good use.",
      "The sextile lets Neptune's vision flow into what you do: creativity, intuition and kindness that fit easily into daily life.\n\nGive it a practice, whether art, meditation or service, and it grows into one of your best tools.",
    ],
    square: [
      "You may find it hard to see yourself clearly, or be pulled by ideals that blur. Grounding your dreams turns them into gifts.",
      "Neptune square the Sun can bring confusion about who you are or what you want, a pull toward escape, or a tendency to idealise people who let you down.\n\nThe work is discernment: daily practices that ground you, honest friends, and art or devotion where the longing can be expressed safely. Many deeply creative people have this aspect.",
    ],
    trine: [
      "You have a gentle, intuitive nature and a gift for art or spirit that comes easily.",
      "Neptune trine the Sun gives a graceful imagination and a natural spirituality. You can sense moods, inspire others and find meaning in beauty.\n\nThe risk is drift; the gift is real only when you show up for it. Make the art, keep the practice.",
    ],
    opposition: [
      "Others may seem like saviours or puzzles to you. Learning to see people as they are protects your heart.",
      "Neptune opposite the Sun often plays out in relationships: idealising partners, rescuing or being rescued, or confusion about where you end and they begin.\n\nThe growth is to keep your own centre while staying compassionate, and to put your longing for the divine where it belongs, in spirit and art.",
    ],
  },
  "Sun|Pluto": {
    core: "The Sun and Pluto show how intensity, power and transformation shape your sense of self.",
    magic: "Pluto with the Sun gives magic real depth: shadow work, banishing, protection, rebirth rites and work with the underworld powers. Obsidian, black candles, pomegranate and cypress suit you, and so do dark moons. Go carefully, and always come back up.",
    conjunction: [
      "You are intense, private and strong-willed. Life has asked you to transform more than once, and each time you come back stronger.",
      "Pluto conjunct the Sun puts depth at your core. You feel things fully, see beneath surfaces, and have a will that does not give up. Many people with it have lived through crises that remade them.\n\nThe care is control: the same power that transforms can grip too tightly. Your gift is in helping others through their own dark places.",
    ],
    sextile: [
      "You can make deep changes when you choose. You have quiet strength and insight into what drives people.",
      "The sextile gives the Sun access to Pluto's power without its storms: psychological insight, resourcefulness and the ability to renew yourself.\n\nIt is a strong placement for research, healing and any work that goes beneath the surface; use it on purpose.",
    ],
    square: [
      "Power struggles may have shaped you. You are learning to hold your strength without fighting for control.",
      "Pluto square the Sun often brings encounters with power: controlling figures, crises, or your own fierce will. Life may push you to transform when you would rather not.\n\nThe work is to stop meeting force with force and to find the power that does not need to win. This aspect makes formidable survivors.",
    ],
    trine: [
      "You have deep reserves of strength and come through change well. People sense your quiet power.",
      "Pluto trine the Sun gives resilience: you regenerate, you see what others miss, and you can lead through crisis.\n\nUse it for others as well as yourself: you can help people through change because it does not frighten you.",
    ],
    opposition: [
      "Intense people and situations come to you. You learn your own power by facing others who use theirs.",
      "Pluto opposite the Sun projects power outward: controlling partners, rivals or situations that demand transformation through relationship.\n\nThe growth is to own your Pluto, your own depth and will, so you meet others as an equal. Deep partnerships are possible here.",
    ],
  },
};
