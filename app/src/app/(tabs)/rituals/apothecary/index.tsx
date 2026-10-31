import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { ItemDidItWork } from '../../../../components/rituals/ItemDidItWork';
import { answeredItems, dueItems, itemLookBack, waitingItems } from '../../../../lib/altar/apothecaryLookBack';
import type { ApothecaryItem } from '../../../../lib/altar/apothecary';
import { useWorkshop } from '../../../../lib/altar/workshop';
import { fullDate } from '../../../../lib/calendar';
import { answerLabel } from '../../../../lib/rituals/lookBack';

const open = (item: ApothecaryItem) => router.push({ pathname: '/rituals/apothecary/[id]', params: { id: item.id } });

// "Did it work?" for what you've made in My Apothecary: spell jars, sachets,
// poppets, oils and the rest. Answers count in What works for you.
export default function ApothecaryLookBacks() {
  const { apothecary, status } = useWorkshop();
  const now = useMemo(() => new Date(), []);
  const due = useMemo(() => dueItems(apothecary, now), [apothecary, now]);
  const waiting = useMemo(() => waitingItems(apothecary, now), [apothecary, now]);
  const answered = useMemo(() => answeredItems(apothecary), [apothecary]);
  const unset = useMemo(() => apothecary.filter((i) => !itemLookBack(i)), [apothecary]);

  return (
    <RitualScreen back="Back">
      <Title eyebrow="Jars & sachets">Apothecary</Title>
      <Body muted>The spell jars, sachets, poppets, oils and other workings you’ve made in your Apothecary, and whether they worked.</Body>

      {status === 'loading' && !apothecary.length ? (
        <Body muted>Opening…</Body>
      ) : apothecary.length === 0 ? (
        <Card>
          <Body>Make a spell jar, sachet, oil or poppet from the altar’s apothecary and choose a day to look back. When it comes, you’ll be asked whether it worked, here, on Today and with a reminder if they’re on.</Body>
        </Card>
      ) : (
        <>
          {due.map((item) => (
            <View key={item.id} style={ui.gapSmall}>
              <ItemDidItWork item={item} compact />
            </View>
          ))}

          {waiting.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Looking back soon</SectionLabel>
              <List>
                {waiting.map((item, i) => (
                  <Row
                    key={item.id}
                    icon="calendar"
                    title={item.name}
                    detail={`${item.typeLabel} · look back ${fullDate(itemLookBack(item)?.date) ?? ''}`}
                    last={i === waiting.length - 1}
                    onPress={() => open(item)}
                  />
                ))}
              </List>
            </View>
          )}

          {answered.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Looked back on</SectionLabel>
              <List>
                {answered.map((item, i) => (
                  <Row
                    key={item.id}
                    icon="grimoire"
                    title={item.name}
                    detail={`${item.typeLabel} · ${answerLabel(itemLookBack(item)?.answer)}`}
                    last={i === answered.length - 1}
                    onPress={() => open(item)}
                  />
                ))}
              </List>
            </View>
          )}

          {unset.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>No look-back day yet</SectionLabel>
              <List>
                {unset.map((item, i) => (
                  <Row
                    key={item.id}
                    icon="altar"
                    title={item.name}
                    detail={[item.typeLabel, item.intention].filter(Boolean).join(' · ')}
                    last={i === unset.length - 1}
                    onPress={() => open(item)}
                  />
                ))}
              </List>
            </View>
          )}
        </>
      )}

      <List>
        <Row
          icon="grimoire"
          title="Your harvests and store cupboard"
          detail="What you’ve gathered and dried, ready to make into something"
          last
          onPress={() => router.push('/rituals/craft/hearth/forage/harvests')}
        />
      </List>
    </RitualScreen>
  );
}
