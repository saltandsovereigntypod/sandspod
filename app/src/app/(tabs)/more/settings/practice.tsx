import { Text } from 'react-native';

import { MenuList, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { myPractices, PRACTICES, practicesValue } from '../../../../lib/rituals/premade';
import { type } from '../../../../theme';

// What kind of witch you are, alongside My path (the traditions you keep).
// It puts the premade rituals and spells that suit your practice first.
// (Which kinds of draw Divination offers moved to Settings → Divination, and
// the coven paths switch to Settings → Covens & privacy.)
export default function PracticeSettings() {
  return (
    <SettingsForm title="Your crafts">
      {(draft, set) => {
        const chosen = myPractices(draft);
        const toggle = (id: string, on: boolean) =>
          set('my_practice', practicesValue(on ? [...chosen, id] : chosen.filter((p) => p !== id)));
        return (
          <>
            <Section label="How you practise">
              <Text style={type.caption}>
                Choose as many as fit. Rituals & spells puts workings for your practice first, and your path (Settings → Path & traditions) adds the traditions you keep.
              </Text>
              <MenuList>
                {PRACTICES.map((p, index) => (
                  <SwitchRow
                    key={p.id}
                    label={p.name}
                    detail={p.about}
                    value={chosen.includes(p.id)}
                    onChange={(on) => toggle(p.id, on)}
                    last={index === PRACTICES.length - 1}
                  />
                ))}
              </MenuList>
            </Section>
            <Text style={type.caption}>Which kinds of draw Divination offers is now in Settings → Divination, and whether covens count you in their paths in Settings → Covens & privacy.</Text>
          </>
        );
      }}
    </SettingsForm>
  );
}
