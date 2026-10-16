import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Expander, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { asPlant, eventLabel, isGrowing, PLANTS, plantSummary, sortPlants, type Plant } from '../../../../../lib/craft/green/garden';
import { useCraft } from '../../../../../lib/craft/store';
import { fullDate } from '../../../../../lib/calendar';
import { useSession } from '../../../../../lib/session';

const shortDay = (key: string) => fullDate(key)?.replace(/, \d{4}$/, '') ?? key;

function detailOf(plant: Plant): string {
  const { last, harvests } = plantSummary(plant);
  const parts = [
    plant.place || null,
    last ? `${eventLabel(last.kind)} ${shortDay(last.on)} · ${last.moon}` : 'Nothing logged yet',
    harvests ? `${harvests} ${harvests === 1 ? 'harvest' : 'harvests'}` : null,
  ];
  return parts.filter(Boolean).join(' · ');
}

export default function MyGarden() {
  const { entries, ready } = useCraft<unknown>(PLANTS);
  const { session } = useSession();
  const plants = sortPlants(entries.map((e) => ({ ...e, data: asPlant(e.data) })));
  const growing = plants.filter((p) => isGrowing(p.data));
  const gone = plants.filter((p) => !isGrowing(p.data));

  const open = (id: string) => router.push({ pathname: '/rituals/craft/green/plant/[id]', params: { id } } as unknown as Href);

  return (
    <RitualScreen back="Green">
      <Title eyebrow="Your plants, sowings and harvests">My garden</Title>

      <Button label="Add a plant" onPress={() => router.push('/rituals/craft/green/plant/new' as Href)} />

      {!ready ? (
        <Body muted>Opening your garden…</Body>
      ) : !plants.length ? (
        <Card>
          <SectionLabel>An empty bed</SectionLabel>
          <Body>
            Add the herbs and flowers you grow, in the ground or in a pot on the sill. Log each sowing, feeding, harvest and offering, and the moon it happened under is
            kept with it, so over the seasons you can see what your garden does under each tide.
          </Body>
        </Card>
      ) : (
        <>
          {growing.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Growing</SectionLabel>
              <List>
                {growing.map((p, i) => (
                  <Row key={p.id} icon="wheel" title={p.data.name} detail={detailOf(p.data)} last={i === growing.length - 1} onPress={() => open(p.id)} />
                ))}
              </List>
            </View>
          )}
          {gone.length > 0 && (
            <Expander title={`Gone from the garden (${gone.length})`}>
              <List>
                {gone.map((p, i) => (
                  <Row
                    key={p.id}
                    icon="wheel"
                    title={p.data.name}
                    detail={[p.data.goneOn ? `Gone ${shortDay(p.data.goneOn)}` : null, p.data.goneNote].filter(Boolean).join(' · ')}
                    last={i === gone.length - 1}
                    onPress={() => open(p.id)}
                  />
                ))}
              </List>
            </Expander>
          )}
        </>
      )}

      <Body muted>{session ? 'Saved on this phone and to your account.' : 'Saved on this phone. Sign in to keep your garden with your account.'}</Body>
    </RitualScreen>
  );
}
