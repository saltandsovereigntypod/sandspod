import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme';

type Props = {
  size: number;
  /** Lit portion of the disc, 0 to 1. */
  illumination: number;
  waxing: boolean;
  /** Draw the two faint gold rings around the moon. */
  halo?: boolean;
};

/**
 * The moon as seen from the northern hemisphere: waxing light grows from the
 * right, waning light shrinks toward the left.
 */
export function MoonDisc({ size, illumination, waxing, halo = true }: Props) {
  const c = size / 2;
  const r = halo ? size * 0.352 : size / 2;
  const top = c - r;
  const bottom = c + r;
  // Terminator is an ellipse whose horizontal radius shrinks to 0 at the quarters.
  const rx = r * Math.abs(1 - 2 * illumination);
  const gibbous = illumination > 0.5;

  // Outer edge of the lit half, then back up along the terminator.
  const outerSweep = waxing ? 1 : 0;
  const terminatorSweep = waxing === gibbous ? 1 : 0;
  const lit =
    `M ${c} ${top} A ${r} ${r} 0 0 ${outerSweep} ${c} ${bottom} ` +
    `A ${rx} ${r} 0 0 ${terminatorSweep} ${c} ${top} Z`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {halo && (
        <>
          <Circle cx={c} cy={c} r={size * 0.489} fill="none" stroke="rgba(226,195,109,0.12)" strokeWidth={1} />
          <Circle cx={c} cy={c} r={size * 0.42} fill="none" stroke="rgba(226,195,109,0.22)" strokeWidth={1} />
        </>
      )}
      <Circle cx={c} cy={c} r={r - 0.5} fill={colors.surfaceRaised} stroke="#6b675a" strokeWidth={halo ? 0 : 1} />
      {illumination > 0.005 && <Path d={lit} fill={colors.cream} />}
    </Svg>
  );
}
