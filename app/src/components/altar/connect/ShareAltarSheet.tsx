// Share your altar as a picture: the altar drawn as a card with its name,
// tonight's moon and the date, saved as a PNG and handed to the share sheet.
// Nothing is uploaded; the picture only goes where you send it. On the web it
// downloads instead.

import { useMemo, useRef, useState } from 'react';
import { Platform, Text, useWindowDimensions, View } from 'react-native';
import type Svg from 'react-native-svg';

import { Button } from '../../Button';
import { CARD, cardFileName, composeShareCard } from '../../../lib/altar/connect/shareCard';
import { sharePicture } from '../../../lib/altar/connect/shareFile';
import { useImageRatioVersion } from '../../../lib/altar/assets';
import { type } from '../../../theme';
import { Sheet } from '../Sheet';
import { connectStyles } from './common';
import { AltarCardSvg } from './AltarCard';
import type { AltarRef } from './common';

type Props = { altar: AltarRef; visible: boolean; onClose: () => void };

export function ShareAltarSheet({ altar, visible, onClose }: Props) {
  const ref = useRef<Svg>(null);
  const { width: screen } = useWindowDimensions();
  const ratios = useImageRatioVersion();
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'failed' | 'unavailable'>('idle');
  // The moment the sheet opened: the card's date and moon.
  const [at, setAt] = useState(() => new Date());
  const [shownFor, setShownFor] = useState(visible);
  if (shownFor !== visible) {
    setShownFor(visible);
    if (visible) {
      setAt(new Date());
      setState('idle');
    }
  }
  // A downloaded picture's size (ratios) changes how big its object is drawn.
  const card = useMemo(
    () => {
      void ratios;
      return composeShareCard({ name: altar.name, objects: altar.objects, background: altar.background, at });
    },
    [altar.name, altar.objects, altar.background, at, ratios],
  );
  const width = Math.min(screen - 40, 420);

  const share = () => {
    const svg = ref.current;
    if (!svg) return;
    setState('working');
    try {
      svg.toDataURL(
        (base64: string) => {
          sharePicture(base64, cardFileName(card.name, at), `Share ${card.name}`)
            .then((result) => setState(result === 'unavailable' ? 'unavailable' : 'done'))
            .catch(() => setState('failed'));
        },
        { width: CARD.width, height: CARD.height },
      );
    } catch {
      setState('failed');
    }
  };

  return (
    <Sheet visible={visible} eyebrow="Share" title="A picture of your altar" onClose={onClose}>
      <View style={connectStyles.center}>
        <AltarCardSvg ref={ref} card={card} width={width} label={`${card.name}, ${card.line}`} />
      </View>
      <Text style={type.caption}>The picture is made on your phone and stays private until you choose where to send it. Nothing is uploaded.</Text>
      <Button label={state === 'working' ? 'Making the picture…' : Platform.OS === 'web' ? 'Download the picture' : 'Share the picture'} disabled={state === 'working'} onPress={share} />
      {state === 'done' && Platform.OS === 'web' && <Text style={type.caption}>Downloaded. If a picture of your own didn’t come through, take a screenshot of the card instead.</Text>}
      {state === 'unavailable' && <Text style={connectStyles.problem}>Sharing isn’t available here. Take a screenshot of the card to keep it.</Text>}
      {state === 'failed' && <Text style={connectStyles.problem}>The picture couldn’t be made. Please try again, or take a screenshot of the card.</Text>}
    </Sheet>
  );
}
