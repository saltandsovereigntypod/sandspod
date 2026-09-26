import { router } from 'expo-router';

import { Chips, MenuList, MenuRow, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { LAYER_LABELS, LAYER_ORDER_OPTIONS, LAYERS, layerOrderLabel } from '../../../../lib/settings/defaults';

const ORDER_OPTIONS = LAYER_ORDER_OPTIONS.map((value) => ({ value, label: layerOrderLabel(value) }));
type Order = (typeof LAYER_ORDER_OPTIONS)[number];

export default function LibrarySettings() {
  return (
    <SettingsForm title="Living Library">
      {(draft, set) => (
        <>
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
      )}
    </SettingsForm>
  );
}
