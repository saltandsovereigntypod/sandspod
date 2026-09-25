// "Everything connects": a ritual's grimoire page, altar, template, date and
// ingredients, each one tap away. Only links whose data exists are shown.

import { router } from 'expo-router';
import { View } from 'react-native';

import { fullDate } from '../../lib/calendar';
import { refToParam } from '../../lib/rituals/format';
import type { AltarSummary } from '../../lib/rituals/store';
import { Chip, Chips, SectionLabel, ui } from './ui';

type Props = {
  grimoirePageId?: string | null;
  altarId?: string | null;
  altars?: AltarSummary[];
  templateId?: string | null;
  templateTitle?: string | null;
  date?: string | null;
  ingredients?: { ref: string; name: string }[];
};

export function Connections({ grimoirePageId, altarId, altars = [], templateId, templateTitle, date, ingredients = [] }: Props) {
  const altarName = altarId ? altars.find((a) => a.id === altarId)?.name ?? 'Your altar' : null;
  const dateText = date ? fullDate(date) : null;
  const any = grimoirePageId || altarId || templateId || dateText || ingredients.length;
  if (!any) return null;

  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Connected</SectionLabel>
      <Chips>
        {!!grimoirePageId && (
          <Chip
            label="Grimoire page"
            a11yLabel="Open its page in your grimoire"
            onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: grimoirePageId } })}
          />
        )}
        {!!altarId && (
          <Chip
            label={altarName ?? 'Altar'}
            a11yLabel={`Open the altar ${altarName}`}
            onPress={() => router.push({ pathname: '/altar', params: { altarId } })}
          />
        )}
        {!!templateId && (
          <Chip
            label={templateTitle ? `Template · ${templateTitle}` : 'Template'}
            a11yLabel="Open the template"
            onPress={() => router.push({ pathname: '/rituals/templates/[id]', params: { id: templateId } })}
          />
        )}
        {!!dateText && !!date && (
          <Chip
            label={dateText}
            a11yLabel={`${dateText}: see that night's moon and weekday`}
            onPress={() => router.push({ pathname: '/rituals/planner', params: { date } })}
          />
        )}
        {ingredients.map((item) => (
          <Chip
            key={item.ref}
            label={item.name}
            a11yLabel={`${item.name}, from the Library`}
            onPress={() => router.push({ pathname: '/rituals/ingredient/[ref]', params: { ref: refToParam(item.ref) } })}
          />
        ))}
      </Chips>
    </View>
  );
}
