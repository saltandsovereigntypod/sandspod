import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { MenuList, SwitchRow } from '../../../../../components/more/ui';
import { SettingsForm } from '../../../../../components/more/SettingsForm';
import { CATEGORY_LABELS, LAYER_LABELS, LAYERS, LIBRARY_CATEGORIES, type Layer } from '../../../../../lib/settings/defaults';
import { type } from '../../../../../theme';

export default function LayerSettings() {
  const params = useLocalSearchParams<{ layer: string }>();
  const layer: Layer = (LAYERS as readonly string[]).includes(params.layer) ? (params.layer as Layer) : 'myPractice';

  return (
    <SettingsForm title={LAYER_LABELS[layer]} eyebrow="Living Library" back="/more/settings/library">
      {(draft, set) => (
        <>
          <Text style={type.body}>Choose what the {LAYER_LABELS[layer]} layer shows on Library pages.</Text>
          <MenuList>
            {LIBRARY_CATEGORIES.map((category, index) => {
              const key = `library_${layer}_${category}`;
              return (
                <SwitchRow
                  key={key}
                  label={CATEGORY_LABELS[category]}
                  value={draft[key] !== false}
                  onChange={(v) => set(key, v)}
                  last={index === LIBRARY_CATEGORIES.length - 1}
                />
              );
            })}
          </MenuList>
        </>
      )}
    </SettingsForm>
  );
}
