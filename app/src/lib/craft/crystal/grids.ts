// Crystal grids: stones set out in a shape round a centre stone for one
// intent, activated, kept for a while and then taken down. Each grid is a
// craft entry in `crystal.grids` with its shape, stones, intent, how long it
// runs and a log; set on an altar, its stones are crystal objects linked back
// to it (livingState.app.grid). Grids as a practice are modern, from the
// crystal-healing books of the 1980s on; the shapes borrow from older sacred
// geometry. Pure.

export const GRIDS = 'crystal.grids';

export type GridShape = 'circle' | 'seed' | 'triangle' | 'square' | 'spiral' | 'star';

export const SHAPES: { key: GridShape; label: string; points: number; line: string }[] = [
  { key: 'circle', label: 'Circle', points: 8, line: 'Wholeness and protection: a ring with no way in or out.' },
  { key: 'seed', label: 'Seed of life', points: 6, line: 'Six round one, the seed of the flower of life pattern: growth and beginnings.' },
  { key: 'triangle', label: 'Triangle', points: 3, line: 'Three points: manifesting, and body, mind and spirit.' },
  { key: 'square', label: 'Square', points: 4, line: 'Four corners: grounding, stability and the four elements.' },
  { key: 'spiral', label: 'Spiral', points: 7, line: 'Drawing in towards the centre, or sending out from it.' },
  { key: 'star', label: 'Star', points: 5, line: 'Five points: the pentagram, the elements and spirit, protection.' },
];

export const shapeOf = (key: string) => SHAPES.find((s) => s.key === key) ?? SHAPES[0];

/** Where the points sit, round a centre at 0,0 within a radius of 1 (y down), in the order they're laid. */
export function shapePoints(shape: GridShape, count = shapeOf(shape).points): { x: number; y: number }[] {
  const n = Math.max(1, Math.min(12, Math.round(count)));
  const ring = (k: number, r = 1, start = -90) => Array.from({ length: k }, (_, i) => {
    const a = ((start + (360 * i) / k) * Math.PI) / 180;
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
  const round = (p: { x: number; y: number }) => ({ x: Math.round(p.x * 1000) / 1000, y: Math.round(p.y * 1000) / 1000 });
  switch (shape) {
    case 'seed':
      return ring(6, 0.8, -90).map(round);
    case 'triangle':
      return ring(3, 1, -90).map(round);
    case 'square':
      return ring(4, 1, -45).map(round);
    case 'star':
      // Laid in the order a pentagram is drawn: every second point.
      return [0, 2, 4, 1, 3].map((i) => ring(5, 1, -90)[i]).map(round);
    case 'spiral':
      return Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        const a = ((-90 + i * 100) * Math.PI) / 180;
        return round({ x: (0.25 + 0.75 * t) * Math.cos(a), y: (0.25 + 0.75 * t) * Math.sin(a) });
      });
    default:
      return ring(n, 1, -90).map(round);
  }
}

export type GridStone = { name: string; stoneId?: string; key?: string | null };
export type GridLog = { at: string; kind: 'set' | 'activated' | 'tended' | 'note' | 'closed'; text: string };
export type GridStatus = 'planned' | 'active' | 'closed';

export type Grid = {
  name: string;
  shape: GridShape;
  intent: string;
  centre: GridStone | null;
  points: GridStone[];
  /** How many days it runs: 0 for a single sitting, or until the full or new moon by date. */
  days: number;
  status: GridStatus;
  /** When it was activated (ISO), or ''. */
  startedAt: string;
  closedAt: string;
  /** The altar it's set on, if any. */
  altarId: string;
  log: GridLog[];
};

export const DURATIONS: { days: number; label: string }[] = [
  { days: 0, label: 'One sitting' },
  { days: 3, label: 'Three days' },
  { days: 7, label: 'A week' },
  { days: 14, label: 'Half a moon' },
  { days: 28, label: 'A whole moon' },
];

export const LOG_MAX = 120;

export function emptyGrid(shape: GridShape = 'seed'): Grid {
  return { name: '', shape, intent: '', centre: null, points: [], days: 7, status: 'planned', startedAt: '', closedAt: '', altarId: '', log: [] };
}

const cleanStone = (raw: unknown): GridStone | null => {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  const name = String(s.name ?? '').trim().slice(0, 60);
  if (!name) return null;
  return { name, ...(typeof s.stoneId === 'string' && s.stoneId ? { stoneId: s.stoneId } : {}), ...(typeof s.key === 'string' && s.key ? { key: s.key } : {}) };
};

export function normaliseGrid(raw: unknown): Grid {
  const g = (raw && typeof raw === 'object' ? raw : {}) as Partial<Grid>;
  const shape = SHAPES.some((s) => s.key === g.shape) ? (g.shape as GridShape) : 'seed';
  return {
    name: String(g.name ?? '').slice(0, 60),
    shape,
    intent: String(g.intent ?? '').slice(0, 120),
    centre: cleanStone(g.centre),
    points: Array.isArray(g.points) ? (g.points.map(cleanStone).filter(Boolean) as GridStone[]).slice(0, 12) : [],
    days: Math.max(0, Math.min(90, Math.round(Number(g.days)) || 0)),
    status: g.status === 'active' || g.status === 'closed' ? g.status : 'planned',
    startedAt: typeof g.startedAt === 'string' ? g.startedAt : '',
    closedAt: typeof g.closedAt === 'string' ? g.closedAt : '',
    altarId: typeof g.altarId === 'string' ? g.altarId : '',
    log: Array.isArray(g.log) ? g.log.filter((l) => l && typeof l.at === 'string' && typeof l.text === 'string').slice(-LOG_MAX) : [],
  };
}

export const gridName = (g: Pick<Grid, 'name' | 'intent' | 'shape'>) => g.name.trim() || (g.intent.trim() ? `${g.intent.trim()} grid` : `${shapeOf(g.shape).label} grid`);

/** Why it can't be set yet, or null. */
export function gridProblem(g: Pick<Grid, 'intent' | 'centre' | 'points'>): string | null {
  if (!g.intent.trim()) return 'Say what the grid is for first.';
  if (!g.centre) return 'Choose a centre stone.';
  if (!g.points.length) return 'Choose at least one stone for the points.';
  return null;
}

/** The points' stones, one for each place in the shape: repeating what was chosen in turn. */
export function pointStones(g: Pick<Grid, 'shape' | 'points'>): GridStone[] {
  const places = shapePoints(g.shape).length;
  if (!g.points.length) return [];
  return Array.from({ length: places }, (_, i) => g.points[i % g.points.length]);
}

/** Activation, step by step: a modern practice, offered as one way among many. */
export function activationSteps(g: Pick<Grid, 'intent' | 'centre' | 'shape' | 'days'>): string[] {
  const centre = g.centre?.name ?? 'the centre stone';
  return [
    'Cleanse every stone first: smoke, sound or moonlight suit almost all of them.',
    `Hold ${centre} and say what the grid is for${g.intent.trim() ? `: ${g.intent.trim().toLowerCase()}` : ''}. Write it on a slip of paper and set it underneath if you like.`,
    `Place ${centre} in the middle, then the points from the top, sunwise${g.shape === 'star' ? ', in the order a pentagram is drawn' : g.shape === 'spiral' ? ', from the inside outwards' : ''}.`,
    'With a quartz point, a wand or a finger, trace a line from the centre out to each point and back, then round the outside, joining them.',
    g.days ? `Leave it in place for ${g.days} days. Each day, sit with it a moment and restate the intent.` : 'Sit with it while it holds your attention, then take it down.',
    'To close it, thank the stones, take them up in reverse order, and cleanse them before they go back to the shelf.',
  ];
}

const DAY = 86_400_000;

/** How it stands: "Day 3 of 7", "Ended 2 days ago", "Not yet activated". */
export function gridProgress(g: Pick<Grid, 'status' | 'startedAt' | 'days' | 'closedAt'>, now: Date): { line: string; day: number; done: boolean } {
  if (g.status === 'closed') return { line: g.closedAt ? `Taken down ${new Date(g.closedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : 'Taken down', day: 0, done: true };
  if (g.status !== 'active' || !g.startedAt) return { line: 'Not yet activated', day: 0, done: false };
  const start = new Date(g.startedAt);
  const day = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) / DAY) + 1;
  if (!g.days) return { line: 'Active: a single sitting', day, done: day > 1 };
  if (day > g.days) return { line: `Its ${g.days} days are done: time to take it down`, day, done: true };
  return { line: `Day ${day} of ${g.days}`, day, done: false };
}

export function logGrid(g: Grid, kind: GridLog['kind'], text: string, at: string): Grid {
  const entry: GridLog = { at, kind, text: text.trim().slice(0, 500) };
  if (kind === 'activated') return { ...g, status: 'active', startedAt: at, log: [...g.log, entry].slice(-LOG_MAX) };
  if (kind === 'closed') return { ...g, status: 'closed', closedAt: at, log: [...g.log, entry].slice(-LOG_MAX) };
  return { ...g, log: [...g.log, entry].slice(-LOG_MAX) };
}

/** Tended today already? */
export const tendedToday = (g: Pick<Grid, 'log'>, now: Date) => g.log.some((l) => (l.kind === 'tended' || l.kind === 'activated') && new Date(l.at).toDateString() === now.toDateString());
