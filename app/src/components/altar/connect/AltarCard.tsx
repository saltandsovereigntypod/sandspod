// An altar drawn as one SVG picture, from the share-card composer
// (lib/altar/connect/shareCard): the background, the objects where the stage
// puts them, candle flames and their light, and for a share card the altar's
// name, the moon and the date. Used for the share card and for small pictures
// of past snapshots in the altar's history.

import { forwardRef } from 'react';
import Svg, { Circle, Defs, G, Image as SvgImage, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { altarImageSource } from '../../../lib/altar/assets';
import { moonPath, type CardScene, type ShareCard } from '../../../lib/altar/connect/shareCard';
import { colors, fonts } from '../../../theme';

type Props = {
  card: CardScene | ShareCard;
  /** Drawn width on screen; the picture keeps its own proportions. */
  width: number;
  /** For the accessibility label. */
  label: string;
};

const isShareCard = (card: CardScene | ShareCard): card is ShareCard => 'name' in card;

/** The picture. The ref is the Svg (for toDataURL). */
export const AltarCardSvg = forwardRef<Svg, Props>(function AltarCardSvg({ card, width, label }, ref) {
  const height = (width * card.height) / card.width;
  const bg = altarImageSource(card.background.path);
  const share = isShareCard(card) ? card : null;
  const transform = (i: CardScene['items'][number]) => {
    const parts: string[] = [];
    if (i.rotation) parts.push(`rotate(${i.rotation} ${i.cx} ${i.cy})`);
    if (i.flipped) parts.push(`translate(${2 * i.cx} 0) scale(-1 1)`);
    return parts.join(' ') || undefined;
  };
  return (
    <Svg ref={ref} width={width} height={height} viewBox={`0 0 ${card.width} ${card.height}`} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Defs>
        <RadialGradient id="ac-pool" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#ffc76b" stopOpacity={0.42} />
          <Stop offset="0.5" stopColor="#ff9f40" stopOpacity={0.14} />
          <Stop offset="1" stopColor="#ff9f40" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="ac-flame" cx="50%" cy="65%" r="55%">
          <Stop offset="0" stopColor="#fff6d6" stopOpacity={1} />
          <Stop offset="0.45" stopColor="#ffd36b" stopOpacity={0.95} />
          <Stop offset="1" stopColor="#ff8a2a" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="ac-halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#ffe3a0" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#ffb24a" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="ac-scrim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.night} stopOpacity={0} />
          <Stop offset="1" stopColor={colors.night} stopOpacity={0.85} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={card.width} height={card.height} fill={colors.night} />
      {bg != null && (
        <SvgImage href={bg} x={card.background.rect.x} y={card.background.rect.y} width={card.background.rect.w} height={card.background.rect.h} preserveAspectRatio="xMidYMid slice" />
      )}
      {card.pools.map((p, i) => (
        <Circle key={`pool-${i}`} cx={p.x} cy={p.y} r={p.r} fill="url(#ac-pool)" />
      ))}
      {card.items.map((item) => {
        const source = item.path ? altarImageSource(item.path) : null;
        return (
          <G key={item.key} transform={transform(item)} opacity={item.opacity}>
            {source != null ? (
              <SvgImage href={source} x={item.rect.x} y={item.rect.y} width={item.rect.w} height={item.rect.h} preserveAspectRatio="xMidYMid meet" />
            ) : item.symbol ? (
              <SvgText x={item.cx} y={item.cy + item.rect.h * 0.18} fontSize={item.rect.w * 0.49} textAnchor="middle" fill={colors.cream}>
                {item.symbol}
              </SvgText>
            ) : null}
            {item.halo && <Rect x={item.halo.x} y={item.halo.y} width={item.halo.w} height={item.halo.h} rx={item.halo.w / 2} fill="url(#ac-halo)" />}
            {item.flame && <Path d={flamePath(item.flame.x, item.flame.y, item.flame.w, item.flame.h)} fill="url(#ac-flame)" />}
          </G>
        );
      })}
      {share && (
        <G>
          <Rect x={0} y={share.panelY - 160} width={card.width} height={160} fill="url(#ac-scrim)" />
          <Rect x={0} y={share.panelY} width={card.width} height={card.height - share.panelY} fill={colors.night} />
          <Rect x={0} y={share.panelY} width={card.width} height={2} fill={colors.gold} opacity={0.5} />
          <SvgText x={72} y={share.panelY + 110} fontFamily={fonts.display} fontSize={76} fill={colors.cream}>
            {share.name.length > 26 ? `${share.name.slice(0, 25)}…` : share.name}
          </SvgText>
          <SvgText x={72} y={share.panelY + 178} fontFamily={fonts.body} fontSize={34} fill={colors.muted}>
            {share.line}
          </SvgText>
          <Circle cx={card.width - 120} cy={share.panelY + 132} r={46} fill={colors.surfaceRaised} />
          {!!moonPath(card.width - 120, share.panelY + 132, 46, share.moon.illumination, share.moon.waxing) && (
            <Path d={moonPath(card.width - 120, share.panelY + 132, 46, share.moon.illumination, share.moon.waxing)} fill={colors.cream} />
          )}
          <SvgText x={72} y={card.height - 44} fontFamily={fonts.body} fontSize={24} letterSpacing={4} fill={colors.goldDeep}>
            {'SALT & SOVEREIGNTY'}
          </SvgText>
        </G>
      )}
    </Svg>
  );
});

/** A teardrop flame filling (x, y, w, h), tip at the top. */
function flamePath(x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2;
  const bottom = y + h;
  return `M ${cx} ${y} C ${cx + w * 0.55} ${y + h * 0.45}, ${cx + w * 0.5} ${bottom}, ${cx} ${bottom} C ${cx - w * 0.5} ${bottom}, ${cx - w * 0.55} ${y + h * 0.45}, ${cx} ${y} Z`;
}
