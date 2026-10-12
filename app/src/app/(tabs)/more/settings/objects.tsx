import { Text } from 'react-native';

import { MenuList, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { type } from '../../../../theme';

// The website's Living State Panel switches (js/my-sanctuary.js), in its order.
const ROWS: { key: string; label: string; detail?: string }[] = [
  { key: 'living_state_show_status', label: 'Show status', detail: 'Burning, offering status' },
  { key: 'living_state_show_created', label: 'Show created date', detail: 'Shown on the website' },
  { key: 'living_state_show_source', label: 'Show source', detail: 'Shown on the website' },
  { key: 'living_state_show_last_tended', label: 'Show last tended', detail: 'Last burned, cleansed, charged or offered' },
  { key: 'living_state_show_expiration', label: 'Show expiration reminder', detail: 'Review by' },
  { key: 'living_state_show_future_tending', label: 'Show future tending', detail: 'Next tending' },
  { key: 'living_state_show_remaining', label: 'Show remaining amounts', detail: 'Remaining, burning time' },
  { key: 'living_state_show_recent_activity', label: 'Show recent activity', detail: 'The History of burns, care and offerings' },
];

export default function LivingObjectSettings() {
  return (
    <SettingsForm title="Living Objects">
      {(draft, set) => (
        <>
          <Text style={type.body}>Choose what an object’s About sheet shows about its living state.</Text>
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
        </>
      )}
    </SettingsForm>
  );
}
