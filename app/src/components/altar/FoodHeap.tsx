// Food or flowers heaped in a vessel, on the web: the painted heap clipped to
// the vessel's rim (lib/altar/offeringArt foodInVessel), browned and dulled
// by a CSS filter as it goes over. The phone draws it with Skia (FoodHeap.native.tsx).

import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';

import { altarImageSource } from '../../lib/altar/assets';
import { tintFilter, type FoodInVessel } from '../../lib/altar/offeringArt';

export function FoodHeap({ food, width, height, uid }: { food: FoodInVessel; width: number; height: number; uid: string }) {
  const source = altarImageSource(food.image);
  if (!source) return null;
  const id = `food-${uid.replace(/[^a-z0-9-]/gi, '')}`;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, food.tint && { filter: tintFilter(food.tint) }]}>
      <Svg width={width} height={height}>
        <Defs>
          <ClipPath id={id}>
            <Path d={food.clip} />
          </ClipPath>
        </Defs>
        <SvgImage href={source} x={food.left} y={food.top} width={food.width} height={food.height} preserveAspectRatio="none" clipPath={`url(#${id})`} />
      </Svg>
    </View>
  );
}
