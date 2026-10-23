// Food or flowers heaped in a vessel, on the phone: the painted heap clipped
// to the vessel's rim (lib/altar/offeringArt foodInVessel), browned and
// dulled through a colour matrix as it goes over.

import { Canvas, ColorMatrix, Group, Image, Skia, useImage, type DataSourceParam } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { altarImageSource } from '../../lib/altar/assets';
import { tintMatrix, type FoodInVessel } from '../../lib/altar/offeringArt';

export function FoodHeap({ food, width, height }: { food: FoodInVessel; width: number; height: number; uid: string }) {
  const source = altarImageSource(food.image);
  const image = useImage((typeof source === 'number' ? source : !Array.isArray(source) && source && typeof source === 'object' ? source.uri ?? null : null) as DataSourceParam);
  const clip = useMemo(() => Skia.Path.MakeFromSVGString(food.clip), [food.clip]);
  if (!image || !clip || !(width > 0) || !(height > 0)) return null;
  return (
    <Canvas style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      <Group clip={clip}>
        <Image image={image} fit="fill" x={food.left} y={food.top} width={food.width} height={food.height}>
          {food.tint && <ColorMatrix matrix={tintMatrix(food.tint)} />}
        </Image>
      </Group>
    </Canvas>
  );
}
