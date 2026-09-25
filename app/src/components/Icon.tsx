import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'today'
  | 'altar'
  | 'grimoire'
  | 'rituals'
  | 'more'
  | 'bell'
  | 'calendar'
  | 'chevron'
  | 'samhain'
  | 'wheel';

type Props = { name: IconName; size?: number; color: string };

// Stroke icons drawn on a 24px grid, matching the approved mockups.
export function Icon({ name, size = 22, color }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'today' && <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" {...stroke} />}
      {name === 'altar' && (
        <>
          <Rect x={9} y={10} width={6} height={11} rx={1} {...stroke} />
          <Path d="M12 3c1.5 2 2 3.5 0 5.5-2-2-1.5-3.5 0-5.5z" {...stroke} />
        </>
      )}
      {name === 'grimoire' && (
        <>
          <Path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" {...stroke} />
          <Path d="M5 17a3 3 0 0 1 3-3h11" {...stroke} />
        </>
      )}
      {name === 'rituals' && <Path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" {...stroke} />}
      {name === 'more' && (
        <>
          <Circle cx={5} cy={12} r={1.5} {...stroke} />
          <Circle cx={12} cy={12} r={1.5} {...stroke} />
          <Circle cx={19} cy={12} r={1.5} {...stroke} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" {...stroke} />
          <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" {...stroke} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={2} {...stroke} />
          <Path d="M16 3v4M8 3v4M3 10h18" {...stroke} />
        </>
      )}
      {name === 'chevron' && <Path d="M9 18l6-6-6-6" {...stroke} />}
      {name === 'samhain' && (
        <>
          <Path d="M12 3c-2 3-6 5-6 10a6 6 0 0 0 12 0c0-5-4-7-6-10z" {...stroke} strokeWidth={1.6} />
          <Path d="M9 14h.01M15 14h.01M10 17.5c1.2.7 2.8.7 4 0" {...stroke} strokeWidth={1.6} />
        </>
      )}
      {name === 'wheel' && (
        <>
          <Circle cx={12} cy={12} r={8} {...stroke} strokeWidth={1.6} />
          <Path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" {...stroke} strokeWidth={1.2} />
        </>
      )}
    </Svg>
  );
}
