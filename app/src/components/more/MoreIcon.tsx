import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type MoreIconName = 'community' | 'offer' | 'letters' | 'library' | 'settings' | 'backup' | 'account' | 'moon' | 'altar';

// Stroke icons on the same 24px grid as components/Icon.tsx.
export function MoreIcon({ name, size = 20, color }: { name: MoreIconName; size?: number; color: string }) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {name === 'community' && (
        <>
          <Path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" {...stroke} />
          <Path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" {...stroke} />
          <Path d="M12 7.5l1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" {...stroke} strokeWidth={1.4} />
        </>
      )}
      {name === 'offer' && (
        <>
          <Path d="M12 21c-4-2.5-7-5.5-7-9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7 3.5c0 4-3 7-7 9.5z" {...stroke} />
          <Path d="M12 3v3" {...stroke} />
        </>
      )}
      {name === 'letters' && (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={2} {...stroke} />
          <Path d="M3.5 6.5L12 13l8.5-6.5" {...stroke} />
        </>
      )}
      {name === 'library' && (
        <>
          <Path d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16z" {...stroke} />
          <Path d="M5 21c3-5 6-8 10-11" {...stroke} />
        </>
      )}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...stroke} />
          <Path
            d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3"
            {...stroke}
          />
        </>
      )}
      {name === 'backup' && (
        <>
          <Rect x={3} y={4} width={18} height={5} rx={1.5} {...stroke} />
          <Path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" {...stroke} />
          <Path d="M10 13h4" {...stroke} />
        </>
      )}
      {name === 'account' && (
        <>
          <Circle cx={12} cy={8} r={4} {...stroke} />
          <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...stroke} />
        </>
      )}
      {name === 'moon' && <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" {...stroke} />}
      {name === 'altar' && (
        <>
          <Rect x={9} y={10} width={6} height={11} rx={1} {...stroke} />
          <Path d="M12 3c1.5 2 2 3.5 0 5.5-2-2-1.5-3.5 0-5.5z" {...stroke} />
        </>
      )}
    </Svg>
  );
}
