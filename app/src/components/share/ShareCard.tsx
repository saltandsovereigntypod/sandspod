// "Share as card": a ritual, spell, Library entry or reading drawn as a
// styled picture to share or save, a printable page (on the web), and its
// words for the share sheet. Nothing is uploaded; the picture is made on the
// device and only goes where it's sent.

import { forwardRef, useRef, useState } from 'react';
import { Platform, Share, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { Button } from '../Button';
import { Sheet } from '../altar/Sheet';
import { sharePicture } from '../../lib/altar/connect/shareFile';
import { cardFileName, cardText, layoutCard, printableHtml, SHARE_CARD, type ShareCardInput } from '../../lib/share/card';
import { canPrint, printPage } from '../../lib/share/print';
import { colors, type } from '../../theme';

const SERIF = Platform.OS === 'web' ? 'Georgia, serif' : 'serif';

export const ShareCardSvg = forwardRef<Svg, { card: ShareCardInput; width: number }>(function ShareCardSvg({ card, width }, ref) {
  const { width: W, height: H, margin } = SHARE_CARD;
  const lines = layoutCard(card);
  return (
    <Svg ref={ref} width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`} accessible accessibilityRole="image" accessibilityLabel={`${card.title}. ${card.lines.join(' ')}`}>
      <Defs>
        <LinearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.surfaceRaised} />
          <Stop offset="1" stopColor={colors.night} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill="url(#ground)" />
      <Rect x={margin / 2} y={margin / 2} width={W - margin} height={H - margin} rx={36} fill="none" stroke={colors.goldDeep} strokeWidth={3} />
      {lines.map((l, i) => (
        <SvgText
          key={i}
          x={margin}
          y={l.y}
          fontFamily={SERIF}
          fontSize={l.size}
          fontWeight={l.kind === 'title' ? '600' : 'normal'}
          fontStyle={l.kind === 'subtitle' ? 'italic' : 'normal'}
          letterSpacing={l.kind === 'eyebrow' ? 4 : 0}
          fill={l.kind === 'eyebrow' || l.kind === 'footer' ? colors.gold : l.kind === 'title' ? colors.cream : colors.parchment}
        >
          {l.text}
        </SvgText>
      ))}
    </Svg>
  );
});

/** The sheet: the card, then share or download the picture, print the page (web), or share the words. */
export function ShareCardSheet({ card, visible, onClose }: { card: ShareCardInput; visible: boolean; onClose: () => void }) {
  const ref = useRef<Svg>(null);
  const { width: screen } = useWindowDimensions();
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'failed'>('idle');
  const width = Math.min(screen - 40, 420);

  const picture = () => {
    const svg = ref.current;
    if (!svg) return;
    setState('working');
    try {
      svg.toDataURL(
        (base64: string) => {
          sharePicture(base64.replace(/^data:image\/png;base64,/, ''), cardFileName(card.title), `Share ${card.title}`)
            .then((r) => setState(r === 'shared' ? 'done' : 'failed'))
            .catch(() => setState('failed'));
        },
        { width: SHARE_CARD.width, height: SHARE_CARD.height },
      );
    } catch {
      setState('failed');
    }
  };

  return (
    <Sheet visible={visible} eyebrow="Share as card" title={card.title} onClose={onClose}>
      <View style={{ alignItems: 'center' }}>
        <ShareCardSvg ref={ref} card={card} width={width} />
      </View>
      <Text style={type.caption}>The card is made on this device and goes only where you send it. Nothing is uploaded.</Text>
      <Button label={state === 'working' ? 'Making the picture…' : Platform.OS === 'web' ? 'Download the picture' : 'Share the picture'} disabled={state === 'working'} onPress={picture} />
      {canPrint && <Button label="Print" variant="outline" onPress={() => void printPage(printableHtml(card))} />}
      <Button
        label={canPrint ? 'Share the words' : 'Share or print the words'}
        variant="outline"
        onPress={() => void Share.share({ title: card.title, message: cardText(card) }).catch(() => undefined)}
      />
      {state === 'failed' && <Text style={type.caption}>The picture couldn’t be made here. Share the words instead.</Text>}
    </Sheet>
  );
}

/** A "Share as card" button with its sheet, for any page that has something to share. */
export function ShareCardButton({ card, label = 'Share as card', variant = 'outline' }: { card: ShareCardInput | null; label?: string; variant?: 'outline' | 'text' }) {
  const [open, setOpen] = useState(false);
  if (!card) return null;
  return (
    <>
      <Button label={label} variant={variant} onPress={() => setOpen(true)} />
      <ShareCardSheet card={card} visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
