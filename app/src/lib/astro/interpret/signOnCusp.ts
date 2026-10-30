// The sign on each house cusp: how that part of life is met. Four files
// under signOnCusp/, three houses each. Key: keys.signOnCusp(house, sign).

import { SIGNS, type ZodiacSign } from '../signs.ts';
import { CUSP_1, CUSP_2, CUSP_3 } from './signOnCusp/houses1to3.ts';
import { CUSP_4, CUSP_5, CUSP_6 } from './signOnCusp/houses4to6.ts';
import { CUSP_7, CUSP_8, CUSP_9 } from './signOnCusp/houses7to9.ts';
import { CUSP_10, CUSP_11, CUSP_12 } from './signOnCusp/houses10to12.ts';
import { keys, type Interpretation, type InterpretationTable } from './types.ts';

/** Each house's twelve signs, as written (index 0 is the first house). */
export const SIGN_ON_CUSP_BY_HOUSE: Record<ZodiacSign, Interpretation>[] = [CUSP_1, CUSP_2, CUSP_3, CUSP_4, CUSP_5, CUSP_6, CUSP_7, CUSP_8, CUSP_9, CUSP_10, CUSP_11, CUSP_12];

export const SIGN_ON_CUSP: InterpretationTable = Object.fromEntries(
  SIGN_ON_CUSP_BY_HOUSE.flatMap((bySign, i) => SIGNS.map((sign) => [keys.signOnCusp(i + 1, sign), bySign[sign]])),
);
