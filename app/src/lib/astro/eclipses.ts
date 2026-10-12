// Solar and lunar eclipses, from Meeus "Astronomical Algorithms" ch. 54:
// at each new and full moon, the Moon's distance from its node decides
// whether there is an eclipse and what kind.

import { julianDayToDate, lunationNear, phaseJde, signAtSyzygy, type ZodiacSign } from '../moon.ts';

export type EclipseKind = 'total' | 'annular' | 'hybrid' | 'partial' | 'penumbral';
export type Eclipse = { type: 'solar' | 'lunar'; kind: EclipseKind; date: Date; sign: ZodiacSign };

const RAD = Math.PI / 180;

function eclipseAt(k: number): Eclipse | null {
  const solar = Number.isInteger(k);
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * RAD;
  if (Math.abs(Math.sin(F)) > 0.36) return null;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) * RAD;
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * RAD;
  const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * RAD;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const F1 = F - 0.02665 * RAD * Math.sin(Om);
  const P =
    0.207 * E * Math.sin(M) + 0.0024 * E * Math.sin(2 * M) - 0.0392 * Math.sin(Mp) + 0.0116 * Math.sin(2 * Mp) -
    0.0073 * E * Math.sin(Mp + M) + 0.0067 * E * Math.sin(Mp - M) + 0.0118 * Math.sin(2 * F1);
  const Q =
    5.2207 - 0.0048 * E * Math.cos(M) + 0.002 * E * Math.cos(2 * M) - 0.3299 * Math.cos(Mp) -
    0.006 * E * Math.cos(Mp + M) + 0.0041 * E * Math.cos(Mp - M);
  const W = Math.abs(Math.cos(F1));
  const gamma = (P * Math.cos(F1) + Q * Math.sin(F1)) * (1 - 0.0048 * W);
  const u = 0.0059 + 0.0046 * E * Math.cos(M) - 0.0182 * Math.cos(Mp) + 0.0004 * Math.cos(2 * Mp) - 0.0005 * Math.cos(M + Mp);
  const date = julianDayToDate(phaseJde(k, solar ? 'new' : 'full'));
  const sign = signAtSyzygy(date, solar ? 'new' : 'full');
  const g = Math.abs(gamma);

  if (solar) {
    if (g > 1.5433 + u) return null;
    let kind: EclipseKind = 'partial';
    if (g < 0.9972) kind = u < 0 ? 'total' : u > 0.0047 ? 'annular' : u < 0.00464 * Math.sqrt(1 - gamma * gamma) ? 'hybrid' : 'annular';
    return { type: 'solar', kind, date, sign };
  }
  const penumbral = (1.5573 + u - g) / 0.545;
  if (penumbral < 0) return null;
  const umbral = (1.0128 - u - g) / 0.545;
  return { type: 'lunar', kind: umbral >= 1 ? 'total' : umbral > 0 ? 'partial' : 'penumbral', date, sign };
}

/** Eclipses from `from` to `to`, in date order. */
export function eclipsesBetween(from: Date, to: Date): Eclipse[] {
  const out: Eclipse[] = [];
  for (let k = lunationNear(from) - 1; ; k++) {
    for (const kk of [k, k + 0.5]) {
      const eclipse = eclipseAt(kk);
      if (!eclipse) continue;
      if (eclipse.date.getTime() > to.getTime()) return out;
      if (eclipse.date.getTime() >= from.getTime()) out.push(eclipse);
    }
    if (julianDayToDate(phaseJde(k, 'new')).getTime() > to.getTime() + 40 * 86_400_000) return out;
  }
}

export function eclipseLabel(eclipse: Eclipse): string {
  const kind = eclipse.kind.charAt(0).toUpperCase() + eclipse.kind.slice(1);
  return `${kind} ${eclipse.type} eclipse in ${eclipse.sign}`;
}
