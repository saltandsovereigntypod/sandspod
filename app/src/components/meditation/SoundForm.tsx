// Choosing a sit's sound (lib/meditation/sound.ts): each layer at its own
// level, and for some a key, tempo, bowl round or binaural beat. The last mix
// is remembered on this device. Shared by Meditation, its programmes and
// Listen (which keeps its own last mix).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BEATS, BINAURAL_NOTE, BINAURAL_PRESETS, BOWL_GAPS, BOWL_SETS, CARRIERS, cleanMix, DEFAULT_MIX, KEYS, LAYERS, levelOf, LEVELS, TEMPOS, type SoundMix } from '../../lib/meditation/sound';
import { cleanListen, LISTEN_KEY } from '../../lib/meditation/listen';
import { FORK_GAPS, FORK_SETS } from '../../lib/meditation/forks';
import { ForkStrikes } from './ForkStrikes';
import { Body, Chip, Chips, Notice, ui } from '../rituals/ui';

const KEY = 'meditation.sound';

/** The mix last used on this device (for a sit, or under another key, as Listen's). */
export function useLastMix(key = KEY, initial = DEFAULT_MIX, clean: (raw: unknown) => SoundMix = cleanMix): [SoundMix, (m: SoundMix) => void] {
  const [mix, setMix] = useState<SoundMix>(initial);
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => raw && setMix(clean(JSON.parse(raw))))
      .catch(() => {});
  }, [key, clean]);
  const change = (m: SoundMix) => {
    setMix(m);
    void AsyncStorage.setItem(key, JSON.stringify(m)).catch(() => {});
  };
  return [mix, change];
}

/** The last Listen mix on this device, or null if there's none. */
export async function lastListenMix(): Promise<SoundMix | null> {
  try {
    const raw = await AsyncStorage.getItem(LISTEN_KEY);
    return raw ? cleanListen(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function SoundForm({ mix, onChange }: { mix: SoundMix; onChange: (m: SoundMix) => void }) {
  const set = (patch: Partial<SoundMix>) => onChange({ ...mix, ...patch });
  return (
    <View style={ui.gap}>
      {LAYERS.map((l) => {
        const level = levelOf(mix, l.id);
        return (
          <View key={l.id} style={ui.gapSmall}>
            <Body>{l.label}</Body>
            <Body muted>{l.line}</Body>
            <Chips>
              {LEVELS.map((v) => (
                <Chip key={v.label} label={v.label} a11yLabel={`${l.label}: ${v.label}`} selected={level === v.value || (!level && !v.value)} onPress={() => set({ levels: { ...mix.levels, [l.id]: v.value } })} />
              ))}
            </Chips>
            {level > 0 && l.id === 'drone' && (
              <Chips>
                {KEYS.map((k) => (
                  <Chip key={k.id} label={k.id} a11yLabel={`Key of ${k.id}`} selected={mix.key === k.id} onPress={() => set({ key: k.id })} />
                ))}
              </Chips>
            )}
            {level > 0 && l.id === 'drum' && (
              <>
                <Body muted>Beats a second</Body>
                <Chips>
                  {TEMPOS.map((t) => (
                    <Chip key={t} label={String(t)} selected={mix.tempo === t} onPress={() => set({ tempo: t })} />
                  ))}
                </Chips>
              </>
            )}
            {level > 0 && l.id === 'bowls' && (
              <>
                <Chips>
                  {BOWL_SETS.map((b) => (
                    <Chip key={b.value} label={b.label} selected={mix.bowlSet === b.value} onPress={() => set({ bowlSet: b.value })} />
                  ))}
                </Chips>
                <Chips>
                  {BOWL_GAPS.map((g) => (
                    <Chip key={g} label={`Every ${g} s`} selected={mix.bowlEvery === g} onPress={() => set({ bowlEvery: g })} />
                  ))}
                </Chips>
                <Body muted>The tones given to the chakras here (C to B, root to crown) are a modern crystal-bowl convention.</Body>
              </>
            )}
            {l.id === 'forks' && (
              <>
                <Chips>
                  {FORK_SETS.map((x) => (
                    <Chip key={x.id} label={x.label} selected={mix.forkSet === x.id} onPress={() => set({ forkSet: x.id })} />
                  ))}
                </Chips>
                {level > 0 && (
                  <Chips>
                    {FORK_GAPS.map((g) => (
                      <Chip key={g} label={`Every ${g} s`} selected={mix.forkEvery === g} onPress={() => set({ forkEvery: g })} />
                    ))}
                  </Chips>
                )}
                <ForkStrikes setId={mix.forkSet} />
              </>
            )}
            {level > 0 && l.id === 'binaural' && (
              <>
                <Notice>{BINAURAL_NOTE}</Notice>
                <Chips>
                  {BINAURAL_PRESETS.map((b) => (
                    <Chip key={b.value} label={b.label} selected={mix.binaural === b.value} onPress={() => set({ binaural: b.value })} />
                  ))}
                </Chips>
                <Body muted>{BINAURAL_PRESETS.find((b) => b.value === mix.binaural)?.line}</Body>
                {mix.binaural === 'custom' && (
                  <>
                    <Body muted>The beat (Hz)</Body>
                    <Chips>
                      {BEATS.map((b) => (
                        <Chip key={b} label={String(b)} selected={mix.beat === b} onPress={() => set({ beat: b })} />
                      ))}
                    </Chips>
                  </>
                )}
                <Body muted>The carrier tone (Hz)</Body>
                <Chips>
                  {CARRIERS.map((c) => (
                    <Chip key={c} label={String(c)} selected={mix.carrier === c} onPress={() => set({ carrier: c })} />
                  ))}
                </Chips>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
