import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuList, MenuRow, Section } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { altarImageSource } from '../../../../lib/altar/assets';
import { builtInBackgrounds, defaultAltarBackground } from '../../../../lib/altar/cabinet';
import { colors, fonts, radius, type } from '../../../../theme';

type Choice = { value: string; label: string; image: string };

/**
 * The website's Default Altar background picker (js/settings-view.js): no
 * default, then each built-in background by name, which is what it saves.
 * A saved value the app doesn't know is kept and shown as unavailable.
 */
function choicesFor(saved: string): Choice[] {
  const choices: Choice[] = [
    { value: '', label: 'No default', image: '' },
    ...builtInBackgrounds.map((bg) => ({ value: bg.name, label: bg.name, image: bg.background })),
  ];
  if (saved && !defaultAltarBackground(saved)) choices.push({ value: saved, label: `${saved} (currently unavailable)`, image: '' });
  return choices;
}

// Settings → Altar: the background a new altar starts on (once Appearance),
// what the About sheet shows (Companion panel and Living Objects together),
// and the Home screen widget.
export default function AltarSettings() {
  return (
    <SettingsForm title="Altar">
      {(draft, set) => {
        const saved = draft.default_altar_background || '';
        // A path saved by an older version still selects its background.
        const current = defaultAltarBackground(saved)?.name ?? saved;
        return (
          <>
          <Section label="Default altar background">
            <Text style={type.caption}>A new altar starts on this scene. You can still change it on each altar.</Text>
            <View accessibilityRole="radiogroup" accessibilityLabel="Default altar background" style={styles.grid}>
              {choicesFor(saved).map((choice) => {
                const selected = choice.value === current;
                const source = altarImageSource(choice.image);
                return (
                  <Pressable
                    key={choice.value || 'none'}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={choice.label}
                    onPress={() => set('default_altar_background', choice.value)}
                    style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && { opacity: 0.8 }]}
                  >
                    {source ? (
                      <Image source={source} style={styles.thumb} resizeMode="cover" />
                    ) : (
                      <View style={[styles.thumb, styles.placeholder]}>
                        <Text style={styles.star}>✦</Text>
                      </View>
                    )}
                    <Text style={[styles.label, selected && styles.labelOn]}>{choice.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Section>
          <Section label="On your altars">
            <MenuList>
              <MenuRow label="About sheet" detail="What shows when you select something on your altar" onPress={() => router.push('/more/settings/about-sheet')} />
              <MenuRow label="Home screen widget" detail="Which altar is in each of the widget’s places" onPress={() => router.push('/more/settings/widget')} last />
            </MenuList>
          </Section>
          </>
        );
      }}
    </SettingsForm>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  optionOn: { borderColor: colors.gold, borderWidth: 2 },
  thumb: { width: '100%', aspectRatio: 4 / 3 },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  star: { fontSize: 28, color: colors.goldDeep },
  label: { fontFamily: fonts.body, fontSize: 14, color: colors.parchment, padding: 10 },
  labelOn: { fontFamily: fonts.bodySemi, color: colors.gold },
});
