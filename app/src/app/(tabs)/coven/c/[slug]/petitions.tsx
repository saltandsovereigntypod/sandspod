import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import {
  Pill,
  Pills,
  Words,
  useReport,
} from "../../../../../components/covens/ui";
import {
  Card,
  Field,
  Notice,
  Section,
} from "../../../../../components/more/ui";
import * as api from "../../../../../lib/covens/api";
import { changeAltarOnce } from "../../../../../lib/covens/altarSync";
import { useCoven } from "../../../../../lib/covens/CovenContext";
import {
  CANDLE_COLORS,
  canTend,
  errorMessage,
  relativeTime,
  SWATCH,
  type Petition,
  type Tending,
} from "../../../../../lib/covens/model";
import {
  seedPetitionAltar,
  tendPetitionAltar,
} from "../../../../../lib/covens/petitionAltar";
import { colors, type } from "../../../../../theme";

// Petitions the circle holds. Asking gives the petition its own altar: a
// candle in its colour with the petition folded at its foot. Anyone in the
// coven can tend it once every twelve hours, which sets a small candle in
// their name on its altar and lights the petition's candle again. The person
// who asked (or a moderator) marks it answered or closes it, and its altar is
// cleared away with it.
export default function Petitions() {
  const coven = useCoven();
  const report = useReport(coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const { loadNames, petitionsVersion } = coven;
  const [petitions, setPetitions] = useState<Petition[] | null>(null);
  const [tendings, setTendings] = useState<Tending[]>([]);
  const [asking, setAsking] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState<string>("white");
  const [writing, setWriting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const canAct = coven.standing.ok;
  const myName = coven.me?.profile?.display_name || "A member";

  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const list = await api.fetchPetitions(covenId);
      const tended = await api
        .fetchTendings(list.map((p) => p.id))
        .catch(() => [] as Tending[]);
      setPetitions(list);
      setTendings(tended);
      void loadNames([
        ...list.map((p) => p.user_id),
        ...tended.map((t) => t.user_id),
      ]);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, loadNames]);

  useEffect(() => {
    void load();
  }, [load, petitionsVersion]);

  const openAltar = (p: Petition) =>
    p.altar_id && router.push(covenHref(coven.slug, `altars/${p.altar_id}`));

  // Changes to a petition's altar are a kindness, not the record: if one
  // can't be made (its altar was locked, say), the petition still stands.
  const onAltar = async (
    p: Petition,
    change: Parameters<typeof changeAltarOnce>[1],
  ) => {
    if (!p.altar_id) return "";
    try {
      await changeAltarOnce(p.altar_id, change);
      return "";
    } catch (error) {
      return ` Its altar couldn’t be changed: ${errorMessage(error)}`;
    }
  };

  const ask = async () => {
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      const made = await api.askPetition(covenId, title, body, color);
      const problem = await onAltar(
        made,
        seedPetitionAltar(made, new Date().toISOString()),
      );
      setAsking(false);
      setTitle("");
      setBody("");
      setMessage(
        `The circle is holding it. Its candle is lit on its own altar.${problem}`,
      );
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const tend = async (p: Petition) => {
    setBusy(true);
    setMessage(null);
    try {
      await api.tendPetition(p.id, writing === p.id ? note : "");
      const problem = await onAltar(
        p,
        tendPetitionAltar(p, myName, new Date().toISOString()),
      );
      setWriting(null);
      setNote("");
      setMessage(
        `You tended “${p.title}”. A candle burns in your name beside it.${problem}`,
      );
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const finish = (p: Petition, status: "answered" | "closed") => {
    const go = async () => {
      setBusy(true);
      setMessage(null);
      try {
        await api.closePetition(p.id, status, writing === p.id ? note : "");
        setWriting(null);
        setNote("");
        setMessage(
          status === "answered"
            ? "Marked answered. Blessed be."
            : "Closed. Its altar is cleared away.",
        );
        await load();
      } catch (error) {
        setMessage(errorMessage(error));
      }
      setBusy(false);
    };
    Alert.alert(
      status === "answered" ? "Mark it answered?" : "Close this petition?",
      `The circle stops tending “${p.title}”, and its altar is cleared away. It stays among the past petitions.`,
      [
        { text: "Not yet", style: "cancel" },
        {
          text: status === "answered" ? "It was answered" : "Close it",
          onPress: () => void go(),
        },
      ],
    );
  };

  const open = (petitions ?? []).filter((p) => p.status === "open");
  const past = (petitions ?? [])
    .filter((p) => p.status !== "open")
    .slice(0, 30);

  const card = (p: Petition) => {
    const mine = p.user_id === coven.userId;
    const mayFinish = mine || coven.perms.moderate || coven.perms.site;
    const its = tendings.filter((t) => t.petition_id === p.id);
    const people = new Set(its.map((t) => t.user_id)).size;
    const words = its.filter((t) => t.note).slice(0, 3);
    const tendable = canAct && canTend(p, tendings, coven.userId);
    return (
      <Card key={p.id}>
        <View style={styles.head}>
          <View
            style={[
              styles.dot,
              { backgroundColor: SWATCH[p.color] ?? SWATCH.white },
            ]}
          />
          <Text style={[type.cardTitle, styles.flex]}>{p.title}</Text>
        </View>
        <Text style={type.caption}>
          {mine ? "You asked" : `${coven.nameOf(p.user_id)} asked`}{" "}
          {relativeTime(p.created_at)}
          {its.length
            ? ` · tended ${its.length} ${its.length === 1 ? "time" : "times"} by ${people} ${people === 1 ? "person" : "people"}`
            : " · not tended yet"}
          {p.status === "open" && p.last_tended_at
            ? ` · last ${relativeTime(p.last_tended_at)}`
            : ""}
        </Text>
        <Words text={p.body} />
        {p.status !== "open" && (
          <Pills>
            <Pill
              label={p.status === "answered" ? "Answered" : "Closed"}
              tone={p.status === "answered" ? "gold" : undefined}
            />
          </Pills>
        )}
        {!!p.outcome_note && <Text style={type.body}>“{p.outcome_note}”</Text>}
        {words.map((t) => (
          <Text key={t.id} style={type.caption}>
            {t.user_id === coven.userId ? "You" : coven.nameOf(t.user_id)}: “
            {t.note}”
          </Text>
        ))}
        <View style={styles.row}>
          {!!p.altar_id && (
            <Button
              label={p.status === "open" ? "Open its altar" : "See its altar"}
              variant="outline"
              onPress={() => openAltar(p)}
            />
          )}
          {p.status === "open" && canAct && (
            <Button
              label={busy ? "Tending…" : tendable ? "Tend it" : "Tended today"}
              onPress={() => void tend(p)}
              disabled={busy || !tendable}
            />
          )}
        </View>
        {p.status === "open" &&
          canAct &&
          (tendable || mayFinish) &&
          (writing === p.id ? (
            <Field
              label={
                tendable
                  ? "A word as you tend it (optional)"
                  : "A word to go with it (optional)"
              }
              value={note}
              onChangeText={setNote}
              maxLength={280}
              autoFocus
            />
          ) : (
            <Button
              label="Add a word"
              variant="text"
              onPress={() => {
                setWriting(p.id);
                setNote("");
              }}
            />
          ))}
        {p.status === "open" && mayFinish && canAct && (
          <View style={styles.row}>
            <Button
              label="It was answered"
              variant="text"
              onPress={() => finish(p, "answered")}
              disabled={busy}
            />
            <Button
              label="Close it"
              variant="text"
              onPress={() => finish(p, "closed")}
              disabled={busy}
            />
          </View>
        )}
        {!mine && (
          <Button
            label="Report"
            variant="text"
            onPress={() =>
              report.open({
                target_type: "petition",
                target_id: p.id,
                coven_id: p.coven_id,
                target_user_id: p.user_id,
                label: "this petition",
              })
            }
          />
        )}
      </Card>
    );
  };

  return (
    <CovenScreen title="Petitions" need="standing" onRefresh={load}>
      <Text style={type.body}>
        Ask the circle to hold something for you. Your petition gets its own
        altar, with a candle in the colour you choose. When someone tends it, a
        candle is lit in their name beside yours.
      </Text>
      {canAct && !asking && (
        <Button label="Ask the circle" onPress={() => setAsking(true)} />
      )}
      {asking && (
        <Card>
          <Field
            label="What should the circle hold?"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
            placeholder="Healing for my sister"
          />
          <Field
            label="More, if you’d like to share it (optional)"
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={2000}
          />
          <Text style={type.caption}>{`Candle colour: ${color}`}</Text>
          <View
            style={styles.swatches}
            accessibilityRole="radiogroup"
            accessibilityLabel="Candle colour"
          >
            {CANDLE_COLORS.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="radio"
                accessibilityLabel={c}
                accessibilityState={{ checked: color === c }}
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: SWATCH[c] },
                  color === c && styles.swatchOn,
                ]}
              />
            ))}
          </View>
          <View style={styles.row}>
            <Button
              label={busy ? "Asking…" : "Ask"}
              disabled={busy || !title.trim()}
              onPress={() => void ask()}
            />
            <Button
              label="Cancel"
              variant="text"
              onPress={() => setAsking(false)}
            />
          </View>
        </Card>
      )}
      {message && <Notice>{message}</Notice>}
      {!petitions && (
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      )}
      {petitions && (
        <Section label="Held now">
          {open.length ? (
            open.map(card)
          ) : (
            <Text style={type.caption}>
              The circle isn’t holding any petitions right now.
            </Text>
          )}
        </Section>
      )}
      {past.length > 0 && (
        <Section label="Answered and closed">
          {showPast ? (
            past.map(card)
          ) : (
            <Button
              label={`Show ${past.length} past ${past.length === 1 ? "petition" : "petitions"}`}
              variant="text"
              onPress={() => setShowPast(true)}
            />
          )}
        </Section>
      )}
      {report.sheet}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchOn: { borderColor: colors.gold },
});
