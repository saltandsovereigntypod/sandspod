import { Text } from 'react-native';

import { lifeDuration } from '../../lib/altar/companion';
import { type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const LENGTHS = [10 * MIN, 30 * MIN, HOUR, 2 * HOUR, 3 * HOUR, 4 * HOUR, 6 * HOUR, 8 * HOUR, 12 * HOUR, DAY, 2 * DAY, 3 * DAY, 5 * DAY, 7 * DAY, 9 * DAY];

/** How long this candle burns, chosen before it's first lit (a bigger or smaller candle than usual). */
export function CandleLifeSheet({
  visible,
  candle,
  current,
  usual,
  onChoose,
  onClose,
}: {
  visible: boolean;
  candle: string;
  current: number;
  usual: number;
  onChoose: (ms: number) => void;
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} eyebrow={candle} title="How long it burns" onClose={onClose} size="half">
      <Text style={type.body}>
        {usual
          ? `A candle like this usually burns about ${lifeDuration(usual)}. If yours is bigger or smaller, choose its length before you first light it. Once lit, it goes out on its own when its time is up.`
          : 'Choose about how long your candle burns. Once lit, it goes out on its own when its time is up.'}
      </Text>
      <ChipRow>
        {LENGTHS.map((ms) => (
          <Chip key={ms} label={lifeDuration(ms)} active={ms === current} onPress={() => onChoose(ms)} />
        ))}
      </ChipRow>
    </Sheet>
  );
}
