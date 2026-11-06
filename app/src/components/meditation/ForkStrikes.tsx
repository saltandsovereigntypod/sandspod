// Tuning forks in Listen and the sit's sound (lib/meditation/forks.ts): pick
// a set, then strike any fork (or pair) once and let it ring out. A fork
// struck here is separate from the backdrop layer, which strikes the set
// round on a timer.

import { useState } from 'react';

import { DEFAULT_FORK_DECAY, FORK_DECAYS, FORK_NOTE, forkLine, forkSet, type ForkSetId } from '../../lib/meditation/forks';
import { Body, Chip, Chips, ui } from '../rituals/ui';
import { View } from 'react-native';
import { strikeFork } from './forkSound';

export function ForkStrikes({ setId }: { setId: ForkSetId }) {
  const [decay, setDecay] = useState<number>(DEFAULT_FORK_DECAY);
  const [last, setLast] = useState<string | null>(null);
  const set = forkSet(setId);
  const shown = set.forks.find((x) => x.id === last);
  return (
    <View style={ui.gapSmall}>
      <Body muted>{`${set.line} Tap a fork to strike it.`}</Body>
      <Chips>
        {set.forks.map((x) => (
          <Chip
            key={x.id}
            label={x.label}
            a11yLabel={`Strike ${x.label}`}
            selected={last === x.id}
            onPress={() => {
              setLast(x.id);
              strikeFork(x.hz, 0.85, decay);
            }}
          />
        ))}
      </Chips>
      {shown && <Body muted>{forkLine(shown)}</Body>}
      <Body muted>How long it rings</Body>
      <Chips>
        {FORK_DECAYS.map((d) => (
          <Chip key={d} label={`${d} s`} selected={decay === d} onPress={() => setDecay(d)} />
        ))}
      </Chips>
      <Body muted>{FORK_NOTE}</Body>
    </View>
  );
}
