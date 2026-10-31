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
import { NEPTUNE_DEEPER, PLUTO_DEEPER, URANUS_DEEPER } from './planetInHouse/deeperOuter.ts';
import { JUPITER_DEEPER, MARS_DEEPER, SATURN_DEEPER } from './planetInHouse/deeperPersonal.ts';
import { CHIRON_DEEPER, LILITH_DEEPER, NORTH_NODE_DEEPER, SOUTH_NODE_DEEPER } from './planetInHouse/deeperPoints.ts';
import { deepen, type HouseDeeper } from './planetInHouse/deeperTypes.ts';
import { keys, type Interpretation, type InterpretationTable } from './types.ts';

/** A body's twelve readings with their further paragraph and craft line joined on (planetInHouse/deeper*.ts). */
const withDeeper = (list: Interpretation[], extra: HouseDeeper) => list.map((r, i) => deepen(r, extra[i]));

/** Each body's twelve houses, as written (index 0 is the first house). */
export const PLANET_IN_HOUSE_BY_BODY: Partial<Record<ChartPointName, Interpretation[]>> = {
  Sun: SUN_IN_HOUSE,
  Moon: MOON_IN_HOUSE,
  Mercury: MERCURY_IN_HOUSE,
  Venus: VENUS_IN_HOUSE,
  Mars: withDeeper(MARS_IN_HOUSE, MARS_DEEPER),
  Jupiter: withDeeper(JUPITER_IN_HOUSE, JUPITER_DEEPER),
  Saturn: withDeeper(SATURN_IN_HOUSE, SATURN_DEEPER),
  Uranus: withDeeper(URANUS_IN_HOUSE, URANUS_DEEPER),
  Neptune: withDeeper(NEPTUNE_IN_HOUSE, NEPTUNE_DEEPER),
  Pluto: withDeeper(PLUTO_IN_HOUSE, PLUTO_DEEPER),
  Chiron: withDeeper(CHIRON_IN_HOUSE, CHIRON_DEEPER),
  'North Node': withDeeper(NORTH_NODE_IN_HOUSE, NORTH_NODE_DEEPER),
  'South Node': withDeeper(SOUTH_NODE_IN_HOUSE, SOUTH_NODE_DEEPER),
  Lilith: withDeeper(LILITH_IN_HOUSE, LILITH_DEEPER),
};

export const PLANET_IN_HOUSE: InterpretationTable = Object.fromEntries(
  Object.entries(PLANET_IN_HOUSE_BY_BODY).flatMap(([body, list]) => list!.map((reading, i) => [keys.planetInHouse(body as ChartPointName, i + 1), reading])),
);
