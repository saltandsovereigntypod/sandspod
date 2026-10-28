import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "../../../../../components/Button";
import {
  CovenScreen,
  covenHref,
} from "../../../../../components/covens/CovenScreen";
import { Pill, Pills } from "../../../../../components/covens/ui";
import {
  Card,
  Chips,
  Field,
  Notice,
  Section,
} from "../../../../../components/more/ui";
import {
  archiveAltar,
  createAltar,
  deleteAltar,
  fetchAltarCounts,
  fetchCovenAltars,
  petitionOf,
  TEND_CHOICES,
  tendedBy,
  type CovenAltar,
} from "../../../../../lib/covens/altarSync";
import { archiveAltarWords, deleteAltarWords } from "../../../../../lib/covens/altarPanel";
import { useCoven } from "../../../../../lib/covens/CovenContext";
import { errorMessage } from "../../../../../lib/covens/model";
import { confirmAction } from "../../../../../lib/grimoire/confirm";
import { colors, radius, type } from "../../../../../theme";

// The coven's altars: the main ritual altar, kept by the coven's head, and any
// others members have started. Each is the whole altar, tended together.
export default function CovenAltars() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const [altars, setAltars] = useState<CovenAltar[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [starting, setStarting] = useState(false);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<CovenAltar["edit_mode"]>("members");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showCleared, setShowCleared] = useState(false);

  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const [list, numbers] = await Promise.all([
        fetchCovenAltars(covenId),
        fetchAltarCounts(covenId).catch(() => ({})),
      ]);
      setAltars(list);
      setCounts(numbers);
      await coven.loadNames(list.map((a) => a.created_by));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when the coven changes
  }, [covenId]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (altar: CovenAltar) =>
    router.push(covenHref(coven.slug, `altars/${altar.id}`));

  const start = async () => {
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      const made = await createAltar(covenId, name.trim() || "An altar", mode);
      setStarting(false);
      setName("");
      await load();
      open(made);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  // The altar's keepers delete it: the coven's head, positions that keep
  // altars, whoever started it, the site's moderators (the database decides).
  const mayDelete = (altar: CovenAltar) =>
    !altar.is_main &&
    !petitionOf(altar) &&
    (coven.perms.founder || coven.perms.manage || coven.perms.keepAltars || coven.perms.site || altar.created_by === coven.userId);
  const remove = async (altar: CovenAltar) => {
    const words = deleteAltarWords(altar.name);
    if (!(await confirmAction(words.title, `${words.body} ${words.gentler}`, words.confirm))) return;
    setBusy(true);
    setMessage(null);
    try {
      await deleteAltar(altar.id);
      await load();
      setMessage(`${altar.name.trim() || "The altar"} is deleted.`);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  // Archive keeps the altar and everything on it, out of the list, until its
  // keepers restore it (the same keepers who may delete it).
  const setArchived = async (altar: CovenAltar, archived: boolean) => {
    const words = archiveAltarWords(altar.name);
    if (archived && !(await confirmAction(words.title, words.body, words.confirm))) return;
    setBusy(true);
    setMessage(null);
    try {
      await archiveAltar(altar.id, archived);
      await load();
      setMessage(archived ? words.archived : words.restored);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const here = (altar: CovenAltar) =>
    coven.presence.filter((p) => p.place === `altar:${altar.id}`).length;
  const showing = (altars ?? []).filter((a) => !a.archived_at);
  const cleared = (altars ?? []).filter((a) => a.archived_at && !petitionOf(a));
  const petitionAltars = showing.filter((a) => petitionOf(a));
  const canStart = coven.perms.startAltars && coven.standing.ok;

  const card = (altar: CovenAltar) => (
    <Pressable
      key={altar.id}
      onPress={() => open(altar)}
      accessibilityRole="button"
      accessibilityLabel={`${altar.name}. ${counts[altar.id] ?? 0} things on it. ${tendedBy(altar)}.${here(altar) ? ` ${here(altar)} here now.` : ""}`}
      style={({ pressed }) => [
        styles.altar,
        altar.is_main && styles.main,
        pressed && styles.pressed,
      ]}
    >
      <Text style={type.eyebrow}>
        {altar.is_main
          ? "The ritual altar"
          : petitionOf(altar)
            ? `${coven.nameOf(altar.created_by)}’s petition`
            : `Started by ${coven.nameOf(altar.created_by)}`}
      </Text>
      <Text style={type.cardTitle}>{altar.name}</Text>
      <Pills>
        <Pill
          label={`${counts[altar.id] ?? 0} ${counts[altar.id] === 1 ? "thing" : "things"}`}
        />
        <Pill label={tendedBy(altar)} />
        {here(altar) > 0 && (
          <Pill label={`${here(altar)} here now`} tone="gold" />
        )}
      </Pills>
      {altar.is_main && (
        <Text style={type.caption}>
          Coven rituals are held here unless a ritual says otherwise. During a
          ritual, its steps decide who tends it.
        </Text>
      )}
      {mayDelete(altar) && (
        <View style={styles.actions}>
          <Button
            label="Archive"
            variant="text"
            onPress={() => void setArchived(altar, true)}
            disabled={busy}
          />
          <Button
            label="Delete"
            variant="text"
            onPress={() => void remove(altar)}
            disabled={busy}
          />
        </View>
      )}
    </Pressable>
  );

  return (
    <CovenScreen title="Altars" onRefresh={load}>
      <Text style={type.caption}>
        Each altar is a whole altar, like your own: the cabinet, candles that
        burn down, offerings, workings and all. Everyone here sees it as it
        changes, and those who tend it can change it together.
      </Text>
      {message && <Notice>{message}</Notice>}
      {!altars ? (
        <ActivityIndicator color={colors.gold} />
      ) : (
        <View style={styles.list}>
          {showing.filter((a) => !petitionOf(a)).map(card)}
        </View>
      )}
      {petitionAltars.length > 0 && (
        <Section label="Petition altars">
          <Text style={type.caption}>
            Each petition the circle holds has its own altar. Tend them from
            Petitions.
          </Text>
          <View style={styles.list}>{petitionAltars.map(card)}</View>
        </Section>
      )}

      {canStart &&
        (starting ? (
          <Card>
            <Field
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Healing altar for Sage"
              maxLength={80}
            />
            <Chips
              label="Who tends it"
              options={TEND_CHOICES}
              value={mode}
              onChange={setMode}
            />
            <Text style={type.caption}>
              You keep it: you can change who tends it, lock it, or archive it
              later. The coven’s head keeps every altar too.
            </Text>
            <Button
              label="Start the altar"
              onPress={() => void start()}
              disabled={busy}
            />
            <Button
              label="Not now"
              variant="text"
              onPress={() => setStarting(false)}
            />
          </Card>
        ) : (
          <Button
            label="Start an altar"
            variant="outline"
            onPress={() => setStarting(true)}
          />
        ))}
      {!coven.perms.startAltars && coven.perms.member && (
        <Text style={type.caption}>
          Your position doesn’t start altars here. The coven’s head decides who
          does.
        </Text>
      )}

      {cleared.length > 0 && (
        <Section label="Archived altars">
          {showCleared ? (
            cleared.map((altar) => (
              <Pressable
                key={altar.id}
                onPress={() => open(altar)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.altar,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={type.body}>{altar.name}</Text>
                <Text style={type.caption}>Kept whole. Its keepers can restore it.</Text>
                {mayDelete(altar) && (
                  <View style={styles.actions}>
                    <Button
                      label="Restore"
                      variant="text"
                      onPress={() => void setArchived(altar, false)}
                      disabled={busy}
                    />
                    <Button
                      label="Delete"
                      variant="text"
                      onPress={() => void remove(altar)}
                      disabled={busy}
                    />
                  </View>
                )}
              </Pressable>
            ))
          ) : (
            <Button
              label={`Show ${cleared.length} archived`}
              variant="text"
              onPress={() => setShowCleared(true)}
            />
          )}
        </Section>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  altar: {
    gap: 6,
    padding: 14,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  main: { borderColor: colors.gold },
  pressed: { opacity: 0.7 },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
});
