/*
 * Gathering notifications on the website, level with the app: who hears on
 * their phone when a rite or meeting goes on a coven's calendar, moves, or
 * comes off it (app/src/lib/covens/notices.ts, through js/core/covens.js).
 *
 *   CovenNotices.rulesPanel(holder, state)   the coven's rules by kind of
 *     gathering (the app's manage/notices.tsx), for those with 'notices'
 *   CovenNotices.whoCard(holder, options)    "Who hears about it" in the
 *     planner (the app's components/covens/NoticeWho.tsx)
 *   CovenNotices.sendPanel(holder, state, ritual)  "Send a notification" on a
 *     scheduled gathering's page (the app's components/covens/SendNotice.tsx)
 *
 * Saved through covens/coven-data.js (noticeRules, setNoticeRule,
 * previewNotice, sendNotice) into the same tables and plan shape as the app.
 */
(function (global) {
  "use strict";

  const D = global.CovenData;
  const UI = global.CovenUI;
  const L = global.CovenLogic;
  const { esc } = UI;

  const core = () => global.SaltCore?.covens || {};
  const N = () => core().notices;
  const P = () => core().picker;
  const B = () => core().builder;
  const T = () => core().templates;

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const nameOf = (state) => (id) => UI.nameOf(state.context, id);
  const BASE = ["rite", "meeting"];
  const labelOptions = (state) => N().noticeLabelOptions(T()?.RITUAL_TEMPLATES || [], state.rituals || []);

  async function people(state) {
    const members = (await D.members(state.coven.id).catch(() => [])).filter((m) => m.status === "active");
    await UI.loadNames(state.context, members.map((m) => m.user_id));
    return members.map((m) => ({ id: m.user_id, name: UI.nameOf(state.context, m.user_id) }));
  }

  // --- the coven's rules -------------------------------------------------------

  async function rulesPanel(holder, state) {
    if (!holder || !N() || !P() || !global.CovenPicker) return;
    const canChoose = Boolean(state.perms.notices || state.perms.site);
    holder.innerHTML = `<p class="sp-caption">Loading…</p>`;
    const [list, saved] = await Promise.all([people(state), D.noticeRules(state.coven.id)]);
    let rules = saved;
    let adding = [];
    const labels = labelOptions(state);
    const words = { ranks: state.ranks, nameOf: nameOf(state) };
    const entries = N().noticeEntries(P().whoEntries(state.ranks, list), { parts: true });
    const suggestions = [...P().whoSuggestions(entries, 3), "parts", "none"];

    const scopes = () => {
      const kept = rules.map((r) => r.scope).filter((s) => !BASE.includes(s));
      return [...BASE, ...kept, ...adding.filter((s) => !kept.includes(s) && !BASE.includes(s))];
    };
    const save = async (el, scope, who) => {
      const ok = await UI.busy(el, holder.querySelector("[data-status]"), () => D.setNoticeRule(state.coven.id, scope, who).then(() => true), { done: "Saved." });
      if (!ok) return;
      rules = await D.noticeRules(state.coven.id);
      if (!who.length) adding = adding.filter((s) => s !== scope);
      draw();
    };

    function draw() {
      const all = scopes();
      holder.innerHTML = `<p class="sp-caption">When a rite or a meeting goes on the coven’s calendar, moves, or comes off it, those it’s for get a note on their phone. Choose who hears for each kind of gathering. A meeting kept to some only ever reaches them, and everyone can turn these off for themselves under Reminders.</p>
        ${all.map((scope, i) => `<div class="sp-card"><p class="sp-label">${esc(N().scopeLabel(scope, labels))}</p><div data-rule="${i}"></div></div>`).join("")}
        ${canChoose ? `<div class="sp-card"><p class="sp-label">Add a rule for an occasion</p><div data-rule-add></div>
            <div class="sp-field"><label for="gn-name">Or the occasion’s name, as you write it in the planner</label><input id="gn-name" maxlength="60" placeholder="Deipnon" data-rule-name /></div>
            <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-rule-name-add>Add</button></div></div>` : `<p class="sp-notice">Those the coven’s head allows choose who hears about its gatherings.</p>`}
        <p class="sp-caption">A gathering’s own choice, in its planner, comes first; then the closest rule: its occasion’s name, its occasion, its kind of meeting, then rites or meetings.</p>
        ${statusLine()}`;
      all.forEach((scope, i) => {
        const slot = holder.querySelector(`[data-rule="${i}"]`);
        const who = rules.find((r) => r.scope === scope)?.who || [];
        const label = N().scopeLabel(scope, labels);
        if (!canChoose) {
          slot.innerHTML = `<p>${esc(who.length ? cap(who.map((k) => N().noticeKeyLabel(k, words)).join(", ")) : "Everyone it is for.")}</p>`;
          return;
        }
        global.CovenPicker.create(slot, {
          id: `gn-rule-${i}`,
          label: `Who hears about ${scope.startsWith("name:") ? label : label.charAt(0).toLowerCase() + label.slice(1)}`,
          placeholder: "The whole coven, Elders, everyone with a part…",
          empty: BASE.includes(scope) ? "Everyone it is for." : "No one chosen yet: the broader rules apply.",
          chips: () => who.map((k) => ({ key: k, label: cap(N().noticeKeyLabel(k, words)) })),
          search: (q, picked) => P().searchEntries(entries, q, { limit: 8, picked, suggestions }),
          onAdd: (entry) => save(slot, scope, N().addNoticeKey(who, entry.key)),
          onRemove: (key) => save(slot, scope, who.filter((k) => k !== key))
        });
      });
      if (!canChoose) return;
      const choices = N().ruleChoices({ occasions: L.OCCASIONS, names: labels.names, series: labels.series, taken: all });
      const pickEntries = choices.map((c) => ({ key: c.scope, label: c.label, detail: c.detail, keywords: [c.scope.replace(/^\w+:/, "")] }));
      global.CovenPicker.create(holder.querySelector("[data-rule-add]"), {
        id: "gn-rule-add",
        label: "An occasion, or a kind of meeting",
        placeholder: "Full moon, Samhain, Officials’ meeting…",
        chips: () => [],
        search: (q, picked) => P().searchEntries(pickEntries, q, { limit: 8, picked, suggestions: pickEntries.slice(0, 5).map((e) => e.key) }),
        onAdd: (entry) => {
          adding = [...adding, entry.key];
          setTimeout(draw);
        },
        onRemove: () => {}
      });
      holder.querySelector("[data-rule-name-add]").addEventListener("click", () => {
        const scope = N().cleanScope(`name:${holder.querySelector("[data-rule-name]").value}`);
        if (!scope) return UI.setStatus(holder.querySelector("[data-status]"), "Give it a name to look for, such as Deipnon or Samhain.", true);
        adding = [...adding, scope];
        draw();
      });
    }
    draw();
  }

  // --- one gathering, in the planner -----------------------------------------------

  /**
   * options: { state, plan, kind, occasion, occasionName, audience, rules,
   * people, onChange(notify | null) }. The plan is read afresh from
   * options.getPlan() so the card follows the planner's changes.
   */
  function whoCard(holder, options) {
    if (!holder || !N()) return;
    const { state } = options;
    const plan = options.getPlan();
    const words = { ranks: state.ranks, nameOf: nameOf(state), roles: plan.roles };
    const labels = labelOptions(state);
    const line = N().noticeLine({ kind: options.kind, occasion: options.occasion, occasion_name: options.occasionName, plan, audience: options.audience }, options.rules || [], words, labels);
    const canChoose = Boolean(state.perms.notices || state.perms.site);
    holder.innerHTML = `<div class="sp-card"><p class="sp-label">Who hears about it</p>
      <p data-notice-line>${esc(line)}</p>
      <p class="sp-caption">A note on their phone when it goes on the coven’s calendar, if its date or time changes, and if it comes off. Drafts never ring.${options.kind === "meeting" && options.audience?.length ? " Only those the meeting is for ever hear about it." : ""}</p>
      ${canChoose ? `<div data-notice-picker></div>${plan.notify?.length ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-notice-clear>Follow the coven’s rules instead</button></div>` : ""}` : `<p class="sp-caption">Those the coven’s head allows choose who hears.</p>`}</div>`;
    if (!canChoose || !global.CovenPicker || !P()) return;
    const entries = N().noticeEntries([...B().roleEntries(plan.roles), ...P().whoEntries(state.ranks, options.people || [])], { parts: plan.roles.length > 0 });
    const suggest = [...plan.roles.map((r) => `role:${r.id}`).slice(0, 2), ...P().whoSuggestions(entries, 3), "parts", "none"].filter((k) => entries.some((e) => e.key === k));
    const change = (next) => {
      options.onChange(next && next.length ? next : null);
      whoCard(holder, options);
    };
    global.CovenPicker.create(holder.querySelector("[data-notice-picker]"), {
      id: "notice-who",
      label: "For this one",
      placeholder: "The whole coven, Elders, the Chair, no one…",
      empty: "As the coven’s rules say.",
      chips: () => (options.getPlan().notify || []).map((k) => ({ key: k, label: cap(N().noticeKeyLabel(k, words)) })),
      search: (q, picked) => P().searchEntries(entries, q, { limit: 8, picked, suggestions: suggest }),
      onAdd: (entry) => setTimeout(() => change(N().addNoticeKey(options.getPlan().notify || [], entry.key))),
      onRemove: (key) => setTimeout(() => change((options.getPlan().notify || []).filter((k) => k !== key)))
    });
    holder.querySelector("[data-notice-clear]")?.addEventListener("click", () => change(null));
  }

  // --- sending one by hand ---------------------------------------------------------

  function sendPanel(holder, state, ritual) {
    if (!holder || !N()) return;
    if (!N().maySendNotice(ritual, state.perms, state.context.user?.id || null)) {
      holder.innerHTML = "";
      return;
    }
    const kind = ritual.kind === "meeting" ? "meeting" : "rite";
    const plan = B().cleanPlan(ritual.plan, kind);
    const words = { ranks: state.ranks, nameOf: nameOf(state), roles: plan.roles };
    let who = [];
    let changing = false;
    let preview = null;
    let entries = null;
    let message = "";

    const refresh = async () => {
      preview = await D.previewNotice(ritual.id, who).catch(() => null);
      if (!preview) message = "Notifications by hand aren’t ready for this coven yet.";
      draw();
    };
    function draw() {
      const wait = preview ? N().waitLine(preview.next_at) : null;
      holder.innerHTML = `<section class="sp-card"><h2>Send a notification</h2>
        ${preview ? `<p>${esc(N().reachLine(preview.recipients))}</p><p class="sp-caption">${preview.announced ? "It goes as a reminder of when it is." : "It goes as the note that it’s on the coven’s calendar, so later changes to it are sent too."}</p>` : message ? "" : `<p class="sp-caption">Counting who it goes to…</p>`}
        ${changing ? `<div data-send-who></div>` : `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-send-change>Choose who, this once</button></div>`}
        <div class="sp-field"><label for="send-note">A note of your own (optional, up to ${N().NOTE_MAX} characters)</label><input id="send-note" maxlength="${N().NOTE_MAX}" placeholder="Bring a candle and something for the shared meal." data-send-note /></div>
        ${wait ? `<p class="sp-notice">${esc(wait)}</p>` : ""}
        <div class="sp-actions"><button class="button button--primary" type="button" data-send ${!preview || wait || !preview.recipients ? "disabled" : ""}>${esc(N().sendLabel(preview))}</button></div>
        <p class="cv-status" role="status" aria-live="polite" data-status>${esc(message)}</p></section>`;
      holder.querySelector("[data-send-change]")?.addEventListener("click", async () => {
        changing = true;
        if (!entries) {
          const list = await people(state);
          entries = N().noticeEntries([...B().roleEntries(plan.roles), ...P().whoEntries(state.ranks, list)], { parts: plan.roles.length > 0 }).filter((e) => e.key !== "none");
        }
        draw();
      });
      const slot = holder.querySelector("[data-send-who]");
      if (slot && entries && global.CovenPicker) {
        global.CovenPicker.create(slot, {
          id: "send-who",
          label: "Who it goes to, this once",
          placeholder: "The whole coven, Elders, the Chair…",
          empty: "As usual for this gathering.",
          chips: () => who.map((k) => ({ key: k, label: cap(N().noticeKeyLabel(k, words)) })),
          search: (q, picked) => P().searchEntries(entries, q, { limit: 8, picked, suggestions: P().whoSuggestions(entries, 4) }),
          onAdd: (entry) => {
            who = N().addNoticeKey(who, entry.key);
            setTimeout(refresh);
          },
          onRemove: (key) => {
            who = who.filter((k) => k !== key);
            setTimeout(refresh);
          }
        });
      }
      holder.querySelector("[data-send]")?.addEventListener("click", async (event) => {
        const button = event.currentTarget;
        button.disabled = true;
        UI.setStatus(holder.querySelector("[data-status]"), "Sending…");
        const result = await D.sendNotice(ritual.id, holder.querySelector("[data-send-note]").value.trim(), changing ? who : null);
        message = N().sentLine(result, preview?.next_at);
        if (result && !result.error) {
          who = [];
          changing = false;
        }
        await refresh();
      });
    }
    draw();
    refresh();
  }

  global.CovenNotices = { rulesPanel, whoCard, sendPanel };
})(window);
