// A playing card drawn in SVG: the corner index, the pips laid out as on a
// real card, and a framed court card. No images; it scales to any width.

import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';

import { playingCard, SUITS } from '../../../lib/divination/oracle/playing';

const PIPS: Record<string, [number, number][]> = {
  '2': [[50, 32], [50, 108]],
  '3': [[50, 32], [50, 70], [50, 108]],
  '4': [[34, 32], [66, 32], [34, 108], [66, 108]],
  '5': [[34, 32], [66, 32], [50, 70], [34, 108], [66, 108]],
  '6': [[34, 32], [66, 32], [34, 70], [66, 70], [34, 108], [66, 108]],
  '7': [[34, 32], [66, 32], [50, 51], [34, 70], [66, 70], [34, 108], [66, 108]],
  '8': [[34, 32], [66, 32], [50, 51], [34, 70], [66, 70], [50, 89], [34, 108], [66, 108]],
  '9': [[34, 28], [66, 28], [34, 56], [66, 56], [50, 70], [34, 84], [66, 84], [34, 112], [66, 112]],
  '10': [[34, 28], [66, 28], [50, 42], [34, 56], [66, 56], [34, 84], [66, 84], [50, 98], [34, 112], [66, 112]],
};

const RED = '#a8261d';
const BLACK = '#1d1d22';

export function PlayingFace({ name, width, reversed = false }: { name: string; width: number; reversed?: boolean }) {
  const card = playingCard(name);
  const height = (width * 140) / 100;
  if (!card) return null;
  const suit = SUITS.find((s) => s.id === card.suit);
  const ink = card.suit === 'joker' ? RED : suit?.colour === 'red' ? RED : BLACK;
  const glyph = suit?.glyph ?? '★';
  const court = card.rank === 'J' || card.rank === 'Q' || card.rank === 'K';
  const index = (
    <>
      <SvgText x={12} y={22} fontSize={card.rank === '10' ? 15 : 18} fontWeight="700" fill={ink} textAnchor="middle">
        {card.suit === 'joker' ? '★' : card.rank}
      </SvgText>
      {card.suit !== 'joker' && (
        <SvgText x={12} y={38} fontSize={15} fill={ink} textAnchor="middle">
          {glyph}
        </SvgText>
      )}
    </>
  );
  return (
    <Svg width={width} height={height} viewBox="0 0 100 140" accessibilityLabel={card.name}>
      <G rotation={reversed ? 180 : 0} origin="50, 70">
        <Rect x={1.5} y={1.5} width={97} height={137} rx={8} fill="#fbf8ef" stroke="#8a8372" strokeWidth={1.5} />
        {index}
        <G rotation={180} origin="50, 70">
          {index}
        </G>
        {card.suit === 'joker' ? (
          <>
            <SvgText x={50} y={82} fontSize={50} fill={ink} textAnchor="middle">
              ★
            </SvgText>
            <SvgText x={50} y={112} fontSize={11} fontWeight="700" letterSpacing={2} fill={ink} textAnchor="middle">
              {card.name.split(' ')[0].toUpperCase()}
            </SvgText>
          </>
        ) : court ? (
          <>
            <Rect x={24} y={26} width={52} height={88} rx={4} fill="none" stroke={ink} strokeWidth={1.5} />
            <Rect x={29} y={31} width={42} height={78} rx={2} fill="none" stroke={ink} strokeWidth={0.8} />
            <SvgText x={50} y={78} fontSize={40} fontWeight="700" fill={ink} textAnchor="middle">
              {card.rank}
            </SvgText>
            <SvgText x={50} y={102} fontSize={22} fill={ink} textAnchor="middle">
              {glyph}
            </SvgText>
          </>
        ) : card.rank === 'A' ? (
          <SvgText x={50} y={92} fontSize={64} fill={ink} textAnchor="middle">
            {glyph}
          </SvgText>
        ) : (
          (PIPS[card.rank] ?? []).map(([x, y], i) => (
            <SvgText key={i} x={x} y={y + 7} fontSize={20} fill={ink} textAnchor="middle">
              {glyph}
            </SvgText>
          ))
        )}
      </G>
    </Svg>
  );
}
