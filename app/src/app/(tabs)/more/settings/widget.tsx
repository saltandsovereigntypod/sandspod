import { useMemo, useState } from 'react';
import { Platform, Text } from 'react-native';

import { WidgetSheet } from '../../../../components/altar/WidgetSheet';
import { MenuList, MenuRow, MoreScreen, Section } from '../../../../components/more/ui';
import { activeAltars } from '../../../../lib/altar/archive';
import { useAltars } from '../../../../lib/altar/store';
import { ALTAR_WIDGET_SLOTS, placeAltars } from '../../../../lib/altarWidget';
import { useAltarWidgetSlots } from '../../../../lib/altarWidgetSlots';
import { covenWidgetEntry, useCovenWidgetAltars } from '../../../../lib/covenAltarWidgetData';
import { type } from '../../../../theme';

type Picked = { id: string; name: string; coven?: { canEdit: boolean; reason: string } };

// Settings → Altar → Home screen widget: what is in each of the Altar
// widget's places (Altar 1 to Altar 6), and a place for any altar, chosen in
// the same sheet as the Home screen chip on each altar (WidgetSheet, which
// keeps the choice on this phone, lib/altarWidgetSlots.ts). Coven altars
// already on the widget (coven:<id>) are listed with your own.
export default function WidgetSettings() {
  const { altars } = useAltars();
  const chosen = useAltarWidgetSlots();
  const covenAltars = useCovenWidgetAltars();
  const own = useMemo(() => activeAltars(altars), [altars]);
  const placed = useMemo(() => placeAltars([...own, ...covenAltars], chosen), [own, covenAltars, chosen]);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [open, setOpen] = useState(false);

  const placeOf = (id: string) => placed.findIndex((a) => a?.id === id) + 1;
  const pick = (next: Picked) => {
    setPicked(next);
    setOpen(true);
  };

  return (
    <MoreScreen title="Home screen widget" eyebrow="Settings · Altar" back="/more/settings/altar">
      <Text style={type.body}>
        {Platform.OS === 'web'
          ? 'The Altar widget sits on the home screen of a phone with the Salt & Sovereignty app. These choices are kept on each phone.'
          : `The Altar widget can show any of six altars on your ${Platform.OS === 'ios' ? 'home or lock screen' : 'home screen'}, each set to “Altar 1” to “Altar 6” in its own settings. Choices are kept on this phone.`}
      </Text>
      <Section label="On the widget">
        <MenuList>
          {Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => {
            const altar = placed[i];
            const yours = altar && chosen[i] === altar.id;
            return (
              <MenuRow
                key={i}
                label={`Altar ${i + 1}`}
                detail={altar ? `${altar.name}${yours ? '' : ' (most recent, until you choose)'}` : 'Empty'}
                onPress={altar ? () => pick(pickedFor(altar.id, altar.name)) : undefined}
                last={i === ALTAR_WIDGET_SLOTS - 1}
              />
            );
          })}
        </MenuList>
      </Section>
      <Section label="Your altars">
        {own.length === 0 ? (
          <Text style={type.caption}>Save an altar and it can go on the widget.</Text>
        ) : (
          <MenuList>
            {[...own, ...covenAltars].map((altar, index, all) => (
              <MenuRow
                key={altar.id}
                label={altar.name || 'My Altar'}
                detail={placeOf(altar.id) ? `Altar ${placeOf(altar.id)}` : 'Not on the widget'}
                onPress={() => pick(pickedFor(altar.id, altar.name || 'My Altar'))}
                last={index === all.length - 1}
              />
            ))}
          </MenuList>
        )}
        <Text style={type.caption}>To put a coven altar on the widget, open it in its coven and tap Home screen.</Text>
      </Section>
      {picked && (
        <WidgetSheet visible={open} altarId={picked.id} altarName={picked.name} altars={own} coven={picked.coven} onClose={() => setOpen(false)} />
      )}
    </MoreScreen>
  );
}

function pickedFor(id: string, name: string): Picked {
  const entry = id.startsWith('coven:') ? covenWidgetEntry(id.slice('coven:'.length)) : undefined;
  if (!id.startsWith('coven:')) return { id, name };
  return {
    id,
    name,
    coven: { canEdit: !!entry?.tendable, reason: entry?.tendable ? '' : 'You can’t tend it from the widget just now.' },
  };
}
