import { Chips, Field, Section } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { GREETING_OPTIONS } from '../../../../lib/settings/defaults';

type Greeting = (typeof GREETING_OPTIONS)[number]['value'];

export default function IdentitySettings() {
  return (
    <SettingsForm title="Identity">
      {(draft, set) => (
        <>
          <Field label="Preferred name" value={draft.preferred_name} onChangeText={(v) => set('preferred_name', v)} autoComplete="name" />
          <Field
            label="Pronouns"
            value={draft.pronouns}
            onChangeText={(v) => set('pronouns', v)}
            placeholder="she/her, they/them, he/him…"
            autoCapitalize="none"
          />
          <Field
            label="Magical name"
            value={draft.magical_name}
            onChangeText={(v) => set('magical_name', v)}
            hint="Offerings can be credited to this name instead of your preferred name."
          />
          <Section label="Greet me with">
            <Chips
              label="Greet me with"
              options={GREETING_OPTIONS}
              value={(draft.sanctuary_greeting_name as Greeting) || 'preferred'}
              onChange={(v) => set('sanctuary_greeting_name', v)}
            />
          </Section>
        </>
      )}
    </SettingsForm>
  );
}
