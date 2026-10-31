// The sign on each house cusp: how that part of life is met. Four files
// under signOnCusp/, three houses each. Key: keys.signOnCusp(house, sign).

import { SIGNS, type ZodiacSign } from '../signs.ts';
import { CUSP_1, CUSP_2, CUSP_3 } from './signOnCusp/houses1to3.ts';
import { CUSP_4, CUSP_5, CUSP_6 } from './signOnCusp/houses4to6.ts';
import { CUSP_7, CUSP_8, CUSP_9 } from './signOnCusp/houses7to9.ts';
import { CUSP_10, CUSP_11, CUSP_12 } from './signOnCusp/houses10to12.ts';
import { CUSP_1_DEEPER, CUSP_2_DEEPER, CUSP_3_DEEPER, type CuspDeeper } from './signOnCusp/deeper1to3.ts';
import { CUSP_4_DEEPER, CUSP_5_DEEPER, CUSP_6_DEEPER } from './signOnCusp/deeper4to6.ts';
import { CUSP_7_DEEPER } from './signOnCusp/deeper7.ts';
import { CUSP_8_DEEPER } from './signOnCusp/deeper8.ts';
import { CUSP_9_DEEPER, CUSP_10_DEEPER, CUSP_11_DEEPER, CUSP_12_DEEPER } from './signOnCusp/deeper9to12.ts';
import { deepen } from './planetInHouse/deeperTypes.ts';
import { keys, type Interpretation, type InterpretationTable } from './types.ts';

const DEEPER: CuspDeeper[] = [CUSP_1_DEEPER, CUSP_2_DEEPER, CUSP_3_DEEPER, CUSP_4_DEEPER, CUSP_5_DEEPER, CUSP_6_DEEPER, CUSP_7_DEEPER, CUSP_8_DEEPER, CUSP_9_DEEPER, CUSP_10_DEEPER, CUSP_11_DEEPER, CUSP_12_DEEPER];

/** Each house's twelve signs, with the further paragraph and craft line from signOnCusp/deeper*.ts joined on. */
export const SIGN_ON_CUSP_BY_HOUSE: Record<ZodiacSign, Interpretation>[] = [CUSP_1, CUSP_2, CUSP_3, CUSP_4, CUSP_5, CUSP_6, CUSP_7, CUSP_8, CUSP_9, CUSP_10, CUSP_11, CUSP_12].map(
  (bySign, i) => Object.fromEntries(SIGNS.map((sign) => [sign, deepen(bySign[sign], DEEPER[i][sign])])) as Record<ZodiacSign, Interpretation>,
);

export const SIGN_ON_CUSP: InterpretationTable = Object.fromEntries(
  SIGN_ON_CUSP_BY_HOUSE.flatMap((bySign, i) => SIGNS.map((sign) => [keys.signOnCusp(i + 1, sign), bySign[sign]])),
);
