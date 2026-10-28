import { router } from 'expo-router';
import { Text } from 'react-native';

import { MenuList, MenuRow, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { COUNT_ME_KEY, countsMe } from '../../../../lib/covens/paths';
import { type } from '../../../../theme';

// Settings → Covens & privacy: your coven profile (what covens see of you),
// and whether you're counted in your covens' Paths in the coven
// (`coven_paths_count_me`, once under My practice; lib/covens/paths.ts).
export default function CovenPrivacySettings() {
  return (
    <SettingsForm title="Covens & privacy">
      {(draft, set) => (
        <>
          <Section label="Your coven profile">
            <MenuList>
              <MenuRow label="Coven profile" detail="The name, pronouns and few words other members see" onPress={() => router.push('/coven/profile')} last />
            </MenuList>
          </Section>
          <Section label="Paths in the coven">
            <Text style={type.caption}>
              Covens can see what share of their members practise each way, keep each path and honour each deity, never who. Anything fewer than three share is gathered under Other.
            </Text>
            <MenuList>
              <SwitchRow
                label="Count me in my covens’ paths overview"
                detail="Off: your practice, path and deities are left out of every coven’s count."
                value={countsMe(draft)}
                onChange={(on) => set(COUNT_ME_KEY, on)}
                last
              />
            </MenuList>
          </Section>
          <Section label="Notifications">
            <MenuList>
              <MenuRow
                label="Coven notifications"
                detail="Chat, conversations, gatherings and applications, per coven"
                onPress={() => router.push({ pathname: '/more/settings/notifications', params: { section: 'covens' } })}
                last
              />
            </MenuList>
          </Section>
        </>
      )}
    </SettingsForm>
  );
}
