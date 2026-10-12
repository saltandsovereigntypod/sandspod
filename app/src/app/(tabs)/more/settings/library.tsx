import { router } from 'expo-router';
import { Text } from 'react-native';

import { Chips, MenuList, MenuRow, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { calendarPath, myPath, PATH_TRADITIONS, pathMode, pathName, type PathMode } from '../../../../lib/library/traditions';
import { type } from '../../../../theme';
import { LAYER_LABELS, LAYER_ORDER_OPTIONS, LAYERS, layerOrderLabel } from '../../../../lib/settings/defaults';

const ORDER_OPTIONS = LAYER_ORDER_OPTIONS.map((value) => ({ value, label: layerOrderLabel(value) }));
type Order = (typeof LAYER_ORDER_OPTIONS)[number];

const PATH_MODES: { value: PathMode; label: string }[] = [
  { value: 'calendars', label: 'Follow my calendars' },
  { value: 'custom', label: 'Choose my own' },
  { value: 'off', label: 'Off' },
];

export default function LibrarySettings() {
  return (
    <SettingsForm title="Living Library">
      {(draft, set) => {
        const mode = pathMode(draft);
        const path = myPath(draft);
        const fromCalendars = calendarPath(draft).filter((id) => !path.hidden.includes(id));
        const choices = PATH_TRADITIONS.filter((t) => !path.hidden.includes(t.id));
        const toggle = (id: string, on: boolean) => {
          const next = new Set(path.traditions);
          if (on) next.add(id);
          else next.delete(id);
          set('library_path', PATH_TRADITIONS.map((t) => t.id).filter((t) => next.has(t)).join(','));
        };
        return (
        <>
          <Section label="My path">
            <Text style={type.caption}>
              Puts the traditions you keep first in the Library: their deities, and the herbs, crystals and candles they use, ahead of everything else.
            </Text>
            <Chips
              label="My path"
              options={PATH_MODES}
              value={mode}
              onChange={(v) => {
                // Starting your own list from what your calendars already say.
                if (v === 'custom' && typeof draft.library_path !== 'string') set('library_path', fromCalendars.join(','));
                set('library_path_mode', v);
              }}
            />
            {mode === 'calendars' && (
              <Text style={type.caption}>
                {fromCalendars.length
                  ? `From your calendars: ${fromCalendars.map(pathName).join(', ')}.`
                  : 'None of your calendars match a tradition yet. Turn some on in Calendar & holidays, or choose your own.'}
              </Text>
            )}
            {mode === 'custom' && (
              <MenuList>
                {choices.map((t, index) => (
                  <SwitchRow key={t.id} label={t.name} value={path.traditions.includes(t.id)} onChange={(on) => toggle(t.id, on)} last={index === choices.length - 1} />
                ))}
              </MenuList>
            )}
            {mode !== 'off' && (
              <MenuList>
                <SwitchRow
                  label="Hide deities from other traditions"
                  detail="Only deities from your path show. Any you’ve written your own notes for always stay."
                  value={draft.library_path_other_deities === 'hide'}
                  onChange={(on) => set('library_path_other_deities', on ? 'hide' : 'show')}
                  last
                />
              </MenuList>
            )}
          </Section>
          <Section label="Layer order">
            <Chips
              label="Layer order"
              options={ORDER_OPTIONS}
              value={(draft.library_layer_order as Order) || LAYER_ORDER_OPTIONS[0]}
              onChange={(v) => set('library_layer_order', v)}
            />
          </Section>
          <Section label="Show on Library pages">
            <MenuList>
              {LAYERS.map((layer, index) => (
                <SwitchRow
                  key={layer}
                  label={LAYER_LABELS[layer]}
                  value={draft[`library_${layer}_enabled`] !== false}
                  onChange={(v) => set(`library_${layer}_enabled`, v)}
                  last={index === LAYERS.length - 1}
                />
              ))}
            </MenuList>
          </Section>
          <Section label="What each layer shows">
            <MenuList>
              {LAYERS.map((layer, index) => (
                <MenuRow
                  key={layer}
                  label={LAYER_LABELS[layer]}
                  detail="Meanings, uses, pairings…"
                  onPress={() => router.push({ pathname: '/more/settings/layer/[layer]', params: { layer } })}
                  last={index === LAYERS.length - 1}
                />
              ))}
            </MenuList>
          </Section>
        </>
        );
      }}
    </SettingsForm>
  );
}
