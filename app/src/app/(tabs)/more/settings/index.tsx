import { router } from 'expo-router';
import { Text } from 'react-native';

import { MenuList, MenuRow, MoreScreen } from '../../../../components/more/ui';
import { useSession } from '../../../../lib/session';
import { layerOrderLabel } from '../../../../lib/settings/defaults';
import { useMySettings } from '../../../../lib/settings/store';
import { type } from '../../../../theme';

export default function SettingsIndex() {
  const { session } = useSession();
  const { settings } = useMySettings();
  const name = settings?.preferred_name || settings?.magical_name || '';

  return (
    <MoreScreen title="Settings" eyebrow="Shape your Sanctuary" back="/more" backLabel="Back to More">
      <MenuList>
        <MenuRow
          icon="account"
          label="Identity"
          detail={name ? `${name}${settings?.pronouns ? ` · ${settings.pronouns}` : ''}` : 'Names and pronouns'}
          onPress={() => router.push('/more/settings/identity')}
        />
        <MenuRow
          icon="community"
          label="Book of Shadows"
          detail="Mundane mode, page font"
          onPress={() => router.push('/more/settings/book')}
        />
        <MenuRow
          icon="library"
          label="Living Library"
          detail={settings ? layerOrderLabel(settings.library_layer_order) : 'Layers and what they show'}
          onPress={() => router.push('/more/settings/library')}
          last
        />
      </MenuList>
      <Text style={type.caption}>
        {session
          ? 'Settings are shared with the website, so a change here shows up there too.'
          : 'As a guest, settings stay on this device.'}
      </Text>
    </MoreScreen>
  );
}
