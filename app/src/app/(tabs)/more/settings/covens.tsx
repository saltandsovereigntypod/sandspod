import { router } from 'expo-router';
import { Text } from 'react-native';

import { MenuList, MenuRow, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { COUNT_ME_KEY, countsMe } from '../../../../lib/covens/paths';
import { RITUAL_SIT_KEYS, ritualSitPrefs, withLayer } from '../../../../lib/covens/ritualPanel';
import { LAYERS } from '../../../../lib/meditation/sound';
import { type } from '../../../../theme';

// Settings → Covens & privacy: your coven profile (what covens see of you),
// and whether you're counted in your covens' Paths in the coven
// (`coven_paths_count_me`, once under My practice; lib/covens/paths.ts), and
// how a sit runs for you in the Ritual panel over a coven altar (During coven
// rituals: lib/covens/ritualPanel.ts ritualSitPrefs).
export default function CovenPrivacySettings() {
  return (
    <SettingsForm title="Covens & privacy">
      {(draft, set) => {
        const sit = ritualSitPrefs(draft as unknown as Record<string, unknown>);
        return (
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
          <Section label="During coven rituals">
            <Text style={type.caption}>
              When a ritual step is a sit (Ground & centre, Clearing, Candle gazing), it runs in the Ritual panel at the altar, for everyone at once from the moment the leader starts the step. These choices are yours alone.
            </Text>
            <MenuList>
              <SwitchRow label="Guidance" detail="The sit’s written guidance, a line at a time" value={sit.guidance} onChange={(on) => set(RITUAL_SIT_KEYS.guidance, on)} />
              <SwitchRow label="Breath circle" detail="A slow circle to breathe with: in for four, out for six" value={sit.breath} onChange={(on) => set(RITUAL_SIT_KEYS.breath, on)} />
              <SwitchRow label="Bells" detail="A bell to begin the sit and to end it" value={sit.bells} onChange={(on) => set(RITUAL_SIT_KEYS.bells, on)} />
              <SwitchRow label="Sound" detail="Sound layers under the sit, from this phone" value={sit.sound} onChange={(on) => set(RITUAL_SIT_KEYS.sound, on)} last={!sit.sound} />
              {sit.sound &&
                LAYERS.map((l, i) => (
                  <SwitchRow key={l.id} label={l.label} detail={l.line} value={sit.layers.includes(l.id)} onChange={(on) => set(RITUAL_SIT_KEYS.layers, withLayer(sit, l.id, on))} last={i === LAYERS.length - 1} />
                ))}
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
        );
      }}
    </SettingsForm>
  );
}
