import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text } from "react-native";

import { Button } from "../../../../../../components/Button";
import {
  CovenScreen,
  covenHref,
} from "../../../../../../components/covens/CovenScreen";
import { CheckRow, Field, Notice } from "../../../../../../components/more/ui";
import * as api from "../../../../../../lib/covens/api";
import { createGroup, openDirect } from "../../../../../../lib/covens/chat";
import { useCoven } from "../../../../../../lib/covens/CovenContext";
import { errorMessage, type Member } from "../../../../../../lib/covens/model";
import { refreshUnread } from "../../../../../../lib/covens/unread";
import { colors, type } from "../../../../../../theme";

// A new conversation: choose one person for a one-to-one chat, or several
// for a small group (and give it a name).
export default function NewMessage() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const [people, setPeople] = useState<Member[] | null>(null);
  const [search, setSearch] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { loadNames } = coven;

  useEffect(() => {
    if (!covenId) return;
    api
      .fetchMembers(covenId)
      .then(async (list) => {
        await loadNames(list.map((m) => m.user_id));
        setPeople(list);
      })
      .catch((error) => setMessage(errorMessage(error)));
  }, [covenId, loadNames]);

  const blocked = useMemo(
    () => new Set(coven.me?.blocks ?? []),
    [coven.me?.blocks],
  );
  const shown = (people ?? [])
    .filter((m) => m.user_id !== coven.userId && !blocked.has(m.user_id))
    .filter(
      (m) =>
        !search.trim() ||
        coven
          .nameOf(m.user_id)
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .sort((a, b) =>
      coven.nameOf(a.user_id).localeCompare(coven.nameOf(b.user_id)),
    );

  const start = async () => {
    if (!covenId || !chosen.length) return;
    setBusy(true);
    setMessage(null);
    try {
      const conversation =
        chosen.length === 1
          ? await openDirect(covenId, chosen[0])
          : await createGroup(covenId, name, chosen);
      void refreshUnread();
      router.replace(covenHref(coven.slug, `chat/${conversation.id}`));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title="New message" need="standing" chat={false}>
      <Field
        label="To"
        value={search}
        onChangeText={setSearch}
        placeholder="Search the coven"
        autoCorrect={false}
      />
      {!people && <ActivityIndicator color={colors.gold} />}
      {shown.map((m) => (
        <CheckRow
          key={m.user_id}
          label={coven.nameOf(m.user_id)}
          value={chosen.includes(m.user_id)}
          onChange={(on) =>
            setChosen((list) =>
              on ? [...list, m.user_id] : list.filter((x) => x !== m.user_id),
            )
          }
        />
      ))}
      {people && !shown.length && (
        <Text style={type.caption}>No one else here yet.</Text>
      )}
      {chosen.length > 1 && (
        <Field
          label="Group name"
          value={name}
          onChangeText={setName}
          maxLength={80}
          placeholder="Moon planners"
        />
      )}
      {message && <Notice>{message}</Notice>}
      <Button
        label={
          busy
            ? "Opening…"
            : chosen.length === 0
              ? "Choose who to message"
              : chosen.length === 1
                ? `Message ${coven.nameOf(chosen[0])}`
                : `Start a group of ${chosen.length + 1}`
        }
        onPress={() => void start()}
        disabled={busy || !chosen.length}
      />
    </CovenScreen>
  );
}
