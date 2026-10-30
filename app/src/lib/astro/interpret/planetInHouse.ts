// Every body in each house: the Sun to Pluto, Chiron, the lunar nodes and
// Black Moon Lilith, one file per body under planetInHouse/ (each a list of
// twelve, first house first). Key: keys.planetInHouse(body, house).

import type { ChartPointName } from '../signs.ts';
import { CHIRON_IN_HOUSE } from './planetInHouse/chiron.ts';
import { JUPITER_IN_HOUSE } from './planetInHouse/jupiter.ts';
import { LILITH_IN_HOUSE } from './planetInHouse/lilith.ts';
import { MARS_IN_HOUSE } from './planetInHouse/mars.ts';
import { MERCURY_IN_HOUSE } from './planetInHouse/mercury.ts';
import { MOON_IN_HOUSE } from './planetInHouse/moon.ts';
import { NEPTUNE_IN_HOUSE } from './planetInHouse/neptune.ts';
import { NORTH_NODE_IN_HOUSE, SOUTH_NODE_IN_HOUSE } from './planetInHouse/nodes.ts';
import { PLUTO_IN_HOUSE } from './planetInHouse/pluto.ts';
import { SATURN_IN_HOUSE } from './planetInHouse/saturn.ts';
import { SUN_IN_HOUSE } from './planetInHouse/sun.ts';
import { URANUS_IN_HOUSE } from './planetInHouse/uranus.ts';
import { VENUS_IN_HOUSE } from './planetInHouse/venus.ts';
import { keys, type Interpretation, type InterpretationTable } from './types.ts';

/** Each body's twelve houses, as written (index 0 is the first house). */
export const PLANET_IN_HOUSE_BY_BODY: Partial<Record<ChartPointName, Interpretation[]>> = {
  Sun: SUN_IN_HOUSE,
  Moon: MOON_IN_HOUSE,
  Mercury: MERCURY_IN_HOUSE,
  Venus: VENUS_IN_HOUSE,
  Mars: MARS_IN_HOUSE,
  Jupiter: JUPITER_IN_HOUSE,
  Saturn: SATURN_IN_HOUSE,
  Uranus: URANUS_IN_HOUSE,
  Neptune: NEPTUNE_IN_HOUSE,
  Pluto: PLUTO_IN_HOUSE,
  Chiron: CHIRON_IN_HOUSE,
  'North Node': NORTH_NODE_IN_HOUSE,
  'South Node': SOUTH_NODE_IN_HOUSE,
  Lilith: LILITH_IN_HOUSE,
};

export const PLANET_IN_HOUSE: InterpretationTable = Object.fromEntries(
  Object.entries(PLANET_IN_HOUSE_BY_BODY).flatMap(([body, list]) => list!.map((reading, i) => [keys.planetInHouse(body as ChartPointName, i + 1), reading])),
);
