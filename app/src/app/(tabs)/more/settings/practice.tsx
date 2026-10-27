import { Text } from 'react-native';

import { MenuList, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { COUNT_ME_KEY, countsMe } from '../../../../lib/covens/paths';
import { hiddenKinds, HIDDEN_KINDS_KEY, KIND_CHOICES, withKindShown } from '../../../../lib/divination/oracle/kinds';
import { myPractices, PRACTICES, practicesValue } from '../../../../lib/rituals/premade';
import { type } from '../../../../theme';

// What kind of witch you are, alongside My path (the traditions you keep).
// It puts the premade rituals and spells that suit your practice first.
// Also which kinds of draw Divination offers, and whether you're counted in
// your covens' Paths in the coven (lib/covens/paths.ts).
export default function PracticeSettings() {
  return (
    <SettingsForm title="My practice">
      {(draft, set) => {
        const chosen = myPractices(draft);
        const toggle = (id: string, on: boolean) =>
          set('my_practice', practicesValue(on ? [...chosen, id] : chosen.filter((p) => p !== id)));
        const hidden = hiddenKinds(draft);
        return (
          <>
            <Section label="How you practise">
              <Text style={type.caption}>
                Choose as many as fit. Rituals & spells puts workings for your practice first, and your path (Settings → Living Library) adds the traditions you keep.
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
            <Section label="Your covens">
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
            <Section label="Divination: what to draw">
              <Text style={type.caption}>The kinds the draw screen offers. Hide the ones you don’t use; your readings with them are kept.</Text>
              <MenuList>
                {KIND_CHOICES.map((k, index) => (
                  <SwitchRow
                    key={k.id}
                    label={k.label}
                    detail={k.detail}
                    value={!hidden.includes(k.id)}
                    onChange={(on) => set(HIDDEN_KINDS_KEY, withKindShown(draft, k.id, on))}
                    last={index === KIND_CHOICES.length - 1}
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
