// Choosing a sit's sound (lib/meditation/sound.ts): each layer at its own
// level, and for some a key, tempo, bowl round or binaural beat. The last mix
// is remembered on this device. Shared by Meditation and its programmes.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { BEATS, BINAURAL_NOTE, BINAURAL_PRESETS, BOWL_GAPS, BOWL_SETS, CARRIERS, cleanMix, DEFAULT_MIX, KEYS, LAYERS, levelOf, LEVELS, TEMPOS, type SoundMix } from '../../lib/meditation/sound';
import { Body, Chip, Chips, Notice, ui } from '../rituals/ui';

const KEY = 'meditation.sound';

/** The mix last used on this device. */
export function useLastMix(): [SoundMix, (m: SoundMix) => void] {
  const [mix, setMix] = useState<SoundMix>(DEFAULT_MIX);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setMix(cleanMix(JSON.parse(raw))))
      .catch(() => {});
  }, []);
  const change = (m: SoundMix) => {
    setMix(m);
    void AsyncStorage.setItem(KEY, JSON.stringify(m)).catch(() => {});
  };
  return [mix, change];
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
