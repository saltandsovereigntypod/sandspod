// Draw a sigil by hand: a square of aged paper that takes strokes from a
// finger or a mouse. The strokes are kept in the pad's own pixels; the maker
// turns them into the sigil's box (lib/sigil/sigil.ts freehandPath).

import { useMemo, useRef, useState } from 'react';
import { View, type GestureResponderEvent } from 'react-native';

import type { Point, Polyline } from '../../lib/sigil/geometry';
import { freehandPath, MAX_STROKES } from '../../lib/sigil/sigil';
import { SigilPicture } from './SigilPicture';

type Props = {
  size: number;
  strokes: Polyline[];
  onChange: (strokes: Polyline[]) => void;
  /** True while a finger is down, so the page can stop scrolling. */
  onDrawing: (drawing: boolean) => void;
  weight: number;
  ring: boolean;
};

export function FreehandPad({ size, strokes, onChange, onDrawing, weight, ring }: Props) {
  const [current, setCurrent] = useState<Polyline | null>(null);
  const live = useRef<Polyline | null>(null);

  const at = (e: GestureResponderEvent): Point => [
    Math.min(size, Math.max(0, e.nativeEvent.locationX)),
    Math.min(size, Math.max(0, e.nativeEvent.locationY)),
  ];
  const finish = () => {
    const line = live.current;
    live.current = null;
    setCurrent(null);
    onDrawing(false);
    if (line && line.length) onChange([...strokes, line].slice(-MAX_STROKES));
  };

  const d = useMemo(() => freehandPath(current ? [...strokes, current] : strokes, size), [strokes, current, size]);

  return (
    <View
      accessible
      accessibilityLabel="Drawing pad. Draw your sigil with one finger."
      style={{ width: size, height: size }}
      onStartShouldSetResponder={() => true}
      onStartShouldSetResponderCapture={() => true}
      onMoveShouldSetResponder={() => true}
      onMoveShouldSetResponderCapture={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        onDrawing(true);
        live.current = [at(e)];
        setCurrent(live.current);
      }}
      onResponderMove={(e) => {
        const line = live.current;
        if (!line) return;
        const p = at(e);
        const last = line[line.length - 1];
        if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 1.5) return;
        live.current = [...line, p];
        setCurrent(live.current);
      }}
      onResponderRelease={finish}
      onResponderTerminate={finish}
    >
      <View pointerEvents="none">
        <SigilPicture sigil={{ d: d || 'M50 50', weight: d ? weight : 0.8, ring }} size={size} />
      </View>
    </View>
  );
}
