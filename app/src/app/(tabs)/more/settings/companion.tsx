import { Text } from 'react-native';

import { Chips, MenuList, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { CATEGORY_LABELS, LAYER_ORDER_OPTIONS, layerOrderLabel, type LibraryCategory } from '../../../../lib/settings/defaults';
import { type } from '../../../../theme';

const ORDER_OPTIONS = LAYER_ORDER_OPTIONS.map((value) => ({ value, label: layerOrderLabel(value) }));
type Order = (typeof LAYER_ORDER_OPTIONS)[number];

// Exactly the switches the website's Companion Panel settings have (js/my-sanctuary.js);
// Traditional and Community offer fewer than My Practice there.
const SHARED: LibraryCategory[] = ['meanings', 'uses', 'correspondences', 'ingredients', 'intentions', 'pairings', 'substitutions', 'warnings'];
const COMPANION_LAYERS: { prefix: string; label: string; show: string; fields: LibraryCategory[] }[] = [
  {
    prefix: 'my',
    label: 'My Practice',
    show: 'Show My Practice',
    fields: [...SHARED, 'grimoire', 'dressings', 'groups', 'notes', 'sources'],
  },
  { prefix: 'traditional', label: 'Traditional Information', show: 'Show Traditional', fields: [...SHARED, 'sources'] },
  { prefix: 'community', label: 'Community Information', show: 'Show Community', fields: [...SHARED, 'notes', 'sources'] },
];

export default function CompanionSettings() {
  return (
    <SettingsForm title="Companion panel">
      {(draft, set) => {
        const copying = draft.companion_copy_grimoire_settings !== false;
        return (
          <>
            <Text style={type.body}>Choose what the About sheet shows when you select an object on your altar.</Text>
            <MenuList>
              <SwitchRow
                label="Copy my Living Library page settings"
                detail="Show the same layers and fields as Library pages."
                value={copying}
                onChange={(v) => set('companion_copy_grimoire_settings', v)}
                last
              />
            </MenuList>
            {copying ? (
              <Text style={type.caption}>Turn this off to choose the layer order and fields for the altar separately.</Text>
            ) : (
              <>
                <Section label="Layer order">
                  <Chips
                    label="Companion layer order"
                    options={ORDER_OPTIONS}
                    value={(draft.companion_layer_order as Order) || LAYER_ORDER_OPTIONS[0]}
                    onChange={(v) => set('companion_layer_order', v)}
                  />
                </Section>
                {COMPANION_LAYERS.map((layer) => {
                  const enabledKey = `companion_${layer.prefix}_enabled`;
                  const enabled = draft[enabledKey] === true;
                  return (
                    <Section key={layer.prefix} label={layer.label}>
                      <MenuList>
                        <SwitchRow label={layer.show} value={enabled} onChange={(v) => set(enabledKey, v)} last={!enabled} />
                        {enabled &&
                          layer.fields.map((field, index) => {
                            const key = `companion_${layer.prefix}_${field}`;
                            return (
                              <SwitchRow
                                key={key}
                                label={CATEGORY_LABELS[field]}
                                value={draft[key] === true}
                                onChange={(v) => set(key, v)}
                                last={index === layer.fields.length - 1}
                              />
                            );
                          })}
                      </MenuList>
                      {layer.prefix === 'community' && (
                        <Text style={type.caption}>Community information will appear once the Community Grimoire is connected.</Text>
                      )}
                    </Section>
                  );
                })}
              </>
            )}
          </>
        );
      }}
    </SettingsForm>
  );
}
