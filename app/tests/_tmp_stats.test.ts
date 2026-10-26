import { JOURNEYS } from '../src/lib/journeys/index.ts';
for (const j of JOURNEYS.filter((x) => x.kind === 'deity')) {
  const st = j.stages.map((s) => `${s.kind[0]}${s.days}:${s.lessons.length}L${s.practices.length}P`).join(' ');
  const words = JSON.stringify(j).split(/\s+/).length;
  console.log(j.id.padEnd(18), j.paths.join(',').padEnd(22), st, 'w', words, 'src', j.sources.length, 'hd', j.holyDays.join(','));
}
