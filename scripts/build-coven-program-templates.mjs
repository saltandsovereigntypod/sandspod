// Builds the ready-made coven programs (one initiation and one training
// program for each holiday calendar people can follow) and writes them as
// the migration supabase/migrations/20261027000100_coven_program_templates.sql.
// A coven copies one as a draft (copy_coven_program_template) and makes it
// its own. The festivals come from the app's own calendars
// (app/src/lib/holidays.ts), so names and ids always match Settings.
//
//   node --experimental-strip-types scripts/build-coven-program-templates.mjs

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { TRADITIONS } from '../app/src/lib/holidays.ts';

const OUT = fileURLToPath(new URL('../supabase/migrations/20261027000100_coven_program_templates.sql', import.meta.url));

// How each calendar's practice is spoken of, so the programs read as its own.
const FLAVOR = {
  wheel: {
    label: 'Wheel of the Year',
    path: 'the Wheel of the Year',
    rite: 'sabbat',
    space: 'cast and close a circle, calling the quarters and the elements',
    divine: 'the God and Goddess, or the powers your coven honours',
    altar: 'an altar with the four elements and a candle for the divine',
    lore: 'the eight sabbats, the turning of the seasons and the myth cycle your coven tells',
    moon: { title: 'Keep the full moons', times: 13, text: 'Keep thirteen full-moon esbats across the year, with the coven when it gathers and alone when it does not.' },
  },
  wheel_south: null, // same as wheel, set below
  celtic: {
    label: 'Celtic',
    path: 'the Celtic fire festivals',
    rite: 'fire festival',
    space: 'make sacred space by fire, water and the three realms of land, sea and sky',
    divine: 'the gods and spirits of the land and the ancestors, as your coven honours them',
    altar: 'a hearth or fire altar with water from a well or spring, and an offering bowl',
    lore: 'the four fire festivals, the old Gaelic year, and the stories of Brigid, Lugh and the Cailleach',
    moon: { title: 'Keep the moons', times: 13, text: 'Mark thirteen full moons across the year with a small offering and a few words at your hearth.' },
  },
  norse: {
    label: 'Norse & Heathen',
    path: 'Heathen practice and the old Norse year',
    rite: 'blót',
    space: 'hallow a space (by fire, hammer or the coven’s own way) and hold a sumbel',
    divine: 'the gods, the ancestors and the landvættir (spirits of the land)',
    altar: 'a stalli (household altar) with a bowl for offerings and a place for the ancestors',
    lore: 'the blóts of the year, the Winter Nights and Yule, the Eddas, and gifting for a gift',
    moon: { title: 'Keep the monthly offerings', times: 12, text: 'Make a simple offering to the gods, ancestors or landvættir once a month for twelve months.' },
  },
  hellenic: {
    label: 'Hellenic',
    path: 'Hellenic (ancient Greek) practice',
    rite: 'festival',
    space: 'purify with khernips (lustral water) before ritual and pour libations',
    divine: 'the theoi, the household gods (Hestia first) and the heroes',
    altar: 'a household shrine with a flame for Hestia, a libation bowl and khernips',
    lore: 'the Attic festival year, Hesiod and the Homeric Hymns, and the virtues of kharis and xenia',
    moon: { title: 'Keep the monthly days', times: 12, text: 'Keep the Noumenia (the new month) and Hekate’s Deipnon for twelve months: cleanse the house, set out the supper, and greet the new month.' },
  },
  roman: {
    label: 'Roman',
    path: 'Roman religio and household practice',
    rite: 'feast',
    space: 'wash, veil and pray with the proper words, and offer incense, wine and grain',
    divine: 'the di immortales, the Lares and Penates, and the family’s ancestors',
    altar: 'a lararium (household shrine) for the Lares, the Penates and the genius of the house',
    lore: 'the Roman year, the household cult, pietas, and the do ut des of offering',
    moon: { title: 'Keep the Kalends', times: 12, text: 'Make an offering at the lararium on the Kalends (first day) of each month for twelve months.' },
  },
  slavic: {
    label: 'Slavic',
    path: 'Slavic folk practice',
    rite: 'feast',
    space: 'bless the space by fire and water, with bread and salt',
    divine: 'the old gods, the domovoi (house spirit) and the forefathers',
    altar: 'a red corner or hearth shrine with bread, salt and a candle for the ancestors',
    lore: 'the turning year from Koliada to Kupala and Dziady, folk songs and the care of the house spirit',
    moon: { title: 'Keep the moons', times: 12, text: 'Leave an offering for the domovoi or the ancestors at each full moon for twelve months.' },
  },
  christian: {
    label: 'Christian',
    path: 'folk Christian and saints’ practice',
    rite: 'feast day',
    space: 'bless the space with holy water, a candle and prayer',
    divine: 'God, the saints and the holy dead, as your coven’s practice holds them',
    altar: 'a prayer corner with a candle, holy water and images of the saints you keep',
    lore: 'the church year, the saints’ days kept in folk custom, and the charms, psalms and blessings of folk practice',
    moon: { title: 'Keep a monthly devotion', times: 12, text: 'Keep a candle and prayer devotion once a month for twelve months, for the saints or the holy dead.' },
  },
};
FLAVOR.wheel_south = { ...FLAVOR.wheel, label: 'Wheel of the Year (Southern Hemisphere)' };

const task = (title, kind, instructions, more = {}) => ({ title, kind, instructions, times: 1, response: 'none', checked_by: 'mentor', ...more });

function initiation(tradition, f) {
  const festivals = tradition.holidays.map((h) =>
    task(`Keep ${h.name}`, 'ritual', [
      `Keep ${h.name} with the coven, or on your own if the coven isn’t gathering.`,
      h.meaning ? `${h.meaning}` : '',
      `Afterwards, write what you did, what you noticed, and what ${h.name} means to you now.`,
    ].filter(Boolean).join('\n\n'), { response: 'text', holiday: `${tradition.id}/${h.id}` }),
  );
  return {
    id: `${tradition.id}-initiation`,
    kind: 'initiation',
    tradition: tradition.id,
    title: `${f.label}: a year and a day to initiation`,
    summary: `From seeker to initiate over a year and a day, keeping every ${f.rite} of ${f.path}.`,
    description: [
      `A traditional year and a day of study, practice and service before initiation, shaped around ${f.path}.`,
      'Each stage builds on the one before. Some tasks you sign off yourself; your mentor signs off most; the coven’s leaders confirm the oath and the initiation itself.',
      'Change anything to fit your coven: rename stages, add your own lore, set how long each stage takes, and choose who signs each task off.',
    ].join('\n\n'),
    stages: [
      {
        title: 'The threshold',
        intro: `Welcome. In this first stage you meet your mentor, read what the coven holds to, and set down why you seek ${f.path}.`,
        min_days: 0,
        passed_by: 'mentor',
        tasks: [
          task('Meet your mentor', 'meeting', 'Arrange a first conversation with your mentor. Talk about what drew you here, what you hope to learn, and how you’ll keep in touch through the year.'),
          task('Read the coven’s creed, rules and agreements', 'study', 'Read every page the coven has written, and ask your mentor about anything that isn’t clear.', { checked_by: 'self' }),
          task('Why I seek this path', 'reflection', `Write a page on why you seek ${f.path}, what you already practise, and what you hope the year will open.`, { response: 'text' }),
          task('Begin a magical diary', 'practice', 'Start a diary you’ll keep all year: dreams, workings, moods, the weather, the moon. Write in it at least once a week.', { checked_by: 'self' }),
          task('Set up your personal altar', 'practice', `Make ${f.altar} at home. Describe it, and why you chose what’s on it.`, { response: 'text' }),
        ],
      },
      {
        title: 'Foundations',
        intro: 'The skills everything else rests on: steadying yourself, keeping your space clean and warded, and making sacred space well.',
        min_days: 90,
        passed_by: 'mentor',
        tasks: [
          task('Ground and centre daily', 'practice', 'Ground and centre every day for thirty days: breath, roots, a calm centre. Log each day you do it.', { times: 30, checked_by: 'self', minutes: 10 }),
          task('Cleanse and ward your home', 'practice', 'Cleanse your home and set wards in the coven’s way. Write what you used and how the space felt before and after.', { response: 'text' }),
          task('Make sacred space', 'practice', `Learn to ${f.space}. Do it three times, then show your mentor.`, { times: 3 }),
          task('The elements and the directions', 'study', 'Study the elements (or the coven’s equivalent) and their correspondences: directions, colours, tools, times. Write a page for each.', { response: 'text' }),
          task('Ethics and consent', 'reflection', 'Write on the ethics of magic: harm, consent, working for others, and what you will and won’t do. Talk it through with your mentor.', { response: 'text' }),
          task('Meditation and trance', 'practice', 'Practise meditation or light trance twelve times, building from ten minutes to thirty.', { times: 12, checked_by: 'self' }),
        ],
      },
      {
        title: 'Turning the year',
        intro: `A year and a day of ${f.path}. Keep each ${f.rite} as it comes and learn ${f.lore}. This stage lasts at least a year and a day.`,
        min_days: 366,
        passed_by: 'mentor',
        tasks: [
          ...festivals,
          task(f.moon.title, 'attend', f.moon.text, { times: f.moon.times }),
          task('The lore of the year', 'study', `Study ${f.lore}. Write a short account in your own words.`, { response: 'text' }),
          task('Divination', 'practice', 'Learn one form of divination your coven uses. Do a reading every week for three months and keep a record of what came true.', { times: 12, checked_by: 'self' }),
          task('Relationship with the divine', 'reflection', `Keep a devotional practice to ${f.divine}. At the half-year, write about the relationship as it’s growing.`, { response: 'text' }),
        ],
      },
      {
        title: 'Service',
        intro: 'A coven is kept by its members. Give your craft and your time to the circle.',
        min_days: 0,
        passed_by: 'mentor',
        tasks: [
          task('Write a page for the coven’s book', 'book', 'Write a page for the coven’s Book of Shadows on something you’ve learned this year: a working, a recipe, a piece of lore. Send it for approval.', { checked_by: 'manager' }),
          task('Serve at coven rites', 'service', 'Help prepare and clear away at two coven rites: setting the altar, bringing what’s needed, welcoming others.', { times: 2 }),
          task('Lead a part of a ritual', 'ritual', 'Take one part of a coven ritual: calling a quarter, leading a chant, a reading, lighting the altar.'),
          task('A service to the wider community', 'service', 'Do something for people or land beyond the coven: a clean-up, a donation, help for someone in need. Write what you did.', { response: 'text', optional: true }),
        ],
      },
      {
        title: 'Dedication and initiation',
        intro: 'The end of the year and a day. You and the coven’s leaders decide together that you are ready.',
        min_days: 0,
        passed_by: 'manager',
        tasks: [
          task('A final conversation with your mentor', 'meeting', 'Look back on the year with your mentor: what changed, what’s still to learn, and whether you are ready.'),
          task('Write your oath', 'oath', 'Write the oath you will take at your initiation, in your own words, and share it with the coven’s leaders.', { response: 'text', checked_by: 'manager' }),
          task('Initiation', 'ritual', `Your initiation into the coven, held by its leaders in the way of ${f.path}.`, { checked_by: 'manager' }),
        ],
      },
    ],
  };
}

function training(tradition, f) {
  return {
    id: `${tradition.id}-training`,
    kind: 'training',
    tradition: tradition.id,
    title: `${f.label}: foundations of the craft`,
    summary: `Core training for members of a coven following ${f.path}, at your own pace.`,
    description: [
      `Eight modules of core skills for ${f.path}, from energy work to writing a full ritual.`,
      'Members can take the modules alongside an initiation program or on their own. Mentors sign off most tasks; the last module is reviewed by the coven’s leaders.',
    ].join('\n\n'),
    stages: [
      {
        title: 'Energy and self',
        intro: 'Feel, raise, direct and release energy, and keep yourself clear.',
        passed_by: 'mentor',
        tasks: [
          task('Grounding and centring', 'practice', 'Practise grounding and centring until you can do it in under a minute. Log ten sessions.', { times: 10, checked_by: 'self' }),
          task('Raising and directing energy', 'practice', 'Raise energy by breath, chant or movement, direct it into an object, then release and ground what’s left. Describe what you felt.', { response: 'text' }),
          task('Shielding', 'practice', 'Learn a shielding method and use it every day for a week.', { times: 7, checked_by: 'self' }),
        ],
      },
      {
        title: 'Sacred space',
        intro: `How to ${f.space}, and how to close it again cleanly.`,
        passed_by: 'mentor',
        tasks: [
          task('Make and close sacred space', 'practice', `Learn the coven’s way to ${f.space}. Do it five times.`, { times: 5 }),
          task('Purification', 'practice', 'Learn the coven’s purification before ritual and use it before every working this month.', { times: 4, checked_by: 'self' }),
          task('Write it down', 'book', 'Write out the coven’s way of making sacred space as you now do it, for your own book.', { response: 'text' }),
        ],
      },
      {
        title: 'Tools and the altar',
        intro: 'The tools your coven uses, how to cleanse and consecrate them, and how to keep an altar.',
        passed_by: 'mentor',
        tasks: [
          task('Your altar', 'practice', `Keep ${f.altar}. Tend it weekly for a month.`, { times: 4, checked_by: 'self' }),
          task('Consecrate a tool', 'ritual', 'Cleanse and consecrate one working tool. Write what you did and why.', { response: 'text' }),
        ],
      },
      {
        title: 'Correspondences, herbs and stones',
        intro: 'What things are for: plants, stones, colours, days and planetary hours.',
        passed_by: 'mentor',
        tasks: [
          task('Twelve plants', 'study', 'Learn twelve plants your coven works with: their uses, cautions and lore. Keep a page for each.', { times: 12, checked_by: 'self' }),
          task('Seven stones', 'study', 'Learn seven stones and how to cleanse and charge them.', { times: 7, checked_by: 'self' }),
          task('Days and hours', 'study', 'Learn the planetary days and hours and when to use them. Plan one working by them.', { response: 'text' }),
          task('Herbal safety', 'reflection', 'Write which herbs and oils need care (pregnancy, pets, skin, ingestion) and how you’ll check before using something new.', { response: 'text' }),
        ],
      },
      {
        title: 'Divination',
        intro: 'Read for yourself and, later, for others.',
        passed_by: 'mentor',
        tasks: [
          task('Learn a system', 'study', 'Choose a system (tarot, runes, ogham, oracle, scrying) and learn its basics.', { response: 'text' }),
          task('Daily draws', 'practice', 'Draw or cast daily for thirty days and note what each meant by evening.', { times: 30, checked_by: 'self' }),
          task('Read for your mentor', 'practice', 'Give your mentor a reading and talk through it together.'),
        ],
      },
      {
        title: 'Gods, spirits and ancestors',
        intro: `Build relationship with ${f.divine}.`,
        passed_by: 'mentor',
        tasks: [
          task('A devotional practice', 'practice', 'Keep a short daily devotion (an offering, a prayer, a candle) for a month.', { times: 30, checked_by: 'self' }),
          task('Honour your ancestors', 'ritual', 'Make a place for your ancestors (of blood, of spirit or of craft) and honour them. Write about who you honoured.', { response: 'text' }),
          task('Discernment', 'reflection', 'Write how you tell a real experience from wishful thinking, and when to ask for help.', { response: 'text' }),
        ],
      },
      {
        title: 'The year’s lore',
        intro: `Learn ${f.lore}.`,
        passed_by: 'mentor',
        tasks: tradition.holidays.slice(0, 13).map((h) =>
          task(`The lore of ${h.name}`, 'study', `Learn the history, customs and meaning of ${h.name}${h.meaning ? `: ${h.meaning}` : '.'} Write a short page of what you found.`, {
            response: 'text',
            checked_by: 'self',
            holiday: `${tradition.id}/${h.id}`,
          }),
        ),
      },
      {
        title: 'Ritual craft',
        intro: 'Bring it all together: write and lead a ritual of your own.',
        passed_by: 'manager',
        tasks: [
          task('Write a ritual', 'book', 'Write a complete ritual for the coven: its purpose, sacred space, the working, the words and the closing.', { response: 'text', checked_by: 'manager' }),
          task('Lead it', 'ritual', 'Lead your ritual for the coven or a few members, with your mentor present.', { checked_by: 'manager' }),
          task('Look back', 'reflection', 'Write what went well, what you’d change, and what the training has given you.', { response: 'text' }),
        ],
      },
    ],
  };
}

const esc = (value) => (value === null || value === undefined ? 'null' : `'${String(value).replace(/'/g, "''")}'`);

const templates = [];
TRADITIONS.forEach((tradition) => {
  const f = FLAVOR[tradition.id];
  if (!f || !tradition.holidays?.length) return;
  templates.push(initiation(tradition, f), training(tradition, f));
});

const lines = [
  '-- Generated by scripts/build-coven-program-templates.mjs. Do not edit by hand.',
  '-- The ready-made coven programs: an initiation and a training program for each',
  '-- holiday calendar, copied into a coven as drafts (copy_coven_program_template).',
  '',
];
templates.forEach((t, i) => {
  lines.push(
    `insert into public.coven_program_templates (id, kind, tradition, title, summary, description, stages, position) values (${[
      esc(t.id), esc(t.kind), esc(t.tradition), esc(t.title), esc(t.summary), esc(t.description), `${esc(JSON.stringify(t.stages))}::jsonb`, i,
    ].join(', ')})`,
    '  on conflict (id) do update set kind = excluded.kind, tradition = excluded.tradition, title = excluded.title, summary = excluded.summary,',
    '    description = excluded.description, stages = excluded.stages, position = excluded.position;',
  );
});
writeFileSync(OUT, `${lines.join('\n')}\n`);
console.log(`Wrote ${templates.length} programs to ${OUT}`);
