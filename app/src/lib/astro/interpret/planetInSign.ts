// Planets and points in each sign: Mercury to Pluto, Chiron, the lunar
// nodes and Black Moon Lilith, one file per body under planetInSign/.
// Key: keys.planetInSign(body, sign). The Sun, Moon and Ascendant live in
// sunSigns.ts, moonSigns.ts and risingSigns.ts.

import { SIGNS, type ChartPointName, type ZodiacSign } from '../signs.ts';
import { CHIRON_IN_SIGN } from './planetInSign/chiron.ts';
import { JUPITER_IN_SIGN } from './planetInSign/jupiter.ts';
import { LILITH_IN_SIGN } from './planetInSign/lilith.ts';
import { MARS_IN_SIGN } from './planetInSign/mars.ts';
import { MERCURY_IN_SIGN } from './planetInSign/mercury.ts';
import { NEPTUNE_IN_SIGN } from './planetInSign/neptune.ts';
import { NORTH_NODE_IN_SIGN, SOUTH_NODE_IN_SIGN } from './planetInSign/nodes.ts';
import { PLUTO_IN_SIGN } from './planetInSign/pluto.ts';
import { SATURN_IN_SIGN } from './planetInSign/saturn.ts';
import { URANUS_IN_SIGN } from './planetInSign/uranus.ts';
import { VENUS_IN_SIGN } from './planetInSign/venus.ts';
import { keys, type Interpretation, type InterpretationTable } from './types.ts';

/** Each body's twelve signs, as written. */
export const PLANET_IN_SIGN_BY_BODY: Partial<Record<ChartPointName, Record<ZodiacSign, Interpretation>>> = {
  Mercury: MERCURY_IN_SIGN,
  Venus: VENUS_IN_SIGN,
  Mars: MARS_IN_SIGN,
  Jupiter: JUPITER_IN_SIGN,
  Saturn: SATURN_IN_SIGN,
  Uranus: URANUS_IN_SIGN,
  Neptune: NEPTUNE_IN_SIGN,
  Pluto: PLUTO_IN_SIGN,
  Chiron: CHIRON_IN_SIGN,
  'North Node': NORTH_NODE_IN_SIGN,
  'South Node': SOUTH_NODE_IN_SIGN,
  Lilith: LILITH_IN_SIGN,
};

export const PLANET_IN_SIGN: InterpretationTable = Object.fromEntries(
  Object.entries(PLANET_IN_SIGN_BY_BODY).flatMap(([body, bySign]) => SIGNS.map((sign) => [keys.planetInSign(body as ChartPointName, sign), bySign![sign]])),
);
