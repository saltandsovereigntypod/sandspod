import { Text } from 'react-native';

import { Chips, MenuList, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { CATEGORY_LABELS, LAYER_ORDER_OPTIONS, layerOrderLabel, type LibraryCategory } from '../../../../lib/settings/defaults';
import { type } from '../../../../theme';

const ORDER_OPTIONS = LAYER_ORDER_OPTIONS.map((value) => ({ value, label: layerOrderLabel(value) }));
type Order = (typeof LAYER_ORDER_OPTIONS)[number];

// The website's Living State Panel switches (js/my-sanctuary.js), in its order.
// Two of them (created date, source) only change the website's panel; the
// app's About sheet doesn't show those, so they're set apart below.
const ROWS: { key: string; label: string; detail?: string }[] = [
  { key: 'living_state_show_status', label: 'Show status', detail: 'Burning, offering status' },
  { key: 'living_state_show_last_tended', label: 'Show last tended', detail: 'Last burned, cleansed, charged or offered' },
  { key: 'living_state_show_expiration', label: 'Show expiration reminder', detail: 'Review by' },
  { key: 'living_state_show_future_tending', label: 'Show future tending', detail: 'Next tending' },
  { key: 'living_state_show_remaining', label: 'Show remaining amounts', detail: 'Remaining, burning time' },
  { key: 'living_state_show_recent_activity', label: 'Show recent activity', detail: 'The History of burns, care and offerings' },
];

const WEBSITE_ROWS: { key: string; label: string }[] = [
  { key: 'living_state_show_created', label: 'Show created date' },
  { key: 'living_state_show_source', label: 'Show source' },
];

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

// Settings → Altar → About sheet: what shows when you select something on an
// altar. Its Library layers (once Companion panel) and its living state (once
// Living Objects), the same keys as ever.
export default function AboutSheetSettings() {
  return (
    <SettingsForm title="About sheet" eyebrow="Settings · Altar" back="/more/settings/altar">
      {(draft, set) => {
        const copying = draft.companion_copy_grimoire_settings !== false;
        return (
          <>
            <Text style={type.body}>Choose what the About sheet shows when you select an object on your altar.</Text>
            <Section label="From the Living Library">
            <MenuList>
              <SwitchRow
                label="Copy my Living Library page settings"
                detail="Show the same layers and fields as Library pages."
                value={copying}
                onChange={(v) => set('companion_copy_grimoire_settings', v)}
                last
              />
            </MenuList>
            </Section>
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
                        <Text style={type.caption}>Shown where the community has added to an entry.</Text>
                      )}
                    </Section>
                  );
                })}
              </>
            )}
            <Section label="Its living state">
              <MenuList>
                {ROWS.map((row, index) => (
                  <SwitchRow
                    key={row.key}
                    label={row.label}
                    detail={row.detail}
                    value={draft[row.key] !== false}
                    onChange={(v) => set(row.key, v)}
                    last={index === ROWS.length - 1}
                  />
                ))}
              </MenuList>
            </Section>
            <Section label="On the website only">
              <Text style={type.caption}>The website’s panel can also show these. The app’s About sheet doesn’t, so they change nothing here.</Text>
              <MenuList>
                {WEBSITE_ROWS.map((row, index) => (
                  <SwitchRow
                    key={row.key}
                    label={row.label}
                    value={draft[row.key] !== false}
                    onChange={(v) => set(row.key, v)}
                    last={index === WEBSITE_ROWS.length - 1}
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
